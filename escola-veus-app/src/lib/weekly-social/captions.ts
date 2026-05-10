/**
 * Caption builders — injecta título de faixa+álbum (Loranne) ou label (AG)
 * + hashtags da brand sobre o output do suggest/suggest-ag.
 *
 * Estrutura ordenada por importância narrativa (TikTok mostra só os
 * primeiros caracteres antes do "more"):
 *   1. Header com título real (skipa "Faixa N" placeholder)
 *   2. Mensagem principal (verses do suggest)
 *   3. Hook (pergunta emocional, do suggest)
 *   4. CTA + hashtags no fim
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
    if (/^[#@]/.test(trimmed) || /^https?:\/\//.test(trimmed)) return line;
    const m = trimmed.match(/^([^\p{L}]*)(\p{L})(.*)$/u);
    if (!m) return line;
    const [, prefix, ch, rest] = m;
    const indent = line.slice(0, line.length - trimmed.length);
    return indent + prefix + ch.toLocaleUpperCase("pt-PT") + rest;
  }).join("\n");
}

/** Skip "Faixa N" placeholder — usa só títulos reais. */
function realTitle(t: string | undefined): string {
  if (!t) return "";
  if (/^Faixa\s+\d+$/i.test(t.trim())) return "";
  return t.trim();
}

/** Header Loranne: "🎵 «Título» · Loranne · álbum Y" sem mostrar "Faixa N". */
function loranneHeader(trackTitle: string, albumTitle: string): string {
  const t = realTitle(trackTitle);
  const a = albumTitle?.trim();
  if (!t && !a) return "🎵 Loranne";
  if (!t) return `🎵 Loranne · álbum ${a}`;
  if (!a) return `🎵 "${t}" · Loranne`;
  return `🎵 "${t}" · Loranne · álbum ${a}`;
}

/** Header AG: "🎵 Ancient Ground — Label" (label é a coisa narrativa). */
function agHeader(label: string): string {
  return label?.trim() ? `🎵 Ancient Ground — ${label.trim()}` : "🎵 Ancient Ground";
}

/** Linha curta "sobre a música" — explica de que se trata para quem não
 *  conhece a marca. Loranne: música contemplativa em PT/EN do álbum X. */
function loranneAbout(albumTitle: string, lang?: "PT" | "EN"): string {
  const langLabel = lang === "EN" ? "em inglês" : "em português";
  return albumTitle
    ? `Sobre · canção contemplativa ${langLabel} do álbum ${albumTitle}, da artista moçambicana Loranne.`
    : `Sobre · canção contemplativa ${langLabel}, da artista moçambicana Loranne.`;
}

/** AG: instrumental contemplativo + temas. */
function agAbout(temas: readonly string[]): string {
  const t = (temas || []).filter(Boolean).join(" · ");
  return t
    ? `Sobre · instrumental ambiente para meditação e foco — temas raiz: ${t}.`
    : `Sobre · instrumental ambiente para meditação e foco.`;
}

/** Extrai a "mensagem principal" do tiktokCaption do suggest — tudo até
 *  ao primeiro hashtag, removendo URLs e linhas de CTA conhecidas. */
function extractBody(tiktokCaption: string | undefined): string {
  if (!tiktokCaption) return "";
  const lines = tiktokCaption
    .split("\n")
    .filter((l) => !l.startsWith("#"))
    .filter((l) => !/apple\s*music|spotify|seteveus\.space|music\./i.test(l));
  return capitalizeLines(lines.join("\n").trim());
}

export function buildLoranneCaptions(
  suggestResult: LoranneSuggest,
  brand: BrandConfig,
  meta: { trackTitle: string; albumTitle: string; theme: string | null; lang?: "PT" | "EN" },
): PlatformCaptions {
  const { trackTitle, albumTitle, theme, lang } = meta;
  const v1 = capitalizeLines(suggestResult.verses?.[0] || "");
  const v2 = capitalizeLines(suggestResult.verses?.[1] || "");
  const verses = [v1, v2].filter(Boolean).join("\n");
  const header = loranneHeader(trackTitle, albumTitle);
  const about = loranneAbout(albumTitle, lang);
  const body = extractBody(suggestResult.tiktokCaption);
  const cta = brand.cta || "";

  const igTags = expandHashtags(brand.hashtagsByPlatform.instagram, theme).join(" ");
  const ttTags = expandHashtags(brand.hashtagsByPlatform.tiktok, theme).join(" ");
  const ytTags = expandHashtags(brand.hashtagsByPlatform.youtube, theme).join(" ");

  // Ordem: header (título) → versos (mensagem) → about (explica) → body (hook) → CTA → tags
  const compose = (tags: string) => [
    header,
    "",
    verses,
    `\n${about}`,
    body && body !== verses ? `\n${body}` : "",
    cta ? `\n${cta}` : "",
    `\n${tags}`,
  ].filter(Boolean).join("\n");

  const instagram = compose(igTags);
  const tiktok = compose(ttTags);

  const ytTitle = suggestResult.youtubeTitle ||
    (realTitle(trackTitle)
      ? `"${realTitle(trackTitle)}" · ${albumTitle} · Loranne · Lyric Video`
      : `Loranne · ${albumTitle} · Lyric Video`);
  const ytDescBase = capitalizeLines((suggestResult.youtubeDescription || "")
    .split("\n")
    .filter((l) => !l.startsWith("#"))
    .join("\n")
    .trim());
  const ytDesc = [header, "", about, "", ytDescBase, cta, "", ytTags]
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
  const { label, temas } = meta;
  const v1 = capitalizeLines(suggestResult.versos?.[0] || "");
  const v2 = capitalizeLines(suggestResult.versos?.[1] || "");
  const verses = [v1, v2].filter(Boolean).join("\n");
  const header = agHeader(label);
  const about = agAbout(temas);
  const body = extractBody(suggestResult.tiktokCaption);

  const igTags = expandHashtags(brand.hashtagsByPlatform.instagram, null).join(" ");
  const ttTags = expandHashtags(brand.hashtagsByPlatform.tiktok, null).join(" ");
  const ytTags = expandHashtags(brand.hashtagsByPlatform.youtube, null).join(" ");

  const compose = (tags: string) => [
    header,
    "",
    verses,
    `\n${about}`,
    body && body !== verses ? `\n${body}` : "",
    "\nmusic.seteveus.space",
    `\n${tags}`,
  ].filter(Boolean).join("\n");

  const instagram = compose(igTags);
  const tiktok = compose(ttTags);

  const ytTitle = suggestResult.youtubeTitle || `${label} · Ancient Ground`;
  const ytDescBase = capitalizeLines((suggestResult.youtubeDescription || "")
    .split("\n")
    .filter((l) => !l.startsWith("#"))
    .join("\n")
    .trim());
  const ytDesc = [header, "", about, "", ytDescBase, "music.seteveus.space", "", ytTags]
    .filter(Boolean).join("\n");

  return {
    instagram,
    tiktok,
    youtube: { title: ytTitle, description: ytDesc },
  };
}
