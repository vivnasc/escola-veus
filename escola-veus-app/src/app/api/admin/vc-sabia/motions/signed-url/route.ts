import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/motions/signed-url
 *
 * Cria um signed upload URL para o cliente subir o ficheiro DIRECTO ao
 * Supabase Storage. Bypassa o limite de 4.5MB do body das serverless do
 * Vercel. Essencial para clips MP4 de 5-50MB.
 *
 * Body: { filename: string }
 * Returns: { signedUrl, path, token, publicUrl }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const filename: string = body?.filename;
    if (!filename || typeof filename !== "string") {
      return NextResponse.json({ erro: "filename em falta" }, { status: 400 });
    }
    if (!/\.(mp4|webm|mov)$/i.test(filename)) {
      return NextResponse.json(
        { erro: "Extensão tem de ser .mp4, .webm ou .mov" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
    }

    const cleanName = filename
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9.\-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);

    const path = `vc-sabia-motions/${cleanName}`;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // upsert: true → re-uploads sobrescrevem em vez de falhar com "already exists"
    const { data, error } = await supabase.storage
      .from("course-assets")
      .createSignedUploadUrl(path, { upsert: true });

    if (error || !data) {
      return NextResponse.json(
        { erro: `Supabase: ${error?.message || "sem data"}` },
        { status: 500 }
      );
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${path}`;

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path,
      publicUrl,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
