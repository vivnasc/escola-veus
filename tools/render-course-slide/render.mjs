#!/usr/bin/env node
/**
 * Render de um MP4 de video-aula (Mock B) a partir de um manifest JSON.
 *
 * Corre em GitHub Actions. Flow:
 *   1. Le jobId (arg 0) e fetch do manifest em Supabase
 *   2. Puppeteer renderiza cada slide como PNG 1920x1080
 *   3. FFmpeg:
 *      - concat demuxer com duracao por slide
 *      - faixa Ancient Ground em loop com volume modulado por acto (dB)
 *      - fade-in 2s + fade-out 3s
 *   4. Upload MP4 para course-assets/curso-<slug>/videos/m<N>-<letter>.mp4
 *   5. Escreve render-jobs/<jobId>-result.json
 */

import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import puppeteer from "puppeteer";
import { renderSlideHtml } from "./slide-template.mjs";

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const BUCKET = "course-assets";
const JOB_DIR = "render-jobs";
const WORK_DIR = "/tmp/course-slide-render";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta env ${name}`);
  return v;
}

async function main() {
  const jobId = process.argv[2];
  if (!jobId) throw new Error("Uso: render.mjs <jobId>");

  console.log(`[render-course-slide] jobId=${jobId}`);
  await mkdir(WORK_DIR, { recursive: true });

  let manifest;
  try {
    manifest = await fetchManifest(jobId);
    await writeResult(jobId, { status: "running" });
  } catch (err) {
    console.error("Falha a ler manifest:", err.message);
    await writeResult(jobId, { status: "error", error: `Manifest: ${err.message}` });
    process.exit(1);
  }

  try {
    const { deck, agTrackUrl, volumeDb, accentColor, outputPath } = manifest;
    console.log(`[render-course-slide] deck=${deck.slides.length} slides, total=${deck.totalDurationSec}s`);

    const pngDir = path.join(WORK_DIR, jobId, "frames");
    await mkdir(pngDir, { recursive: true });

    // 1) Puppeteer: gerar PNGs de todos os slides
    await renderPngs(deck, accentColor, pngDir);

    // 2) FFmpeg: concat demuxer
    const listPath = path.join(WORK_DIR, jobId, "concat.txt");
    await writeConcatList(deck, pngDir, listPath);

    // 3) Baixar AG track
    const agPath = path.join(WORK_DIR, jobId, "ag.mp3");
    console.log(`[render-course-slide] downloading AG: ${agTrackUrl}`);
    await downloadTo(agTrackUrl, agPath);

    // 4) FFmpeg render
    const mp4Path = path.join(WORK_DIR, jobId, "out.mp4");
    await ffmpegRender({
      listPath,
      agPath,
      deck,
      volumeDb,
      outPath: mp4Path,
    });

    // 5) Upload
    console.log(`[render-course-slide] uploading to ${outputPath}`);
    await uploadLargeToSupabase(outputPath, mp4Path, "video/mp4");

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${outputPath}`;

    await writeResult(jobId, {
      status: "done",
      videoUrl: publicUrl,
      durationSec: deck.totalDurationSec,
      slides: deck.slides.length,
    });

    console.log(`[render-course-slide] done: ${publicUrl}`);
  } catch (err) {
    console.error("[render-course-slide] erro:", err);
    await writeResult(jobId, { status: "error", error: err.message ?? String(err) });
    process.exit(1);
  }
}

async function fetchManifest(jobId) {
  const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${JOB_DIR}/${jobId}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Manifest ${jobId}: HTTP ${res.status}`);
  return await res.json();
}

async function writeResult(jobId, result) {
  const body = JSON.stringify({ ...result, jobId, updatedAt: new Date().toISOString() }, null, 2);
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${JOB_DIR}/${jobId}-result.json`;
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      "x-upsert": "true",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`writeResult: ${res.status} ${text.slice(0, 200)}`);
  }
}

async function renderPngs(deck, accent, pngDir) {
  console.log("[render-course-slide] launching puppeteer...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  for (let i = 0; i < deck.slides.length; i++) {
    const slide = deck.slides[i];
    const html = renderSlideHtml({ slide, deck, accent });
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    // Font loading: wait up to 2s
    await page.evaluateHandle("document.fonts.ready");
    const out = path.join(pngDir, `slide-${String(i).padStart(4, "0")}.png`);
    await page.screenshot({
      path: out,
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
      omitBackground: false,
    });
    if (i % 5 === 0) console.log(`[render-course-slide] frame ${i + 1}/${deck.slides.length}`);
  }

  await browser.close();
}

async function writeConcatList(deck, pngDir, listPath) {
  const lines = [];
  for (let i = 0; i < deck.slides.length; i++) {
    const frame = path.join(pngDir, `slide-${String(i).padStart(4, "0")}.png`);
    lines.push(`file '${frame.replace(/'/g, "'\\''")}'`);
    lines.push(`duration ${deck.slides[i].duracao}`);
  }
  // O concat demuxer ignora a duracao do ultimo item; repetir a ultima frame
  // garante que ela fica na duracao declarada.
  const last = path.join(pngDir, `slide-${String(deck.slides.length - 1).padStart(4, "0")}.png`);
  lines.push(`file '${last.replace(/'/g, "'\\''")}'`);
  await writeFile(listPath, lines.join("\n"), "utf-8");
}

function buildVolumeFilterChain(deck, volumeDb) {
  // Cadeia de filtros volume com enable=between(t,T0,T1):
  //   0..8s:  -20dB (title)
  //   8..10s: -20dB (marker)
  //   10..N:  volume do acto
  // Outside all windows, volume passa unchanged — garantir que todas as
  // fatias estao cobertas.
  const filters = [];
  let t = 0;
  for (let i = 0; i < deck.slides.length; i++) {
    const s = deck.slides[i];
    const t0 = t;
    const t1 = t + s.duracao;
    t = t1;

    let db;
    if (s.tipo === "title" || s.tipo === "end") db = -20;
    else if (s.tipo === "fecho") db = -60; // quase mute nos 2s de fecho
    else if (s.tipo === "acto-marker") db = -20;
    else if (s.tipo === "conteudo" && s.acto) {
      db = volumeDb?.[s.acto];
      if (typeof db !== "number") db = -18;
    } else {
      db = -20;
    }

    filters.push(`volume=volume=${db}dB:enable='between(t,${t0},${t1})'`);
  }
  const total = deck.totalDurationSec;
  // Fade-in 2s, fade-out 3s (no final do video).
  filters.push(`afade=t=in:st=0:d=2`);
  filters.push(`afade=t=out:st=${Math.max(0, total - 3)}:d=3`);
  return filters.join(",");
}

async function ffmpegRender({ listPath, agPath, deck, volumeDb, outPath }) {
  const total = deck.totalDurationSec;
  const volFilter = buildVolumeFilterChain(deck, volumeDb);

  // -stream_loop -1: loopa o AG ate cortar no -t total
  // -shortest: corta pelo stream mais curto (= video)
  // -pix_fmt yuv420p: compat YouTube/iOS
  const args = [
    "-y",
    // input 0: video (concat demuxer com PNGs)
    "-f", "concat",
    "-safe", "0",
    "-i", listPath,
    // input 1: audio Ancient Ground (loop)
    "-stream_loop", "-1",
    "-i", agPath,
    // filtros: aplica volume modulado + fades no audio
    "-filter_complex",
    `[1:a]${volFilter}[a]`,
    "-map", "0:v",
    "-map", "[a]",
    "-t", String(total),
    "-r", "30",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    outPath,
  ];
  console.log("[render-course-slide] ffmpeg", args.map((a) => (a.includes(" ") ? `"${a}"` : a)).join(" "));
  await run("ffmpeg", args);
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let lastTime = Date.now();
    p.stdout.on("data", (d) => process.stdout.write(d));
    p.stderr.on("data", (d) => {
      const s = d.toString();
      // ffmpeg progress lines come through stderr
      if (Date.now() - lastTime > 5000 || /error|Error|ERROR/.test(s)) {
        process.stderr.write(s);
        lastTime = Date.now();
      }
    });
    p.on("error", reject);
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exit ${code}`));
    });
  });
}

async function downloadTo(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download falhou ${res.status} ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

// TUS resumable upload — obrigatorio para MP4 >50MB no Supabase.
// Adaptado do render-ancient-ground/render.mjs. Nossos MP4 sao de 3-6min
// (~20-60MB) mas ja usamos TUS por consistencia.
async function uploadLargeToSupabase(pathInBucket, filePath, contentType) {
  const info = await stat(filePath);
  const fileSize = info.size;
  const CHUNK_SIZE = 6 * 1024 * 1024;

  const b64 = (s) => Buffer.from(s, "utf-8").toString("base64");
  const metadata = [
    `bucketName ${b64(BUCKET)}`,
    `objectName ${b64(pathInBucket)}`,
    `contentType ${b64(contentType)}`,
    `cacheControl ${b64("3600")}`,
  ].join(",");

  const createRes = await fetch(`${SUPABASE_URL}/storage/v1/upload/resumable`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Tus-Resumable": "1.0.0",
      "Upload-Length": String(fileSize),
      "Upload-Metadata": metadata,
      "x-upsert": "true",
    },
  });
  if (!createRes.ok) {
    const txt = await createRes.text();
    throw new Error(`TUS create falhou ${createRes.status}: ${txt.slice(0, 300)}`);
  }
  const tusUrl = createRes.headers.get("Location");
  if (!tusUrl) throw new Error("TUS create: sem Location header");

  const buf = await readFile(filePath);
  let offset = 0;
  while (offset < fileSize) {
    const end = Math.min(offset + CHUNK_SIZE, fileSize);
    const chunk = buf.subarray(offset, end);
    const res = await fetch(tusUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": String(offset),
        "Content-Type": "application/offset+octet-stream",
      },
      body: chunk,
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`TUS PATCH ${offset}-${end} falhou ${res.status}: ${txt.slice(0, 300)}`);
    }
    offset = Number(res.headers.get("Upload-Offset") ?? end);
  }
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
