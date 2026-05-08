/**
 * Motions Loranne — versões frame-based para Remotion.
 *
 * Cada motion recebe `frame` (0..durationInFrames-1) e `accent` (cor do
 * álbum). As mesmas formas SVG do preview, mas as animações usam valores
 * derivados do frame em vez de @keyframes CSS (que Remotion não suporta
 * de forma fiável em renderização).
 */

import React from "react";

const FPS = 30;

function sin01(t: number): number {
  return (Math.sin(t * Math.PI * 2) + 1) / 2;
}

// ─── A — Mandala respirante ───────────────────────────────────────────────
export function LoranneMandalaA({ frame, accent }: { frame: number; accent: string }) {
  const t = frame / FPS;
  // breath: 6s loop → scale 0.95..1.06
  const breath = 0.95 + sin01(t / 6) * 0.11;
  // rotation: 30s a 360°
  const rot = (t / 30) * 360;
  const opacity = 0.85 + sin01(t / 6) * 0.15;

  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: "linear-gradient(180deg, #1a0a2a 0%, #2a1240 50%, #100620 100%)",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{
          position: "absolute", left: "50%", top: "50%",
          width: "140%", height: "140%",
          transform: `translate(-50%,-50%) scale(${breath}) rotate(${rot}deg)`,
          filter: `drop-shadow(0 0 8px ${accent}88)`,
          opacity,
        }}
      >
        <g stroke={accent} strokeWidth="0.3" fill="none">
          {Array.from({ length: 10 }).map((_, i) => (
            <circle key={i} cx="50" cy="50" r={5 + i * 4} opacity={0.4 + (i % 3) * 0.15} />
          ))}
        </g>
        <g stroke={accent} strokeWidth="0.18" opacity="0.55">
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i * Math.PI) / 12;
            return (
              <line
                key={i}
                x1={50 + Math.cos(a) * 8} y1={50 + Math.sin(a) * 8}
                x2={50 + Math.cos(a) * 48} y2={50 + Math.sin(a) * 48}
              />
            );
          })}
        </g>
        <g fill={accent} opacity="0.8">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <ellipse
                key={i}
                cx={50 + Math.cos(a) * 22} cy={50 + Math.sin(a) * 22}
                rx="2.5" ry="1.2"
                transform={`rotate(${i * 30} ${50 + Math.cos(a) * 22} ${50 + Math.sin(a) * 22})`}
              />
            );
          })}
        </g>
        <g fill={accent} opacity="0.6">
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4 + Math.PI / 8;
            return (
              <ellipse
                key={i}
                cx={50 + Math.cos(a) * 12} cy={50 + Math.sin(a) * 12}
                rx="1.8" ry="0.8"
                transform={`rotate(${i * 45} ${50 + Math.cos(a) * 12} ${50 + Math.sin(a) * 12})`}
              />
            );
          })}
        </g>
        <circle cx="50" cy="50" r="3" fill={accent} opacity="0.9" />
        <circle cx="50" cy="50" r="1.5" fill="#fff" opacity="0.8" />
      </svg>
    </div>
  );
}

// ─── B — Véus em fluxo ─────────────────────────────────────────────────────
export function LoranneVeusB({ frame, accent }: { frame: number; accent: string }) {
  const t = frame / FPS;
  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: "linear-gradient(180deg, #0a0612 0%, #1a0d2a 50%, #0a0612 100%)",
      }}
    >
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {Array.from({ length: 7 }).map((_, i) => {
          const offset = i * 28;
          // veu: 5s loop, translate -30% to +30%, opacity rises mid
          const tt = ((t + i * 0.7) % 5) / 5; // 0..1
          const tx = -30 + tt * 60; // -30..30 (% of viewBox)
          const opacity = (1 - Math.abs(tt - 0.5) * 2) * (0.15 + i * 0.04 + 0.4);
          return (
            <path
              key={i}
              d={`M -20 ${offset} Q 30 ${offset + 20} 60 ${offset + 5} T 120 ${offset + 15}`}
              stroke={accent} strokeWidth="0.6" fill="none"
              opacity={Math.max(0, opacity)}
              transform={`translate(${tx} 0)`}
            />
          );
        })}
      </svg>
    </div>
  );
}

// ─── C — Pó cósmico (roxo, sem mandala) ───────────────────────────────────
export function LoranneCosmicC({ frame, accent }: { frame: number; accent: string }) {
  const t = frame / FPS;
  const cloudScale = 1 + sin01(t / 5) * 0.15;
  const cloudOpacity = 0.7 + sin01(t / 5) * 0.3;
  const driftX = sin01(t / 8) * 30 - 0;
  const driftY = sin01(t / 8) * 20 - 0;
  const driftScale = 1 + sin01(t / 8) * 0.2;

  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: "radial-gradient(ellipse at 50% 50%, #2a1240 0%, #1a0a2a 35%, #0a0612 70%, #000 100%)",
      }}
    >
      {/* nuvem central pulse */}
      <div
        style={{
          position: "absolute", left: "50%", top: "50%",
          width: "60%", height: "60%",
          transform: `translate(-50%,-50%) scale(${cloudScale})`,
          background: `radial-gradient(circle, ${accent}55 0%, ${accent}22 30%, transparent 60%)`,
          filter: "blur(20px)",
          opacity: cloudOpacity,
        }}
      />
      {/* nuvem drift */}
      <div
        style={{
          position: "absolute", left: "33%", top: "33%",
          width: "40%", height: "40%",
          transform: `translate(${driftX}%, ${driftY}%) scale(${driftScale})`,
          background: `radial-gradient(circle, ${accent}33 0%, transparent 60%)`,
          filter: "blur(30px)",
          borderRadius: "50%",
        }}
      />
      {/* estrelas a piscar */}
      {Array.from({ length: 120 }).map((_, i) => {
        const size = 1 + (i % 3);
        const useAccent = i % 4 === 0;
        const period = i % 2 === 0 ? 2 : 1.2;
        const phase = (i * 0.13) % period;
        const tt = ((t + phase) % period) / period;
        const opacity = 0.2 + Math.abs(Math.sin(tt * Math.PI)) * 0.8;
        const scale = 0.8 + Math.abs(Math.sin(tt * Math.PI)) * 0.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 17.7) % 100}%`,
              top: `${(i * 23.3) % 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: "50%",
              background: useAccent ? accent : "#f0e8ff",
              boxShadow: useAccent ? `0 0 4px ${accent}` : "0 0 3px #fff",
              opacity,
              transform: `scale(${scale})`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── D — Combinação (mandala filigrana + véu + pó) ────────────────────────
export function LoranneCombinacaoD({ frame, accent }: { frame: number; accent: string }) {
  const t = frame / FPS;
  const rot = (t / 30) * 360;

  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: "linear-gradient(180deg, #0a0612 0%, #1a0d2a 50%, #0a0612 100%)",
      }}
    >
      {/* mandala filigrana central */}
      <svg
        viewBox="0 0 100 100"
        style={{
          position: "absolute", left: "50%", top: "50%", width: "100%", height: "100%",
          transform: `translate(-50%,-50%) rotate(${rot}deg)`,
        }}
      >
        <g stroke={accent} strokeWidth="0.1" fill="none" opacity="0.25">
          {Array.from({ length: 8 }).map((_, i) => (
            <circle key={i} cx="50" cy="50" r={8 + i * 4} />
          ))}
        </g>
      </svg>
      {/* 2 véus em fases diferentes */}
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {[0, 3].map((delay, idx) => {
          const tt = ((t + delay) % 5) / 5;
          const tx = -30 + tt * 60;
          const opacity = (1 - Math.abs(tt - 0.5) * 2) * 0.4;
          const yOffset = idx === 0 ? 60 : 130;
          return (
            <path
              key={idx}
              d={`M -20 ${yOffset} Q 30 ${yOffset + 20} 60 ${yOffset + 5} T 120 ${yOffset + 15}`}
              stroke={accent} strokeWidth="0.5" fill="none"
              opacity={Math.max(0, opacity)}
              transform={`translate(${tx} 0)`}
            />
          );
        })}
      </svg>
      {/* pó nas margens */}
      {Array.from({ length: 30 }).map((_, i) => {
        const phase = (i * 0.4) % 4;
        const tt = ((t + phase) % 4) / 4;
        const opacity = 0.3 + Math.abs(Math.sin(tt * Math.PI)) * 0.4;
        const yShift = -25 * Math.sin(tt * Math.PI);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: i % 2 === 0 ? `${(i * 7) % 20}%` : `${80 + ((i * 7) % 20)}%`,
              top: `${(i * 31) % 100}%`,
              width: "2px", height: "2px",
              borderRadius: "50%",
              background: accent,
              opacity,
              transform: `translateY(${yShift}px)`,
            }}
          />
        );
      })}
    </div>
  );
}

export const LORANNE_MOTIONS = {
  A: LoranneMandalaA,
  B: LoranneVeusB,
  C: LoranneCosmicC,
  D: LoranneCombinacaoD,
} as const;

export type LoranneMotionVariant = keyof typeof LORANNE_MOTIONS;
