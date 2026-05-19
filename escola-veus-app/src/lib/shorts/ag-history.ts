/**
 * Carrega histórico recente de contos AG para alimentar a memória
 * anti-repetição do generateAGStory.
 *
 * Lê os últimos N planos AG em course-assets/weekly-social/<ano>-W<NN>/
 * ancient-ground-plan.json e devolve a tupla (título + 1ª linha) de cada
 * conto. Best-effort: falhas de IO degradam para lista vazia.
 */

import { createSupabaseAdminClient } from "@/lib/supabase-server";

export type RecentStory = { title: string; opening: string };

const BUCKET = "course-assets";
const WEEKLY_PREFIX = "weekly-social";

/** Carrega contos AG das últimas `weeksBack` semanas (excluindo a semana
 *  alvo, que está a ser gerada agora). Devolve até `maxStories` items,
 *  ordenados do mais recente para o mais antigo. */
export async function loadRecentAGStories(
  currentYear: number,
  currentWeek: number,
  options: { weeksBack?: number; maxStories?: number } = {},
): Promise<RecentStory[]> {
  const weeksBack = options.weeksBack ?? 6;
  const maxStories = options.maxStories ?? 12;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return [];

  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  // Constrói lista de (year, week) a verificar, retrocedendo no calendário.
  const targets: { year: number; week: number }[] = [];
  let y = currentYear;
  let w = currentWeek - 1;
  for (let i = 0; i < weeksBack; i++) {
    if (w <= 0) {
      y -= 1;
      w = 52; // aproximação — algumas semanas dão 53 mas trataríamos no fetch
    }
    targets.push({ year: y, week: w });
    w -= 1;
  }

  const out: RecentStory[] = [];
  await Promise.all(
    targets.map(async (t) => {
      const path = `${WEEKLY_PREFIX}/${t.year}-W${String(t.week).padStart(2, "0")}/ancient-ground-plan.json`;
      try {
        const url = `${base}/storage/v1/object/public/${BUCKET}/${path}?t=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const plan = await res.json() as {
          posts?: { storyTitle?: string; storyChapters?: string[] }[];
        };
        for (const p of plan.posts || []) {
          if (p.storyTitle && p.storyChapters && p.storyChapters.length > 0) {
            out.push({ title: p.storyTitle, opening: p.storyChapters[0] });
          }
        }
      } catch {
        /* ignora plan corrompido ou ausente */
      }
    }),
  );

  return out.slice(0, maxStories);
}
