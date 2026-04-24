/**
 * Converte uma sub-aula (LessonScript) em slides com estrutura de 5 actos:
 *   I · PERGUNTA        (perguntaInicial)
 *   II · SITUACAO       (situacaoHumana, partido em blocos)
 *   III · REVELACAO     (revelacaoPadrao, partido em blocos)
 *   IV · GESTO          (gestoConsciencia)
 *   V · FRASE           (fraseFinal)
 *
 * Cada slide tem: tipo, acto, texto, duracao, e metadados para o preview
 * seguir o design Mock B (tipografia por acto, label no topo, etc.).
 */

import { OURO_PROPRIO_SCRIPTS, type LessonScript } from "@/data/course-scripts/ouro-proprio";
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

const ACTOS: Array<{ acto: Acto; romano: string; label: string }> = [
  { acto: "pergunta", romano: "I", label: "PERGUNTA" },
  { acto: "situacao", romano: "II", label: "SITUACAO" },
  { acto: "revelacao", romano: "III", label: "REVELACAO" },
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
    // Procura o ultimo ". " dentro de [targetChars-60, maxChars]
    let cut = -1;
    for (let i = maxChars; i > targetChars - 60; i--) {
      if (slice[i] === "." && slice[i + 1] === " ") {
        cut = i + 1;
        break;
      }
    }
    if (cut === -1) {
      // fallback: ultimo espaco
      cut = slice.lastIndexOf(" ", maxChars);
      if (cut <= targetChars / 2) cut = maxChars;
    }
    blocks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining.length > 0) blocks.push(remaining);
  return blocks;
}

function blocksForActo(acto: Acto, text: string): string[] {
  // Pergunta: uma frase por slide se for curta; senao 1 bloco (~200)
  // Situacao / Revelacao: cortar em blocos de ~220 chars (~50 palavras)
  // Gesto: se tem frases numeradas/listadas, fica junto; senao 1 bloco
  // Frase: sempre 1 slide
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

function getScript(courseSlug: string, moduleNumber: number, subLetter: string): LessonScript | null {
  if (courseSlug !== "ouro-proprio") return null;
  const key = `m${moduleNumber}${subLetter.toLowerCase()}`;
  return OURO_PROPRIO_SCRIPTS[key] ?? null;
}

export function buildSlideDeck(
  courseSlug: string,
  moduleNumber: number,
  subLetter: string,
): SlideDeck | null {
  const script = getScript(courseSlug, moduleNumber, subLetter);
  if (!script) return null;

  const course = getCourseBySlug(courseSlug);
  if (!course) return null;

  const slides: Slide[] = [];

  // 1. Titulo da aula (~8s)
  slides.push({
    tipo: "title",
    texto: script.title,
    subtexto: `Modulo ${moduleNumber} · Aula ${subLetter.toUpperCase()}`,
    duracao: 8,
  });

  // 2-6. Os cinco actos: marker + 1+ blocos de conteudo
  const sectionTexts: Record<Acto, string> = {
    pergunta: script.perguntaInicial,
    situacao: script.situacaoHumana,
    revelacao: script.revelacaoPadrao,
    gesto: script.gestoConsciencia,
    frase: script.fraseFinal,
  };

  for (const { acto, romano, label } of ACTOS) {
    // Marker intersticial de 1.5s
    slides.push({
      tipo: "acto-marker",
      acto,
      romano,
      label,
      duracao: 2,
    });

    const blocks = blocksForActo(acto, sectionTexts[acto]);
    for (const b of blocks) {
      slides.push({
        tipo: "conteudo",
        acto,
        romano,
        label,
        texto: b,
        duracao: acto === "frase" ? 12 : durationFor(b),
      });
    }
  }

  // 7. Fecho (fundo liso 2s) + logo
  slides.push({ tipo: "fecho", duracao: 2 });
  slides.push({
    tipo: "end",
    texto: "Escola dos Veus",
    subtexto: "seteveus.space",
    duracao: 5,
  });

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
