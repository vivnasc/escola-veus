import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/train-lora
 * Triggers Flux LoRA training via fal.ai's flux-lora-fast-training.
 *
 * Body: {
 *   images_data_url: string,  // URL to a ZIP of training images (hosted on Supabase)
 *   trigger_word?: string,    // default "veus_figure"
 *   steps?: number,           // default 1000
 *   is_style?: boolean,       // default true
 * }
 *
 * Returns: { request_id: string, status: string }
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "FAL_KEY nao configurada." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));

    if (!body.images_data_url) {
      return NextResponse.json(
        { erro: "images_data_url obrigatorio. Faz upload do ZIP de imagens primeiro." },
        { status: 400 }
      );
    }

    const trigger_word = body.trigger_word || "veus_figure";
    const steps = body.steps || 1000;
    const is_style = body.is_style ?? true;

    // Queue-based training (long-running)
    const response = await fetch(
      "https://queue.fal.run/fal-ai/flux-lora-fast-training",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images_data_url: body.images_data_url,
          trigger_word,
          steps,
          is_style,
          create_masks: true,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { erro: `fal.ai erro: ${response.status}`, detalhe: err },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      request_id: data.request_id,
      status: "IN_QUEUE",
      message: "Treino iniciado. Demora ~5-10 minutos.",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
