"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { NOMEAR_PRESETS, type NomearScript } from "@/data/nomear-scripts";

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
  file?: File;
  loaded: boolean;
};

type TextSegment = {
  clipIndex: number;
  text: string;
  startSec: number;
  endSec: number;
};

type ProjectState = {
  episodeId: string;
  clips: ClipSlot[];
  musicTrack: number;
  textSegments: TextSegment[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getAllYouTubeScripts(): NomearScript[] {
  const scripts: NomearScript[] = [];
  for (const preset of NOMEAR_PRESETS) {
    if (preset.id.startsWith("nomear-serie-")) {
      for (const s of preset.scripts) {
        scripts.push(s);
      }
    }
  }
  return scripts;
}

function splitTextIntoSegments(texto: string, numClips: number): TextSegment[] {
  // Remove ElevenLabs tags and CTA
  let clean = texto
    .replace(/\[pause\]/gi, "")
    .replace(/\[short pause\]/gi, "")
    .replace(/\[long pause\]/gi, "")
    .replace(/\[calm\]/gi, "")
    .replace(/\[thoughtful\]/gi, "")
    .replace(/Escola dos Véus\.\s*seteveus\.space\.?/gi, "")
    .replace(/Se isto te nomeou alguma coisa[.\s\S]*$/gi, "")
    .trim();

  // Split into paragraphs
  const paragraphs = clean
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Distribute paragraphs across clips
  const segments: TextSegment[] = [];
  const parasPerClip = Math.max(1, Math.ceil(paragraphs.length / numClips));

  for (let i = 0; i < numClips; i++) {
    const start = i * parasPerClip;
    const end = Math.min(start + parasPerClip, paragraphs.length);
    const clipParas = paragraphs.slice(start, end);

    if (clipParas.length > 0) {
      segments.push({
        clipIndex: i,
        text: clipParas.join("\n\n"),
        startSec: i * CLIP_DURATION + 2,
        endSec: (i + 1) * CLIP_DURATION - 1,
      });
    }
  }

  return segments;
}

function getMusicUrl(trackNum: number): string {
  const padded = String(trackNum).padStart(2, "0");
  return `${MUSIC_BASE}/faixa-${padded}.mp3`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function YouTubeMontagem() {
  const allScripts = getAllYouTubeScripts();

  // State
  const [selectedEpisode, setSelectedEpisode] = useState("");
  const [script, setScript] = useState<NomearScript | null>(null);
  const [clips, setClips] = useState<ClipSlot[]>(
    Array.from({ length: CLIPS_PER_VIDEO }, (_, i) => ({
      index: i,
      url: "",
      loaded: false,
    }))
  );
  const [musicTrack, setMusicTrack] = useState(1);
  const [textSegments, setTextSegments] = useState<TextSegment[]>([]);

  // Preview
  const [previewing, setPreviewing] = useState(false);
  const [previewClipIndex, setPreviewClipIndex] = useState(0);
  const [previewTime, setPreviewTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load/save from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yt-montagem-state");
      if (saved) {
        const state: ProjectState = JSON.parse(saved);
        if (state.episodeId) {
          setSelectedEpisode(state.episodeId);
          const found = allScripts.find((s) => s.id === state.episodeId);
          if (found) {
            setScript(found);
            setTextSegments(state.textSegments || splitTextIntoSegments(found.texto, CLIPS_PER_VIDEO));
          }
        }
        if (state.clips) setClips(state.clips);
        if (state.musicTrack) setMusicTrack(state.musicTrack);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveState = useCallback(() => {
    const state: ProjectState = {
      episodeId: selectedEpisode,
      clips,
      musicTrack,
      textSegments,
    };
    localStorage.setItem("yt-montagem-state", JSON.stringify(state));
  }, [selectedEpisode, clips, musicTrack, textSegments]);

  useEffect(() => {
    if (selectedEpisode) saveState();
  }, [selectedEpisode, clips, musicTrack, textSegments, saveState]);

  // Episode selection
  const handleEpisodeChange = (id: string) => {
    setSelectedEpisode(id);
    const found = allScripts.find((s) => s.id === id);
    if (found) {
      setScript(found);
      setTextSegments(splitTextIntoSegments(found.texto, CLIPS_PER_VIDEO));
    }
  };

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

    // Auto-advance after CLIP_DURATION
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

  // Current text overlay for preview
  const currentText = textSegments.find(
    (seg: TextSegment) =>
      previewTime >= seg.startSec && previewTime <= seg.endSec
  );

  // Filled clips count
  const filledClips = clips.filter((c: ClipSlot) => c.url.trim().length > 0).length;

  // Download project JSON
  const downloadProject = () => {
    const project = {
      episode: selectedEpisode,
      script: script?.titulo,
      curso: script?.curso,
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
      clips: clips.map((c) => ({
        index: c.index,
        url: c.url,
      })),
      textSegments,
      scriptFull: script?.texto,
    };

    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedEpisode}-project.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-escola-creme">
          Montagem YouTube
        </h2>
        <span className="text-xs text-escola-creme-50">
          {CLIPS_PER_VIDEO} clips × {CLIP_DURATION}s = {VIDEO_DURATION / 60} min
        </span>
      </div>

      {/* ── 1. EPISODIO ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          1. Episódio
        </h3>
        <select
          value={selectedEpisode}
          onChange={(e) => handleEpisodeChange(e.target.value)}
          className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
        >
          <option value="">Escolher episódio...</option>
          {allScripts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} — {s.titulo} ({s.curso})
            </option>
          ))}
        </select>

        {script && (
          <div className="mt-3 rounded bg-escola-bg p-3">
            <p className="mb-1 text-xs text-escola-coral">{script.curso}</p>
            <p className="text-sm font-semibold text-escola-creme">{script.titulo}</p>
            <p className="mt-2 max-h-32 overflow-y-auto text-xs leading-relaxed text-escola-creme-50 whitespace-pre-line">
              {script.texto.slice(0, 500)}...
            </p>
            <p className="mt-1 text-xs text-escola-creme-50">
              {textSegments.length} blocos de texto distribuídos por {CLIPS_PER_VIDEO} clips
            </p>
          </div>
        )}
      </section>

      {/* ── 2. MUSICA ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          2. Música — Ancient Ground
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
        <p className="mt-1 text-xs text-escola-creme-50">
          {getMusicUrl(musicTrack)}
        </p>
      </section>

      {/* ── 3. CLIPS ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            3. Clips Runway ({filledClips}/{CLIPS_PER_VIDEO})
          </h3>
          <button
            onClick={() => {
              const text = prompt("Cola os URLs dos clips (um por linha):");
              if (text) handleBulkPaste(text);
            }}
            className="rounded bg-escola-coral/20 px-3 py-1 text-xs text-escola-coral hover:bg-escola-coral/30"
          >
            Colar todos
          </button>
        </div>

        <div className="grid gap-2">
          {clips.map((clip, i) => {
            const seg = textSegments.find((s) => s.clipIndex === i);
            return (
              <div
                key={i}
                className={`flex items-start gap-2 rounded border p-2 ${
                  clip.url
                    ? "border-green-800/50 bg-green-950/20"
                    : "border-escola-border bg-escola-bg"
                }`}
              >
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-escola-coral/20 text-xs font-bold text-escola-coral">
                  {i + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    placeholder={`URL do clip ${i + 1} (Runway MP4)...`}
                    value={clip.url}
                    onChange={(e) => updateClipUrl(i, e.target.value)}
                    className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme placeholder:text-escola-creme-50/40"
                  />
                  {seg && (
                    <p className="text-xs leading-snug text-escola-creme-50/70 italic">
                      &ldquo;{seg.text.slice(0, 80)}{seg.text.length > 80 ? "..." : ""}&rdquo;
                    </p>
                  )}
                </div>
                <span className="mt-1 text-xs text-escola-creme-50">
                  {i * CLIP_DURATION}–{(i + 1) * CLIP_DURATION}s
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. PREVIEW ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          4. Preview
        </h3>

        <div className="relative aspect-video w-full overflow-hidden rounded bg-black">
          {/* Video player */}
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            playsInline
          />

          {/* Text overlay */}
          {previewing && currentText && (
            <div className="absolute inset-0 flex items-center justify-center px-[15%]">
              <div className="text-center">
                <p
                  className="font-serif text-2xl leading-relaxed text-[#f0ece6] drop-shadow-[0_2px_20px_rgba(0,0,0,0.7)]"
                  style={{ textShadow: "0 2px 20px rgba(0,0,0,0.7)" }}
                >
                  {currentText.text}
                </p>
              </div>
            </div>
          )}

          {/* Clip indicator */}
          {previewing && (
            <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
              Clip {previewClipIndex + 1}/{CLIPS_PER_VIDEO} —{" "}
              {Math.floor(previewTime / 60)}:
              {String(Math.floor(previewTime % 60)).padStart(2, "0")}
            </div>
          )}

          {/* Play overlay */}
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

        {/* Progress bar */}
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
              ▶ Play Preview
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
            disabled={!selectedEpisode}
            className="rounded border border-escola-border px-4 py-2 text-sm text-escola-creme hover:bg-escola-border/30 disabled:opacity-30"
          >
            Guardar projecto (.json)
          </button>
        </div>
      </section>

      {/* ── 5. TEXT SEGMENTS (editable) ── */}
      {textSegments.length > 0 && (
        <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
            5. Texto por clip (editável)
          </h3>
          <div className="space-y-2">
            {textSegments.map((seg, i) => (
              <div key={i} className="flex gap-2">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-escola-roxo/20 text-xs font-bold text-escola-roxo">
                  {seg.clipIndex + 1}
                </span>
                <textarea
                  value={seg.text}
                  onChange={(e) => {
                    const newSegs = [...textSegments];
                    newSegs[i] = { ...newSegs[i], text: e.target.value };
                    setTextSegments(newSegs);
                  }}
                  rows={2}
                  className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
