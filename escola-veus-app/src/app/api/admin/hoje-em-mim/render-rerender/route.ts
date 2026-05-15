import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

import { phraseToCaptions, type DiaSemana } from "@/lib/hoje-em-mim/captions";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/hoje-em-mim/render-rerender
 *
 * Re-renderiza um único dia de um job existente, opcionalmente com
 * overrides editados pela utilizadora (motion alternativo, áudio
 * alternativo, tema visual, ou frase reescrita).
 *
 * Padrão idêntico ao /api/admin/weekly/rerender:
 *  1. Lê o manifest do job
 *  2. Aplica overrides ao item indicado por dayIndex
 *  3. Reescreve o manifest e apaga o per-item file (sinaliza pending)
 *  4. Dispara o workflow render-hoje-em-mim com input onlyDayIndex
 *
 * Body: {
 *   jobId,
 *   dayIndex,
 *   overrides?: {
 *     motionUrl?, audioUrl?, theme?, fraseTexto?, durationSec?
 *   }
 * }
 *
 * Returns: { jobId, dayIndex, workflowRunUrl }
 */

type Body = {
  jobId?: string;
  dayIndex?: number;
  overrides?: {
    motionUrl?: string;
    audioUrl?: string | null;
    theme?: string;
    fraseTexto?: string;
    durationSec?: number;
  };
};

type ManifestItem = {
  dayIndex: number;
  date: string;
  dia: DiaSemana;
  fraseId: string;
  fraseTexto: string;
  motionUrl: string;
  audioUrl: string | null;
  theme?: string;
  durationSec: number;
  captions: { instagram: string; tiktok: string; whatsapp: string };
};

type Manifest = {
  jobId: string;
  items: ManifestItem[];
  [k: string]: unknown;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const jobId = (body.jobId || "").trim();
  if (!jobId) {
    return NextResponse.json({ erro: "jobId obrigatório" }, { status: 400 });
  }
  const dayIndex = Number(body.dayIndex);
  if (!Number.isInteger(dayIndex) || dayIndex < 0) {
    return NextResponse.json({ erro: "dayIndex inválido" }, { status: 400 });
  }

  const overrides = body.overrides || {};

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { erro: "SUPABASE_SERVICE_ROLE_KEY não configurada" },
      { status: 500 }
    );
  }

  const manifestPath = `render-jobs/${jobId}.json`;
  let manifest: Manifest;
  try {
    const { data, error } = await admin.storage
      .from("course-assets")
      .download(manifestPath);
    if (error || !data) {
      return NextResponse.json({ erro: "Manifest não encontrado" }, { status: 404 });
    }
    manifest = JSON.parse(await data.text()) as Manifest;
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }

  const itemIdx = manifest.items.findIndex((it) => it.dayIndex === dayIndex);
  if (itemIdx < 0) {
    return NextResponse.json(
      { erro: `dayIndex ${dayIndex} não está no manifest` },
      { status: 404 }
    );
  }

  const item = manifest.items[itemIdx];
  // Aplica overrides em cima do item original
  // Resolve URLs relativos para absolutos (worker GHA não aceita relativos).
  const origin =
    req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || "https://escola-veus.vercel.app";
  const resolveUrl = (u: string): string => {
    if (!u) return u;
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    if (u.startsWith("/")) return `${origin}${u}`;
    return u;
  };

  if (overrides.motionUrl !== undefined && overrides.motionUrl.trim()) {
    item.motionUrl = resolveUrl(overrides.motionUrl.trim());
  }
  if (overrides.audioUrl !== undefined) {
    item.audioUrl = overrides.audioUrl ? resolveUrl(overrides.audioUrl.trim()) : null;
  }
  if (overrides.theme !== undefined && overrides.theme.trim()) {
    item.theme = overrides.theme.trim();
  }
  if (overrides.fraseTexto !== undefined && overrides.fraseTexto.trim()) {
    item.fraseTexto = overrides.fraseTexto.trim();
    item.captions = phraseToCaptions({ phrase: item.fraseTexto, dia: item.dia });
  }
  if (overrides.durationSec !== undefined) {
    const d = Number(overrides.durationSec);
    if (Number.isFinite(d) && d >= 5 && d <= 60) item.durationSec = d;
  }

  manifest.items[itemIdx] = item;

  // Reescreve manifest
  const { error: mErr } = await admin.storage
    .from("course-assets")
    .upload(manifestPath, JSON.stringify(manifest, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (mErr) {
    return NextResponse.json(
      { erro: `Upload manifest: ${mErr.message}` },
      { status: 500 }
    );
  }

  // Apaga o per-item file se existir (sinaliza pending para a UI)
  await admin.storage
    .from("course-assets")
    .remove([`render-jobs/${jobId}-items/${dayIndex}.json`])
    .catch(() => {});

  // Dispara workflow com onlyDayIndex
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = "render-hoje-em-mim.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN não configurada" },
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
      inputs: {
        jobId,
        onlyDayIndex: String(dayIndex),
      },
    }),
  });
  if (!ghRes.ok) {
    const errText = await ghRes.text();
    return NextResponse.json(
      { erro: `GitHub dispatch falhou (${ghRes.status}): ${errText.slice(0, 400)}` },
      { status: 502 }
    );
  }

  return NextResponse.json({
    jobId,
    dayIndex,
    overrides,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}`,
  });
}
