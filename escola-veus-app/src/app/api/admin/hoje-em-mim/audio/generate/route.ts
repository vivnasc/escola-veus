import { NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_NIGHT_DURATION_SEC,
  DEFAULT_NIGHT_PROMPT_INFLUENCE,
  NIGHT_MOOD_PROMPTS,
  type NightMood,
} from "@/lib/hoje-em-mim/audio";

export const maxDuration = 120;

/**
 * POST /api/admin/hoje-em-mim/audio/generate
 *
 * Gera um SFX noturno via ElevenLabs Sound Effects API, faz upload para
 * Supabase Storage (course-assets/hoje-em-mim-audios/<mood>/) e devolve o URL
 * público.
 *
 * Body: { mood: NightMood, durationSec?: number, promptOverride?: string }
 * Returns: { audioUrl, mood, prompt, durationSec, sizeBytes }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mood: NightMood | undefined = body.mood;
    const durationSec: number = Number(body.durationSec ?? DEFAULT_NIGHT_DURATION_SEC);
    const promptOverride: string | undefined = body.promptOverride;

    if (!mood || !(mood in NIGHT_MOOD_PROMPTS)) {
      return NextResponse.json(
        {
          erro:
            "mood inválido. Usa um de: " + Object.keys(NIGHT_MOOD_PROMPTS).join(", "),
        },
        { status: 400 }
      );
    }
    if (durationSec < 3 || durationSec > 22) {
      return NextResponse.json(
        { erro: "durationSec tem de estar entre 3 e 22" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          erro:
            "ELEVENLABS_API_KEY não configurada. Adiciona em .env.local e Vercel.",
        },
        { status: 503 }
      );
    }

    const prompt = promptOverride || NIGHT_MOOD_PROMPTS[mood];

    const elevenRes = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: durationSec,
        prompt_influence: DEFAULT_NIGHT_PROMPT_INFLUENCE,
      }),
    });

    if (!elevenRes.ok) {
      const errText = await elevenRes.text();
      return NextResponse.json(
        { erro: `ElevenLabs: ${elevenRes.status} ${errText}` },
        { status: 502 }
      );
    }

    const audioBuffer = await elevenRes.arrayBuffer();

    // Guarda 1: tamanho mínimo. ElevenLabs por vezes devolve 200 OK
    // com body vazio (rate-limit ou sem créditos).
    if (audioBuffer.byteLength < 5 * 1024) {
      return NextResponse.json(
        {
          erro: `ElevenLabs devolveu ${audioBuffer.byteLength} bytes (MP3 inválido). Verifica créditos ElevenLabs ou retry em 1 min.`,
        },
        { status: 502 }
      );
    }

    // Guarda 2: magic bytes MP3. Headers MP3 começam por 'ID3' (id3v2
    // tag) ou 0xFF 0xFB/0xF3/0xF2 (MPEG audio frame sync). Qualquer outra
    // coisa (HTML, JSON de erro, etc.) é inválido.
    const bytes = new Uint8Array(audioBuffer, 0, 3);
    const isId3 = bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33; // "ID3"
    const isMpegSync =
      bytes[0] === 0xff && (bytes[1] === 0xfb || bytes[1] === 0xf3 || bytes[1] === 0xf2);
    if (!isId3 && !isMpegSync) {
      // Mostra os primeiros bytes em hex para ajudar a debugar
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
      return NextResponse.json(
        {
          erro: `Resposta ElevenLabs não é MP3 válido (primeiros bytes: ${hex}). Provavelmente um erro JSON disfarçado.`,
        },
        { status: 502 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const filePath = `hoje-em-mim-audios/${mood}/${mood}-${Date.now()}.mp3`;
    const { error: upErr } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(audioBuffer), {
        contentType: "audio/mpeg",
        upsert: false,
      });

    if (upErr) {
      return NextResponse.json(
        { erro: `Supabase upload: ${upErr.message}` },
        { status: 500 }
      );
    }

    const audioUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;

    return NextResponse.json({
      audioUrl,
      mood,
      prompt,
      durationSec,
      sizeBytes: audioBuffer.byteLength,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
