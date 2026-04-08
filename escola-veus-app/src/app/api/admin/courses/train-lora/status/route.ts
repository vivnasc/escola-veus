import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/courses/train-lora/status?id=REQUEST_ID
 * Checks the status of a fal.ai LoRA training.
 *
 * When training succeeds, saves the LoRA weights URL to Supabase
 * for use in the generate-image-flux endpoint.
 *
 * Returns: {
 *   status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED",
 *   weights_url?: string,
 *   error?: string,
 * }
 */
export async function GET(req: NextRequest) {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "FAL_KEY nao configurada." },
      { status: 500 }
    );
  }

  const requestId = req.nextUrl.searchParams.get("id");
  if (!requestId) {
    return NextResponse.json(
      { erro: "Parametro 'id' obrigatorio." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://queue.fal.run/fal-ai/flux-lora-fast-training/requests/${requestId}/status`,
      {
        headers: { Authorization: `Key ${apiKey}` },
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { erro: `fal.ai erro: ${response.status}`, detalhe: err },
        { status: response.status }
      );
    }

    const statusData = await response.json();

    // If completed, fetch the result to get the weights URL
    if (statusData.status === "COMPLETED") {
      const resultRes = await fetch(
        `https://queue.fal.run/fal-ai/flux-lora-fast-training/requests/${requestId}`,
        {
          headers: { Authorization: `Key ${apiKey}` },
        }
      );

      if (resultRes.ok) {
        const result = await resultRes.json();
        const weightsUrl = result.diffusers_lora_file?.url || null;

        // Save weights URL to Supabase for later use
        if (weightsUrl) {
          await saveLoraUrl(weightsUrl);
        }

        return NextResponse.json({
          status: "COMPLETED",
          weights_url: weightsUrl,
          config_url: result.config_file?.url || null,
        });
      }
    }

    return NextResponse.json({
      status: statusData.status,
      progress: statusData.status === "IN_PROGRESS" ? 50 : 0,
      logs_tail: statusData.logs ? statusData.logs.slice(-500) : null,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}

/**
 * Saves the LoRA weights URL to a known location in Supabase Storage
 * so the image generation endpoint can find it.
 */
async function saveLoraUrl(weightsUrl: string): Promise<void> {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !supabaseUrl) return;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const data = JSON.stringify({ weightsUrl, updatedAt: new Date().toISOString() });
    await supabase.storage
      .from("course-assets")
      .upload("lora/active-lora.json", new TextEncoder().encode(data), {
        contentType: "application/json",
        upsert: true,
      });
  } catch {
    // Silent fail — not critical
  }
}
