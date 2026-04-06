/**
 * Paleta de cores por território/curso.
 * Cada curso tem uma cor primária e accent que substituem
 * o dourado default nas páginas de curso.
 */

export type TerritoryTheme = {
  primary: string;
  accent: string;
  primaryRgb: string; // for rgba() usage
};

const themes: Record<string, TerritoryTheme> = {
  // Heranças
  "ouro-proprio": {
    primary: "#D4A853",
    accent: "#E8C97A",
    primaryRgb: "212, 168, 83",
  },
  "sangue-e-seda": {
    primary: "#A83232",
    accent: "#D4746A",
    primaryRgb: "168, 50, 50",
  },
  "o-silencio-que-grita": {
    primary: "#7A8FA6",
    accent: "#B8C8D8",
    primaryRgb: "122, 143, 166",
  },
  "a-mulher-antes-de-mae": {
    primary: "#C2956B",
    accent: "#E8D5B5",
    primaryRgb: "194, 149, 107",
  },
  "o-fio-invisivel": {
    primary: "#6B8F71",
    accent: "#A8C9AD",
    primaryRgb: "107, 143, 113",
  },

  // Matéria
  "pele-nua": {
    primary: "#C4745A",
    accent: "#E09B85",
    primaryRgb: "196, 116, 90",
  },
  "o-peso-e-o-chao": {
    primary: "#8A8A8A",
    accent: "#B5A892",
    primaryRgb: "138, 138, 138",
  },
  "a-chama": {
    primary: "#CC5500",
    accent: "#FF8C42",
    primaryRgb: "204, 85, 0",
  },
  "a-fome": {
    primary: "#C4745A",
    accent: "#E8D5CE",
    primaryRgb: "196, 116, 90",
  },
  "a-coroa-escondida": {
    primary: "#B8860B",
    accent: "#9B59B6",
    primaryRgb: "184, 134, 11",
  },

  // Ciclos
  "depois-do-fogo": {
    primary: "#CC5500",
    accent: "#5D8A4E",
    primaryRgb: "204, 85, 0",
  },
  "olhos-abertos": {
    primary: "#4A6FA5",
    accent: "#D0D8E8",
    primaryRgb: "74, 111, 165",
  },
  "flores-no-escuro": {
    primary: "#4ECDC4",
    accent: "#2A5298",
    primaryRgb: "78, 205, 196",
  },
  "o-relogio-partido": {
    primary: "#A8A8B0",
    accent: "#D4A853",
    primaryRgb: "168, 168, 176",
  },
  "o-oficio-de-ser": {
    primary: "#B08D57",
    accent: "#8B7355",
    primaryRgb: "176, 141, 87",
  },

  // Fronteiras
  "a-arte-da-inteireza": {
    primary: "#7C6FB0",
    accent: "#5A8FAD",
    primaryRgb: "124, 111, 176",
  },
  "limite-sagrado": {
    primary: "#C9A96E",
    accent: "#E8D5A0",
    primaryRgb: "201, 169, 110",
  },
  "voz-de-dentro": {
    primary: "#7C3AED",
    accent: "#D4A853",
    primaryRgb: "124, 58, 237",
  },
  "o-espelho-do-outro": {
    primary: "#2D8B5F",
    accent: "#C9A96E",
    primaryRgb: "45, 139, 95",
  },
  "a-teia": {
    primary: "#5D7A4E",
    accent: "#C9A96E",
    primaryRgb: "93, 122, 78",
  },
};

// Default fallback
const defaultTheme: TerritoryTheme = {
  primary: "#C9A96E",
  accent: "#D4B87A",
  primaryRgb: "201, 169, 110",
};

export function getTerritoryTheme(courseSlug: string): TerritoryTheme {
  return themes[courseSlug] || defaultTheme;
}

/** CSS custom properties to apply as style on a wrapper element */
export function getTerritoryStyle(courseSlug: string): React.CSSProperties {
  const theme = getTerritoryTheme(courseSlug);
  return {
    "--t-primary": theme.primary,
    "--t-accent": theme.accent,
    "--t-primary-rgb": theme.primaryRgb,
  } as React.CSSProperties;
}
