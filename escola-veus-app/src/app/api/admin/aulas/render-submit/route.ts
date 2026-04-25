import { NextRequest, NextResponse } from "next/server";
import {
  buildSlideDeckFromConfig,
  DEFAULT_VOLUMES,
  type Acto,
  type LessonConfig,
} from "@/lib/course-slides";
import { getTerritoryTheme } from "@/data/territory-themes";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/aulas/render-submit
 *
 * Constroi o deck a partir do config (script + blockSplits + timings + AG +
 * volumes), escreve o manifest em course-assets/render-jobs/<jobId>.json e
 * despacha o workflow GitHub Actions `render-course-slide.yml`. Passa apenas
 * o jobId ao workflow.
 *
 * Body:
 *   { slug, module, sub, config: LessonConfig,
 *     defaults: { agTrack?, volumeDb? } }
 *
 * Retorna: { jobId, manifestUrl, workflowRunUrl }
 */
export async function POST(req: NextRequest) {
  let body: {
    slug?: string;
    module?: number | string;
    sub?: string;
    config?: LessonConfig;
    defaults?: { agTrack?: string | null; volumeDb?: Partial<Record<Acto, number>> };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON invalido" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim();
  const moduleNum = Number(body.module);
  const sub = String(body.sub ?? "").toLowerCase();
  if (!slug || !sub || !Number.isFinite(moduleNum)) {
    return NextResponse.json({ erro: "slug/module/sub obrigatorios" }, { status: 400 });
  }

  const config = body.config ?? {};
  const courseDefaults = body.defaults ?? { agTrack: null, volumeDb: {} };

  const deck = buildSlideDeckFromConfig(slug, moduleNum, sub, config);
  if (!deck) {
    return NextResponse.json({ erro: "Script nao encontrado" }, { status: 404 });
  }

  const agTrackName = config.agTrack || courseDefaults.agTrack;
  if (!agTrackName) {
    return NextResponse.json(
      { erro: "Faixa Ancient Ground nao escolhida (config.agTrack ou defaults.agTrack)" },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ erro: "NEXT_PUBLIC_SUPABASE_URL nao configurada" }, { status: 500 });
  }

  // Bucket de música = `audios` (público), separado de `course-assets`.
  // Mesmo path que /admin/producao/ancient-ground/montagem usa.
  const agTrackUrl = `${supabaseUrl}/storage/v1/object/public/audios/albums/ancient-ground/${encodeURIComponent(
    agTrackName,
  )}`;

  // Merge volumes: DEFAULT_VOLUMES < course defaults < per-lesson config
  const volumeDb: Record<Acto, number> = { ...DEFAULT_VOLUMES };
  if (courseDefaults.volumeDb) {
    for (const [k, v] of Object.entries(courseDefaults.volumeDb)) {
      if (typeof v === "number") volumeDb[k as Acto] = v;
    }
  }
  if (config.volumeDb) {
    for (const [k, v] of Object.entries(config.volumeDb)) {
      if (typeof v === "number") volumeDb[k as Acto] = v;
    }
  }

  const theme = getTerritoryTheme(slug);
  const accentColor = theme?.primary ?? "#C9A96E";

  const jobId = `aula-${slug}-m${moduleNum}-${sub}-${Date.now()}`;
  const outputPath = `curso-${slug}/videos/m${moduleNum}-${sub}.mp4`;

  const manifest = {
    jobId,
    slug,
    module: moduleNum,
    sub,
    deck,
    agTrackName,
    agTrackUrl,
    volumeDb,
    accentColor,
    outputPath,
    createdAt: new Date().toISOString(),
  };

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { erro: "SUPABASE_SERVICE_ROLE_KEY nao configurada" },
      { status: 500 },
    );
  }

  const { error: upErr } = await admin.storage
    .from("course-assets")
    .upload(`render-jobs/${jobId}.json`, JSON.stringify(manifest, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (upErr) {
    return NextResponse.json(
      { erro: `Upload manifest: ${upErr.message}` },
      { status: 500 },
    );
  }

  // Pseudo-result inicial (para a UI saber que ja foi despachado)
  await admin.storage
    .from("course-assets")
    .upload(
      `render-jobs/${jobId}-result.json`,
      JSON.stringify(
        {
          jobId,
          status: "queued",
          updatedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      { contentType: "application/json", upsert: true },
    );

  // Dispatch do workflow
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = "render-course-slide.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;

  if (!token) {
    return NextResponse.json(
      {
        erro: "GITHUB_DISPATCH_TOKEN nao configurada. Cria PAT com scope workflow e mete em Vercel env.",
      },
      { status: 500 },
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
    body: JSON.stringify({ ref, inputs: { jobId } }),
  });

  if (!ghRes.ok) {
    const errText = await ghRes.text();
    return NextResponse.json(
      { erro: `GitHub dispatch falhou (${ghRes.status}): ${errText.slice(0, 400)}` },
      { status: 502 },
    );
  }

  return NextResponse.json({
    jobId,
    manifestUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/render-jobs/${jobId}.json`,
    workflowRunUrl: `https://github.com/${owner}/${repo}/actions/workflows/${workflowFile}`,
    slides: deck.slides.length,
    totalDurationSec: deck.totalDurationSec,
  });
}
