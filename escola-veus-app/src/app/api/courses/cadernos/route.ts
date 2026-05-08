/**
 * API Route: Generate cadernos preenchidos PDF
 *
 * GET /api/courses/cadernos?slug=ouro-proprio
 *   PDF com as reflexões da aluna logada (auth obrigatória).
 *
 * GET /api/courses/cadernos?slug=ouro-proprio&preview=admin
 *   Modo preview: PDF de exemplo sem auth e sem entradas — mostra a estrutura
 *   (perguntas + linhas em branco) tal como uma aluna que ainda nada escreveu
 *   verá. Útil para validar layout/conteúdo.
 */

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import * as React from "react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CadernosPDF } from "@/lib/pdf/cadernos-template";
import { ensureCormorantRegistered, getCormorantRegisterError } from "@/lib/pdf/fonts";
import { getCourseBySlug } from "@/data/courses";
import { getManual } from "@/data/course-manuals";

type JournalRow = {
  module_number: number;
  sublesson_letter: string;
  content: string;
  updated_at: string;
};

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const preview = req.nextUrl.searchParams.get("preview");
  if (!slug) {
    return NextResponse.json({ error: "Parâmetro slug obrigatório" }, { status: 400 });
  }
  const course = getCourseBySlug(slug);
  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
  }

  // Modo preview admin: sem auth, sem entradas — só estrutura.
  let studentName: string;
  let entries: JournalRow[];
  if (preview === "admin") {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY em falta" },
        { status: 500 }
      );
    }
    studentName = "Aluna de Exemplo";
    entries = [];
  } else {
    // Auth via Supabase SSR.
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Autenticação necessária. Usa ?preview=admin para preview." },
        { status: 401 }
      );
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

    studentName = user.user_metadata?.full_name || user.email || "Aluna";
    entries = (rows ?? []).filter((r) => (r.content ?? "").trim().length > 0);
  }

  try {
    ensureCormorantRegistered();
    const fontErr = getCormorantRegisterError();
    if (fontErr) {
      return NextResponse.json(
        { error: "Cormorant nao bundlou", ...fontErr },
        { status: 500 }
      );
    }
    const manual = getManual(slug);
    const element = React.createElement(CadernosPDF, { course, studentName, entries, manual });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);

    const filename = `${course.title.replace(/\s+/g, "-")}_Cadernos_${studentName.replace(/\s+/g, "-")}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // inline → abre no viewer do browser (Save no viewer descarrega)
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[cadernos] render failed:", err);
    return NextResponse.json(
      { error: "PDF render falhou", message, stack },
      { status: 500 }
    );
  }
}
