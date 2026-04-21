#!/usr/bin/env node
// Render de um vídeo de Funil (Nomear) — clips + narração + música Ancient Ground.
// Mesmo padrão do render-ancient-ground e render-short: GitHub Actions runner,
// FFmpeg de sistema, polling via result.json em Supabase.
//
// Particular deste pipeline:
//   - xfade 0.5s entre clips (curto, vídeos são de ~2min)
//   - narração full volume + música duckada via sidechaincompress
//
// Uso:
//   node render.mjs <jobId>
//
// Env obrigatórias:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const BUCKET = "course-assets";
const JOB_DIR = "render-jobs";
const VIDEO_DIR = "youtube/funil-videos";
const WORK_DIR = "/tmp/funil-render";

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
    title = "funil-video",
    slug: rawSlug,
    clips,
    clipDuration = 10,
    narrationUrl,
    musicUrls,
    musicVolume = 0.15,
    crossfade = 0.5,
    thumbnailUrl,
    seo,
  } = manifest;

  if (!Array.isArray(clips) || clips.length === 0) throw new Error("clips[] vazio");
  if (!narrationUrl) throw new Error("narrationUrl vazio");
  if (!Array.isArray(musicUrls) || musicUrls.length === 0) throw new Error("musicUrls[] vazio");

  const slug = rawSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "funil";

  await writeResult(jobId, { status: "running", phase: "download", progress: 10 });

  console.log(`[2/5] Download ${clips.length} clips + narração + ${musicUrls.length} faixas música`);
  const clipPaths = clips.map((_, i) => path.join(WORK_DIR, `clip-${i}.mp4`));
  const narrationPath = path.join(WORK_DIR, "narration.mp3");
  const musicPaths = musicUrls.map((_, i) => path.join(WORK_DIR, `music-${i}.mp3`));

  await Promise.all([
    ...clips.map((url, i) => downloadTo(url, clipPaths[i])),
    downloadTo(narrationUrl, narrationPath),
    ...musicUrls.map((url, i) => downloadTo(url, musicPaths[i])),
  ]);

  await writeResult(jobId, { status: "running", phase: "render", progress: 25 });

  // ── Filter graph ──────────────────────────────────────────────────────────
  // Video: xfade encadeado entre clips
  // Audio: narração (100%) + música (concat → loop → volume → sidechain duck)
  //         → amix final
  const stride = clipDuration - crossfade;
  const totalDuration = (clips.length - 1) * stride + clipDuration;

  const videoFilters = [];
  if (clips.length === 1) {
    videoFilters.push(`[0:v]copy[vout]`);
  } else {
    let prev = "0:v";
    for (let i = 1; i < clips.length; i++) {
      const out = i === clips.length - 1 ? "vout" : `vx${i}`;
      const offset = i * stride;
      videoFilters.push(
        `[${prev}][${i}:v]xfade=transition=fade:duration=${crossfade}:offset=${offset.toFixed(2)}[${out}]`
      );
      prev = out;
    }
  }

  // Audio indices: narration = clips.length, music[0..] = clips.length+1..
  const narrationIdx = clips.length;
  const musicStartIdx = clips.length + 1;

  const musicInputs = musicPaths.map((_, i) => `[${musicStartIdx + i}:a]`).join("");
  const musicConcat = musicPaths.length > 1
    ? `${musicInputs}concat=n=${musicPaths.length}:v=0:a=1[musicraw]`
    : `[${musicStartIdx}:a]acopy[musicraw]`;

  const audioFilter = [
    musicConcat,
    `[musicraw]aloop=loop=-1:size=2e+09,atrim=0:${totalDuration.toFixed(2)},asetpts=N/SR/TB,volume=${musicVolume}[musicvol]`,
    `[${narrationIdx}:a]asplit=2[narr1][narr2]`,
    `[musicvol][narr1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[musicduck]`,
    `[narr2][musicduck]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[aout]`,
  ].join(";");

  const filterComplex = [...videoFilters, audioFilter].join(";");

  const outPath = path.join(WORK_DIR, "out.mp4");
  await runFfmpeg([
    "-y",
    ...clipPaths.flatMap((p) => ["-i", p]),
    "-i", narrationPath,
    ...musicPaths.flatMap((p) => ["-i", p]),
    "-filter_complex", filterComplex,
    "-map", "[vout]",
    "-map", "[aout]",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "192k",
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
    durationSec: totalDuration,
  });
}

main().catch(async (err) => {
  console.error("FUNIL RENDER FAILED:", err);
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
