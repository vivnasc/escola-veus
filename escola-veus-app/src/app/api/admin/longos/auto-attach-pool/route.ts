import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import funilSeed from "@/data/funil-prompts.seed.json";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/longos/auto-attach-pool
 *
 * Para um projecto longo, percorre todos os prompts SEM clipUrl e tenta
 * atribuir o melhor candidato da pool (longos anteriores + funil shorts)
 * baseado em mood overlap + keyword overlap.
 *
 * Atribuição em bulk no servidor — em vez da user clicar 70× na UI, faz-se
 * tudo num call (~5-10s, dependendo do tamanho da pool).
 *
 * Body: { slug, minScore?: number, dedupe?: boolean }
 *   - minScore: mínimo de score para atribuir (default 1 — qualquer match)
 *   - dedupe: se true, cada clip da pool é usado no máximo uma vez (default true)
 *
 * Returns: { attached: [{ promptId, clipUrl, score }], skipped: [...], total }
 */

type ImgPrompt = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
};

const SEED_PROMPTS = (funilSeed.prompts as ImgPrompt[]) ?? [];

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const STOP = new Set([
  "the", "a", "an", "and", "or", "of", "in", "on", "at", "to", "for", "with",
  "from", "as", "by", "is", "are", "was", "were", "be", "been", "being",
  "that", "this", "these", "those", "it", "its", "their",
  "very", "slow", "static", "camera", "soft", "warm", "light", "holds",
  "steady", "gently", "slowly",
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

type PoolClip = {
  clipUrl: string;
  source: "longo" | "nomear";
  mood: string[];
  prompt: string | null;
  episode: string;
};

type ProjectPrompt = {
  id: string;
  mood?: string[];
  prompt?: string;
  clipUrl?: string;
  [k: string]: unknown;
};

type Project = {
  prompts?: ProjectPrompt[];
  [k: string]: unknown;
};

export async function POST(req: NextRequest) {
  let body: { slug?: string; minScore?: number; dedupe?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const slug = (body.slug || "").trim();
  if (!slug || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
    return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
  }
  const minScore = typeof body.minScore === "number" ? body.minScore : 1;
  const dedupe = body.dedupe !== false;

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // Carrega projecto
  let proj: Project;
  try {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .download(`admin/longos/${slug}.json`);
    if (error || !data) {
      return NextResponse.json({ erro: "Projecto não encontrado" }, { status: 404 });
    }
    proj = JSON.parse(await data.text()) as Project;
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  const prompts = Array.isArray(proj.prompts) ? proj.prompts : [];
  const promptsWithoutClip = prompts.filter((p) => !p.clipUrl);
  if (promptsWithoutClip.length === 0) {
    return NextResponse.json({
      attached: [],
      skipped: [],
      total: prompts.length,
      message: "Todos os prompts já têm clip — nada para auto-attach",
    });
  }

  // Carrega pool em paralelo (fontes: longos + nomear)
  const pool: PoolClip[] = [];
  const imgById = new Map<string, ImgPrompt>();
  for (const p of SEED_PROMPTS) imgById.set(p.id, p);

  // Longos paralelizados
  try {
    const { data: slugDirs } = await supabase.storage
      .from("course-assets")
      .list("longos-clips", { limit: 200 });
    if (Array.isArray(slugDirs)) {
      const slugNames = slugDirs.map((d) => d.name).filter(Boolean);
      const perSlug = await Promise.all(
        slugNames.map(async (s) => {
          const [filesRes, projRes] = await Promise.all([
            supabase.storage
              .from("course-assets")
              .list(`longos-clips/${s}`, { limit: 500 }),
            supabase.storage
              .from("course-assets")
              .download(`admin/longos/${s}.json`)
              .catch(() => ({ data: null })),
          ]);
          const projPrompts = new Map<string, { mood: string[]; prompt: string }>();
          if (projRes.data) {
            try {
              const sp = JSON.parse(await projRes.data.text());
              for (const p of sp.prompts ?? []) {
                if (p?.id) {
                  projPrompts.set(p.id, {
                    mood: Array.isArray(p.mood) ? p.mood : [],
                    prompt: p.prompt ?? "",
                  });
                }
              }
            } catch {}
          }
          return { slug: s, files: filesRes.data ?? [], projPrompts };
        }),
      );
      for (const { slug: s, files, projPrompts } of perSlug) {
        for (const f of files) {
          if (!/\.mp4$/i.test(f.name)) continue;
          const promptId = f.name.replace(/\.mp4$/i, "");
          const meta = projPrompts.get(promptId);
          pool.push({
            clipUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/longos-clips/${s}/${f.name}`,
            source: "longo",
            mood: meta?.mood ?? [],
            prompt: meta?.prompt ?? null,
            episode: s,
          });
        }
      }
    }
  } catch {
    /* ignore */
  }

  // Nomear (funil) clips
  try {
    const { data: files } = await supabase.storage
      .from("course-assets")
      .list("youtube/clips", { limit: 1000 });
    if (Array.isArray(files)) {
      const byBase = new Map<string, { name: string }>();
      for (const f of files) {
        if (!/\.mp4$/i.test(f.name)) continue;
        if (!f.name.startsWith("nomear-")) continue;
        const base = f.name.replace(/\.mp4$/i, "").replace(/-[hv]-\d+$/i, "");
        const e = byBase.get(base);
        if (!e || /-h-01\.mp4$/i.test(f.name)) {
          byBase.set(base, { name: f.name });
        }
      }
      for (const [base, { name }] of byBase) {
        const meta = imgById.get(base);
        const ep = base.split("-").slice(0, 2).join("-");
        pool.push({
          clipUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/clips/${name}`,
          source: "nomear",
          mood: meta?.mood ?? [],
          prompt: meta?.prompt ?? null,
          episode: ep,
        });
      }
    }
  } catch {
    /* ignore */
  }

  // Para cada prompt sem clip, calcula score com cada candidato
  // e atribui o melhor (acima de minScore).
  const usedClipUrls = new Set<string>();
  const attached: { promptId: string; clipUrl: string; score: number; sourceLabel: string }[] = [];
  const skipped: { promptId: string; reason: string }[] = [];

  for (const p of promptsWithoutClip) {
    const moodSet = new Set(p.mood ?? []);
    const tokens = tokenize(p.prompt ?? "");
    let best: { clipUrl: string; score: number; episode: string; source: string } | null = null;
    for (const c of pool) {
      if (dedupe && usedClipUrls.has(c.clipUrl)) continue;
      const moodMatches = c.mood.filter((m) => moodSet.has(m)).length;
      const cTokens = tokenize(c.prompt ?? "");
      let kwMatches = 0;
      for (const t of tokens) if (cTokens.has(t)) kwMatches++;
      const score = 2 * moodMatches + kwMatches;
      if (score < minScore) continue;
      if (!best || score > best.score) {
        best = {
          clipUrl: c.clipUrl,
          score,
          episode: c.episode,
          source: c.source,
        };
      }
    }
    if (best) {
      p.clipUrl = best.clipUrl;
      attached.push({
        promptId: p.id,
        clipUrl: best.clipUrl,
        score: best.score,
        sourceLabel: `${best.source} · ${best.episode}`,
      });
      if (dedupe) usedClipUrls.add(best.clipUrl);
    } else {
      skipped.push({ promptId: p.id, reason: "sem candidato com score mínimo" });
    }
  }

  // Persiste o projecto se houve attaches
  if (attached.length > 0) {
    const updated = {
      ...proj,
      prompts,
      updatedAt: new Date().toISOString(),
    };
    const { error: upErr } = await supabase.storage
      .from("course-assets")
      .upload(`admin/longos/${slug}.json`, JSON.stringify(updated, null, 2), {
        contentType: "application/json",
        upsert: true,
      });
    if (upErr) {
      return NextResponse.json(
        { erro: `Patch projecto: ${upErr.message}`, attached, skipped },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    attached,
    skipped,
    total: prompts.length,
    poolSize: pool.length,
  });
}
