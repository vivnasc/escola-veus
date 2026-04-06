import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { texto, voiceId, apiKey, model } = await req.json();

  if (!apiKey || !voiceId || !texto) {
    return NextResponse.json(
      { erro: "API key, Voice ID ou texto em falta." },
      { status: 400 }
    );
  }

  // Eleven v3: pausas via [pause], [short pause], [long pause]
  // v2: pausas via SSML <break time="1.5s" />
  const modelId = model === "v2" ? "eleven_multilingual_v2" : "eleven_v3";
  const voiceSettings = model === "v2"
    ? { stability: 0.55, similarity_boost: 0.8, style: 0.15 }
    : { stability: 0.45, similarity_boost: 0.75 };

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: texto,
        model_id: modelId,
        voice_settings: voiceSettings,
      }),
    }
  );

  if (!res.ok) {
    const erro = await res.text();
    return NextResponse.json(
      { erro: `ElevenLabs: ${res.status} — ${erro}` },
      { status: 500 }
    );
  }

  const audio = await res.arrayBuffer();
  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
