/**
 * Rotação semanal determinística para Loranne + Ancient Ground.
 *
 * - **Loranne**: derivada de `ALL_LYRICS` (loranne.ts). Filtra curso-/livro-,
 *   pontua cada faixa com o `scoreLine` do `suggest/route.ts` (top-3 lines),
 *   limita 3 faixas por álbum (diversidade), e ordena por score. Resultado:
 *   pool ≥50 entries (album, trackNumber).
 *
 * - **Ancient Ground**: lista hardcoded de tripletes de temas raízes
 *   (combinações cinematicamente coesas) + sugestão de track AG.
 *
 * Selecção semanal: `pickWeeklyLoranne(weekNumber, dayIndex)` e
 * `pickWeeklyAG(weekNumber, slotIndex)` — determinístico, varia por semana.
 *
 * Server-only: importa `loranne.ts` que carrega ~MB de letras.
 */

import { ALL_LYRICS } from "@/lib/loranne";
import type { RaizTema } from "@/lib/ag-raizes-temas";
import trackTitlesJson from "./loranne-track-titles.json";
import trackMetaJson from "./loranne-track-meta.json";
import moodTagsJson from "./loranne-mood-tags.json";
import { LORANNE_MOODS, type LoranneMood } from "./loranne-moods";

type MoodTagEntry = { mood: LoranneMood[] };
const LORANNE_MOOD_TAGS: Record<string, Record<string, MoodTagEntry>> =
  moodTagsJson as Record<string, Record<string, MoodTagEntry>>;

/** Mood atribuído a cada dia da semana (consistência marketing — Mon sempre
 *  Elevar, Sun sempre Atravessar). 7 dias × 7 moods = cobertura completa. */
const DAY_MOOD_ORDER: readonly LoranneMood[] = Object.freeze([
  "elevar",    // mon
  "aterrar",   // tue
  "acordar",   // wed
  "lembrar",   // thu
  "reunir-se", // fri
  "respirar",  // sat
  "atravessar",// sun
]);

/** Mood que uma faixa Loranne carrega (vindo de loranne-mood-tags.json).
 *  Vazio se ainda não foi taggeada. */
export function getTrackMoods(albumSlug: string, trackNumber: number): LoranneMood[] {
  return LORANNE_MOOD_TAGS[albumSlug]?.[String(trackNumber)]?.mood || [];
}

/**
 * Mapa albumSlug → trackNumber (string) → título da faixa, extraído de
 * loranne-lyrics/albums.ts via scripts/weekly/extract-titles. Útil para
 * legendas dos posts ("Faixa X · Álbum Y").
 */
export const LORANNE_TRACK_TITLES: Record<string, Record<string, string>> =
  trackTitlesJson as Record<string, Record<string, string>>;

/**
 * Título legível do álbum (slug → "Título"). Para legendas / metadata.
 * Subset hand-curado dos 13 álbuns produzidos. Atualiza quando adicionas
 * álbuns ao allowlist.
 */
export const LORANNE_ALBUM_TITLES: Record<string, string> = {
  "incenso-frequencia": "Frequência",
  "incenso-salto-bonito": "Salto Bonito",
  "livro-filosofico": "Filosófico",
  "espelho-ilusao": "Ilusão",
  "fibra-sangue-aceso": "Sangue Aceso",
  "eter-raiz-vermelha": "Raiz Vermelha",
  "sangue-raiz": "Heritage",
  "sangue-mae": "Mãe",
  "nua-inteira": "Inteira",
  "nua-por-dentro": "Por Dentro",
  "nua-boa": "Boa",
  "nua-duas-vozes": "Duas Vozes",
  "grao-o-tear": "O Tear",
};

export function getTrackTitle(albumSlug: string, trackNumber: number): string {
  return (
    LORANNE_TRACK_TITLES[albumSlug]?.[String(trackNumber)] ||
    `Faixa ${trackNumber}`
  );
}

type TrackMeta = { title?: string; energy?: string; lang?: "PT" | "EN" };
const LORANNE_TRACK_META: Record<string, Record<string, TrackMeta>> =
  trackMetaJson as Record<string, Record<string, TrackMeta>>;

/** Idioma da letra de uma faixa Loranne (default PT). Usado para o Scribe
 *  (language_code) e selecção de hashtags. */
export function getTrackLang(albumSlug: string, trackNumber: number): "PT" | "EN" {
  return LORANNE_TRACK_META[albumSlug]?.[String(trackNumber)]?.lang || "PT";
}

export function getAlbumTitle(albumSlug: string): string {
  return (
    LORANNE_ALBUM_TITLES[albumSlug] ||
    albumSlug
      .split("-")
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

// ─── Loranne — score & filter ──────────────────────────────────────────────

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

function scoreTrack(lyrics: string): number {
  const lines = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\[.*\]$/.test(l));
  if (lines.length < 4) return -1000; // letras curtas demais
  const scored = lines.map(scoreLine).sort((a, b) => b - a);
  const top3 = scored.slice(0, 3);
  return top3.reduce((s, n) => s + n, 0);
}

// Allowlist Loranne — apenas álbuns com MP3 produzido em Supabase. Confirmar
// com Vivianne antes de adicionar. Quando um álbum novo é gravado, juntar
// aqui o slug — o pool resolve-se em module-load e a rotação alarga sem
// mais nada.
export const LORANNE_AVAILABLE_ALBUMS: readonly string[] = Object.freeze([
  // Catálogo inicial (com MP3 confirmado)
  "incenso-frequencia",
  "livro-filosofico",
  "espelho-ilusao",
  "fibra-sangue-aceso",
  "eter-raiz-vermelha",
  "sangue-raiz",
  "sangue-mae",
  "nua-inteira",
  "nua-por-dentro",
  "nua-boa",
  "nua-duas-vozes",
  // Adicionados Maio 2026 (registo elevadora — produzidos pela Vivianne)
  "incenso-maos-juntas",
  "incenso-oferenda",
  "incenso-folego",
  "fibra-corpo-aberto",
  "eter-viagem",
  // Os 5 do Novos8may produzidos no Suno + uploaded
  "incenso-acende",
  "incenso-coro",
  "incenso-milagre",
  "incenso-amen",
  "incenso-aleluia",
  // +5 elevadora (segunda leva Novos8may, 9 Mai 2026)
  "incenso-de-pe",
  "incenso-hoje-nao",
  "incenso-ar",
  "incenso-mexe",
  "incenso-volta-a-mim",
  // REMOVIDOS por não terem MP3 em audios/albums/<slug>/ no Supabase:
  //   incenso-salto-bonito
  //   incenso-maos-abertas
  //   grao-o-tear
  // Re-adicionar quando os MP3s estiverem no path esperado.
]);

export type LoranneRotationEntry = {
  albumSlug: string;
  trackNumber: number;
  /** Score acumulado (top-3 line scores) — útil para inspecção. */
  score: number;
};

function buildLoranneRotation(): LoranneRotationEntry[] {
  type Scored = { albumSlug: string; trackNumber: number; score: number };
  const all: Scored[] = [];
  const allowed = new Set(LORANNE_AVAILABLE_ALBUMS);

  for (const [key, lyrics] of Object.entries(ALL_LYRICS)) {
    const [albumSlug, trackStr] = key.split("/");
    if (!albumSlug || !trackStr) continue;
    if (!allowed.has(albumSlug)) continue;
    const trackNumber = parseInt(trackStr, 10);
    if (!Number.isFinite(trackNumber)) continue;
    const score = scoreTrack(lyrics);
    if (score < 6) continue; // limiar mais relaxado, pool é constrained
    all.push({ albumSlug, trackNumber, score });
  }

  // Ordena por score desc. Sem cap por álbum (pool já é pequeno).
  all.sort((a, b) => b.score - a.score);
  return all;
}

/**
 * Sugestões de álbuns que valeria produzir a seguir — top scores fora do
 * allowlist. Não usado no runtime; útil só para o `print-rotation` reportar.
 */
export type ProductionSuggestion = {
  albumSlug: string;
  topTrackScore: number;
  trackCount: number;
};

export function findProductionSuggestions(): ProductionSuggestion[] {
  const allowed = new Set(LORANNE_AVAILABLE_ALBUMS);
  const byAlbum = new Map<string, { topScore: number; count: number }>();

  for (const [key, lyrics] of Object.entries(ALL_LYRICS)) {
    const [albumSlug] = key.split("/");
    if (!albumSlug) continue;
    if (allowed.has(albumSlug)) continue;
    if (albumSlug.startsWith("curso-") || albumSlug.startsWith("livro-")) continue;
    const score = scoreTrack(lyrics);
    if (score < 8) continue;
    const cur = byAlbum.get(albumSlug) ?? { topScore: 0, count: 0 };
    if (score > cur.topScore) cur.topScore = score;
    cur.count += 1;
    byAlbum.set(albumSlug, cur);
  }

  return [...byAlbum.entries()]
    .map(([slug, v]) => ({
      albumSlug: slug,
      topTrackScore: v.topScore,
      trackCount: v.count,
    }))
    .sort((a, b) => b.topTrackScore - a.topTrackScore)
    .slice(0, 12);
}

/** Pool Loranne resolvido em module-load. Ordenado por score desc. */
export const LORANNE_ROTATION: readonly LoranneRotationEntry[] = Object.freeze(
  buildLoranneRotation(),
);

// ─── Ancient Ground — tripletes de temas raízes ────────────────────────────

export type AGRotationEntry = {
  /** 3 temas para os 3 clips do short (variedade visual em 30s). */
  temas: [RaizTema, RaizTema, RaizTema];
  /** Faixa AG sugerida (1-100). Configurável. */
  trackNumber: number;
  /** Etiqueta humana — mood/foco do triplete. */
  label: string;
};

/**
 * 40 tripletes — combinações cinematicamente coesas.
 * Padrões usados:
 *  - Energia comunitária: batuque + danca + crianca
 *  - Sabedoria/transmissão: anciao + transmissao + machamba
 *  - Trabalho da terra: machamba + trabalho-coletivo + casa
 *  - Sagrado/rito: rito + anciao + casa
 *  - Mar/pesca: pesca + gente-paisagem + aldeia
 *  - Mercado/cor: mercado + danca + crianca
 *  - Retrato/intimidade: retrato + casa + transmissao
 *  - Aldeia/wide: aldeia + gente-paisagem + retrato
 */
export const AG_ROTATION: readonly AGRotationEntry[] = Object.freeze([
  { temas: ["batuque", "danca", "crianca"],                  trackNumber: 12, label: "Energia comunitária" },
  { temas: ["anciao", "transmissao", "machamba"],            trackNumber: 5,  label: "Sabedoria que passa" },
  { temas: ["machamba", "trabalho-coletivo", "casa"],        trackNumber: 8,  label: "Terra e lar" },
  { temas: ["rito", "anciao", "casa"],                       trackNumber: 22, label: "Sagrado quotidiano" },
  { temas: ["pesca", "gente-paisagem", "aldeia"],            trackNumber: 14, label: "Costa e vida" },
  { temas: ["mercado", "danca", "crianca"],                  trackNumber: 31, label: "Mercado e cor" },
  { temas: ["retrato", "casa", "transmissao"],               trackNumber: 7,  label: "Intimidade e herança" },
  { temas: ["aldeia", "gente-paisagem", "retrato"],          trackNumber: 19, label: "Aldeia e rosto" },
  { temas: ["artesanato", "transmissao", "anciao"],          trackNumber: 11, label: "Mãos que ensinam" },
  { temas: ["batuque", "rito", "anciao"],                    trackNumber: 28, label: "Tambor e ancestralidade" },

  { temas: ["danca", "gente-paisagem", "aldeia"],            trackNumber: 4,  label: "Movimento" },
  { temas: ["crianca", "aldeia", "gente-paisagem"],          trackNumber: 17, label: "Futuro no presente" },
  { temas: ["machamba", "anciao", "rito"],                   trackNumber: 23, label: "Terra como altar" },
  { temas: ["pesca", "trabalho-coletivo", "anciao"],         trackNumber: 9,  label: "Mar comum" },
  { temas: ["casa", "retrato", "anciao"],                    trackNumber: 33, label: "Lar interior" },
  { temas: ["danca", "batuque", "rito"],                     trackNumber: 41, label: "Cerimónia" },
  { temas: ["mercado", "artesanato", "transmissao"],         trackNumber: 6,  label: "Ofício e troca" },
  { temas: ["gente-paisagem", "pesca", "retrato"],           trackNumber: 25, label: "Silhueta na água" },
  { temas: ["aldeia", "casa", "rito"],                       trackNumber: 38, label: "Comunidade ao entardecer" },
  { temas: ["crianca", "transmissao", "machamba"],           trackNumber: 13, label: "Aprender com a terra" },

  { temas: ["anciao", "retrato", "casa"],                    trackNumber: 44, label: "Olhar antigo" },
  { temas: ["batuque", "danca", "aldeia"],                   trackNumber: 16, label: "Praça em festa" },
  { temas: ["transmissao", "artesanato", "crianca"],         trackNumber: 27, label: "Mãos pequenas" },
  { temas: ["pesca", "aldeia", "casa"],                      trackNumber: 35, label: "Regresso da praia" },
  { temas: ["machamba", "gente-paisagem", "casa"],           trackNumber: 2,  label: "Caminho de volta" },
  { temas: ["rito", "casa", "retrato"],                      trackNumber: 49, label: "Lume interior" },
  { temas: ["danca", "crianca", "aldeia"],                   trackNumber: 21, label: "Roda livre" },
  { temas: ["trabalho-coletivo", "machamba", "anciao"],      trackNumber: 3,  label: "Comunhão na lavoura" },
  { temas: ["artesanato", "casa", "retrato"],                trackNumber: 36, label: "Ofício silencioso" },
  { temas: ["pesca", "anciao", "rito"],                      trackNumber: 47, label: "Velho do mar" },

  { temas: ["mercado", "gente-paisagem", "aldeia"],          trackNumber: 10, label: "Vida em fluxo" },
  { temas: ["batuque", "anciao", "transmissao"],             trackNumber: 29, label: "Ritmo herdado" },
  { temas: ["casa", "crianca", "rito"],                      trackNumber: 18, label: "Lar sagrado" },
  { temas: ["transmissao", "pesca", "gente-paisagem"],       trackNumber: 42, label: "Aprender o mar" },
  { temas: ["aldeia", "rito", "anciao"],                     trackNumber: 1,  label: "Memória da praça" },
  { temas: ["danca", "retrato", "mercado"],                  trackNumber: 26, label: "Dança e rosto" },
  { temas: ["machamba", "transmissao", "crianca"],           trackNumber: 39, label: "Semente em mãos novas" },
  { temas: ["trabalho-coletivo", "pesca", "aldeia"],         trackNumber: 15, label: "Rede que une" },
  { temas: ["rito", "transmissao", "anciao"],                trackNumber: 32, label: "Passagem" },
  { temas: ["retrato", "anciao", "rito"],                    trackNumber: 50, label: "Face do tempo" },
]);

// ─── Selecção determinística por semana ────────────────────────────────────

/**
 * Pseudo-random determinístico baseado em weekNumber + slotIndex.
 * Varia por semana, sem depender de Math.random.
 */
function deterministicIndex(weekNumber: number, slotIndex: number, mod: number): number {
  // Mistura simples — primes para evitar colisões em padrões curtos.
  const h = (weekNumber * 31 + slotIndex * 17 + 7) | 0;
  return Math.abs(h) % mod;
}

/**
 * Shuffle determinístico de um array dado uma seed.
 * Fisher-Yates com PRNG mulberry32 alimentado por seed.
 */
function deterministicShuffle<T>(arr: readonly T[], seed: number): T[] {
  const a = [...arr];
  let state = (seed * 2654435761) >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Estratégia: cada dia da semana tem mood fixo (DAY_MOOD_ORDER).
 * Para cada dia, escolhe faixa Loranne (i) com esse mood no
 * loranne-mood-tags.json e (ii) de álbum ainda não usado nesta semana.
 * Fallback se mood esgota álbuns: ignora exclusão de álbum. Fallback se
 * mood não tem faixas elegíveis: ignora mood.
 *
 * Garantia: 7 dias = 7 moods distintos por semana; tipicamente 7 álbuns
 * distintos (vai a 5-6 em semanas em que algum mood é pequeno).
 */
function buildWeekPicks(weekNumber: number): LoranneRotationEntry[] {
  if (LORANNE_ROTATION.length === 0) {
    throw new Error(
      "LORANNE_ROTATION está vazia — verifica filtros em weekly-rotation.ts.",
    );
  }
  const used = new Set<string>();
  const picks: LoranneRotationEntry[] = [];
  for (let d = 0; d < 7; d++) {
    const targetMood = DAY_MOOD_ORDER[d];
    // 1ª prioridade: mood match + álbum não usado.
    let candidates = LORANNE_ROTATION.filter((e) => {
      if (used.has(e.albumSlug)) return false;
      return getTrackMoods(e.albumSlug, e.trackNumber).includes(targetMood);
    });
    // 2ª prioridade: mood match (álbum repetido).
    if (candidates.length === 0) {
      candidates = LORANNE_ROTATION.filter((e) =>
        getTrackMoods(e.albumSlug, e.trackNumber).includes(targetMood),
      );
    }
    // 3ª prioridade: qualquer faixa não usada (mood ignorado).
    if (candidates.length === 0) {
      candidates = LORANNE_ROTATION.filter((e) => !used.has(e.albumSlug));
    }
    // Último recurso: pool completo.
    if (candidates.length === 0) candidates = [...LORANNE_ROTATION];

    const shuffled = deterministicShuffle(candidates, weekNumber * 7 + d);
    const pick = shuffled[0];
    picks.push(pick);
    used.add(pick.albumSlug);
  }
  return picks;
}

export function pickWeeklyLoranne(
  weekNumber: number,
  dayIndex: number,
): LoranneRotationEntry {
  const picks = buildWeekPicks(weekNumber);
  return picks[dayIndex % picks.length];
}

/** Mood atribuído ao dayIndex (mon=0..sun=6). Usado em captions/UI. */
export function getDayMood(dayIndex: number): LoranneMood {
  return DAY_MOOD_ORDER[dayIndex % DAY_MOOD_ORDER.length];
}

// Suppress unused warning — LORANNE_MOODS reservado para validação futura.
void LORANNE_MOODS;

/**
 * AG: 3 slots/semana. Garante 3 labels distintos baralhando o pool por semana.
 */
export function pickWeeklyAG(
  weekNumber: number,
  slotIndex: number,
): AGRotationEntry {
  if (AG_ROTATION.length === 0) {
    throw new Error("AG_ROTATION está vazia.");
  }
  const shuffled = deterministicShuffle(AG_ROTATION, weekNumber + 100); // offset para descorrelacionar de Loranne
  return shuffled[slotIndex % shuffled.length];
}
