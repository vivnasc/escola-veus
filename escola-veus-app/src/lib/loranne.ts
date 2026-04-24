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

function normalize(s: string): string {
  return s.toLowerCase().replace(/[_\s]+/g, "-");
}

/**
 * Tenta resolver um slug Supabase para o slug canonico usado em ALL_LYRICS.
 * Estratégia:
 *  1. match exacto
 *  2. se o slug não começa com prefixo de produto, tenta todos os prefixos
 *  3. sufixo match (key termina com o slug pedido)
 *  4. fuzzy match pelos tokens "-"
 */
function resolveAlbumKey(supabaseSlug: string, trackNumber: number): string | null {
  const slug = normalize(supabaseSlug);
  const exact = `${slug}/${trackNumber}`;
  if (ALL_LYRICS[exact]) return exact;

  // Prefixos de produto
  const hasKnownPrefix = PRODUCT_PREFIXES.some((p) => slug.startsWith(`${p}-`));
  if (!hasKnownPrefix) {
    for (const p of PRODUCT_PREFIXES) {
      const k = `${p}-${slug}/${trackNumber}`;
      if (ALL_LYRICS[k]) return k;
    }
  }

  // Sufixo — qualquer key cujo album termine com o slug pedido
  for (const key of Object.keys(ALL_LYRICS)) {
    const [albumPart, nStr] = key.split("/");
    if (parseInt(nStr, 10) !== trackNumber) continue;
    if (albumPart.endsWith(`-${slug}`) || albumPart === slug) return key;
  }

  // Fuzzy — todas as palavras do slug pedido aparecem no key
  const wanted = slug.split("-").filter((w) => w.length > 2);
  if (wanted.length > 0) {
    for (const key of Object.keys(ALL_LYRICS)) {
      const [albumPart, nStr] = key.split("/");
      if (parseInt(nStr, 10) !== trackNumber) continue;
      const allMatch = wanted.every((w) => albumPart.includes(w));
      if (allMatch) return key;
    }
  }

  return null;
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
  const resolved = resolveAlbumKey(albumSlug, trackNumber);
  if (!resolved) return null;
  const [canonicalSlug] = resolved.split("/");
  return {
    albumSlug: canonicalSlug,
    albumTitle: deriveAlbumTitle(canonicalSlug),
    trackNumber,
    trackTitle: `Faixa ${trackNumber}`,
    lyrics: ALL_LYRICS[resolved],
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
