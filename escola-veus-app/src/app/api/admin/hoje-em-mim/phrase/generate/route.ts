import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { parseClaudeJson } from "@/lib/vc-sabia/parse-claude-json";

export const maxDuration = 60;
export const runtime = "nodejs";

/**
 * POST /api/admin/hoje-em-mim/phrase/generate
 *
 * Gera uma frase fresca para "Hoje, em Mim" via Claude. Usado pelo
 * botao 🤖 no BulkPreviewTable quando a utilizadora nao quer
 * editar a mao nem reutilizar uma frase do seed.
 *
 * Body: { dia: DiaSemana, especial?: DiaEspecial | null, avoid?: string[] }
 * Returns: { phrase, reasoning }
 */

type DiaSemana = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type DiaEspecial = "fim_mes" | "inicio_mes" | "fim_ano" | "inicio_ano";

const KICKER_POR_DIA: Record<DiaSemana, string> = {
  mon: "olha hoje",
  tue: "hoje agradeço",
  wed: "solto hoje",
  thu: "hoje aprendi",
  fri: "celebro hoje",
  sat: "hoje, no corpo",
  sun: "amanhã, escolho",
};

const TOM_POR_DIA: Record<DiaSemana, string> = {
  mon: "Convite a olhar para dentro. Observa um momento pequeno do dia que pediu mais, ou uma verdade que apareceu devagar. Frase começa com imagem concreta do dia, depois espelho introspectivo.",
  tue: "Gratidão simples. Estrutura: 'Pelo/Pela <gesto, pessoa, sensação concreta>, agradeço com <qualidade interior>.' Concreto, nada cósmico.",
  wed: "Soltar peso. Imagem de devolver, pousar, libertar algo que não me cabe. Verbos: solto, devolvo, pouso, entrego, liberto, deixo cair.",
  thu: "Aprendizagem. Estrutura: 'Hoje aprendi que <verdade pequena e útil>.' Lição íntima do dia, sem moralismo.",
  fri: "Celebrar pequenas vitórias. Estrutura: 'Celebro hoje <coisa silenciosa ou invisível que merece honra>.' Foca no que ninguém vê.",
  sat: "Ritual do corpo. Estrutura: 'Hoje, no corpo, <gesto físico simples + sentido interior>.' Respiração, mão no peito, pés, ombros.",
  sun: "Intenção para amanhã. Estrutura: 'Amanhã, escolho <escolha consciente para o dia seguinte>.' Verbo escolho, não prometo, não vou.",
};

const TOM_ESPECIAL: Record<DiaEspecial, string> = {
  fim_mes:
    "Fecho de ciclo do mês. Olhar para trás com agradecimento, soltar o que pesou, honrar o que cresceu em silêncio. Não usar formato weekday — é fim de mês.",
  inicio_mes:
    "Início de novo ciclo do mês. Mãos abertas, intenção suave, fé no caminho que se faz a andar. Não usar formato weekday.",
  fim_ano:
    "Fecho do ano. Solenidade contida. Honrar a passagem, agradecer cada manhã difícil. Tom de despedida tranquila.",
  inicio_ano:
    "Início de ano novo. Não prometer — convidar. Coragem viva, disponibilidade ao que vier.",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY nao configurada" },
      { status: 503 }
    );
  }

  let body: { dia?: DiaSemana; especial?: DiaEspecial | null; avoid?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }

  const dia = body.dia ?? "mon";
  const especial = body.especial ?? null;
  const avoid = Array.isArray(body.avoid) ? body.avoid.slice(0, 40) : [];

  const kicker = KICKER_POR_DIA[dia];
  const tomCtx = especial ? TOM_ESPECIAL[especial] : TOM_POR_DIA[dia];

  const avoidBlock =
    avoid.length > 0
      ? `\n\nNAO repitas nem parafraseies estas frases ja usadas:\n${avoid.map((a) => `- ${a}`).join("\n")}`
      : "";

  const systemPrompt = `És a Vivianne dos Santos, autora da série de fim-de-dia "Hoje, em Mim" no Instagram.

Voz da marca:
- Português europeu (PT-PT), nunca PT-BR
- Contemplativa, acolhedora, fim de dia, ritual de introspeção
- Tira a leitora do automático e convida a um pequeno gesto interior
- Tom: noite, intimidade, respiração, ternura, evolução silenciosa
- Sem misticismo, sem auto-ajuda. Concreto e sensorial.

CONTEXTO DO DIA (CRÍTICO):
Esta frase é para o ritual de ${especial ? `"${especial.replace("_", " ")}"` : `${dia}`}.
${tomCtx}

O kicker (não escrever na frase, é adicionado pelo overlay): "${kicker}".
A frase TEM de fluir naturalmente depois do kicker. Quem lê o post lê: "${kicker}. <a tua frase>".

Regras formais:
- NUNCA usar travessão (— ou –). Em situação NENHUMA. Usa vírgulas, pontos, ou quebras.
- 1 a 3 frases curtas. Total entre 60 e 200 caracteres.
- Começa com letra maiúscula.
- Imagem concreta antes de abstracção.
- Não rebuscado, não filosófico. Próximo, humano, de quem fecha o dia em casa.
- Não usar pontos de exclamação. Não usar perguntas retóricas no final.
${avoidBlock}

Output strict JSON, sem markdown, sem code fences:
{
  "phrase": "<a frase, sem aspas internas, sem o kicker no inicio (o overlay adiciona)>",
  "reasoning": "<1 frase a explicar a imagem ou gesto escolhido>"
}`;

  const client = new Anthropic({ apiKey, maxRetries: 2 });

  let raw = "";
  try {
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: "Gera uma frase fresca para este fecho de dia." }],
    });
    for (const block of res.content) {
      if (block.type === "text") raw += block.text;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Claude: ${msg}` }, { status: 502 });
  }

  const result = parseClaudeJson<{ phrase?: string; reasoning?: string }>(raw);
  if (!result.ok) {
    return NextResponse.json(
      { erro: `Claude: ${result.error}`, raw: result.raw },
      { status: 502 }
    );
  }
  const parsed = result.data;

  let phrase = (parsed.phrase || "").trim();
  phrase = phrase.replace(/[—–]/g, ",");

  return NextResponse.json({
    phrase,
    reasoning: parsed.reasoning ?? "",
  });
}
