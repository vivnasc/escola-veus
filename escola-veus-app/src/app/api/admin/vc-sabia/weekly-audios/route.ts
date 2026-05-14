import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;
export const runtime = "nodejs";

/**
 * Endpoint partilhado para o mapping weekday -> audio do VC Sabia.
 *
 * Guarda um JSON em Supabase Storage:
 *   course-assets/vc-sabia-meta/weekly-audios.json
 *
 * GET  -> { audios: Partial<Record<Weekday, WeekdayAudio>> }
 * POST -> body { audios } sobrescreve o ficheiro
 *
 * Sobrevive a clear cache, mudanca de browser, mudanca de dispositivo.
 */

const PATH = "vc-sabia-meta/weekly-audios.json";

function client() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return { supabaseUrl, serviceKey };
}

export async function GET() {
  const cfg = client();
  if (!cfg) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(cfg.supabaseUrl, cfg.serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.storage
    .from("course-assets")
    .download(PATH);

  if (error) {
    // Primeiro uso. Devolve vazio em vez de 500.
    return NextResponse.json({ audios: {} });
  }

  try {
    const text = await data.text();
    const parsed = JSON.parse(text);
    return NextResponse.json({ audios: parsed.audios ?? {} });
  } catch {
    return NextResponse.json({ audios: {} });
  }
}

export async function POST(req: NextRequest) {
  const cfg = client();
  if (!cfg) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }
  const audios = (body as { audios?: unknown })?.audios;
  if (!audios || typeof audios !== "object") {
    return NextResponse.json({ erro: "audios em falta" }, { status: 400 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(cfg.supabaseUrl, cfg.serviceKey, {
    auth: { persistSession: false },
  });

  const payload = JSON.stringify({ audios, updatedAt: new Date().toISOString() });

  const { error } = await supabase.storage
    .from("course-assets")
    .upload(PATH, new Blob([payload], { type: "application/json" }), {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
