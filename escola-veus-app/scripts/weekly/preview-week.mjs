#!/usr/bin/env node
// preview-week.mjs — mostra concretamente quais 7 faixas Loranne + 3 tripletes
// AG seriam escolhidos para uma semana específica.
//
// Uso (do dir escola-veus-app/):
//   npx tsx scripts/weekly/preview-week.mjs 19   # semana 19
//   npx tsx scripts/weekly/preview-week.mjs 20   # semana 20

import rotation from "../../src/data/weekly-social/weekly-rotation.ts";
import agPicker from "../../src/data/weekly-social/ag-picker.ts";
import loranne from "../../src/lib/loranne.ts";
import brandConfig from "../../src/data/weekly-social/brand-config.ts";

const { pickWeeklyLoranne, getTrackTitle, getAlbumTitle } = rotation;
const { pickWeekAG } = agPicker;
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
  const trackTitle = getTrackTitle(entry.albumSlug, entry.trackNumber);
  const albumTitle = getAlbumTitle(entry.albumSlug);
  console.log(
    `  ${DAY_NAMES[day].padEnd(8)} → "${trackTitle}" · ${albumTitle}`,
  );
  console.log(`            (${entry.albumSlug}/${entry.trackNumber})`);
  console.log(`            "${verse}"\n`);
});

// ── Ancient Ground ────────────────────────────────────────────────────────
// Picker generativo — CLI passa history vazio (não tem Supabase). Para ver
// previsão com history real, usa o endpoint /api/admin/weekly/preview.
console.log(`\n🌍 ANCIENT GROUND (${BRANDS["ancient-ground"].publishDays.length} shorts) — picker generativo, sem history\n`);
const year = new Date().getFullYear();
const agEntries = pickWeekAG(year, week, new Map(), BRANDS["ancient-ground"].publishDays.length);
BRANDS["ancient-ground"].publishDays.forEach((day, i) => {
  const entry = agEntries[i];
  console.log(
    `  ${DAY_NAMES[day].padEnd(8)} → ${entry.label.padEnd(40)} (faixa AG ${entry.trackNumber})`,
  );
  console.log(`            temas: ${entry.temas.join(" + ")}\n`);
});
