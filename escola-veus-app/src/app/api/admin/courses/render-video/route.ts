import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * POST /api/admin/courses/render-video
 *
 * Renders final MP4 via Shotstack cloud API. Zero CLI, zero AWS, zero local.
 * Builds a timeline from the manifest: clips + audio + music + text + watermark.
 * Polls for completion, uploads to Supabase, returns download URL.
 *
 * Env: SHOTSTACK_API_KEY (from dashboard.shotstack.io)
 *      SHOTSTACK_ENV: "stage" (free, watermark) or "v1" (production)
 *
 * Body: { manifest }
 * Returns SSE: progress events + final { type: "result", videoUrl }
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

// ─── BUILD SHOTSTACK TIMELINE FROM MANIFEST ────────────────────────────────

type ShotstackClip = {
  asset: Record<string, unknown>;
  start: number;
  length: number;
  transition?: { in?: string; out?: string };
  fit?: string;
  scale?: number;
  opacity?: number;
  position?: string;
  offset?: { x?: number; y?: number };
  effect?: string;
};

type ManifestScene = {
  type: string;
  narration: string;
  overlayText: string;
  durationSec: number;
  imageUrl: string | null;
  animationUrl: string | null;
  audioUrl?: string | null;
  audioStartSec?: number | null;
  audioEndSec?: number | null;
};

function buildShotstackEdit(manifest: {
  scenes: ManifestScene[];
  backgroundMusicUrl?: string;
  backgroundMusicVolume?: number;
  title?: string;
  courseSlug?: string;
}) {
  const scenes = manifest.scenes;
  const OVERLAP = 1; // dissolve overlap in seconds

  // Calculate timeline positions with dissolve overlap
  const positions: { start: number; length: number }[] = [];
  let currentTime = 0;
  for (let i = 0; i < scenes.length; i++) {
    const dur = scenes[i].durationSec;
    positions.push({ start: currentTime, length: dur });
    currentTime += dur - OVERLAP;
  }
  const totalDuration = currentTime + OVERLAP;

  // ─── Watermark removido — YouTube adiciona marca de água automaticamente ──

  // ─── TRACK 2: Text overlays ────────────────────────────────────────
  const textClips: ShotstackClip[] = [];
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const text = scene.overlayText || "";
    if (!text) continue;

    const isTitle = scene.type === "abertura" || scene.type === "fecho" || scene.type === "cta" || scene.type === "trailer";
    const isFrase = scene.type === "frase_final" || scene.type === "reframe";
    const size = isTitle ? "large" : isFrase ? "medium" : "small";

    textClips.push({
      asset: {
        type: "html",
        html: `<p>${text.replace(/\n/g, "<br>")}</p>`,
        css: `p { font-family: Georgia, serif; font-size: ${isTitle ? 48 : isFrase ? 36 : 28}px; color: ${isTitle ? "#D4A853" : "#F5F0E6"}; text-align: center; line-height: 1.5; text-shadow: 0 2px 20px rgba(0,0,0,0.9); }`,
        width: 1400,
        height: 400,
      },
      start: positions[i].start + (scene.type === "abertura" ? 1.5 : 0.7),
      length: positions[i].length - (scene.type === "abertura" ? 2 : 1.2),
      position: isTitle || isFrase ? "center" : "bottom",
      offset: isTitle || isFrase ? undefined : { y: 0.15 },
      transition: { in: "fade", out: "fade" },
    });
  }
  const textTrack = { clips: textClips };

  // ─── TRACK 3: Visuals (clips or images) ────────────────────────────
  const visualClips: ShotstackClip[] = [];
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const src = scene.animationUrl || scene.imageUrl;
    if (!src) continue;

    const isVideo = scene.animationUrl &&
      (scene.animationUrl.endsWith(".mp4") || scene.animationUrl.endsWith(".webm"));

    const clip: ShotstackClip = {
      asset: isVideo
        ? { type: "video", src: scene.animationUrl, volume: 0 }
        : { type: "image", src },
      start: positions[i].start,
      length: positions[i].length,
      fit: "crop",
      transition: { in: "fade", out: "fade" },
    };

    // Ken Burns zoom on still images
    if (!isVideo) {
      clip.effect = "zoomIn";
    }

    visualClips.push(clip);
  }
  const visualTrack = { clips: visualClips };

  // ─── TRACK 4: Per-scene narration audio ────────────────────────────
  const audioClips: ShotstackClip[] = [];
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const audioUrl = (scene as Record<string, unknown>).audioUrl as string | undefined;
    if (!audioUrl) continue;

    audioClips.push({
      asset: { type: "audio", src: audioUrl, volume: 1 },
      start: positions[i].start,
      length: positions[i].length,
    });
  }
  const audioTrack = { clips: audioClips };

  // ─── SOUNDTRACK: Background music ──────────────────────────────────
  const soundtrack = manifest.backgroundMusicUrl
    ? {
        src: manifest.backgroundMusicUrl,
        effect: "fadeInFadeOut",
        volume: manifest.backgroundMusicVolume ?? 0.12,
      }
    : undefined;

  return {
    timeline: {
      ...(soundtrack ? { soundtrack } : {}),
      background: "#1A1A2E",
      tracks: [
        textTrack,
        visualTrack,
        audioTrack,
      ].filter((t) => t.clips.length > 0),
    },
    output: {
      format: "mp4",
      resolution: "1080",
      fps: 30,
    },
  };
}

// ─── MAIN HANDLER ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { manifest } = await req.json();

  if (!manifest || !manifest.scenes) {
    return NextResponse.json({ erro: "manifest obrigatorio." }, { status: 400 });
  }

  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "SHOTSTACK_API_KEY nao configurada." }, { status: 400 });
  }

  const env = process.env.SHOTSTACK_ENV || "stage";
  const baseUrl = `https://api.shotstack.io/${env}`;

  const { stream, send, close } = createSSEStream();

  (async () => {
    try {
      send({ type: "progress", percent: 0, label: "A construir timeline..." });

      const edit = buildShotstackEdit(manifest);

      send({ type: "progress", percent: 5, label: "A submeter render ao Shotstack..." });

      // 1. Submit render
      const renderRes = await fetch(`${baseUrl}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify(edit),
      });

      if (!renderRes.ok) {
        const err = await renderRes.text();
        throw new Error(`Shotstack ${renderRes.status}: ${err.slice(0, 300)}`);
      }

      const renderData = await renderRes.json();
      const renderId = renderData.response?.id;
      if (!renderId) throw new Error("Shotstack nao devolveu render ID");

      send({ type: "progress", percent: 10, label: `Render submetido (${renderId.slice(0, 8)}...). A processar...` });

      // 2. Poll for completion
      let done = false;
      let lastStatus = "";

      while (!done) {
        await new Promise((r) => setTimeout(r, 5000));

        const statusRes = await fetch(`${baseUrl}/render/${renderId}`, {
          headers: { "x-api-key": apiKey },
        });

        if (!statusRes.ok) continue;

        const statusData = await statusRes.json();
        const status = statusData.response?.status;

        if (status !== lastStatus) {
          lastStatus = status;
          const labels: Record<string, { pct: number; label: string }> = {
            queued: { pct: 15, label: "Na fila..." },
            fetching: { pct: 25, label: "A descarregar assets..." },
            rendering: { pct: 50, label: "A renderizar video..." },
            saving: { pct: 85, label: "A guardar..." },
          };
          const info = labels[status] || { pct: 50, label: `Estado: ${status}` };
          send({ type: "progress", percent: info.pct, label: info.label });
        }

        if (status === "done") {
          done = true;
          const outputUrl = statusData.response?.url;
          if (!outputUrl) throw new Error("Shotstack nao devolveu URL do video");

          send({ type: "progress", percent: 90, label: "Render completo. A fazer upload ao Supabase..." });

          // 3. Upload to Supabase
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          let finalUrl = outputUrl;

          if (serviceKey && supabaseUrl) {
            try {
              const videoRes = await fetch(outputUrl);
              if (videoRes.ok) {
                const { createClient } = await import("@supabase/supabase-js");
                const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
                const filePath = `courses/${manifest.courseSlug || "video"}/videos/${manifest.sceneLabel || "render"}-${Date.now()}.mp4`;
                const videoBuffer = new Uint8Array(await videoRes.arrayBuffer());
                const { error } = await supabase.storage
                  .from("course-assets")
                  .upload(filePath, videoBuffer, { contentType: "video/mp4", upsert: true });
                if (!error) finalUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
              }
            } catch { /* keep Shotstack URL as fallback */ }
          }

          send({ type: "progress", percent: 100, label: "Video pronto!" });
          send({ type: "result", videoUrl: finalUrl });
        }

        if (status === "failed") {
          throw new Error(`Render falhou: ${statusData.response?.error || "erro desconhecido"}`);
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
