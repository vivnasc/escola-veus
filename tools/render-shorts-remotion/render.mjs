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
import { exec as execCb } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execCb);

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

// ─── Scribe (ElevenLabs Speech-to-Text) com cache ────────────────────────

import crypto from "node:crypto";

function scribeCachePath(audioUrl) {
  const hash = crypto.createHash("sha1").update(audioUrl).digest("hex").slice(0, 16);
  return `scribe-cache/${hash}.json`;
}

async function tryFetchScribeCache(audioUrl) {
  const url = publicUrl(scribeCachePath(audioUrl));
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  try { return await res.json(); } catch { return null; }
}

async function writeScribeCache(audioUrl, payload) {
  await uploadFile(
    scribeCachePath(audioUrl),
    JSON.stringify(payload),
    "application/json",
  );
}

function langToScribeCode(lang) {
  if (!lang) return "por";
  const u = String(lang).toUpperCase();
  if (u === "EN" || u === "ENG" || u === "EN-US" || u === "EN-GB") return "eng";
  return "por";
}

async function callScribe(audioUrl, lang) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY ausente no GHA secrets.");

  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) throw new Error(`Download MP3 ${audioRes.status}`);
  const audioBuf = Buffer.from(await audioRes.arrayBuffer());

  const code = langToScribeCode(lang);
  const form = new FormData();
  const blob = new Blob([audioBuf], { type: "audio/mpeg" });
  form.append("file", blob, "track.mp3");
  form.append("model_id", "scribe_v1");
  form.append("language_code", code);
  form.append("timestamps_granularity", "word");
  form.append("tag_audio_events", "false");
  form.append("diarize", "false");
  console.log(`  · Scribe lang=${code}`);

  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
  });
  if (!res.ok) {
    const errTxt = await res.text().catch(() => "");
    throw new Error(`Scribe ${res.status}: ${errTxt.slice(0, 200)}`);
  }
  const data = await res.json();
  return Array.isArray(data.words) ? data.words : [];
}

/** ffprobe à URL do áudio (não requer download local — ffprobe lê via http).
 *  Devolve duração em segundos, ou null se falhar. */
async function probeAudioDurationSec(audioUrl) {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioUrl.replace(/"/g, '\\"')}"`;
    const { stdout } = await exec(cmd, { timeout: 60_000 });
    const sec = parseFloat(String(stdout).trim());
    if (!Number.isFinite(sec) || sec <= 0) return null;
    return sec;
  } catch (e) {
    console.log(`  ⚠ ffprobe falhou: ${(e && e.message ? e.message : e).slice(0, 200)}`);
    return null;
  }
}

function speakingWords(words) {
  return words.filter((w) =>
    w && w.type === "word" && typeof w.start === "number" && typeof w.end === "number" && w.text,
  );
}

function normalizeText(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function alignStanzas(stanzas, words, totalSec) {
  const speaking = speakingWords(words);
  if (speaking.length === 0 || stanzas.length === 0) {
    return uniformStanzas(stanzas, totalSec);
  }
  const wordList = speaking.map((w) => ({ ...w, norm: normalizeText(w.text) }));
  const result = [];
  let cursor = 0;
  for (let i = 0; i < stanzas.length; i++) {
    const stanza = stanzas[i];
    const tokens = normalizeText(stanza).split(" ").filter((t) => t.length > 1);
    if (tokens.length === 0) {
      result.push({ text: stanza, startSec: 0, endSec: 0 });
      continue;
    }
    let stanzaStart = -1, stanzaEnd = -1, matched = 0, tIdx = 0;
    for (let j = cursor; j < wordList.length && tIdx < tokens.length; j++) {
      if (wordList[j].norm === tokens[tIdx]) {
        if (stanzaStart < 0) stanzaStart = j;
        stanzaEnd = j;
        matched++;
        tIdx++;
      }
    }
    if (stanzaStart < 0 || matched < Math.ceil(tokens.length * 0.4)) {
      const prevEnd = result.length > 0 ? result[result.length - 1].endSec : 0;
      const remaining = stanzas.length - i;
      const remainingTime = Math.max(0, totalSec - 4 - prevEnd);
      const each = remainingTime / Math.max(1, remaining);
      result.push({
        text: stanza,
        startSec: prevEnd,
        endSec: Math.min(prevEnd + each, totalSec - 2),
      });
      continue;
    }
    result.push({
      text: stanza,
      startSec: wordList[stanzaStart].start,
      endSec: wordList[stanzaEnd].end,
    });
    cursor = stanzaEnd + 1;
  }
  return result;
}

function uniformStanzas(stanzas, totalSec) {
  const buffer = 2;
  const usable = Math.max(totalSec - buffer * 2, 1);
  const each = usable / stanzas.length;
  return stanzas.map((text, i) => ({
    text,
    startSec: buffer + i * each,
    endSec: buffer + (i + 1) * each,
  }));
}

/** Computa stanzaTimings + audioDurationSec, com cache em Supabase. */
async function ensureStanzaTimings(manifest) {
  if (!manifest.lyricsSync) return manifest;
  if (!manifest.syncedLyrics || manifest.syncedLyrics.length === 0) return manifest;
  if (manifest.stanzaTimings && manifest.stanzaTimings.length > 0) return manifest;

  console.log(`→ Scribe: a verificar cache para ${manifest.audioUrl.slice(-60)}`);
  let cached = await tryFetchScribeCache(manifest.audioUrl);
  if (cached) {
    console.log(`  ✓ cache hit (${cached.words?.length || 0} words)`);
  } else {
    console.log(`  · cache miss — a chamar Scribe (~$0.03)`);
    const words = await callScribe(manifest.audioUrl, manifest.lang || "PT");
    cached = { words, savedAt: new Date().toISOString() };
    await writeScribeCache(manifest.audioUrl, cached);
    console.log(`  ✓ Scribe ${words.length} words, gravado em cache`);
  }

  const speaking = speakingWords(cached.words);
  const lastEnd = speaking.length > 0 ? speaking[speaking.length - 1].end || 0 : 0;
  const audioDurationSec = lastEnd > 0 ? lastEnd + 2 : null;
  if (!audioDurationSec) return manifest;

  const stanzaTimings = alignStanzas(manifest.syncedLyrics, cached.words, audioDurationSec);
  console.log(`  → stanzaTimings: ${stanzaTimings.length} stanzas alinhadas`);

  // Para mode=full, ajusta durationSec à duração real do áudio.
  const durationSec = manifest.mode === "full" ? Math.ceil(audioDurationSec) : manifest.durationSec;

  // Para mode=clip Loranne, se temos chorusStanzaIdx, arranca o áudio
  // 1s antes do refrão e shifta as stanzaTimings para tempo relativo
  // (subtrai offset). A composição renderiza só o que cair dentro de
  // [0, durationSec=30].
  let audioStartFromSec = manifest.audioStartFromSec || 0;
  let adjustedTimings = stanzaTimings;
  let adjustedLyrics = manifest.syncedLyrics;
  if (
    manifest.mode === "clip" &&
    typeof manifest.chorusStanzaIdx === "number" &&
    manifest.chorusStanzaIdx >= 0 &&
    manifest.chorusStanzaIdx < stanzaTimings.length
  ) {
    const chorusStart = stanzaTimings[manifest.chorusStanzaIdx].startSec;
    const offset = Math.max(0, chorusStart - 1); // 1s lead-in
    audioStartFromSec = offset;
    // CRÍTICO: filtra ANTES de clampar. Stanzas pre-chorus shifted ficam
    // com startSec NEGATIVO — descartam-se. Sem isso, todas as pre-chorus
    // colapsavam em sec=0 e o renderer só mostrava uma "estática".
    adjustedTimings = stanzaTimings
      .map((t) => ({
        text: t.text,
        startSec: t.startSec - offset,
        endSec: t.endSec - offset,
      }))
      .filter((t) => t.startSec >= 0 && t.startSec < durationSec);
    adjustedLyrics = adjustedTimings.map((t) => t.text);
    console.log(`  → clip arranca em chorus: offset=${offset.toFixed(1)}s · ${adjustedTimings.length}/${stanzaTimings.length} stanzas mantidas`);
  }

  return {
    ...manifest,
    stanzaTimings: adjustedTimings,
    syncedLyrics: adjustedLyrics,
    audioStartFromSec,
    audioDurationSec,
    durationSec,
  };
}

/** Para mode=full, se ainda não temos duração real (ensureStanzaTimings só
 *  corre quando há Scribe), faz ffprobe à URL do MP3 para apanhar a duração
 *  exacta. Cobre AG full (instrumental, sem Scribe) e fallback Loranne. */
async function ensureFullDuration(manifest) {
  if (manifest.mode !== "full") return manifest;
  if (manifest.audioDurationSec && manifest.audioDurationSec > 0) return manifest;
  if (!manifest.audioUrl) return manifest;
  console.log(`→ ffprobe duração de ${manifest.audioUrl.slice(-60)}`);
  const sec = await probeAudioDurationSec(manifest.audioUrl);
  if (!sec) {
    console.log(`  ⚠ não foi possível probar — fica em ${manifest.durationSec}s`);
    return manifest;
  }
  const durationSec = Math.ceil(sec);
  console.log(`  → áudio real ${sec.toFixed(1)}s → durationSec=${durationSec}s`);
  return { ...manifest, audioDurationSec: durationSec, durationSec };
}

async function main() {
  console.log(`→ Job ${JOB_ID}`);

  // 1. Lê manifest
  const manifestUrl = publicUrl(`render-jobs/${JOB_ID}.json`);
  console.log(`→ A ler manifest ${manifestUrl}`);
  let manifest = await fetchJson(manifestUrl);
  console.log(`→ Manifest brand=${manifest.brand} variant=${manifest.motionVariant} mode=${manifest.mode}`);

  // 1b. Scribe + alinhamento (com cache) — só Loranne lyric video
  await updateProgress("rendering", 5, { title: manifest.title || manifest.trackLabel || JOB_ID });
  manifest = await ensureStanzaTimings(manifest);
  // 1c. Para mode=full sem audioDurationSec ainda (AG full, ou Loranne sem
  //     letras sincronizadas), ffprobe a duração real do MP3.
  manifest = await ensureFullDuration(manifest);

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
  // selectComposition devolve a duração registada no Root.tsx (30s clip
  // default). Para mode=full ou sempre que manifest.durationSec divergir,
  // override aqui — caso contrário renderMedia corta o vídeo a 30s.
  const fps = composition.fps || manifest.fps || 30;
  const targetSec = Number(manifest.durationSec) || 30;
  const targetFrames = Math.max(1, Math.round(targetSec * fps));
  if (targetFrames !== composition.durationInFrames) {
    console.log(`→ Override duration: ${composition.durationInFrames}f → ${targetFrames}f (${targetSec}s @ ${fps}fps)`);
    composition.durationInFrames = targetFrames;
  }
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
    renderVersion: manifest.renderVersion || null,
    durationSec: manifest.durationSec || null,
  });
  console.log(`✓ Done (v=${manifest.renderVersion || "n/a"} dur=${manifest.durationSec}s)`);
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
