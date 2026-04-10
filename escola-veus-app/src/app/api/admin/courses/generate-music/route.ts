import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/generate-music
 *
 * Submits instrumental music generation to Suno via API.box.
 * Returns taskId immediately — frontend polls /music-status for result.
 *
 * Env: SUNO_API_KEY, SUNO_API_URL (https://apibox.erweima.ai)
 *
 * Body: { prompt?: string, courseSlug: string }
 * Returns: { taskId }
 */

const DEFAULT_PROMPT =
  "ambient piano, warm strings, contemplative, cinematic underscore, " +
  "gentle pads, meditative, no vocals, 80 BPM";

export async function POST(req: NextRequest) {
  try {
    const { prompt, courseSlug } = await req.json();

    if (!courseSlug) {
      return NextResponse.json({ erro: "courseSlug obrigatorio." }, { status: 400 });
    }

    const apiKey = process.env.SUNO_API_KEY;
    const apiUrl = process.env.SUNO_API_URL;
    if (!apiKey || !apiUrl) {
      return NextResponse.json({ erro: "SUNO_API_KEY e SUNO_API_URL obrigatorios." }, { status: 400 });
    }

    const baseUrl = apiUrl.replace(/\/+$/, "");

    const res = await fetch(`${baseUrl}/api/v1/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        customMode: false,
        instrumental: true,
        model: "V5_5",
        prompt: prompt || DEFAULT_PROMPT,
        callBackUrl: "https://escola.seteveus.space/api/webhook/suno",
      }),
    });

    const data = await res.json();
    const taskId = data?.data?.taskId || data?.taskId || data?.data?.data?.taskId || null;

    if (!taskId) {
      return NextResponse.json(
        { erro: "API.box nao devolveu taskId.", debug: data },
        { status: 500 },
      );
    }

    return NextResponse.json({ taskId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
