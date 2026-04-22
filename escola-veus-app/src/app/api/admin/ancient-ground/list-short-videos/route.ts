import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/ancient-ground/list-short-videos
 *
 * Lista os shorts AG já renderizados em `course-assets/shorts/videos/*.mp4`.
 * O bucket é partilhado com shorts Loranne, por isso filtramos pelos que
 * têm sidecar SEO com `channel === "ancient-ground"` (enviado pela página
 * /admin/producao/ancient-ground/shorts no submit). Shorts Loranne ficam
 * fora desta lista — fora de âmbito.
 *
 * Devolve: { videos: [{ name, url, thumbnailUrl?, seo?, createdAt }], total }
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ videos: [], total: 0 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const pageSize = 1000;
  const allFiles: { name: string; created_at?: string | null; updated_at?: string | null }[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .list("shorts/videos", {
        limit: pageSize,
        offset,
        sortBy: { column: "created_at", order: "desc" },
      });
    if (error || !data || data.length === 0) break;
    allFiles.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  // Agrupa por base-name (mp4 + seo + thumb).
  type Group = {
    baseName: string;
    mp4?: string;
    seo?: string;
    thumb?: string;
    createdAt: string | null;
  };
  const groups = new Map<string, Group>();
  for (const f of allFiles) {
    const m = f.name.match(/^(.+?)(?:-seo\.json|-thumb\.(?:png|jpg|jpeg|webp)|\.mp4)$/i);
    if (!m) continue;
    const baseName = m[1];
    const g = groups.get(baseName) || { baseName, createdAt: f.created_at || null };
    if (/\.mp4$/i.test(f.name)) g.mp4 = f.name;
    else if (/-seo\.json$/i.test(f.name)) g.seo = f.name;
    else if (/-thumb\./i.test(f.name)) g.thumb = f.name;
    if (!g.createdAt && f.created_at) g.createdAt = f.created_at;
    groups.set(baseName, g);
  }

  const withMp4 = Array.from(groups.values()).filter((g) => g.mp4);
  withMp4.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  // Lê sidecar SEO e filtra para channel=ancient-ground. Só processa os
  // primeiros ~40 para não fazer explosão de fetches; se precisarmos de
  // mais, há paginação no cliente.
  const candidates = withMp4.slice(0, 40);
  const enriched = await Promise.all(
    candidates.map(async (g) => {
      const mp4Url = `${supabaseUrl}/storage/v1/object/public/course-assets/shorts/videos/${g.mp4!}`;
      const thumbUrl = g.thumb
        ? `${supabaseUrl}/storage/v1/object/public/course-assets/shorts/videos/${g.thumb}`
        : null;
      let seo: Record<string, unknown> | null = null;
      if (g.seo) {
        try {
          const r = await fetch(
            `${supabaseUrl}/storage/v1/object/public/course-assets/shorts/videos/${g.seo}`,
            { cache: "no-store" },
          );
          if (r.ok) seo = await r.json();
        } catch { /* ignore */ }
      }
      return {
        name: g.baseName,
        url: mp4Url,
        thumbnailUrl: thumbUrl,
        seo,
        createdAt: g.createdAt,
      };
    }),
  );

  const agOnly = enriched.filter((v) => {
    const ch = v.seo?.["channel"];
    return typeof ch === "string" && ch === "ancient-ground";
  });

  return NextResponse.json({ videos: agOnly.slice(0, 20), total: agOnly.length });
}
