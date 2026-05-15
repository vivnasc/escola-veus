#!/usr/bin/env node
// render.mjs — corre em GitHub Actions (render-vc-sabia.yml).
//
// 1. Le manifest em course-assets/render-jobs/<JOB_ID>.json
// 2. Compoe overlay PNG localmente via @napi-rs/canvas (variante C)
// 3. Download motion + audio (opcional)
// 4. ffmpeg: motion (loop, cover 1080x1920) + overlay PNG + audio (fadeout)
// 5. Upload MP4 para course-assets/vc-sabia-renders/<JOB_ID>.mp4
// 6. Escreve result.json com status=done + videoUrl
//
// Env: JOB_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { createCanvas } from "@napi-rs/canvas";

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const JOB_ID = requireEnv("JOB_ID");
const BUCKET = "course-assets";
const WORK = "/tmp/vc-sabia-render";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta env ${name}`);
  return v;
}

function publicUrl(p) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${p}`;
}

async function uploadFile(p, body, contentType) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${p}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`upload ${p} ${res.status}: ${txt.slice(0, 300)}`);
  }
  return publicUrl(p);
}

async function writeResult(payload) {
  await uploadFile(
    `render-jobs/${JOB_ID}-result.json`,
    JSON.stringify(payload, null, 2),
    "application/json",
  );
}

async function downloadTo(url, dest) {
  console.log(`→ download ${url.slice(-60)}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url} ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`  ${buf.length} bytes`);
}

/** Variante C: cartao de vidro semi-transparente + moldura dourada +
 *  kicker italico dourado + frase italico creme + footer com data e
 *  assinatura. PNG transparente para sobrepor ao motion. */
function composeOverlay(phrase, dateLabel) {
  const W = 1080;
  const H = 1920;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Vinheta inferior para legibilidade do texto sobre motions claros
  const grad = ctx.createLinearGradient(0, H * 0.4, 0, H);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Cartao de vidro
  const cardX = 90;
  const cardW = W - cardX * 2;
  const cardY = 880;
  const cardH = 760;
  const radius = 28;
  ctx.save();
  roundedRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fill();
  ctx.strokeStyle = "rgba(212,175,55,0.85)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // Cantos dourados
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 3;
  const corner = 36;
  drawCornerL(ctx, cardX + 18, cardY + 18, corner, "tl");
  drawCornerL(ctx, cardX + cardW - 18, cardY + 18, corner, "tr");
  drawCornerL(ctx, cardX + 18, cardY + cardH - 18, corner, "bl");
  drawCornerL(ctx, cardX + cardW - 18, cardY + cardH - 18, corner, "br");

  // Kicker
  ctx.fillStyle = "#D4AF37";
  ctx.font = "italic 56px serif";
  ctx.textAlign = "center";
  ctx.fillText("Sabias que...", W / 2, cardY + 110);

  // Frase (wrap)
  ctx.fillStyle = "#FAF7F0";
  ctx.font = "italic 60px serif";
  const lines = wrapText(ctx, phrase, cardW - 120);
  let y = cardY + 240;
  for (const ln of lines) {
    ctx.fillText(ln, W / 2, y);
    y += 80;
  }

  // Footer
  ctx.fillStyle = "rgba(250,247,240,0.65)";
  ctx.font = "22px sans-serif";
  ctx.fillText(dateLabel, W / 2, H - 80);
  ctx.fillStyle = "#D4AF37";
  ctx.font = "22px sans-serif";
  ctx.fillText("seteveus.space", W / 2, H - 48);

  return canvas.toBuffer("image/png");
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCornerL(ctx, x, y, size, pos) {
  ctx.beginPath();
  if (pos === "tl") {
    ctx.moveTo(x, y + size);
    ctx.lineTo(x, y);
    ctx.lineTo(x + size, y);
  } else if (pos === "tr") {
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + size);
  } else if (pos === "bl") {
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y);
    ctx.lineTo(x + size, y);
  } else {
    ctx.moveTo(x - size, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y - size);
  }
  ctx.stroke();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

try {
  await mkdir(WORK, { recursive: true });

  await writeResult({
    jobId: JOB_ID,
    status: "running",
    progress: 5,
    message: "A ler manifest...",
  });

  const manifest = await (async () => {
    const url = publicUrl(`render-jobs/${JOB_ID}.json`);
    const r = await fetch(url);
    if (!r.ok) throw new Error(`manifest ${r.status}`);
    return r.json();
  })();
  console.log("Manifest:", JSON.stringify({ ...manifest, motionUrl: "..." }, null, 2));

  // Compor overlay localmente (sem precisar de PNG do cliente)
  await writeResult({
    jobId: JOB_ID,
    status: "running",
    progress: 15,
    message: "A compor overlay...",
  });
  const overlayBuffer = composeOverlay(manifest.phrase || "", manifest.dateLabel || "");
  const overlayPath = path.join(WORK, "overlay.png");
  await writeFile(overlayPath, overlayBuffer);
  console.log(`  overlay ${overlayBuffer.length} bytes`);

  // Download assets
  await writeResult({
    jobId: JOB_ID,
    status: "running",
    progress: 30,
    message: "A descarregar motion...",
  });
  const motionPath = path.join(WORK, "motion.mp4");
  await downloadTo(manifest.motionUrl, motionPath);

  let audioPath = null;
  if (manifest.audioUrl) {
    audioPath = path.join(WORK, "audio.mp3");
    await downloadTo(manifest.audioUrl, audioPath);
  }

  await writeResult({
    jobId: JOB_ID,
    status: "running",
    progress: 50,
    message: "A renderizar com ffmpeg...",
  });

  const outputPath = path.join(WORK, "output.mp4");
  const duration = Number(manifest.durationSec || 12);

  const filter = [
    "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[bg]",
    `[${audioPath ? 2 : 1}:v]scale=1080:1920[ov]`,
    "[bg][ov]overlay=0:0,format=yuv420p[v]",
  ].join(";");

  const args = ["-y", "-stream_loop", "-1", "-i", motionPath];
  if (audioPath) args.push("-i", audioPath);
  args.push("-loop", "1", "-i", overlayPath);
  args.push("-filter_complex", filter);
  args.push("-map", "[v]");
  if (audioPath) {
    args.push(
      "-map",
      "1:a",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-af",
      `afade=t=out:st=${Math.max(0, duration - 1.5)}:d=1.5`,
    );
  } else {
    args.push("-an");
  }
  args.push(
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "22",
    "-t",
    String(duration),
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    outputPath,
  );

  console.log("ffmpeg:", args.join(" "));
  await new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", args, { stdio: "inherit" });
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))));
    child.on("error", reject);
  });

  await writeResult({
    jobId: JOB_ID,
    status: "running",
    progress: 85,
    message: "A subir MP4...",
  });

  const mp4Buf = await readFile(outputPath);
  const videoUrl = await uploadFile(
    `vc-sabia-renders/${JOB_ID}.mp4`,
    mp4Buf,
    "video/mp4",
  );

  await writeResult({
    jobId: JOB_ID,
    status: "done",
    progress: 100,
    videoUrl,
    sizeBytes: mp4Buf.length,
    completedAt: new Date().toISOString(),
  });

  console.log(`✓ ${videoUrl} (${(mp4Buf.length / 1024 / 1024).toFixed(2)} MB)`);
} catch (err) {
  console.error("✗ Render failed:", err);
  await writeResult({
    jobId: JOB_ID,
    status: "failed",
    error: err instanceof Error ? err.message : String(err),
    failedAt: new Date().toISOString(),
  });
  process.exit(1);
}
