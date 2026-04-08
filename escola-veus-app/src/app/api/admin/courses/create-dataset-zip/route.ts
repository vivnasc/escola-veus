import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

export const maxDuration = 120;

/**
 * POST /api/admin/courses/create-dataset-zip
 *
 * Receives an array of image URLs, downloads them all,
 * creates a ZIP, uploads to Supabase, and returns the ZIP URL.
 *
 * Body: { imageUrls: string[] }
 * Returns: { zipUrl: string, count: number }
 */
export async function POST(req: NextRequest) {
  try {
    const { imageUrls } = await req.json();

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { erro: "imageUrls obrigatorio (array de URLs)." },
        { status: 400 },
      );
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 400 });
    }

    // Download all images in parallel
    const downloads = await Promise.allSettled(
      imageUrls.map(async (url: string, i: number) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Falha ao descarregar imagem ${i}: ${res.status}`);
        const buffer = await res.arrayBuffer();
        const ext = url.includes(".png") ? "png" : "jpg";
        return { name: `image_${String(i).padStart(2, "0")}.${ext}`, data: buffer };
      }),
    );

    const zip = new JSZip();
    let count = 0;

    for (const result of downloads) {
      if (result.status === "fulfilled") {
        zip.file(result.value.name, result.value.data);
        count++;
      }
    }

    if (count === 0) {
      return NextResponse.json({ erro: "Nenhuma imagem descarregada com sucesso." }, { status: 500 });
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });

    // Upload to Supabase
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const filePath = `lora/dataset-${Date.now()}.zip`;
    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, zipBuffer, { contentType: "application/zip", upsert: true });

    if (error) {
      return NextResponse.json({ erro: `Supabase upload: ${error.message}` }, { status: 500 });
    }

    const zipUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;

    return NextResponse.json({ zipUrl, count });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
