import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;
export const runtime = "nodejs";

/**
 * Mapping `motionName -> mood`. Indica que audio toca quando se usa
 * cada motion.
 *
 *   course-assets/vc-sabia-meta/motion-tags.json
 */

const PATH = "vc-sabia-meta/motion-tags.json";

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
  if (error) return NextResponse.json({ tags: {}, categories: {} });
  try {
    const parsed = JSON.parse(await data.text());
    return NextResponse.json({ tags: parsed.tags ?? {}, categories: parsed.categories ?? {} });
  } catch {
    return NextResponse.json({ tags: {}, categories: {} });
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
  const tags = (body as { tags?: unknown })?.tags;
  const categories = (body as { categories?: unknown })?.categories;
  if (!tags || typeof tags !== "object") {
    return NextResponse.json({ erro: "tags em falta" }, { status: 400 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(c.supabaseUrl, c.serviceKey, {
    auth: { persistSession: false },
  });

  const payload = JSON.stringify({
    tags,
    categories: categories && typeof categories === "object" ? categories : {},
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
