import { NextRequest, NextResponse } from "next/server";
import { getTrackLyrics, parseTrackNumber } from "@/lib/loranne";

/**
 * POST /api/admin/shorts/suggest
 *
 * Dado o album Loranne + faixa, carrega letras do repo `loranne-lyrics/`,
 * extrai as frases mais fortes como candidatas a overlay, e gera legendas
 * para TikTok/YouTube (sem auto-promo).
 *
 * Body (preferido): {
 *   albumSlug: string,       // ex "eter-raiz-vermelha"
 *   trackNumber?: number,    // ex 8
 *   trackName?: string,      // alternativa — ex "faixa-08.mp3"
 *   theme?: string,
 * }
 * Fallback legacy: {
 *   lyrics: string, theme?: string, trackLabel?: string
 * }
 *
 * Returns: {
 *   verses: [string, string],       // 2 frases por defeito (as 2 mais fortes)
 *   candidates: string[],           // ate 6 frases candidatas (incluindo as 2)
 *   albumTitle, trackTitle, trackNumber,
 *   tiktokCaption, youtubeTitle, youtubeDescription
 * }
 */

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
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function scoreLine(line: string): number {
  const trimmed = line.trim();
  if (!trimmed) return -999;
  if (/^\[.*\]$/.test(trimmed)) return -999; // [Verse], [Chorus]
  if (/^\(.+\)$/.test(trimmed)) return -500; // (parenthetical)
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

  // De-dup por linha (as letras com refrao repetem)
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

  // Preferir 1 da primeira metade da letra + 1 da segunda
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

// ── CTA + perguntas emocionais ──────────────────────────────────────────────
//
// Decisões Loranne (Abril 2026):
//  - CTA fixo: "Ouve no Apple Music → music.seteveus.space"
//  - Captions trazem 1 pergunta emocional para puxar comentários (97% do
//    tráfego TikTok vem do Para Ti, sem audiência própria → precisamos de
//    interacção)
//  - Hashtags incluem #natureza + #despertar (formato validado: natureza +
//    versos PT)

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
  const tags = [
    "#Loranne",
    theme ? `#${theme.replace(/\s+/g, "").toLowerCase()}` : "",
    "#poesia",
    "#natureza",
    "#despertar",
    "#portugal",
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

function makeYouTubeTitle(trackTitle: string, albumTitle: string, v1: string): string {
  const first = v1.length > 35 ? v1.slice(0, 32) + "..." : v1;
  const base = first ? `${first} · ${trackTitle} (${albumTitle})` : `${trackTitle} · ${albumTitle}`;
  return base.length > 70 ? base.slice(0, 67) + "..." : base;
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
  return [
    verses,
    themeLine,
    question,
    "",
    `🎵 ${APPLE_MUSIC_CTA}`,
    "",
    `Música: Loranne · ${albumTitle} · ${trackTitle}`,
    "",
    buildHashtags(theme),
  ].join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { albumSlug, trackNumber: tn, trackName, theme, lyrics: rawLyrics, trackLabel } = body || {};

    let lyrics = "";
    let trackTitle = "";
    let albumTitle = "";
    let finalTrackNumber = typeof tn === "number" ? tn : null;

    if (albumSlug) {
      const n = finalTrackNumber ?? (trackName ? parseTrackNumber(trackName) : null);
      if (!n) {
        return NextResponse.json(
          { erro: "trackNumber ou trackName valido obrigatorio com albumSlug." },
          { status: 400 },
        );
      }
      const found = getTrackLyrics(albumSlug, n);
      if (!found) {
        return NextResponse.json(
          { erro: `Nao encontrei letra para ${albumSlug}/${n}.` },
          { status: 404 },
        );
      }
      lyrics = found.lyrics;
      trackTitle = found.trackTitle;
      albumTitle = found.albumTitle;
      finalTrackNumber = found.trackNumber;
    } else if (rawLyrics && typeof rawLyrics === "string") {
      // Fallback legacy
      lyrics = rawLyrics;
      trackTitle = trackLabel || "";
      albumTitle = "";
    } else {
      return NextResponse.json(
        { erro: "albumSlug + trackNumber/trackName obrigatorios (ou lyrics legacy)." },
        { status: 400 },
      );
    }

    if (!lyrics.trim()) {
      return NextResponse.json(
        {
          erro: `Faixa "${trackTitle}" nao tem letra em loranne-lyrics/ (possivelmente instrumental).`,
        },
        { status: 404 },
      );
    }

    const allLines = lyrics
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !/^\[.*\]$/.test(l));
    const candidates = pickCandidates(lyrics, 6);
    const [v1, v2] = pickTwoVerses(candidates, allLines);

    const seed = `${albumSlug || ""}/${finalTrackNumber || ""}`;
    return NextResponse.json({
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
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Excepcao: ${msg}` }, { status: 500 });
  }
}
