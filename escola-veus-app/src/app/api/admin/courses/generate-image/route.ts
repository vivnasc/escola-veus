import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/generate-image
 * Sends a prompt to ComfyUI (ThinkDiffusion) and stores the result in Supabase.
 *
 * Body: {
 *   comfyuiUrl: string,      // ThinkDiffusion ComfyUI API URL
 *   workflow: object,         // ComfyUI workflow JSON (with prompt nodes)
 *   courseSlug: string,
 *   moduleNum: number,
 *   assetType: "landscape" | "silhouette" | "symbol" | "composition",
 *   filename?: string         // Optional custom filename
 * }
 *
 * Returns: { url: string, path: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { comfyuiUrl, workflow, courseSlug, moduleNum, assetType, filename } =
      await req.json();

    if (!comfyuiUrl || !workflow || !courseSlug) {
      return NextResponse.json(
        { erro: "comfyuiUrl, workflow e courseSlug obrigatorios." },
        { status: 400 }
      );
    }

    // 1. Queue prompt in ComfyUI
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

    // 2. Poll for completion (max 5 minutes)
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

      // Find the first output with images
      for (const nodeId of Object.keys(promptHistory.outputs)) {
        const nodeOutput = promptHistory.outputs[nodeId];
        if (nodeOutput.images && nodeOutput.images.length > 0) {
          const img = nodeOutput.images[0];
          outputFilename = img.filename;

          // Download the image from ComfyUI
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

    // 3. Upload to Supabase Storage
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://tdytdamtfillqyklgrmb.supabase.co";

    if (!serviceKey) {
      // Return image directly if no service key
      const ext = outputFilename.split(".").pop() || "png";
      return new NextResponse(imageData, {
        headers: {
          "Content-Type": `image/${ext === "jpg" ? "jpeg" : ext}`,
          "Content-Disposition": `attachment; filename="${filename || outputFilename}"`,
        },
      });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const ext = outputFilename.split(".").pop() || "png";
    const finalFilename =
      filename ||
      `${assetType || "image"}-m${moduleNum || 0}-${Date.now()}.${ext}`;
    const filePath = `courses/${courseSlug}/images/${finalFilename}`;

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
    return NextResponse.json({ url, path: filePath, prompt_id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { erro: `Excepcao: ${msg}` },
      { status: 500 }
    );
  }
}
