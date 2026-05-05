import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/admin/longos/review-prompts
 *
 * Claude lê o script + prompts dum projecto longo e devolve, por prompt:
 *  - alignment: 'aligned' | 'weak' | 'misaligned' (face ao script)
 *  - slop: 'clean' | 'generic' | 'ai-slop' (cliché AI tipo "purple gradient")
 *  - notes: 1-2 frases do que melhorar
 *  - suggested?: prompt revisto (só se misaligned ou ai-slop)
 *
 * UI mostra os flags e permite "aceitar sugestão" por prompt — sem custo
 * extra, é só edit local que depois ela guarda manualmente.
 *
 * Body: { slug }
 *
 * Custo: ~$0.05-0.10 per call (~3000 chars script + ~50 prompts em context).
 */

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

type ProjectPrompt = {
  id: string;
  category?: string;
  mood?: string[];
  prompt?: string;
  [k: string]: unknown;
};

type Project = {
  titulo?: string;
  script?: string;
  prompts?: ProjectPrompt[];
  capitulos?: { titulo: string; ancora: string }[];
  [k: string]: unknown;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY não configurada." },
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

  const script = proj.script ?? "";
  const prompts = Array.isArray(proj.prompts) ? proj.prompts : [];
  if (prompts.length === 0) {
    return NextResponse.json({ erro: "Sem prompts para rever" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const system = [
    {
      type: "text" as const,
      text: `És um director de arte critico para "Escola dos Véus" — long-form contemplativo PT, paleta cream/terracota/dourado/navy, cenas com objectos com história (azulejos, mesas de madeira gasta, véus, anéis, moedas, cartas, velas, panelas de cobre).

Tarefa: receber o script + lista de prompts de imagem e classificar cada prompt em 3 dimensões:

1. ALIGNMENT face ao script:
   - 'aligned': o prompt encaixa logicamente em algum momento do script
   - 'weak': o prompt está OK estéticamente mas não tem relação clara com o que está a ser narrado
   - 'misaligned': o prompt sugere algo que CONTRADIZ o script (ex: "criança a brincar feliz" num script sobre culpa adulta)

2. SLOP detection (qualidade visual AI):
   - 'clean': prompt único, com objectos específicos, luz definida, mood próprio
   - 'generic': prompt OK mas previsível ("woman looking out window")
   - 'ai-slop': cliché AI tipo "ethereal mist purple gradient", "futuristic woman holographic", linguagem genérica de AI imagery

3. NOTES: 1-2 frases concretas do que está a falhar (se aligned+clean, podes pôr "OK, sem sugestões").

4. SUGGESTED (opcional): só se misaligned OU ai-slop, escreve um prompt revisto que mantém a estética da Vivianne mas resolve o problema.

Devolve JSON: { reviews: [{ id, alignment, slop, notes, suggested? }] } — UM POR PROMPT, mesma ordem.`,
      cache_control: { type: "ephemeral" as const },
    },
  ];

  const userMessage = `Projecto: "${proj.titulo || slug}"

SCRIPT (markdown com tags ElevenLabs):
"""
${script.slice(0, 8000)}
"""

PROMPTS A REVER (${prompts.length}):
${prompts
  .map(
    (p, i) =>
      `${i + 1}. id=${p.id}\n   mood: [${(p.mood || []).join(", ")}]\n   prompt: ${p.prompt || ""}`,
  )
  .join("\n\n")}

Classifica cada prompt. Responde APENAS com JSON.`;

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 12000,
      system,
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
                    alignment: { type: "string", enum: ["aligned", "weak", "misaligned"] },
                    slop: { type: "string", enum: ["clean", "generic", "ai-slop"] },
                    notes: { type: "string" },
                    suggested: { type: "string" },
                  },
                  required: ["id", "alignment", "slop", "notes"],
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
      const stop = response.stop_reason || "unknown";
      const types = response.content.map((b) => b.type).join(", ") || "(vazio)";
      throw new Error(`Sem text block. stop=${stop} blocks=[${types}]`);
    }

    let parsed: { reviews?: unknown };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      throw new Error(`JSON inválido: ${textBlock.text.slice(0, 200)}`);
    }
    const reviews = Array.isArray(parsed.reviews) ? parsed.reviews : [];

    const usage = response.usage;
    const inCost = ((usage.input_tokens || 0) * 3) / 1_000_000;
    const outCost = ((usage.output_tokens || 0) * 15) / 1_000_000;
    const cacheReadCost = ((usage.cache_read_input_tokens || 0) * 0.3) / 1_000_000;
    const cacheWriteCost = ((usage.cache_creation_input_tokens || 0) * 3.75) / 1_000_000;
    const costUsd = inCost + outCost + cacheReadCost + cacheWriteCost;

    return NextResponse.json({
      reviews,
      summary: {
        total: prompts.length,
        misaligned: reviews.filter(
          (r: { alignment?: string }) => r.alignment === "misaligned",
        ).length,
        weak: reviews.filter((r: { alignment?: string }) => r.alignment === "weak").length,
        aiSlop: reviews.filter((r: { slop?: string }) => r.slop === "ai-slop").length,
        generic: reviews.filter((r: { slop?: string }) => r.slop === "generic").length,
      },
      usage: { costUsd: +costUsd.toFixed(4) },
    });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
