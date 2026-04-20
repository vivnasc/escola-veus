"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import videoPlan from "@/data/video-plan.json";

// ── Constants ────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://tdytdamtfillqyklgrmb.supabase.co";
const MUSIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/audios/albums/ancient-ground`;
const TOTAL_MUSIC_PAIRS = 50; // 100 faixas em 50 pares (1+2, 3+4, etc.)
const CLIP_DURATION = 15; // seconds
const VIDEO_DURATION = 3600; // 1 hour
const TOTAL_CLIPS_NEEDED = VIDEO_DURATION / CLIP_DURATION; // 240 clips (repetidos do set)

// ── Types ────────────────────────────────────────────────────────────────────

type ClipSlot = {
  index: number;
  url: string;
  loaded: boolean;
};

type ClipGroup = {
  promptId: string;
  clips: string[]; // ordered list of URLs (4 variations)
};

type ProjectState = {
  title: string;
  clips: ClipSlot[];
  musicPair: number;
  groupOrder?: string[]; // ordered promptIds
  groupClips?: Record<string, string[]>; // promptId → ordered clip URLs
  thumbnailUrl?: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMusicPairUrls(pairNum: number): [string, string] {
  const a = (pairNum - 1) * 2 + 1;
  const b = a + 1;
  const padA = String(a).padStart(2, "0");
  const padB = String(b).padStart(2, "0");
  return [
    `${MUSIC_BASE}/faixa-${padA}.mp3`,
    `${MUSIC_BASE}/faixa-${padB}.mp3`,
  ];
}

// Extract promptId from clip filename.
// "mar-01-golden-hour-h-01.mp4" → "mar-01-golden-hour"
// "mar-01-golden-hour-h-01.mp4.mp4" → "mar-01-golden-hour"
// URL with ?t=timestamp handled upstream.
function promptIdFromClipName(name: string): string {
  return name.replace(/\.mp4(\.mp4)?$/i, "").replace(/-[hv]-\d+$/, "");
}

// Natural sort for promptIds: "mar-01" < "mar-02" < ... < "mar-15"
function comparePromptIds(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function fileNameFromUrl(url: string): string {
  const last = url.split("/").pop() || "";
  return last.split("?")[0];
}

function buildGroups(clipUrls: string[]): ClipGroup[] {
  const map = new Map<string, string[]>();
  for (const url of clipUrls) {
    if (!url) continue;
    const name = fileNameFromUrl(url);
    const pid = promptIdFromClipName(name);
    if (!pid) continue;
    if (!map.has(pid)) map.set(pid, []);
    map.get(pid)!.push(url);
  }
  const groups: ClipGroup[] = [];
  for (const [promptId, urls] of map) {
    urls.sort((a, b) => fileNameFromUrl(a).localeCompare(fileNameFromUrl(b)));
    groups.push({ promptId, clips: urls });
  }
  groups.sort((a, b) => comparePromptIds(a.promptId, b.promptId));
  return groups;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function YouTubeMontagem() {
  const [title, setTitle] = useState("");
  // Group state: ordered promptIds + per-group ordered clip URLs.
  const [groupOrder, setGroupOrder] = useState<string[]>([]);
  const [groupClips, setGroupClips] = useState<Record<string, string[]>>({});
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [musicPair, setMusicPair] = useState(1); // pair 1 = faixas 01+02
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Derived: flat ordered clip URLs respecting groupOrder + per-group order.
  const orderedClipUrls: string[] = groupOrder.flatMap((pid) => groupClips[pid] || []);

  // Auto-load clips from Supabase on mount (only if no saved state yet).
  useEffect(() => {
    const saved = localStorage.getItem("yt-montagem-state");
    if (saved) return; // hydrated below
    fetch("/api/admin/thinkdiffusion/list-clips")
      .then((r) => r.json())
      .then((data) => {
        if (!data.clips || data.clips.length === 0) return;
        const horizontal = data.clips
          .filter((c: { name: string }) => c.name.includes("-h-"))
          .map((c: { url: string }) => c.url);
        const groups = buildGroups(horizontal);
        setGroupOrder(groups.map((g) => g.promptId));
        setGroupClips(Object.fromEntries(groups.map((g) => [g.promptId, g.clips])));
      })
      .catch(() => {});
  }, []);

  // Render
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderLabel, setRenderLabel] = useState("");
  const [renderResult, setRenderResult] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Preview
  const [previewing, setPreviewing] = useState(false);
  const [previewClipIndex, setPreviewClipIndex] = useState(0);
  const [previewTime, setPreviewTime] = useState(0);
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);
  const [activeBuffer, setActiveBuffer] = useState<0 | 1>(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yt-montagem-state");
      if (saved) {
        const state: ProjectState = JSON.parse(saved);
        if (state.title) setTitle(state.title);
        if (state.musicPair) setMusicPair(state.musicPair);
        if (state.thumbnailUrl) setThumbnailUrl(state.thumbnailUrl);
        if (state.groupOrder && state.groupClips) {
          setGroupOrder(state.groupOrder);
          setGroupClips(state.groupClips);
        } else if (state.clips) {
          // Legacy: migrate old flat clips to groups.
          const urls = state.clips.map((c) => c.url).filter((u) => u);
          const groups = buildGroups(urls);
          setGroupOrder(groups.map((g) => g.promptId));
          setGroupClips(Object.fromEntries(groups.map((g) => [g.promptId, g.clips])));
        }
      }
    } catch { /* ignore */ }
  }, []);

  const saveState = useCallback(() => {
    const state: ProjectState = { title, clips: [], musicPair, groupOrder, groupClips, thumbnailUrl };
    localStorage.setItem("yt-montagem-state", JSON.stringify(state));
  }, [title, musicPair, groupOrder, groupClips, thumbnailUrl]);

  useEffect(() => {
    saveState();
  }, [title, musicPair, groupOrder, groupClips, thumbnailUrl, saveState]);

  // Sync with Supabase — re-fetch and merge (keeps user ordering, adds new clips).
  const syncClipsFromSupabase = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/thinkdiffusion/list-clips");
      const data = await r.json();
      if (!data.clips) return;
      const horizontal = data.clips
        .filter((c: { name: string }) => c.name.includes("-h-"))
        .map((c: { url: string }) => c.url);
      const fresh = buildGroups(horizontal);
      const freshIds = fresh.map((g) => g.promptId);
      // Preserve existing group order, append new groups at end.
      const mergedOrder = [
        ...groupOrder.filter((id) => freshIds.includes(id)),
        ...freshIds.filter((id) => !groupOrder.includes(id)),
      ];
      // For each group, preserve user order but add new clips and drop deleted.
      const mergedClips: Record<string, string[]> = {};
      for (const g of fresh) {
        const existing = groupClips[g.promptId] || [];
        const freshSet = new Set(g.clips.map(fileNameFromUrl));
        const existingSet = new Set(existing.map(fileNameFromUrl));
        const kept = existing.filter((u) => freshSet.has(fileNameFromUrl(u)));
        const added = g.clips.filter((u) => !existingSet.has(fileNameFromUrl(u)));
        mergedClips[g.promptId] = [...kept, ...added];
      }
      setGroupOrder(mergedOrder);
      setGroupClips(mergedClips);
    } catch { /* ignore */ }
  }, [groupOrder, groupClips]);

  // Music pair URLs
  const [musicUrlA, musicUrlB] = getMusicPairUrls(musicPair);
  const audioRefB = useRef<HTMLAudioElement>(null);

  // When track A ends, play track B, and vice-versa (loop)
  const handleTrackEnd = () => {
    if (currentTrackIndex === 0) {
      setCurrentTrackIndex(1);
      if (audioRefB.current) {
        audioRefB.current.currentTime = 0;
        audioRefB.current.volume = 0.3;
        audioRefB.current.play().catch(() => {});
      }
    } else {
      setCurrentTrackIndex(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Preview controls — double-buffered to avoid load-delay between clips.
  // Buffer A plays clip N, buffer B preloads clip N+1, then swap.
  const getBuffer = (bufIdx: 0 | 1) => (bufIdx === 0 ? videoRefA.current : videoRefB.current);

  const preloadInto = (bufIdx: 0 | 1, url: string | undefined) => {
    const el = getBuffer(bufIdx);
    if (!el) return;
    if (!url) { el.removeAttribute("src"); el.load(); return; }
    if (el.src !== url) {
      el.src = url;
      el.load();
    }
    el.pause();
    el.currentTime = 0;
  };

  const startPreview = () => {
    if (orderedClipUrls.length === 0) return;
    setPreviewing(true);
    setPreviewClipIndex(0);
    setPreviewTime(0);
    setActiveBuffer(0);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {});
    }

    // Buffer 0 = clip 0 (plays), buffer 1 = clip 1 (preload).
    preloadInto(0, orderedClipUrls[0]);
    preloadInto(1, orderedClipUrls[1]);
    const a = getBuffer(0);
    if (a) a.play().catch(() => {});

    startClipTimer(0);
  };

  const stopPreview = () => {
    setPreviewing(false);
    if (timerRef.current) clearInterval(timerRef.current);
    videoRefA.current?.pause();
    videoRefB.current?.pause();
    if (audioRef.current) audioRef.current.pause();
  };

  const startClipTimer = (clipIndex: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setPreviewTime(clipIndex * CLIP_DURATION + elapsed);
    }, 100);
  };

  // Advance when the active clip ends naturally — no setInterval for clip swap.
  const advancePreview = (endedBufIdx: 0 | 1) => {
    const nextIndex = previewClipIndex + 1;
    if (nextIndex >= orderedClipUrls.length) {
      stopPreview();
      return;
    }
    // The buffer that just ended now preloads the clip AFTER next.
    const newActive: 0 | 1 = endedBufIdx === 0 ? 1 : 0;
    const preloadUrl = orderedClipUrls[nextIndex + 1];
    preloadInto(endedBufIdx, preloadUrl);

    setActiveBuffer(newActive);
    setPreviewClipIndex(nextIndex);

    const cur = getBuffer(newActive);
    if (cur) {
      cur.currentTime = 0;
      cur.play().catch(() => {});
    }
    startClipTimer(nextIndex);
  };

  const filledClips = orderedClipUrls.length;

  // Render MP4 via Shotstack
  const startRender = async () => {
    const validClips = orderedClipUrls.filter((u) => u && u.trim().length > 0);
    if (validClips.length === 0) return;

    setRendering(true);
    setRenderProgress(0);
    setRenderLabel("A iniciar...");
    setRenderResult(null);
    setRenderError(null);

    try {
      const res = await fetch("/api/admin/youtube/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          uniqueClips: validClips,
          targetDuration: VIDEO_DURATION,
          musicUrls: [musicUrlA, musicUrlB],
          musicVolume: 0.8,
          clipDuration: CLIP_DURATION,
          thumbnailUrl: thumbnailUrl || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ erro: `HTTP ${res.status}` }));
        throw new Error(err.erro || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Sem stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "progress") {
              setRenderProgress(event.percent);
              setRenderLabel(event.label);
            } else if (event.type === "result") {
              setRenderResult(event.videoUrl);
              setRenderLabel("Video pronto!");
              setRenderProgress(100);
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : String(err));
    } finally {
      setRendering(false);
    }
  };

  // Download project JSON
  const downloadProject = () => {
    const project = {
      title,
      specs: {
        duration: VIDEO_DURATION,
        uniqueClips: filledClips,
        totalClips: TOTAL_CLIPS_NEEDED,
        clipDuration: CLIP_DURATION,
      },
      music: {
        pair: musicPair,
        urlA: musicUrlA,
        urlB: musicUrlB,
        album: "ancient-ground",
        loop: "A → B → A → B...",
      },
      thumbnail: thumbnailUrl || null,
      groups: groupOrder.map((pid) => ({
        promptId: pid,
        clips: groupClips[pid] || [],
      })),
      clips: orderedClipUrls,
    };

    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "video"}-project.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset project
  const resetProject = () => {
    if (!confirm("Limpar tudo e começar de novo?")) return;
    setTitle("");
    setGroupOrder([]);
    setGroupClips({});
    setThumbnailUrl("");
    setMusicPair(1);
    localStorage.removeItem("yt-montagem-state");
  };

  // Group reorder: move group at index from→to
  const moveGroup = (promptId: string, newPosition: number) => {
    setGroupOrder((prev) => {
      const idx = prev.indexOf(promptId);
      if (idx < 0 || newPosition < 0 || newPosition >= prev.length) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      next.splice(newPosition, 0, promptId);
      return next;
    });
  };

  // Intra-group swap: move clip at URL to a new position within its group
  const moveClipInGroup = (promptId: string, clipUrl: string, newPosition: number) => {
    setGroupClips((prev) => {
      const current = prev[promptId] || [];
      const idx = current.indexOf(clipUrl);
      if (idx < 0 || newPosition < 0 || newPosition >= current.length) return prev;
      const next = [...current];
      next.splice(idx, 1);
      next.splice(newPosition, 0, clipUrl);
      return { ...prev, [promptId]: next };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-escola-creme">
          Montagem YouTube
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-escola-creme-50">
            {filledClips} clips únicos → {VIDEO_DURATION / 60} min (1h)
          </span>
          <button
            onClick={resetProject}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* ── 1. TITULO ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          1. Vídeo
        </h3>
        <select
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
        >
          <option value="">Selecciona o vídeo...</option>
          {(videoPlan as Array<{id: string; titulo: string; categorias: string[]}>).map((v) => (
            <option key={v.id} value={v.titulo}>
              {v.id.replace("video-", "#")} — {v.titulo} ({v.categorias.join(" + ")})
            </option>
          ))}
        </select>
      </section>

      {/* ── 2. MUSICA ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          2. Música — Ancient Ground (Loranne)
        </h3>
        <p className="mb-2 text-xs text-escola-creme-50">
          Cada par = 2 faixas do mesmo prompt que fazem loop contínuo.
        </p>
        <div className="flex items-center gap-3">
          <select
            value={musicPair}
            onChange={(e) => { setMusicPair(Number(e.target.value)); setCurrentTrackIndex(0); }}
            className="rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
          >
            {Array.from({ length: TOTAL_MUSIC_PAIRS }, (_, i) => {
              const a = (i * 2 + 1).toString().padStart(2, "0");
              const b = (i * 2 + 2).toString().padStart(2, "0");
              return (
                <option key={i + 1} value={i + 1}>
                  Par {i + 1} — Faixas {a} + {b}
                </option>
              );
            })}
          </select>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${currentTrackIndex === 0 ? "text-escola-coral" : "text-escola-creme-50"}`}>A</span>
            <audio
              ref={audioRef}
              src={musicUrlA}
              controls
              onEnded={handleTrackEnd}
              className="h-8 flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${currentTrackIndex === 1 ? "text-escola-coral" : "text-escola-creme-50"}`}>B</span>
            <audio
              ref={audioRefB}
              src={musicUrlB}
              controls
              onEnded={handleTrackEnd}
              className="h-8 flex-1"
            />
          </div>
        </div>
      </section>

      {/* ── 3. CLIPS POR GRUPO ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            3. Clips por grupo ({groupOrder.length} grupos · {filledClips} clips · {Math.floor(filledClips * CLIP_DURATION / 60)}:{String((filledClips * CLIP_DURATION) % 60).padStart(2, "0")})
          </h3>
          <button
            onClick={syncClipsFromSupabase}
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            Sincronizar Supabase
          </button>
        </div>

        <p className="mb-3 text-xs text-escola-creme-50">
          Dropdown <b>esquerdo (grupo)</b> = posição do grupo na sequência dos 15 grupos.
          Dropdown <b>direito (variação)</b> = ordem dos 4 clips dentro do grupo.
        </p>

        <div className="space-y-4">
          {groupOrder.map((promptId, gIdx) => {
            const clipsInGroup = groupClips[promptId] || [];
            return (
              <div key={promptId} className="rounded border border-escola-border bg-escola-bg p-3">
                <div className="mb-2 flex items-center gap-2">
                  <select
                    value={gIdx}
                    onChange={(e) => moveGroup(promptId, Number(e.target.value))}
                    className="rounded bg-escola-coral px-2 py-0.5 text-xs font-bold text-white border-none cursor-pointer"
                  >
                    {groupOrder.map((_, n) => (
                      <option key={n} value={n}>Grupo {n + 1}</option>
                    ))}
                  </select>
                  <span className="text-xs font-semibold text-escola-creme">{promptId}</span>
                  <span className="text-xs text-escola-creme-50">({clipsInGroup.length} clips)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {clipsInGroup.map((url, cIdx) => {
                    const fileName = fileNameFromUrl(url).replace(/\.mp4(\.mp4)?$/i, "");
                    return (
                      <div key={url} className="space-y-1">
                        <div className="relative aspect-video overflow-hidden rounded border border-green-800/50">
                          <video src={url} className="h-full w-full object-cover" muted playsInline
                            onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                            onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                          />
                          <select
                            value={cIdx}
                            onChange={(e) => moveClipInGroup(promptId, url, Number(e.target.value))}
                            className="absolute top-1 left-1 rounded bg-black/80 px-1 text-xs text-white border-none cursor-pointer"
                          >
                            {clipsInGroup.map((_, n) => (
                              <option key={n} value={n}>{n + 1}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-xs text-green-300 truncate">{fileName}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {groupOrder.length === 0 && (
            <p className="text-sm text-escola-creme-50">
              Sem clips carregados. Clica em &quot;Sincronizar Supabase&quot; acima.
            </p>
          )}
        </div>
      </section>

      {/* ── 3B. THUMBNAIL ── */}
      <ThumbnailSection thumbnailUrl={thumbnailUrl} onSelect={setThumbnailUrl} />


      {/* ── 4. PREVIEW ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          4. Preview
        </h3>

        <div className="relative aspect-video w-full overflow-hidden rounded bg-black">
          <video
            ref={videoRefA}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-75"
            style={{ opacity: activeBuffer === 0 ? 1 : 0 }}
            muted
            playsInline
            preload="auto"
            onEnded={() => advancePreview(0)}
          />
          <video
            ref={videoRefB}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-75"
            style={{ opacity: activeBuffer === 1 ? 1 : 0 }}
            muted
            playsInline
            preload="auto"
            onEnded={() => advancePreview(1)}
          />

          {previewing && (
            <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
              Clip {previewClipIndex + 1}/{orderedClipUrls.length} —{" "}
              {Math.floor(previewTime / 60)}:
              {String(Math.floor(previewTime % 60)).padStart(2, "0")}
            </div>
          )}

          {!previewing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-escola-creme-50">
                {filledClips === 0
                  ? "Adiciona clips acima para ver o preview"
                  : `${filledClips} clips prontos — clica Play`}
              </p>
            </div>
          )}
        </div>

        {previewing && (
          <div className="mt-2 h-1.5 w-full rounded-full bg-escola-border">
            <div
              className="h-full rounded-full bg-escola-coral transition-all"
              style={{ width: `${(previewTime / VIDEO_DURATION) * 100}%` }}
            />
          </div>
        )}

        <div className="mt-3 flex gap-2">
          {!previewing ? (
            <button
              onClick={startPreview}
              disabled={filledClips === 0}
              className="rounded bg-escola-coral px-4 py-2 text-sm font-semibold text-white disabled:opacity-30"
            >
              ▶ Play
            </button>
          ) : (
            <button
              onClick={stopPreview}
              className="rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              ⏹ Parar
            </button>
          )}

          <button
            onClick={downloadProject}
            disabled={filledClips === 0}
            className="rounded border border-escola-border px-4 py-2 text-sm text-escola-creme hover:bg-escola-border/30 disabled:opacity-30"
          >
            Guardar projecto (.json)
          </button>
        </div>
      </section>

      {/* ── 5. RENDER MP4 ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          5. Gerar MP4
        </h3>

        <p className="mb-3 text-xs text-escola-creme-50">
          Os {filledClips} clips únicos serão baralhados e repetidos para preencher 1 hora ({TOTAL_CLIPS_NEEDED} clips × {CLIP_DURATION}s).
          Render via Shotstack (cloud). O vídeo fica no Supabase.
        </p>

        {rendering && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs text-escola-creme-50">
              <span>{renderLabel}</span>
              <span>{renderProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-escola-border">
              <div
                className="h-full rounded-full bg-escola-coral transition-all"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
          </div>
        )}

        {renderError && (
          <div className="mb-3 rounded bg-red-950/50 p-2 text-xs text-red-300">
            Erro: {renderError}
          </div>
        )}

        {renderResult && (
          <div className="mb-3 space-y-2">
            <div className="rounded bg-green-950/50 p-2 text-xs text-green-300">
              Video pronto!
            </div>
            <video
              src={renderResult}
              controls
              className="w-full rounded"
            />
            <a
              href={renderResult}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded bg-escola-coral px-4 py-2 text-sm font-semibold text-white"
            >
              Abrir / Descarregar MP4
            </a>
          </div>
        )}

        <button
          onClick={startRender}
          disabled={filledClips === 0 || rendering}
          className="rounded bg-escola-coral px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-30"
        >
          {rendering ? "A renderizar..." : `Gerar MP4 de 1h (${filledClips} clips únicos → ${TOTAL_CLIPS_NEEDED} total)`}
        </button>
      </section>
    </div>
  );
}

// ── Thumbnail picker ─────────────────────────────────────────────────────────

type ImageItem = { name: string; url: string; promptId: string };

function ThumbnailSection({
  thumbnailUrl,
  onSelect,
}: {
  thumbnailUrl: string;
  onSelect: (url: string) => void;
}) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const [expanded, setExpanded] = useState(false);

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/thinkdiffusion/list-images");
      const data = await r.json();
      const onlyH = (data.images || []).filter((i: ImageItem) =>
        i.name.match(/-h-\d+\.\w+$/i)
      );
      onlyH.sort((a: ImageItem, b: ImageItem) => a.name.localeCompare(b.name));
      setImages(onlyH);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (expanded && images.length === 0) loadImages();
  }, [expanded, images.length, loadImages]);

  const uniquePromptIds = Array.from(new Set(images.map((i) => i.promptId))).sort();
  const filtered = filter ? images.filter((i) => i.promptId === filter) : images;

  return (
    <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
          3B. Thumbnail YouTube
        </h3>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-escola-creme-50 hover:text-escola-creme"
        >
          {expanded ? "Fechar" : "Escolher imagem"}
        </button>
      </div>

      {thumbnailUrl && (
        <div className="mt-3 flex items-start gap-3">
          <div className="relative aspect-video w-40 overflow-hidden rounded border border-escola-coral">
            <img src={thumbnailUrl} alt="Thumbnail" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs text-escola-creme">Thumbnail selecionada</p>
            <p className="text-xs text-escola-creme-50 break-all">{fileNameFromUrl(thumbnailUrl)}</p>
            <button
              onClick={() => onSelect("")}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remover
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
            >
              <option value="">Todos ({images.length})</option>
              {uniquePromptIds.map((pid) => (
                <option key={pid} value={pid}>{pid}</option>
              ))}
            </select>
            <button
              onClick={loadImages}
              className="text-xs text-escola-creme-50 hover:text-escola-creme"
            >
              {loading ? "A carregar..." : "Recarregar"}
            </button>
          </div>

          <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-6">
            {filtered.map((img) => (
              <button
                key={img.url}
                onClick={() => { onSelect(img.url); setExpanded(false); }}
                className={`relative aspect-video overflow-hidden rounded border transition ${
                  thumbnailUrl === img.url
                    ? "border-escola-coral ring-2 ring-escola-coral"
                    : "border-escola-border hover:border-escola-coral/60"
                }`}
              >
                <img src={img.url} alt={img.name} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
          {filtered.length === 0 && !loading && (
            <p className="text-xs text-escola-creme-50">Sem imagens.</p>
          )}
        </div>
      )}
    </section>
  );
}
