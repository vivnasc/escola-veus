import { NextRequest, NextResponse } from "next/server";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";

export const maxDuration = 120;

/**
 * POST /api/admin/funil/generate-srt
 *
 * Gera SRT para a narração via fal.ai Whisper (usa FAL_KEY, já configurado
 * no Vercel). Fallback: OpenAI Whisper se FAL_KEY ausente e OPENAI_API_KEY
 * presente.
 *
 * Body: { narrationUrl, scriptId?, filename? }
 * Retorna: { url, srt }
 */

type Body = {
  narrationUrl?: string;
  scriptId?: string;
  filename?: string;
};

type Chunk = { timestamp: [number, number]; text: string };

function findScriptTextById(id: string): string | null {
  for (const preset of NOMEAR_PRESETS) {
    const hit = preset.scripts.find((s) => s.id === id);
    if (hit) {
      return hit.texto.replace(/\[[^\]]+\]/g, " ").replace(/\s+/g, " ").trim();
    }
  }
  return null;
}

function fmtSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  return (
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0") +
    ":" +
    String(s).padStart(2, "0") +
    "," +
    String(ms).padStart(3, "0")
  );
}

function chunksToSrt(chunks: Chunk[]): string {
  return chunks
    .filter((c) => c && Array.isArray(c.timestamp) && typeof c.text === "string")
    .map((c, i) => {
      const [start, end] = c.timestamp;
      return `${i + 1}\n${fmtSrtTime(start)} --> ${fmtSrtTime(end)}\n${c.text.trim()}\n`;
    })
    .join("\n");
}

async function transcribeFalAi(narrationUrl: string): Promise<{ srt: string } | { erro: string }> {
  const key = process.env.FAL_KEY;
  if (!key) return { erro: "FAL_KEY ausente" };

  const res = await fetch("https://fal.run/fal-ai/whisper", {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url: narrationUrl,
      task: "transcribe",
      language: "pt",
      chunk_level: "segment", // segment-level dá linhas naturais para SRT
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    return { erro: `fal.ai ${res.status}: ${err.slice(0, 300)}` };
  }

  const data = await res.json();
  const chunks: Chunk[] = Array.isArray(data.chunks) ? data.chunks : [];
  if (chunks.length === 0) {
    return { erro: "fal.ai nao devolveu chunks (transcricao vazia)" };
  }

  return { srt: chunksToSrt(chunks) };
}

async function transcribeOpenai(
  narrationUrl: string,
  prompt?: string,
): Promise<{ srt: string } | { erro: string }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { erro: "OPENAI_API_KEY ausente" };

  const audioRes = await fetch(narrationUrl);
  if (!audioRes.ok) return { erro: `Download MP3 ${audioRes.status}` };
  const audioBlob = await audioRes.blob();

  const form = new FormData();
  form.append("file", new File([audioBlob], "narration.mp3", { type: "audio/mpeg" }));
  form.append("model", "whisper-1");
  form.append("response_format", "srt");
  form.append("language", "pt");
  if (prompt) form.append("prompt", prompt);

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    return { erro: `OpenAI ${res.status}: ${err.slice(0, 300)}` };
  }

  return { srt: await res.text() };
}

export async function POST(req: NextRequest) {
  try {
    const { narrationUrl, scriptId, filename }: Body = await req.json();
    if (!narrationUrl) {
      return NextResponse.json({ erro: "narrationUrl obrigatorio." }, { status: 400 });
    }

    const prompt = scriptId ? findScriptTextById(scriptId)?.slice(0, 900) : undefined;

    // Prefer fal.ai (FAL_KEY já configurada); fallback para OpenAI.
    let result: { srt: string } | { erro: string };
    if (process.env.FAL_KEY) {
      result = await transcribeFalAi(narrationUrl);
      // Se fal.ai falhar mas OpenAI existir, tenta OpenAI
      if ("erro" in result && process.env.OPENAI_API_KEY) {
        result = await transcribeOpenai(narrationUrl, prompt);
      }
    } else if (process.env.OPENAI_API_KEY) {
      result = await transcribeOpenai(narrationUrl, prompt);
    } else {
      return NextResponse.json(
        { erro: "Nenhum transcriber configurado (precisa FAL_KEY ou OPENAI_API_KEY)." },
        { status: 500 },
      );
    }

    if ("erro" in result) {
      return NextResponse.json({ erro: result.erro }, { status: 502 });
    }

    const srt = result.srt;

    // Upload SRT to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ srt, erro: "Supabase nao configurado." }, { status: 200 });
    }

    const safeBase = (filename || scriptId || "narration")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const srtName = `${safeBase}-${Date.now()}.srt`;
    const storagePath = `youtube/subtitles/${srtName}`;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { error } = await supabase.storage
      .from("course-assets")
      .upload(storagePath, new Blob([srt], { type: "application/x-subrip" }), {
        contentType: "application/x-subrip",
        upsert: true,
      });

    if (error) {
      return NextResponse.json({ srt, erro: `Upload SRT: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      url: `${supabaseUrl}/storage/v1/object/public/course-assets/${storagePath}`,
      srt,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
