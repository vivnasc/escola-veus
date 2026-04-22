import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const maxDuration = 60;
export const runtime = "nodejs";

/**
 * POST /api/admin/funil/generate-thumbnail
 *
 * Gera thumbnail YouTube (1280x720) a partir da mandala brand + título do
 * episódio. Usa sharp + SVG com a fonte DejaVu Serif EMBEBIDA como data URI
 * — funciona em Vercel serverless sem depender de fontconfig/ffmpeg/fonts
 * do sistema (problemas conhecidos em AWS Lambda).
 *
 * Body: { titulo, epKey?, filename? }
 *   titulo: texto principal (ex: "A culpa que chega antes da compra")
 *   epKey: sufixo para nome do ficheiro (ex: "ep01")
 *   filename: nome base opcional
 *
 * Pipeline:
 *  1. Lê public/hero-mandala.png + assets/fonts/DejaVuSerif(-Bold).ttf
 *  2. Constrói SVG 1280x720 com texto cream sobre gradient escurecedor
 *  3. Composite via sharp (mandala redimensionada + SVG overlay)
 *  4. Output PNG, upload Supabase youtube/thumbnails/
 */

const WIDTH = 1280;
const HEIGHT = 720;

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

/** Escapa entidades XML no texto para ir dentro de <text>...</text> */
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(req: NextRequest) {
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

    // ── Assets (mandala + fontes embebidas) ───────────────────────────────
    // process.cwd() aponta para escola-veus-app/ em dev e em Vercel build.
    const cwd = process.cwd();
    const [mandalaBuf, fontRegularBuf, fontBoldBuf] = await Promise.all([
      readFile(join(cwd, "public", "hero-mandala.png")),
      readFile(join(cwd, "assets", "fonts", "DejaVuSerif.ttf")),
      readFile(join(cwd, "assets", "fonts", "DejaVuSerif-Bold.ttf")),
    ]);

    const fontRegularB64 = fontRegularBuf.toString("base64");
    const fontBoldB64 = fontBoldBuf.toString("base64");

    // ── Texto: brand pequeno + título quebrado em linhas ─────────────────
    const tituloLines = wrapLines(titulo.toUpperCase(), 26);
    const tituloFontsize =
      tituloLines.length >= 3 ? 68 : tituloLines.length === 2 ? 84 : 100;
    const lineHeight = tituloFontsize * 1.15;
    const totalTextH = lineHeight * tituloLines.length;
    const centerY = HEIGHT / 2 + 50; // ligeiramente abaixo do centro
    const firstLineY = centerY - totalTextH / 2 + tituloFontsize;

    // ── SVG overlay: gradient de escurecimento + brand + título ──────────
    // Fontes embebidas via data URI evitam fontconfig.
    const tituloTspans = tituloLines
      .map((ln, i) => {
        const y = firstLineY + i * lineHeight;
        return `<text x="${WIDTH / 2}" y="${y}" text-anchor="middle" font-family="DejaVuSerif" font-weight="700" font-size="${tituloFontsize}" fill="#F5F0E6" stroke="#000000" stroke-width="2" paint-order="stroke">${xmlEscape(ln)}</text>`;
      })
      .join("\n    ");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <style type="text/css">
      @font-face {
        font-family: "DejaVuSerif";
        font-weight: 400;
        src: url(data:font/ttf;base64,${fontRegularB64}) format("truetype");
      }
      @font-face {
        font-family: "DejaVuSerif";
        font-weight: 700;
        src: url(data:font/ttf;base64,${fontBoldB64}) format("truetype");
      }
    </style>
    <linearGradient id="darken" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.55"/>
      <stop offset="35%" stop-color="#000000" stop-opacity="0.25"/>
      <stop offset="65%" stop-color="#000000" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.70"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#darken)"/>
  <text x="${WIDTH / 2}" y="110" text-anchor="middle" font-family="DejaVuSerif" font-weight="400" font-size="38" letter-spacing="4" fill="#D4A853">A ESCOLA DOS VÉUS</text>
  ${tituloTspans}
</svg>`;

    // ── Sharp: mandala → 1280x720 (cover) + overlay SVG ───────────────────
    const { default: sharp } = await import("sharp");
    const mandalaResized = await sharp(mandalaBuf)
      .resize(WIDTH, HEIGHT, { fit: "cover", position: "center" })
      .toBuffer();

    const pngBuf = await sharp(mandalaResized)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .png({ compressionLevel: 9 })
      .toBuffer();

    // ── Upload Supabase ───────────────────────────────────────────────────
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
  }
}
