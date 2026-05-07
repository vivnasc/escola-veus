/**
 * API Route: Generate cadernos preenchidos PDF
 *
 * GET /api/courses/cadernos?slug=ouro-proprio
 *
 * PDF com todas as reflexoes (pausa + caderno) que a aluna guardou ao longo
 * do curso. Les os rows de escola_journal filtrados por (user, course) e
 * agrupa por modulo.
 */

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import * as React from "react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CadernosPDF } from "@/lib/pdf/cadernos-template";
import { getCourseBySlug } from "@/data/courses";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Parâmetro slug obrigatório" }, { status: 400 });
  }
  const course = getCourseBySlug(slug);
  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
  }

  // Auth via Supabase SSR (lida com cookies chunked sb-<ref>-auth-token.0, .1).
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  const { data: rows, error: qErr } = await supabase
    .from("escola_journal")
    .select("module_number, sublesson_letter, content, updated_at")
    .eq("user_id", user.id)
    .eq("course_slug", slug)
    .order("module_number", { ascending: true });

  if (qErr) {
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }

  const studentName = user.user_metadata?.full_name || user.email || "Aluna";
  const entries = (rows ?? []).filter((r) => (r.content ?? "").trim().length > 0);

  const element = React.createElement(CadernosPDF, { course, studentName, entries });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);

  const filename = `${course.title.replace(/\s+/g, "-")}_Cadernos_${studentName.replace(/\s+/g, "-")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
