#!/usr/bin/env node
/**
 * weekly:render — dispatcha render-short jobs e faz polling.
 *
 * Lê <year>-W<NN>/{loranne,ancient-ground}-plan.json. Para cada post:
 *  - se já tem videoUrl, skipa (idempotente).
 *  - senão: dispatcha render-short-submit, guarda jobId no plan,
 *    fica em poll loop até status=done.
 *
 * Atualiza o plan JSON com videoUrl + thumbnailUrl + jobId resolvidos.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseArgs, printGenericHelp } from "./lib/args.mjs";
import { setBaseUrl, dispatchRenderShort, getRenderStatus } from "./lib/api-client.mjs";
import { currentYear } from "./lib/schedule.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "..", "..");

const POLL_INTERVAL_MS = 15_000;
const POLL_TIMEOUT_MS = 30 * 60_000; // 30 min por job

async function loadPlan(outDir, brand) {
  try {
    const raw = await readFile(path.join(outDir, `${brand}-plan.json`), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function savePlan(outDir, brand, plan) {
  await writeFile(path.join(outDir, `${brand}-plan.json`), JSON.stringify(plan, null, 2));
}

async function dispatchOne(post, brand) {
  const manifest = {
    title: brand === "loranne"
      ? `${post.trackTitle} · ${post.albumTitle}`
      : post.label,
    slug: post.id,
    clips: post.clipUrls,
    clipDuration: 10,
    musicUrl: post.musicUrl,
    musicVolume: 0.9,
    // overlayPngs serão gerados se quiseres; por agora skip.
  };
  const { jobId } = await dispatchRenderShort(manifest);
  return jobId;
}

async function pollUntilDone(jobId) {
  const start = Date.now();
  while (true) {
    const elapsed = Date.now() - start;
    if (elapsed > POLL_TIMEOUT_MS) {
      throw new Error(`Timeout (${Math.round(elapsed / 1000)}s) ao aguardar ${jobId}`);
    }
    const status = await getRenderStatus(jobId);
    if (status?.status === "done") return status;
    if (status?.status === "failed") {
      throw new Error(`Job ${jobId} falhou: ${status.error || "sem detalhe"}`);
    }
    process.stdout.write(`.`);
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

async function processBrand(outDir, brand, dryRun) {
  const plan = await loadPlan(outDir, brand);
  if (!plan) {
    console.log(`   sem ${brand}-plan.json — skip`);
    return;
  }
  console.log(`\n🎬 ${brand.toUpperCase()} — ${plan.posts.length} posts`);

  const pending = plan.posts.filter((p) => !p.videoUrl);
  console.log(`   ${pending.length} pendentes (${plan.posts.length - pending.length} já renderizados)`);

  if (dryRun) {
    console.log(`   ⚠ DRY RUN — não dispatcha`);
    return;
  }

  // Dispatcha todos primeiro (paralelo limitado pelo runner GitHub).
  for (const post of pending) {
    if (!post.jobId) {
      process.stdout.write(`   dispatch ${post.id} ... `);
      post.jobId = await dispatchOne(post, brand);
      console.log(`jobId=${post.jobId}`);
    }
  }
  await savePlan(outDir, brand, plan);

  // Poll cada um até done.
  for (const post of pending) {
    process.stdout.write(`   poll ${post.id} `);
    try {
      const status = await pollUntilDone(post.jobId);
      post.videoUrl = status.videoUrl || status.url || null;
      post.thumbnailUrl = status.thumbnailUrl || null;
      console.log(` ✓`);
    } catch (e) {
      console.log(` ✗ ${e.message}`);
    }
  }
  await savePlan(outDir, brand, plan);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printGenericHelp(); return; }
  setBaseUrl(args.baseUrl);

  const year = currentYear();
  const week = args.semana;
  const outDir = path.join(APP_ROOT, "dist", "weekly", `${year}-W${String(week).padStart(2, "0")}`);
  await mkdir(outDir, { recursive: true });

  console.log(`\n🎬 Render semanal — ${year} W${week}`);
  console.log(`   Plan dir: ${path.relative(APP_ROOT, outDir)}/`);

  if (args.skipRenders) {
    console.log(`   ⚠ --skip-renders — apenas leitura\n`);
    return;
  }

  await processBrand(outDir, "loranne", args.dryRun);
  await processBrand(outDir, "ancient-ground", args.dryRun);

  console.log(`\n✅ Render completo. Próximo: npm run weekly:package -- --semana ${week}\n`);
}

main().catch((err) => { console.error("\n✗", err.message); process.exit(1); });
