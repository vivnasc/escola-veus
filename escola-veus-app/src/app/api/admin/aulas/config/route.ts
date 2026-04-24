import { NextRequest, NextResponse } from "next/server";
import type { LessonConfig } from "@/lib/course-slides";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * GET  /api/admin/aulas/config?slug=ouro-proprio&module=1&sub=a
 *   Retorna o config editavel da sub-aula guardado em Supabase.
 *   Se nao existir, devolve um objecto vazio com fromSeed: true.
 *
 * POST /api/admin/aulas/config
 *   Body: { slug, module, sub, config: LessonConfig }
 *   Guarda em course-assets/admin/aulas-config/<slug>/m<N>-<letter>.json
 */

const BUCKET = "course-assets";

function configPath(slug: string, moduleNum: number, subLetter: string) {
  return `admin/aulas-config/${slug}/m${moduleNum}-${subLetter.toLowerCase()}.json`;
}

function supabaseClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

function parseCoords(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  const moduleStr = req.nextUrl.searchParams.get("module") ?? "";
  const sub = req.nextUrl.searchParams.get("sub") ?? "";
  const moduleNum = parseInt(moduleStr, 10);
  if (!slug || !sub || !Number.isFinite(moduleNum)) {
    return null;
  }
  return { slug, moduleNum, sub: sub.toLowerCase() };
}

export async function GET(req: NextRequest) {
  const coords = parseCoords(req);
  if (!coords) {
    return NextResponse.json({ erro: "Params: slug, module, sub" }, { status: 400 });
  }

  const supabase = supabaseClient();
  if (!supabase) {
    return NextResponse.json({ config: {}, fromSeed: true });
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(configPath(coords.slug, coords.moduleNum, coords.sub));

  if (error || !data) {
    return NextResponse.json({ config: {}, fromSeed: true });
  }

  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as LessonConfig;
    return NextResponse.json({ config: parsed, fromSeed: false });
  } catch {
    return NextResponse.json({ config: {}, fromSeed: true });
  }
}

export async function POST(req: NextRequest) {
  let body: {
    slug?: string;
    module?: number | string;
    sub?: string;
    config?: LessonConfig;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON invalido" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim();
  const moduleNum = Number(body.module);
  const sub = String(body.sub ?? "").toLowerCase();
  if (!slug || !sub || !Number.isFinite(moduleNum)) {
    return NextResponse.json({ erro: "slug/module/sub obrigatorios" }, { status: 400 });
  }
  if (!body.config || typeof body.config !== "object") {
    return NextResponse.json({ erro: "config obrigatorio" }, { status: 400 });
  }

  const supabase = supabaseClient();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const path = configPath(slug, moduleNum, sub);
  const blob = new Blob([JSON.stringify(body.config, null, 2)], { type: "application/json" });

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { upsert: true, contentType: "application/json" });

  if (error) {
    return NextResponse.json({ erro: `Supabase upload: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, path });
}
