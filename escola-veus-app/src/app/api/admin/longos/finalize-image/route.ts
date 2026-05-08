import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * POST /api/admin/longos/finalize-image
 *
 * Após o browser fazer PUT directo da imagem para Supabase (via signed URL
 * de /upload-image), este endpoint patcha o projecto: regista `imageUrl`
 * no prompt respectivo. O generate-clips/submit depois usa este imageUrl
 * em vez de gerar via fal.ai.
 *
 * Body: { slug, promptId, imageUrl }
 */

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

type ProjectPrompt = {
  id: string;
  imageUrl?: string;
  [k: string]: unknown;
};

type Project = {
  prompts?: ProjectPrompt[];
  [k: string]: unknown;
};

export async function POST(req: NextRequest) {
  let body: { slug?: string; promptId?: string; imageUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const { slug, promptId, imageUrl } = body;
  if (!slug || !promptId || !imageUrl) {
    return NextResponse.json(
      { erro: "slug, promptId, imageUrl obrigatórios" },
      { status: 400 },
    );
  }

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  try {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .download(`admin/longos/${slug}.json`);
    if (error || !data) {
      return NextResponse.json({ erro: "Projecto não encontrado" }, { status: 404 });
    }
    const proj = JSON.parse(await data.text()) as Project;
    const prompts = Array.isArray(proj.prompts) ? proj.prompts : [];
    const idx = prompts.findIndex((p) => p.id === promptId);
    if (idx === -1) {
      return NextResponse.json(
        { erro: `Prompt "${promptId}" não existe no projecto` },
        { status: 404 },
      );
    }
    prompts[idx] = { ...prompts[idx], imageUrl };

    const updated = {
      ...proj,
      prompts,
      updatedAt: new Date().toISOString(),
    };

    const { error: upErr } = await supabase.storage
      .from("course-assets")
      .upload(`admin/longos/${slug}.json`, JSON.stringify(updated, null, 2), {
        contentType: "application/json",
        upsert: true,
      });
    if (upErr) {
      return NextResponse.json({ erro: `Upload: ${upErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, prompt: prompts[idx] });
  } catch (err) {
    return NextResponse.json(
      { erro: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
