import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/phrase/generate
 *
 * Gera uma frase fresca para post manual via Claude. Util para posts
 * one-off em que a utilizadora nao quer gastar uma frase do seed
 * programado.
 *
 * Body: { theme?: string, avoid?: string[] }
 * Returns: { phrase, theme, reasoning }
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY nao configurada" },
      { status: 503 }
    );
  }

  let body: { theme?: string; avoid?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }
  const theme = body.theme?.trim();
  const avoid = Array.isArray(body.avoid) ? body.avoid.slice(0, 30) : [];

  const themesPool = [
    "autoconhecimento",
    "autoamor",
    "autoperdao",
    "florescer-no-tempo-certo",
    "presenca-leve",
    "suavidade-e-descanso",
    "sonhar-com-raizes",
    "inteireza",
    "corpo-como-casa",
    "confianca-no-caminho",
    "gratidao",
    "alegria-simples",
    "beleza-de-existir",
  ];

  const themeInstruction = theme
    ? `O tema desta frase é: ${theme}.`
    : `Escolhe livremente um destes temas: ${themesPool.join(", ")}.`;

  const avoidBlock =
    avoid.length > 0
      ? `\n\nNAO repitas nem parafraseies estas frases ja usadas:\n${avoid.map((a) => `- ${a}`).join("\n")}`
      : "";

  const systemPrompt = `És a Vivianne dos Santos, autora da série de manhã "VC Sabia Que…?" no Instagram.

Voz da marca:
- Português PT-PT/PT-MZ (Moçambique, não Brasil)
- Contemplativa, poética mas acessível, manhã sagrada
- Sabedoria interior, ritmo lento, espaço de respiração
- Temas: autoconhecimento, autoamor, presença, corpo como casa, florescer no tempo certo

PADRÃO OBRIGATÓRIO (CRÍTICO):
A frase TEM de fluir naturalmente depois do kicker "Sabias que...".
Forma preferida: observação concreta de natureza + espelho ao leitor + convite de confiança.

Exemplos do padrão certo (cada um lê-se como "Sabias que... [frase]"):
- "A semente cresce no escuro antes de ver a luz. Tu também. Confia no que ainda não se vê."
- "O rio encontra sempre o caminho, mesmo quando a pedra resiste. Tu também. Confia no teu fluxo."
- "A lua esvazia-se para voltar a encher-se. Tu também. Confia nos teus ciclos."
- "A árvore curva-se ao vento e não parte. Tu também sabes. Confia na tua raiz."
- "O silêncio precede toda a canção. Tu também. Confia na tua pausa."

Estrutura típica: <fenómeno natural ou imagem concreta>. <Tu também | Tu também sabes>. <Confia em algo teu>.

Regras formais:
- NUNCA usar travessão (— ou –). Em situação NENHUMA. Usa pontos ou vírgulas.
- 1 a 3 frases curtas. Total entre 80 e 200 caracteres.
- Começa com letra MAIÚSCULA (vai depois de "Sabias que...").
- A primeira frase é uma imagem da natureza ou um gesto observável (não abstracção).
- A segunda introduz o espelho "Tu também" (com ou sem "sabes").
- A terceira (opcional) começa com "Confia" e nomeia algo interior do leitor (raiz, ciclo, tempo, fluxo, pausa, passo, espaço).
- Não rebuscado, não místico, não filosófico. Concreto e sensorial.

${themeInstruction}${avoidBlock}

Output strict JSON, sem markdown, sem code fences:
{
  "phrase": "<a frase, sem aspas dentro, sem 'Sabias que...' no inicio (o kicker e adicionado pelo overlay)>",
  "theme": "<slug do tema usado>",
  "reasoning": "<1 frase a explicar a imagem da natureza usada>"
}`;

  const client = new Anthropic({ apiKey, maxRetries: 2 });

  let raw = "";
  try {
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: "Gera uma frase fresca agora." }],
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

  let parsed: { phrase?: string; theme?: string; reasoning?: string };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { erro: "Claude devolveu JSON invalido", raw: cleaned.slice(0, 500) },
      { status: 502 }
    );
  }

  let phrase = (parsed.phrase || "").trim();
  // Sanity check: remover travessoes que tenham fugido
  phrase = phrase.replace(/[—–]/g, ",");

  return NextResponse.json({
    phrase,
    theme: parsed.theme ?? theme ?? "",
    reasoning: parsed.reasoning ?? "",
  });
}
