// Constrói legendas finais por plataforma a partir dos resultados do
// suggest/suggest-ag, injectando título da faixa+álbum (Loranne) ou label
// (AG) — ajuda as pessoas a encontrarem a música em music.seteveus.space.

import brandConfigMod from "../../../src/data/weekly-social/brand-config.ts";
const { expandHashtags } = brandConfigMod;

/**
 * Loranne caption builder.
 *
 * suggestResult: { verses[], tiktokCaption, youtubeTitle, youtubeDescription, ... }
 * brand: BRANDS.loranne
 * meta: { trackTitle, albumTitle, theme }
 *
 * Devolve { instagram, tiktok, youtube: { title, description } }.
 */
export function buildLoranneCaptions(suggestResult, brand, meta) {
  const { trackTitle, albumTitle, theme } = meta;
  const v1 = suggestResult.verses?.[0] || "";
  const v2 = suggestResult.verses?.[1] || "";
  const trackTag = `🎵 "${trackTitle}" · álbum ${albumTitle}`;
  const cta = brand.cta || "";

  const igTags = expandHashtags(brand.hashtagsByPlatform.instagram, theme).join(" ");
  const ttTags = expandHashtags(brand.hashtagsByPlatform.tiktok, theme).join(" ");
  const ytTags = expandHashtags(brand.hashtagsByPlatform.youtube, theme).join(" ");

  // Instagram — verso 1, verso 2, track tag, CTA, hashtags.
  const instagram = [
    [v1, v2].filter(Boolean).join("\n"),
    "",
    trackTag,
    cta,
    "",
    igTags,
  ].filter((l) => l !== undefined).join("\n");

  // TikTok — usa o que `suggest` já devolveu mas substitui hashtags pelo
  // pool da brand (mais completo que o do route) e injecta trackTag.
  const ttBase = (suggestResult.tiktokCaption || "")
    .split("\n")
    .filter((l) => !l.startsWith("#")) // remove hashtags antigas
    .join("\n")
    .trim();
  const tiktok = [ttBase, "", trackTag, "", ttTags].filter(Boolean).join("\n");

  // YouTube — usa título do route (já tem track + album), mas garante que
  // o trackTag aparece também na descrição.
  const ytTitle = suggestResult.youtubeTitle || `"${trackTitle}" · ${albumTitle} · Loranne #Shorts`;
  const ytDescBase = (suggestResult.youtubeDescription || "")
    .split("\n")
    .filter((l) => !l.startsWith("#"))
    .join("\n")
    .trim();
  const ytDesc = [ytDescBase, "", trackTag, cta, "", ytTags].filter(Boolean).join("\n");

  return {
    instagram,
    tiktok,
    youtube: { title: ytTitle, description: ytDesc },
  };
}

/**
 * Ancient Ground caption builder.
 *
 * suggestResult: { versos[], tiktokCaption, youtubeTitle, youtubeDescription }
 * brand: BRANDS["ancient-ground"]
 * meta: { label, trackNumber, temas }
 */
export function buildAGCaptions(suggestResult, brand, meta) {
  const { label, trackNumber } = meta;
  const v1 = suggestResult.versos?.[0] || "";
  const v2 = suggestResult.versos?.[1] || "";
  const trackTag = `🎵 Ancient Ground · faixa ${trackNumber} (${label})`;

  const igTags = expandHashtags(brand.hashtagsByPlatform.instagram, null).join(" ");
  const ttTags = expandHashtags(brand.hashtagsByPlatform.tiktok, null).join(" ");
  const ytTags = expandHashtags(brand.hashtagsByPlatform.youtube, null).join(" ");

  const instagram = [
    [v1, v2].filter(Boolean).join("\n"),
    "",
    trackTag,
    "music.seteveus.space",
    "",
    igTags,
  ].filter((l) => l !== undefined).join("\n");

  const ttBase = (suggestResult.tiktokCaption || "")
    .split("\n")
    .filter((l) => !l.startsWith("#"))
    .join("\n")
    .trim();
  const tiktok = [ttBase, "", trackTag, "", ttTags].filter(Boolean).join("\n");

  const ytTitle = suggestResult.youtubeTitle ||
    `${label} · Ancient Ground #Shorts`;
  const ytDescBase = (suggestResult.youtubeDescription || "")
    .split("\n")
    .filter((l) => !l.startsWith("#"))
    .join("\n")
    .trim();
  const ytDesc = [ytDescBase, "", trackTag, "music.seteveus.space", "", ytTags]
    .filter(Boolean).join("\n");

  return {
    instagram,
    tiktok,
    youtube: { title: ytTitle, description: ytDesc },
  };
}
