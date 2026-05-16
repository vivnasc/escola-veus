import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;
export const runtime = "nodejs";

/**
 * Persistência dos rascunhos de motion prompt + selecção de prompt MJ
 * por imagem na pipeline Runway de "Hoje, em Mim". Garante que as
 * sugestões do Claude review não se perdem quando a utilizadora muda
 * de tab, faz F5, ou volta noutro device.
 *
 * Path: course-assets/hoje-em-mim-meta/motion-prompts.json
 * Shape:
 *   {
 *     motions: Record<imageName, runwayMotionPrompt>,
 *     prompts: Record<imageName, mjPromptId>,
 *     durations: Record<imageName, 5 | 10>,
 *     updatedAt: ISO
 *   }
 */

const PATH = "hoje-em-mim-meta/motion-prompts.json";

function cfg() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return { supabaseUrl, serviceKey };
}

export async function GET() {
  const c = cfg();
  if (!c) return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(c.supabaseUrl, c.serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.storage
    .from("course-assets")
    .download(PATH);
  if (error || !data) {
    return NextResponse.json({ motions: {}, prompts: {}, durations: {} });
  }
  try {
    const parsed = JSON.parse(await data.text());
    return NextResponse.json({
      motions: parsed.motions ?? {},
      prompts: parsed.prompts ?? {},
      durations: parsed.durations ?? {},
      updatedAt: parsed.updatedAt ?? null,
    });
  } catch {
    return NextResponse.json({ motions: {}, prompts: {}, durations: {} });
  }
}

export async function POST(req: NextRequest) {
  const c = cfg();
  if (!c) return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });

  let body: {
    motions?: Record<string, string>;
    prompts?: Record<string, string>;
    durations?: Record<string, number>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const motions =
    body.motions && typeof body.motions === "object" ? body.motions : {};
  const prompts =
    body.prompts && typeof body.prompts === "object" ? body.prompts : {};
  const durations =
    body.durations && typeof body.durations === "object" ? body.durations : {};

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(c.supabaseUrl, c.serviceKey, {
    auth: { persistSession: false },
  });

  const payload = JSON.stringify({
    motions,
    prompts,
    durations,
    updatedAt: new Date().toISOString(),
  });
  const { error } = await supabase.storage
    .from("course-assets")
    .upload(PATH, new Blob([payload], { type: "application/json" }), {
      contentType: "application/json",
      upsert: true,
    });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
