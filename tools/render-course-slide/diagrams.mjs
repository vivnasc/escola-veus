/**
 * Espelho de src/lib/diagrams.ts. Composições tipográficas com animações
 * SMIL nativas. NOTA: o render Puppeteer captura UM frame por slide, por
 * isso o MP4 final mostra o estado final das animações (fill="freeze").
 * As animações são visíveis no preview admin no browser. Para animação
 * no MP4, é preciso capturar sequência de frames (próxima fase).
 */

const FONT_SERIF = '"Cormorant Garamond", Georgia, serif';
const FONT_DISPLAY = '"DM Serif Display", Georgia, serif';
const FONT_SANS = '"Nunito", sans-serif';
const CREME = "#f0ece6";
const CREME_DIM = "#a8a298";

function header(width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="max-width:100%;height:auto;display:block">`;
}
function footer() { return `</svg>`; }
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function animFadeIn(begin = "0s", dur = "1s") {
  return `
    <animate attributeName="opacity" from="0" to="1" begin="${begin}" dur="${dur}" fill="freeze"/>
    <animateTransform attributeName="transform" type="translate" from="0 12" to="0 0" begin="${begin}" dur="${dur}" fill="freeze" calcMode="spline" keySplines="0.22 1 0.36 1"/>`;
}
function animBreath(begin = "1.5s", dur = "5s") {
  return `<animate attributeName="opacity" values="1;0.92;1" begin="${begin}" dur="${dur}" repeatCount="indefinite"/>`;
}
function animDraw(length, begin = "0s", dur = "1.2s") {
  return `<animate attributeName="stroke-dashoffset" from="${length}" to="0" begin="${begin}" dur="${dur}" fill="freeze" calcMode="spline" keySplines="0.22 1 0.36 1"/>`;
}

function svgCirculo(term, accent) {
  const w = 900, h = 360, cx = w / 2, cy = h / 2;
  const fontSize = term.length <= 6 ? 180 : term.length <= 10 ? 140 : 100;
  return `${header(w, h)}
    <g>
      ${animFadeIn("0.1s", "1.2s")}
      <text x="${cx}" y="${cy + fontSize / 3}" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="${fontSize}" font-style="italic" fill="${accent}">
        ${esc(term)}
        ${animBreath("1.5s", "5s")}
      </text>
    </g>
  ${footer()}`;
}

function svgTriade(terms, accent) {
  const w = 900, h = 540, cx = w / 2;
  const labels = [terms[0] ?? "", terms[1] ?? "", terms[2] ?? ""];
  return `${header(w, h)}
    <g>${animFadeIn("0s", "0.9s")}<text x="160" y="120" text-anchor="start" font-family='${FONT_SERIF}' font-size="42" fill="${CREME_DIM}">${esc(labels[0])}</text></g>
    <g>${animFadeIn("0.6s", "1.1s")}<text x="${cx}" y="320" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="96" font-style="italic" fill="${accent}">${esc(labels[1])}${animBreath("2.2s", "5s")}</text></g>
    <g>${animFadeIn("1.2s", "0.9s")}<text x="${w - 160}" y="480" text-anchor="end" font-family='${FONT_SERIF}' font-size="42" font-style="italic" fill="${CREME_DIM}">${esc(labels[2])}</text></g>
  ${footer()}`;
}

function svgPareado(terms, accent) {
  const w = 900, h = 460;
  const left = terms[0] ?? "", right = terms[1] ?? "";
  const cx = w / 2;
  const lineLen = 160;
  return `${header(w, h)}
    <g>${animFadeIn("0s", "0.8s")}
      <text x="${cx}" y="100" text-anchor="middle" font-family='${FONT_SANS}' font-size="11" letter-spacing="8" fill="${CREME_DIM}">ANTES</text>
      <text x="${cx}" y="180" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="76" fill="${CREME}">${esc(left)}</text>
    </g>
    <line x1="${cx - 80}" y1="240" x2="${cx + 80}" y2="240" stroke="${accent}" stroke-width="0.8" opacity="0.8" stroke-dasharray="${lineLen}" stroke-dashoffset="${lineLen}">${animDraw(lineLen, "0.9s", "1s")}</line>
    <g>${animFadeIn("1.6s", "0.9s")}
      <text x="${cx}" y="300" text-anchor="middle" font-family='${FONT_SANS}' font-size="11" letter-spacing="8" fill="${accent}" opacity="0.9">DEPOIS</text>
      <text x="${cx}" y="380" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="76" font-style="italic" fill="${accent}">${esc(right)}</text>
    </g>
  ${footer()}`;
}

function svgSequencia(terms, accent) {
  const items = (terms || []).slice(0, 5).filter((t) => t && t.trim().length > 0);
  const n = items.length || 2;
  const w = 1100, lineH = 100, h = lineH * (n + 1) + 60;
  const ROMANS = ["i", "ii", "iii", "iv", "v"];
  const lines = items.map((t, i) => {
    const x = 120 + i * 80;
    const y = 100 + i * lineH;
    const begin = `${(i * 0.5).toFixed(2)}s`;
    return `<g>${animFadeIn(begin, "0.9s")}
      <text x="${x}" y="${y}" font-family='${FONT_SERIF}' font-style="italic" font-size="22" fill="${accent}" opacity="0.85">${ROMANS[i] ?? i + 1}.</text>
      <text x="${x + 50}" y="${y}" font-family='${FONT_DISPLAY}' font-size="58" font-style="italic" fill="${CREME}">${esc(t)}</text>
    </g>`;
  }).join("");
  return `${header(w, h)}${lines}${footer()}`;
}

function svgAnel(central, terms, accent) {
  const w = 1000, h = 700, cx = w / 2, cy = h / 2;
  const items = (terms || []).slice(0, 6).filter((t) => t && t.trim().length > 0);
  const n = items.length || 1;
  const radius = 280;
  const outer = items.map((t, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family='${FONT_SANS}' font-size="13" letter-spacing="5" fill="${CREME_DIM}">${esc(t.toUpperCase())}</text>`;
  }).join("");
  const centralFontSize = central.length <= 8 ? 130 : central.length <= 14 ? 100 : 80;
  return `${header(w, h)}
    <g transform="translate(${cx} ${cy})">${animFadeIn("0.8s", "1.2s")}
      <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="120s" repeatCount="indefinite"/>
        <g transform="translate(${-cx} ${-cy})">${outer}</g>
      </g>
    </g>
    <g>${animFadeIn("0s", "1s")}
      <text x="${cx}" y="${cy + centralFontSize / 3}" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="${centralFontSize}" font-style="italic" fill="${accent}">${esc(central)}${animBreath("1.8s", "5s")}</text>
    </g>
  ${footer()}`;
}

export function renderDiagram(d, accent) {
  if (!d || !d.type) return "";
  switch (d.type) {
    case "circulo":   return svgCirculo(d.terms?.[0] ?? "", accent);
    case "triade":    return svgTriade(d.terms ?? [], accent);
    case "pareado":   return svgPareado(d.terms ?? [], accent);
    case "sequencia": return svgSequencia(d.terms ?? [], accent);
    case "anel":      return svgAnel(d.central ?? "", d.terms ?? [], accent);
    default:          return "";
  }
}
