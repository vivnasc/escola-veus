import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * POST /api/admin/courses/generate-scene-audio
 *
 * Generate audio for a SINGLE scene using ElevenLabs v3.
 * Uploads the per-scene MP3 to Supabase (not concatenated).
 *
 * Body: { courseSlug, sceneLabel, sceneIndex, narration, voiceId? }
 * Returns: { audioUrl, durationSec }
 */
export async function POST(req: NextRequest) {
  try {
    const { courseSlug, sceneLabel, sceneIndex, narration, voiceId } = await req.json();

    if (!courseSlug || sceneLabel === undefined || sceneIndex === undefined || !narration) {
      return NextResponse.json(
        { erro: "courseSlug, sceneLabel, sceneIndex e narration obrigatorios." },
        { status: 400 },
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ erro: "ELEVENLABS_API_KEY nao configurada." }, { status: 400 });
    }

    const voice = voiceId || process.env.ELEVENLABS_VOICE_ID || "JGnWZj684pcXmK2SxYIv";
    // ElevenLabs v3: uses [pause], [short pause], [long pause] audio tags
    // Convert \n\n to [pause] tags for v3
    const processedText = narration
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\n\n/g, " [pause] ")
      .replace(/\s+/g, " ")
      .trim();

    // Use ElevenLabs v3 with with_timestamps to get actual duration
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: processedText,
        model_id: "eleven_v3",
        // Não enviar language_code — deixar o modelo usar o sotaque natural da voz
        output_format: "mp3_44100_128",
        voice_settings: { stability: 0.30, similarity_boost: 0.60 },
      }),
    });

    let audioBuffer: ArrayBuffer;
    let durationSec: number;

    if (res.ok) {
      const data = await res.json();
      // with-timestamps returns base64 audio + character-level timestamps
      const audioBase64: string = data.audio_base64;
      const binaryStr = atob(audioBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      audioBuffer = bytes.buffer;

      // Extract duration from character timestamps if available
      if (data.alignment && data.alignment.character_end_times_seconds && data.alignment.character_end_times_seconds.length > 0) {
        const endTimes: number[] = data.alignment.character_end_times_seconds;
        durationSec = endTimes[endTimes.length - 1];
      } else {
        // Estimate from MP3 bitrate: 128kbps = 16000 bytes/sec
        // NOTE: This is an estimate. The with-timestamps endpoint should provide actual timing.
        durationSec = audioBuffer.byteLength / 16000;
      }
    } else {
      // Fallback: use standard TTS endpoint without timestamps
      const fallbackRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: processedText,
          model_id: "eleven_v3",
          output_format: "mp3_44100_128",
          voice_settings: { stability: 0.30, similarity_boost: 0.60 },
        }),
      });

      if (!fallbackRes.ok) {
        const errText = await fallbackRes.text();
        return NextResponse.json(
          { erro: `ElevenLabs ${fallbackRes.status}: ${errText.slice(0, 200)}` },
          { status: 500 },
        );
      }

      audioBuffer = await fallbackRes.arrayBuffer();
      // Estimate from MP3 bitrate: 128kbps = 16000 bytes/sec
      // NOTE: This is an estimate based on 128kbps bitrate. Actual duration may differ slightly.
      durationSec = audioBuffer.byteLength / 16000;
    }

    // Upload to Supabase
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 400 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const filePath = `courses/${courseSlug}/audio/${sceneLabel}-${sceneIndex}-${Date.now()}.mp3`;
    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(audioBuffer), { contentType: "audio/mpeg", upsert: true });

    if (error) {
      return NextResponse.json({ erro: `Supabase upload: ${error.message}` }, { status: 500 });
    }

    const audioUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;

    return NextResponse.json({ audioUrl, durationSec });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
