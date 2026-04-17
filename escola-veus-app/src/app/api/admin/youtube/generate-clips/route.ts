import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * POST /api/admin/youtube/generate-clips
 *
 * Batch: submits multiple images to Runway image-to-video API.
 * Polls until all are done. Saves clips to Supabase.
 *
 * Body: {
 *   images: Array<{ url: string, id: string }>,
 *   motionPrompt?: string,
 *   videoFolder?: string,  // e.g. "video-01"
 * }
 *
 * Returns SSE stream with progress + results.
 */

type SSEEvent =
  | { type: "progress"; done: number; total: number; label: string }
  | { type: "clip_done"; id: string; videoUrl: string }
  | { type: "clip_failed"; id: string; reason: string }
  | { type: "result"; clips: Array<{ id: string; videoUrl: string }> }
  | { type: "error"; message: string };

const DEFAULT_MOTION = "slow cinematic camera movement, gentle natural motion, soft light changes, 4k film quality";

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
  const body = await req.json();
  const {
    images,
    motionPrompt = DEFAULT_MOTION,
    videoFolder = "clips",
  } = body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return NextResponse.json({ erro: "images[] obrigatorio." }, { status: 400 });
  }

  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "RUNWAY_API_KEY nao configurada." }, { status: 500 });
  }

  const { stream, send, close } = createSSEStream();

  (async () => {
    try {
      const total = images.length;
      send({ type: "progress", done: 0, total, label: `A submeter ${total} imagens ao Runway...` });

      // Submit all images
      const tasks: Array<{ id: string; taskId: string }> = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        send({ type: "progress", done: i, total, label: `A submeter ${img.id}... (${i + 1}/${total})` });

        try {
          const res = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "X-Runway-Version": "2024-11-06",
            },
            body: JSON.stringify({
              model: "gen4_turbo",
              promptImage: img.url,
              promptText: motionPrompt,
              duration: 10,
              ratio: "1280:720",
            }),
          });

          if (!res.ok) {
            const errText = await res.text().catch(() => "");
            send({ type: "clip_failed", id: img.id, reason: `Runway ${res.status}: ${errText.slice(0, 200)}` });
            continue;
          }

          const data = await res.json();
          if (data.id) {
            tasks.push({ id: img.id, taskId: data.id });
          }
        } catch (err) {
          send({ type: "clip_failed", id: img.id, reason: err instanceof Error ? err.message : String(err) });
        }

        // Small delay between submissions to avoid rate limiting
        if (i < images.length - 1) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      send({ type: "progress", done: 0, total: tasks.length, label: `${tasks.length} submetidos. A aguardar Runway...` });

      // Poll until all done
      const completed: Array<{ id: string; videoUrl: string }> = [];
      const pending = new Set(tasks.map((t) => t.id));
      let attempts = 0;
      const maxAttempts = 180; // 15 min max (5s × 180)

      while (pending.size > 0 && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 5000));
        attempts++;

        for (const task of tasks) {
          if (!pending.has(task.id)) continue;

          try {
            const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${task.taskId}`, {
              headers: { Authorization: `Bearer ${apiKey}`, "X-Runway-Version": "2024-11-06" },
            });

            if (!res.ok) continue;
            const data = await res.json();

            if (data.status === "SUCCEEDED" && data.output?.length > 0) {
              const videoUrl = data.output[0];
              pending.delete(task.id);
              completed.push({ id: task.id, videoUrl });
              send({ type: "clip_done", id: task.id, videoUrl });
              send({ type: "progress", done: completed.length, total: tasks.length, label: `${completed.length}/${tasks.length} clips prontos` });

              // Upload to Supabase
              try {
                const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                if (serviceKey && supabaseUrl) {
                  const vidRes = await fetch(videoUrl);
                  if (vidRes.ok) {
                    const { createClient } = await import("@supabase/supabase-js");
                    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
                    const filePath = `youtube/clips/${videoFolder}/${task.id}.mp4`;
                    const buffer = new Uint8Array(await vidRes.arrayBuffer());
                    await supabase.storage
                      .from("course-assets")
                      .upload(filePath, buffer, { contentType: "video/mp4", upsert: true });
                  }
                }
              } catch { /* keep Runway URL as fallback */ }
            }

            if (data.status === "FAILED") {
              pending.delete(task.id);
              send({ type: "clip_failed", id: task.id, reason: data.failure || "Runway falhou" });
            }
          } catch { /* retry next poll */ }
        }
      }

      if (pending.size > 0) {
        send({ type: "progress", done: completed.length, total: tasks.length, label: `Timeout. ${pending.size} clips nao terminaram.` });
      }

      send({ type: "result", clips: completed });
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
