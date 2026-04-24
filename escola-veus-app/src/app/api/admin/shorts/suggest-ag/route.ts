import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  AG_FILOSOFIA,
  AG_REGRAS_TONAIS,
  AG_SEED_VERSOS,
  AG_ANTI_PADRAO,
  AG_CAPTION_RULES,
} from "@/lib/ag-tom";
import {
  CATEGORIA_LABELS,
  CATEGORIA_DESCRICOES,
  type CategoriaPaisagem,
  CATEGORIAS_PAISAGEM,
} from "@/lib/paisagem-categorias";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/shorts/suggest-ag
 *
 * Sugere versos para overlays Ancient Ground + captions TikTok/YouTube,
 * alinhados com a filosofia AG (centralidade africana, elementos como
 * sujeitos, ubuntu) e as categorias dos clips escolhidos.
 *
 * Body: {
 *   categorias: string[]  // ex ["mar","mar","flora"] — uma por clip (geralmente 3)
 *   trackNumber?: number  // faixa AG (1-100), contexto opcional
 * }
 *
 * Resposta: {
 *   versos: string[]               // 8 candidatos
 *   tiktokCaption: string          // ≤150 chars
 *   youtubeTitle: string           // ≤70 chars, termina em #Shorts
 *   youtubeDescription: string     // hook + corpo + créditos + hashtags
 *   usage?: { input, output, cached }
 * }
 *
 * Modelo: claude-sonnet-4-6 com prompt caching no system (filosofia + seed
 * bank são estáveis entre chamadas → 90% desconto em re-runs).
 */

type SuggestResponse = {
  versos: string[];
  tiktokCaption: string;
  youtubeTitle: string;
  youtubeDescription: string;
  usage?: { input: number; output: number; cached: number };
};

function buildSystemPrompt(): string {
  const seedBlock = AG_SEED_VERSOS
    .map((v, i) => `${String(i + 1).padStart(2, "0")}. ${v.replace(/\n/g, " / ")}`)
    .join("\n");

  const antiPadraoBlock = AG_ANTI_PADRAO.map((w) => `- ${w}`).join("\n");

  return `# Visão Ancient Ground

${AG_FILOSOFIA}

# Regras tonais

${AG_REGRAS_TONAIS}

# Seed bank (exemplos do tom que procuramos)

Cada entrada abaixo é um overlay já validado pela autora do projecto.
Extrai o padrão destes 30 versos. Não os copies — gera novos respeitando
o mesmo ADN (inversão, tempo profundo, elementos como sujeitos, ubuntu).

${seedBlock}

# Vocabulário PROIBIDO

Nunca uses nenhuma destas palavras. São vocabulário New Age ocidental que
entra em conflito com a centralidade africana do projecto:

${antiPadraoBlock}

# Output format

Responde APENAS com JSON válido conforme o schema pedido. Sem preâmbulo,
sem markdown fences, sem explicações.`;
}

function buildUserMessage(categorias: string[], trackNumber: number | null): string {
  const categoriaInfo = categorias
    .map((cat, i) => {
      const c = cat as CategoriaPaisagem;
      const label = CATEGORIA_LABELS[c] || cat;
      const desc = CATEGORIA_DESCRICOES[c] || "";
      return `- Clip ${i + 1}: ${label} — ${desc}`;
    })
    .join("\n");

  const trackContext = trackNumber
    ? `\nFaixa AG escolhida: faixa-${String(trackNumber).padStart(2, "0")} (música ambient original).`
    : "";

  return `Categorias dos clips escolhidos para este short:
${categoriaInfo}${trackContext}

Gera:

1. **8 versos candidatos** para overlay. Cada um segue as 5 regras tonais.
   Devem ressoar com as categorias listadas — directamente (fala do mar, do
   fogo, da raiz) ou obliquamente (o que o mar lembra, o que a folha sabe).
   Varia a estrutura: algumas de 1 linha, algumas de 2 linhas. Usa inversão
   ("não X, Y"), tempo profundo ("antes de X, já Y"), parentesco (elementos
   como sujeitos vivos).

2. **tiktokCaption** (≤150 chars): usa o verso mais forte como 1ª linha
   (hook), \\n\\n, depois 5-6 hashtags. Prioriza #Shorts, #AncientGround,
   #AfricanNature, #Mozambique, #NaturePoetry, #AmbientMusic.

3. **youtubeTitle** (≤70 chars): hook curto seguido de " #Shorts". Se o verso
   for longo demais, encurta mantendo o impacto.

4. **youtubeDescription** (≤2000 chars): 1ª linha = hook (verso 1 — aparece
   no preview). Linha em branco. Verso 2. Linha em branco. Texto sobre a
   faixa e o projecto Ancient Ground. Linha em branco. 10 hashtags.

Responde apenas com o JSON.`;
}

function clamp(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export async function POST(req: NextRequest) {
  try {
    const { categorias, trackNumber } = (await req.json()) as {
      categorias?: string[];
      trackNumber?: number;
    };

    if (!Array.isArray(categorias) || categorias.length === 0) {
      return NextResponse.json(
        { erro: "categorias[] obrigatório (uma por clip)." },
        { status: 400 },
      );
    }

    // Sanitiza categorias — qualquer desconhecida vira "outro"
    const cleanCategorias = categorias.map((c) =>
      (CATEGORIAS_PAISAGEM as readonly string[]).includes(c) ? c : "outro",
    );

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { erro: "ANTHROPIC_API_KEY não configurada." },
        { status: 500 },
      );
    }

    const client = new Anthropic({ apiKey });

    const system = [
      {
        type: "text" as const,
        text: buildSystemPrompt(),
        cache_control: { type: "ephemeral" as const },
      },
    ];

    const userMessage = buildUserMessage(
      cleanCategorias,
      typeof trackNumber === "number" ? trackNumber : null,
    );

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      system,
      messages: [{ role: "user", content: userMessage }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              versos: {
                type: "array",
                items: { type: "string" },
                minItems: 6,
                maxItems: 10,
              },
              tiktokCaption: { type: "string" },
              youtubeTitle: { type: "string" },
              youtubeDescription: { type: "string" },
            },
            required: ["versos", "tiktokCaption", "youtubeTitle", "youtubeDescription"],
            additionalProperties: false,
          },
        },
      },
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Claude não devolveu text block");
    }

    let parsed: Partial<SuggestResponse>;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      throw new Error(`JSON inválido: ${textBlock.text.slice(0, 200)}`);
    }

    const versos = (Array.isArray(parsed.versos) ? parsed.versos : [])
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      .slice(0, 10);

    if (versos.length === 0) {
      throw new Error("Claude devolveu lista de versos vazia.");
    }

    // Enforcement server-side dos limites de caracteres (não confio na LLM)
    const tiktokCaption = clamp(
      typeof parsed.tiktokCaption === "string" ? parsed.tiktokCaption : "",
      AG_CAPTION_RULES.tiktokMaxChars,
    );
    let youtubeTitle = typeof parsed.youtubeTitle === "string" ? parsed.youtubeTitle : "";
    if (!youtubeTitle.toLowerCase().includes("#shorts")) {
      youtubeTitle = `${youtubeTitle} #Shorts`;
    }
    youtubeTitle = clamp(youtubeTitle, AG_CAPTION_RULES.youtubeTitleMaxChars);
    const youtubeDescription = clamp(
      typeof parsed.youtubeDescription === "string" ? parsed.youtubeDescription : "",
      AG_CAPTION_RULES.youtubeDescriptionMaxChars,
    );

    return NextResponse.json({
      versos,
      tiktokCaption,
      youtubeTitle,
      youtubeDescription,
      usage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        cached: response.usage.cache_read_input_tokens || 0,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
