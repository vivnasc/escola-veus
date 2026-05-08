import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/longos/append-mj-params
 *
 * Para projectos gerados antes do schema do gen-project incluir params MJ
 * obrigatórios, adiciona ao final de cada `prompt` os params em falta:
 * `--ar 16:9 --v <ver> --style <style> --s <s>`.
 *
 * Operação idempotente: se um prompt já tem `--ar` (qualquer valor), não
 * modifica esse. Se já tem `--v`, não substitui. Etc. Só ADICIONA o que
 * estiver em falta.
 *
 * Body: { slug, ar?, v?, style?, s? }
 *   defaults: ar=16:9, v=7, style=raw, s=50
 *
 * Returns: { patched, total }
 */

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

type ProjectPrompt = {
  id: string;
  prompt?: string;
  [k: string]: unknown;
};

type Project = {
  prompts?: ProjectPrompt[];
  [k: string]: unknown;
};

// Adiciona um param MJ ao prompt se ainda não estiver presente.
// Detecta qualquer valor para o flag (não só o default), para não
// duplicar quando a Vivianne já meteu --v 6.1 manualmente.
function ensureParam(prompt: string, flag: string, value: string): string {
  // Match `--ar 16:9` ou `--ar 9:16` ou `--ar1:1` etc — flag seguida de qualquer valor não-flag.
  const re = new RegExp(`(^|\\s)${flag}\\s+\\S+`, "i");
  if (re.test(prompt)) return prompt;
  return `${prompt.trimEnd()} ${flag} ${value}`;
}

export async function POST(req: NextRequest) {
  let body: { slug?: string; ar?: string; v?: string; style?: string; s?: string | number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const slug = (body.slug || "").trim();
  if (!slug || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
    return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
  }
  const ar = (body.ar || "16:9").trim();
  const v = (body.v || "7").trim();
  const style = (body.style || "raw").trim();
  const s = String(body.s ?? "50").trim();

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  let proj: Project;
  try {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .download(`admin/longos/${slug}.json`);
    if (error || !data) {
      return NextResponse.json({ erro: "Projecto não encontrado" }, { status: 404 });
    }
    proj = JSON.parse(await data.text()) as Project;
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  const prompts = Array.isArray(proj.prompts) ? proj.prompts : [];
  let patched = 0;
  for (const p of prompts) {
    if (!p.prompt) continue;
    const before = p.prompt;
    let next = p.prompt;
    next = ensureParam(next, "--ar", ar);
    next = ensureParam(next, "--v", v);
    next = ensureParam(next, "--style", style);
    next = ensureParam(next, "--s", s);
    if (next !== before) {
      p.prompt = next;
      patched++;
    }
  }

  if (patched > 0) {
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
      return NextResponse.json(
        { erro: `Patch projecto: ${upErr.message}`, patched },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    patched,
    total: prompts.length,
    appliedParams: { ar, v, style, s },
  });
}
