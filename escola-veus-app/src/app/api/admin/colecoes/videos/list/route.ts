import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/admin/colecoes/videos/list
 *
 * Lista todos os render-jobs concluídos lendo Supabase Storage:
 * course-assets/render-jobs/*-result.json. Filtra os que estão `done`
 * e têm videos[]. Retorna ordenado do mais recente para o mais antigo.
 */
export async function GET() {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ erro: "Supabase admin indisponível" }, { status: 500 });
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    return NextResponse.json({ erro: "NEXT_PUBLIC_SUPABASE_URL em falta" }, { status: 500 });
  }

  // Lista os ficheiros do prefixo render-jobs/
  const { data: files, error } = await admin.storage
    .from("course-assets")
    .list("render-jobs", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  const resultFiles = (files || []).filter((f) => f.name.endsWith("-result.json"));

  // Lê cada result.json em paralelo (públicos)
  const jobs = await Promise.all(
    resultFiles.map(async (f) => {
      try {
        const url = `${base}/storage/v1/object/public/course-assets/render-jobs/${encodeURIComponent(f.name)}?t=${Date.now()}`;
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) return null;
        const data = await r.json();
        return data;
      } catch {
        return null;
      }
    })
  );

  // Só os done com vídeos
  const done = jobs.filter(
    (j) => j && j.status === "done" && Array.isArray(j.videos) && j.videos.length > 0
  );

  return NextResponse.json({ items: done });
}
