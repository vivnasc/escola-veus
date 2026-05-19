/**
 * Brand config — geração semanal de conteúdo social para upload em Metricool.
 *
 * Consumido por `scripts/weekly/weekly.mjs`. Cada marca define:
 *  - dias da semana em que publica
 *  - horário por plataforma (fuso CAT/Maputo UTC+2)
 *  - hashtag pools por plataforma
 *  - filename do ZIP
 *
 * Fuso default: Maputo (CAT, UTC+2). Loranne é moçambicana e AG é Moçambique
 * — alinha com público Moz/PALOPs e com a residência da autora.
 */

export type Platform = "instagram" | "tiktok" | "youtube";

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type BrandSlug = "loranne" | "ancient-ground";

export type BrandConfig = {
  slug: BrandSlug;
  /** Nome legível usado em logs e no nome do ZIP. */
  displayName: string;
  /** Dias da semana em que se publica clips (1 post por dia, replicado por plataforma). */
  publishDays: DayOfWeek[];
  /** Dias da semana em que se publica fulls (apenas YT canal). Default = publishDays. */
  publishDaysFull?: DayOfWeek[];
  /** Hora local Maputo (HH:MM) por plataforma — staggered. */
  hoursByPlatform: Record<Platform, string>;
  /** Pool de hashtags por plataforma. `<tema>` é placeholder dinâmico (substituído em runtime). */
  hashtagsByPlatform: Record<Platform, string[]>;
  /** CTA fixo (Loranne aponta para distro multi-plataforma; AG não tem CTA explícito por defeito). */
  cta?: string;
};

export const TIMEZONE = "Africa/Maputo"; // CAT, UTC+2

export const BRANDS: Record<BrandSlug, BrandConfig> = {
  loranne: {
    slug: "loranne",
    displayName: "Loranne",
    // 1/dia × 7 dias
    publishDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    // Horário único 10:00 (hora de maior alcance segundo Metricool).
    // Antes era staggered YT 18h / IG 20h / TT 20h30; o staggering
    // diluía o pico — todos a 10:00 maximiza reach por post.
    hoursByPlatform: {
      youtube: "10:00",
      instagram: "10:00",
      tiktok: "10:00",
    },
    hashtagsByPlatform: {
      // IG: 15 tags — mistura volume alto + nicho
      instagram: [
        "#Loranne",
        "#<tema>",
        "#poesia",
        "#poesiavisual",
        "#natureza",
        "#mozambique",
        "#moz",
        "#maputo",
        "#africa",
        "#palops",
        "#lusofonia",
        "#musicaafricana",
        "#afromusic",
        "#musicaportuguesa",
        "#despertar",
      ],
      // TT: 6 — só os primeiros pegam algoritmicamente
      tiktok: [
        "#Loranne",
        "#<tema>",
        "#mozambique",
        "#poesia",
        "#musicaafricana",
        "#fyp",
      ],
      // YT: 10 — vão na descrição
      youtube: [
        "#Loranne",
        "#Shorts",
        "#<tema>",
        "#poesia",
        "#natureza",
        "#mozambique",
        "#africa",
        "#musicaafricana",
        "#lusofonia",
        "#spokenword",
      ],
    },
    cta: "Ouve em todas as plataformas → music.seteveus.space",
  },

  "ancient-ground": {
    slug: "ancient-ground",
    displayName: "Ancient Ground",
    // Shorts (clip 30s): 3/sem Ter/Qui/Sáb (consistência social)
    publishDays: ["tue", "thu", "sat"],
    // Fulls (3-5min YT canal): 3/sem Seg/Qua/Sex (alterna com clips,
    // primes audiência um dia antes do clip social)
    publishDaysFull: ["mon", "wed", "fri"],
    // Horário único 10:00 (hora de maior alcance segundo Metricool).
    hoursByPlatform: {
      youtube: "10:00",
      instagram: "10:00",
      tiktok: "10:00",
    },
    hashtagsByPlatform: {
      instagram: [
        "#AncientGround",
        "#AfricanNature",
        "#Mozambique",
        "#Moz",
        "#Maputo",
        "#Africa",
        "#NaturePoetry",
        "#AmbientMusic",
        "#Indigenous",
        "#AfricanCulture",
        "#Ubuntu",
        "#PALOPs",
        "#Lusofonia",
        "#DocumentaryStyle",
        "#SlowCinema",
      ],
      tiktok: [
        "#AfricanNature",
        "#Mozambique",
        "#AmbientMusic",
        "#Africa",
        "#Ubuntu",
        "#fyp",
      ],
      youtube: [
        "#Shorts",
        "#AncientGround",
        "#Mozambique",
        "#Africa",
        "#AmbientMusic",
        "#NaturePoetry",
        "#Ubuntu",
        "#AfricanCulture",
        "#PALOPs",
        "#Indigenous",
      ],
    },
  },
};

export const ALL_PLATFORMS: Platform[] = ["instagram", "tiktok", "youtube"];

/** Ordem dos dias da semana ISO (Mon=0). */
export const DAY_ORDER: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Resolve `<tema>` placeholder substituindo pela hashtag concreta. */
export function expandHashtags(tags: string[], theme: string | null): string[] {
  if (!theme) return tags.filter((t) => t !== "#<tema>");
  const themeTag = `#${theme.replace(/[-\s]+/g, "").toLowerCase()}`;
  return tags.map((t) => (t === "#<tema>" ? themeTag : t));
}
