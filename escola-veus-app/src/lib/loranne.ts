import { COSMIC_LYRICS } from "@loranne/lyrics-cosmic";
import { ESPELHO_LYRICS } from "@loranne/lyrics-espelhos";
import { NO_LYRICS } from "@loranne/lyrics-nos";
import { LIVRO_LYRICS, CURSO_LYRICS } from "@loranne/lyrics-livro-cursos";
import { ESPIRITUAL_LYRICS } from "@loranne/lyrics-espirituais";
import { VIDA_LYRICS } from "@loranne/lyrics-vida";
import { ROMANCE_LYRICS } from "@loranne/lyrics-romance";
import { EXPANSAO_LYRICS } from "@loranne/lyrics-expansao";
import { FASE1_LYRICS } from "@loranne/lyrics-fase1";
import { FASE1B_LYRICS } from "@loranne/lyrics-fase1b";
import { FASE2_LYRICS } from "@loranne/lyrics-fase2";
import { FIBRA_CORRIDA_LYRICS } from "@loranne/lyrics-fibra-corrida";
import { NOVOS_LYRICS } from "@loranne/lyrics-novos";

/**
 * Server-side helper — letras Loranne do repo irmão `loranne-lyrics/`.
 * NUNCA importar num client component (os maps somam varios MB de texto).
 *
 * As letras sao chaveadas por "albumSlug/trackNumber" em cada ficheiro
 * `lyrics-*.ts`. O `albums.ts` do mesmo repo agrega os albuns, mas tem
 * um import quebrado (./ancient-ground-singles ausente), por isso
 * evitamo-lo e usamos so os maps de letras.
 */

const ALL_LYRICS: Record<string, string> = {
  ...COSMIC_LYRICS,
  ...ESPELHO_LYRICS,
  ...NO_LYRICS,
  ...LIVRO_LYRICS,
  ...CURSO_LYRICS,
  ...ESPIRITUAL_LYRICS,
  ...VIDA_LYRICS,
  ...ROMANCE_LYRICS,
  ...EXPANSAO_LYRICS,
  ...FASE1_LYRICS,
  ...FASE1B_LYRICS,
  ...FASE2_LYRICS,
  ...FIBRA_CORRIDA_LYRICS,
  ...NOVOS_LYRICS,
};

const PRODUCT_PREFIXES = ["espelho", "livro", "incenso", "eter", "nua", "sangue", "grao", "ancient"];

function titleCase(s: string): string {
  return s
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function deriveAlbumTitle(slug: string): string {
  const parts = slug.split("-");
  if (parts.length > 1 && PRODUCT_PREFIXES.includes(parts[0])) {
    return titleCase(parts.slice(1).join("-"));
  }
  return titleCase(slug);
}

export type TrackLookup = {
  albumSlug: string;
  albumTitle: string;
  trackNumber: number;
  trackTitle: string;
  lyrics: string;
};

export function getTrackLyrics(
  albumSlug: string,
  trackNumber: number,
): TrackLookup | null {
  const key = `${albumSlug}/${trackNumber}`;
  const lyrics = ALL_LYRICS[key];
  if (!lyrics) return null;
  return {
    albumSlug,
    albumTitle: deriveAlbumTitle(albumSlug),
    trackNumber,
    trackTitle: `Faixa ${trackNumber}`,
    lyrics,
  };
}

/**
 * Extrai o numero da faixa a partir de nomes de ficheiro comuns:
 *  - "faixa-08.mp3" -> 8
 *  - "08-qualquer.mp3" -> 8
 *  - "track-08" -> 8
 */
export function parseTrackNumber(fileName: string): number | null {
  const m = fileName.match(/(?:faixa|track)[-_](\d+)|^(\d+)[-_.]/i);
  if (!m) return null;
  const n = parseInt(m[1] || m[2], 10);
  return Number.isFinite(n) ? n : null;
}
