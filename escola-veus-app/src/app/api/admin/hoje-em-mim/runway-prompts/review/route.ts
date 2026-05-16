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

  const systemPrompt = `És prompt engineer para Runway Gen4 Turbo image_to_video, vertical 720:1280, 5-10s. Output usado como fundo contemplativo de uma frase em overlay para o post de fecho de dia "Hoje, em Mim".

OBJECTIVO DO MOTION
Movimento subtil mas REAL e CRÍVEL — como uma fotografia que ganhou vida ao vento. Nem fotografia parada, nem desenho animado.

3 MODOS DE FALHA A EVITAR
A. "Fogo de artifício" — chama/lume vira pontos a piscar dramaticamente.
   Causa: "flicker", "dance", "spark", "pulse".
   Padrão certo: "candle flame breathes — top of flame rises 2mm and lowers smoothly over 4 seconds, one continuous cycle, no sparks, no flicker"
B. "Estátua" — imagem fica parada.
   Causa: prompts vagos ("contemplative", "peaceful").
   Padrão certo: identifica UM elemento específico e descreve EXACTAMENTE como mexe (cm, segundos, direcção)
C. "Brusco / artificial CGI" — movimento interpolado.
   Causa: "fast", "sudden", "shake".
   Padrão certo: verbos contínuos: breathes, drifts, flows, settles, rises and falls, billows

REGRAS NUMÉRICAS OBRIGATÓRIAS
Para cada elemento que mexe:
- Amplitude concreta: "1-2cm", "5 degrees", "barely 3% of frame"
- Duração: "over 4-6 seconds", "every 8 seconds"
- Direcção: "left-to-right", "outward from center"

VOCABULÁRIO PREFERIDO
Bom: breathes, drifts, flows, rises, settles, billows, undulates, glistens, ripples, glides, sways, trails
Mau: flickers, dances, sparks, jumps, pulses, twinkles fast, shakes, flashes

EXEMPLOS REFERÊNCIA

Fogueira/chama: "Static camera. The flame breathes — its top moves up 2cm then settles back smoothly over 5 seconds, one continuous cycle. Embers below glow with a slow warm glow that fades up and down across the 5 seconds. Smoke rises in a gentle thin column drifting slightly left. Background remains perfectly still. No sparks, no flicker."

Água/mar: "Static camera. Slow undulation across the water — small ripples drift from right to left across 5 seconds, amplitude 1-2cm vertical. Moonlight reflection stretches and contracts gently with each ripple. Shore remains perfectly still."

Vela em sala: "Static camera. The candle flame breathes slowly — top rises 3mm and settles back over 4 seconds. Shadow on the wall behind grows and retreats with the flame, very softly. Air remains still. No flicker, no jumps, no sparks."

Folhas: "Static camera. The branch tilts 4 degrees right over 3 seconds, then back over the next 3 seconds. Smaller leaves at the tip move 1cm with the breeze. Trunk and background remain still."

Estrelas/céu: "Static camera. Clouds drift left to right across 5 seconds, covering 5% of frame width. Stars in the gaps each fade up and down on independent 4-second cycles. Horizon still."

ESTRUTURA OBRIGATÓRIA DO PROMPT (inglês)
1. "Static camera."
2. Para cada um de 1-3 elementos visíveis na imagem real:
   <verbo preferido> + <amplitude cm/graus/%> + <duração s> + <direcção>
3. "Background remains perfectly still."
4. Negativo curto: "No sparks, no flicker, no sudden movement, no zoom, no pan, no rotation, no fast cuts."

LISTA NEGRA (não usar)
"flicker", "flickering", "dance", "dancing", "dramatic", "fast", "quick", "sudden", "spark", "burst", "twinkle" sem qualificar duração, "contemplative", "peaceful", "atmospheric", "serene"

OUTPUT — JSON estrito, sem markdown:
{
  "suggestedPrompt": "<inglês, ESTRUTURA OBRIGATÓRIA, pronto a colar>",
  "reasoning": "<1-2 frases pt explicando que elementos e porquê>",
  "concerns": ["<alerta pt se houver risco específico, senão array vazio>"]
}`;

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
