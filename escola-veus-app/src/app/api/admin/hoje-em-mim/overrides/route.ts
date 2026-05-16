import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;
export const runtime = "nodejs";

/**
 * Persistência dos overrides per-dayIndex editados na pré-montagem.
 *
 * Cada mês tem o seu próprio mapa de overrides. Quando a Vivianne
 * reescreve uma frase, troca motion, áudio ou tema na BulkPreviewTable,
 * isso passa a sobreviver a refresh, mudança de tab ou de device.
 *
 * Antes ficava só no estado React e perdia-se ao mínimo re-render
 * que recalculasse o useMemo de items.
 *
 * Path Supabase: course-assets/hoje-em-mim-meta/overrides.json
 * Shape:
 *   {
 *     byMonth: Record<"YYYY-MM", Record<dayIndex, override>>,
 *     updatedAt: ISO
 *   }
 */

const PATH = "hoje-em-mim-meta/overrides.json";

type DayOverride = {
  fraseTexto?: string;
  motionUrl?: string;
  audioUrl?: string | null;
  theme?: string;
};

function cfg() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return { supabaseUrl, serviceKey };
}

export async function GET() {
  const c = cfg();
  if (!c) return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(c.supabaseUrl, c.serviceKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.storage.from("course-assets").download(PATH);
  if (error || !data) return NextResponse.json({ byMonth: {} });
  try {
    const parsed = JSON.parse(await data.text());
    return NextResponse.json({
      byMonth: parsed.byMonth ?? {},
      updatedAt: parsed.updatedAt ?? null,
    });
  } catch {
    return NextResponse.json({ byMonth: {} });
  }
}

export async function POST(req: NextRequest) {
  const c = cfg();
  if (!c) return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });

  let body: {
    monthKey?: string;
    overrides?: Record<number, DayOverride>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  const monthKey = typeof body.monthKey === "string" ? body.monthKey : "";
  if (!/^\d{4}-\d{2}$/.test(monthKey)) {
    return NextResponse.json({ erro: "monthKey deve ser YYYY-MM" }, { status: 400 });
  }
  const overrides =
    body.overrides && typeof body.overrides === "object" ? body.overrides : {};

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(c.supabaseUrl, c.serviceKey, {
    auth: { persistSession: false },
  });

  // Merge com snapshot existente (mantém outros meses)
  let byMonth: Record<string, Record<number, DayOverride>> = {};
  try {
    const { data: snap } = await supabase.storage.from("course-assets").download(PATH);
    if (snap) {
      const parsed = JSON.parse(await snap.text());
      byMonth = parsed.byMonth ?? {};
    }
  } catch {
    /* ignore */
  }

  byMonth[monthKey] = overrides;

  const payload = JSON.stringify({ byMonth, updatedAt: new Date().toISOString() });
  const { error } = await supabase.storage
    .from("course-assets")
    .upload(PATH, new Blob([payload], { type: "application/json" }), {
      contentType: "application/json",
      upsert: true,
    });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
