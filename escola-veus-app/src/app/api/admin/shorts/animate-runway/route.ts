import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * POST /api/admin/shorts/animate-runway
 *
 * Animates up to 3 vertical images with Runway Gen-4 (9:16, 720:1280).
 * Streams SSE progress and per-clip result URLs. Saves each MP4 to
 * Supabase at shorts/clips/ so they survive the session.
 *
 * Body: {
 *   items: [{ imageUrl: string, motionPrompt: string, label?: string }, ...]
 *   durationSec?: 5 | 10   // default 10 (so 3 clips = 30s)
 * }
 *
 * Returns SSE events:
 *  - { type: "progress", index, percent, label }
 *  - { type: "clip", index, url }
 *  - { type: "done", clips: [...] }
 *  - { type: "error", message }
 */

type Item = { imageUrl: string; motionPrompt: string; label?: string };
type SSEEvent =
  | { type: "progress"; index: number; percent: number; label: string }
  | { type: "clip"; index: number; url: string }
  | { type: "done"; clips: string[] }
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

async function runwayImageToVideo(
  imageUrl: string,
  motionPrompt: string,
  durationSec: number,
  apiKey: string,
): Promise<ArrayBuffer> {
  const createRes = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Runway-Version": "2024-11-06",
    },
    body: JSON.stringify({
      model: "gen4_turbo",
      promptImage: imageUrl,
      promptText: motionPrompt,
      duration: durationSec,
      ratio: "720:1280",
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Runway create: ${createRes.status} — ${err.slice(0, 300)}`);
  }

  const { id: taskId } = await createRes.json();
  if (!taskId) throw new Error("Runway nao devolveu task ID.");

  const maxAttempts = 60;
  const pollInterval = 5000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const statusRes = await fetch(
      `https://api.dev.runwayml.com/v1/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-Runway-Version": "2024-11-06",
        },
      },
    );
    if (!statusRes.ok) continue;

    const status = await statusRes.json();
    if (status.status === "FAILED") {
      throw new Error(`Runway falhou: ${status.failure || "erro"}`);
    }
    if (status.status === "SUCCEEDED" && status.output?.length > 0) {
      const videoUrl = status.output[0];
      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) throw new Error("Nao consegui descarregar video Runway.");
      return videoRes.arrayBuffer();
    }
  }

  throw new Error("Timeout: Runway nao completou em 5 minutos.");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const items: Item[] = body.items || [];
  const durationSec: number = body.durationSec === 5 ? 5 : 10;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ erro: "items[] obrigatorio." }, { status: 400 });
  }
  if (items.length > 3) {
    return NextResponse.json({ erro: "Maximo 3 clips." }, { status: 400 });
  }
  for (const it of items) {
    if (!it.imageUrl || !it.motionPrompt) {
      return NextResponse.json(
        { erro: "Cada item precisa de imageUrl e motionPrompt." },
        { status: 400 },
      );
    }
  }

  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "RUNWAY_API_KEY nao configurada." },
      { status: 500 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const { stream, send, close } = createSSEStream();

  (async () => {
    const results: string[] = new Array(items.length).fill("");
    try {
      await Promise.all(
        items.map(async (item, index) => {
          try {
            send({ type: "progress", index, percent: 5, label: "A submeter ao Runway..." });
            const buf = await runwayImageToVideo(
              item.imageUrl,
              item.motionPrompt,
              durationSec,
              apiKey,
            );

            send({ type: "progress", index, percent: 80, label: "A guardar no Supabase..." });

            let finalUrl = "";
            if (supabaseUrl && serviceKey) {
              const { createClient } = await import("@supabase/supabase-js");
              const supabase = createClient(supabaseUrl, serviceKey, {
                auth: { persistSession: false },
              });
              const safeLabel = (item.label || `clip-${index + 1}`)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .slice(0, 40) || `clip-${index + 1}`;
              const filePath = `shorts/clips/${safeLabel}-${Date.now()}.mp4`;
              const { error } = await supabase.storage
                .from("course-assets")
                .upload(filePath, new Uint8Array(buf), {
                  contentType: "video/mp4",
                  upsert: true,
                });
              if (error) throw new Error(`Supabase upload: ${error.message}`);
              finalUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
            } else {
              // fallback: inline data URL would be too heavy; require supabase
              throw new Error("Supabase service key nao configurada.");
            }

            results[index] = finalUrl;
            send({ type: "progress", index, percent: 100, label: "Pronto." });
            send({ type: "clip", index, url: finalUrl });
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            send({ type: "error", message: `Clip ${index + 1}: ${msg}` });
          }
        }),
      );

      if (results.every((u) => u)) {
        send({ type: "done", clips: results });
      }
    } catch (err) {
      send({ type: "error", message: err instanceof Error ? err.message : String(err) });
    } finally {
      close();
    }
  })();

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
