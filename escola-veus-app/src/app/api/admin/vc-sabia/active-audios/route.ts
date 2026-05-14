import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;
export const runtime = "nodejs";

/**
 * Endpoint partilhado: mapping `mood -> audioUrl` (qual o audio activo
 * para cada um dos 8 moods). Guardado em
 *   course-assets/vc-sabia-meta/active-audios.json
 *
 * GET  -> { active: Record<MorningMood, audioUrl> }
 * POST -> body { active } sobrescreve
 *
 * Substitui o modelo antigo de weekly-audios.json (1 audio por dia da
 * semana). Agora 1 audio por mood, atribuido aos motions por tag.
 */

const PATH = "vc-sabia-meta/active-audios.json";

function cfg() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return { supabaseUrl, serviceKey };
}

export async function GET() {
  const c = cfg();
  if (!c) return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(c.supabaseUrl, c.serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.storage.from("course-assets").download(PATH);
  if (error) return NextResponse.json({ active: {} });
  try {
    const parsed = JSON.parse(await data.text());
    return NextResponse.json({ active: parsed.active ?? {} });
  } catch {
    return NextResponse.json({ active: {} });
  }
}

export async function POST(req: NextRequest) {
  const c = cfg();
  if (!c) return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }
  const active = (body as { active?: unknown })?.active;
  if (!active || typeof active !== "object") {
    return NextResponse.json({ erro: "active em falta" }, { status: 400 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(c.supabaseUrl, c.serviceKey, {
    auth: { persistSession: false },
  });

  const payload = JSON.stringify({ active, updatedAt: new Date().toISOString() });
  const { error } = await supabase.storage
    .from("course-assets")
    .upload(PATH, new Blob([payload], { type: "application/json" }), {
      contentType: "application/json",
      upsert: true,
    });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
