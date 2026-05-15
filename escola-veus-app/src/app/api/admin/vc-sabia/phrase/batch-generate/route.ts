import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 90;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/phrase/batch-generate
 *
 * Gera N frases novas de uma vez via Claude, todas a fluir depois de
 * "Sabias que...". Sem repeticoes entre si e evitando frases passadas
 * em `avoid`.
 *
 * Body: { count: number (1-40), avoid?: string[] }
 * Returns: { phrases: Array<{ phrase, theme, reasoning }> }
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY nao configurada" },
      { status: 503 }
    );
  }

  let body: { count?: number; avoid?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }

  const count = Math.max(1, Math.min(40, Number(body.count ?? 7)));
  const avoid = Array.isArray(body.avoid) ? body.avoid.slice(0, 80) : [];

  const avoidBlock =
    avoid.length > 0
      ? `\n\nNAO repitas nem parafraseies estas frases ja usadas:\n${avoid.map((a, i) => `${i + 1}. ${a}`).join("\n")}`
      : "";

  const systemPrompt = `És a Vivianne dos Santos, autora da serie "VC Sabia Que..." (Instagram, manha contemplativa).

Cada frase TEM de fluir naturalmente depois do kicker "Sabias que..." (que o overlay adiciona).

PADRAO OBRIGATORIO:
<fenomeno natural ou imagem concreta>. <Tu tambem | Tu tambem sabes>. <Confia em algo interior do leitor>.

Exemplos:
- "A semente cresce no escuro antes de ver a luz. Tu tambem. Confia no que ainda nao se ve."
- "O rio encontra sempre o caminho, mesmo quando a pedra resiste. Tu tambem. Confia no teu fluxo."
- "A lua esvazia-se para voltar a encher-se. Tu tambem. Confia nos teus ciclos."
- "A arvore curva-se ao vento e nao parte. Tu tambem sabes. Confia na tua raiz."
- "O silencio precede toda a cancao. Tu tambem. Confia na tua pausa."
- "A noite mais escura anuncia o amanhecer. Tu tambem sabes. Confia no teu tempo."
- "A borboleta passou pelo casulo para abrir asas. Tu tambem. Confia na tua passagem."
- "A montanha nao tem pressa de chegar ao ceu. Tu tambem sabes. Confia no teu passo."

Regras formais:
- Portugues europeu (PT-PT), nunca PT-BR
- NUNCA usar travessao (em situacao NENHUMA). So pontos ou virgulas.
- Cada frase entre 80 e 200 caracteres totais.
- Comeca com letra MAIUSCULA.
- Imagem concreta de natureza (planta, agua, lua, ar, animal). Nao filosofia abstracta.
- Termina em ponto final.

Temas possiveis: autoconhecimento, autoamor, autoperdao, florescer-no-tempo-certo, presenca-leve, suavidade-e-descanso, sonhar-com-raizes, inteireza, corpo-como-casa, confianca-no-caminho, gratidao, alegria-simples, beleza-de-existir.

GERA EXACTAMENTE ${count} frases. Todas distintas entre si. Imagens diferentes (nao todas com agua, nao todas com lua).${avoidBlock}

Output strict JSON, sem markdown, sem code fences:
{
  "phrases": [
    { "phrase": "<frase 1>", "theme": "<slug>", "reasoning": "<imagem usada>" },
    { "phrase": "<frase 2>", "theme": "<slug>", "reasoning": "<imagem usada>" },
    ...${count} entradas no total
  ]
}`;

  const client = new Anthropic({ apiKey, maxRetries: 2 });

  let raw = "";
  try {
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Gera ${count} frases frescas agora. Variedade de imagens de natureza (planta, agua, lua, ar, animal).`,
        },
      ],
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

  let parsed: { phrases?: Array<{ phrase?: string; theme?: string; reasoning?: string }> };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { erro: "Claude devolveu JSON invalido", raw: cleaned.slice(0, 800) },
      { status: 502 }
    );
  }

  const phrases = (parsed.phrases ?? [])
    .map((p) => ({
      phrase: (p.phrase || "").replace(/[—–]/g, ",").trim(),
      theme: p.theme || "",
      reasoning: p.reasoning || "",
    }))
    .filter((p) => p.phrase.length > 0)
    .slice(0, count);

  return NextResponse.json({
    phrases,
    requested: count,
    returned: phrases.length,
  });
}
