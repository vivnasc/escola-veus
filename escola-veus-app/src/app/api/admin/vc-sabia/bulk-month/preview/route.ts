import { NextRequest, NextResponse } from "next/server";
import { loadMergedFrases } from "@/lib/vc-sabia/phrases";
import { loadUsageHistory } from "@/lib/vc-sabia/usage-history";
import { calendarContextFor, preferredThemesFor } from "@/lib/vc-sabia/calendar";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/bulk-month/preview
 *
 * Devolve o plano proposto para um range de dias SEM efeitos secundarios
 * (nao escreve manifests, nao dispara workflows). UI usa para mostrar
 * tabela editavel onde a utilizadora pode mudar frase por dia antes
 * de confirmar.
 *
 * Body: { year, month, startDay?, endDay?, phraseStartIndex?, motionStartIndex? }
 * Returns: { plan: Array<{ day, date, dateLabel, phrase, phraseId, motionName, motionUrl, audioUrl }> }
 */
const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatDatePT(d: Date) {
  return `${d.getUTCDate()} de ${MESES_PT[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

function ymd(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function POST(req: NextRequest) {
  let body: {
    year?: number;
    month?: number;
    startDay?: number;
    endDay?: number;
    phraseStartIndex?: number;
    motionStartIndex?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }

  const year = Number(body.year);
  const month = Number(body.month);
  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json({ erro: "year + month obrigatorios" }, { status: 400 });
  }
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startDay = Math.max(1, Math.min(daysInMonth, Number(body.startDay ?? 1)));
  const endDay = Math.max(startDay, Math.min(daysInMonth, Number(body.endDay ?? daysInMonth)));
  const phraseStartIndex = Math.max(0, Number(body.phraseStartIndex ?? 0));
  const motionStartIndex = Math.max(0, Number(body.motionStartIndex ?? 0));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const [motionsRes, tagsRes, audiosRes] = await Promise.all([
    supabase.storage.from("course-assets").list("vc-sabia-motions", {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    }),
    supabase.storage.from("course-assets").download("vc-sabia-meta/motion-tags.json"),
    supabase.storage.from("course-assets").download("vc-sabia-meta/active-audios.json"),
  ]);

  const motions = (motionsRes.data || [])
    .filter((f) => f.name && /\.(mp4|webm|mov)$/i.test(f.name))
    .map((f) => ({
      name: f.name!,
      url: `${supabaseUrl}/storage/v1/object/public/course-assets/vc-sabia-motions/${f.name}`,
    }));

  let motionTags: Record<string, string> = {};
  if (tagsRes.data) {
    try {
      motionTags = (JSON.parse(await tagsRes.data.text())).tags || {};
    } catch {
      /* ignore */
    }
  }

  let activeAudios: Record<string, string> = {};
  if (audiosRes.data) {
    try {
      activeAudios = (JSON.parse(await audiosRes.data.text())).active || {};
    } catch {
      /* ignore */
    }
  }

  if (motions.length === 0) {
    return NextResponse.json({ erro: "Motion library vazio" }, { status: 400 });
  }

  // Shuffle determinista (Fisher-Yates com seed) para variar a ordem dos
  // motions sem ser aleatorio a cada refresh. Seed = year*100+month.
  function deterministicShuffle<T>(arr: T[], seed: number): T[] {
    const a = [...arr];
    let s = seed;
    const next = () => {
      s = (s * 1664525 + 1013904223) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const frases = await loadMergedFrases(supabaseUrl);
  if (frases.length === 0) {
    return NextResponse.json({ erro: "Sem frases" }, { status: 400 });
  }

  const days: number[] = [];
  for (let d = startDay; d <= endDay; d++) days.push(d);

  // Carregar historico de uso (frases e motions ja usados em batches anteriores)
  const history = await loadUsageHistory(supabaseUrl, serviceKey);
  const allUsed = history.usedPhraseIds.size >= frases.length;
  const usedThisPlan = new Set<string>();

  // Helper: encontra a proxima frase nao usada, com vies para temas
  // preferidos consoante o contexto de calendario do dia. Cai para
  // cursor sequencial se nao houver match de tema.
  let phraseCursor = phraseStartIndex;
  const pickNextPhrase = (preferredThemes: string[]) => {
    // 1ª passagem: tenta cada tema preferido, em ordem, procurando
    // uma frase desse tema ainda nao usada (nem global nem no plano).
    for (const theme of preferredThemes) {
      for (let i = 0; i < frases.length; i++) {
        const idx = (phraseCursor + i) % frases.length;
        const p = frases[idx];
        if (p.tema !== theme) continue;
        if (history.usedPhraseIds.has(p.id)) continue;
        if (usedThisPlan.has(p.id)) continue;
        usedThisPlan.add(p.id);
        phraseCursor = idx + 1;
        return { phrase: p, reused: false, matchedTheme: true };
      }
    }
    // 2ª passagem: cursor sequencial sem filtro de tema (nao usadas)
    let attempts = 0;
    while (attempts < frases.length) {
      const p = frases[phraseCursor % frases.length];
      phraseCursor++;
      if (!history.usedPhraseIds.has(p.id) && !usedThisPlan.has(p.id)) {
        usedThisPlan.add(p.id);
        return { phrase: p, reused: false, matchedTheme: false };
      }
      if (allUsed && !usedThisPlan.has(p.id)) {
        usedThisPlan.add(p.id);
        return { phrase: p, reused: true, matchedTheme: false };
      }
      attempts++;
    }
    // Fallback ultimo recurso: usa qualquer uma
    const p = frases[phraseCursor % frases.length];
    phraseCursor++;
    return { phrase: p, reused: true, matchedTheme: false };
  };

  // Motions: não-usados primeiro (shuffled) + usados depois (shuffled).
  // Garante que motions novos que o user acabou de carregar têm prioridade.
  const shuffleSeed = year * 100 + month;
  const unusedMotions = deterministicShuffle(
    motions.filter((m) => !history.usedMotionNames.has(m.name)),
    shuffleSeed
  );
  const usedMotions = deterministicShuffle(
    motions.filter((m) => history.usedMotionNames.has(m.name)),
    shuffleSeed + 1
  );
  const orderedMotions = [...unusedMotions, ...usedMotions];

  const plan = days.map((day, i) => {
    const date = new Date(Date.UTC(year, month - 1, day));
    const ctx = calendarContextFor(year, month, day);
    const preferred = preferredThemesFor(ctx);
    const { phrase, reused: phraseReused, matchedTheme } = pickNextPhrase(preferred);
    const motion = orderedMotions[(i + motionStartIndex) % orderedMotions.length];
    const motionReused = history.usedMotionNames.has(motion.name);
    const mood = motionTags[motion.name];
    const audioUrl = mood ? activeAudios[mood] ?? null : null;

    return {
      day,
      date: ymd(date),
      dateLabel: formatDatePT(date),
      phrase: phrase.texto,
      phraseId: phrase.id,
      phraseTheme: phrase.tema,
      phraseReused,
      phraseThemeMatched: matchedTheme,
      calendarMarkers: ctx.markers,
      motionName: motion.name,
      motionUrl: motion.url,
      motionReused,
      audioUrl,
      mood: mood || null,
    };
  });

  return NextResponse.json({
    plan,
    history: {
      batchCount: history.batchCount,
      usedPhrases: history.usedPhraseIds.size,
      usedMotions: history.usedMotionNames.size,
      phrasesReusedInPlan: plan.filter((p) => p.phraseReused).length,
      motionsReusedInPlan: plan.filter((p) => p.motionReused).length,
    },
    summary: {
      year,
      month,
      startDay,
      endDay,
      days: plan.length,
      motionsAvailable: motions.length,
      phrasesAvailable: frases.length,
      motionsWithoutMood: plan.filter((p) => !p.mood).length,
      moodsWithoutActive: plan.filter((p) => p.mood && !p.audioUrl).length,
    },
  });
}
