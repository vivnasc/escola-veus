/**
 * Núcleo do `suggest` — extraído como função pure server-side. Pode ser
 * chamado directamente por outras rotas (weekly/plan) sem fetch interno
 * (que era bloqueado pelo Vercel auth gate).
 *
 * A rota /api/admin/shorts/suggest delega para esta função.
 */

import { getTrackLyrics, parseTrackNumber } from "@/lib/loranne";

const EMOTION_WORDS = [
  "coracao", "coração", "alma", "amor", "sagrado", "fogo", "luz", "voz",
  "pele", "veu", "véu", "veus", "véus", "nome", "verdade", "liberdade",
  "mae", "mãe", "filha", "saudade", "silencio", "silêncio", "memoria",
  "memória", "raiz", "terra", "chao", "chão", "agua", "água", "corpo",
  "ferida", "cicatriz", "grito", "canto", "respira", "abraco", "abraço",
  "sonho", "perda", "caminho", "porta", "abre", "escuta", "ouve",
  "casa", "ninho", "fim", "comeco", "começo", "inteira", "inteiro",
  "sozinha", "sozinho", "sangue", "ventre", "peito", "mao", "mão",
];

const PRONOUNS_START =
  /^(eu |tu |nos |nós |voce |você |ela |ele |vem |sou |es |és |amo |vejo |sinto |ouco |ouço |vou |choro |rio |vivo |volto |abro |fecho |tenho |quero |posso |preciso |esta |está )/i;

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function scoreLine(line: string): number {
  const trimmed = line.trim();
  if (!trimmed) return -999;
  if (/^\[.*\]$/.test(trimmed)) return -999;
  if (/^\(.+\)$/.test(trimmed)) return -500;
  const lower = stripDiacritics(trimmed.toLowerCase());

  let score = 0;
  const len = trimmed.length;
  if (len >= 25 && len <= 70) score += 3;
  else if (len >= 15 && len <= 90) score += 1;
  else if (len > 90) score -= 2;
  else if (len < 10) score -= 2;

  if (PRONOUNS_START.test(trimmed)) score += 2;

  let emoHits = 0;
  for (const w of EMOTION_WORDS) {
    if (lower.includes(stripDiacritics(w))) emoHits++;
  }
  score += Math.min(emoHits, 3) * 2;

  if (/[?!]$/.test(trimmed)) score += 1;
  if (/,/.test(trimmed)) score += 0.5;
  if (/^(oh+|ah+|ooh+|uuh+|na+)(\s|$)/i.test(trimmed)) score -= 3;

  return score;
}

function pickCandidates(lyrics: string, max = 6): string[] {
  const lines = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\[.*\]$/.test(l));

  if (lines.length === 0) return [];

  const scored = lines.map((line, i) => ({ line, i, score: scoreLine(line) }));

  const seen = new Set<string>();
  const uniq = scored.filter((s) => {
    const k = stripDiacritics(s.line.toLowerCase());
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const sorted = [...uniq].sort((a, b) => b.score - a.score);
  return sorted.slice(0, max).map((s) => s.line);
}

function pickTwoVerses(candidates: string[], allLines: string[]): [string, string] {
  if (candidates.length === 0) return ["", ""];
  if (candidates.length === 1) return [candidates[0], ""];

  const byIndex: Record<string, number> = {};
  allLines.forEach((l, i) => {
    if (!(l in byIndex)) byIndex[l] = i;
  });
  const half = allLines.length / 2;

  const first = candidates[0];
  const firstHalf = (byIndex[first] ?? 0) < half;
  const second =
    candidates.find((c) => c !== first && (byIndex[c] ?? 0) < half !== firstHalf) ||
    candidates[1];

  const i1 = byIndex[first] ?? 0;
  const i2 = byIndex[second] ?? 0;
  return i1 <= i2 ? [first, second] : [second, first];
}

const APPLE_MUSIC_CTA = "Ouve no Apple Music → music.seteveus.space";

const EMOTIONAL_QUESTIONS = [
  "E tu, o que sentes ao ler isto?",
  "Já te aconteceu?",
  "Lembras-te de quando?",
  "O que te toca aqui?",
  "Onde estavas quando isto te encontrou?",
  "O que te traz a esta verdade?",
  "Reconheces-te?",
  "Que parte de ti reconhece esta voz?",
  "Que palavra ficou em ti?",
  "O que abre em ti agora?",
];

function pickQuestion(seed: string): string {
  if (!seed) return EMOTIONAL_QUESTIONS[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return EMOTIONAL_QUESTIONS[Math.abs(h) % EMOTIONAL_QUESTIONS.length];
}

function buildHashtags(theme?: string): string {
  // Mix de keywords musicais (descobrir Loranne via search) +
  // identidade Moz/PALOPs (audiência alvo). 13 tags — só primeiras 3
  // ficam clickable no YT mas todas pesam para o algoritmo.
  const tags = [
    "#Loranne",
    "#LyricVideo",
    "#MusicaPortuguesa",
    theme ? `#${theme.replace(/\s+/g, "").toLowerCase()}` : "",
    "#poesia",
    "#musicacontemplativa",
    "#mozambique",
    "#moz",
    "#maputo",
    "#palops",
    "#lusofonia",
    "#musicaafricana",
    "#vivianneNascimento",
  ].filter(Boolean);
  return tags.join(" ");
}

function makeTikTokCaption(v1: string, v2: string, theme: string | undefined, seed: string): string {
  const verseBlock = [v1, v2].filter(Boolean).join("\n");
  const question = pickQuestion(seed);
  const hashtags = buildHashtags(theme);
  return [verseBlock, "", question, "", APPLE_MUSIC_CTA, "", hashtags]
    .filter((l) => l !== undefined)
    .join("\n");
}

function makeYouTubeTitle(trackTitle: string, albumTitle: string, _v1: string): string {
  // SEO format: TrackTitle · Loranne · Album · Lyric Video PT
  // Keywords-first (track + artist + album + format) — algoritmo YT search
  // privilegia título + descrição + tags por ordem.
  const trim = (s: string, max: number) =>
    s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
  // Title YT máx útil = 70 chars antes de cortar nos previews.
  const safeTrack = trim(trackTitle || "Loranne", 30);
  const safeAlbum = trim(albumTitle || "", 25);
  const base = safeAlbum
    ? `${safeTrack} · Loranne · ${safeAlbum} · Lyric Video`
    : `${safeTrack} · Loranne · Lyric Video PT`;
  return trim(base, 100); // YT hard limit é 100
}

function makeYouTubeDescription(
  trackTitle: string,
  albumTitle: string,
  v1: string,
  v2: string,
  theme: string | undefined,
  seed: string,
): string {
  const verses = [v1, v2].filter(Boolean).join("\n");
  const question = pickQuestion(seed);
  const themeLine = theme ? `\n${theme}\n` : "";

  // Descrição YT — primeiros ~150 chars são visíveis em search/preview.
  // Estrutura SEO:
  //   1. Hook curto com keywords (track + artist + album + lyric video)
  //   2. Verso (poesia)
  //   3. CTA Apple Music
  //   4. Sobre Loranne
  //   5. Hashtags (5-15 — só os primeiros 3 ficam clickable)
  const seoHook = `${trackTitle} de Loranne — lyric video do álbum ${albumTitle}. Música contemplativa em português, registo elevadora.`;
  const aboutLoranne = "Loranne é o projecto musical de Vivianne Nascimento. Música em português e inglês, gravada em Maputo, Moçambique. Lyric videos com letras em sync, para meditar, conduzir, voltar a si.";

  return [
    seoHook,
    "",
    verses,
    themeLine,
    question,
    "",
    `🎵 ${APPLE_MUSIC_CTA}`,
    "",
    aboutLoranne,
    "",
    buildHashtags(theme),
  ].join("\n");
}

export type SuggestInput = {
  albumSlug?: string;
  trackNumber?: number;
  trackName?: string;
  theme?: string;
  lyrics?: string;
  trackLabel?: string;
};

export type SuggestResult = {
  albumSlug?: string;
  albumTitle: string;
  trackNumber: number | null;
  trackTitle: string;
  verses: [string, string];
  candidates: string[];
  tiktokCaption: string;
  youtubeTitle: string;
  youtubeDescription: string;
};

/** Lança Error em casos inválidos — caller decide HTTP status. */
export function runSuggest(input: SuggestInput): SuggestResult {
  const { albumSlug, trackNumber: tn, trackName, theme, lyrics: rawLyrics, trackLabel } = input;

  let lyrics = "";
  let trackTitle = "";
  let albumTitle = "";
  let finalTrackNumber: number | null = typeof tn === "number" ? tn : null;

  if (albumSlug) {
    const n = finalTrackNumber ?? (trackName ? parseTrackNumber(trackName) : null);
    if (!n) {
      throw new Error("trackNumber ou trackName valido obrigatorio com albumSlug.");
    }
    const found = getTrackLyrics(albumSlug, n);
    if (!found) {
      throw new Error(`Nao encontrei letra para ${albumSlug}/${n}.`);
    }
    lyrics = found.lyrics;
    trackTitle = found.trackTitle;
    albumTitle = found.albumTitle;
    finalTrackNumber = found.trackNumber;
  } else if (rawLyrics && typeof rawLyrics === "string") {
    lyrics = rawLyrics;
    trackTitle = trackLabel || "";
    albumTitle = "";
  } else {
    throw new Error("albumSlug + trackNumber/trackName obrigatorios (ou lyrics legacy).");
  }

  if (!lyrics.trim()) {
    throw new Error(`Faixa "${trackTitle}" nao tem letra em loranne-lyrics/ (possivelmente instrumental).`);
  }

  const allLines = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\[.*\]$/.test(l));
  const candidates = pickCandidates(lyrics, 6);
  const [v1, v2] = pickTwoVerses(candidates, allLines);

  const seed = `${albumSlug || ""}/${finalTrackNumber || ""}`;
  return {
    albumSlug,
    albumTitle,
    trackNumber: finalTrackNumber,
    trackTitle,
    verses: [v1, v2],
    candidates,
    tiktokCaption: makeTikTokCaption(v1, v2, theme, seed),
    youtubeTitle: makeYouTubeTitle(trackTitle || "Loranne", albumTitle || "", v1),
    youtubeDescription: makeYouTubeDescription(
      trackTitle || "Loranne",
      albumTitle || "",
      v1,
      v2,
      theme,
      seed,
    ),
  };
}
