/**
 * API Route: Generate course manual PDF
 *
 * GET /api/courses/manual?slug=ouro-proprio
 *
 * Generates a personalised PDF manual with the student's name
 * in the footer as a license. Requires authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import * as React from "react";
import { createClient } from "@supabase/supabase-js";
import { ManualPDF } from "@/lib/pdf/manual-template";
import { OURO_PROPRIO_MANUAL } from "@/data/course-manuals/ouro-proprio";

const MANUALS: Record<string, typeof OURO_PROPRIO_MANUAL> = {
  "ouro-proprio": OURO_PROPRIO_MANUAL,
};

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const preview = req.nextUrl.searchParams.get("preview");

  if (!slug || !MANUALS[slug]) {
    return NextResponse.json(
      { error: "Curso nao encontrado" },
      { status: 404 }
    );
  }

  const manual = MANUALS[slug];

  // Preview mode: admin preview without auth (uses service key to verify)
  if (preview === "admin") {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        { error: "Configuracao em falta" },
        { status: 500 }
      );
    }

    const studentName = "Vivianne dos Santos (Preview)";

    const element = React.createElement(ManualPDF, { manual, studentName });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    const filename = `${manual.courseTitle.replace(/\s+/g, "-")}_Manual_PREVIEW.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  }

  // Auth: get user from Supabase cookies or Authorization header
  const authHeader = req.headers.get("authorization");
  let token = authHeader?.replace("Bearer ", "");

  // Try Supabase SSR cookies (format: sb-{ref}-auth-token)
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
    return NextResponse.json(
      { error: "Autenticacao necessaria. Usa ?preview=admin para preview." },
      { status: 401 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Sessao invalida. Usa ?preview=admin para preview." },
      { status: 401 }
    );
  }

  // Get profile for student name
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, is_admin, has_mirrors_access")
    .eq("id", user.id)
    .single();

  // Check access (admin bypasses)
  if (!profile?.is_admin && !profile?.has_mirrors_access) {
    return NextResponse.json(
      { error: "Sem acesso a este curso" },
      { status: 403 }
    );
  }

  const studentName = user.user_metadata?.full_name || user.email || "Aluna";

  // Generate PDF
  const element = React.createElement(ManualPDF, {
    manual,
    studentName,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);

  const filename = `${manual.courseTitle.replace(/\s+/g, "-")}_Manual_${studentName.replace(/\s+/g, "-")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
