#!/usr/bin/env node

/**
 * ThinkDiffusion Batch Image Generator
 *
 * Generates images in bulk via Automatic1111 REST API (ThinkDiffusion cloud).
 * Output: 1920x1080 images ready for Runway image-to-video.
 *
 * Usage:
 *   node generate.js --url http://YOUR-THINKDIFFUSION-URL:7860
 *   node generate.js --url http://... --category mar
 *   node generate.js --url http://... --id mar-01-golden-hour
 *   node generate.js --url http://... --batch-size 2 --steps 30
 *   node generate.js --url http://... --dry-run
 *
 * The ThinkDiffusion URL is shown in your browser when you launch Automatic1111.
 * It looks like: https://xxxxx.thinkdiffusion.xyz:7860
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// ── Config ──────────────────────────────────────────────────────────────────

const PROMPTS_FILE = path.join(__dirname, "prompts.json");
const OUTPUT_DIR = path.join(__dirname, "output");

// ── CLI Args ────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    url: null,
    category: null,
    id: null,
    batchSize: null,
    steps: null,
    cfgScale: null,
    sampler: null,
    dryRun: false,
    help: false,
    variations: null, // how many images per prompt (overrides config batch_size)
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--url":
      case "-u":
        opts.url = args[++i];
        break;
      case "--category":
      case "-c":
        opts.category = args[++i];
        break;
      case "--id":
        opts.id = args[++i];
        break;
      case "--batch-size":
      case "-b":
        opts.batchSize = parseInt(args[++i], 10);
        break;
      case "--variations":
      case "-v":
        opts.variations = parseInt(args[++i], 10);
        break;
      case "--steps":
        opts.steps = parseInt(args[++i], 10);
        break;
      case "--cfg":
        opts.cfgScale = parseFloat(args[++i]);
        break;
      case "--sampler":
        opts.sampler = args[++i];
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--help":
      case "-h":
        opts.help = true;
        break;
    }
  }

  return opts;
}

function printHelp() {
  console.log(`
ThinkDiffusion Batch Image Generator — Escola dos Véus

USO:
  node generate.js --url <A1111_URL> [opcoes]

OPCOES:
  --url, -u <url>        URL do Automatic1111 (obrigatorio)
                          Ex: https://xxxxx.thinkdiffusion.xyz:7860
  --category, -c <cat>   Filtrar por categoria (mar, praia, rio, ceu, chuva, savana, flora)
  --id <id>              Gerar apenas um prompt especifico
  --batch-size, -b <n>   Imagens por chamada API (default: config, max 4)
  --variations, -v <n>   Variacoes por prompt (gera N imagens, escolhe depois)
  --steps <n>            Override sampling steps (default: config)
  --cfg <n>              Override CFG scale (default: config)
  --sampler <name>       Override sampler (default: config)
  --dry-run              Mostra o que faria sem gerar nada
  --help, -h             Esta mensagem

EXEMPLOS:
  node generate.js --url https://abc123.thinkdiffusion.xyz:7860
  node generate.js --url https://abc123.thinkdiffusion.xyz:7860 -c mar
  node generate.js --url https://abc123.thinkdiffusion.xyz:7860 --id mar-01-golden-hour -v 6
  node generate.js --url https://abc123.thinkdiffusion.xyz:7860 --dry-run

OUTPUT:
  tools/thinkdiffusion-batch/output/<category>/<id>-v1.png, -v2.png, ...
`);
}

// ── HTTP helper ─────────────────────────────────────────────────────────────

function fetchJSON(url, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === "https:" ? https : http;

    const payload = JSON.stringify(body);
    const reqOpts = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: body ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload || ""),
      },
      // ThinkDiffusion uses self-signed certs sometimes
      rejectUnauthorized: false,
    };

    const req = mod.request(reqOpts, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          reject(new Error(`Resposta invalida (HTTP ${res.statusCode}): ${data.slice(0, 200)}`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(600000, () => {
      req.destroy();
      reject(new Error("Timeout (10 min) — a imagem demorou demasiado."));
    });

    if (body) req.write(payload);
    req.end();
  });
}

// ── Core ────────────────────────────────────────────────────────────────────

async function checkConnection(baseUrl) {
  try {
    const url = `${baseUrl}/sdapi/v1/sd-models`;
    const res = await fetchJSON(url, null);
    if (res.status === 200 && Array.isArray(res.data)) {
      const models = res.data.map((m) => m.title || m.model_name).slice(0, 5);
      console.log(`  Modelos disponiveis: ${models.join(", ")}${res.data.length > 5 ? ` (+${res.data.length - 5} mais)` : ""}`);
      return true;
    }
    console.error(`  Erro: resposta inesperada (HTTP ${res.status})`);
    return false;
  } catch (err) {
    console.error(`  Erro de conexao: ${err.message}`);
    return false;
  }
}

async function getProgress(baseUrl) {
  try {
    const res = await fetchJSON(`${baseUrl}/sdapi/v1/progress`, null);
    return res.data;
  } catch {
    return null;
  }
}

async function generateImage(baseUrl, prompt, negativePrompt, config) {
  const body = {
    prompt,
    negative_prompt: negativePrompt,
    width: config.width,
    height: config.height,
    cfg_scale: config.cfg_scale,
    steps: config.steps,
    sampler_name: config.sampler_name,
    batch_size: config.batch_size,
    seed: -1,
    // SDXL-specific
    enable_hr: false,
    send_images: true,
    save_images: false,
  };

  const res = await fetchJSON(`${baseUrl}/sdapi/v1/txt2img`, body);

  if (res.status !== 200) {
    throw new Error(`API erro HTTP ${res.status}: ${JSON.stringify(res.data).slice(0, 300)}`);
  }

  if (!res.data.images || res.data.images.length === 0) {
    throw new Error("API nao devolveu imagens.");
  }

  return res.data.images;
}

function saveImage(base64Data, filePath) {
  // A1111 sometimes includes metadata after a comma
  const clean = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const buffer = Buffer.from(clean, "base64");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
  return buffer.length;
}

function getExistingVariations(outputDir, promptId) {
  const dir = path.join(outputDir, promptId.split("-").slice(0, -1).join("-") || "misc");
  // Check category dir for this prompt
  const categoryDir = outputDir;
  const pattern = `${promptId}-v`;

  let count = 0;
  try {
    // Check in all subdirs
    const categories = fs.readdirSync(outputDir);
    for (const cat of categories) {
      const catPath = path.join(outputDir, cat);
      if (!fs.statSync(catPath).isDirectory()) continue;
      const files = fs.readdirSync(catPath);
      for (const f of files) {
        if (f.startsWith(promptId + "-v") && f.endsWith(".png")) {
          count++;
        }
      }
    }
  } catch {
    // dir doesn't exist yet
  }
  return count;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  if (opts.help) {
    printHelp();
    return;
  }

  if (!opts.url) {
    console.error("ERRO: --url obrigatorio. Usa --help para ver opcoes.");
    process.exit(1);
  }

  // Load prompts
  const data = JSON.parse(fs.readFileSync(PROMPTS_FILE, "utf-8"));
  const config = { ...data.config };
  let prompts = [...data.prompts];

  // CLI overrides
  if (opts.batchSize) config.batch_size = Math.min(opts.batchSize, 4);
  if (opts.steps) config.steps = opts.steps;
  if (opts.cfgScale) config.cfg_scale = opts.cfgScale;
  if (opts.sampler) config.sampler_name = opts.sampler;

  const variationsPerPrompt = opts.variations || config.batch_size;
  // For API calls, cap batch_size at 4 (A1111 limit for SDXL at high res)
  config.batch_size = Math.min(variationsPerPrompt, 4);

  // Filter prompts
  if (opts.id) {
    prompts = prompts.filter((p) => p.id === opts.id);
    if (prompts.length === 0) {
      console.error(`ERRO: prompt "${opts.id}" nao encontrado.`);
      console.log("IDs disponiveis:", data.prompts.map((p) => p.id).join(", "));
      process.exit(1);
    }
  } else if (opts.category) {
    prompts = prompts.filter((p) => p.category === opts.category);
    if (prompts.length === 0) {
      console.error(`ERRO: categoria "${opts.category}" nao encontrada.`);
      console.log("Categorias:", [...new Set(data.prompts.map((p) => p.category))].join(", "));
      process.exit(1);
    }
  }

  const baseUrl = opts.url.replace(/\/+$/, "");

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║    ThinkDiffusion Batch — Escola dos Véus                   ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log();
  console.log(`  Server:     ${baseUrl}`);
  console.log(`  Prompts:    ${prompts.length}`);
  console.log(`  Variacoes:  ${variationsPerPrompt} por prompt`);
  console.log(`  Resolucao:  ${config.width}x${config.height}`);
  console.log(`  Steps:      ${config.steps}  |  CFG: ${config.cfg_scale}`);
  console.log(`  Sampler:    ${config.sampler_name}`);
  console.log(`  Output:     ${OUTPUT_DIR}`);
  console.log();

  if (opts.dryRun) {
    console.log("── DRY RUN (nada sera gerado) ──\n");
    for (const p of prompts) {
      const existing = getExistingVariations(OUTPUT_DIR, p.id);
      const status = existing >= variationsPerPrompt ? "SKIP (ja existe)" : `GERAR (${existing}/${variationsPerPrompt} existem)`;
      console.log(`  [${p.category}] ${p.id} — ${status}`);
      console.log(`    Moods: ${p.mood.join(", ")}`);
      console.log(`    Prompt: ${p.prompt.slice(0, 80)}...`);
      console.log();
    }
    const toGenerate = prompts.filter((p) => getExistingVariations(OUTPUT_DIR, p.id) < variationsPerPrompt);
    console.log(`Total: ${toGenerate.length} prompts a gerar, ${prompts.length - toGenerate.length} ja completos.`);
    const totalImages = toGenerate.reduce((sum, p) => sum + variationsPerPrompt - getExistingVariations(OUTPUT_DIR, p.id), 0);
    const estimatedTime = totalImages * 25; // ~25s per image at 1920x1080 SDXL
    console.log(`Estimativa: ~${totalImages} imagens, ~${Math.ceil(estimatedTime / 60)} minutos.`);
    return;
  }

  // Test connection
  console.log("A testar conexao...");
  const connected = await checkConnection(baseUrl);
  if (!connected) {
    console.error("\nNao foi possivel conectar ao Automatic1111.");
    console.error("Verifica que:");
    console.error("  1. ThinkDiffusion esta activo (tier QUICK)");
    console.error("  2. O URL esta correcto (copiar da barra do browser)");
    console.error("  3. Automatic1111 terminou de carregar o checkpoint");
    process.exit(1);
  }
  console.log("  Conexao OK!\n");

  // Generate
  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const startTime = Date.now();

  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    const catDir = path.join(OUTPUT_DIR, p.category);
    const existing = getExistingVariations(OUTPUT_DIR, p.id);

    console.log(`[${i + 1}/${prompts.length}] ${p.id} (${p.category})`);

    if (existing >= variationsPerPrompt) {
      console.log(`  ✓ Ja tem ${existing} variacoes — SKIP\n`);
      totalSkipped++;
      continue;
    }

    const needed = variationsPerPrompt - existing;
    console.log(`  Existem ${existing}, faltam ${needed}...`);

    // Generate in batches of config.batch_size
    let generated = 0;
    let variationIndex = existing + 1;

    while (generated < needed) {
      const batchCount = Math.min(config.batch_size, needed - generated);
      const batchConfig = { ...config, batch_size: batchCount };

      try {
        console.log(`  A gerar ${batchCount} imagem(ns)...`);
        const genStart = Date.now();
        const images = await generateImage(baseUrl, p.prompt, config.negative_prompt, batchConfig);
        const elapsed = ((Date.now() - genStart) / 1000).toFixed(1);

        for (const img of images) {
          const filename = `${p.id}-v${variationIndex}.png`;
          const filePath = path.join(catDir, filename);
          const bytes = saveImage(img, filePath);
          const sizeMB = (bytes / 1024 / 1024).toFixed(1);
          console.log(`  ✓ ${filename} (${sizeMB} MB)`);
          variationIndex++;
          generated++;
          totalGenerated++;
        }

        console.log(`  (${elapsed}s)\n`);
      } catch (err) {
        console.error(`  ✗ ERRO: ${err.message}\n`);
        totalErrors++;
        break; // Skip to next prompt on error
      }
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log("══════════════════════════════════════════════════════════════");
  console.log(`  Completo em ${totalTime} min`);
  console.log(`  Geradas: ${totalGenerated}  |  Skipped: ${totalSkipped}  |  Erros: ${totalErrors}`);
  console.log(`  Output: ${OUTPUT_DIR}`);
  console.log("══════════════════════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("Erro fatal:", err.message);
  process.exit(1);
});
