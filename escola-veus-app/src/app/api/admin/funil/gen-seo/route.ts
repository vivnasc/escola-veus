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
 * POST /api/admin/funil/gen-seo
 *
 * Gera SEO YouTube para um vídeo de funil (formato Nomear: 1-3 min,
 * horizontal 1280x720, narração contemplativa + clips visuais).
 *
 * Stateless — sem persistência. UI chama antes do render-submit e inclui o
 * resultado no manifest (ou copia para o YouTube Studio manualmente).
 *
 * Body: {
 *   titulo: string,           // ex: "A culpa que chega antes da compra"
 *   tema?: string,            // ex: "ouro-proprio"
 *   script: string,           // texto completo do script (sem tags [pause])
 *   episodeNumber?: number    // ex: 1 → adiciona "ep01 · " ao título YouTube
 * }
 * Returns: { seo: { postTitle, description, hashtags } }
 */

type Body = {
  titulo?: string;
  tema?: string;
  script?: string;
  episodeNumber?: number;
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
  if (!script || script.length < 50) {
    return NextResponse.json({ erro: "script obrigatório (mín 50 chars)" }, { status: 400 });
  }
  const ep =
    typeof body.episodeNumber === "number" && body.episodeNumber > 0
      ? `ep${String(body.episodeNumber).padStart(2, "0")}`
      : null;

  const hashtagBlock = hashtagsInstruction({
    totalCount: "10-12",
    discoveryCount: "3-4",
    thematicCount: "3-4",
    moodCount: "2",
  });

  const userMessage =
    `Cria pacote SEO YouTube para um vídeo CURTO HORIZONTAL (1-3 min) da série "Nomear" no ` +
    `canal "Escola dos Véus" (Vivianne dos Santos, autora portuguesa). Audiência: mulheres ` +
    `30-65 anos, em busca de reflexão sobre herança feminina, culpa pré-verbal, vergonha ` +
    `doméstica, dinheiro como prova de amor, silêncio entre gerações.\n\n` +
    `Formato: narração contemplativa única, clips visuais lentos, sem cortes rápidos. NÃO ` +
    `é YouTube Shorts (não é vertical). É um vídeo curto contemplativo no feed normal do ` +
    `YouTube.\n\n` +
    `Estilo: NUNCA clickbait. Voz da Vivianne — íntima, contemplativa, dignificante. ` +
    `Português europeu (PT-PT, não BR).\n\n` +
    `Devolve JSON com:\n\n` +
    `1. postTitle (≤80 chars idealmente, ≤100 chars máximo): título YouTube.\n` +
    `   - ${ep ? `OBRIGATÓRIO começar com "${ep} · "` : `Sem prefixo de episódio`}\n` +
    `   - Depois do prefixo, usa o TÍTULO ORIGINAL (em baixo) tal qual, OU uma variação ` +
    `próxima que mantenha as keywords. O título original já está calibrado.\n` +
    `   - NUNCA termina com pipe + nome do canal ("| Escola dos Véus" ou "| Nomear"). ` +
    `YouTube já mostra o canal por baixo do título; o pipe come caracteres visíveis no mobile.\n\n` +
    `2. description (TEXTO SIMPLES — YouTube não renderiza markdown, asteriscos aparecem ` +
    `literalmente. 3-4 parágrafos separados por linha em branco):\n` +
    `   - Parágrafo 1: 2-3 frases que CITAM 2-3 linhas do próprio script (escolhidas pelas ` +
    `mais nomeadoras), seguidas duma frase que enquadra o tema. Os primeiros 100 chars são ` +
    `o que o YouTube indexa com peso máximo — inclui keywords (culpa, vergonha, heran[ç/c]a, ` +
    `dinheiro, mulher, etc.) que façam sentido ao tema.\n` +
    `   - Parágrafo 2: 1 frase sobre a série "Nomear" + 1 convite a subscreverem ` +
    `(não-agressivo). Ex: "Esta é a série Nomear da Escola dos Véus — cada vídeo nomeia uma ` +
    `frase que o teu corpo já sabia. Se isto te nomeou alguma coisa, subscreve."\n` +
    `   - Parágrafo 3: bloco "Também no canal:" seguido de 3 linhas com placeholders no ` +
    `formato exacto:\n` +
    `       Também no canal:\n` +
    `       » [[EP_ANTERIOR]]\n` +
    `       » [[EP_RELACIONADO]]\n` +
    `       » [[TRAILER]]\n` +
    `     A Vivianne preenche os placeholders à mão com os títulos + URLs reais antes de ` +
    `publicar. Mantém EXACTAMENTE este formato [[NOME]] para grep fácil.\n` +
    `   - Parágrafo 4: créditos numa linha: "Música: Ancient Ground · Voz: ElevenLabs · ` +
    `Imagens: Midjourney."\n\n` +
    `3. ${hashtagBlock}\n\n` +
    `TÍTULO original: "${titulo}"\n` +
    `TEMA: "${body.tema ?? "(não declarado)"}"\n` +
    `${ep ? `EPISÓDIO: ${ep}\n` : ""}\n` +
    `SCRIPT completo:\n${script.slice(0, 4000)}`;

  try {
    const seo = await genSeoPackage({
      apiKey,
      systemPrompt: SHARED_SYSTEM_PROMPT,
      userPrompt: userMessage,
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
