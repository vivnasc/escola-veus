import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * POST /api/admin/funil/render
 *
 * Renders a Nomear funnel video: clips concatenated (crossfade) + narration
 * at 100% + Ancient Ground music at low volume in background.
 *
 * Body: {
 *   title: string,
 *   clips: string[],         // URLs of Runway clips in order
 *   clipDuration?: number,   // default 10
 *   narrationUrl: string,    // ElevenLabs narration MP3 (Supabase)
 *   musicUrls: string[],     // Ancient Ground tracks (loops)
 *   musicVolume?: number,    // default 0.15
 * }
 *
 * Streams SSE progress + final { type: "result", videoUrl }.
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

function buildFunilEdit(
  clips: string[],
  clipDuration: number,
  narrationUrl: string,
  musicUrls: string[],
  musicVolume: number,
) {
  const OVERLAP = 0.5;
  const stride = clipDuration - OVERLAP;
  const trackA: unknown[] = [];
  const trackB: unknown[] = [];

  clips.forEach((url, i) => {
    const clip = {
      asset: { type: "video" as const, src: url, volume: 0 },
      start: i * stride,
      length: clipDuration,
      fit: "crop" as const,
      transition: { in: "fade" as const, out: "fade" as const },
    };
    (i % 2 === 0 ? trackA : trackB).push(clip);
  });

  const videoDuration = (clips.length - 1) * stride + clipDuration;

  // Narration: starts at 0, auto-length (Shotstack will read). Volume 1.0.
  const narrationTrack = [
    {
      asset: { type: "audio" as const, src: narrationUrl, volume: 1.0 },
      start: 0,
      length: videoDuration + 1, // slightly longer; cut by output length
    },
  ];

  // Music: loops through musicUrls to cover videoDuration. Low volume + fade.
  const ESTIMATED_TRACK = 210;
  const musicClips: unknown[] = [];
  let t = 0;
  let idx = 0;
  while (t < videoDuration) {
    const src = musicUrls[idx % musicUrls.length];
    const remaining = videoDuration - t;
    const length = Math.min(ESTIMATED_TRACK, remaining);
    musicClips.push({
      asset: { type: "audio" as const, src, volume: musicVolume },
      start: t,
      length,
      transition: {
        in: t === 0 ? ("fade" as const) : undefined,
        out: remaining <= ESTIMATED_TRACK ? ("fade" as const) : undefined,
      },
    });
    t += length;
    idx++;
  }

  return {
    timeline: {
      background: "#000000",
      tracks: [
        { clips: trackA },
        { clips: trackB },
        { clips: musicClips },
        { clips: narrationTrack },
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
  const {
    title,
    clips,
    clipDuration = 10,
    narrationUrl,
    musicUrls,
    musicVolume = 0.15,
  } = body;

  if (!Array.isArray(clips) || clips.length === 0) {
    return NextResponse.json({ erro: "clips[] obrigatorio." }, { status: 400 });
  }
  if (!narrationUrl || typeof narrationUrl !== "string") {
    return NextResponse.json({ erro: "narrationUrl obrigatorio." }, { status: 400 });
  }
  if (!Array.isArray(musicUrls) || musicUrls.length === 0) {
    return NextResponse.json({ erro: "musicUrls[] obrigatorio." }, { status: 400 });
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
      send({ type: "progress", percent: 0, label: `A montar ${clips.length} clips + narração...` });

      const edit = buildFunilEdit(clips, clipDuration, narrationUrl, musicUrls, musicVolume);

      send({ type: "progress", percent: 5, label: "A enviar para Shotstack..." });

      const renderRes = await fetch(`${baseUrl}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify(edit),
      });

      if (!renderRes.ok) {
        const errText = await renderRes.text();
        throw new Error(`Shotstack HTTP ${renderRes.status}: ${errText.slice(0, 300)}`);
      }

      const renderData = await renderRes.json();
      const renderId = renderData.response?.id;
      if (!renderId) throw new Error("Shotstack nao devolveu render ID.");

      send({ type: "progress", percent: 10, label: `Render submetido (${renderId}).` });

      let done = false;
      let attempts = 0;
      const maxAttempts = 120;

      while (!done && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 5000));
        attempts++;

        const sr = await fetch(`${baseUrl}/render/${renderId}`, { headers: { "x-api-key": apiKey } });
        if (!sr.ok) continue;

        const sd = await sr.json();
        const status = sd.response?.status;
        const pct = ({ queued: 15, fetching: 30, rendering: 55, saving: 85 } as Record<string, number>)[status] ?? 50;
        send({ type: "progress", percent: pct, label: `${status}...` });

        if (status === "done") {
          done = true;
          const videoUrl = sd.response?.url;
          if (!videoUrl) throw new Error("Shotstack nao devolveu URL.");

          // Save to Supabase
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          let finalUrl = videoUrl;

          if (serviceKey && supabaseUrl) {
            try {
              send({ type: "progress", percent: 92, label: "A guardar no Supabase..." });
              const { createClient } = await import("@supabase/supabase-js");
              const supa = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
              const vRes = await fetch(videoUrl);
              const buf = new Uint8Array(await vRes.arrayBuffer());
              const safe = (title || "funil-video").toLowerCase().replace(/[^a-z0-9]+/g, "-");
              const filename = `${safe}-${Date.now()}.mp4`;
              const { error } = await supa.storage
                .from("course-assets")
                .upload(`youtube/funil-videos/${filename}`, buf, { contentType: "video/mp4", upsert: false });
              if (!error) {
                finalUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/funil-videos/${filename}`;
              }
            } catch {
              /* keep shotstack url */
            }
          }

          send({ type: "progress", percent: 100, label: "Pronto!" });
          send({ type: "result", videoUrl: finalUrl });
          close();
          return;
        }

        if (status === "failed") {
          throw new Error(sd.response?.error ?? "Shotstack falhou.");
        }
      }

      throw new Error("Timeout a aguardar Shotstack (10 min).");
    } catch (e) {
      send({ type: "error", message: e instanceof Error ? e.message : String(e) });
      close();
    }
  })();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
