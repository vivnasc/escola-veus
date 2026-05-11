import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const maxDuration = 60;
export const runtime = "nodejs";

/**
 * POST /api/admin/longos/generate-thumbnail
 *
 * Thumbnail YouTube (1280x720) a partir do vídeo final do longo +
 * brand "A ESCOLA DOS VÉUS" + thumbnailText em serif bold.
 *
 * Espelha exactamente o funil /api/admin/funil/generate-thumbnail.
 * Single diff: path Supabase = longos-videos/<slug>-thumb.png e
 * default frame = 10s (dentro do 1º clip).
 *
 * Body: { slug }
 * Returns: { url } — URL pública do PNG em Supabase
 */

async function getFfmpegPath(): Promise<string> {
  const mod = await import("@ffmpeg-installer/ffmpeg");
  const p = (mod as { path?: string; default?: { path: string } }).path
    ?? (mod as { default?: { path: string } }).default?.path;
  if (!p) throw new Error("ffmpeg binary path nao encontrado");
  return p;
}

function runFfmpeg(ffmpeg: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(ffmpeg, args);
    let err = "";
    p.stderr.on("data", (c) => (err += c.toString()));
    p.on("error", reject);
    p.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}: ${err.slice(-500)}`)),
    );
  });
}

async function downloadTo(url: string, dest: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  await writeFile(dest, new Uint8Array(await r.arrayBuffer()));
}

function escapeDrawtextText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\\\'")
    .replace(/:/g, "\\:")
    .replace(/%/g, "\\%");
}

function escapeFilterPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/:/g, "\\:");
}

function wrapLines(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let buf: string[] = [];
  for (const w of words) {
    const next = [...buf, w].join(" ");
    if (next.length > maxChars && buf.length > 0) {
      lines.push(buf.join(" "));
      buf = [w];
    } else {
      buf.push(w);
    }
  }
  if (buf.length) lines.push(buf.join(" "));
  return lines;
}

export async function POST(req: NextRequest) {
  let workDir: string | null = null;
  try {
    const { slug, frameTimeSec } = (await req.json()) as {
      slug?: string;
      frameTimeSec?: number;
    };

    if (!slug || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
      return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
    }

    // Carrega projecto para obter videoUrl + thumbnailText
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { data: projData, error: projErr } = await supabase.storage
      .from("course-assets")
      .download(`admin/longos/${slug}.json`);
    if (projErr || !projData) {
      return NextResponse.json({ erro: "Projecto não encontrado" }, { status: 404 });
    }
    const project = JSON.parse(await projData.text()) as {
      videoUrl?: string;
      titulo?: string;
      thumbnailText?: string;
    };

    if (!project.videoUrl) {
      return NextResponse.json(
        { erro: "Projecto não tem videoUrl — renderiza primeiro" },
        { status: 400 },
      );
    }

    const titulo = project.thumbnailText || project.titulo || slug;

    workDir = await mkdtemp(join(tmpdir(), "longo-thumb-"));
    const ffmpeg = await getFfmpegPath();

    const srcPath = join(workDir, "src.mp4");
    await downloadTo(project.videoUrl, srcPath);

    // Default 10s: vídeo do longo tem intro 5s + crossfade ~1s, então 10s
    // já está dentro do primeiro clip (frame com conteúdo, não brand mandala)
    const frameT =
      typeof frameTimeSec === "number" ? Math.max(0, frameTimeSec) : 10;

    const outPath = join(workDir, "thumb.png");

    // Bundled fonts em assets/fonts/ (incluídos via outputFileTracingIncludes)
    const cwd = process.cwd();
    const fontRegular = escapeFilterPath(
      join(cwd, "assets", "fonts", "DejaVuSerif.ttf"),
    );
    const fontBold = escapeFilterPath(
      join(cwd, "assets", "fonts", "DejaVuSerif-Bold.ttf"),
    );

    const tituloLines = wrapLines(titulo.toUpperCase(), 18);
    const longestLine = tituloLines.reduce(
      (max, ln) => Math.max(max, ln.length),
      0,
    );
    let tituloFontsize: number;
    if (tituloLines.length >= 3) {
      tituloFontsize = longestLine > 14 ? 52 : 60;
    } else if (tituloLines.length === 2) {
      tituloFontsize = longestLine > 16 ? 64 : longestLine > 12 ? 72 : 80;
    } else {
      tituloFontsize = longestLine > 16 ? 76 : longestLine > 12 ? 88 : 96;
    }

    const drawBrand =
      `drawtext=fontfile='${fontRegular}':` +
      `text='${escapeDrawtextText("A ESCOLA DOS VÉUS")}':` +
      `fontsize=44:fontcolor=0xD4A853:` +
      `x=(w-text_w)/2:y=80:` +
      `borderw=0`;

    const titleBlockH = tituloLines.length * tituloFontsize * 1.15;
    const titleY0 = Math.round((720 - titleBlockH) / 2 + tituloFontsize * 0.8);

    const drawTituloLines = tituloLines.map((ln, i) => {
      const y = titleY0 + Math.round(i * tituloFontsize * 1.15);
      return (
        `drawtext=fontfile='${fontBold}':` +
        `text='${escapeDrawtextText(ln)}':` +
        `fontsize=${tituloFontsize}:fontcolor=0xF5F0E6:` +
        `x=(w-text_w)/2:y=${y}:` +
        `borderw=3:bordercolor=0x000000`
      );
    });

    const filterComplex = [
      `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1280:720,setsar=1`,
      `curves=darker`,
      drawBrand,
      ...drawTituloLines,
    ].join(",");

    await runFfmpeg(ffmpeg, [
      "-y",
      "-ss", String(frameT),
      "-i", srcPath,
      "-frames:v", "1",
      "-vf", filterComplex,
      outPath,
    ]);

    const pngBuf = await readFile(outPath);

    const fname = `${slug}-thumb.png`;
    const storagePath = `longos-videos/${fname}`;

    const { error: upErr } = await supabase.storage
      .from("course-assets")
      .upload(storagePath, new Uint8Array(pngBuf), {
        contentType: "image/png",
        upsert: true,
      });

    if (upErr) {
      return NextResponse.json({ erro: `Upload: ${upErr.message}` }, { status: 500 });
    }

    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/${storagePath}?t=${Date.now()}`;

    // Patcha projecto com thumbnailUrl
    try {
      const updated = {
        ...project,
        thumbnailUrl: url,
        updatedAt: new Date().toISOString(),
      };
      await supabase.storage
        .from("course-assets")
        .upload(`admin/longos/${slug}.json`, JSON.stringify(updated, null, 2), {
          contentType: "application/json",
          upsert: true,
        });
    } catch {
      /* não-crítico — URL já está em Supabase */
    }

    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  } finally {
    if (workDir) rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
