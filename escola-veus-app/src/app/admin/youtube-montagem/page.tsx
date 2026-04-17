"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://tdytdamtfillqyklgrmb.supabase.co";
const MUSIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/audios/albums/ancient-ground`;
const TOTAL_MUSIC_PAIRS = 50; // 100 faixas em 50 pares (1+2, 3+4, etc.)
const MAX_UNIQUE_CLIPS = 80; // clips unicos que carregas
const CLIP_DURATION = 15; // seconds
const VIDEO_DURATION = 3600; // 1 hour
const TOTAL_CLIPS_NEEDED = VIDEO_DURATION / CLIP_DURATION; // 240 clips (repetidos do set)

// ── Types ────────────────────────────────────────────────────────────────────

type ClipSlot = {
  index: number;
  url: string;
  loaded: boolean;
};

type ProjectState = {
  title: string;
  clips: ClipSlot[];
  musicPair: number;
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

// ── Component ────────────────────────────────────────────────────────────────

export default function YouTubeMontagem() {
  const [title, setTitle] = useState("");
  const [clips, setClips] = useState<ClipSlot[]>(
    Array.from({ length: MAX_UNIQUE_CLIPS }, (_, i) => ({
      index: i,
      url: "",
      loaded: false,
    }))
  );
  const [musicPair, setMusicPair] = useState(1); // pair 1 = faixas 01+02
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // 0 = track A, 1 = track B

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yt-montagem-state");
      if (saved) {
        const state: ProjectState = JSON.parse(saved);
        if (state.title) setTitle(state.title);
        if (state.clips) setClips(state.clips);
        if (state.musicPair) setMusicPair(state.musicPair);
      }
    } catch { /* ignore */ }
  }, []);

  const saveState = useCallback(() => {
    const state: ProjectState = { title, clips, musicPair };
    localStorage.setItem("yt-montagem-state", JSON.stringify(state));
  }, [title, clips, musicPair]);

  useEffect(() => {
    saveState();
  }, [title, clips, musicPair, saveState]);

  // Clip URL update
  const updateClipUrl = (index: number, url: string) => {
    setClips((prev: ClipSlot[]) =>
      prev.map((c: ClipSlot) => (c.index === index ? { ...c, url, loaded: false } : c))
    );
  };

  // Bulk paste clips (one URL per line)
  const handleBulkPaste = (text: string) => {
    const urls = text
      .split("\n")
      .map((u: string) => u.trim())
      .filter((u: string) => u.length > 0);
    setClips((prev: ClipSlot[]) =>
      prev.map((c: ClipSlot, i: number) => ({
        ...c,
        url: urls[i] || c.url,
        loaded: false,
      }))
    );
  };

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

  // Preview controls
  const startPreview = () => {
    setPreviewing(true);
    setPreviewClipIndex(0);
    setPreviewTime(0);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {});
    }

    playClip(0);
  };

  const stopPreview = () => {
    setPreviewing(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (videoRef.current) videoRef.current.pause();
    if (audioRef.current) audioRef.current.pause();
  };

  const playClip = (index: number) => {
    if (index >= MAX_UNIQUE_CLIPS) {
      stopPreview();
      return;
    }

    setPreviewClipIndex(index);

    const clip = clips[index];
    if (videoRef.current && clip.url) {
      videoRef.current.src = clip.url;
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    if (timerRef.current) clearInterval(timerRef.current);
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setPreviewTime(index * CLIP_DURATION + elapsed);
      if (elapsed >= CLIP_DURATION) {
        playClip(index + 1);
      }
    }, 100);
  };

  const filledClips = clips.filter((c: ClipSlot) => c.url.trim().length > 0).length;

  // Render MP4 via Shotstack
  const startRender = async () => {
    const validClips = clips.filter((c: ClipSlot) => c.url.trim().length > 0).map((c: ClipSlot) => c.url.trim());
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
      clips: clips.map((c: ClipSlot) => ({
        index: c.index,
        url: c.url,
      })),
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
    setClips(
      Array.from({ length: MAX_UNIQUE_CLIPS }, (_, i) => ({
        index: i,
        url: "",
        loaded: false,
      }))
    );
    setMusicTrack(1);
    localStorage.removeItem("yt-montagem-state");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-escola-creme">
          Montagem YouTube
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-escola-creme-50">
            até {MAX_UNIQUE_CLIPS} clips únicos → {VIDEO_DURATION / 60} min (1h)
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
          1. Título do vídeo
        </h3>
        <input
          type="text"
          placeholder="Ex: Natureza Moçambique #01 — Oceano Índico"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme placeholder:text-escola-creme-50/40"
        />
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

      {/* ── 3. CLIPS ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            3. Clips Runway ({filledClips}/{MAX_UNIQUE_CLIPS})
          </h3>
          <button
            onClick={() => {
              const text = prompt("Cola os URLs dos 20 clips (um por linha):");
              if (text) handleBulkPaste(text);
            }}
            className="rounded bg-escola-coral/20 px-3 py-1 text-xs text-escola-coral hover:bg-escola-coral/30"
          >
            Colar todos
          </button>
        </div>

        <div className="grid gap-2">
          {clips.map((clip: ClipSlot, i: number) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded border p-2 ${
                clip.url
                  ? "border-green-800/50 bg-green-950/20"
                  : "border-escola-border bg-escola-bg"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-escola-coral/20 text-xs font-bold text-escola-coral">
                {i + 1}
              </span>
              <input
                type="text"
                placeholder={`URL do clip ${i + 1} (Runway MP4)...`}
                value={clip.url}
                onChange={(e) => updateClipUrl(i, e.target.value)}
                className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme placeholder:text-escola-creme-50/40"
              />
              <span className="text-xs text-escola-creme-50 tabular-nums">
                {i * CLIP_DURATION}–{(i + 1) * CLIP_DURATION}s
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. PREVIEW ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          4. Preview
        </h3>

        <div className="relative aspect-video w-full overflow-hidden rounded bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            playsInline
          />

          {previewing && (
            <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
              Clip {previewClipIndex + 1}/{MAX_UNIQUE_CLIPS} —{" "}
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
