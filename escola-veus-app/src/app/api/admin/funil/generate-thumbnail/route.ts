import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const maxDuration = 60;
export const runtime = "nodejs";

/**
 * POST /api/admin/funil/generate-thumbnail
 *
 * Thumbnail YouTube (1280x720) a partir do VÍDEO FINAL do episódio (MP4
 * renderizado pelo pipeline funil) + texto via ffmpeg drawtext.
 *
 * Cada episódio tem a sua thumbnail porque o frame é extraído do seu
 * próprio vídeo (que tem os clips Runway específicos do ep). Se ainda
 * não houver vídeo renderizado, faz fallback para o intro.mp4 brand
 * (útil para gerar thumbnail antes da montagem).
 *
 * Porquê ffmpeg + drawtext (e não sharp+SVG):
 *   - @ffmpeg-installer em Vercel tem drawtext (libfreetype compilado)
 *   - MAS não tem fontconfig → `font='Serif'` falha
 *   - Solução: `fontfile=<abs-path-to-bundled-ttf>` bypassa fontconfig
 *     e carrega o TTF directamente.
 *
 * Body: { titulo, epKey?, filename?, videoUrl?, frameTimeSec? }
 *   - videoUrl: URL do MP4 final do episódio. Se omitido, usa intro.mp4.
 *   - frameTimeSec: segundo a extrair (default 10 — já dentro do 1º
 *     clip Runway, depois da intro 5s + crossfade).
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

/** Escapa caracteres especiais de drawtext (ffmpeg) */
function escapeDrawtextText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\\\'")
    .replace(/:/g, "\\:")
    .replace(/%/g, "\\%");
}

/** Escapa path para uso em options do filter (colons e backslashes) */
function escapeFilterPath(p: string): string {
  // Em Linux: /var/task/escola-veus-app/assets/fonts/DejaVuSerif.ttf
  // Colons no path precisam de ser escapados para o parser do filter_complex.
  return p.replace(/\\/g, "/").replace(/:/g, "\\:");
}

/** Quebra texto em linhas com limite de caracteres por linha */
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
    const { titulo, epKey, filename, videoUrl, frameTimeSec } =
      (await req.json()) as {
        titulo?: string;
        epKey?: string;
        filename?: string;
        videoUrl?: string;
        frameTimeSec?: number;
      };

    if (!titulo || typeof titulo !== "string") {
      return NextResponse.json({ erro: "titulo obrigatorio." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 500 });
    }

    workDir = await mkdtemp(join(tmpdir(), "funil-thumb-"));
    const ffmpeg = await getFfmpegPath();

    // ── Resolve source video: ep final -> fallback intro.mp4 ─────────────
    // Se videoUrl foi passado (UI sabe qual é o MP4 final do episódio),
    // usa-o. Senão fallback para o intro brand (thumbnail genérica —
    // útil quando a thumbnail é pedida antes da montagem final).
    const sourceUrl =
      videoUrl ||
      `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/brand/intro.mp4`;
    const srcPath = join(workDir, "src.mp4");
    await downloadTo(sourceUrl, srcPath);

    // Frame a extrair. Default 10s:
    //   - Se vídeo tem intro (5s) + crossfade 0.5s, estamos no 1º clip Runway
    //   - Se vídeo não tem intro (só brand intro.mp4), 2.5s é o pico brilho
    const frameT =
      typeof frameTimeSec === "number"
        ? Math.max(0, frameTimeSec)
        : videoUrl
          ? 10
          : 2.5;

    const outPath = join(workDir, "thumb.png");

    // ── Resolve paths das fonts bundled ──────────────────────────────────
    // Bundled em assets/fonts/ → incluídos no deploy Vercel via
    // outputFileTracingIncludes em next.config.ts.
    const cwd = process.cwd();
    const fontRegular = escapeFilterPath(
      join(cwd, "assets", "fonts", "DejaVuSerif.ttf"),
    );
    const fontBold = escapeFilterPath(
      join(cwd, "assets", "fonts", "DejaVuSerif-Bold.ttf"),
    );

    // ── Texto: brand pequeno dourado cima + título grande cream centro ──
    const tituloLines = wrapLines(titulo.toUpperCase(), 22);
    const tituloFontsize =
      tituloLines.length >= 3 ? 72 :
      tituloLines.length === 2 ? 88 :
      104;

    const drawBrand =
      `drawtext=fontfile='${fontRegular}':` +
      `text='${escapeDrawtextText("A ESCOLA DOS VÉUS")}':` +
      `fontsize=44:fontcolor=0xD4A853:` +
      `x=(w-text_w)/2:y=80:` +
      `borderw=0`;

    // Cada linha do título numa drawtext separada (para controlo exacto
    // do y e line-spacing — "\n" em drawtext tem comportamento estranho).
    const titleBlockH = tituloLines.length * tituloFontsize * 1.15;
    const titleY0 = Math.round((720 - titleBlockH) / 2 + tituloFontsize * 0.8);

    const drawTituloLines = tituloLines.map((ln, i) => {
      const y = titleY0 + Math.round(i * tituloFontsize * 1.15);
      return (
        `drawtext=fontfile='${fontBold}':` +
        `text='${escapeDrawtextText(ln)}':` +
        `fontsize=${tituloFontsize}:fontcolor=0xF5F0E6:` +
        `x=(w-text_w)/2:y=${y}:` +
        // Borda preta fina para contraste em fundos médios
        `borderw=3:bordercolor=0x000000`
      );
    });

    // ── Filter chain ──────────────────────────────────────────────────────
    const filterComplex = [
      // 1. Scale+crop para 1280x720 (mandala ocupa frame central)
      `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1280:720,setsar=1`,
      // 2. Vignette + curves escurecedor para contraste com texto
      `curves=darker`,
      // 3. Draw brand cima
      drawBrand,
      // 4. Draw título (linhas)
      ...drawTituloLines,
    ].join(",");

    // ffmpeg -ss <t> -i src.mp4 -frames:v 1 -vf "<filter>" out.png
    await runFfmpeg(ffmpeg, [
      "-y",
      "-ss", String(frameT),
      "-i", srcPath,
      "-frames:v", "1",
      "-vf", filterComplex,
      outPath,
    ]);

    const pngBuf = await readFile(outPath);

    // ── Upload ────────────────────────────────────────────────────────────
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    const base = (filename || epKey || "thumbnail")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const fname = `${base}-${Date.now()}.png`;
    const storagePath = `youtube/thumbnails/${fname}`;

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(storagePath, new Uint8Array(pngBuf), {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      return NextResponse.json({ erro: `Upload: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      url: `${supabaseUrl}/storage/v1/object/public/course-assets/${storagePath}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  } finally {
    if (workDir) rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
