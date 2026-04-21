import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

/**
 * POST /api/admin/funil/generate-srt
 *
 * Gera SRT para a narração via ElevenLabs Speech-to-Text (Scribe).
 * Usa a ELEVENLABS_API_KEY já configurada para o bulk audio.
 *
 * Body: { narrationUrl, scriptId?, filename? }
 * Retorna: { url, srt }
 */

type Body = {
  narrationUrl?: string;
  scriptId?: string;
  filename?: string;
};

type ScribeWord = {
  text: string;
  type?: "word" | "spacing" | "audio_event";
  start?: number;
  end?: number;
};

type ScribeResponse = {
  language_code?: string;
  text?: string;
  words?: ScribeWord[];
};

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

/**
 * Group Scribe words into SRT-friendly lines.
 * New line when:
 *  - gap >= 0.8s between words
 *  - current line has >= 10 words
 *  - current line duration >= 4s
 *  - previous word ended with . ! ? :
 */
function wordsToSrt(words: ScribeWord[]): string {
  const speaking = words.filter(
    (w) => w && w.type === "word" && typeof w.start === "number" && typeof w.end === "number" && w.text,
  );
  if (speaking.length === 0) return "";

  type Line = { start: number; end: number; text: string };
  const lines: Line[] = [];
  let buf: ScribeWord[] = [];
  let bufStart = speaking[0].start!;
  let prevEnd = speaking[0].start!;

  const flush = () => {
    if (buf.length === 0) return;
    const text = buf.map((w) => w.text).join(" ").replace(/\s+([.,!?;:])/g, "$1");
    lines.push({ start: bufStart, end: prevEnd, text });
    buf = [];
  };

  for (const w of speaking) {
    const gap = buf.length === 0 ? 0 : w.start! - prevEnd;
    const lineDuration = buf.length === 0 ? 0 : w.end! - bufStart;
    const lastWordEnded = buf.length > 0 && /[.!?:]$/.test(buf[buf.length - 1].text);

    const shouldBreak =
      buf.length > 0 &&
      (gap >= 0.8 || buf.length >= 10 || lineDuration >= 4 || lastWordEnded);

    if (shouldBreak) flush();

    if (buf.length === 0) bufStart = w.start!;
    buf.push(w);
    prevEnd = w.end!;
  }
  flush();

  return lines
    .map((l, i) => `${i + 1}\n${fmtSrtTime(l.start)} --> ${fmtSrtTime(l.end)}\n${l.text.trim()}\n`)
    .join("\n");
}

async function transcribeElevenLabs(narrationUrl: string): Promise<{ srt: string } | { erro: string }> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return { erro: "ELEVENLABS_API_KEY ausente" };

  const audioRes = await fetch(narrationUrl);
  if (!audioRes.ok) return { erro: `Download MP3 ${audioRes.status}` };
  const audioBlob = await audioRes.blob();

  const form = new FormData();
  form.append("file", new File([audioBlob], "narration.mp3", { type: "audio/mpeg" }));
  form.append("model_id", "scribe_v1");
  form.append("language_code", "por");
  form.append("timestamps_granularity", "word");
  form.append("tag_audio_events", "false");
  form.append("diarize", "false");

  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    return { erro: `ElevenLabs Scribe ${res.status}: ${err.slice(0, 300)}` };
  }

  const data = (await res.json()) as ScribeResponse;
  const words = Array.isArray(data.words) ? data.words : [];
  if (words.length === 0) {
    return { erro: "ElevenLabs Scribe nao devolveu words (transcricao vazia)" };
  }

  return { srt: wordsToSrt(words) };
}

export async function POST(req: NextRequest) {
  try {
    const { narrationUrl, scriptId, filename }: Body = await req.json();
    if (!narrationUrl) {
      return NextResponse.json({ erro: "narrationUrl obrigatorio." }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { erro: "ELEVENLABS_API_KEY nao configurada." },
        { status: 500 },
      );
    }

    const result = await transcribeElevenLabs(narrationUrl);
    if ("erro" in result) {
      return NextResponse.json({ erro: result.erro }, { status: 502 });
    }
    const srt = result.srt;

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
