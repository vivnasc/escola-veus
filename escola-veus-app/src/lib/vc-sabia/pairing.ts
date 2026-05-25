/**
 * Pairing de motion + frase para "VC Sabia Que..."
 *
 * Replica o sistema do hoje-em-mim mas para manhãs contemplativas:
 *
 *  1) Motions nunca repetem consecutivamente — seeded shuffle do pool
 *     inteiro antes de re-embaralhar, com separação de "família"
 *     (variantes do mesmo clip ficam afastadas por minGap posições).
 *
 *  2) Frase-motion alinhados por keyword — se a frase diz "lótus",
 *     o picker procura primeiro motions da categoria "Lótus na água".
 *
 * Usado pelo bulk-month/preview (server) e pelo calendario (Python
 * via mesma lógica portada).
 */

import type { MorningMood } from "./audio";

/** Mulberry32 — PRNG determinístico, leve e estável. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  const rng = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function motionFamilyKey(url: string): string {
  const name = (url.split("/").pop() ?? url).replace(/\.[a-z0-9]+$/i, "");
  return name
    .replace(/[-_](v\d+|\d{1,3}|final|loop|alt|rev|copy)$/i, "")
    .replace(/[-_](v\d+|\d{1,3})$/i, "")
    .toLowerCase();
}

function spaceByFamily(urls: string[], minGap: number): string[] {
  if (urls.length <= 1) return urls;
  const out: string[] = [];
  const remaining = urls.slice();
  while (remaining.length > 0) {
    let pickIdx = -1;
    for (let i = 0; i < remaining.length; i++) {
      const fam = motionFamilyKey(remaining[i]);
      let conflict = false;
      for (let k = 1; k <= minGap && out.length - k >= 0; k++) {
        if (motionFamilyKey(out[out.length - k]) === fam) {
          conflict = true;
          break;
        }
      }
      if (!conflict) { pickIdx = i; break; }
    }
    if (pickIdx === -1) pickIdx = 0;
    out.push(remaining[pickIdx]);
    remaining.splice(pickIdx, 1);
  }
  return out;
}

export type MotionEntry = { name: string; url: string };

/**
 * Pré-calcula sequência de motions para N dias sem repetição consecutiva
 * e com separação de famílias. Consome o pool inteiro antes de reciclar.
 *
 * Se `categoryByMotion` e `phraseCategories` estão presentes, faz
 * keyword-matching: para cada dia, tenta primeiro motions cuja categoria
 * visual coincide com a da frase (ex: frase "lótus" → motion classificado
 * como "Lótus na água"). Fallback para o pool geral shuffled.
 */
export function planMotionSequence(
  motionPool: MotionEntry[],
  numDays: number,
  seed: number,
  opts?: {
    categoryByMotion?: Record<string, string>;
    phraseCategories?: Array<string | null>;
  }
): MotionEntry[] {
  if (motionPool.length === 0) return [];
  if (motionPool.length === 1) return Array(numDays).fill(motionPool[0]);

  const categoryByMotion = opts?.categoryByMotion ?? {};
  const phraseCategories = opts?.phraseCategories ?? [];
  const hasCategories =
    Object.keys(categoryByMotion).length > 0 && phraseCategories.length === numDays;

  if (!hasCategories) {
    return simpleShuffle(motionPool, numDays, seed);
  }

  // Modo categorizado: para cada dia, tenta motion da mesma categoria
  // da frase. Cursor por categoria para rodar variantes.
  const byCat = new Map<string, MotionEntry[]>();
  for (const m of motionPool) {
    const cat = categoryByMotion[m.name];
    if (cat) {
      const list = byCat.get(cat) || [];
      list.push(m);
      byCat.set(cat, list);
    }
  }
  // Shuffle dentro de cada categoria
  for (const [cat, list] of byCat) {
    byCat.set(cat, spaceByFamily(
      shuffleSeeded(list.map((m) => m.url), seed),
      1
    ).map((url) => motionPool.find((m) => m.url === url)!));
  }
  const catCursors = new Map<string, number>();

  // Pool geral fallback (shuffled + family-spaced)
  const fallbackPool = simpleShuffle(motionPool, numDays, seed + 99);
  let fallbackCursor = 0;

  const out: MotionEntry[] = [];
  for (let i = 0; i < numDays; i++) {
    const wantedCat = phraseCategories[i];
    let pick: MotionEntry | null = null;

    if (wantedCat) {
      const pool = byCat.get(wantedCat);
      if (pool && pool.length > 0) {
        const cursor = catCursors.get(wantedCat) || 0;
        pick = pool[cursor % pool.length];
        catCursors.set(wantedCat, cursor + 1);
      }
    }

    if (!pick) {
      pick = fallbackPool[fallbackCursor % fallbackPool.length];
      fallbackCursor++;
    }

    // Family spacing check contra os últimos 2
    if (out.length >= 2) {
      const lastFam = motionFamilyKey(out[out.length - 1].url);
      const prevFam = motionFamilyKey(out[out.length - 2].url);
      const pickFam = motionFamilyKey(pick.url);
      if (pickFam === lastFam || pickFam === prevFam) {
        // Tenta trocar com o próximo no pool/categoria
        const altPool = wantedCat ? byCat.get(wantedCat) : null;
        if (altPool && altPool.length > 1) {
          const cursor = catCursors.get(wantedCat!) || 0;
          const alt = altPool[cursor % altPool.length];
          if (motionFamilyKey(alt.url) !== lastFam && motionFamilyKey(alt.url) !== prevFam) {
            pick = alt;
            catCursors.set(wantedCat!, cursor + 1);
          }
        }
      }
    }

    out.push(pick);
  }
  return out;
}

function simpleShuffle(
  pool: MotionEntry[],
  numDays: number,
  seed: number
): MotionEntry[] {
  const urls = pool.map((m) => m.url);
  const out: string[] = [];
  let pass = 0;
  while (out.length < numDays) {
    let shuffled = spaceByFamily(shuffleSeeded(urls, seed + pass), 2);
    if (out.length > 0 && shuffled[0] === out[out.length - 1]) {
      shuffled = shuffled.slice(1).concat(shuffled[0]);
    }
    if (out.length > 0) {
      const lastFam = motionFamilyKey(out[out.length - 1]);
      if (motionFamilyKey(shuffled[0]) === lastFam) {
        const swapIdx = shuffled.findIndex((u) => motionFamilyKey(u) !== lastFam);
        if (swapIdx > 0) {
          [shuffled[0], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[0]];
        }
      }
    }
    for (const url of shuffled) {
      if (out.length >= numDays) break;
      out.push(url);
    }
    pass++;
  }
  return out.map((url) => pool.find((m) => m.url === url) ?? { name: url.split("/").pop() ?? url, url });
}
