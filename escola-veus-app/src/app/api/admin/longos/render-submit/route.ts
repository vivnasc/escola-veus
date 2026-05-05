import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/longos/render-submit
 *
 * Dispatcha o workflow render-longo.yml em GitHub Actions. Mesmo padrão do
 * render-funil — manifest em Supabase, polling via render-status.
 *
 * Body (carrega o projecto longo do admin/longos/<slug>.json e usa narrationUrl
 * + clips + música escolhida):
 *   {
 *     slug: string,
 *     musicUrls: string[],          // 1+ tracks (Ancient Ground por norma)
 *     musicVolume?: number,         // default 0.15
 *     narrationVolume?: number,     // default 1.2
 *     crossfade?: number,           // default 1.0s
 *     includeBrand?: boolean        // default true
 *   }
 *
 * Returns: { jobId } para polling em /render-status?jobId=<id>
 */

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

type ProjectPrompt = {
  id: string;
  clipUrl?: string;
  clipDurationSec?: number;
};

type Project = {
  slug?: string;
  titulo?: string;
  narrationUrl?: string;
  prompts?: ProjectPrompt[];
  [k: string]: unknown;
};

export async function POST(req: NextRequest) {
  let body: {
    slug?: string;
    musicUrls?: string[];
    musicVolume?: number;
    narrationVolume?: number;
    crossfade?: number;
    includeBrand?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const { slug, musicUrls, musicVolume, narrationVolume, crossfade, includeBrand } = body;
  if (!slug) {
    return NextResponse.json({ erro: "slug obrigatório" }, { status: 400 });
  }
  if (!Array.isArray(musicUrls) || musicUrls.length === 0) {
    return NextResponse.json({ erro: "musicUrls[] obrigatório" }, { status: 400 });
  }

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  // Carrega o projecto.
  let project: Project;
  try {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .download(`admin/longos/${slug}.json`);
    if (error || !data) {
      return NextResponse.json({ erro: "Projecto não encontrado" }, { status: 404 });
    }
    project = JSON.parse(await data.text()) as Project;
  } catch (e) {
    return NextResponse.json(
      { erro: `Carregar projecto: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 },
    );
  }

  if (!project.narrationUrl) {
    return NextResponse.json(
      { erro: "Projecto não tem narração ainda — gera a narração primeiro." },
      { status: 400 },
    );
  }

  // Filtra prompts com clipUrl. A ordem da array dos prompts é a ordem de
  // reprodução. Sem clipUrl → cena ainda não gravada → não entra no render.
  const clipsForRender = (project.prompts ?? [])
    .filter((p) => p.clipUrl)
    .map((p) => ({
      url: p.clipUrl as string,
      durationSec: p.clipDurationSec ?? 0,
    }));

  if (clipsForRender.length === 0) {
    return NextResponse.json(
      { erro: "Nenhum prompt tem clip carregado. Faz upload dos MJ Video clips primeiro." },
      { status: 400 },
    );
  }

  const jobId = `longo-${slug}-${Date.now()}`;

  const manifest = {
    jobId,
    title: project.titulo || slug,
    slug,
    narrationUrl: project.narrationUrl,
    clips: clipsForRender,
    musicUrls,
    musicVolume: typeof musicVolume === "number" ? musicVolume : 0.15,
    narrationVolume: typeof narrationVolume === "number" ? narrationVolume : 1.2,
    crossfade: typeof crossfade === "number" ? crossfade : 1.0,
    includeBrand: includeBrand !== false,
    createdAt: new Date().toISOString(),
  };

  // Upload manifest
  const manifestBody = JSON.stringify(manifest, null, 2);
  const { error: upErr } = await supabase.storage
    .from("course-assets")
    .upload(`longo-render-jobs/${jobId}.json`, manifestBody, {
      contentType: "application/json",
      upsert: true,
    });
  if (upErr) {
    return NextResponse.json(
      { erro: `Upload manifest: ${upErr.message}` },
      { status: 500 },
    );
  }

  // Initial result.json (status queued — UI vê imediatamente)
  await supabase.storage
    .from("course-assets")
    .upload(
      `longo-render-jobs/${jobId}-result.json`,
      JSON.stringify(
        {
          jobId,
          status: "queued",
          progress: 0,
          title: project.titulo,
          slug,
          updatedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      { contentType: "application/json", upsert: true },
    );

  // Dispatch GitHub Actions
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = process.env.GITHUB_WORKFLOW_FILE_LONGO || "render-longo.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;

  if (!token) {
    return NextResponse.json(
      { erro: "GITHUB_DISPATCH_TOKEN não configurada" },
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
      { erro: `GitHub dispatch (${ghRes.status}): ${errText.slice(0, 300)}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ jobId });
}
