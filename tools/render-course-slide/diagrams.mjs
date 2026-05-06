/**
 * Espelho de src/lib/diagrams.ts. Composições tipográficas puras, sem
 * geometria.
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

function svgCirculo(term, accent) {
  const w = 900, h = 360, cx = w / 2, cy = h / 2;
  const fontSize = term.length <= 6 ? 180 : term.length <= 10 ? 140 : 100;
  return `${header(w, h)}
    <text x="${cx}" y="${cy + fontSize / 3}" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="${fontSize}" font-style="italic" fill="${accent}">${esc(term)}</text>
  ${footer()}`;
}

function svgTriade(terms, accent) {
  const w = 900, h = 540, cx = w / 2;
  const labels = [terms[0] ?? "", terms[1] ?? "", terms[2] ?? ""];
  return `${header(w, h)}
    <text x="160" y="120" text-anchor="start" font-family='${FONT_SERIF}' font-size="42" fill="${CREME_DIM}">${esc(labels[0])}</text>
    <text x="${cx}" y="320" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="96" font-style="italic" fill="${accent}">${esc(labels[1])}</text>
    <text x="${w - 160}" y="480" text-anchor="end" font-family='${FONT_SERIF}' font-size="42" font-style="italic" fill="${CREME_DIM}">${esc(labels[2])}</text>
  ${footer()}`;
}

function svgPareado(terms, accent) {
  const w = 900, h = 460;
  const left = terms[0] ?? "", right = terms[1] ?? "";
  const cx = w / 2;
  return `${header(w, h)}
    <text x="${cx}" y="100" text-anchor="middle" font-family='${FONT_SANS}' font-size="11" letter-spacing="8" fill="${CREME_DIM}">ANTES</text>
    <text x="${cx}" y="180" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="76" fill="${CREME}">${esc(left)}</text>
    <line x1="${cx - 80}" y1="240" x2="${cx + 80}" y2="240" stroke="${accent}" stroke-width="0.8" opacity="0.8"/>
    <text x="${cx}" y="300" text-anchor="middle" font-family='${FONT_SANS}' font-size="11" letter-spacing="8" fill="${accent}" opacity="0.9">DEPOIS</text>
    <text x="${cx}" y="380" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="76" font-style="italic" fill="${accent}">${esc(right)}</text>
  ${footer()}`;
}

function svgSequencia(terms, accent) {
  const items = (terms || []).slice(0, 5).filter((t) => t && t.trim().length > 0);
  const n = items.length || 2;
  const w = 1100;
  const lineH = 100;
  const h = lineH * (n + 1) + 60;
  const ROMANS = ["i", "ii", "iii", "iv", "v"];
  const lines = items.map((t, i) => {
    const x = 120 + i * 80;
    const y = 100 + i * lineH;
    return `
      <text x="${x}" y="${y}" font-family='${FONT_SERIF}' font-style="italic" font-size="22" fill="${accent}" opacity="0.85">${ROMANS[i] ?? i + 1}.</text>
      <text x="${x + 50}" y="${y}" font-family='${FONT_DISPLAY}' font-size="58" font-style="italic" fill="${CREME}">${esc(t)}</text>`;
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
    ${outer}
    <text x="${cx}" y="${cy + centralFontSize / 3}" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="${centralFontSize}" font-style="italic" fill="${accent}">${esc(central)}</text>
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
