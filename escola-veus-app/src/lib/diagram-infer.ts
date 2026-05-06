/**
 * Inferência automática de diagrama. Regras estritas — só dispara em
 * padrões INEQUIVOCAMENTE estruturais. Texto narrativo com conjunções
 * temporais (antes/depois como advérbios) NÃO dispara, ao contrário
 * da iteração anterior.
 *
 * Padrões aceites:
 *   1. Frase final (acto V) → Âncora com palavra mais forte.
 *   2. Lista numerada explícita "1. X. 2. Y. 3. Z." → Sequência.
 *   3. Negação→Afirmação "Não é X. É Y." → Pareado.
 *   4. Contraste com conjunção "X, mas Y." → Pareado.
 *   5. Tríade coordenada "X, Y e Z." com 3 substantivos fortes → Tríade.
 *
 * Tudo o resto: null. Manual via editor ou Sugestão Claude.
 */

import type { Diagram } from "@/lib/diagrams";

const STOP = new Set([
  "a", "o", "as", "os", "um", "uma", "uns", "umas", "de", "do", "da", "dos",
  "das", "em", "no", "na", "nos", "nas", "para", "com", "por", "que", "se",
  "e", "ou", "mas", "como", "quando", "porque", "onde", "depois", "antes",
  "sobre", "entre", "ainda", "mais", "menos", "estás", "está", "estar",
  "tens", "teu", "teus", "tua", "tuas", "isto", "isso", "aquilo", "também",
  "muito", "pouco", "agora", "nunca", "sempre", "talvez", "este", "esta",
  "esse", "essa", "aquele", "aquela", "tudo", "nada", "algo", "algum",
  "alguma", "qualquer", "outro", "outra", "ser", "ter", "ir", "vir", "fazer",
  "dizer", "ver", "saber", "querer", "poder", "dever", "ficar", "está",
  "são", "foi", "era", "será", "tinha", "fica", "fazes", "tens",
]);

function isStrong(word: string): boolean {
  return word.length >= 5 && !STOP.has(word.toLowerCase());
}

function topConcept(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[.,!?;:«»()"]/g, " ")
    .split(/\s+/)
    .filter((w) => isStrong(w));
  if (words.length === 0) return "";
  return words[words.length - 1];
}

/** Lista numerada EXPLÍCITA "1. X. 2. Y." (≥2 itens). Não interpreta prosa. */
function detectNumberedSteps(text: string): string[] | null {
  const matches = text.match(/(?:^|[.!?]\s+)(\d)\.\s+([^.!?\d]{4,60})(?=[.!?])/g);
  if (!matches || matches.length < 2) return null;
  const steps = matches
    .map((m) => m.replace(/^[.!?\s]+\d\.\s+/, "").trim())
    .map((s) => {
      // Tira só a palavra-chave de cada passo
      const w = topConcept(s) || s.split(/\s+/)[0];
      return w;
    })
    .filter(Boolean)
    .slice(0, 5);
  return steps.length >= 2 ? steps : null;
}

/** "Não é X. É Y." — negação seguida de afirmação. Forte estrutura. */
function detectNegationAffirmation(text: string): [string, string] | null {
  // "não é PALAVRA[fim de frase] É PALAVRA"
  const m = text.match(/n[ãa]o\s+(?:é|e)\s+([a-záéíóúâêôãõç]{4,20})[.!?]\s+(?:é|e)\s+([a-záéíóúâêôãõç]{4,20})\b/i);
  if (m && isStrong(m[1]) && isStrong(m[2])) {
    return [m[1].toLowerCase(), m[2].toLowerCase()];
  }
  return null;
}

/** "X, mas Y." — contraste com conjunção adversativa. */
function detectMasContrast(text: string): [string, string] | null {
  const m = text.match(/\b([a-záéíóúâêôãõç]{5,18})\s*,\s*mas\s+([a-záéíóúâêôãõç]{5,18})\b/i);
  if (m && isStrong(m[1]) && isStrong(m[2])) {
    return [m[1].toLowerCase(), m[2].toLowerCase()];
  }
  return null;
}

/** "X, Y e Z." — tríade coordenada com 3 substantivos fortes. */
function detectTriad(text: string): [string, string, string] | null {
  const m = text.match(/\b([a-záéíóúâêôãõç]{5,15})\s*,\s*([a-záéíóúâêôãõç]{5,15})\s+e\s+([a-záéíóúâêôãõç]{5,15})\b/i);
  if (m && isStrong(m[1]) && isStrong(m[2]) && isStrong(m[3])) {
    return [m[1].toLowerCase(), m[2].toLowerCase(), m[3].toLowerCase()];
  }
  return null;
}

export function inferDiagram(
  acto: "pergunta" | "situacao" | "revelacao" | "gesto" | "frase",
  text: string,
  _isFirstBlock: boolean,
): Diagram | null {
  if (!text || text.length < 10) return null;

  // 1. Frase final SEMPRE Âncora
  if (acto === "frase") {
    const word = topConcept(text);
    if (word) return { type: "circulo", terms: [word] };
  }

  // 2. Lista numerada explícita → Sequência
  const steps = detectNumberedSteps(text);
  if (steps) return { type: "sequencia", terms: steps };

  // 3. Negação→Afirmação → Pareado
  const negAff = detectNegationAffirmation(text);
  if (negAff) return { type: "pareado", terms: [negAff[0], negAff[1]] };

  // 4. Contraste "X, mas Y" → Pareado
  const masContrast = detectMasContrast(text);
  if (masContrast) return { type: "pareado", terms: [masContrast[0], masContrast[1]] };

  // 5. Tríade "X, Y e Z" → Tríade
  const triad = detectTriad(text);
  if (triad) return { type: "triade", terms: [triad[0], triad[1], triad[2]] };

  // Sem padrão claro: nada. Slide narrativo confia nas outras camadas
  // visuais (tipografia, ambiente, typewriter, eco).
  return null;
}
