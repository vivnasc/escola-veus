import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  GLIFO_POR_DIA,
  KICKER_POR_DIA,
  DIA_LONGO_PT,
  type DiaSemana,
} from "@/lib/hoje-em-mim/captions";

export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/hoje-em-mim/render
 *
 * Render server-side de um MP4 1080x1920 do post "Hoje, em Mim":
 *   motion MP4 (loop até 15s) + overlay SVG queimado (arco de cobre,
 *   janela de lua, frase, dia, glifo, kicker, seteveus.space) +
 *   áudio SFX noturno opcional.
 *
 * Usa @ffmpeg-installer/ffmpeg (mesmo padrão dos shorts) + sharp para
 * converter o SVG do overlay em PNG transparente. Resultado vai para
 * Supabase em course-assets/hoje-em-mim-renders/{dia}/{stamp}.mp4 e
 * fica disponível para WhatsApp Status, IG Reel, TikTok e YouTube Shorts.
 *
 * Body: {
 *   dia: DiaSemana,
 *   fraseId: string,           // só para nomear o ficheiro
 *   fraseTexto: string,        // texto que vai no overlay
 *   motionUrl: string,         // MP4 do clip noturno (público)
 *   audioUrl?: string,         // MP3 SFX (opcional)
 *   durationSec?: number,      // default 15
 * }
 * Returns: { videoUrl, durationSec, sizeBytes }
 */

const W = 1080;
const H = 1920;
const DEFAULT_DURATION = 15;

const COBRE = "#C28F60";
const COBRE_FRACO = "rgba(194, 143, 96, 0.55)";
const CREME = "#F2E9D8";

type Body = {
  dia?: DiaSemana;
  fraseId?: string;
  fraseTexto?: string;
  motionUrl?: string;
  audioUrl?: string;
  durationSec?: number;
};

function xmlEscape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Wrap por largura visual aproximada (em chars), procurando espaços. */
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
  if (!p) throw new Error("ffmpeg binary não encontrado");
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
        : reject(new Error(`ffmpeg ${code}: ${err.slice(-800)}`)),
    );
  });
}

async function dl(url: string, dest: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  await writeFile(dest, new Uint8Array(await r.arrayBuffer()));
}

/**
 * Constrói o SVG do overlay "Janela de Lua" em 1080x1920 com fundo
 * transparente. Tudo fica em cobre/creme sobre nada. O ffmpeg põe isto
 * em cima do motion video.
 */
function buildOverlaySvg(opts: {
  fraseTexto: string;
  dia: DiaSemana;
  fontItalicB64: string;
  fontSansB64: string;
}): string {
  const { fraseTexto, dia, fontItalicB64, fontSansB64 } = opts;

  const kicker = KICKER_POR_DIA[dia];
  const glifo = GLIFO_POR_DIA[dia];
  const diaLongo = DIA_LONGO_PT[dia];

  // Arco de janela de lua. No preview viewBox era 280x380, top:8.
  // Aqui scale x2.667. Centro horizontal da frame = 540.
  // Arc largura 747, height 1013, top 85, left 166.5.
  // Path original: M20 380 L20 140 A120 120 0 0 1 260 140 L260 380
  // Convertido para coords absolutas em 1080x1920:
  //   M 220 1098 L 220 459 A 320 320 0 0 1 860 459 L 860 1098
  // Pontinho da lua: cx 140 cy 140 → cx 540, cy 459. r 3 → r 8.
  const arcPath = "M 220 1098 L 220 459 A 320 320 0 0 1 860 459 L 860 1098";

  // Dia (top: 190 no preview de 720h → 190*2.667 ≈ 507 em 1920h)
  const diaY = 507;
  const diaFontSize = 29;
  const diaLetterSpacing = 12;

  // Frase central. Vertical centre ≈ 1014.
  // Frase font-size 24 em 720h → ~64 em 1920h.
  // Quebra a ~22 chars por linha (frase média 100-180 chars → 4-9 linhas).
  const fraseLines = wrap(fraseTexto, 22);
  const fraseFontSize =
    fraseLines.length >= 6 ? 52 :
    fraseLines.length === 5 ? 56 :
    fraseLines.length === 4 ? 60 :
    fraseLines.length === 3 ? 64 :
    fraseLines.length === 2 ? 70 : 76;
  const fraseLineH = fraseFontSize * 1.42;
  const fraseBlockH = fraseLineH * fraseLines.length;
  const fraseY0 = Math.round(1014 - fraseBlockH / 2 + fraseFontSize * 0.85);

  const fraseSvg = fraseLines
    .map((ln, i) => {
      const y = fraseY0 + i * fraseLineH;
      return `<text x="540" y="${y}" text-anchor="middle" font-family="cormgar" font-style="italic" font-weight="400" font-size="${fraseFontSize}" fill="${CREME}" filter="url(#textShadow)">${xmlEscape(ln)}</text>`;
    })
    .join("\n  ");

  // Footer assinatura. Bottom ~1735 (1920-185), glifo + kicker line ~1768.
  // seteveus.space mais abaixo ~1820.
  const sigGlifoY = 1770;
  const seteveusY = 1822;
  const kickerFontSize = 36;
  const glifoFontSize = 48;
  const seteveusFontSize = 24;
  const seteveusLetterSpacing = 8;

  // Cantoneira topo esquerdo
  const cantoneiraStroke = COBRE_FRACO;
  const cantoneiraSw = 3;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style type="text/css">
      @font-face { font-family: "cormgar"; font-weight: 400; font-style: italic; src: url(data:font/ttf;base64,${fontItalicB64}) format("truetype"); }
      @font-face { font-family: "cormgar"; font-weight: 400; font-style: normal; src: url(data:font/ttf;base64,${fontSansB64}) format("truetype"); }
    </style>
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000" flood-opacity="0.65"/>
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000" flood-opacity="0.85"/>
    </filter>
    <filter id="smallShadow">
      <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#000" flood-opacity="0.7"/>
    </filter>
  </defs>

  <!-- Cantoneira de cobre topo esquerdo -->
  <line x1="60" y1="60" x2="124" y2="60" stroke="${cantoneiraStroke}" stroke-width="${cantoneiraSw}"/>
  <line x1="60" y1="60" x2="60" y2="124" stroke="${cantoneiraStroke}" stroke-width="${cantoneiraSw}"/>

  <!-- Arco janela de lua -->
  <path d="${arcPath}" stroke="${COBRE_FRACO}" stroke-width="3" fill="none"/>
  <circle cx="540" cy="459" r="8" fill="${COBRE}" opacity="0.7"/>

  <!-- Dia da semana, horizontal, dentro do arco -->
  <text x="540" y="${diaY}" text-anchor="middle" font-family="cormgar" font-weight="400" font-size="${diaFontSize}" letter-spacing="${diaLetterSpacing}" fill="${COBRE}" filter="url(#smallShadow)">${xmlEscape(diaLongo)}</text>

  <!-- Frase central -->
  ${fraseSvg}

  <!-- Assinatura: glifo + kicker -->
  <text x="540" y="${sigGlifoY}" text-anchor="middle" font-family="cormgar" font-style="italic" font-weight="400" font-size="${kickerFontSize}" fill="${COBRE}" filter="url(#smallShadow)"><tspan font-size="${glifoFontSize}" font-style="normal">${xmlEscape(glifo)}</tspan>  ${xmlEscape(kicker)}</text>

  <!-- seteveus.space -->
  <text x="540" y="${seteveusY}" text-anchor="middle" font-family="cormgar" font-weight="400" font-size="${seteveusFontSize}" letter-spacing="${seteveusLetterSpacing}" fill="${COBRE_FRACO}" filter="url(#smallShadow)">SETEVEUS.SPACE</text>
</svg>`;
}

export async function POST(req: NextRequest) {
  let workDir: string | null = null;
  try {
    const body: Body = await req.json();
    const {
      dia,
      fraseId,
      fraseTexto,
      motionUrl,
      audioUrl,
      durationSec = DEFAULT_DURATION,
    } = body;

    if (!dia || !/^(mon|tue|wed|thu|fri|sat|sun)$/.test(dia)) {
      return NextResponse.json({ erro: "dia inválido" }, { status: 400 });
    }
    if (!fraseId) {
      return NextResponse.json({ erro: "fraseId obrigatório" }, { status: 400 });
    }
    if (!fraseTexto || fraseTexto.trim().length < 5) {
      return NextResponse.json({ erro: "fraseTexto obrigatório" }, { status: 400 });
    }
    if (!motionUrl) {
      return NextResponse.json({ erro: "motionUrl obrigatório" }, { status: 400 });
    }
    if (durationSec < 5 || durationSec > 60) {
      return NextResponse.json(
        { erro: "durationSec entre 5 e 60" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    workDir = await mkdtemp(join(tmpdir(), "hem-render-"));
    const motionPath = join(workDir, "motion.mp4");
    const overlayPath = join(workDir, "overlay.png");
    const audioPath = audioUrl ? join(workDir, "audio.mp3") : null;
    const outPath = join(workDir, "out.mp4");

    // Resolve motionUrl quando vem como /assets/...
    const motionAbs = motionUrl.startsWith("http")
      ? motionUrl
      : motionUrl.startsWith("/")
        ? new URL(motionUrl, req.nextUrl.origin).toString()
        : motionUrl;

    await dl(motionAbs, motionPath);
    if (audioUrl && audioPath) await dl(audioUrl, audioPath);

    // Carregar fonts bundled
    const cwd = process.cwd();
    const [fontItalicBuf, fontRegBuf] = await Promise.all([
      readFile(join(cwd, "assets", "fonts", "cormorant", "CormorantGaramond-Italic.ttf")),
      readFile(join(cwd, "assets", "fonts", "cormorant", "CormorantGaramond-Regular.ttf")),
    ]);
    const fontItalicB64 = fontItalicBuf.toString("base64");
    const fontSansB64 = fontRegBuf.toString("base64");

    // Gerar overlay PNG via sharp
    const svg = buildOverlaySvg({
      fraseTexto,
      dia: dia as DiaSemana,
      fontItalicB64,
      fontSansB64,
    });
    const { default: sharp } = await import("sharp");
    const overlayPng = await sharp(Buffer.from(svg)).png().toBuffer();
    await writeFile(overlayPath, overlayPng);

    // Render ffmpeg
    const ffmpeg = await getFfmpegPath();

    // Filter: scale+crop motion para 1080x1920, overlay PNG por cima.
    // -stream_loop -1 antes do input motion garante que loops a infinito;
    // -t corta na duração pedida.
    const filter = [
      `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=30,eq=brightness=0.0:saturation=0.95[v0]`,
      `[v0][1:v]overlay=0:0[v]`,
    ].join(";");

    const args: string[] = [
      "-y",
      "-stream_loop", "-1",
      "-i", motionPath,
      "-i", overlayPath,
    ];
    if (audioPath) {
      args.push("-stream_loop", "-1", "-i", audioPath);
    }
    args.push(
      "-filter_complex", filter,
      "-map", "[v]",
    );
    if (audioPath) {
      args.push(
        "-map", "2:a",
        "-c:a", "aac",
        "-b:a", "128k",
      );
    } else {
      args.push("-an");
    }
    args.push(
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "22",
      "-pix_fmt", "yuv420p",
      "-t", String(durationSec),
      "-movflags", "+faststart",
      outPath,
    );

    await runFfmpeg(ffmpeg, args);

    const buf = await readFile(outPath);

    // Upload
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
    const fraseTag = fraseId.replace(/[^a-z0-9-]+/gi, "");
    const filePath = `hoje-em-mim-renders/${dia}/${stamp}-${fraseTag}.mp4`;
    const { error: upErr } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(buf), {
        contentType: "video/mp4",
        upsert: false,
      });
    if (upErr) throw new Error(`Upload: ${upErr.message}`);

    const videoUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;

    return NextResponse.json({
      videoUrl,
      durationSec,
      sizeBytes: buf.byteLength,
      dia,
      fraseId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  } finally {
    if (workDir) rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
