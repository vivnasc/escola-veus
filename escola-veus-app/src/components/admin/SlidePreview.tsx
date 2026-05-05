"use client";

import { useCallback, useEffect, useState } from "react";
import type { Slide, SlideDeck } from "@/lib/course-slides";
import { getTerritoryTheme } from "@/data/territory-themes";
import { parseEmphasis } from "@/lib/emphasis";

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
  controlledIndex,
}: {
  deck: SlideDeck;
  onIndexChange?: (idx: number, slide: Slide) => void;
  onPlayingChange?: (playing: boolean) => void;
  /** Se passado, sincroniza o index interno com este valor (modo controlado). */
  controlledIndex?: number;
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

  // Sincroniza com index controlado (clique na tira de slides).
  useEffect(() => {
    if (typeof controlledIndex === "number" && controlledIndex !== index) {
      setIndex(Math.max(0, Math.min(deck.slides.length - 1, controlledIndex)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledIndex]);

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
      // Ignorar quando o foco está num campo editável — caso contrário
      // escrever espaço/seta no editor faz o preview saltar de slide.
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      const editable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (t && (t as HTMLElement).isContentEditable);
      if (editable) return;

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
        {/* Stage 1920x1080. Fundo = roxo escuro da Escola (#141428), comum
            a todos os cursos. A variação por curso vive só no `accent`. */}
        <div
          key={index}
          className="relative h-full w-full overflow-hidden"
          style={{
            backgroundColor: "#141428",
            color: "#f0ece6",
            animation: "escolaSlideIn 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Label do acto — canto superior esquerdo */}
          {showActoLabel && "romano" in slide && (
            <div
              className="absolute left-[6%] top-[6%] text-[11px] font-medium uppercase"
              style={{
                color: accent,
                letterSpacing: "3px",
                animation: "escolaLabelIn 0.6s ease-out",
              }}
            >
              {slide.romano} · {slide.label}
            </div>
          )}

          {/* Marca da Escola — assinatura discreta no canto inferior direito.
              Aparece em todos os slides de conteúdo (não no title/end/fecho). */}
          {slide.tipo !== "title" && slide.tipo !== "end" && slide.tipo !== "fecho" && (
            <div
              className="absolute right-[6%] bottom-[6%] text-[10px] uppercase"
              style={{
                color: accent,
                opacity: 0.55,
                letterSpacing: "4px",
                fontFamily: '"Nunito", sans-serif',
              }}
            >
              Escola dos Véus
            </div>
          )}

          {/* Corpo principal */}
          <div
            className="absolute inset-0 flex items-center justify-center px-[10%]"
            style={{ animation: "escolaContentIn 0.8s 0.25s ease-out both" }}
          >
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
              <div className="text-center" style={{ maxWidth: "78%" }}>
                <p
                  style={contentStyleFor(slide.acto, slide.texto.length)}
                  className="whitespace-pre-line"
                >
                  {parseEmphasis(slide.texto, accent)}
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

        {/* Setas de navegação sempre visíveis, dentro e fora do ecrã cheio */}
        <button
          onClick={prev}
          disabled={index === 0}
          aria-label="Slide anterior"
          className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-xl text-white backdrop-blur transition-opacity hover:bg-black/50 disabled:cursor-not-allowed disabled:opacity-20"
        >
          ←
        </button>
        <button
          onClick={next}
          disabled={index >= deck.slides.length - 1}
          aria-label="Próximo slide"
          className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-xl text-white backdrop-blur transition-opacity hover:bg-black/50 disabled:cursor-not-allowed disabled:opacity-20"
        >
          →
        </button>
        <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[11px] text-white backdrop-blur">
          {index + 1} / {deck.slides.length} · {slide.duracao}s
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
        /* Entrada do slide: fade + ligeiro deslize para cima. A curva easeOutExpo
           dá a sensação de pousar suavemente, sem pressa. */
        @keyframes escolaSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* O conteúdo principal entra com um pequeno atraso em cima do stage,
           para o olho primeiro ver o "palco" e depois receber o texto. */
        @keyframes escolaContentIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* O label do acto aparece antes do texto — respiração. */
        @keyframes escolaLabelIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function contentStyleFor(acto: string, charCount: number): React.CSSProperties {
  // UMA tipografia única para todos os actos — coesão visual de curso a
  // curso. A diferenciação entre actos faz-se pelo label (I·PERGUNTA…) e
  // pela cor de acento. Não pelo tamanho da letra.
  //
  // Pergunta usa italic (é pergunta, tem inclinação). Frase final usa um
  // tamanho maior (é o monumento). Tudo o resto: mesmo tamanho regular.
  const scale = charCount > 280 ? 0.85 : charCount > 200 ? 0.92 : 1;
  const baseFont = '"Cormorant Garamond", Georgia, serif';

  if (acto === "frase") {
    return {
      fontFamily: '"DM Serif Display", Georgia, serif',
      fontSize: `clamp(${26 * scale}px, ${3.6 * scale}vw, ${48 * scale}px)`,
      fontWeight: 400,
      lineHeight: 1.3,
      textAlign: "center",
    };
  }

  return {
    fontFamily: baseFont,
    fontStyle: acto === "pergunta" ? "italic" : "normal",
    fontSize: `clamp(${18 * scale}px, ${2.2 * scale}vw, ${30 * scale}px)`,
    fontWeight: 400,
    lineHeight: 1.5,
    textAlign: "center",
  };
}
