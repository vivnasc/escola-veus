/**
 * Converte uma sub-aula (LessonScript) em slides com estrutura de 5 actos:
 *   I · PERGUNTA        (perguntaInicial)
 *   II · SITUACAO       (situacaoHumana, partido em blocos)
 *   III · REVELACAO     (revelacaoPadrao, partido em blocos)
 *   IV · GESTO          (gestoConsciencia)
 *   V · FRASE           (fraseFinal)
 *
 * Aceita um `LessonConfig` opcional com overrides editaveis pelo admin
 * (texto, quebra de blocos, timing por slide, volumes, faixa AG) — esses
 * overrides vivem em Supabase e sao carregados pelo preview; nada vai
 * hardcoded para o render.
 */

import {
  OURO_PROPRIO_SCRIPTS,
  type LessonScript,
} from "@/data/course-scripts/ouro-proprio";
import { getCourseBySlug } from "@/data/courses";

export type Acto = "pergunta" | "situacao" | "revelacao" | "gesto" | "frase";

export type Slide =
  | { tipo: "title"; texto: string; subtexto: string; duracao: number }
  | {
      tipo: "acto-marker";
      acto: Acto;
      romano: string;
      label: string;
      duracao: number;
    }
  | {
      tipo: "conteudo";
      acto: Acto;
      romano: string;
      label: string;
      texto: string;
      duracao: number;
    }
  | { tipo: "fecho"; duracao: number }
  | { tipo: "end"; texto: string; subtexto: string; duracao: number };

export type SlideDeck = {
  courseSlug: string;
  courseTitle: string;
  moduleNumber: number;
  subLetter: string;
  subTitle: string;
  totalDurationSec: number;
  slides: Slide[];
};

export type LessonConfig = {
  // Overrides ao texto base dos 5 actos + titulo.
  script?: Partial<
    Pick<
      LessonScript,
      | "title"
      | "perguntaInicial"
      | "situacaoHumana"
      | "revelacaoPadrao"
      | "gestoConsciencia"
      | "fraseFinal"
    >
  >;
  // Quando presente, substitui a quebra automatica em blocos. Array de strings
  // ja partidas. Permite que a Vivianne junte/divida blocos manualmente.
  blockSplits?: Partial<Record<Acto, string[]>>;
  // Override por slide: { "0": 10, "5": 15 } em segundos.
  timingOverrides?: Record<string, number>;
  // Multiplicador aplicado em cima do pace default 1s/5chars. 1.0 = default.
  globalTimingMultiplier?: number;
  // Faixa Ancient Ground (filename em audios/albums/ancient-ground/).
  // Se vazio, o render usa o default do curso.
  agTrack?: string;
  // Volume por acto em dB. Defaults em DEFAULT_VOLUMES.
  volumeDb?: Partial<Record<Acto, number>>;
};

export const DEFAULT_VOLUMES: Record<Acto, number> = {
  pergunta: -18,
  situacao: -18,
  revelacao: -17,
  gesto: -15,
  frase: -14,
};

export const DEFAULT_GLOBAL_MULTIPLIER = 1.0;

const ACTOS: Array<{ acto: Acto; romano: string; label: string }> = [
  { acto: "pergunta", romano: "I", label: "PERGUNTA" },
  { acto: "situacao", romano: "II", label: "SITUAÇÃO" },
  { acto: "revelacao", romano: "III", label: "REVELAÇÃO" },
  { acto: "gesto", romano: "IV", label: "GESTO" },
  { acto: "frase", romano: "V", label: "FRASE" },
];

// Ritmo contemplativo: ~1s por 5 chars. Min 6s, max 20s por bloco.
function durationFor(text: string): number {
  const chars = text.length;
  return Math.max(6, Math.min(20, Math.round(chars / 5)));
}

/**
 * Parte texto longo em blocos para caber num slide sem virar muro.
 * Tenta cortar em limites naturais (pontos finais + espaco) perto dos
 * `targetChars`, nao ultrapassa `maxChars`.
 */
function splitIntoBlocks(text: string, targetChars: number, maxChars: number): string[] {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= maxChars) return [clean];

  const blocks: string[] = [];
  let remaining = clean;
  while (remaining.length > maxChars) {
    const slice = remaining.slice(0, maxChars + 1);
    let cut = -1;
    for (let i = maxChars; i > targetChars - 60; i--) {
      if (slice[i] === "." && slice[i + 1] === " ") {
        cut = i + 1;
        break;
      }
    }
    if (cut === -1) {
      cut = slice.lastIndexOf(" ", maxChars);
      if (cut <= targetChars / 2) cut = maxChars;
    }
    blocks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining.length > 0) blocks.push(remaining);
  return blocks;
}

export function defaultBlocksForActo(acto: Acto, text: string): string[] {
  switch (acto) {
    case "pergunta":
      return splitIntoBlocks(text, 160, 220);
    case "situacao":
    case "revelacao":
      return splitIntoBlocks(text, 220, 260);
    case "gesto":
      return splitIntoBlocks(text, 260, 320);
    case "frase":
      return [text.trim()];
  }
}

export function getBaseScript(
  courseSlug: string,
  moduleNumber: number,
  subLetter: string,
): LessonScript | null {
  if (courseSlug !== "ouro-proprio") return null;
  const key = `m${moduleNumber}${subLetter.toLowerCase()}`;
  return OURO_PROPRIO_SCRIPTS[key] ?? null;
}

/**
 * Aplica o `script` override (strings vazias/undefined caem para o base).
 */
export function resolveScript(
  courseSlug: string,
  moduleNumber: number,
  subLetter: string,
  scriptOverride?: LessonConfig["script"],
): LessonScript | null {
  const base = getBaseScript(courseSlug, moduleNumber, subLetter);
  if (!base) return null;
  if (!scriptOverride) return base;
  const merged: LessonScript = {
    ...base,
    title: (scriptOverride.title ?? "").trim() || base.title,
    perguntaInicial: (scriptOverride.perguntaInicial ?? "").trim() || base.perguntaInicial,
    situacaoHumana: (scriptOverride.situacaoHumana ?? "").trim() || base.situacaoHumana,
    revelacaoPadrao: (scriptOverride.revelacaoPadrao ?? "").trim() || base.revelacaoPadrao,
    gestoConsciencia: (scriptOverride.gestoConsciencia ?? "").trim() || base.gestoConsciencia,
    fraseFinal: (scriptOverride.fraseFinal ?? "").trim() || base.fraseFinal,
  };
  return merged;
}

export function buildSlideDeckFromConfig(
  courseSlug: string,
  moduleNumber: number,
  subLetter: string,
  config?: LessonConfig,
): SlideDeck | null {
  const script = resolveScript(courseSlug, moduleNumber, subLetter, config?.script);
  if (!script) return null;

  const course = getCourseBySlug(courseSlug);
  if (!course) return null;

  const timingMul =
    typeof config?.globalTimingMultiplier === "number" && config.globalTimingMultiplier > 0
      ? config.globalTimingMultiplier
      : DEFAULT_GLOBAL_MULTIPLIER;

  const slides: Slide[] = [];

  // 1. Titulo (~8s com multiplicador)
  slides.push({
    tipo: "title",
    texto: script.title,
    subtexto: `Modulo ${moduleNumber} · Aula ${subLetter.toUpperCase()}`,
    duracao: Math.max(3, Math.round(8 * timingMul)),
  });

  const sectionTexts: Record<Acto, string> = {
    pergunta: script.perguntaInicial,
    situacao: script.situacaoHumana,
    revelacao: script.revelacaoPadrao,
    gesto: script.gestoConsciencia,
    frase: script.fraseFinal,
  };

  for (const { acto, romano, label } of ACTOS) {
    slides.push({
      tipo: "acto-marker",
      acto,
      romano,
      label,
      duracao: 2,
    });

    const override = config?.blockSplits?.[acto];
    const blocks =
      override && override.length > 0
        ? override.filter((b) => b && b.trim().length > 0).map((b) => b.trim())
        : defaultBlocksForActo(acto, sectionTexts[acto]);

    for (const b of blocks) {
      const base = acto === "frase" ? 12 : durationFor(b);
      slides.push({
        tipo: "conteudo",
        acto,
        romano,
        label,
        texto: b,
        duracao: Math.max(3, Math.round(base * timingMul)),
      });
    }
  }

  slides.push({ tipo: "fecho", duracao: 2 });
  slides.push({
    tipo: "end",
    texto: "Escola dos Veus",
    subtexto: "seteveus.space",
    duracao: 5,
  });

  // Overrides por slide (aplicados depois da construcao).
  if (config?.timingOverrides) {
    for (const [idxStr, dur] of Object.entries(config.timingOverrides)) {
      const idx = Number(idxStr);
      if (Number.isFinite(idx) && slides[idx] && typeof dur === "number" && dur > 0) {
        slides[idx].duracao = dur;
      }
    }
  }

  const totalDurationSec = slides.reduce((s, sl) => s + sl.duracao, 0);

  return {
    courseSlug,
    courseTitle: course.title,
    moduleNumber,
    subLetter: subLetter.toUpperCase(),
    subTitle: script.title,
    totalDurationSec,
    slides,
  };
}

/**
 * Retro-compat: continua a funcionar sem config. Novas chamadas devem usar
 * buildSlideDeckFromConfig directamente para beneficiar dos overrides.
 */
export function buildSlideDeck(
  courseSlug: string,
  moduleNumber: number,
  subLetter: string,
): SlideDeck | null {
  return buildSlideDeckFromConfig(courseSlug, moduleNumber, subLetter);
}
