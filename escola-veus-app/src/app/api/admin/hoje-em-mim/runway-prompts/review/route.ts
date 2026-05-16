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

  const systemPrompt = `Geras motion prompts CURTOS para Runway Gen4 Turbo image_to_video (vertical 720:1280, 5-10s). Output para o post "Hoje, em Mim".

REGRA DE OURO
Runway Gen4 Turbo reage MAL a prompts longos. UMA frase, MÁXIMO 150 caracteres. Parece um título de documentário, não uma receita.

PRINCÍPIO DO TOM CONTEMPLATIVO
Contemplativo NÃO é câmara a mexer, é UM ELEMENTO DO AMBIENTE a mexer enquanto tudo o resto está parado. A câmara fica sempre estática (não escrevas "camera drift", "pan", "zoom"). O motion é da chama, da água, do fumo, da folha, do reflexo. Nunca da câmara.

Brevidade igual aos prompts curtos dos longos, mas motion é do elemento, não da câmara.

ANTIPADRÕES
- Listar amplitudes em mm/cm/graus → vira CGI artificial
- Descrever motion por segundos → vira robótico
- "flicker", "dance", "spark", "pulse" → fogo de artifício
- Lista negativa longa → confunde Runway

PADRÃO BOM
- 1 frase de 50-150 caracteres
- 1 verbo central suave + qualificador "slow" ou "gentle"
- Câmara estática é implícita
- Adjetivos atmosféricos OK: "ambient", "warm", "soft"

EXEMPLOS
- "candle flame breathes softly in still air, warm amber light, ambient"
- "moonlight ripples slowly across dark water, gentle undulation"
- "white smoke curls upward from incense, slow drift, intimate room"
- "leaves sway gently in night breeze, soft rustle of branches"
- "embers glow and dim slowly in low brazier, ambient warmth"
- "stars twinkle softly over silhouetted trees, slow night drift"
- "linen curtain billows in moonlit window, soft fabric motion"

OUTPUT — JSON estrito, sem markdown:
{
  "suggestedPrompt": "<inglês, UMA frase, 50-150 chars, sem números>",
  "reasoning": "<1 frase pt>",
  "concerns": []
}

Se a imagem não tem 1 elemento dinâmico claro, devolve: "ambient air moves softly, gentle natural motion of background elements, warm light".`;

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
