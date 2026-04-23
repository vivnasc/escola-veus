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

// Corre ffprobe -show_format -show_streams e devolve duração/tamanho/bitrate
// + dimensões do primeiro stream de vídeo. Usamos isto no final do render
// para reportar à UI o que realmente saiu (e não só o que pedimos).
function ffprobe(filePath) {
  return new Promise((resolve, reject) => {
    const args = [
      "-v", "error",
      "-print_format", "json",
      "-show_format",
      "-show_streams",
      filePath,
    ];
    const p = spawn("ffprobe", args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    p.stdout.on("data", (c) => { out += c.toString(); });
    p.stderr.on("data", (c) => { err += c.toString(); });
    p.on("error", reject);
    p.on("exit", (code) => {
      if (code !== 0) return reject(new Error(`ffprobe saiu com código ${code}: ${err.slice(0, 200)}`));
      try {
        const json = JSON.parse(out);
        const vStream = (json.streams || []).find((s) => s.codec_type === "video");
        resolve({
          durationSec: json.format?.duration ? parseFloat(json.format.duration) : null,
          sizeBytes: json.format?.size ? parseInt(json.format.size, 10) : null,
          bitrateBps: json.format?.bit_rate ? parseInt(json.format.bit_rate, 10) : null,
          width: vStream?.width ?? null,
          height: vStream?.height ?? null,
        });
      } catch (e) {
        reject(e);
      }
    });
  });
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
    // Intro opcional prepended ao início: se introUrl for fornecido, download
    // + normalização + concat antes da base. Default 5s.
    introUrl = null,
    introDuration = 5,
    introText = "ANCIENT GROUND",
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

  // Intro opcional — descarrega e normaliza para 1920x1080 @ fps, yuv420p,
  // silencioso. Pré-normalizar garante que o concat no passo final não tem
  // problemas de resolução/codec mismatch com a base.
  let introPath = null;
  if (introUrl) {
    console.log(`[2b/7] Download + normalização do intro (${introDuration}s)${introText ? ` + texto "${introText}"` : ""}`);
    const rawIntro = path.join(WORK_DIR, "intro-raw.mp4");
    await downloadTo(introUrl, rawIntro);
    introPath = path.join(WORK_DIR, "intro.mp4");

    // Filter de vídeo: scale+pad → drawtext opcional com fade in/out suave.
    // O texto aparece ~1s após o início (quando o logo AG já está estabilizado)
    // e sai 0.5s antes do fim do intro para não chocar com a transição para os
    // nature clips. DejaVu Serif Bold vem de base no runner Ubuntu.
    let vfilter = `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=${fps},format=yuv420p`;
    if (introText && introText.trim()) {
      // Escape mínimo: só ':' e "'". Evitamos expressão complexa de alpha
      // (que partia o filter parser); usamos enable= + fontcolor@opacity
      // para simplicidade e robustez. Hard cut-in at 1s, hard cut-out 0.5s
      // antes do fim do intro.
      const safeText = introText
        .replace(/'/g, "\\'")
        .replace(/:/g, "\\:");
      const showFrom = 1.0;
      const showUntil = Math.max(showFrom + 1.5, introDuration - 0.5);
      vfilter +=
        `,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf` +
        `:text='${safeText}'` +
        `:fontsize=54` +
        `:fontcolor=white@0.92` +
        `:x=(w-text_w)/2` +
        `:y=h*0.82` +
        // Aspas simples agrupam o valor de `enable`, pelo que vírgulas dentro
        // delas SÃO literais. Escapá-las com `\,` parte o expression parser
        // do FFmpeg e faz o drawtext cair no fallback sem texto.
        `:enable='between(t,${showFrom},${showUntil})'`;
    }

    try {
      await runFfmpeg([
        "-y",
        "-i", rawIntro,
        "-t", String(introDuration),
        "-vf", vfilter,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-r", String(fps),
        "-an",
        "-movflags", "+faststart",
        introPath,
      ], "intro-normalize");
    } catch (err) {
      // Se o drawtext falhar (font missing, filter parser issue, etc.),
      // tenta de novo sem texto — melhor ter intro sem texto do que nada.
      if (introText && introText.trim()) {
        console.warn(`Intro drawtext falhou (${err?.message || err}); a re-tentar SEM texto.`);
        await runFfmpeg([
          "-y",
          "-i", rawIntro,
          "-t", String(introDuration),
          "-vf", `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=${fps},format=yuv420p`,
          "-c:v", "libx264",
          "-preset", "veryfast",
          "-crf", "18",
          "-pix_fmt", "yuv420p",
          "-r", String(fps),
          "-an",
          "-movflags", "+faststart",
          introPath,
        ], "intro-normalize-notext");
      } else {
        throw err;
      }
    }
  }

  await writeResult(jobId, { status: "running", phase: "base-sequence", progress: 25 });

  // ── PASSO 1: Base sequence ────────────────────────────────────────────────
  // Cada clip é recortado (trim nas pontas), normalizado (fps, resolução),
  // e encadeado com xfade(fade) de `crossfade` segundos entre clips.
  //
  // Para muitos clips (≥15) dividimos em batches de BATCH_SIZE processados
  // por ffmpeg separados. Cada processo tem filter_complex pequeno (10
  // inputs + 9 xfades em vez de 120+119), memória limpa entre batches, e
  // evita o "runner lost communication with the server" (OOM) que aconteceu
  // em renders de 120 clips. No fim, concat -c copy junta os sub-MP4s sem
  // re-encoding (stream copy, instantâneo).
  //
  // Nota: nos boundaries entre batches não há xfade — há um corte duro. Para
  // nature ambient (baixa variancia entre frames e movimento suave) isto é
  // visualmente imperceptível; o benefício (não morrer) justifica.
  console.log(`[3/7] Construir base sequence: ${clipPaths.length} clips, trim=${trimEdge}s, xfade=${crossfade}s`);
  const effective = clipDuration - 2 * trimEdge;
  const stride = effective - crossfade;
  if (stride <= 0) throw new Error(`stride <= 0: crossfade ${crossfade} >= effective ${effective}`);

  const BATCH_SIZE = 10;
  const needsBatching = clipPaths.length > 15;
  const baseOut = path.join(WORK_DIR, "base.mp4");

  // Duração esperada da base: mesmo com batches é (aproximadamente) a mesma
  // porque concat preserva a soma das durações dos sub-MP4s. (Nos boundaries
  // entre batches não se subtrai crossfade — ligeiramente mais longo.)
  const baseDuration = clipPaths.length === 1
    ? effective
    : stride * (clipPaths.length - 1) + effective;
  console.log(`Base duration esperada: ${baseDuration.toFixed(2)}s`);

  // Helper: faz encode de UM batch (ou do input todo se poucos clips).
  const encodeBatch = async (clips, outPath, progressLabel, onStderrLine) => {
    const filters = [];
    const inputs = [];
    clips.forEach((p, i) => {
      inputs.push("-i", p);
      filters.push(
        `[${i}:v]trim=${trimEdge}:${clipDuration - trimEdge},setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=${fps},format=yuv420p[v${i}]`
      );
    });
    let prev = "v0";
    for (let i = 1; i < clips.length; i++) {
      const out = i === clips.length - 1 ? "vbase" : `x${i}`;
      const offset = stride * i;
      filters.push(`[${prev}][v${i}]xfade=transition=fade:duration=${crossfade}:offset=${offset.toFixed(3)}[${out}]`);
      prev = out;
    }
    const mapLabel = clips.length === 1 ? "v0" : "vbase";
    await runFfmpeg([
      "-y",
      ...inputs,
      // -threads 2 + -filter_complex_threads 2: limita paralelismo para
      // caber em RAM do runner (~7GB) mesmo com xfade pesado.
      "-threads", "2",
      "-filter_complex", filters.join(";"),
      "-filter_complex_threads", "2",
      "-map", `[${mapLabel}]`,
      "-c:v", "libx264",
      // veryfast é seguro com batching (10 clips por processo = RAM limpa
      // entre batches) e comprime significativamente melhor que ultrafast.
      // Evita ficheiros acima dos 2 GiB do Supabase.
      "-preset", "veryfast",
      "-crf", "23",
      "-maxrate", "4M",
      "-bufsize", "8M",
      "-pix_fmt", "yuv420p",
      "-r", String(fps),
      "-an",
      "-movflags", "+faststart",
      outPath,
    ], progressLabel, onStderrLine);
  };

  let lastProgressWriteBase = 0;
  const reportBaseProgress = async (cumulativeSec) => {
    const now = Date.now();
    if (now - lastProgressWriteBase < 5000) return;
    lastProgressWriteBase = now;
    const pct = Math.min(1, cumulativeSec / baseDuration);
    await writeResult(jobId, {
      status: "running",
      phase: "base-sequence",
      progress: 25 + Math.round(pct * 25), // 25 → 50
    }).catch(() => {});
  };

  if (!needsBatching) {
    // Poucos clips → tudo num só processo (comportamento anterior).
    await encodeBatch(clipPaths, baseOut, "base", async (line) => {
      const t = parseFfmpegTime(line);
      if (t != null) await reportBaseProgress(t);
    });
  } else {
    // Muitos clips → batches. Calcula BATCH_SIZE ideal para ter batches
    // equilibrados: BATCH_SIZE=10 para 120 clips = 12 batches.
    const totalBatches = Math.ceil(clipPaths.length / BATCH_SIZE);
    console.log(`Batching: ${totalBatches} batches × até ${BATCH_SIZE} clips`);
    const subPaths = [];
    // Duração útil estimada por batch (para mapear progresso cumulativo).
    const batchEstDuration = (b) => {
      if (b.length === 1) return effective;
      return stride * (b.length - 1) + effective;
    };
    let cumulative = 0;
    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const batch = clipPaths.slice(start, start + BATCH_SIZE);
      const subPath = path.join(WORK_DIR, `sub-${String(i).padStart(3, "0")}.mp4`);
      const estThisBatch = batchEstDuration(batch);
      const baselineBefore = cumulative;
      console.log(`  Batch ${i + 1}/${totalBatches} (${batch.length} clips, ~${estThisBatch.toFixed(1)}s)`);
      await encodeBatch(batch, subPath, `base-batch-${i + 1}`, async (line) => {
        const t = parseFfmpegTime(line);
        if (t != null) await reportBaseProgress(baselineBefore + t);
      });
      cumulative += estThisBatch;
      subPaths.push(subPath);
    }
    // Concat sem re-encoding — todos os sub-MP4s têm os mesmos params.
    const listFile = path.join(WORK_DIR, "concat-list.txt");
    await writeFile(
      listFile,
      subPaths.map((p) => `file '${p}'`).join("\n"),
    );
    console.log(`Concat final de ${subPaths.length} sub-bases (stream copy)`);
    await runFfmpeg([
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", listFile,
      "-c", "copy",
      "-movflags", "+faststart",
      baseOut,
    ], "concat-base");
  }

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
  console.log(`[5/6] Loop base até ${targetDuration}s + música + fadeOut ${fadeOut}s${introPath ? ` + intro ${introDuration}s` : ""}`);
  const outPath = path.join(WORK_DIR, "output.mp4");

  const fadeStart = Math.max(0, targetDuration - fadeOut);
  const wantFade = fadeOut > 0;
  const hasIntro = !!introPath;

  // Índices dos inputs ffmpeg. Quando há intro, ele passa a ser [0]; caso
  // contrário a base é [0]. A música é sempre o último.
  const baseIdx = hasIntro ? 1 : 0;
  const musicIdx = hasIntro ? 2 : 1;

  const afadeOutFragment = wantFade ? `,afade=t=out:st=${fadeStart.toFixed(3)}:d=${fadeOut}` : "";

  // Filter de áudio:
  // - Sem intro: fade-in normal de 2s, volume musicVolume
  // - Com intro: volume sobe de 20% → 100% ao longo do introDuration (e depois
  //   mantém-se), para "despertar" em paralelo com o visual. O fade-in suave
  //   torna a entrada do logo não-intrusiva.
  const audioFilter = hasIntro
    ? `[${musicIdx}:a]volume='${musicVolume}*min(0.2+0.8*t/${introDuration},1)':eval=frame${afadeOutFragment}[music]`
    : `[${musicIdx}:a]volume=${musicVolume},afade=t=in:ss=0:d=2${afadeOutFragment}[music]`;

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

  // Filter de vídeo, conforme intro/fade activos.
  let videoFilter = null;
  if (hasIntro) {
    // Concat do intro (finito) + base-loop (infinito até -t).
    const concat = `[0:v][${baseIdx}:v]concat=n=2:v=1:a=0[vraw]`;
    videoFilter = wantFade
      ? `${concat};[vraw]fade=t=out:st=${fadeStart.toFixed(3)}:d=${fadeOut}[vout]`
      : `${concat};[vraw]null[vout]`;
  } else if (wantFade) {
    videoFilter = `[${baseIdx}:v]fade=t=in:st=0:d=1,fade=t=out:st=${fadeStart.toFixed(3)}:d=${fadeOut}[vout]`;
  }
  // else: vídeo copy, sem filter

  const needsReencode = hasIntro || wantFade;

  const inputsFinal = [];
  if (hasIntro) inputsFinal.push("-i", introPath);
  inputsFinal.push("-stream_loop", "-1", "-i", baseOut);
  inputsFinal.push("-stream_loop", "-1", "-i", musicInput);

  if (needsReencode) {
    // Re-encode do output final (intro concat + fade).
    // Preset veryfast + CRF 21: 2-3x mais rápido que medium com qualidade
    // equivalente para nature ambient. Maxrate 5M evita artifacts nas junções.
    const filterComplex = videoFilter ? `${videoFilter};${audioFilter}` : audioFilter;
    await runFfmpeg([
      "-y",
      ...inputsFinal,
      // Limita threads globais e do filter_complex — evita OOM do runner.
      "-threads", "2",
      "-filter_complex", filterComplex,
      "-filter_complex_threads", "2",
      "-map", "[vout]",
      "-map", "[music]",
      "-t", String(targetDuration),
      "-c:v", "libx264",
      "-preset", "veryfast",
      // CRF 23 + maxrate 4M: para 1h a 1080p, teto teórico = 4M × 3600 = 1.8 GB.
      // Deixa margem segura abaixo do limite 2 GiB do Supabase. Antes, com
      // CRF 21 + maxrate 5M, vídeos com mais variância (ex: plantas) chegavam
      // a 2.26 GB e eram rejeitados no upload.
      "-crf", "23",
      "-maxrate", "4M",
      "-bufsize", "8M",
      "-pix_fmt", "yuv420p",
      "-r", String(fps),
      "-c:a", "aac",
      "-b:a", "192k",
      "-movflags", "+faststart",
      outPath,
    ], "final", onLoopProgress);
  } else {
    // Caminho rápido (sem intro, sem fade): -c:v copy, só re-encoda áudio.
    await runFfmpeg([
      "-y",
      ...inputsFinal,
      "-filter_complex", audioFilter,
      "-map", `${baseIdx}:v`,
      "-map", "[music]",
      "-t", String(targetDuration),
      "-c:v", "copy",
      "-c:a", "aac",
      "-b:a", "192k",
      "-movflags", "+faststart",
      outPath,
    ], "final", onLoopProgress);
  }

  // ffprobe do output para reportar duração real + tamanho à UI. Se o probe
  // falhar, seguimos em frente (métricas ficam null) — não queremos perder
  // um render de 1h por causa disto.
  let probe = null;
  try {
    probe = await ffprobe(outPath);
    console.log(
      `Output: ${probe.durationSec?.toFixed(2)}s · ${(probe.sizeBytes / 1e6).toFixed(1)} MB · ${probe.width}x${probe.height} @ ${(probe.bitrateBps / 1e6).toFixed(2)} Mbps`
    );
  } catch (e) {
    console.warn(`ffprobe falhou: ${e?.message || e}`);
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
    const seoJson = JSON.stringify(
      {
        ...seo,
        title,
        videoUrl,
        thumbUrl,
        renderedAt: new Date().toISOString(),
        durationSec: probe?.durationSec ?? null,
        sizeBytes: probe?.sizeBytes ?? null,
        width: probe?.width ?? null,
        height: probe?.height ?? null,
      },
      null,
      2
    );
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
    durationSec: probe?.durationSec ?? null,
    sizeBytes: probe?.sizeBytes ?? null,
    width: probe?.width ?? null,
    height: probe?.height ?? null,
    bitrateBps: probe?.bitrateBps ?? null,
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
