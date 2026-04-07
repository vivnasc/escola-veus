import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * POST /api/admin/courses/save-manifest
 *
 * Save or update a production manifest to Supabase storage.
 * Callable independently after replacing a single image, clip, or audio.
 *
 * Body: { courseSlug, sceneLabel, manifest: object }
 * Returns: { manifestUrl }
 */
export async function POST(req: NextRequest) {
  try {
    const { courseSlug, sceneLabel, manifest } = await req.json();

    if (!courseSlug || !sceneLabel || !manifest) {
      return NextResponse.json(
        { erro: "courseSlug, sceneLabel e manifest obrigatorios." },
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

    const manifestWithMeta = {
      ...manifest,
      courseSlug,
      sceneLabel,
      updatedAt: new Date().toISOString(),
    };

    const filePath = `courses/${courseSlug}/manifests/${sceneLabel}-${Date.now()}.json`;
    const { error } = await supabase.storage
      .from("course-assets")
      .upload(
        filePath,
        new TextEncoder().encode(JSON.stringify(manifestWithMeta, null, 2)),
        { contentType: "application/json", upsert: true },
      );

    if (error) {
      return NextResponse.json({ erro: `Supabase upload: ${error.message}` }, { status: 500 });
    }

    const manifestUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;

    return NextResponse.json({ manifestUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
