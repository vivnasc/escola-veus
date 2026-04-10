import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/music-status
 *
 * Polls Suno task status via API.box and optionally uploads to Supabase.
 *
 * Body: { taskId: string, courseSlug?: string }
 * Returns: { status, audioUrl?, title?, duration? }
 */
export async function POST(req: NextRequest) {
  try {
    const { taskId, courseSlug } = await req.json();

    if (!taskId) {
      return NextResponse.json({ erro: "taskId obrigatorio." }, { status: 400 });
    }

    const apiKey = process.env.SUNO_API_KEY;
    const apiUrl = process.env.SUNO_API_URL;
    if (!apiKey || !apiUrl) {
      return NextResponse.json({ erro: "SUNO_API_KEY e SUNO_API_URL obrigatorios." }, { status: 400 });
    }

    const baseUrl = apiUrl.replace(/\/+$/, "");
    const headers = { "Authorization": `Bearer ${apiKey}` };

    // Try status endpoints in order
    const endpoints = [
      `${baseUrl}/api/v1/generate/record-info?taskId=${taskId}`,
      `${baseUrl}/api/suno/fetch?taskId=${taskId}`,
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, { headers });
        if (!res.ok) continue;

        const data = await res.json();
        const record = data?.data || data;
        const status = String(record?.status || "").toLowerCase();

        if (status === "failed" || status === "error") {
          return NextResponse.json({ status: "failed" });
        }

        if (status === "success" || status === "complete" || status === "completed") {
          const response = record?.response as Record<string, unknown> | undefined;
          const sunoData = (response?.sunoData || response?.data || record?.sunoData) as
            Array<Record<string, unknown>> | undefined;

          if (sunoData && sunoData.length > 0) {
            const first = sunoData[0];
            let audioUrl = (first.audioUrl || first.audio_url || first.streamAudioUrl || first.stream_audio_url) as string;

            if (audioUrl && courseSlug) {
              const uploaded = await uploadToSupabase(audioUrl, courseSlug);
              if (uploaded) audioUrl = uploaded;
            }

            return NextResponse.json({
              status: "done",
              audioUrl,
              title: first.title || "Instrumental",
              duration: first.duration,
            });
          }
        }

        // Still processing — return current status
        return NextResponse.json({ status: "processing" });
      } catch {
        continue;
      }
    }

    return NextResponse.json({ status: "processing" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg, status: "error" }, { status: 500 });
  }
}

async function uploadToSupabase(audioUrl: string, courseSlug: string): Promise<string | null> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;

  try {
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) return null;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const filePath = `courses/${courseSlug}/music/instrumental-${Date.now()}.mp3`;
    const buffer = new Uint8Array(await audioRes.arrayBuffer());
    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, buffer, { contentType: "audio/mpeg", upsert: true });
    if (!error) return `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
  } catch { /* fallback */ }
  return null;
}
