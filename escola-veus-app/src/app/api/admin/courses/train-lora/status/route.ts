import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

/**
 * GET /api/admin/courses/train-lora/status?id=TRAINING_ID
 * Checks the status of a Replicate training.
 *
 * When training succeeds, automatically saves the LoRA weights
 * to Supabase Storage (because Replicate URLs expire in 1 hour).
 *
 * Returns: {
 *   status: "starting" | "processing" | "succeeded" | "failed" | "canceled",
 *   progress?: number,
 *   weights_url?: string,  // Permanent Supabase URL (if saved) or Replicate URL
 *   error?: string,
 * }
 */
export async function GET(req: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "REPLICATE_API_TOKEN nao configurado." },
      { status: 500 }
    );
  }

  const trainingId = req.nextUrl.searchParams.get("id");
  if (!trainingId) {
    return NextResponse.json(
      { erro: "Parametro 'id' obrigatorio." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.replicate.com/v1/trainings/${trainingId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
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

    // Extract progress from logs
    let progress: number | undefined;
    if (training.logs) {
      const match = training.logs.match(/(\d+)%/);
      if (match) progress = parseInt(match[1]);
      if (!progress) {
        const stepMatch = training.logs.match(/step\s+(\d+)\s*[/|of]\s*(\d+)/i);
        if (stepMatch) {
          progress = Math.round((parseInt(stepMatch[1]) / parseInt(stepMatch[2])) * 100);
        }
      }
    }

    // If succeeded, try to save weights to Supabase Storage
    let weightsUrl: string | null = null;
    const replicateWeightsUrl = training.output?.weights || null;

    if (training.status === "succeeded" && replicateWeightsUrl) {
      // Try to save to Supabase (permanent URL)
      weightsUrl = await saveWeightsToSupabase(replicateWeightsUrl, trainingId);
      // Fallback to Replicate URL if Supabase save fails
      if (!weightsUrl) weightsUrl = replicateWeightsUrl;
    }

    return NextResponse.json({
      status: training.status,
      progress,
      weights_url: weightsUrl,
      replicate_url: replicateWeightsUrl,
      error: training.error || null,
      logs_tail: training.logs ? training.logs.slice(-500) : null,
      started_at: training.started_at,
      completed_at: training.completed_at,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({ erro: message }, { status: 500 });
  }
}

/**
 * Downloads LoRA weights from Replicate and saves to Supabase Storage.
 * Returns the permanent Supabase public URL, or null if it fails.
 */
async function saveWeightsToSupabase(
  weightsUrl: string,
  trainingId: string
): Promise<string | null> {
  try {
    const admin = createSupabaseAdminClient();
    if (!admin) return null;

    // Check if already saved
    const filename = `seteveus_style_${trainingId}.safetensors`;
    const storagePath = `lora/${filename}`;

    const { data: existing } = await admin.storage
      .from("course-assets")
      .list("lora", { search: filename });

    if (existing && existing.length > 0) {
      // Already saved - return the public URL
      const { data: urlData } = admin.storage
        .from("course-assets")
        .getPublicUrl(storagePath);
      return urlData?.publicUrl || null;
    }

    // Download from Replicate
    const res = await fetch(weightsUrl);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();

    // Upload to Supabase Storage
    // First try to create the bucket (it's ok if it already exists)
    await admin.storage.createBucket("course-assets", {
      public: true,
      fileSizeLimit: 200 * 1024 * 1024, // 200MB
    });

    const { error } = await admin.storage
      .from("course-assets")
      .upload(storagePath, buffer, {
        contentType: "application/octet-stream",
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return null;
    }

    const { data: urlData } = admin.storage
      .from("course-assets")
      .getPublicUrl(storagePath);

    return urlData?.publicUrl || null;
  } catch (e) {
    console.error("Failed to save weights to Supabase:", e);
    return null;
  }
}
