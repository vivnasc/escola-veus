import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET/POST /api/admin/ancient-ground/schedule
 *
 * Gere o calendário de publicação AG (que vídeo vai em que dia). Persiste
 * em Supabase (`course-assets/calendar/ag-schedule.json`) para funcionar
 * cross-device — qualquer PC/telemóvel consulta ou edita o mesmo estado.
 *
 * Estrutura do ficheiro:
 * {
 *   "slots": {
 *     "2026-04-24-long":  { videoName, videoUrl, publishedAt?, publishedUrl?, notes? },
 *     "2026-04-21-short": { ... },
 *     ...
 *   }
 * }
 *
 * slotId = "YYYY-MM-DD-(short|long)"
 *
 * GET → devolve o JSON (ou {} se não existe).
 * POST body { schedule: {...} } → substitui o ficheiro inteiro (cliente
 *   faz read-modify-write). Retorna { ok: true }.
 */

const BUCKET = "course-assets";
const FILE_PATH = "calendar/ag-schedule.json";

function getClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ slots: {} });
  }
  // O ficheiro é público; lemos directo pela URL (evita download via client SDK).
  const url = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${FILE_PATH}?t=${Date.now()}`;
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (r.status === 404) return NextResponse.json({ slots: {} });
    if (!r.ok) return NextResponse.json({ slots: {} });
    const data = await r.json();
    return NextResponse.json({ slots: data.slots || {} });
  } catch {
    return NextResponse.json({ slots: {} });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const schedule = body?.schedule;
    if (!schedule || typeof schedule !== "object") {
      return NextResponse.json({ erro: "Body.schedule em falta." }, { status: 400 });
    }
    const client = getClient();
    if (!client) {
      return NextResponse.json({ erro: "SUPABASE_SERVICE_ROLE_KEY em falta." }, { status: 500 });
    }
    const payload = JSON.stringify({ slots: schedule, updatedAt: new Date().toISOString() }, null, 2);
    const { error } = await client.storage
      .from(BUCKET)
      .upload(FILE_PATH, payload, {
        contentType: "application/json",
        upsert: true,
      });
    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
