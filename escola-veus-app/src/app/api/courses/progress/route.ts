import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";
import { nanoid } from "nanoid";

/**
 * POST /api/courses/progress
 * Recalculates course progress and triggers certificate if 100%.
 *
 * Body: { courseSlug: string }
 */
export async function POST(request: NextRequest) {
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

  const { courseSlug } = await request.json();
  if (!courseSlug) {
    return NextResponse.json(
      { error: "courseSlug obrigatorio" },
      { status: 400 }
    );
  }

  // Count total lessons and completed lessons for this course
  let totalLessons = 0;
  let completedLessons = 0;

  try {
    const { getCourseBySlug } = await import("@/data/courses");
    const course = getCourseBySlug(courseSlug);
    if (!course) {
      return NextResponse.json(
        { error: "Curso nao encontrado" },
        { status: 404 }
      );
    }

    totalLessons = course.modules.reduce(
      (acc, m) => acc + m.subLessons.length,
      0
    );

    // Count completed in lesson_progress
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id, status")
      .eq("user_id", user.id)
      .like("lesson_id", `${courseSlug}-%`)
      .eq("status", "completed");

    completedLessons = progress?.length ?? 0;
  } catch {
    return NextResponse.json(
      { error: "Erro ao calcular progresso" },
      { status: 500 }
    );
  }

  const percentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // If 100%, generate certificate
  if (percentage === 100) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      // Check if already has completed_at
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id, completed_at, certificate_code")
        .eq("user_id", user.id)
        .eq("course_id", courseSlug)
        .maybeSingle();

      if (enrollment && !enrollment.completed_at) {
        const certCode =
          enrollment.certificate_code || `SV-${nanoid(8).toUpperCase()}`;

        await admin
          .from("enrollments")
          .update({
            completed_at: new Date().toISOString(),
            certificate_code: certCode,
          })
          .eq("id", enrollment.id);

        // Notify admin
        await admin.from("admin_notifications").insert({
          type: "general",
          title: "Curso concluido",
          message: `Utilizador completou o curso ${courseSlug}. Certificado: ${certCode}`,
          details: { user_id: user.id, course_slug: courseSlug, certificate_code: certCode },
        });
      }
    }
  }

  return NextResponse.json({
    totalLessons,
    completedLessons,
    percentage,
    completed: percentage === 100,
  });
}
