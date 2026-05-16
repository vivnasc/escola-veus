import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import {
  NIGHT_MOOD_LABELS,
  NIGHT_MOODS,
  type NightMood,
} from "@/lib/hoje-em-mim/audio";

export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/hoje-em-mim/motions/auto-tag
 *
 * Recebe lista de motions (URLs) e classifica cada um num dos 10 night
 * moods. Usa Claude Sonnet vision — operação simples (one-of-N), muito
 * mais robusta do que gerar motion prompts.
 *
 * O frame de cada motion é extraído no cliente como base64 jpeg e
 * enviado. Aqui só fazemos a chamada Claude com todos os frames em
 * batch (1 chamada para a lista, não N).
 *
 * Body: { frames: Array<{ url: string, name: string, base64: string }> }
 *
 * Returns: { tags: Record<url, NightMood>, reasoning: string }
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY não configurada" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  const frames = (body as { frames?: unknown })?.frames;
  if (!Array.isArray(frames) || frames.length === 0) {
    return NextResponse.json({ erro: "frames em falta ou vazio" }, { status: 400 });
  }
  if (frames.length > 60) {
    return NextResponse.json({ erro: "máximo 60 frames por chamada" }, { status: 400 });
  }

  const normalized = (frames as Array<{ url?: string; name?: string; base64?: string }>).map(
    (f, i) => {
      const url = typeof f.url === "string" ? f.url : "";
      const name = typeof f.name === "string" ? f.name : `frame-${i}`;
      let b64 = typeof f.base64 === "string" ? f.base64 : "";
      if (b64.startsWith("data:")) {
        const idx = b64.indexOf(",");
        if (idx >= 0) b64 = b64.slice(idx + 1);
      }
      return { url, name, base64: b64 };
    }
  );

  const client = new Anthropic({ apiKey, maxRetries: 2 });

  const elementsList = NIGHT_MOODS.map(
    (m) => `- ${m} (${NIGHT_MOOD_LABELS[m]})`
  ).join("\n");

  const systemPrompt = `Classificas frames de clips noturnos da produção "Hoje, em Mim" — posts diários de fecho de dia, contemplativos. Cada frame é UM dos 10 moods de áudio:

${elementsList}

Pensa: que som ambiente faria sentido tocar durante este clip? Empareiha pelo tom emocional dominante da imagem:

- grilos-tropicais → noite quente, jardim, verandah tropical, qualquer cena de exterior calmo nocturno
- brisa-bambu → vegetação leve, folhas, cortinas a balançar
- chuva-fina-no-telhado → janelas com chuva, atmosfera melancólica intimista
- lareira-respira → velas, lume, brasas, chá, qualquer luz quente íntima
- lua-sobre-agua → água, reflexos, fontes, qualquer superfície líquida visível
- coruja-distante → árvores, baobás, savana, florestas escuras, silhuetas
- tigela-grave → incenso, fumo, meditação, geometria circular/mística
- mare-noturna → mar, praia, costa, ondas
- tambor-lento-distante → aldeia, fogueira, cenas com tambores ou silhuetas humanas distantes
- sussurro-coro-feminino → estrelas, via láctea, céu cósmico, pena a cair, magia subtil

Output APENAS JSON estrito, sem markdown, sem code fences:
{
  "tags": {
    "<filename ou url do frame>": "<slug do mood>",
    ...
  },
  "reasoning": "1-3 frases pt a explicar a lógica geral"
}`;

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
    return NextResponse.json({ erro: `Claude: ${msg}` }, { status: 502 });
  }

  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  let parsed: { tags?: Record<string, string>; reasoning?: string };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { erro: "Claude devolveu JSON inválido", raw: cleaned.slice(0, 500) },
      { status: 502 }
    );
  }

  const validSlugs = new Set<string>(NIGHT_MOODS);
  // Mapeia filename → url para devolver pelo url (mais útil ao cliente)
  const nameToUrl: Record<string, string> = {};
  for (const f of normalized) nameToUrl[f.name] = f.url;

  const tags: Record<string, NightMood> = {};
  for (const [name, slug] of Object.entries(parsed.tags ?? {})) {
    if (validSlugs.has(slug)) {
      const url = nameToUrl[name] ?? name;
      tags[url] = slug as NightMood;
    }
  }

  return NextResponse.json({
    tags,
    reasoning: parsed.reasoning ?? "",
    classified: Object.keys(tags).length,
    total: normalized.length,
  });
}
