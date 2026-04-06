import { NextRequest, NextResponse } from "next/server";
import {
  buildLandscapeWorkflow,
  buildSilhouetteWorkflow,
  TERRITORY_PROMPTS,
  SILHOUETTE_POSES,
} from "@/lib/comfyui-workflows";

/**
 * POST /api/admin/courses/generate-territory
 * Generates a territory image (landscape or silhouette) via ComfyUI.
 *
 * Body: {
 *   comfyuiUrl: string,
 *   territory: string,          // key from TERRITORY_PROMPTS (e.g. "ouro-proprio")
 *   stage: number,              // 0-3 (progression stage)
 *   type: "landscape" | "silhouette",
 *   pose?: string,              // key from SILHOUETTE_POSES (for silhouette type)
 *   loraName?: string,
 *   loraStrength?: number,
 *   checkpoint?: string,
 *   seed?: number,
 * }
 *
 * Returns: { url: string, path: string, prompt_id: string } or streams image if no Supabase key
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      comfyuiUrl,
      territory,
      stage,
      type = "landscape",
      pose = "standing",
      loraName,
      loraStrength,
      checkpoint,
      seed,
    } = body;

    if (!comfyuiUrl || !territory || stage === undefined) {
      return NextResponse.json(
        { erro: "comfyuiUrl, territory e stage obrigatorios." },
        { status: 400 }
      );
    }

    const territoryData = TERRITORY_PROMPTS[territory];
    if (!territoryData) {
      return NextResponse.json(
        {
          erro: `Territorio "${territory}" nao encontrado. Disponiveis: ${Object.keys(TERRITORY_PROMPTS).join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (stage < 0 || stage > 3) {
      return NextResponse.json(
        { erro: "Stage deve ser 0-3." },
        { status: 400 }
      );
    }

    const stagePrompt = territoryData.stages[stage];

    // Build the workflow
    let workflow: Record<string, unknown>;
    const workflowOpts = {
      prompt: stagePrompt,
      loraName,
      loraStrength,
      checkpoint,
      seed,
      width: 1280,
      height: 720,
    };

    if (type === "silhouette") {
      const poseDesc =
        SILHOUETTE_POSES[pose as keyof typeof SILHOUETTE_POSES] ||
        SILHOUETTE_POSES.standing;
      workflow = buildSilhouetteWorkflow({
        ...workflowOpts,
        prompt: `${poseDesc}, ${stagePrompt}`,
      });
    } else {
      workflow = buildLandscapeWorkflow(workflowOpts);
    }

    // Queue in ComfyUI
    const queueRes = await fetch(`${comfyuiUrl}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!queueRes.ok) {
      const erro = await queueRes.text();
      return NextResponse.json(
        { erro: `ComfyUI queue: ${queueRes.status} — ${erro}` },
        { status: 500 }
      );
    }

    const { prompt_id } = await queueRes.json();
    if (!prompt_id) {
      return NextResponse.json(
        { erro: "ComfyUI nao devolveu prompt_id." },
        { status: 500 }
      );
    }

    // Poll for completion (max 5 minutes)
    let imageData: ArrayBuffer | null = null;
    let outputFilename = "";
    const maxAttempts = 60;
    const pollInterval = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, pollInterval));

      const historyRes = await fetch(
        `${comfyuiUrl}/history/${prompt_id}`
      );
      if (!historyRes.ok) continue;

      const history = await historyRes.json();
      const promptHistory = history[prompt_id];
      if (!promptHistory || !promptHistory.outputs) continue;

      for (const nodeId of Object.keys(promptHistory.outputs)) {
        const nodeOutput = promptHistory.outputs[nodeId];
        if (nodeOutput.images && nodeOutput.images.length > 0) {
          const img = nodeOutput.images[0];
          outputFilename = img.filename;

          const imgRes = await fetch(
            `${comfyuiUrl}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder || "")}&type=${encodeURIComponent(img.type || "output")}`
          );

          if (imgRes.ok) {
            imageData = await imgRes.arrayBuffer();
          }
          break;
        }
      }

      if (imageData) break;
    }

    if (!imageData) {
      return NextResponse.json(
        { erro: "Timeout: ComfyUI nao gerou imagem em 5 minutos.", prompt_id },
        { status: 504 }
      );
    }

    // Upload to Supabase Storage
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://tdytdamtfillqyklgrmb.supabase.co";

    const ext = outputFilename.split(".").pop() || "png";
    const filename = `${type}-${territory}-stage${stage}-${Date.now()}.${ext}`;

    if (!serviceKey) {
      return new NextResponse(imageData, {
        headers: {
          "Content-Type": `image/${ext === "jpg" ? "jpeg" : ext}`,
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const filePath = `territories/${territory}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(imageData), {
        contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { erro: `Upload: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
    return NextResponse.json({
      url,
      path: filePath,
      prompt_id,
      territory: territoryData.name,
      stage,
      type,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { erro: `Excepcao: ${msg}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/courses/generate-territory
 * Returns available territories and poses for the UI.
 */
export async function GET() {
  const territories = Object.entries(TERRITORY_PROMPTS).map(
    ([slug, data]) => ({
      slug,
      name: data.name,
      stages: data.stages.length,
    })
  );

  const poses = Object.entries(SILHOUETTE_POSES).map(([key, desc]) => ({
    key,
    description: desc,
  }));

  return NextResponse.json({ territories, poses });
}
