// render.mjs — Renderer ffmpeg para a pack mensal de "Hoje, em Mim".
//
// Disparado por .github/workflows/render-hoje-em-mim.yml. Lê o manifest
// em Supabase course-assets/render-jobs/<JOB_ID>.json, e para cada item
// (1 por dia) gera um MP4 1080x1920 com:
//   - motion (loop até durationSec)
//   - overlay SVG "Janela de Lua" queimado (arco de cobre, dia, frase
//     em Cormorant Garamond Itálico, glifo, kicker, seteveus.space)
//   - áudio opcional, em loop
//
// Cada MP4 vai para course-assets/hoje-em-mim-renders/<dia>/<filename>.mp4.
// Vai actualizando course-assets/render-jobs/<JOB_ID>-result.json após
// cada item (progress incremental) para a UI poder fazer polling.
//
// Env: JOB_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { spawn } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const FONTS_DIR = join(REPO_ROOT, "escola-veus-app", "assets", "fonts", "cormorant");

const W = 1080;
const H = 1920;

const COBRE = "#C28F60";
const COBRE_FRACO = "rgba(194, 143, 96, 0.55)";
const CREME = "#F2E9D8";

const GLIFO_POR_DIA = {
  mon: "✶", tue: "☉", wed: "◌", thu: "〜",
  fri: "♢", sat: "◯", sun: "→",
};
const KICKER_POR_DIA = {
  mon: "olha hoje",
  tue: "hoje agradeço",
  wed: "solto hoje",
  thu: "hoje aprendi",
  fri: "celebro hoje",
  sat: "hoje, no corpo",
  sun: "amanhã, escolho",
};
const DIA_LONGO_PT = {
  mon: "segunda", tue: "terça", wed: "quarta", thu: "quinta",
  fri: "sexta", sat: "sábado", sun: "domingo",
};

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta env ${name}`);
  return v;
}

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const JOB_ID = requireEnv("JOB_ID");
const BUCKET = "course-assets";

function publicUrl(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function fetchJsonPublic(path) {
  const r = await fetch(`${publicUrl(path)}?t=${Date.now()}`);
  if (!r.ok) throw new Error(`fetch ${path}: ${r.status}`);
  return r.json();
}

async function uploadBuffer(path, buf, contentType) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: buf,
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`upload ${path}: ${r.status} ${txt.slice(0, 300)}`);
  }
  return publicUrl(path);
}

async function writeItemResult(payload) {
  const path = `render-jobs/${JOB_ID}-items/${payload.dayIndex}.json`;
  await uploadBuffer(path, Buffer.from(JSON.stringify(payload, null, 2)), "application/json");
}

async function downloadTo(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download ${url}: ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  await writeFile(dest, buf);
}

function xmlEscape(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrap(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let buf = [];
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

function buildOverlaySvg({ fraseTexto, dia, fontItalicB64, fontSansB64 }) {
  const kicker = KICKER_POR_DIA[dia];
  const glifo = GLIFO_POR_DIA[dia];
  const diaLongo = DIA_LONGO_PT[dia];

  const arcPath = "M 220 1098 L 220 459 A 320 320 0 0 1 860 459 L 860 1098";
  const diaY = 507;
  const diaFontSize = 29;
  const diaLetterSpacing = 12;

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

  const sigGlifoY = 1770;
  const seteveusY = 1822;
  const kickerFontSize = 36;
  const glifoFontSize = 48;
  const seteveusFontSize = 24;
  const seteveusLetterSpacing = 8;

  // Scrims: bandas semi-transparentes que dão contraste local ao texto,
  // independentemente do brilho do motion (escuro ou claro). SVG não tem
  // backdrop-blur, mas o gradiente vertical + opacity já basta para
  // 'destacar' a área do texto sem escurecer o frame inteiro.
  const phraseScrimY = 653;        // 34% de 1920
  const phraseScrimH = 730;        // 38% de 1920
  const footerScrimY = 1574;       // 82% de 1920
  const footerScrimH = 346;        // 18% de 1920
  const arcDayScrimY = 472;        // pequeno halo atrás do nome do dia
  const arcDayScrimH = 86;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <style type="text/css">
      @font-face { font-family: "cormgar"; font-weight: 400; font-style: italic; src: url(data:font/ttf;base64,${fontItalicB64}) format("truetype"); }
      @font-face { font-family: "cormgar"; font-weight: 400; font-style: normal; src: url(data:font/ttf;base64,${fontSansB64}) format("truetype"); }
    </style>
    <linearGradient id="phraseScrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0E0820" stop-opacity="0"/>
      <stop offset="25%" stop-color="#0E0820" stop-opacity="0.15"/>
      <stop offset="75%" stop-color="#0E0820" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0E0820" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="footerScrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0E0820" stop-opacity="0"/>
      <stop offset="60%" stop-color="#0E0820" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0E0820" stop-opacity="0.25"/>
    </linearGradient>
    <radialGradient id="arcDayScrim" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0E0820" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0E0820" stop-opacity="0"/>
    </radialGradient>
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="8" flood-color="#000" flood-opacity="0.85"/>
      <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#000" flood-opacity="0.95"/>
    </filter>
    <filter id="smallShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.85"/>
      <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="#000" flood-opacity="0.95"/>
    </filter>
  </defs>

  <!-- Scrim atrás da frase (gradiente vertical, desvanece nos topos) -->
  <rect x="0" y="${phraseScrimY}" width="${W}" height="${phraseScrimH}" fill="url(#phraseScrim)"/>

  <!-- Scrim atrás da assinatura no fundo -->
  <rect x="0" y="${footerScrimY}" width="${W}" height="${footerScrimH}" fill="url(#footerScrim)"/>

  <!-- Halo radial atrás do nome do dia dentro do arco -->
  <rect x="280" y="${arcDayScrimY}" width="520" height="${arcDayScrimH}" fill="url(#arcDayScrim)"/>

  <!-- Cantoneira de cobre topo esquerdo -->
  <line x1="60" y1="60" x2="124" y2="60" stroke="${COBRE_FRACO}" stroke-width="3"/>
  <line x1="60" y1="60" x2="60" y2="124" stroke="${COBRE_FRACO}" stroke-width="3"/>

  <!-- Arco janela de lua -->
  <path d="${arcPath}" stroke="${COBRE_FRACO}" stroke-width="3" fill="none"/>
  <circle cx="540" cy="459" r="8" fill="${COBRE}" opacity="0.7"/>

  <!-- Dia da semana -->
  <text x="540" y="${diaY}" text-anchor="middle" font-family="cormgar" font-weight="400" font-size="${diaFontSize}" letter-spacing="${diaLetterSpacing}" fill="${COBRE}" filter="url(#smallShadow)">${xmlEscape(diaLongo)}</text>

  <!-- Frase -->
  ${fraseSvg}

  <!-- Assinatura -->
  <text x="540" y="${sigGlifoY}" text-anchor="middle" font-family="cormgar" font-style="italic" font-weight="400" font-size="${kickerFontSize}" fill="${COBRE}" filter="url(#smallShadow)"><tspan font-size="${glifoFontSize}" font-style="normal">${xmlEscape(glifo)}</tspan>  ${xmlEscape(kicker)}</text>

  <text x="540" y="${seteveusY}" text-anchor="middle" font-family="cormgar" font-weight="400" font-size="${seteveusFontSize}" letter-spacing="${seteveusLetterSpacing}" fill="${COBRE_FRACO}" filter="url(#smallShadow)">SETEVEUS.SPACE</text>
</svg>`;
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn("ffmpeg", args);
    let err = "";
    p.stderr.on("data", (c) => (err += c.toString()));
    p.on("error", reject);
    p.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`ffmpeg ${code}: ${err.slice(-800)}`))
    );
  });
}

async function renderOne({ item, workDir, fontItalicB64, fontSansB64, sharp }) {
  const motionPath = join(workDir, `motion-${item.dayIndex}.mp4`);
  const overlayPath = join(workDir, `overlay-${item.dayIndex}.png`);
  const audioPath = item.audioUrl ? join(workDir, `audio-${item.dayIndex}.mp3`) : null;
  const outPath = join(workDir, `out-${item.dayIndex}.mp4`);

  await downloadTo(item.motionUrl, motionPath);
  if (audioPath) await downloadTo(item.audioUrl, audioPath);

  const svg = buildOverlaySvg({
    fraseTexto: item.fraseTexto,
    dia: item.dia,
    fontItalicB64,
    fontSansB64,
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(overlayPath, png);

  const filter = [
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,fps=30,eq=brightness=0.12:saturation=1.1:contrast=0.95:gamma=0.82[v0]`,
    `[v0][1:v]overlay=0:0[v]`,
  ].join(";");

  const args = [
    "-y",
    "-stream_loop", "-1",
    "-i", motionPath,
    "-i", overlayPath,
  ];
  if (audioPath) args.push("-stream_loop", "-1", "-i", audioPath);
  args.push(
    "-filter_complex", filter,
    "-map", "[v]",
  );
  if (audioPath) args.push("-map", "2:a", "-c:a", "aac", "-b:a", "128k");
  else args.push("-an");
  args.push(
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "22",
    "-pix_fmt", "yuv420p",
    "-t", String(item.durationSec),
    "-movflags", "+faststart",
    outPath,
  );
  await runFfmpeg(args);

  const buf = await readFile(outPath);
  const fileName = `${item.date}-${item.dia}-${item.fraseId}.mp4`;
  const remote = `hoje-em-mim-renders/${item.dia}/${fileName}`;
  const url = await uploadBuffer(remote, buf, "video/mp4");

  return {
    dayIndex: item.dayIndex,
    date: item.date,
    dia: item.dia,
    fraseId: item.fraseId,
    fraseTexto: item.fraseTexto,
    file: fileName,
    url,
    sizeBytes: buf.length,
    durationSec: item.durationSec,
    motionUrl: item.motionUrl,
    audioUrl: item.audioUrl,
    captions: item.captions,
  };
}

async function main() {
  const DAY_INDEX = Number(process.env.DAY_INDEX);
  if (!Number.isInteger(DAY_INDEX) || DAY_INDEX < 0) {
    throw new Error(`DAY_INDEX inválido: ${process.env.DAY_INDEX}`);
  }
  console.log(`→ Job ${JOB_ID} · item dayIndex=${DAY_INDEX}`);

  const manifest = await fetchJsonPublic(`render-jobs/${JOB_ID}.json`);
  const items = manifest.items || [];
  const item = items.find((it) => it.dayIndex === DAY_INDEX);
  if (!item) {
    throw new Error(`dayIndex ${DAY_INDEX} não está no manifest (total ${items.length})`);
  }
  console.log(`→ ${item.date} (${item.dia}) → ${item.fraseId}`);

  const [fontItalicBuf, fontRegBuf] = await Promise.all([
    readFile(join(FONTS_DIR, "CormorantGaramond-Italic.ttf")),
    readFile(join(FONTS_DIR, "CormorantGaramond-Regular.ttf")),
  ]);
  const fontItalicB64 = fontItalicBuf.toString("base64");
  const fontSansB64 = fontRegBuf.toString("base64");

  const { default: sharp } = await import("sharp");

  const workDir = await mkdtemp(join(tmpdir(), `hem-${DAY_INDEX}-`));

  try {
    try {
      const v = await renderOne({ item, workDir, fontItalicB64, fontSansB64, sharp });
      console.log(`   ✓ ${(v.sizeBytes / 1024 / 1024).toFixed(1)} MB → ${v.url}`);
      await writeItemResult({
        jobId: JOB_ID,
        dayIndex: DAY_INDEX,
        status: "done",
        ...v,
        completedAt: new Date().toISOString(),
      });
    } catch (err) {
      const errMsg = String(err.message || err).slice(0, 600);
      console.error(`   ✗ ${errMsg}`);
      await writeItemResult({
        jobId: JOB_ID,
        dayIndex: DAY_INDEX,
        status: "failed",
        date: item.date,
        dia: item.dia,
        fraseId: item.fraseId,
        fraseTexto: item.fraseTexto,
        file: null,
        url: null,
        error: errMsg,
        captions: item.captions,
        failedAt: new Date().toISOString(),
      });
      throw err;
    }
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("\n✗", err.message || err);
  process.exit(1);
});
