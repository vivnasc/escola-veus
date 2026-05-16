/**
 * Pairing de motion + audio para "Hoje, em Mim".
 *
 * Resolve duas dores recorrentes:
 *
 *  1) Motions a repetir-se cedo demais dentro do mesmo bulk.
 *     Antes: motionPool[i % length] cicla mecânico. Se o pool tem 5
 *     e o bulk tem 30 dias, vê-se o mesmo motion a cada 5 dias na
 *     mesma ordem. Agora: shuffle determinístico por seed (ano-mes),
 *     consome o pool todo antes de re-embaralhar, e re-embaralha cada
 *     ciclo com seed incrementado para variar a ordem entre passes.
 *
 *  2) Áudio desalinhado do ritual do dia.
 *     Antes: audioPool[i % length] cicla independente do dia. Sexta
 *     podia calhar com som de chuva e quinta com tambor — alheio ao
 *     kicker. Agora: cada weekday tem moods preferidos. Se o pool
 *     tiver áudios com esses moods, pega esses primeiro. Fallback
 *     para o cycle.
 *
 * Os URLs de áudio têm o mood no path
 * (.../hoje-em-mim-audios/<mood>/<file>.mp3), por isso o mood é
 * extraído sem precisar de tabela externa.
 *
 * É usado tanto pelo preview client-side (BulkPreviewTable) como
 * pelo server-side render-submit, para garantir paridade do que se
 * vê com o que se renderiza.
 */

import type { DiaSemana, DiaEspecial } from "./captions";
import type { NightMood } from "./audio";

/** Moods preferidos por weekday, em ordem de prioridade.
 *
 *  mon (olha hoje) → intimo, observação suave
 *  tue (hoje agradeço) → lareira, coro de gratidão
 *  wed (solto hoje) → chuva e maré, fluir e deixar ir
 *  thu (hoje aprendi) → tigela tibetana, ressonância de sabedoria
 *  fri (celebro hoje) → tambor lento, lareira morna
 *  sat (no corpo) → coruja, brisa-bambu, presença no espaço
 *  sun (amanhã escolho) → lua sobre água, sussurro, intenção etérea
 */
export const MOOD_POR_DIA: Record<DiaSemana, NightMood[]> = {
  mon: ["grilos-tropicais", "brisa-bambu", "lareira-respira"],
  tue: ["lareira-respira", "sussurro-coro-feminino", "grilos-tropicais"],
  wed: ["chuva-fina-no-telhado", "mare-noturna", "brisa-bambu"],
  thu: ["tigela-grave", "sussurro-coro-feminino", "coruja-distante"],
  fri: ["tambor-lento-distante", "lareira-respira", "grilos-tropicais"],
  sat: ["coruja-distante", "brisa-bambu", "tigela-grave"],
  sun: ["lua-sobre-agua", "sussurro-coro-feminino", "mare-noturna"],
};

/** Dias especiais ganham moods solenes. */
export const MOOD_ESPECIAL: Record<DiaEspecial, NightMood[]> = {
  fim_mes: ["tigela-grave", "sussurro-coro-feminino", "mare-noturna"],
  inicio_mes: ["lua-sobre-agua", "brisa-bambu", "sussurro-coro-feminino"],
  fim_ano: ["tigela-grave", "sussurro-coro-feminino", "tambor-lento-distante"],
  inicio_ano: ["sussurro-coro-feminino", "lua-sobre-agua", "tambor-lento-distante"],
};

/** Extrai o mood do URL público do áudio.
 *  Convenção: .../hoje-em-mim-audios/<mood>/<filename>.mp3 */
export function moodFromAudioUrl(url: string): NightMood | null {
  const m = url.match(/hoje-em-mim-audios\/([^/]+)\//);
  if (!m) return null;
  return m[1] as NightMood;
}

/** Mulberry32 — PRNG determinístico, leve e estável. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  const rng = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Extrai a "família" do URL/nome do motion para evitar agrupar
 *  variações geradas a partir da mesma imagem MJ. Ex:
 *    lua-piscina-01.mp4 → "lua-piscina"
 *    lua-piscina-02.mp4 → "lua-piscina"
 *    velas-mesa-v3.mp4  → "velas-mesa"
 *  Heurística: tira a extensão e remove sufixos numéricos/v\d+ no fim. */
export function motionFamilyKey(url: string): string {
  const name = (url.split("/").pop() ?? url).replace(/\.[a-z0-9]+$/i, "");
  // Remove sufixos comuns: -01, -v3, _final, _2x, etc.
  return name
    .replace(/[-_](v\d+|\d{1,3}|final|loop|alt|rev|copy)$/i, "")
    .replace(/[-_](v\d+|\d{1,3})$/i, "")
    .toLowerCase();
}

/** Reordena uma lista de motions garantindo que motions da mesma
 *  família ficam separados por pelo menos `minGap` posições, sempre
 *  que o pool tiver famílias suficientes. Faz best-effort: se só há
 *  uma família, devolve a ordem inalterada. */
function spaceByFamily(urls: string[], minGap: number): string[] {
  if (urls.length <= 1) return urls;
  const out: string[] = [];
  const remaining = urls.slice();
  while (remaining.length > 0) {
    let pickIdx = -1;
    for (let i = 0; i < remaining.length; i++) {
      const fam = motionFamilyKey(remaining[i]);
      // Verifica se alguma das últimas minGap posições é da mesma família
      let conflict = false;
      for (let k = 1; k <= minGap && out.length - k >= 0; k++) {
        if (motionFamilyKey(out[out.length - k]) === fam) {
          conflict = true;
          break;
        }
      }
      if (!conflict) {
        pickIdx = i;
        break;
      }
    }
    // Se nada serve (todos conflitam), pega o primeiro mesmo assim
    if (pickIdx === -1) pickIdx = 0;
    out.push(remaining[pickIdx]);
    remaining.splice(pickIdx, 1);
  }
  return out;
}

/** Pré-calcula a sequência de motions sem repetição consecutiva.
 *  Consome o pool inteiro em ordem embaralhada antes de repetir.
 *
 *  Quando `moodByMotion` está presente, parea cada dia ao motion
 *  cujo mood está na lista de preferência do weekday. Motions sem
 *  match (ou dias sem motion taggeado disponível) caem no pool de
 *  fallback embaralhado. Isto garante que sexta (celebrar) calha
 *  com tambor/lareira em vez de chuva fina.
 */
export function planMotionSequence(
  motionPool: string[],
  numDays: number,
  seed: number,
  opts?: {
    moodByMotion?: Record<string, string>;
    dias?: Array<{ dia: DiaSemana; especial: DiaEspecial | null }>;
  }
): string[] {
  if (motionPool.length === 0) return [];
  if (motionPool.length === 1) return Array(numDays).fill(motionPool[0]);

  // Modo simples (sem tags): shuffle + cycle sem repetição imediata
  const moodByMotion = opts?.moodByMotion ?? {};
  const dias = opts?.dias ?? [];
  const taggedCount = Object.keys(moodByMotion).filter((u) =>
    motionPool.includes(u)
  ).length;

  if (taggedCount === 0 || dias.length !== numDays) {
    const out: string[] = [];
    let pass = 0;
    while (out.length < numDays) {
      // Shuffle base + reordena para separar famílias (lua-piscina-01,
      // lua-piscina-02 não ficam consecutivos)
      let shuffled = spaceByFamily(
        shuffleSeeded(motionPool, seed + pass),
        2
      );
      if (out.length > 0 && shuffled[0] === out[out.length - 1]) {
        shuffled = shuffled.slice(1).concat(shuffled[0]);
      }
      // Se o último de `out` e o primeiro de `shuffled` partilham
      // família, troca o primeiro com algum que não conflite
      if (out.length > 0) {
        const lastFam = motionFamilyKey(out[out.length - 1]);
        if (motionFamilyKey(shuffled[0]) === lastFam) {
          const swapIdx = shuffled.findIndex(
            (u) => motionFamilyKey(u) !== lastFam
          );
          if (swapIdx > 0) {
            [shuffled[0], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[0]];
          }
        }
      }
      for (const url of shuffled) {
        if (out.length >= numDays) break;
        out.push(url);
      }
      pass++;
    }
    return out;
  }

  // Modo mood-aware: agrupa motions por mood, distribui por dia
  // preferindo motions cujo mood esteja na lista do weekday.
  const byMood = new Map<NightMood, string[]>();
  const shuffledPool = shuffleSeeded(motionPool, seed);
  for (const url of shuffledPool) {
    const m = moodByMotion[url] as NightMood | undefined;
    if (m) {
      if (!byMood.has(m)) byMood.set(m, []);
      byMood.get(m)!.push(url);
    }
  }

  const usageCount = new Map<string, number>();
  const incUse = (u: string) => usageCount.set(u, (usageCount.get(u) ?? 0) + 1);

  const pickByMood = (moods: NightMood[]): string | null => {
    // Procura o motion menos usado dentro dos moods preferidos
    let best: string | null = null;
    let bestUses = Infinity;
    for (const m of moods) {
      const list = byMood.get(m);
      if (!list) continue;
      for (const u of list) {
        const uses = usageCount.get(u) ?? 0;
        if (uses < bestUses) {
          best = u;
          bestUses = uses;
        }
      }
    }
    return best;
  };

  const fallbackOrder = shuffledPool;
  let fallbackCursor = 0;
  const pickFallback = (): string => {
    // Pega o menos usado, evitando consecutivo igual
    let best = fallbackOrder[fallbackCursor % fallbackOrder.length];
    let bestUses = usageCount.get(best) ?? 0;
    for (let k = 1; k < fallbackOrder.length; k++) {
      const cand = fallbackOrder[(fallbackCursor + k) % fallbackOrder.length];
      const uses = usageCount.get(cand) ?? 0;
      if (uses < bestUses) {
        best = cand;
        bestUses = uses;
      }
    }
    fallbackCursor++;
    return best;
  };

  const out: string[] = [];
  for (let i = 0; i < numDays; i++) {
    const { dia, especial } = dias[i];
    const moodPref = especial ? MOOD_ESPECIAL[especial] : MOOD_POR_DIA[dia];
    let url = pickByMood(moodPref);
    if (!url) url = pickFallback();
    // Evita consecutivo igual ou da mesma família (lua-piscina-01 →
    // lua-piscina-02). Tenta um fallback diferente até 5x.
    const lastFam =
      out.length > 0 ? motionFamilyKey(out[out.length - 1]) : null;
    if (
      lastFam &&
      motionPool.length > 1 &&
      (url === out[out.length - 1] || motionFamilyKey(url) === lastFam)
    ) {
      for (let k = 0; k < 5; k++) {
        const alt = pickFallback();
        if (alt !== url && motionFamilyKey(alt) !== lastFam) {
          url = alt;
          break;
        }
      }
    }
    incUse(url);
    out.push(url);
  }
  return out;
}

/** Pré-calcula a sequência de áudios.
 *  Para cada dia, tenta encontrar um áudio cujo mood esteja na
 *  lista de preferência do weekday/especial e que ainda não tenha
 *  sido usado. Se nenhum match disponível, cai para round-robin
 *  no pool restante. */
export function planAudioSequence(
  audioPool: string[],
  dias: Array<{ dia: DiaSemana; especial: DiaEspecial | null }>,
  seed: number
): Array<string | null> {
  if (audioPool.length === 0) return dias.map(() => null);

  // Agrupa pool por mood, em ordem shuffled (para variar entre bulks)
  const shuffledPool = shuffleSeeded(audioPool, seed);
  const byMood = new Map<NightMood, string[]>();
  const noMood: string[] = [];
  for (const url of shuffledPool) {
    const m = moodFromAudioUrl(url);
    if (m) {
      if (!byMood.has(m)) byMood.set(m, []);
      byMood.get(m)!.push(url);
    } else {
      noMood.push(url);
    }
  }

  // Cursor por mood para round-robin dentro do mesmo mood
  const moodCursor = new Map<NightMood, number>();
  let fallbackCursor = 0;

  const pickByMood = (moods: NightMood[]): string | null => {
    for (const m of moods) {
      const list = byMood.get(m);
      if (list && list.length > 0) {
        const idx = moodCursor.get(m) ?? 0;
        const url = list[idx % list.length];
        moodCursor.set(m, idx + 1);
        return url;
      }
    }
    return null;
  };

  const out: Array<string | null> = [];
  for (const { dia, especial } of dias) {
    const moods = especial ? MOOD_ESPECIAL[especial] : MOOD_POR_DIA[dia];
    let url = pickByMood(moods);
    if (!url) {
      // Fallback: round-robin no pool inteiro
      url = shuffledPool[fallbackCursor % shuffledPool.length];
      fallbackCursor++;
    }
    out.push(url);
  }
  return out;
}

/** Seed estável a partir de ano + mês + diaInicio.
 *  Mesmo input = mesmo seed = preview bate com render. */
export function seedFromRange(ano: number, mes: number, diaInicio: number): number {
  return ano * 10000 + mes * 100 + diaInicio;
}
