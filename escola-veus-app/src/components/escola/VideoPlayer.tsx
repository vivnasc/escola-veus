"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type VideoPlayerProps = {
  courseSlug: string;
  moduleNumber: number;
  sublessonLetter: string;
  onComplete?: () => void;
  fallbackDescription?: string;
};

export function VideoPlayer({
  courseSlug,
  moduleNumber,
  sublessonLetter,
  onComplete,
  fallbackDescription,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [completeFired, setCompleteFired] = useState(false);

  // Fetch signed URL
  useEffect(() => {
    async function fetchUrl() {
      try {
        const res = await fetch(
          `/api/courses/lesson?slug=${courseSlug}&module=${moduleNumber}&sub=${sublessonLetter}`
        );
        const data = await res.json();
        if (data.url) {
          setVideoUrl(data.url);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchUrl();
  }, [courseSlug, moduleNumber, sublessonLetter]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = v.currentTime / v.duration;
    setProgress(pct);
    setCurrentTime(v.currentTime);

    // Auto-complete at 90%
    if (pct >= 0.9 && !completeFired && onComplete) {
      setCompleteFired(true);
      onComplete();
    }
  }, [completeFired, onComplete]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // No video available — show territory fallback
  if (!loading && !videoUrl) {
    return (
      <div className="relative mb-6 flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-[var(--t-primary,#C9A96E)]/20 bg-escola-card">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-escola-bg/80" />
        <div className="relative z-10 px-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--t-primary,#C9A96E)]/30 bg-escola-bg/60">
            <svg
              className="h-6 w-6"
              style={{ color: "var(--t-primary, #C9A96E)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p
            className="font-serif text-sm italic"
            style={{ color: "var(--t-primary, #C9A96E)" }}
          >
            Em producao
          </p>
          {fallbackDescription && (
            <p className="mt-2 text-xs leading-relaxed text-escola-creme-50">
              {fallbackDescription}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mb-6 flex aspect-video items-center justify-center rounded-xl border border-escola-border bg-escola-card">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--t-primary, #C9A96E)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="group relative mb-6 overflow-hidden rounded-xl border border-escola-border bg-black">
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl!}
        className="aspect-video w-full cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          if (!completeFired && onComplete) {
            setCompleteFired(true);
            onComplete();
          }
        }}
        playsInline
        preload="metadata"
      />

      {/* Play overlay (when paused) */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm"
          >
            <svg
              className="ml-1 h-8 w-8"
              style={{ color: "var(--t-primary, #C9A96E)" }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </button>
      )}

      {/* Controls bar */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent px-3 pt-6 pb-3 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Progress bar */}
        <div
          className="mb-2 h-1 cursor-pointer rounded-full bg-white/20"
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: "var(--t-primary, #C9A96E)",
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white/80 hover:text-white">
            {playing ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Time */}
          <span className="text-xs text-white/60">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Fullscreen */}
          <button
            onClick={() => videoRef.current?.requestFullscreen?.()}
            className="text-white/60 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
