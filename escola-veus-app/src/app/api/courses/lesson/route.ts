import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";

/**
 * GET /api/courses/lesson?slug=xxx&module=1&sub=A
 * Returns a signed URL for the lesson video.
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
      { error: "Parametros em falta" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nao autenticado" },
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
        { error: "Nao inscrito neste curso" },
        { status: 403 }
      );
    }
  }

  // Generate signed URL from Supabase Storage
  // Videos stored as: courses/{slug}/m{module}/{sub}.mp4
  const filePath = `courses/${slug}/m${moduleNum}/${sub.toLowerCase()}.mp4`;

  const admin = createSupabaseAdminClient();
  if (!admin) {
    // Fallback: return empty URL (video not yet uploaded)
    return NextResponse.json({ url: null, message: "Video em producao" });
  }

  const { data: signedUrl, error } = await admin.storage
    .from("course-videos")
    .createSignedUrl(filePath, 7200); // 2 hours

  if (error || !signedUrl) {
    // Video file doesn't exist yet — not an error, just not uploaded
    return NextResponse.json({ url: null, message: "Video em producao" });
  }

  return NextResponse.json({ url: signedUrl.signedUrl });
}
