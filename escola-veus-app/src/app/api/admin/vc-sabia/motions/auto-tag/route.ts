import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { MOOD_LABELS, MORNING_MOODS, type MorningMood } from "@/lib/vc-sabia/audio";
import { VISUAL_CATEGORY_NAMES } from "@/lib/vc-sabia/phrase-motion-match";
import { parseClaudeJson } from "@/lib/vc-sabia/parse-claude-json";

export const maxDuration = 120;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/motions/auto-tag
 *
 * Recebe os primeiros frames dos motions (extraidos no browser via
 * canvas). Envia tudo para Claude Sonnet vision numa unica chamada e
 * pede para classificar cada um em agua/vento/lume/terra.
 *
 * Body: { frames: Array<{ name: string, base64: string }> }
 *   base64 = data URL "data:image/jpeg;base64,..." OU so o payload base64
 *
 * Returns: {
 *   tags: Record<motionName, MorningMood>,
 *   reasoning: string
 * }
 *
 * Server NAO grava em motion-tags.json. O cliente recebe, mostra para
 * confirmar/editar, e POSTa para /motion-tags para gravar.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY nao configurada" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }
  const frames = (body as { frames?: unknown })?.frames;
  if (!Array.isArray(frames) || frames.length === 0) {
    return NextResponse.json(
      { erro: "frames em falta ou vazio" },
      { status: 400 }
    );
  }
  if (frames.length > 60) {
    return NextResponse.json(
      { erro: "max 60 frames por chamada" },
      { status: 400 }
    );
  }

  // Normaliza base64 (remove prefixo data:image/...;base64, se existir).
  const normalized = (frames as Array<{ name?: string; base64?: string }>).map(
    (f, i) => {
      const name = typeof f.name === "string" ? f.name : `frame-${i}`;
      let b64 = typeof f.base64 === "string" ? f.base64 : "";
      if (b64.startsWith("data:")) {
        const idx = b64.indexOf(",");
        if (idx >= 0) b64 = b64.slice(idx + 1);
      }
      return { name, base64: b64 };
    }
  );

  const client = new Anthropic({ apiKey, maxRetries: 2 });

  const elementsList = MORNING_MOODS.map(
    (m) => `- ${m} (${MOOD_LABELS[m]})`
  ).join("\n");

  const categoryList = VISUAL_CATEGORY_NAMES.map((n) => `- "${n}"`).join("\n");

  const systemPrompt = `Classificas frames de clips de video contemplativos para a serie "VC Sabia Que...?" — posts de Instagram com frases de sabedoria sobre uma imagem em movimento + som ambiente.

TAREFA 1 — MOOD (som ambiente):
Cada clip → UM destes 4 elementos:
${elementsList}

Pensa em qual som ambiente faria mais sentido a tocar enquanto vemos esse clip:
- agua: ribeiros, gotas, mar, chuva, fontes, qualquer agua visivel ou implicita
- vento: folhas a oscilar, campos abertos, ceu, tecidos a flutuar, ar
- lume: chamas, brasas, velas, luz dourada quente, por do sol
- terra: pedra, raizes, montanhas, jardim seco, mineral, ancestral, ou movimento muito quieto/grounded

TAREFA 2 — CATEGORIA VISUAL:
Cada clip → UMA destas categorias (pelo subject principal visivel no frame):
${categoryList}

Escolhe a que melhor descreve O QUE SE VE na imagem. Exemplos:
- um lotus numa lagoa → "Lótus na água"
- girassois → "Girassóis molhados de orvalho"
- passaros pequenos → "Pássaros pequenos ao amanhecer"
- neblina entre arvores → "Árvores com neblina matinal"
- montanhas ao longe → "Montanhas etéreas"
- vela acesa → "Vela acesa ao nascer do sol"

Output APENAS JSON no formato exacto:
{
  "tags": {
    "<filename>": "<mood_slug>"
  },
  "categories": {
    "<filename>": "<nome exacto da categoria>"
  },
  "reasoning": "1-3 frases a explicar como agrupaste"
}

Sem texto fora do JSON. Sem markdown. Sem code fences.`;

  // Cada frame entra como bloco de imagem com legenda do nome.
  type ContentBlock =
    | { type: "text"; text: string }
    | {
        type: "image";
        source: { type: "base64"; media_type: "image/jpeg"; data: string };
      };
  const content: ContentBlock[] = [
    {
      type: "text",
      text: `Tens ${normalized.length} frames. O nome do ficheiro precede cada imagem. Output strict JSON.`,
    },
  ];
  for (const f of normalized) {
    content.push({ type: "text", text: `Filename: ${f.name}` });
    content.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: f.base64 },
    });
  }

  let raw = "";
  try {
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    });
    for (const block of res.content) {
      if (block.type === "text") raw += block.text;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { erro: `Claude: ${msg}` },
      { status: 502 }
    );
  }

  const result = parseClaudeJson<{
    tags?: Record<string, string>;
    categories?: Record<string, string>;
    reasoning?: string;
  }>(raw);
  if (!result.ok) {
    return NextResponse.json(
      { erro: `Claude: ${result.error}`, raw: result.raw },
      { status: 502 }
    );
  }
  const parsed = result.data;

  // Validar slugs.
  const validSlugs = new Set<string>(MORNING_MOODS);
  const tags: Record<string, MorningMood> = {};
  for (const [name, slug] of Object.entries(parsed.tags ?? {})) {
    if (validSlugs.has(slug)) {
      tags[name] = slug as MorningMood;
    }
  }

  // Validar categorias visuais.
  const validCategories = new Set<string>(VISUAL_CATEGORY_NAMES);
  const categories: Record<string, string> = {};
  for (const [name, cat] of Object.entries(
    (parsed as { categories?: Record<string, string> }).categories ?? {}
  )) {
    if (validCategories.has(cat)) {
      categories[name] = cat;
    }
  }

  return NextResponse.json({
    tags,
    categories,
    reasoning: parsed.reasoning ?? "",
    classified: Object.keys(tags).length,
    skipped: normalized.length - Object.keys(tags).length,
  });
}
