/**
 * Selecção determinística de clips/música para um post da semana.
 */

type ClipLike = { name?: string | null; url: string };
type TrackLike = { name: string; url: string };

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickN<T>(pool: readonly T[], n: number, seed: string): T[] {
  if (pool.length === 0) return [];
  const scored = pool.map((p, i) => ({ p, s: hash(`${seed}::${i}`) }));
  scored.sort((a, b) => a.s - b.s);
  return scored.slice(0, n).map((x) => x.p);
}

export function pickLoranneClips(
  pool: ClipLike[],
  albumSlug: string,
  trackNumber: number,
  weekNumber: number,
): string[] {
  const seed = `${albumSlug}/${trackNumber}/w${weekNumber}`;
  return pickN(pool, 3, seed).map((c) => c.url);
}

export function pickAGClips(
  pool: ClipLike[],
  temas: readonly string[],
  weekNumber: number,
): string[] {
  const urls: string[] = [];
  for (const tema of temas) {
    const filtered = pool.filter((c) =>
      (c.name || c.url || "").toLowerCase().includes(`${tema}-`),
    );
    if (filtered.length === 0) {
      throw new Error(
        `Sem clips AG raízes para tema "${tema}" — gera em /admin/producao/ancient-ground.`,
      );
    }
    const seed = `ag/${tema}/w${weekNumber}`;
    const [pick] = pickN(filtered, 1, seed);
    urls.push(pick.url);
  }
  return urls;
}

export function findTrackUrl(
  albumTracks: TrackLike[],
  trackNumber: number,
): string | null {
  const padded = String(trackNumber).padStart(2, "0");
  const unpadded = String(trackNumber);
  // Tenta primeiro padded (faixa-08), depois unpadded (faixa-8). Ambos com
  // boundary não-numérico para evitar match parcial (8 dentro de 18, 28, …).
  for (const num of [padded, unpadded]) {
    const re = new RegExp(`(^|[^0-9])${num}([^0-9]|$)`);
    const match = albumTracks.find((t) => re.test(t.name));
    if (match) return match.url;
  }
  // Fallback posicional (1-indexed) — só usar se a lista parece ordenada por
  // número de faixa.
  if (trackNumber >= 1 && trackNumber <= albumTracks.length) {
    return albumTracks[trackNumber - 1].url;
  }
  return null;
}

/**
 * Extrai os números de faixa a partir dos nomes de ficheiro.
 * Ex: "faixa-08.mp3" → 8, "01-titulo.mp3" → 1.
 */
export function extractTrackNumbers(albumTracks: TrackLike[]): number[] {
  const numbers = new Set<number>();
  for (const t of albumTracks) {
    const m = t.name.match(/(?:faixa|track)[-_]?(\d+)|^(\d+)[-_.]/i);
    const n = m ? parseInt(m[1] || m[2], 10) : null;
    if (Number.isFinite(n) && n! >= 1) numbers.add(n!);
  }
  return [...numbers].sort((a, b) => a - b);
}

/** Devolve o número mais próximo de target dentro de available. */
export function closestTrackNumber(available: number[], target: number): number | null {
  if (available.length === 0) return null;
  let best = available[0];
  let bestDist = Math.abs(best - target);
  for (const n of available.slice(1)) {
    const d = Math.abs(n - target);
    if (d < bestDist) { best = n; bestDist = d; }
  }
  return best;
}
