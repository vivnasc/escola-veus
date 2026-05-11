/**
 * Helpers para extrair stanzas de letras Loranne para o modo lyric video sync.
 *
 * Estratégia: divide pela secção [Verse]/[Chorus]/[Bridge] etc, ou por linhas
 * em branco se não houver tags. Cada stanza fica com 2-4 linhas no ecrã.
 *
 * Variante `WithKind` retém o tipo da secção (chorus/verse/bridge) — usado
 * para começar o clip 30s no primeiro chorus em vez do início da faixa.
 */

import { ALL_LYRICS } from "@/lib/loranne";

export type StanzaKind = "verse" | "chorus" | "bridge" | "pre-chorus" | "post-chorus" | "other";

export type StanzaWithKind = { text: string; kind: StanzaKind };

function classifyTag(tagInner: string): StanzaKind {
  const t = tagInner.toLowerCase().trim();
  if (/^pre[\s-]?chorus/.test(t)) return "pre-chorus";
  if (/^post[\s-]?chorus/.test(t)) return "post-chorus";
  if (/^chorus/.test(t)) return "chorus";
  if (/^bridge/.test(t)) return "bridge";
  if (/^verse/.test(t)) return "verse";
  // intro/outro/vocal/critical/persona/instrumental → "other" (não usar)
  return "other";
}

/** Remove instruções/tags do Suno e travessões mid-AI de uma linha cantada.
 *  Suno mete [Vocal: x], (oh oh), etc. inline ou em linhas próprias. Tudo
 *  isso é metadata de produção, NÃO é letra cantada — não pode aparecer
 *  no ecrã nem nas legendas. Travessões "—" são tique de IA. */
export function sanitizeLyricLine(line: string): string {
  return line
    // [Anything] — tags Suno inline
    .replace(/\[[^\]]*\]/g, "")
    // [Anything sem fechar — tag Suno multi-linha truncada na 1ª linha.
    // Sem este pass, "[Vocal: ONE warm mezzo... sl" passava intacto e
    // aparecia no ecrã + envenenava Scribe align.
    .replace(/\[[^\]]*$/g, "")
    // Anything] sem abrir — continuação de tag multi-linha que fechou.
    .replace(/^[^\[]*\]/g, "")
    // (anything) — comentários/vocalizações Suno inline (oh oh, ah ah, harmonia)
    .replace(/\([^)]*\)/g, "")
    // Travessões longos — tique IA; substitui por vírgula ou nada
    .replace(/\s*—\s*/g, ", ")
    .replace(/\s*–\s*/g, ", ")
    // Limpa whitespace duplicado
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*,\s*/g, ", ")
    .replace(/^[,;:\s]+|[,;:\s]+$/g, "")
    .trim();
}

/** Walk através das letras retendo a secção activa por stanza. */
export function lyricsToStanzasWithKind(lyrics: string): StanzaWithKind[] {
  if (!lyrics || !lyrics.trim()) return [];
  const lines = lyrics.split(/\r?\n/);
  const out: StanzaWithKind[] = [];
  let currentKind: StanzaKind = "verse";
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length === 0) return;
    out.push({ text: buffer.join("\n"), kind: currentKind });
    buffer = [];
  };

  for (const raw of lines) {
    const t = raw.trim();
    if (!t) {
      flush();
      continue;
    }
    // Tags Suno truncadas (multi-linha): começam com [ mas não fecham na
    // mesma linha. Aparecem no início das letras (ex.: [Vocal: ONE warm
    // mezzo-contralto ... sl). Sem fechar, escapavam ao match `^\[...\]$`
    // e entravam como letra cantada → brackets no ecrã + Scribe align
    // falhava (0% match com palavras inventadas). Trata como bloco "other"
    // até nova tag fechada aparecer.
    if (t.startsWith("[") && !t.includes("]")) {
      flush();
      currentKind = "other";
      continue;
    }
    // Linha sem [ inicial mas que TERMINA com ] sem [ — continuação de tag
    // multi-linha aberta atrás. Skip se estamos em "other".
    if (currentKind === "other" && !t.startsWith("[") && t.endsWith("]") && !t.includes("[")) {
      continue;
    }
    const tagMatch = t.match(/^\[([^\]]+)\]$/);
    if (tagMatch) {
      flush();
      currentKind = classifyTag(tagMatch[1]);
      continue;
    }
    // Linha-só de comentário em parênteses (vocalização ou nota Suno)
    if (/^\(.+\)$/.test(t)) continue;
    // Secções "other" não vão para stanzas (intro instrumental, vocal config)
    if (currentKind === "other") continue;
    // Sanitiza inline antes de adicionar — strip [tags], (parens), travessões
    const cleaned = sanitizeLyricLine(t);
    if (!cleaned) continue;
    buffer.push(cleaned);
    if (buffer.length >= 5) flush(); // parte stanzas longas
  }
  flush();
  return out;
}

/** Divide letras inteiras numa lista de stanzas (cada uma 2-4 linhas).
 *  Compatibilidade com chamadores que só querem texto. */
export function lyricsToStanzas(lyrics: string): string[] {
  const tagged = lyricsToStanzasWithKind(lyrics);
  if (tagged.length >= 4) return tagged.map((s) => s.text);
  // Sem tags estruturais (ou poucos blocos) — fallback: 3 linhas por stanza.
  // CRÍTICO: sanitiza CADA linha (não só rejeita linhas inteiras com [/])
  // — inline "[Verse]" ou "(oh oh)" passavam intactos antes deste fix.
  const cleaned = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !/^\[.*\]$/.test(l) && !/^\(.+\)$/.test(l))
    .map(sanitizeLyricLine)
    .filter(Boolean);
  const stanzas: string[] = [];
  for (let i = 0; i < cleaned.length; i += 3) {
    stanzas.push(cleaned.slice(i, i + 3).join("\n"));
  }
  return stanzas;
}

/** Devolve as stanzas para um track Loranne. Vazio se não tiver letra. */
export function getLoranneStanzas(albumSlug: string, trackNumber: number): string[] {
  const lyrics = ALL_LYRICS[`${albumSlug}/${trackNumber}`];
  if (!lyrics) return [];
  return lyricsToStanzas(lyrics);
}

/** Como `getLoranneStanzas` mas retém o tipo de cada stanza (verse/chorus/etc).
 *  Quando difere do array sem-kind (porque o fallback 3-line está activo),
 *  devolve `[]` — caller decide como tratar. */
export function getLoranneStanzasWithKind(albumSlug: string, trackNumber: number): StanzaWithKind[] {
  const lyrics = ALL_LYRICS[`${albumSlug}/${trackNumber}`];
  if (!lyrics) return [];
  const tagged = lyricsToStanzasWithKind(lyrics);
  // Só devolve se for o mesmo conjunto que getLoranneStanzas (ou seja, ≥4 blocos
  // estruturados) — caso contrário kinds não alinham com o fallback 3-line.
  if (tagged.length < 4) return [];
  return tagged;
}

/** Índice da primeira stanza marcada como "chorus" (ou null). */
export function findFirstChorusIdx(stanzas: StanzaWithKind[]): number | null {
  const idx = stanzas.findIndex((s) => s.kind === "chorus");
  return idx >= 0 ? idx : null;
}

/** Procura a "primeira stanza alta" da faixa para arrancar o clip 30s.
 *  Cascata de heurísticas até cair em algo não-zero:
 *    1. Tag explícita [Chorus] (ideal — vindo do Suno).
 *    2. Repetição: primeira stanza cujo texto aparece >=2 vezes.
 *    3. Posição: stanza ~33% do total (passa intro/primeiro verso).
 *  Devolve null só se houver <3 stanzas. */
export function detectClipStartStanzaIdx(stanzas: StanzaWithKind[] | string[]): number | null {
  if (!stanzas || stanzas.length < 3) return null;
  const isWithKind = typeof stanzas[0] === "object";
  const texts: string[] = isWithKind
    ? (stanzas as StanzaWithKind[]).map((s) => s.text)
    : (stanzas as string[]);

  // 1. Tag explícita
  if (isWithKind) {
    const idx = (stanzas as StanzaWithKind[]).findIndex((s) => s.kind === "chorus");
    if (idx >= 0) return idx;
  }

  // 2. Repetição — primeira stanza repetida no array é tipicamente o refrão
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const counts = new Map<string, number>();
  for (const t of texts) counts.set(norm(t), (counts.get(norm(t)) || 0) + 1);
  for (let i = 0; i < texts.length; i++) {
    if ((counts.get(norm(texts[i])) || 0) >= 2) return i;
  }

  // 3. Posição — 33% do total (passa intro+verso 1)
  return Math.floor(texts.length / 3);
}
