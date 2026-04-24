import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { buildCourseContext, renderSystemPrompt } from "@/lib/course-context";
import { loadQaExtras } from "@/lib/qa-extras";

/**
 * POST /api/courses/ask
 *   body: { courseSlug, moduleNumber, sublessonLetter?, question }
 *   - valida autenticacao via Supabase
 *   - monta contexto do modulo (3 scripts + manual + caderno)
 *   - envia ao Claude com prompt caching (ephemeral 1h)
 *   - persiste pergunta + resposta em escola_questions
 *   - devolve { answer, usage }
 *
 * GET /api/courses/ask?courseSlug=...&moduleNumber=...
 *   - devolve historico da aluna para esse modulo
 */

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;
const MAX_HISTORY_TURNS = 12;

async function isSubscribed(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", userId)
    .maybeSingle();
  return data?.subscription_status === "active";
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY nao configurada no servidor." },
      { status: 500 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
  }

  let body: { courseSlug?: string; moduleNumber?: number; sublessonLetter?: string; question?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido." }, { status: 400 });
  }

  const { courseSlug, moduleNumber, sublessonLetter, question } = body;
  if (!courseSlug || typeof moduleNumber !== "number" || !question) {
    return NextResponse.json(
      { erro: "courseSlug, moduleNumber, question obrigatorios." },
      { status: 400 },
    );
  }

  // Gate: acesso livre ao modulo 1, resto requer subscricao
  if (moduleNumber > 1) {
    const subbed = await isSubscribed(user.id);
    if (!subbed) {
      return NextResponse.json(
        { erro: "Modulo fora do plano gratuito." },
        { status: 403 },
      );
    }
  }

  const ctx = buildCourseContext(courseSlug, moduleNumber);
  if (!ctx) {
    return NextResponse.json(
      { erro: "Curso ou modulo sem conteudo disponivel." },
      { status: 404 },
    );
  }

  const extraInstructions = await loadQaExtras().catch(() => "");
  const systemPrompt = renderSystemPrompt(ctx, { extraInstructions });

  const { data: history } = await supabase
    .from("escola_questions")
    .select("role, content")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .eq("module_number", moduleNumber)
    .order("created_at", { ascending: true })
    .limit(MAX_HISTORY_TURNS);

  type Msg = { role: "user" | "assistant"; content: string };
  const messages: Msg[] = [
    ...((history ?? []) as Msg[]).map((h) => ({ role: h.role, content: h.content })),
    { role: "user" as const, content: question },
  ];

  const client = new Anthropic({ apiKey });

  let response;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral", ttl: "1h" },
        },
      ],
      messages,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Claude: ${msg}` }, { status: 502 });
  }

  const answer = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  if (!answer) {
    return NextResponse.json({ erro: "Resposta vazia do modelo." }, { status: 502 });
  }

  const usage = {
    input: response.usage.input_tokens,
    output: response.usage.output_tokens,
    cache_read: response.usage.cache_read_input_tokens ?? 0,
    cache_write: response.usage.cache_creation_input_tokens ?? 0,
  };

  await supabase.from("escola_questions").insert([
    {
      user_id: user.id,
      course_slug: courseSlug,
      module_number: moduleNumber,
      sublesson_letter: sublessonLetter ?? null,
      role: "user",
      content: question,
    },
    {
      user_id: user.id,
      course_slug: courseSlug,
      module_number: moduleNumber,
      sublesson_letter: sublessonLetter ?? null,
      role: "assistant",
      content: answer,
      model: MODEL,
      usage,
    },
  ]);

  return NextResponse.json({ answer, usage });
}

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Nao autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const courseSlug = searchParams.get("courseSlug");
  const moduleNumberRaw = searchParams.get("moduleNumber");
  if (!courseSlug || !moduleNumberRaw) {
    return NextResponse.json(
      { erro: "courseSlug e moduleNumber obrigatorios." },
      { status: 400 },
    );
  }

  const moduleNumber = parseInt(moduleNumberRaw, 10);
  if (Number.isNaN(moduleNumber)) {
    return NextResponse.json({ erro: "moduleNumber invalido." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("escola_questions")
    .select("id, role, content, sublesson_letter, created_at")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .eq("module_number", moduleNumber)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data ?? [] });
}
