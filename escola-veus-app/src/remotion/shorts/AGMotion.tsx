/**
 * Motions Ancient Ground — frame-based para Remotion. 4 variantes (A/B/C/D),
 * mesmas formas SVG do preview admin, sem CSS @keyframes.
 */

import React from "react";
import type { MotionSeed } from "@/lib/shorts/motion-seed";

const FPS = 30;

function sin01(t: number): number {
  return (Math.sin(t * Math.PI * 2) + 1) / 2;
}

const AG_ACCENT_DEFAULT = "#D4923E";

type SeedProps = { frame: number; accent?: string; seed?: MotionSeed; isLandscape?: boolean };

function seededT(frame: number, seed: MotionSeed | undefined, basePeriod: number): number {
  const t = frame / FPS;
  if (!seed) return t;
  return (t + seed.phase * basePeriod) * seed.speedMul;
}

function seedDir(seed: MotionSeed | undefined): 1 | -1 {
  return seed?.direction ?? 1;
}

function seedDensity(seed: MotionSeed | undefined, base: number, min: number, max: number): number {
  const v = Math.round(base * (seed?.densityMul ?? 1));
  return Math.max(min, Math.min(max, v));
}

// ─── A — Capulana abstracta (panorama horizontal lento) ───────────────────
export function AGCapulanaA({ frame, accent = AG_ACCENT_DEFAULT, seed, isLandscape }: SeedProps) {
  const t = seededT(frame, seed, 12);
  const dir = seedDir(seed);
  const tx = (-3 + sin01(t / 12) * 6) * dir;
  // Swap viewBox para landscape (200×100) — preserveAspectRatio="none" deixaria
  // os triângulos da capulana achatados em fulls 16:9 com viewBox vertical.
  const vbW = isLandscape ? 200 : 100;
  const vbH = isLandscape ? 100 : 200;
  // Bandas: 4 stripes ao longo do eixo maior do viewBox.
  // Em portrait, distribuem-se em y; em landscape, em x (capulana lida na vertical).
  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: "linear-gradient(180deg, #3a1a0a 0%, #5c2810 50%, #3a1a0a 100%)",
      }}
    >
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `translateX(${tx}%)` }}
      >
        <defs>
          <pattern id="capulana-tri" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 20 10 L 10 20 L 0 10 Z" fill={accent} opacity="0.7" />
            <circle cx="10" cy="10" r="2" fill="#FFD27F" opacity="0.8" />
          </pattern>
          <pattern id="capulana-circ" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="3" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.6" />
          </pattern>
        </defs>
        {isLandscape ? (
          <>
            {/* 4 bandas verticais ao longo dos 200 viewBox-units */}
            <rect x="20" y="-20" width="40" height="140" fill="url(#capulana-tri)" />
            <rect x="80" y="-20" width="20" height="140" fill="url(#capulana-circ)" />
            <rect x="120" y="-20" width="40" height="140" fill="url(#capulana-tri)" />
            <rect x="180" y="-20" width="20" height="140" fill="url(#capulana-circ)" />
          </>
        ) : (
          <>
            <rect x="-20" y="20" width="140" height="40" fill="url(#capulana-tri)" />
            <rect x="-20" y="80" width="140" height="20" fill="url(#capulana-circ)" />
            <rect x="-20" y="120" width="140" height="40" fill="url(#capulana-tri)" />
            <rect x="-20" y="180" width="140" height="20" fill="url(#capulana-circ)" />
          </>
        )}
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
export function AGSolHorizonteB({ frame, accent = AG_ACCENT_DEFAULT, seed, isLandscape }: SeedProps) {
  const t = seededT(frame, seed, 3);
  const dir = seedDir(seed);
  // sun-pulse: 3s loop, scale 0.92..1.15
  const pulse = 0.92 + sin01(t / 3) * 0.23;
  const brightness = 0.9 + sin01(t / 3) * 0.3;
  // halo: 3s loop, scale 1..1.4
  const haloScale = 1 + sin01(t / 3) * 0.4;
  const haloOp = 0.55 + sin01(t / 3) * 0.35;
  // raios: rotate 30s
  const rayRot = (t / 30) * 360 * dir;
  const raysN = seedDensity(seed, 16, 12, 20);

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
        {/* sol — gradient interno fixo, exterior tingido pelo accent */}
        <div
          style={{
            position: "relative", width: 200, height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle, #FFE9A0 0%, ${accent} 55%, #1a0806 95%, transparent)`,
            boxShadow: `0 0 60px ${accent}99`,
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
        {Array.from({ length: raysN }).map((_, i) => {
          const a = (i * Math.PI) / (raysN / 2);
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
      {/* horizonte com baobá — em landscape o ground sobe (y=70/100) e o
          baobá vai para a direita (x=145/200) para não distorcer. */}
      {isLandscape ? (
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d="M 0 70 L 200 70 L 200 100 L 0 100 Z" fill="#1a0806" />
          <g fill="#000000">
            <rect x="143" y="58" width="4" height="14" />
            <ellipse cx="145" cy="55" rx="14" ry="7" />
            <path d="M 135 55 Q 130 45 133 35 M 155 55 Q 160 45 157 35 M 145 50 Q 145 35 148 30" stroke="#000" strokeWidth="0.8" fill="none" />
          </g>
          <path d="M 0 68 Q 60 64 120 70 T 200 68" stroke="#3a1a0a" strokeWidth="0.5" fill="none" opacity="0.5" />
        </svg>
      ) : (
        <svg viewBox="0 0 100 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d="M 0 130 L 100 130 L 100 200 L 0 200 Z" fill="#1a0806" />
          <g fill="#000000">
            <rect x="48" y="105" width="4" height="25" />
            <ellipse cx="50" cy="100" rx="14" ry="7" />
            <path d="M 40 100 Q 35 90 38 80 M 60 100 Q 65 90 62 80 M 50 95 Q 50 80 53 75" stroke="#000" strokeWidth="0.8" fill="none" />
          </g>
          <path d="M 0 128 Q 30 124 60 130 T 100 128" stroke="#3a1a0a" strokeWidth="0.5" fill="none" opacity="0.5" />
        </svg>
      )}
    </div>
  );
}

// ─── C — Padrão tradicional + brisa ───────────────────────────────────────
export function AGPadraoTradicionalC({ frame, accent = AG_ACCENT_DEFAULT, seed, isLandscape }: SeedProps) {
  const t = seededT(frame, seed, 4);
  const dir = seedDir(seed);
  const rowsN = seedDensity(seed, 6, 5, 7);
  // Em landscape, troca papéis de linhas/colunas para manter densidade visual
  // e evitar que os polígonos esticados horizontalmente fiquem flat.
  const vbW = isLandscape ? 200 : 100;
  const vbH = isLandscape ? 100 : 200;
  const colCount = isLandscape ? rowsN : 5;
  const rowCount = isLandscape ? 5 : rowsN;
  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: "linear-gradient(180deg, #3a1a0a 0%, #6a2810 50%, #1a0806 100%)",
      }}
    >
      <svg viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {Array.from({ length: rowCount }).map((_, row) => {
          const tt = ((t + row * 0.5) % 4) / 4;
          const sway = Math.sin(tt * Math.PI * 2) * 2 * dir;
          const scale = 1 + sin01((t + row * 0.5) / 4) * 0.04;
          return (
            <g
              key={row}
              transform={`translate(${sway} 0) scale(${scale})`}
              style={{ transformOrigin: "50% 50%", transformBox: "fill-box" }}
            >
              {Array.from({ length: colCount }).map((_, col) => {
                const cx = isLandscape ? col * 35 + 15 : col * 25 - 5;
                const cy = isLandscape ? row * 25 - 5 : row * 35 + 15;
                const isCircle = (row + col) % 3 === 0;
                const isSpiral = (row + col) % 3 === 1;
                if (isCircle) {
                  return (
                    <g key={col}>
                      <circle cx={cx} cy={cy} r="6" fill="none" stroke="#FFD27F" strokeWidth="0.6" opacity="0.5" />
                      <circle cx={cx} cy={cy} r="3" fill={accent} opacity="0.6" />
                    </g>
                  );
                }
                if (isSpiral) {
                  return (
                    <path
                      key={col}
                      d={`M ${cx} ${cy} m -5 0 a 5 5 0 1 1 5 5 a 3 3 0 1 1 -3 -3`}
                      stroke={accent} strokeWidth="0.5" fill="none" opacity="0.7"
                    />
                  );
                }
                return (
                  <polygon
                    key={col}
                    points={`${cx} ${cy - 5},${cx + 4} ${cy + 3},${cx - 4} ${cy + 3}`}
                    fill={accent} opacity="0.55"
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
export function AGCombinacaoD({ frame, accent = AG_ACCENT_DEFAULT, seed, isLandscape }: SeedProps) {
  const t = seededT(frame, seed, 12);
  const dir = seedDir(seed);
  const sandN = seedDensity(seed, 20, 16, 24);
  const tx = (-3 + sin01(t / 12) * 6) * dir;

  return (
    <div
      style={{
        position: "absolute", inset: 0, overflow: "hidden",
        background: "linear-gradient(180deg, #4a1a0a 0%, #7a2810 50%, #1a0806 100%)",
      }}
    >
      {/* horizonte — landscape repõe ground a y=75/100 e baobá a x=150/200 */}
      {isLandscape ? (
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d="M 0 75 Q 60 71 120 77 T 200 73 L 200 100 L 0 100 Z" fill="#1a0806" />
          <g fill="#000000" opacity="0.85">
            <rect x="148" y="62" width="3" height="13" />
            <ellipse cx="150" cy="58" rx="9" ry="5" />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 100 200" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path d="M 0 140 Q 30 134 60 142 T 100 138 L 100 200 L 0 200 Z" fill="#1a0806" />
          <g fill="#000000" opacity="0.85">
            <rect x="73" y="118" width="3" height="22" />
            <ellipse cx="74" cy="115" rx="9" ry="5" />
          </g>
        </svg>
      )}
      {/* padrão */}
      <svg
        viewBox={isLandscape ? "0 0 200 100" : "0 0 100 200"} preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4, transform: `translateX(${tx}%)` }}
      >
        <defs>
          <pattern id="combo-pat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="3" fill="none" stroke={accent} strokeWidth="0.6" />
            <path d="M 10 4 L 14 10 L 10 16 L 6 10 Z" fill={accent} opacity="0.7" />
          </pattern>
        </defs>
        {isLandscape ? (
          <rect x="20" y="-20" width="80" height="140" fill="url(#combo-pat)" />
        ) : (
          <rect x="-20" y="30" width="140" height="80" fill="url(#combo-pat)" />
        )}
      </svg>
      {/* areia */}
      {Array.from({ length: sandN }).map((_, i) => {
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
