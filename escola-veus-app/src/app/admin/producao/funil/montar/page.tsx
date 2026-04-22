"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function findScriptById(id: string): { titulo: string; texto?: string } | null {
  for (const preset of NOMEAR_PRESETS) {
    const hit = preset.scripts.find((s) => s.id === id);
    if (hit) return hit as { titulo: string; texto?: string };
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

const supabasePublicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export default function FunilMontarPage() {
  const [epKey, setEpKey] = useState<(typeof EPISODES)[number]["key"]>("trailer");
  const ep = EPISODES.find((e) => e.key === epKey)!;

  const [allClips, setAllClips] = useState<Clip[]>([]);
  const [allAudios, setAllAudios] = useState<Audio[]>([]);
  const [allSrts, setAllSrts] = useState<Audio[]>([]);
  const [allVideos, setAllVideos] = useState<Audio[]>([]);
  const [allThumbs, setAllThumbs] = useState<Audio[]>([]);
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
  // Todos os assets são carregados de Supabase → muda de dispositivo, abre
  // a página, os vídeos/SRT/thumbs renderizados antes aparecem prontos.
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/thinkdiffusion/list-clips").then((r) => r.json()),
      fetch("/api/admin/biblioteca/list?folder=youtube&limit=500").then((r) => r.json()),
      fetch("/api/admin/music/list-album?album=ancient-ground").then((r) => r.json()),
      // SRTs em cache (geradas previamente via "Gerar legenda SRT").
      fetch("/api/admin/biblioteca/list?folder=youtube/subtitles&limit=500").then((r) => r.json()),
      // Vídeos MP4 finais já renderizados.
      fetch("/api/admin/biblioteca/list?folder=youtube/funil-videos&limit=500").then((r) => r.json()),
      // Thumbnails PNG já geradas.
      fetch("/api/admin/biblioteca/list?folder=youtube/thumbnails&limit=500").then((r) => r.json()),
    ])
      .then(([clipsD, audiosD, musicD, srtsD, videosD, thumbsD]) => {
        setAllClips(Array.isArray(clipsD.clips) ? clipsD.clips : []);
        setAllAudios(
          (Array.isArray(audiosD.files) ? audiosD.files : []).filter((f: Audio) =>
            f.name.endsWith(".mp3"),
          ),
        );
        setTracks(Array.isArray(musicD.tracks) ? musicD.tracks : []);
        setAllSrts(
          (Array.isArray(srtsD.files) ? srtsD.files : []).filter((f: Audio) =>
            f.name.endsWith(".srt"),
          ),
        );
        setAllVideos(
          (Array.isArray(videosD.files) ? videosD.files : []).filter((f: Audio) =>
            f.name.endsWith(".mp4"),
          ),
        );
        setAllThumbs(
          (Array.isArray(thumbsD.files) ? thumbsD.files : []).filter((f: Audio) =>
            /\.(png|jpe?g)$/i.test(f.name),
          ),
        );
      })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // SRT cached para o episódio actual. Se existir, render usa-o sem custo
  // ElevenLabs Scribe. Se não existir, o user clica "Gerar SRT" (custo único
  // por episódio: ~$0.04 trailer / ~$0.30 ep completo).
  const epCachedSrt = useMemo(() => {
    const prefix = `${epKey}-`;
    const matches = allSrts.filter((s) => s.name.startsWith(prefix));
    return matches.sort((a, b) => b.name.localeCompare(a.name))[0] ?? null;
  }, [allSrts, epKey]);

  // Vídeo final renderizado em cache. Match por slug do título OU epKey
  // (convenção actual do render-funil.mjs gera `<slug>-<ts>.mp4` onde
  // slug é derivado de ep.label). Fallback para epKey.
  const epCachedVideo = useMemo(() => {
    const script = findScriptById(ep.slug);
    const slug = script ? titleToSlug(script.titulo) : "";
    const matches = allVideos.filter(
      (v) =>
        (slug && v.name.startsWith(`${slug}-`)) ||
        v.name.startsWith(`${epKey}-`) ||
        // fallback: ep.label lowercase slug
        v.name.startsWith(`${ep.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-`),
    );
    return matches.sort((a, b) => b.name.localeCompare(a.name))[0] ?? null;
  }, [allVideos, ep.slug, ep.label, epKey]);

  // Thumbnail em cache. Convenção: `<epKey>-<ts>.png` (filename=ep.key).
  const epCachedThumb = useMemo(() => {
    const prefix = `${epKey}-`;
    const matches = allThumbs.filter((t) => t.name.startsWith(prefix));
    return matches.sort((a, b) => b.name.localeCompare(a.name))[0] ?? null;
  }, [allThumbs, epKey]);

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
  // Todos os artefactos (vídeo, SRT, thumb) são lidos de Supabase →
  // muda-se de dispositivo e aparecem prontos sem re-render nem re-gerar.
  useEffect(() => {
    setSelectedNarration(epNarration?.url ?? "");
    setClipOrder(epClips.map((c) => c.url));
    setVideoUrl(epCachedVideo?.url ?? null);
    setProgress(null);
    setSrtUrl(epCachedSrt?.url ?? null);
    setSrtErr(null);
    setThumbUrl(epCachedThumb?.url ?? null);
    setThumbErr(null);
  }, [epNarration, epClips, epCachedSrt, epCachedVideo, epCachedThumb]);

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
            // SRT (opcional). Se vazio, render passa sem legendas. Se já
            // existia em cache para o epKey, foi pré-preenchido pelo useEffect.
            subtitlesUrl: srtUrl || undefined,
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
                    // Push para a lista local para futuros mounts/eps
                    if (d.url) {
                      const name = d.url.split("/").pop() || `${ep.key}-${Date.now()}.srt`;
                      setAllSrts((prev) => [{ name, url: d.url }, ...prev]);
                    }
                  } catch (e) {
                    setSrtErr(e instanceof Error ? e.message : String(e));
                  } finally {
                    setSrtGenerating(false);
                  }
                }}
                disabled={srtGenerating || !selectedNarration}
                className="rounded border border-escola-border bg-escola-bg px-3 py-1.5 text-escola-creme hover:border-escola-dourado/40 disabled:opacity-50"
              >
                {srtGenerating
                  ? "A gerar SRT..."
                  : srtUrl
                    ? "↻ Regenerar SRT (paga ElevenLabs outra vez)"
                    : `Gerar SRT (ElevenLabs Scribe · ~$0.04 trailer / ~$0.30 ep)`}
              </button>
              {srtUrl && (
                <>
                  <span className="rounded bg-escola-dourado/10 px-3 py-1.5 text-escola-dourado">
                    ✓ SRT em cache · será queimada no vídeo
                  </span>
                  <a
                    href={srtUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-escola-creme-50 underline hover:text-escola-creme"
                  >
                    abrir SRT
                  </a>
                </>
              )}
              {!srtUrl && !srtGenerating && (
                <span className="text-escola-creme-50">
                  Sem SRT — render passa sem legendas. Clica para gerar uma vez (cache).
                </span>
              )}
              {srtErr && <span className="text-escola-terracota">{srtErr}</span>}
            </div>
            <p className="mt-1 text-[10px] text-escola-creme-50">
              SRT gerada uma vez e cacheada em Supabase — re-renders deste episódio
              não voltam a pagar Scribe. Para upload manual no YouTube Studio,
              clica &quot;abrir SRT&quot;.
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

      {/* ── Preview timeline ─────────────────────────────────────── */}
      <section className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
        <h3 className="mb-2 text-sm text-escola-creme">Preview — ordem de montagem</h3>
        <p className="mb-3 text-xs text-escola-creme-50">
          Intro e outro com mandala + texto brand são adicionados automaticamente no render.
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <BrandCard
            label="Intro · 5s"
            sublabel="A ESCOLA DOS VÉUS"
            src={`${supabasePublicUrl}/storage/v1/object/public/course-assets/youtube/brand/intro.mp4`}
          />
          {clipOrder.map((url, i) => {
            const name = allClips.find((c) => c.url === url)?.name ?? "?";
            return (
              <div key={url} className="shrink-0 overflow-hidden rounded border border-escola-border">
                <video src={url} className="h-[90px] w-40 object-cover" muted />
                <p className="truncate border-t border-escola-border bg-escola-bg px-1.5 py-0.5 text-[9px] text-escola-creme-50">
                  {i + 1}. {name.replace(/\.mp4$/, "").replace(/^nomear-\w+-\d+-/, "")}
                </p>
              </div>
            );
          })}
          <BrandCard
            label="Outro · 5s"
            sublabel="A ESCOLA DOS VÉUS · seteveus.space"
            src={`${supabasePublicUrl}/storage/v1/object/public/course-assets/youtube/brand/intro.mp4`}
          />
        </div>
        <p className="mt-2 text-[10px] text-escola-creme-50">
          Total estimado: ~{5 + clipOrder.length * 9.5 + 5}s (intro 5s + {clipOrder.length} clips × ~9.5s + outro 5s)
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
      <ThumbnailSection
        videoUrl={videoUrl}
        epLabel={ep.label}
        epKey={ep.key}
        thumbUrl={thumbUrl}
        setThumbUrl={setThumbUrl}
        thumbGenerating={thumbGenerating}
        setThumbGenerating={setThumbGenerating}
        thumbErr={thumbErr}
        setThumbErr={setThumbErr}
        onGenerated={(url, name) => setAllThumbs((prev) => [{ name, url }, ...prev])}
      />

      {/* ── 7. Publicar no YouTube ────────────────────────────────── */}
      {videoUrl && (
        <PublishSection
          videoUrl={videoUrl}
          srtUrl={srtUrl}
          thumbUrl={thumbUrl}
          epLabel={ep.label}
          epKey={ep.key}
          episodeText={findScriptById(ep.slug)?.texto ?? ""}
        />
      )}
    </div>
  );
}

// ─── Publish Section ────────────────────────────────────────────────────────
// Organiza TUDO num sítio: download + partilhar (mobile) + campos
// pré-preenchidos copy-to-clipboard + link direto para YouTube Studio.
// Desenhado para minimizar cliques: 3 passos, visíveis, numerados.

function buildYoutubeMetadata(epLabel: string, episodeText: string) {
  // Título: "ep01 — A culpa | Nomear · A Escola dos Véus" (máx 100 chars)
  const cleanLabel = epLabel.replace(/^(\w+)\s*—\s*/, (_m, pref) => `${pref} · `);
  const title = `${cleanLabel} | Nomear · A Escola dos Véus`.slice(0, 100);

  // Descrição: texto do episódio + CTA + hashtags
  const cta = [
    "",
    "━━━━━━━━━━━━━━━━",
    "A Escola dos Véus é um espaço para mulheres que querem nomear o que nunca teve nome.",
    "",
    "→ Subscreve para receberes novos episódios da série Nomear.",
    "→ Junta-te à escola: https://seteveus.space",
    "",
    "#EscolaDosVéus #Nomear #Mulheres #Consciência #Herança",
  ].join("\n");

  // Remove marcações [long pause] / [pause] / CTA duplicado do script
  const body = episodeText
    .replace(/\[(long pause|pause)\]/gi, "")
    .replace(/Escola dos Véus\.\s*seteveus\.space\.?/gi, "")
    .replace(/Se isto te nomeou alguma coisa[^.]*\./gi, "")
    .trim();

  const description = `${body}\n${cta}`.slice(0, 5000);

  // Tags
  const tags = [
    "escola dos véus",
    "nomear",
    "mulheres",
    "consciência",
    "herança",
    "dinheiro",
    "culpa",
    "vergonha",
    "autoconhecimento",
    "vivianne nascimento",
  ];

  return { title, description, tags };
}

async function downloadBlob(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

async function nativeShareFile(url: string, filename: string, title: string) {
  const nav = navigator as Navigator & {
    share?: (d: { title?: string; files?: File[]; url?: string }) => Promise<void>;
    canShare?: (d: { files?: File[] }) => boolean;
  };
  const res = await fetch(url);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: blob.type || "video/mp4" });
  if (nav.canShare?.({ files: [file] })) {
    await nav.share?.({ title, files: [file] });
    return true;
  }
  if (nav.share) {
    await nav.share({ title, url });
    return true;
  }
  return false;
}

function PublishSection({
  videoUrl,
  srtUrl,
  thumbUrl,
  epLabel,
  epKey,
  episodeText,
}: {
  videoUrl: string;
  srtUrl: string | null;
  thumbUrl: string | null;
  epLabel: string;
  epKey: string;
  episodeText: string;
}) {
  const meta = useMemo(
    () => buildYoutubeMetadata(epLabel, episodeText),
    [epLabel, episodeText],
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const canShare =
    typeof navigator !== "undefined" &&
    !!(navigator as Navigator & { share?: unknown }).share;

  const doCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  const baseFilename = `${epKey}-escola-veus`;

  return (
    <section className="mt-4 rounded-xl border border-escola-dourado/40 bg-escola-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-escola-dourado">
          7. Publicar no YouTube
        </h3>
        <span className="rounded-full bg-escola-dourado/10 px-2 py-0.5 text-[10px] text-escola-dourado">
          manual · 3 passos
        </span>
      </div>

      {/* Passo 1: Descarregar / Partilhar ficheiros */}
      <div className="mb-4 rounded-lg border border-escola-border bg-escola-bg p-3">
        <p className="mb-2 text-xs font-semibold text-escola-creme">
          <span className="mr-2 rounded-full bg-escola-dourado/20 px-2 text-escola-dourado">
            1
          </span>
          Guardar ficheiros no teu dispositivo
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => downloadBlob(videoUrl, `${baseFilename}.mp4`)}
            className="rounded bg-escola-dourado px-3 py-2 font-semibold text-escola-bg"
          >
            ⬇ MP4 (vídeo)
          </button>
          {canShare && (
            <button
              onClick={async () => {
                try {
                  setShareMsg("A abrir partilha...");
                  const ok = await nativeShareFile(
                    videoUrl,
                    `${baseFilename}.mp4`,
                    meta.title,
                  );
                  setShareMsg(ok ? "Partilha aberta" : "Sem suporte neste dispositivo");
                } catch {
                  setShareMsg("Cancelado");
                } finally {
                  setTimeout(() => setShareMsg(null), 2000);
                }
              }}
              className="rounded border border-escola-dourado px-3 py-2 font-semibold text-escola-dourado"
              title="No mobile abre o sheet de partilha (YouTube Studio, TikTok, IG)"
            >
              ↗ Partilhar MP4
            </button>
          )}
          {srtUrl && (
            <button
              onClick={() => downloadBlob(srtUrl, `${baseFilename}.srt`)}
              className="rounded border border-escola-border px-3 py-2 text-escola-creme hover:border-escola-dourado/40"
            >
              ⬇ SRT (legendas)
            </button>
          )}
          {thumbUrl && (
            <button
              onClick={() => downloadBlob(thumbUrl, `${baseFilename}-thumb.png`)}
              className="rounded border border-escola-border px-3 py-2 text-escola-creme hover:border-escola-dourado/40"
            >
              ⬇ Thumbnail
            </button>
          )}
        </div>
        {shareMsg && (
          <p className="mt-2 text-[10px] text-escola-creme-50">{shareMsg}</p>
        )}
        <p className="mt-2 text-[10px] text-escola-creme-50">
          📱 Mobile: &quot;Partilhar MP4&quot; abre o sheet nativo → escolhe YouTube Studio,
          TikTok ou Instagram. 💻 Desktop: usa &quot;⬇ MP4&quot; e arrasta para o Studio.
        </p>
      </div>

      {/* Passo 2: Abrir YouTube Studio */}
      <div className="mb-4 rounded-lg border border-escola-border bg-escola-bg p-3">
        <p className="mb-2 text-xs font-semibold text-escola-creme">
          <span className="mr-2 rounded-full bg-escola-dourado/20 px-2 text-escola-dourado">
            2
          </span>
          Abrir YouTube Studio e fazer upload
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <a
            href="https://studio.youtube.com/channel/UC/videos/upload"
            target="_blank"
            rel="noreferrer"
            className="rounded bg-escola-dourado px-3 py-2 font-semibold text-escola-bg"
          >
            → Abrir YouTube Studio Upload
          </a>
        </div>
        <p className="mt-2 text-[10px] text-escola-creme-50">
          Arrasta o MP4 para a janela. Depois: Subtitles → Upload file → escolhe o
          .srt. Thumbnail → sobe o PNG. Visibility → Scheduled → sexta 18h Maputo.
        </p>
      </div>

      {/* Passo 3: Copy fields (título / descrição / tags) */}
      <div className="rounded-lg border border-escola-border bg-escola-bg p-3">
        <p className="mb-2 text-xs font-semibold text-escola-creme">
          <span className="mr-2 rounded-full bg-escola-dourado/20 px-2 text-escola-dourado">
            3
          </span>
          Copiar campos e colar no Studio
        </p>
        <div className="space-y-2 text-xs">
          <CopyRow
            label={`Título (${meta.title.length}/100)`}
            value={meta.title}
            copied={copied === "title"}
            onCopy={() => doCopy("title", meta.title)}
            rows={1}
            warn={meta.title.length > 100}
          />
          <CopyRow
            label={`Descrição (${meta.description.length}/5000)`}
            value={meta.description}
            copied={copied === "desc"}
            onCopy={() => doCopy("desc", meta.description)}
            rows={6}
            warn={meta.description.length > 5000}
          />
          <CopyRow
            label="Tags (separadas por vírgula)"
            value={meta.tags.join(", ")}
            copied={copied === "tags"}
            onCopy={() => doCopy("tags", meta.tags.join(", "))}
            rows={2}
          />
        </div>
        <p className="mt-2 text-[10px] text-escola-creme-50">
          💡 Edita livremente antes de copiar — o título/descrição são só sugestões
          derivadas do script.
        </p>
      </div>

      <details className="mt-4 rounded-lg border border-escola-border bg-escola-bg/50 p-3">
        <summary className="cursor-pointer text-xs text-escola-creme-50 hover:text-escola-creme">
          📱 Partilhar também em TikTok e Instagram Reels (para o shorts, depois)
        </summary>
        <div className="mt-2 space-y-1 text-[11px] text-escola-creme-50">
          <p>
            <b>TikTok</b>: App → + → Upload → seleciona MP4 vertical → caption +
            hashtags → agenda até 10 dias à frente dentro da app.
          </p>
          <p>
            <b>Instagram Reels</b>: App → + → Reel → MP4 → Caption. Agendamento em
            <a
              href="https://business.facebook.com/latest/content_planner"
              target="_blank"
              rel="noreferrer"
              className="ml-1 text-escola-dourado underline"
            >
              Meta Business Suite
            </a>{" "}
            (grátis).
          </p>
          <p>
            As legendas já estão queimadas no MP4 → funcionam automaticamente em
            TikTok e Reels (que não têm CC nativo).
          </p>
        </div>
      </details>

      <p className="mt-3 text-[10px] text-escola-creme-50">
        ⚙️ Quando configurares o Google OAuth, aparece aqui o botão
        &quot;Publicar &amp; agendar automaticamente&quot; — um click faz tudo
        (upload + thumbnail + captions + schedule).
      </p>
    </section>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
  rows,
  warn,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  rows: number;
  warn?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label
          className={`text-[10px] uppercase tracking-wider ${warn ? "text-escola-terracota" : "text-escola-creme-50"}`}
        >
          {label}
        </label>
        <button
          onClick={onCopy}
          className="rounded bg-escola-dourado/10 px-2 py-0.5 text-[10px] text-escola-dourado hover:bg-escola-dourado/20"
        >
          {copied ? "✓ copiado" : "copiar"}
        </button>
      </div>
      <textarea
        value={value}
        readOnly
        rows={rows}
        className="w-full rounded border border-escola-border bg-escola-card px-2 py-1.5 text-[11px] text-escola-creme"
        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
      />
    </div>
  );
}

// ─── Thumbnail Section ──────────────────────────────────────────────────────
// Extrai um frame do VÍDEO FINAL do episódio (não do intro brand — senão
// todas as thumbnails ficavam iguais). Slider permite escolher o segundo.
// Preview do frame actual antes de queimar o texto (para o user validar a
// escolha). Se ainda não há vídeo final, usa intro.mp4 como fallback.

function ThumbnailSection({
  videoUrl,
  epLabel,
  epKey,
  thumbUrl,
  setThumbUrl,
  thumbGenerating,
  setThumbGenerating,
  thumbErr,
  setThumbErr,
  onGenerated,
}: {
  videoUrl: string | null;
  epLabel: string;
  epKey: string;
  thumbUrl: string | null;
  setThumbUrl: (u: string | null) => void;
  thumbGenerating: boolean;
  setThumbGenerating: (b: boolean) => void;
  thumbErr: string | null;
  setThumbErr: (s: string | null) => void;
  onGenerated: (url: string, name: string) => void;
}) {
  // Tempo default: 10s se há vídeo final (após intro 5s + crossfade, já no 1º
  // clip Runway do ep). 2.5s se fallback intro.mp4 (pico de brilho mandala).
  const defaultFrameT = videoUrl ? 10 : 2.5;
  const [frameT, setFrameT] = useState(defaultFrameT);
  const previewRef = useRef<HTMLVideoElement>(null);

  // Ajusta default quando videoUrl aparece (depois de render)
  useEffect(() => {
    setFrameT(videoUrl ? 10 : 2.5);
  }, [videoUrl]);

  // Seek no preview video para o frame escolhido
  useEffect(() => {
    const v = previewRef.current;
    if (v && videoUrl) {
      try { v.currentTime = frameT; } catch { /* ignore */ }
    }
  }, [frameT, videoUrl]);

  const duration = previewRef.current?.duration ?? 0;
  const maxFrameT = duration > 0 ? Math.max(1, Math.floor(duration - 0.5)) : 120;

  return (
    <section className="mt-4 rounded-xl border border-escola-border bg-escola-card p-4">
      <h3 className="mb-2 text-sm text-escola-creme">6. Thumbnail YouTube</h3>
      <p className="mb-3 text-xs text-escola-creme-50">
        {videoUrl
          ? "Frame extraído do TEU vídeo final do episódio. Usa o slider para escolher o momento que melhor representa o ep."
          : "Ainda não há vídeo final renderizado — vai ser usada a mandala brand como fallback. Monta o vídeo primeiro (secção 5) para uma thumbnail única."}
      </p>

      {/* Preview do frame escolhido (antes de queimar o texto) */}
      {videoUrl && (
        <div className="mb-3">
          <video
            ref={previewRef}
            src={videoUrl}
            className="w-full max-w-2xl rounded border border-escola-border"
            muted
            playsInline
            preload="auto"
          />
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="text-escola-creme-50 whitespace-nowrap">
              Frame: <b className="text-escola-creme">{frameT.toFixed(1)}s</b>
            </span>
            <input
              type="range"
              min="0"
              max={maxFrameT}
              step="0.5"
              value={frameT}
              onChange={(e) => setFrameT(parseFloat(e.target.value))}
              className="flex-1"
            />
            <button
              onClick={() => {
                const cur = previewRef.current?.currentTime;
                if (typeof cur === "number") setFrameT(+cur.toFixed(1));
              }}
              className="whitespace-nowrap rounded border border-escola-dourado bg-escola-dourado/10 px-2 py-1 text-escola-dourado hover:bg-escola-dourado/20"
              title="Usa o tempo actual do leitor"
            >
              📍 daqui
            </button>
          </div>
          <p className="mt-1 text-[10px] text-escola-creme-50">
            💡 Reproduz o vídeo, pausa no momento que quiseres e clica &quot;📍 daqui&quot;. Ou arrasta o slider.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={async () => {
            setThumbGenerating(true);
            setThumbErr(null);
            try {
              const titulo = epLabel.includes("—")
                ? epLabel.split("—").slice(1).join("—").trim()
                : epLabel;
              const r = await fetch("/api/admin/funil/generate-thumbnail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  titulo,
                  epKey,
                  filename: epKey,
                  videoUrl: videoUrl || undefined,
                  frameTimeSec: frameT,
                }),
              });
              const d = await r.json();
              if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
              setThumbUrl(d.url);
              if (d.url) {
                const name = d.url.split("/").pop() || `${epKey}-${Date.now()}.png`;
                onGenerated(d.url, name);
              }
            } catch (e) {
              setThumbErr(e instanceof Error ? e.message : String(e));
            } finally {
              setThumbGenerating(false);
            }
          }}
          disabled={thumbGenerating}
          className="rounded bg-escola-dourado px-4 py-2 font-semibold text-escola-bg disabled:opacity-50"
        >
          {thumbGenerating
            ? "A gerar..."
            : thumbUrl
              ? "↻ Regenerar com este frame"
              : "Gerar thumbnail deste frame"}
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
          <p className="mb-1 text-[10px] uppercase tracking-wider text-escola-creme-50">
            Thumbnail gerada (1280×720)
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbUrl}
            alt="Thumbnail"
            className="w-full max-w-2xl rounded border border-escola-border"
          />
        </div>
      )}
    </section>
  );
}

function BrandCard({
  label,
  sublabel,
  src,
}: {
  label: string;
  sublabel: string;
  src: string;
}) {
  return (
    <div className="shrink-0 overflow-hidden rounded border-2 border-escola-dourado/40 bg-escola-bg">
      <video
        src={src}
        className="h-[90px] w-40 object-cover"
        muted
        loop
        autoPlay
        playsInline
      />
      <div className="border-t border-escola-dourado/40 bg-escola-dourado/5 px-1.5 py-0.5">
        <p className="truncate text-[9px] font-semibold text-escola-dourado">{label}</p>
        <p className="truncate text-[8px] text-escola-creme-50">{sublabel}</p>
      </div>
    </div>
  );
}
