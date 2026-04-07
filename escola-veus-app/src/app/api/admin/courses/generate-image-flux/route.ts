import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/generate-image-flux
 *
 * Generates images using Flux Schnell via fal.ai (fast, ~2s per image).
 *
 * Body: {
 *   prompt: string,
 *   courseSlug: string,
 *   sceneLabel?: string,
 *   width?: number,   // default 1920
 *   height?: number,  // default 1080
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, courseSlug, sceneLabel, width = 1920, height = 1080 } = await req.json();

    if (!prompt || !courseSlug) {
      return NextResponse.json({ erro: "prompt e courseSlug obrigatorios." }, { status: 400 });
    }

    const apiKey = process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json({ erro: "FAL_KEY nao configurada." }, { status: 400 });
    }

    // Flux Pro 1.1 — high quality, ~10 seconds
    const res = await fetch("https://fal.run/fal-ai/flux-pro/v1.1", {
      method: "POST",
      headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        image_size: { width, height },
        num_images: 1,
        safety_tolerance: "5",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ erro: `Flux: ${res.status} — ${err.slice(0, 200)}` }, { status: 500 });
    }

    const data = await res.json();
    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ erro: "Flux nao devolveu URL da imagem." }, { status: 500 });
    }

    // Upload to Supabase if configured
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ url: imageUrl });
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return NextResponse.json({ url: imageUrl });

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const filename = `${sceneLabel || "scene"}-${Date.now()}.png`;
    const filePath = `courses/${courseSlug}/images/${filename}`;

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(await imgRes.arrayBuffer()), { contentType: "image/png", upsert: true });

    if (error) return NextResponse.json({ url: imageUrl });

    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
    return NextResponse.json({ url, path: filePath });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
