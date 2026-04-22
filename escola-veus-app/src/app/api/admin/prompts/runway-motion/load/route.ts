import { NextResponse } from "next/server";
import motionSeed from "@/data/runway-motion-prompts.json";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/prompts/runway-motion/load
 *
 * Lê o JSON de motion prompts (Runway Gen-3) persistido em Supabase. Se ainda
 * não existir (primeira vez), devolve o seed bundled no repo
 * (`src/data/runway-motion-prompts.json`) com `fromSeed: true`.
 *
 * Estrutura: `{ "nomear-ep01-01-voz-antiga": "Static camera...", ... }`
 * Chaves especiais: `_default` (fallback geral).
 */

const SEED = motionSeed as Record<string, string>;
const PATH = "admin/runway-motion-prompts.json";

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const sb = supabase();
  if (!sb) {
    return NextResponse.json({ prompts: SEED, fromSeed: true });
  }
  const { data, error } = await sb.storage
    .from("course-assets")
    .download(PATH);
  if (error || !data) {
    return NextResponse.json({ prompts: SEED, fromSeed: true });
  }
  try {
    const parsed = JSON.parse(await data.text()) as Record<string, string>;
    return NextResponse.json({ prompts: parsed, fromSeed: false });
  } catch {
    return NextResponse.json({ prompts: SEED, fromSeed: true });
  }
}
