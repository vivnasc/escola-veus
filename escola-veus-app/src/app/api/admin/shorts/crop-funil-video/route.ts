import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/shorts/crop-funil-video
 *
 * Recorta um segmento de um vídeo Funil já renderizado e converte para
 * 9:16 vertical. O vídeo final já tem tudo sincronizado (clips, narração,
 * música, legendas queimadas) — so falta crop + opcional brand intro/outro.
 *
 * Modos:
 *   includeBranding=true (default):
 *     [intro brand 5s 9:16] + [crop ep 9:16] + [outro brand 5s 9:16]
 *     Total = snippet + 10s. Ex: snippet 35s → short 45s.
 *   includeBranding=false:
 *     Só o crop do ep. Total = snippet.
 *
 * Body: {
 *   epKey: string,
 *   startSec: number,
 *   endSec: number,
 *   videoUrl?: string,           // override; senao usa epCachedVideo
 *   includeBranding?: boolean,   // default true
 * }
 *
 * Retorna: { videoUrl, durationSec, totalDurationSec }
 */

const W = 1080;
const H = 1920;
const BRAND_DURATION = 5; // segundos da intro e do outro brand

type Body = {
  epKey?: string;
  startSec?: number;
  endSec?: number;
  videoUrl?: string;
  includeBranding?: boolean;
};

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

function titleToSlug(title: string): string {
  return (title || "video")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  let workDir: string | null = null;
  try {
    const body: Body = await req.json();
    const {
      epKey,
      startSec,
      endSec,
      videoUrl: providedVideoUrl,
      includeBranding = true,
    } = body;

    if (!epKey) return NextResponse.json({ erro: "epKey obrigatorio" }, { status: 400 });
    if (typeof startSec !== "number" || typeof endSec !== "number") {
      return NextResponse.json({ erro: "startSec e endSec obrigatorios" }, { status: 400 });
    }
    const dur = endSec - startSec;
    const totalDur = includeBranding ? dur + 2 * BRAND_DURATION : dur;
    // Shorts cap (YouTube/TikTok/Reels): 60s. Se includeBranding, snippet
    // max = 50s (brand usa 10s).
    if (dur <= 0 || totalDur > 60) {
      return NextResponse.json(
        {
          erro: `duracao final ${totalDur.toFixed(1)}s > 60s (limite Shorts). ${includeBranding ? "Com brand, snippet max 50s." : "Sem brand, snippet max 60s."}`,
        },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
    }

    // Resolve video URL. Se user passar explicitamente, usa isso.
    // Senao, procura o MP4 mais recente em youtube/funil-videos/ que
    // matche o slug do titulo OU o epKey (mesma logica do epCachedVideo).
    let videoUrl = providedVideoUrl || "";
    if (!videoUrl) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      });
      const { NOMEAR_PRESETS } = await import("@/data/nomear-scripts");
      let titulo = "";
      for (const preset of NOMEAR_PRESETS) {
        for (const s of preset.scripts) {
          if (
            s.id === `nomear-${epKey}` ||
            s.id === `nomear-${epKey}-00`
          ) {
            titulo = s.titulo;
          }
        }
      }
      const slug = titleToSlug(titulo || epKey);
      const { data: videosList, error: vErr } = await supabase.storage
        .from("course-assets")
        .list("youtube/funil-videos", { limit: 1000 });
      if (vErr) throw new Error(`List funil-videos: ${vErr.message}`);
      const vid = (videosList ?? [])
        .filter(
          (f) =>
            f.name?.endsWith(".mp4") &&
            (f.name.startsWith(`${slug}-`) || f.name.startsWith(`${epKey}-`)),
        )
        .sort((a, b) => b.name.localeCompare(a.name))[0];
      if (!vid) {
        return NextResponse.json(
          {
            erro: `Sem video renderizado para ${epKey} em youtube/funil-videos/. Monta o video primeiro em /admin/producao/funil/montar.`,
          },
          { status: 404 },
        );
      }
      videoUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/funil-videos/${vid.name}`;
    }

    workDir = await mkdtemp(join(tmpdir(), "crop-funil-"));
    const inPath = join(workDir, "in.mp4");
    const outPath = join(workDir, "out.mp4");
    await dl(videoUrl, inPath);

    const ffmpeg = await getFfmpegPath();

    if (includeBranding) {
      // Pipeline com intro/outro brand.
      // 1. Download intro.mp4 brand + crop 9:16 central
      // 2. Crop do segmento do ep 9:16
      // 3. Concat com xfade 0.5s entre partes
      const brandUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/brand/intro.mp4`;
      const brandPath = join(workDir, "brand.mp4");
      await dl(brandUrl, brandPath);

      // scale+crop a 1080x1920 para brand e ep. Áudio: brand tem som próprio
      // (mandala), ep tem narração+música. Mantemos os áudios nativos de cada
      // parte (brand-audio | ep-crop-audio | brand-audio).
      // Usamos concat filter v+a (fácil, sem xfade — brand e ep têm cortes
      // limpos intencionais).
      const CROSSFADE = 0.5;
      const introDur = BRAND_DURATION;
      const outroDur = BRAND_DURATION;

      // intro: pega primeiros 5s do brand + crop 9:16
      // ep-crop: -ss/-to do ep + crop 9:16
      // outro: pega primeiros 5s do brand + crop 9:16 (mesmo asset)
      // xfade entre intro→ep (offset=introDur-crossfade) e ep→outro.
      const filterComplex = [
        // brand [0:v] cropado 9:16, fps=30, sar=1
        `[0:v]scale=-2:${H},crop=${W}:${H}:(iw-${W})/2:0,setsar=1,fps=30,trim=0:${introDur.toFixed(2)},setpts=PTS-STARTPTS[vintro]`,
        `[0:a]atrim=0:${introDur.toFixed(2)},asetpts=N/SR/TB[aintro]`,
        // ep crop [1:v]
        `[1:v]scale=-2:${H},crop=${W}:${H}:(iw-${W})/2:0,setsar=1,fps=30[vep]`,
        `[1:a]asetpts=N/SR/TB[aep]`,
        // outro: re-usa brand
        `[0:v]scale=-2:${H},crop=${W}:${H}:(iw-${W})/2:0,setsar=1,fps=30,trim=0:${outroDur.toFixed(2)},setpts=PTS-STARTPTS[voutro]`,
        `[0:a]atrim=0:${outroDur.toFixed(2)},asetpts=N/SR/TB[aoutro]`,
        // xfade intro→ep
        `[vintro][vep]xfade=transition=fade:duration=${CROSSFADE}:offset=${(introDur - CROSSFADE).toFixed(2)}[vx1]`,
        `[aintro][aep]acrossfade=d=${CROSSFADE}[ax1]`,
        // xfade ep→outro: offset = intro - crossfade + ep - crossfade
        `[vx1][voutro]xfade=transition=fade:duration=${CROSSFADE}:offset=${(introDur - CROSSFADE + dur - CROSSFADE).toFixed(2)}[vout]`,
        `[ax1][aoutro]acrossfade=d=${CROSSFADE}[aout]`,
      ].join(";");

      await runFfmpeg(ffmpeg, [
        "-y",
        "-i", brandPath, // [0]
        "-ss", String(startSec),
        "-to", String(endSec),
        "-i", inPath, // [1] já trim pelo -ss/-to
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
        outPath,
      ]);
    } else {
      // Crop simples, sem brand.
      await runFfmpeg(ffmpeg, [
        "-y",
        "-ss", String(startSec),
        "-to", String(endSec),
        "-i", inPath,
        "-vf", `scale=-2:${H},crop=${W}:${H}:(iw-${W})/2:0,setsar=1`,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        outPath,
      ]);
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    const ts = Date.now();
    const videoName = `${epKey}-crop-${ts}.mp4`;
    const buf = await readFile(outPath);
    const { error } = await supabase.storage
      .from("course-assets")
      .upload(`shorts/videos/${videoName}`, new Uint8Array(buf), {
        contentType: "video/mp4",
        upsert: true,
      });
    if (error) throw new Error(`Upload: ${error.message}`);

    return NextResponse.json({
      videoUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/shorts/videos/${videoName}`,
      durationSec: dur,
      totalDurationSec: totalDur,
      sourceVideoUrl: videoUrl,
      includeBranding,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  } finally {
    if (workDir) rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
