"use client";

import { useCallback, useEffect, useState } from "react";
import type { Slide, SlideDeck } from "@/lib/course-slides";
import { getTerritoryTheme } from "@/data/territory-themes";

// Injecta DM Serif Display + Nunito uma unica vez (Cormorant ja esta global).
function useSlideFonts() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "escola-slide-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Nunito:wght@400;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

/**
 * Preview do video-aula em Mock B:
 *   - Fundo preto puro #0d0d0d, sem gradientes, sem grain, sem particulas.
 *   - Cor do curso (territory-themes) apenas no label de acto e no
 *     fio-de-acento por baixo das frases-chave.
 *   - Tipografia distinta por acto (Cormorant / DM Serif / Nunito).
 *   - Labels "I · PERGUNTA" sempre no canto superior esquerdo.
 *   - Rodape discreto: "CURSO · M<N> · <LETRA> · <TITULO>".
 *   - Transicoes: fade simples.
 *
 * Controlos: anterior / proximo / ecra cheio / play (auto-advance pela
 * duracao definida em cada slide).
 */
export function SlidePreview({
  deck,
  onIndexChange,
  onPlayingChange,
}: {
  deck: SlideDeck;
  onIndexChange?: (idx: number, slide: Slide) => void;
  onPlayingChange?: (playing: boolean) => void;
}) {
  useSlideFonts();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const theme = getTerritoryTheme(deck.courseSlug);
  const accent = theme?.primary ?? "#C9A96E";

  // Reset se o deck mudou (menos slides por exemplo).
  useEffect(() => {
    if (index >= deck.slides.length) setIndex(Math.max(0, deck.slides.length - 1));
  }, [deck.slides.length, index]);

  const slide = deck.slides[index];

  useEffect(() => {
    onIndexChange?.(index, slide);
  }, [index, slide, onIndexChange]);

  useEffect(() => {
    onPlayingChange?.(playing);
  }, [playing, onPlayingChange]);

  const next = useCallback(() => {
    setIndex((i) => Math.min(deck.slides.length - 1, i + 1));
  }, [deck.slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (index >= deck.slides.length - 1) {
      setPlaying(false);
      return;
    }
    const ms = slide.duracao * 1000;
    const t = setTimeout(() => setIndex((i) => i + 1), ms);
    return () => clearTimeout(t);
  }, [playing, index, slide, deck.slides.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        if (fullscreen) setFullscreen(false);
        if (playing) setPlaying(false);
      } else if (e.key === "f") {
        setFullscreen((f) => !f);
      } else if (e.key === "p") {
        setPlaying((p) => !p);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, fullscreen, playing]);

  const footer =
    slide.tipo === "title" || slide.tipo === "end" || slide.tipo === "fecho"
      ? ""
      : `${deck.courseTitle.toUpperCase()} · M${deck.moduleNumber} · ${deck.subLetter} · ${deck.subTitle.toUpperCase()}`;

  const showActoLabel =
    slide.tipo === "acto-marker" || slide.tipo === "conteudo";

  return (
    <div className="flex flex-col gap-4">
      <div
        className={
          fullscreen
            ? "fixed inset-0 z-50 bg-black"
            : "relative mx-auto aspect-video w-full max-w-[1280px] overflow-hidden rounded-lg border border-escola-border"
        }
      >
        {/* Stage 1920x1080 em container responsive */}
        <div
          key={index}
          className="relative h-full w-full overflow-hidden"
          style={{
            backgroundColor: "#0d0d0d",
            color: "#f0ece6",
            animation: "escolaFadeIn 0.5s ease-out",
          }}
        >
          {/* Label do acto — canto superior esquerdo */}
          {showActoLabel && "romano" in slide && (
            <div
              className="absolute left-[6%] top-[6%] text-[11px] font-medium uppercase"
              style={{ color: accent, letterSpacing: "3px" }}
            >
              {slide.romano} · {slide.label}
            </div>
          )}

          {/* Corpo principal */}
          <div className="absolute inset-0 flex items-center justify-center px-[10%]">
            {slide.tipo === "title" && (
              <div className="text-center">
                <p
                  className="mb-5 text-[11px] uppercase"
                  style={{ color: accent, letterSpacing: "3px" }}
                >
                  {slide.subtexto.toUpperCase()}
                </p>
                <h1
                  style={{
                    fontFamily: '"DM Serif Display", Georgia, serif',
                    fontSize: "clamp(36px, 6vw, 64px)",
                    lineHeight: 1.2,
                  }}
                >
                  {slide.texto}
                </h1>
                <div
                  className="mx-auto mt-8 h-px w-10"
                  style={{ backgroundColor: accent }}
                />
              </div>
            )}

            {slide.tipo === "acto-marker" && (
              <div className="text-center">
                <div
                  style={{
                    fontFamily: '"DM Serif Display", Georgia, serif',
                    fontSize: "clamp(100px, 14vw, 180px)",
                    lineHeight: 1,
                    color: "#f0ece6",
                  }}
                >
                  {slide.romano}
                </div>
                <p
                  className="mt-4 text-[10px] uppercase"
                  style={{ color: accent, letterSpacing: "4px" }}
                >
                  {slide.label}
                </p>
              </div>
            )}

            {slide.tipo === "conteudo" && (
              <div className={slide.acto === "frase" ? "text-center" : "text-left"} style={{ maxWidth: "80%" }}>
                <p
                  style={contentStyleFor(slide.acto)}
                  className="whitespace-pre-line"
                >
                  {slide.texto}
                </p>
                {slide.acto === "frase" && (
                  <div
                    className="mx-auto mt-6 h-px w-10"
                    style={{ backgroundColor: accent }}
                  />
                )}
              </div>
            )}

            {slide.tipo === "fecho" && null}

            {slide.tipo === "end" && (
              <div className="text-center">
                <p
                  style={{
                    fontFamily: '"DM Serif Display", Georgia, serif',
                    fontSize: "clamp(32px, 5vw, 52px)",
                  }}
                >
                  {slide.texto}
                </p>
                <p
                  className="mt-3 text-[11px]"
                  style={{
                    fontFamily: '"Nunito", sans-serif',
                    color: "#6a6460",
                    letterSpacing: "2px",
                  }}
                >
                  {slide.subtexto}
                </p>
              </div>
            )}
          </div>

          {/* Rodape */}
          {footer && (
            <div
              className="absolute bottom-[4%] left-0 right-0 text-center text-[9px]"
              style={{
                color: "#6a6460",
                letterSpacing: "2px",
                fontFamily: '"Nunito", sans-serif',
                opacity: 0.6,
              }}
            >
              {footer}
            </div>
          )}
        </div>

        {fullscreen && (
          <button
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 z-10 rounded bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
          >
            Esc
          </button>
        )}
      </div>

      {/* Controlos */}
      {!fullscreen && (
        <div className="flex items-center justify-center gap-2 text-xs">
          <button
            onClick={prev}
            disabled={index === 0}
            className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-escola-creme hover:border-escola-dourado/40 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="min-w-[90px] text-center text-escola-creme-50">
            {index + 1} / {deck.slides.length} · {slide.duracao}s
          </span>
          <button
            onClick={next}
            disabled={index === deck.slides.length - 1}
            className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-escola-creme hover:border-escola-dourado/40 disabled:opacity-40"
          >
            Próximo →
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className={`rounded border px-3 py-1.5 ${
              playing
                ? "border-escola-dourado bg-escola-dourado text-escola-bg"
                : "border-escola-border bg-escola-card text-escola-creme hover:border-escola-dourado/40"
            }`}
          >
            {playing ? "⏸ Pausa" : "▶ Play"}
          </button>
          <button
            onClick={() => setFullscreen(true)}
            className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-escola-creme hover:border-escola-dourado/40"
          >
            Ecrã cheio
          </button>
        </div>
      )}

      <p className="text-center text-[10px] text-escola-creme-50">
        Teclas: ← → navegação · F ecrã cheio · P play · Esc sair · Total{" "}
        {Math.floor(deck.totalDurationSec / 60)}:
        {String(deck.totalDurationSec % 60).padStart(2, "0")}
      </p>

      <style>{`
        @keyframes escolaFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function contentStyleFor(acto: string): React.CSSProperties {
  switch (acto) {
    case "pergunta":
      return {
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontStyle: "italic",
        fontSize: "clamp(26px, 4vw, 48px)",
        fontWeight: 500,
        lineHeight: 1.35,
        textAlign: "center",
      };
    case "situacao":
      return {
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontSize: "clamp(20px, 2.4vw, 32px)",
        fontWeight: 400,
        lineHeight: 1.55,
      };
    case "revelacao":
      return {
        fontFamily: '"DM Serif Display", Georgia, serif',
        fontSize: "clamp(22px, 2.8vw, 38px)",
        fontWeight: 400,
        lineHeight: 1.4,
        textAlign: "center",
      };
    case "gesto":
      return {
        fontFamily: '"Nunito", sans-serif',
        fontSize: "clamp(18px, 2.2vw, 28px)",
        fontWeight: 400,
        lineHeight: 1.7,
      };
    case "frase":
      return {
        fontFamily: '"DM Serif Display", Georgia, serif',
        fontSize: "clamp(32px, 5vw, 64px)",
        fontWeight: 400,
        lineHeight: 1.25,
        textAlign: "center",
      };
    default:
      return {};
  }
}
