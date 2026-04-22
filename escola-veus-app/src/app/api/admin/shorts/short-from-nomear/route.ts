import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/shorts/short-from-nomear
 *
 * Extrai um Short vertical (9:16, max 30s) a partir de um episódio Nomear:
 *   - corta um snippet do MP3 da narração (start..end)
 *   - cropa uma imagem MJ horizontal do episódio para 9:16 (via sharp)
 *   - sobrepõe texto opcional + título "ESCOLA DOS VÉUS" via SVG (sharp)
 *   - combina via ffmpeg → MP4 vertical 1080x1920
 *
 * Usa @ffmpeg-installer/ffmpeg (mesmo binário que render-ffmpeg local) com
 * filter_complex SEM drawtext (evita problema fontconfig em Vercel — texto
 * vai como PNG overlay gerado por sharp+SVG com fonte embebida).
 *
 * Body: {
 *   epKey: string,                    // ex: "ep01" / "trailer"
 *   startSec: number,                 // ex: 45 (em segundos do MP3 raw)
 *   endSec: number,                   // ex: 70 (max endSec - startSec = 30)
 *   imagePromptId: string,            // ex: "nomear-ep01-04-anel-heranca"
 *   overlayText?: string,             // texto destaque overlay (~3 linhas)
 *   includeBranding?: boolean,        // default true: "ESCOLA DOS VÉUS" cima
 *   audioFadeOut?: number,            // default 0.6
 * }
 *
 * Retorna: { videoUrl, audioUrl, imageUrl, durationSec }
 */

const W = 1080;
const H = 1920;

type Body = {
  epKey?: string;
  startSec?: number;
  endSec?: number;
  imagePromptId?: string;
  overlayText?: string;
  includeBranding?: boolean;
  audioFadeOut?: number;
};

function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let buf: string[] = [];
  for (const w of words) {
    const next = [...buf, w].join(" ");
    if (next.length > maxChars && buf.length) {
      lines.push(buf.join(" "));
      buf = [w];
    } else buf.push(w);
  }
  if (buf.length) lines.push(buf.join(" "));
  return lines;
}

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

// titleToSlug igual ao audio-bulk para encontrar o MP3 correcto
function titleToSlug(title: string): string {
  return (title || "audio")
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
      imagePromptId,
      overlayText,
      includeBranding = true,
      audioFadeOut = 0.6,
    } = body;

    if (!epKey) return NextResponse.json({ erro: "epKey obrigatorio" }, { status: 400 });
    if (typeof startSec !== "number" || typeof endSec !== "number") {
      return NextResponse.json({ erro: "startSec e endSec obrigatorios" }, { status: 400 });
    }
    const dur = endSec - startSec;
    if (dur <= 0 || dur > 60) {
      return NextResponse.json({ erro: "snippet duration deve estar entre 0 e 60s" }, { status: 400 });
    }
    if (!imagePromptId) {
      return NextResponse.json({ erro: "imagePromptId obrigatorio" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // ── Resolve assets em Supabase ───────────────────────────────────────
    // 1. Narration MP3: youtube/<slug-of-titulo>-<ts>.mp3
    //    Para isso precisamos do título do episódio. Carregamos NOMEAR_PRESETS
    //    inline para evitar import circular (api -> data).
    const { NOMEAR_PRESETS } = await import("@/data/nomear-scripts");
    let titulo = "";
    for (const preset of NOMEAR_PRESETS) {
      for (const s of preset.scripts) {
        if (s.id === `nomear-${epKey}` || s.id === `nomear-${epKey}-00`) {
          titulo = s.titulo;
        }
      }
    }
    if (!titulo) {
      return NextResponse.json({ erro: `epKey '${epKey}' nao encontrado em NOMEAR_PRESETS` }, { status: 400 });
    }
    const slug = titleToSlug(titulo);

    // List youtube/ → encontra primeiro MP3 com prefix slug
    const { data: audiosList, error: audErr } = await supabase.storage
      .from("course-assets")
      .list("youtube", { limit: 1000 });
    if (audErr) throw new Error(`List youtube: ${audErr.message}`);
    const audioFile = (audiosList ?? [])
      .filter((f) => f.name?.endsWith(".mp3") && f.name.startsWith(`${slug}-`))
      .sort((a, b) => b.name.localeCompare(a.name))[0];
    if (!audioFile) {
      return NextResponse.json(
        { erro: `Nenhum audio encontrado para ${epKey} (slug=${slug}) em youtube/` },
        { status: 404 },
      );
    }
    const audioUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/${audioFile.name}`;

    // 2. Imagem MJ: youtube/images/<imagePromptId>/horizontal/*.png (mais recente)
    const { data: imgList, error: imgErr } = await supabase.storage
      .from("course-assets")
      .list(`youtube/images/${imagePromptId}/horizontal`, { limit: 100 });
    if (imgErr) throw new Error(`List images: ${imgErr.message}`);
    const imgFile = (imgList ?? [])
      .filter((f) => /\.(png|jpe?g)$/i.test(f.name ?? ""))
      .sort((a, b) => b.name.localeCompare(a.name))[0];
    if (!imgFile) {
      return NextResponse.json(
        { erro: `Nenhuma imagem horizontal para promptId '${imagePromptId}'` },
        { status: 404 },
      );
    }
    const imgUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/images/${imagePromptId}/horizontal/${imgFile.name}`;

    // ── Workdir + downloads ──────────────────────────────────────────────
    workDir = await mkdtemp(join(tmpdir(), "short-nomear-"));
    const audioRawPath = join(workDir, "audio-raw.mp3");
    const imgRawPath = join(workDir, "img-raw.png");
    await Promise.all([dl(audioUrl, audioRawPath), dl(imgUrl, imgRawPath)]);

    // ── Sharp: crop imagem 9:16 + overlay text via SVG ───────────────────
    const { default: sharp } = await import("sharp");
    const cwd = process.cwd();
    const [fontRegBuf, fontBoldBuf] = await Promise.all([
      readFile(join(cwd, "assets", "fonts", "DejaVuSerif.ttf")),
      readFile(join(cwd, "assets", "fonts", "DejaVuSerif-Bold.ttf")),
    ]);
    const fR = fontRegBuf.toString("base64");
    const fB = fontBoldBuf.toString("base64");

    // Crop centro 9:16 (1080x1920) com cover (zoom-in se preciso)
    const imgVertical = await sharp(imgRawPath)
      .resize(W, H, { fit: "cover", position: "center" })
      .toBuffer();

    // SVG overlay: branding cima + texto destaque centro-baixo (se existir)
    const overlayLines = overlayText ? wrap(overlayText, 22) : [];
    const overlayFs =
      overlayLines.length >= 4 ? 64 :
      overlayLines.length === 3 ? 78 :
      overlayLines.length === 2 ? 92 : 110;
    const overlayLh = overlayFs * 1.2;
    const overlayBlockH = overlayLh * overlayLines.length;
    const overlayY0 = H - 280 - overlayBlockH + overlayFs;

    const overlayTextSvg = overlayLines
      .map((ln, i) => {
        const y = overlayY0 + i * overlayLh;
        return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="DejaVuSerif" font-weight="700" font-size="${overlayFs}" fill="#F5F0E6" stroke="#000000" stroke-width="3" paint-order="stroke">${xmlEscape(ln)}</text>`;
      })
      .join("\n  ");

    const brandingSvg = includeBranding
      ? `<text x="${W / 2}" y="180" text-anchor="middle" font-family="DejaVuSerif" font-weight="400" font-size="40" letter-spacing="6" fill="#D4A853">A ESCOLA DOS VÉUS</text>`
      : "";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style type="text/css">
      @font-face { font-family: "DejaVuSerif"; font-weight: 400; src: url(data:font/ttf;base64,${fR}) format("truetype"); }
      @font-face { font-family: "DejaVuSerif"; font-weight: 700; src: url(data:font/ttf;base64,${fB}) format("truetype"); }
    </style>
    <linearGradient id="d" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.65"/>
      <stop offset="20%" stop-color="#000000" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="#000000" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.75"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#d)"/>
  ${brandingSvg}
  ${overlayTextSvg}
</svg>`;

    const composedImgPath = join(workDir, "img-composed.png");
    const composed = await sharp(imgVertical)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(composedImgPath, composed);

    // ── ffmpeg: combine imagem estática + áudio cortado → MP4 9:16 ──────
    const ffmpeg = await getFfmpegPath();
    const outPath = join(workDir, "out.mp4");

    // -loop 1 -i img.png -ss start -to end -i audio.mp3
    // -shortest garante que o vídeo dura o que o áudio durar.
    // Audio fade-out 0.6s no fim para não ficar corte brusco.
    const fadeOutStart = Math.max(0, dur - audioFadeOut);
    await runFfmpeg(ffmpeg, [
      "-y",
      "-loop", "1",
      "-i", composedImgPath,
      "-ss", String(startSec),
      "-to", String(endSec),
      "-i", audioRawPath,
      "-filter_complex",
      `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=30[v];` +
      `[1:a]afade=t=out:st=${fadeOutStart.toFixed(2)}:d=${audioFadeOut}[a]`,
      "-map", "[v]",
      "-map", "[a]",
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "20",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "192k",
      "-t", dur.toFixed(2),
      "-movflags", "+faststart",
      outPath,
    ]);

    // ── Upload ──────────────────────────────────────────────────────────
    const ts = Date.now();
    const audioName = `${epKey}-${ts}.mp3`;
    const imageName = `${epKey}-${ts}.png`;
    const videoName = `${epKey}-${ts}.mp4`;

    // Audio snippet também (para quem queira reutilizar/repostar com nova imagem)
    const audioSnippetPath = join(workDir, "snippet.mp3");
    await runFfmpeg(ffmpeg, [
      "-y",
      "-ss", String(startSec),
      "-to", String(endSec),
      "-i", audioRawPath,
      "-c:a", "libmp3lame",
      "-b:a", "192k",
      audioSnippetPath,
    ]);

    const [audioBuf, imageBuf, videoBuf] = await Promise.all([
      readFile(audioSnippetPath),
      readFile(composedImgPath),
      readFile(outPath),
    ]);

    const uploads = [
      { path: `shorts/audio/${audioName}`, body: audioBuf, type: "audio/mpeg" },
      { path: `shorts/images/${imageName}`, body: imageBuf, type: "image/png" },
      { path: `shorts/videos/${videoName}`, body: videoBuf, type: "video/mp4" },
    ];

    for (const u of uploads) {
      const { error } = await supabase.storage
        .from("course-assets")
        .upload(u.path, new Uint8Array(u.body), {
          contentType: u.type,
          upsert: true,
        });
      if (error) throw new Error(`Upload ${u.path}: ${error.message}`);
    }

    return NextResponse.json({
      videoUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/shorts/videos/${videoName}`,
      audioUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/shorts/audio/${audioName}`,
      imageUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/shorts/images/${imageName}`,
      durationSec: dur,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  } finally {
    if (workDir) rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
