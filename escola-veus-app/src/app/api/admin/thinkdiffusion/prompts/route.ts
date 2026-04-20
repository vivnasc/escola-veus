import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import seedPrompts from "@/data/thinkdiffusion-prompts.json";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PromptRow = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
  sort_order?: number;
};

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * GET /api/admin/thinkdiffusion/prompts
 * Lista todos os prompts. Se a tabela nao existe (ou erro), devolve o seed do JSON.
 */
export async function GET() {
  const sb = getAdmin();
  if (!sb) {
    return NextResponse.json({
      source: "json",
      config: seedPrompts.config,
      prompts: seedPrompts.prompts,
    });
  }

  const { data, error } = await sb
    .from("thinkdiffusion_prompts")
    .select("id, category, mood, prompt, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return NextResponse.json({
      source: "json",
      config: seedPrompts.config,
      prompts: seedPrompts.prompts,
      erro: error?.message,
    });
  }

  const { data: configRow } = await sb
    .from("thinkdiffusion_config")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  const config = configRow
    ? {
        checkpoint: configRow.checkpoint,
        width: configRow.width,
        height: configRow.height,
        cfg_scale: Number(configRow.cfg_scale),
        steps: configRow.steps,
        sampler_name: configRow.sampler_name,
        batch_size: configRow.batch_size,
        negative_prompt: configRow.negative_prompt,
      }
    : seedPrompts.config;

  return NextResponse.json({ source: "supabase", config, prompts: data });
}

/**
 * PUT /api/admin/thinkdiffusion/prompts
 * Body: { id, prompt, mood?, category? } OR { config: {...} }
 * Actualiza um prompt ou a config global.
 */
export async function PUT(req: NextRequest) {
  const sb = getAdmin();
  if (!sb) return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });

  const body = await req.json();

  // Config update
  if (body.config) {
    const c = body.config;
    const { error } = await sb
      .from("thinkdiffusion_config")
      .upsert({
        id: "default",
        checkpoint: c.checkpoint,
        width: c.width,
        height: c.height,
        cfg_scale: c.cfg_scale,
        steps: c.steps,
        sampler_name: c.sampler_name,
        batch_size: c.batch_size,
        negative_prompt: c.negative_prompt,
        updated_at: new Date().toISOString(),
      });
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Prompt update
  if (!body.id || typeof body.prompt !== "string") {
    return NextResponse.json({ erro: "id e prompt obrigatorios" }, { status: 400 });
  }

  const update: Record<string, unknown> = {
    prompt: body.prompt,
    updated_at: new Date().toISOString(),
  };
  if (Array.isArray(body.mood)) update.mood = body.mood;
  if (typeof body.category === "string") update.category = body.category;

  const { error } = await sb
    .from("thinkdiffusion_prompts")
    .update(update)
    .eq("id", body.id);

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/**
 * POST /api/admin/thinkdiffusion/prompts
 * Body: { action: "seed" } — importa JSON para Supabase (upsert)
 * Body: { id, category, mood, prompt } — cria novo prompt
 */
export async function POST(req: NextRequest) {
  const sb = getAdmin();
  if (!sb) return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });

  const body = await req.json();

  if (body.action === "seed") {
    const rows = (seedPrompts.prompts as PromptRow[]).map((p, idx) => ({
      id: p.id,
      category: p.category,
      mood: p.mood || [],
      prompt: p.prompt,
      sort_order: idx,
    }));

    const { error } = await sb
      .from("thinkdiffusion_prompts")
      .upsert(rows, { onConflict: "id" });

    if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

    // Seed config too
    await sb.from("thinkdiffusion_config").upsert({
      id: "default",
      checkpoint: seedPrompts.config.checkpoint,
      width: seedPrompts.config.width,
      height: seedPrompts.config.height,
      cfg_scale: seedPrompts.config.cfg_scale,
      steps: seedPrompts.config.steps,
      sampler_name: seedPrompts.config.sampler_name,
      batch_size: seedPrompts.config.batch_size,
      negative_prompt: seedPrompts.config.negative_prompt,
    });

    return NextResponse.json({ ok: true, count: rows.length });
  }

  // New prompt
  if (!body.id || !body.category || typeof body.prompt !== "string") {
    return NextResponse.json({ erro: "id, category, prompt obrigatorios" }, { status: 400 });
  }

  // Determine sort_order
  const { data: maxRow } = await sb
    .from("thinkdiffusion_prompts")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { error } = await sb.from("thinkdiffusion_prompts").insert({
    id: body.id,
    category: body.category,
    mood: body.mood || [],
    prompt: body.prompt,
    sort_order: sortOrder,
  });

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/admin/thinkdiffusion/prompts?id=xxx
 */
export async function DELETE(req: NextRequest) {
  const sb = getAdmin();
  if (!sb) return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ erro: "id obrigatorio" }, { status: 400 });

  const { error } = await sb.from("thinkdiffusion_prompts").delete().eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
