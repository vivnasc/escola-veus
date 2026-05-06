#!/usr/bin/env node
/**
 * weekly:package — constrói CSV Metricool + ZIP por marca.
 *
 * Lê <year>-W<NN>/{loranne,ancient-ground}-plan.json, gera por marca:
 *   loranne-2026-W19.zip
 *     metricool.csv
 *     posts.json
 *     README.txt
 *
 * Posts SEM videoUrl entram com Picture Url 1 vazio + aviso no README.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import JSZip from "jszip";

import { parseArgs, printGenericHelp } from "./lib/args.mjs";
import {
  CSV_HEADER, csvEscape, buildRow,
} from "./lib/metricool-csv.mjs";
import { currentYear } from "./lib/schedule.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "..", "..");

async function loadPlan(outDir, brand) {
  try {
    const raw = await readFile(path.join(outDir, `${brand}-plan.json`), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Expande cada post em 3 (post × plataforma) com data/hora ajustadas. */
function expandPosts(plan) {
  const rows = [];
  for (const p of plan.posts) {
    for (const platform of ["instagram", "tiktok", "youtube"]) {
      rows.push({
        ...p,
        date: p.schedule[platform].date,
        time: p.schedule[platform].time,
        _platform: platform,
      });
    }
  }
  return rows;
}

function buildCsvFromPlan(plan) {
  const lines = [CSV_HEADER.map(csvEscape).join(",")];
  for (const r of expandPosts(plan)) {
    lines.push(buildRow(r, r._platform));
  }
  return lines.join("\r\n") + "\r\n";
}

function buildReadme(plan, brand, missingVideos) {
  const dn = brand === "loranne" ? "Loranne" : "Ancient Ground";
  const lines = [
    `${dn} — Semana ${plan.week} de ${plan.year}`,
    "═".repeat(60),
    "",
    `Posts planeados: ${plan.posts.length}`,
    `Plataformas por post: Instagram Reel · TikTok · YouTube Shorts`,
    `Linhas no CSV: ${plan.posts.length * 3}`,
    "",
    "Como importar no Metricool:",
    `  1. Abre Metricool > workspace ${dn}`,
    "  2. Planning > Calendar > Import CSV",
    "  3. Drag & drop do metricool.csv (ou divide em chunks de 50 linhas se for grande)",
    "  4. Verifica os horários e clica Import",
    "",
  ];
  if (missingVideos.length > 0) {
    lines.push("⚠ POSTS SEM VÍDEO:");
    for (const id of missingVideos) lines.push(`  · ${id}`);
    lines.push("");
    lines.push("Estes entram no CSV com Picture Url 1 vazio. Renderiza antes de importar.");
    lines.push("");
  }
  lines.push(`Gerado em ${new Date().toISOString()}`);
  return lines.join("\n");
}

async function packBrand(outDir, brand) {
  const plan = await loadPlan(outDir, brand);
  if (!plan) {
    console.log(`   sem ${brand}-plan.json — skip`);
    return null;
  }
  console.log(`\n📦 ${brand.toUpperCase()} — ${plan.posts.length} posts`);

  const csv = buildCsvFromPlan(plan);
  const missingVideos = plan.posts.filter((p) => !p.videoUrl).map((p) => p.id);

  const zip = new JSZip();
  zip.file("metricool.csv", csv);
  zip.file("posts.json", JSON.stringify(plan, null, 2));
  zip.file("README.txt", buildReadme(plan, brand, missingVideos));

  const zipName = `${brand}-${plan.year}-W${String(plan.week).padStart(2, "0")}.zip`;
  const zipPath = path.join(outDir, zipName);
  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  await writeFile(zipPath, buf);

  const sizeKb = Math.round(buf.length / 1024);
  console.log(`   ✓ ${zipName} (${sizeKb} KB · ${plan.posts.length * 3} linhas CSV)`);
  if (missingVideos.length > 0) {
    console.log(`   ⚠ ${missingVideos.length} post(s) sem videoUrl — corre weekly:render primeiro`);
  }
  return zipPath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printGenericHelp(); return; }

  const year = currentYear();
  const week = args.semana;
  const outDir = path.join(APP_ROOT, "dist", "weekly", `${year}-W${String(week).padStart(2, "0")}`);
  await mkdir(outDir, { recursive: true });

  console.log(`\n📦 Package semanal — ${year} W${week}`);
  console.log(`   Output: ${path.relative(APP_ROOT, outDir)}/`);

  await packBrand(outDir, "loranne");
  await packBrand(outDir, "ancient-ground");

  console.log(`\n✅ ZIPs prontos para upload no Metricool.\n`);
}

main().catch((err) => { console.error("\n✗", err.message); process.exit(1); });
