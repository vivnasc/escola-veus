import { NextRequest, NextResponse } from "next/server";
import seed from "@/data/vc-sabia-frases.seed.json";

export const maxDuration = 120;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/bulk-month
 *
 * Gera plano para todos os dias de um mes:
 *  - Itera 1..N (N = dias do mes)
 *  - Cada dia: rotaciona frase (seed) + motion (library) + audio
 *    (motion.mood -> active)
 *  - Escreve manifest individual por dia
 *  - Despacha workflow render-vc-sabia.yml para cada (em paralelo)
 *  - Persiste batch metadata em
 *    course-assets/vc-sabia-batches/<batchId>.json
 *
 * Body: { year, month, startDay? = 1, postsPerDay = 1 }
 * Returns: { batchId, jobs: [{ day, date, jobId, phrase, motionName }] }
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

type PlanEntry = {
  day: number;
  date: string;
  dateLabel: string;
  phrase: string;
  phraseId?: string;
  phraseTheme?: string;
  motionName: string;
  motionUrl: string;
  audioUrl: string | null;
};

export async function POST(req: NextRequest) {
  let body: {
    year?: number;
    month?: number;
    startDay?: number;
    endDay?: number;
    phraseStartIndex?: number;
    motionStartIndex?: number;
    plan?: PlanEntry[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }

  const year = Number(body.year);
  const month = Number(body.month); // 1-12
  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json(
      { erro: "year + month obrigatorios (month 1-12)" },
      { status: 400 }
    );
  }
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startDay = Math.max(1, Math.min(daysInMonth, Number(body.startDay ?? 1)));
  const endDay = Math.max(startDay, Math.min(daysInMonth, Number(body.endDay ?? daysInMonth)));
  const phraseStartIndex = Math.max(0, Number(body.phraseStartIndex ?? 0));
  const motionStartIndex = Math.max(0, Number(body.motionStartIndex ?? 0));
  const explicitPlan = Array.isArray(body.plan) ? body.plan : null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // 1) Carregar motions + tags + active audios
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
      const parsed = JSON.parse(await tagsRes.data.text());
      motionTags = parsed.tags || {};
    } catch {
      /* ignore */
    }
  }

  let activeAudios: Record<string, string> = {};
  if (audiosRes.data) {
    try {
      const parsed = JSON.parse(await audiosRes.data.text());
      activeAudios = parsed.active || {};
    } catch {
      /* ignore */
    }
  }

  if (motions.length === 0) {
    return NextResponse.json(
      { erro: "Motion library vazio. Sobe MP4s primeiro." },
      { status: 400 }
    );
  }
  if (seed.frases.length === 0) {
    return NextResponse.json(
      { erro: "Seed de frases vazio." },
      { status: 400 }
    );
  }

  // 2) Calcular range de dias a renderizar
  const days: number[] = [];
  for (let d = startDay; d <= endDay; d++) days.push(d);

  const rangeSuffix =
    startDay === 1 && endDay === daysInMonth
      ? "full"
      : `d${String(startDay).padStart(2, "0")}-d${String(endDay).padStart(2, "0")}`;
  const batchId = `vc-sabia-${year}-${String(month).padStart(2, "0")}-${rangeSuffix}-${Date.now()}`;

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN nao configurada" },
      { status: 500 }
    );
  }
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";

  // 3) Para cada dia: pick + manifest + dispatch
  const jobs: Array<{
    day: number;
    date: string;
    jobId: string;
    phraseId: string;
    phraseText: string;
    phraseTheme: string;
    motionName: string;
    motionUrl: string;
    audioUrl: string | null;
  }> = [];

  // Lista efectiva: vem do plan explicito (com edits da UI) ou auto-pick
  type IterEntry = {
    day: number;
    date: string;
    dateLabel: string;
    motionUrl: string;
    motionName: string;
    audioUrl: string | null;
    phrase: string;
    phraseId: string;
    phraseTheme: string;
  };
  const iter: IterEntry[] = explicitPlan
    ? explicitPlan.map((p) => ({
        day: p.day,
        date: p.date,
        dateLabel: p.dateLabel,
        motionUrl: p.motionUrl,
        motionName: p.motionName,
        audioUrl: p.audioUrl,
        phrase: p.phrase,
        phraseId: p.phraseId || "",
        phraseTheme: p.phraseTheme || "",
      }))
    : days.map((day, i) => {
        const date = new Date(Date.UTC(year, month - 1, day));
        const phrase = seed.frases[(i + phraseStartIndex) % seed.frases.length];
        const motion = motions[(i + motionStartIndex) % motions.length];
        const mood = motionTags[motion.name];
        const audioUrl = mood ? activeAudios[mood] ?? null : null;
        return {
          day,
          date: ymd(date),
          dateLabel: formatDatePT(date),
          motionUrl: motion.url,
          motionName: motion.name,
          audioUrl,
          phrase: phrase.texto,
          phraseId: phrase.id,
          phraseTheme: phrase.tema,
        };
      });

  for (const entry of iter) {
    const jobId = `${batchId}-d${String(entry.day).padStart(2, "0")}`;
    const manifest = {
      jobId,
      batchId,
      day: entry.day,
      date: entry.date,
      motionUrl: entry.motionUrl,
      audioUrl: entry.audioUrl,
      phrase: entry.phrase,
      phraseId: entry.phraseId,
      phraseTheme: entry.phraseTheme,
      dateLabel: entry.dateLabel,
      durationSec: 12,
      createdAt: new Date().toISOString(),
    };

    await supabase.storage.from("course-assets").upload(
      `render-jobs/${jobId}.json`,
      JSON.stringify(manifest, null, 2),
      { contentType: "application/json", upsert: true }
    );
    await supabase.storage.from("course-assets").upload(
      `render-jobs/${jobId}-result.json`,
      JSON.stringify({ jobId, status: "queued", progress: 0 }, null, 2),
      { contentType: "application/json", upsert: true }
    );

    jobs.push({
      day: entry.day,
      date: entry.date,
      jobId,
      phraseId: entry.phraseId,
      phraseText: entry.phrase,
      phraseTheme: entry.phraseTheme,
      motionName: entry.motionName,
      motionUrl: entry.motionUrl,
      audioUrl: entry.audioUrl,
    });
  }

  // 4) Persistir batch metadata
  const batchData = {
    batchId,
    year,
    month,
    startDay,
    endDay,
    createdAt: new Date().toISOString(),
    jobs: jobs.map((j) => ({
      day: j.day,
      date: j.date,
      jobId: j.jobId,
      phraseId: j.phraseId,
      phraseText: j.phraseText,
      phraseTheme: j.phraseTheme,
      motionName: j.motionName,
      audioUrl: j.audioUrl,
    })),
  };
  await supabase.storage.from("course-assets").upload(
    `vc-sabia-batches/${batchId}.json`,
    JSON.stringify(batchData, null, 2),
    { contentType: "application/json", upsert: true }
  );

  // 5) Dispatch workflows (sequencial com pequeno delay para evitar
  //    estourar rate limit do GitHub API).
  let dispatched = 0;
  let failed = 0;
  for (const j of jobs) {
    const ghRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/render-vc-sabia.yml/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref, inputs: { jobId: j.jobId } }),
      }
    );
    if (ghRes.ok) dispatched++;
    else failed++;
    // 250ms entre dispatches
    await new Promise((r) => setTimeout(r, 250));
  }

  return NextResponse.json({
    batchId,
    jobs: jobs.length,
    dispatched,
    failed,
    workflowsUrl: `https://github.com/${owner}/${repo}/actions/workflows/render-vc-sabia.yml`,
  });
}
