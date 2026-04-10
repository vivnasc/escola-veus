import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * POST /api/admin/courses/save-manifest
 *
 * Save production progress to Supabase storage (fixed path, always overwritten).
 * Used for auto-save so progress persists across devices.
 *
 * Body: { courseSlug, hookIndex, data: object }
 * Returns: { ok: true }
 */
export async function POST(req: NextRequest) {
  try {
    const { courseSlug, hookIndex, data } = await req.json();

    if (!courseSlug || hookIndex === undefined || !data) {
      return NextResponse.json(
        { erro: "courseSlug, hookIndex e data obrigatorios." },
        { status: 400 },
      );
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 400 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const payload = {
      ...data,
      courseSlug,
      hookIndex,
      savedAt: new Date().toISOString(),
    };

    // Fixed path — always overwritten so we can load it back
    const filePath = `courses/${courseSlug}/progress/hook-${hookIndex}.json`;
    const { error } = await supabase.storage
      .from("course-assets")
      .upload(
        filePath,
        new TextEncoder().encode(JSON.stringify(payload, null, 2)),
        { contentType: "application/json", upsert: true },
      );

    if (error) {
      return NextResponse.json({ erro: `Supabase: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

/**
 * GET /api/admin/courses/save-manifest?courseSlug=xxx&hookIndex=0
 *
 * Load saved production progress from Supabase.
 * Returns: { data } or { data: null } if not found.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseSlug = searchParams.get("courseSlug");
    const hookIndex = searchParams.get("hookIndex");

    if (!courseSlug || hookIndex === null) {
      return NextResponse.json({ erro: "courseSlug e hookIndex obrigatorios." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json({ data: null });
    }

    const filePath = `courses/${courseSlug}/progress/hook-${hookIndex}.json`;
    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ data: null });
    }

    const data = await res.json();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: null });
  }
}
