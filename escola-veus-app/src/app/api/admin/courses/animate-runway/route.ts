import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/animate-runway
 *
 * Generates animated video clips from still images using Runway Gen-4 API.
 * Falls back to Minimax Hailuo via fal.ai if Runway is unavailable.
 *
 * Body: {
 *   sourceImageUrl: string,       // URL of the source image
 *   motionPrompt: string,         // Animation description
 *   courseSlug: string,
 *   sceneLabel: string,           // e.g. "yt-hook0-abertura"
 *   durationSec?: 5 | 10,        // default 10
 *   provider?: "runway" | "hailuo" | "fal",
 * }
 *
 * Returns: { url: string, path: string, provider: string }
 */

type AnimationProvider = "runway" | "hailuo" | "fal";

async function animateWithRunway(
  imageUrl: string,
  motionPrompt: string,
  durationSec: number,
): Promise<ArrayBuffer> {
  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) throw new Error("RUNWAY_API_KEY nao configurada.");

  // 1. Create generation task
  const createRes = await fetch("https://api.runwayml.com/v1/image_to_video", {
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
      duration: durationSec,
      ratio: "1280:720",
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Runway create: ${createRes.status} — ${err}`);
  }

  const { id: taskId } = await createRes.json();
  if (!taskId) throw new Error("Runway nao devolveu task ID.");

  // 2. Poll for completion (max 5 minutes)
  const maxAttempts = 60;
  const pollInterval = 5000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const statusRes = await fetch(
      `https://api.runwayml.com/v1/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-Runway-Version": "2024-11-06",
        },
      },
    );

    if (!statusRes.ok) continue;

    const status = await statusRes.json();

    if (status.status === "FAILED") {
      throw new Error(`Runway falhou: ${status.failure || "erro desconhecido"}`);
    }

    if (status.status === "SUCCEEDED" && status.output?.length > 0) {
      const videoUrl = status.output[0];
      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) throw new Error(`Nao consegui descarregar video Runway.`);
      return videoRes.arrayBuffer();
    }
  }

  throw new Error("Timeout: Runway nao completou em 5 minutos.");
}

async function animateWithHailuo(
  imageUrl: string,
  motionPrompt: string,
  durationSec: number,
): Promise<ArrayBuffer> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY nao configurada (necessaria para Hailuo).");

  // 1. Submit to fal.ai Hailuo endpoint
  const submitRes = await fetch(
    "https://queue.fal.run/fal-ai/minimax/hailuo-02/standard/image-to-video",
    {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: motionPrompt,
        duration: durationSec <= 6 ? "6" : "10",
      }),
    },
  );

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`Hailuo submit: ${submitRes.status} — ${err}`);
  }

  const { request_id } = await submitRes.json();
  if (!request_id) throw new Error("Hailuo nao devolveu request_id.");

  // 2. Poll for completion (max 5 minutes)
  const maxAttempts = 60;
  const pollInterval = 5000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/minimax/hailuo-02/standard/image-to-video/status/${request_id}`,
      {
        headers: { Authorization: `Key ${apiKey}` },
      },
    );

    if (!statusRes.ok) continue;

    const status = await statusRes.json();

    if (status.status === "COMPLETED" && status.response_url) {
      const resultRes = await fetch(status.response_url, {
        headers: { Authorization: `Key ${apiKey}` },
      });
      if (!resultRes.ok) continue;

      const result = await resultRes.json();
      const videoUrl = result.video?.url;
      if (!videoUrl) throw new Error("Hailuo nao devolveu URL do video.");

      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) throw new Error("Nao consegui descarregar video Hailuo.");
      return videoRes.arrayBuffer();
    }

    if (status.status === "FAILED") {
      throw new Error(`Hailuo falhou: ${JSON.stringify(status)}`);
    }
  }

  throw new Error("Timeout: Hailuo nao completou em 5 minutos.");
}

export async function POST(req: NextRequest) {
  try {
    const {
      sourceImageUrl,
      motionPrompt,
      courseSlug,
      sceneLabel,
      durationSec = 10,
      provider: requestedProvider,
    } = await req.json();

    if (!sourceImageUrl || !motionPrompt || !courseSlug) {
      return NextResponse.json(
        { erro: "sourceImageUrl, motionPrompt e courseSlug obrigatorios." },
        { status: 400 },
      );
    }

    // Determine provider: use requested, or auto-detect based on available keys
    let provider: AnimationProvider = requestedProvider || "runway";
    if (provider === "runway" && !process.env.RUNWAY_API_KEY) {
      provider = process.env.FAL_KEY ? "hailuo" : "runway";
    }

    let videoBuffer: ArrayBuffer;

    if (provider === "hailuo" || provider === "fal") {
      videoBuffer = await animateWithHailuo(sourceImageUrl, motionPrompt, durationSec);
    } else {
      videoBuffer = await animateWithRunway(sourceImageUrl, motionPrompt, durationSec);
    }

    // Upload to Supabase Storage
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://tdytdamtfillqyklgrmb.supabase.co";

    if (!serviceKey) {
      return new NextResponse(videoBuffer, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="${sceneLabel || "clip"}.mp4"`,
        },
      });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const finalFilename = `${sceneLabel || "clip"}-${Date.now()}.mp4`;
    const filePath = `courses/${courseSlug}/animations/${finalFilename}`;

    const { error: uploadError } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(videoBuffer), {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { erro: `Upload: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
    return NextResponse.json({ url, path: filePath, provider });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Excepcao: ${msg}` }, { status: 500 });
  }
}
