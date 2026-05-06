/**
 * Espelho de src/lib/diagrams.ts em JS puro. Composições editoriais
 * tipográficas, sem caixas a fechar palavras.
 */

const FONT_SERIF = '"Cormorant Garamond", Georgia, serif';
const FONT_SANS = '"Nunito", sans-serif';
const CREME = "#f0ece6";

function header(width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="max-width:100%;height:auto;display:block">`;
}
function footer() { return `</svg>`; }
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function flourishHorizontal(cx, cy, width, accent, flip = false) {
  const half = width / 2;
  const sign = flip ? -1 : 1;
  const x1 = cx - half;
  const x2 = cx + half;
  const c1x = cx - half / 2.5;
  const c1y = cy + sign * 8;
  const c2x = cx + half / 2.5;
  const c2y = cy - sign * 8;
  const path = `M ${x1} ${cy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${cx} ${cy} S ${x2} ${cy}, ${x2} ${cy}`;
  return `
    <path d="${path}" fill="none" stroke="${accent}" stroke-width="0.8" opacity="0.7" stroke-linecap="round"/>
    <circle cx="${x1}" cy="${cy}" r="2" fill="${accent}" opacity="0.7"/>
    <circle cx="${x2}" cy="${cy}" r="2" fill="${accent}" opacity="0.7"/>
    <circle cx="${cx}" cy="${cy}" r="1.5" fill="${accent}" opacity="0.5"/>`;
}

function ornamentTriangle(cx, cy, size, accent) {
  const r = size;
  const top = { x: cx, y: cy - r };
  const bl = { x: cx - r * 0.866, y: cy + r * 0.5 };
  const br = { x: cx + r * 0.866, y: cy + r * 0.5 };
  return `
    <circle cx="${top.x}" cy="${top.y}" r="2" fill="${accent}" opacity="0.7"/>
    <circle cx="${bl.x.toFixed(1)}" cy="${bl.y.toFixed(1)}" r="2" fill="${accent}" opacity="0.7"/>
    <circle cx="${br.x.toFixed(1)}" cy="${br.y.toFixed(1)}" r="2" fill="${accent}" opacity="0.7"/>`;
}

function svgCirculo(term, accent) {
  const w = 720, h = 360, cx = w / 2, cy = h / 2;
  return `${header(w, h)}
    ${flourishHorizontal(cx, cy - 80, 220, accent, false)}
    <text x="${cx}" y="${cy + 22}" text-anchor="middle" font-family='${FONT_SERIF}' font-size="84" font-style="italic" fill="${CREME}" font-weight="500">${esc(term)}</text>
    ${flourishHorizontal(cx, cy + 80, 220, accent, true)}
  ${footer()}`;
}

function svgTriade(terms, accent) {
  const w = 800, h = 460, cx = w / 2;
  const top = { x: cx, y: 90 };
  const bl = { x: 160, y: 380 };
  const br = { x: w - 160, y: 380 };
  const labels = [terms[0] ?? "", terms[1] ?? "", terms[2] ?? ""];
  const pts = [top, bl, br];

  const centerOrnament = ornamentTriangle(cx, 270, 14, accent);
  const lines = pts.map((p) => `<line x1="${cx}" y1="270" x2="${p.x}" y2="${p.y - 5}" stroke="${accent}" stroke-width="0.4" opacity="0.25" stroke-dasharray="1 6"/>`).join("");
  const nodes = pts.map((p, i) => {
    const dy = i === 0 ? 8 : 22;
    return `<text x="${p.x}" y="${p.y + dy}" text-anchor="middle" font-family='${FONT_SERIF}' font-size="44" font-style="italic" fill="${CREME}">${esc(labels[i])}</text>`;
  }).join("");

  return `${header(w, h)}${lines}${centerOrnament}${nodes}${footer()}`;
}

function svgPareado(terms, accent) {
  const w = 880, h = 320;
  const left = terms[0] ?? "", right = terms[1] ?? "";
  const cx = w / 2;
  const yTop = 80, yBot = h - 80, yMid = h / 2;

  const vline = `<line x1="${cx}" y1="${yTop + 10}" x2="${cx}" y2="${yBot - 10}" stroke="${accent}" stroke-width="0.5" opacity="0.5"/>`;
  const swashTop = `<path d="M ${cx - 14} ${yTop} Q ${cx} ${yTop + 8}, ${cx + 14} ${yTop}" fill="none" stroke="${accent}" stroke-width="0.7" opacity="0.7" stroke-linecap="round"/>`;
  const swashBot = `<path d="M ${cx - 14} ${yBot} Q ${cx} ${yBot - 8}, ${cx + 14} ${yBot}" fill="none" stroke="${accent}" stroke-width="0.7" opacity="0.7" stroke-linecap="round"/>`;
  const midDot = `<circle cx="${cx}" cy="${yMid}" r="2.5" fill="${accent}" opacity="0.7"/>`;

  return `${header(w, h)}
    ${vline}${swashTop}${swashBot}${midDot}
    <text x="${cx - 70}" y="${yMid - 50}" text-anchor="end" font-family='${FONT_SANS}' font-size="11" letter-spacing="6" fill="${accent}" opacity="0.65">ANTES</text>
    <text x="${cx - 70}" y="${yMid + 22}" text-anchor="end" font-family='${FONT_SERIF}' font-size="62" fill="${CREME}">${esc(left)}</text>
    <text x="${cx + 70}" y="${yMid - 50}" text-anchor="start" font-family='${FONT_SANS}' font-size="11" letter-spacing="6" fill="${accent}" opacity="0.65">DEPOIS</text>
    <text x="${cx + 70}" y="${yMid + 22}" text-anchor="start" font-family='${FONT_SERIF}' font-size="62" font-style="italic" fill="${CREME}">${esc(right)}</text>
  ${footer()}`;
}

function svgSequencia(terms, accent) {
  const items = (terms || []).slice(0, 5).filter((t) => t && t.trim().length > 0);
  const n = items.length || 2;
  const w = Math.min(1200, 260 * n + 80);
  const h = 280, padX = 100, cy = h / 2;
  const span = w - padX * 2;
  const step = n > 1 ? span / (n - 1) : 0;

  const baselinePath = `M ${padX - 20} ${cy + 50} Q ${w / 2} ${cy + 70}, ${w - padX + 20} ${cy + 50}`;
  const baseline = `<path d="${baselinePath}" fill="none" stroke="${accent}" stroke-width="0.5" opacity="0.45" stroke-dasharray="2 5"/>`;

  const dots = items.map((_, i) => {
    const x = padX + step * i;
    const t = i / Math.max(1, n - 1);
    const yOnCurve = cy + 50 + Math.sin(t * Math.PI) * 20;
    return `<circle cx="${x}" cy="${yOnCurve.toFixed(1)}" r="2" fill="${accent}" opacity="0.7"/>`;
  }).join("");

  const ROMANS = ["i", "ii", "iii", "iv", "v"];
  const nodes = items.map((t, i) => {
    const x = padX + step * i;
    return `
      <text x="${x}" y="${cy - 30}" text-anchor="middle" font-family='${FONT_SERIF}' font-style="italic" font-size="20" fill="${accent}" opacity="0.85">${ROMANS[i] ?? i + 1}.</text>
      <text x="${x}" y="${cy + 14}" text-anchor="middle" font-family='${FONT_SERIF}' font-size="38" font-style="italic" fill="${CREME}">${esc(t)}</text>`;
  }).join("");

  return `${header(w, h)}${baseline}${dots}${nodes}${footer()}`;
}

function svgAnel(central, terms, accent) {
  const w = 800, h = 700, cx = w / 2, cy = h / 2;
  const rOuter = 280;
  const items = (terms || []).slice(0, 6).filter((t) => t && t.trim().length > 0);
  const n = items.length || 1;

  const arcStart = -Math.PI * 0.6;
  const arcEnd = Math.PI * 1.6;
  const startX = cx + Math.cos(arcStart) * (rOuter + 20);
  const startY = cy + Math.sin(arcStart) * (rOuter + 20);
  const endX = cx + Math.cos(arcEnd) * (rOuter + 20);
  const endY = cy + Math.sin(arcEnd) * (rOuter + 20);
  const largeArc = arcEnd - arcStart > Math.PI ? 1 : 0;
  const horizon = `<path d="M ${startX.toFixed(1)} ${startY.toFixed(1)} A ${rOuter + 20} ${rOuter + 20} 0 ${largeArc} 1 ${endX.toFixed(1)} ${endY.toFixed(1)}" fill="none" stroke="${accent}" stroke-width="0.4" opacity="0.3" stroke-dasharray="2 8"/>`;

  const outer = items.map((t, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + Math.cos(angle) * rOuter;
    const y = cy + Math.sin(angle) * rOuter;
    return `<text x="${x.toFixed(1)}" y="${(y + 8).toFixed(1)}" text-anchor="middle" font-family='${FONT_SERIF}' font-size="26" fill="${CREME}">${esc(t)}</text>`;
  }).join("");

  const rays = items.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const segs = [0.45, 0.62, 0.78];
    return segs.map((s) => {
      const x = cx + Math.cos(angle) * rOuter * s;
      const y = cy + Math.sin(angle) * rOuter * s;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.3" fill="${accent}" opacity="${0.3 + s * 0.3}"/>`;
    }).join("");
  }).join("");

  const center = `<text x="${cx}" y="${cy + 18}" text-anchor="middle" font-family='${FONT_SERIF}' font-size="56" font-style="italic" fill="${CREME}" font-weight="500">${esc(central)}</text>`;

  return `${header(w, h)}${horizon}${rays}${outer}${center}${footer()}`;
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
