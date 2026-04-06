import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

/**
 * POST /api/admin/courses/generate-music
 *
 * Generates instrumental background music using Suno API.
 * Uploads to Supabase and returns URL.
 *
 * Env: SUNO_API_KEY, SUNO_API_URL
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

    const musicPrompt = prompt || DEFAULT_PROMPT;

    // 1. Generate music via Suno API
    const generateRes = await fetch(`${apiUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: musicPrompt,
        make_instrumental: true,
        wait_audio: true,
      }),
    });

    if (!generateRes.ok) {
      // Try alternative Suno API format
      const altRes = await fetch(`${apiUrl}/v1/music`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: musicPrompt,
          instrumental: true,
          duration: durationSec,
        }),
      });

      if (!altRes.ok) {
        const err = await altRes.text().catch(() => "");
        return NextResponse.json({ erro: `Suno API erro: ${altRes.status} ${err.slice(0, 200)}` }, { status: 500 });
      }

      const altData = await altRes.json();
      const audioUrl = altData.audio_url || altData.url || altData.data?.audio_url;
      if (!audioUrl) {
        return NextResponse.json({ erro: "Suno nao devolveu URL de audio.", data: altData }, { status: 500 });
      }

      const uploaded = await uploadToSupabase(audioUrl, courseSlug);
      return NextResponse.json({ audioUrl: uploaded || audioUrl, durationSec, title: altData.title });
    }

    const data = await generateRes.json();

    // Suno returns an array of generations
    const generations = Array.isArray(data) ? data : data.data || [data];
    const first = generations[0];

    if (!first) {
      return NextResponse.json({ erro: "Suno nao gerou musica.", data }, { status: 500 });
    }

    let audioUrl = first.audio_url || first.url || first.audio;

    // If Suno returns an ID, poll for completion
    if (!audioUrl && first.id) {
      audioUrl = await pollSunoResult(apiUrl, apiKey, first.id);
    }

    if (!audioUrl) {
      return NextResponse.json({ erro: "Suno nao devolveu URL de audio.", data }, { status: 500 });
    }

    // 2. Upload to Supabase
    const uploaded = await uploadToSupabase(audioUrl, courseSlug);

    return NextResponse.json({
      audioUrl: uploaded || audioUrl,
      durationSec: first.duration || durationSec,
      title: first.title || "Instrumental",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

async function pollSunoResult(apiUrl: string, apiKey: string, id: string): Promise<string | null> {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 5000));

    const res = await fetch(`${apiUrl}/api/get?ids=${id}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!res.ok) continue;
    const data = await res.json();
    const item = Array.isArray(data) ? data[0] : data;
    if (item?.audio_url) return item.audio_url;
    if (item?.status === "error") return null;
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
