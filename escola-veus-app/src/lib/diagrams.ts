/**
 * Biblioteca de "infografias" minimais para os slides das aulas. Tudo SVG
 * inline — Puppeteer captura como qualquer texto, sem dependências
 * externas, fica nítido a 1080p.
 *
 * Filosofia: linhas finas, círculos abertos, tipografia idêntica ao slide,
 * cor de acento do curso. Quase escrito à mão. Nunca clipart, nunca
 * ícones genéricos.
 *
 * 5 templates:
 *   - circulo:   1 conceito central isolado
 *   - triade:    3 forças/palavras em triângulo
 *   - pareado:   antes / depois, fora / dentro
 *   - sequencia: passos 1 → 2 → 3 (ideal para Gesto)
 *   - anel:      uma palavra central + N palavras em órbita
 *
 * Uso:
 *   import { renderDiagram, type Diagram } from "@/lib/diagrams";
 *   const svg = renderDiagram({ type: "triade", terms: ["Medo", "Vergonha", "Desejo"] }, "#D4A853");
 *   // SVG string, pôr em <div dangerouslySetInnerHTML={{__html: svg}} />
 */

export type DiagramType = "circulo" | "triade" | "pareado" | "sequencia" | "anel";

export type Diagram = {
  type: DiagramType;
  terms: string[];        // termos periféricos / passos / pólos
  central?: string;       // só para "anel"
};

const FONT_BASE = '"Cormorant Garamond", Georgia, serif';

function header(width: number, height: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="max-width:100%;height:auto;display:block">`;
}
function footer() {
  return `</svg>`;
}
function esc(s: string): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c] as string,
  );
}

function svgCirculo(term: string, accent: string): string {
  const w = 480, h = 320;
  const cx = w / 2, cy = h / 2;
  return `${header(w, h)}
    <circle cx="${cx}" cy="${cy}" r="140" fill="none" stroke="${accent}" stroke-width="1.2" opacity="0.9"/>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-family='${FONT_BASE}' font-size="40" fill="#f0ece6" font-style="italic">${esc(term)}</text>
  ${footer()}`;
}

function svgTriade(terms: string[], accent: string): string {
  // Triângulo com vértices nos 3 termos. Linhas a ligar todos os pares.
  const w = 720, h = 460;
  const cx = w / 2;
  const top = { x: cx, y: 70 };
  const bl = { x: 130, y: 380 };
  const br = { x: w - 130, y: 380 };
  const pts = [top, bl, br];
  const labels = [terms[0] ?? "", terms[1] ?? "", terms[2] ?? ""];

  const lines = `
    <line x1="${top.x}" y1="${top.y}" x2="${bl.x}" y2="${bl.y}" stroke="${accent}" stroke-width="0.8" opacity="0.4"/>
    <line x1="${bl.x}" y1="${bl.y}" x2="${br.x}" y2="${br.y}" stroke="${accent}" stroke-width="0.8" opacity="0.4"/>
    <line x1="${br.x}" y1="${br.y}" x2="${top.x}" y2="${top.y}" stroke="${accent}" stroke-width="0.8" opacity="0.4"/>`;

  const nodes = pts
    .map((p, i) => {
      const dy = i === 0 ? -30 : 50; // topo: legenda acima; outros: legenda abaixo
      return `
      <circle cx="${p.x}" cy="${p.y}" r="56" fill="#141428" stroke="${accent}" stroke-width="1.2"/>
      <text x="${p.x}" y="${p.y + dy}" text-anchor="middle" font-family='${FONT_BASE}' font-size="28" fill="#f0ece6" font-style="italic">${esc(labels[i])}</text>`;
    })
    .join("");

  return `${header(w, h)}${lines}${nodes}${footer()}`;
}

function svgPareado(terms: string[], accent: string): string {
  // Dois cartões com uma linha vertical fina ao meio.
  const w = 760, h = 280;
  const left = terms[0] ?? "";
  const right = terms[1] ?? "";
  const cx = w / 2;
  return `${header(w, h)}
    <line x1="${cx}" y1="40" x2="${cx}" y2="${h - 40}" stroke="${accent}" stroke-width="1" opacity="0.5"/>
    <text x="${cx - 40}" y="${h / 2 + 12}" text-anchor="end" font-family='${FONT_BASE}' font-size="40" fill="#f0ece6">${esc(left)}</text>
    <text x="${cx + 40}" y="${h / 2 + 12}" text-anchor="start" font-family='${FONT_BASE}' font-size="40" fill="#f0ece6" font-style="italic">${esc(right)}</text>
  ${footer()}`;
}

function svgSequencia(terms: string[], accent: string): string {
  // Linha horizontal de N círculos ligados por setas. 2-5 termos.
  const items = terms.slice(0, 5).filter((t) => t && t.trim().length > 0);
  const n = items.length || 2;
  const w = Math.min(1100, 220 * n);
  const h = 260;
  const radius = 50;
  const padX = 110;
  const span = w - padX * 2;
  const step = n > 1 ? span / (n - 1) : 0;
  const cy = h / 2;

  const links = items
    .map((_, i) => {
      if (i === 0) return "";
      const x1 = padX + step * (i - 1) + radius + 6;
      const x2 = padX + step * i - radius - 12;
      return `
      <line x1="${x1}" y1="${cy}" x2="${x2}" y2="${cy}" stroke="${accent}" stroke-width="0.8" opacity="0.5"/>
      <polygon points="${x2},${cy} ${x2 - 8},${cy - 5} ${x2 - 8},${cy + 5}" fill="${accent}" opacity="0.7"/>`;
    })
    .join("");

  const nodes = items
    .map((t, i) => {
      const x = padX + step * i;
      return `
      <circle cx="${x}" cy="${cy}" r="${radius}" fill="#141428" stroke="${accent}" stroke-width="1.2"/>
      <text x="${x}" y="${cy + 10}" text-anchor="middle" font-family='${FONT_BASE}' font-size="22" fill="#f0ece6">${esc(t)}</text>`;
    })
    .join("");

  return `${header(w, h)}${links}${nodes}${footer()}`;
}

function svgAnel(central: string, terms: string[], accent: string): string {
  // Centro + até 6 nodos em círculo à volta. Linhas ligam centro a cada nodo.
  const w = 640, h = 640;
  const cx = w / 2, cy = h / 2;
  const rOuter = 230;
  const items = terms.slice(0, 6).filter((t) => t && t.trim().length > 0);
  const n = items.length || 1;

  const links = items
    .map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + Math.cos(angle) * rOuter;
      const y = cy + Math.sin(angle) * rOuter;
      return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${accent}" stroke-width="0.7" opacity="0.35"/>`;
    })
    .join("");

  const outer = items
    .map((t, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + Math.cos(angle) * rOuter;
      const y = cy + Math.sin(angle) * rOuter;
      return `
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="44" fill="#141428" stroke="${accent}" stroke-width="1"/>
      <text x="${x.toFixed(1)}" y="${(y + 8).toFixed(1)}" text-anchor="middle" font-family='${FONT_BASE}' font-size="20" fill="#f0ece6">${esc(t)}</text>`;
    })
    .join("");

  const center = `
    <circle cx="${cx}" cy="${cy}" r="80" fill="none" stroke="${accent}" stroke-width="1.4"/>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-family='${FONT_BASE}' font-size="32" fill="#f0ece6" font-style="italic">${esc(central)}</text>`;

  return `${header(w, h)}${links}${outer}${center}${footer()}`;
}

export function renderDiagram(d: Diagram, accent: string): string {
  switch (d.type) {
    case "circulo":
      return svgCirculo(d.terms[0] ?? "", accent);
    case "triade":
      return svgTriade(d.terms, accent);
    case "pareado":
      return svgPareado(d.terms, accent);
    case "sequencia":
      return svgSequencia(d.terms, accent);
    case "anel":
      return svgAnel(d.central ?? "", d.terms, accent);
    default:
      return "";
  }
}

export const DIAGRAM_LABELS: Record<DiagramType, string> = {
  circulo: "Círculo (1 conceito central)",
  triade: "Tríade (3 forças / palavras)",
  pareado: "Pareado (antes / depois)",
  sequencia: "Sequência (1 → 2 → 3)",
  anel: "Anel (1 central + N à volta)",
};
