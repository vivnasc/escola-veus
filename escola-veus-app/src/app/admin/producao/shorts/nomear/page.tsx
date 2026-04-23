"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";
import funilSeed from "@/data/funil-prompts.seed.json";

type Prompt = { id: string; category: string; mood: string[]; prompt: string };
type Audio = { name: string; url: string };

const EPISODES = [
  { key: "trailer", slug: "nomear-trailer-00", label: "Trailer" },
  { key: "ep01", slug: "nomear-ep01", label: "ep01 — A culpa" },
  { key: "ep02", slug: "nomear-ep02", label: "ep02 — O extracto" },
  { key: "ep03", slug: "nomear-ep03", label: "ep03 — A vergonha" },
  { key: "ep04", slug: "nomear-ep04", label: "ep04 — O desconto" },
  { key: "ep05", slug: "nomear-ep05", label: "ep05 — Matemática" },
  { key: "ep06", slug: "nomear-ep06", label: "ep06 — A fome" },
  { key: "ep07", slug: "nomear-ep07", label: "ep07 — O sim" },
  { key: "ep08", slug: "nomear-ep08", label: "ep08 — O silêncio" },
  { key: "ep09", slug: "nomear-ep09", label: "ep09 — As frases" },
  { key: "ep10", slug: "nomear-ep10", label: "ep10 — A liberdade" },
] as const;

function titleToSlug(title: string): string {
  return (title || "audio")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function findScript(id: string): { titulo: string } | null {
  for (const preset of NOMEAR_PRESETS) {
    const hit = preset.scripts.find((s) => s.id === id);
    if (hit) return hit;
  }
  return null;
}

function fmtTime(sec: number): string {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = (s % 60).toFixed(1);
  return `${m}:${r.padStart(4, "0")}`;
}

export default function NomearShortsPage() {
  const [epKey, setEpKey] = useState<(typeof EPISODES)[number]["key"]>("trailer");
  const ep = EPISODES.find((e) => e.key === epKey)!;

  const [allAudios, setAllAudios] = useState<Audio[]>([]);
  const [allClips, setAllClips] = useState<Audio[]>([]);
  const [loading, setLoading] = useState(true);

  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(30);
  // Modo default: "crop-video" (recorta do video final renderizado do ep).
  // Legacy: "clips" (escolher clips manualmente) e "image" (imagem estatica)
  // disponiveis em modo avancado para casos onde ainda nao ha video final.
  const [mode, setMode] = useState<"crop-video" | "clips" | "image">("crop-video");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedClipUrls, setSelectedClipUrls] = useState<string[]>([]);
  const [imagePromptId, setImagePromptId] = useState("");
  const [overlayText, setOverlayText] = useState("");
  const [includeBranding, setIncludeBranding] = useState(true);
  // Video final do ep (procurado em youtube/funil-videos/). Timeline do cropper
  // usa isto em vez do audio raw — assim o user ve o video real com legendas.
  const [epFinalVideoUrl, setEpFinalVideoUrl] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    videoUrl: string;
    audioUrl: string;
    imageUrl?: string;
    durationSec: number;
    mode?: string;
    clipCount?: number;
  } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  const [allFinalVideos, setAllFinalVideos] = useState<Audio[]>([]);

  // Load audio + clips + final videos list on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/biblioteca/list?folder=youtube&limit=500").then((r) =>
        r.json(),
      ),
      fetch("/api/admin/biblioteca/list?folder=youtube/clips&limit=1000").then(
        (r) => r.json(),
      ),
      fetch(
        "/api/admin/biblioteca/list?folder=youtube/funil-videos&limit=500",
      ).then((r) => r.json()),
    ])
      .then(([audiosD, clipsD, videosD]) => {
        setAllAudios(
          (Array.isArray(audiosD.files) ? audiosD.files : []).filter(
            (f: Audio) => f.name.endsWith(".mp3"),
          ),
        );
        setAllClips(
          (Array.isArray(clipsD.files) ? clipsD.files : []).filter(
            (f: Audio) => f.name.endsWith(".mp4"),
          ),
        );
        setAllFinalVideos(
          (Array.isArray(videosD.files) ? videosD.files : []).filter(
            (f: Audio) => f.name.endsWith(".mp4"),
          ),
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // Video final renderizado do ep actual (procura por slug OU epKey prefix)
  useEffect(() => {
    const script = findScript(ep.slug);
    const slug = script ? titleToSlug(script.titulo) : "";
    const match = allFinalVideos
      .filter(
        (v) =>
          (slug && v.name.startsWith(`${slug}-`)) ||
          v.name.startsWith(`${epKey}-`),
      )
      .sort((a, b) => b.name.localeCompare(a.name))[0];
    setEpFinalVideoUrl(match?.url ?? null);
  }, [allFinalVideos, ep.slug, epKey]);

  // Find audio for current episode
  const epAudio = useMemo(() => {
    const script = findScript(ep.slug);
    if (!script) return null;
    const slug = titleToSlug(script.titulo);
    const matches = allAudios.filter(
      (a) => a.name.startsWith(`${slug}-`) || a.name === `${slug}.mp3`,
    );
    return matches.sort((a, b) => b.name.localeCompare(a.name))[0] ?? null;
  }, [allAudios, ep.slug]);

  // Image prompts for current episode (ordered)
  const epPrompts = useMemo(() => {
    const prefix = `nomear-${epKey}-`;
    return (funilSeed.prompts as Prompt[])
      .filter((p) => p.id.startsWith(prefix))
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [epKey]);

  // Clips Runway do episódio (ordenados por nome para sequencia natural)
  const epClips = useMemo(() => {
    const prefix = epKey === "trailer" ? "nomear-trailer-" : `nomear-${epKey}-`;
    return allClips
      .filter((c) => c.name.startsWith(prefix))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allClips, epKey]);

  // Auto-pick first prompt + reset clips on episode change
  useEffect(() => {
    if (epPrompts.length > 0 && (!imagePromptId || !epPrompts.some((p) => p.id === imagePromptId))) {
      setImagePromptId(epPrompts[0].id);
    }
    setSelectedClipUrls([]);
    setResult(null);
    setErr(null);
  }, [epKey, epPrompts, imagePromptId]);

  const snippetDur = endSec - startSec;
  const snippetValid = snippetDur > 0 && snippetDur <= 60;

  const setStartFromPlayer = useCallback(() => {
    const t = audioRef.current?.currentTime ?? 0;
    setStartSec(Math.max(0, +t.toFixed(1)));
  }, []);

  const setEndFromPlayer = useCallback(() => {
    const t = audioRef.current?.currentTime ?? 0;
    setEndSec(Math.max(0, +t.toFixed(1)));
  }, []);

  const seekToStart = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = startSec;
      audioRef.current.play().catch(() => {});
    }
  }, [startSec]);

  const generate = async () => {
    setGenerating(true);
    setErr(null);
    setResult(null);
    try {
      // Modo "crop-video" (default): recorta do MP4 final do ep.
      // Endpoint distinto porque o fluxo é muito mais simples (só ffmpeg trim+crop).
      if (mode === "crop-video") {
        const r = await fetch("/api/admin/shorts/crop-funil-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            epKey,
            startSec,
            endSec,
            videoUrl: epFinalVideoUrl || undefined,
          }),
        });
        const d = await r.json();
        if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
        setResult({
          videoUrl: d.videoUrl,
          audioUrl: "",
          durationSec: d.durationSec,
          mode: "crop-video",
        });
        return;
      }

      const r = await fetch("/api/admin/shorts/short-from-nomear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          epKey,
          startSec,
          endSec,
          ...(mode === "clips"
            ? { clipUrls: selectedClipUrls }
            : { imagePromptId }),
          overlayText: overlayText.trim() || undefined,
          includeBranding,
        }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setResult(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-escola-creme">
            Shorts Nomear · Extrair do episódio
          </h2>
          <p className="mt-1 text-sm text-escola-creme-50">
            Corta 1 frase impactante do áudio Nomear + 1 imagem MJ do episódio →
            MP4 9:16 pronto para TikTok/Reels/YouTube Shorts.
          </p>
        </div>
        <Link
          href="/admin/producao/shorts"
          className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme-50 hover:text-escola-creme"
        >
          ← Shorts (manual)
        </Link>
      </div>

      {/* ── 1. Escolher episódio ──────────────────────────────────── */}
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <h3 className="mb-2 text-sm text-escola-creme">1. Episódio</h3>
        <div className="flex flex-wrap gap-2">
          {EPISODES.map((e) => (
            <button
              key={e.key}
              onClick={() => setEpKey(e.key)}
              className={`rounded border px-2.5 py-1 text-xs transition-colors ${
                epKey === e.key
                  ? "border-escola-dourado bg-escola-dourado/10 text-escola-dourado"
                  : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── 2. Áudio + escolher snippet ───────────────────────────── */}
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <h3 className="mb-2 text-sm text-escola-creme">2. Snippet (até 60s)</h3>
        {loading ? (
          <p className="text-xs text-escola-creme-50">A carregar áudios...</p>
        ) : !epAudio ? (
          <p className="text-xs text-escola-terracota">
            Sem áudio Nomear para este episódio. Gera em /admin/producao/audios primeiro.
          </p>
        ) : (
          <>
            <audio
              ref={audioRef}
              src={epAudio.url}
              controls
              className="mb-3 w-full"
              preload="auto"
            />

            {/* Range selector visual — arrasta pegas para escolher região */}
            <AudioRegionSelector
              audioRef={audioRef}
              startSec={startSec}
              endSec={endSec}
              onStartChange={setStartSec}
              onEndChange={setEndSec}
              maxDur={60}
            />

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
                  Início ({fmtTime(startSec)})
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={startSec}
                    onChange={(e) => setStartSec(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
                  />
                  <button
                    onClick={setStartFromPlayer}
                    className="rounded border border-escola-dourado bg-escola-dourado/10 px-2 py-1.5 text-escola-dourado hover:bg-escola-dourado/20"
                    title="Usa o tempo actual do leitor"
                  >
                    📍
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
                  Fim ({fmtTime(endSec)})
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={endSec}
                    onChange={(e) => setEndSec(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
                  />
                  <button
                    onClick={setEndFromPlayer}
                    className="rounded border border-escola-dourado bg-escola-dourado/10 px-2 py-1.5 text-escola-dourado hover:bg-escola-dourado/20"
                    title="Usa o tempo actual do leitor"
                  >
                    📍
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className={snippetValid ? "text-escola-dourado" : "text-escola-terracota"}>
                Duração snippet: <b>{snippetDur.toFixed(1)}s</b>
                {!snippetValid && " — ajusta para 0-60s"}
              </span>
              <button
                onClick={seekToStart}
                className="rounded border border-escola-border px-2 py-1 text-escola-creme-50 hover:text-escola-creme"
              >
                ▶ Pré-ouvir início
              </button>
            </div>
            <p className="mt-2 text-[10px] text-escola-creme-50">
              💡 Arrasta as pegas 🟡 na timeline acima para escolher a região.
              Ou usa 📍 para capturar do leitor.
            </p>
          </>
        )}
      </section>

      {/* ── Modo crop-video: nada mais a escolher, salta para Gerar ── */}
      {mode === "crop-video" ? (
        <section className="mb-4 rounded-xl border border-escola-dourado/40 bg-escola-dourado/5 p-4 text-xs">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-escola-dourado">
              ✨ Recortando do vídeo final — legendas, áudio, imagens já
              sincronizados.
            </span>
            <button
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
            >
              {showAdvanced ? "ocultar" : "modo avançado"}
            </button>
          </div>
          {!epFinalVideoUrl && (
            <p className="text-escola-terracota">
              ⚠ Sem vídeo final renderizado para {epKey}. Monta o vídeo primeiro
              em <code>/admin/producao/funil/montar</code>, ou muda para modo
              avançado (clips / imagem).
            </p>
          )}
          {epFinalVideoUrl && (
            <p className="text-escola-creme-50">
              Total com intro+outro brand: <b className="text-escola-creme">{(snippetDur + 10).toFixed(1)}s</b>
              {" "}(sem brand: {snippetDur.toFixed(1)}s). Máx 60s.
            </p>
          )}
          {showAdvanced && (
            <div className="mt-3 flex gap-1 border-t border-escola-dourado/20 pt-3">
              <button
                onClick={() => setMode("clips")}
                className="rounded border border-escola-border px-2 py-1 text-escola-creme-50 hover:text-escola-creme"
              >
                🎬 escolher clips manualmente
              </button>
              <button
                onClick={() => setMode("image")}
                className="rounded border border-escola-border px-2 py-1 text-escola-creme-50 hover:text-escola-creme"
              >
                🖼 usar imagem estática
              </button>
            </div>
          )}
        </section>
      ) : (
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm text-escola-creme">3. Fundo do vídeo</h3>
          <div className="flex gap-1 text-xs">
            <button
              onClick={() => setMode("crop-video")}
              className="rounded border border-escola-dourado bg-escola-dourado/10 px-2 py-1 text-escola-dourado"
            >
              ← voltar ao modo simples
            </button>
            <button
              onClick={() => setMode("clips")}
              className={`rounded border px-2 py-1 ${
                mode === "clips"
                  ? "border-escola-dourado bg-escola-dourado/10 text-escola-dourado"
                  : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              🎬 Clips Runway (animados)
            </button>
            <button
              onClick={() => setMode("image")}
              className={`rounded border px-2 py-1 ${
                mode === "image"
                  ? "border-escola-dourado bg-escola-dourado/10 text-escola-dourado"
                  : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              🖼 Imagem estática
            </button>
          </div>
        </div>

        {mode === "clips" ? (
          epClips.length === 0 ? (
            <p className="text-xs text-escola-terracota">
              Sem clips Runway gerados para este episódio. Vai a{" "}
              <code>/admin/producao/funil/gerar</code> e gera os clips primeiro.
            </p>
          ) : (
            <>
              <p className="mb-2 text-xs text-escola-creme-50">
                Escolhe <b>2-4 clips</b> na ordem em que apareçam no short. 3
                clips × ~10s = 30s ideal. Os clips horizontais são cropados ao
                centro para 9:16.
              </p>
              <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {epClips.map((c) => {
                  const selected = selectedClipUrls.includes(c.url);
                  const order = selectedClipUrls.indexOf(c.url) + 1;
                  return (
                    <button
                      key={c.url}
                      onClick={() => {
                        setSelectedClipUrls((prev) =>
                          prev.includes(c.url)
                            ? prev.filter((u) => u !== c.url)
                            : [...prev, c.url],
                        );
                      }}
                      className={`relative aspect-video overflow-hidden rounded border ${
                        selected
                          ? "border-escola-dourado ring-2 ring-escola-dourado"
                          : "border-escola-border hover:border-escola-dourado/40"
                      }`}
                      title={c.name}
                    >
                      <video
                        src={c.url}
                        className="h-full w-full object-cover"
                        muted
                        preload="metadata"
                      />
                      {selected && (
                        <span className="absolute left-1 top-1 rounded bg-escola-dourado px-1.5 text-[10px] font-bold text-escola-bg">
                          {order}
                        </span>
                      )}
                      <span className="absolute inset-x-0 bottom-0 truncate bg-black/70 px-1 text-[9px] text-white">
                        {c.name
                          .replace(`nomear-${epKey}-`, "")
                          .replace(/-h-\d+\.mp4$/, "")}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span
                  className={
                    selectedClipUrls.length >= 1 && selectedClipUrls.length <= 4
                      ? "text-escola-dourado"
                      : "text-escola-terracota"
                  }
                >
                  {selectedClipUrls.length} seleccionado
                  {selectedClipUrls.length === 1 ? "" : "s"}
                  {selectedClipUrls.length === 0 && " — escolhe pelo menos 1"}
                  {selectedClipUrls.length > 4 && " — máximo 4"}
                </span>
                {selectedClipUrls.length > 0 && (
                  <button
                    onClick={() => setSelectedClipUrls([])}
                    className="text-escola-creme-50 hover:text-escola-creme"
                  >
                    limpar
                  </button>
                )}
              </div>
            </>
          )
        ) : epPrompts.length === 0 ? (
          <p className="text-xs text-escola-terracota">
            Sem prompts registados para este episódio.
          </p>
        ) : (
          <>
            <select
              value={imagePromptId}
              onChange={(e) => setImagePromptId(e.target.value)}
              className="mb-2 w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-xs text-escola-creme"
            >
              {epPrompts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id.replace(`nomear-${epKey}-`, "")} · {p.mood.join(", ")}
                </option>
              ))}
            </select>
            {imagePromptId && <ImagePreview promptId={imagePromptId} />}
          </>
        )}
      </section>
      )}

      {/* ── 4. Texto overlay (so relevante para modos clips/image) ── */}
      {mode !== "crop-video" && (
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <h3 className="mb-2 text-sm text-escola-creme">4. Texto em destaque (opcional)</h3>
        <textarea
          value={overlayText}
          onChange={(e) => setOverlayText(e.target.value)}
          rows={3}
          placeholder="Uma frase curta que apareça gravada no vídeo (ex: 'Há uma culpa que não é culpa')"
          className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-xs text-escola-creme"
        />
        <label className="mt-2 flex items-center gap-2 text-xs text-escola-creme-50">
          <input
            type="checkbox"
            checked={includeBranding}
            onChange={(e) => setIncludeBranding(e.target.checked)}
          />
          Mostrar &quot;A ESCOLA DOS VÉUS&quot; no topo (cream dourado)
        </label>
      </section>
      )}

      {/* Toggle brand intro/outro (apenas no modo crop-video) */}
      {mode === "crop-video" && epFinalVideoUrl && (
        <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-escola-creme">
            <input
              type="checkbox"
              checked={includeBranding}
              onChange={(e) => setIncludeBranding(e.target.checked)}
            />
            Incluir mandala brand intro (5s) + outro (5s) — total{" "}
            <b className="text-escola-dourado">
              {(snippetDur + (includeBranding ? 10 : 0)).toFixed(1)}s
            </b>
          </label>
        </section>
      )}

      {/* ── 5. Gerar ──────────────────────────────────────────────── */}
      <section className="mb-4 rounded-xl border border-escola-dourado/40 bg-escola-card p-4">
        <button
          onClick={generate}
          disabled={
            !snippetValid ||
            generating ||
            (mode === "crop-video"
              ? !epFinalVideoUrl ||
                snippetDur + (includeBranding ? 10 : 0) > 60
              : !epAudio ||
                (mode === "clips"
                  ? selectedClipUrls.length < 1 || selectedClipUrls.length > 4
                  : !imagePromptId))
          }
          className="w-full rounded bg-escola-dourado px-6 py-3 text-sm font-semibold text-escola-bg disabled:opacity-30"
        >
          {generating
            ? "A gerar short..."
            : mode === "crop-video"
              ? `Recortar Short MP4 9:16 (${(snippetDur + (includeBranding ? 10 : 0)).toFixed(1)}s)`
              : "Gerar Short MP4 9:16"}
        </button>
        {err && (
          <p className="mt-2 rounded bg-red-950/50 p-2 text-xs text-red-300">Erro: {err}</p>
        )}
      </section>

      {/* ── 6. Resultado ──────────────────────────────────────────── */}
      {result && (
        <section className="mb-4 rounded-xl border border-escola-dourado bg-escola-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-escola-dourado">
            ✓ Short pronto ({result.durationSec.toFixed(1)}s)
          </h3>
          <video
            src={result.videoUrl}
            controls
            playsInline
            className="mx-auto aspect-[9/16] max-w-sm rounded"
          />
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <a
              href={result.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded bg-escola-dourado px-3 py-2 font-semibold text-escola-bg"
              download
            >
              ⬇ MP4 vertical
            </a>
            <ShareButton
              url={result.videoUrl}
              filename={`${epKey}-short.mp4`}
              title={overlayText || ep.label}
            />
            <a
              href={result.audioUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-escola-border px-3 py-2 text-escola-creme hover:border-escola-dourado/40"
            >
              ⬇ snippet MP3
            </a>
            <a
              href={result.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded border border-escola-border px-3 py-2 text-escola-creme hover:border-escola-dourado/40"
            >
              ⬇ imagem 9:16
            </a>
          </div>
          <p className="mt-2 text-[10px] text-escola-creme-50">
            📱 &quot;Partilhar&quot; no mobile abre o sheet nativo → YouTube, TikTok, IG.
          </p>
        </section>
      )}
    </div>
  );
}

// ─── Image preview ──────────────────────────────────────────────────────────
function ImagePreview({ promptId }: { promptId: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  useEffect(() => {
    setImgUrl(null);
    fetch(`/api/admin/biblioteca/list?folder=youtube/images/${encodeURIComponent(promptId)}/horizontal&limit=10`)
      .then((r) => r.json())
      .then((d) => {
        const files = Array.isArray(d.files) ? d.files : [];
        const first = files.find((f: Audio) => /\.(png|jpe?g)$/i.test(f.name));
        if (first) setImgUrl(first.url);
      })
      .catch(() => {});
  }, [promptId]);

  if (!imgUrl)
    return (
      <p className="text-[10px] text-escola-creme-50">
        Sem imagem MJ gerada para <code>{promptId}</code>. Gera em /admin/producao/funil/gerar.
      </p>
    );
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={imgUrl}
      alt={promptId}
      className="max-h-48 rounded border border-escola-border"
    />
  );
}

// ─── Share button (mobile Web Share API) ────────────────────────────────────
function ShareButton({
  url,
  filename,
  title,
}: {
  url: string;
  filename: string;
  title: string;
}) {
  const canShare =
    typeof navigator !== "undefined" &&
    !!(navigator as Navigator & { share?: unknown }).share;

  if (!canShare) return null;

  return (
    <button
      onClick={async () => {
        const nav = navigator as Navigator & {
          share?: (d: { title?: string; files?: File[]; url?: string }) => Promise<void>;
          canShare?: (d: { files?: File[] }) => boolean;
        };
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          const file = new File([blob], filename, { type: blob.type || "video/mp4" });
          if (nav.canShare?.({ files: [file] })) {
            await nav.share?.({ title, files: [file] });
            return;
          }
          await nav.share?.({ title, url });
        } catch {
          /* user cancelou */
        }
      }}
      className="rounded border border-escola-dourado px-3 py-2 font-semibold text-escola-dourado"
    >
      ↗ Partilhar
    </button>
  );
}

// ─── AudioRegionSelector ──────────────────────────────────────────────────
// Timeline visual com 2 pegas arrastaveis para escolher start/end do snippet.
// Renderiza uma barra representando a duracao total do audio + regiao
// amarela destacada entre as pegas. Suporta mouse + touch (mobile).

function AudioRegionSelector({
  audioRef,
  startSec,
  endSec,
  onStartChange,
  onEndChange,
  maxDur,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  startSec: number;
  endSec: number;
  onStartChange: (v: number) => void;
  onEndChange: (v: number) => void;
  maxDur: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);

  // Actualiza duracao quando o audio carrega
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const updateDur = () => {
      if (a.duration && !isNaN(a.duration) && isFinite(a.duration)) {
        setDuration(a.duration);
      }
    };
    updateDur();
    a.addEventListener("loadedmetadata", updateDur);
    a.addEventListener("durationchange", updateDur);
    return () => {
      a.removeEventListener("loadedmetadata", updateDur);
      a.removeEventListener("durationchange", updateDur);
    };
  }, [audioRef]);

  // Actualiza playhead em tempo real
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const tick = () => setPlayheadSec(a.currentTime);
    a.addEventListener("timeupdate", tick);
    return () => a.removeEventListener("timeupdate", tick);
  }, [audioRef]);

  // Calcula segundo a partir de uma posicao X (mouse/touch) no track
  const secFromX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || !duration) return 0;
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      return (x / rect.width) * duration;
    },
    [duration],
  );

  // Durante o arrasto, ouve eventos globais
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX =
        e instanceof MouseEvent
          ? e.clientX
          : e.touches[0]?.clientX ?? 0;
      const s = secFromX(clientX);
      if (dragging === "start") {
        // Start nao pode passar o end, nem criar snippet > maxDur
        const newStart = Math.max(0, Math.min(s, endSec - 0.5));
        const clampedByMax = Math.max(newStart, endSec - maxDur);
        onStartChange(+clampedByMax.toFixed(1));
      } else {
        const newEnd = Math.max(startSec + 0.5, Math.min(s, duration));
        const clampedByMax = Math.min(newEnd, startSec + maxDur);
        onEndChange(+clampedByMax.toFixed(1));
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, startSec, endSec, duration, maxDur, onStartChange, onEndChange, secFromX]);

  // Click na barra fora das pegas → move a mais próxima
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging) return;
    const s = secFromX(e.clientX);
    const distToStart = Math.abs(s - startSec);
    const distToEnd = Math.abs(s - endSec);
    if (distToStart < distToEnd) {
      onStartChange(+Math.max(0, Math.min(s, endSec - 0.5)).toFixed(1));
    } else {
      onEndChange(+Math.max(startSec + 0.5, Math.min(s, duration)).toFixed(1));
    }
  };

  if (!duration) {
    return (
      <div className="rounded border border-dashed border-escola-border p-3 text-center text-[10px] text-escola-creme-50">
        A carregar duração do áudio...
      </div>
    );
  }

  const startPct = (startSec / duration) * 100;
  const endPct = (endSec / duration) * 100;
  const playheadPct = (playheadSec / duration) * 100;

  return (
    <div className="select-none">
      <div className="mb-1 flex items-center justify-between text-[10px] text-escola-creme-50">
        <span>0:00</span>
        <span className="text-escola-creme">
          {fmtTime(startSec)} → {fmtTime(endSec)} ({(endSec - startSec).toFixed(1)}s)
        </span>
        <span>{fmtTime(duration)}</span>
      </div>
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative h-10 cursor-pointer rounded border border-escola-border bg-escola-bg"
      >
        {/* Regiao seleccionada (amarela translucida) */}
        <div
          className="absolute bottom-0 top-0 rounded bg-escola-dourado/25 border-y-2 border-escola-dourado"
          style={{
            left: `${startPct}%`,
            width: `${Math.max(0, endPct - startPct)}%`,
          }}
        />
        {/* Playhead (onde o audio esta a tocar) */}
        {playheadSec > 0 && playheadSec < duration && (
          <div
            className="pointer-events-none absolute bottom-0 top-0 w-px bg-escola-coral"
            style={{ left: `${playheadPct}%` }}
            title={`playhead: ${fmtTime(playheadSec)}`}
          />
        )}
        {/* Pega INICIO (🟡) */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            setDragging("start");
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setDragging("start");
          }}
          className="absolute bottom-0 top-0 flex w-4 cursor-ew-resize items-center justify-center rounded-l bg-escola-dourado hover:bg-escola-dourado/80"
          style={{ left: `calc(${startPct}% - 8px)` }}
          title={`Início: ${fmtTime(startSec)} — arrasta para mover`}
        >
          <span className="text-[8px] font-bold text-escola-bg">‖</span>
        </div>
        {/* Pega FIM (🟡) */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            setDragging("end");
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setDragging("end");
          }}
          className="absolute bottom-0 top-0 flex w-4 cursor-ew-resize items-center justify-center rounded-r bg-escola-dourado hover:bg-escola-dourado/80"
          style={{ left: `calc(${endPct}% - 8px)` }}
          title={`Fim: ${fmtTime(endSec)} — arrasta para mover`}
        >
          <span className="text-[8px] font-bold text-escola-bg">‖</span>
        </div>
      </div>
      <div className="mt-1 text-[10px] text-escola-creme-50">
        Arrasta as pegas ‖ (ou clica na barra perto da pega que queres mover).
        Máx {maxDur}s.
      </div>
    </div>
  );
}
