// generate.js — Renderiza os 42 slides do Carrossel "A Estação dos Véus".
// Lê content.json, injecta cada slide no template.html via window.SLIDE_DATA
// (antes do load), captura screenshot 1080×1920 com deviceScaleFactor 2
// (PNG final 2160×3840) usando Puppeteer.

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const TEMPLATE = path.join(ROOT, "template.html");
const CONTENT = path.join(ROOT, "content.json");
const OUTPUT = path.join(ROOT, "output");

const VIEWPORT = { width: 1080, height: 1920, deviceScaleFactor: 2 };

async function ensureDir(dir) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
}

async function resetOutput() {
  if (existsSync(OUTPUT)) await rm(OUTPUT, { recursive: true, force: true });
  await ensureDir(OUTPUT);
}

async function main() {
  console.log("→ a ler content.json");
  const content = JSON.parse(await readFile(CONTENT, "utf8"));
  await resetOutput();

  console.log("→ a iniciar Puppeteer");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const templateUrl = pathToFileURL(TEMPLATE).href;
  let total = 0;
  const previews = [];

  for (const dia of content.dias) {
    const diaDir = path.join(OUTPUT, `dia-${dia.numero}`);
    await ensureDir(diaDir);
    console.log(`\n=== Dia ${dia.numero} — ${dia.veu} (${dia.subtitulo}) ===`);

    for (let i = 0; i < dia.slides.length; i++) {
      const slide = dia.slides[i];
      const slideNum = i + 1;
      const fileName = `veu-${dia.numero}-slide-${slideNum}.png`;
      const filePath = path.join(diaDir, fileName);

      // Página nova por slide para garantir que o SLIDE_DATA é injectado
      // antes do <script> inline do template correr.
      const page = await browser.newPage();
      await page.setViewport(VIEWPORT);

      const data = { dia, slide, indiceSlide: i };
      await page.evaluateOnNewDocument((d) => {
        window.SLIDE_DATA = d;
      }, data);

      await page.goto(templateUrl, { waitUntil: "networkidle0" });
      await page.evaluateHandle("document.fonts.ready");
      // pequena pausa para layout estabilizar (gradiente radial + emoji)
      await new Promise((r) => setTimeout(r, 200));

      await page.screenshot({ path: filePath, type: "png", fullPage: false });
      await page.close();

      total++;
      previews.push({
        path: `dia-${dia.numero}/${fileName}`,
        veu: dia.veu,
        slide: slideNum,
        tipo: slide.tipo,
      });
      process.stdout.write(`  ✓ ${fileName}\n`);
    }
  }

  await browser.close();

  const indexHtml = buildIndexHtml(previews, content);
  await writeFile(path.join(OUTPUT, "index.html"), indexHtml, "utf8");

  console.log(`\n✓ ${total} slides gerados em ${OUTPUT}`);
  console.log(`✓ abre output/index.html para revisão`);
}

function buildIndexHtml(previews, content) {
  const cells = previews
    .map(
      (p) => `
      <figure>
        <img src="${p.path}" alt="${p.veu} slide ${p.slide}" loading="lazy" />
        <figcaption>${p.veu} · ${p.slide}<br><small>${p.tipo}</small></figcaption>
      </figure>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <title>Carrossel Véus — preview 7×6</title>
  <style>
    body { background: #0f1419; color: #f5efe6; font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 32px; }
    h1 { font-family: 'Cormorant Garamond', serif; font-weight: 300; margin: 0 0 24px; font-size: 36px; }
    .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 16px; }
    figure { margin: 0; background: #000; border-radius: 6px; overflow: hidden; }
    img { width: 100%; height: auto; display: block; aspect-ratio: 9/16; object-fit: cover; }
    figcaption { padding: 8px; font-size: 11px; letter-spacing: 0.1em; text-align: center; opacity: 0.7; }
    figcaption small { opacity: 0.5; font-size: 10px; }
  </style>
</head>
<body>
  <h1>${content.campanha} — 7 dias × 6 slides</h1>
  <div class="grid">${cells}</div>
</body>
</html>`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
