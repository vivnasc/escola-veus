import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

/**
 * POST /api/admin/courses/generate-music
 *
 * Generates instrumental background music using Suno via API.box wrapper.
 * Endpoint: POST https://apibox.erweima.ai/api/v1/generate
 * Status:   GET  https://apibox.erweima.ai/api/v1/generate/record-info?taskId=XXX
 *
 * Env: SUNO_API_KEY (API.box Bearer token), SUNO_API_URL (https://apibox.erweima.ai)
 *
 * Body: {
 *   prompt?: string,      — style description
 *   durationSec?: number,  — target duration (default: 120)
 *   courseSlug: string,
 * }
 * Returns: { audioUrl, durationSec, title }
 */

const DEFAULT_PROMPT =
  "ambient contemplative instrumental, soft subtle piano and warm pads, " +
  "slow tempo, meditative, no vocals, no lyrics, no drums, " +
  "gentle atmospheric texture, background music for narration";

export async function POST(req: NextRequest) {
  try {
    const { prompt, durationSec = 120, courseSlug } = await req.json();

    if (!courseSlug) {
      return NextResponse.json({ erro: "courseSlug obrigatorio." }, { status: 400 });
    }

    const apiKey = process.env.SUNO_API_KEY;
    const apiUrl = process.env.SUNO_API_URL;
    if (!apiKey || !apiUrl) {
      return NextResponse.json({ erro: "SUNO_API_KEY e SUNO_API_URL obrigatorios." }, { status: 400 });
    }

    const baseUrl = apiUrl.replace(/\/+$/, "");
    const musicPrompt = prompt || DEFAULT_PROMPT;

    // 1. Submit generation task to API.box
    const generateRes = await fetch(`${baseUrl}/api/v1/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: musicPrompt,
        instrumental: true,
        customMode: false,
        model: "V4_5ALL",
      }),
    });

    if (!generateRes.ok) {
      const errText = await generateRes.text().catch(() => "");
      return NextResponse.json(
        { erro: `API.box erro ${generateRes.status}: ${errText.slice(0, 300)}` },
        { status: 500 },
      );
    }

    const genData = await generateRes.json();

    // API.box returns { code, data: { taskId } } or similar
    const taskId = genData.data?.taskId || genData.taskId || genData.data?.task_id;

    if (!taskId) {
      // Maybe it returned audio directly
      const directUrl = genData.data?.audio_url || genData.audio_url;
      if (directUrl) {
        const uploaded = await uploadToSupabase(directUrl, courseSlug);
        return NextResponse.json({
          audioUrl: uploaded || directUrl,
          durationSec,
          title: genData.data?.title || "Instrumental",
        });
      }
      return NextResponse.json(
        { erro: "API.box nao devolveu taskId.", data: genData },
        { status: 500 },
      );
    }

    // 2. Poll for completion via record-info
    const result = await pollApiBox(baseUrl, apiKey, taskId);

    if (!result) {
      return NextResponse.json(
        { erro: "Timeout: musica nao ficou pronta em 2 minutos.", taskId },
        { status: 500 },
      );
    }

    // 3. Upload to Supabase
    const uploaded = await uploadToSupabase(result.audioUrl, courseSlug);

    return NextResponse.json({
      audioUrl: uploaded || result.audioUrl,
      durationSec: result.duration || durationSec,
      title: result.title || "Instrumental",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

async function pollApiBox(
  baseUrl: string,
  apiKey: string,
  taskId: string,
): Promise<{ audioUrl: string; duration?: number; title?: string } | null> {
  // Poll every 5s for up to 2 minutes (24 attempts)
  for (let i = 0; i < 24; i++) {
    await new Promise((r) => setTimeout(r, 5000));

    try {
      const res = await fetch(
        `${baseUrl}/api/v1/generate/record-info?taskId=${taskId}`,
        { headers: { "Authorization": `Bearer ${apiKey}` } },
      );

      if (!res.ok) continue;
      const data = await res.json();

      // API.box response: { code, data: { status, response: { data: [{ audio_url, ... }] } } }
      // or: { code, data: { status, sunoData: [{ audioUrl, ... }] } }
      const status = data.data?.status || data.status;

      if (status === "SUCCESS" || status === "COMPLETED" || status === "complete") {
        // Try multiple response shapes
        const items =
          data.data?.response?.data ||
          data.data?.sunoData ||
          data.data?.data ||
          (Array.isArray(data.data) ? data.data : null);

        if (items && items.length > 0) {
          const first = items[0];
          const audioUrl =
            first.audio_url || first.audioUrl ||
            first.stream_audio_url || first.streamAudioUrl ||
            first.url;
          if (audioUrl) {
            return {
              audioUrl,
              duration: first.duration,
              title: first.title,
            };
          }
        }

        // Fallback: audio_url at top level
        const topUrl = data.data?.audio_url || data.data?.audioUrl;
        if (topUrl) return { audioUrl: topUrl };
      }

      if (status === "FAILED" || status === "ERROR" || status === "failed") {
        return null;
      }

      // Still processing, continue polling
    } catch {
      continue;
    }
  }
  return null;
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
