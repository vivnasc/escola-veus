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
  concerns: string[];
};

type ResultEntry = Suggestion | { error: string };

const SYSTEM_PROMPT = `Geras motion prompts CURTOS para Runway Gen4 Turbo image_to_video (vertical 720:1280, 5-10s). Output para o post "Hoje, em Mim" (fundo contemplativo de uma frase em overlay).

REGRA DE OURO
Runway Gen4 Turbo reage MAL a prompts longos. Tens de produzir UMA frase, MÁXIMO 150 caracteres. O melhor prompt parece um título de documentário, não uma receita.

PRINCÍPIO DO TOM CONTEMPLATIVO
Contemplativo NÃO é câmara a mexer, é UM ELEMENTO DO AMBIENTE a mexer enquanto tudo o resto está parado. A câmara fica sempre estática (não escrevas "camera drift", "pan", "zoom").
O motion é da chama, da água, do fumo, da folha, do reflexo. Nunca da câmara.

CONFIRMADO EMPIRICAMENTE
A produção "longos" da mesma escola usa prompts curtos genéricos e funciona. Replica essa brevidade — mas para "Hoje, em Mim" o motion é do elemento do ambiente, NÃO da câmara.

ANTIPADRÕES (não fazer)
- Listar amplitudes em mm/cm/graus → vira CGI artificial
- Descrever motion por segundos → vira movimento robótico
- "flicker", "dance", "spark", "pulse" → fogo de artifício
- Lista negativa longa ("no zoom, no pan, no rotation…") → confunde mais do que ajuda

PADRÃO BOM
- 1 frase de 50-150 caracteres
- 1 verbo central de motion suave + qualificador "slow" ou "gentle"
- Câmara: implícita estática (não precisas escrever)
- Adjetivos atmosféricos OK: "ambient", "warm", "soft"

EXEMPLOS (estuda o tom)
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
  "reasoning": "<1 frase pt explicando porquê>",
  "concerns": []
}

Se a imagem não tem 1 elemento dinâmico claro, devolve: "ambient air moves softly, gentle natural motion of background elements, warm light".`;

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
