#!/usr/bin/env node
// analyze-moods.mjs — análise HEURÍSTICA local (sem Claude).
//
// Para cada track Loranne disponível, calcula score por mood via:
//   1. Palavras-chave linguísticas no excerto de letra
//   2. Pistas no título da faixa (ex: "Despertar" → acordar)
//   3. Pistas no slug do álbum (ex: "incenso-folego" → respirar/elevar)
//
// Output: tabela mood × top tracks (com score combinado lyrics+keywords).
//
// Útil ANTES de gastar tokens Claude — vê se as 121 tracks já cobrem os
// 7 moods com qualidade. Se um mood ficar fraco, produz-se mais.

import rotation from "../../src/data/weekly-social/weekly-rotation.ts";
import loranne from "../../src/lib/loranne.ts";
import moodsModule from "../../src/data/weekly-social/loranne-moods.ts";

const { LORANNE_ROTATION, LORANNE_AVAILABLE_ALBUMS, getAlbumTitle, getTrackTitle } = rotation;
const { ALL_LYRICS } = loranne;
const { LORANNE_MOODS, MOOD_META } = moodsModule;

// ── Heurísticas por mood ────────────────────────────────────────────────

const MOOD_KEYWORDS = {
  "elevar": {
    title: ["véu cai", "veu cai", "abrir", "luz", "liberta", "voar", "céu", "ceu", "salto", "ignite", "rise", "bloom", "anthem"],
    body: [
      "céu", "luz", "abrir", "abre", "abertas", "liberta", "liberdade", "voar",
      "alma", "elevar", "rise", "shine", "bloom", "anthem",
      "braços abertos", "grito", "explod", "fly", "open",
    ],
    albumPrefixes: { "incenso": 1.5, "fibra": 1.0 },
    albumWords: ["aceso", "salto", "bonito", "abertas", "frequencia", "oferenda", "ar"],
  },
  "aterrar": {
    title: ["terra", "raiz", "corpo", "chão", "chao", "pé", "ground", "root", "body"],
    body: [
      "terra", "raiz", "raízes", "raizes", "corpo", "chão", "chao",
      "pé", "pés", "pe", "pes", "barro", "lama", "presença", "pesco",
      "respira", "ground", "root", "body", "earth", "feet",
      "tronco", "ossos", "musculo", "sangue na pele",
    ],
    albumPrefixes: { "sangue": 1.3, "fibra": 1.2, "grao": 1.1 },
    albumWords: ["raiz", "corpo", "vermelha", "aceso", "tear"],
  },
  "acordar": {
    title: ["despertar", "acordo", "acordar", "pergunta", "espelho", "automatismo", "ver", "abre os olhos", "wake"],
    body: [
      "acord", "desperto", "despert", "pergunta", "vejo", "vi", "ver",
      "automático", "automatismo", "máscara", "mascara", "reconheço",
      "wake", "see", "ask", "question", "mirror",
      "primeira vez", "ilusão", "ilusao", "véu", "veu",
    ],
    albumPrefixes: { "espelho": 1.5, "livro": 1.0 },
    albumWords: ["ilusao", "ilusão", "filosofico", "frequencia"],
  },
  "lembrar": {
    title: ["mãe", "mae", "avó", "avo", "ancestr", "antes", "raiz", "heritage", "memoria", "memória", "herança"],
    body: [
      "mãe", "mae", "avó", "avo", "antes de mim", "antes de te conhecer",
      "ancestr", "raíz", "raiz", "memória", "memoria", "herança", "heranca",
      "vovó", "vovó", "minha gente", "meu povo", "tribo",
      "antiguidade", "tempo profundo", "antes do meu nome",
      "mother", "grandmother", "ancestor", "heritage", "memory",
    ],
    albumPrefixes: { "sangue": 1.3, "eter": 1.2 },
    albumWords: ["mae", "mãe", "raiz", "vermelha", "antigo"],
  },
  "reunir-se": {
    title: ["inteira", "inteiro", "boa", "voltar", "regresso", "casa", "interior", "meu", "mim mesma", "whole", "home"],
    body: [
      "inteira", "inteiro", "voltar a mim", "regress", "volto",
      "casa", "ninho", "interior", "dentro", "interior",
      "tudo de mim", "comigo", "comigo mesma", "comigo mesmo",
      "boa", "estou bem", "mereço", "mereco", "sou",
      "whole", "home", "myself", "back to me",
    ],
    albumPrefixes: { "nua": 1.4 },
    albumWords: ["inteira", "boa", "por-dentro", "duas-vozes"],
  },
  "respirar": {
    title: ["fôlego", "folego", "respira", "calma", "pausa", "silêncio", "silencio", "sentar", "still", "breath"],
    body: [
      "respir", "fôlego", "folego", "pausa", "pausar", "calma", "calmo",
      "silêncio", "silencio", "sentar", "sentada", "sento",
      "lento", "lenta", "devagar", "espera",
      "breath", "still", "silence", "pause", "rest",
    ],
    albumPrefixes: { "incenso": 1.3, "mare": 1.4 },
    albumWords: ["folego", "calma", "silencio", "demora", "limiar"],
  },
  "atravessar": {
    title: ["limiar", "passagem", "fim", "começo", "comeco", "porta", "atravessar", "despedida", "ponte", "threshold"],
    body: [
      "limiar", "porta", "atravess", "passar", "passei", "passo",
      "fim", "começo", "comeco", "novo capítulo", "novo capitulo",
      "despedida", "adeus", "deixar para trás", "deixei para tras",
      "viagem", "viajar", "mudar",
      "threshold", "cross", "leave", "goodbye", "ending",
    ],
    albumPrefixes: { "eter": 1.3, "incenso": 1.0 },
    albumWords: ["limiar", "viagem", "porto", "amanha", "sinal"],
  },
};

function stripDiacritics(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function normalize(s) {
  return stripDiacritics(s.toLowerCase());
}

function moodScoreForTrack(albumSlug, trackNumber, lyrics, baseScore) {
  const title = normalize(getTrackTitle(albumSlug, trackNumber));
  const albumTitle = normalize(getAlbumTitle(albumSlug));
  const slug = normalize(albumSlug);
  const body = normalize(lyrics);

  const scores = {};

  for (const mood of LORANNE_MOODS) {
    const kws = MOOD_KEYWORDS[mood];
    if (!kws) { scores[mood] = 0; continue; }
    let s = 0;

    // Título — peso alto
    for (const kw of kws.title) {
      if (title.includes(normalize(kw))) s += 3;
    }
    // Corpo — peso médio
    for (const kw of kws.body) {
      const occurrences = (body.match(new RegExp(normalize(kw), "g")) || []).length;
      s += Math.min(occurrences, 3) * 1.5;
    }
    // Prefixo de álbum — multiplicador suave
    const prefix = slug.split("-")[0];
    if (kws.albumPrefixes && kws.albumPrefixes[prefix]) {
      s *= kws.albumPrefixes[prefix];
    }
    // Palavras no álbum (sem o prefixo)
    if (kws.albumWords) {
      for (const w of kws.albumWords) {
        if (albumTitle.includes(normalize(w)) || slug.includes(normalize(w))) s += 2;
      }
    }
    scores[mood] = Math.round(s * 10) / 10;
  }

  // Combinação: (mood-keyword score × 1) + (lyric quality score × 0.3)
  const combined = {};
  for (const mood of LORANNE_MOODS) {
    combined[mood] = Math.round((scores[mood] + baseScore * 0.3) * 10) / 10;
  }
  return { keyword: scores, combined };
}

// ── Build mood pools ────────────────────────────────────────────────────

const trackData = LORANNE_ROTATION.map((entry) => {
  const lyrics = ALL_LYRICS[`${entry.albumSlug}/${entry.trackNumber}`] || "";
  const moodScores = moodScoreForTrack(entry.albumSlug, entry.trackNumber, lyrics, entry.score);
  // Top mood = primário; se 2º está perto (>=70% do top), inclui como secundário.
  const sorted = LORANNE_MOODS
    .map((m) => ({ mood: m, score: moodScores.keyword[m] }))
    .sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const secondary = sorted[1].score >= top.score * 0.7 && sorted[1].score >= 3 ? sorted[1] : null;
  return {
    albumSlug: entry.albumSlug,
    trackNumber: entry.trackNumber,
    trackTitle: getTrackTitle(entry.albumSlug, entry.trackNumber),
    albumTitle: getAlbumTitle(entry.albumSlug),
    lyricScore: entry.score,
    moodScores: moodScores.keyword,
    primary: top.mood,
    primaryScore: top.score,
    secondary: secondary?.mood || null,
  };
});

// ── Print coverage table ────────────────────────────────────────────────

console.log("\n══════════════════════════════════════════════════════════════════════════");
console.log("  COBERTURA POR MOOD — Loranne (heurística local)");
console.log("══════════════════════════════════════════════════════════════════════════");
console.log(`Total tracks elegíveis: ${trackData.length}`);
console.log(`Álbuns produzidos: ${LORANNE_AVAILABLE_ALBUMS.length}\n`);

// Distribuição
const counts = {};
const secondaryCounts = {};
for (const t of trackData) {
  counts[t.primary] = (counts[t.primary] || 0) + 1;
  if (t.secondary) secondaryCounts[t.secondary] = (secondaryCounts[t.secondary] || 0) + 1;
}

console.log("DISTRIBUIÇÃO PRIMÁRIA:");
for (const mood of LORANNE_MOODS) {
  const meta = MOOD_META[mood];
  const n = counts[mood] || 0;
  const sec = secondaryCounts[mood] || 0;
  const bar = "█".repeat(Math.min(n, 20));
  console.log(`  ${meta.label.padEnd(12)} ${String(n).padStart(3)} primárias + ${String(sec).padStart(3)} secundárias  ${bar}`);
}

// Top tracks por mood
for (const mood of LORANNE_MOODS) {
  const meta = MOOD_META[mood];
  const matches = trackData
    .filter((t) => t.primary === mood || t.secondary === mood)
    .sort((a, b) => {
      const aS = a.moodScores[mood] + a.lyricScore * 0.3;
      const bS = b.moodScores[mood] + b.lyricScore * 0.3;
      return bS - aS;
    })
    .slice(0, 12);

  console.log(`\n──────────────────────────────────────────────────────────────────────────`);
  console.log(`  ${meta.label.toUpperCase()} — ${meta.paraQuem}`);
  console.log(`  vibe: ${meta.vibe}`);
  console.log(`──────────────────────────────────────────────────────────────────────────`);

  if (matches.length === 0) {
    console.log("  ⚠ NENHUMA TRACK — produzir álbum específico para este mood.");
    continue;
  }

  matches.forEach((t, i) => {
    const isPrimary = t.primary === mood ? "★" : "·";
    const moodScore = t.moodScores[mood];
    const combined = (moodScore + t.lyricScore * 0.3).toFixed(1);
    const id = `${t.albumSlug}/${t.trackNumber}`;
    console.log(
      `  ${isPrimary} [${combined.padStart(5)}] "${t.trackTitle}" · ${t.albumTitle}  (${id})`,
    );
  });
}

console.log("\n══════════════════════════════════════════════════════════════════════════");
console.log("  LEGENDA");
console.log("══════════════════════════════════════════════════════════════════════════");
console.log("  ★ = mood primário (esta track encaixa-se sobretudo aqui)");
console.log("  · = mood secundário (encaixa também, mas o primário é outro)");
console.log("  [score] = combinação keyword-mood + qualidade lírica (× 0.3)");
console.log();
