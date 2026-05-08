#!/usr/bin/env node
// render.mjs — corre dentro de GitHub Actions.
//
// 1. Lê manifest em course-assets/render-jobs/<jobId>.json
// 2. Bundle Remotion (escola-veus-app/src/remotion/index.ts)
// 3. Render ShortsComposition para MP4
// 4. Sobe MP4 para course-assets/shorts/videos/<jobId>.mp4
// 5. Escreve result.json em course-assets/render-jobs/<jobId>-result.json
//
// Uso:
//   JOB_ID=<id> node render.mjs
//
// Env obrigatórias:
//   JOB_ID
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const APP_ROOT = path.join(REPO_ROOT, "escola-veus-app");
const ENTRY_POINT = path.join(APP_ROOT, "src", "remotion", "index.ts");
const WORK_DIR = "/tmp/remotion-shorts";

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const JOB_ID = requireEnv("JOB_ID");
const BUCKET = "course-assets";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta env ${name}`);
  return v;
}

function publicUrl(pathInBucket) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${pathInBucket}`;
}

async function fetchJson(url) {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`fetch ${url} ${r.status}`);
  return r.json();
}

async function uploadFile(pathInBucket, body, contentType) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${pathInBucket}`;
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
    throw new Error(`upload ${pathInBucket} ${res.status}: ${txt.slice(0, 300)}`);
  }
  return publicUrl(pathInBucket);
}

async function writeResult(payload) {
  await uploadFile(
    `render-jobs/${JOB_ID}-result.json`,
    JSON.stringify(payload, null, 2),
    "application/json",
  );
}

async function updateProgress(status, progress, extra = {}) {
  await writeResult({
    jobId: JOB_ID,
    status,
    progress,
    updatedAt: new Date().toISOString(),
    ...extra,
  });
}

async function main() {
  console.log(`→ Job ${JOB_ID}`);

  // 1. Lê manifest
  const manifestUrl = publicUrl(`render-jobs/${JOB_ID}.json`);
  console.log(`→ A ler manifest ${manifestUrl}`);
  const manifest = await fetchJson(manifestUrl);
  console.log(`→ Manifest brand=${manifest.brand} variant=${manifest.motionVariant}`);

  await mkdir(WORK_DIR, { recursive: true });
  const propsPath = path.join(WORK_DIR, `${JOB_ID}-props.json`);
  await writeFile(propsPath, JSON.stringify(manifest, null, 2));

  await updateProgress("rendering", 10, { title: manifest.title || manifest.trackLabel || JOB_ID });

  // 2-3. Bundle + render usando Remotion APIs (mais fiável que CLI).
  console.log(`→ Bundle + render Remotion...`);
  const { bundle } = await import("@remotion/bundler");
  const { renderMedia, selectComposition } = await import("@remotion/renderer");

  const bundleLocation = await bundle({
    entryPoint: ENTRY_POINT,
    webpackOverride: (cfg) => cfg,
  });
  console.log(`→ Bundle: ${bundleLocation}`);

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "ShortsComposition",
    inputProps: manifest,
  });
  console.log(`→ Composition: ${composition.width}x${composition.height} ${composition.durationInFrames}f`);

  await updateProgress("rendering", 30);

  const outputPath = path.join(WORK_DIR, `${JOB_ID}.mp4`);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: manifest,
    onProgress: ({ progress }) => {
      const pct = 30 + Math.round(progress * 60);
      console.log(`  ... ${pct}%`);
    },
  });
  console.log(`→ MP4 renderizado: ${outputPath}`);

  await updateProgress("uploading", 92);

  // 4. Upload
  const mp4Body = await readFile(outputPath);
  const remotePath = `shorts/videos/${JOB_ID}.mp4`;
  const videoUrl = await uploadFile(remotePath, mp4Body, "video/mp4");
  console.log(`→ Upload OK: ${videoUrl}`);

  // 5. Result final
  await writeResult({
    jobId: JOB_ID,
    status: "done",
    progress: 100,
    title: manifest.title || manifest.trackLabel || "",
    videoUrl,
    sizeBytes: mp4Body.length,
    completedAt: new Date().toISOString(),
  });
  console.log(`✓ Done`);
}

main().catch(async (err) => {
  console.error(`\n✗ ${err.message}`);
  console.error(err.stack);
  try {
    await writeResult({
      jobId: JOB_ID,
      status: "failed",
      error: String(err.message || err).slice(0, 800),
      failedAt: new Date().toISOString(),
    });
  } catch {}
  process.exit(1);
});
