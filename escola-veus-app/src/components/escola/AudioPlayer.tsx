"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Player de audio da sub-aula — "podcast" para quem anda a pe/cozinhar.
 * Entrega paralela ao video. Carrega apenas sob demanda (botao expande).
 */
export function AudioPlayer({
  courseSlug,
  moduleNumber,
  sublessonLetter,
}: {
  courseSlug: string;
  moduleNumber: number;
  sublessonLetter: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [missing, setMissing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!expanded || url || missing || loading) return;
    setLoading(true);
    fetch(
      `/api/courses/audio?slug=${encodeURIComponent(courseSlug)}&module=${moduleNumber}&sub=${sublessonLetter}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.url) setUrl(d.url);
        else setMissing(true);
      })
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [expanded, url, missing, loading, courseSlug, moduleNumber, sublessonLetter]);

  return (
    <div className="mb-6 rounded-xl border border-escola-border bg-escola-card px-4 py-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
            style={{
              backgroundColor: "rgba(var(--t-primary-rgb), 0.12)",
              color: "var(--t-primary)",
            }}
          >
            ♪
          </span>
          <div>
            <p
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--t-primary)" }}
            >
              Ouvir esta aula
            </p>
            <p className="text-xs text-escola-creme-50">
              Versão áudio para escutar em movimento.
            </p>
          </div>
        </div>
        <span className="text-escola-creme-50">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="mt-3">
          {loading && (
            <p className="text-xs text-escola-creme-50">A carregar…</p>
          )}
          {missing && !loading && (
            <p className="text-xs text-escola-creme-50">
              Áudio em produção, ainda não disponível.
            </p>
          )}
          {url && (
            <audio
              ref={audioRef}
              src={url}
              controls
              preload="metadata"
              className="w-full"
            />
          )}
        </div>
      )}
    </div>
  );
}
