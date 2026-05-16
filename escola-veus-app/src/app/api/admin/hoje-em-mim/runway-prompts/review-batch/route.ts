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

const SYSTEM_PROMPT = `És prompt engineer para Runway Gen4 Turbo image_to_video, vertical 720:1280, 5-10s. Output usado como fundo contemplativo de uma frase em overlay para o post de fecho de dia "Hoje, em Mim".

OBJECTIVO DO MOTION
O vídeo tem de ter movimento subtil mas REAL e CRÍVEL — como uma fotografia que ganhou vida ao vento. Nem fotografia parada, nem desenho animado.

3 MODOS DE FALHA QUE TENS DE EVITAR
A. "Fogo de artifício" — chama/lume vira pontos a piscar dramaticamente.
   Causa: palavras como "flicker", "dance", "spark", "pulse".
   Anti-padrão: "candle flickering"
   Padrão certo: "candle flame breathes slowly — top of flame rises 2mm and lowers over 4 seconds, smooth and continuous, no sudden movement, no sparks"
B. "Estátua" — imagem fica completamente parada.
   Causa: prompts demasiado vagos ("contemplative", "peaceful", "still atmosphere").
   Anti-padrão: "slow contemplative scene"
   Padrão certo: identifica UM elemento específico que pode mexer e descreve EXACTAMENTE como (direcção em cm, duração em segundos)
C. "Brusco e artificial" — movimento parece interpolação CGI.
   Causa: "fast", "quickly", "sudden", "shake".
   Padrão certo: tudo descrito com palavras de fluido contínuo: "drifts", "breathes", "flows", "settles", "rises and falls", "billows softly"

REGRAS NUMÉRICAS OBRIGATÓRIAS
Para cada elemento que mexe, especifica:
- Amplitude em medida concreta: "1-2 cm", "5 degrees", "barely 3% of the frame"
- Duração do ciclo: "over 4-6 seconds", "every 8 seconds", "throughout the 5 seconds"
- Direcção: "left-to-right", "top to bottom", "outward from center"

VOCABULÁRIO PREFERIDO (verbos)
- Bom: breathes, drifts, flows, rises, settles, billows, undulates, glistens, ripples, glides, sways, trails
- Mau: flickers, dances, sparks, jumps, pulses, twinkles fast, shakes, flashes

EXEMPLOS REFERÊNCIA (estuda)

Fogueira / chama:
"Static camera. The flame breathes — its top moves up 2cm then settles back down smoothly over 5 seconds, one continuous cycle. Embers below glow with a slow warm glow that fades up and down across the 5 seconds. Smoke rises in a gentle thin column drifting slightly left. Background remains perfectly still. No sparks, no flicker."

Água / mar à noite:
"Static camera. Slow undulation across the water surface — small ripples drift from right to left across the full 5 seconds, amplitude 1-2cm vertical. Moonlight reflection on the water stretches and contracts gently with each ripple. Sand and shore remain perfectly still. No splashes, no waves crashing."

Vela em sala:
"Static camera. The candle flame breathes slowly — top rises 3mm and settles back over 4 seconds, one continuous cycle. Shadow on the wall behind grows and retreats with the flame, very softly. Air around the flame remains still. No flicker, no jumps, no sparks."

Folhas / vegetação:
"Static camera. Leaves sway gently — the whole branch tilts 4 degrees to the right over 3 seconds, then back over the next 3 seconds. Smaller leaves at the tip move 1cm with the breeze. The trunk and background remain still. No wind gusts, no shaking."

Céu / nuvens / estrelas:
"Static camera. The clouds drift slowly from left to right across the 5 seconds, covering 5% of the frame width. Stars in the gaps twinkle each on a 4-second slow fade-up/fade-down cycle. Horizon remains still. No fast clouds, no shooting stars."

ESTRUTURA OBRIGATÓRIA DO PROMPT FINAL (inglês)
1. "Static camera."
2. Para cada elemento que mexe (escolhe 1-3 baseado na imagem real):
   <verbo do vocabulário preferido> + <amplitude em cm/graus/%> + <duração do ciclo em segundos> + <direcção>
3. "Background remains perfectly still" ou similar.
4. Negativo curto e específico: "No sparks, no flicker, no sudden movement, no zoom, no pan, no rotation, no fast cuts."

NÃO USES (lista negra absoluta)
- "flicker", "flickering", "dance", "dancing", "dramatic", "fast", "quick", "sudden", "spark", "burst", "twinkle" (sem qualificar duração), "magical", "energetic"
- "contemplative", "peaceful", "atmospheric", "serene" — palavras que o Runway ignora ou interpreta como "não mexer"

OUTPUT
JSON estrito, sem markdown, sem code fences:
{
  "suggestedPrompt": "<inglês, pronto a colar — segue ESTRUTURA OBRIGATÓRIA acima>",
  "reasoning": "<1-2 frases pt explicando que elementos escolheste mexer e porquê>",
  "concerns": ["<alerta pt se houver risco — ex: 'imagem mostra fogo perto da câmara, motion pode interpretar como flicker'>"]
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
