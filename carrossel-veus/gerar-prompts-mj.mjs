// Script único: lê content.json e emite os 42 prompts MJ derivados,
// usando a mesma lógica do escola-veus-app/src/lib/carrossel-veus-prompt.ts.
// Sem âncoras geográficas — imagens simbólicas dos temas.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STYLE_DARK =
  "cinematic editorial photograph, low contemplative light, limited warm palette, fine grain, no people, no faces, no text, no logos, no watermarks, hyperrealistic, 8k, --ar 9:16";
const STYLE_LIGHT =
  "cinematic editorial photograph, soft natural daylight, limited muted palette, fine grain, no people, no faces, no text, no logos, no watermarks, hyperrealistic, 8k, --ar 9:16";

const TEMA_CENAS = {
  PERMANÊNCIA:
    "wide slow river surface in soft flow, late golden light catching the moving water, sense that nothing stays still",
  MEMÓRIA:
    "old open book on a worn wooden table beside a window, dust particles suspended in a thin beam of afternoon light",
  TURBILHÃO:
    "still surface of dark water after the wind has passed, single point of light reflected at the centre, perfect quiet",
  ESFORÇO:
    "empty wooden chair by an open window, late-afternoon light spilling across the floor, no movement",
  DESOLAÇÃO:
    "freshly turned dark soil at dawn before anything is planted, fertile and waiting, single drop of dew on a blade of grass",
  HORIZONTE:
    "open doorway threshold flooded with warm morning light, the room beyond softly visible, sense of arrival",
  DUALIDADE:
    "two narrow streams converging into one wider river seen from above at first light, gentle merging",
  CONTROLO:
    "open hand seen from above letting fine sand slip between fingers, soft side-light, dark backdrop",
  PERFEIÇÃO:
    "imperfect handmade clay vessel with visible cracks repaired in gold, contemplative interior light",
  ESCASSEZ:
    "single piece of ripe fruit on a worn wooden surface, warm low light, sense of enough",
  URGÊNCIA:
    "tide marks slowly receding on a wide quiet shoreline at blue hour, no urgency in the world",
  APROVAÇÃO:
    "single candle flame burning steadily against a textured wall, no flicker, no audience",
  SEPARAÇÃO:
    "two parallel paths through tall grass converging at the horizon at dawn",
};

const TEMA_DEFAULT =
  "quiet contemplative interior scene at the threshold between day and night, single source of soft light, no movement";

function cenaDoTema(veu) {
  return TEMA_CENAS[veu.toUpperCase()] ?? TEMA_DEFAULT;
}

function variarPorTipo(cena, slide) {
  if (slide.tipo === "capa") return `${cena}, wide framing, sense of opening`;
  if (slide.tipo === "cta") return `${cena}, closing of day, single warm distant glow`;
  return cena;
}

function buildSlidePrompt(slide, dia) {
  const cena = slide.notaVisual?.trim() || variarPorTipo(cenaDoTema(dia.veu), slide);
  const style = slide.fundoClaro ? STYLE_LIGHT : STYLE_DARK;
  return `${cena}, ${style}`;
}

const content = JSON.parse(fs.readFileSync(path.join(__dirname, "content.json"), "utf8"));

let md = `# Prompts Midjourney — A Estação dos Véus

42 prompts derivados do TEMA de cada dia (versão LUZ). Estilo: editorial contemplativo, sem pessoas, sem âncoras geográficas. Cada véu tem uma imagem simbólica que evoca o estado interior que o véu encobre — não uma ilustração literal da palavra.

**Como usar:** copia o prompt, cola no MJ Discord ou web. Cada prompt já tem \`--ar 9:16\` no fim.

**Override por slide:** se um slide pedir uma cena específica, mete no admin o campo "Nota visual" — substitui completamente o prompt derivado.

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
        ? `hábito: ${slide.titulo}`
        : slide.estilo;
    md += `### ${id} · ${label}\n\n`;
    md += "```\n" + prompt + "\n```\n\n";
  });
}

fs.writeFileSync(path.join(__dirname, "output", "prompts-mj.md"), md);
console.log(
  "✓ output/prompts-mj.md gerado (",
  content.dias.reduce((n, d) => n + d.slides.length, 0),
  "prompts)"
);
