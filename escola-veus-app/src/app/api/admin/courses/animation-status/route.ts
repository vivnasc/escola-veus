import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/animation-status
 *
 * Checks the status of Runway animation tasks.
 * Called by the frontend to poll for completion.
 *
 * Body: {
 *   tasks: Array<{ type: string, taskId: string }>,
 *   provider: "runway" | "hailuo",
 * }
 *
 * Returns: {
 *   tasks: Array<{ type: string, taskId: string, status: string, videoUrl: string | null, failureReason: string | null }>,
 *   allDone: boolean,
 * }
 */
export async function POST(req: NextRequest) {
  const { tasks, provider = "runway" } = await req.json();

  if (!tasks || !Array.isArray(tasks)) {
    return NextResponse.json({ erro: "tasks array obrigatorio." }, { status: 400 });
  }

  const results = await Promise.all(
    tasks.map(async (task: { type: string; taskId: string }) => {
      try {
        if (provider === "runway") {
          const apiKey = process.env.RUNWAY_API_KEY;
          if (!apiKey) return { ...task, status: "error", videoUrl: null, failureReason: "RUNWAY_API_KEY nao configurada" };

          const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${task.taskId}`, {
            headers: { Authorization: `Bearer ${apiKey}`, "X-Runway-Version": "2024-11-06" },
          });

          if (!res.ok) return { ...task, status: "polling_error", videoUrl: null, failureReason: `Runway devolveu ${res.status}` };
          const data = await res.json();

          if (data.status === "SUCCEEDED" && data.output?.length > 0) {
            return { ...task, status: "done", videoUrl: data.output[0], failureReason: null };
          }
          if (data.status === "FAILED") {
            const reason = data.failure || data.failureReason || "Runway falhou sem razao especifica";
            return { ...task, status: "failed", videoUrl: null, failureReason: reason };
          }
          return { ...task, status: "processing", videoUrl: null, failureReason: null };
        }

        // Hailuo via fal.ai
        const apiKey = process.env.FAL_KEY;
        if (!apiKey) return { ...task, status: "error", videoUrl: null, failureReason: "FAL_KEY nao configurada" };

        const res = await fetch(
          `https://queue.fal.run/fal-ai/minimax/video-01-live/image-to-video/status/${task.taskId}`,
          { headers: { Authorization: `Key ${apiKey}` } },
        );

        if (!res.ok) return { ...task, status: "polling_error", videoUrl: null, failureReason: `Hailuo devolveu ${res.status}` };
        const data = await res.json();

        if (data.status === "COMPLETED" && data.response_url) {
          const resultRes = await fetch(data.response_url, { headers: { Authorization: `Key ${apiKey}` } });
          if (resultRes.ok) {
            const result = await resultRes.json();
            return { ...task, status: "done", videoUrl: result.video?.url || null };
          }
        }
        if (data.status === "FAILED") return { ...task, status: "failed", videoUrl: null, failureReason: "Hailuo falhou" };
        return { ...task, status: "processing", videoUrl: null, failureReason: null };
      } catch (err) {
        const reason = err instanceof Error ? err.message : "Erro desconhecido ao verificar estado";
        return { ...task, status: "error", videoUrl: null, failureReason: reason };
      }
    }),
  );

  const terminalStatuses = new Set(["done", "failed", "error", "polling_error"]);
  const allDone = results.every((r) => terminalStatuses.has(r.status));
  const doneCount = results.filter((r) => r.status === "done").length;

  return NextResponse.json({ tasks: results, allDone, doneCount, total: results.length });
}
