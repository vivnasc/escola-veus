import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * POST /api/admin/courses/submit-animation
 *
 * Submit animation for a SINGLE scene to Runway or Hailuo.
 * Does NOT wait for completion — use animation-status to poll.
 *
 * Body: { imageUrl, motionPrompt, provider?: "runway" | "hailuo" }
 * Returns: { taskId, provider }
 */
export async function POST(req: NextRequest) {
  try {
    const { imageUrl, motionPrompt, provider = "runway", ratio = "1280:720" } = await req.json();

    if (!imageUrl || !motionPrompt) {
      return NextResponse.json(
        { erro: "imageUrl e motionPrompt obrigatorios." },
        { status: 400 },
      );
    }

    if (provider === "runway") {
      const apiKey = process.env.RUNWAY_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ erro: "RUNWAY_API_KEY nao configurada." }, { status: 400 });
      }

      const res = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06",
        },
        body: JSON.stringify({
          model: "gen4_turbo",
          promptImage: imageUrl,
          promptText: motionPrompt,
          duration: 10,
          ratio,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json(
          { erro: `Runway ${res.status}: ${errText.slice(0, 200)}` },
          { status: 500 },
        );
      }

      const { id } = await res.json();
      if (!id) {
        return NextResponse.json({ erro: "Runway nao devolveu task ID." }, { status: 500 });
      }

      return NextResponse.json({ taskId: id, provider: "runway" });
    }

    // Hailuo via fal.ai
    const apiKey = process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json({ erro: "FAL_KEY nao configurada." }, { status: 400 });
    }

    const res = await fetch("https://queue.fal.run/fal-ai/minimax/video-01-live/image-to-video", {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: motionPrompt,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { erro: `Hailuo ${res.status}: ${errText.slice(0, 200)}` },
        { status: 500 },
      );
    }

    const data = await res.json();
    const taskId = data.request_id;
    if (!taskId) {
      return NextResponse.json({ erro: "Hailuo nao devolveu request_id." }, { status: 500 });
    }

    return NextResponse.json({ taskId, provider: "hailuo" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
