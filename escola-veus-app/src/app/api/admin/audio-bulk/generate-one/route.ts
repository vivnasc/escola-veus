import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * POST /api/admin/audio-bulk/generate-one
 *
 * Generates ONE audio via ElevenLabs and uploads to Supabase.
 *
 * Body: { text, voiceId, modelId?, title, folder? }
 * Returns: { audioUrl, durationSec, sizeBytes, charsUsed }
 */

/**
 * Converte [pause] tags consoante o modelo.
 * - v3: mantem tags nativamente (suporta [pause], [calm], etc.)
 * - v2/turbo: converte para quebras de linha naturais e remove tags de emocao
 */
function processTextForModel(rawText: string, modelId: string): string {
  const isV3 = modelId === "eleven_v3";

  if (isV3) {
    // v3: tags sao nativas. So normalizar espaços excessivos.
    return rawText.replace(/\n{4,}/g, "\n\n\n").trim();
  }

  // v2 / turbo / outros: [pause] e lido literalmente se ficar como "[pause]".
  // Converter para quebras de linha, que v2 respeita como pausas.
  let t = rawText
    .replace(/\[long pause\]/gi, "\n\n\n")
    .replace(/\[pause\]/gi, "\n\n")
    .replace(/\[short pause\]/gi, ". ")
    // Tags de emocao (v3-only) — remover para v2/turbo
    .replace(/\[(calm|thoughtful|whispers|sighs|laughs|excited|sad)\]/gi, "");

  // Normalizar quebras de linha excessivas
  t = t.replace(/\n{4,}/g, "\n\n\n").trim();
  return t;
}

export async function POST(req: NextRequest) {
  try {
    const {
      text,
      voiceId,
      modelId = "eleven_multilingual_v2",
      title,
      folder = "youtube",
      languageCode, // opcional — se omitido, voice decide sotaque
    } = await req.json();

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
    // IMPORTANTE: eleven_v3 NAO aceita language_code — auto-detecta o idioma.
    // Tentar enviar resulta em erro 400 'unsupported_language'.
    // Apenas v2/turbo aceitam language_code.
    if (languageCode && modelId !== "eleven_v3") {
      body.language_code = languageCode;
    }

    // v3 suporta with-timestamps (duracao exacta via alignment)
    const useTimestamps = modelId === "eleven_v3";
    const endpoint = useTimestamps
      ? `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`
      : `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const res = await fetch(endpoint, {
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

    let audioBuffer: ArrayBuffer;
    let durationSec: number | null = null;

    if (useTimestamps) {
      const data = await res.json();
      const audioBase64: string = data.audio_base64;
      const binaryStr = atob(audioBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      audioBuffer = bytes.buffer;
      const endTimes: number[] | undefined = data.alignment?.character_end_times_seconds;
      if (endTimes && endTimes.length > 0) durationSec = endTimes[endTimes.length - 1];
    } else {
      audioBuffer = await res.arrayBuffer();
    }

    if (durationSec === null) {
      durationSec = audioBuffer.byteLength / 16000;
    }

    // Upload Supabase
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 400 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const slug = (title || "audio")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

    const filePath = `${folder}/${slug}-${Date.now()}.mp3`;
    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(audioBuffer), {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (error) {
      return NextResponse.json({ erro: `Supabase upload: ${error.message}` }, { status: 500 });
    }

    const audioUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;

    return NextResponse.json({
      audioUrl,
      durationSec,
      sizeBytes: audioBuffer.byteLength,
      charsUsed: processedText.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
