// Script único: lê content.json e emite os 42 prompts MJ derivados,
// usando a mesma lógica do escola-veus-app/src/lib/carrossel-veus-prompt.ts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STYLE_DARK =
  "cinematic editorial photograph, Mozambique tropical setting, deep indigo and warm amber palette, low contemplative light, soft grain, no people, no faces, no text, no logos, no watermarks, hyperrealistic, 8k, --ar 9:16";
const STYLE_LIGHT =
  "cinematic editorial photograph, Mozambique tropical setting, warm ivory and parchment palette, soft morning light, soft grain, no people, no faces, no text, no logos, no watermarks, hyperrealistic, 8k, --ar 9:16";

const VEU_AMBIENTES = {
  PERMANÊNCIA: "ancient baobab tree silhouette at dusk, slow river surface reflecting fading sky",
  CONTROLO: "open hand letting fine sand fall, low golden side-light, dark backdrop",
  PERFEIÇÃO: "imperfect handmade clay vessel with kintsugi-style gold cracks, dim contemplative light",
  ESCASSEZ: "single ripe mango on a worn wooden bench in a quiet kitchen, warm low light",
  URGÊNCIA: "tide marks slowly receding on a wide empty Mozambique beach at blue hour",
  APROVAÇÃO: "single candle burning steadily against a textured stucco wall, no movement",
  SEPARAÇÃO: "two parallel paths through tall savana grass converging at the horizon at dawn",
  MEMÓRIA: "weathered family photograph half-buried in warm sand, soft afternoon light, no faces visible",
  TURBILHÃO: "still surface of a clay water jar reflecting a single beam of sunlight, dust suspended in air",
  ESFORÇO: "empty woven hammock between two coconut palms swaying gently, warm late-afternoon light",
  DESOLAÇÃO: "vast empty Mozambique savana after rain, single pool of water reflecting open sky",
  HORIZONTE: "open doorway of a small adobe house opening onto a courtyard, soft golden hour light flooding in",
  DUALIDADE: "two parallel rivers meeting and merging into one wide stream, aerial view at dawn",
};

const VEU_DEFAULT = "vast quiet Mozambique landscape at the threshold between day and night";

function limparTexto(texto) {
  return texto.replace(/\s+/g, " ").replace(/["""'']/g, "").trim();
}

function cenaDoSlide(slide, dia) {
  if (slide.notaVisual) return slide.notaVisual.trim();
  const ambiente = VEU_AMBIENTES[dia.veu.toUpperCase()] ?? VEU_DEFAULT;
  if (slide.tipo === "capa") return ambiente;
  if (slide.tipo === "cta") return `${ambiente}, closing of day, single warm lantern glow in the distance`;
  const t = limparTexto(slide.texto);
  const trecho = t.length > 140 ? t.slice(0, 137) + "..." : t;
  return `${ambiente}, evoking: "${trecho}"`;
}

function buildSlidePrompt(slide, dia) {
  const cena = cenaDoSlide(slide, dia);
  const style = slide.fundoClaro ? STYLE_LIGHT : STYLE_DARK;
  return `${cena}, ${style}`;
}

const content = JSON.parse(fs.readFileSync(path.join(__dirname, "content.json"), "utf8"));

// Markdown legível
let md = `# Prompts Midjourney — A Estação dos Véus

42 prompts derivados do conteúdo de cada slide (versão LUZ). Estilo: editorial Moçambique tropical, sem pessoas.

**Como usar:** copia o prompt, cola no MJ Discord ou web. Cada um já tem \`--ar 9:16\` no fim.

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
console.log("✓ output/prompts-mj.md gerado (", content.dias.reduce((n, d) => n + d.slides.length, 0), "prompts)");
