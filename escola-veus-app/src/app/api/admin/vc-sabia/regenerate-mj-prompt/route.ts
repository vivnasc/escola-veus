import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/regenerate-mj-prompt
 *
 * Pede ao Claude para gerar um novo prompt Midjourney para um motion vc-sabia,
 * focado em ESTÉTICA MANHÃ (lusófona, dourada, suave) e EVITANDO qualquer
 * referência nocturna (velas, lanternas, lua, escuro). Útil quando o prompt
 * determinista existente produziu uma cena nocturna por engano.
 *
 * Body: {
 *   theme: string,        // tema da frase (ex: "autoamor", "presenca")
 *   mood?: string,        // mood matinal (ex: "clareza", "acolher")
 *   currentPrompt?: string, // o prompt actual (para Claude variar)
 *   hint?: string         // instrução adicional opcional
 * }
 *
 * Returns: { prompt: string }
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "ANTHROPIC_API_KEY não configurada" }, { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    theme?: string;
    mood?: string;
    currentPrompt?: string;
    hint?: string;
  };

  const theme = (body.theme || "").trim();
  const mood = (body.mood || "").trim();
  const currentPrompt = (body.currentPrompt || "").trim();
  const hint = (body.hint || "").trim();

  if (!theme) {
    return NextResponse.json({ erro: "theme obrigatório" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const systemPrompt = `És o gerador oficial de prompts Midjourney para a vc-sabia da Vivianne dos Santos. Cada motion é uma imagem cinemática contemplativa de MANHÃ lusófona/moçambicana, paleta dourada/creme suave, sem pessoas, sem rostos, sem texto, sem logos.

REGRAS ABSOLUTAS:
- ESTÉTICA MANHÃ. NUNCA nocturna. PROIBIDO: candle, lantern, moon, moonlight, starlight, night, dark, midnight, nocturnal, dusk, twilight, evening, fire, ember.
- USA: golden hour morning light, soft dawn, first light, sunrise, sun rays, warm cream tones, dust particles in morning sun, breakfast light, awakening.
- Sem pessoas, sem rostos, sem mãos visíveis, sem texto, sem logos, sem watermarks.
- 1 frase em inglês, max ~30 palavras (sem contar o sufixo).
- Suffix obrigatório no fim: --ar 9:16 --style raw --stylize 200 --quality 1 --video

ESTRUTURA do prompt:
<sujeito específico relacionado ao tema/mood>, <atmosfera matinal>, soft golden morning light, cinematic film grain 35mm, muted cream gold tones, shallow depth of field, no people no faces no text no logos, gentle morning breath of motion, --ar 9:16 --style raw --stylize 200 --quality 1 --video`;

  const userMessage = `Tema: ${theme}
${mood ? `Mood: ${mood}` : ""}
${currentPrompt ? `Prompt actual (a SUBSTITUIR, gera diferente): ${currentPrompt}` : ""}
${hint ? `Instrução adicional: ${hint}` : ""}

Gera UM novo prompt Midjourney 9:16 com sufixo --video. Estética manhã, sem nada nocturno. Responde APENAS com o prompt, sem aspas, sem explicação.`;

  try {
    const res = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const block = res.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      return NextResponse.json({ erro: "Claude não devolveu texto" }, { status: 502 });
    }
    const prompt = block.text
      .trim()
      .replace(/^["']|["']$/g, "")
      .replace(/^Prompt:\s*/i, "")
      .trim();

    // Validação: bloqueia palavras nocturnas se aparecerem mesmo assim
    const forbidden = /\b(candle|lantern|moon|night|dark|midnight|nocturnal|dusk|twilight|evening|fire|ember|starlight)\b/i;
    if (forbidden.test(prompt)) {
      return NextResponse.json(
        { erro: `Prompt gerado tem palavra nocturna proibida. Tenta de novo. Prompt: ${prompt.slice(0, 200)}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ prompt, usage: res.usage });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Claude falhou: ${msg}` }, { status: 502 });
  }
}
