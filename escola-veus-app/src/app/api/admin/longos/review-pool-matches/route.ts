import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import funilSeed from "@/data/funil-prompts.seed.json";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/admin/longos/review-pool-matches
 *
 * Claude valida cada clip atribuído via auto-attach pool: confirma se o
 * clip da pool é fiel ao prompt do longo (visual + mood). Descola os
 * weak/misaligned para que sejam regerados via Runway.
 *
 * Razão: keyword overlap + mood são heurísticas baratas mas falham em
 * casos onde duas cenas partilham palavras mas mostram coisas
 * visualmente diferentes (ex: "luz fria" vs "luz quente" partilham
 * "luz"). Claude entende semântica.
 *
 * Body: { slug }
 * Returns: { reviewed, kept, detached: [{ promptId, alignment, reason }] }
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

type PoolEntry = {
  clipUrl: string;
  originalPrompt: string;
  originalMood: string[];
  source: "longo" | "nomear";
  episode: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY não configurada" },
      { status: 500 },
    );
  }

  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const slug = (body.slug || "").trim();
  if (!slug || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
    return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
  }

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  // 1. Carrega projecto
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
  const promptsWithClip = prompts.filter((p) => p.clipUrl);
  if (promptsWithClip.length === 0) {
    return NextResponse.json({
      reviewed: 0,
      kept: 0,
      detached: [],
      message: "Nenhum prompt com clipUrl — nada para validar",
    });
  }

  // 2. Constrói índice da pool: clipUrl → original prompt+mood
  const poolIndex = new Map<string, PoolEntry>();
  const imgById = new Map<string, ImgPrompt>();
  for (const p of SEED_PROMPTS) imgById.set(p.id, p);

  // Longos clips
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
          const url = `${supabaseUrl}/storage/v1/object/public/course-assets/longos-clips/${s}/${f.name}`;
          poolIndex.set(url, {
            clipUrl: url,
            originalPrompt: meta?.prompt ?? "(prompt original não encontrado)",
            originalMood: meta?.mood ?? [],
            source: "longo",
            episode: s,
          });
        }
      }
    }
  } catch {
    /* ignore */
  }

  // Funil clips (nomear-*)
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
        const url = `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/clips/${name}`;
        poolIndex.set(url, {
          clipUrl: url,
          originalPrompt: meta?.prompt ?? "(prompt seed não encontrado)",
          originalMood: meta?.mood ?? [],
          source: "nomear",
          episode: ep,
        });
      }
    }
  } catch {
    /* ignore */
  }

  // 3. Identifica quais prompts vieram da pool (skip uploads manuais)
  const reviewable: {
    id: string;
    intendedPrompt: string;
    intendedMood: string[];
    clipPrompt: string;
    clipMood: string[];
    clipSource: string;
  }[] = [];
  for (const p of promptsWithClip) {
    if (!p.clipUrl) continue;
    const poolEntry = poolIndex.get(p.clipUrl);
    if (!poolEntry) continue; // upload manual, skip
    reviewable.push({
      id: p.id,
      intendedPrompt: p.prompt ?? "",
      intendedMood: Array.isArray(p.mood) ? p.mood : [],
      clipPrompt: poolEntry.originalPrompt,
      clipMood: poolEntry.originalMood,
      clipSource: `${poolEntry.source} · ${poolEntry.episode}`,
    });
  }

  if (reviewable.length === 0) {
    return NextResponse.json({
      reviewed: 0,
      kept: promptsWithClip.length,
      detached: [],
      message: "Sem matches da pool para validar (todos os clips são uploads manuais)",
    });
  }

  // 4. Claude review em batch
  const client = new Anthropic({ apiKey, maxRetries: 4 });

  type Review = {
    id: string;
    alignment: "aligned" | "weak" | "misaligned";
    reason: string;
  };

  const userMessage =
    `Para cada par (prompt do longo) vs (clip da pool reaproveitado), classifica\n` +
    `a fidelidade visual:\n\n` +
    `- "aligned": clip mostra essencialmente o que o prompt pede (objecto/cena central\n` +
    `  + atmosfera/mood compatíveis). Reaproveitar é OK.\n` +
    `- "weak": partilha alguns elementos mas o foco visual é diferente; reaproveitar\n` +
    `  cria desconexão entre narração e imagem.\n` +
    `- "misaligned": completamente diferente; o clip não serve este prompt.\n\n` +
    `Sê estrito — preferimos descolar e regerar do que enganar o espectador. Em\n` +
    `dúvida classifica como "weak".\n\n` +
    `Pares (${reviewable.length}):\n\n` +
    reviewable
      .map(
        (r, i) =>
          `${i + 1}. ID: ${r.id}\n` +
          `   Prompt do longo: "${r.intendedPrompt.slice(0, 300)}"\n` +
          `   Mood do longo: [${r.intendedMood.join(", ")}]\n` +
          `   Clip da pool (${r.clipSource}):\n` +
          `   Prompt original: "${r.clipPrompt.slice(0, 300)}"\n` +
          `   Mood original: [${r.clipMood.join(", ")}]`,
      )
      .join("\n\n") +
    `\n\nDevolve JSON com array "reviews": cada item { id, alignment, reason (1 frase curta) }.`;

  let reviews: Review[];
  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system:
        "És um director de arte exigente a validar reaproveitamento visual entre projectos. Avalias se um clip existente serve fielmente um prompt novo, com olho técnico (não és o realizador, és quem garante coerência).",
      messages: [{ role: "user", content: userMessage }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              reviews: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    alignment: {
                      type: "string",
                      enum: ["aligned", "weak", "misaligned"],
                    },
                    reason: { type: "string" },
                  },
                  required: ["id", "alignment", "reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["reviews"],
            additionalProperties: false,
          },
        },
      },
    });
    const response = await stream.finalMessage();
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error(
        `Claude sem text block. stop_reason=${response.stop_reason}`,
      );
    }
    const parsed = JSON.parse(textBlock.text) as { reviews: Review[] };
    reviews = Array.isArray(parsed.reviews) ? parsed.reviews : [];
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      const err = e as unknown as {
        status?: number;
        message?: string;
        type?: string;
        request_id?: string;
      };
      console.error("[review-pool-matches] Anthropic APIError:", JSON.stringify(err));
      return NextResponse.json(
        {
          erro: `Anthropic ${err.status}${err.type ? ` (${err.type})` : ""}: ${err.message}`,
          requestId: err.request_id,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  // 5. Aplica decisões: descola weak + misaligned
  const detached: { promptId: string; alignment: string; reason: string }[] = [];
  for (const r of reviews) {
    if (r.alignment === "weak" || r.alignment === "misaligned") {
      const p = prompts.find((x) => x.id === r.id);
      if (p && p.clipUrl) {
        delete p.clipUrl;
        detached.push({
          promptId: r.id,
          alignment: r.alignment,
          reason: r.reason,
        });
      }
    }
  }

  // 6. Persiste se houve mudanças
  if (detached.length > 0) {
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
        { erro: `Patch projecto: ${upErr.message}`, detached },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    reviewed: reviewable.length,
    kept: reviewable.length - detached.length,
    detached,
  });
}
