import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import funilSeed from "@/data/funil-prompts.seed.json";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/funil/pool-match
 *
 * Sugere clips da pool que encaixam num novo slot. Scoring simples:
 *   score = 2 * |moods ∩ slot.moods|
 *         + 1 * (keywords partilhadas no prompt de imagem)
 *         - 0.5 * usageCount (penaliza clips já muito reutilizados)
 *
 * Body:
 * {
 *   slot: { mood?: string[]; keywords?: string[]; prompt?: string },
 *   excludeEpisode?: string,   // não sugerir clips do próprio ep
 *   limit?: number,             // default 5
 * }
 *
 * Retorna { candidates: [{ clipId, clipUrl, score, mood, episode, imagePrompt, usageCount, matchedMood, matchedKeywords }] }
 */

type ImgPrompt = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
};

const SEED_IMAGE_PROMPTS = (funilSeed.prompts as ImgPrompt[]) ?? [];
const REUSE_DIR = "admin/funil-reuses";

// Stopwords PT + EN (os prompts estão em EN, os moods em PT)
const STOP = new Set([
  "the", "a", "an", "and", "or", "of", "in", "on", "at", "to", "for", "with",
  "from", "into", "as", "by", "is", "are", "was", "were", "be", "been", "being",
  "that", "this", "these", "those", "it", "its", "their", "there", "then", "than",
  "but", "not", "no", "so", "just", "up", "down", "out", "over", "under",
  "de", "da", "do", "dos", "das", "e", "o", "a", "os", "as", "um", "uma", "uns",
  "umas", "em", "no", "na", "nos", "nas", "com", "sem", "por", "para", "que",
  "se", "é", "ser", "estar", "foi", "ter",
  "very", "slow", "static", "camera", "soft", "warm", "light", "holds", "steady",
  "gently", "slowly", "continuously", "almost", "imperceptibly", "perfectly",
]);

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP.has(w)),
  );
}

function intersect<T>(a: Set<T> | T[], b: Set<T> | T[]): T[] {
  const A = a instanceof Set ? a : new Set(a);
  const B = b instanceof Set ? [...b] : b;
  return B.filter((x) => A.has(x));
}

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function episodeFromId(id: string): string {
  return id.split("-")[1] ?? "";
}

export async function POST(req: NextRequest) {
  let body: {
    slot?: { mood?: string[]; keywords?: string[]; prompt?: string };
    excludeEpisode?: string;
    limit?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON invalido" }, { status: 400 });
  }

  const slotMood = body.slot?.mood ?? [];
  const slotKeywordsRaw = body.slot?.keywords ?? [];
  const slotPromptText = body.slot?.prompt ?? "";
  const limit = Math.max(1, Math.min(20, body.limit ?? 5));
  const excludeEp = body.excludeEpisode ?? "";

  // Conjunto de tokens do slot (keywords explícitas + palavras do prompt)
  const slotTokens = new Set<string>();
  for (const kw of slotKeywordsRaw) for (const t of tokenize(kw)) slotTokens.add(t);
  for (const t of tokenize(slotPromptText)) slotTokens.add(t);
  const slotMoodSet = new Set(slotMood);

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Listar clips existentes
  const allFiles: { name: string }[] = [];
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .list("youtube/clips", { limit: pageSize, offset });
    if (error || !data || data.length === 0) break;
    allFiles.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  const clipIds = new Set(
    allFiles
      .filter((f) => /\.mp4$/i.test(f.name))
      .map((f) => f.name.replace(/\.mp4$/i, "")),
  );

  // usageCount agregado (de reuses)
  const usageCount: Record<string, number> = {};
  try {
    const { data: reuseFiles } = await supabase.storage
      .from("course-assets")
      .list(REUSE_DIR, { limit: 1000 });
    if (Array.isArray(reuseFiles)) {
      for (const f of reuseFiles) {
        if (!f.name.endsWith(".json")) continue;
        const epKey = f.name.replace(/\.json$/, "");
        const { data: dl } = await supabase.storage
          .from("course-assets")
          .download(`${REUSE_DIR}/${f.name}`);
        if (!dl) continue;
        try {
          const parsed = JSON.parse(await dl.text()) as { clipOrder?: string[] };
          for (const url of parsed.clipOrder ?? []) {
            const m = url.match(/\/youtube\/clips\/([^?/]+)\.mp4/i);
            if (!m) continue;
            const id = m[1];
            if (episodeFromId(id) === epKey) continue;
            usageCount[id] = (usageCount[id] ?? 0) + 1;
          }
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    /* ignore */
  }

  // Scoring: percorre prompts do seed que TÊM clip renderizado
  type Candidate = {
    clipId: string;
    clipUrl: string;
    score: number;
    mood: string[];
    episode: string;
    imagePrompt: string;
    usageCount: number;
    matchedMood: string[];
    matchedKeywords: string[];
  };
  const candidates: Candidate[] = [];

  for (const p of SEED_IMAGE_PROMPTS) {
    if (!clipIds.has(p.id)) continue; // sem clip renderizado → fora
    const ep = episodeFromId(p.id);
    if (excludeEp && ep === excludeEp) continue;

    const moodMatches = intersect(slotMoodSet, p.mood);
    const promptTokens = tokenize(p.prompt);
    const kwMatches = [...slotTokens].filter((t) => promptTokens.has(t));

    const used = usageCount[p.id] ?? 0;
    const score =
      2 * moodMatches.length + 1 * kwMatches.length - 0.5 * Math.max(0, used - 1);

    if (score <= 0) continue; // sem sinal, nem sugerimos

    candidates.push({
      clipId: p.id,
      clipUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/clips/${p.id}.mp4`,
      score: +score.toFixed(2),
      mood: p.mood,
      episode: ep,
      imagePrompt: p.prompt,
      usageCount: used,
      matchedMood: moodMatches,
      matchedKeywords: kwMatches,
    });
  }

  candidates.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    candidates: candidates.slice(0, limit),
    totalScored: candidates.length,
  });
}
