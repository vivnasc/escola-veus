#!/usr/bin/env node
// Render de um vídeo Ancient Ground (~1h) a partir de um manifest JSON.
// Corre dentro do GitHub Actions; depende de ffmpeg/ffprobe no PATH e de Node 20+.
//
// Fluxo:
//   1. Descarrega manifest de Supabase
//   2. Descarrega clips + música para /tmp
//   3. Constrói a "base sequence" de clips únicos com xfade entre eles
//   4. Faz loop da base até targetDuration, mistura música por cima
//   5. Upload do MP4 final + thumbnail + sidecar SEO para Supabase
//   6. Escreve `render-jobs/<jobId>-result.json` com { status, videoUrl, error? }
//
// Uso:
//   node render.mjs <jobId>
//
// Env obrigatórias:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const BUCKET = "course-assets";
const JOB_DIR = "render-jobs";
const VIDEO_DIR = "youtube/videos";
const WORK_DIR = "/tmp/ag-render";

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

function runFfmpeg(args, label = "ffmpeg", onStderrLine) {
  return new Promise((resolve, reject) => {
    console.log(`\n[${label}] ffmpeg ${args.join(" ")}\n`);
    // Quando há onStderrLine precisamos de intercepar stderr para parse do
    // "time=HH:MM:SS.ms" e podermos reportar progresso em tempo real.
    const stderrMode = onStderrLine ? "pipe" : "inherit";
    const p = spawn("ffmpeg", ["-hide_banner", ...args], { stdio: ["ignore", "inherit", stderrMode] });
    if (onStderrLine && p.stderr) {
      let buf = "";
      p.stderr.on("data", (chunk) => {
        const text = chunk.toString();
        process.stderr.write(text);
        buf += text;
        // FFmpeg usa "\r" para actualizar a linha de status; partimos por ambos.
        let idx;
        while ((idx = buf.search(/[\r\n]/)) >= 0) {
          const line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.trim()) onStderrLine(line);
        }
      });
    }
    p.on("error", reject);
    p.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg saiu com código ${code}`));
    });
  });
}

// Parse "time=HH:MM:SS.ms" do stderr do FFmpeg e devolve segundos decorridos.
function parseFfmpegTime(line) {
  const m = line.match(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) return null;
  return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseFloat(m[3]);
}

async function writeResult(jobId, payload) {
  const body = JSON.stringify({ jobId, ...payload, updatedAt: new Date().toISOString() }, null, 2);
  await uploadToSupabase(`${JOB_DIR}/${jobId}-result.json`, body, "application/json");
}

async function main() {
  const jobId = process.argv[2];
  if (!jobId) throw new Error("Uso: render.mjs <jobId>");

  await mkdir(WORK_DIR, { recursive: true });
  await mkdir(path.join(WORK_DIR, "clips"), { recursive: true });
  await mkdir(path.join(WORK_DIR, "music"), { recursive: true });

  console.log(`[1/7] jobId=${jobId}`);
  const manifestUrl = supabasePublicUrl(`${JOB_DIR}/${jobId}.json`);
  console.log(`Manifest: ${manifestUrl}`);

  const mres = await fetch(manifestUrl);
  if (!mres.ok) throw new Error(`Manifest HTTP ${mres.status}`);
  const manifest = await mres.json();

  // Esperado:
  // {
  //   jobId, title, slug, clips[], music[], clipDuration,
  //   targetDuration, crossfade, trimEdge, fps,
  //   musicVolume, thumbnailUrl?, thumbnailDataUrl?, seo?
  // }
  const {
    title,
    slug,
    clips,
    music,
    clipDuration = 10,
    targetDuration = 3600,
    crossfade = 1.5,
    trimEdge = 0.3,
    fps = 30,
    musicVolume = 0.8,
    // Fades no output final (vídeo para preto + áudio para silêncio).
    // Default 3s à saída: suficiente para não parecer corte, nem tão longo
    // que desperdice conteúdo. Se quiseres desactivar, manda 0.
    fadeOut = 3,
    thumbnailUrl,
    thumbnailDataUrl,
    seo,
  } = manifest;

  if (!Array.isArray(clips) || clips.length === 0) throw new Error("clips[] vazio");
  if (!Array.isArray(music) || music.length === 0) throw new Error("music[] vazio");

  await writeResult(jobId, { status: "running", phase: "download", progress: 5 });

  console.log(`[2/7] Download ${clips.length} clips e ${music.length} faixas`);
  const clipPaths = [];
  for (let i = 0; i < clips.length; i++) {
    const dest = path.join(WORK_DIR, "clips", `clip-${String(i).padStart(3, "0")}.mp4`);
    await downloadTo(clips[i], dest);
    clipPaths.push(dest);
    if (i % 10 === 0) console.log(`  clip ${i + 1}/${clips.length}`);
  }
  const musicPaths = [];
  for (let i = 0; i < music.length; i++) {
    const dest = path.join(WORK_DIR, "music", `music-${i}.mp3`);
    await downloadTo(music[i], dest);
    musicPaths.push(dest);
  }

  await writeResult(jobId, { status: "running", phase: "base-sequence", progress: 25 });

  // ── PASSO 1: Base sequence ────────────────────────────────────────────────
  // Cada clip é recortado (trim nas pontas), normalizado (fps, resolução),
  // e encadeado com xfade(fade) de `crossfade` segundos entre clips.
  // Timeline cumulativa: clip N entra no offset = sum(effective lengths) - crossfade*N.
  console.log(`[3/7] Construir base sequence: ${clipPaths.length} clips, trim=${trimEdge}s, xfade=${crossfade}s`);
  const effective = clipDuration - 2 * trimEdge; // duração útil de cada clip após trim
  const stride = effective - crossfade;
  if (stride <= 0) throw new Error(`stride <= 0: crossfade ${crossfade} >= effective ${effective}`);

  const filters = [];
  const inputs = [];
  clipPaths.forEach((p, i) => {
    inputs.push("-i", p);
    filters.push(
      `[${i}:v]trim=${trimEdge}:${clipDuration - trimEdge},setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=${fps},format=yuv420p[v${i}]`
    );
  });

  // Cadeia xfade: [v0][v1]xfade=offset=stride[x1]; [x1][v2]xfade=offset=stride*2[x2]; ...
  let prev = "v0";
  for (let i = 1; i < clipPaths.length; i++) {
    const out = i === clipPaths.length - 1 ? "vbase" : `x${i}`;
    const offset = stride * i;
    filters.push(`[${prev}][v${i}]xfade=transition=fade:duration=${crossfade}:offset=${offset.toFixed(3)}[${out}]`);
    prev = out;
  }
  // Se só existe 1 clip, o "prev" é v0 — mapeia directamente.
  const baseMap = clipPaths.length === 1 ? "v0" : "vbase";

  const baseOut = path.join(WORK_DIR, "base.mp4");
  const baseDuration = clipPaths.length === 1
    ? effective
    : stride * (clipPaths.length - 1) + effective;
  console.log(`Base duration esperada: ${baseDuration.toFixed(2)}s`);

  // Progresso em tempo real durante a base sequence: mapeia entre 25% e 50%.
  let lastProgressWriteBase = 0;
  await runFfmpeg([
    "-y",
    ...inputs,
    "-filter_complex", filters.join(";"),
    "-map", `[${baseMap}]`,
    "-c:v", "libx264",
    "-preset", "medium",
    // CRF 23 + cap de bitrate evita que 1h a 1080p estoure os ~1.95GB do bucket.
    // Nature ambient comprime muito bem a este CRF — visualmente equivalente a CRF 20.
    "-crf", "23",
    "-maxrate", "4M",
    "-bufsize", "8M",
    "-pix_fmt", "yuv420p",
    "-r", String(fps),
    "-an",
    "-movflags", "+faststart",
    baseOut,
  ], "base", async (line) => {
    const t = parseFfmpegTime(line);
    if (t == null) return;
    const now = Date.now();
    if (now - lastProgressWriteBase < 5000) return; // max 1x/5s
    lastProgressWriteBase = now;
    const pct = Math.min(1, t / baseDuration);
    await writeResult(jobId, {
      status: "running",
      phase: "base-sequence",
      progress: 25 + Math.round(pct * 25), // 25 → 50
    }).catch(() => {});
  });

  await writeResult(jobId, { status: "running", phase: "music", progress: 50 });

  // ── PASSO 2a: Música combinada ────────────────────────────────────────────
  // Se houver mais do que uma faixa, concatena-as primeiro num único MP3
  // (`music-combined.mp3`). Depois fazemos stream_loop sobre esse ficheiro no
  // passo final — forma limpa de evitar que `concat` bloqueie em streams infinitas.
  console.log(`[4/6] Preparar música (${musicPaths.length} faixas)`);
  const combinedMusic = path.join(WORK_DIR, "music-combined.mp3");
  if (musicPaths.length === 1) {
    // Não precisamos concat — usamos directamente.
  } else {
    const musicInputs = musicPaths.flatMap((p) => ["-i", p]);
    const concatLabels = musicPaths.map((_, i) => `[${i}:a]`).join("");
    await runFfmpeg([
      "-y",
      ...musicInputs,
      "-filter_complex", `${concatLabels}concat=n=${musicPaths.length}:v=0:a=1[out]`,
      "-map", "[out]",
      "-c:a", "libmp3lame",
      "-b:a", "192k",
      combinedMusic,
    ], "music-concat");
  }
  const musicInput = musicPaths.length === 1 ? musicPaths[0] : combinedMusic;

  await writeResult(jobId, { status: "running", phase: "loop", progress: 65 });

  // ── PASSO 2b: Loop + música + fades ───────────────────────────────────────
  // Loop do base até targetDuration, música loopada, e fade-out final em
  // VÍDEO (para preto) e ÁUDIO (para silêncio). O fade obriga a re-encodar
  // o vídeo (perdemos o -c:v copy), mas garante uma saída suave em vez de
  // corte brusco. ~15 min extra no runner para 1h. Se fadeOut=0, voltamos
  // ao caminho rápido com -c:v copy.
  console.log(`[5/6] Loop base até ${targetDuration}s + música + fadeOut ${fadeOut}s`);
  const outPath = path.join(WORK_DIR, "output.mp4");

  const fadeStart = Math.max(0, targetDuration - fadeOut);
  const wantFade = fadeOut > 0;

  const audioFilter = wantFade
    ? `[1:a]volume=${musicVolume},afade=t=in:ss=0:d=2,afade=t=out:st=${fadeStart.toFixed(3)}:d=${fadeOut}[music]`
    : `[1:a]volume=${musicVolume},afade=t=in:ss=0:d=2[music]`;

  // Progresso em tempo real durante o loop/final encode: mapeia entre 65% e 85%.
  let lastProgressWriteLoop = 0;
  const onLoopProgress = async (line) => {
    const t = parseFfmpegTime(line);
    if (t == null) return;
    const now = Date.now();
    if (now - lastProgressWriteLoop < 5000) return;
    lastProgressWriteLoop = now;
    const pct = Math.min(1, t / targetDuration);
    await writeResult(jobId, {
      status: "running",
      phase: "loop",
      progress: 65 + Math.round(pct * 20), // 65 → 85
    }).catch(() => {});
  };

  if (wantFade) {
    // Re-encode com fade de vídeo para preto.
    // Preset veryfast + CRF 21 em vez de medium + CRF 23: 2-3x mais rápido
    // (1h re-encoda em ~25-35min em vez de 1-2h) com qualidade visualmente
    // equivalente para nature ambient. Maxrate 5M + bufsize 10M dá headroom
    // às zonas xfade (complexas) para não haver artifacts de baixo bitrate
    // nas junções — era o que estava a causar o "piscar" de volta.
    await runFfmpeg([
      "-y",
      "-stream_loop", "-1", "-i", baseOut,
      "-stream_loop", "-1", "-i", musicInput,
      "-filter_complex",
      `[0:v]fade=t=in:st=0:d=1,fade=t=out:st=${fadeStart.toFixed(3)}:d=${fadeOut}[vout];${audioFilter}`,
      "-map", "[vout]",
      "-map", "[music]",
      "-t", String(targetDuration),
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "21",
      "-maxrate", "5M",
      "-bufsize", "10M",
      "-pix_fmt", "yuv420p",
      "-r", String(fps),
      "-c:a", "aac",
      "-b:a", "192k",
      "-movflags", "+faststart",
      outPath,
    ], "final", onLoopProgress);
  } else {
    // Caminho rápido (sem fade): -c:v copy, só re-encoda áudio.
    await runFfmpeg([
      "-y",
      "-stream_loop", "-1", "-i", baseOut,
      "-stream_loop", "-1", "-i", musicInput,
      "-filter_complex", audioFilter,
      "-map", "0:v",
      "-map", "[music]",
      "-t", String(targetDuration),
      "-c:v", "copy",
      "-c:a", "aac",
      "-b:a", "192k",
      "-movflags", "+faststart",
      outPath,
    ], "final", onLoopProgress);
  }

  await writeResult(jobId, { status: "running", phase: "upload", progress: 85 });

  // ── PASSO 3: Upload ───────────────────────────────────────────────────────
  console.log(`[6/7] Upload MP4 para Supabase`);
  const stamp = Date.now();
  const mp4Name = `${slug || "video"}-${stamp}.mp4`;
  const mp4Buf = await readFile(outPath);
  await uploadToSupabase(`${VIDEO_DIR}/${mp4Name}`, mp4Buf, "video/mp4");
  const videoUrl = supabasePublicUrl(`${VIDEO_DIR}/${mp4Name}`);

  // Thumbnail (prioridade: dataURL composto > URL externa)
  let thumbUrl = null;
  if (thumbnailDataUrl && thumbnailDataUrl.startsWith("data:")) {
    const match = thumbnailDataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      const ext = match[1].split("/")[1] || "png";
      const buf = Buffer.from(match[2], "base64");
      const name = `${slug || "video"}-${stamp}-thumb.${ext}`;
      await uploadToSupabase(`${VIDEO_DIR}/${name}`, buf, match[1]);
      thumbUrl = supabasePublicUrl(`${VIDEO_DIR}/${name}`);
    }
  } else if (thumbnailUrl) {
    const tRes = await fetch(thumbnailUrl);
    if (tRes.ok) {
      const contentType = tRes.headers.get("content-type") || "image/png";
      const ext = contentType.split("/")[1] || "png";
      const buf = Buffer.from(await tRes.arrayBuffer());
      const name = `${slug || "video"}-${stamp}-thumb.${ext}`;
      await uploadToSupabase(`${VIDEO_DIR}/${name}`, buf, contentType);
      thumbUrl = supabasePublicUrl(`${VIDEO_DIR}/${name}`);
    }
  }

  if (seo) {
    const seoJson = JSON.stringify({ ...seo, title, videoUrl, thumbUrl, renderedAt: new Date().toISOString() }, null, 2);
    await uploadToSupabase(`${VIDEO_DIR}/${slug || "video"}-${stamp}-seo.json`, seoJson, "application/json");
  }

  console.log(`[7/7] Done. videoUrl=${videoUrl}`);
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
  console.error("RENDER FAILED:", err);
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
