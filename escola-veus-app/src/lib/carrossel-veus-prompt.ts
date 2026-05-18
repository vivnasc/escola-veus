/**
 * Prompt builder MJ para os fundos do Carrossel Véus.
 *
 * Arquitectura: o conteúdo é gerado por `lib/carousel-generate.ts` (Claude
 * API) a partir de um `brief` do calendário. O Claude já produz a CENA
 * visual de cada slide no campo `notaVisual` (1 frase inglesa) + o
 * `fundoClaro` (qual scrim usar). Este builder só envelopa essa cena no
 * preâmbulo de estilo editorial.
 *
 * Quando um slide legacy não tem `notaVisual` (conteúdo antigo, sem terem
 * passado pela nova geração), caímos num fallback: dicionário de cenas
 * simbólicas por tema, totalmente neutro (sem geografia, sem cultura).
 */

import type { Dia, Slide } from "@/lib/carousel-types";

/** Preâmbulo universal. Sem geografia, sem cultura específica. */
const STYLE_DARK =
  "cinematic editorial photograph, low contemplative light, limited warm palette, fine grain, no people, no faces, no text, no logos, no watermarks, hyperrealistic, 8k, --ar 9:16";

const STYLE_LIGHT =
  "cinematic editorial photograph, soft natural daylight, limited muted palette, fine grain, no people, no faces, no text, no logos, no watermarks, hyperrealistic, 8k, --ar 9:16";

/**
 * Fallback simbólico para slides sem `notaVisual` (conteúdo antigo).
 * Cada cena é matéria primária (luz, água, fio, vão, vela) — sem cultura.
 */
const FALLBACK_TEMA_CENAS: Record<string, string> = {
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

/** Variação ligeira por tipo, para o ritmo capa→conteúdo→cta. */
function variarPorTipo(cena: string, slide: Slide): string {
  if (slide.tipo === "capa") return `${cena}, wide framing, sense of opening`;
  if (slide.tipo === "cta") return `${cena}, closing of day, single warm distant glow`;
  return cena;
}

/**
 * Builder principal.
 * Prioridade: slide.notaVisual (vem do Claude) > fallback do tema do dia.
 */
export function buildSlidePrompt(slide: Slide, dia: Dia): string {
  const cena = slide.notaVisual?.trim()
    || variarPorTipo(
      FALLBACK_TEMA_CENAS[dia.veu.toUpperCase()] ?? FALLBACK_DEFAULT,
      slide,
    );
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
