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

// Brand intro/outro (mandala animated, same clip for both).
// Text is composited via drawtext — source MP4 itself has no text.
const INTRO_URL = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/youtube/brand/intro.mp4`;
const INTRO_DURATION = 5; // seconds
const OUTRO_DURATION = 5;
const BRAND_TEXT = "A ESCOLA DOS VÉUS";
const CTA_TEXT = "seteveus.space";
// Cream brand colour #F5F0E6. Drawtext accepts hex without #.
const TEXT_COLOR = "0xF5F0E6";
// Use fontconfig (Ubuntu GitHub Actions runners include libfontconfig + DejaVu Serif).
const TEXT_FONT = "Serif";

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
    musicVolume = 0.2,
    narrationVolume = 1.2,
    crossfade = 0.5,
    thumbnailUrl,
    seo,
  } = manifest;

  if (!Array.isArray(clips) || clips.length === 0) throw new Error("clips[] vazio");
  if (!narrationUrl) throw new Error("narrationUrl vazio");
  if (!Array.isArray(musicUrls) || musicUrls.length === 0) throw new Error("musicUrls[] vazio");

  const slug = rawSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "funil";

  await writeResult(jobId, { status: "running", phase: "download", progress: 10 });

  console.log(`[2/5] Download intro + ${clips.length} clips + narração + ${musicUrls.length} faixas música`);
  const introPath = path.join(WORK_DIR, "brand-intro.mp4");
  const outroPath = path.join(WORK_DIR, "brand-outro.mp4");
  const clipPaths = clips.map((_, i) => path.join(WORK_DIR, `clip-${i}.mp4`));
  const narrationPath = path.join(WORK_DIR, "narration.mp3");
  const musicPaths = musicUrls.map((_, i) => path.join(WORK_DIR, `music-${i}.mp3`));

  await Promise.all([
    downloadTo(INTRO_URL, introPath),
    downloadTo(INTRO_URL, outroPath), // same source, text differs via drawtext
    ...clips.map((url, i) => downloadTo(url, clipPaths[i])),
    downloadTo(narrationUrl, narrationPath),
    ...musicUrls.map((url, i) => downloadTo(url, musicPaths[i])),
  ]);

  await writeResult(jobId, { status: "running", phase: "render", progress: 25 });

  // ── Audio duration probe ─────────────────────────────────────────────────
  // Ensure video covers the full narration so it isn't cut brusco at the end.
  async function probeSeconds(file) {
    return new Promise((resolve) => {
      const p = spawn("ffprobe", [
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        file,
      ]);
      let out = "";
      p.stdout.on("data", (c) => (out += c.toString()));
      p.on("close", () => resolve(parseFloat(out.trim()) || 0));
      p.on("error", () => resolve(0));
    });
  }
  const narrSec = await probeSeconds(narrationPath);

  // ── Filter graph ──────────────────────────────────────────────────────────
  // Inputs ordered as: [intro][clip0]..[clipN-1][outro][narration][music0]..[musicM-1]
  //
  // Video chain:
  //   xfade(intro → clip0 → clip1 → ... → clipN-1 → outro) encadeados
  //   drawtext "A ESCOLA DOS VÉUS" visível 1s-4.5s (intro)
  //   drawtext "A ESCOLA DOS VÉUS" + "seteveus.space" no outro
  //   fade in 1s no início + fade out 2s no fim
  //
  // Audio:
  //   narração com adelay = (introDuration - crossfade) → começa durante fade
  //                       entre intro e clip0 (não esmaga a abertura do brand)
  //   música toca desde t=0 até ao fim, loop, ducking, fades
  const stride = clipDuration - crossfade;
  const clipsDuration = (clips.length - 1) * stride + clipDuration;
  // Offsets acumulados do xfade: intro (5-0.5=4.5), depois clips (stride), depois outro.
  const introStride = INTRO_DURATION - crossfade;
  const outroStride = OUTRO_DURATION - crossfade;
  const TAIL_PAD = 1.5;
  const bodyDuration = introStride + clipsDuration + outroStride; // tempo total de reprodução
  // Se narração for maior que o body, alargamos o outro via tpad no último xfade.
  const narrationStartAt = introStride; // quando a voz entra
  const totalDuration = Math.max(bodyDuration, narrationStartAt + narrSec + TAIL_PAD);
  const tailExtra = Math.max(0, totalDuration - bodyDuration);
  const FADE_IN = 1.0;
  const FADE_OUT = 2.0;

  // Video inputs: 0 = intro, 1..N = clips, N+1 = outro
  const introIdx = 0;
  const clipStartIdx = 1;
  const outroIdx = clips.length + 1;
  const lastIdx = outroIdx;

  // xfade exige que ambos os inputs tenham exactamente o mesmo size/sar/fps.
  // Intro/outro brand é 832x464 enquanto os clips Runway são 1280x720 — sem
  // normalizar, o xfade explode com "main parameters do not match".
  // Escalar tudo para 1280x720, manter aspect-ratio (letterbox se preciso),
  // SAR=1, fps=30. Target fixo = Runway output (os clips ficam 1:1).
  const TARGET_W = 1280;
  const TARGET_H = 720;
  const TARGET_FPS = 30;
  const normalize = (label) =>
    `scale=${TARGET_W}:${TARGET_H}:force_original_aspect_ratio=decrease,` +
    `pad=${TARGET_W}:${TARGET_H}:(ow-iw)/2:(oh-ih)/2:color=black,` +
    `setsar=1,fps=${TARGET_FPS},format=yuv420p[${label}]`;

  const videoFilters = [];
  videoFilters.push(`[${introIdx}:v]${normalize("vin")}`);
  for (let i = 0; i < clips.length; i++) {
    videoFilters.push(`[${clipStartIdx + i}:v]${normalize(`vc${i}`)}`);
  }
  videoFilters.push(`[${outroIdx}:v]${normalize("vout0")}`);

  let prev = "vin";

  // intro → clip0
  videoFilters.push(
    `[${prev}][vc0]xfade=transition=fade:duration=${crossfade}:offset=${introStride.toFixed(2)}[vx0]`
  );
  prev = "vx0";

  // clip0 → clip1 → ... → clipN-1
  for (let i = 1; i < clips.length; i++) {
    const out = `vx${i}`;
    const offset = introStride + i * stride;
    videoFilters.push(
      `[${prev}][vc${i}]xfade=transition=fade:duration=${crossfade}:offset=${offset.toFixed(2)}[${out}]`
    );
    prev = out;
  }

  // clipN-1 → outro
  const outroOffset = introStride + clipsDuration - crossfade;
  videoFilters.push(
    `[${prev}][vout0]xfade=transition=fade:duration=${crossfade}:offset=${outroOffset.toFixed(2)}[vchain]`
  );

  // Freeze frame extra se narração for maior que body
  if (tailExtra > 0.05) {
    videoFilters.push(`[vchain]tpad=stop_mode=clone:stop_duration=${tailExtra.toFixed(2)}[vcat]`);
  } else {
    videoFilters.push(`[vchain]null[vcat]`);
  }

  // Text overlays — intro + outro
  // Intro: BRAND_TEXT centrado abaixo do mandala, visível t=1..4.5
  const introTextStart = 1.0;
  const introTextEnd = INTRO_DURATION - 0.5;
  // Outro: BRAND_TEXT + CTA, visíveis no início do outro até quase o fim
  const outroVideoStart = totalDuration - OUTRO_DURATION;
  const outroTextStart = outroVideoStart + 0.5;
  const outroTextEnd = totalDuration - 0.3;

  // Separate filters with semicolons + intermediate labels — mais legível e
  // evita ambiguidades do parser do ffmpeg com vírgulas dentro de enable='between(t,X,Y)'.
  videoFilters.push(
    `[vcat]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf:text=${JSON.stringify(BRAND_TEXT)}:fontsize=72:fontcolor=${TEXT_COLOR}:x=(w-text_w)/2:y=h*0.82:enable='between(t\\,${introTextStart}\\,${introTextEnd})'[v1]`,
  );
  videoFilters.push(
    `[v1]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf:text=${JSON.stringify(BRAND_TEXT)}:fontsize=72:fontcolor=${TEXT_COLOR}:x=(w-text_w)/2:y=h*0.72:enable='between(t\\,${outroTextStart.toFixed(2)}\\,${outroTextEnd.toFixed(2)})'[v2]`,
  );
  videoFilters.push(
    `[v2]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf:text=${JSON.stringify(CTA_TEXT)}:fontsize=40:fontcolor=${TEXT_COLOR}:x=(w-text_w)/2:y=h*0.82:enable='between(t\\,${(outroTextStart + 0.5).toFixed(2)}\\,${outroTextEnd.toFixed(2)})'[vtext]`,
  );

  // Fade in/out final
  videoFilters.push(
    `[vtext]fade=t=in:st=0:d=${FADE_IN}[vfi];[vfi]fade=t=out:st=${(totalDuration - FADE_OUT).toFixed(2)}:d=${FADE_OUT}[vout]`
  );

  // Audio indices: narration = outroIdx+1, music[0..] = narrIdx+1..
  const narrationIdx = lastIdx + 1;
  const musicStartIdx = narrationIdx + 1;

  const musicInputs = musicPaths.map((_, i) => `[${musicStartIdx + i}:a]`).join("");
  const musicConcat = musicPaths.length > 1
    ? `${musicInputs}concat=n=${musicPaths.length}:v=0:a=1[musicraw]`
    : `[${musicStartIdx}:a]acopy[musicraw]`;

  const MUSIC_FADE_IN = 2.0;
  const MUSIC_FADE_OUT = 3.0;
  const NARR_FADE_IN = 0.5;
  const NARR_FADE_OUT = 0.8;
  const narrDelayMs = Math.round(narrationStartAt * 1000);

  const audioFilter = [
    musicConcat,
    `[musicraw]aloop=loop=-1:size=2e+09,atrim=0:${totalDuration.toFixed(2)},asetpts=N/SR/TB,volume=${musicVolume},afade=t=in:st=0:d=${MUSIC_FADE_IN},afade=t=out:st=${(totalDuration - MUSIC_FADE_OUT).toFixed(2)}:d=${MUSIC_FADE_OUT}[musicvol]`,
    `[${narrationIdx}:a]volume=${narrationVolume},afade=t=in:st=0:d=${NARR_FADE_IN},afade=t=out:st=${Math.max(0, narrSec - NARR_FADE_OUT).toFixed(2)}:d=${NARR_FADE_OUT},adelay=${narrDelayMs}|${narrDelayMs}[narrproc]`,
    `[narrproc]asplit=2[narr1][narr2]`,
    `[musicvol][narr1]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[musicduck]`,
    `[narr2][musicduck]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[aout]`,
  ].join(";");

  const filterComplex = [...videoFilters, audioFilter].join(";");

  const outPath = path.join(WORK_DIR, "out.mp4");
  await runFfmpeg([
    "-y",
    "-i", introPath,
    ...clipPaths.flatMap((p) => ["-i", p]),
    "-i", outroPath,
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
