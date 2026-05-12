// Helpers partilhados entre o legado /admin/producao/carrossel-veus
// (Estação dos Véus, fixo no repo) e o sistema de colecções dinâmicas.

import type { Dia, Slide as SlideType } from "./carousel-types";

const BRAND_HASHTAGS = [
  "#seteveus",
  "#escoladosveus",
  "#despertar",
  "#autoconhecimento",
  "#presenca",
  "#consciencia",
  "#vidainterior",
];

function toHashtag(s: string): string {
  const clean = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return clean ? `#${clean}` : "";
}

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
 * Legenda sugerida para o POST (WhatsApp/IG/FB) — não é transcrição do
 * vídeo. Estrutura conversacional: saudação + "hoje vamos falar de X" +
 * subtítulo + pergunta provocadora + CTA. Editável depois.
 */
export function captionFor(dia: Dia, totalDias: number = 7): string {
  const veuLower = dia.veu.toLowerCase();
  const cta = dia.slides.find((s) => s.tipo === "cta") as Extract<SlideType, { tipo: "cta" }> | undefined;
  const habito = dia.slides.find(
    (s) => s.tipo === "conteudo" && (s as Extract<SlideType, { tipo: "conteudo" }>).titulo
  ) as Extract<SlideType, { tipo: "conteudo" }> | undefined;

  // Pergunta/convite: se houver hábito, usa-o como prática; senão, pergunta genérica.
  const pergunta = habito
    ? `E se experimentasses esta semana: ${habito.texto.replace(/\n+/g, " ")}`
    : `E tu — como te relacionas com ${veuLower}?`;

  const veuTag = toHashtag(dia.veu);
  const hashtags = [veuTag, ...BRAND_HASHTAGS].filter(Boolean).join(" ");

  const lines = [
    "Olá.",
    "",
    `Hoje vamos falar de ${veuLower}.`,
    dia.subtitulo ? `_${dia.subtitulo}_` : "",
    "",
    pergunta,
    "",
    `Dia ${dia.numero}/${totalDias} · ${dia.veu}`,
    "",
    cta ? `${cta.recurso}\n${cta.url}` : "",
    "",
    hashtags,
  ];

  return lines.filter((l) => l !== null && l !== undefined).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function audioKey(dia: number, slide: number): string {
  return `${dia}-${slide}`;
}

export function tipoLabel(s: SlideType): string {
  if (s.tipo === "capa") return "capa";
  if (s.tipo === "cta") return "cta";
  return s.estilo;
}
