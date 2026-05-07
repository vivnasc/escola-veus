// gerar-vozes.mjs — Gera os 42 áudios de narração via ElevenLabs.
// Lê content.json, produz audios/dia-{n}/slide-{i}.mp3.
// Texto narrado é derivado de cada slide (ou usa slide.narracao se presente).
//
// Uso:
//   ELEVENLABS_API_KEY=sk-... node gerar-vozes.mjs
//
// Voz: JGnWZj684pcXmK2SxYIv (voz dos Véus, multilingual_v2).

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(__dirname, "content.json");
const AUDIOS = path.join(__dirname, "audios");

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "JGnWZj684pcXmK2SxYIv";
const MODEL_ID = "eleven_multilingual_v2";

if (!API_KEY) {
  console.error("✗ Falta ELEVENLABS_API_KEY no env. Corre:");
  console.error("    ELEVENLABS_API_KEY=sk-... node gerar-vozes.mjs");
  process.exit(1);
}

const VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.8,
  style: 0.15,
};

function textoDoSlide(dia, slide) {
  if (slide.narracao) return slide.narracao;

  if (slide.tipo === "capa") {
    // Lê a palavra-véu (em prosa, sem maiúsculas), pequena pausa, e as duas linhas
    const veu = String(dia.veu).toLowerCase();
    return `Véu da ${veu}. ${slide.linha1} ${slide.linha2}`;
  }

  if (slide.tipo === "conteudo") {
    const titulo = slide.titulo ? `${slide.titulo}. ` : "";
    // \n na poesia → respiração
    const texto = String(slide.texto).replace(/\n+/g, " ");
    return `${titulo}${texto}`;
  }

  if (slide.tipo === "cta") {
    return `${slide.recurso}. ${slide.descricao}`;
  }

  return "";
}

async function ensureDir(dir) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

async function gerarMp3(texto, destino) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: texto,
        model_id: MODEL_ID,
        voice_settings: VOICE_SETTINGS,
      }),
    }
  );

  if (!res.ok) {
    const erro = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${erro}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destino, buf);
  return buf.length;
}

async function main() {
  const content = JSON.parse(await readFile(CONTENT, "utf8"));

  if (existsSync(AUDIOS)) await rm(AUDIOS, { recursive: true, force: true });
  await ensureDir(AUDIOS);

  let total = 0;
  let bytes = 0;

  for (const dia of content.dias) {
    const diaDir = path.join(AUDIOS, `dia-${dia.numero}`);
    await ensureDir(diaDir);
    console.log(`\n=== Dia ${dia.numero} — ${dia.veu} ===`);

    for (let i = 0; i < dia.slides.length; i++) {
      const slide = dia.slides[i];
      const slideNum = i + 1;
      const texto = textoDoSlide(dia, slide);
      const destino = path.join(diaDir, `slide-${slideNum}.mp3`);

      if (!texto.trim()) {
        console.log(`  – slide ${slideNum}: sem texto, salto`);
        continue;
      }

      const tamanho = await gerarMp3(texto, destino);
      bytes += tamanho;
      total++;
      console.log(`  ✓ slide-${slideNum}.mp3 (${(tamanho / 1024).toFixed(1)} KB) — "${texto.slice(0, 60)}${texto.length > 60 ? "…" : ""}"`);

      // pausa pequena entre chamadas para não bater rate limit
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  console.log(
    `\n✓ ${total} áudios gerados em ${AUDIOS} (${(bytes / 1024 / 1024).toFixed(2)} MB total)`
  );
}

main().catch((err) => {
  console.error("\n✗", err.message);
  process.exit(1);
});
