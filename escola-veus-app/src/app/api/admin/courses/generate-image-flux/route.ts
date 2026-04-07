import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/generate-image-flux
 *
 * Generates images using Flux via fal.ai.
 * If a trained LoRA exists (active-lora.json in Supabase), uses flux-lora.
 * Otherwise falls back to Flux Pro 1.1.
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

    // Check if a trained LoRA exists
    const loraWeightsUrl = await getActiveLoraUrl();

    let res: Response;

    if (loraWeightsUrl) {
      // Use Flux LoRA with trained weights
      res = await fetch("https://fal.run/fal-ai/flux-lora", {
        method: "POST",
        headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          image_size: { width, height },
          num_images: 1,
          loras: [{ path: loraWeightsUrl, scale: 1.0 }],
          output_format: "png",
        }),
      });
    } else {
      // Fallback: Flux Pro 1.1 (no LoRA)
      res = await fetch("https://fal.run/fal-ai/flux-pro/v1.1", {
        method: "POST",
        headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          image_size: { width, height },
          num_images: 1,
          safety_tolerance: "5",
        }),
      });
    }

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ erro: `Flux: ${res.status} — ${err.slice(0, 200)}` }, { status: 500 });
    }

    const data = await res.json();
    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ erro: "Flux nao devolveu URL da imagem." }, { status: 500 });
    }

    // Upload to Supabase
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ url: imageUrl, lora: !!loraWeightsUrl });
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return NextResponse.json({ url: imageUrl, lora: !!loraWeightsUrl });

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const filename = `${sceneLabel || "scene"}-${Date.now()}.png`;
    const filePath = `courses/${courseSlug}/images/${filename}`;

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(await imgRes.arrayBuffer()), { contentType: "image/png", upsert: true });

    if (error) return NextResponse.json({ url: imageUrl, lora: !!loraWeightsUrl });

    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
    return NextResponse.json({ url, path: filePath, lora: !!loraWeightsUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

/**
 * Reads the active LoRA weights URL from Supabase Storage.
 * Returns null if no LoRA is trained yet.
 */
async function getActiveLoraUrl(): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return null;

    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/lora/active-lora.json`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const data = await res.json();
    return data.weightsUrl || null;
  } catch {
    return null;
  }
}
