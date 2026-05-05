#!/usr/bin/env node
// Render dum vídeo long-form Escola dos Véus (15-30 min, estilo contemplativo
// com inspiração Corvo Seco mas voz própria da Vivianne).
//
// Diferenças principais vs render-funil:
//   - Resolução 1920×1080 (não 1280×720) — long-form YouTube horizontal
//   - Cada clip tem duração próprio (no manifest), não fixo 10s
//   - Crossfades 1.0s (não 0.5s) — ritmo lento contemplativo
//   - Narração tipicamente 20-30 min (sem cap em 2 min)
//   - Brand intro/outro 5s opcional (mesma mandala do funil curto)
//   - Música em loop a baixo volume + ducking automático sob narração
//   - Se total clips < narração: último clip freeze-extends. Se total clips
//     > narração: visual continua silencioso com música no fim.
//
// Manifest (em course-assets/longo-render-jobs/<jobId>.json):
//   {
//     "title": string,
//     "slug": string,
//     "narrationUrl": string,           // MP3 da narração (concat dos chunks)
//     "clips": [{ "url": string, "durationSec": number }],
//     "musicUrls": string[],            // 1+ tracks Ancient Ground em loop
//     "musicVolume"?: number,           // default 0.15 (mais subtil que funil curto)
//     "narrationVolume"?: number,       // default 1.2
//     "crossfade"?: number,             // default 1.0s
//     "includeBrand"?: boolean          // default true (intro+outro 5s)
//   }
//
// Uso: node render.mjs <jobId>
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const BUCKET = "course-assets";
const JOB_DIR = "longo-render-jobs";
const VIDEO_DIR = "longos-videos";
const WORK_DIR = "/tmp/longo-render";

// Brand intro/outro (mesma mandala do funil — manda coerência editorial).
const INTRO_URL = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/youtube/brand/intro.mp4`;
const INTRO_DURATION = 5;
const OUTRO_DURATION = 5;
const BRAND_TEXT = "A ESCOLA DOS VÉUS";
const CTA_TEXT = "seteveus.space";
const TEXT_COLOR = "0xF5F0E6";

const TARGET_W = 1920;
const TARGET_H = 1080;
const TARGET_FPS = 30;

// Estilo das legendas (libass force_style). Igual ao do funil mas FontSize
// maior porque 1080p é mais alto que 720p — 32px em 1080p ≈ 24px em 720p.
//   PrimaryColour é BGR (não RGB!). #F5F0E6 (cream) -> &H00E6F0F5
//   BorderStyle=1 (outline + shadow). MarginV=80 dá faixa segura em 1080p.
//   Alignment=2 = bottom-center.
const DEFAULT_SUBTITLE_STYLE =
  "FontName=DejaVu Serif," +
  "FontSize=32," +
  "PrimaryColour=&H00E6F0F5," +
  "OutlineColour=&H00000000," +
  "BackColour=&H80000000," +
  "BorderStyle=1," +
  "Outline=2," +
  "Shadow=0," +
  "MarginV=80," +
  "Alignment=2";

// Aplica offset (segundos) aos timestamps SRT. SRT é gerada sobre o áudio
// cru (timestamps começam em 0) mas no vídeo final a narração arranca em
// narrationStartAt (= introStride) — fazemos shift antes de queimar.
function shiftSrtTimestamps(srtText, offsetSec) {
  return srtText.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, (_, h, m, s, ms) => {
    const total = +h * 3600 + +m * 60 + +s + +ms / 1000 + offsetSec;
    if (total < 0) return "00:00:00,000";
    const H = Math.floor(total / 3600);
    const M = Math.floor((total % 3600) / 60);
    const S = Math.floor(total % 60);
    const MS = Math.round((total - Math.floor(total)) * 1000);
    return (
      String(H).padStart(2, "0") +
      ":" +
      String(M).padStart(2, "0") +
      ":" +
      String(S).padStart(2, "0") +
      "," +
      String(MS).padStart(3, "0")
    );
  });
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta env ${name}`);
  return v;
}

function supabasePublicUrl(p) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${p}`;
}

async function downloadTo(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status} ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

async function uploadToSupabase(p, data, contentType) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${p}`;
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
    throw new Error(`Upload ${p} ${res.status}: ${txt.slice(0, 300)}`);
  }
}

function runFfmpeg(args, label = "ffmpeg") {
  return new Promise((resolve, reject) => {
    console.log(`\n[${label}] ffmpeg ${args.length} args (truncated for log)\n`);
    const p = spawn("ffmpeg", ["-hide_banner", ...args], {
      stdio: ["ignore", "inherit", "inherit"],
    });
    p.on("error", reject);
    p.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg saiu com código ${code}`));
    });
  });
}

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

async function writeResult(jobId, payload) {
  const body = JSON.stringify(
    { jobId, ...payload, updatedAt: new Date().toISOString() },
    null,
    2,
  );
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
    title = "longo",
    slug: rawSlug,
    narrationUrl,
    clips,
    musicUrls,
    musicVolume = 0.15,
    narrationVolume = 1.2,
    crossfade = 1.0,
    includeBrand = true,
    subtitlesUrl,    // SRT em Supabase (gerada por /generate-srt)
    subtitleStyle,   // override libass (string force_style)
  } = manifest;

  if (!narrationUrl) throw new Error("narrationUrl vazio");
  if (!Array.isArray(clips) || clips.length === 0) throw new Error("clips[] vazio");
  if (!Array.isArray(musicUrls) || musicUrls.length === 0) {
    throw new Error("musicUrls[] vazio");
  }

  const slug =
    rawSlug ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    "longo";

  await writeResult(jobId, { status: "running", phase: "download", progress: 5 });

  console.log(
    `[2/5] Download narração + ${clips.length} clips + ${musicUrls.length} tracks música${includeBrand ? " + intro/outro" : ""}`,
  );

  const narrationPath = path.join(WORK_DIR, "narration.mp3");
  const clipPaths = clips.map((_, i) => path.join(WORK_DIR, `clip-${i}.mp4`));
  const musicPaths = musicUrls.map((_, i) => path.join(WORK_DIR, `music-${i}.mp3`));
  const introPath = includeBrand ? path.join(WORK_DIR, "brand-intro.mp4") : null;
  const outroPath = includeBrand ? path.join(WORK_DIR, "brand-outro.mp4") : null;

  await Promise.all([
    downloadTo(narrationUrl, narrationPath),
    ...clips.map((c, i) => downloadTo(c.url, clipPaths[i])),
    ...musicUrls.map((url, i) => downloadTo(url, musicPaths[i])),
    ...(includeBrand
      ? [downloadTo(INTRO_URL, introPath), downloadTo(INTRO_URL, outroPath)]
      : []),
  ]);

  // Subtitles (opcional). Geradas pelo ElevenLabs Scribe — timestamps
  // arrancam em 0 (áudio cru). Como a narração entra em narrationStartAt
  // no vídeo final, fazemos shift abaixo (depois de calcular o offset).
  let subtitlesPath = null;
  if (subtitlesUrl) {
    try {
      const sres = await fetch(subtitlesUrl);
      if (!sres.ok) throw new Error(`SRT ${sres.status}`);
      subtitlesPath = path.join(WORK_DIR, "sub.srt");
      await writeFile(subtitlesPath, await sres.text());
    } catch (e) {
      console.warn(`Subtitles falhou (${e?.message || e}); SEM legendas.`);
      subtitlesPath = null;
    }
  }

  await writeResult(jobId, { status: "running", phase: "probe", progress: 15 });

  // Probe duração real de cada clip (manifest pode trazer estimativa, mas usar real)
  const clipDurations = await Promise.all(
    clipPaths.map(async (p, i) =>
      Number.isFinite(clips[i].durationSec) && clips[i].durationSec > 0
        ? Number(clips[i].durationSec)
        : await probeSeconds(p),
    ),
  );
  const narrSec = await probeSeconds(narrationPath);

  console.log(
    `[probe] narração=${narrSec.toFixed(1)}s · ` +
      `clips totais=${clipDurations.reduce((a, b) => a + b, 0).toFixed(1)}s ` +
      `(${clips.length} clips)`,
  );

  // ── Timeline ──────────────────────────────────────────────────────────
  // Estrutura linear:
  //   [intro brand 5s] (opcional) → [clip 0] → cf 1s → [clip 1] → cf 1s →
  //   ... → [clip N-1] → [outro brand 5s] (opcional)
  //
  // narrSec define o quanto a voz ocupa. Se total clips < narrSec, o último
  // clip estende-se via tpad (clone do último frame) para cobrir o resto.
  // Se total clips > narrSec, narração acaba antes do fim do vídeo (música
  // continua sob silêncio — efeito contemplativo intencional).
  const introStride = includeBrand ? INTRO_DURATION - crossfade : 0;
  const outroStride = includeBrand ? OUTRO_DURATION - crossfade : 0;
  // Cada clip ocupa (duração - crossfade) excepto o último que ocupa duração total
  const clipsBlockDuration = clipDurations.reduce((sum, d, i) => {
    return sum + (i === clipDurations.length - 1 ? d : d - crossfade);
  }, 0);
  const bodyDuration = introStride + clipsBlockDuration + outroStride;
  const narrationStartAt = introStride;
  const NARR_TAIL_PAD = 2.0;
  const totalDuration = Math.max(
    bodyDuration,
    narrationStartAt + narrSec + NARR_TAIL_PAD,
  );
  const tailExtra = Math.max(0, totalDuration - bodyDuration);

  // Aplica shift à SRT (timestamps eram relativos à narração crua a 0).
  if (subtitlesPath) {
    try {
      const raw = await readFile(subtitlesPath, "utf8");
      const shifted = shiftSrtTimestamps(raw, narrationStartAt);
      await writeFile(subtitlesPath, shifted);
      console.log(`[srt] shifted +${narrationStartAt.toFixed(2)}s`);
    } catch (e) {
      console.warn(`SRT shift falhou (${e?.message || e}); SEM legendas.`);
      subtitlesPath = null;
    }
  }

  console.log(
    `[timeline] body=${bodyDuration.toFixed(1)}s · ` +
      `narração começa em ${narrationStartAt.toFixed(1)}s · ` +
      `total=${totalDuration.toFixed(1)}s · ` +
      `tailExtra=${tailExtra.toFixed(1)}s`,
  );

  await writeResult(jobId, {
    status: "running",
    phase: "render",
    progress: 25,
    durationSec: totalDuration,
  });

  // ── Filter graph ──────────────────────────────────────────────────────
  // Inputs ordenados: [intro?][clip0]..[clipN-1][outro?][narration][music0]..[musicM-1]
  //
  // Normaliza tudo para 1920x1080 30fps com letterbox preto se preciso.
  const introIdx = includeBrand ? 0 : -1;
  const clipStartIdx = includeBrand ? 1 : 0;
  const outroIdx = includeBrand ? clipStartIdx + clips.length : -1;
  const lastVideoIdx = outroIdx >= 0 ? outroIdx : clipStartIdx + clips.length - 1;

  const normalize = (label) =>
    `scale=${TARGET_W}:${TARGET_H}:force_original_aspect_ratio=decrease,` +
    `pad=${TARGET_W}:${TARGET_H}:(ow-iw)/2:(oh-ih)/2:color=black,` +
    `setsar=1,fps=${TARGET_FPS},format=yuv420p[${label}]`;

  const videoFilters = [];
  if (includeBrand) videoFilters.push(`[${introIdx}:v]${normalize("vin")}`);
  for (let i = 0; i < clips.length; i++) {
    videoFilters.push(`[${clipStartIdx + i}:v]${normalize(`vc${i}`)}`);
  }
  if (includeBrand) videoFilters.push(`[${outroIdx}:v]${normalize("vout0")}`);

  // xfade chain: vin → vc0 → vc1 → ... → vout0
  let prev = includeBrand ? "vin" : "vc0";
  let xfadeOffset = 0;
  if (includeBrand) {
    videoFilters.push(
      `[vin][vc0]xfade=transition=fade:duration=${crossfade}:offset=${introStride.toFixed(2)}[vx0]`,
    );
    prev = "vx0";
    xfadeOffset = introStride;
  }
  // Entre clips
  const startClipI = includeBrand ? 1 : 1; // se !includeBrand, começa no clip 1 (clip 0 é "vc0" inicial)
  for (let i = startClipI; i < clips.length; i++) {
    const out = `vx${i}`;
    xfadeOffset += includeBrand
      ? clipDurations[i - 1] - crossfade
      : i === 1
        ? clipDurations[0] - crossfade
        : clipDurations[i - 1] - crossfade;
    videoFilters.push(
      `[${prev}][vc${i}]xfade=transition=fade:duration=${crossfade}:offset=${xfadeOffset.toFixed(2)}[${out}]`,
    );
    prev = out;
  }
  // último clip → outro
  if (includeBrand) {
    xfadeOffset += clipDurations[clips.length - 1] - crossfade;
    videoFilters.push(
      `[${prev}][vout0]xfade=transition=fade:duration=${crossfade}:offset=${xfadeOffset.toFixed(2)}[vchain]`,
    );
  } else {
    videoFilters.push(`[${prev}]null[vchain]`);
  }

  // Tail pad se narração maior que body
  if (tailExtra > 0.05) {
    videoFilters.push(
      `[vchain]tpad=stop_mode=clone:stop_duration=${tailExtra.toFixed(2)}[vcat]`,
    );
  } else {
    videoFilters.push(`[vchain]null[vcat]`);
  }

  // Brand text overlays (intro + outro) — só se includeBrand
  let videoOutLabel = "vcat";
  if (includeBrand) {
    const introTextStart = 1.0;
    const introTextEnd = INTRO_DURATION - 0.5;
    const outroVideoStart = totalDuration - OUTRO_DURATION;
    const outroTextStart = outroVideoStart + 0.5;
    const outroTextEnd = totalDuration - 0.3;

    videoFilters.push(
      `[vcat]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf:` +
        `text='${BRAND_TEXT}':fontsize=84:fontcolor=${TEXT_COLOR}:` +
        `x=(w-text_w)/2:y=h*0.82:` +
        `enable='between(t\\,${introTextStart}\\,${introTextEnd})'[v1]`,
    );
    videoFilters.push(
      `[v1]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf:` +
        `text='${BRAND_TEXT}':fontsize=84:fontcolor=${TEXT_COLOR}:` +
        `x=(w-text_w)/2:y=h*0.72:` +
        `enable='between(t\\,${outroTextStart.toFixed(2)}\\,${outroTextEnd.toFixed(2)})'[v2]`,
    );
    videoFilters.push(
      `[v2]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf:` +
        `text='${CTA_TEXT}':fontsize=48:fontcolor=${TEXT_COLOR}:` +
        `x=(w-text_w)/2:y=h*0.82:` +
        `enable='between(t\\,${(outroTextStart + 0.5).toFixed(2)}\\,${outroTextEnd.toFixed(2)})'[vtext]`,
    );
    videoOutLabel = "vtext";
  }

  // Subtitles burn-in (opcional). Escapa `:` no path porque é separador de
  // opções do filtro libass. SRT já tem timestamps shiftados em narrationStartAt.
  if (subtitlesPath) {
    const escapedPath = subtitlesPath.replace(/\\/g, "\\\\").replace(/:/g, "\\:");
    const style = (subtitleStyle || DEFAULT_SUBTITLE_STYLE).replace(/'/g, "");
    videoFilters.push(
      `[${videoOutLabel}]subtitles=${escapedPath}:force_style='${style}'[vsub]`,
    );
    videoOutLabel = "vsub";
  }

  // Fade in/out global
  const FADE_IN = 1.0;
  const FADE_OUT = 2.0;
  videoFilters.push(
    `[${videoOutLabel}]fade=t=in:st=0:d=${FADE_IN}[vfi];[vfi]fade=t=out:st=${(totalDuration - FADE_OUT).toFixed(2)}:d=${FADE_OUT}[vout]`,
  );

  // Audio: narração + música em loop com ducking
  const narrationIdx = lastVideoIdx + 1;
  const musicStartIdx = narrationIdx + 1;

  const musicInputs = musicPaths.map((_, i) => `[${musicStartIdx + i}:a]`).join("");
  const musicConcat =
    musicPaths.length > 1
      ? `${musicInputs}concat=n=${musicPaths.length}:v=0:a=1[musicraw]`
      : `[${musicStartIdx}:a]acopy[musicraw]`;

  const MUSIC_FADE_IN = 3.0;
  const MUSIC_FADE_OUT = 4.0;
  const NARR_FADE_IN = 0.8;
  const NARR_FADE_OUT = 1.2;
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
  const args = [
    "-y",
    ...(includeBrand ? ["-i", introPath] : []),
    ...clipPaths.flatMap((p) => ["-i", p]),
    ...(includeBrand ? ["-i", outroPath] : []),
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
  ];

  await runFfmpeg(args, "render");

  await writeResult(jobId, { status: "running", phase: "upload", progress: 90 });

  console.log(`[3/5] Upload MP4`);
  const stamp = Date.now();
  const mp4Name = `${slug}-${stamp}.mp4`;
  const mp4Buf = await readFile(outPath);
  await uploadToSupabase(`${VIDEO_DIR}/${mp4Name}`, mp4Buf, "video/mp4");
  const videoUrl = supabasePublicUrl(`${VIDEO_DIR}/${mp4Name}`);

  // Patch projecto longo com videoUrl + durationSec final
  try {
    const projUrl = supabasePublicUrl(`admin/longos/${slug}.json`);
    const r = await fetch(projUrl);
    if (r.ok) {
      const proj = await r.json();
      const updated = {
        ...proj,
        videoUrl,
        videoDurationSec: totalDuration,
        updatedAt: new Date().toISOString(),
      };
      await uploadToSupabase(
        `admin/longos/${slug}.json`,
        JSON.stringify(updated, null, 2),
        "application/json",
      );
    }
  } catch (e) {
    console.warn("Patch projecto falhou:", e);
  }

  console.log(`[4/5] Done: ${videoUrl}`);
  await writeResult(jobId, {
    status: "done",
    progress: 100,
    videoUrl,
    title,
    slug,
    durationSec: totalDuration,
  });
}

main().catch(async (err) => {
  console.error("LONGO RENDER FAILED:", err);
  const jobId = process.argv[2];
  if (jobId) {
    try {
      await writeResult(jobId, {
        status: "failed",
        error: err?.message || String(err),
      });
    } catch (e2) {
      console.error("Failed to write result:", e2);
    }
  }
  process.exit(1);
});
