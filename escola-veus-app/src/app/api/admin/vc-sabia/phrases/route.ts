import { NextRequest, NextResponse } from "next/server";
import seed from "@/data/vc-sabia-frases.seed.json";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * Frases do VC Sabia: seed estatico + overrides persistidos em Supabase.
 * Overrides podem editar texto/tema de frases existentes OU adicionar
 * novas (vsq-XXXX > 0090).
 *
 * Storage: course-assets/vc-sabia-meta/phrases-overrides.json
 *
 * Schema do override file: { overrides: Record<phraseId, { tema, texto }> }
 *
 * GET  → { phrases: Array<{ id, tema, texto, source: "seed" | "override" }> }
 * POST → body { overrides } sobrescreve o ficheiro
 */

const PATH = "vc-sabia-meta/phrases-overrides.json";

type Override = { tema: string; texto: string };

function cfg() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return { supabaseUrl, serviceKey };
}

async function loadOverrides(): Promise<Record<string, Override>> {
  const c = cfg();
  if (!c) return {};
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(c.supabaseUrl, c.serviceKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.storage.from("course-assets").download(PATH);
  if (error) return {};
  try {
    const parsed = JSON.parse(await data.text());
    return parsed.overrides ?? {};
  } catch {
    return {};
  }
}

export async function GET() {
  const overrides = await loadOverrides();

  // Merge: seed entries com override aplicado se existir
  const merged: Array<{ id: string; tema: string; texto: string; source: "seed" | "override" }> = [];
  const seenIds = new Set<string>();
  for (const f of seed.frases) {
    const ov = overrides[f.id];
    if (ov) {
      merged.push({ id: f.id, tema: ov.tema, texto: ov.texto, source: "override" });
    } else {
      merged.push({ id: f.id, tema: f.tema, texto: f.texto, source: "seed" });
    }
    seenIds.add(f.id);
  }
  // Adicionar frases novas que so existem no override (vsq-0091+)
  for (const [id, ov] of Object.entries(overrides)) {
    if (!seenIds.has(id)) {
      merged.push({ id, tema: ov.tema, texto: ov.texto, source: "override" });
    }
  }
  // Ordenar por id (vsq-XXXX)
  merged.sort((a, b) => a.id.localeCompare(b.id));

  return NextResponse.json({ phrases: merged });
}

export async function POST(req: NextRequest) {
  const c = cfg();
  if (!c) return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });

  let body: { overrides?: Record<string, Override> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }
  const overrides = body.overrides;
  if (!overrides || typeof overrides !== "object") {
    return NextResponse.json({ erro: "overrides em falta" }, { status: 400 });
  }

  // Sanitize: drop overrides identicos ao seed (poupa storage)
  const seedById: Record<string, { tema: string; texto: string }> = {};
  for (const f of seed.frases) seedById[f.id] = { tema: f.tema, texto: f.texto };
  const cleaned: Record<string, Override> = {};
  for (const [id, ov] of Object.entries(overrides)) {
    if (!ov || typeof ov !== "object") continue;
    const tema = String(ov.tema || "").trim();
    const texto = String(ov.texto || "").trim();
    if (!texto) continue;
    const s = seedById[id];
    if (s && s.tema === tema && s.texto === texto) continue; // equal to seed
    cleaned[id] = { tema, texto };
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(c.supabaseUrl, c.serviceKey, {
    auth: { persistSession: false },
  });

  const payload = JSON.stringify(
    { overrides: cleaned, updatedAt: new Date().toISOString() },
    null,
    2
  );
  const { error } = await supabase.storage
    .from("course-assets")
    .upload(PATH, new Blob([payload], { type: "application/json" }), {
      contentType: "application/json",
      upsert: true,
    });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, kept: Object.keys(cleaned).length });
}
