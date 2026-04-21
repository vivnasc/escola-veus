import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

/**
 * POST /api/admin/shorts/render
 *
 * Renders a 30s vertical short: 3 Runway clips (9:16) + 1 Loranne track
 * + 2 verse text overlays. Output: MP4 1080x1920.
 *
 * Body: {
 *   title?: string,
 *   clips: string[],          // 3 vertical MP4 URLs (each ~10s)
 *   clipDuration?: number,    // default 10
 *   musicUrl: string,         // Loranne track URL
 *   musicVolume?: number,     // 0-1, default 0.9
 *   verses: [string, string], // two overlay verses
 * }
 *
 * Returns SSE stream (progress + final result).
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

function buildShortEdit(
  clips: string[],
  clipDuration: number,
  musicUrl: string,
  musicVolume: number,
  verses: [string, string],
  musicStartSec: number,
) {
  const total = clips.length * clipDuration;

  const videoClips = clips.map((url, i) => ({
    asset: { type: "video" as const, src: url, volume: 0 },
    start: i * clipDuration,
    length: clipDuration,
    fit: "cover" as const,
    transition: { in: "fade" as const, out: "fade" as const },
  }));

  const musicClip = {
    asset: {
      type: "audio" as const,
      src: musicUrl,
      volume: musicVolume,
      trim: Math.max(0, Math.floor(musicStartSec)) || undefined,
    },
    start: 0,
    length: total,
    transition: { in: "fade" as const, out: "fade" as const },
  };

  // Split 2 verses across the 30s: verse 1 on first half, verse 2 on second half
  const half = total / 2;
  const textClips = [];
  if (verses[0]?.trim()) {
    textClips.push({
      asset: {
        type: "text" as const,
        text: verses[0].trim(),
        font: {
          family: "Montserrat ExtraBold",
          color: "#ffffff",
          size: 56,
          lineHeight: 1.15,
        },
        alignment: { horizontal: "center" as const, vertical: "center" as const },
        background: { color: "#000000", opacity: 0.35, padding: 24, borderRadius: 12 },
        width: 900,
        height: 500,
      },
      start: 0.5,
      length: half - 0.5,
      offset: { y: -0.08 },
      transition: { in: "fade" as const, out: "fade" as const },
    });
  }
  if (verses[1]?.trim()) {
    textClips.push({
      asset: {
        type: "text" as const,
        text: verses[1].trim(),
        font: {
          family: "Montserrat ExtraBold",
          color: "#ffffff",
          size: 56,
          lineHeight: 1.15,
        },
        alignment: { horizontal: "center" as const, vertical: "center" as const },
        background: { color: "#000000", opacity: 0.35, padding: 24, borderRadius: 12 },
        width: 900,
        height: 500,
      },
      start: half,
      length: total - half - 0.3,
      offset: { y: -0.08 },
      transition: { in: "fade" as const, out: "fade" as const },
    });
  }

  const tracks: Array<{ clips: unknown[] }> = [
    { clips: textClips }, // topmost (text)
    { clips: videoClips },
  ];
  if (musicUrl) tracks.push({ clips: [musicClip] });

  return {
    timeline: { background: "#000000", tracks },
    output: {
      format: "mp4" as const,
      resolution: "1080" as const,
      aspectRatio: "9:16" as const,
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
    musicUrl,
    musicVolume = 0.9,
    musicStartSec = 0,
    verses,
  } = body;

  if (!Array.isArray(clips) || clips.length === 0) {
    return NextResponse.json({ erro: "clips[] obrigatorio." }, { status: 400 });
  }
  const validClips = clips.filter((u: string) => typeof u === "string" && u.trim().length > 0);
  if (validClips.length === 0) {
    return NextResponse.json({ erro: "Nenhum clip valido." }, { status: 400 });
  }
  const safeMusicUrl = typeof musicUrl === "string" && musicUrl.trim() ? musicUrl : "";
  const safeVerses: [string, string] = Array.isArray(verses)
    ? [String(verses[0] || ""), String(verses[1] || "")]
    : ["", ""];

  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "SHOTSTACK_API_KEY nao configurada." }, { status: 500 });
  }
  const env = process.env.SHOTSTACK_ENV || "stage";
  const baseUrl = `https://api.shotstack.io/${env}`;

  const { stream, send, close } = createSSEStream();

  (async () => {
    try {
      send({ type: "progress", percent: 5, label: "A enviar para Shotstack..." });

      const edit = buildShortEdit(validClips, clipDuration, safeMusicUrl, musicVolume, safeVerses, musicStartSec);

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

      send({ type: "progress", percent: 15, label: "Render submetido. A processar..." });

      const progressMap: Record<string, number> = {
        queued: 20, fetching: 35, rendering: 60, saving: 85,
      };

      let done = false;
      let attempts = 0;
      const maxAttempts = 120; // ~10 min

      while (!done && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 5000));
        attempts++;

        const statusRes = await fetch(`${baseUrl}/render/${renderId}`, {
          headers: { "x-api-key": apiKey },
        });
        if (!statusRes.ok) continue;

        const statusData = await statusRes.json();
        const status = statusData.response?.status;
        send({
          type: "progress",
          percent: progressMap[status] || 50,
          label: `${status}...`,
        });

        if (status === "done") {
          done = true;
          const videoUrl = statusData.response?.url;
          if (!videoUrl) throw new Error("Shotstack nao devolveu URL.");

          // Save to Supabase bucket `escola-shorts`, pasta `videos/`
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          let finalUrl = videoUrl;

          if (serviceKey && supabaseUrl) {
            send({ type: "progress", percent: 90, label: "A guardar no Supabase..." });
            try {
              const videoRes = await fetch(videoUrl);
              if (videoRes.ok) {
                const { createClient } = await import("@supabase/supabase-js");
                const supabase = createClient(supabaseUrl, serviceKey, {
                  auth: { persistSession: false },
                });
                const slug = (title || "short")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .slice(0, 50) || "short";
                const filePath = `videos/${slug}-${Date.now()}.mp4`;
                const buf = new Uint8Array(await videoRes.arrayBuffer());
                const { error } = await supabase.storage
                  .from("escola-shorts")
                  .upload(filePath, buf, {
                    contentType: "video/mp4",
                    upsert: true,
                  });
                if (!error) {
                  finalUrl = `${supabaseUrl}/storage/v1/object/public/escola-shorts/${filePath}`;
                }
              }
            } catch { /* fallback to shotstack URL */ }
          }

          send({ type: "progress", percent: 100, label: "Short pronto!" });
          send({ type: "result", videoUrl: finalUrl });
        }

        if (status === "failed") {
          throw new Error(`Render falhou: ${statusData.response?.error || "erro"}`);
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
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
