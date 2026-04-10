import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

/**
 * POST /api/admin/courses/generate-music
 *
 * Generates instrumental background music using Suno via API.box wrapper.
 *
 * Generate: POST ${SUNO_API_URL}/api/suno/submit/music
 * Poll:     GET  ${SUNO_API_URL}/api/suno/fetch?taskId=XXX
 *
 * Env: SUNO_API_KEY (API.box Bearer token), SUNO_API_URL (https://apibox.erweima.ai)
 *
 * Body: {
 *   prompt?: string,      — style/genre tags (< 200 chars)
 *   durationSec?: number,  — ignored by Suno but returned in response
 *   courseSlug: string,
 * }
 * Returns: { audioUrl, durationSec, title }
 */

const DEFAULT_PROMPT =
  "ambient piano, warm strings, contemplative, cinematic underscore, " +
  "gentle pads, meditative, no vocals, 80 BPM";

export async function POST(req: NextRequest) {
  try {
    const { prompt, durationSec = 120, courseSlug } = await req.json();

    if (!courseSlug) {
      return NextResponse.json({ erro: "courseSlug obrigatorio." }, { status: 400 });
    }

    const apiKey = process.env.SUNO_API_KEY;
    const apiUrl = process.env.SUNO_API_URL;
    if (!apiKey || !apiUrl) {
      return NextResponse.json({ erro: "SUNO_API_KEY e SUNO_API_URL obrigatorios." }, { status: 400 });
    }

    const baseUrl = apiUrl.replace(/\/+$/, "");
    const musicPrompt = prompt || DEFAULT_PROMPT;

    // 1. Submit generation — try /api/suno/submit/music first, fallback to /api/v1/generate
    const submitResult = await submitGeneration(baseUrl, apiKey, musicPrompt);

    if (!submitResult.taskId) {
      return NextResponse.json(
        { erro: `API.box nao devolveu taskId.`, debug: submitResult.rawResponses },
        { status: 500 },
      );
    }

    const taskId = submitResult.taskId;

    // 2. Poll for completion (5s intervals, up to 2 min)
    const result = await pollForResult(baseUrl, apiKey, taskId);

    if (!result) {
      return NextResponse.json(
        { erro: "Timeout: musica nao ficou pronta em 2 minutos.", taskId },
        { status: 500 },
      );
    }

    // 3. Upload to Supabase
    const uploaded = await uploadToSupabase(result.audioUrl, courseSlug);

    return NextResponse.json({
      audioUrl: uploaded || result.audioUrl,
      durationSec: result.duration || durationSec,
      title: result.title || "Instrumental",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

// ─── Submit ──────────────────────────────────────────────────────

async function submitGeneration(
  baseUrl: string,
  apiKey: string,
  prompt: string,
): Promise<{ taskId: string | null; rawResponses: unknown[] }> {
  // callBackUrl is required by API.box — we use a dummy since we poll instead
  const body = JSON.stringify({
    customMode: false,
    instrumental: true,
    model: "V5_5",
    prompt,
    callBackUrl: "https://escola.seteveus.space/api/webhook/suno",
  });

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  };

  const rawResponses: unknown[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/v1/generate`, {
      method: "POST",
      headers,
      body,
    });

    const data = await res.json();
    rawResponses.push({ endpoint: "/api/v1/generate", status: res.status, data });

    // API.box returns code 200 with nested data, or code != 200 for errors
    if (data?.code === 200 || res.ok) {
      const taskId = data?.data?.taskId || data?.taskId || data?.data?.data?.taskId || null;
      if (taskId) return { taskId, rawResponses };
    }
  } catch (e) {
    rawResponses.push({ endpoint: "/api/v1/generate", error: String(e) });
  }

  return { taskId: null, rawResponses };
}

// ─── Poll ────────────────────────────────────────────────────────

async function pollForResult(
  baseUrl: string,
  apiKey: string,
  taskId: string,
): Promise<{ audioUrl: string; duration?: number; title?: string } | null> {
  const headers = { "Authorization": `Bearer ${apiKey}` };

  for (let i = 0; i < 24; i++) {
    await new Promise((r) => setTimeout(r, 5000));

    // Try primary status endpoint: GET /api/suno/fetch?taskId=XXX
    const clip = await tryFetchStatus(`${baseUrl}/api/suno/fetch?taskId=${taskId}`, headers);
    if (clip) return clip;
    if (clip === false) return null; // explicitly failed

    // Fallback: POST /api/suno/fetch with body
    const clip2 = await tryFetchStatusPost(`${baseUrl}/api/suno/fetch`, headers, taskId);
    if (clip2) return clip2;
    if (clip2 === false) return null;

    // Last resort: GET /api/v1/generate/record-info?taskId=XXX
    const clip3 = await tryFetchStatus(`${baseUrl}/api/v1/generate/record-info?taskId=${taskId}`, headers);
    if (clip3) return clip3;
    if (clip3 === false) return null;
  }
  return null;
}

// Returns: object = done, null = still processing, false = failed
async function tryFetchStatus(
  url: string,
  headers: Record<string, string>,
): Promise<{ audioUrl: string; duration?: number; title?: string } | null | false> {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return parseStatusResponse(await res.json());
  } catch {
    return null;
  }
}

async function tryFetchStatusPost(
  url: string,
  headers: Record<string, string>,
  taskId: string,
): Promise<{ audioUrl: string; duration?: number; title?: string } | null | false> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });
    if (!res.ok) return null;
    return parseStatusResponse(await res.json());
  } catch {
    return null;
  }
}

function parseStatusResponse(
  data: Record<string, unknown>,
): { audioUrl: string; duration?: number; title?: string } | null | false {
  const record = (data?.data || data) as Record<string, unknown>;
  const status = String(record?.status || "").toLowerCase();

  if (status === "failed" || status === "error") return false;

  if (status === "success" || status === "complete" || status === "completed") {
    // Response shape: data.response.sunoData[0].audioUrl
    const response = record?.response as Record<string, unknown> | undefined;
    const sunoData = (response?.sunoData || response?.data || record?.sunoData) as
      Array<Record<string, unknown>> | undefined;

    if (sunoData && sunoData.length > 0) {
      const first = sunoData[0];
      const audioUrl = (first.audioUrl || first.audio_url || first.streamAudioUrl || first.stream_audio_url) as string;
      if (audioUrl) {
        return {
          audioUrl,
          duration: first.duration as number | undefined,
          title: first.title as string | undefined,
        };
      }
    }
  }

  return null; // still processing
}

// ─── Upload to Supabase ──────────────────────────────────────────

async function uploadToSupabase(audioUrl: string, courseSlug: string): Promise<string | null> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;

  try {
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) return null;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const filePath = `courses/${courseSlug}/music/instrumental-${Date.now()}.mp3`;
    const buffer = new Uint8Array(await audioRes.arrayBuffer());
    const { error } = await supabase.storage
      .from("course-assets")
      .upload(filePath, buffer, { contentType: "audio/mpeg", upsert: true });
    if (!error) return `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
  } catch { /* fallback */ }
  return null;
}
