import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/train-lora
 * Triggers Flux LoRA training via Replicate's fast-flux-trainer.
 *
 * The dataset ZIP is served from our own site at /downloads/seteveus-dataset.zip
 * Replicate downloads it, trains the LoRA (~2 min), and returns the weights.
 *
 * IMPORTANT: Replicate output URLs expire after 1 hour.
 * The status endpoint handles saving to Supabase Storage.
 *
 * Requires env var: REPLICATE_API_TOKEN
 *
 * Body (optional): {
 *   trigger_word?: string,        // default "seteveus_style"
 *   steps?: number,               // default 1000
 * }
 *
 * Returns: { training_id: string, status: string }
 */
export async function POST(req: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "REPLICATE_API_TOKEN nao configurado. Vai a Vercel → Settings → Environment Variables." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const trigger_word = body.trigger_word || "seteveus_style";
    const steps = body.steps || 1000;

    // The dataset ZIP URL - served statically from our own site
    const origin = req.headers.get("origin") || req.headers.get("host") || "";
    const protocol = origin.startsWith("http") ? "" : "https://";
    const datasetUrl = `${protocol}${origin}/downloads/seteveus-dataset.zip`;

    // Use Replicate's fast-flux-trainer: ~2 min, ~$1.46
    const response = await fetch(
      "https://api.replicate.com/v1/models/replicate/fast-flux-trainer/versions/f463fbfc8a26cb6e0cba3ac8cc83eb62d0e43aac1e45a10cf5ae0fc22d7e4ab2/trainings",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: body.destination || undefined,
          input: {
            input_images: datasetUrl,
            trigger_word,
            steps,
            autocaption: true,
            lora_rank: 32,
          },
          // Webhook to auto-save weights (before they expire in 1hr)
          webhook: body.webhook || undefined,
          webhook_events_filter: ["completed"],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { erro: `Replicate erro: ${response.status}`, detalhe: err },
        { status: response.status }
      );
    }

    const training = await response.json();

    return NextResponse.json({
      training_id: training.id,
      status: training.status,
      url: training.urls?.get || null,
      message: "Treino iniciado. Demora ~2-5 minutos.",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}
