"use client";

/**
 * Motion previews — Loranne (4 opções) + AG (4 opções).
 *
 * Cada componente é uma animação CSS/SVG self-contained num frame 9:16
 * preview. Quando a Vivianne escolher, ESTE MESMO componente vai
 * directo para `src/remotion/LoranneShortComposition.tsx` /
 * `src/remotion/AGShortComposition.tsx` como camada de background.
 *
 * Loranne: cor de acento varia por álbum em runtime — aqui mostro 1 cor.
 * AG: cor de fundo terra/ocre fixa, formas variam por tema raiz.
 */

import React from "react";

// ─── LORANNE A — Mandala respirante ────────────────────────────────────────
export function LoranneMandalaA({ accent = "#D4A853" }: { accent?: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#0a0612] via-[#1a0d2a] to-[#0a0612]">
      <svg viewBox="0 0 100 100" className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 motion-mandala">
        <g stroke={accent} strokeWidth="0.15" fill="none" opacity="0.45">
          {Array.from({ length: 12 }).map((_, i) => (
            <circle key={i} cx="50" cy="50" r={5 + i * 3.5} />
          ))}
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i * Math.PI) / 12;
            return (
              <line key={i} x1="50" y1="50" x2={50 + Math.cos(a) * 45} y2={50 + Math.sin(a) * 45} />
            );
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            return <circle key={`p${i}`} cx={50 + Math.cos(a) * 25} cy={50 + Math.sin(a) * 25} r="2" />;
          })}
        </g>
      </svg>
      {/* partículas douradas a flutuar */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-1 w-1 rounded-full motion-particle"
          style={{
            left: `${(i * 13) % 100}%`,
            top: `${(i * 37) % 100}%`,
            background: accent,
            opacity: 0.6,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── LORANNE B — Véus em fluxo ─────────────────────────────────────────────
export function LoranneVeusB({ accent = "#D4A853" }: { accent?: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#0a0612] via-[#1a0d2a] to-[#0a0612]">
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {Array.from({ length: 7 }).map((_, i) => {
          const offset = i * 28;
          return (
            <path
              key={i}
              d={`M -20 ${offset} Q 30 ${offset + 20} 60 ${offset + 5} T 120 ${offset + 15}`}
              stroke={accent}
              strokeWidth="0.6"
              fill="none"
              opacity={0.15 + i * 0.04}
              className="motion-veu"
              style={{ animationDelay: `${i * 0.8}s` }}
            />
          );
        })}
      </svg>
    </div>
  );
}

// ─── LORANNE C — Pó cósmico ────────────────────────────────────────────────
export function LoranneCosmicC({ accent = "#D4A853" }: { accent?: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-radial from-[#1a0d2a] via-[#0a0612] to-[#000000]">
      {/* anel central subtil */}
      <div
        className="absolute left-1/2 top-1/2 h-2/3 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border motion-spin-slow"
        style={{ borderColor: accent, opacity: 0.15 }}
      />
      {/* estrelas/pó */}
      {Array.from({ length: 80 }).map((_, i) => {
        const size = 1 + (i % 3);
        return (
          <div
            key={i}
            className="absolute rounded-full motion-twinkle"
            style={{
              left: `${(i * 17.7) % 100}%`,
              top: `${(i * 23.3) % 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: i % 5 === 0 ? accent : "#fff",
              animationDelay: `${(i * 0.13) % 4}s`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── LORANNE D — Combinação ────────────────────────────────────────────────
export function LoranneCombinacaoD({ accent = "#D4A853" }: { accent?: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#0a0612] via-[#1a0d2a] to-[#0a0612]">
      {/* mandala filigrana central */}
      <svg viewBox="0 0 100 100" className="absolute left-1/2 top-1/2 h-[100%] w-[100%] -translate-x-1/2 -translate-y-1/2 motion-spin-slow">
        <g stroke={accent} strokeWidth="0.1" fill="none" opacity="0.25">
          {Array.from({ length: 8 }).map((_, i) => (
            <circle key={i} cx="50" cy="50" r={8 + i * 4} />
          ))}
        </g>
      </svg>
      {/* véu a passar */}
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path
          d="M -20 60 Q 30 80 60 65 T 120 75"
          stroke={accent}
          strokeWidth="0.5"
          fill="none"
          opacity={0.3}
          className="motion-veu"
        />
        <path
          d="M -20 130 Q 30 150 60 135 T 120 145"
          stroke={accent}
          strokeWidth="0.5"
          fill="none"
          opacity={0.2}
          className="motion-veu"
          style={{ animationDelay: "3s" }}
        />
      </svg>
      {/* pó nas margens */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-0.5 w-0.5 rounded-full motion-particle"
          style={{
            left: i % 2 === 0 ? `${(i * 7) % 20}%` : `${80 + ((i * 7) % 20)}%`,
            top: `${(i * 31) % 100}%`,
            background: accent,
            opacity: 0.5,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── AG A — Capulana abstracta ──────────────────────────────────────────────
export function AGCapulanaA() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#3a1a0a] via-[#5c2810] to-[#3a1a0a]">
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full motion-pan-slow">
        {/* faixas horizontais com padrão */}
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
    </div>
  );
}

// ─── AG B — Sol e horizonte ─────────────────────────────────────────────────
export function AGSolHorizonteB() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#5c1810] via-[#a04020] via-30% to-[#1a0a06]">
      {/* sol a deslocar */}
      <div
        className="absolute h-16 w-16 rounded-full motion-sun"
        style={{ background: "radial-gradient(circle, #FFD27F, #E08020 60%, transparent)" }}
      />
      {/* horizonte com baobá */}
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {/* terra */}
        <path d="M 0 130 L 100 130 L 100 200 L 0 200 Z" fill="#1a0806" />
        {/* baobá silhueta */}
        <g fill="#000000">
          <rect x="48" y="105" width="4" height="25" />
          <ellipse cx="50" cy="100" rx="14" ry="7" />
          <path d="M 40 100 Q 35 90 38 80 M 60 100 Q 65 90 62 80 M 50 95 Q 50 80 53 75" stroke="#000" strokeWidth="0.8" fill="none" />
        </g>
        {/* horizonte distante */}
        <path d="M 0 128 Q 30 124 60 130 T 100 128" stroke="#3a1a0a" strokeWidth="0.5" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
}

// ─── AG C — Padrão tradicional + brisa ─────────────────────────────────────
export function AGPadraoTradicionalC() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#3a1a0a] via-[#6a2810] to-[#1a0806]">
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {/* espirais e formas geométricas */}
        {Array.from({ length: 6 }).map((_, row) => (
          <g key={row} className="motion-sway" style={{ animationDelay: `${row * 0.5}s` }}>
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
                    stroke="#FFD27F"
                    strokeWidth="0.5"
                    fill="none"
                    opacity="0.6"
                  />
                );
              }
              return (
                <polygon
                  key={col}
                  points={`${cx} ${cy - 5},${cx + 4} ${cy + 3},${cx - 4} ${cy + 3}`}
                  fill="#FFD27F"
                  opacity="0.5"
                />
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── AG D — Combinação ─────────────────────────────────────────────────────
export function AGCombinacaoD() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-[#4a1a0a] via-[#7a2810] to-[#1a0806]">
      {/* horizonte ao fundo */}
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M 0 140 Q 30 134 60 142 T 100 138 L 100 200 L 0 200 Z" fill="#1a0806" />
        {/* baobá pequeno */}
        <g fill="#000000" opacity="0.85">
          <rect x="73" y="118" width="3" height="22" />
          <ellipse cx="74" cy="115" rx="9" ry="5" />
        </g>
      </svg>
      {/* padrão capulana sobreposto a 30% */}
      <svg viewBox="0 0 100 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-40 motion-pan-slow">
        <defs>
          <pattern id="combo-pat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="3" fill="none" stroke="#FFD27F" strokeWidth="0.5" />
            <path d="M 10 4 L 14 10 L 10 16 L 6 10 Z" fill="#D4923E" opacity="0.6" />
          </pattern>
        </defs>
        <rect x="-20" y="30" width="140" height="80" fill="url(#combo-pat)" />
      </svg>
      {/* areia a flutuar */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-0.5 w-0.5 rounded-full motion-particle"
          style={{
            left: `${(i * 11) % 100}%`,
            top: `${30 + ((i * 13) % 70)}%`,
            background: "#FFD27F",
            opacity: 0.6,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}
