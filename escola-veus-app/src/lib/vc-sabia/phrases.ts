import seed from "@/data/vc-sabia-frases.seed.json";

export type Frase = { id: string; tema: string; texto: string };

/**
 * Carrega frases mescladas: seed + overrides do Supabase.
 * Usado pelos endpoints de bulk-month e preview para garantir que
 * edicoes feitas no PhrasesPanel sao reflectidas na producao.
 */
export async function loadMergedFrases(supabaseUrl: string): Promise<Frase[]> {
  let overrides: Record<string, { tema: string; texto: string }> = {};
  try {
    const r = await fetch(
      `${supabaseUrl}/storage/v1/object/public/course-assets/vc-sabia-meta/phrases-overrides.json`,
      { cache: "no-store" }
    );
    if (r.ok) {
      const j = await r.json();
      overrides = j.overrides || {};
    }
  } catch {
    /* ignore - fallback ao seed */
  }

  const seen = new Set<string>();
  const merged: Frase[] = [];
  for (const f of seed.frases) {
    const ov = overrides[f.id];
    merged.push(ov ? { id: f.id, tema: ov.tema, texto: ov.texto } : f);
    seen.add(f.id);
  }
  // Novas frases que so existem nos overrides (vsq-0091+)
  for (const [id, ov] of Object.entries(overrides)) {
    if (!seen.has(id)) merged.push({ id, tema: ov.tema, texto: ov.texto });
  }
  merged.sort((a, b) => a.id.localeCompare(b.id));
  return merged;
}
