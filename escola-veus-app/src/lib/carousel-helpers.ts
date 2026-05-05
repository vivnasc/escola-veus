// Helpers partilhados entre o legado /admin/producao/carrossel-veus
// (Estação dos Véus, fixo no repo) e o sistema de colecções dinâmicas.

import type { Dia, Slide as SlideType } from "./carousel-types";

/**
 * Texto que vai ser narrado para um slide (input ao TTS).
 */
export function deriveText(dia: Dia, slide: SlideType): string {
  if (slide.tipo === "capa") {
    return `Véu da ${dia.veu.toLowerCase()}. ${slide.linha1} ${slide.linha2}`;
  }
  if (slide.tipo === "conteudo") {
    const titulo = slide.titulo ? `${slide.titulo}. ` : "";
    return titulo + slide.texto.replace(/\n+/g, " ");
  }
  return `${slide.recurso}. ${slide.descricao}`;
}

/**
 * Legenda sugerida para o post (WhatsApp/IG).
 */
export function captionFor(dia: Dia, totalDias: number = 7): string {
  const capa = dia.slides.find((s) => s.tipo === "capa") as Extract<SlideType, { tipo: "capa" }> | undefined;
  const cta = dia.slides.find((s) => s.tipo === "cta") as Extract<SlideType, { tipo: "cta" }> | undefined;
  const conteudos = dia.slides.filter(
    (s): s is Extract<SlideType, { tipo: "conteudo" }> => s.tipo === "conteudo"
  );
  const primeiraProsa = conteudos.find((c) => c.estilo === "prosa")?.texto || conteudos[0]?.texto || "";

  return [
    `${dia.veu} · Dia ${dia.numero}/${totalDias}`,
    `— ${dia.subtitulo}`,
    "",
    capa ? `${capa.linha1}\n${capa.linha2}` : "",
    "",
    primeiraProsa.replace(/\n+/g, " ").slice(0, 280),
    "",
    cta ? `${cta.recurso}\n${cta.url}` : "",
  ]
    .filter((s) => s !== null && s !== undefined)
    .join("\n")
    .trim();
}

export function audioKey(dia: number, slide: number): string {
  return `${dia}-${slide}`;
}

export function tipoLabel(s: SlideType): string {
  if (s.tipo === "capa") return "capa";
  if (s.tipo === "cta") return "cta";
  return s.estilo;
}
