import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * POST /api/admin/audio-bulk/test-voice
 *
 * Generates a short audio sample (no Supabase upload) for voice/model testing.
 * Returns base64 data URL so frontend can play immediately.
 *
 * Body: { text, voiceId, modelId? }
 * Returns: { audioDataUrl, sizeBytes }
 */
export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, modelId = "eleven_multilingual_v2" } = await req.json();

    if (!text || !voiceId) {
      return NextResponse.json({ erro: "text e voiceId obrigatorios" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ erro: "ELEVENLABS_API_KEY nao configurada" }, { status: 400 });
    }

    // Normalize text: convert \n\n to [pause] tags, collapse whitespace
    const processedText = text
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\n\n/g, " [pause] ")
      .replace(/\s+/g, " ")
      .trim();

    const body: Record<string, unknown> = {
      text: processedText,
      model_id: modelId,
      output_format: "mp3_44100_128",
    };

    // Multilingual models accept language_code; v3 handles it via tags
    if (modelId.includes("multilingual")) {
      body.language_code = "pt";
    }

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { erro: `ElevenLabs ${res.status}: ${errText.slice(0, 300)}` },
        { status: 500 },
      );
    }

    const audioBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString("base64");
    const dataUrl = `data:audio/mpeg;base64,${base64}`;

    return NextResponse.json({ audioDataUrl: dataUrl, sizeBytes: audioBuffer.byteLength });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
