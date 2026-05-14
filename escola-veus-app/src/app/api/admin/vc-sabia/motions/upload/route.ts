import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/motions/upload
 *
 * Multipart upload de um motion (MP4/WebM/MOV) para
 * Supabase Storage: course-assets/vc-sabia-motions/.
 *
 * Body: FormData { file: File, name?: string }
 * Returns: { name, url, sizeBytes }
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const overrideName = form.get("name");

    if (!(file instanceof File)) {
      return NextResponse.json({ erro: "file em falta" }, { status: 400 });
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { erro: "Ficheiro >50MB. Reduz qualidade ou usa upload direto Supabase." },
        { status: 413 }
      );
    }
    if (!/\.(mp4|webm|mov)$/i.test(file.name)) {
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

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const rawName =
      typeof overrideName === "string" && overrideName ? overrideName : file.name;
    const cleanName = rawName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9.\-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);

    const filePath = `vc-sabia-motions/${cleanName}`;
    const arrayBuf = await file.arrayBuffer();
    const contentType = file.type || "video/mp4";

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(arrayBuf), {
        contentType,
        upsert: true,
      });

    if (error) {
      return NextResponse.json(
        { erro: `Supabase upload: ${error.message}` },
        { status: 500 }
      );
    }

    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
    return NextResponse.json({ name: cleanName, url, sizeBytes: file.size });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
