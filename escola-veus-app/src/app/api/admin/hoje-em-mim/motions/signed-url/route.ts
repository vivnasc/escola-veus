import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;
export const runtime = "nodejs";

/**
 * POST /api/admin/hoje-em-mim/motions/signed-url
 *
 * Devolve um signed upload URL para o Supabase Storage. O browser faz
 * PUT directo ao Supabase sem passar pelo Vercel serverless, evitando
 * o limite de 4.5 MB do payload.
 *
 * Body: { name: string, contentType?: string }
 * Returns: { signedUrl, token, publicUrl, path }
 */
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  let body: { name?: string; contentType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const rawName = (body.name || "").trim();
  if (!rawName) {
    return NextResponse.json({ erro: "name em falta" }, { status: 400 });
  }
  if (!/\.(mp4|webm|mov|m4v)$/i.test(rawName)) {
    return NextResponse.json(
      { erro: "Extensão tem de ser .mp4, .webm, .mov ou .m4v" },
      { status: 400 }
    );
  }

  const cleanName = rawName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  const filePath = `hoje-em-mim-motions/${cleanName}`;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.storage
    .from("course-assets")
    .createSignedUploadUrl(filePath);

  if (error || !data) {
    return NextResponse.json(
      { erro: `Signed URL: ${error?.message || "sem data"}` },
      { status: 500 }
    );
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: filePath,
    publicUrl,
    name: cleanName,
  });
}
