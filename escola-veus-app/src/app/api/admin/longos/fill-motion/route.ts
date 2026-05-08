import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/admin/longos/fill-motion
 *
 * Para cada prompt sem `motion`, Claude lê (prompt visual + mood) e gera
 * 1 frase em inglês específica de movimento de câmara para Runway
 * image-to-video. Conservador (Corvo Seco style): nunca pede zoom rápido,
 * nunca pede cortes, nunca pede elementos que não estão na imagem.
 *
 * Body: { slug }
 * Returns: { filled, totalEmpty, motions: { promptId: motion } }
 */

type ProjectPrompt = {
  id: string;
  prompt?: string;
  mood?: string[];
  motion?: string;
  [k: string]: unknown;
};

type Project = {
  prompts?: ProjectPrompt[];
  [k: string]: unknown;
};

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "ANTHROPIC_API_KEY não configurada" }, { status: 500 });
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
  const empty = prompts.filter((p) => !((p.motion ?? "").trim()));
  if (empty.length === 0) {
    return NextResponse.json({
      filled: 0,
      totalEmpty: 0,
      motions: {},
      message: "Todos os prompts já têm motion",
    });
  }

  const userMessage =
    `Para cada cena visual abaixo, escreve UMA frase em inglês de motion ` +
    `(movimento de câmara para Runway image-to-video). Regras estritas:\n\n` +
    `1. SÓ direcção de câmara — nunca peças elementos que não estão na imagem\n` +
    `   (não digas "add dust", "show wind" — limita-te a "drift", "tilt",\n` +
    `   "push-in", "pull-back", "static", "parallax", "breathing zoom").\n` +
    `2. CONTEMPLATIVO Corvo Seco: muito lento, gentil, never abrupt. Banidas\n` +
    `   palavras: fast, rapid, quick, sudden, shake, jerk, zoom out quickly.\n` +
    `3. Alterna tipos entre cenas seguidas (não 56× "slow drift" — varia\n` +
    `   entre static / push-in / pull-back / tilt up/down / parallax).\n` +
    `4. Inglês, ≤25 palavras, 1 frase só.\n\n` +
    `Exemplos correctos:\n` +
    `- "very slow push-in toward the central object, barely perceptible"\n` +
    `- "static shot, subtle breathing zoom, no pan no tilt"\n` +
    `- "gentle parallax drift to the right, depth subtly shifts"\n` +
    `- "slow tilt up from foreground to background, contemplative pacing"\n\n` +
    `Cenas (${empty.length}):\n\n` +
    empty
      .map(
        (p, i) =>
          `${i + 1}. id: ${p.id}\n   prompt: "${(p.prompt ?? "").slice(0, 250)}"\n   mood: [${(p.mood ?? []).join(", ")}]`,
      )
      .join("\n\n") +
    `\n\nDevolve JSON com array "motions": cada item { id, motion (1 frase EN) }.`;

  const client = new Anthropic({ apiKey, maxRetries: 4 });

  let motions: { id: string; motion: string }[];
  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 6000,
      system:
        "És um cinematógrafo a escolher o movimento de câmara para cada cena dum vídeo contemplativo long-form. Cada motion deve respeitar a estética Corvo Seco: lentidão, dignidade, sem efeitos brutos.",
      messages: [{ role: "user", content: userMessage }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              motions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    motion: { type: "string" },
                  },
                  required: ["id", "motion"],
                  additionalProperties: false,
                },
              },
            },
            required: ["motions"],
            additionalProperties: false,
          },
        },
      },
    });
    const response = await stream.finalMessage();
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error(`Claude sem text block. stop_reason=${response.stop_reason}`);
    }
    const parsed = JSON.parse(textBlock.text) as { motions: typeof motions };
    motions = Array.isArray(parsed.motions) ? parsed.motions : [];
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      const err = e as unknown as {
        status?: number;
        message?: string;
        type?: string;
        request_id?: string;
      };
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

  // Aplica motions ao projecto
  const motionsByPrompt: Record<string, string> = {};
  for (const m of motions) motionsByPrompt[m.id] = m.motion;
  let filled = 0;
  for (const p of prompts) {
    if (!((p.motion ?? "").trim()) && motionsByPrompt[p.id]) {
      p.motion = motionsByPrompt[p.id];
      filled++;
    }
  }

  if (filled > 0) {
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
        { erro: `Patch projecto: ${upErr.message}`, filled, motions: motionsByPrompt },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    filled,
    totalEmpty: empty.length,
    motions: motionsByPrompt,
  });
}
