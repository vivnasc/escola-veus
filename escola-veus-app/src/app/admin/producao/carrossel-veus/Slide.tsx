"use client";

import { useEffect, useRef } from "react";
import type { Dia, Slide as SlideType } from "./content";

// Paleta exacta da campanha "A Estação dos Véus" (não usa a palette da Escola).
const COLORS = {
  ink: "#1a1a1a",
  ivory: "#f5efe6",
  deep: "#0f1419",
  terracotta: "#b85c38",
  gold: "#c9a961",
  mist: "rgba(245, 239, 230, 0.7)",
};

const W = 1080;
const H = 1920;
const PAD = 120;

type Props = {
  dia: Dia;
  slide: SlideType;
  indice: number;
  scale?: number; // factor de redução para preview (1 = tamanho real)
};

// Slide "real" — sempre renderizado a 1080×1920. O wrapper aplica `transform: scale`
// para preview pequeno (sem perder fidelidade na captura PNG).
export function Slide({ dia, slide, indice, scale = 1 }: Props) {
  const wrapperStyle: React.CSSProperties = {
    width: W * scale,
    height: H * scale,
    overflow: "hidden",
    flexShrink: 0,
  };

  const innerStyle: React.CSSProperties = {
    width: W,
    height: H,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  };

  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>
        <SlideInner dia={dia} slide={slide} indice={indice} />
      </div>
    </div>
  );
}

function SlideInner({ dia, slide, indice }: { dia: Dia; slide: SlideType; indice: number }) {
  if (slide.tipo === "capa") return <Capa dia={dia} slide={slide} />;
  if (slide.tipo === "conteudo") return <Conteudo dia={dia} slide={slide} indice={indice} />;
  return <Cta slide={slide} />;
}

const baseSlide: React.CSSProperties = {
  width: W,
  height: H,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
  fontFamily: '"Inter", system-ui, sans-serif',
  fontFeatureSettings: '"liga", "kern"',
  WebkitFontSmoothing: "antialiased",
  textRendering: "geometricPrecision",
  boxSizing: "border-box",
};

function Capa({ dia, slide }: { dia: Dia; slide: Extract<SlideType, { tipo: "capa" }> }) {
  const veuRef = useRef<HTMLDivElement>(null);

  // auto-fit da palavra-véu para não transbordar (PERMANÊNCIA, etc)
  useEffect(() => {
    const el = veuRef.current;
    if (!el) return;
    const apply = () => {
      const maxWidth = W - 2 * PAD;
      let size = 180;
      el.style.fontSize = `${size}px`;
      let guard = 60;
      while (el.scrollWidth > maxWidth && size > 100 && guard-- > 0) {
        size -= 4;
        el.style.fontSize = `${size}px`;
      }
    };
    if (document.fonts?.ready) {
      document.fonts.ready.then(apply);
    } else {
      apply();
    }
  }, [dia.veu]);

  return (
    <div
      style={{
        ...baseSlide,
        background: COLORS.deep,
        color: COLORS.ivory,
        padding: `200px ${PAD}px 240px`,
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(201, 169, 97, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, position: "relative" }}>
        <div style={{ fontSize: 24, letterSpacing: "0.4em", color: COLORS.gold, textTransform: "uppercase", fontWeight: 300 }}>
          {dia.romano}
        </div>
        <div
          ref={veuRef}
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontWeight: 300,
            fontSize: 180,
            lineHeight: 0.95,
            textAlign: "center",
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}
        >
          {dia.veu}
        </div>
        <div
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 36,
            color: COLORS.mist,
            textAlign: "center",
            maxWidth: 720,
            lineHeight: 1.3,
          }}
        >
          {dia.subtitulo}
        </div>
      </div>
      <div
        style={{
          fontWeight: 300,
          fontSize: 42,
          lineHeight: 1.5,
          textAlign: "center",
          maxWidth: 800,
          position: "relative",
        }}
      >
        <div>{slide.linha1}</div>
        <div>{slide.linha2}</div>
      </div>
      <div
        style={{
          fontSize: 22,
          letterSpacing: "0.4em",
          color: COLORS.gold,
          textTransform: "uppercase",
          fontWeight: 300,
          position: "relative",
        }}
      >
        os sete véus
      </div>
    </div>
  );
}

function Conteudo({
  dia,
  slide,
  indice,
}: {
  dia: Dia;
  slide: Extract<SlideType, { tipo: "conteudo" }>;
  indice: number;
}) {
  const numeroSlide = String(indice + 1).padStart(2, "0");
  const indicador = `${numeroSlide} · ${dia.romano.split(" ")[0]}`;
  const ePoetico = slide.estilo === "poetico";
  const textoLongo = slide.texto && slide.texto.length > 180;

  return (
    <div
      style={{
        ...baseSlide,
        background: COLORS.ivory,
        color: COLORS.ink,
        padding: `100px ${PAD}px 100px`,
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontSize: 22, letterSpacing: "0.3em", color: "rgba(26,26,26,0.4)", textTransform: "uppercase", fontWeight: 300 }}>
        {indicador}
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: 800,
          textAlign: "center",
          margin: "0 auto",
        }}
      >
        {slide.titulo && (
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: COLORS.terracotta,
              marginBottom: 56,
            }}
          >
            {slide.titulo}
          </div>
        )}
        <div
          style={
            ePoetico
              ? {
                  fontFamily: '"Cormorant Garamond", serif',
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: 64,
                  lineHeight: 1.35,
                  color: COLORS.ink,
                  whiteSpace: "pre-line",
                }
              : {
                  fontWeight: 300,
                  fontSize: textoLongo ? 42 : 48,
                  lineHeight: 1.45,
                  color: COLORS.ink,
                  whiteSpace: "pre-line",
                  letterSpacing: "-0.005em",
                }
          }
        >
          {slide.texto}
        </div>
      </div>
      <div
        style={{
          fontSize: 24,
          letterSpacing: "0.5em",
          textTransform: "lowercase",
          color: "rgba(26,26,26,0.3)",
          fontWeight: 300,
        }}
      >
        os sete véus
      </div>
    </div>
  );
}

function Cta({ slide }: { slide: Extract<SlideType, { tipo: "cta" }> }) {
  return (
    <div
      style={{
        ...baseSlide,
        background: COLORS.deep,
        color: COLORS.ivory,
        padding: `200px ${PAD}px 200px`,
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(184, 92, 56, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ fontSize: 80, lineHeight: 1, textAlign: "center", position: "relative" }}>
        {slide.icone}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
          textAlign: "center",
          maxWidth: 800,
          position: "relative",
        }}
      >
        <div
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: 72,
            lineHeight: 1.15,
          }}
        >
          {slide.recurso}
        </div>
        <div style={{ fontWeight: 300, fontSize: 36, lineHeight: 1.45, color: COLORS.mist, maxWidth: 720 }}>
          {slide.descricao}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, position: "relative" }}>
        <div
          style={{
            fontFamily: '"JetBrains Mono", "Inter", monospace',
            fontWeight: 400,
            fontSize: 32,
            color: COLORS.terracotta,
          }}
        >
          {slide.url}
        </div>
        <div style={{ fontSize: 56, opacity: 0.18, color: COLORS.gold }}>🌀</div>
      </div>
    </div>
  );
}
