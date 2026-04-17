import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/admin/thinkdiffusion/save-task
 * Saves a Runway taskId to Supabase so it's never lost.
 *
 * Body: { taskId, imageName, imageUrl }
 */
export async function POST(req: NextRequest) {
  const { taskId, imageName, imageUrl } = await req.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const record = JSON.stringify({ taskId, imageName, imageUrl, status: "processing", createdAt: new Date().toISOString() });
  const filePath = `youtube/tasks/${taskId}.json`;

  await supabase.storage
    .from("course-assets")
    .upload(filePath, new TextEncoder().encode(record), { contentType: "application/json", upsert: true });

  return NextResponse.json({ ok: true });
}
