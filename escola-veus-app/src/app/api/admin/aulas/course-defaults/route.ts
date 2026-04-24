import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_VOLUMES, type Acto } from "@/lib/course-slides";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * GET  /api/admin/aulas/course-defaults?slug=ouro-proprio
 *   Retorna { agTrack, volumeDb } do curso. Se nunca foi guardado, retorna
 *   agTrack null e os volumes default.
 *
 * POST /api/admin/aulas/course-defaults
 *   Body: { slug, defaults: { agTrack?, volumeDb? } }
 *   Guarda em course-assets/admin/aulas-course-defaults/<slug>.json
 */

const BUCKET = "course-assets";

type CourseDefaults = {
  agTrack: string | null;
  volumeDb: Record<Acto, number>;
};

function path(slug: string) {
  return `admin/aulas-course-defaults/${slug}.json`;
}

function supabaseClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

function withDefaults(partial: Partial<CourseDefaults> | null): CourseDefaults {
  return {
    agTrack: partial?.agTrack ?? null,
    volumeDb: { ...DEFAULT_VOLUMES, ...(partial?.volumeDb ?? {}) },
  };
}

export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get("slug") ?? "").trim();
  if (!slug) {
    return NextResponse.json({ erro: "Param slug obrigatorio" }, { status: 400 });
  }

  const supabase = supabaseClient();
  if (!supabase) {
    return NextResponse.json({ defaults: withDefaults(null), fromSeed: true });
  }

  const { data, error } = await supabase.storage.from(BUCKET).download(path(slug));
  if (error || !data) {
    return NextResponse.json({ defaults: withDefaults(null), fromSeed: true });
  }

  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as Partial<CourseDefaults>;
    return NextResponse.json({ defaults: withDefaults(parsed), fromSeed: false });
  } catch {
    return NextResponse.json({ defaults: withDefaults(null), fromSeed: true });
  }
}

export async function POST(req: NextRequest) {
  let body: { slug?: string; defaults?: Partial<CourseDefaults> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON invalido" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim();
  if (!slug || !body.defaults) {
    return NextResponse.json({ erro: "slug/defaults obrigatorios" }, { status: 400 });
  }

  const supabase = supabaseClient();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const merged = withDefaults(body.defaults);
  const blob = new Blob([JSON.stringify(merged, null, 2)], { type: "application/json" });

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path(slug), blob, { upsert: true, contentType: "application/json" });

  if (error) {
    return NextResponse.json({ erro: `Supabase upload: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, defaults: merged });
}
