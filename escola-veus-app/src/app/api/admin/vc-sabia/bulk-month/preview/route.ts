import { NextRequest, NextResponse } from "next/server";
import seed from "@/data/vc-sabia-frases.seed.json";

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
      sortBy: { column: "created_at", order: "asc" },
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

  const days: number[] = [];
  for (let d = startDay; d <= endDay; d++) days.push(d);

  const plan = days.map((day, i) => {
    const date = new Date(Date.UTC(year, month - 1, day));
    const phrase = seed.frases[(i + phraseStartIndex) % seed.frases.length];
    const motion = motions[(i + motionStartIndex) % motions.length];
    const mood = motionTags[motion.name];
    const audioUrl = mood ? activeAudios[mood] ?? null : null;

    return {
      day,
      date: ymd(date),
      dateLabel: formatDatePT(date),
      phrase: phrase.texto,
      phraseId: phrase.id,
      phraseTheme: phrase.tema,
      motionName: motion.name,
      motionUrl: motion.url,
      audioUrl,
      mood: mood || null,
    };
  });

  return NextResponse.json({
    plan,
    summary: {
      year,
      month,
      startDay,
      endDay,
      days: plan.length,
      motionsAvailable: motions.length,
      phrasesAvailable: seed.frases.length,
      motionsWithoutMood: plan.filter((p) => !p.mood).length,
      moodsWithoutActive: plan.filter((p) => p.mood && !p.audioUrl).length,
    },
  });
}
