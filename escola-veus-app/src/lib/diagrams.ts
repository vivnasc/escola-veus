/**
 * Composições tipográficas ANIMADAS para os slides das aulas. SMIL nativo
 * SVG (sem JS, sem libs externas, suporte universal em browser e Puppeteer).
 *
 * Filosofia: não há voz. As coisas têm de respirar visualmente.
 *
 * 5 composições, todas com animação à entrada + algo a "viver" ao longo
 * do tempo:
 *   - circulo:   palavra aparece com scale-in, depois pulsa muito ligeiro
 *   - triade:    três palavras revelam-se em cascata (haiku temporal)
 *   - pareado:   ANTES → palavra → hairline desenha-se → DEPOIS → palavra
 *   - sequencia: passos descem em escada, um a um (i → ii → iii → iv)
 *   - anel:      central pulsa; periféricos rodam à volta lentamente
 */

export type DiagramType = "circulo" | "triade" | "pareado" | "sequencia" | "anel";

export type Diagram = {
  type: DiagramType;
  terms: string[];
  central?: string;
};

const FONT_SERIF = '"Cormorant Garamond", Georgia, serif';
const FONT_DISPLAY = '"DM Serif Display", Georgia, serif';
const FONT_SANS = '"Nunito", sans-serif';
const CREME = "#f0ece6";
const CREME_DIM = "#a8a298";

function header(width: number, height: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="max-width:100%;height:auto;display:block">`;
}
function footer() { return `</svg>`; }
function esc(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c] as string));
}

// ─── Helpers de animação SMIL ─────────────────────────────────────────────
// NOTA: SMIL não dispara em SVG injectado via innerHTML depois do parse
// inicial. Por isso TODOS os elementos começam em opacity 1 (visíveis por
// defeito); a animação faz override se conseguir disparar. Se não disparar,
// pelo menos o conteúdo é visível.

/** Fade + rise à entrada, depois fica. Não usa opacity 0 inicial. */
function animFadeIn(begin = "0s", dur = "1s") {
  return `
    <animate attributeName="opacity" values="0;1" begin="${begin}" dur="${dur}" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 12" to="0 0" begin="${begin}" dur="${dur}" fill="freeze" calcMode="spline" keySplines="0.22 1 0.36 1"/>`;
}

/** Pulsação muito subtil (0.5% scale up/down) em loop. */
function animBreath(begin = "1.5s", dur = "5s") {
  return `<animate attributeName="opacity" values="1;0.92;1" begin="${begin}" dur="${dur}" repeatCount="indefinite"/>`;
}

/** Linha que se desenha (strokeDashoffset). */
function animDraw(length: number, begin = "0s", dur = "1.2s") {
  return `<animate attributeName="stroke-dashoffset" from="${length}" to="0" begin="${begin}" dur="${dur}" fill="freeze" calcMode="spline" keySplines="0.22 1 0.36 1"/>`;
}

// ─── 1. ÂNCORA — composição editorial em 6 camadas ─────────────────────
// Construção tipo abertura de capítulo de livro:
//   - ornamento dingbat caligráfico (❦) acima
//   - label meta "ÂNCORA" em sans wide
//   - hairline horizontal longa com terminais
//   - PALAVRA enorme italic display
//   - hairline curta centrada com ornamento ao meio
//   - dingbat de fecho (✦)
function svgCirculo(term: string, accent: string): string {
  const w = 900, h = 560, cx = w / 2;
  const fontSize = term.length <= 6 ? 168 : term.length <= 10 ? 132 : 96;
  const yOrnTop = 70;
  const yLabel = 110;
  const yLineTop = 145;
  const yWord = 305;
  const yLineBot = 405;
  const yOrnBot = 460;

  const longLineLen = 360;
  const shortLineLen = 100;

  return `${header(w, h)}
    <g>
      ${animFadeIn("0s", "0.7s")}
      <!-- Ornamento dingbat caligráfico no topo -->
      <text x="${cx}" y="${yOrnTop}" text-anchor="middle" font-family='${FONT_SERIF}' font-size="28" fill="${accent}" opacity="0.55">❦</text>
    </g>

    <g>
      ${animFadeIn("0.2s", "0.7s")}
      <!-- Label meta -->
      <text x="${cx}" y="${yLabel}" text-anchor="middle" font-family='${FONT_SANS}' font-size="11" letter-spacing="6" fill="${accent}" opacity="0.7">ÂNCORA</text>
    </g>

    <!-- Hairline longa horizontal com terminais -->
    <g>
      ${animFadeIn("0.4s", "0.9s")}
      <line x1="${cx - longLineLen / 2}" y1="${yLineTop}" x2="${cx + longLineLen / 2}" y2="${yLineTop}" stroke="${accent}" stroke-width="0.7" opacity="0.6"/>
      <circle cx="${cx - longLineLen / 2}" cy="${yLineTop}" r="2.5" fill="${accent}" opacity="0.8"/>
      <circle cx="${cx + longLineLen / 2}" cy="${yLineTop}" r="2.5" fill="${accent}" opacity="0.8"/>
    </g>

    <!-- Palavra-âncora gigante italic -->
    <g>
      ${animFadeIn("0.7s", "1.1s")}
      <text x="${cx}" y="${yWord}" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="${fontSize}" font-style="italic" fill="${accent}">
        ${esc(term)}
        ${animBreath("2s", "5s")}
      </text>
    </g>

    <!-- Hairline curta de fecho com ornamento ao meio -->
    <g>
      ${animFadeIn("1.2s", "0.8s")}
      <line x1="${cx - shortLineLen}" y1="${yLineBot}" x2="${cx - 14}" y2="${yLineBot}" stroke="${accent}" stroke-width="0.7" opacity="0.6"/>
      <line x1="${cx + 14}" y1="${yLineBot}" x2="${cx + shortLineLen}" y2="${yLineBot}" stroke="${accent}" stroke-width="0.7" opacity="0.6"/>
      <circle cx="${cx}" cy="${yLineBot}" r="3" fill="none" stroke="${accent}" stroke-width="0.8" opacity="0.85"/>
    </g>

    <!-- Dingbat de fecho -->
    <g>
      ${animFadeIn("1.5s", "0.7s")}
      <text x="${cx}" y="${yOrnBot}" text-anchor="middle" font-family='${FONT_SERIF}' font-size="22" fill="${accent}" opacity="0.5">✦</text>
    </g>
  ${footer()}`;
}

// ─── 2. CONSTELAÇÃO ───────────────────────────────────────────────────────
function svgTriade(terms: string[], accent: string): string {
  const w = 900, h = 540, cx = w / 2;
  const labels = [terms[0] ?? "", terms[1] ?? "", terms[2] ?? ""];
  return `${header(w, h)}
    <g>
      ${animFadeIn("0s", "0.9s")}
      <text x="160" y="120" text-anchor="start" font-family='${FONT_SERIF}' font-size="42" fill="${CREME_DIM}">${esc(labels[0])}</text>
    </g>
    <g>
      ${animFadeIn("0.6s", "1.1s")}
      <text x="${cx}" y="320" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="96" font-style="italic" fill="${accent}">
        ${esc(labels[1])}
        ${animBreath("2.2s", "5s")}
      </text>
    </g>
    <g>
      ${animFadeIn("1.2s", "0.9s")}
      <text x="${w - 160}" y="480" text-anchor="end" font-family='${FONT_SERIF}' font-size="42" font-style="italic" fill="${CREME_DIM}">${esc(labels[2])}</text>
    </g>
  ${footer()}`;
}

// ─── 3. PÓLOS ─────────────────────────────────────────────────────────────
function svgPareado(terms: string[], accent: string): string {
  const w = 900, h = 460;
  const left = terms[0] ?? "";
  const right = terms[1] ?? "";
  const cx = w / 2;
  const lineLen = 160; // entre x=cx-80 e x=cx+80
  return `${header(w, h)}
    <g>
      ${animFadeIn("0s", "0.8s")}
      <text x="${cx}" y="100" text-anchor="middle" font-family='${FONT_SANS}' font-size="11" letter-spacing="8" fill="${CREME_DIM}">ANTES</text>
      <text x="${cx}" y="180" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="76" fill="${CREME}">${esc(left)}</text>
    </g>
    <line x1="${cx - 80}" y1="240" x2="${cx + 80}" y2="240" stroke="${accent}" stroke-width="0.8" opacity="0.8" stroke-dasharray="${lineLen}" stroke-dashoffset="${lineLen}">
      ${animDraw(lineLen, "0.9s", "1s")}
    </line>
    <g>
      ${animFadeIn("1.6s", "0.9s")}
      <text x="${cx}" y="300" text-anchor="middle" font-family='${FONT_SANS}' font-size="11" letter-spacing="8" fill="${accent}" opacity="0.9">DEPOIS</text>
      <text x="${cx}" y="380" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="76" font-style="italic" fill="${accent}">${esc(right)}</text>
    </g>
  ${footer()}`;
}

// ─── 4. PASSAGEM ──────────────────────────────────────────────────────────
function svgSequencia(terms: string[], accent: string): string {
  const items = terms.slice(0, 5).filter((t) => t && t.trim().length > 0);
  const n = items.length || 2;
  const w = 1100;
  const lineH = 100;
  const h = lineH * (n + 1) + 60;
  const ROMANS = ["i", "ii", "iii", "iv", "v"];

  const lines = items
    .map((t, i) => {
      const x = 120 + i * 80;
      const y = 100 + i * lineH;
      const begin = `${(i * 0.5).toFixed(2)}s`;
      return `
      <g>
        ${animFadeIn(begin, "0.9s")}
        <text x="${x}" y="${y}" font-family='${FONT_SERIF}' font-style="italic" font-size="22" fill="${accent}" opacity="0.85">${ROMANS[i] ?? i + 1}.</text>
        <text x="${x + 50}" y="${y}" font-family='${FONT_DISPLAY}' font-size="58" font-style="italic" fill="${CREME}">${esc(t)}</text>
      </g>`;
    })
    .join("");

  return `${header(w, h)}${lines}${footer()}`;
}

// ─── 5. ÓRBITA ────────────────────────────────────────────────────────────
function svgAnel(central: string, terms: string[], accent: string): string {
  const w = 1000, h = 700, cx = w / 2, cy = h / 2;
  const items = terms.slice(0, 6).filter((t) => t && t.trim().length > 0);
  const n = items.length || 1;
  const radius = 280;

  const outer = items
    .map((t, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family='${FONT_SANS}' font-size="13" letter-spacing="5" fill="${CREME_DIM}">${esc(t.toUpperCase())}</text>`;
    })
    .join("");

  const centralFontSize = central.length <= 8 ? 130 : central.length <= 14 ? 100 : 80;

  return `${header(w, h)}
    <g transform="translate(${cx} ${cy})">
      ${animFadeIn("0.8s", "1.2s")}
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="120s" repeatCount="indefinite"/>
        <g transform="translate(${-cx} ${-cy})">
          ${outer}
        </g>
      </g>
    </g>
    <g>
      ${animFadeIn("0s", "1s")}
      <text x="${cx}" y="${cy + centralFontSize / 3}" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="${centralFontSize}" font-style="italic" fill="${accent}">
        ${esc(central)}
        ${animBreath("1.8s", "5s")}
      </text>
    </g>
  ${footer()}`;
}

export function renderDiagram(d: Diagram, accent: string): string {
  switch (d.type) {
    case "circulo":   return svgCirculo(d.terms[0] ?? "", accent);
    case "triade":    return svgTriade(d.terms, accent);
    case "pareado":   return svgPareado(d.terms, accent);
    case "sequencia": return svgSequencia(d.terms, accent);
    case "anel":      return svgAnel(d.central ?? "", d.terms, accent);
    default:          return "";
  }
}

export const DIAGRAM_LABELS: Record<DiagramType, string> = {
  circulo: "Âncora — palavra única que respira",
  triade: "Constelação — 3 palavras em cascata",
  pareado: "Pólos — antes / linha que desenha / depois",
  sequencia: "Passagem — passos a descer em escada",
  anel: "Órbita — central pulsa, periféricos rodam",
};
