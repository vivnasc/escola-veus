// Renderiza o mesmo slide em 4 paletas para comparação visual:
//   A — Editorial sóbrio (ivory + carvão + dourado fino)
//   B-luz — Dual luz (ivory + tinta + dourado quente) ← versão luz actual aprimorada
//   B-sombra — Dual sombra (indigo + ivory + dourado)
//   C — Terra única (argila + castanho-tinta + latão)
// Saída: output/compare-paletas.jpg — uma imagem 2x2 para review no telemóvel.
import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_URL = "file://" + path.join(__dirname, "template.html");

const content = JSON.parse(fs.readFileSync(path.join(__dirname, "content.json"), "utf8"));
// Slide representativo: D5S3 (poético curto, mostra tipografia em destaque)
const DIA = content.dias.find((d) => d.numero === 5);
const SLIDE_INDEX = 2; // veu-5-slide-3 (poetic "O vazio que sentes…")

const PALETAS = [
  {
    id: "A",
    nome: "A · Editorial sóbrio",
    desc: "ivory + carvão + dourado fino. Máxima coerência anual. A foto MJ é a única variável.",
    vars: {
      "--ink": "#26221c",
      "--ivory": "#f3ece0",
      "--parchment-dark": "#d8d0c1",
      "--deep": "#1a1714",
      "--deep-warm": "#2a2520",
      "--terracotta": "#8a8378",
      "--gold": "#b69a6e",
      "--mist": "rgba(243, 236, 224, 0.65)",
    },
  },
  {
    id: "B-luz",
    nome: "B · Dual — modo LUZ",
    desc: "ivory + tinta quente + dourado. Versão clara da marca. Para campanhas de manhã/abertura.",
    vars: {
      "--ink": "#2a2118",
      "--ivory": "#f5ead5",
      "--parchment-dark": "#dccbab",
      "--deep": "#1c150e",
      "--deep-warm": "#2e2418",
      "--terracotta": "#a8704a",
      "--gold": "#c9a14a",
      "--mist": "rgba(245, 234, 213, 0.70)",
    },
  },
  {
    id: "B-sombra",
    nome: "B · Dual — modo SOMBRA",
    desc: "indigo profundo + ivory + dourado. Versão escura da marca. Para campanhas de noite/profundidade.",
    vars: {
      "--ink": "#e8dcc0",
      "--ivory": "#0f0f1a",
      "--parchment-dark": "#1a1a26",
      "--deep": "#06070d",
      "--deep-warm": "#13141f",
      "--terracotta": "#b08458",
      "--gold": "#d4b46a",
      "--mist": "rgba(232, 220, 192, 0.55)",
    },
  },
  {
    id: "C",
    nome: "C · Terra única",
    desc: "argila quente + castanho-tinta + latão. Coerência forte mas exige fotos MJ quentes.",
    vars: {
      "--ink": "#3a261a",
      "--ivory": "#e8d3b5",
      "--parchment-dark": "#cdb592",
      "--deep": "#1c0f08",
      "--deep-warm": "#3a1f10",
      "--terracotta": "#a85a32",
      "--gold": "#b88848",
      "--mist": "rgba(232, 211, 181, 0.65)",
    },
  },
];

function varsToCss(vars) {
  return `:root { ${Object.entries(vars).map(([k, v]) => `${k}: ${v} !important;`).join(" ")} }`;
}

async function renderSlide(browser, paleta) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument(
    (data) => {
      window.SLIDE_DATA = data;
    },
    { dia: DIA, slide: DIA.slides[SLIDE_INDEX], indiceSlide: SLIDE_INDEX }
  );
  await page.goto(TEMPLATE_URL, { waitUntil: "networkidle0" });
  await page.addStyleTag({ content: varsToCss(paleta.vars) });
  await page.evaluateHandle("document.fonts.ready");
  await new Promise((r) => setTimeout(r, 200));
  const buf = await page.screenshot({ type: "png", fullPage: false });
  await page.close();
  return buf;
}

const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
console.log("→ a renderizar o slide D5S3 em 4 paletas…");

const outDir = path.join(__dirname, "output", "paletas");
fs.mkdirSync(outDir, { recursive: true });

const renders = [];
for (const p of PALETAS) {
  const buf = await renderSlide(browser, p);
  const file = path.join(outDir, `${p.id}.png`);
  fs.writeFileSync(file, buf);
  renders.push({ ...p, file });
  console.log("  ✓", p.id);
}

// Compor o comparativo 2x2 via HTML+screenshot
const grid = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  body { background:#15110d; color:#f0e6d2; font-family:'Inter',system-ui,sans-serif; margin:0; padding:40px; }
  h1 { font-family:'Cormorant Garamond',serif; font-weight:300; font-size:48px; margin:0 0 24px; letter-spacing:-0.02em; }
  .sub { font-size:14px; opacity:0.6; margin:0 0 32px; max-width:1400px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:28px; max-width:1700px; }
  figure { margin:0; }
  .img { aspect-ratio:9/16; max-height:780px; background:#000; border-radius:8px; overflow:hidden; }
  .img img { width:100%; height:100%; object-fit:cover; display:block; }
  figcaption { padding:14px 4px 0; }
  .id { font-size:22px; font-weight:600; letter-spacing:0.05em; margin:0 0 6px; }
  .desc { font-size:13px; opacity:0.75; line-height:1.5; margin:0 0 8px; }
  .swatches { display:flex; gap:6px; align-items:center; font-size:11px; opacity:0.7; }
  .sw { width:18px; height:18px; border-radius:3px; border:1px solid rgba(255,255,255,0.15); }
</style></head><body>
  <h1>Comparativo de paletas — slide D5·S3 ("O vazio que sentes…")</h1>
  <p class="sub">O mesmo slide nas 4 direcções propostas. Mesma tipografia, mesma estrutura — só a paleta muda. Os fundos MJ ainda não estão aplicados; pensa que estas paletas vão emoldurar a foto, não substituí-la.</p>
  <div class="grid">
    ${renders.map((p) => `
      <figure>
        <div class="img"><img src="paletas/${p.id}.png" alt="${p.nome}" /></div>
        <figcaption>
          <p class="id">${p.nome}</p>
          <p class="desc">${p.desc}</p>
          <div class="swatches">
            <span class="sw" style="background:${p.vars["--ivory"]}"></span>
            <span class="sw" style="background:${p.vars["--ink"]}"></span>
            <span class="sw" style="background:${p.vars["--gold"]}"></span>
            <span class="sw" style="background:${p.vars["--deep"]}"></span>
            <span>ivory · ink · gold · deep</span>
          </div>
        </figcaption>
      </figure>
    `).join("")}
  </div>
</body></html>`;

const gridHtmlPath = path.join(__dirname, "output", "compare-paletas.html");
fs.writeFileSync(gridHtmlPath, grid);

const composer = await browser.newPage();
await composer.setViewport({ width: 1800, height: 1200, deviceScaleFactor: 1 });
await composer.goto("file://" + gridHtmlPath, { waitUntil: "networkidle0" });
await composer.evaluateHandle("document.fonts.ready");
await new Promise((r) => setTimeout(r, 300));
await composer.screenshot({
  path: path.join(__dirname, "output", "compare-paletas.jpg"),
  type: "jpeg",
  quality: 82,
  fullPage: true,
});
await composer.close();
await browser.close();

console.log("✓ output/compare-paletas.jpg pronto");
