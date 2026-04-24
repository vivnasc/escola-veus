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
 * Gera um Short vertical (9:16, 1080x1920, 15-45s) a partir de:
 *   - 1+ clips Runway do episódio (horizontais, crop central 9:16 + xfade)
 *     OU 1 imagem MJ horizontal cropada (modo legado, fallback)
 *   - snippet do MP3 da narração (start..end)
 *   - texto overlay opcional + branding "ESCOLA DOS VÉUS" via sharp+SVG
 *   - áudio com fade-out no fim
 *
 * Usa @ffmpeg-installer/ffmpeg. Texto vai como PNG overlay (evita drawtext
 * que depende de fontconfig em Vercel).
 *
 * Body: {
 *   epKey: string,                // ex: "ep01" / "trailer"
 *   startSec: number,             // snippet audio start
 *   endSec: number,               // snippet audio end
 *   clipUrls?: string[],          // NOVO: usa clips Runway do ep (horizontais)
 *   imagePromptId?: string,       // LEGADO: usa imagem estática (se clipUrls vazio)
 *   overlayText?: string,         // texto destaque
 *   includeBranding?: boolean,    // default true
 *   audioFadeOut?: number,        // default 0.6
 *   crossfade?: number,           // default 0.5 (entre clips)
 * }
 *
 * Retorna: { videoUrl, audioUrl, imageUrl?, durationSec }
 */

const W = 1080;
const H = 1920;

type Body = {
  epKey?: string;
  startSec?: number;
  endSec?: number;
  clipUrls?: string[];
  imagePromptId?: string;
  overlayText?: string;
  includeBranding?: boolean;
  audioFadeOut?: number;
  crossfade?: number;
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
      clipUrls,
      imagePromptId,
      overlayText,
      includeBranding = true,
      audioFadeOut = 0.6,
      crossfade = 0.5,
    } = body;

    if (!epKey) return NextResponse.json({ erro: "epKey obrigatorio" }, { status: 400 });
    if (typeof startSec !== "number" || typeof endSec !== "number") {
      return NextResponse.json({ erro: "startSec e endSec obrigatorios" }, { status: 400 });
    }
    const dur = endSec - startSec;
    if (dur <= 0 || dur > 60) {
      return NextResponse.json({ erro: "snippet duration deve estar entre 0 e 60s" }, { status: 400 });
    }

    const useClips = Array.isArray(clipUrls) && clipUrls.length > 0;
    if (!useClips && !imagePromptId) {
      return NextResponse.json(
        { erro: "clipUrls[] OU imagePromptId obrigatorio" },
        { status: 400 },
      );
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

    // ── Resolve narration audio ──────────────────────────────────────────
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
      return NextResponse.json(
        { erro: `epKey '${epKey}' nao encontrado em NOMEAR_PRESETS` },
        { status: 400 },
      );
    }
    const slug = titleToSlug(titulo);

    const { data: audiosList, error: audErr } = await supabase.storage
      .from("course-assets")
      .list("youtube", { limit: 1000 });
    if (audErr) throw new Error(`List youtube: ${audErr.message}`);
    const audioFile = (audiosList ?? [])
      .filter((f) => f.name?.endsWith(".mp3") && f.name.startsWith(`${slug}-`))
      .sort((a, b) => b.name.localeCompare(a.name))[0];
    if (!audioFile) {
      return NextResponse.json(
        { erro: `Nenhum audio para ${epKey} (slug=${slug}) em youtube/` },
        { status: 404 },
      );
    }
    const audioUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/${audioFile.name}`;

    workDir = await mkdtemp(join(tmpdir(), "short-nomear-"));
    const audioRawPath = join(workDir, "audio-raw.mp3");
    await dl(audioUrl, audioRawPath);

    // ── Load bundled fonts (para text overlay via SVG) ───────────────────
    const cwd = process.cwd();
    const [fontRegBuf, fontBoldBuf] = await Promise.all([
      readFile(join(cwd, "assets", "fonts", "DejaVuSerif.ttf")),
      readFile(join(cwd, "assets", "fonts", "DejaVuSerif-Bold.ttf")),
    ]);
    const fR = fontRegBuf.toString("base64");
    const fB = fontBoldBuf.toString("base64");

    // ── Build text overlay PNG (1080x1920 transparente, só texto) ────────
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

    const hasOverlay = overlayLines.length > 0 || includeBranding;
    const overlayPath = join(workDir, "overlay.png");

    if (hasOverlay) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style type="text/css">
      @font-face { font-family: "DejaVuSerif"; font-weight: 400; src: url(data:font/ttf;base64,${fR}) format("truetype"); }
      @font-face { font-family: "DejaVuSerif"; font-weight: 700; src: url(data:font/ttf;base64,${fB}) format("truetype"); }
    </style>
    <linearGradient id="d" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.55"/>
      <stop offset="20%" stop-color="#000000" stop-opacity="0.05"/>
      <stop offset="65%" stop-color="#000000" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.70"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#d)"/>
  ${brandingSvg}
  ${overlayTextSvg}
</svg>`;
      const { default: sharp } = await import("sharp");
      const png = await sharp(Buffer.from(svg)).png().toBuffer();
      await writeFile(overlayPath, png);
    }

    const ffmpeg = await getFfmpegPath();
    const outPath = join(workDir, "out.mp4");
    const audioFadeStart = Math.max(0, dur - audioFadeOut);

    if (useClips) {
      // ── MODO CLIPS: concat de N clips Runway (horizontais 1280x720) ────
      // Cada clip é cropado ao centro para 9:16 (1080x1920) e trim para
      // caber no snippet. xfade 0.5s entre clips mantém suavidade.
      const n = clipUrls!.length;
      const stride = Math.max(2, (dur + (n - 1) * crossfade) / n);
      // Cap clipDur a 10 (runway max). Se o snippet for curto, stride < 10.
      const clipDur = Math.min(10, stride);

      const clipPaths = clipUrls!.map((_, i) => join(workDir!, `clip-${i}.mp4`));
      await Promise.all(clipUrls!.map((u, i) => dl(u, clipPaths[i])));

      // Normaliza cada clip: scale+crop 1080x1920 + trim
      const scaleFilters = clipPaths.map(
        (_, i) =>
          `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=30,trim=0:${clipDur.toFixed(2)},setpts=PTS-STARTPTS[v${i}]`,
      );

      // xfade chain
      const xfadeFilters: string[] = [];
      let prev = "v0";
      if (n === 1) {
        xfadeFilters.push(`[v0]copy[vconcat]`);
      } else {
        for (let i = 1; i < n; i++) {
          const out = i === n - 1 ? "vconcat" : `vx${i}`;
          const offset = i * (clipDur - crossfade);
          xfadeFilters.push(
            `[${prev}][v${i}]xfade=transition=fade:duration=${crossfade}:offset=${offset.toFixed(2)}[${out}]`,
          );
          prev = out;
        }
      }

      // Overlay (opcional): input = n clips + 1 audio + 1 overlay PNG
      const overlayIdx = n + 1;
      const ovlFilters: string[] = [];
      if (hasOverlay) {
        ovlFilters.push(`[vconcat][${overlayIdx}:v]overlay=0:0[vout]`);
      } else {
        ovlFilters.push(`[vconcat]copy[vout]`);
      }

      const audioIdx = n;
      const audioFilter = `[${audioIdx}:a]afade=t=out:st=${audioFadeStart.toFixed(2)}:d=${audioFadeOut}[aout]`;

      const filterComplex = [
        ...scaleFilters,
        ...xfadeFilters,
        ...ovlFilters,
        audioFilter,
      ].join(";");

      await runFfmpeg(ffmpeg, [
        "-y",
        ...clipPaths.flatMap((p) => ["-i", p]),
        "-ss", String(startSec),
        "-to", String(endSec),
        "-i", audioRawPath,
        ...(hasOverlay ? ["-i", overlayPath] : []),
        "-filter_complex", filterComplex,
        "-map", "[vout]",
        "-map", "[aout]",
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
    } else {
      // ── MODO IMAGEM ESTÁTICA (legado) ──────────────────────────────────
      const { data: imgList, error: imgErr } = await supabase.storage
        .from("course-assets")
        .list(`youtube/images/${imagePromptId}/horizontal`, { limit: 100 });
      if (imgErr) throw new Error(`List images: ${imgErr.message}`);
      const imgFile = (imgList ?? [])
        .filter((f) => /\.(png|jpe?g)$/i.test(f.name ?? ""))
        .sort((a, b) => b.name.localeCompare(a.name))[0];
      if (!imgFile) {
        return NextResponse.json(
          { erro: `Nenhuma imagem horizontal para '${imagePromptId}'` },
          { status: 404 },
        );
      }
      const imgUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/images/${imagePromptId}/horizontal/${imgFile.name}`;
      const imgRawPath = join(workDir!, "img-raw.png");
      await dl(imgUrl, imgRawPath);

      const { default: sharp } = await import("sharp");
      const imgVertical = await sharp(imgRawPath)
        .resize(W, H, { fit: "cover", position: "center" })
        .toBuffer();
      const composedImgPath = join(workDir!, "img-composed.png");
      if (hasOverlay) {
        const composed = await sharp(imgVertical)
          .composite([{ input: overlayPath }])
          .png({ compressionLevel: 9 })
          .toBuffer();
        await writeFile(composedImgPath, composed);
      } else {
        await writeFile(composedImgPath, imgVertical);
      }

      await runFfmpeg(ffmpeg, [
        "-y",
        "-loop", "1",
        "-i", composedImgPath,
        "-ss", String(startSec),
        "-to", String(endSec),
        "-i", audioRawPath,
        "-filter_complex",
        `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=30[v];` +
        `[1:a]afade=t=out:st=${audioFadeStart.toFixed(2)}:d=${audioFadeOut}[a]`,
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
    }

    // ── Upload ──────────────────────────────────────────────────────────
    const ts = Date.now();
    const audioName = `${epKey}-${ts}.mp3`;
    const videoName = `${epKey}-${ts}.mp4`;

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

    const [audioBuf, videoBuf] = await Promise.all([
      readFile(audioSnippetPath),
      readFile(outPath),
    ]);

    const uploads = [
      { path: `shorts/audio/${audioName}`, body: audioBuf, type: "audio/mpeg" },
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
      durationSec: dur,
      mode: useClips ? "clips" : "image",
      clipCount: useClips ? clipUrls!.length : 0,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  } finally {
    if (workDir) rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
