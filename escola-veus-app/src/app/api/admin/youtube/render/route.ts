import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * POST /api/admin/youtube/render
 *
 * Renders a YouTube ambient video: 20 clips + 1 music track → MP4.
 * Uses Shotstack cloud API. No text overlay, no narration.
 *
 * Body: {
 *   title: string,
 *   clips: string[],       // 20 URLs of Runway MP4 clips
 *   musicUrl: string,       // ancient-ground track URL
 *   musicVolume?: number,   // 0-1 (default 0.8)
 *   clipDuration?: number,  // seconds per clip (default 15)
 * }
 *
 * Returns SSE stream: progress events + final { type: "result", videoUrl }
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

function buildYouTubeEdit(
  clips: string[],
  musicUrls: string[],
  musicVolume: number,
  clipDuration: number,
) {
  const videoClips = clips.map((url, i) => ({
    asset: { type: "video" as const, src: url, volume: 0 },
    start: i * clipDuration,
    length: clipDuration,
    fit: "crop" as const,
    transition: { in: "fade" as const, out: "fade" as const },
  }));

  const totalDuration = clips.length * clipDuration;

  // Loop music pair: A → B → A → B... until video ends
  // Estimate ~3-4 min per Suno track. Place them alternating.
  const ESTIMATED_TRACK_DURATION = 210; // ~3.5 min safe estimate
  const musicClips = [];
  let musicTime = 0;
  let trackIndex = 0;

  while (musicTime < totalDuration) {
    const url = musicUrls[trackIndex % musicUrls.length];
    const remaining = totalDuration - musicTime;
    const length = Math.min(ESTIMATED_TRACK_DURATION, remaining);

    musicClips.push({
      asset: { type: "audio" as const, src: url, volume: musicVolume },
      start: musicTime,
      length,
      transition: {
        in: musicTime === 0 ? ("fade" as const) : undefined,
        out: remaining <= ESTIMATED_TRACK_DURATION ? ("fade" as const) : undefined,
      },
    });

    musicTime += length;
    trackIndex++;
  }

  return {
    timeline: {
      background: "#000000",
      tracks: [
        { clips: videoClips },
        { clips: musicClips },
      ],
    },
    output: {
      format: "mp4" as const,
      resolution: "1080" as const,
      fps: 30,
    },
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, clips, musicUrls, musicUrl, musicVolume = 0.8, clipDuration = 15 } = body;

  if (!clips || !Array.isArray(clips) || clips.length === 0) {
    return NextResponse.json({ erro: "clips[] obrigatorio." }, { status: 400 });
  }

  // Support both musicUrls (pair) and legacy musicUrl (single)
  const resolvedMusicUrls: string[] = musicUrls && Array.isArray(musicUrls)
    ? musicUrls.filter((u: string) => u && u.trim().length > 0)
    : musicUrl ? [musicUrl] : [];

  if (resolvedMusicUrls.length === 0) {
    return NextResponse.json({ erro: "musicUrls[] ou musicUrl obrigatorio." }, { status: 400 });
  }

  const validClips = clips.filter((u: string) => u && u.trim().length > 0);
  if (validClips.length === 0) {
    return NextResponse.json({ erro: "Nenhum clip valido." }, { status: 400 });
  }

  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "SHOTSTACK_API_KEY nao configurada." }, { status: 500 });
  }

  const env = process.env.SHOTSTACK_ENV || "stage";
  const baseUrl = `https://api.shotstack.io/${env}`;

  const { stream, send, close } = createSSEStream();

  (async () => {
    try {
      send({ type: "progress", percent: 0, label: `A montar ${validClips.length} clips...` });

      const edit = buildYouTubeEdit(validClips, resolvedMusicUrls, musicVolume, clipDuration);

      send({ type: "progress", percent: 5, label: "A enviar para Shotstack..." });

      const renderRes = await fetch(`${baseUrl}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify(edit),
      });

      if (!renderRes.ok) {
        const err = await renderRes.text();
        throw new Error(`Shotstack HTTP ${renderRes.status}: ${err.slice(0, 300)}`);
      }

      const renderData = await renderRes.json();
      const renderId = renderData.response?.id;
      if (!renderId) throw new Error("Shotstack nao devolveu render ID.");

      send({ type: "progress", percent: 10, label: `Render submetido. A processar ${validClips.length} clips...` });

      let done = false;
      let attempts = 0;
      const maxAttempts = 120; // 10 min max (5s × 120)

      while (!done && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 5000));
        attempts++;

        const statusRes = await fetch(`${baseUrl}/render/${renderId}`, {
          headers: { "x-api-key": apiKey },
        });

        if (!statusRes.ok) continue;

        const statusData = await statusRes.json();
        const status = statusData.response?.status;

        const progressMap: Record<string, number> = {
          queued: 15, fetching: 30, rendering: 55, saving: 85,
        };
        const pct = progressMap[status] || 50;
        send({ type: "progress", percent: pct, label: `${status}...` });

        if (status === "done") {
          done = true;
          const videoUrl = statusData.response?.url;
          if (!videoUrl) throw new Error("Shotstack nao devolveu URL.");

          // Upload to Supabase
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          let finalUrl = videoUrl;

          if (serviceKey && supabaseUrl) {
            send({ type: "progress", percent: 90, label: "A guardar no Supabase..." });
            try {
              const videoRes = await fetch(videoUrl);
              if (videoRes.ok) {
                const { createClient } = await import("@supabase/supabase-js");
                const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
                const slug = (title || "youtube").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
                const filePath = `youtube/videos/${slug}-${Date.now()}.mp4`;
                const buffer = new Uint8Array(await videoRes.arrayBuffer());
                const { error } = await supabase.storage
                  .from("course-assets")
                  .upload(filePath, buffer, { contentType: "video/mp4", upsert: true });
                if (!error) finalUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
              }
            } catch { /* fallback to Shotstack URL */ }
          }

          send({ type: "progress", percent: 100, label: "Video pronto!" });
          send({ type: "result", videoUrl: finalUrl });
        }

        if (status === "failed") {
          throw new Error(`Render falhou: ${statusData.response?.error || "erro desconhecido"}`);
        }
      }

      if (!done) throw new Error("Timeout — render demorou mais de 10 min.");
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
