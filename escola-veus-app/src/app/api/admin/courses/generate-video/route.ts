import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/generate-video
 *
 * Sends an image to ComfyUI (ThinkDiffusion) and generates an animated video clip
 * using Wan 2.1 image-to-video model.
 *
 * Body: {
 *   comfyuiUrl: string,          // ThinkDiffusion ComfyUI API URL
 *   sourceImageUrl: string,      // URL of the source image (Supabase or object URL)
 *   motionPrompt: string,        // Motion description for animation
 *   courseSlug: string,
 *   sceneLabel: string,          // e.g. "yt-hook0-scene2"
 *   durationSec?: number,        // 5 or 10 seconds (default 5)
 *   width?: number,
 *   height?: number,
 * }
 *
 * Returns: { url: string, path: string } — URL of the generated video in Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const {
      comfyuiUrl,
      sourceImageUrl,
      motionPrompt,
      courseSlug,
      sceneLabel,
      durationSec = 5,
      width = 1280,
      height = 720,
    } = await req.json();

    if (!comfyuiUrl || !sourceImageUrl || !motionPrompt || !courseSlug) {
      return NextResponse.json(
        { erro: "comfyuiUrl, sourceImageUrl, motionPrompt e courseSlug obrigatorios." },
        { status: 400 }
      );
    }

    // 1. Download the source image
    const imgRes = await fetch(sourceImageUrl);
    if (!imgRes.ok) {
      return NextResponse.json(
        { erro: `Nao consegui descarregar a imagem: ${imgRes.status}` },
        { status: 400 }
      );
    }
    const imgBuffer = await imgRes.arrayBuffer();
    const imgContentType = imgRes.headers.get("content-type") || "image/png";

    // 2. Upload source image to ComfyUI /upload/image
    const uploadFilename = `seteveus-src-${Date.now()}.png`;
    const formData = new FormData();
    formData.append("image", new Blob([imgBuffer], { type: imgContentType }), uploadFilename);
    formData.append("overwrite", "true");

    const uploadRes = await fetch(`${comfyuiUrl}/upload/image`, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return NextResponse.json(
        { erro: `ComfyUI upload: ${uploadRes.status} — ${err}` },
        { status: 500 }
      );
    }

    const uploadData = await uploadRes.json();
    const comfyuiFilename = uploadData.name || uploadFilename;

    // 3. Build and queue Wan 2.1 I2V workflow
    const { buildImageToVideoWorkflow } = await import("@/lib/comfyui-workflows");
    const workflow = buildImageToVideoWorkflow(comfyuiFilename, {
      motionPrompt,
      durationSec,
      width,
      height,
    });

    const queueRes = await fetch(`${comfyuiUrl}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow }),
    });

    if (!queueRes.ok) {
      const err = await queueRes.text();
      return NextResponse.json(
        { erro: `ComfyUI queue: ${queueRes.status} — ${err}` },
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

    // 4. Poll for completion (video takes longer — max 10 minutes)
    let videoData: ArrayBuffer | null = null;
    let outputFilename = "";
    const maxAttempts = 120; // 120 * 5s = 10 minutes
    const pollInterval = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, pollInterval));

      const historyRes = await fetch(`${comfyuiUrl}/history/${prompt_id}`);
      if (!historyRes.ok) continue;

      const history = await historyRes.json();
      const promptHistory = history[prompt_id];
      if (!promptHistory || !promptHistory.outputs) continue;

      // Find output with gifs/videos (SaveAnimatedWEBP outputs as "images" in ComfyUI)
      for (const nodeId of Object.keys(promptHistory.outputs)) {
        const nodeOutput = promptHistory.outputs[nodeId];

        // Check for video/gif outputs
        const outputs = nodeOutput.gifs || nodeOutput.images || nodeOutput.videos || [];
        if (outputs.length > 0) {
          const vid = outputs[0];
          outputFilename = vid.filename;

          const vidRes = await fetch(
            `${comfyuiUrl}/view?filename=${encodeURIComponent(vid.filename)}&subfolder=${encodeURIComponent(vid.subfolder || "")}&type=${encodeURIComponent(vid.type || "output")}`
          );

          if (vidRes.ok) {
            videoData = await vidRes.arrayBuffer();
          }
          break;
        }
      }

      if (videoData) break;
    }

    if (!videoData) {
      return NextResponse.json(
        { erro: "Timeout: Wan 2.1 nao gerou video em 10 minutos.", prompt_id },
        { status: 504 }
      );
    }

    // 5. Upload to Supabase Storage
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://tdytdamtfillqyklgrmb.supabase.co";

    if (!serviceKey) {
      // Return video directly if no service key
      const ext = outputFilename.split(".").pop() || "webp";
      return new NextResponse(videoData, {
        headers: {
          "Content-Type": ext === "webp" ? "image/webp" : `video/${ext}`,
          "Content-Disposition": `attachment; filename="${sceneLabel || "clip"}.${ext}"`,
        },
      });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const ext = outputFilename.split(".").pop() || "webp";
    const finalFilename = `${sceneLabel || "clip"}-${Date.now()}.${ext}`;
    const filePath = `courses/${courseSlug}/videos/${finalFilename}`;

    const contentType = ext === "webp" ? "image/webp"
      : ext === "mp4" ? "video/mp4"
      : ext === "webm" ? "video/webm"
      : `video/${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(videoData), {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { erro: `Upload: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
    return NextResponse.json({ url, path: filePath, prompt_id, ext });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { erro: `Excepcao: ${msg}` },
      { status: 500 }
    );
  }
}
