import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/prompts/runway-motion/save
 *
 * Guarda o JSON de motion prompts (Runway) em Supabase Storage.
 * Body: `{ prompts: Record<string, string> }`
 */

const PATH = "admin/runway-motion-prompts.json";

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  let body: { prompts?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON invalido" }, { status: 400 });
  }
  if (!body.prompts || typeof body.prompts !== "object") {
    return NextResponse.json({ erro: "prompts obrigatorio" }, { status: 400 });
  }

  const sb = supabase();
  if (!sb) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const json = JSON.stringify(body.prompts, null, 2);
  const { error } = await sb.storage
    .from("course-assets")
    .upload(PATH, json, { contentType: "application/json", upsert: true });
  if (error) {
    return NextResponse.json({ erro: `Upload: ${error.message}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: Object.keys(body.prompts).length });
}
