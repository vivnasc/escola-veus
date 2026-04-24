/**
 * Helpers servidor-side para as instrucoes extras do Q&A, guardadas em
 * course-assets/admin/aulas-qa-prompt.json pelo endpoint admin
 * /api/admin/aulas/qa-prompt.
 *
 * Usado em /api/courses/ask para anexar as instrucoes a cada system prompt
 * antes de chamar a Claude.
 */

const BUCKET = "course-assets";
const PATH = "admin/aulas-qa-prompt.json";

function supabaseClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

export async function loadQaExtras(): Promise<string> {
  const supabase = supabaseClient();
  if (!supabase) return "";
  const { data, error } = await supabase.storage.from(BUCKET).download(PATH);
  if (error || !data) return "";
  try {
    const text = await data.text();
    const parsed = JSON.parse(text) as { extraInstructions?: string };
    return parsed.extraInstructions ?? "";
  } catch {
    return "";
  }
}

export async function saveQaExtras(extraInstructions: string) {
  const supabase = supabaseClient();
  if (!supabase) throw new Error("Supabase nao configurado");
  const blob = new Blob([JSON.stringify({ extraInstructions }, null, 2)], {
    type: "application/json",
  });
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(PATH, blob, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(`Supabase upload: ${error.message}`);
}
