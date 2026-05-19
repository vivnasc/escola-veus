#!/usr/bin/env node
// print-rotation.mjs — imprime a rotação Loranne resolvida para validação,
// e simula 12 semanas do picker AG generativo para inspeccionar distribuição.
//
// Uso (do dir escola-veus-app/):
//   npx tsx scripts/weekly/print-rotation.mjs

import rotation from "../../src/data/weekly-social/weekly-rotation.ts";
import agPicker from "../../src/data/weekly-social/ag-picker.ts";
import loranne from "../../src/lib/loranne.ts";

const {
  LORANNE_ROTATION,
  LORANNE_AVAILABLE_ALBUMS,
  findProductionSuggestions,
} = rotation;
const { pickWeekAG } = agPicker;
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
console.log(`  ANCIENT GROUND — simulação de 12 semanas (picker generativo)`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

// Simula 12 semanas com history acumulada (proxy do que aconteceria em
// produção). Cada semana herda a contagem da anterior + as escolhas que
// fez. Mostra como o picker auto-equilibra ao longo do tempo.
const year = new Date().getFullYear();
const cumulativeCounts = new Map();
const WEEKS_TO_SIM = 12;
const SLOTS_PER_WEEK = 3;

for (let w = 1; w <= WEEKS_TO_SIM; w++) {
  const entries = pickWeekAG(year, w, cumulativeCounts, SLOTS_PER_WEEK);
  console.log(`semana ${String(w).padStart(2)} ─`);
  entries.forEach((e, i) => {
    const temas = e.temas.join(" + ");
    console.log(
      `   slot ${i + 1}: ${e.label.padEnd(45)} ${temas.padEnd(50)} faixa ${e.trackNumber}`,
    );
    for (const t of e.temas) cumulativeCounts.set(t, (cumulativeCounts.get(t) ?? 0) + 1);
  });
}

console.log("\n──────────────────────────────────────────────────────────────────");
console.log(`  Distribuição cumulativa após ${WEEKS_TO_SIM} semanas (${WEEKS_TO_SIM * SLOTS_PER_WEEK * 3} slots-tema):`);
const temaSorted = [...cumulativeCounts.entries()].sort((a, b) => b[1] - a[1]);
const cap = (WEEKS_TO_SIM * SLOTS_PER_WEEK * 3) / 15;
for (const [t, n] of temaSorted) {
  const bar = "█".repeat(n);
  const flag = n > cap * 1.3 ? " ⚠" : n < cap * 0.7 ? " ↓" : "";
  console.log(`    · ${t.padEnd(22)} ${String(n).padStart(2)}x  ${bar}${flag}`);
}
console.log(`    (uniforme teórica: ${cap.toFixed(1)}x por tema)`);

console.log();
