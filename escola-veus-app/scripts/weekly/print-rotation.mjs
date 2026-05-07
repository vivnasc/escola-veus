#!/usr/bin/env node
// print-rotation.mjs — imprime a rotação Loranne+AG resolvida para validação.
//
// Uso (do dir escola-veus-app/):
//   npx tsx scripts/weekly/print-rotation.mjs
//
// Mostra:
//   - Top 80 faixas Loranne ordenadas por score, com primeiro verso forte.
//   - 40 tripletes AG com label.
//   - Estatísticas: cobertura por álbum, distribuição.

import rotation from "../../src/data/weekly-social/weekly-rotation.ts";
import loranne from "../../src/lib/loranne.ts";

const {
  LORANNE_ROTATION,
  AG_ROTATION,
  LORANNE_AVAILABLE_ALBUMS,
  findProductionSuggestions,
} = rotation;
const { ALL_LYRICS } = loranne;

function pickFirstStrongLine(lyrics) {
  const lines = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\[.*\]$/.test(l) && !/^\(.+\)$/.test(l));
  return lines.find((l) => l.length >= 25 && l.length <= 70) || lines[0] || "";
}

function albumLabel(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`  LORANNE ROTATION — ${LORANNE_ROTATION.length} faixas`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

const albumCount = new Map();
for (const e of LORANNE_ROTATION) {
  albumCount.set(e.albumSlug, (albumCount.get(e.albumSlug) ?? 0) + 1);
}

LORANNE_ROTATION.forEach((e, i) => {
  const lyrics = ALL_LYRICS[`${e.albumSlug}/${e.trackNumber}`] ?? "";
  const verse = pickFirstStrongLine(lyrics);
  const label = `${albumLabel(e.albumSlug)} · faixa ${e.trackNumber}`;
  console.log(
    `${String(i + 1).padStart(3)}. [${e.score.toString().padStart(4)}]  ${label.padEnd(50)} "${verse.slice(0, 60)}"`,
  );
});

console.log("\n──────────────────────────────────────────────────────────────────");
console.log(`  Cobertura: ${albumCount.size}/${LORANNE_AVAILABLE_ALBUMS.length} álbuns disponíveis`);
const top = [...albumCount.entries()].sort((a, b) => b[1] - a[1]);
for (const [slug, n] of top) console.log(`    · ${albumLabel(slug).padEnd(30)} ${n} faixas`);

const missing = LORANNE_AVAILABLE_ALBUMS.filter((s) => !albumCount.has(s));
if (missing.length > 0) {
  console.log(`\n  ⚠ Álbuns no allowlist sem letras passíveis:`);
  for (const slug of missing) console.log(`    · ${albumLabel(slug)}  (verifica slug em loranne-lyrics/)`);
}

console.log("\n──────────────────────────────────────────────────────────────────");
console.log("  SUGESTÕES — álbuns com letras fortes que valeria produzir:");
console.log("──────────────────────────────────────────────────────────────────");
const sugg = findProductionSuggestions();
sugg.forEach((s, i) => {
  console.log(
    `${String(i + 1).padStart(3)}. [${s.topTrackScore.toString().padStart(4)}]  ${albumLabel(s.albumSlug).padEnd(35)} ${s.trackCount} faixas com score≥8`,
  );
});

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`  ANCIENT GROUND ROTATION — ${AG_ROTATION.length} tripletes`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

AG_ROTATION.forEach((e, i) => {
  const temas = e.temas.join(" + ");
  console.log(
    `${String(i + 1).padStart(3)}. ${e.label.padEnd(30)} ${temas.padEnd(45)} faixa ${e.trackNumber}`,
  );
});

console.log("\n──────────────────────────────────────────────────────────────────");
const temaCount = new Map();
for (const e of AG_ROTATION) {
  for (const t of e.temas) {
    temaCount.set(t, (temaCount.get(t) ?? 0) + 1);
  }
}
console.log(`  Distribuição de temas (${temaCount.size}/15 raízes usadas):`);
const temaSorted = [...temaCount.entries()].sort((a, b) => b[1] - a[1]);
for (const [t, n] of temaSorted) console.log(`    · ${t.padEnd(22)} ${n}x`);

console.log();
