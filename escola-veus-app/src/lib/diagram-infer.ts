/**
 * Inferência automática de diagrama a partir do texto de um slide. Quando
 * a Vivianne não define manualmente um diagrama (config.diagrams[idx]),
 * o builder do deck chama esta função para tentar deduzir um.
 *
 * Filosofia: conservador. Só infere quando o texto pede claramente. Caso
 * contrário, devolve null e o slide fica sem diagrama.
 *
 * Heurísticas (por ordem de prioridade):
 *  1. Frase final (acto V): Âncora com a palavra mais carregada.
 *  2. Pergunta inicial (acto I) curta com 1 conceito-chave: Âncora.
 *  3. Texto com lista "1. X. 2. Y. 3. Z." ou "primeiro... depois...
 *     finalmente": Sequência.
 *  4. Texto com par "antes ... depois", "fora ... dentro", "fechar/abrir",
 *     "agarrar/soltar": Pareado.
 *  5. Texto com "X, Y e Z" ou três substantivos coordenados: Tríade.
 *  6. Caso contrário: null.
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
  "dizer", "ver", "saber", "querer", "poder", "dever", "ficar",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,!?;:«»()"]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP.has(w));
}

function topConcept(text: string): string {
  // Última palavra "forte" (>=5 chars, não stop). Próximo do fim tem peso narrativo.
  const words = tokenize(text).filter((w) => w.length >= 5);
  if (words.length === 0) return "";
  return words[words.length - 1];
}

/** Detecta "1. X 2. Y 3. Z" ou "primeiro... depois... finalmente". */
function detectSteps(text: string): string[] | null {
  // Padrão numerado: "1. algo. 2. outro. 3. terceiro."
  const numbered = text.match(/\b\d\.\s+([^.0-9]{3,40}?)(?=\s+\d\.|\.|$)/g);
  if (numbered && numbered.length >= 2) {
    return numbered
      .map((s) => s.replace(/^\d\.\s+/, "").trim())
      .map((s) => topConcept(s) || s.split(/\s+/)[0])
      .filter(Boolean)
      .slice(0, 5);
  }
  // Padrão por advérbios: "primeiro X. depois Y. finalmente Z."
  const adverbs = ["primeiro", "depois", "finalmente", "por fim", "a seguir"];
  const hits = adverbs.filter((a) => new RegExp(`\\b${a}\\b`, "i").test(text));
  if (hits.length >= 2) {
    // Extrai a palavra mais forte de cada frase iniciada por um advérbio
    const sentences = text.split(/[.!?]\s+/);
    const steps: string[] = [];
    for (const adv of adverbs) {
      const sent = sentences.find((s) => new RegExp(`\\b${adv}\\b`, "i").test(s));
      if (sent) {
        const w = topConcept(sent.replace(new RegExp(`\\b${adv}\\b`, "i"), ""));
        if (w) steps.push(w);
      }
    }
    if (steps.length >= 2) return steps;
  }
  return null;
}

/** Detecta opostos óbvios. */
function detectOpposites(text: string): [string, string] | null {
  const lower = text.toLowerCase();
  const pairs: Array<[RegExp, RegExp, string, string]> = [
    [/\bantes\b/, /\bdepois\b/, "antes", "depois"],
    [/\bfora\b/, /\bdentro\b/, "fora", "dentro"],
    [/\babre[rm]?\b|\baberto\b/, /\bfecha[rm]?\b|\bfechado\b/, "abrir", "fechar"],
    [/\bagarrar\b|\bsegurar\b/, /\bsoltar\b|\blargar\b/, "agarrar", "soltar"],
    [/\bcheio\b|\bcheia\b/, /\bvazio\b|\bvazia\b/, "cheio", "vazio"],
    [/\bclar[oa]\b/, /\bescur[oa]\b/, "claro", "escuro"],
    [/\bsil[êe]ncio\b/, /\bru[íi]do\b|\bfala\b/, "silêncio", "voz"],
  ];
  for (const [reA, reB, a, b] of pairs) {
    if (reA.test(lower) && reB.test(lower)) return [a, b];
  }
  return null;
}

/** Detecta tríade "X, Y e Z" de termos com peso. */
function detectTriad(text: string): [string, string, string] | null {
  // Procura padrão "<a>, <b> e <c>" onde a, b, c são palavras únicas (não phrases)
  const m = text.match(/\b([a-záéíóúâêôãõç]{4,15})\s*,\s*([a-záéíóúâêôãõç]{4,15})\s+e\s+([a-záéíóúâêôãõç]{4,15})\b/i);
  if (m && !STOP.has(m[1].toLowerCase()) && !STOP.has(m[2].toLowerCase()) && !STOP.has(m[3].toLowerCase())) {
    return [m[1], m[2], m[3]];
  }
  return null;
}

export function inferDiagram(
  acto: "pergunta" | "situacao" | "revelacao" | "gesto" | "frase",
  text: string,
  isFirstBlock: boolean,
): Diagram | null {
  if (!text || text.length < 10) return null;

  // 1. Frase final SEMPRE: âncora com a palavra mais forte. É o monumento
  //    do slide, faz sentido destacar uma palavra.
  if (acto === "frase") {
    const word = topConcept(text);
    if (word) return { type: "circulo", terms: [word] };
  }

  // 2. Sequência se houver passos numerados (sobretudo em Gesto). Padrão
  //    mais específico, testar primeiro.
  const steps = detectSteps(text);
  if (steps) return { type: "sequencia", terms: steps };

  // 3. Pareado se há opostos óbvios.
  const opposites = detectOpposites(text);
  if (opposites) return { type: "pareado", terms: [opposites[0], opposites[1]] };

  // 4. Tríade se há "X, Y e Z".
  const triad = detectTriad(text);
  if (triad) return { type: "triade", terms: [triad[0], triad[1], triad[2]] };

  // SEM fallback universal: extrair uma palavra "forte" automaticamente
  // tem o problema de a palavra escolhida raramente ser A chave da
  // mensagem. Slides narrativos sem padrão claro ficam sem diagrama —
  // melhor que destacar a palavra errada.
  return null;
}
