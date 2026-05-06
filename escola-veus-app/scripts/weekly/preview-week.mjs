#!/usr/bin/env node
// preview-week.mjs — mostra concretamente quais 7 faixas Loranne + 3 tripletes
// AG seriam escolhidos para uma semana específica.
//
// Uso (do dir escola-veus-app/):
//   npx tsx scripts/weekly/preview-week.mjs 19   # semana 19
//   npx tsx scripts/weekly/preview-week.mjs 20   # semana 20

import rotation from "../../src/data/weekly-social/weekly-rotation.ts";
import loranne from "../../src/lib/loranne.ts";
import brandConfig from "../../src/data/weekly-social/brand-config.ts";

const { pickWeeklyLoranne, pickWeeklyAG } = rotation;
const { ALL_LYRICS } = loranne;
const { BRANDS, DAY_ORDER } = brandConfig;

const week = parseInt(process.argv[2] || "19", 10);
if (!Number.isFinite(week)) {
  console.error("Uso: npx tsx scripts/weekly/preview-week.mjs <numero-semana>");
  process.exit(1);
}

function albumLabel(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function firstStrongLine(lyrics) {
  const lines = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\[.*\]$/.test(l) && !/^\(.+\)$/.test(l));
  return lines.find((l) => l.length >= 25 && l.length <= 70) || lines[0] || "";
}

const DAY_NAMES = {
  mon: "Segunda", tue: "Terça", wed: "Quarta",
  thu: "Quinta", fri: "Sexta", sat: "Sábado", sun: "Domingo",
};

console.log(`\n══════════════════════════════════════════════════════════════════`);
console.log(`  SEMANA ${week} — preview do que iria para os ZIPs`);
console.log(`══════════════════════════════════════════════════════════════════\n`);

// ── Loranne ───────────────────────────────────────────────────────────────
console.log(`📀 LORANNE (${BRANDS.loranne.publishDays.length} faixas)\n`);
BRANDS.loranne.publishDays.forEach((day, i) => {
  const dayIdx = DAY_ORDER.indexOf(day);
  const entry = pickWeeklyLoranne(week, dayIdx);
  const lyrics = ALL_LYRICS[`${entry.albumSlug}/${entry.trackNumber}`] ?? "";
  const verse = firstStrongLine(lyrics);
  console.log(
    `  ${DAY_NAMES[day].padEnd(8)} → ${albumLabel(entry.albumSlug).padEnd(28)} faixa ${entry.trackNumber}`,
  );
  console.log(`            "${verse}"\n`);
});

// ── Ancient Ground ────────────────────────────────────────────────────────
console.log(`\n🌍 ANCIENT GROUND (${BRANDS["ancient-ground"].publishDays.length} shorts)\n`);
BRANDS["ancient-ground"].publishDays.forEach((day, i) => {
  const entry = pickWeeklyAG(week, i);
  console.log(
    `  ${DAY_NAMES[day].padEnd(8)} → ${entry.label.padEnd(28)} (faixa AG ${entry.trackNumber})`,
  );
  console.log(`            temas: ${entry.temas.join(" + ")}\n`);
});
