import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

/**
 * POST /api/admin/thinkdiffusion/save-image
 *
 * Saves an image to Supabase Storage. Accepts FormData (binary) or JSON (base64).
 */

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const contentType = req.headers.get("content-type") || "";
    let buffer: Uint8Array;
    let filename: string;
    let category: string;
    let fileContentType: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      filename = (formData.get("filename") as string) || file.name;
      category = (formData.get("category") as string) || "misc";
      fileContentType = file.type || "image/png";
      buffer = new Uint8Array(await file.arrayBuffer());
    } else {
      const { image, filename: fn, category: cat } = await req.json();
      if (!image || !fn) {
        return NextResponse.json({ erro: "image e filename obrigatorios." }, { status: 400 });
      }
      filename = fn;
      category = cat || "misc";
      fileContentType = fn.endsWith(".jpg") || fn.endsWith(".jpeg") ? "image/jpeg" : "image/png";
      const clean = image.includes(",") ? image.split(",")[1] : image;
      buffer = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
    }

    const filePath = `youtube/images/${category}/${filename}`;

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, buffer, { contentType: fileContentType, upsert: true });

    if (error) {
      return NextResponse.json({ erro: `Upload falhou: ${error.message}` }, { status: 500 });
    }

    const url = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
