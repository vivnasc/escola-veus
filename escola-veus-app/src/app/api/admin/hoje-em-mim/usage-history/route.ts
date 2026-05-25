import { NextResponse } from "next/server";

export const maxDuration = 30;
export const runtime = "nodejs";

/**
 * GET /api/admin/hoje-em-mim/usage-history
 *
 * Escava render-jobs/ para devolver os motionUrls e fraseIds já
 * usados em renders anteriores. A UI usa para:
 *  - Marcar clips usados vs frescos no BulkClipPicker
 *  - Priorizar clips frescos na pré-montagem
 *  - Evitar repetir a mesma imagem em meses consecutivos
 *
 * Returns: { usedMotionUrls: string[], usedFraseIds: string[], jobCount }
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: files } = await supabase.storage
    .from("course-assets")
    .list("render-jobs", { limit: 500 });

  const manifests = (files || []).filter(
    (f) =>
      f.name?.startsWith("hoje-em-mim-") &&
      f.name.endsWith(".json") &&
      !f.name.endsWith("-result.json")
  );

  const usedMotionUrls = new Set<string>();
  const usedFraseIds = new Set<string>();

  await Promise.all(
    manifests.map(async (f) => {
      try {
        const r = await fetch(
          `${supabaseUrl}/storage/v1/object/public/course-assets/render-jobs/${f.name}`,
          { cache: "no-store" }
        );
        if (!r.ok) return;
        const manifest = await r.json();
        for (const item of manifest.items || []) {
          if (item.motionUrl) usedMotionUrls.add(item.motionUrl);
          if (item.fraseId) usedFraseIds.add(item.fraseId);
        }
      } catch {
        /* ignore */
      }
    })
  );

  return NextResponse.json({
    usedMotionUrls: Array.from(usedMotionUrls),
    usedFraseIds: Array.from(usedFraseIds),
    jobCount: manifests.length,
  });
}
