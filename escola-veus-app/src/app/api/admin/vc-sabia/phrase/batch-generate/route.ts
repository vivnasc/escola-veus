import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { calendarContextFor, calendarLabel } from "@/lib/vc-sabia/calendar";

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

  let body: { count?: number; avoid?: string[]; dates?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }

  const count = Math.max(1, Math.min(40, Number(body.count ?? 7)));
  const avoid = Array.isArray(body.avoid) ? body.avoid.slice(0, 80) : [];
  const dates = Array.isArray(body.dates) ? body.dates.slice(0, count) : [];

  const avoidBlock =
    avoid.length > 0
      ? `\n\nNAO repitas nem parafraseies estas frases ja usadas:\n${avoid.map((a, i) => `${i + 1}. ${a}`).join("\n")}`
      : "";

  // Contexto de calendario por dia: dia do mes, abertura/encerramento de
  // ciclos, solsticios, etc. Cola cada frase a um dia especifico para o
  // Claude poder modelar arcos (primeira/ultima frase do mes, etc).
  const dateBlock =
    dates.length > 0
      ? `\n\nCALENDARIO — cada frase corresponde a um dia. Modela arco emocional:\n${dates
          .map((iso, i) => {
            const [y, m, d] = iso.split("-").map(Number);
            if (!y || !m || !d) return `${i + 1}. ${iso}`;
            const ctx = calendarContextFor(y, m, d);
            const label = calendarLabel(ctx);
            const hint = label ? ` · ${label}` : "";
            return `${i + 1}. ${iso} (dia ${ctx.dayOfMonth}/${ctx.daysInMonth} do mes)${hint}`;
          })
          .join("\n")}\n\nDIRECTIVAS POR MARCADOR:\n- "abertura" / "1.º do ano" / "1.ª segunda" → tema de inicio, semente, raiz, manha primeira (florescer, sonhar-com-raizes, presenca-leve).\n- "encerramento" / "último do ano" → tema de fecho, integracao, agradecimento (inteireza, gratidao, autoperdao, beleza-de-existir).\n- "meio do mes" → reafirmar caminho, raiz, paciencia (inteireza, confianca-no-caminho).\n- "domingo" → suavidade, descanso, corpo (suavidade-e-descanso, corpo-como-casa).\n- "solsticio inverno" / "equinocio outono" → temas de pausa e recolhimento.\n- "solsticio verao" / "equinocio primavera" → temas de expansao e alegria.\nNAO precisas de mencionar a data na frase. O dia influencia tema e tom, nao o texto.`
      : "";

  const systemPrompt = `És a Vivianne dos Santos, autora da serie "VC Sabia Que..." (Instagram, manha contemplativa).

REGRA CRITICA #1: a frase aparece DEPOIS do kicker "Sabias que..." que o overlay imprime acima. Testa mentalmente: "Sabias que... <a tua frase>" tem de soar natural.

REGRA CRITICA #2: a frase NUNCA pode incluir "Sabias que" no inicio (o kicker ja o tem). Comeca SEMPRE por um substantivo concreto da natureza ou um pronome demonstrativo (A semente, O rio, A lua, A arvore, O silencio, A noite, A borboleta, A montanha, A chuva, O fogo, A pedra, O vento, A folha, etc).

PADRAO OBRIGATORIO de 2 ou 3 frases:
1. "<Substantivo natureza com artigo> <verbo presente/passado> <complemento>."
2. "Tu tambem." OU "Tu tambem sabes."
3. (opcional) "Confia <preposicao> <algo interior do leitor>."

EXEMPLOS BONS (cada um le-se naturalmente apos "Sabias que..."):
- "A semente cresce no escuro antes de ver a luz. Tu tambem. Confia no que ainda nao se ve."
- "O rio encontra sempre o caminho, mesmo quando a pedra resiste. Tu tambem. Confia no teu fluxo."
- "A lua esvazia-se para voltar a encher-se. Tu tambem. Confia nos teus ciclos."
- "A arvore curva-se ao vento e nao parte. Tu tambem sabes. Confia na tua raiz."
- "O silencio precede toda a cancao. Tu tambem. Confia na tua pausa."
- "A borboleta passou pelo casulo para abrir asas. Tu tambem. Confia na tua passagem."
- "A montanha nao tem pressa de chegar ao ceu. Tu tambem sabes. Confia no teu passo."

EXEMPLOS PROIBIDOS (n.b. nao replicar este formato):
- "Antes de procurares respostas..." (comeca com adverbio temporal, soa estranho com "Sabias que...")
- "Cada pergunta que te fazes..." (comeca com pronome quantificador, soa estranho)
- "Quando te conheces melhor..." (comeca com conjuncao, soa estranho)
- "Sabias que a semente cresce..." (incluir 'sabias que' duplica)
- "Pergunta-te hoje..." (imperativo directo, sem natureza)

Regras formais:
- Portugues PT-PT/PT-MZ (Mocambique, nao Brasil)
- NUNCA usar travessao (em situacao NENHUMA). So pontos ou virgulas.
- Cada frase entre 80 e 200 caracteres totais.
- Imagem concreta de natureza (planta, agua, lua, ar, animal, pedra). Nao filosofia abstracta.
- Termina em ponto final.

Temas possiveis: autoconhecimento, autoamor, autoperdao, florescer-no-tempo-certo, presenca-leve, suavidade-e-descanso, sonhar-com-raizes, inteireza, corpo-como-casa, confianca-no-caminho, gratidao, alegria-simples, beleza-de-existir.

GERA EXACTAMENTE ${count} frases. Todas distintas entre si. Imagens diferentes (nao todas com agua, nao todas com lua).${dateBlock}${avoidBlock}

Output strict JSON, sem markdown, sem code fences:
{
  "phrases": [
    { "phrase": "<frase 1, comecando por A/O/Os/As + substantivo natureza>", "theme": "<slug>", "reasoning": "<imagem usada>" },
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
