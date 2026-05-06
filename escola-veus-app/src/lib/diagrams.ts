/**
 * Composições tipográficas para os slides das aulas. Nenhum shape
 * geométrico — as palavras SÃO o visual. Hierarquia por escala, italic
 * e posição. Espaço negativo é protagonista. Mantém em sincronia com
 * tools/render-course-slide/diagrams.mjs.
 *
 * Inspiração: páginas de livro de Mary Oliver, capas Penguin Classics,
 * cartões de Wim Wenders. Não infografia.
 *
 * 5 composições:
 *   - circulo:   palavra única ENORME, sem mais nada
 *   - triade:    três palavras como haiku (3 linhas, escalas diferentes)
 *   - pareado:   dois conceitos empilhados com hairline a separar
 *   - sequencia: palavras em escada ascendente, numerais inline pequenos
 *   - anel:      central HUGE; periféricos como tags pequenas em letterspacing largo
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

// ─── 1. ÂNCORA ────────────────────────────────────────────────────────────
// Uma palavra. Enorme. Italic. Cor de acento. Nada mais.
function svgCirculo(term: string, accent: string): string {
  const w = 900, h = 360;
  const cx = w / 2, cy = h / 2;
  // Tamanho dinâmico: palavras curtas ficam maiores
  const fontSize = term.length <= 6 ? 180 : term.length <= 10 ? 140 : 100;
  return `${header(w, h)}
    <text x="${cx}" y="${cy + fontSize / 3}" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="${fontSize}" font-style="italic" fill="${accent}">${esc(term)}</text>
  ${footer()}`;
}

// ─── 2. CONSTELAÇÃO ───────────────────────────────────────────────────────
// Três palavras como haiku: 3 linhas com escalas diferentes, alinhamentos
// diferentes (esquerda · centro grande · direita). Lê-se de cima para baixo.
function svgTriade(terms: string[], accent: string): string {
  const w = 900, h = 540;
  const cx = w / 2;
  const labels = [terms[0] ?? "", terms[1] ?? "", terms[2] ?? ""];
  return `${header(w, h)}
    <text x="160" y="120" text-anchor="start" font-family='${FONT_SERIF}' font-size="42" fill="${CREME_DIM}">${esc(labels[0])}</text>
    <text x="${cx}" y="320" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="96" font-style="italic" fill="${accent}">${esc(labels[1])}</text>
    <text x="${w - 160}" y="480" text-anchor="end" font-family='${FONT_SERIF}' font-size="42" font-style="italic" fill="${CREME_DIM}">${esc(labels[2])}</text>
  ${footer()}`;
}

// ─── 3. PÓLOS ─────────────────────────────────────────────────────────────
// Dois conceitos empilhados verticalmente. Hairline a separar. Sans wide
// labels. O segundo é o "depois", em italic e na cor de acento.
function svgPareado(terms: string[], accent: string): string {
  const w = 900, h = 460;
  const left = terms[0] ?? "";
  const right = terms[1] ?? "";
  const cx = w / 2;
  return `${header(w, h)}
    <text x="${cx}" y="100" text-anchor="middle" font-family='${FONT_SANS}' font-size="11" letter-spacing="8" fill="${CREME_DIM}">ANTES</text>
    <text x="${cx}" y="180" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="76" fill="${CREME}">${esc(left)}</text>

    <line x1="${cx - 80}" y1="240" x2="${cx + 80}" y2="240" stroke="${accent}" stroke-width="0.8" opacity="0.8"/>

    <text x="${cx}" y="300" text-anchor="middle" font-family='${FONT_SANS}' font-size="11" letter-spacing="8" fill="${accent}" opacity="0.9">DEPOIS</text>
    <text x="${cx}" y="380" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="76" font-style="italic" fill="${accent}">${esc(right)}</text>
  ${footer()}`;
}

// ─── 4. PASSAGEM ──────────────────────────────────────────────────────────
// Palavras em escada ascendente. Numerais romanos inline antes de cada
// palavra, na cor de acento, italic, pequenos. Cada palavra alterna
// posição vertical (sobe à medida que avança). Sem linhas.
function svgSequencia(terms: string[], accent: string): string {
  const items = terms.slice(0, 5).filter((t) => t && t.trim().length > 0);
  const n = items.length || 2;
  const w = 1100;
  const lineH = 100;
  const h = lineH * (n + 1) + 60;
  const ROMANS = ["i", "ii", "iii", "iv", "v"];

  const lines = items
    .map((t, i) => {
      // Cada linha indenta progressivamente para criar a sensação de escada
      const x = 120 + i * 80;
      const y = 100 + i * lineH;
      return `
      <text x="${x}" y="${y}" font-family='${FONT_SERIF}' font-style="italic" font-size="22" fill="${accent}" opacity="0.85">${ROMANS[i] ?? i + 1}.</text>
      <text x="${x + 50}" y="${y}" font-family='${FONT_DISPLAY}' font-size="58" font-style="italic" fill="${CREME}">${esc(t)}</text>`;
    })
    .join("");

  return `${header(w, h)}${lines}${footer()}`;
}

// ─── 5. ÓRBITA ────────────────────────────────────────────────────────────
// Central enorme. Periféricos como pequenas tags em sans com letterspacing
// largo, distribuídas à volta sem círculos. As tags estão em órbita SOBRE
// a palavra central — comem o espaço onde poderia haver geometria.
function svgAnel(central: string, terms: string[], accent: string): string {
  const w = 1000, h = 700;
  const cx = w / 2, cy = h / 2;
  const items = terms.slice(0, 6).filter((t) => t && t.trim().length > 0);
  const n = items.length || 1;
  const radius = 280;

  // Periféricos como pequenas tags sans em letterspacing largo
  const outer = items
    .map((t, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family='${FONT_SANS}' font-size="13" letter-spacing="5" fill="${CREME_DIM}">${esc(t.toUpperCase())}</text>`;
    })
    .join("");

  // Central HUGE em italic display
  const centralFontSize =
    central.length <= 8 ? 130 : central.length <= 14 ? 100 : 80;

  return `${header(w, h)}
    ${outer}
    <text x="${cx}" y="${cy + centralFontSize / 3}" text-anchor="middle" font-family='${FONT_DISPLAY}' font-size="${centralFontSize}" font-style="italic" fill="${accent}">${esc(central)}</text>
  ${footer()}`;
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
  circulo: "Âncora (palavra única, gigante, italic)",
  triade: "Constelação (3 palavras em haiku, escalas diferentes)",
  pareado: "Pólos (antes / depois empilhados, hairline separa)",
  sequencia: "Passagem (palavras em escada com numerais romanos)",
  anel: "Órbita (central gigante, periféricos como tags sans)",
};
