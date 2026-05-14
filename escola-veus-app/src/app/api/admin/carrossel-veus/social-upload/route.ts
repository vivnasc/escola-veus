import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";

/**
 * POST /api/admin/carrossel-veus/social-upload
 *
 * Faz upload de um slide PNG/JPG (ou WebP) para Supabase Storage:
 * course-assets/carrossel-social/{folder}/{cleanName}.
 *
 * Devolve a URL pública pronta a meter na coluna Picture Url do CSV Metricool.
 *
 * Body: FormData { file: File, folder?: string }
 * Returns: { name, url, sizeBytes }
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const folderInput = form.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json({ erro: "file em falta" }, { status: 400 });
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { erro: "Slide >15MB. Exporta com qualidade menor." },
        { status: 413 }
      );
    }
    if (!/\.(png|jpe?g|webp)$/i.test(file.name)) {
      return NextResponse.json(
        { erro: "Slide tem de ser .png, .jpg ou .webp" },
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

    const folder =
      typeof folderInput === "string" && folderInput
        ? folderInput.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").slice(0, 60)
        : "default";

    const cleanName = file.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9.\-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);

    const stamped = `${Date.now()}-${cleanName}`;
    const filePath = `carrossel-social/${folder}/${stamped}`;
    const arrayBuf = await file.arrayBuffer();
    const contentType = file.type || "image/png";

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
    return NextResponse.json({ name: stamped, url, sizeBytes: file.size });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
