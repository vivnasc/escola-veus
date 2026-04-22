import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/ancient-ground/list-long-videos
 *
 * Lista os vídeos longos (60min) já renderizados no bucket public
 * `course-assets/youtube/videos/*.mp4`, ordenados por data descendente.
 * Para cada MP4 tenta ler o sidecar SEO (`<slug>-<stamp>-seo.json`) que o
 * render-ancient-ground guarda ao lado, para enriquecer com duração,
 * tamanho e título SEO — usados na UI de "Últimos vídeos gerados".
 *
 * Devolve: { videos: [{ name, url, thumbnailUrl?, seo?, createdAt }], total }
 * Nota: fonte única de verdade é o Supabase — funciona de qualquer
 * dispositivo sem depender de localStorage.
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
      .list("youtube/videos", {
        limit: pageSize,
        offset,
        sortBy: { column: "created_at", order: "desc" },
      });
    if (error || !data || data.length === 0) break;
    allFiles.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  // Agrupa por base-name: mp4 + seo.json + thumb.{ext}
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

  // Só interessa quem tem MP4.
  const withMp4 = Array.from(groups.values()).filter((g) => g.mp4);
  withMp4.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  // Limita a 20 mais recentes + lê SEO sidecar em paralelo (non-blocking per-item).
  const top = withMp4.slice(0, 20);
  const enriched = await Promise.all(
    top.map(async (g) => {
      const mp4Url = `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/videos/${g.mp4!}`;
      const thumbUrl = g.thumb
        ? `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/videos/${g.thumb}`
        : null;
      let seo: Record<string, unknown> | null = null;
      if (g.seo) {
        try {
          const r = await fetch(
            `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/videos/${g.seo}`,
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

  return NextResponse.json({ videos: enriched, total: withMp4.length });
}
