import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * POST /api/admin/longos/delete-clip
 *
 * Apaga o MP4 da cena em Supabase + remove clipUrl/clipDurationSec do
 * projecto.
 *
 * Body: { slug, promptId }
 */

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

type ProjectPrompt = {
  id: string;
  clipUrl?: string;
  clipDurationSec?: number;
  [k: string]: unknown;
};

type Project = {
  prompts?: ProjectPrompt[];
  [k: string]: unknown;
};

export async function POST(req: NextRequest) {
  const { slug, promptId } = (await req.json().catch(() => ({}))) as {
    slug?: string;
    promptId?: string;
  };
  if (!slug || !promptId) {
    return NextResponse.json(
      { erro: "slug + promptId obrigatórios" },
      { status: 400 },
    );
  }
  if (!/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug) || !/^[a-z0-9][a-z0-9-]{0,120}$/.test(promptId)) {
    return NextResponse.json({ erro: "slug ou promptId inválido" }, { status: 400 });
  }

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  // 1. Apagar MP4 (best-effort)
  await supabase.storage.from("course-assets").remove([
    `longos-clips/${slug}/${promptId}.mp4`,
  ]);

  // 2. Patch projecto
  try {
    const { data } = await supabase.storage
      .from("course-assets")
      .download(`admin/longos/${slug}.json`);
    if (data) {
      const proj = JSON.parse(await data.text()) as Project;
      const prompts = Array.isArray(proj.prompts) ? proj.prompts : [];
      const idx = prompts.findIndex((p) => p.id === promptId);
      if (idx !== -1) {
        const next = { ...prompts[idx] };
        delete next.clipUrl;
        delete next.clipDurationSec;
        prompts[idx] = next;
        const updated = {
          ...proj,
          prompts,
          updatedAt: new Date().toISOString(),
        };
        await supabase.storage
          .from("course-assets")
          .upload(`admin/longos/${slug}.json`, JSON.stringify(updated, null, 2), {
            contentType: "application/json",
            upsert: true,
          });
      }
    }
  } catch {
    /* projecto pode não existir mais */
  }

  return NextResponse.json({ ok: true });
}
