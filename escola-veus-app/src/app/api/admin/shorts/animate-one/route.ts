import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * POST /api/admin/shorts/animate-one
 *
 * Gera UM clip vertical (9:16) via Runway Gen-4. Sem SSE — resposta JSON
 * final. Pensado para gerar 1 a 1 para permitir controlo de qualidade e
 * regeneracao individual.
 *
 * Body: {
 *   imageUrl: string,
 *   motionPrompt: string,
 *   label?: string,      // promptId da imagem, usado no nome do ficheiro
 *   durationSec?: 5 | 10 // default 10
 * }
 *
 * Returns: { url, path }  ou  { erro }
 */

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, motionPrompt, label, durationSec } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ erro: "imageUrl obrigatorio." }, { status: 400 });
    }
    if (!motionPrompt || typeof motionPrompt !== "string") {
      return NextResponse.json({ erro: "motionPrompt obrigatorio." }, { status: 400 });
    }

    const duration = durationSec === 5 ? 5 : 10;
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { erro: "RUNWAY_API_KEY nao configurada." },
        { status: 500 },
      );
    }

    // 1. Submit
    const createRes = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
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
        duration,
        ratio: "720:1280",
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      return NextResponse.json(
        { erro: `Runway create: ${createRes.status} — ${err.slice(0, 300)}` },
        { status: 502 },
      );
    }
    const { id: taskId } = await createRes.json();
    if (!taskId) {
      return NextResponse.json({ erro: "Runway nao devolveu task ID." }, { status: 502 });
    }

    // 2. Poll
    const maxAttempts = 60;
    const pollInterval = 5000;
    let videoUrl = "";
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, pollInterval));
      const statusRes = await fetch(
        `https://api.dev.runwayml.com/v1/tasks/${taskId}`,
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
        return NextResponse.json(
          { erro: `Runway falhou: ${status.failure || "erro"}` },
          { status: 502 },
        );
      }
      if (status.status === "SUCCEEDED" && status.output?.length > 0) {
        videoUrl = status.output[0];
        break;
      }
    }
    if (!videoUrl) {
      return NextResponse.json(
        { erro: "Timeout: Runway nao completou em 5 minutos." },
        { status: 504 },
      );
    }

    // 3. Download
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      return NextResponse.json(
        { erro: "Nao consegui descarregar video Runway." },
        { status: 502 },
      );
    }
    const buf = await videoRes.arrayBuffer();

    // 4. Upload to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { erro: "Supabase nao configurado." },
        { status: 500 },
      );
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    const safeLabel =
      (label || "clip").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) ||
      "clip";
    const filePath = `shorts/clips/${safeLabel}-${Date.now()}.mp4`;
    const { error: upErr } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(buf), {
        contentType: "video/mp4",
        upsert: true,
      });
    if (upErr) {
      return NextResponse.json(
        { erro: `Supabase upload: ${upErr.message}` },
        { status: 500 },
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
    return NextResponse.json({ url: publicUrl, path: filePath });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Excepcao: ${msg}` }, { status: 500 });
  }
}
