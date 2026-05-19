/**
 * Picker generativo Ancient Ground — substitui a AG_ROTATION hardcoded.
 *
 * Em vez de uma lista fixa de 40 tripletes (cycle ~13 semanas, 35% das
 * entradas com anciao), aqui combinamos 3 dos 15 RAIZES_TEMAS a cada
 * semana com pesos inverso-frequência derivados do histórico recente.
 *
 *   C(15,3) = 455 tripletes possíveis, com auto-equilíbrio: temas
 *   usados nas últimas 6 semanas ficam com peso baixo, sub-usados sobem
 *   à superfície. O sistema deixa de ser finito.
 *
 * É totalmente determinístico: para o mesmo (year, week, history) devolve
 * sempre o mesmo resultado. A não-determinação vem só do histórico real
 * que se acumula em Supabase.
 */

import {
  RAIZES_TEMAS,
  RAIZES_TEMA_LABELS,
  type RaizTema,
} from "@/lib/ag-raizes-temas";

export type AGEntry = {
  temas: [RaizTema, RaizTema, RaizTema];
  trackNumber: number;
  label: string;
};

/** Faixas AG disponíveis. O caller do plan tem fallback se a faixa não
 *  existir em Supabase, por isso este range generoso é seguro. */
const AG_TRACK_RANGE = 50;

/** Palavra evocativa para cada tema — usada para compor labels sem LLM.
 *  Mantida minimal e quotidiana para evitar o registo cliché "ancestral
 *  /transmissão" mesmo quando o tema é anciao. */
const TEMA_EVOCATIVO: Record<RaizTema, string> = {
  machamba: "lavoura",
  pesca: "mar",
  artesanato: "ofício",
  batuque: "tambor",
  danca: "dança",
  crianca: "criança",
  mercado: "mercado",
  anciao: "ancião",
  casa: "lar",
  transmissao: "passagem",
  "trabalho-coletivo": "mãos juntas",
  rito: "rito",
  aldeia: "aldeia",
  "gente-paisagem": "silhueta",
  retrato: "rosto",
};

/** mulberry32 PRNG — barato, suficiente para sampling weighted. */
function mulberry32(seedInit: number) {
  let s = seedInit >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function trackFromTemas(temas: readonly RaizTema[]): number {
  const canonical = [...temas].sort().join("+");
  return (hashString(canonical) % AG_TRACK_RANGE) + 1;
}

function composeLabel(temas: readonly RaizTema[]): string {
  const parts = temas.map((t) => TEMA_EVOCATIVO[t] ?? RAIZES_TEMA_LABELS[t] ?? t);
  // "X, Y e Z" — virgula simples, "e" final. Capitaliza só a primeira.
  const cap = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  if (parts.length === 1) return cap;
  if (parts.length === 2) return `${cap} e ${parts[1]}`;
  return `${cap}, ${parts.slice(1, -1).join(", ")} e ${parts[parts.length - 1]}`;
}

/** Sampling sem reposição com pesos. Itens com peso 0 nunca saem. */
function weightedSampleWithoutReplacement<T>(
  items: readonly T[],
  weightOf: (item: T) => number,
  k: number,
  rng: () => number,
): T[] {
  const remaining = items.slice();
  const out: T[] = [];
  while (out.length < k && remaining.length > 0) {
    const total = remaining.reduce((s, x) => s + Math.max(0, weightOf(x)), 0);
    if (total <= 0) {
      // Fallback uniforme se todos os pesos colapsaram a 0.
      const idx = Math.floor(rng() * remaining.length);
      out.push(remaining[idx]);
      remaining.splice(idx, 1);
      continue;
    }
    let r = rng() * total;
    let picked = 0;
    for (let i = 0; i < remaining.length; i++) {
      r -= Math.max(0, weightOf(remaining[i]));
      if (r <= 0) { picked = i; break; }
      picked = i;
    }
    out.push(remaining[picked]);
    remaining.splice(picked, 1);
  }
  return out;
}

/** Gera as 3 entradas AG de uma semana. O histórico de temas alimenta os
 *  pesos: cada tema usado nas últimas N semanas leva peso 1/(1+count).
 *  Os temas escolhidos em slots anteriores da MESMA semana também são
 *  penalizados, para não termos 3 slots todos com pesca, por exemplo. */
export function pickWeekAG(
  year: number,
  week: number,
  history: Map<RaizTema, number>,
  slotsPerWeek: number = 3,
): AGEntry[] {
  // Seed determinística — mesmo (year, week, history-vazio) devolve mesmo
  // resultado. Multiplicador grande para descorrelacionar do Loranne picker.
  const baseSeed = (year * 100000 + week * 173 + 4099) >>> 0;
  const rng = mulberry32(baseSeed);

  // Cópia mutável do histórico — vamos incrementar à medida que escolhemos
  // slots dentro da mesma semana, evitando repetições intra-week.
  const liveCounts = new Map<RaizTema, number>(history);

  const out: AGEntry[] = [];
  for (let slot = 0; slot < slotsPerWeek; slot++) {
    const temas = weightedSampleWithoutReplacement(
      RAIZES_TEMAS,
      (t) => 1 / (1 + (liveCounts.get(t) ?? 0)),
      3,
      rng,
    ) as [RaizTema, RaizTema, RaizTema];

    for (const t of temas) liveCounts.set(t, (liveCounts.get(t) ?? 0) + 1);

    out.push({
      temas,
      trackNumber: trackFromTemas(temas),
      label: composeLabel(temas),
    });
  }
  return out;
}

/** Variação por-slot — para call sites que ainda iteram slot a slot.
 *  Internamente chama pickWeekAG e devolve o slot pedido. */
export function pickAGSlot(
  year: number,
  week: number,
  slotIdx: number,
  history: Map<RaizTema, number>,
): AGEntry {
  const entries = pickWeekAG(year, week, history);
  return entries[slotIdx % entries.length];
}
