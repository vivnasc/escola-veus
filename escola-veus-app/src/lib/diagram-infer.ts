/**
 * Inferência automática de diagrama. Regra única e estrita: SÓ a frase
 * final (acto V) ganha Âncora automática. Tudo o resto (passos, opostos,
 * tríades) tem risco de falso positivo em texto narrativo natural — fica
 * manual via editor contextual ou via Sugestão Claude.
 *
 * Razão: detectar "antes/depois" como pólos quando são apenas conjunções
 * temporais ("antes de ler, respira. e depois lê") gera diagramas que
 * não comunicam nada real e roubam atenção. Mais vale slide narrativo
 * limpo + tipografia + ambiente do que diagrama errado.
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

function topConcept(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[.,!?;:«»()"]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 5 && !STOP.has(w));
  if (words.length === 0) return "";
  return words[words.length - 1];
}

export function inferDiagram(
  acto: "pergunta" | "situacao" | "revelacao" | "gesto" | "frase",
  text: string,
  _isFirstBlock: boolean,
): Diagram | null {
  if (!text || text.length < 10) return null;

  // ÚNICA regra automática: Frase final ganha Âncora com a palavra mais
  // forte. É o monumento do slide e a chave é normalmente óbvia.
  if (acto === "frase") {
    const word = topConcept(text);
    if (word) return { type: "circulo", terms: [word] };
  }

  // Tudo o resto: null. Sem riscos de falso positivo.
  // - Detecção de passos numerados saiu (texto narrativo raramente tem)
  // - Detecção de opostos saiu ('antes/depois' triggava em narrativa)
  // - Detecção de tríade saiu (X, Y e Z é frequente sem ser conceito)
  //
  // Para diagrama em qualquer outro slide:
  //  - Manual: editor contextual → dropdown Diagrama
  //  - Sugestão Claude: /admin/producao/aulas/diagramas/<slug>
  return null;
}
