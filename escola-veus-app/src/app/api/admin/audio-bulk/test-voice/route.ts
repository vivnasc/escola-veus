import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * POST /api/admin/audio-bulk/test-voice
 *
 * Sample curto de audio para testar voz/modelo.
 * Body: { text, voiceId, modelId?, languageCode? }
 * Returns: { audioDataUrl, sizeBytes }
 */

function processTextForModel(rawText: string, modelId: string): string {
  const isV3 = modelId === "eleven_v3";
  if (isV3) {
    return rawText.replace(/\n{4,}/g, "\n\n\n").trim();
  }
  let t = rawText
    .replace(/\[long pause\]/gi, "\n\n\n")
    .replace(/\[pause\]/gi, "\n\n")
    .replace(/\[short pause\]/gi, ". ")
    .replace(/\[(calm|thoughtful|whispers|sighs|laughs|excited|sad)\]/gi, "");
  t = t.replace(/\n{4,}/g, "\n\n\n").trim();
  return t;
}

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, modelId = "eleven_multilingual_v2", languageCode } = await req.json();

    if (!text || !voiceId) {
      return NextResponse.json({ erro: "text e voiceId obrigatorios" }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ erro: "ELEVENLABS_API_KEY nao configurada" }, { status: 400 });
    }

    const processedText = processTextForModel(text, modelId);

    const body: Record<string, unknown> = {
      text: processedText,
      model_id: modelId,
      output_format: "mp3_44100_128",
    };

    // Language code SO se explicitamente enviado E se o modelo suporta.
    // eleven_v3 NAO aceita language_code — auto-detecta.
    if (languageCode && modelId !== "eleven_v3") {
      body.language_code = languageCode;
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
