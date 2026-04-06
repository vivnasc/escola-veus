import { NextRequest, NextResponse } from "next/server";

// Remotion render can take a long time — max timeout
export const maxDuration = 300;

/**
 * POST /api/admin/courses/render-video
 *
 * Renders the final MP4 video using Remotion from a manifest.
 * Streams progress via SSE.
 *
 * Body: { manifest: VideoManifest }
 * Returns SSE stream with progress + final { result: { videoUrl } }
 *
 * NOTE: This endpoint requires Remotion + a headless browser (Chromium).
 * On Vercel, use Remotion Lambda instead. This works for local/VPS deploy.
 */

type ProgressEvent = {
  type: "progress";
  percent: number;
  label: string;
};

type ResultEvent = {
  type: "result";
  videoUrl: string;
};

type ErrorEvent = {
  type: "error";
  message: string;
};

function createSSEStream() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController | null = null;
  const stream = new ReadableStream({ start(c) { controller = c; } });
  function send(data: ProgressEvent | ResultEvent | ErrorEvent) {
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

  const { stream, send, close } = createSSEStream();

  (async () => {
    try {
      send({ type: "progress", percent: 0, label: "A preparar render..." });

      // Dynamic imports to avoid build issues
      const { bundle } = await import("@remotion/bundler");
      const { renderMedia, selectComposition } = await import("@remotion/renderer");
      const path = await import("path");
      const fs = await import("fs");
      const os = await import("os");

      // 1. Bundle the Remotion project
      send({ type: "progress", percent: 5, label: "A criar bundle Remotion..." });

      const entryPoint = path.resolve(process.cwd(), "src/remotion/index.ts");

      // Create index.ts entry point if it doesn't exist
      const indexPath = path.resolve(process.cwd(), "src/remotion/index.ts");
      if (!fs.existsSync(indexPath)) {
        fs.writeFileSync(indexPath, `import { registerRoot } from "remotion";\nimport { Root } from "./Root";\nregisterRoot(Root);\n`);
      }

      const bundleLocation = await bundle({
        entryPoint: indexPath,
        onProgress: (p: number) => {
          if (p % 20 === 0) send({ type: "progress", percent: 5 + p * 0.2, label: `Bundle: ${p}%` });
        },
      });

      send({ type: "progress", percent: 25, label: "Bundle criado. A seleccionar composicao..." });

      // 2. Select the composition
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: "VideoComposition",
        inputProps: manifest,
      });

      send({ type: "progress", percent: 30, label: "A renderizar video..." });

      // 3. Render the video
      const outputDir = os.tmpdir();
      const outputPath = path.join(outputDir, `escola-veus-${manifest.sceneLabel || "video"}-${Date.now()}.mp4`);

      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: "h264",
        outputLocation: outputPath,
        inputProps: manifest,
        onProgress: ({ progress }: { progress: number }) => {
          const pct = 30 + Math.round(progress * 65);
          if (pct % 5 === 0) {
            send({ type: "progress", percent: pct, label: `A renderizar: ${Math.round(progress * 100)}%` });
          }
        },
      });

      send({ type: "progress", percent: 95, label: "Render completo. A fazer upload..." });

      // 4. Upload to Supabase
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      let videoUrl = "";

      if (serviceKey && supabaseUrl) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

        const videoBuffer = fs.readFileSync(outputPath);
        const filePath = `courses/${manifest.courseSlug}/videos/${manifest.sceneLabel}-${Date.now()}.mp4`;

        const { error } = await supabase.storage
          .from("course-assets")
          .upload(filePath, videoBuffer, { contentType: "video/mp4", upsert: true });

        if (!error) {
          videoUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
        } else {
          // Fallback: serve from tmp (local dev only)
          videoUrl = `file://${outputPath}`;
        }
      } else {
        videoUrl = `file://${outputPath}`;
      }

      // Cleanup tmp file if uploaded
      if (videoUrl.startsWith("http")) {
        try { fs.unlinkSync(outputPath); } catch { /* ok */ }
      }

      // Cleanup bundle
      try {
        const { deleteBundle } = await import("@remotion/bundler");
        if (typeof deleteBundle === "function") await deleteBundle(bundleLocation);
      } catch { /* ok */ }

      send({ type: "progress", percent: 100, label: "Video pronto!" });
      send({ type: "result", videoUrl });
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
