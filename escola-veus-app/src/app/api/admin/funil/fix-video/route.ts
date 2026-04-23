import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const maxDuration = 120;
export const runtime = "nodejs";

/**
 * POST /api/admin/funil/fix-video
 *
 * Reescreve o container MP4 de um vídeo Funil já renderizado, normalizando
 * a metadata de duração (moov atom) quando esta foi escrita com timestamps
 * estranhos pelo encoder original.
 *
 * Causa: encadeamento atempo + adelay + sidechaincompress + tpad no render
 * original pode produzir pts negativos ou absurdos, resultando em MP4s que
 * o Windows Media Player rejeita ("Utiliza definições de codificação não
 * suportadas", 0x80070216) ou com duração tipo 596523:14:07.
 *
 * Fix: ffmpeg -i in.mp4 -c copy -fflags +genpts -avoid_negative_ts make_zero
 * — só reescreve o container, não re-encoda (rápido, ~5s).
 *
 * Body: { videoUrl: string }
 *   URL público do MP4 em Supabase (youtube/funil-videos/*.mp4).
 *   A fix é aplicada in-place: sobreescreve o mesmo path.
 *
 * Retorna: { fixed: true, videoUrl, sizeBefore, sizeAfter }
 */

async function getFfmpegPath(): Promise<string> {
  const mod = await import("@ffmpeg-installer/ffmpeg");
  const p =
    (mod as { path?: string; default?: { path: string } }).path ??
    (mod as { default?: { path: string } }).default?.path;
  if (!p) throw new Error("ffmpeg binary nao encontrado");
  return p;
}

function runFfmpeg(ffmpeg: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(ffmpeg, args);
    let err = "";
    p.stderr.on("data", (c: Buffer) => (err += c.toString()));
    p.on("error", reject);
    p.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`ffmpeg ${code}: ${err.slice(-500)}`)),
    );
  });
}

async function dl(url: string, dest: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  await writeFile(dest, new Uint8Array(await r.arrayBuffer()));
}

export async function POST(req: NextRequest) {
  let workDir: string | null = null;
  try {
    const { videoUrl } = (await req.json()) as { videoUrl?: string };
    if (!videoUrl) {
      return NextResponse.json({ erro: "videoUrl obrigatorio" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
    }

    // Extrai o path relativo do URL público. Ex:
    //   https://<project>.supabase.co/storage/v1/object/public/course-assets/youtube/funil-videos/foo.mp4
    //   → youtube/funil-videos/foo.mp4
    const publicPrefix = `${supabaseUrl}/storage/v1/object/public/course-assets/`;
    if (!videoUrl.startsWith(publicPrefix)) {
      return NextResponse.json(
        { erro: `videoUrl nao pertence ao bucket course-assets esperado` },
        { status: 400 },
      );
    }
    const storagePath = videoUrl.slice(publicPrefix.length).split("?")[0];
    if (!storagePath.endsWith(".mp4")) {
      return NextResponse.json({ erro: "videoUrl tem de terminar em .mp4" }, { status: 400 });
    }

    workDir = await mkdtemp(join(tmpdir(), "fix-video-"));
    const inPath = join(workDir, "in.mp4");
    const outPath = join(workDir, "out.mp4");

    await dl(videoUrl, inPath);
    const sizeBefore = (await readFile(inPath)).length;

    const ffmpeg = await getFfmpegPath();
    await runFfmpeg(ffmpeg, [
      "-y",
      "-i", inPath,
      "-c", "copy",
      "-movflags", "+faststart",
      "-fflags", "+genpts",
      "-avoid_negative_ts", "make_zero",
      "-max_interleave_delta", "0",
      outPath,
    ]);

    const fixedBuf = await readFile(outPath);
    const sizeAfter = fixedBuf.length;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(storagePath, new Uint8Array(fixedBuf), {
        contentType: "video/mp4",
        upsert: true,
      });
    if (error) {
      return NextResponse.json({ erro: `Upload: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      fixed: true,
      videoUrl: `${publicPrefix}${storagePath}?t=${Date.now()}`,
      storagePath,
      sizeBefore,
      sizeAfter,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  } finally {
    if (workDir) rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
