import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/longos/scan-clips
 *
 * Recupera clips órfãos: lista todos os MP4s em
 * `longos-clips/<slug>/` em Supabase e patcha o projecto com clipUrls
 * em falta. Útil quando o browser fechou entre o PUT (que já pôs o ficheiro
 * em Supabase) e o finalize-clip (que actualiza o projecto).
 *
 * Body: { slug }
 *
 * Returns: { recovered: [{ promptId, clipUrl }], missing: [promptId], total }
 *   - recovered: clips que existiam em Supabase mas não estavam no projecto
 *   - missing: promptIds do projecto que ainda não têm clip nenhum
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
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
    return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
  }

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  // 1. Carrega projecto
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
  const promptById = new Map(prompts.map((p) => [p.id, p]));

  // 2. Lista clips em Supabase para este slug
  const { data: files, error: listErr } = await supabase.storage
    .from("course-assets")
    .list(`longos-clips/${slug}`, { limit: 1000 });
  if (listErr) {
    return NextResponse.json(
      { erro: `List: ${listErr.message}` },
      { status: 500 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const ts = Date.now();
  const recovered: { promptId: string; clipUrl: string }[] = [];

  for (const f of files ?? []) {
    if (!f.name.toLowerCase().endsWith(".mp4")) continue;
    const promptId = f.name.replace(/\.mp4$/i, "");
    const promptObj = promptById.get(promptId);
    if (!promptObj) continue; // ficheiro órfão, sem prompt correspondente — ignorar
    if (promptObj.clipUrl) continue; // já está no projecto — nada a fazer

    const clipUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/longos-clips/${slug}/${f.name}?t=${ts}`;
    promptObj.clipUrl = clipUrl;
    recovered.push({ promptId, clipUrl });
  }

  // 3. Se houve recoveries, persiste o projecto
  if (recovered.length > 0) {
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
        { erro: `Patch projecto: ${upErr.message}` },
        { status: 500 },
      );
    }
  }

  const missing = prompts.filter((p) => !p.clipUrl).map((p) => p.id);

  return NextResponse.json({
    recovered,
    missing,
    total: prompts.length,
  });
}
