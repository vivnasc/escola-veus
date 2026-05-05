import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 300; // long-form pode ter 25min de audio
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/longos/generate-srt
 *
 * Gera SRT para a narração longo via ElevenLabs Speech-to-Text (Scribe).
 * Cacheado por slug — re-chamadas sobrescrevem em vez de criar múltiplos.
 * Patcha o projecto com subtitlesUrl.
 *
 * Body: { slug }  (lê narrationUrl do projecto guardado)
 * Returns: { url, srt, lineCount }
 *
 * Mesma infra do /admin/funil/generate-srt — se ajustares lá, ajusta aqui.
 */

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

// Group Scribe words into SRT lines. Mesma heurística do funil:
// - gap >= 0.8s
// - linha >= 10 palavras
// - linha >= 4s duração
// - palavra anterior terminou em . ! ? :
function wordsToSrt(words: ScribeWord[]): string {
  const speaking = words.filter(
    (w) =>
      w &&
      w.type === "word" &&
      typeof w.start === "number" &&
      typeof w.end === "number" &&
      w.text,
  );
  if (speaking.length === 0) return "";

  type Line = { start: number; end: number; text: string };
  const lines: Line[] = [];
  let buf: ScribeWord[] = [];
  let bufStart = speaking[0].start!;
  let prevEnd = speaking[0].start!;

  const flush = () => {
    if (buf.length === 0) return;
    const text = buf
      .map((w) => w.text)
      .join(" ")
      .replace(/\s+([.,!?;:])/g, "$1");
    lines.push({ start: bufStart, end: prevEnd, text });
    buf = [];
  };

  for (const w of speaking) {
    const gap = buf.length === 0 ? 0 : w.start! - prevEnd;
    const lineDuration = buf.length === 0 ? 0 : w.end! - bufStart;
    const lastWordEnded =
      buf.length > 0 && /[.!?:]$/.test(buf[buf.length - 1].text);

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
    .map(
      (l, i) =>
        `${i + 1}\n${fmtSrtTime(l.start)} --> ${fmtSrtTime(l.end)}\n${l.text.trim()}\n`,
    )
    .join("\n");
}

async function transcribe(narrationUrl: string): Promise<{ srt: string } | { erro: string }> {
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
    return { erro: "Scribe não devolveu words (transcrição vazia)" };
  }

  return { srt: wordsToSrt(words) };
}

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const slug = (body.slug || "").trim();
  if (!slug || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
    return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
  }

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  // Carrega projecto para obter narrationUrl
  let narrationUrl: string | undefined;
  let proj: Record<string, unknown> = {};
  try {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .download(`admin/longos/${slug}.json`);
    if (error || !data) {
      return NextResponse.json({ erro: "Projecto não encontrado" }, { status: 404 });
    }
    proj = JSON.parse(await data.text());
    narrationUrl = proj.narrationUrl as string | undefined;
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  if (!narrationUrl) {
    return NextResponse.json(
      { erro: "Projecto não tem narração ainda — gera primeiro" },
      { status: 400 },
    );
  }

  const result = await transcribe(narrationUrl);
  if ("erro" in result) {
    return NextResponse.json({ erro: result.erro }, { status: 502 });
  }
  const srt = result.srt;
  const lineCount = srt.split("\n\n").filter(Boolean).length;

  // Upload SRT (filename fixo por slug → idempotente, sem timestamp)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const storagePath = `longos-subtitles/${slug}.srt`;
  const { error: upErr } = await supabase.storage
    .from("course-assets")
    .upload(storagePath, new Blob([srt], { type: "application/x-subrip" }), {
      contentType: "application/x-subrip",
      upsert: true,
    });
  if (upErr) {
    return NextResponse.json(
      { srt, erro: `Upload SRT: ${upErr.message}` },
      { status: 500 },
    );
  }

  const subtitlesUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${storagePath}?t=${Date.now()}`;

  // Patch projecto com subtitlesUrl
  try {
    const updated = {
      ...proj,
      subtitlesUrl,
      updatedAt: new Date().toISOString(),
    };
    await supabase.storage
      .from("course-assets")
      .upload(`admin/longos/${slug}.json`, JSON.stringify(updated, null, 2), {
        contentType: "application/json",
        upsert: true,
      });
  } catch {
    /* não bloqueia — retornamos o SRT mesmo assim */
  }

  return NextResponse.json({ url: subtitlesUrl, srt, lineCount });
}
