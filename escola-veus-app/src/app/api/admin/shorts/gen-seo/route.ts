import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  genSeoPackage,
  hashtagsInstruction,
  SHARED_SYSTEM_PROMPT,
} from "@/lib/seo/gen-seo-core";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/shorts/gen-seo
 *
 * Gera SEO YouTube para um Short vertical (≤60s, 1080x1920) renderizado
 * pelo render-short.mjs. Inclui obrigatoriamente #Shorts.
 *
 * Stateless — sem persistência. UI chama antes do render-short-submit e
 * passa o resultado no manifest (campo `seo`), que o render grava como
 * companion file <slug>-<ts>-seo.json em Supabase.
 *
 * Body: {
 *   titulo: string,           // ex: "A culpa que chega antes da compra"
 *   tema?: string,
 *   script: string,           // texto do short (≤60s narrado → 200-300 palavras)
 *   serie?: string            // ex: "Trinta Manhãs"
 * }
 * Returns: { seo: { postTitle, description, hashtags } }
 */

type Body = {
  titulo?: string;
  tema?: string;
  script?: string;
  serie?: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "ANTHROPIC_API_KEY não configurada" }, { status: 500 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const titulo = (body.titulo || "").trim();
  const script = (body.script || "").trim();
  if (!titulo) {
    return NextResponse.json({ erro: "titulo obrigatório" }, { status: 400 });
  }
  if (!script || script.length < 30) {
    return NextResponse.json({ erro: "script obrigatório (mín 30 chars)" }, { status: 400 });
  }
  const serie = (body.serie || "").trim();

  const hashtagBlock = hashtagsInstruction({
    totalCount: "8-10",
    discoveryCount: "3",
    thematicCount: "2-3",
    moodCount: "1-2",
    extraBrand: ["Shorts"], // obrigatório para YouTube Shorts
  });

  const userMessage =
    `Cria pacote SEO YouTube para um SHORT VERTICAL (≤60s, 1080x1920) do canal "Escola dos ` +
    `Véus" (Vivianne dos Santos, autora portuguesa). Audiência: mulheres 30-65 anos.\n\n` +
    `Formato: Short vertical YouTube — primeiros 2 segundos têm de prender, descrição tem de ` +
    `ser curta (Shorts feed mostra só ~150 chars), #Shorts hashtag OBRIGATÓRIO.\n\n` +
    `Estilo: NUNCA clickbait barato, mas pode ser mais direto que long-form. Voz da Vivianne ` +
    `— íntima, contemplativa, dignificante. Português europeu (PT-PT, não BR).\n\n` +
    `Devolve JSON com:\n\n` +
    `1. postTitle (≤60 chars idealmente — Shorts no mobile cortam cedo; ≤100 chars máximo): ` +
    `título do Short.\n` +
    `   - Hook-first: começa pela frase mais nomeadora do script. Ex: "A culpa que chega ` +
    `antes da compra". NUNCA "Neste short" / "Hoje quero falar".\n` +
    `   - Pode incluir #Shorts NO FIM se ainda houver espaço (≤60 chars total). Se não, ` +
    `omite — já vai na descrição e nas hashtags.\n` +
    `   - NUNCA termina com pipe + nome do canal.\n` +
    `${serie ? `   - ${serie} é a série — podes mencionar implicitamente mas SEM ser ` +
      `"${serie}: " no início. Mantém o título focado na frase do conteúdo.\n` : ""}\n` +
    `2. description (TEXTO SIMPLES, 1-2 parágrafos curtos. Os primeiros 100 chars são o ` +
    `que o YouTube indexa com peso máximo):\n` +
    `   - Parágrafo 1 (≤150 chars): UMA frase forte do script + 1 frase de enquadramento. ` +
    `Inclui keywords (culpa, vergonha, heran[ç/c]a, mulher, etc.) que façam sentido ao tema.\n` +
    `   - Parágrafo 2 (opcional, ≤100 chars): "${serie ? `Da série ${serie}. ` : ""}Vídeo ` +
    `completo no canal." (ou variação). NÃO repetir hashtags aqui — vão no array.\n\n` +
    `3. ${hashtagBlock}\n\n` +
    `TÍTULO original: "${titulo}"\n` +
    `TEMA: "${body.tema ?? "(não declarado)"}"\n` +
    `${serie ? `SÉRIE: "${serie}"\n` : ""}\n` +
    `SCRIPT completo:\n${script.slice(0, 2000)}`;

  try {
    const seo = await genSeoPackage({
      apiKey,
      systemPrompt: SHARED_SYSTEM_PROMPT,
      userPrompt: userMessage,
      maxTokens: 2000, // shorts SEO é mais curto
    });
    return NextResponse.json({ seo });
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      const err = e as unknown as {
        status?: number;
        message?: string;
        type?: string;
        request_id?: string;
      };
      return NextResponse.json(
        {
          erro: `Anthropic ${err.status}${err.type ? ` (${err.type})` : ""}: ${err.message}`,
          requestId: err.request_id,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
