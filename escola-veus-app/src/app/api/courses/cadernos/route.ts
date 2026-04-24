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
import { createClient } from "@supabase/supabase-js";
import { CadernosPDF } from "@/lib/pdf/cadernos-template";
import { getCourseBySlug } from "@/data/courses";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Param slug obrigatorio" }, { status: 400 });
  }
  const course = getCourseBySlug(slug);
  if (!course) {
    return NextResponse.json({ error: "Curso nao encontrado" }, { status: 404 });
  }

  const authHeader = req.headers.get("authorization");
  let token = authHeader?.replace("Bearer ", "");
  if (!token) {
    for (const cookie of req.cookies.getAll()) {
      if (cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")) {
        try {
          const parsed = JSON.parse(cookie.value);
          token = parsed?.access_token || parsed?.[0]?.access_token;
        } catch {
          token = cookie.value;
        }
        if (token) break;
      }
    }
  }
  if (!token) {
    return NextResponse.json({ error: "Autenticacao necessaria" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sessao invalida" }, { status: 401 });
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
