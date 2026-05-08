import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/longos/gen-seo
 *
 * Claude lê (titulo + tema + script) e gera SEO YouTube:
 *   - postTitle: título optimizado YouTube (≤100 chars, sem clickbait)
 *   - description: descrição com 3-4 parágrafos (intro + sobre o canal +
 *     CTA não-agressivo + créditos música/imagens)
 *   - hashtags: array de 8-12 hashtags relevantes
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

  const userMessage =
    `Cria pacote SEO YouTube para um vídeo long-form contemplativo do canal "Escola dos Véus" ` +
    `(Vivianne Nascimento, autora portuguesa). Audiência: mulheres entre 30-65 anos, em busca de ` +
    `reflexão sobre herança feminina, culpa pré-verbal, vergonha doméstica, dinheiro como prova ` +
    `de amor, silêncio entre gerações.\n\n` +
    `Estilo: NUNCA clickbait. Nunca "TENS DE VER", "SHOCKING", "VAI MUDAR A TUA VIDA". Voz da Vivianne — ` +
    `íntima, contemplativa, dignificante. Português europeu (PT-PT, não BR).\n\n` +
    `Devolve JSON com:\n` +
    `1. postTitle (≤100 chars): título YouTube. Sugere mistério ou nomeação, não promessa de resultado. ` +
    `Ex: "Há frases que o teu corpo já sabe de cor", "O peso de quem veio antes". Pode usar 2 pontos ` +
    `para subtítulo curto: "A culpa que herdaste : e como começar a devolvê-la".\n` +
    `2. description (markdown, 3-4 parágrafos):\n` +
    `   - Parágrafo 1: 2-3 frases sobre o vídeo, no tom da Vivianne. Não "neste vídeo" — descreve.\n` +
    `   - Parágrafo 2: sobre o canal "Escola dos Véus" (1 frase) + convite a inscreverem (não-agressivo).\n` +
    `   - Parágrafo 3: créditos breves (música: Ancient Ground; voz: ElevenLabs; imagens: Midjourney).\n` +
    `   - Parágrafo 4: timestamps dos capítulos se relevante (ou omitir).\n` +
    `3. hashtags (array 8-12): #escoladosveus + tags temáticas ` +
    `(ex: #herançafeminina, #contemplação, #dignidade, #presença, #silêncio, #PTpt). Sem # nem espaços ` +
    `nos itens — só a string da tag (a UI adiciona # depois).\n\n` +
    `TÍTULO original: "${proj.titulo}"\n` +
    `TEMA: "${proj.tema ?? "(não declarado)"}"\n\n` +
    `SCRIPT (excerto):\n${proj.script.slice(0, 4000)}`;

  const client = new Anthropic({ apiKey, maxRetries: 4 });

  let seo: { postTitle: string; description: string; hashtags: string[] };
  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system:
        "És copywriter da Vivianne Nascimento. Escreves SEO YouTube que respeita o tom contemplativo do canal — nunca clickbait, nunca promessa, sempre dignidade. Português europeu (PT-PT) sempre.",
      messages: [{ role: "user", content: userMessage }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              postTitle: { type: "string" },
              description: { type: "string" },
              hashtags: { type: "array", items: { type: "string" } },
            },
            required: ["postTitle", "description", "hashtags"],
            additionalProperties: false,
          },
        },
      },
    });
    const response = await stream.finalMessage();
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error(`Claude sem text block. stop_reason=${response.stop_reason}`);
    }
    seo = JSON.parse(textBlock.text);
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
