import { NextRequest, NextResponse } from "next/server";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/aulas/audio-rename
 *   body: { slug, dryRun?: boolean }
 *
 * Lista os MP3 em course-assets/curso-<slug>/ e adiciona o prefixo
 * m<N>-<letter>- aos que ainda não o têm (gerados pela versão antiga do
 * generate-one). Faz match por:
 *
 *   1. Procurar nas presets nomear-scripts.ts um script com curso=<slug> cujo
 *      titulo, depois de slugificado, esteja contido no nome do ficheiro.
 *   2. Extrair m<N><letter> do id (ex.: "ouro-proprio-m1a" → "m1-a-").
 *
 * O rename real é uma cópia + delete (Storage não tem move atómico). Files já
 * com prefixo correcto são ignorados. dryRun devolve só o plano sem alterar.
 */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ScriptIndex = { id: string; titulo: string; titleSlug: string };

function buildScriptIndex(courseSlug: string): ScriptIndex[] {
  const out: ScriptIndex[] = [];
  for (const preset of NOMEAR_PRESETS) {
    for (const s of preset.scripts) {
      if (s.curso === courseSlug) {
        out.push({ id: s.id, titulo: s.titulo, titleSlug: slugify(s.titulo) });
      }
    }
  }
  return out;
}

function inferPrefixFromId(id: string): string | null {
  const m = id.match(/-m(\d+)([a-zA-Z])$/);
  if (!m) return null;
  return `m${m[1]}-${m[2].toLowerCase()}-`;
}

export async function POST(req: NextRequest) {
  let body: { slug?: string; dryRun?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  const slug = (body.slug ?? "").trim();
  const dryRun = body.dryRun !== false; // default true (segurança)
  if (!slug) return NextResponse.json({ erro: "slug obrigatório" }, { status: 400 });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const folder = `curso-${slug}`;
  const { data: files, error: listErr } = await supabase.storage
    .from("course-assets")
    .list(folder, { limit: 1000 });

  if (listErr) {
    return NextResponse.json({ erro: `Lista falhou: ${listErr.message}` }, { status: 500 });
  }
  if (!files) {
    return NextResponse.json({ erro: "Pasta não encontrada" }, { status: 404 });
  }

  const scriptIndex = buildScriptIndex(slug);

  type Plan = {
    current: string;
    target: string | null;
    scriptId: string | null;
    action: "skip-already-prefixed" | "rename" | "no-match";
  };
  const plan: Plan[] = [];

  for (const f of files) {
    if (!f.name.toLowerCase().endsWith(".mp3")) continue;

    // Já tem prefixo m{N}-{letter}-? skip
    if (/^m\d+-[a-z]-/i.test(f.name)) {
      plan.push({
        current: f.name,
        target: null,
        scriptId: null,
        action: "skip-already-prefixed",
      });
      continue;
    }

    // Tenta match: o slug do título tem que aparecer no nome do ficheiro.
    // Preferimos o match com titleSlug mais comprido (mais específico).
    const fnameLower = f.name.toLowerCase();
    const candidates = scriptIndex
      .filter((s) => s.titleSlug.length > 0 && fnameLower.includes(s.titleSlug))
      .sort((a, b) => b.titleSlug.length - a.titleSlug.length);

    if (candidates.length === 0) {
      plan.push({
        current: f.name,
        target: null,
        scriptId: null,
        action: "no-match",
      });
      continue;
    }

    const matched = candidates[0];
    const prefix = inferPrefixFromId(matched.id);
    if (!prefix) {
      plan.push({
        current: f.name,
        target: null,
        scriptId: matched.id,
        action: "no-match",
      });
      continue;
    }

    plan.push({
      current: f.name,
      target: `${prefix}${f.name}`,
      scriptId: matched.id,
      action: "rename",
    });
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      folder,
      total: plan.length,
      toRename: plan.filter((p) => p.action === "rename").length,
      alreadyPrefixed: plan.filter((p) => p.action === "skip-already-prefixed").length,
      noMatch: plan.filter((p) => p.action === "no-match").length,
      plan,
    });
  }

  // Apply: copy → delete
  const results: Array<{ from: string; to: string; ok: boolean; erro?: string }> = [];
  for (const p of plan) {
    if (p.action !== "rename" || !p.target) continue;
    const from = `${folder}/${p.current}`;
    const to = `${folder}/${p.target}`;

    // download
    const { data: blob, error: dlErr } = await supabase.storage
      .from("course-assets")
      .download(from);
    if (dlErr || !blob) {
      results.push({ from: p.current, to: p.target, ok: false, erro: dlErr?.message ?? "download falhou" });
      continue;
    }

    // upload novo
    const { error: upErr } = await supabase.storage
      .from("course-assets")
      .upload(to, blob, { upsert: true, contentType: "audio/mpeg" });
    if (upErr) {
      results.push({ from: p.current, to: p.target, ok: false, erro: `upload: ${upErr.message}` });
      continue;
    }

    // delete antigo
    const { error: rmErr } = await supabase.storage
      .from("course-assets")
      .remove([from]);
    if (rmErr) {
      results.push({
        from: p.current,
        to: p.target,
        ok: true,
        erro: `aviso: copia OK mas delete falhou: ${rmErr.message}`,
      });
      continue;
    }

    results.push({ from: p.current, to: p.target, ok: true });
  }

  return NextResponse.json({
    ok: results.every((r) => r.ok),
    dryRun: false,
    folder,
    renamed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
    skipped: plan.filter((p) => p.action !== "rename").length,
    noMatch: plan.filter((p) => p.action === "no-match").map((p) => p.current),
  });
}
