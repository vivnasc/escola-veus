/**
 * De-duplicacao de frases vc-sabia.
 *
 * `normalizePhraseForDedup` colapsa acentos, pontuacao, capitalizacao e
 * espacos para comparar frases independentemente de variacoes superficiais.
 * Usado para barrar repeticoes contra o seed + historico + saidas do Claude.
 */

import seed from "@/data/vc-sabia-frases.seed.json";

export function normalizePhraseForDedup(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Conjunto normalizado de todas as frases do seed.
 * Sincrono — apenas le o JSON em memoria.
 */
export function seedAvoidSet(): Set<string> {
  const out = new Set<string>();
  for (const f of (seed as { frases: { texto: string }[] }).frases) {
    out.add(normalizePhraseForDedup(f.texto));
  }
  return out;
}

/**
 * Le os batches passados (via loadUsageHistory) e devolve um set
 * normalizado com todos os `phraseText` ja usados em renders.
 */
export async function historyAvoidSet(
  supabaseUrl: string,
  serviceKey: string
): Promise<Set<string>> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: files } = await supabase.storage
    .from("course-assets")
    .list("vc-sabia-batches", { limit: 500 });

  const out = new Set<string>();
  const batchFiles = (files || []).filter((f) => f.name?.endsWith(".json"));

  await Promise.all(
    batchFiles.map(async (f) => {
      try {
        const r = await fetch(
          `${supabaseUrl}/storage/v1/object/public/course-assets/vc-sabia-batches/${f.name}`,
          { cache: "no-store" }
        );
        if (!r.ok) return;
        const batch = await r.json();
        for (const j of batch.jobs || []) {
          if (typeof j.phraseText === "string" && j.phraseText.length > 0) {
            out.add(normalizePhraseForDedup(j.phraseText));
          }
        }
      } catch {
        /* ignore */
      }
    })
  );

  return out;
}

/**
 * Conjunto completo de frases a evitar: seed + historico + qualquer
 * extra (e.g. frases ja no plano em edicao no cliente).
 */
export async function buildAvoidSet(
  supabaseUrl: string | undefined,
  serviceKey: string | undefined,
  extra: string[] = []
): Promise<{ normalized: Set<string>; texts: string[] }> {
  const norm = seedAvoidSet();
  if (supabaseUrl && serviceKey) {
    const hist = await historyAvoidSet(supabaseUrl, serviceKey);
    for (const v of hist) norm.add(v);
  }
  for (const e of extra) {
    if (e && e.trim().length > 0) norm.add(normalizePhraseForDedup(e));
  }

  // Texto humano-legivel (sem normalizacao) para incluir no prompt do Claude.
  // Pega no seed em texto + extra raw para nao mostrar "abc abc abc" sem acentos.
  const texts: string[] = [];
  for (const f of (seed as { frases: { texto: string }[] }).frases) {
    texts.push(f.texto);
  }
  for (const e of extra) {
    if (e && e.trim().length > 0) texts.push(e.trim());
  }
  return { normalized: norm, texts };
}
