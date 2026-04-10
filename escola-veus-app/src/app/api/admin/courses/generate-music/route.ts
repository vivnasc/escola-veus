import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

/**
 * POST /api/admin/courses/generate-music
 *
 * Generates instrumental background music using Suno API (third-party wrapper).
 * Tries multiple known endpoint formats since there's no official Suno API.
 * Uploads to Supabase and returns URL.
 *
 * Env: SUNO_API_KEY, SUNO_API_URL (base URL of the wrapper, e.g. https://api.sunoapi.org)
 *
 * Body: {
 *   prompt?: string,      — style description
 *   durationSec?: number,  — target duration (default: 120)
 *   courseSlug: string,
 * }
 * Returns: { audioUrl, durationSec, title }
 */

const DEFAULT_PROMPT =
  "ambient contemplative instrumental, soft subtle piano and warm pads, " +
  "slow tempo, meditative, no vocals, no lyrics, no drums, " +
  "gentle atmospheric texture, background music for narration";

// Known endpoint formats for Suno API wrappers
const ENDPOINT_FORMATS = [
  { path: "/api/v1/generate", bodyFn: makeBodyV1 },   // sunoapi.org
  { path: "/api/generate", bodyFn: makeBodyLegacy },   // gcui-art/suno-api
  { path: "/v1/generate", bodyFn: makeBodyV1 },        // alternative
  { path: "/generate", bodyFn: makeBodyV1 },            // minimal
];

function makeBodyV1(prompt: string, durationSec: number) {
  return {
    prompt,
    instrumental: true,
    model: "chirp-v3-5",
    wait_audio: true,
  };
}

function makeBodyLegacy(prompt: string, durationSec: number) {
  return {
    prompt,
    make_instrumental: true,
    wait_audio: true,
  };
}

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

    const musicPrompt = prompt || DEFAULT_PROMPT;
    const baseUrl = apiUrl.replace(/\/+$/, ""); // trim trailing slashes

    // Try each known endpoint format
    const errors: string[] = [];
    for (const { path, bodyFn } of ENDPOINT_FORMATS) {
      const url = `${baseUrl}${path}`;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify(bodyFn(musicPrompt, durationSec)),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          errors.push(`${path}: ${res.status} ${errText.slice(0, 100)}`);
          continue;
        }

        const data = await res.json();

        // Extract audio URL from various response formats
        const generations = Array.isArray(data) ? data : data.data || [data];
        const first = generations[0];

        if (!first) {
          errors.push(`${path}: resposta vazia`);
          continue;
        }

        let audioUrl = first.audio_url || first.url || first.audio || first.stream_url;

        // If Suno returns an ID, poll for completion
        if (!audioUrl && first.id) {
          audioUrl = await pollSunoResult(baseUrl, apiKey, first.id);
        }

        if (!audioUrl) {
          errors.push(`${path}: sem URL de audio na resposta`);
          continue;
        }

        // Success — upload to Supabase
        const uploaded = await uploadToSupabase(audioUrl, courseSlug);
        return NextResponse.json({
          audioUrl: uploaded || audioUrl,
          durationSec: first.duration || durationSec,
          title: first.title || "Instrumental",
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${path}: ${msg.slice(0, 100)}`);
      }
    }

    // All endpoints failed
    return NextResponse.json({
      erro: `Nenhum endpoint Suno funcionou. SUNO_API_URL=${baseUrl}. Tentativas: ${errors.join(" | ")}`,
    }, { status: 500 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

async function pollSunoResult(baseUrl: string, apiKey: string, id: string): Promise<string | null> {
  // Try known status endpoints
  const statusPaths = [
    `/api/v1/status/${id}`,
    `/api/get?ids=${id}`,
    `/v1/status/${id}`,
  ];

  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 5000));

    for (const path of statusPaths) {
      try {
        const res = await fetch(`${baseUrl}${path}`, {
          headers: { "Authorization": `Bearer ${apiKey}` },
        });
        if (!res.ok) continue;

        const data = await res.json();
        const item = Array.isArray(data) ? data[0] : data;
        if (item?.audio_url) return item.audio_url;
        if (item?.stream_url) return item.stream_url;
        if (item?.status === "error" || item?.status === "failed") return null;
        break; // found a working status endpoint, wait for next poll
      } catch {
        continue;
      }
    }
  }
  return null;
}

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
