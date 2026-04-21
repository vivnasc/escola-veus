import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { mkdtemp, writeFile, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/shorts/render-ffmpeg
 *
 * Renderiza um short vertical (1080x1920, 9:16) com FFmpeg local.
 * Alternativa grátis ao Shotstack.
 *
 * Pipeline:
 *  1. Download 3 clips verticais + 1 faixa Loranne para /tmp
 *  2. Decode dos 2 PNGs de overlay (dataURL base64) enviados pelo cliente
 *     (gerados com html-to-image — evita dependencia de fonte no servidor)
 *  3. filter_complex:
 *       - concat 3 clips (scale+pad para 1080x1920 cada)
 *       - overlay PNG1 entre 0–halfSec, overlay PNG2 entre halfSec–total
 *       - musica como audio principal (volume fixo)
 *  4. Upload para Supabase em shorts/videos/
 *  5. SSE: progress baseado no time= do stderr
 *
 * Body: {
 *   title?: string,
 *   clips: string[],           // 3 URLs MP4 verticais
 *   clipDuration?: number,     // default 10
 *   musicUrl: string,
 *   musicVolume?: number,      // 0..1, default 0.9
 *   overlayPngs: [string, string],   // dataURL "data:image/png;base64,..."
 *   overlayStart?: [number, number], // default [0, half]
 *   overlayEnd?: [number, number],   // default [half, total]
 * }
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
    send: (e: SSEEvent) =>
      ctrl?.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`)),
    close: () => ctrl?.close(),
  };
}

async function download(url: string, dest: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  await writeFile(dest, new Uint8Array(await r.arrayBuffer()));
}

async function writeDataUrl(dataUrl: string, dest: string) {
  const m = dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
  if (!m) throw new Error("Overlay PNG inválido (esperava dataURL base64).");
  const buf = Buffer.from(m[2], "base64");
  await writeFile(dest, buf);
}

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
    title = "short",
    clips,
    clipDuration = 10,
    musicUrl,
    musicVolume = 0.9,
    musicStartSec = 0,
    overlayPngs,
    overlayStart,
    overlayEnd,
  } = body as {
    title?: string;
    clips?: string[];
    clipDuration?: number;
    musicUrl?: string;
    musicVolume?: number;
    musicStartSec?: number;
    overlayPngs?: [string, string];
    overlayStart?: [number, number];
    overlayEnd?: [number, number];
  };

  if (!Array.isArray(clips) || clips.length === 0) {
    return NextResponse.json({ erro: "clips[] obrigatorio." }, { status: 400 });
  }
  const hasMusic = !!musicUrl;

  const { stream, send, close } = createSSE();

  (async () => {
    let workDirRef: string | null = null;
    try {
      const workDir = await mkdtemp(join(tmpdir(), "shorts-render-"));
      workDirRef = workDir;
      const ffmpeg = await getFfmpegPath();

      send({
        type: "progress",
        percent: 2,
        label: hasMusic
          ? `A baixar ${clips.length} clips + música...`
          : `A baixar ${clips.length} clips (sem música)...`,
      });

      const clipPaths = clips.map((_, i) => join(workDir, `clip-${i}.mp4`));
      const musicPath = hasMusic ? join(workDir, "music.mp3") : null;

      await Promise.all([
        ...clips.map((url, i) => download(url, clipPaths[i])),
        ...(musicPath && musicUrl ? [download(musicUrl, musicPath)] : []),
      ]);

      // Overlay PNGs (opcionais)
      const overlayPath1 = overlayPngs?.[0] ? join(workDir, "ovl-1.png") : null;
      const overlayPath2 = overlayPngs?.[1] ? join(workDir, "ovl-2.png") : null;
      if (overlayPath1 && overlayPngs) await writeDataUrl(overlayPngs[0], overlayPath1);
      if (overlayPath2 && overlayPngs) await writeDataUrl(overlayPngs[1], overlayPath2);

      send({ type: "progress", percent: 15, label: "Download OK. A montar timeline..." });

      // xfade (crossfade) entre clips: total = (N-1)*stride + clipDuration
      const OVERLAP = 0.6;
      const stride = clipDuration - OVERLAP;
      const totalDuration = (clips.length - 1) * stride + clipDuration;
      const halfSec = totalDuration / 2;
      const [o1Start, o2Start] = overlayStart ?? [0.4, halfSec + 0.1];
      const [o1End, o2End] = overlayEnd ?? [halfSec - 0.2, totalDuration - 0.4];

      // 1) Normaliza cada clip: scale+crop para 1080x1920 + setsar + fps + trim
      const scaleFilters = clips.map(
        (_, i) =>
          `[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30,trim=0:${clipDuration.toFixed(
            2,
          )},setpts=PTS-STARTPTS[v${i}]`,
      );

      // 2) Encadeia xfade 0.6s: [v0][v1]xfade=offset=9.4[vx1]; [vx1][v2]xfade=offset=18.8[vfinal]
      const xfadeFilters: string[] = [];
      let prev = "v0";
      if (clips.length === 1) {
        xfadeFilters.push(`[v0]copy[vfinal]`);
      } else {
        for (let i = 1; i < clips.length; i++) {
          const out = i === clips.length - 1 ? "vfinal" : `vx${i}`;
          const offset = i * stride;
          xfadeFilters.push(
            `[${prev}][v${i}]xfade=transition=fade:duration=${OVERLAP}:offset=${offset.toFixed(
              2,
            )}[${out}]`,
          );
          prev = out;
        }
      }

      // 3) Overlays PNG timed. As entradas de overlay começam depois do vídeo
      //    (e depois da música, se existir).
      const ovlBaseIdx = clips.length + (hasMusic ? 1 : 0);
      let ovlIdxCounter = ovlBaseIdx;
      const ovlInputs: string[] = [];
      const ovlFilters: string[] = [];
      let lastVideoLabel = "vfinal";

      if (overlayPath1) {
        const idx = ovlIdxCounter++;
        ovlInputs.push(overlayPath1);
        const out = overlayPath2 ? "vo1" : "vout";
        ovlFilters.push(
          `[${lastVideoLabel}][${idx}:v]overlay=0:0:enable='between(t,${o1Start.toFixed(
            2,
          )},${o1End.toFixed(2)})'[${out}]`,
        );
        lastVideoLabel = out;
      }
      if (overlayPath2) {
        const idx = ovlIdxCounter++;
        ovlInputs.push(overlayPath2);
        const out = "vout";
        ovlFilters.push(
          `[${lastVideoLabel}][${idx}:v]overlay=0:0:enable='between(t,${o2Start.toFixed(
            2,
          )},${o2End.toFixed(2)})'[${out}]`,
        );
        lastVideoLabel = out;
      }
      if (!overlayPath1 && !overlayPath2) {
        ovlFilters.push(`[vfinal]copy[vout]`);
      }

      // 4) Audio: música com fade in/out (se existir). Sem música → sem filter áudio.
      const filterParts = [...scaleFilters, ...xfadeFilters, ...ovlFilters];
      if (hasMusic) {
        const musicIdx = clips.length;
        filterParts.push(
          `[${musicIdx}:a]atrim=0:${totalDuration.toFixed(
            2,
          )},asetpts=N/SR/TB,volume=${musicVolume},afade=t=in:st=0:d=0.6,afade=t=out:st=${(
            totalDuration - 0.6
          ).toFixed(2)}:d=0.6[aout]`,
        );
      }

      const filterComplex = filterParts.join(";");

      const outPath = join(workDir, "out.mp4");

      // Input seek do audio: -ss ANTES de -i usa fast seek (keyframe-acc., ~ok p/ mp3)
      const safeStart = Math.max(0, Math.floor(musicStartSec));
      const args: string[] = [
        "-y",
        ...clips.flatMap((_, i) => ["-i", clipPaths[i]]),
        ...(hasMusic && musicPath
          ? [...(safeStart > 0 ? ["-ss", String(safeStart)] : []), "-i", musicPath]
          : []),
        ...ovlInputs.flatMap((p) => ["-i", p]),
        "-filter_complex", filterComplex,
        "-map", "[vout]",
        ...(hasMusic ? ["-map", "[aout]"] : []),
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        ...(hasMusic
          ? ["-c:a", "aac", "-b:a", "192k"]
          : []),
        "-movflags", "+faststart",
        "-t", totalDuration.toFixed(2),
        outPath,
      ];

      send({ type: "progress", percent: 25, label: `A renderizar ${totalDuration}s...` });

      let lastPct = 25;
      await runFfmpeg(ffmpeg, args, (line) => {
        const m = line.match(/time=(\d+):(\d+):(\d+\.\d+)/);
        if (m) {
          const elapsed =
            parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
          const pct = Math.min(85, 25 + Math.floor((elapsed / totalDuration) * 60));
          if (pct !== lastPct) {
            lastPct = pct;
            send({
              type: "progress",
              percent: pct,
              label: `Render ${elapsed.toFixed(1)}s / ${totalDuration}s`,
            });
          }
        }
      });

      send({ type: "progress", percent: 90, label: "Upload para Supabase..." });

      const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supaUrl || !supaKey) throw new Error("Supabase nao configurado.");

      const buffer = await readFile(outPath);
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supaUrl, supaKey, { auth: { persistSession: false } });

      const safe =
        title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
        "short";
      const filename = `${safe}-${Date.now()}.mp4`;
      const storagePath = `shorts/videos/${filename}`;

      const { error } = await supabase.storage
        .from("course-assets")
        .upload(storagePath, new Uint8Array(buffer), {
          contentType: "video/mp4",
          upsert: false,
        });
      if (error) throw new Error(`Upload: ${error.message}`);

      const publicUrl = `${supaUrl}/storage/v1/object/public/course-assets/${storagePath}`;

      send({ type: "progress", percent: 100, label: "Pronto!" });
      send({ type: "result", videoUrl: publicUrl });
    } catch (e) {
      send({ type: "error", message: e instanceof Error ? e.message : String(e) });
    } finally {
      if (workDirRef) rm(workDirRef, { recursive: true, force: true }).catch(() => {});
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
