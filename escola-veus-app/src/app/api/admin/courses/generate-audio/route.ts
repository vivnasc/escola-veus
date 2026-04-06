import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/generate-audio
 *
 * Generates narration audio via ElevenLabs.
 * Two modes:
 *
 * 1. FULL SCRIPT (default): generates one MP3 for the whole narration
 * 2. PER-SCENE with timestamps: generates audio per scene and returns
 *    word-level timestamps for precise Remotion sync.
 *
 * Body: {
 *   script: string,              // Full narration text
 *   courseSlug: string,
 *   moduleNum: number,
 *   subLetter: string,
 *   voiceId?: string,
 *   apiKey?: string,
 *   model?: "v2" | "v3",
 *   speed?: number,
 *
 *   // Per-scene mode (for video pipeline):
 *   scenes?: Array<{ type: string, narration: string, durationSec: number }>,
 *   withTimestamps?: boolean,
 * }
 *
 * Returns (per-scene mode):
 * {
 *   audioUrl: string,            // Full combined audio URL
 *   sceneTimings: Array<{
 *     type: string,
 *     startSec: number,          // When this scene's narration starts
 *     endSec: number,            // When this scene's narration ends
 *     durationSec: number,       // Actual audio duration for this scene
 *   }>
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { script, courseSlug, moduleNum, subLetter, model, scenes, withTimestamps } = body;

    const apiKey = body.apiKey || process.env.ELEVENLABS_API_KEY;
    const voiceId = body.voiceId || process.env.ELEVENLABS_VOICE_ID || "fnoNuVpfClX7lHKFbyZ2";

    if (!apiKey) {
      return NextResponse.json(
        { erro: "ELEVENLABS_API_KEY nao configurada." },
        { status: 400 },
      );
    }

    const speed = body.speed ?? 1.0;
    // Default to v3 — better Portuguese European, no accent mixing
    const modelId = model === "v2" ? "eleven_multilingual_v2" : "eleven_v3";
    const voiceSettings =
      modelId === "eleven_v3"
        ? { stability: 0.7, similarity_boost: 0.85 }
        : { stability: 0.75, similarity_boost: 0.85, style: 0.1 };

    // ─── PER-SCENE MODE (with timestamps for Remotion sync) ─────────

    if (scenes && withTimestamps) {
      const sceneTimings: Array<{
        type: string;
        startSec: number;
        endSec: number;
        durationSec: number;
      }> = [];

      const audioChunks: ArrayBuffer[] = [];
      let currentTime = 0;

      for (const scene of scenes) {
        if (!scene.narration || scene.narration.trim() === "") {
          // Silent scene (abertura, fecho) — add silence duration
          sceneTimings.push({
            type: scene.type,
            startSec: currentTime,
            endSec: currentTime + scene.durationSec,
            durationSec: scene.durationSec,
          });
          currentTime += scene.durationSec;
          continue;
        }

        // Generate audio with timestamps for this scene
        const processedText = scene.narration
          .replace(/\n\n+/g, "\n\n")
          .trim();

        const elevenRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
          {
            method: "POST",
            headers: {
              "xi-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: processedText,
              model_id: modelId,
              voice_settings: voiceSettings,
              ...(speed !== 1.0 && { speed }),
            }),
          },
        );

        if (!elevenRes.ok) {
          const err = await elevenRes.text();
          // If timestamps endpoint fails, fall back to regular generation
          const fallbackRes = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
              method: "POST",
              headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                text: processedText,
                model_id: modelId,
                voice_settings: voiceSettings,
                ...(speed !== 1.0 && { speed }),
              }),
            },
          );

          if (!fallbackRes.ok) {
            return NextResponse.json(
              { erro: `ElevenLabs: ${elevenRes.status} — ${err}` },
              { status: 500 },
            );
          }

          const audioBuffer = await fallbackRes.arrayBuffer();
          // Estimate duration from buffer size (MP3 ~16kB per second at 128kbps)
          const estimatedDuration = audioBuffer.byteLength / 16000;

          sceneTimings.push({
            type: scene.type,
            startSec: currentTime,
            endSec: currentTime + estimatedDuration,
            durationSec: estimatedDuration,
          });

          audioChunks.push(audioBuffer);
          currentTime += estimatedDuration;
          continue;
        }

        const data = await elevenRes.json();

        // ElevenLabs with-timestamps returns base64 audio + character timing
        const audioBase64 = data.audio_base64;
        const audioBytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
        const audioBuffer = audioBytes.buffer;

        // Calculate actual duration from character timestamps
        const characters = data.alignment?.characters || [];
        const lastChar = characters[characters.length - 1];
        const audioDuration = lastChar
          ? lastChar.end_time_ms / 1000
          : audioBuffer.byteLength / 16000;

        // Add 1 second of silence between scenes (breathing room)
        const silencePadding = 1.0;

        sceneTimings.push({
          type: scene.type,
          startSec: currentTime,
          endSec: currentTime + audioDuration,
          durationSec: audioDuration + silencePadding,
        });

        audioChunks.push(audioBuffer);
        currentTime += audioDuration + silencePadding;
      }

      // Combine all audio chunks
      const totalSize = audioChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
      const combined = new Uint8Array(totalSize);
      let offset = 0;
      for (const chunk of audioChunks) {
        combined.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }

      // Upload combined audio to Supabase
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tdytdamtfillqyklgrmb.supabase.co";

      if (!serviceKey) {
        return new NextResponse(combined, {
          headers: {
            "Content-Type": "audio/mpeg",
            "X-Scene-Timings": JSON.stringify(sceneTimings),
          },
        });
      }

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

      const filePath = `courses/${courseSlug}/audio/${subLetter?.toLowerCase() || "full"}-${Date.now()}.mp3`;
      const { error: uploadError } = await supabase.storage
        .from("course-assets")
        .upload(filePath, combined, { contentType: "audio/mpeg", upsert: true });

      if (uploadError) {
        return NextResponse.json({ erro: `Upload: ${uploadError.message}` }, { status: 500 });
      }

      const audioUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
      return NextResponse.json({
        audioUrl,
        path: filePath,
        sceneTimings,
        totalDurationSec: currentTime,
      });
    }

    // ─── FULL SCRIPT MODE (original behavior) ───────────────────────

    if (!script || !courseSlug || moduleNum === undefined || !subLetter) {
      return NextResponse.json(
        { erro: "Campos obrigatorios: script, courseSlug, moduleNum, subLetter." },
        { status: 400 },
      );
    }

    const processedScript = script.replace(/\n\n+/g, "\n\n").trim();

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
      },
    );

    if (!elevenRes.ok) {
      const erro = await elevenRes.text();
      return NextResponse.json(
        { erro: `ElevenLabs: ${elevenRes.status} — ${erro}` },
        { status: 500 },
      );
    }

    const audioBuffer = await elevenRes.arrayBuffer();
    if (audioBuffer.byteLength === 0) {
      return NextResponse.json(
        { erro: "ElevenLabs devolveu ficheiro vazio." },
        { status: 500 },
      );
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tdytdamtfillqyklgrmb.supabase.co";

    if (!serviceKey) {
      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Disposition": `attachment; filename="curso-${courseSlug}-m${moduleNum}-${subLetter.toLowerCase()}.mp3"`,
        },
      });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const filePath = `courses/${courseSlug}/m${moduleNum}/${subLetter.toLowerCase()}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from("course-audio")
      .upload(filePath, new Uint8Array(audioBuffer), { contentType: "audio/mpeg", upsert: true });

    if (uploadError) {
      return NextResponse.json({ erro: `Upload: ${uploadError.message}` }, { status: 500 });
    }

    const url = `${supabaseUrl}/storage/v1/object/public/course-audio/${filePath}`;
    return NextResponse.json({ url, path: filePath });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Excepcao: ${msg}` }, { status: 500 });
  }
}
