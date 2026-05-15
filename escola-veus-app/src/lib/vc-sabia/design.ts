/**
 * Design settings do overlay variante C.
 * Persistido em course-assets/vc-sabia-meta/design-settings.json.
 */

export type VcSabiaDesign = {
  cardBg: string;
  cardBgOpacity: number;
  cardBorder: string;
  cornerColor: string;
  kickerColor: string;
  phraseColor: string;
  footerColor: string;
  cardY: number;
  kickerSize: number;
  phraseSize: number;
};

export const DEFAULT_DESIGN: VcSabiaDesign = {
  cardBg: "#140F1E",
  cardBgOpacity: 0.14,
  cardBorder: "#C9A96E",
  cornerColor: "#D4AF37",
  kickerColor: "#D4AF37",
  phraseColor: "#FAF7F0",
  footerColor: "#FAF7F0",
  cardY: 880,
  kickerSize: 56,
  phraseSize: 60,
};
