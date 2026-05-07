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
  const byPrefix = albumTracks.find((t) =>
    new RegExp(`(^|[^0-9])${padded}([^0-9]|$)`).test(t.name),
  );
  if (byPrefix) return byPrefix.url;
  if (trackNumber >= 1 && trackNumber <= albumTracks.length) {
    return albumTracks[trackNumber - 1].url;
  }
  return null;
}
