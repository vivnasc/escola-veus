/**
 * curso preview — generates an HTML preview of slides.json
 *
 * Opens in the default browser. Uses the Escola dos Véus editorial dark style:
 * - Background: #0d0d0d
 * - Text: #f0ece6 (cream)
 * - Accent: #E94560 (coral) + #533483 (purple)
 * - Fonts: DM Serif Display + Nunito (loaded from Google Fonts)
 */

const fs = require("fs");
const path = require("path");
const { parseNamedArgs } = require("./args");
const { execSync } = require("child_process");

function generateHTML(data) {
  const slides = data.slides;
  const slidesJSON = JSON.stringify(slides);

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1920">
<title>Preview — ${data.titulo || "Escola dos Véus"}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: #0d0d0d;
    color: #f0ece6;
    font-family: 'Nunito', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
  }

  .header {
    text-align: center;
    margin-bottom: 40px;
    max-width: 800px;
  }

  .header h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    color: #f0ece6;
    margin-bottom: 8px;
  }

  .header .meta {
    color: #6a6460;
    font-size: 14px;
  }

  .header .meta span {
    color: #E94560;
  }

  .controls {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    background: rgba(13, 13, 13, 0.95);
    padding: 12px 24px;
    border-radius: 12px;
    border: 1px solid #333;
    z-index: 100;
    align-items: center;
  }

  .controls button {
    background: #1a1a1a;
    color: #f0ece6;
    border: 1px solid #444;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    transition: all 0.2s;
  }

  .controls button:hover { background: #333; }
  .controls button.active { background: #E94560; border-color: #E94560; }

  .controls .counter {
    color: #6a6460;
    font-size: 14px;
    min-width: 80px;
    text-align: center;
  }

  .slide-container {
    width: 960px;
    margin-bottom: 100px;
  }

  .slide {
    width: 960px;
    height: 540px;
    background: #0d0d0d;
    border: 1px solid #222;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px 144px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.3s;
  }

  .slide:hover { border-color: #444; }
  .slide.active { border-color: #E94560; }

  .slide-number {
    position: absolute;
    top: 12px;
    left: 16px;
    font-size: 11px;
    color: #444;
    font-family: 'Nunito', sans-serif;
  }

  .slide-type {
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #E94560;
    font-family: 'Nunito', sans-serif;
  }

  .slide-duration {
    position: absolute;
    bottom: 12px;
    right: 16px;
    font-size: 11px;
    color: #444;
  }

  /* Title slide */
  .slide.type-title .label {
    font-family: 'Nunito', sans-serif;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #E94560;
    margin-bottom: 16px;
  }

  .slide.type-title .main-text {
    font-family: 'DM Serif Display', serif;
    font-size: 36px;
    text-align: center;
    line-height: 1.3;
    color: #f0ece6;
  }

  .slide.type-title .accent-line {
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #E94560, #533483);
    margin-top: 16px;
  }

  /* Content slide */
  .slide.type-content .main-text {
    text-align: center;
    line-height: 1.6;
    color: #f0ece6;
  }

  .slide.type-content .main-text.short-text {
    font-family: 'DM Serif Display', serif;
    font-size: 30px;
  }

  .slide.type-content .main-text.long-text {
    font-family: 'Nunito', sans-serif;
    font-size: 22px;
  }

  /* Exercise slide */
  .slide.type-exercise .exercise-label {
    font-family: 'Nunito', sans-serif;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #E94560;
    margin-bottom: 20px;
  }

  .slide.type-exercise .exercise-icon {
    width: 6px;
    height: 6px;
    background: #E94560;
    border-radius: 50%;
    margin-bottom: 16px;
  }

  .slide.type-exercise .main-text {
    font-family: 'Nunito', sans-serif;
    font-size: 20px;
    text-align: center;
    line-height: 2;
    color: #f0ece6;
    white-space: pre-line;
  }

  /* End slide */
  .slide.type-end .main-text {
    font-family: 'DM Serif Display', serif;
    font-size: 36px;
    color: #f0ece6;
  }

  .slide.type-end .sub-text {
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    color: #6a6460;
    margin-top: 12px;
  }

  /* Fullscreen mode */
  .fullscreen .slide {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    border: none;
    border-radius: 0;
    z-index: 50;
    margin: 0;
  }

  .fullscreen .slide:not(.visible) { display: none; }
  .fullscreen .header { display: none; }
  .fullscreen .slide-container { margin: 0; }
</style>
</head>
<body>

<div class="header">
  <h1>${data.titulo || "Preview"}</h1>
  <div class="meta">
    ${data.curso ? `<span>${data.curso}</span> · ` : ""}
    ${data.modulo ? `Módulo ${data.modulo}` : ""}
    ${data.aula ? ` · Aula ${data.aula}` : ""} ·
    ${slides.length} slides ·
    ${Math.floor(slides.reduce((s, sl) => s + sl.duracao, 0) / 60)}:${String(slides.reduce((s, sl) => s + sl.duracao, 0) % 60).padStart(2, "0")} total
    ${data.musica ? ` · <span>♪</span> ${data.musica}` : ""}
  </div>
</div>

<div class="slide-container" id="slides">
</div>

<div class="controls">
  <button onclick="prevSlide()">← Anterior</button>
  <div class="counter" id="counter">1 / ${slides.length}</div>
  <button onclick="nextSlide()">Próximo →</button>
  <button onclick="toggleFullscreen()" id="fsBtn">Ecrã cheio</button>
  <button onclick="playAll()" id="playBtn">▶ Play</button>
</div>

<script>
const slides = ${slidesJSON};
let currentSlide = 0;
let isFullscreen = false;
let isPlaying = false;
let playTimer = null;

function renderSlides() {
  const container = document.getElementById('slides');
  container.innerHTML = '';

  slides.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'slide type-' + s.tipo;
    div.dataset.index = i;
    div.onclick = () => goToSlide(i);

    div.innerHTML = '<div class="slide-number">' + (i + 1) + '</div>';
    div.innerHTML += '<div class="slide-type">' + s.tipo + '</div>';
    div.innerHTML += '<div class="slide-duration">' + s.duracao + 's</div>';

    if (s.tipo === 'title') {
      if (s.subtexto) div.innerHTML += '<div class="label">' + esc(s.subtexto) + '</div>';
      div.innerHTML += '<div class="main-text">' + esc(s.texto) + '</div>';
      div.innerHTML += '<div class="accent-line"></div>';
    } else if (s.tipo === 'exercise') {
      div.innerHTML += '<div class="exercise-icon"></div>';
      div.innerHTML += '<div class="exercise-label">' + esc(s.label || 'Exercício') + '</div>';
      div.innerHTML += '<div class="main-text">' + esc(s.texto) + '</div>';
    } else if (s.tipo === 'end') {
      div.innerHTML += '<div class="main-text">' + esc(s.texto) + '</div>';
      if (s.subtexto) div.innerHTML += '<div class="sub-text">' + esc(s.subtexto) + '</div>';
    } else {
      const lines = s.texto.split('\\n').length;
      const cls = lines <= 2 && s.texto.length < 100 ? 'short-text' : 'long-text';
      div.innerHTML += '<div class="main-text ' + cls + '">' + esc(s.texto).replace(/\\n/g, '<br>') + '</div>';
    }

    container.appendChild(div);
  });

  updateActive();
}

function esc(t) {
  const d = document.createElement('div');
  d.textContent = t;
  return d.innerHTML;
}

function goToSlide(i) {
  currentSlide = Math.max(0, Math.min(slides.length - 1, i));
  updateActive();
}

function prevSlide() { goToSlide(currentSlide - 1); }
function nextSlide() { goToSlide(currentSlide + 1); }

function updateActive() {
  document.querySelectorAll('.slide').forEach((el, i) => {
    el.classList.toggle('active', i === currentSlide);
    if (isFullscreen) el.classList.toggle('visible', i === currentSlide);
  });
  document.getElementById('counter').textContent = (currentSlide + 1) + ' / ' + slides.length;

  if (isFullscreen) {
    const el = document.querySelector('.slide.active');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    const el = document.querySelector('.slide.active');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function toggleFullscreen() {
  isFullscreen = !isFullscreen;
  document.body.classList.toggle('fullscreen', isFullscreen);
  document.getElementById('fsBtn').textContent = isFullscreen ? 'Sair ecrã cheio' : 'Ecrã cheio';
  updateActive();
}

function playAll() {
  if (isPlaying) {
    clearTimeout(playTimer);
    isPlaying = false;
    document.getElementById('playBtn').textContent = '▶ Play';
    return;
  }

  isPlaying = true;
  document.getElementById('playBtn').textContent = '⏸ Pausa';
  if (!isFullscreen) toggleFullscreen();

  function advance() {
    if (!isPlaying) return;
    if (currentSlide >= slides.length - 1) {
      isPlaying = false;
      document.getElementById('playBtn').textContent = '▶ Play';
      return;
    }
    nextSlide();
    playTimer = setTimeout(advance, slides[currentSlide].duracao * 1000);
  }

  playTimer = setTimeout(advance, slides[currentSlide].duracao * 1000);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
  if (e.key === 'Escape') { if (isFullscreen) toggleFullscreen(); if (isPlaying) playAll(); }
  if (e.key === 'f') toggleFullscreen();
  if (e.key === 'p') playAll();
});

renderSlides();
</script>
</body>
</html>`;
}

async function cursoPreview(args) {
  const { opts, positional } = parseNamedArgs(args);

  if (opts.help || opts.h) {
    console.log(`
Uso: escola-veus curso preview [slides.json]

  Gera um HTML de preview dos slides. Abre no browser.

Teclas no preview:
  → ou Espaço    Proximo slide
  ←              Slide anterior
  F              Fullscreen
  P              Play automatico
  Esc            Sair fullscreen / parar play

Opcoes:
  --output, -o <path>   Ficheiro HTML (default: <nome>-preview.html)
  --no-open             Nao abrir no browser
  --help, -h            Esta mensagem
`);
    return;
  }

  const inputFile = positional[0];
  if (!inputFile) {
    console.error("Falta o ficheiro slides.json. Usa: escola-veus curso preview <slides.json>");
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`Ficheiro nao encontrado: ${inputFile}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

  if (!data.slides || !Array.isArray(data.slides)) {
    console.error("Ficheiro invalido: falta array 'slides'.");
    process.exit(1);
  }

  const html = generateHTML(data);
  const defaultOutput = inputFile.replace(/\.json$/, "-preview.html");
  const outputFile = opts.output || opts.o || defaultOutput;

  fs.mkdirSync(path.dirname(path.resolve(outputFile)), { recursive: true });
  fs.writeFileSync(outputFile, html, "utf-8");

  console.log(`✓ Preview gerado: ${outputFile}`);
  console.log(`  ${data.slides.length} slides`);
  console.log(`  Teclas: ← → navegacao | F fullscreen | P play | Esc sair`);

  // Try to open in browser
  if (!opts["no-open"]) {
    const absPath = path.resolve(outputFile);
    try {
      const platform = process.platform;
      if (platform === "darwin") execSync(`open "${absPath}"`);
      else if (platform === "win32") execSync(`start "${absPath}"`);
      else execSync(`xdg-open "${absPath}" 2>/dev/null || echo "Abre manualmente: ${absPath}"`);
    } catch {
      console.log(`  Abre manualmente: file://${absPath}`);
    }
  }
}

module.exports = { cursoPreview, generateHTML };
