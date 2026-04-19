import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

/**
 * POST /api/admin/thinkdiffusion/save-clip
 *
 * Downloads a Runway clip and saves it to Supabase.
 * Body: { videoUrl, filename }
 * Returns: { url }
 */
export async function POST(req: NextRequest) {
  try {
    const { videoUrl, filename } = await req.json();

    if (!videoUrl || !filename) {
      return NextResponse.json({ erro: "videoUrl e filename obrigatorios." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 500 });
    }

    const vidRes = await fetch(videoUrl);
    if (!vidRes.ok) {
      return NextResponse.json({ erro: `Runway URL falhou: ${vidRes.status}` }, { status: 502 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const buffer = new Uint8Array(await vidRes.arrayBuffer());
    const filePath = `youtube/clips/${filename}`;

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, buffer, { contentType: "video/mp4", upsert: true });

    if (error) {
      return NextResponse.json({ erro: `Upload falhou: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      url: `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { filename } = await req.json();
    if (!filename) return NextResponse.json({ erro: "filename obrigatorio." }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 500 });

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    await supabase.storage.from("course-assets").remove([`youtube/clips/${filename}`]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ erro: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
