import { NextRequest, NextResponse } from "next/server";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";

export const maxDuration = 120;

/**
 * POST /api/admin/funil/generate-srt
 *
 * Gera SRT (line-level) para a narração via OpenAI Whisper.
 *
 * Body: { narrationUrl, scriptId?, filename? }
 *   - narrationUrl: URL pública do MP3 no Supabase
 *   - scriptId: id do script (ex: "nomear-trailer-00") — usado para procurar o
 *     texto no NOMEAR_PRESETS e passar como `prompt` do Whisper (melhora
 *     precisão com vocabulário contemplativo PT-PT)
 *   - filename: nome base para o SRT (sem extensão)
 *
 * Retorna: { url, srt }
 *   url = URL pública do SRT gravado em youtube/subtitles/<filename>.srt
 *   srt = texto do SRT (para preview)
 */

type Body = {
  narrationUrl?: string;
  scriptId?: string;
  filename?: string;
};

function findScriptTextById(id: string): string | null {
  for (const preset of NOMEAR_PRESETS) {
    const hit = preset.scripts.find((s) => s.id === id);
    if (hit) {
      // Strip ElevenLabs tags ([pause], [calm], etc.) — não queremos no prompt do Whisper.
      return hit.texto.replace(/\[[^\]]+\]/g, " ").replace(/\s+/g, " ").trim();
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { narrationUrl, scriptId, filename }: Body = await req.json();

    if (!narrationUrl) {
      return NextResponse.json({ erro: "narrationUrl obrigatorio." }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ erro: "OPENAI_API_KEY nao configurada." }, { status: 500 });
    }

    // Download MP3
    const audioRes = await fetch(narrationUrl);
    if (!audioRes.ok) {
      return NextResponse.json(
        { erro: `Download MP3 falhou: ${audioRes.status}` },
        { status: 502 },
      );
    }
    const audioBlob = await audioRes.blob();

    // Optional prompt: script text guides Whisper for PT-PT contemplative vocabulary
    const prompt = scriptId ? findScriptTextById(scriptId)?.slice(0, 900) : undefined;

    // Call Whisper
    const form = new FormData();
    form.append("file", new File([audioBlob], "narration.mp3", { type: "audio/mpeg" }));
    form.append("model", "whisper-1");
    form.append("response_format", "srt");
    form.append("language", "pt");
    if (prompt) form.append("prompt", prompt);

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}` },
      body: form,
    });

    if (!whisperRes.ok) {
      const errText = await whisperRes.text();
      return NextResponse.json(
        { erro: `Whisper ${whisperRes.status}: ${errText.slice(0, 300)}` },
        { status: 502 },
      );
    }

    const srt = await whisperRes.text();

    // Upload SRT to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ srt, erro: "Supabase nao configurado — SRT nao persistido." }, { status: 200 });
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
