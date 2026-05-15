import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

import seed from "@/data/hoje-em-mim-frases.seed.json";
import { phraseToCaptions, type DiaSemana } from "@/lib/hoje-em-mim/captions";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/**
 * POST /api/admin/hoje-em-mim/render-submit
 *
 * Submete um job de render BULK em RANGE para a produção "Hoje, em Mim".
 *
 * Pode pedir um intervalo de dias num mês (ex: 15 a 31 de Maio = 17 items).
 * O render real corre como matrix paralela no workflow render-hoje-em-mim.yml.
 *
 * Body: {
 *   jobId,
 *   ano (yyyy),
 *   mes (1-12),
 *   diaInicio (1-31),
 *   diaFim (diaInicio..31),
 *   motionPool: string[]  (URLs públicas, mínimo 1, roda entre eles),
 *   audioPool?: string[]  (URLs públicas, vazio para sem som),
 *   durationSec (default 15)
 * }
 *
 * Returns: { jobId, items, manifestUrl, workflowRunUrl }
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    jobId?: string;
    ano?: number;
    mes?: number;
    diaInicio?: number;
    diaFim?: number;
    motionPool?: string[];
    audioPool?: string[];
    durationSec?: number;
  };

  const jobId = (body.jobId || "").trim();
  if (!jobId) return NextResponse.json({ erro: "jobId obrigatório" }, { status: 400 });

  const ano = Number(body.ano);
  const mes = Number(body.mes);
  const diaInicio = Number(body.diaInicio);
  const diaFim = Number(body.diaFim);

  if (!Number.isInteger(ano) || ano < 2020 || ano > 2100) {
    return NextResponse.json({ erro: "ano inválido (2020-2100)" }, { status: 400 });
  }
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    return NextResponse.json({ erro: "mes inválido (1-12)" }, { status: 400 });
  }
  const diasNoMes = daysInMonth(ano, mes);
  if (!Number.isInteger(diaInicio) || diaInicio < 1 || diaInicio > diasNoMes) {
    return NextResponse.json(
      { erro: `diaInicio inválido (1-${diasNoMes} para ${MESES_PT[mes - 1]})` },
      { status: 400 }
    );
  }
  if (!Number.isInteger(diaFim) || diaFim < diaInicio || diaFim > diasNoMes) {
    return NextResponse.json(
      { erro: `diaFim tem de estar entre ${diaInicio} e ${diasNoMes}` },
      { status: 400 }
    );
  }

  const motionPool = Array.isArray(body.motionPool)
    ? body.motionPool.filter((u) => typeof u === "string" && u.length > 4)
    : [];
  if (motionPool.length === 0) {
    return NextResponse.json({ erro: "motionPool vazio. Adiciona pelo menos 1 motion." }, { status: 400 });
  }
  const audioPool = Array.isArray(body.audioPool)
    ? body.audioPool.filter((u) => typeof u === "string" && u.length > 4)
    : [];
  const durationSec = clamp(Number(body.durationSec ?? 15), 5, 60);

  const frases = seed.frases as Array<{ id: string; dia: DiaSemana; texto: string }>;
  const frasesPorDia: Record<DiaSemana, typeof frases> = {
    mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [],
  };
  for (const f of frases) frasesPorDia[f.dia].push(f);

  const startDate = isoDate(ano, mes, diaInicio);
  const numDays = diaFim - diaInicio + 1;

  const items = buildItems({
    startDate,
    numDays,
    motionPool,
    audioPool,
    durationSec,
    frasesPorDia,
  });

  if (items.length === 0) {
    return NextResponse.json({ erro: "Não consegui construir items." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { erro: "SUPABASE_SERVICE_ROLE_KEY nao configurada." },
      { status: 500 }
    );
  }

  const manifest = {
    jobId,
    ano,
    mes,
    mesLabel: MESES_PT[mes - 1],
    diaInicio,
    diaFim,
    startDate,
    numDays,
    durationSec,
    items,
    createdAt: new Date().toISOString(),
  };
  const manifestPath = `render-jobs/${jobId}.json`;
  const { error: mErr } = await admin.storage
    .from("course-assets")
    .upload(manifestPath, JSON.stringify(manifest, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (mErr) {
    return NextResponse.json(
      { erro: `Upload manifest falhou: ${mErr.message}` },
      { status: 500 }
    );
  }

  // Estado inicial. O ficheiro `<jobId>-result.json` guarda só metadata.
  // Os resultados por item ficam em `<jobId>-items/<dayIndex>.json`.
  // O status endpoint agrega.
  const initial = {
    jobId,
    status: "queued" as const,
    total: items.length,
    ano,
    mes,
    mesLabel: MESES_PT[mes - 1],
    diaInicio,
    diaFim,
    startDate,
    numDays,
    createdAt: new Date().toISOString(),
  };
  const { error: rErr } = await admin.storage
    .from("course-assets")
    .upload(`render-jobs/${jobId}-result.json`, JSON.stringify(initial, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (rErr) {
    return NextResponse.json(
      { erro: `Upload result inicial falhou: ${rErr.message}` },
      { status: 500 }
    );
  }

  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = "render-hoje-em-mim.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN nao configurada." },
      { status: 500 }
    );
  }

  const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`;
  const ghRes = await fetch(dispatchUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ref,
      inputs: { jobId },
    }),
  });
  if (!ghRes.ok) {
    const errText = await ghRes.text();
    return NextResponse.json(
      { erro: `GitHub dispatch falhou (${ghRes.status}): ${errText.slice(0, 400)}` },
      { status: 502 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return NextResponse.json({
    jobId,
    items: items.length,
    ano,
    mes,
    mesLabel: MESES_PT[mes - 1],
    diaInicio,
    diaFim,
    manifestUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/${manifestPath}`,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}`,
  });
}

type ManifestItem = {
  dayIndex: number;
  date: string;
  dia: DiaSemana;
  fraseId: string;
  fraseTexto: string;
  motionUrl: string;
  audioUrl: string | null;
  durationSec: number;
  captions: { instagram: string; tiktok: string; whatsapp: string };
};

function buildItems(opts: {
  startDate: string;
  numDays: number;
  motionPool: string[];
  audioPool: string[];
  durationSec: number;
  frasesPorDia: Record<DiaSemana, Array<{ id: string; dia: DiaSemana; texto: string }>>;
}): ManifestItem[] {
  const items: ManifestItem[] = [];
  const fraseCursor: Record<DiaSemana, number> = {
    mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0,
  };

  for (let i = 0; i < opts.numDays; i++) {
    const date = addDays(opts.startDate, i);
    const dia = diaFromIso(date);
    const pool = opts.frasesPorDia[dia];
    if (pool.length === 0) continue;

    const frase = pool[fraseCursor[dia] % pool.length];
    fraseCursor[dia]++;

    const motionUrl = opts.motionPool[i % opts.motionPool.length];
    const audioUrl =
      opts.audioPool.length > 0 ? opts.audioPool[i % opts.audioPool.length] : null;
    const captions = phraseToCaptions({ phrase: frase.texto, dia });

    items.push({
      dayIndex: i,
      date,
      dia,
      fraseId: frase.id,
      fraseTexto: frase.texto,
      motionUrl,
      audioUrl,
      durationSec: opts.durationSec,
      captions,
    });
  }
  return items;
}

function isoDate(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function daysInMonth(ano: number, mes: number): number {
  return new Date(ano, mes, 0).getDate();
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

function diaFromIso(iso: string): DiaSemana {
  const [y, m, d] = iso.split("-").map(Number);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as DiaSemana[])[w];
}

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}
