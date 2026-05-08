/**
 * 7 moods Loranne — playlists de elevação por estado de espírito.
 *
 * Inspirados nos 7 véus / 7 espelhos. Cada track Loranne fica taggeada
 * com 1-2 moods. Bulk semanal pode rotacionar dentro dum mood específico
 * ("esta semana: Elevar"), e cada caption inclui link da playlist no
 * canal YouTube.
 */

export const LORANNE_MOODS = [
  "elevar",
  "aterrar",
  "acordar",
  "lembrar",
  "reunir-se",
  "respirar",
  "atravessar",
] as const;

export type LoranneMood = (typeof LORANNE_MOODS)[number];

export type MoodMeta = {
  slug: LoranneMood;
  /** Nome humano (Title case). */
  label: string;
  /** Para quem? — descrição curta, 1 linha. */
  paraQuem: string;
  /** Vibe musical típica das tracks deste mood. */
  vibe: string;
  /** Cor de acento da playlist (UI/social). */
  color: string;
  /** Slug da playlist no canal (URL-friendly). */
  playlistSlug: string;
};

export const MOOD_META: Record<LoranneMood, MoodMeta> = {
  "elevar": {
    slug: "elevar",
    label: "Elevar",
    paraQuem: "Quem está em baixo, quer levantar",
    vibe: "anthem · gospel · libertação",
    color: "#FFD27F",
    playlistSlug: "elevar",
  },
  "aterrar": {
    slug: "aterrar",
    label: "Aterrar",
    paraQuem: "Quem está disperso, quer presença",
    vibe: "corpo · terra · raiz",
    color: "#B08050",
    playlistSlug: "aterrar",
  },
  "acordar": {
    slug: "acordar",
    label: "Acordar",
    paraQuem: "Quem vive em automatismo",
    vibe: "pulse · pergunta · revelação",
    color: "#7E57C2",
    playlistSlug: "acordar",
  },
  "lembrar": {
    slug: "lembrar",
    label: "Lembrar",
    paraQuem: "Quem perdeu o eixo, quer voltar à raiz",
    vibe: "sagrado · ancestrais · matéria",
    color: "#B0344A",
    playlistSlug: "lembrar",
  },
  "reunir-se": {
    slug: "reunir-se",
    label: "Reunir-se",
    paraQuem: "Quem se sente fragmentado",
    vibe: "whisper · inteireza · regresso a si",
    color: "#D4A853",
    playlistSlug: "reunir-se",
  },
  "respirar": {
    slug: "respirar",
    label: "Respirar",
    paraQuem: "Quem vive em pressa",
    vibe: "calma · pausa · fôlego",
    color: "#A088C0",
    playlistSlug: "respirar",
  },
  "atravessar": {
    slug: "atravessar",
    label: "Atravessar",
    paraQuem: "Quem está num limiar / transição / despedida",
    vibe: "passagem · recomeço · fronteira",
    color: "#4A6FA5",
    playlistSlug: "atravessar",
  },
};

export type TrackMoodAssignment = {
  /** 1-2 moods. Primeiro é o primário. */
  moods: LoranneMood[];
  /** 0-1 — confiança do Claude no tag. */
  confidence: number;
  /** Justificação curta (1 frase) — útil para auditoria. */
  reason: string;
  /** ISO timestamp do último update. */
  updatedAt: string;
  /** Quem editou — "auto" (Claude) ou "manual" (admin). */
  source: "auto" | "manual";
};

export type LoranneMoodsData = {
  version: number;
  /** key = "albumSlug/trackNumber" — ex: "espelho-ilusao/7" */
  tracks: Record<string, TrackMoodAssignment>;
  /** ISO timestamp da última auto-tag global. */
  lastAutoTagAt?: string;
};

export const EMPTY_MOODS_DATA: LoranneMoodsData = {
  version: 1,
  tracks: {},
};

/** Constrói URL pública da playlist YouTube/Apple para um mood. */
export function moodPlaylistUrl(mood: LoranneMood): string {
  return `https://music.seteveus.space/${MOOD_META[mood].playlistSlug}`;
}

/** Track key canónica. */
export function trackKey(albumSlug: string, trackNumber: number): string {
  return `${albumSlug}/${trackNumber}`;
}

export function parseTrackKey(key: string): { albumSlug: string; trackNumber: number } | null {
  const m = key.match(/^([a-z0-9-]+)\/(\d+)$/);
  if (!m) return null;
  return { albumSlug: m[1], trackNumber: parseInt(m[2], 10) };
}
