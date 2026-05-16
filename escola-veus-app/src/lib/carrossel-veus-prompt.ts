/**
 * Prompt builder para os fundos MJ do Carrossel Véus.
 *
 * Os 42 slides são renovados todas as semanas (calendário anual). Não fixamos
 * prompts; em vez disso derivamos um prompt do texto + véu do dia, com um
 * preâmbulo de estilo coerente com `thinkdiffusion-prompts.json` (Moçambique
 * tropical, editorial, sem pessoas).
 *
 * Quando o texto do slide é insuficiente, a editora pode forçar uma `notaVisual`
 * no slide e este builder usa-a como cena principal.
 */

import type { Dia, Slide } from "@/lib/carousel-types";

/** Preâmbulo de estilo — alinhado com a estética da Estação dos Véus. */
const STYLE_DARK =
  "cinematic editorial photograph, Mozambique tropical setting, deep indigo and warm amber palette, low contemplative light, soft grain, no people, no faces, no text, no logos, no watermarks, hyperrealistic, 8k, --ar 9:16";

/** Preâmbulo para slides com base clara (paisagens diurnas, marfim, manhã). */
const STYLE_LIGHT =
  "cinematic editorial photograph, Mozambique tropical setting, warm ivory and parchment palette, soft morning light, soft grain, no people, no faces, no text, no logos, no watermarks, hyperrealistic, 8k, --ar 9:16";

/** Ambientes derivados da palavra-tema (véu) do dia. */
const VEU_AMBIENTES: Record<string, string> = {
  PERMANÊNCIA: "ancient baobab tree silhouette at dusk, slow river surface reflecting fading sky",
  CONTROLO: "open hand letting fine sand fall, low golden side-light, dark backdrop",
  PERFEIÇÃO: "imperfect handmade clay vessel with kintsugi-style gold cracks, dim contemplative light",
  ESCASSEZ: "single ripe mango on a worn wooden bench in a quiet kitchen, warm low light",
  URGÊNCIA: "tide marks slowly receding on a wide empty Mozambique beach at blue hour",
  APROVAÇÃO: "single candle burning steadily against a textured stucco wall, no movement",
  SEPARAÇÃO: "two parallel paths through tall savana grass converging at the horizon at dawn",
};

/** Sugestão de ambiente quando o véu não está mapeado. */
const VEU_DEFAULT = "vast quiet Mozambique landscape at the threshold between day and night";

/**
 * Limpa o texto do slide para uso como "cena": remove pontuação heavy,
 * caracteres de markup e quebras múltiplas. Mantém poesia legível em prosa.
 */
function limparTexto(texto: string): string {
  return texto
    .replace(/\s+/g, " ")
    .replace(/["""'']/g, "")
    .trim();
}

/** Constrói uma cena curta (≤140 chars) a partir do conteúdo do slide. */
function cenaDoSlide(slide: Slide, dia: Dia): string {
  if (slide.notaVisual) return slide.notaVisual.trim();

  const ambiente = VEU_AMBIENTES[dia.veu.toUpperCase()] ?? VEU_DEFAULT;

  if (slide.tipo === "capa") {
    return ambiente;
  }
  if (slide.tipo === "cta") {
    // CTA é fim de dia — fecho contemplativo.
    return `${ambiente}, closing of day, single warm lantern glow in the distance`;
  }
  // conteudo: usa o texto (cortado) como ancho da cena
  const t = limparTexto(slide.texto);
  const trecho = t.length > 140 ? t.slice(0, 137) + "..." : t;
  return `${ambiente}, evoking: "${trecho}"`;
}

/**
 * Builder principal. Devolve o prompt completo, pronto para Midjourney.
 */
export function buildSlidePrompt(slide: Slide, dia: Dia): string {
  const cena = cenaDoSlide(slide, dia);
  const style = slide.fundoClaro ? STYLE_LIGHT : STYLE_DARK;
  return `${cena}, ${style}`;
}

/**
 * Id estável para nomear o ficheiro no Supabase.
 * Formato: `veu-{dia}-slide-{n}` (ex: `veu-1-slide-3`).
 */
export function slideAssetId(dia: Dia, slideIdx: number): string {
  return `veu-${dia.numero}-slide-${slideIdx + 1}`;
}
