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
 * Gera thumbnail YouTube (1280x720) a partir da mandala brand + título + CTA.
 *
 * Body: { titulo, epKey?, filename? }
 *   titulo: texto principal (ex: "A culpa que chega antes da compra")
 *   epKey: sufixo para nome do ficheiro (ex: "ep01")
 *   filename: nome base opcional
 *
 * Pipeline:
 *  1. Download intro.mp4 do Supabase (brand mandala)
 *  2. Extrai frame ao segundo 2.5 (mandala no pico de brilho)
 *  3. FFmpeg drawtext sobrepõe: "A ESCOLA DOS VÉUS" (pequeno, topo) +
 *     título do episódio (grande, centro-baixo) + padding/gradient
 *  4. Output PNG 1280x720, upload Supabase youtube/thumbnails/
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
      code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}: ${err.slice(-400)}`)),
    );
  });
}

async function downloadTo(url: string, dest: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  await writeFile(dest, new Uint8Array(await r.arrayBuffer()));
}

/** Escapa caracteres especiais para drawtext (FFmpeg) */
function escapeDrawtext(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\\\'")
    .replace(/:/g, "\\:")
    .replace(/%/g, "\\%");
}

/** Quebra texto em linhas com limite de caracteres por linha (para título longo) */
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
    const { titulo, epKey, filename } = (await req.json()) as {
      titulo?: string;
      epKey?: string;
      filename?: string;
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

    const introUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/brand/intro.mp4`;
    const introPath = join(workDir, "intro.mp4");
    await downloadTo(introUrl, introPath);

    const outPath = join(workDir, "thumb.png");

    // Texto: "A ESCOLA DOS VÉUS" pequeno no topo + título grande ao centro
    const tituloLines = wrapLines(titulo.toUpperCase(), 22);
    const tituloEsc = tituloLines.map(escapeDrawtext).join("\n");

    const drawBrand =
      `drawtext=font='Serif':text='A ESCOLA DOS VÉUS':` +
      `fontsize=42:fontcolor=0xD4A853:` +
      `x=(w-text_w)/2:y=80`;

    const tituloFontsize = tituloLines.length >= 3 ? 76 : tituloLines.length === 2 ? 92 : 108;
    const drawTitulo =
      `drawtext=font='Serif':text='${escapeDrawtext(tituloEsc)}':` +
      `fontsize=${tituloFontsize}:fontcolor=0xF5F0E6:` +
      `x=(w-text_w)/2:y=(h-text_h)/2+50:` +
      `line_spacing=12`;

    const filterComplex = [
      // Escala crop central 1280x720 da primeira frame do intro
      `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1280:720,setsar=1`,
      // Vignette subtil + escurecer um pouco para contraste com texto
      `curves=darker`,
      // Desenha texto
      drawBrand,
      drawTitulo,
    ].join(",");

    await runFfmpeg(ffmpeg, [
      "-y",
      "-ss", "2.5",
      "-i", introPath,
      "-frames:v", "1",
      "-vf", filterComplex,
      outPath,
    ]);

    const pngBuf = await readFile(outPath);

    // Upload
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const base = (filename || epKey || "thumbnail").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const fname = `${base}-${Date.now()}.png`;
    const storagePath = `youtube/thumbnails/${fname}`;

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(storagePath, new Uint8Array(pngBuf), { contentType: "image/png", upsert: true });

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
