/**
 * Carrega histórico recente de contos AG para alimentar a memória
 * anti-repetição do generateAGStory + frequência de temas para o picker
 * generativo.
 *
 * Lê os últimos N planos AG em course-assets/weekly-social/<ano>-W<NN>/
 * ancient-ground-plan.json. Best-effort: falhas de IO degradam para
 * estrutura vazia.
 */

import { createSupabaseAdminClient } from "@/lib/supabase-server";
import type { RaizTema } from "@/lib/ag-raizes-temas";

export type RecentStory = { title: string; opening: string };

export type AGHistory = {
  stories: RecentStory[];
  /** Contagem de cada tema nas últimas `weeksBack` semanas — alimenta o
   *  picker generativo (pesos inverso-frequência). */
  temaCounts: Map<RaizTema, number>;
};

const BUCKET = "course-assets";
const WEEKLY_PREFIX = "weekly-social";

/** Lista deterministica de (year, week) retrocedendo `weeksBack` semanas
 *  a partir de (currentYear, currentWeek-1). */
function buildBackwardTargets(
  currentYear: number,
  currentWeek: number,
  weeksBack: number,
): { year: number; week: number }[] {
  const targets: { year: number; week: number }[] = [];
  let y = currentYear;
  let w = currentWeek - 1;
  for (let i = 0; i < weeksBack; i++) {
    if (w <= 0) {
      y -= 1;
      w = 52;
    }
    targets.push({ year: y, week: w });
    w -= 1;
  }
  return targets;
}

/** Carrega histórico completo (stories + tema counts) numa só passagem. */
export async function loadAGHistory(
  currentYear: number,
  currentWeek: number,
  options: { weeksBack?: number; maxStories?: number } = {},
): Promise<AGHistory> {
  const weeksBack = options.weeksBack ?? 6;
  const maxStories = options.maxStories ?? 12;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return { stories: [], temaCounts: new Map() };

  const admin = createSupabaseAdminClient();
  if (!admin) return { stories: [], temaCounts: new Map() };

  const targets = buildBackwardTargets(currentYear, currentWeek, weeksBack);

  const stories: RecentStory[] = [];
  const temaCounts = new Map<RaizTema, number>();

  await Promise.all(
    targets.map(async (t) => {
      const path = `${WEEKLY_PREFIX}/${t.year}-W${String(t.week).padStart(2, "0")}/ancient-ground-plan.json`;
      try {
        const url = `${base}/storage/v1/object/public/${BUCKET}/${path}?t=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const plan = await res.json() as {
          posts?: {
            storyTitle?: string;
            storyChapters?: string[];
            temas?: RaizTema[];
          }[];
        };
        for (const p of plan.posts || []) {
          if (p.storyTitle && p.storyChapters && p.storyChapters.length > 0) {
            stories.push({ title: p.storyTitle, opening: p.storyChapters[0] });
          }
          for (const tema of p.temas || []) {
            temaCounts.set(tema, (temaCounts.get(tema) ?? 0) + 1);
          }
        }
      } catch {
        /* ignora plan corrompido ou ausente */
      }
    }),
  );

  return { stories: stories.slice(0, maxStories), temaCounts };
}

/** @deprecated — usa loadAGHistory que devolve stories+counts numa só passagem. */
export async function loadRecentAGStories(
  currentYear: number,
  currentWeek: number,
  options: { weeksBack?: number; maxStories?: number } = {},
): Promise<RecentStory[]> {
  const h = await loadAGHistory(currentYear, currentWeek, options);
  return h.stories;
}
