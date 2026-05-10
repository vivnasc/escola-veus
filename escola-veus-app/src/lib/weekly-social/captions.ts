/**
 * Caption builders — injecta título de faixa+álbum (Loranne) ou label (AG)
 * + hashtags da brand sobre o output do suggest/suggest-ag.
 */

import { expandHashtags, type BrandConfig } from "@/data/weekly-social/brand-config";

export type PlatformCaptions = {
  instagram: string;
  tiktok: string;
  youtube: { title: string; description: string };
};

export type LoranneSuggest = {
  verses?: string[];
  tiktokCaption?: string;
  youtubeTitle?: string;
  youtubeDescription?: string;
};

export type AGSuggest = {
  versos?: string[];
  tiktokCaption?: string;
  youtubeTitle?: string;
  youtubeDescription?: string;
};

/** Garante que cada linha (frase) começa com maiúscula. Preserva
 *  hashtags (#tag não muda), URLs e emojis. */
function capitalizeLines(text: string): string {
  if (!text) return text;
  return text.split("\n").map((line) => {
    const trimmed = line.trimStart();
    if (!trimmed) return line;
    // Hashtag, mention ou URL — não toca.
    if (/^[#@]/.test(trimmed) || /^https?:\/\//.test(trimmed)) return line;
    // Pula emojis/símbolos no início e capitaliza a primeira letra.
    const m = trimmed.match(/^([^\p{L}]*)(\p{L})(.*)$/u);
    if (!m) return line;
    const [, prefix, ch, rest] = m;
    const indent = line.slice(0, line.length - trimmed.length);
    return indent + prefix + ch.toLocaleUpperCase("pt-PT") + rest;
  }).join("\n");
}

export function buildLoranneCaptions(
  suggestResult: LoranneSuggest,
  brand: BrandConfig,
  meta: { trackTitle: string; albumTitle: string; theme: string | null },
): PlatformCaptions {
  const { trackTitle, albumTitle, theme } = meta;
  const v1 = capitalizeLines(suggestResult.verses?.[0] || "");
  const v2 = capitalizeLines(suggestResult.verses?.[1] || "");
  const trackTag = `🎵 "${trackTitle}" · álbum ${albumTitle}`;
  const cta = brand.cta || "";

  const igTags = expandHashtags(brand.hashtagsByPlatform.instagram, theme).join(" ");
  const ttTags = expandHashtags(brand.hashtagsByPlatform.tiktok, theme).join(" ");
  const ytTags = expandHashtags(brand.hashtagsByPlatform.youtube, theme).join(" ");

  const instagram = [
    [v1, v2].filter(Boolean).join("\n"),
    "",
    trackTag,
    cta,
    "",
    igTags,
  ].filter((l) => l !== undefined).join("\n");

  const ttBase = capitalizeLines((suggestResult.tiktokCaption || "")
    .split("\n")
    .filter((l) => !l.startsWith("#"))
    .join("\n")
    .trim());
  const tiktok = [ttBase, "", trackTag, "", ttTags].filter(Boolean).join("\n");

  const ytTitle = suggestResult.youtubeTitle ||
    `"${trackTitle}" · ${albumTitle} · Loranne #Shorts`;
  const ytDescBase = capitalizeLines((suggestResult.youtubeDescription || "")
    .split("\n")
    .filter((l) => !l.startsWith("#"))
    .join("\n")
    .trim());
  const ytDesc = [ytDescBase, "", trackTag, cta, "", ytTags]
    .filter(Boolean).join("\n");

  return {
    instagram,
    tiktok,
    youtube: { title: ytTitle, description: ytDesc },
  };
}

export function buildAGCaptions(
  suggestResult: AGSuggest,
  brand: BrandConfig,
  meta: { label: string; trackNumber: number; temas: readonly string[] },
): PlatformCaptions {
  const { label, trackNumber } = meta;
  const v1 = capitalizeLines(suggestResult.versos?.[0] || "");
  const v2 = capitalizeLines(suggestResult.versos?.[1] || "");
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

  const ttBase = capitalizeLines((suggestResult.tiktokCaption || "")
    .split("\n")
    .filter((l) => !l.startsWith("#"))
    .join("\n")
    .trim());
  const tiktok = [ttBase, "", trackTag, "", ttTags].filter(Boolean).join("\n");

  const ytTitle = suggestResult.youtubeTitle ||
    `${label} · Ancient Ground #Shorts`;
  const ytDescBase = capitalizeLines((suggestResult.youtubeDescription || "")
    .split("\n")
    .filter((l) => !l.startsWith("#"))
    .join("\n")
    .trim());
  const ytDesc = [ytDescBase, "", trackTag, "music.seteveus.space", "", ytTags]
    .filter(Boolean).join("\n");

  return {
    instagram,
    tiktok,
    youtube: { title: ytTitle, description: ytDesc },
  };
}
