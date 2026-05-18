/**
 * Calendário de prompts MJ para "Hoje, em Mim".
 *
 * Espelha o padrão da VC Sabia (`src/lib/vc-sabia/motions-library.ts`):
 * uma rotação determinística que, dada uma data de início e um nº de
 * dias, devolve qual MJ_VIDEO_PROMPT (e que mood áudio) corresponde a
 * cada dia. Para 6 meses de produção a partir de hoje, gera-se 180
 * entradas que ciclam os 30 prompts existentes 6 vezes.
 *
 * A rotação é por kicker do dia (mon..sun + dias especiais), preferindo
 * prompts cujo mood combine com o ritual do dia (MOOD_POR_DIA). Quando
 * não há match disponível ainda não usado, cicla pelo índice.
 *
 * Determinístico para o preview ser reproduzível e o calendário poder
 * ser usado como agenda de produção MJ.
 */

import { MJ_VIDEO_PROMPTS, type MjVideoPrompt } from "@/data/hoje-em-mim-mj-prompts";
import {
  detectDiaEspecial,
  type DiaSemana,
  type DiaEspecial,
} from "@/lib/hoje-em-mim/captions";
import { MOOD_POR_DIA, MOOD_ESPECIAL } from "@/lib/hoje-em-mim/pairing";

export type CalendarEntry = {
  date: Date;          // UTC date
  iso: string;         // YYYY-MM-DD
  dia: DiaSemana;
  especial: DiaEspecial | null;
  prompt: MjVideoPrompt;
};

const WEEKDAY: DiaSemana[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** Constrói a rotação de prompts MJ por dia, começando em startDate,
 *  durante `days` dias. Determinístico. */
export function dailyMjRotation(startDate: Date, days: number): CalendarEntry[] {
  const out: CalendarEntry[] = [];
  // Cursor por mood: garante que dentro do mesmo mood (preferido para
  // um dia) ciclamos pelos prompts disponíveis antes de repetir.
  const cursorByMood: Record<string, number> = {};
  // Cursor fallback quando nenhum mood-match disponível.
  let fallbackCursor = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate() + i
    ));
    const iso = d.toISOString().slice(0, 10);
    const dia = WEEKDAY[d.getUTCDay()];
    const especial = detectDiaEspecial(iso);

    const moodPref = especial
      ? MOOD_ESPECIAL[especial]
      : MOOD_POR_DIA[dia];

    let prompt: MjVideoPrompt | null = null;
    for (const m of moodPref) {
      const inMood = MJ_VIDEO_PROMPTS.filter((p) => p.audioMood === m);
      if (inMood.length === 0) continue;
      const cursor = cursorByMood[m] ?? 0;
      prompt = inMood[cursor % inMood.length];
      cursorByMood[m] = cursor + 1;
      break;
    }
    if (!prompt) {
      prompt = MJ_VIDEO_PROMPTS[fallbackCursor % MJ_VIDEO_PROMPTS.length];
      fallbackCursor++;
    }

    out.push({ date: d, iso, dia, especial, prompt });
  }
  return out;
}
