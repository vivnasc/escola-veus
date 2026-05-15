import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";

/**
 * POST /api/admin/hoje-em-mim/images/upload
 *
 * Recebe uma imagem MJ (PNG/JPG/WebP) e guarda em
 * Supabase Storage: course-assets/hoje-em-mim-images/.
 *
 * Estas imagens ficam disponíveis para serem submetidas à Runway Gen4
 * Turbo image_to_video (ratio 720:1280 vertical) e o MP4 resultante
 * acaba no motion library.
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
    if (file.size > 30 * 1024 * 1024) {
      return NextResponse.json(
        { erro: "Imagem >30MB. Exporta em qualidade menor." },
        { status: 413 }
      );
    }
    if (!/\.(png|jpe?g|webp)$/i.test(file.name)) {
      return NextResponse.json(
        { erro: "Extensão tem de ser .png, .jpg, .jpeg ou .webp" },
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

    const stamped = `${Date.now()}-${cleanName}`;
    const filePath = `hoje-em-mim-images/${stamped}`;
    const arrayBuf = await file.arrayBuffer();
    const contentType = file.type || "image/png";

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(arrayBuf), {
        contentType,
        upsert: false,
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
