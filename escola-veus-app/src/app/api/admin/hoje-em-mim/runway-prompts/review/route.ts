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

  const systemPrompt = `Escreves motion prompts para Runway Gen4 Turbo image_to_video. Output para o post "Hoje, em Mim" — fundo contemplativo de uma frase em overlay.

PROCESSO OBRIGATÓRIO (faz cada passo no campo certo do JSON)

1. observed: o que vês especificamente nesta imagem. Lista 3-5 objectos concretos por nome (não 'cena bonita' — escreve 'vela em castiçal preto, parede de tijolo, sombra à direita'). Identifica material/textura/direcção da luz/fonte da luz.

2. dynamicElement: dos objectos que viste, qual é o ÚNICO que pode ganhar motion natural? Escolhe um com física natural (chama queima, água ondula, fumo sobe, ar move textil/folha, luz pulsa em brasa). Se a imagem é só estática, escolhe a luz ambiente ou pequeno detalhe (poeira, vapor).

3. suggestedPrompt: motion para ESSE elemento, inglês, 1 frase. Não menciones a câmara (estática). Não uses números. Verbos preferidos: breathes, drifts, flows, sways, settles, billows, undulates, ripples, glistens, glides. Proibidos: flickers, dances, sparks, pulses, twinkles, flashes, jumps.

4. reasoning: 1 frase pt — porque escolheste esse elemento.

EXEMPLOS (observed → suggestedPrompt)

Vela em sala escura:
observed: "Vela de cera amarela em prato pequeno preto, parede de pedra ao fundo, luz quente vinda da chama, sombras moles."
suggestedPrompt: "the candle flame breathes softly, casting a slow warm glow on the stone wall behind"

Água ao luar:
observed: "Superfície de água escura, lua a refletir vertical como coluna prateada, costa não visível, pequenas ondas mínimas."
suggestedPrompt: "moonlight ripples softly across the dark water surface, the silver column stretching and settling"

Incenso a fumegar:
observed: "Vareta de incenso num suporte, fumo branco a subir em curva, fundo escuro com feixe de luz quente."
suggestedPrompt: "white incense smoke curls upward slowly in the warm beam of light, trailing into the dark"

Janela com cortina branca:
observed: "Cortina de linho branco numa janela aberta, luz azulada (luar) atrás, sombras das dobras na parede."
suggestedPrompt: "the linen curtain billows inward gently in the cool night air, soft folds moving with breath"

NUNCA devolvas algo genérico tipo "ambient warm light" — força-te a olhar e a comprometer-te com o objecto.

OUTPUT — JSON estrito, sem markdown:
{
  "observed": "<descrição visual concreta da imagem, pt, 1-2 frases>",
  "dynamicElement": "<o elemento que escolheste mexer, pt>",
  "suggestedPrompt": "<inglês, 1 frase natural, sem números, sem mencionar câmara>",
  "reasoning": "<porque esse elemento, pt, 1 frase>",
  "concerns": []
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
  let parsed: {
    suggestedPrompt?: string;
    reasoning?: string;
    observed?: string;
    dynamicElement?: string;
    concerns?: string[];
  };
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
    observed: parsed.observed ?? "",
    dynamicElement: parsed.dynamicElement ?? "",
    concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
  });
}
