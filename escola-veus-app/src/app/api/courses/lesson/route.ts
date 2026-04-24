import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";

/**
 * GET /api/courses/lesson?slug=xxx&module=1&sub=A
 * Returns a signed URL for the lesson video.
 *
 * Video lookup:
 *   1. Novo pipeline Mock B: `course-assets/curso-{slug}/videos/m{N}-{letter}.mp4`
 *      (publico, URL directa sem signing)
 *   2. Fallback legacy: `course-videos/{slug}/m{module}/{sub}.mp4`
 *      (privado, signed URL 2h)
 *   3. Sem ficheiro: { url: null, message: "Video em producao" }
 *
 * Access rules:
 * - Module 1 (is_free): requires login only
 * - Modules 2+: requires enrollment
 * - Admin: bypasses all gates
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const moduleNum = searchParams.get("module");
  const sub = searchParams.get("sub");

  if (!slug || !moduleNum || !sub) {
    return NextResponse.json(
      { error: "Parâmetros em falta" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin === true;
  const modNum = parseInt(moduleNum, 10);

  // For non-free modules, check enrollment
  if (modNum > 1 && !isAdmin) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", slug)
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json(
        { error: "Não inscrito neste curso" },
        { status: 403 }
      );
    }
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ url: null, message: "Vídeo em produção" });
  }

  const subLower = sub.toLowerCase();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // 1) Novo pipeline: course-assets/curso-<slug>/videos/m<N>-<letter>.mp4
  const mockBPath = `curso-${slug}/videos/m${moduleNum}-${subLower}.mp4`;
  const mockBUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${mockBPath}`;
  try {
    const head = await fetch(mockBUrl, { method: "HEAD", cache: "no-store" });
    if (head.ok) {
      return NextResponse.json({ url: mockBUrl, source: "mock-b" });
    }
  } catch {
    // fall through to legacy
  }

  // 2) Legacy: course-videos/{slug}/m{module}/{sub}.mp4
  const legacyPath = `courses/${slug}/m${moduleNum}/${subLower}.mp4`;
  const { data: signedUrl, error } = await admin.storage
    .from("course-videos")
    .createSignedUrl(legacyPath, 7200);

  if (error || !signedUrl) {
    return NextResponse.json({ url: null, message: "Vídeo em produção" });
  }

  return NextResponse.json({ url: signedUrl.signedUrl, source: "legacy" });
}
