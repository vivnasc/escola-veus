/**
 * Fingerprint visual estável por faixa.
 *
 * Cada faixa Loranne/AG mapeia a um `MotionSeed` determinístico (hash do
 * trackId). Mesma faixa renderiza sempre com o mesmo background — variant,
 * accent, velocidade, fase, densidade, direcção — independentemente da
 * semana ou dia em que cai a rotação semanal.
 *
 * O par (variant, accent) por si só dava só 4 × 8 = 32 combinações distintas
 * (insuficiente para o catálogo Loranne ~1400 faixas). Os parâmetros extra
 * (speed/phase/density/direction) expandem para milhares de fingerprints,
 * todos dentro do mesmo idioma visual da marca.
 *
 * Tudo é opcional no motion. Sem seed, o motion comporta-se como sempre se
 * comportou (compatibilidade com vídeos antigos).
 */

const LORANNE_PALETTE = [
  "#4A6FA5", // azul-noite (eter)
  "#B0344A", // sangue
  "#7E57C2", // espelho roxo
  "#D4A853", // nua-dourado
  "#A088C0", // incenso lavanda
  "#E07050", // fibra terracota
  "#B08050", // grão areia-quente
  "#5060A8", // livro índigo
] as const;

const AG_PALETTE = [
  "#B8860B", "#E07050", "#B7410E", "#C04030",
  "#FF8C00", "#FFB347", "#D2691E", "#8B4513",
  "#CD853F", "#FFBF00", "#B87333", "#722F37",
  "#E0A458", "#DEB887", "#C68642",
] as const;

const VARIANTS = ["A", "B", "C", "D"] as const;
export type MotionVariant = (typeof VARIANTS)[number];

export type MotionSeed = {
  variant: MotionVariant;
  accent: string;
  /** Multiplicador de velocidade da animação. ~0.75..1.35. */
  speedMul: number;
  /** Fase inicial em fracção do ciclo. 0..1. */
  phase: number;
  /** Multiplicador de densidade (nº de partículas/elementos). ~0.85..1.15. */
  densityMul: number;
  /** Direcção de rotação. +1 CW, -1 CCW. */
  direction: 1 | -1;
};

/** FNV-1a 32-bit. Determinístico, sem dependências, output bem distribuído. */
export function hashTrackId(trackId: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < trackId.length; i++) {
    h ^= trackId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function deriveMotionSeed(
  trackId: string,
  brand: "loranne" | "ancient-ground",
): MotionSeed {
  const h = hashTrackId(trackId);
  const palette = brand === "loranne" ? LORANNE_PALETTE : AG_PALETTE;
  const variant = VARIANTS[h % 4];
  const accent = palette[Math.floor(h / 4) % palette.length];
  const speedMul = 0.75 + ((Math.floor(h / 32) % 13) / 12) * 0.6;
  const phase = (Math.floor(h / 512) % 100) / 100;
  const densityMul = 0.85 + ((Math.floor(h / 8192) % 7) / 6) * 0.30;
  const direction: 1 | -1 = (Math.floor(h / 131072) & 1) ? 1 : -1;
  return { variant, accent, speedMul, phase, densityMul, direction };
}

export function loranneTrackId(albumSlug: string, trackNumber: number): string {
  return `loranne/${albumSlug}/${trackNumber}`;
}

export function agTrackId(temas: readonly string[], trackNumber: number): string {
  // Sort temas para que a ordem do array não afecte o fingerprint.
  return `ag/${[...temas].sort().join("-")}/${trackNumber}`;
}
