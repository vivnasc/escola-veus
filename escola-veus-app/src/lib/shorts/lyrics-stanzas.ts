/**
 * Helpers para extrair stanzas de letras Loranne para o modo lyric video sync.
 *
 * Estratégia: divide pela secção [Verse]/[Chorus]/[Bridge] etc, ou por linhas
 * em branco se não houver tags. Cada stanza fica com 2-4 linhas no ecrã.
 */

import { ALL_LYRICS } from "@/lib/loranne";

/** Divide letras inteiras numa lista de stanzas (cada uma 2-4 linhas). */
export function lyricsToStanzas(lyrics: string): string[] {
  if (!lyrics || !lyrics.trim()) return [];

  // Limpa headers de vocal/persona/CRITICAL/Intro etc — não são letra cantada.
  const cleaned = lyrics
    .split(/\r?\n/)
    .filter((l) => {
      const t = l.trim();
      if (!t) return false;
      // Linhas só de tags (vocal config, intros instrumentais)
      if (/^\[(Vocal|CRITICAL|Persona|Intro|Outro|Bridge|Chorus|Verse|Pre-Chorus|Post-Chorus)/i.test(t)) return false;
      if (/^\[/.test(t) && /\]$/.test(t)) return false;
      // Linhas de comentário entre parênteses
      if (/^\(.+\)$/.test(t)) return false;
      return true;
    })
    .join("\n");

  // Divide por blocos de 2-4 linhas. Toma blocos separados por uma única
  // linha em branco no original; senão, agrupa cada 3 linhas.
  const blocks = cleaned
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  if (blocks.length >= 4) {
    // Cada bloco do output original já é uma stanza. Se algum tiver >5 linhas,
    // parte ao meio.
    const out: string[] = [];
    for (const b of blocks) {
      const lines = b.split("\n");
      if (lines.length <= 5) {
        out.push(b);
      } else {
        const half = Math.ceil(lines.length / 2);
        out.push(lines.slice(0, half).join("\n"));
        out.push(lines.slice(half).join("\n"));
      }
    }
    return out;
  }

  // Fallback: agrupa cada 3 linhas como uma stanza.
  const lines = cleaned.split("\n").map((l) => l.trim()).filter(Boolean);
  const stanzas: string[] = [];
  for (let i = 0; i < lines.length; i += 3) {
    stanzas.push(lines.slice(i, i + 3).join("\n"));
  }
  return stanzas;
}

/** Devolve as stanzas para um track Loranne. Vazio se não tiver letra. */
export function getLoranneStanzas(albumSlug: string, trackNumber: number): string[] {
  const lyrics = ALL_LYRICS[`${albumSlug}/${trackNumber}`];
  if (!lyrics) return [];
  return lyricsToStanzas(lyrics);
}
