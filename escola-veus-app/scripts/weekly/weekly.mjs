#!/usr/bin/env node
/**
 * weekly — corre plan + render + package em sequência.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseArgs, printGenericHelp } from "./lib/args.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runStep(name, file, argv) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  weekly:${name}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  const res = spawnSync(
    process.execPath,
    ["--import", "tsx", path.join(__dirname, file), ...argv],
    { stdio: "inherit" },
  );
  if (res.status !== 0) {
    console.error(`✗ weekly:${name} falhou (exit ${res.status})`);
    process.exit(res.status || 1);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printGenericHelp(); return; }

  const argv = process.argv.slice(2);
  runStep("plan", "plan.mjs", argv);
  if (!args.skipRenders) {
    runStep("render", "render.mjs", argv);
  }
  runStep("package", "package.mjs", argv);

  console.log(`\n🎉 Weekly completo para semana ${args.semana}.\n`);
}

main();
