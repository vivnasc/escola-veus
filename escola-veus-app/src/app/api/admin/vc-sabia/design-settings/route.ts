import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 15;
export const runtime = "nodejs";

/**
 * Design settings do VC Sabia (cores, opacidades, posicoes do overlay).
 * Persistente em course-assets/vc-sabia-meta/design-settings.json.
 */

const PATH = "vc-sabia-meta/design-settings.json";

export type VcSabiaDesign = {
  cardBg: string;        // hex
  cardBgOpacity: number; // 0-1
  cardBorder: string;    // hex
  cornerColor: string;   // hex
  kickerColor: string;   // hex
  phraseColor: string;   // hex
  footerColor: string;   // hex
  cardY: number;         // 0-1920 (pixel position 1080x1920 frame)
  kickerSize: number;    // px (1080x1920 reference)
  phraseSize: number;    // px (1080x1920 reference)
};

export const DEFAULT_DESIGN: VcSabiaDesign = {
  cardBg: "#140F1E",
  cardBgOpacity: 0.14,
  cardBorder: "#C9A96E",
  cornerColor: "#D4AF37",
  kickerColor: "#D4AF37",
  phraseColor: "#FAF7F0",
  footerColor: "#FAF7F0",
  cardY: 880,
  kickerSize: 56,
  phraseSize: 60,
};

function cfg() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return { supabaseUrl, serviceKey };
}

export async function GET() {
  const c = cfg();
  if (!c) return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(c.supabaseUrl, c.serviceKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.storage.from("course-assets").download(PATH);
  if (error) return NextResponse.json({ design: DEFAULT_DESIGN });
  try {
    const parsed = JSON.parse(await data.text());
    return NextResponse.json({ design: { ...DEFAULT_DESIGN, ...parsed.design } });
  } catch {
    return NextResponse.json({ design: DEFAULT_DESIGN });
  }
}

export async function POST(req: NextRequest) {
  const c = cfg();
  if (!c) return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }

  const design = (body as { design?: Partial<VcSabiaDesign> })?.design;
  if (!design || typeof design !== "object") {
    return NextResponse.json({ erro: "design em falta" }, { status: 400 });
  }

  const merged: VcSabiaDesign = { ...DEFAULT_DESIGN, ...design };

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(c.supabaseUrl, c.serviceKey, {
    auth: { persistSession: false },
  });

  const payload = JSON.stringify({ design: merged, updatedAt: new Date().toISOString() });
  const { error } = await supabase.storage
    .from("course-assets")
    .upload(PATH, new Blob([payload], { type: "application/json" }), {
      contentType: "application/json",
      upsert: true,
    });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, design: merged });
}
