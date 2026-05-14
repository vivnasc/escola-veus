import { NextResponse } from "next/server";

import { MOOD_PROMPTS, type MorningMood } from "@/lib/vc-sabia/audio";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * GET /api/admin/vc-sabia/audios
 *
 * Lista todos os audios gerados em
 * course-assets/vc-sabia-audios/<mood>/, agrupados por mood.
 *
 * Returns: { byMood: Record<MorningMood, AudioFile[]> }
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const moods = Object.keys(MOOD_PROMPTS) as MorningMood[];
  const byMood: Record<string, Array<{
    name: string;
    url: string;
    sizeBytes: number;
    createdAt: string | null;
  }>> = {};

  for (const mood of moods) {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .list(`vc-sabia-audios/${mood}`, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
    if (error) {
      byMood[mood] = [];
      continue;
    }
    byMood[mood] = (data || [])
      .filter((f) => f.name && /\.(mp3|wav|ogg|flac|m4a)$/i.test(f.name))
      .map((f) => ({
        name: f.name,
        url: `${supabaseUrl}/storage/v1/object/public/course-assets/vc-sabia-audios/${mood}/${f.name}`,
        sizeBytes: f.metadata?.size ?? 0,
        createdAt: f.created_at ?? null,
      }));
  }

  return NextResponse.json({ byMood });
}
