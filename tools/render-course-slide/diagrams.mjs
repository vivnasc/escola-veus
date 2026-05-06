/**
 * Espelho de src/lib/diagrams.ts em JS puro, para o render Puppeteer.
 * 5 templates SVG inline com carácter editorial: curvas Bezier, anéis
 * pontilhados, ornamentos, tipografia variada (italic Cormorant + sans
 * Nunito para labels meta).
 */

const FONT_SERIF = '"Cormorant Garamond", Georgia, serif';
const FONT_SANS = '"Nunito", sans-serif';
const CREME = "#f0ece6";
const FUNDO = "#141428";

function header(width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="max-width:100%;height:auto;display:block">`;
}
function footer() { return `</svg>`; }
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function bezier(x1, y1, x2, y2, bow = 0.15) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const px = -dy / len;
  const py = dx / len;
  const cx = mx + px * len * bow;
  const cy = my + py * len * bow;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

function ornamentDot(cx, cy, accent, r = 1.5) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${accent}" opacity="0.7"/>`;
}

function svgCirculo(term, accent) {
  const w = 520, h = 360, cx = w / 2, cy = h / 2;
  return `${header(w, h)}
    <circle cx="${cx}" cy="${cy}" r="160" fill="none" stroke="${accent}" stroke-width="0.6" stroke-dasharray="2 6" opacity="0.5"/>
    <circle cx="${cx}" cy="${cy}" r="130" fill="none" stroke="${accent}" stroke-width="1" opacity="0.85"/>
    ${ornamentDot(cx, cy - 158, accent, 2)}
    ${ornamentDot(cx, cy + 158, accent, 2)}
    ${ornamentDot(cx - 158, cy, accent, 2)}
    ${ornamentDot(cx + 158, cy, accent, 2)}
    <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-family='${FONT_SERIF}' font-size="44" font-style="italic" fill="${CREME}">${esc(term)}</text>
  ${footer()}`;
}

function svgTriade(terms, accent) {
  const w = 760, h = 480, cx = w / 2;
  const top = { x: cx, y: 80 };
  const bl = { x: 140, y: 400 };
  const br = { x: w - 140, y: 400 };
  const labels = [terms[0] ?? "", terms[1] ?? "", terms[2] ?? ""];
  const pts = [top, bl, br];

  const arcs = [
    bezier(top.x, top.y, bl.x, bl.y, -0.08),
    bezier(bl.x, bl.y, br.x, br.y, 0.08),
    bezier(br.x, br.y, top.x, top.y, -0.08),
  ];
  const lines = arcs.map((d) => `<path d="${d}" fill="none" stroke="${accent}" stroke-width="0.7" opacity="0.45" stroke-dasharray="3 4"/>`).join("");

  const midPoints = [
    { x: (top.x + bl.x) / 2, y: (top.y + bl.y) / 2 },
    { x: (bl.x + br.x) / 2, y: (bl.y + br.y) / 2 },
    { x: (br.x + top.x) / 2, y: (br.y + top.y) / 2 },
  ];
  const ornaments = midPoints.map((p) => ornamentDot(p.x, p.y, accent, 2)).join("");

  const nodes = pts.map((p, i) => {
    const labelDy = i === 0 ? -36 : 56;
    return `
      <circle cx="${p.x}" cy="${p.y}" r="56" fill="${FUNDO}" stroke="${accent}" stroke-width="0.5" stroke-dasharray="1 4" opacity="0.6"/>
      <circle cx="${p.x}" cy="${p.y}" r="42" fill="${FUNDO}" stroke="${accent}" stroke-width="1.1"/>
      <text x="${p.x}" y="${p.y + labelDy}" text-anchor="middle" font-family='${FONT_SERIF}' font-size="26" font-style="italic" fill="${CREME}">${esc(labels[i])}</text>`;
  }).join("");

  return `${header(w, h)}${lines}${ornaments}${nodes}${footer()}`;
}

function svgPareado(terms, accent) {
  const w = 800, h = 320;
  const left = terms[0] ?? "", right = terms[1] ?? "";
  const cx = w / 2;
  return `${header(w, h)}
    <line x1="${cx}" y1="60" x2="${cx}" y2="${h - 60}" stroke="${accent}" stroke-width="0.7" opacity="0.5"/>
    ${ornamentDot(cx, 60, accent, 2.5)}
    ${ornamentDot(cx, h - 60, accent, 2.5)}
    ${ornamentDot(cx, h / 2, accent, 3)}
    <text x="${cx - 60}" y="${h / 2 - 36}" text-anchor="end" font-family='${FONT_SANS}' font-size="11" letter-spacing="3" fill="${accent}" opacity="0.7">ANTES</text>
    <text x="${cx - 60}" y="${h / 2 + 12}" text-anchor="end" font-family='${FONT_SERIF}' font-size="42" fill="${CREME}">${esc(left)}</text>
    <text x="${cx + 60}" y="${h / 2 - 36}" text-anchor="start" font-family='${FONT_SANS}' font-size="11" letter-spacing="3" fill="${accent}" opacity="0.7">DEPOIS</text>
    <text x="${cx + 60}" y="${h / 2 + 12}" text-anchor="start" font-family='${FONT_SERIF}' font-size="42" font-style="italic" fill="${CREME}">${esc(right)}</text>
  ${footer()}`;
}

function svgSequencia(terms, accent) {
  const items = (terms || []).slice(0, 5).filter((t) => t && t.trim().length > 0);
  const n = items.length || 2;
  const w = Math.min(1180, 240 * n + 60);
  const h = 320, radius = 48, padX = 90, cy = h / 2;
  const span = w - padX * 2;
  const step = n > 1 ? span / (n - 1) : 0;

  const links = items.map((_, i) => {
    if (i === 0) return "";
    const x1 = padX + step * (i - 1) + radius + 4;
    const x2 = padX + step * i - radius - 12;
    const path = bezier(x1, cy, x2, cy, 0.18);
    return `
      <path d="${path}" fill="none" stroke="${accent}" stroke-width="0.7" opacity="0.5" stroke-dasharray="3 4"/>
      <polygon points="${x2},${cy} ${x2 - 8},${cy - 5} ${x2 - 8},${cy + 5}" fill="${accent}" opacity="0.7"/>`;
  }).join("");

  const ROMANS = ["i", "ii", "iii", "iv", "v"];
  const nodes = items.map((t, i) => {
    const x = padX + step * i;
    return `
      <text x="${x}" y="${cy - radius - 18}" text-anchor="middle" font-family='${FONT_SERIF}' font-style="italic" font-size="20" fill="${accent}" opacity="0.85">${ROMANS[i] ?? i + 1}</text>
      <circle cx="${x}" cy="${cy}" r="${radius + 6}" fill="${FUNDO}" stroke="${accent}" stroke-width="0.4" stroke-dasharray="1 4" opacity="0.5"/>
      <circle cx="${x}" cy="${cy}" r="${radius}" fill="${FUNDO}" stroke="${accent}" stroke-width="1.1"/>
      <text x="${x}" y="${cy + 9}" text-anchor="middle" font-family='${FONT_SERIF}' font-size="22" font-style="italic" fill="${CREME}">${esc(t)}</text>`;
  }).join("");

  return `${header(w, h)}${links}${nodes}${footer()}`;
}

function svgAnel(central, terms, accent) {
  const w = 720, h = 720, cx = w / 2, cy = h / 2;
  const rOuter = 260;
  const items = (terms || []).slice(0, 6).filter((t) => t && t.trim().length > 0);
  const n = items.length || 1;

  const outerRing = `<circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="none" stroke="${accent}" stroke-width="0.5" stroke-dasharray="1 6" opacity="0.4"/>`;

  const links = items.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + Math.cos(angle) * rOuter;
    const y = cy + Math.sin(angle) * rOuter;
    const path = bezier(cx, cy, x, y, 0.06);
    return `<path d="${path}" fill="none" stroke="${accent}" stroke-width="0.6" opacity="0.4"/>`;
  }).join("");

  const outer = items.map((t, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + Math.cos(angle) * rOuter;
    const y = cy + Math.sin(angle) * rOuter;
    return `
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="48" fill="${FUNDO}" stroke="${accent}" stroke-width="0.4" stroke-dasharray="1 4" opacity="0.5"/>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="36" fill="${FUNDO}" stroke="${accent}" stroke-width="1"/>
      <text x="${x.toFixed(1)}" y="${(y + 7).toFixed(1)}" text-anchor="middle" font-family='${FONT_SERIF}' font-size="20" fill="${CREME}">${esc(t)}</text>`;
  }).join("");

  const center = `
    <circle cx="${cx}" cy="${cy}" r="100" fill="none" stroke="${accent}" stroke-width="0.5" stroke-dasharray="2 5" opacity="0.5"/>
    <circle cx="${cx}" cy="${cy}" r="78" fill="${FUNDO}" stroke="${accent}" stroke-width="1.4"/>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-family='${FONT_SERIF}' font-size="34" font-style="italic" fill="${CREME}">${esc(central)}</text>`;

  return `${header(w, h)}${outerRing}${links}${outer}${center}${footer()}`;
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
