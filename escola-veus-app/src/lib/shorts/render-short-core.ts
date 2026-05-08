/**
 * Núcleo do `render-short-submit` — extraído como função pure server-side.
 * A rota /api/admin/shorts/render-short-submit delega para esta função.
 */

import { createSupabaseAdminClient } from "@/lib/supabase-server";

export type RenderShortInput = {
  title?: string;
  slug?: string;
  clips: string[];
  clipDuration?: number;
  musicUrl?: string;
  musicVolume?: number;
  overlayPngs?: unknown;
  overlayStart?: unknown;
  overlayEnd?: unknown;
  thumbnailUrl?: string;
  seo?: unknown;
};

function sanitiseSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "short";
}

/** Lança Error em casos de input/config inválidos — caller decide HTTP status. */
export async function runRenderShortSubmit(input: RenderShortInput): Promise<{ jobId: string }> {
  const {
    title,
    slug: rawSlug,
    clips,
    clipDuration = 10,
    musicUrl,
    musicVolume = 0.9,
    overlayPngs,
    overlayStart,
    overlayEnd,
    thumbnailUrl,
    seo,
  } = input || {};

  if (!Array.isArray(clips) || clips.length === 0) {
    throw new Error("clips[] obrigatorio.");
  }
  const hasMusic = !!musicUrl;

  const admin = createSupabaseAdminClient();
  if (!admin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY nao configurada.");
  }

  const slug = sanitiseSlug(rawSlug || title || "short");
  const jobId = `short-${slug}-${Date.now()}`;

  const manifest = {
    jobId,
    title: title || "",
    slug,
    clips,
    clipDuration,
    musicUrl: hasMusic ? musicUrl : null,
    musicVolume: hasMusic ? musicVolume : 0,
    overlayPngs: overlayPngs || null,
    overlayStart: overlayStart || null,
    overlayEnd: overlayEnd || null,
    thumbnailUrl: thumbnailUrl || null,
    seo: seo || null,
    createdAt: new Date().toISOString(),
  };

  const manifestBody = JSON.stringify(manifest, null, 2);
  const { error: upErr } = await admin.storage
    .from("course-assets")
    .upload(`render-jobs/${jobId}.json`, manifestBody, {
      contentType: "application/json",
      upsert: true,
    });
  if (upErr) {
    throw new Error(`Upload manifest falhou: ${upErr.message}`);
  }

  const initialResult = {
    jobId,
    status: "queued",
    progress: 0,
    title,
    slug,
    updatedAt: new Date().toISOString(),
  };
  await admin.storage
    .from("course-assets")
    .upload(`render-jobs/${jobId}-result.json`, JSON.stringify(initialResult, null, 2), {
      contentType: "application/json",
      upsert: true,
    });

  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = process.env.GITHUB_WORKFLOW_FILE_SHORT || "render-short.yml";
  const ref = process.env.GITHUB_DISPATCH_REF || "main";
  const token = process.env.GITHUB_DISPATCH_TOKEN;

  if (!token) {
    throw new Error("GITHUB_DISPATCH_TOKEN nao configurada.");
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
    throw new Error(`GitHub dispatch falhou (${ghRes.status}): ${errText.slice(0, 400)}`);
  }

  return { jobId };
}
