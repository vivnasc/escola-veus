/**
 * GET /api/courses/certificate?slug=<slug>
 *   Devolve PDF do certificado da aluna logada.
 *
 * GET /api/courses/certificate?slug=<slug>&preview=admin
 *   Modo preview: admin gera PDF de exemplo sem precisar de completar curso.
 *   Codigo de exemplo VEU-PREVIEW.
 */

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import * as React from "react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CertificatePDF } from "@/lib/pdf/certificate-template";
import { ensureCormorantRegistered, getCormorantRegisterError } from "@/lib/pdf/fonts";
import { getCourseBySlug } from "@/data/courses";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const preview = request.nextUrl.searchParams.get("preview");

  if (!slug) {
    return NextResponse.json(
      { error: "slug obrigatório" },
      { status: 400 }
    );
  }

  const course = getCourseBySlug(slug);
  if (!course) {
    return NextResponse.json(
      { error: "Curso não encontrado" },
      { status: 404 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  // Admin preview mode — não precisa de auth (mesmo padrão do manual route)
  if (preview === "admin") {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY em falta" },
        { status: 500 }
      );
    }
    return generatePdf({
      studentName: "Aluna de Exemplo",
      courseTitle: course.title,
      courseSubtitle: course.subtitle,
      completedDate: new Date().toLocaleDateString("pt-PT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      certificateCode: "VEU-PREVIEW",
      verifyUrl: `${baseUrl}/verificar/VEU-PREVIEW`,
      filename: `Certificado-PREVIEW-${slug}.pdf`,
      inline: true,
    });
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

  // Modo real: aluna que completou
  const { data: cert } = await supabase
    .from("escola_certificates")
    .select("certificate_code, created_at")
    .eq("user_id", user.id)
    .eq("course_slug", slug)
    .maybeSingle();

  if (!cert) {
    return NextResponse.json(
      { error: "Curso ainda não concluído" },
      { status: 404 }
    );
  }

  const studentName =
    user.user_metadata?.full_name || user.email || "Aluna";

  return generatePdf({
    studentName,
    courseTitle: course.title,
    courseSubtitle: course.subtitle,
    completedDate: new Date(cert.created_at).toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    certificateCode: cert.certificate_code,
    verifyUrl: `${baseUrl}/verificar/${cert.certificate_code}`,
    filename: `Certificado-${course.title.replace(/\s+/g, "-")}-${studentName.replace(/\s+/g, "-")}.pdf`,
  });
}

async function generatePdf(opts: {
  studentName: string;
  courseTitle: string;
  courseSubtitle?: string;
  completedDate: string;
  certificateCode: string;
  verifyUrl: string;
  filename: string;
  inline?: boolean;
}) {
  try {
    ensureCormorantRegistered();
    const fontErr = getCormorantRegisterError();
    if (fontErr) {
      return NextResponse.json(
        { error: "Cormorant nao bundlou", ...fontErr },
        { status: 500 }
      );
    }

    const element = React.createElement(CertificatePDF, {
      studentName: opts.studentName,
      courseTitle: opts.courseTitle,
      courseSubtitle: opts.courseSubtitle,
      completedDate: opts.completedDate,
      certificateCode: opts.certificateCode,
      verifyUrl: opts.verifyUrl,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);

    const disposition = opts.inline ? "inline" : "attachment";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${opts.filename}"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[certificate] render failed:", err);
    return NextResponse.json(
      { error: "PDF render falhou", message, stack },
      { status: 500 }
    );
  }
}
