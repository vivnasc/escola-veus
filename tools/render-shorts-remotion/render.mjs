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
import { cpus } from "node:os";
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

/** Cache para Forced Alignment depende de áudio E texto (se a letra
 *  muda, alinhamento muda). Hash combina ambos. */
function forcedAlignCachePath(audioUrl, text) {
  const hash = crypto
    .createHash("sha1")
    .update(audioUrl + "\0" + text)
    .digest("hex")
    .slice(0, 16);
  return `forced-align-cache/${hash}.json`;
}

async function tryFetchForcedAlignCache(audioUrl, text) {
  const url = publicUrl(forcedAlignCachePath(audioUrl, text));
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  try { return await res.json(); } catch { return null; }
}

async function writeForcedAlignCache(audioUrl, text, payload) {
  await uploadFile(
    forcedAlignCachePath(audioUrl, text),
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

/** ElevenLabs Forced Alignment — dá-lhe áudio + letra conhecida, devolve
 *  timestamps reais de cada palavra DA LETRA (não transcrição). É o tool
 *  certo para sincronização de karaoke; substitui o `callScribe` quando
 *  temos as letras (sempre o caso em Loranne lyric video).
 *  Endpoint: POST /v1/forced-alignment
 *  Body: multipart { file: audio, text: letra inteira }
 *  Response: { words: [{text, start, end, loss}], characters, loss } */
async function callForcedAlignment(audioUrl, text) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY ausente no GHA secrets.");

  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) throw new Error(`Download MP3 ${audioRes.status}`);
  const audioBuf = Buffer.from(await audioRes.arrayBuffer());

  const form = new FormData();
  const blob = new Blob([audioBuf], { type: "audio/mpeg" });
  form.append("file", blob, "track.mp3");
  form.append("text", text);
  console.log(`  · Forced Alignment text=${text.length} chars`);

  const res = await fetch("https://api.elevenlabs.io/v1/forced-alignment", {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
  });
  if (!res.ok) {
    const errTxt = await res.text().catch(() => "");
    throw new Error(`Forced Alignment ${res.status}: ${errTxt.slice(0, 200)}`);
  }
  const data = await res.json();
  // Normaliza para o formato do Scribe (type+text+start+end). FA devolve
  // `{text, start, end, loss}` por palavra; sem `type` o `speakingWords` e
  // o `wordsToSrt` filtravam tudo fora. Adicionamos `type: "word"`.
  const words = Array.isArray(data.words)
    ? data.words
        .filter((w) => w && typeof w.start === "number" && typeof w.end === "number" && w.text)
        .map((w) => ({ ...w, type: "word" }))
    : [];
  return {
    words,
    loss: typeof data.loss === "number" ? data.loss : null,
  };
}

/** Carrega palavras alinhadas para o áudio do manifest. Estratégia:
 *   1. Se manifest tem `syncedLyrics`, prefere Forced Alignment (FA) — junta
 *      todas as stanzas em texto, alinhamento determinístico vs. transcrição
 *      adivinhada. Imune a falhas Scribe em vocal abafado/EN (caso Cold
 *      Country: Scribe devolvia 2 words "nbw" para áudio house).
 *   2. Cache FA por hash(audioUrl + text) — se a letra muda, recachea.
 *   3. Se FA falhar (rede, API, áudio inválido), cai para Scribe com sanity
 *      check (descarta cache podre < expectedMinWords).
 *  Returns: `{ words, source: "fa" | "scribe" }` ou `null` se ambos falharem. */
async function getAlignedWords(manifest) {
  const expectedMinWords = Math.max(10, (manifest.syncedLyrics?.length || 0) * 3);
  const text = (manifest.syncedLyrics || []).join("\n\n").trim();

  if (text) {
    try {
      console.log(`→ Forced Alignment: a verificar cache para ${manifest.audioUrl.slice(-60)} (${text.length} chars)`);
      let cached = await tryFetchForcedAlignCache(manifest.audioUrl, text);
      if (cached && (cached.words?.length || 0) < expectedMinWords) {
        console.log(`  ⚠ cache FA podre (${cached.words?.length || 0} words < ${expectedMinWords}) — re-chamar FA`);
        cached = null;
      }
      if (cached) {
        console.log(`  ✓ cache FA hit (${cached.words?.length || 0} words${cached.loss != null ? `, loss=${cached.loss.toFixed(3)}` : ""})`);
      } else {
        console.log(`  · cache miss — a chamar Forced Alignment (~$0.001)`);
        const { words, loss } = await callForcedAlignment(manifest.audioUrl, text);
        if ((words?.length || 0) < expectedMinWords) {
          throw new Error(`FA devolveu ${words?.length || 0} words < ${expectedMinWords}`);
        }
        cached = { words, loss, savedAt: new Date().toISOString() };
        await writeForcedAlignCache(manifest.audioUrl, text, cached);
        console.log(`  ✓ FA ${words.length} words${loss != null ? ` (loss=${loss.toFixed(3)})` : ""}, gravado em cache`);
      }
      return { words: cached.words, source: "fa" };
    } catch (e) {
      console.log(`  ⚠ FA falhou (${e.message?.slice(0, 200) || e}) — fallback para Scribe`);
    }
  }

  console.log(`→ Scribe: a verificar cache para ${manifest.audioUrl.slice(-60)}`);
  let cached = await tryFetchScribeCache(manifest.audioUrl);
  // Sanity-check (ver Cold Country bug, commit cc7f33b): cache pode estar
  // corrompido por uma run antiga em que Scribe devolveu lixo.
  if (cached && (cached.words?.length || 0) < expectedMinWords) {
    console.log(`  ⚠ cache Scribe podre (${cached.words?.length || 0} words < ${expectedMinWords}) — re-chamar Scribe`);
    cached = null;
  }
  if (cached) {
    console.log(`  ✓ cache Scribe hit (${cached.words?.length || 0} words)`);
  } else {
    console.log(`  · cache miss — a chamar Scribe (~$0.03)`);
    const words = await callScribe(manifest.audioUrl, manifest.lang || "PT");
    cached = { words, savedAt: new Date().toISOString() };
    await writeScribeCache(manifest.audioUrl, cached);
    console.log(`  ✓ Scribe ${words.length} words, gravado em cache`);
  }
  return { words: cached.words, source: "scribe" };
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
  console.log(`  → Scribe: total=${words.length} words, speaking=${speaking.length}`);
  if (speaking.length === 0 || stanzas.length === 0) {
    console.log(`  ⚠ sem speaking words — uniform fallback`);
    return uniformStanzas(stanzas, totalSec);
  }
  const wordList = speaking.map((w) => ({ ...w, norm: normalizeText(w.text) }));
  console.log(`  → 10 primeiras Scribe: "${wordList.slice(0, 10).map(w => w.norm).join(" ")}"`);
  const result = [];
  let cursor = 0;
  let successCount = 0;

  for (let i = 0; i < stanzas.length; i++) {
    const stanza = stanzas[i];
    // Tokens ≥3 chars — evita falsos positivos de "a"/"o"/"de" que aparecem
    // em qualquer transcrição e poluem a contagem de matches.
    const tokens = normalizeText(stanza).split(" ").filter((t) => t.length >= 3);
    if (tokens.length === 0) {
      result.push({ text: stanza, startSec: -1, endSec: -1, _failed: true });
      continue;
    }
    let stanzaStart = -1, stanzaEnd = -1, matched = 0, tIdx = 0;
    let lastMatchJ = cursor;
    for (let j = cursor; j < wordList.length && tIdx < tokens.length; j++) {
      if (wordList[j].norm === tokens[tIdx]) {
        if (stanzaStart < 0) stanzaStart = j;
        stanzaEnd = j;
        matched++;
        tIdx++;
        lastMatchJ = j;
        continue;
      }
      // Token encalhado: se já scaneamos 6+ Scribe words sem match,
      // assume mistranscrição/improvisação da cantora e SALTA esse token
      // lírico. Sem este escape o resto da stanza inteira ficava bloqueado.
      if (j - lastMatchJ > 6 && tIdx < tokens.length - 1) {
        tIdx++;
        if (wordList[j].norm === tokens[tIdx]) {
          if (stanzaStart < 0) stanzaStart = j;
          stanzaEnd = j;
          matched++;
          tIdx++;
          lastMatchJ = j;
        }
      }
    }
    const pct = (matched / tokens.length * 100).toFixed(0);
    const startStr = stanzaStart >= 0 ? `${wordList[stanzaStart].start.toFixed(1)}s` : "—";
    console.log(`  · stanza[${i}] tokens=${tokens.length} matched=${matched} (${pct}%) start=${startStr}`);
    // Threshold per-stanza: 25% (era 40%). Permite stanzas com Scribe
    // parcialmente errada a contribuírem para o alinhamento global.
    if (stanzaStart < 0 || matched < Math.ceil(tokens.length * 0.25)) {
      result.push({ text: stanza, startSec: -1, endSec: -1, _failed: true });
      // Cursor APENAS pode avançar — nunca recuar. Sem max(), uma stanza
      // falhada após uma stanza alinhada perto do fim do áudio fazia o
      // cursor saltar para uma posição PROPORCIONAL ANTERIOR, permitindo
      // que stanzas posteriores casassem em wordlist[j] com timestamps
      // ANTES da stanza anterior → timings não-monotonicos no array.
      const propCursor = Math.round(((i + 1) / stanzas.length) * wordList.length);
      cursor = Math.min(wordList.length - 1, Math.max(cursor, propCursor));
      continue;
    }
    result.push({
      text: stanza,
      startSec: wordList[stanzaStart].start,
      endSec: Math.max(wordList[stanzaStart].start + 0.5, wordList[stanzaEnd].end),
    });
    cursor = stanzaEnd + 1;
    successCount++;
  }

  const successRate = successCount / stanzas.length;
  console.log(`  → alignStanzas TOTAL: ${successCount}/${stanzas.length} stanzas alinhadas (${(successRate*100).toFixed(0)}%)`);

  // Threshold global: 30% (era 70%). Se ≥30% das stanzas têm timing real,
  // usa esses timings + interpola o resto (preenche entre vizinhos válidos).
  // O fallback uniformStanzas (sem sync) só dispara para Scribe catastrófico.
  if (successRate < 0.3) {
    console.log(`  ⚠ alinhamento insuficiente (<30%) — uniform fallback ${totalSec.toFixed(0)}s`);
    return uniformStanzas(stanzas, totalSec);
  }

  // Preenche falhas restantes com tempo médio entre vizinhos válidos.
  for (let i = 0; i < result.length; i++) {
    if (!result[i]._failed) continue;
    const prevValid = result.slice(0, i).reverse().find((r) => !r._failed);
    const nextValid = result.slice(i + 1).find((r) => !r._failed);
    const startSec = prevValid?.endSec ?? 0;
    const endSec = nextValid?.startSec ?? totalSec - 1;
    const each = (endSec - startSec) / 2;
    result[i] = {
      text: result[i].text,
      startSec,
      endSec: startSec + each,
    };
  }

  // Garante monotonia + sem zero-width
  for (let i = 1; i < result.length; i++) {
    if (result[i].startSec < result[i - 1].endSec) {
      result[i].startSec = result[i - 1].endSec;
    }
    if (result[i].endSec <= result[i].startSec) {
      result[i].endSec = result[i].startSec + 0.5;
    }
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

// ===== SRT utilities (mesma lógica do generate-srt do funil) =====

function fmtSrtTime(seconds) {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.round((s - Math.floor(s)) * 1000);
  return (
    String(h).padStart(2, "0") + ":" +
    String(m).padStart(2, "0") + ":" +
    String(sec).padStart(2, "0") + "," +
    String(ms).padStart(3, "0")
  );
}

/** Agrupa Scribe words em linhas SRT.
 *  Quebra quando: gap ≥ 0.8s OU 10+ palavras OU 4s OU pontuação final.
 *  Aplica offset (shift) e maxSec (filter) para clips com chorus-start.
 *  Mesmo padrão do generate-srt do funil. */
function wordsToSrt(words, offsetSec, maxSec) {
  const speaking = (words || []).filter(
    (w) => w && w.type === "word" && typeof w.start === "number" && typeof w.end === "number" && w.text,
  );
  if (speaking.length === 0) return "";

  const lines = [];
  let buf = [];
  let bufStart = 0;
  let prevEnd = 0;

  const flush = () => {
    if (buf.length === 0) return;
    const text = buf.map((w) => w.text).join(" ").replace(/\s+([.,!?;:])/g, "$1");
    lines.push({ start: bufStart, end: prevEnd, text });
    buf = [];
  };

  for (const w of speaking) {
    const wStart = w.start - offsetSec;
    const wEnd = w.end - offsetSec;
    if (wEnd < 0) continue;                  // antes do chorus shift
    if (maxSec != null && wStart > maxSec) break;  // depois do clip de 30s
    const adjustedStart = Math.max(0, wStart);
    const gap = buf.length === 0 ? 0 : adjustedStart - prevEnd;
    const lineDuration = buf.length === 0 ? 0 : wEnd - bufStart;
    const lastWordEnded = buf.length > 0 && /[.!?:]$/.test(buf[buf.length - 1].text);
    const shouldBreak = buf.length > 0 && (gap >= 0.8 || buf.length >= 10 || lineDuration >= 4 || lastWordEnded);
    if (shouldBreak) flush();
    if (buf.length === 0) bufStart = adjustedStart;
    buf.push({ ...w, start: adjustedStart, end: wEnd });
    prevEnd = wEnd;
  }
  flush();

  return lines
    .map((l, i) => `${i + 1}\n${fmtSrtTime(l.start)} --> ${fmtSrtTime(l.end)}\n${l.text.trim()}\n`)
    .join("\n");
}

/** Estilo libass elegante para Loranne shorts. Serif italic dourado
 *  escola-dourado (#C9A96E ↔ BGR &H006EA9C9) — coerência com o tema da
 *  marca. Tamanho reduzido (22pt) para respirar mais em 1080×1920.
 *  Override via manifest.subtitleStyle. */
const DEFAULT_SUBTITLE_STYLE =
  "FontName=Liberation Serif," +
  "FontSize=22," +
  "Italic=1," +
  "PrimaryColour=&H006EA9C9," +    // escola-dourado #C9A96E (BGR)
  "OutlineColour=&H00000000," +    // outline preto subtil para readability
  "BorderStyle=1," +               // 1 = outline+shadow, 3 = caixa opaca (não)
  "Outline=1," +                   // 1px outline (subtil, não tira elegância)
  "Shadow=1," +                    // 1px shadow (apenas para contraste)
  "Alignment=2," +                 // bottom-center
  "MarginV=120";                   // 120px do fundo (respira mais que funil)

// ===== ASS karaoke (opt-in via manifest.karaokeMode === true) =====

function fmtAssTime(seconds) {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const cs = Math.round((s - Math.floor(s)) * 100);
  return (
    String(h) + ":" +
    String(m).padStart(2, "0") + ":" +
    String(sec).padStart(2, "0") + "." +
    String(cs).padStart(2, "0")
  );
}

/** Header ASS com Style "Karaoke" — SecondaryColour é o estado inicial
 *  (ainda-não-cantado, cinza mute) e PrimaryColour o estado pós-fill
 *  (dourado escola, BGR &H006EA9C9). Tag \K em cada palavra preenche da
 *  secondary para a primary durante <centisecs>. */
function buildAssHeader() {
  return [
    "[Script Info]",
    "ScriptType: v4.00+",
    "PlayResX: 1080",
    "PlayResY: 1920",
    "ScaledBorderAndShadow: yes",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    // Primary = cantada (dourado #C9A96E BGR &H006EA9C9). Secondary = por-cantar (cinza claro &H00B0B0B0). Outline = preto.
    "Style: Karaoke,Liberation Serif,22,&H006EA9C9,&H00B0B0B0,&H00000000,&H00000000,0,1,0,0,100,100,0,0,1,1,1,2,40,40,120,1",
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
  ].join("\n");
}

/** Escapa texto para Dialogue ASS — { e } são reservados para tags. */
function escapeAssText(s) {
  return String(s || "").replace(/\\/g, "\\\\").replace(/\{/g, "\\{").replace(/\}/g, "\\}");
}

/** Agrupa Scribe words em linhas (mesma heurística do wordsToSrt) e
 *  emite Dialogue ASS com {\K<centisecs>} por palavra. \K = smooth fill
 *  (cinematográfico — encha gradualmente, não pop). Aplica offset/maxSec
 *  como o wordsToSrt. */
function wordsToAss(words, offsetSec, maxSec) {
  const speaking = (words || []).filter(
    (w) => w && w.type === "word" && typeof w.start === "number" && typeof w.end === "number" && w.text,
  );
  if (speaking.length === 0) return "";

  const lines = [];
  let buf = [];
  let bufStart = 0;
  let prevEnd = 0;

  const flush = () => {
    if (buf.length === 0) return;
    lines.push({ start: bufStart, end: prevEnd, words: buf.slice() });
    buf = [];
  };

  for (const w of speaking) {
    const wStart = w.start - offsetSec;
    const wEnd = w.end - offsetSec;
    if (wEnd < 0) continue;
    if (maxSec != null && wStart > maxSec) break;
    const adjustedStart = Math.max(0, wStart);
    const gap = buf.length === 0 ? 0 : adjustedStart - prevEnd;
    const lineDuration = buf.length === 0 ? 0 : wEnd - bufStart;
    const lastWordEnded = buf.length > 0 && /[.!?:]$/.test(buf[buf.length - 1].text);
    const shouldBreak = buf.length > 0 && (gap >= 0.8 || buf.length >= 10 || lineDuration >= 4 || lastWordEnded);
    if (shouldBreak) flush();
    if (buf.length === 0) bufStart = adjustedStart;
    buf.push({ text: w.text, start: adjustedStart, end: wEnd });
    prevEnd = wEnd;
  }
  flush();

  const events = lines.map((l) => {
    let prev = l.start;
    const parts = l.words.map((w, idx) => {
      // Gap antes desta palavra (silêncio dentro da linha) → \k cinza
      // antes da palavra para que o cursor "espere" no sítio.
      const gap = Math.max(0, w.start - prev);
      const gapTag = gap > 0.05 ? `{\\k${Math.round(gap * 100)}}` : "";
      const dur = Math.max(1, Math.round((w.end - w.start) * 100));
      const sep = idx > 0 ? " " : "";
      prev = w.end;
      return `${gapTag}{\\K${dur}}${sep}${escapeAssText(w.text)}`;
    });
    const text = parts.join("").replace(/\s+([.,!?;:])/g, "$1");
    return `Dialogue: 0,${fmtAssTime(l.start)},${fmtAssTime(l.end)},Karaoke,,0,0,0,,${text}`;
  });

  return [buildAssHeader(), ...events, ""].join("\n");
}

/** Sanitiza linha cantada — strip [tags], (parens), travessões.
 *  Última linha de defesa caso o plano contenha letras não-limpas. */
function sanitizeLyricLine(line) {
  return String(line || "")
    // <|anything|> — tokens IA (`<|nbw|>`, `<|endoftext|>`) que vazam de
    // Suno/Claude. Última defesa no worker — se o plan ainda contiver,
    // remove antes de Scribe align e antes do overlay.
    .replace(/<\|[^|]*\|>/g, "")
    .replace(/\[[^\]]*\]/g, "")
    // Tag Suno truncada (multi-linha) — abre [ e não fecha na mesma linha
    .replace(/\[[^\]]*$/g, "")
    // Continuação de tag truncada que finalmente fecha noutra linha
    .replace(/^[^\[]*\]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*,\s*/g, ", ")
    .replace(/^[,;:\s]+|[,;:\s]+$/g, "")
    .trim();
}

function sanitizeStanzaBlock(stanza) {
  return String(stanza || "")
    .split("\n")
    .map(sanitizeLyricLine)
    .filter(Boolean)
    .join("\n");
}

/** Computa stanzaTimings + audioDurationSec, com cache em Supabase. */
async function ensureStanzaTimings(manifest) {
  if (!manifest.lyricsSync) return manifest;
  if (!manifest.syncedLyrics || manifest.syncedLyrics.length === 0) return manifest;
  // Sanitiza CADA stanza no worker — última defesa contra letras não-limpas
  // vindas de planos antigos. Aplica-se mesmo se já houver stanzaTimings.
  manifest = {
    ...manifest,
    syncedLyrics: manifest.syncedLyrics.map(sanitizeStanzaBlock).filter(Boolean),
  };
  if (manifest.stanzaTimings && manifest.stanzaTimings.length > 0) {
    manifest = {
      ...manifest,
      stanzaTimings: manifest.stanzaTimings.map((t) => ({
        ...t,
        text: sanitizeStanzaBlock(t.text),
      })),
    };
    return manifest;
  }

  const aligned = await getAlignedWords(manifest);
  // Preserva words+source no manifest para o bloco SRT reusar (em vez de re-ler
  // do cache — que duplica a lógica FA/Scribe e arrisca divergir).
  manifest = { ...manifest, _alignedWords: aligned.words, _alignedSource: aligned.source };

  const speaking = speakingWords(aligned.words);
  const lastEnd = speaking.length > 0 ? speaking[speaking.length - 1].end || 0 : 0;
  const audioDurationSec = lastEnd > 0 ? lastEnd + 2 : null;
  if (!audioDurationSec) return manifest;

  const stanzaTimings = alignStanzas(manifest.syncedLyrics, aligned.words, audioDurationSec);
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

  // SAFETY NET: se após chorus-shift+filter ficou ≤1 stanza, dividir essa
  // stanza em LINHAS e distribuí-las no intervalo real em que o refrão é
  // cantado (Scribe-derived endSec). Última linha estende até durationSec
  // para cobrir o instrumental pós-refrão.
  //
  // Antes: mostrava o bloco inteiro do refrão (todas as linhas) estático
  // durante 30s — user percebia como "não sincroniza".
  // Agora: line-by-line rotation alinhada com o canto real.
  if (manifest.mode === "clip" && adjustedTimings.length === 1) {
    const only = adjustedTimings[0];
    const naturalEnd = Math.min(only.endSec, durationSec);
    const lines = only.text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      const sungSec = Math.max(naturalEnd - only.startSec, 5);
      const perLine = sungSec / lines.length;
      adjustedTimings = lines.map((line, i) => ({
        text: line,
        startSec: only.startSec + i * perLine,
        // Última linha estende até durationSec (cobre instrumental pós-refrão).
        endSec: i === lines.length - 1 ? durationSec : only.startSec + (i + 1) * perLine,
      }));
      adjustedLyrics = lines;
      console.log(`  → Clip line-split: ${lines.length} linhas distribuídas em ${only.startSec.toFixed(1)}s-${naturalEnd.toFixed(1)}s (~${perLine.toFixed(1)}s/linha), última até ${durationSec}s`);
    } else {
      // Stanza com 1 linha só — expandir como antes
      adjustedTimings = [{ text: only.text, startSec: only.startSec, endSec: durationSec }];
      adjustedLyrics = [only.text];
      console.log(`  → Clip 1-linha expandida: ${only.startSec.toFixed(1)}s a ${durationSec}s`);
    }
  } else if (manifest.mode === "clip" && adjustedTimings.length === 0) {
    // Zero stanzas dentro da janela — só aí cai em uniform como último
    // recurso (Scribe falhou catastroficamente ou clip não cobre nenhum
    // verso). Algo é melhor que ecrã em branco.
    const startIdx = typeof manifest.chorusStanzaIdx === "number" && manifest.chorusStanzaIdx >= 0
      ? manifest.chorusStanzaIdx : 0;
    const reordered = manifest.syncedLyrics.slice(startIdx);
    const fallbackLyrics = reordered.length >= 3 ? reordered : manifest.syncedLyrics;
    adjustedTimings = uniformStanzas(fallbackLyrics, durationSec);
    adjustedLyrics = fallbackLyrics;
    console.log(`  ⚠ Clip ZERO stanzas após shift — último recurso uniform: ${adjustedLyrics.length} stanzas`);
  } else if (manifest.mode === "clip") {
    console.log(`  → Clip Scribe sync: ${adjustedTimings.length} stanzas, primeiras=[${adjustedTimings.slice(0,3).map(t=>`${t.startSec.toFixed(1)}s`).join(", ")}]`);
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
  console.log(`→ Manifest brand=${manifest.brand} variant=${manifest.motionVariant} mode=${manifest.mode} orientation=${manifest.orientation || "(unset)"} lyricsSync=${!!manifest.lyricsSync} syncedLyrics=${manifest.syncedLyrics?.length || 0} chorusStanzaIdx=${manifest.chorusStanzaIdx ?? "(null)"}`);

  // 1b. Scribe + alinhamento (com cache) — só Loranne lyric video.
  // ensureStanzaTimings continua a correr para apurar audioStartFromSec (chorus
  // shift no clip) e audioDurationSec. Os stanzaTimings computados deixam de ser
  // usados no overlay (Remotion overlay fica desligado abaixo — passamos a
  // queimar legendas via FFmpeg+SRT no fim).
  await updateProgress("rendering", 5, { title: manifest.title || manifest.trackLabel || JOB_ID });
  manifest = await ensureStanzaTimings(manifest);
  // 1c. Para mode=full sem audioDurationSec ainda (AG full, ou Loranne sem
  //     letras sincronizadas), ffprobe a duração real do MP3.
  manifest = await ensureFullDuration(manifest);

  await mkdir(WORK_DIR, { recursive: true });

  // 1d. SRT/ASS: para Loranne (lyricsSync), gera ficheiro .srt OU .ass a partir
  // das Scribe words. Default = SRT (estável, comportamento histórico).
  // Opt-in karaoke (manifest.karaokeMode === true) → .ass com {\K} por palavra
  // (smooth fill dourado). Para CLIP: shifta por audioStartFromSec (chorus
  // arranca em 0s) e corta em durationSec. Para FULL: offset 0, sem limite.
  // Depois DESLIGA o overlay do Remotion — queima legendas via FFmpeg.
  let subtitlesPath = null;
  let subtitlesIsAss = false;
  if (manifest.lyricsSync && manifest.audioUrl) {
    try {
      // Reusar os aligned words já carregados em `ensureStanzaTimings`
      // (FA ou Scribe). Se não existirem (manifest sem syncedLyrics passou
      // pelo branch early-return), tenta cache Scribe directamente.
      let words = manifest._alignedWords;
      if (!words) {
        const scribeCached = await tryFetchScribeCache(manifest.audioUrl);
        words = scribeCached?.words || [];
      }
      const offset = Number(manifest.audioStartFromSec) || 0;
      const maxSec = manifest.mode === "clip" ? Number(manifest.durationSec) || 30 : null;
      const useKaraoke = manifest.karaokeMode === true;
      // Mínimo de legendas decentes para considerar "SRT/ASS útil". Sob este
      // limiar o burn ia mostrar 1 palavra solta (caso Cold Country: cache
      // Scribe deu 1 word "nbw" → SRT com 1 entry → vídeo com lixo queimado).
      // Mantemos os verses originais como fallback AG nestes casos.
      const MIN_USEFUL_LINES = 2;
      if (useKaraoke) {
        const ass = wordsToAss(words, offset, maxSec);
        const lineCount = ass ? (ass.match(/^Dialogue:/gm) || []).length : 0;
        if (ass && lineCount >= MIN_USEFUL_LINES) {
          subtitlesPath = path.join(WORK_DIR, `${JOB_ID}.ass`);
          await writeFile(subtitlesPath, ass, "utf8");
          subtitlesIsAss = true;
          console.log(`→ ASS karaoke gerada: ${lineCount} linhas, offset=${offset.toFixed(1)}s${maxSec ? ` max=${maxSec}s` : ""} → ${subtitlesPath}`);
          manifest = { ...manifest, lyricsSync: false, verses: ["", ""] };
        } else {
          console.log(`  ⚠ ASS pobre (${lineCount} linhas) — mantém verses overlay como fallback AG`);
          manifest = { ...manifest, lyricsSync: false };
        }
      } else {
        const srt = wordsToSrt(words, offset, maxSec);
        // wordsToSrt usa \n\n entre blocos; com 1 legenda só há 0 ocorrências
        // → underestima. Conta entradas por número de cabeçalhos "N\n".
        const lineCount = srt ? (srt.match(/^\d+\n/gm) || []).length : 0;
        if (srt && lineCount >= MIN_USEFUL_LINES) {
          subtitlesPath = path.join(WORK_DIR, `${JOB_ID}.srt`);
          await writeFile(subtitlesPath, srt, "utf8");
          console.log(`→ SRT gerada: ${lineCount} legendas, offset=${offset.toFixed(1)}s${maxSec ? ` max=${maxSec}s` : ""} → ${subtitlesPath}`);
          // Desliga overlay do Remotion + esvazia verses (que são o fallback
          // quando isSync=false). VerseOverlay returna null com text vazio,
          // assim a Composition renderiza só motion+audio sem texto — depois
          // o FFmpeg burn adiciona as legendas SRT por cima.
          manifest = { ...manifest, lyricsSync: false, verses: ["", ""] };
        } else {
          console.log(`  ⚠ SRT pobre (${lineCount} legendas) — mantém verses overlay como fallback AG`);
          // CRÍTICO: NÃO esvazia verses. Desliga sync mas mantém verses
          // sanitizados como overlay AG-style. Melhor 2 versos estáticos
          // que 1 palavra solta queimada no centro.
          manifest = { ...manifest, lyricsSync: false };
        }
      }
    } catch (e) {
      console.log(`  ⚠ erro a gerar legendas: ${e.message?.slice(0, 200) || e}`);
    }
  }

  const propsPath = path.join(WORK_DIR, `${JOB_ID}-props.json`);
  // Strip campos internos antes de serializar para Remotion props — `_alignedWords`
  // pode ser MB de palavras com timestamps que a composição não usa.
  const { _alignedWords, _alignedSource, ...serializableManifest } = manifest;
  void _alignedWords; void _alignedSource;
  await writeFile(propsPath, JSON.stringify(serializableManifest, null, 2));

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
  // BELT-AND-SUSPENDERS: força dimensões baseado em manifest.orientation,
  // não confia que calculateMetadata do Root.tsx tenha funcionado. Garante
  // que fulls saem em 1920x1080 (landscape) e clips em 1080x1920 (portrait).
  const isLandscape = manifest.orientation === "landscape";
  const targetWidth = isLandscape ? 1920 : 1080;
  const targetHeight = isLandscape ? 1080 : 1920;
  if (composition.width !== targetWidth || composition.height !== targetHeight) {
    console.log(`→ Override dims: ${composition.width}x${composition.height} → ${targetWidth}x${targetHeight} (orientation=${manifest.orientation || "portrait-default"})`);
    composition.width = targetWidth;
    composition.height = targetHeight;
  }
  console.log(`→ Composition FINAL: ${composition.width}x${composition.height} ${composition.durationInFrames}f`);

  await updateProgress("rendering", 30);

  const outputPath = path.join(WORK_DIR, `${JOB_ID}.mp4`);
  // GH Actions ubuntu-latest tem 4 cores → concurrency=4 paraleliza
  // rendering de frames. Sem este parametro Remotion default=1 e um full
  // de 3.5min (6360 frames) demorava >100min, ultrapassando o timeout do
  // workflow. Com 4 paralelo cabe em ~25min.
  const renderConcurrency = Math.max(2, Math.min(4, cpus().length));
  console.log(`→ renderMedia concurrency=${renderConcurrency}`);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: outputPath,
    inputProps: manifest,
    concurrency: renderConcurrency,
    onProgress: ({ progress }) => {
      const pct = 30 + Math.round(progress * 60);
      console.log(`  ... ${pct}%`);
    },
  });
  console.log(`→ MP4 renderizado: ${outputPath}`);

  // 3b. FFmpeg burn das legendas. Para SRT (default) usa filtro `subtitles=`
  // com force_style. Para ASS karaoke (opt-in) usa filtro `ass=` — o estilo
  // já está dentro do .ass (não suporta force_style). Escape `:` e `\` no
  // path porque são separadores do filtro libass. Copia áudio (sem re-encode).
  let finalMp4Path = outputPath;
  if (subtitlesPath) {
    const burnedPath = path.join(WORK_DIR, `${JOB_ID}-burned.mp4`);
    const escapedPath = subtitlesPath.replace(/\\/g, "\\\\").replace(/:/g, "\\:");
    const filter = subtitlesIsAss
      ? `ass=${escapedPath}`
      : `subtitles=${escapedPath}:force_style='${(manifest.subtitleStyle || DEFAULT_SUBTITLE_STYLE).replace(/'/g, "")}'`;
    const cmd = [
      "ffmpeg -y",
      `-i "${outputPath}"`,
      `-vf "${filter}"`,
      "-c:v libx264 -preset veryfast -crf 20",
      "-c:a copy",
      `"${burnedPath}"`,
    ].join(" ");
    console.log(`→ FFmpeg burn legendas (${subtitlesIsAss ? "ASS karaoke" : "SRT"}) → ${burnedPath}`);
    try {
      await exec(cmd, { timeout: 300_000, maxBuffer: 50 * 1024 * 1024 });
      finalMp4Path = burnedPath;
      console.log(`  ✓ Burn OK`);
    } catch (e) {
      console.log(`  ⚠ FFmpeg burn falhou (${e.message?.slice(0, 200)}) — uso mp4 sem legendas`);
    }
  }

  await updateProgress("uploading", 92);

  // 4. Upload
  const mp4Body = await readFile(finalMp4Path);
  // Path ESTÁVEL para o mp4: tira o timestamp final do JOB_ID. Cada re-render
  // do MESMO post+mode escreve sobre o ficheiro existente em vez de criar um
  // novo (poupa espaço em Supabase — user reportou acumulação).
  // Manifest e result.json mantêm timestamp (são tiny, fáceis de limpar
  // por TTL/cron mais tarde, e historial pode ser útil para debug).
  const stableId = JOB_ID.replace(/-\d+$/, "");
  const remotePath = `shorts/videos/${stableId}.mp4`;
  const videoUrlBase = await uploadFile(remotePath, mp4Body, "video/mp4");
  // Cache buster com o timestamp do JOB_ID — browser refaz fetch quando
  // a URL muda mesmo que o path em Supabase fique igual.
  const timestampSuffix = JOB_ID.match(/-(\d+)$/)?.[1] || Date.now().toString();
  const videoUrl = `${videoUrlBase}?v=${timestampSuffix}`;
  console.log(`→ Upload OK: ${remotePath} (stable, ?v=${timestampSuffix} cache-bust)`);

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
