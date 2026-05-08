/**
 * Motions Ancient Ground — frame-based para Remotion. 4 variantes (A/B/C/D),
 * mesmas formas SVG do preview admin, sem CSS @keyframes.
 */

import React from "react";

const FPS = 30;

function sin01(t: number): number {
  return (Math.sin(t * Math.PI * 2) + 1) / 2;
}

// ─── A — Capulana abstracta (panorama horizontal lento) ───────────────────
export function AGCapulanaA({ frame }: { frame: number }) {
  const t = frame / FPS;
  // pan -3% to +3% over 12s
  const tx = -3 + sin01(t / 12) * 6;
  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: "linear-gradient(180deg, #3a1a0a 0%, #5c2810 50%, #3a1a0a 100%)",
      }}
    >
      <svg
        viewBox="0 0 100 200" preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `translateX(${tx}%)` }}
      >
        <defs>
          <pattern id="capulana-tri" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 20 10 L 10 20 L 0 10 Z" fill="#D4923E" opacity="0.7" />
            <circle cx="10" cy="10" r="2" fill="#FFD27F" opacity="0.8" />
          </pattern>
          <pattern id="capulana-circ" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="3" fill="none" stroke="#FFD27F" strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
        <rect x="-20" y="20" width="140" height="40" fill="url(#capulana-tri)" />
        <rect x="-20" y="80" width="140" height="20" fill="url(#capulana-circ)" />
        <rect x="-20" y="120" width="140" height="40" fill="url(#capulana-tri)" />
        <rect x="-20" y="180" width="140" height="20" fill="url(#capulana-circ)" />
      </svg>
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
  );
}

// ─── B — Sol pulsante + horizonte (fixo, expande/retrai) ──────────────────
export function AGSolHorizonteB({ frame }: { frame: number }) {
  const t = frame / FPS;
  // sun-pulse: 3s loop, scale 0.92..1.15
  const pulse = 0.92 + sin01(t / 3) * 0.23;
  const brightness = 0.9 + sin01(t / 3) * 0.3;
  // halo: 3s loop, scale 1..1.4
  const haloScale = 1 + sin01(t / 3) * 0.4;
  const haloOp = 0.55 + sin01(t / 3) * 0.35;
  // raios: rotate 30s
  const rayRot = (t / 30) * 360;

  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: "linear-gradient(180deg, #5c1810 0%, #a04020 30%, #1a0a06 100%)",
      }}
    >
      {/* sol fixo no centro-cima */}
      <div style={{ position: "absolute", left: "50%", top: "28%", transform: "translate(-50%, -50%)" }}>
        {/* halo */}
        <div
          style={{
            position: "absolute", left: "50%", top: "50%",
            width: 320, height: 320,
            transform: `translate(-50%, -50%) scale(${haloScale})`,
            background: "radial-gradient(circle, rgba(255,210,127,0.4) 0%, transparent 70%)",
            opacity: haloOp,
            borderRadius: "50%",
          }}
        />
        {/* sol */}
        <div
          style={{
            position: "relative", width: 200, height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, #FFE9A0 0%, #FFA040 50%, #E06010 80%, transparent)",
            boxShadow: "0 0 60px rgba(255,180,80,0.7)",
            transform: `scale(${pulse})`,
            filter: `brightness(${brightness})`,
          }}
        />
      </div>
      {/* raios */}
      <svg
        viewBox="0 0 100 100"
        style={{
          position: "absolute", left: "50%", top: "28%",
          width: "100%", height: "60%",
          transform: `translate(-50%,-50%) rotate(${rayRot}deg)`,
          opacity: 0.3,
        }}
      >
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * Math.PI) / 8;
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * 18} y1={50 + Math.sin(a) * 18}
              x2={50 + Math.cos(a) * 38} y2={50 + Math.sin(a) * 38}
              stroke="#FFD27F" strokeWidth="0.4"
            />
          );
        })}
      </svg>
      {/* horizonte com baobá */}
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path d="M 0 130 L 100 130 L 100 200 L 0 200 Z" fill="#1a0806" />
        <g fill="#000000">
          <rect x="48" y="105" width="4" height="25" />
          <ellipse cx="50" cy="100" rx="14" ry="7" />
          <path d="M 40 100 Q 35 90 38 80 M 60 100 Q 65 90 62 80 M 50 95 Q 50 80 53 75" stroke="#000" strokeWidth="0.8" fill="none" />
        </g>
        <path d="M 0 128 Q 30 124 60 130 T 100 128" stroke="#3a1a0a" strokeWidth="0.5" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
}

// ─── C — Padrão tradicional + brisa ───────────────────────────────────────
export function AGPadraoTradicionalC({ frame }: { frame: number }) {
  const t = frame / FPS;
  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: "linear-gradient(180deg, #3a1a0a 0%, #6a2810 50%, #1a0806 100%)",
      }}
    >
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {Array.from({ length: 6 }).map((_, row) => {
          const tt = ((t + row * 0.5) % 4) / 4;
          const sway = Math.sin(tt * Math.PI * 2) * 2;
          const scale = 1 + sin01((t + row * 0.5) / 4) * 0.04;
          return (
            <g
              key={row}
              transform={`translate(${sway} 0) scale(${scale})`}
              style={{ transformOrigin: "50% 50%", transformBox: "fill-box" }}
            >
              {Array.from({ length: 5 }).map((_, col) => {
                const cx = col * 25 - 5;
                const cy = row * 35 + 15;
                const isCircle = (row + col) % 3 === 0;
                const isSpiral = (row + col) % 3 === 1;
                if (isCircle) {
                  return (
                    <g key={col}>
                      <circle cx={cx} cy={cy} r="6" fill="none" stroke="#FFD27F" strokeWidth="0.6" opacity="0.5" />
                      <circle cx={cx} cy={cy} r="3" fill="#D4923E" opacity="0.4" />
                    </g>
                  );
                }
                if (isSpiral) {
                  return (
                    <path
                      key={col}
                      d={`M ${cx} ${cy} m -5 0 a 5 5 0 1 1 5 5 a 3 3 0 1 1 -3 -3`}
                      stroke="#FFD27F" strokeWidth="0.5" fill="none" opacity="0.6"
                    />
                  );
                }
                return (
                  <polygon
                    key={col}
                    points={`${cx} ${cy - 5},${cx + 4} ${cy + 3},${cx - 4} ${cy + 3}`}
                    fill="#FFD27F" opacity="0.5"
                  />
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── D — Combinação (horizonte + padrão capulana + areia) ─────────────────
export function AGCombinacaoD({ frame }: { frame: number }) {
  const t = frame / FPS;
  const tx = -3 + sin01(t / 12) * 6;

  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: "linear-gradient(180deg, #4a1a0a 0%, #7a2810 50%, #1a0806 100%)",
      }}
    >
      {/* horizonte */}
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <path d="M 0 140 Q 30 134 60 142 T 100 138 L 100 200 L 0 200 Z" fill="#1a0806" />
        <g fill="#000000" opacity="0.85">
          <rect x="73" y="118" width="3" height="22" />
          <ellipse cx="74" cy="115" rx="9" ry="5" />
        </g>
      </svg>
      {/* padrão */}
      <svg
        viewBox="0 0 100 200" preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4, transform: `translateX(${tx}%)` }}
      >
        <defs>
          <pattern id="combo-pat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="3" fill="none" stroke="#FFD27F" strokeWidth="0.5" />
            <path d="M 10 4 L 14 10 L 10 16 L 6 10 Z" fill="#D4923E" opacity="0.6" />
          </pattern>
        </defs>
        <rect x="-20" y="30" width="140" height="80" fill="url(#combo-pat)" />
      </svg>
      {/* areia */}
      {Array.from({ length: 20 }).map((_, i) => {
        const phase = (i * 0.3) % 4;
        const tt = ((t + phase) % 4) / 4;
        const opacity = 0.3 + Math.abs(Math.sin(tt * Math.PI)) * 0.4;
        const yShift = -25 * Math.sin(tt * Math.PI);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 11) % 100}%`,
              top: `${30 + ((i * 13) % 70)}%`,
              width: "2px", height: "2px",
              borderRadius: "50%",
              background: "#FFD27F",
              opacity,
              transform: `translateY(${yShift}px)`,
            }}
          />
        );
      })}
    </div>
  );
}

export const AG_MOTIONS = {
  A: AGCapulanaA,
  B: AGSolHorizonteB,
  C: AGPadraoTradicionalC,
  D: AGCombinacaoD,
} as const;

export type AGMotionVariant = keyof typeof AG_MOTIONS;
