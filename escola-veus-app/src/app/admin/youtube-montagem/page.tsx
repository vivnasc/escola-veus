"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://tdytdamtfillqyklgrmb.supabase.co";
const MUSIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/audios/albums/ancient-ground`;
const TOTAL_MUSIC_TRACKS = 100;
const CLIPS_PER_VIDEO = 20;
const CLIP_DURATION = 15; // seconds
const VIDEO_DURATION = CLIPS_PER_VIDEO * CLIP_DURATION; // 300s = 5 min

// ── Types ────────────────────────────────────────────────────────────────────

type ClipSlot = {
  index: number;
  url: string;
  loaded: boolean;
};

type ProjectState = {
  title: string;
  clips: ClipSlot[];
  musicTrack: number;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMusicUrl(trackNum: number): string {
  const padded = String(trackNum).padStart(2, "0");
  return `${MUSIC_BASE}/faixa-${padded}.mp3`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function YouTubeMontagem() {
  const [title, setTitle] = useState("");
  const [clips, setClips] = useState<ClipSlot[]>(
    Array.from({ length: CLIPS_PER_VIDEO }, (_, i) => ({
      index: i,
      url: "",
      loaded: false,
    }))
  );
  const [musicTrack, setMusicTrack] = useState(1);

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
        if (state.musicTrack) setMusicTrack(state.musicTrack);
      }
    } catch { /* ignore */ }
  }, []);

  const saveState = useCallback(() => {
    const state: ProjectState = { title, clips, musicTrack };
    localStorage.setItem("yt-montagem-state", JSON.stringify(state));
  }, [title, clips, musicTrack]);

  useEffect(() => {
    saveState();
  }, [title, clips, musicTrack, saveState]);

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
    if (index >= CLIPS_PER_VIDEO) {
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

  // Download project JSON
  const downloadProject = () => {
    const project = {
      title,
      specs: {
        duration: VIDEO_DURATION,
        clips: CLIPS_PER_VIDEO,
        clipDuration: CLIP_DURATION,
      },
      music: {
        track: musicTrack,
        url: getMusicUrl(musicTrack),
        album: "ancient-ground",
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
      Array.from({ length: CLIPS_PER_VIDEO }, (_, i) => ({
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
            {CLIPS_PER_VIDEO} clips × {CLIP_DURATION}s = {VIDEO_DURATION / 60} min
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
        <div className="flex items-center gap-3">
          <select
            value={musicTrack}
            onChange={(e) => setMusicTrack(Number(e.target.value))}
            className="rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
          >
            {Array.from({ length: TOTAL_MUSIC_TRACKS }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Faixa {String(i + 1).padStart(2, "0")}
              </option>
            ))}
          </select>
          <audio
            ref={audioRef}
            src={getMusicUrl(musicTrack)}
            controls
            className="h-8 flex-1"
          />
        </div>
      </section>

      {/* ── 3. CLIPS ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            3. Clips Runway ({filledClips}/{CLIPS_PER_VIDEO})
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
              Clip {previewClipIndex + 1}/{CLIPS_PER_VIDEO} —{" "}
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
    </div>
  );
}
