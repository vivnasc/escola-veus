#!/usr/bin/env node

/**
 * Select images by mood for a specific script/hook.
 *
 * Usage:
 *   node select-by-mood.js calma
 *   node select-by-mood.js raiva libertacao
 *   node select-by-mood.js --list
 *
 * Mood mapping (from PROMPTS-THINKDIFFUSION.md):
 *   perda/luto     → melancólico     → chuva, nevoeiro, mar cinzento
 *   raiva          → poderoso        → trovoada, ondas fortes
 *   calma/paz      → sereno          → lago, lua, praia deserta, amanhecer
 *   recomeco/forca → esperançoso     → nascer do sol, cascata, broto
 *   desejo/prazer  → sensual         → flores, água quente, luz dourada
 *   solidao        → vasto           → baobá sozinho, horizonte, noite
 *   conexao        → orgânico        → mangal, rio, pássaros
 *   medo/vergonha  → envolto         → floresta densa, nevoeiro
 *   libertacao     → catártico       → chuva na praia, vento
 *   heranca        → ancestral       → baobá antigo, raízes, terra
 */

const fs = require("fs");
const path = require("path");

const PROMPTS_FILE = path.join(__dirname, "prompts.json");
const OUTPUT_DIR = path.join(__dirname, "output");

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log("Uso: node select-by-mood.js <mood1> [mood2] ...");
  console.log("     node select-by-mood.js --list");
  console.log();
  console.log("Moods: calma, contemplativo, raiva, libertacao, solidao,");
  console.log("       vasto, recomeco, esperanca, desejo, sensual,");
  console.log("       conexao, misterio, medo, poderoso, heranca,");
  console.log("       ancestral, catartico, vital, expansivo");
  process.exit(0);
}

const data = JSON.parse(fs.readFileSync(PROMPTS_FILE, "utf-8"));

if (args.includes("--list")) {
  const allMoods = new Set();
  for (const p of data.prompts) {
    for (const m of p.mood) allMoods.add(m);
  }
  console.log("Moods disponiveis:", [...allMoods].sort().join(", "));
  console.log();
  for (const mood of [...allMoods].sort()) {
    const matching = data.prompts.filter((p) => p.mood.includes(mood));
    console.log(`  ${mood}: ${matching.map((p) => p.id).join(", ")}`);
  }
  process.exit(0);
}

const targetMoods = args.map((a) => a.toLowerCase());
const matching = data.prompts.filter((p) =>
  p.mood.some((m) => targetMoods.includes(m))
);

if (matching.length === 0) {
  console.log(`Nenhum prompt encontrado para moods: ${targetMoods.join(", ")}`);
  process.exit(0);
}

console.log(`Prompts para moods [${targetMoods.join(", ")}]:\n`);

for (const p of matching) {
  console.log(`  ${p.id} (${p.category})`);
  console.log(`    Moods: ${p.mood.join(", ")}`);

  // Check for generated images
  const catDir = path.join(OUTPUT_DIR, p.category);
  try {
    const files = fs.readdirSync(catDir).filter(
      (f) => f.startsWith(p.id + "-v") && f.endsWith(".png")
    );
    if (files.length > 0) {
      console.log(`    Imagens: ${files.length} geradas`);
      for (const f of files) {
        console.log(`      ${path.join(catDir, f)}`);
      }
    } else {
      console.log(`    Imagens: nenhuma gerada`);
    }
  } catch {
    console.log(`    Imagens: nenhuma gerada`);
  }
  console.log();
}
