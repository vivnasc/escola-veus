import { NextRequest, NextResponse } from "next/server";
import funilSeed from "@/data/funil-prompts.seed.json";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

type PromptItem = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
};

type PromptConfig = {
  checkpoint?: string;
  width?: number;
  height?: number;
  cfg_scale?: number;
  steps?: number;
  sampler_name?: string;
  batch_size?: number;
  negative_prompt?: string;
};

type PromptFile = { config: PromptConfig; prompts: PromptItem[] };

const SEEDS: Record<string, PromptFile> = {
  funil: funilSeed as PromptFile,
  aulas: { config: (funilSeed as PromptFile).config, prompts: [] },
};

function pathFor(collection: string) {
  return `admin/${collection}-prompts.json`;
}

function supabaseClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

/**
 * GET /api/admin/prompts/[collection]/load
 *
 * Lê o ficheiro de prompts guardado em Supabase para a colecção.
 * Se não existir, devolve o seed (vindo do repo) e marca fromSeed: true.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params;
  const seed = SEEDS[collection];
  if (!seed) {
    return NextResponse.json({ erro: `Coleccao desconhecida: ${collection}` }, { status: 400 });
  }

  const supabase = supabaseClient();
  if (!supabase) {
    return NextResponse.json({ ...seed, fromSeed: true });
  }

  const { data, error } = await supabase.storage.from("course-assets").download(pathFor(collection));
  if (error || !data) {
    return NextResponse.json({ ...seed, fromSeed: true });
  }

  const text = await data.text();
  try {
    const parsed = JSON.parse(text) as PromptFile;
    return NextResponse.json({ ...parsed, fromSeed: false });
  } catch {
    return NextResponse.json({ ...seed, fromSeed: true });
  }
}
