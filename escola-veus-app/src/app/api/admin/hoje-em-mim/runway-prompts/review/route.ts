import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;
export const runtime = "nodejs";

/**
 * POST /api/admin/hoje-em-mim/runway-prompts/review
 *
 * Usa Claude Sonnet vision para olhar para a imagem MJ real e escrever
 * um motion prompt específico para Runway Gen4 Turbo image_to_video.
 *
 * Razão de existir: os prompts genéricos pré-escritos em
 * src/data/hoje-em-mim-mj-prompts.ts não conseguem antecipar o que
 * cada imagem MJ vai gerar (composição, elementos, escala). Resultado:
 * vídeos onde a imagem fica estática ou onde elementos se movem
 * brusca/violentamente (ex: velas a dançar). Custa créditos Runway.
 *
 * O Claude vê a imagem real, identifica 1-3 elementos plausíveis para
 * animar, escreve motion com amplitude e velocidade controladas, e
 * termina com lista negativa específica.
 *
 * Body: {
 *   imageUrl: string,      // URL pública da imagem MJ no Supabase
 *   scene?: string,        // contexto opcional (ex: "vela em stucco")
 *   currentPrompt?: string // motion prompt actual, para Claude rever
 * }
 *
 * Returns: {
 *   suggestedPrompt: string,
 *   reasoning: string,
 *   concerns?: string[]    // alertas sobre limitações da imagem
 * }
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY não configurada" },
      { status: 503 }
    );
  }

  let body: { imageUrl?: string; scene?: string; currentPrompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const imageUrl = (body.imageUrl || "").trim();
  if (!imageUrl) {
    return NextResponse.json({ erro: "imageUrl em falta" }, { status: 400 });
  }

  const scene = (body.scene || "").trim();
  const currentPrompt = (body.currentPrompt || "").trim();

  // Descarrega a imagem e converte para base64 (Claude vision aceita
  // URLs externos mas base64 é mais fiável quando Supabase storage tem
  // cache headers strange).
  let imageB64 = "";
  let mediaType: "image/png" | "image/jpeg" | "image/webp" = "image/jpeg";
  try {
    const r = await fetch(imageUrl);
    if (!r.ok) throw new Error(`Imagem HTTP ${r.status}`);
    const ct = r.headers.get("content-type") || "";
    if (ct.includes("png")) mediaType = "image/png";
    else if (ct.includes("webp")) mediaType = "image/webp";
    else mediaType = "image/jpeg";
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 8 * 1024 * 1024) {
      return NextResponse.json(
        { erro: "Imagem >8MB. Re-exporta em qualidade menor." },
        { status: 413 }
      );
    }
    imageB64 = buf.toString("base64");
  } catch (e) {
    return NextResponse.json(
      { erro: `Falhei a descarregar imagem: ${e instanceof Error ? e.message : String(e)}` },
      { status: 502 }
    );
  }

  const systemPrompt = `És especialista em prompts de motion para Runway Gen4 Turbo image_to_video, vertical 720:1280, 5 a 10 segundos.

CONTEXTO DA PRODUÇÃO
"Hoje, em Mim" é um post diário de fecho de dia, contemplativo, acolhedor. O motion serve de fundo a uma frase de introspeção que aparece em overlay (overlay é POR CIMA, tu só decides o que o motion faz).

O TOM DO MOTION TEM DE SER
- Lento. Muito lento. Quase imperceptível.
- Contemplativo. Acolhedor. Convida a respirar.
- Atmosférico mas vivo (não pode ficar fotografia parada).

OS ERROS QUE TENS DE EVITAR (custaram créditos Runway à utilizadora)
1. "Imagem fica estática" — Runway não sabe o que mexer. Causa: prompt vago ou aponta para elementos que a imagem não tem. SOLUÇÃO: identifica elementos VISÍVEIS na imagem real e atribui-lhes movimento concreto, mensurável.
2. "Vela a dançar brusca/violenta" — Runway interpreta "flickering" como rápido e amplo. SOLUÇÃO: descreve amplitude muito pequena ("barely visible flicker", "tiny", "subtle 5% movement"), frequência baixa ("every 2-3 seconds", "once per 4 seconds"), e direção precisa.

ESTRUTURA OBRIGATÓRIA DO PROMPT
1. "static camera" sempre (ou "static camera with extremely subtle parallax drift of <2%" se justificado).
2. 1 a 3 elementos concretos da imagem (vistos por ti agora), cada um com: o que se mexe + amplitude pequena + velocidade lenta + direção/frequência.
3. Outros elementos: "remain still" / "unmoving" para evitar Runway adicionar movimento parasita.
4. Atmosfera curta: "slow contemplative night atmosphere" no fim.
5. Lista negativa: "no zoom, no pan, no rotation, no people, no sudden movements, no violent flickering, no fast cuts".

ELEMENTOS QUE COSTUMAM COMPORTAR-SE BEM EM RUNWAY
- Água superficial: ondulações lentas, rifle de luar, reflexos a tremular subtilmente
- Folhas/cortinas/tecido: sway lateral 2-5cm ao longo de 4-6 segundos
- Fumo de incenso/vapor: ascensão lenta com curl
- Estrelas/luzes distantes: twinkling ocasional muito ténue
- Brasas: pulsar muito lento de luz amarela, sem deslocamento
- Velas: USAR COM CUIDADO — descreve sempre "tiny barely visible flicker every 3 seconds, almost still", nunca "dancing" nem "flickering"

ELEMENTOS QUE COSTUMAM REBENTAR
- Pessoas/rostos (animação de feições fica esquisita): manter "no people visible" ou "silhouette only, unmoving"
- Texto/escrita na imagem (Runway distorce): "any text remains perfectly still"
- Reflexos em espelho ou janela com geometria complexa: pedir "very gentle" sem detalhes

FORMATO DE OUTPUT
Devolves APENAS JSON estrito, sem markdown, sem code fences:
{
  "suggestedPrompt": "<motion prompt completo em inglês, pronto para colar no Runway>",
  "reasoning": "<2-3 frases em português a explicar o que escolheste mexer e porquê>",
  "concerns": ["<alerta 1 em português>", "<alerta 2 em português>"]
}

"concerns" só aparece se houver risco real (e.g. "imagem mostra rosto frontal, motion pode distorcer feições"). Se a imagem for limpa, devolves "concerns": [].`;

  const userText = [
    "Olha para esta imagem que vai ser submetida ao Runway Gen4 Turbo image_to_video em ratio vertical 720:1280, com duração de 10 segundos.",
    "",
    scene ? `Cena (contexto da editora): ${scene}` : "Sem contexto adicional da editora.",
    "",
    currentPrompt
      ? `O motion prompt actual escolhido pela editora é:\n"${currentPrompt}"\n\nRevê-o ou substitui-o.`
      : "Não há prompt actual. Escreve um do zero.",
    "",
    "Devolve só JSON.",
  ].join("\n");

  const client = new Anthropic({ apiKey, maxRetries: 2 });

  let raw = "";
  try {
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: imageB64 },
            },
          ],
        },
      ],
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

  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  let parsed: { suggestedPrompt?: string; reasoning?: string; concerns?: string[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { erro: "Claude devolveu JSON inválido", raw: cleaned.slice(0, 500) },
      { status: 502 }
    );
  }

  if (!parsed.suggestedPrompt || typeof parsed.suggestedPrompt !== "string") {
    return NextResponse.json(
      { erro: "Claude não devolveu suggestedPrompt", raw: cleaned.slice(0, 500) },
      { status: 502 }
    );
  }

  return NextResponse.json({
    suggestedPrompt: parsed.suggestedPrompt.trim(),
    reasoning: parsed.reasoning ?? "",
    concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
  });
}
