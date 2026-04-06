import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/generate-audio
 * Generates audio via ElevenLabs and uploads to Supabase.
 *
 * Body: { script, courseSlug, moduleNum, subLetter, voiceId?, apiKey?, model? }
 * apiKey and voiceId fall back to env vars ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { script, courseSlug, moduleNum, subLetter, model } = body;

    const apiKey = body.apiKey || process.env.ELEVENLABS_API_KEY;
    const voiceId = body.voiceId || process.env.ELEVENLABS_VOICE_ID || "fnoNuVpfClX7lHKFbyZ2";

    if (!script || !courseSlug || moduleNum === undefined || !subLetter) {
      return NextResponse.json(
        { erro: "Campos obrigatorios: script, courseSlug, moduleNum, subLetter." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { erro: "ELEVENLABS_API_KEY nao configurada. Define a env var ou envia apiKey no body." },
        { status: 400 }
      );
    }

    // 1. Generate audio via ElevenLabs
    const modelId = model === "v3" ? "eleven_v3" : "eleven_multilingual_v2";

    // Voice settings tuned for contemplative narration:
    // - High stability (0.75) = consistent, calm pace
    // - High similarity (0.85) = closer to original voice
    // - Low style (0.1) = less dramatic variation
    // - Speed can be overridden via body.speed (default 0.9 = slightly slower)
    const speed = body.speed ?? 0.9;
    const voiceSettings =
      model === "v3"
        ? { stability: 0.7, similarity_boost: 0.85 }
        : { stability: 0.75, similarity_boost: 0.85, style: 0.1 };

    // Add natural pauses: double newlines become silence markers
    const processedScript = script
      .replace(/\n\n+/g, "... ... ")
      .replace(/\.\s+/g, ". ... ");

    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: processedScript,
          model_id: modelId,
          voice_settings: voiceSettings,
          ...(speed !== 1.0 && { speed }),
        }),
      }
    );

    if (!elevenRes.ok) {
      const erro = await elevenRes.text();
      return NextResponse.json(
        { erro: `ElevenLabs: ${elevenRes.status} — ${erro}` },
        { status: 500 }
      );
    }

    const audioBuffer = await elevenRes.arrayBuffer();
    if (audioBuffer.byteLength === 0) {
      return NextResponse.json(
        { erro: "ElevenLabs devolveu ficheiro vazio." },
        { status: 500 }
      );
    }

    // 2. Upload to Supabase Storage
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://tdytdamtfillqyklgrmb.supabase.co";

    if (!serviceKey) {
      // Return audio as download if no service key
      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Disposition": `attachment; filename="curso-${courseSlug}-m${moduleNum}-${subLetter.toLowerCase()}.mp3"`,
        },
      });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const filePath = `courses/${courseSlug}/m${moduleNum}/${subLetter.toLowerCase()}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from("course-audio")
      .upload(filePath, new Uint8Array(audioBuffer), {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { erro: `Upload: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const url = `${supabaseUrl}/storage/v1/object/public/course-audio/${filePath}`;
    return NextResponse.json({ url, path: filePath });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { erro: `Excepcao: ${msg}` },
      { status: 500 }
    );
  }
}
