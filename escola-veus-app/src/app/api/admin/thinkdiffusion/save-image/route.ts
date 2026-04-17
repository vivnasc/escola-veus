import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

// Allow large image uploads (up to 10MB base64)
export const config = {
  api: { bodyParser: { sizeLimit: "12mb" } },
};

/**
 * POST /api/admin/thinkdiffusion/save-image
 *
 * Saves a base64 image to Supabase Storage.
 *
 * Body: { image: string (base64), filename: string, category: string }
 * Returns: { url: string }
 */

export async function POST(req: NextRequest) {
  try {
    const { image, filename, category } = await req.json();

    if (!image || !filename) {
      return NextResponse.json({ erro: "image e filename obrigatorios." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const clean = image.includes(",") ? image.split(",")[1] : image;
    const buffer = Buffer.from(clean, "base64");

    const folder = category ? `youtube/images/${category}` : "youtube/images";
    const filePath = `${folder}/${filename}`;

    const contentType = filename.endsWith(".jpg") || filename.endsWith(".jpeg") ? "image/jpeg" : "image/png";

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, buffer, { contentType, upsert: true });

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
