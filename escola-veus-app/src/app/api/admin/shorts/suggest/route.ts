import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/shorts/suggest
 *
 * Heuristic helper for shorts. Given a track name and raw lyrics, returns:
 *  - two strongest verses (for on-screen overlay)
 *  - tiktok caption (<=150 chars, 3–4 hashtags)
 *  - youtube title (<=70 chars)
 *  - youtube description (multi-line, with credits + hashtags)
 *
 * Body: {
 *   trackName: string,   // e.g. "faixa-17.mp3"
 *   trackLabel?: string, // optional nicer label
 *   lyrics: string,      // raw multi-line lyrics pasted by the user
 *   theme?: string,      // optional theme hint ("véus", "coragem", etc.)
 * }
 */

const EMOTION_WORDS = [
  "coracao", "coração", "alma", "amor", "sagrado", "fogo", "luz", "voz",
  "pele", "veu", "véu", "veus", "véus", "nome", "verdade", "liberdade",
  "mae", "mãe", "filha", "saudade", "silencio", "silêncio", "memoria",
  "memória", "raiz", "terra", "chao", "chão", "agua", "água", "corpo",
  "ferida", "cicatriz", "grito", "canto", "respira", "abraco", "abraço",
  "sonho", "perda", "caminho", "porta", "abre", "escuta", "ouve",
];

const PRONOUNS_START = /^(eu |tu |nos |nós |voce |você |ela |ele |vem |sou |es |és |amo |vejo |sinto |ouco |ouço |vou |choro |rio |vivo )/i;

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function scoreLine(line: string): number {
  const trimmed = line.trim();
  if (!trimmed) return -999;
  if (/^\[.*\]$/.test(trimmed)) return -999; // [chorus], [verse]
  if (/^\(.+\)$/.test(trimmed)) return -500; // parenthetical
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
  // penalise lines that are mostly filler
  if (/^(oh+|ah+|ooh+|uuh+|na+)(\s|$)/i.test(trimmed)) score -= 3;

  return score;
}

function pickTwoVerses(lyrics: string): [string, string] {
  const lines = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return ["", ""];
  if (lines.length === 1) return [lines[0], ""];

  const scored = lines.map((line, i) => ({ line, i, score: scoreLine(line) }));
  const sorted = [...scored].sort((a, b) => b.score - a.score);

  const first = sorted[0];
  // prefer a second verse from a different half than the first
  const half = lines.length / 2;
  const firstHalf = first.i < half;
  const alt = sorted.find(
    (s) => s.i !== first.i && (s.i < half) !== firstHalf,
  );
  const second = alt || sorted[1] || { line: "", i: -1 };

  const ordered = first.i <= second.i
    ? [first.line, second.line]
    : [second.line, first.line];

  return [ordered[0], ordered[1]];
}

function slugifyTrackLabel(name: string): string {
  // faixa-17.mp3 -> Faixa 17 ; ancient-ground-03.mp3 -> Ancient Ground 03
  const base = name.replace(/\.(mp3|wav|m4a|flac|ogg)$/i, "");
  return base
    .split(/[-_]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function makeTikTokCaption(v1: string, v2: string, theme?: string): string {
  const verseLine = [v1, v2].filter(Boolean).join(" / ");
  const core = verseLine.length > 90
    ? verseLine.slice(0, 87) + "..."
    : verseLine;
  const hashtags = [
    "#Loranne",
    "#EscoladosVéus",
    theme ? `#${theme.replace(/\s+/g, "")}` : "#AncientGround",
    "#poesia",
    "#portugal",
  ].join(" ");
  const full = `${core}\n\n${hashtags}`;
  return full.length > 150 ? full.slice(0, 147) + "..." : full;
}

function makeYouTubeTitle(trackLabel: string, v1: string): string {
  const first = v1.length > 40 ? v1.slice(0, 37) + "..." : v1;
  const base = first ? `${first} · ${trackLabel} — Loranne` : `${trackLabel} — Loranne · Short`;
  return base.length > 70 ? base.slice(0, 67) + "..." : base;
}

function makeYouTubeDescription(
  trackLabel: string,
  v1: string,
  v2: string,
  theme?: string,
): string {
  const verses = [v1, v2].filter(Boolean).join("\n");
  const themeLine = theme ? `\nTema: ${theme}\n` : "\n";
  return [
    verses,
    themeLine,
    "Música original de Loranne · faixa do álbum Ancient Ground.",
    "Curso Escola dos Véus · escola.seteveus.space",
    "Música · music.seteveus.space",
    "",
    "#Loranne #AncientGround #EscoladosVéus #Shorts #poesia",
  ].join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const { trackName, trackLabel, lyrics, theme } = await req.json();

    if (!lyrics || typeof lyrics !== "string") {
      return NextResponse.json(
        { erro: "lyrics obrigatorio (string)." },
        { status: 400 },
      );
    }

    const label = trackLabel || (trackName ? slugifyTrackLabel(trackName) : "Loranne");
    const [v1, v2] = pickTwoVerses(lyrics);

    const tiktokCaption = makeTikTokCaption(v1, v2, theme);
    const youtubeTitle = makeYouTubeTitle(label, v1);
    const youtubeDescription = makeYouTubeDescription(label, v1, v2, theme);

    return NextResponse.json({
      verses: [v1, v2],
      tiktokCaption,
      youtubeTitle,
      youtubeDescription,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Excepcao: ${msg}` }, { status: 500 });
  }
}
