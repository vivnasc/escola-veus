"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";

// Slug algorithm matching /api/admin/audio-bulk/generate-one/route.ts filename logic.
// audio-bulk saves ElevenLabs audio as `${slug-of-title}-${timestamp}.mp3`.
function titleToSlug(title: string): string {
  return (title || "audio")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function findScriptById(id: string): { titulo: string } | null {
  for (const preset of NOMEAR_PRESETS) {
    const hit = preset.scripts.find((s) => s.id === id);
    if (hit) return hit;
  }
  return null;
}

type Clip = { name: string; url: string };
type Track = { name: string; url: string; sizeMB?: number };
type Audio = { name: string; url: string };

type Progress = { percent: number; label: string };

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

export default function FunilMontarPage() {
  const [epKey, setEpKey] = useState<(typeof EPISODES)[number]["key"]>("trailer");
  const ep = EPISODES.find((e) => e.key === epKey)!;

  const [allClips, setAllClips] = useState<Clip[]>([]);
  const [allAudios, setAllAudios] = useState<Audio[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selectedNarration, setSelectedNarration] = useState<string>("");
  const [selectedMusic, setSelectedMusic] = useState<string[]>([]);
  const [musicVolume, setMusicVolume] = useState(0.2);
  const [clipOrder, setClipOrder] = useState<string[]>([]);

  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [engine, setEngine] = useState<"ffmpeg" | "shotstack">("ffmpeg");
  const [srtGenerating, setSrtGenerating] = useState(false);
  const [srtUrl, setSrtUrl] = useState<string | null>(null);
  const [srtErr, setSrtErr] = useState<string | null>(null);
  const [thumbGenerating, setThumbGenerating] = useState(false);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [thumbErr, setThumbErr] = useState<string | null>(null);

  // ── Load assets on mount ──────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/thinkdiffusion/list-clips").then((r) => r.json()),
      fetch("/api/admin/biblioteca/list?folder=youtube&limit=500").then((r) => r.json()),
      fetch("/api/admin/music/list-album?album=ancient-ground").then((r) => r.json()),
    ])
      .then(([clipsD, audiosD, musicD]) => {
        setAllClips(Array.isArray(clipsD.clips) ? clipsD.clips : []);
        setAllAudios(
          (Array.isArray(audiosD.files) ? audiosD.files : []).filter((f: Audio) =>
            f.name.endsWith(".mp3"),
          ),
        );
        setTracks(Array.isArray(musicD.tracks) ? musicD.tracks : []);
      })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // ── Filter assets by episode ──────────────────────────────────────────
  const epClips = useMemo(() => {
    const prefix = epKey === "trailer" ? "nomear-trailer-" : `nomear-${epKey}-`;
    return allClips
      .filter((c) => c.name.startsWith(prefix))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allClips, epKey]);

  const epNarration = useMemo(() => {
    // audio-bulk saves with filename = `${slug-of-title}-${timestamp}.mp3`
    const script = findScriptById(ep.slug);
    if (!script) return null;
    const titleSlug = titleToSlug(script.titulo);
    const prefix = `${titleSlug}-`;
    const matches = allAudios.filter(
      (a) => a.name.startsWith(prefix) || a.name === `${titleSlug}.mp3`,
    );
    return matches.sort((a, b) => b.name.localeCompare(a.name))[0] ?? null;
  }, [allAudios, ep.slug]);

  // Auto-set default narration + clip order when ep changes
  useEffect(() => {
    setSelectedNarration(epNarration?.url ?? "");
    setClipOrder(epClips.map((c) => c.url));
    setVideoUrl(null);
    setProgress(null);
    setSrtUrl(null);
    setSrtErr(null);
    setThumbUrl(null);
    setThumbErr(null);
  }, [epNarration, epClips]);

  // Auto-pick single first track (one track covers full funnel video duration)
  useEffect(() => {
    if (tracks.length > 0 && selectedMusic.length === 0) {
      setSelectedMusic([tracks[0].url]);
    }
  }, [tracks, selectedMusic.length]);

  const moveClip = useCallback((from: number, to: number) => {
    setClipOrder((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [x] = next.splice(from, 1);
      next.splice(to, 0, x);
      return next;
    });
  }, []);

  // ── Render ────────────────────────────────────────────────────────────
  const render = async () => {
    if (clipOrder.length === 0) return setErr("Sem clips.");
    if (!selectedNarration) return setErr("Sem narração seleccionada.");
    if (selectedMusic.length === 0) return setErr("Sem música seleccionada.");

    setRendering(true);
    setErr(null);
    setVideoUrl(null);
    setProgress({ percent: 0, label: "A iniciar..." });

    try {
      if (engine === "ffmpeg") {
        // FFmpeg em GitHub Actions — mesmo padrão do Ancient Ground e Shorts.
        setProgress({ percent: 5, label: "A despachar GitHub Actions..." });
        const submitRes = await fetch("/api/admin/funil/render-funil-submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: ep.label,
            clips: clipOrder,
            clipDuration: 10,
            narrationUrl: selectedNarration,
            musicUrls: selectedMusic,
            musicVolume,
          }),
        });
        const submitData = await submitRes.json();
        if (!submitRes.ok || !submitData.jobId) {
          throw new Error(submitData.erro || `HTTP ${submitRes.status}`);
        }

        while (true) {
          await new Promise((r) => setTimeout(r, 10_000));
          let data: {
            status?: string;
            phase?: string;
            progress?: number;
            videoUrl?: string;
            error?: string;
            erro?: string;
          };
          try {
            const r = await fetch(`/api/admin/funil/render-funil-status?jobId=${encodeURIComponent(submitData.jobId)}`);
            data = await r.json();
          } catch {
            setProgress({ percent: 0, label: "Ligação perdida — a tentar de novo..." });
            continue;
          }
          if (data.erro) throw new Error(data.erro);
          const status = data.status || "...";
          const phase = data.phase ? ` (${data.phase})` : "";
          setProgress({
            percent: typeof data.progress === "number" ? data.progress : 0,
            label: `${status}${phase}`,
          });
          if (status === "failed") throw new Error(data.error || "FFmpeg render failed.");
          if (status === "done" && data.videoUrl) {
            setVideoUrl(data.videoUrl);
            setProgress({ percent: 100, label: "Vídeo pronto!" });
            break;
          }
        }
      } else {
        // Shotstack fallback — SSE stream original
        const endpoint = "/api/admin/funil/render";
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: ep.label,
            clips: clipOrder,
            clipDuration: 10,
            narrationUrl: selectedNarration,
            musicUrls: selectedMusic,
            musicVolume,
          }),
        });

        if (!res.body) throw new Error("Sem stream.");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const data = line.replace(/^data: /, "").trim();
            if (!data) continue;
            try {
              const ev = JSON.parse(data);
              if (ev.type === "progress") setProgress({ percent: ev.percent, label: ev.label });
              if (ev.type === "result") setVideoUrl(ev.videoUrl);
              if (ev.type === "error") setErr(ev.message);
            } catch {
              /* ignore */
            }
          }
        }
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setRendering(false);
    }
  };

  if (loading) return <p className="text-xs text-escola-creme-50">A carregar...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-escola-creme">
            Funil — Montar vídeo
          </h2>
          <p className="mt-1 text-xs text-escola-creme-50">
            Clips + narração ElevenLabs + Ancient Ground de fundo → MP4.
          </p>
        </div>
        <Link href="/admin/producao/funil" className="text-xs text-escola-creme-50 hover:text-escola-creme">
          ← voltar
        </Link>
      </div>

      {err && <p className="mb-3 text-xs text-escola-terracota">{err}</p>}

      {/* ── 1. Episode ───────────────────────────────────────────── */}
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <h3 className="mb-2 text-sm text-escola-creme">1. Episódio</h3>
        <div className="flex flex-wrap gap-1">
          {EPISODES.map((e) => {
            const prefix = e.key === "trailer" ? "nomear-trailer-" : `nomear-${e.key}-`;
            const nClips = allClips.filter((c) => c.name.startsWith(prefix)).length;
            return (
              <button
                key={e.key}
                onClick={() => setEpKey(e.key)}
                className={`rounded border px-2.5 py-1 text-xs transition-colors ${
                  epKey === e.key
                    ? "border-escola-dourado bg-escola-dourado/10 text-escola-dourado"
                    : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
                }`}
              >
                {e.label} · {nClips}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 2. Narration ─────────────────────────────────────────── */}
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <h3 className="mb-2 text-sm text-escola-creme">2. Narração ElevenLabs</h3>
        {epNarration ? (
          <>
            <div className="flex items-center gap-3">
              <audio src={selectedNarration} controls className="flex-1 max-w-md" />
              <span className="text-xs text-escola-creme-50">{epNarration.name}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={async () => {
                  setSrtGenerating(true);
                  setSrtErr(null);
                  setSrtUrl(null);
                  try {
                    const r = await fetch("/api/admin/funil/generate-srt", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        narrationUrl: selectedNarration,
                        scriptId: ep.slug,
                        filename: ep.key,
                      }),
                    });
                    const d = await r.json();
                    if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
                    setSrtUrl(d.url);
                  } catch (e) {
                    setSrtErr(e instanceof Error ? e.message : String(e));
                  } finally {
                    setSrtGenerating(false);
                  }
                }}
                disabled={srtGenerating || !selectedNarration}
                className="rounded border border-escola-border bg-escola-bg px-3 py-1.5 text-escola-creme hover:border-escola-dourado/40 disabled:opacity-50"
              >
                {srtGenerating ? "A gerar SRT..." : "Gerar legenda SRT (Whisper)"}
              </button>
              {srtUrl && (
                <a
                  href={srtUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded bg-escola-dourado/10 px-3 py-1.5 text-escola-dourado hover:bg-escola-dourado/20"
                >
                  ✓ abrir / descarregar SRT
                </a>
              )}
              {srtErr && <span className="text-escola-terracota">{srtErr}</span>}
            </div>
            <p className="mt-1 text-[10px] text-escola-creme-50">
              Upload do SRT no YouTube Studio → Subtitles → Add language → Upload file.
            </p>
          </>
        ) : (
          <p className="text-xs text-escola-terracota">
            Sem áudio Nomear no Supabase para <code>{ep.slug}</code>. Gera em /admin/producao/audios primeiro.
          </p>
        )}
      </section>

      {/* ── 3. Music ─────────────────────────────────────────────── */}
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <h3 className="mb-2 text-sm text-escola-creme">3. Música Ancient Ground (fundo)</h3>
        <div className="mb-2 flex items-center gap-3 text-xs">
          <label className="text-escola-creme-50">Volume:</label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="flex-1 max-w-xs"
          />
          <span className="text-escola-creme">{Math.round(musicVolume * 100)}%</span>
        </div>
        <select
          value={selectedMusic[0] ?? ""}
          onChange={(e) => setSelectedMusic(e.target.value ? [e.target.value] : [])}
          className="w-full rounded border border-escola-border bg-escola-bg px-2 py-2 text-xs text-escola-creme"
        >
          <option value="">— escolhe uma faixa —</option>
          {tracks.map((t) => (
            <option key={t.url} value={t.url}>
              {t.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[10px] text-escola-creme-50">
          Uma faixa só. Trocar a meio distrai da narração. AG dura ~3-5 min, cobre o vídeo todo.
        </p>
      </section>

      {/* ── 4. Clips ─────────────────────────────────────────────── */}
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <h3 className="mb-2 text-sm text-escola-creme">4. Clips ({clipOrder.length})</h3>
        {clipOrder.length === 0 ? (
          <p className="text-xs text-escola-terracota">
            Sem clips para <code>{ep.slug}</code>. Gera em /admin/producao/funil/gerar.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {clipOrder.map((url, i) => {
              const name = allClips.find((c) => c.url === url)?.name ?? "?";
              return (
                <li key={url} className="overflow-hidden rounded border border-escola-border">
                  <video src={url} className="aspect-video w-full" muted />
                  <div className="flex items-center justify-between gap-1 border-t border-escola-border bg-escola-bg px-2 py-1 text-[10px]">
                    <span className="truncate text-escola-creme-50">
                      {i + 1}. {name}
                    </span>
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => moveClip(i, i - 1)}
                        disabled={i === 0}
                        className="rounded border border-escola-border px-1 text-escola-creme disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveClip(i, i + 1)}
                        disabled={i === clipOrder.length - 1}
                        className="rounded border border-escola-border px-1 text-escola-creme disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── 5. Render ────────────────────────────────────────────── */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <div className="mb-3 flex items-center gap-4 text-xs">
          <span className="text-escola-creme-50">Motor:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              checked={engine === "ffmpeg"}
              onChange={() => setEngine("ffmpeg")}
            />
            <span className="text-escola-creme">FFmpeg · grátis <span className="text-escola-creme-50">(GitHub Actions · ducking automático)</span></span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              checked={engine === "shotstack"}
              onChange={() => setEngine("shotstack")}
            />
            <span className="text-escola-creme-50">Shotstack · ~$0.20</span>
          </label>
        </div>
        <button
          onClick={render}
          disabled={rendering || clipOrder.length === 0 || !selectedNarration || selectedMusic.length === 0}
          className="w-full rounded bg-escola-coral px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {rendering ? "A montar..." : `5. Montar vídeo (${engine === "ffmpeg" ? "FFmpeg" : "Shotstack"})`}
        </button>

        {progress && (
          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded bg-escola-bg">
              <div
                className="h-full bg-escola-dourado transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-escola-creme-50">
              {progress.percent}% · {progress.label}
            </p>
          </div>
        )}

        {videoUrl && (
          <div className="mt-4 rounded border border-escola-dourado bg-escola-bg p-3">
            <p className="mb-2 text-xs text-escola-dourado">✓ Vídeo pronto</p>
            <video src={videoUrl} className="w-full rounded" controls />
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-escola-creme-50 hover:text-escola-creme"
            >
              abrir URL ↗
            </a>
          </div>
        )}
      </section>

      {/* ── 6. Thumbnail YouTube ─────────────────────────────────── */}
      <section className="mt-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <h3 className="mb-2 text-sm text-escola-creme">6. Thumbnail YouTube</h3>
        <p className="mb-3 text-xs text-escola-creme-50">
          Composta a partir da mandala + título do episódio. Upload depois no YouTube Studio.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={async () => {
              setThumbGenerating(true);
              setThumbErr(null);
              setThumbUrl(null);
              try {
                const titulo = ep.label.includes("—") ? ep.label.split("—").slice(1).join("—").trim() : ep.label;
                const r = await fetch("/api/admin/funil/generate-thumbnail", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ titulo, epKey: ep.key, filename: ep.key }),
                });
                const d = await r.json();
                if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
                setThumbUrl(d.url);
              } catch (e) {
                setThumbErr(e instanceof Error ? e.message : String(e));
              } finally {
                setThumbGenerating(false);
              }
            }}
            disabled={thumbGenerating}
            className="rounded border border-escola-border bg-escola-bg px-3 py-1.5 text-escola-creme hover:border-escola-dourado/40 disabled:opacity-50"
          >
            {thumbGenerating ? "A gerar..." : "Gerar thumbnail"}
          </button>
          {thumbUrl && (
            <a
              href={thumbUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded bg-escola-dourado/10 px-3 py-1.5 text-escola-dourado hover:bg-escola-dourado/20"
            >
              ✓ abrir / descarregar PNG
            </a>
          )}
          {thumbErr && <span className="text-escola-terracota">{thumbErr}</span>}
        </div>
        {thumbUrl && (
          <div className="mt-3">
            <img src={thumbUrl} alt="Thumbnail" className="w-full max-w-2xl rounded border border-escola-border" />
          </div>
        )}
      </section>
    </div>
  );
}
