import { NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_DURATION_SEC,
  MOOD_PROMPTS,
  type MorningMood,
} from "@/lib/vc-sabia/audio";

export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/audio/generate
 *
 * Gera um ambiente contemplativo via FAL Stable Audio (modelo desenhado
 * para texturas longas/ambientais, ao contrario do ElevenLabs SFX que e
 * para efeitos curtos). Submit + poll do queue FAL, depois upload do
 * resultado para Supabase Storage.
 *
 * Body: { mood: MorningMood, durationSec?: number (3-47), promptOverride?: string }
 * Returns: { audioUrl, mood, prompt, durationSec, sizeBytes, model }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mood: MorningMood | undefined = body.mood;
    const durationSec: number = Number(body.durationSec ?? DEFAULT_DURATION_SEC);
    const promptOverride: string | undefined = body.promptOverride;

    if (!mood || !(mood in MOOD_PROMPTS)) {
      return NextResponse.json(
        { erro: "mood invalido. Usa um de: " + Object.keys(MOOD_PROMPTS).join(", ") },
        { status: 400 }
      );
    }
    if (durationSec < 3 || durationSec > 47) {
      return NextResponse.json(
        { erro: "durationSec entre 3 e 47 (limite Stable Audio)" },
        { status: 400 }
      );
    }

    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      return NextResponse.json(
        { erro: "FAL_KEY nao configurada" },
        { status: 503 }
      );
    }

    const prompt = promptOverride || MOOD_PROMPTS[mood];

    // 1) Submit ao queue
    const submitRes = await fetch("https://queue.fal.run/fal-ai/stable-audio", {
      method: "POST",
      headers: {
        Authorization: `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        seconds_total: durationSec,
        steps: 100,
      }),
    });
    if (!submitRes.ok) {
      const t = await submitRes.text();
      return NextResponse.json(
        { erro: `FAL submit ${submitRes.status}: ${t.slice(0, 300)}` },
        { status: 502 }
      );
    }
    const submit = (await submitRes.json()) as {
      request_id?: string;
      status_url?: string;
      response_url?: string;
    };
    const statusUrl = submit.status_url;
    const responseUrl = submit.response_url;
    if (!statusUrl || !responseUrl) {
      return NextResponse.json(
        { erro: "FAL nao devolveu status_url/response_url", submit },
        { status: 502 }
      );
    }

    // 2) Poll status (max 4 min)
    const startedAt = Date.now();
    const timeoutMs = 240_000;
    let status: string = "IN_QUEUE";
    while (Date.now() - startedAt < timeoutMs) {
      await new Promise((r) => setTimeout(r, 2500));
      const stRes = await fetch(statusUrl, {
        headers: { Authorization: `Key ${falKey}` },
      });
      if (!stRes.ok) continue;
      const st = (await stRes.json()) as { status?: string };
      status = st.status || status;
      if (status === "COMPLETED") break;
      if (status === "FAILED") {
        return NextResponse.json(
          { erro: `FAL falhou (status FAILED)`, detail: st },
          { status: 502 }
        );
      }
    }
    if (status !== "COMPLETED") {
      return NextResponse.json(
        { erro: `FAL timeout ao fim de ${Math.round((Date.now() - startedAt) / 1000)}s, status=${status}` },
        { status: 504 }
      );
    }

    // 3) Get final result
    const resultRes = await fetch(responseUrl, {
      headers: { Authorization: `Key ${falKey}` },
    });
    if (!resultRes.ok) {
      const t = await resultRes.text();
      return NextResponse.json(
        { erro: `FAL response ${resultRes.status}: ${t.slice(0, 300)}` },
        { status: 502 }
      );
    }
    const result = (await resultRes.json()) as {
      audio_file?: { url?: string; content_type?: string };
      audio?: { url?: string };
    };
    const audioFileUrl = result.audio_file?.url || result.audio?.url;
    if (!audioFileUrl) {
      return NextResponse.json(
        { erro: "FAL nao devolveu URL do audio", result },
        { status: 502 }
      );
    }

    // 4) Download do FAL CDN
    const audioRes = await fetch(audioFileUrl);
    if (!audioRes.ok) {
      return NextResponse.json(
        { erro: `Falha a fazer download do audio FAL: ${audioRes.status}` },
        { status: 502 }
      );
    }
    const audioBuffer = await audioRes.arrayBuffer();

    const extMatch = audioFileUrl.match(/\.(wav|mp3|ogg|flac|m4a)(?:\?|$)/i);
    const ext = (extMatch?.[1] ?? "wav").toLowerCase();
    const contentType =
      ext === "mp3"
        ? "audio/mpeg"
        : ext === "ogg"
        ? "audio/ogg"
        : ext === "flac"
        ? "audio/flac"
        : ext === "m4a"
        ? "audio/mp4"
        : "audio/wav";

    // 5) Upload para Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const filePath = `vc-sabia-audios/${mood}/${mood}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("course-assets")
      .upload(filePath, new Uint8Array(audioBuffer), {
        contentType,
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
      model: "fal-ai/stable-audio",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
