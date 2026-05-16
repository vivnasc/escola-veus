import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/hoje-em-mim/runway-prompts/review-batch
 *
 * Pega um conjunto de pares { imageUrl, scene?, currentPrompt? } e
 * pede ao Claude vision para reescrever cada motion prompt baseado na
 * imagem real. Processa em paralelo em chunks de 5.
 *
 * Usar quando se acaba de carregar várias imagens MJ e se quer
 * reescrever todos os motion prompts de uma vez antes de submeter ao
 * Runway, em vez de gastar créditos a testar prompts maus.
 *
 * Body: {
 *   items: Array<{ id: string, imageUrl: string, scene?: string, currentPrompt?: string }>
 * }
 *
 * Returns: {
 *   results: Record<id, { suggestedPrompt, reasoning, concerns? } | { error }>,
 *   successCount: number,
 *   failedCount: number
 * }
 */

type Item = {
  id?: string;
  imageUrl?: string;
  scene?: string;
  currentPrompt?: string;
};

type Suggestion = {
  suggestedPrompt: string;
  reasoning: string;
  observed?: string;
  dynamicElement?: string;
  concerns: string[];
};

type ResultEntry = Suggestion | { error: string };

const SYSTEM_PROMPT = `Escreves motion prompts para Runway Gen4 Turbo image_to_video. Output para o post "Hoje, em Mim" — fundo contemplativo de uma frase em overlay.

PROCESSO OBRIGATÓRIO (faz cada passo no campo certo do JSON)

1. observed: o que vês especificamente nesta imagem. Lista 3-5 objectos concretos por nome (não 'cena bonita' — escreve 'vela em castiçal de cerâmica preta, parede de tijolo, sombra à direita'). Identifica o material / textura / direcção da luz / fonte da luz.

2. dynamicElement: dos objectos que viste, qual é o ÚNICO que pode ganhar motion natural? Escolhe um que tenha física natural (chama queima, água ondula, fumo sobe, sombra sai de objecto que se mexe, ar move textil/folha, luz pulsa em brasa). Se a imagem é só estática (e.g. mesa com objectos rígidos), escolhe a luz ambiente ou um pequeno detalhe (poeira no ar, vapor de algo quente).

3. suggestedPrompt: agora escreve o motion para ESSE elemento, em inglês, 1 frase. Não menciones a câmara (é estática). Não uses números. Tem de soar natural, não receita técnica. Verbos preferidos: breathes, drifts, flows, sways, settles, billows, undulates, ripples, glistens, glides. Verbos proibidos: flickers, dances, sparks, pulses, twinkles, flashes, jumps.

4. reasoning: 1 frase pt: porque escolheste esse elemento e não outro.

EXEMPLOS DE PARES (observed → suggestedPrompt)

Imagem de vela em sala escura:
observed: "Vela de cera amarela em prato pequeno preto, parede de pedra ao fundo, luz quente vinda da chama, sombras moles."
suggestedPrompt: "the candle flame breathes softly, casting a slow warm glow on the stone wall behind"

Imagem de água ao luar:
observed: "Superfície de água escura, lua a refletir vertical como uma coluna prateada, costa não visível, pequenas ondas mínimas."
suggestedPrompt: "moonlight ripples softly across the dark water surface, the silver column stretching and settling"

Imagem de incenso a fumegar:
observed: "Vareta de incenso espetada num suporte, fumo branco a subir em curva, fundo escuro com feixe de luz quente."
suggestedPrompt: "white incense smoke curls upward slowly in the warm beam of light, trailing into the dark"

Imagem de janela com cortina branca:
observed: "Cortina de linho branco aberta numa janela, luz suave azulada (luar) atrás, sombras das dobras na parede."
suggestedPrompt: "the linen curtain billows inward gently in the cool night air, soft folds moving with breath"

NUNCA devolvas algo genérico tipo "ambient warm light" ou "soft natural motion" — força-te a olhar para a imagem e a comprometer-te com o objecto que escolheste. Se hesitas, melhor escolher o detalhe MAIS SUBTIL da imagem (sombra a oscilar, reflexo a tremular).

OUTPUT — JSON estrito, sem markdown:
{
  "observed": "<descrição visual concreta da imagem, pt, 1-2 frases>",
  "dynamicElement": "<o elemento que escolheste mexer, pt>",
  "suggestedPrompt": "<inglês, 1 frase natural, sem números, sem mencionar câmara>",
  "reasoning": "<porque esse elemento, pt, 1 frase>",
  "concerns": []
}`;

async function reviewOne(
  client: Anthropic,
  item: { id: string; imageUrl: string; scene?: string; currentPrompt?: string },
): Promise<{ id: string; result: ResultEntry }> {
  // Download imagem
  let imageB64 = "";
  let mediaType: "image/png" | "image/jpeg" | "image/webp" = "image/jpeg";
  try {
    const r = await fetch(item.imageUrl);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const ct = r.headers.get("content-type") || "";
    if (ct.includes("png")) mediaType = "image/png";
    else if (ct.includes("webp")) mediaType = "image/webp";
    else mediaType = "image/jpeg";
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 8 * 1024 * 1024) {
      return { id: item.id, result: { error: "Imagem >8MB" } };
    }
    imageB64 = buf.toString("base64");
  } catch (e) {
    return {
      id: item.id,
      result: { error: `Imagem: ${e instanceof Error ? e.message : String(e)}` },
    };
  }

  const userText = [
    "Imagem para Runway Gen4 Turbo image_to_video, vertical 720:1280, 10s.",
    item.scene ? `Cena: ${item.scene}` : "",
    item.currentPrompt
      ? `Motion prompt actual: "${item.currentPrompt}". Revê ou substitui.`
      : "Sem prompt actual. Escreve do zero.",
    "Devolve só JSON.",
  ]
    .filter(Boolean)
    .join("\n");

  let raw = "";
  try {
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
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
    return {
      id: item.id,
      result: { error: `Claude: ${err instanceof Error ? err.message : String(err)}` },
    };
  }

  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  try {
    const parsed = JSON.parse(cleaned) as {
      suggestedPrompt?: string;
      reasoning?: string;
      observed?: string;
      dynamicElement?: string;
      concerns?: string[];
    };
    if (!parsed.suggestedPrompt) {
      return { id: item.id, result: { error: "Sem suggestedPrompt" } };
    }
    return {
      id: item.id,
      result: {
        suggestedPrompt: parsed.suggestedPrompt.trim(),
        reasoning: parsed.reasoning ?? "",
        observed: parsed.observed,
        dynamicElement: parsed.dynamicElement,
        concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
      },
    };
  } catch {
    return { id: item.id, result: { error: "JSON inválido do Claude" } };
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY não configurada" },
      { status: 503 }
    );
  }

  let body: { items?: Item[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const valid: Array<{ id: string; imageUrl: string; scene?: string; currentPrompt?: string }> = [];
  for (const it of items) {
    if (typeof it.id !== "string" || !it.id) continue;
    if (typeof it.imageUrl !== "string" || !it.imageUrl) continue;
    valid.push({
      id: it.id,
      imageUrl: it.imageUrl,
      scene: it.scene,
      currentPrompt: it.currentPrompt,
    });
  }
  if (valid.length === 0) {
    return NextResponse.json({ erro: "items vazio" }, { status: 400 });
  }
  if (valid.length > 30) {
    return NextResponse.json(
      { erro: "máximo 30 items por batch" },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey, maxRetries: 2 });
  const results: Record<string, ResultEntry> = {};
  let successCount = 0;
  let failedCount = 0;

  const CHUNK = 5;
  for (let i = 0; i < valid.length; i += CHUNK) {
    const chunk = valid.slice(i, i + CHUNK);
    const settled = await Promise.all(chunk.map((it) => reviewOne(client, it)));
    for (const r of settled) {
      results[r.id] = r.result;
      if ("error" in r.result) failedCount++;
      else successCount++;
    }
  }

  return NextResponse.json({ results, successCount, failedCount });
}
