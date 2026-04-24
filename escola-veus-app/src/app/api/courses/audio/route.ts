import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server";

/**
 * GET /api/courses/audio?slug=xxx&module=1&sub=A
 *
 * Devolve URL do audio "podcast" da sub-aula (entrega a parte do video).
 * Ficheiros gerados via /admin/producao/audios em course-assets/curso-<slug>/
 * com prefixo m<N>-<letter>-<slug-do-titulo>-<timestamp>.mp3.
 *
 * Acesso: modulo 1 grátis (login basta), modulos 2+ requerem enrollment.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const moduleNumRaw = searchParams.get("module");
  const sub = searchParams.get("sub");

  if (!slug || !moduleNumRaw || !sub) {
    return NextResponse.json({ error: "Parametros em falta" }, { status: 400 });
  }

  const modNum = parseInt(moduleNumRaw, 10);
  if (Number.isNaN(modNum)) {
    return NextResponse.json({ error: "module invalido" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.is_admin === true;

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
        { status: 403 },
      );
    }
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ url: null, message: "Supabase admin nao configurado" });
  }

  const folder = `curso-${slug}`;
  const prefix = `m${modNum}-${sub.toLowerCase()}-`;

  const { data: files, error: listError } = await admin.storage
    .from("course-assets")
    .list(folder, { limit: 1000 });

  if (listError || !files) {
    return NextResponse.json({ url: null, message: "Audio em producao" });
  }

  const match = files.find(
    (f) => f.name.toLowerCase().startsWith(prefix) && f.name.toLowerCase().endsWith(".mp3"),
  );
  if (!match) {
    return NextResponse.json({ url: null, message: "Audio em producao" });
  }

  const filePath = `${folder}/${match.name}`;
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://tdytdamtfillqyklgrmb.supabase.co";
  const url = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;

  return NextResponse.json({ url, filename: match.name });
}
