#!/usr/bin/env node
// upload-result.mjs — Faz upload dos 7 MP4s gerados em
// carrossel-veus/output/videos/ para Supabase Storage e escreve o ficheiro
// course-assets/render-jobs/<jobId>-result.json com as URLs.
//
// Corre dentro do GitHub Actions, depois de `npm run all` no carrossel-veus/.
//
// Uso:
//   JOB_ID=<id> node upload-result.mjs
//
// Env obrigatórias:
//   JOB_ID
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const VIDEOS_DIR = path.join(REPO_ROOT, "carrossel-veus", "output", "videos");
const PNG_DIR = path.join(REPO_ROOT, "carrossel-veus", "output");

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const JOB_ID = requireEnv("JOB_ID");
const BUCKET = "course-assets";
const BASE_PATH = `carrossel-veus/${JOB_ID}`;

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta env ${name}`);
  return v;
}

function publicUrl(pathInBucket) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${pathInBucket}`;
}

async function uploadFile(pathInBucket, filePath, contentType) {
  const data = await readFile(filePath);
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${pathInBucket}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: data,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload ${pathInBucket} falhou ${res.status}: ${txt.slice(0, 300)}`);
  }
  return publicUrl(pathInBucket);
}

async function writeResult(payload) {
  const pathInBucket = `render-jobs/${JOB_ID}-result.json`;
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${pathInBucket}`;
  const body = JSON.stringify(payload, null, 2);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      "x-upsert": "true",
    },
    body,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`writeResult falhou ${res.status}: ${txt.slice(0, 300)}`);
  }
}

async function main() {
  console.log(`→ Job ${JOB_ID}`);
  const files = (await readdir(VIDEOS_DIR)).filter((f) => f.endsWith(".mp4")).sort();
  if (files.length === 0) throw new Error(`Sem MP4 em ${VIDEOS_DIR}`);
  console.log(`→ ${files.length} MP4 para subir`);

  const videos = [];
  for (const f of files) {
    const local = path.join(VIDEOS_DIR, f);
    const remote = `${BASE_PATH}/videos/${f}`;
    const tam = (await stat(local)).size;
    process.stdout.write(`  · ${f} (${(tam / 1024 / 1024).toFixed(1)} MB) → `);
    const url = await uploadFile(remote, local, "video/mp4");
    console.log(`ok`);
    videos.push({ file: f, url, sizeBytes: tam });
  }

  // Sobe também o ZIP de PNGs (útil para WhatsApp se preferir imagem)
  // Cria ZIP inline para evitar dependência extra.
  // Nota: salta se output/dia-1 não existir.
  const pngs = [];
  for (let dia = 1; dia <= 7; dia++) {
    const diaDir = path.join(PNG_DIR, `dia-${dia}`);
    try {
      const diaFiles = (await readdir(diaDir)).filter((f) => f.endsWith(".png")).sort();
      for (const f of diaFiles) {
        pngs.push({ dia, file: f, local: path.join(diaDir, f) });
      }
    } catch {
      // sem dia
    }
  }
  console.log(`→ ${pngs.length} PNG para subir`);
  const pngUrls = [];
  for (const p of pngs) {
    const remote = `${BASE_PATH}/pngs/dia-${p.dia}/${p.file}`;
    const url = await uploadFile(remote, p.local, "image/png");
    pngUrls.push({ dia: p.dia, file: p.file, url });
  }

  const result = {
    jobId: JOB_ID,
    status: "done",
    progress: 100,
    videos,
    pngs: pngUrls,
    completedAt: new Date().toISOString(),
  };
  await writeResult(result);
  console.log(`\n✓ result.json escrito (${videos.length} vídeos, ${pngUrls.length} PNGs)`);
}

main().catch(async (err) => {
  console.error("\n✗", err.message || err);
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
