/**
 * Prompt builder para os fundos MJ do Carrossel Véus.
 *
 * O conteúdo é renovado todas as semanas (calendário anual). Em vez de
 * fixar prompts por slide, derivamos uma CENA por TEMA (véu), e usamos a
 * mesma cena nos 6 slides do dia — com pequenas variações para capa/cta.
 *
 * Princípios:
 *  - Sem âncoras geográficas (sem "Moçambique", "savana", "tropical", etc.).
 *  - Imagens SIMBÓLICAS do estado interior que o véu encobre, não literais.
 *  - Estilo editorial contemplativo, sempre sem pessoas, sem texto.
 *  - Estabilidade visual por DIA: a foto evoca o tema, não cada frase.
 *
 * Para slides em que a cena por défice não chega, a editora força uma
 * `notaVisual` (texto livre, override total).
 */

import type { Dia, Slide } from "@/lib/carousel-types";

/** Preâmbulo universal — sem geografia, sem cultura específica. */
const STYLE_DARK =
  "cinematic editorial photograph, low contemplative light, limited warm palette, fine grain, no people, no faces, no text, no logos, no watermarks, hyperrealistic, 8k, --ar 9:16";

const STYLE_LIGHT =
  "cinematic editorial photograph, soft natural daylight, limited muted palette, fine grain, no people, no faces, no text, no logos, no watermarks, hyperrealistic, 8k, --ar 9:16";

/**
 * Cena simbólica por tema. Cada entrada é uma IMAGEM concreta (objecto,
 * lugar, luz) que evoca o estado interior — não uma ilustração literal da
 * palavra-tema.
 *
 * Acrescentar entradas conforme novas campanhas. Quando o veu não está
 * mapeado, cai no TEMA_DEFAULT abaixo.
 */
const TEMA_CENAS: Record<string, string> = {
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
  // Temas adicionais para reutilizar em campanhas futuras
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

/** Devolve a cena base para o tema do dia (com fallback). */
function cenaDoTema(veu: string): string {
  return TEMA_CENAS[veu.toUpperCase()] ?? TEMA_DEFAULT;
}

/**
 * Pequena variação por tipo de slide para criar ritmo visual no dia
 * sem perder a coerência temática.
 */
function variarPorTipo(cena: string, slide: Slide): string {
  if (slide.tipo === "capa") {
    return `${cena}, wide framing, sense of opening`;
  }
  if (slide.tipo === "cta") {
    return `${cena}, closing of day, single warm distant glow`;
  }
  return cena;
}

/**
 * Builder principal. Devolve o prompt completo, pronto para Midjourney.
 *
 * Override total via `slide.notaVisual` — útil quando a cena do tema não
 * serve para um slide específico.
 */
export function buildSlidePrompt(slide: Slide, dia: Dia): string {
  const cena = slide.notaVisual?.trim() || variarPorTipo(cenaDoTema(dia.veu), slide);
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
