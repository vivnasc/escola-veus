import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";

/**
 * GET /api/courses/certificate?courseSlug=xxx
 * Returns certificate data for a completed course.
 * Used by the frontend to display/download the certificate.
 *
 * Returns: { certificate_code, course_title, course_subtitle, user_email, completed_at, verify_url }
 */
export async function GET(request: NextRequest) {
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

  const courseSlug = request.nextUrl.searchParams.get("courseSlug");
  if (!courseSlug) {
    return NextResponse.json(
      { error: "courseSlug obrigatorio" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Database nao configurada" },
      { status: 500 }
    );
  }

  // Get enrollment with course info
  const { data: enrollment } = await admin
    .from("enrollments")
    .select("certificate_code, completed_at, course_id")
    .eq("user_id", user.id)
    .eq("course_id", courseSlug)
    .maybeSingle();

  if (!enrollment || !enrollment.completed_at) {
    return NextResponse.json(
      { error: "Curso nao concluido" },
      { status: 404 }
    );
  }

  // Get course title
  const { getCourseBySlug } = await import("@/data/courses");
  const course = getCourseBySlug(courseSlug);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  return NextResponse.json({
    certificate_code: enrollment.certificate_code,
    course_title: course?.title || courseSlug,
    course_subtitle: course?.subtitle || "",
    user_email: user.email,
    completed_at: enrollment.completed_at,
    verify_url: `${baseUrl}/verificar/${enrollment.certificate_code}`,
  });
}

/**
 * POST /api/courses/certificate
 * Generates an SVG certificate for download.
 *
 * Body: { courseSlug: string }
 * Returns: SVG image
 */
export async function POST(request: NextRequest) {
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

  const { courseSlug } = await request.json();
  if (!courseSlug) {
    return NextResponse.json(
      { error: "courseSlug obrigatorio" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Database nao configurada" },
      { status: 500 }
    );
  }

  const { data: enrollment } = await admin
    .from("enrollments")
    .select("certificate_code, completed_at")
    .eq("user_id", user.id)
    .eq("course_id", courseSlug)
    .maybeSingle();

  if (!enrollment || !enrollment.completed_at) {
    return NextResponse.json(
      { error: "Curso nao concluido" },
      { status: 404 }
    );
  }

  const { getCourseBySlug } = await import("@/data/courses");
  const course = getCourseBySlug(courseSlug);
  const courseTitle = course?.title || courseSlug;
  const courseSubtitle = course?.subtitle || "";
  const completedDate = new Date(enrollment.completed_at).toLocaleDateString(
    "pt-PT",
    { year: "numeric", month: "long", day: "numeric" }
  );
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const verifyUrl = `${baseUrl}/verificar/${enrollment.certificate_code}`;

  // Generate SVG certificate
  const svg = generateCertificateSVG({
    courseTitle,
    courseSubtitle,
    userEmail: user.email || "",
    completedDate,
    certificateCode: enrollment.certificate_code,
    verifyUrl,
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="certificado-${courseSlug}.svg"`,
    },
  });
}

function generateCertificateSVG(opts: {
  courseTitle: string;
  courseSubtitle: string;
  userEmail: string;
  completedDate: string;
  certificateCode: string;
  verifyUrl: string;
}) {
  const { courseTitle, courseSubtitle, userEmail, completedDate, certificateCode, verifyUrl } = opts;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 842 595" width="842" height="595">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&amp;display=swap');
      .title { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; }
      .body { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 400; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="842" height="595" fill="#1A1A2E"/>

  <!-- Border -->
  <rect x="20" y="20" width="802" height="555" rx="4" fill="none" stroke="#C9A96E" stroke-width="1" opacity="0.4"/>
  <rect x="30" y="30" width="782" height="535" rx="4" fill="none" stroke="#C9A96E" stroke-width="0.5" opacity="0.2"/>

  <!-- Corner accents -->
  <circle cx="40" cy="40" r="3" fill="#C9A96E" opacity="0.5"/>
  <circle cx="802" cy="40" r="3" fill="#C9A96E" opacity="0.5"/>
  <circle cx="40" cy="555" r="3" fill="#C9A96E" opacity="0.5"/>
  <circle cx="802" cy="555" r="3" fill="#C9A96E" opacity="0.5"/>

  <!-- Top accent line -->
  <line x1="321" y1="100" x2="521" y2="100" stroke="#C9A96E" stroke-width="0.5" opacity="0.6"/>

  <!-- Brand -->
  <text x="421" y="85" text-anchor="middle" class="body" fill="#8B5CF6" font-size="14" opacity="0.8">
    SETE VEUS
  </text>

  <!-- Certificate label -->
  <text x="421" y="140" text-anchor="middle" class="body" fill="#C9A96E" font-size="12" letter-spacing="4">
    CERTIFICADO DE CONCLUSAO
  </text>

  <!-- Divider -->
  <line x1="321" y1="160" x2="521" y2="160" stroke="#C9A96E" stroke-width="0.5" opacity="0.6"/>

  <!-- "Certifica-se que" -->
  <text x="421" y="200" text-anchor="middle" class="body" fill="#a0a0b0" font-size="13">
    Certifica-se que
  </text>

  <!-- User email -->
  <text x="421" y="235" text-anchor="middle" class="title" fill="#FFFFFF" font-size="20">
    ${escapeXml(userEmail)}
  </text>

  <!-- "completou com sucesso" -->
  <text x="421" y="275" text-anchor="middle" class="body" fill="#a0a0b0" font-size="13">
    completou com sucesso o curso
  </text>

  <!-- Course title -->
  <text x="421" y="320" text-anchor="middle" class="title" fill="#C9A96E" font-size="28">
    ${escapeXml(courseTitle)}
  </text>

  <!-- Course subtitle -->
  <text x="421" y="350" text-anchor="middle" class="body" fill="#8B5CF6" font-size="14" opacity="0.9">
    ${escapeXml(courseSubtitle)}
  </text>

  <!-- Date -->
  <text x="421" y="400" text-anchor="middle" class="body" fill="#a0a0b0" font-size="12">
    ${escapeXml(completedDate)}
  </text>

  <!-- Signature area -->
  <line x1="291" y1="460" x2="551" y2="460" stroke="#C9A96E" stroke-width="0.5" opacity="0.4"/>
  <text x="421" y="480" text-anchor="middle" class="body" fill="#606070" font-size="11">
    Vivianne dos Santos — Autora e Facilitadora
  </text>

  <!-- Certificate code -->
  <text x="421" y="530" text-anchor="middle" class="body" fill="#606070" font-size="10">
    Codigo: ${escapeXml(certificateCode)}
  </text>

  <!-- Verify URL -->
  <text x="421" y="548" text-anchor="middle" class="body" fill="#606070" font-size="9" opacity="0.6">
    Verificar: ${escapeXml(verifyUrl)}
  </text>
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
