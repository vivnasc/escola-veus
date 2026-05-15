/**
 * Le todos os batches passados em vc-sabia-batches/ e devolve sets
 * de frases e motions ja usados. Usado pelo bulk-month/preview para
 * barrar frases repetidas e alertar motions reutilizados.
 */

export type UsageHistory = {
  usedPhraseIds: Set<string>;
  usedMotionNames: Set<string>;
  batchCount: number;
};

export async function loadUsageHistory(supabaseUrl: string, serviceKey: string): Promise<UsageHistory> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: files } = await supabase.storage
    .from("course-assets")
    .list("vc-sabia-batches", { limit: 500 });

  const usedPhraseIds = new Set<string>();
  const usedMotionNames = new Set<string>();
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
          if (j.phraseId) usedPhraseIds.add(j.phraseId);
          if (j.motionName) usedMotionNames.add(j.motionName);
        }
      } catch {
        /* ignore corrupted */
      }
    })
  );

  return {
    usedPhraseIds,
    usedMotionNames,
    batchCount: batchFiles.length,
  };
}
