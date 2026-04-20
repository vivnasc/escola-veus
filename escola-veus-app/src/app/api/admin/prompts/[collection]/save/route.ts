import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

type PromptItem = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
};

type PromptFile = {
  config: Record<string, unknown>;
  prompts: PromptItem[];
};

const ALLOWED = new Set(["funil", "aulas"]);

/**
 * POST /api/admin/prompts/[collection]/save
 *
 * Guarda o ficheiro de prompts da colecção em Supabase Storage.
 * Body: PromptFile
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ collection: string }> },
) {
  const { collection } = await params;
  if (!ALLOWED.has(collection)) {
    return NextResponse.json({ erro: `Coleccao desconhecida: ${collection}` }, { status: 400 });
  }

  let body: PromptFile;
  try {
    body = (await req.json()) as PromptFile;
  } catch {
    return NextResponse.json({ erro: "Body JSON invalido" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !Array.isArray(body.prompts)) {
    return NextResponse.json({ erro: "Shape invalido: { config, prompts[] }" }, { status: 400 });
  }

  // Valida cada prompt
  for (const p of body.prompts) {
    if (typeof p.id !== "string" || typeof p.prompt !== "string" || typeof p.category !== "string") {
      return NextResponse.json(
        { erro: `Prompt invalido (id=${p.id ?? "?"}): campos id/category/prompt obrigatorios` },
        { status: 400 },
      );
    }
    if (!Array.isArray(p.mood)) {
      p.mood = [];
    }
  }

  // Verifica ids duplicados
  const ids = body.prompts.map((p) => p.id);
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) {
    return NextResponse.json({ erro: `Id duplicado: ${dup}` }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const path = `admin/${collection}-prompts.json`;
  const blob = new Blob([JSON.stringify(body, null, 2)], { type: "application/json" });

  const { error } = await supabase.storage
    .from("course-assets")
    .upload(path, blob, { upsert: true, contentType: "application/json" });

  if (error) {
    return NextResponse.json({ erro: `Supabase upload: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: body.prompts.length, path });
}
