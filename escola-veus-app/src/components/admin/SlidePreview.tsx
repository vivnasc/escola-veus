"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Slide, SlideDeck } from "@/lib/course-slides";
import { getTerritoryTheme } from "@/data/territory-themes";
import { parseEmphasis } from "@/lib/emphasis";
import { renderDiagram, type Diagram } from "@/lib/diagrams";
import { ambientParticles, ambientPresence } from "@/lib/slide-ambient";
import { detectGesto, renderGesto } from "@/lib/slide-gestures";

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
  diagrams,
}: {
  deck: SlideDeck;
  onIndexChange?: (idx: number, slide: Slide) => void;
  onPlayingChange?: (playing: boolean) => void;
  /** Se passado, sincroniza o index interno com este valor (modo controlado). */
  controlledIndex?: number;
  /** Diagramas por slide (chave = índice). Se presente para o slide actual,
   *  renderiza SVG por baixo do texto. */
  diagrams?: Record<string, Diagram>;
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

  // Refs para os callbacks. Evita o loop de re-renders quando o pai passa
  // funções inline como `onIndexChange={(i, s) => setCurrentIdx(i)}` —
  // a referência da função muda a cada render do pai.
  const onIndexChangeRef = useRef(onIndexChange);
  const onPlayingChangeRef = useRef(onPlayingChange);
  useEffect(() => {
    onIndexChangeRef.current = onIndexChange;
  }, [onIndexChange]);
  useEffect(() => {
    onPlayingChangeRef.current = onPlayingChange;
  }, [onPlayingChange]);

  useEffect(() => {
    onIndexChangeRef.current?.(index, slide);
  }, [index, slide]);

  useEffect(() => {
    onPlayingChangeRef.current?.(playing);
  }, [playing]);

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
          style={
            {
              backgroundColor: "#141428",
              color: "#f0ece6",
              animation: "escolaSlideIn 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
              ["--escola-accent" as string]: accent,
            } as React.CSSProperties
          }
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

          {/* Camada ambiente: partículas a flutuar no fundo. Atrás de tudo. */}
          {slide.tipo !== "fecho" && (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ pointerEvents: "none" }}
              dangerouslySetInnerHTML={{ __html: ambientParticles(1920, 1080, accent) }}
            />
          )}

          {/* Presença contemplativa — silhueta que respira. Watermark a 18%. */}
          {slide.tipo === "conteudo" && (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ pointerEvents: "none" }}
              dangerouslySetInnerHTML={{ __html: ambientPresence(accent) }}
            />
          )}

          {/* Fio vertical na margem esquerda (assinatura visual de identidade
              da Escola). Aparece em todos os slides de conteúdo. */}
          {slide.tipo !== "title" && slide.tipo !== "end" && slide.tipo !== "fecho" && (
            <div
              className="absolute"
              style={{
                left: "4%",
                top: "12%",
                bottom: "12%",
                width: "1px",
                backgroundColor: accent,
                opacity: 0.35,
              }}
            />
          )}

          {/* Eco: palavra-mãe do acto anterior em fade muito subtil no canto
              superior direito. Cria continuidade entre actos. */}
          {slide.tipo === "conteudo" && "eco" in slide && slide.eco && (
            <div
              className="absolute right-[6%] top-[6%] text-right"
              style={{ color: accent, fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              <div
                className="text-[10px] uppercase"
                style={{ opacity: 0.4, letterSpacing: "4px" }}
              >
                de antes
              </div>
              <div
                className="font-serif text-base italic"
                style={{ opacity: 0.4 }}
              >
                {slide.eco}
              </div>
            </div>
          )}

          {/* Marca da Escola — assinatura discreta no canto inferior direito,
              acima de uma linha horizontal fina. Aparece em todos os slides
              de conteúdo (não no title/end/fecho). */}
          {slide.tipo !== "title" && slide.tipo !== "end" && slide.tipo !== "fecho" && (
            <div
              className="absolute right-[6%] bottom-[6%]"
              style={{ color: accent, fontFamily: '"Nunito", sans-serif' }}
            >
              <div
                className="ml-auto mb-1 h-px w-12"
                style={{ backgroundColor: accent, opacity: 0.4 }}
              />
              <div
                className="text-[10px] uppercase"
                style={{ opacity: 0.6, letterSpacing: "5px" }}
              >
                Escola dos Véus
              </div>
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
                  className="whitespace-pre-line escola-conteudo"
                >
                  {parseEmphasis(slide.texto, accent, { dividers: true, typewriter: true })}
                </p>
                {diagrams?.[String(index)] && (
                  <div
                    className="mt-8 mx-auto"
                    style={{ maxWidth: "min(90%, 720px)" }}
                    dangerouslySetInnerHTML={{
                      __html: renderDiagram(diagrams[String(index)], accent),
                    }}
                  />
                )}
                {slide.tipo === "conteudo" &&
                  slide.acto === "gesto" &&
                  !diagrams?.[String(index)] &&
                  (() => {
                    const g = detectGesto(slide.texto);
                    return g ? (
                      <div
                        className="mt-6 mx-auto"
                        style={{ width: "180px" }}
                        dangerouslySetInnerHTML={{ __html: renderGesto(g, accent, 180) }}
                      />
                    ) : null;
                  })()}
                {slide.acto === "frase" && (
                  <div
                    className="mx-auto mt-6 h-px w-10"
                    style={{ backgroundColor: accent }}
                  />
                )}
              </div>
            )}

            {slide.tipo === "pull-quote" && (
              <div className="text-center" style={{ maxWidth: "78%" }}>
                <p
                  style={{
                    fontFamily: '"DM Serif Display", Georgia, serif',
                    fontStyle: "italic",
                    fontSize: "clamp(28px, 4.6vw, 64px)",
                    lineHeight: 1.25,
                    color: accent,
                  }}
                >
                  «&nbsp;{parseEmphasis(slide.texto, accent, { typewriter: true })}&nbsp;»
                </p>
              </div>
            )}

            {slide.tipo === "pausa" && (
              <div
                className="flex flex-col items-center justify-center"
                style={{ animation: "escolaPausaBreath 5s ease-in-out infinite" }}
              >
                <svg
                  viewBox="0 0 200 280"
                  width="240"
                  height="336"
                  style={{ opacity: 0.5 }}
                >
                  <g
                    fill="none"
                    stroke={accent}
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx={100} cy={60} r={22} />
                    <path d="M 100 82 L 100 100 M 70 110 Q 100 100 130 110" />
                    <path d="M 70 110 Q 60 160 75 200" />
                    <path d="M 130 110 Q 140 160 125 200" />
                    <path d="M 75 200 Q 100 230 125 200 Q 150 230 130 240 L 70 240 Q 50 230 75 200" />
                    <path d="M 80 130 Q 95 165 100 175 Q 105 165 120 130" />
                  </g>
                </svg>
                <p
                  className="mt-6 text-[10px] uppercase"
                  style={{ color: accent, letterSpacing: "8px", opacity: 0.7 }}
                >
                  respira
                </p>
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
        /* Cada palavra do conteúdo aparece em sequência (typewriter). Sem
           voz a ler, esta animação simula a leitura humana e dá ritmo
           pedagógico ao slide. */
        .escola-word {
          opacity: 0;
          display: inline-block;
          animation: escolaWordIn 0.5s ease-out forwards;
        }
        @keyframes escolaWordIn {
          from { opacity: 0; transform: translateY(4px); filter: blur(3px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes escolaPausaBreath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        /* Capitular (drop cap) na primeira letra de cada bloco de conteúdo:
           letra grande em DM Serif Display na cor de acento, alinhada à
           altura das primeiras 2 linhas. Funciona bem em blocos com 2+
           linhas; em blocos curtos parece só tipografia ornamental. */
        .escola-conteudo::first-letter {
          font-family: "DM Serif Display", Georgia, serif;
          font-size: 2.4em;
          line-height: 0.9;
          float: left;
          margin: 0.05em 0.12em 0 0;
          color: var(--escola-accent);
        }
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
