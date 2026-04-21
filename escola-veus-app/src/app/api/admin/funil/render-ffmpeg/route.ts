import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { mkdtemp, writeFile, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/funil/render-ffmpeg
 *
 * Renders a funnel video locally with FFmpeg (no Shotstack credits).
 *
 * Pipeline:
 *  1. Download clips + narration + music tracks into a tmp dir.
 *  2. Build a filter_complex: concat clips with 0.5s crossfade, mix narration
 *     (100%) + music (ducked ~15% under voice via sidechaincompress).
 *  3. Run ffmpeg → output mp4.
 *  4. Upload to Supabase youtube/funil-videos/.
 *  5. Stream SSE progress events.
 *
 * Body: { title, clips[], clipDuration=10, narrationUrl, musicUrls[], musicVolume=0.15 }
 */

type SSEEvent =
  | { type: "progress"; percent: number; label: string }
  | { type: "result"; videoUrl: string }
  | { type: "error"; message: string };

function createSSE() {
  const encoder = new TextEncoder();
  let ctrl: ReadableStreamDefaultController | null = null;
  const stream = new ReadableStream({ start(c) { ctrl = c; } });
  return {
    stream,
    send: (e: SSEEvent) => ctrl?.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`)),
    close: () => ctrl?.close(),
  };
}

async function download(url: string, dest: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  const buf = new Uint8Array(await r.arrayBuffer());
  await writeFile(dest, buf);
}

// Load bundled ffmpeg binary path (installer varies by platform)
async function getFfmpegPath(): Promise<string> {
  const mod = await import("@ffmpeg-installer/ffmpeg");
  const p = (mod as { path?: string; default?: { path: string } }).path
    ?? (mod as { default?: { path: string } }).default?.path;
  if (!p) throw new Error("ffmpeg binary path nao encontrado.");
  return p;
}

function runFfmpeg(ffmpeg: string, args: string[], onStderr?: (line: string) => void) {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(ffmpeg, args);
    let errBuf = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      const s = chunk.toString();
      errBuf += s;
      if (onStderr) for (const line of s.split("\n")) if (line.trim()) onStderr(line);
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}: ${errBuf.slice(-500)}`));
    });
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title = "funil-video",
    clips,
    clipDuration = 10,
    narrationUrl,
    musicUrls,
    musicVolume = 0.15,
  } = body as {
    title?: string;
    clips?: string[];
    clipDuration?: number;
    narrationUrl?: string;
    musicUrls?: string[];
    musicVolume?: number;
  };

  if (!Array.isArray(clips) || clips.length === 0) {
    return NextResponse.json({ erro: "clips[] obrigatorio." }, { status: 400 });
  }
  if (!narrationUrl) return NextResponse.json({ erro: "narrationUrl obrigatorio." }, { status: 400 });
  if (!Array.isArray(musicUrls) || musicUrls.length === 0) {
    return NextResponse.json({ erro: "musicUrls[] obrigatorio." }, { status: 400 });
  }

  const { stream, send, close } = createSSE();

  (async () => {
    let workDirRef: string | null = null;
    try {
      const workDir = await mkdtemp(join(tmpdir(), "funil-render-"));
      workDirRef = workDir;
      const ffmpeg = await getFfmpegPath();

      send({ type: "progress", percent: 2, label: `A baixar ${clips.length} clips + áudios...` });

      // Download clips, narration, music in parallel
      const clipPaths: string[] = [];
      for (let i = 0; i < clips.length; i++) clipPaths.push(join(workDir, `clip-${i}.mp4`));
      const narrationPath = join(workDir, "narration.mp3");
      const musicPaths = musicUrls.map((_, i) => join(workDir, `music-${i}.mp3`));

      await Promise.all([
        ...clips.map((url, i) => download(url, clipPaths[i])),
        download(narrationUrl, narrationPath),
        ...musicUrls.map((url, i) => download(url, musicPaths[i])),
      ]);

      send({ type: "progress", percent: 15, label: "Download OK. A construir timeline..." });

      // Filter graph:
      //   Video: concat clips with 0.5s crossfade (xfade)
      //   Audio:
      //     - narration passthrough (1.0)
      //     - music: concat → loop → volume(musicVolume) → sidechaincompress (duck under narration)
      //     - final amix of narration + ducked music
      const OVERLAP = 0.5;
      const stride = clipDuration - OVERLAP;
      const totalDuration = (clips.length - 1) * stride + clipDuration;

      // Build xfade chain: [0:v][1:v]xfade=offset=9.5:duration=0.5[v01]; [v01][2:v]xfade=...
      const videoFilters: string[] = [];
      let prev = "0:v";
      for (let i = 1; i < clips.length; i++) {
        const out = i === clips.length - 1 ? "vconcat" : `v${i}`;
        const offset = i * stride;
        videoFilters.push(
          `[${prev}][${i}:v]xfade=transition=fade:duration=${OVERLAP}:offset=${offset.toFixed(2)}[${out}]`,
        );
        prev = out;
      }
      if (clips.length === 1) {
        videoFilters.push(`[0:v]copy[vconcat]`);
      }

      // Add fade in from black (1s) at start + fade to black (2s) at end for produced feel
      const FADE_IN = 1.0;
      const FADE_OUT = 2.0;
      videoFilters.push(
        `[vconcat]fade=t=in:st=0:d=${FADE_IN},fade=t=out:st=${(totalDuration - FADE_OUT).toFixed(2)}:d=${FADE_OUT}[vout]`,
      );

      // Audio indices: narration = clips.length, music[0..] = clips.length+1..
      const narrationIdx = clips.length;
      const musicStartIdx = clips.length + 1;

      // Music concat (if multiple): concat=n=K:v=0:a=1
      const musicInputs = musicPaths.map((_, i) => `[${musicStartIdx + i}:a]`).join("");
      const musicConcat = musicPaths.length > 1
        ? `${musicInputs}concat=n=${musicPaths.length}:v=0:a=1[musicraw]`
        : `[${musicStartIdx}:a]acopy[musicraw]`;

      // Loop music + volume + duck + fade out; narration fade in + duck-key split;
      // final mix has fade in/out for produced feel
      const NARR_FADE_IN = 0.5;
      const MUSIC_FADE_IN = 2.0;
      const MUSIC_FADE_OUT = 3.0;
      const audioFilter = [
        musicConcat,
        `[musicraw]aloop=loop=-1:size=2e+09,atrim=0:${totalDuration.toFixed(2)},asetpts=N/SR/TB,volume=${musicVolume},afade=t=in:st=0:d=${MUSIC_FADE_IN},afade=t=out:st=${(totalDuration - MUSIC_FADE_OUT).toFixed(2)}:d=${MUSIC_FADE_OUT}[musicvol]`,
        `[${narrationIdx}:a]afade=t=in:st=0:d=${NARR_FADE_IN}[narrfaded]`,
        `[narrfaded]asplit=2[narr1][narr2]`,
        `[musicvol][narr1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[musicduck]`,
        `[narr2][musicduck]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[aout]`,
      ].join(";");

      const filterComplex = [...videoFilters, audioFilter].join(";");

      const outPath = join(workDir, "out.mp4");

      const args: string[] = [
        "-y",
        ...clips.flatMap((_, i) => ["-i", clipPaths[i]]),
        "-i", narrationPath,
        ...musicPaths.flatMap((p) => ["-i", p]),
        "-filter_complex", filterComplex,
        "-map", "[vout]",
        "-map", "[aout]",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        "-t", totalDuration.toFixed(2),
        outPath,
      ];

      send({ type: "progress", percent: 25, label: `A renderizar ${totalDuration.toFixed(0)}s...` });

      let lastPct = 25;
      await runFfmpeg(ffmpeg, args, (line) => {
        const m = line.match(/time=(\d+):(\d+):(\d+\.\d+)/);
        if (m) {
          const elapsed = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
          const pct = Math.min(85, 25 + Math.floor((elapsed / totalDuration) * 60));
          if (pct !== lastPct) {
            lastPct = pct;
            send({ type: "progress", percent: pct, label: `Render ${elapsed.toFixed(1)}s / ${totalDuration.toFixed(0)}s` });
          }
        }
      });

      send({ type: "progress", percent: 90, label: "A fazer upload para Supabase..." });

      // Upload to Supabase
      const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supaUrl || !supaKey) throw new Error("Supabase nao configurado.");

      const buffer = await readFile(outPath);
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supaUrl, supaKey, { auth: { persistSession: false } });

      const safe = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const filename = `${safe}-${Date.now()}.mp4`;
      const storagePath = `youtube/funil-videos/${filename}`;

      const { error } = await supabase.storage
        .from("course-assets")
        .upload(storagePath, new Uint8Array(buffer), { contentType: "video/mp4", upsert: false });

      if (error) throw new Error(`Upload: ${error.message}`);

      const publicUrl = `${supaUrl}/storage/v1/object/public/course-assets/${storagePath}`;

      send({ type: "progress", percent: 100, label: "Pronto!" });
      send({ type: "result", videoUrl: publicUrl });
    } catch (e) {
      send({ type: "error", message: e instanceof Error ? e.message : String(e) });
    } finally {
      if (workDirRef) {
        rm(workDirRef, { recursive: true, force: true }).catch(() => {});
      }
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
