/**
 * Biblioteca em-app de prompts Midjourney para vc-sabia.
 *
 * Le do mesmo JSON que o script Python `tools/vc-sabia/generate-motions-library.py`
 * consome para gerar o doc markdown — fonte unica.
 *
 * Cada categoria tem 8 variantes (subjects). Um prompt final e a concatenacao
 * de SUBJECT + ATMOSPHERE + STYLE_BASE + MOOD_HINT + SUFFIX.
 */

import seed from "@/data/vc-sabia-motions.seed.json";

export type MotionCategory = {
  name: string;
  tema: string;
  mood: string;
  atmosphere: string;
  subjects: string[];
};

export type MotionsSeed = {
  style_base: string;
  suffix: string;
  mood_hints: Record<string, string>;
  categories: MotionCategory[];
};

const SEED = seed as MotionsSeed;

export const STYLE_BASE = SEED.style_base;
export const SUFFIX = SEED.suffix;
export const MOOD_HINTS = SEED.mood_hints;
export const CATEGORIES: MotionCategory[] = SEED.categories;

export function buildMotionPrompt(opts: {
  subject: string;
  atmosphere: string;
  mood?: string | null;
}): string {
  const moodHint =
    MOOD_HINTS[opts.mood || "silence"] || MOOD_HINTS.silence;
  return `${opts.subject}, ${opts.atmosphere}, ${STYLE_BASE}, ${moodHint} ${SUFFIX}`;
}

export type CategoryWithIdx = MotionCategory & { idx: number };

/** Mapping de variante (categoria, variant) para cada dia, comecando em
 *  startDate, durante `days` dias. Mesma rotacao deterministica que o
 *  script Python (cat[i % N], variant[i // N]). */
export function dailyRotation(
  startDate: Date,
  days: number
): Array<{
  date: Date;
  category: MotionCategory;
  variantIndex: number;
  prompt: string;
}> {
  const out: Array<{
    date: Date;
    category: MotionCategory;
    variantIndex: number;
    prompt: string;
  }> = [];
  for (let i = 0; i < days; i++) {
    const cat = CATEGORIES[i % CATEGORIES.length];
    const variantIndex =
      Math.floor(i / CATEGORIES.length) % cat.subjects.length;
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + i);
    out.push({
      date: d,
      category: cat,
      variantIndex,
      prompt: buildMotionPrompt({
        subject: cat.subjects[variantIndex],
        atmosphere: cat.atmosphere,
        mood: cat.mood,
      }),
    });
  }
  return out;
}
