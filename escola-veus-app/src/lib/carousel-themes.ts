// Paletas / temas pré-definidos para os slides do carrossel.
// Cada colecção pode escolher um destes temas (ou usar "veus" por defeito).
// Slide.tsx aceita um `theme` prop opcional que substitui as cores hardcoded.

export type CarouselTheme = {
  /** identificador curto, persistido no jsonb da colecção */
  id: string;
  label: string;
  ink: string;
  ivory: string;
  deep: string;
  terracotta: string;
  gold: string;
  /** rgba string */
  mist: string;
};

export const THEMES: CarouselTheme[] = [
  {
    id: "veus",
    label: "Os Sete Véus",
    ink: "#1a1614",
    ivory: "#ede4d3",
    deep: "#0a0907",
    terracotta: "#b85c38",
    gold: "#c9a961",
    mist: "rgba(237, 228, 211, 0.65)",
  },
  {
    id: "maternidade",
    label: "Maternidade (rosado)",
    ink: "#2a1a18",
    ivory: "#f4e4dc",
    deep: "#1a0d0a",
    terracotta: "#c47a5e",
    gold: "#d4a577",
    mist: "rgba(244, 228, 220, 0.65)",
  },
  {
    id: "lua",
    label: "Lua Cheia (azul-prata)",
    ink: "#0d1220",
    ivory: "#dde1ea",
    deep: "#06080f",
    terracotta: "#7a8db5",
    gold: "#c0c4d2",
    mist: "rgba(221, 225, 234, 0.65)",
  },
  {
    id: "dourado",
    label: "Dourado (alta intensidade)",
    ink: "#1a0f00",
    ivory: "#f5e9c8",
    deep: "#0c0700",
    terracotta: "#b8782a",
    gold: "#e0b840",
    mist: "rgba(245, 233, 200, 0.65)",
  },
  {
    id: "selva",
    label: "Selva (verde profundo)",
    ink: "#0d1a0f",
    ivory: "#e0e8d8",
    deep: "#050a06",
    terracotta: "#8e9d6b",
    gold: "#c0a965",
    mist: "rgba(224, 232, 216, 0.65)",
  },
];

export const DEFAULT_THEME = THEMES[0];

export function themeById(id: string | undefined | null): CarouselTheme {
  if (!id) return DEFAULT_THEME;
  return THEMES.find((t) => t.id === id) ?? DEFAULT_THEME;
}
