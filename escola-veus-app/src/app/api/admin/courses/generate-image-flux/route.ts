import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/generate-image-flux
 *
 * Generates images using Flux Kontext Pro via fal.ai.
 * Supports style reference images for consistent character/visual identity.
 *
 * Body: {
 *   prompt: string,                    // Scene description
 *   courseSlug: string,
 *   sceneLabel: string,                // e.g. "hook1-cena2-pergunta"
 *   referenceImageUrls?: string[],     // Up to 4 reference images for style consistency
 *   width?: number,                    // default 1920
 *   height?: number,                   // default 1080
 *   model?: "kontext-pro" | "flux-pro", // default "kontext-pro"
 * }
 *
 * Returns: { url: string, path: string }
 *
 * Env vars needed: FAL_KEY
 */

async function generateWithKontextPro(
  prompt: string,
  referenceImageUrls: string[],
  width: number,
  height: number,
  apiKey: string,
): Promise<string> {
  // Submit generation request
  const submitRes = await fetch(
    "https://queue.fal.run/fal-ai/flux-1-kontext/pro",
    {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_urls: referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
        width,
        height,
        num_images: 1,
        guidance_scale: 7.5,
        num_inference_steps: 28,
      }),
    },
  );

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`Flux Kontext submit: ${submitRes.status} — ${err}`);
  }

  const { request_id } = await submitRes.json();
  if (!request_id) throw new Error("fal.ai nao devolveu request_id.");

  // Poll for completion (max 3 minutes)
  for (let i = 0; i < 36; i++) {
    await new Promise((r) => setTimeout(r, 5000));

    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/flux-1-kontext/pro/status/${request_id}`,
      { headers: { Authorization: `Key ${apiKey}` } },
    );

    if (!statusRes.ok) continue;
    const status = await statusRes.json();

    if (status.status === "COMPLETED") {
      const resultRes = await fetch(
        `https://queue.fal.run/fal-ai/flux-1-kontext/pro/result/${request_id}`,
        { headers: { Authorization: `Key ${apiKey}` } },
      );
      if (!resultRes.ok) throw new Error("Nao consegui obter resultado Flux.");
      const result = await resultRes.json();
      const imageUrl = result.images?.[0]?.url;
      if (!imageUrl) throw new Error("Flux nao devolveu URL da imagem.");
      return imageUrl;
    }

    if (status.status === "FAILED") {
      throw new Error(`Flux falhou: ${JSON.stringify(status)}`);
    }
  }

  throw new Error("Timeout: Flux nao completou em 3 minutos.");
}

async function generateWithFluxPro(
  prompt: string,
  width: number,
  height: number,
  apiKey: string,
): Promise<string> {
  const submitRes = await fetch(
    "https://queue.fal.run/fal-ai/flux-2-pro",
    {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        width,
        height,
        num_images: 1,
        guidance_scale: 7.5,
        num_inference_steps: 28,
      }),
    },
  );

  if (!submitRes.ok) {
    const err = await submitRes.text();
    throw new Error(`Flux Pro submit: ${submitRes.status} — ${err}`);
  }

  const { request_id } = await submitRes.json();
  if (!request_id) throw new Error("fal.ai nao devolveu request_id.");

  for (let i = 0; i < 36; i++) {
    await new Promise((r) => setTimeout(r, 5000));

    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/flux-2-pro/status/${request_id}`,
      { headers: { Authorization: `Key ${apiKey}` } },
    );

    if (!statusRes.ok) continue;
    const status = await statusRes.json();

    if (status.status === "COMPLETED") {
      const resultRes = await fetch(
        `https://queue.fal.run/fal-ai/flux-2-pro/result/${request_id}`,
        { headers: { Authorization: `Key ${apiKey}` } },
      );
      if (!resultRes.ok) throw new Error("Nao consegui obter resultado Flux Pro.");
      const result = await resultRes.json();
      const imageUrl = result.images?.[0]?.url;
      if (!imageUrl) throw new Error("Flux Pro nao devolveu URL da imagem.");
      return imageUrl;
    }

    if (status.status === "FAILED") {
      throw new Error(`Flux Pro falhou: ${JSON.stringify(status)}`);
    }
  }

  throw new Error("Timeout: Flux Pro nao completou em 3 minutos.");
}

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      courseSlug,
      sceneLabel,
      referenceImageUrls = [],
      width = 1920,
      height = 1080,
      model = "kontext-pro",
    } = await req.json();

    if (!prompt || !courseSlug) {
      return NextResponse.json(
        { erro: "prompt e courseSlug obrigatorios." },
        { status: 400 },
      );
    }

    const apiKey = process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { erro: "FAL_KEY nao configurada." },
        { status: 400 },
      );
    }

    // Generate image
    let imageUrl: string;
    if (model === "kontext-pro" && referenceImageUrls.length > 0) {
      imageUrl = await generateWithKontextPro(prompt, referenceImageUrls, width, height, apiKey);
    } else {
      imageUrl = await generateWithFluxPro(prompt, width, height, apiKey);
    }

    // Download and upload to Supabase
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tdytdamtfillqyklgrmb.supabase.co";

    if (!serviceKey) {
      return NextResponse.json({ url: imageUrl, provider: model });
    }

    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error("Nao consegui descarregar imagem do fal.ai.");
    const imgBuffer = await imgRes.arrayBuffer();

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const filename = `${sceneLabel || "scene"}-${Date.now()}.png`;
    const filePath = `courses/${courseSlug}/images/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(imgBuffer), {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { erro: `Upload: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
    return NextResponse.json({ url, path: filePath, provider: model });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Excepcao: ${msg}` }, { status: 500 });
  }
}
