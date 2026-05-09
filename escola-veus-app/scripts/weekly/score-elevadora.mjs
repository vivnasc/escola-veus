#!/usr/bin/env node
// score-elevadora.mjs — corre o scoreLine/scoreTrack (usado em
// suggest/route.ts e weekly-rotation.ts) sobre as 50 novas tracks
// elevar/gospel para validação de qualidade.

import elevadoraMod from "../../../loranne-lyrics/lyrics-elevadora.ts";
const { ELEVADORA_LYRICS } = elevadoraMod;
import trackMeta from "../../src/data/weekly-social/loranne-track-meta.json" with { type: "json" };

// ── Replica do scoreLine/scoreTrack usado em suggest/route.ts ──────────

const EMOTION_WORDS = [
  "coracao", "coração", "alma", "amor", "sagrado", "fogo", "luz", "voz",
  "pele", "veu", "véu", "veus", "véus", "nome", "verdade", "liberdade",
  "mae", "mãe", "filha", "saudade", "silencio", "silêncio", "memoria",
  "memória", "raiz", "terra", "chao", "chão", "agua", "água", "corpo",
  "ferida", "cicatriz", "grito", "canto", "respira", "abraco", "abraço",
  "sonho", "perda", "caminho", "porta", "abre", "escuta", "ouve",
  "casa", "ninho", "fim", "comeco", "começo", "inteira", "inteiro",
  "sozinha", "sozinho", "sangue", "ventre", "peito", "mao", "mão",
];

const PRONOUNS_START =
  /^(eu |tu |nos |nós |voce |você |ela |ele |vem |sou |es |és |amo |vejo |sinto |ouco |ouço |vou |choro |rio |vivo |volto |abro |fecho |tenho |quero |posso |preciso |esta |está )/i;

function stripDiacritics(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function scoreLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return -999;
  if (/^\[.*\]$/.test(trimmed)) return -999;
  if (/^\(.+\)$/.test(trimmed)) return -500;
  const lower = stripDiacritics(trimmed.toLowerCase());

  let score = 0;
  const len = trimmed.length;
  if (len >= 25 && len <= 70) score += 3;
  else if (len >= 15 && len <= 90) score += 1;
  else if (len > 90) score -= 2;
  else if (len < 10) score -= 2;

  if (PRONOUNS_START.test(trimmed)) score += 2;

  let emoHits = 0;
  for (const w of EMOTION_WORDS) {
    if (lower.includes(stripDiacritics(w))) emoHits++;
  }
  score += Math.min(emoHits, 3) * 2;

  if (/[?!]$/.test(trimmed)) score += 1;
  if (/,/.test(trimmed)) score += 0.5;
  if (/^(oh+|ah+|ooh+|uuh+|na+)(\s|$)/i.test(trimmed)) score -= 3;

  return score;
}

function scoreTrack(lyrics) {
  const lines = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\[.*\]$/.test(l));
  if (lines.length < 4) return -1000;
  const scored = lines.map(scoreLine).sort((a, b) => b - a);
  const top3 = scored.slice(0, 3);
  return top3.reduce((s, n) => s + n, 0);
}

function topVerses(lyrics, n = 3) {
  const lines = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\[.*\]$/.test(l) && !/^\(.+\)$/.test(l));
  return lines
    .map((line) => ({ line, score: scoreLine(line) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

// ── Rate ───────────────────────────────────────────────────────────────

const ALBUMS = ["incenso-acende", "incenso-coro", "incenso-milagre", "incenso-amen", "incenso-aleluia"];
const albumLabels = {
  "incenso-acende": "ACENDE",
  "incenso-coro": "CORO",
  "incenso-milagre": "MILAGRE",
  "incenso-amen": "AMEN",
  "incenso-aleluia": "ALELUIA",
};

const allScores = [];
console.log("\n══════════════════════════════════════════════════════════════════════════");
console.log("  SCORING DAS 50 NOVAS TRACKS — algoritmo do suggest/route.ts");
console.log("══════════════════════════════════════════════════════════════════════════");

for (const slug of ALBUMS) {
  console.log(`\n${albumLabels[slug]} (${slug})`);
  console.log("──────────────────────────────────────────────────────────────────────────");
  const tracks = [];
  for (let n = 1; n <= 10; n++) {
    const key = `${slug}/${n}`;
    const lyrics = ELEVADORA_LYRICS[key];
    if (!lyrics) {
      console.log(`  ${n}. ⚠ sem letras`);
      continue;
    }
    const meta = trackMeta[slug]?.[String(n)] || {};
    const score = scoreTrack(lyrics);
    const top = topVerses(lyrics, 1)[0];
    tracks.push({ slug, n, title: meta.title, score, energy: meta.energy, flavor: meta.flavor, topVerse: top });
    allScores.push({ slug, n, score });

    const flag = score >= 25 ? "★" : score >= 18 ? "·" : "⚠";
    console.log(
      `  ${flag} [${score.toFixed(1).padStart(5)}] ${String(n).padStart(2)}. "${meta.title}"  ${meta.energy || "-"}/${meta.flavor || "—"}`,
    );
    if (top) console.log(`         "${top.line}"`);
  }
}

console.log("\n══════════════════════════════════════════════════════════════════════════");
console.log("  AGREGADO");
console.log("══════════════════════════════════════════════════════════════════════════");

const sorted = [...allScores].sort((a, b) => b.score - a.score);
console.log(`\n  Total tracks: ${allScores.length}`);
console.log(`  Score médio:  ${(allScores.reduce((s, x) => s + x.score, 0) / allScores.length).toFixed(1)}`);
console.log(`  Score máx:    ${sorted[0].score.toFixed(1)} (${sorted[0].slug}/${sorted[0].n})`);
console.log(`  Score mín:    ${sorted[sorted.length-1].score.toFixed(1)} (${sorted[sorted.length-1].slug}/${sorted[sorted.length-1].n})`);

// Buckets
const high = allScores.filter((x) => x.score >= 25).length;
const mid = allScores.filter((x) => x.score >= 18 && x.score < 25).length;
const low = allScores.filter((x) => x.score < 18).length;
console.log(`\n  ★ Alta qualidade (score ≥ 25):  ${high} tracks`);
console.log(`  · Média (18-25):                 ${mid} tracks`);
console.log(`  ⚠ Baixa (< 18):                  ${low} tracks`);

// Comparar com catálogo existente
console.log(`\n  REFERÊNCIA do catálogo Loranne actual (top 121):`);
console.log(`    máximo: 28.0  (Eter Raiz Vermelha · faixa 1)`);
console.log(`    top-10 média: ~26.5`);
console.log(`    bottom-10 média (cut): ~9.0`);

// Top 10 das novas
console.log("\n  TOP 10 NOVAS:");
sorted.slice(0, 10).forEach((s, i) => {
  const meta = trackMeta[s.slug]?.[String(s.n)] || {};
  console.log(`    ${(i + 1).toString().padStart(2)}. [${s.score.toFixed(1).padStart(5)}] ${s.slug}/${s.n} "${meta.title}"`);
});

// Bottom 5 das novas
console.log("\n  BOTTOM 5 NOVAS (candidatos a iterar):");
sorted.slice(-5).reverse().forEach((s, i) => {
  const meta = trackMeta[s.slug]?.[String(s.n)] || {};
  console.log(`    ${(i + 1).toString().padStart(2)}. [${s.score.toFixed(1).padStart(5)}] ${s.slug}/${s.n} "${meta.title}"`);
});

console.log();
