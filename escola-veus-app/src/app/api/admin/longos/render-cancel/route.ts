import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/longos/render-cancel
 *
 * Cancela um render em curso:
 * 1. Patcha longo-render-jobs/<jobId>-result.json com status "cancelled"
 *    → cliente em polling vê e pára.
 * 2. Best-effort: lista workflow runs do GitHub Actions e tenta cancelar
 *    o run cujo nome corresponde ao jobId. Se falhar, render continua a
 *    correr no GitHub (gasta minutos) mas UX já está respondendo.
 *
 * Body: { jobId }
 * Returns: { ok, ghCancelled }
 */

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  let body: { jobId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const jobId = (body.jobId || "").trim();
  if (!jobId) {
    return NextResponse.json({ erro: "jobId obrigatório" }, { status: 400 });
  }

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  // 1. Patcha result.json para status cancelled (UX imediato)
  try {
    const resultPath = `longo-render-jobs/${jobId}-result.json`;
    let existing: Record<string, unknown> = {};
    try {
      const { data } = await supabase.storage
        .from("course-assets")
        .download(resultPath);
      if (data) existing = JSON.parse(await data.text());
    } catch {
      /* não existe ainda — escrever novo */
    }
    const updated = {
      ...existing,
      jobId,
      status: "cancelled",
      progress: existing.progress ?? 0,
      updatedAt: new Date().toISOString(),
      cancelledAt: new Date().toISOString(),
    };
    await supabase.storage
      .from("course-assets")
      .upload(resultPath, JSON.stringify(updated, null, 2), {
        contentType: "application/json",
        upsert: true,
      });
  } catch (e) {
    return NextResponse.json(
      { erro: `Patch result.json: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 },
    );
  }

  // 2. Best-effort: cancelar o workflow run no GitHub Actions
  let ghCancelled = false;
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = process.env.GITHUB_WORKFLOW_FILE_LONGO || "render-longo.yml";
  const token = process.env.GITHUB_DISPATCH_TOKEN;

  if (token) {
    try {
      // Lista runs recentes deste workflow (max 30)
      const listUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/runs?per_page=30`;
      const listRes = await fetch(listUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      if (listRes.ok) {
        const data = await listRes.json();
        const runs: { id: number; name: string; status: string }[] = data.workflow_runs ?? [];
        // Run name é "render-longo: <jobId>" (definido no yml run-name)
        const target = runs.find(
          (r) => r.name?.includes(jobId) && (r.status === "queued" || r.status === "in_progress"),
        );
        if (target) {
          const cancelUrl = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${target.id}/cancel`;
          const cancelRes = await fetch(cancelUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
          });
          ghCancelled = cancelRes.ok;
        }
      }
    } catch {
      /* GH cancel é best-effort; UX já tem o status cancelled */
    }
  }

  return NextResponse.json({ ok: true, ghCancelled });
}
