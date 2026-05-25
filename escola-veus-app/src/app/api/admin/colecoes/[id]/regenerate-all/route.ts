import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { gerarColecaoComClaude } from "@/lib/carousel-generate";
import type { Dia } from "@/lib/carousel-types";

async function loadUsedDayNames(admin: SupabaseClient, excludeId?: string): Promise<string[]> {
  try {
    let q = admin.from("carousel_collections").select("id, dias");
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q;
    if (!data) return [];
    const names = new Set<string>();
    for (const row of data) {
      const dias = row.dias as Dia[] | null;
      if (!Array.isArray(dias)) continue;
      for (const d of dias) {
        if (d.veu) names.add(d.veu.toUpperCase().trim());
      }
    }
    return [...names].sort();
  } catch {
    return [];
  }
}

export const dynamic = "force-dynamic";
// Igual ao /create — Claude leva 30-90s para 7×6 slides.
export const maxDuration = 300;

/**
 * POST /api/admin/colecoes/[id]/regenerate-all
 * Body: { brief?: string }
 *
 * Regenera a colecção INTEIRA com o SYSTEM_PROMPT actual. Útil para forçar
 * uma colecção existente a passar pela versão nova do prompt (framework
 * dos véus, banimento de travessões, notaVisual/fundoClaro automáticos).
 *
 * Substitui o campo `dias` na DB. Preserva título, slug, theme, owner.
 * Brief opcional no body: se enviado, usa esse; senão usa o que estava
 * guardado na colecção.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "ANTHROPIC_API_KEY não configurada" }, { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as { brief?: string };
  const briefOverride = (body.brief || "").trim();

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ erro: "Supabase admin indisponível" }, { status: 500 });
  }

  const { data: col, error: rdErr } = await admin
    .from("carousel_collections")
    .select("title, brief, dias")
    .eq("id", id)
    .maybeSingle();
  if (rdErr || !col) {
    return NextResponse.json({ erro: "colecção não encontrada" }, { status: 404 });
  }

  const title = String(col.title || "").trim();
  const brief = briefOverride || String(col.brief || "").trim();
  if (!title || !brief) {
    return NextResponse.json(
      { erro: "Sem title ou brief na colecção. Passa brief no body se necessário." },
      { status: 400 }
    );
  }

  const numDias = Array.isArray(col.dias) ? Math.max(1, (col.dias as Dia[]).length) : 7;

  // Nomes já usados noutras coleções (excluindo esta) para Claude evitar
  const usedNames = await loadUsedDayNames(admin, id);
  console.log(`[carousel-regen-all] ${usedNames.length} nomes proibidos:`, usedNames.slice(0, 20).join(", "));

  let generated: { dias: Dia[]; usage: unknown };
  try {
    generated = await gerarColecaoComClaude({ apiKey, title, brief, numDias, usedNames });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Claude falhou: ${msg}` }, { status: 502 });
  }

  const { error: wrErr } = await admin
    .from("carousel_collections")
    .update({ dias: generated.dias, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (wrErr) {
    return NextResponse.json({ erro: `Update falhou: ${wrErr.message}` }, { status: 500 });
  }

  return NextResponse.json({ dias: generated.dias, usage: generated.usage });
}
