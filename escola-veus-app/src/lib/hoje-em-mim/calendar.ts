/**
 * Calendário de prompts MJ para "Hoje, em Mim".
 *
 * Espelha o padrão da VC Sabia (`docs/vc-sabia/CALENDARIO-IMAGENS-6MESES.md`
 * + `src/lib/vc-sabia/motions-library.ts`): dada uma data de início e
 * um nº de dias, devolve para cada dia a frase do ritual + o prompt
 * Midjourney alinhado.
 *
 * Alinhamento frase ↔ imagem (3 níveis):
 *  1. keyword: o substantivo da frase aparece no array `keywords` do
 *     prompt. Match na ordem de MJ_VIDEO_PROMPTS (prompts específicos
 *     como jasmim, baobá, chuva ganham antes de genéricos como vela).
 *  2. mood: cai para um prompt cujo audioMood case com o mood
 *     preferido do dia (MOOD_POR_DIA / MOOD_ESPECIAL).
 *  3. fallback: ciclo simples pelo índice.
 *
 * Determinístico: mesmo input devolve mesmo output, sem aleatoriedade.
 * Cada prompt tem o seu próprio cursor de uso, por isso variantes
 * de uma categoria só repetem depois de todas terem sido usadas.
 */

import seed from "@/data/hoje-em-mim-frases.seed.json";
import {
  MJ_VIDEO_PROMPTS,
  buildMjPrompt,
  type MjVideoPrompt,
} from "@/data/hoje-em-mim-mj-prompts";
import {
  detectDiaEspecial,
  type DiaSemana,
  type DiaEspecial,
} from "@/lib/hoje-em-mim/captions";
import { MOOD_POR_DIA, MOOD_ESPECIAL } from "@/lib/hoje-em-mim/pairing";

export type MatchMode = "keyword" | "mood" | "fallback";

export type CalendarEntry = {
  date: Date;
  iso: string;
  dia: DiaSemana;
  especial: DiaEspecial | null;
  fraseId: string;
  fraseTexto: string;
  /** Categoria escolhida para o dia (cada categoria tem N subjects). */
  category: MjVideoPrompt;
  /** Índice da variante dentro da categoria (0..subjects.length-1).
   *  Cada vez que uma categoria é escolhida o cursor avança, para que
   *  dois dias da mesma categoria recebam subjects diferentes. */
  variantIdx: number;
  /** Prompt MJ completo (subject + style suffix). */
  promptText: string;
  /** Motion Runway (igual a category.runwayMotion). */
  runwayMotion: string;
  matchMode: MatchMode;
  matchedKeyword?: string;
};

const WEEKDAY: DiaSemana[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function matchByKeyword(
  phrase: string
): { prompt: MjVideoPrompt; keyword: string } | null {
  const norm = normalize(phrase);
  for (const p of MJ_VIDEO_PROMPTS) {
    for (const kw of p.keywords ?? []) {
      const kn = normalize(kw);
      if (kn.includes(" ")) {
        // keyword multi-palavra (ex: "via láctea"): substring match
        if (norm.includes(kn)) return { prompt: p, keyword: kw };
      } else {
        // palavra inteira via \b. Tolera plural simples (+s) e
        // pontuação adjacente (vírgula, ponto, etc).
        const re = new RegExp(`\\b${kn}s?\\b`, "i");
        if (re.test(norm)) {
          return { prompt: p, keyword: kw };
        }
      }
    }
  }
  return null;
}

type FrasesData = {
  frases: Array<{ id: string; dia: DiaSemana; texto: string }>;
  frases_especiais?: Partial<
    Record<DiaEspecial, Array<{ id: string; texto: string }>>
  >;
};

const SEED = seed as unknown as FrasesData;

/** Constrói a rotação de frases + prompts MJ por dia.
 *
 *  Quando `usedFraseIds` é fornecido (do /api/usage-history), a
 *  rotação salta frases já publicadas em renders passados — só
 *  reusa quando o pool de frases novas se esgota. */
export function dailyMjRotation(
  startDate: Date,
  days: number,
  opts?: { usedFraseIds?: Set<string> | string[] }
): CalendarEntry[] {
  const usedSet =
    opts?.usedFraseIds instanceof Set
      ? opts.usedFraseIds
      : new Set(opts?.usedFraseIds ?? []);

  // Organiza frases por weekday, separando frescas vs já usadas
  const frasesPorDia: Record<DiaSemana, Array<{ id: string; texto: string }>> = {
    mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [],
  };
  for (const f of SEED.frases) frasesPorDia[f.dia].push({ id: f.id, texto: f.texto });
  // Ordena: frescas primeiro, usadas no fim (mantém ordem relativa)
  for (const dia of Object.keys(frasesPorDia) as DiaSemana[]) {
    const list = frasesPorDia[dia];
    const fresh = list.filter((f) => !usedSet.has(f.id));
    const used = list.filter((f) => usedSet.has(f.id));
    frasesPorDia[dia] = [...fresh, ...used];
  }
  const frasesEspeciais: Record<DiaEspecial, Array<{ id: string; texto: string }>> = {
    fim_mes: SEED.frases_especiais?.fim_mes ?? [],
    inicio_mes: SEED.frases_especiais?.inicio_mes ?? [],
    fim_ano: SEED.frases_especiais?.fim_ano ?? [],
    inicio_ano: SEED.frases_especiais?.inicio_ano ?? [],
  };
  // Mesmo tratamento para frases especiais
  for (const k of Object.keys(frasesEspeciais) as DiaEspecial[]) {
    const list = frasesEspeciais[k];
    const fresh = list.filter((f) => !usedSet.has(f.id));
    const used = list.filter((f) => usedSet.has(f.id));
    frasesEspeciais[k] = [...fresh, ...used];
  }

  const fraseCursor: Record<DiaSemana, number> = {
    mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0,
  };
  const especialCursor: Record<DiaEspecial, number> = {
    fim_mes: 0, inicio_mes: 0, fim_ano: 0, inicio_ano: 0,
  };
  // Cursor de variante por categoria: cada vez que uma categoria é
  // escolhida, o próximo subject (variante) é usado. Garante que
  // dias diferentes que matcham a mesma categoria recebem subjects
  // diferentes — visualização única em 180 dias.
  const variantCursor = new Map<string, number>();
  const promptUseCount = new Map<string, number>();
  const moodCursor: Record<string, number> = {};
  let fallbackCursor = 0;

  const out: CalendarEntry[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate() + i
      )
    );
    const iso = d.toISOString().slice(0, 10);
    const dia = WEEKDAY[d.getUTCDay()];
    const especial = detectDiaEspecial(iso);

    // Frase do dia (mesma lógica do buildItems do server)
    let frase: { id: string; texto: string } | null = null;
    if (especial && frasesEspeciais[especial].length > 0) {
      const pool = frasesEspeciais[especial];
      frase = pool[especialCursor[especial] % pool.length];
      especialCursor[especial]++;
    } else {
      const pool = frasesPorDia[dia];
      if (pool.length === 0) continue;
      frase = pool[fraseCursor[dia] % pool.length];
      fraseCursor[dia]++;
    }

    // Match: keyword → mood → fallback
    let category: MjVideoPrompt | null = null;
    let matchMode: MatchMode = "fallback";
    let matchedKeyword: string | undefined;

    const kwHit = matchByKeyword(frase.texto);
    if (kwHit) {
      category = kwHit.prompt;
      matchMode = "keyword";
      matchedKeyword = kwHit.keyword;
    } else {
      const moodPref = especial ? MOOD_ESPECIAL[especial] : MOOD_POR_DIA[dia];
      for (const m of moodPref) {
        const inMood = MJ_VIDEO_PROMPTS.filter((p) => p.audioMood === m);
        if (inMood.length === 0) continue;
        const cur = moodCursor[m] ?? 0;
        category = inMood[cur % inMood.length];
        moodCursor[m] = cur + 1;
        matchMode = "mood";
        break;
      }
      if (!category) {
        category = MJ_VIDEO_PROMPTS[fallbackCursor % MJ_VIDEO_PROMPTS.length];
        fallbackCursor++;
      }
    }

    const variantIdx = 0; // flat structure: 1 prompt per entry
    promptUseCount.set(category.id, (promptUseCount.get(category.id) ?? 0) + 1);

    out.push({
      date: d,
      iso,
      dia,
      especial,
      fraseId: frase.id,
      fraseTexto: frase.texto,
      category,
      variantIdx,
      promptText: category.prompt,
      runwayMotion: category.runwayMotion,
      matchMode,
      matchedKeyword,
    });
  }
  return out;
}

/** Estatísticas de uso de cada prompt no plano. */
export function rotationStats(entries: CalendarEntry[]): {
  byPrompt: Map<string, number>;
  byMode: Record<MatchMode, number>;
} {
  const byPrompt = new Map<string, number>();
  const byMode: Record<MatchMode, number> = {
    keyword: 0,
    mood: 0,
    fallback: 0,
  };
  for (const e of entries) {
    byPrompt.set(e.category.id, (byPrompt.get(e.category.id) ?? 0) + 1);
    byMode[e.matchMode]++;
  }
  return { byPrompt, byMode };
}
