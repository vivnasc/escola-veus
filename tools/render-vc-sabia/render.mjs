#!/usr/bin/env node
// render.mjs — corre dentro de GitHub Actions (render-vc-sabia.yml).
//
// 1. Le manifest em course-assets/render-jobs/<JOB_ID>.json
// 2. Faz download do motion, audio (opcional) e overlay PNG
// 3. ffmpeg: motion em loop + overlay PNG estatico + audio (se houver)
//    -> output 1080x1920 MP4
// 4. Sobe MP4 para course-assets/vc-sabia-renders/<JOB_ID>.mp4
// 5. Escreve result.json com status=done + videoUrl
//
// Env obrigatorias:
//   JOB_ID
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

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

  const motionPath = path.join(WORK, "motion.mp4");
  const overlayPath = path.join(WORK, "overlay.png");
  let audioPath = null;

  await writeResult({
    jobId: JOB_ID,
    status: "running",
    progress: 15,
    message: "A descarregar motion + overlay...",
  });
  await downloadTo(manifest.motionUrl, motionPath);
  await downloadTo(manifest.overlayUrl, overlayPath);

  if (manifest.audioUrl) {
    audioPath = path.join(WORK, "audio.mp3");
    await downloadTo(manifest.audioUrl, audioPath);
  }

  await writeResult({
    jobId: JOB_ID,
    status: "running",
    progress: 40,
    message: "A renderizar com ffmpeg...",
  });

  const outputPath = path.join(WORK, "output.mp4");
  const duration = Number(manifest.durationSec || 12);

  // Filter: motion em cover 1080x1920 + overlay PNG por cima.
  const filter = [
    "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[bg]",
    `[${audioPath ? 2 : 1}:v]scale=1080:1920[ov]`,
    "[bg][ov]overlay=0:0,format=yuv420p[v]",
  ].join(";");

  const args = [
    "-y",
    "-stream_loop",
    "-1",
    "-i",
    motionPath,
  ];
  if (audioPath) {
    args.push("-i", audioPath);
  }
  args.push("-loop", "1", "-i", overlayPath);
  args.push("-filter_complex", filter);
  args.push("-map", "[v]");
  if (audioPath) {
    args.push("-map", "1:a", "-c:a", "aac", "-b:a", "128k", "-af", `afade=t=out:st=${Math.max(0, duration - 1.5)}:d=1.5`);
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

  console.log("ffmpeg args:", args.map((a) => (a.includes(" ") || a.includes(";") ? `'${a}'` : a)).join(" "));

  await new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", args, { stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}`));
    });
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

  console.log(`✓ Render complete: ${videoUrl} (${(mp4Buf.length / 1024 / 1024).toFixed(2)} MB)`);
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
