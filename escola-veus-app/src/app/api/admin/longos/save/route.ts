import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/longos/save
 *
 * Persiste um projecto long-form em Supabase admin/longos/<slug>.json.
 *
 * Body: { slug, titulo, tema, duracaoAlvo, thumbnailText, capitulos, script,
 *         prompts, narrationUrl?, videoUrl?, thumbnailUrl?, ... }
 *
 * Faz merge com o ficheiro existente se houver — só os campos passados
 * sobrescrevem (útil para guardar narrationUrl sem ter de re-passar tudo).
 */

const DIR = "admin/longos";

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const slug = String(body.slug || "").trim();
  if (!slug) {
    return NextResponse.json({ erro: "slug obrigatório" }, { status: 400 });
  }
  // Slug sanity (kebab-case alfanum, evita path traversal)
  if (!/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
    return NextResponse.json(
      { erro: "slug inválido (kebab-case alfanum, max 80 chars)" },
      { status: 400 },
    );
  }

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  // Merge com existente (se houver) para não perder campos que não vieram no patch.
  let existing: Record<string, unknown> = {};
  try {
    const { data } = await supabase.storage
      .from("course-assets")
      .download(`${DIR}/${slug}.json`);
    if (data) {
      try {
        existing = JSON.parse(await data.text());
      } catch {
        /* ignora corrupto */
      }
    }
  } catch {
    /* primeira vez */
  }

  const merged = {
    ...existing,
    ...body,
    slug,
    createdAt: existing.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(merged, null, 2);
  const { error } = await supabase.storage
    .from("course-assets")
    .upload(`${DIR}/${slug}.json`, json, {
      contentType: "application/json",
      upsert: true,
    });
  if (error) {
    return NextResponse.json({ erro: `Upload: ${error.message}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true, slug, project: merged });
}
