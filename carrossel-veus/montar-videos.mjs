// montar-videos.mjs — Monta 7 vídeos verticais (1 por dia, ~60s) a partir
// dos 42 PNGs (output/dia-{n}/) + 42 MP3s (audios/dia-{n}/) + musica.mp3 opcional.
//
// Cada slide dura: voz + 1s de respiração no fim. Fade cross-dissolve 0.5s
// entre slides. Música por baixo a -18dB com fade in/out. Output:
// output/videos/dia-{n}.mp4 (1080x1920, 30fps, H.264 + AAC).
//
// Uso:
//   node montar-videos.mjs           # processa todos os dias
//   node montar-videos.mjs 1 3 5     # só os dias 1, 3 e 5

import { readFile, writeFile, mkdir, rm, stat } from "node:fs/promises";
import { existsSync, createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const CONTENT = path.join(ROOT, "content.json");
const SLIDES_DIR = path.join(ROOT, "output");
const AUDIOS_DIR = path.join(ROOT, "audios");
const VIDEOS_DIR = path.join(ROOT, "output", "videos");
const TMP_DIR = path.join(ROOT, "output", ".tmp");
const MUSICA = path.join(ROOT, "musica.mp3");

// Permite passar uma URL pública de música via env (ex.: faixa Ancient Ground
// no Supabase). Quando definida, baixa para musica.mp3 antes de processar.
const MUSIC_URL = process.env.MUSIC_URL;
// Volume da música por baixo da voz. Default 0.4 (voz é o foco).
const MUSICA_VOLUME = parseFloat(process.env.MUSIC_VOLUME || "0.4");
// URL pública de um manifest JSON com os URLs dos áudios já gerados na Vercel.
// Estrutura esperada: { audios: [{dia, slide, url}, ...], musicUrl?, musicVolume? }
// Quando definida, descarrega cada áudio para audios/dia-{n}/slide-{i}.mp3.
const MANIFEST_URL = process.env.MANIFEST_URL;

const W = 1080;
const H = 1920;
const FPS = 30;
const TRANSITION = 0.5; // segundos
const RESPIRACAO = 1.0; // pausa após voz
const MUSICA_VOL = MUSICA_VOLUME;
// Duração fixa por slide quando não há voz (modo "só música")
const SLIDE_DURATION_NO_VOICE = parseFloat(process.env.SLIDE_DURATION || "8");

async function ensureDir(dir) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

async function audioDuration(file) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, data) => {
      if (err) return reject(err);
      const d = data?.format?.duration;
      if (typeof d !== "number") return reject(new Error("sem duracao"));
      resolve(d);
    });
  });
}

// Renderiza um único segmento: PNG estático + voz + 1s de silêncio no fim.
// Output: MP4 sem áudio comprimido (rawvideo seria melhor mas pesa demais);
// usamos H.264 + AAC e depois concat por filtros.
async function renderSegmento(png, mp3, outFile, duracao) {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg()
      .input(png)
      .inputOptions(["-loop 1", "-framerate", String(FPS)]);
    if (mp3) {
      cmd.input(mp3);
      cmd.complexFilter([
        `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},format=yuv420p,fps=${FPS}[v]`,
        `[1:a]apad=whole_dur=${duracao.toFixed(3)}[a]`,
      ]);
    } else {
      // sem voz: gera silêncio do tamanho do slide para o áudio do segmento
      // existir (concat com acrossfade precisa de áudio em todos os inputs)
      cmd.input("anullsrc=channel_layout=stereo:sample_rate=44100");
      cmd.inputOptions(["-f", "lavfi"]);
      cmd.complexFilter([
        `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},format=yuv420p,fps=${FPS}[v]`,
        `[1:a]atrim=duration=${duracao.toFixed(3)},asetpts=PTS-STARTPTS[a]`,
      ]);
    }
    cmd
      .outputOptions([
        "-map [v]",
        "-map [a]",
        "-t",
        duracao.toFixed(3),
        "-c:v libx264",
        "-pix_fmt yuv420p",
        "-preset medium",
        "-crf 18",
        "-c:a aac",
        "-b:a 192k",
        "-r",
        String(FPS),
      ])
      .on("error", reject)
      .on("end", () => resolve())
      .save(outFile);
  });
}

// Concatena segmentos via concat demuxer (corte directo, sem cross-fade).
// Mais robusto que xfade em complex filter, especialmente em modo "sem voz".
// Cada segmento já tem H.264 + AAC com mesmas specs portanto -c copy funciona.
async function concatComFade(segmentos, duracoes, outFile) {
  // Escreve lista para concat demuxer com paths absolutos (ffmpeg resolve
  // relativos a partir do CWD que é incerto via fluent-ffmpeg).
  const listPath = path.join(TMP_DIR, `concat-list-${Date.now()}.txt`);
  const listContent = segmentos
    .map((s) => `file '${s.replace(/'/g, "'\\''")}'`)
    .join("\n");
  await writeFile(listPath, listContent, "utf8");

  const total = duracoes.reduce((a, b) => a + b, 0);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(listPath)
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions([
        "-c:v copy",
        "-c:a copy",
      ])
      .on("error", reject)
      .on("end", () => resolve(total))
      .save(outFile);
  });
}

// Mistura música por baixo, com fade in/out.
async function misturarMusica(videoIn, videoOut, duracaoTotal) {
  if (!existsSync(MUSICA)) {
    // sem música — copia o vídeo
    return new Promise((resolve, reject) => {
      ffmpeg(videoIn)
        .outputOptions(["-c copy"])
        .on("error", reject)
        .on("end", resolve)
        .save(videoOut);
    });
  }

  return new Promise((resolve, reject) => {
    const fadeOutStart = Math.max(0, duracaoTotal - 2);
    ffmpeg()
      .input(videoIn)
      .input(MUSICA)
      .inputOptions(["-stream_loop", "-1"])
      .complexFilter([
        `[1:a]volume=${MUSICA_VOL},afade=t=in:st=0:d=2,afade=t=out:st=${fadeOutStart.toFixed(3)}:d=2[mus]`,
        `[0:a][mus]amix=inputs=2:duration=first:dropout_transition=0[a]`,
      ])
      .outputOptions([
        "-map 0:v",
        "-map [a]",
        "-c:v copy",
        "-c:a aac",
        "-b:a 192k",
        "-shortest",
      ])
      .on("error", reject)
      .on("end", () => resolve())
      .save(videoOut);
  });
}

async function processarDia(dia) {
  console.log(`\n=== Dia ${dia.numero} — ${dia.veu} ===`);

  const segmentos = [];
  const duracoes = [];

  await ensureDir(TMP_DIR);

  for (let i = 0; i < dia.slides.length; i++) {
    const slideNum = i + 1;
    const png = path.join(SLIDES_DIR, `dia-${dia.numero}`, `veu-${dia.numero}-slide-${slideNum}.png`);
    const mp3 = path.join(AUDIOS_DIR, `dia-${dia.numero}`, `slide-${slideNum}.mp3`);

    if (!existsSync(png)) throw new Error(`falta PNG: ${png}`);

    const temVoz = existsSync(mp3);
    let dSlide;
    if (temVoz) {
      const dVoz = await audioDuration(mp3);
      dSlide = dVoz + RESPIRACAO;
      process.stdout.write(`  · slide ${slideNum} (voz ${dVoz.toFixed(1)}s + ${RESPIRACAO}s)… `);
    } else {
      dSlide = (globalThis.__SLIDE_DURATION_OVERRIDE) ?? SLIDE_DURATION_NO_VOICE;
      process.stdout.write(`  · slide ${slideNum} (sem voz, ${dSlide}s)… `);
    }
    duracoes.push(dSlide);

    const seg = path.join(TMP_DIR, `dia-${dia.numero}-seg-${slideNum}.mp4`);
    await renderSegmento(png, temVoz ? mp3 : null, seg, dSlide);
    segmentos.push(seg);
    console.log("ok");
  }

  const semMusica = path.join(TMP_DIR, `dia-${dia.numero}-juntos.mp4`);
  process.stdout.write(`  → concatenar ${segmentos.length} segmentos com xfade… `);
  const total = await concatComFade(segmentos, duracoes, semMusica);
  console.log(`ok (${total.toFixed(1)}s)`);

  await ensureDir(VIDEOS_DIR);
  const final = path.join(VIDEOS_DIR, `dia-${dia.numero}.mp4`);
  process.stdout.write(`  → mistura música + render final… `);
  await misturarMusica(semMusica, final, total);
  const tamanho = (await stat(final)).size / 1024 / 1024;
  console.log(`✓ dia-${dia.numero}.mp4 (${tamanho.toFixed(1)} MB, ${total.toFixed(1)}s)`);
}

async function downloadMusicIfNeeded(musicUrl) {
  const url = musicUrl || MUSIC_URL;
  if (!url) return;
  if (existsSync(MUSICA)) {
    console.log(`→ musica.mp3 já existe, mantém (apaga para forçar novo download)`);
    return;
  }
  console.log(`→ a descarregar música: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download música falhou ${res.status} ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(MUSICA));
  const tam = (await stat(MUSICA)).size / 1024 / 1024;
  console.log(`  ✓ musica.mp3 (${tam.toFixed(2)} MB)`);
}

async function downloadAudiosFromManifest() {
  if (!MANIFEST_URL) return null;
  console.log(`→ a ler manifest: ${MANIFEST_URL}`);
  const res = await fetch(MANIFEST_URL);
  if (!res.ok) throw new Error(`Manifest fetch falhou ${res.status}`);
  const manifest = await res.json();

  if (manifest.withoutVoice) {
    console.log(`→ modo "sem voz" — slides ${manifest.slideDuration ?? SLIDE_DURATION_NO_VOICE}s cada`);
    return manifest;
  }

  if (!Array.isArray(manifest.audios) || manifest.audios.length === 0) {
    throw new Error("manifest.audios[] em falta (e withoutVoice falso)");
  }

  console.log(`→ a descarregar ${manifest.audios.length} áudios`);
  for (const a of manifest.audios) {
    const dest = path.join(AUDIOS_DIR, `dia-${a.dia}`, `slide-${a.slide}.mp3`);
    await ensureDir(path.dirname(dest));
    if (existsSync(dest)) continue;
    const r = await fetch(a.url);
    if (!r.ok) throw new Error(`audio ${a.url} → ${r.status}`);
    await pipeline(Readable.fromWeb(r.body), createWriteStream(dest));
  }
  console.log(`  ✓ áudios em ${AUDIOS_DIR}`);
  return manifest;
}

async function main() {
  const content = JSON.parse(await readFile(CONTENT, "utf8"));
  const arg = process.argv.slice(2).map(Number).filter((n) => !isNaN(n));
  const dias = arg.length ? content.dias.filter((d) => arg.includes(d.numero)) : content.dias;

  await ensureDir(VIDEOS_DIR);

  // Manifest tem precedência: se passado, descarrega áudios + define música.
  const manifest = await downloadAudiosFromManifest();
  await downloadMusicIfNeeded(manifest?.musicUrl);

  // Permite manifest override do slide-duration (modo sem voz)
  if (manifest?.withoutVoice && typeof manifest.slideDuration === "number") {
    globalThis.__SLIDE_DURATION_OVERRIDE = manifest.slideDuration;
  }

  if (!existsSync(MUSICA)) {
    console.log(`! musica.mp3 não encontrada em ${ROOT} — vídeos sairão só com voz.`);
  } else {
    console.log(`→ música a ${MUSICA_VOL.toFixed(2)} de volume`);
  }

  for (const dia of dias) {
    await processarDia(dia);
  }

  // limpa tmp
  if (existsSync(TMP_DIR)) await rm(TMP_DIR, { recursive: true, force: true });

  console.log(`\n✓ ${dias.length} vídeo(s) gerado(s) em ${VIDEOS_DIR}`);
}

main().catch((err) => {
  console.error("\n✗", err);
  process.exit(1);
});
