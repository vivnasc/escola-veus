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

import { readFile, mkdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
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

const W = 1080;
const H = 1920;
const FPS = 30;
const TRANSITION = 0.5; // segundos
const RESPIRACAO = 1.0; // pausa após voz
const MUSICA_VOL = 0.13; // ~ -18 dB

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
    ffmpeg()
      .input(png)
      .inputOptions(["-loop 1", "-framerate", String(FPS)])
      .input(mp3)
      // adiciona silêncio no final do mp3 para igualar `duracao`
      .complexFilter([
        // pad video
        `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},format=yuv420p,fps=${FPS}[v]`,
        // pad audio com silêncio até `duracao`
        `[1:a]apad=whole_dur=${duracao.toFixed(3)}[a]`,
      ])
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

// Concatena segmentos com cross-dissolve usando xfade + acrossfade.
async function concatComFade(segmentos, duracoes, outFile) {
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg();
    segmentos.forEach((s) => cmd.input(s));

    const filters = [];
    let prevV = "0:v";
    let prevA = "0:a";
    let acumulada = duracoes[0];

    for (let i = 1; i < segmentos.length; i++) {
      const offset = acumulada - TRANSITION;
      const vOut = `v${i}`;
      const aOut = `a${i}`;
      filters.push(
        `[${prevV}][${i}:v]xfade=transition=fade:duration=${TRANSITION}:offset=${offset.toFixed(3)}[${vOut}]`
      );
      filters.push(
        `[${prevA}][${i}:a]acrossfade=d=${TRANSITION}[${aOut}]`
      );
      prevV = vOut;
      prevA = aOut;
      acumulada += duracoes[i] - TRANSITION;
    }

    cmd
      .complexFilter(filters, [prevV, prevA])
      .outputOptions([
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
      .on("end", () => resolve(acumulada))
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
    if (!existsSync(mp3)) throw new Error(`falta MP3: ${mp3}`);

    const dVoz = await audioDuration(mp3);
    const dSlide = dVoz + RESPIRACAO;
    duracoes.push(dSlide);

    const seg = path.join(TMP_DIR, `dia-${dia.numero}-seg-${slideNum}.mp4`);
    process.stdout.write(`  · slide ${slideNum} (voz ${dVoz.toFixed(1)}s + ${RESPIRACAO}s)… `);
    await renderSegmento(png, mp3, seg, dSlide);
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

async function main() {
  const content = JSON.parse(await readFile(CONTENT, "utf8"));
  const arg = process.argv.slice(2).map(Number).filter((n) => !isNaN(n));
  const dias = arg.length ? content.dias.filter((d) => arg.includes(d.numero)) : content.dias;

  await ensureDir(VIDEOS_DIR);

  if (!existsSync(MUSICA)) {
    console.log(`! musica.mp3 não encontrada em ${ROOT} — vídeos sairão só com voz.`);
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
