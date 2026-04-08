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
 *   tasks: Array<{ type: string, taskId: string, status: string, videoUrl: string | null }>,
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
          if (!apiKey) return { ...task, status: "error", videoUrl: null };

          const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${task.taskId}`, {
            headers: { Authorization: `Bearer ${apiKey}`, "X-Runway-Version": "2024-11-06" },
          });

          if (!res.ok) return { ...task, status: "polling_error", videoUrl: null };
          const data = await res.json();

          if (data.status === "SUCCEEDED" && data.output?.length > 0) {
            return { ...task, status: "done", videoUrl: data.output[0] };
          }
          if (data.status === "FAILED") {
            return { ...task, status: "failed", videoUrl: null };
          }
          return { ...task, status: "processing", videoUrl: null };
        }

        // Hailuo via fal.ai
        const apiKey = process.env.FAL_KEY;
        if (!apiKey) return { ...task, status: "error", videoUrl: null };

        const res = await fetch(
          `https://queue.fal.run/fal-ai/minimax/video-01-live/image-to-video/status/${task.taskId}`,
          { headers: { Authorization: `Key ${apiKey}` } },
        );

        if (!res.ok) return { ...task, status: "polling_error", videoUrl: null };
        const data = await res.json();

        if (data.status === "COMPLETED" && data.response_url) {
          const resultRes = await fetch(data.response_url, { headers: { Authorization: `Key ${apiKey}` } });
          if (resultRes.ok) {
            const result = await resultRes.json();
            return { ...task, status: "done", videoUrl: result.video?.url || null };
          }
        }
        if (data.status === "FAILED") return { ...task, status: "failed", videoUrl: null };
        return { ...task, status: "processing", videoUrl: null };
      } catch {
        return { ...task, status: "error", videoUrl: null };
      }
    }),
  );

  const allDone = results.every((r) => r.status === "done" || r.status === "failed" || r.status === "error");
  const doneCount = results.filter((r) => r.status === "done").length;

  return NextResponse.json({ tasks: results, allDone, doneCount, total: results.length });
}
