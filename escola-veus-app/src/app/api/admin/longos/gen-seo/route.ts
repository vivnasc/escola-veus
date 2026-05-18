import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import {
  genSeoPackage,
  hashtagsInstruction,
  SHARED_SYSTEM_PROMPT,
} from "@/lib/seo/gen-seo-core";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/longos/gen-seo
 *
 * Claude lê (titulo + tema + script) e gera SEO YouTube long-form:
 *   - postTitle: título optimizado YouTube (≤100 chars, sem clickbait)
 *   - description: descrição em texto simples com 4-5 parágrafos
 *     (intro · sobre o canal · "também no canal" placeholder · créditos · timestamps)
 *   - hashtags: array de 12-15 hashtags em 4 camadas
 *     (discovery alto volume + temática + mood + brand)
 *
 * Salva no projecto (project.seo) e o render.mjs grava companion file
 * <slug>-seo.json para upload posterior.
 *
 * Body: { slug, force? }  // force=true regenera mesmo se já existe
 * Returns: { seo: { postTitle, description, hashtags } }
 */

type Project = {
  titulo?: string;
  tema?: string;
  script?: string;
  seo?: {
    postTitle?: string;
    description?: string;
    hashtags?: string[];
  };
  [k: string]: unknown;
};

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "ANTHROPIC_API_KEY não configurada" }, { status: 500 });
  }

  let body: { slug?: string; force?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const slug = (body.slug || "").trim();
  const force = !!body.force;
  if (!slug || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
    return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
  }

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  let proj: Project;
  try {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .download(`admin/longos/${slug}.json`);
    if (error || !data) {
      return NextResponse.json({ erro: "Projecto não encontrado" }, { status: 404 });
    }
    proj = JSON.parse(await data.text()) as Project;
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  if (
    !force &&
    proj.seo?.postTitle &&
    proj.seo?.description &&
    Array.isArray(proj.seo?.hashtags) &&
    proj.seo.hashtags.length > 0
  ) {
    return NextResponse.json({
      seo: proj.seo,
      message: "SEO já existe (passa force=true para regenerar)",
    });
  }

  if (!proj.titulo || !proj.script) {
    return NextResponse.json({ erro: "Projecto sem título ou script" }, { status: 400 });
  }

  const hashtagBlock = hashtagsInstruction({
    totalCount: "12-15",
    discoveryCount: "4-5",
    thematicCount: "4-5",
    moodCount: "2-3",
  });

  const userMessage =
    `Cria pacote SEO YouTube para um vídeo LONG-FORM (15-25 min) contemplativo do canal ` +
    `"Escola dos Véus" (Vivianne dos Santos, autora portuguesa). Audiência: mulheres entre ` +
    `30-65 anos, em busca de reflexão sobre herança feminina, culpa pré-verbal, vergonha ` +
    `doméstica, dinheiro como prova de amor, silêncio entre gerações.\n\n` +
    `Estilo: NUNCA clickbait. Nunca "TENS DE VER", "SHOCKING", "VAI MUDAR A TUA VIDA". Voz da ` +
    `Vivianne — íntima, contemplativa, dignificante. Português europeu (PT-PT, não BR).\n\n` +
    `Devolve JSON com:\n\n` +
    `1. postTitle (≤100 chars): título YouTube. Sugere mistério ou nomeação, não promessa de ` +
    `resultado. Ex: "Há frases que o teu corpo já sabe de cor", "O peso de quem veio antes". ` +
    `Pode usar 2 pontos para subtítulo curto: "A culpa que herdaste : e como começar a ` +
    `devolvê-la". NUNCA termina com pipe + nome do canal ("| Escola dos Véus") — YouTube já ` +
    `mostra o canal por baixo do título; o pipe come caracteres visíveis no mobile e baixa CTR.\n\n` +
    `2. description (TEXTO SIMPLES — YouTube não renderiza markdown, asteriscos aparecem ` +
    `literalmente. 4-5 parágrafos separados por linha em branco):\n` +
    `   - Parágrafo 1: 2-3 frases sobre o vídeo, no tom da Vivianne. NÃO comeces com "Neste ` +
    `vídeo" — descreve diretamente. Inclui 2-3 keywords do tema (heran[ç/c]a, culpa, ` +
    `vergonha, etc.) — os primeiros 100 chars são o que o YouTube indexa com peso máximo.\n` +
    `   - Parágrafo 2: 1-2 frases sobre o canal "Escola dos Véus" + convite a subscreverem ` +
    `(não-agressivo: "Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.").\n` +
    `   - Parágrafo 3: bloco "Também no canal:" seguido de 3 linhas com placeholders no ` +
    `formato exacto:\n` +
    `       Também no canal:\n` +
    `       » [[EP_ANTERIOR]]\n` +
    `       » [[EP_RELACIONADO]]\n` +
    `       » [[TRAILER]]\n` +
    `     A Vivianne preenche os placeholders à mão com os títulos + URLs reais antes de ` +
    `publicar. Mantém os 3 placeholders com EXACTAMENTE este formato [[NOME]] para grep fácil.\n` +
    `   - Parágrafo 4: créditos breves em UMA linha: "Música: Ancient Ground · Voz: ` +
    `ElevenLabs · Imagens: Midjourney."\n` +
    `   - Parágrafo 5 (opcional, omitir se não fizer sentido): timestamps dos capítulos ` +
    `no formato "0:00 — Título do capítulo".\n\n` +
    `3. ${hashtagBlock}\n\n` +
    `TÍTULO original: "${proj.titulo}"\n` +
    `TEMA: "${proj.tema ?? "(não declarado)"}"\n\n` +
    `SCRIPT (excerto):\n${proj.script.slice(0, 4000)}`;

  let seo;
  try {
    seo = await genSeoPackage({
      apiKey,
      systemPrompt: SHARED_SYSTEM_PROMPT,
      userPrompt: userMessage,
    });
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

  // Patch projecto
  const updated = {
    ...proj,
    seo,
    updatedAt: new Date().toISOString(),
  };
  const { error: upErr } = await supabase.storage
    .from("course-assets")
    .upload(`admin/longos/${slug}.json`, JSON.stringify(updated, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (upErr) {
    return NextResponse.json(
      { erro: `Patch projecto: ${upErr.message}`, seo },
      { status: 500 },
    );
  }

  return NextResponse.json({ seo });
}
