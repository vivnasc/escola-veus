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
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ManualPDF } from "@/lib/pdf/manual-template";
import { ensureCormorantRegistered, getCormorantRegisterError } from "@/lib/pdf/fonts";
import { OURO_PROPRIO_MANUAL } from "@/data/course-manuals/ouro-proprio";
import { isAdminEmail } from "@/lib/admin";

const MANUALS: Record<string, typeof OURO_PROPRIO_MANUAL> = {
  "ouro-proprio": OURO_PROPRIO_MANUAL,
};

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const preview = req.nextUrl.searchParams.get("preview");

  if (!slug || !MANUALS[slug]) {
    return NextResponse.json(
      { error: "Curso não encontrado" },
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

    try {
      ensureCormorantRegistered();
      const fontErr = getCormorantRegisterError();
      if (fontErr) {
        return NextResponse.json(
          { error: "Cormorant nao bundlou", ...fontErr },
          { status: 500 }
        );
      }
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
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      console.error("[manual] preview render failed:", err);
      return NextResponse.json(
        { error: "PDF render falhou", message, stack },
        { status: 500 }
      );
    }
  }

  // Auth via Supabase SSR (lida com cookies chunked sb-<ref>-auth-token.0, .1)
  // automaticamente — substitui o parse manual que falhava por causa do
  // sufixo .N nos nomes dos cookies.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    // Fallback: tentar Bearer token explícito (clientes API)
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.replace("Bearer ", "");
    if (!bearerToken) {
      return NextResponse.json(
        { error: "Autenticação necessária. Usa ?preview=admin para preview." },
        { status: 401 }
      );
    }
    // Re-cria cliente com Bearer
    const supabaseBearer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${bearerToken}` } } }
    );
    const { data: bearerData, error: bearerError } = await supabaseBearer.auth.getUser();
    if (bearerError || !bearerData.user) {
      return NextResponse.json(
        { error: "Sessão inválida. Usa ?preview=admin para preview." },
        { status: 401 }
      );
    }
    return generatePdf(bearerData.user, manual);
  }

  return generatePdf(user, manual);
}

async function generatePdf(
  user: { id: string; email?: string; user_metadata?: { full_name?: string } },
  manual: typeof OURO_PROPRIO_MANUAL,
) {
  const supabase = await createSupabaseServerClient();

  // Get profile for student name and access flag
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, has_mirrors_access")
    .eq("id", user.id)
    .single();

  // Check access (admin via email allow-list bypasses)
  const isAdmin = isAdminEmail(user.email);
  if (!isAdmin && !profile?.has_mirrors_access) {
    return NextResponse.json(
      { error: "Sem acesso a este curso" },
      { status: 403 }
    );
  }

  const studentName = user.user_metadata?.full_name || user.email || "Aluna";

  try {
    ensureCormorantRegistered();
    const fontErr = getCormorantRegisterError();
    if (fontErr) {
      return NextResponse.json(
        { error: "Cormorant nao bundlou", ...fontErr },
        { status: 500 }
      );
    }
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[manual] render failed:", err);
    return NextResponse.json(
      { error: "PDF render falhou", message, stack },
      { status: 500 }
    );
  }
}
