/**
 * Cruzamento frase ↔ motion por categoria visual.
 *
 * A mesma logica que o script Python usa para alinhar o calendario
 * de imagens (match_category_for_phrase), agora em TS para o plan
 * picker e a UI.
 */

import motionsSeed from "@/data/vc-sabia-motions.seed.json";

type Category = { name: string; tema: string; mood: string; keywords: string[] };

const CATEGORIES: Category[] = (
  motionsSeed as { categories: Category[] }
).categories;

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Devolve o nome da categoria visual que melhor combina com a frase.
 * Procura keywords da categoria no texto normalizado da frase.
 * Fallback: primeira categoria com o mesmo tema vc-sabia, ou null.
 */
export function matchCategoryForPhrase(
  phraseText: string,
  phraseTema: string
): string | null {
  const norm = ` ${normalize(phraseText)} `;
  for (const cat of CATEGORIES) {
    for (const kw of cat.keywords) {
      const kn = normalize(kw);
      if (kn.includes(" ")) {
        if (norm.includes(kn)) return cat.name;
      } else {
        if (norm.includes(` ${kn} `) || norm.includes(` ${kn}s `)) return cat.name;
      }
    }
  }
  for (const cat of CATEGORIES) {
    if (cat.tema === phraseTema) return cat.name;
  }
  return null;
}

/** Lista de nomes de categorias visuais (para dropdowns e auto-tagger). */
export const VISUAL_CATEGORY_NAMES: string[] = CATEGORIES.map((c) => c.name);
