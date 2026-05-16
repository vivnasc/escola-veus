import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/render-cancel
 *
 * Marca job como cancelled no result.json (UI move-se em frente) e
 * best-effort cancela o workflow run no GitHub Actions (procura por
 * runs in_progress/queued com display_title que contem jobId).
 *
 * Body: { jobId }
 * Returns: { ok, cancelled: boolean, runId?: number, ghCancelStatus?: string }
 */
export async function POST(req: NextRequest) {
  let body: { jobId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }
  const jobId = body.jobId?.trim();
  if (!jobId) {
    return NextResponse.json({ erro: "jobId em falta" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // 1) Marca o result como cancelled (UI imediata)
  await supabase.storage.from("course-assets").upload(
    `render-jobs/${jobId}-result.json`,
    JSON.stringify(
      {
        jobId,
        status: "failed",
        progress: 0,
        error: "Cancelado manualmente pela utilizadora",
        cancelledAt: new Date().toISOString(),
      },
      null,
      2
    ),
    { contentType: "application/json", upsert: true }
  );

  // 2) Best-effort cancelar o GH Actions run
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER || "vivnasc";
  const repo = process.env.GITHUB_REPO_NAME || "escola-veus";
  const workflowFile = "render-vc-sabia.yml";

  let runId: number | undefined;
  let ghCancelStatus: string | undefined;

  if (token) {
    try {
      // Procura runs queued + in_progress recentes
      for (const status of ["in_progress", "queued"]) {
        const listRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/runs?status=${status}&per_page=50`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );
        if (!listRes.ok) continue;
        const listJson = (await listRes.json()) as {
          workflow_runs?: Array<{ id: number; display_title?: string; name?: string }>;
        };
        const match = (listJson.workflow_runs || []).find((r) => {
          const title = `${r.display_title || ""} ${r.name || ""}`;
          return title.includes(jobId);
        });
        if (match) {
          runId = match.id;
          break;
        }
      }

      if (runId) {
        const cancelRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/cancel`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );
        ghCancelStatus = cancelRes.ok ? "cancelled" : `failed ${cancelRes.status}`;
      } else {
        ghCancelStatus = "run nao encontrado (talvez ja terminou)";
      }
    } catch (e) {
      ghCancelStatus = `excepcao: ${e instanceof Error ? e.message : String(e)}`;
    }
  } else {
    ghCancelStatus = "GITHUB_DISPATCH_TOKEN nao configurada";
  }

  return NextResponse.json({
    ok: true,
    cancelled: true,
    runId,
    ghCancelStatus,
  });
}
