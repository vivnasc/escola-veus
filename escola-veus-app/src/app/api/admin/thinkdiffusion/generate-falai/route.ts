import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

/**
 * POST /api/admin/thinkdiffusion/generate-falai
 *
 * Generates realistic nature images via fal.ai (Flux Pro).
 * No LoRA, no ThinkDiffusion — just fal.ai API directly.
 *
 * Body: { prompt, negativePrompt?, width?, height?, category?, filename? }
 * Returns: { url } (Supabase public URL)
 */

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      width = 1920,
      height = 1080,
      category = "misc",
      filename = `img-${Date.now()}.png`,
    } = await req.json();

    if (!prompt) {
      return NextResponse.json({ erro: "prompt obrigatorio." }, { status: 400 });
    }

    const apiKey = process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json({ erro: "FAL_KEY nao configurada." }, { status: 500 });
    }

    // Generate with Flux Pro 1.1 (realistic, high quality)
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
      const err = await res.text().catch(() => "");
      return NextResponse.json(
        { erro: `fal.ai HTTP ${res.status}: ${err.slice(0, 200)}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ erro: "fal.ai nao devolveu imagem." }, { status: 500 });
    }

    // Upload to Supabase
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ url: imageUrl });
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json({ url: imageUrl });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const filePath = `youtube/images/${category}/${filename}`;
    const buffer = new Uint8Array(await imgRes.arrayBuffer());

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, buffer, { contentType: "image/png", upsert: true });

    if (error) {
      return NextResponse.json({ url: imageUrl });
    }

    return NextResponse.json({
      url: `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
