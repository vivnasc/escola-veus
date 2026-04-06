import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * POST /api/admin/courses/render-video
 *
 * Renders the final MP4 using Remotion Lambda (AWS cloud render).
 * No CLI, no Chromium, no local resources — 100% cloud.
 *
 * Required env vars:
 *   REMOTION_AWS_REGION        — e.g. "eu-west-1"
 *   REMOTION_LAMBDA_FUNCTION   — Lambda function name (from `npx remotion lambda functions deploy`)
 *   REMOTION_SERVE_URL         — S3 serve URL (from `npx remotion lambda sites create`)
 *   AWS_ACCESS_KEY_ID          — AWS credentials
 *   AWS_SECRET_ACCESS_KEY      — AWS credentials
 *
 * Body: { manifest: VideoManifest }
 * Returns SSE stream with progress + final { result: { videoUrl } }
 */

type SSEEvent =
  | { type: "progress"; percent: number; label: string }
  | { type: "result"; videoUrl: string }
  | { type: "error"; message: string };

function createSSEStream() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController | null = null;
  const stream = new ReadableStream({ start(c) { controller = c; } });
  function send(data: SSEEvent) {
    if (controller) controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  }
  function close() { if (controller) controller.close(); }
  return { stream, send, close };
}

export async function POST(req: NextRequest) {
  const { manifest } = await req.json();

  if (!manifest || !manifest.scenes) {
    return NextResponse.json({ erro: "manifest obrigatorio." }, { status: 400 });
  }

  const region = process.env.REMOTION_AWS_REGION;
  const functionName = process.env.REMOTION_LAMBDA_FUNCTION;
  const serveUrl = process.env.REMOTION_SERVE_URL;

  if (!region || !functionName || !serveUrl) {
    return NextResponse.json({
      erro: "Remotion Lambda nao configurado. Precisa de REMOTION_AWS_REGION, REMOTION_LAMBDA_FUNCTION, REMOTION_SERVE_URL.",
    }, { status: 400 });
  }

  const { stream, send, close } = createSSEStream();

  (async () => {
    try {
      send({ type: "progress", percent: 0, label: "A submeter render ao Lambda..." });

      const { renderMediaOnLambda, getRenderProgress } = await import("@remotion/lambda/client");

      // Calculate total frames for the composition
      const FPS = 30;
      const DISSOLVE_FRAMES = 30;
      let totalFrames = 0;
      for (const scene of manifest.scenes) {
        totalFrames += Math.round(scene.durationSec * FPS);
        if (totalFrames > DISSOLVE_FRAMES) totalFrames -= DISSOLVE_FRAMES;
      }
      totalFrames += DISSOLVE_FRAMES;

      // 1. Submit render to Lambda
      const { renderId, bucketName } = await renderMediaOnLambda({
        region,
        functionName,
        serveUrl,
        composition: "VideoComposition",
        inputProps: manifest,
        codec: "h264",
        framesPerLambda: 120,
        privacy: "public",
        downloadBehavior: { type: "download", fileName: `${manifest.sceneLabel || "video"}.mp4` },
      });

      send({ type: "progress", percent: 10, label: `Render submetido (${renderId}). A processar...` });

      // 2. Poll for progress
      let done = false;
      let lastPercent = 10;

      while (!done) {
        await new Promise((r) => setTimeout(r, 3000));

        const progress = await getRenderProgress({
          renderId,
          bucketName,
          functionName,
          region,
        });

        if (progress.fatalErrorEncountered) {
          throw new Error(progress.errors?.[0]?.message || "Erro fatal no render Lambda");
        }

        if (progress.done) {
          done = true;
          const videoUrl = progress.outputFile;

          send({ type: "progress", percent: 95, label: "Render completo. A guardar..." });

          // Upload to Supabase for permanent storage
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          let finalUrl = videoUrl || "";

          if (serviceKey && supabaseUrl && videoUrl) {
            try {
              const videoRes = await fetch(videoUrl);
              if (videoRes.ok) {
                const { createClient } = await import("@supabase/supabase-js");
                const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
                const filePath = `courses/${manifest.courseSlug}/videos/${manifest.sceneLabel}-${Date.now()}.mp4`;
                const videoBuffer = new Uint8Array(await videoRes.arrayBuffer());
                const { error } = await supabase.storage
                  .from("course-assets")
                  .upload(filePath, videoBuffer, { contentType: "video/mp4", upsert: true });
                if (!error) finalUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
              }
            } catch { /* keep Lambda URL as fallback */ }
          }

          send({ type: "progress", percent: 100, label: "Video pronto!" });
          send({ type: "result", videoUrl: finalUrl });
        } else {
          const pct = Math.min(90, 10 + Math.round((progress.overallProgress || 0) * 85));
          if (pct > lastPercent) {
            lastPercent = pct;
            const chunksStr = progress.chunks
              ? `${progress.chunks.filter((c: { rendered: boolean }) => c.rendered).length}/${progress.chunks.length} chunks`
              : "";
            send({ type: "progress", percent: pct, label: `A renderizar... ${Math.round((progress.overallProgress || 0) * 100)}% ${chunksStr}` });
          }
        }
      }
    } catch (err) {
      send({ type: "error", message: err instanceof Error ? err.message : String(err) });
    } finally {
      close();
    }
  })();

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}
