// Script único: lê content.json e emite os 42 prompts MJ.
// Espelha lib/carrossel-veus-prompt.ts (Next.js app):
// prioridade slide.notaVisual (vem do Claude API) > fallback por tema.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STYLE_DARK =
  "cinematic editorial photograph, low contemplative light, limited warm palette, fine grain, no people, no faces, no text, no logos, no watermarks, hyperrealistic, 8k, --ar 9:16";
const STYLE_LIGHT =
  "cinematic editorial photograph, soft natural daylight, limited muted palette, fine grain, no people, no faces, no text, no logos, no watermarks, hyperrealistic, 8k, --ar 9:16";

const FALLBACK_TEMA_CENAS = {
  PERMANÊNCIA: "wide slow water surface in soft flow, late golden light catching movement, sense that nothing stays still",
  MEMÓRIA: "open book on worn wood beside a window, dust suspended in a thin beam of afternoon light",
  TURBILHÃO: "still surface of dark water after wind passed, single point of light reflected at the centre",
  ESFORÇO: "empty chair by an open window, late-afternoon light spilling across the floor, no movement",
  DESOLAÇÃO: "freshly turned dark soil at dawn before anything is planted, single drop of dew on a blade of grass",
  HORIZONTE: "open doorway threshold flooded with warm morning light, room beyond softly visible",
  DUALIDADE: "two narrow streams converging into one wider river seen from above at first light",
};

const FALLBACK_DEFAULT =
  "quiet contemplative interior scene at the threshold between day and night, single source of soft light, no movement";

function variarPorTipo(cena, slide) {
  if (slide.tipo === "capa") return `${cena}, wide framing, sense of opening`;
  if (slide.tipo === "cta") return `${cena}, closing of day, single warm distant glow`;
  return cena;
}

function buildSlidePrompt(slide, dia) {
  const cena =
    slide.notaVisual?.trim() ||
    variarPorTipo(
      FALLBACK_TEMA_CENAS[dia.veu.toUpperCase()] ?? FALLBACK_DEFAULT,
      slide
    );
  const style = slide.fundoClaro ? STYLE_LIGHT : STYLE_DARK;
  return `${cena}, ${style}`;
}

const content = JSON.parse(fs.readFileSync(path.join(__dirname, "content.json"), "utf8"));

let md = `# Prompts Midjourney — ${content.campanha || "Carrossel Véus"}

42 prompts derivados dos slides (campo notaVisual quando presente, fallback do tema do dia caso contrário). Estilo editorial contemplativo, sem geografia, sem pessoas.

**Como usar:** copia o prompt, cola no MJ. Cada prompt já tem \`--ar 9:16\`.

---

`;

for (const dia of content.dias) {
  md += `\n## Dia ${dia.numero} · ${dia.veu}\n*${dia.subtitulo}*\n\n`;
  dia.slides.forEach((slide, idx) => {
    const prompt = buildSlidePrompt(slide, dia);
    const id = `veu-${dia.numero}-slide-${idx + 1}`;
    const label =
      slide.tipo === "capa"
        ? "capa"
        : slide.tipo === "cta"
        ? "cta"
        : slide.titulo
        ? `${slide.estilo} · ${slide.titulo}`
        : slide.estilo;
    const fonte = slide.notaVisual ? "Claude" : "fallback";
    const claro = slide.fundoClaro ? "claro" : "escuro";
    md += `### ${id} · ${label} _(scrim ${claro} · ${fonte})_\n\n`;
    md += "```\n" + prompt + "\n```\n\n";
  });
}

fs.writeFileSync(path.join(__dirname, "output", "prompts-mj.md"), md);
console.log(
  "✓ output/prompts-mj.md gerado (",
  content.dias.reduce((n, d) => n + d.slides.length, 0),
  "prompts)"
);
