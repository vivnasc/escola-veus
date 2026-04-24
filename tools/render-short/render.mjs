#!/usr/bin/env node
// Render de um Short vertical (30s, 1080x1920) a partir de um manifest JSON.
// Mesmo padrão do render Ancient Ground: workflow GitHub Actions, FFmpeg de
// sistema, polling via ficheiro result.json em Supabase.
//
// Uso:
//   node render.mjs <jobId>
//
// Env obrigatórias:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const BUCKET = "course-assets";
const JOB_DIR = "render-jobs";
const VIDEO_DIR = "shorts/videos";
const WORK_DIR = "/tmp/short-render";

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta env ${name}`);
  return v;
}

function supabasePublicUrl(pathInBucket) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${pathInBucket}`;
}

async function downloadTo(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download falhou ${res.status} ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

async function uploadToSupabase(pathInBucket, data, contentType) {
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${pathInBucket}`;
  const res = await fetch(uploadUrl, {
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
}

function runFfmpeg(args, label = "ffmpeg") {
  return new Promise((resolve, reject) => {
    console.log(`\n[${label}] ffmpeg ${args.join(" ")}\n`);
    const p = spawn("ffmpeg", ["-hide_banner", ...args], { stdio: ["ignore", "inherit", "inherit"] });
    p.on("error", reject);
    p.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg saiu com código ${code}`));
    });
  });
}

async function writeResult(jobId, payload) {
  const body = JSON.stringify({ jobId, ...payload, updatedAt: new Date().toISOString() }, null, 2);
  await uploadToSupabase(`${JOB_DIR}/${jobId}-result.json`, body, "application/json");
}

async function writeDataUrl(dataUrl, dest) {
  const m = dataUrl.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
  if (!m) throw new Error("Overlay PNG inválido (esperava dataURL base64).");
  const buf = Buffer.from(m[2], "base64");
  await writeFile(dest, buf);
}

async function main() {
  const jobId = process.argv[2];
  if (!jobId) throw new Error("Uso: render.mjs <jobId>");

  await mkdir(WORK_DIR, { recursive: true });

  console.log(`[1/5] jobId=${jobId}`);
  const manifestUrl = supabasePublicUrl(`${JOB_DIR}/${jobId}.json`);
  const mres = await fetch(manifestUrl);
  if (!mres.ok) throw new Error(`Manifest HTTP ${mres.status}`);
  const manifest = await mres.json();

  const {
    title = "short",
    slug: rawSlug,
    clips,
    clipDuration = 10,
    musicUrl,
    musicVolume = 0.9,
    overlayPngs,    // [dataURL string, dataURL string]
    overlayStart,   // [start1, start2]
    overlayEnd,     // [end1, end2]
    thumbnailUrl,
    seo,
  } = manifest;

  if (!Array.isArray(clips) || clips.length === 0) throw new Error("clips[] vazio");
  const hasMusic = !!musicUrl;

  const slug = rawSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "short";

  await writeResult(jobId, { status: "running", phase: "download", progress: 10 });

  console.log(`[2/5] Download ${clips.length} clips${hasMusic ? " + música" : " (sem música)"}`);
  const clipPaths = clips.map((_, i) => path.join(WORK_DIR, `clip-${i}.mp4`));
  const musicPath = hasMusic ? path.join(WORK_DIR, "music.mp3") : null;
  await Promise.all([
    ...clips.map((url, i) => downloadTo(url, clipPaths[i])),
    ...(hasMusic && musicPath ? [downloadTo(musicUrl, musicPath)] : []),
  ]);

  // Decode overlay PNGs (opcionais)
  const overlayPath1 = overlayPngs?.[0] ? path.join(WORK_DIR, "ovl-1.png") : null;
  const overlayPath2 = overlayPngs?.[1] ? path.join(WORK_DIR, "ovl-2.png") : null;
  if (overlayPath1) await writeDataUrl(overlayPngs[0], overlayPath1);
  if (overlayPath2) await writeDataUrl(overlayPngs[1], overlayPath2);

  await writeResult(jobId, { status: "running", phase: "render", progress: 25 });

  // ── Filter graph ──────────────────────────────────────────────────────────
  const totalDuration = clips.length * clipDuration;
  const halfSec = totalDuration / 2;
  const [o1Start, o2Start] = overlayStart ?? [0, halfSec];
  const [o1End, o2End] = overlayEnd ?? [halfSec, totalDuration];

  const scaleFilters = clips.map(
    (_, i) => `[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[v${i}]`
  );
  const concatInputs = clips.map((_, i) => `[v${i}]`).join("");
  const concatFilter = `${concatInputs}concat=n=${clips.length}:v=1:a=0[vconcat]`;

  const ovlBaseIdx = clips.length + (hasMusic ? 1 : 0);
  let ovlIdxCounter = ovlBaseIdx;
  const ovlInputs = [];
  const ovlFilters = [];
  let lastVideoLabel = "vconcat";

  if (overlayPath1) {
    const idx = ovlIdxCounter++;
    ovlInputs.push(overlayPath1);
    const out = overlayPath2 ? "vo1" : "vout";
    ovlFilters.push(`[${lastVideoLabel}][${idx}:v]overlay=0:0:enable='between(t,${o1Start},${o1End})'[${out}]`);
    lastVideoLabel = out;
  }
  if (overlayPath2) {
    const idx = ovlIdxCounter++;
    ovlInputs.push(overlayPath2);
    const out = "vout";
    ovlFilters.push(`[${lastVideoLabel}][${idx}:v]overlay=0:0:enable='between(t,${o2Start},${o2End})'[${out}]`);
    lastVideoLabel = out;
  }
  if (!overlayPath1 && !overlayPath2) {
    ovlFilters.push(`[vconcat]copy[vout]`);
  }

  const filterParts = [...scaleFilters, concatFilter, ...ovlFilters];
  if (hasMusic) {
    const musicIdx = clips.length;
    filterParts.push(
      `[${musicIdx}:a]atrim=0:${totalDuration.toFixed(2)},asetpts=N/SR/TB,volume=${musicVolume},afade=t=in:st=0:d=0.5,afade=t=out:st=${(totalDuration - 0.5).toFixed(2)}:d=0.5[aout]`,
    );
  }

  const filterComplex = filterParts.join(";");

  const outPath = path.join(WORK_DIR, "out.mp4");
  await runFfmpeg([
    "-y",
    ...clipPaths.flatMap((p) => ["-i", p]),
    ...(hasMusic && musicPath ? ["-i", musicPath] : []),
    ...ovlInputs.flatMap((p) => ["-i", p]),
    "-filter_complex", filterComplex,
    "-map", "[vout]",
    ...(hasMusic ? ["-map", "[aout]"] : []),
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    ...(hasMusic ? ["-c:a", "aac", "-b:a", "192k"] : []),
    "-movflags", "+faststart",
    "-t", totalDuration.toFixed(2),
    outPath,
  ], "render");

  await writeResult(jobId, { status: "running", phase: "upload", progress: 85 });

  // ── Upload ────────────────────────────────────────────────────────────────
  console.log(`[3/5] Upload MP4 para Supabase`);
  const stamp = Date.now();
  const mp4Name = `${slug}-${stamp}.mp4`;
  const mp4Buf = await readFile(outPath);
  await uploadToSupabase(`${VIDEO_DIR}/${mp4Name}`, mp4Buf, "video/mp4");
  const videoUrl = supabasePublicUrl(`${VIDEO_DIR}/${mp4Name}`);

  let thumbUrl = null;
  if (thumbnailUrl) {
    const tRes = await fetch(thumbnailUrl);
    if (tRes.ok) {
      const contentType = tRes.headers.get("content-type") || "image/jpeg";
      const ext = contentType.split("/")[1] || "jpg";
      const buf = Buffer.from(await tRes.arrayBuffer());
      const name = `${slug}-${stamp}-thumb.${ext}`;
      await uploadToSupabase(`${VIDEO_DIR}/${name}`, buf, contentType);
      thumbUrl = supabasePublicUrl(`${VIDEO_DIR}/${name}`);
    }
  }

  if (seo) {
    const seoJson = JSON.stringify({ ...seo, title, videoUrl, thumbUrl, renderedAt: new Date().toISOString() }, null, 2);
    await uploadToSupabase(`${VIDEO_DIR}/${slug}-${stamp}-seo.json`, seoJson, "application/json");
  }

  console.log(`[4/5] Done. videoUrl=${videoUrl}`);
  await writeResult(jobId, {
    status: "done",
    progress: 100,
    videoUrl,
    thumbnailUrl: thumbUrl,
    title,
    slug,
  });
}

main().catch(async (err) => {
  console.error("SHORT RENDER FAILED:", err);
  const jobId = process.argv[2];
  if (jobId) {
    try {
      await writeResult(jobId, {
        status: "failed",
        error: err?.message || String(err),
      });
    } catch (e2) {
      console.error("Falhou a escrever result.json:", e2);
    }
  }
  process.exit(1);
});
