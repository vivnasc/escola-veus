/**
 * Paletas presets para "Hoje, em Mim".
 *
 * Cada tema define as cores do overlay (cobre, creme, indigo de fundo,
 * stroke do scrim). O motion fica intacto. Permite à utilizadora
 * adaptar o overlay quando uma imagem tem fundo que não combina com a
 * cor de cobre default.
 *
 * O default ("carta-noturna") replica o look original (cobre morno +
 * creme + indigo). Os outros são presets pensados para diferentes
 * temperaturas de motion.
 *
 * Usado em:
 *  - Preview Frame (componente)
 *  - Worker SVG (server-side render)
 *  - JobVideoGrid (selector por item, override por dia)
 */

export type HoEmMimTheme = {
  id: string;
  label: string;
  notas: string;
  /** Cor principal do overlay (arco, kicker, glifo). */
  highlight: string;
  /** Cor com 55% alpha (cantoneira, scrim do arco, "SETEVEUS.SPACE"). */
  highlightSoft: string;
  /** Cor do corpo do texto (frase central). */
  text: string;
  /** Cor base do bg (vignette + scrim). */
  bg: string;
  /** Multiplicador eq do ffmpeg, aplica-se ao motion para harmonizar. */
  ffmpegEq: string;
};

export const HEM_THEMES: HoEmMimTheme[] = [
  {
    id: "carta-noturna",
    label: "Cobre + indigo (escuro e quente)",
    notas: "Cobre morno + creme + indigo. Adapta a motions noturnos azuis e roxos.",
    highlight: "rgb(194, 143, 96)",
    highlightSoft: "rgba(194, 143, 96, 0.55)",
    text: "rgb(242, 233, 216)",
    bg: "rgb(14, 8, 32)",
    ffmpegEq: "brightness=0.12:saturation=1.1:contrast=0.95:gamma=0.82",
  },
  {
    id: "luar-prata",
    label: "Luar Prata",
    notas: "Prata fria. Bom para água, vidro, luar, neve, cenas frias.",
    highlight: "rgb(204, 204, 220)",
    highlightSoft: "rgba(204, 204, 220, 0.55)",
    text: "rgb(248, 244, 236)",
    bg: "rgb(20, 24, 38)",
    ffmpegEq: "brightness=0.10:saturation=0.85:contrast=1.05:gamma=0.85",
  },
  {
    id: "dourado-luminoso",
    label: "Dourado Luminoso",
    notas: "Dourado quente vivo. Para velas, lume, lanternas, cenas amarelas-quentes.",
    highlight: "rgb(212, 168, 83)",
    highlightSoft: "rgba(212, 168, 83, 0.55)",
    text: "rgb(250, 244, 224)",
    bg: "rgb(26, 14, 5)",
    ffmpegEq: "brightness=0.08:saturation=1.15:contrast=1.0:gamma=0.85",
  },
  {
    id: "rosa-incenso",
    label: "Rosa Incenso",
    notas: "Rosa-cobre suave. Para jasmim, flores, peles, cenas íntimas quentes.",
    highlight: "rgb(212, 151, 124)",
    highlightSoft: "rgba(212, 151, 124, 0.55)",
    text: "rgb(245, 235, 216)",
    bg: "rgb(31, 15, 26)",
    ffmpegEq: "brightness=0.10:saturation=1.05:contrast=0.98:gamma=0.85",
  },
  {
    id: "branco-puro",
    label: "Branco Puro",
    notas: "Branco-marfim minimalista. Para fundos muito escuros ou muito brilhantes onde cobre desaparece.",
    highlight: "rgb(232, 229, 221)",
    highlightSoft: "rgba(232, 229, 221, 0.55)",
    text: "rgb(255, 255, 255)",
    bg: "rgb(10, 10, 20)",
    ffmpegEq: "brightness=0.12:saturation=0.95:contrast=1.0:gamma=0.82",
  },
  {
    id: "verde-musgo",
    label: "Verde Musgo",
    notas: "Verde terroso. Para vegetação, floresta, bambu, plantas tropicais.",
    highlight: "rgb(168, 175, 122)",
    highlightSoft: "rgba(168, 175, 122, 0.55)",
    text: "rgb(245, 240, 220)",
    bg: "rgb(14, 22, 18)",
    ffmpegEq: "brightness=0.10:saturation=1.1:contrast=1.0:gamma=0.85",
  },
];

export const DEFAULT_THEME_ID = "carta-noturna";

export function getTheme(id: string | undefined | null): HoEmMimTheme {
  return (
    HEM_THEMES.find((t) => t.id === id) ??
    HEM_THEMES.find((t) => t.id === DEFAULT_THEME_ID) ??
    HEM_THEMES[0]
  );
}
