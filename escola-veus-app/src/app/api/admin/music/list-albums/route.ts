import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/music/list-albums
 *
 * Lista as pastas dentro de `audios/albums/` no Supabase.
 * Para cada pasta, conta quantas faixas existem.
 *
 * Returns: { albums: [{ slug, trackCount }], total }
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { erro: "Supabase nao configurado." },
      { status: 500 },
    );
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: folders, error } = await supabase.storage
    .from("audios")
    .list("albums", { limit: 500, sortBy: { column: "name", order: "asc" } });

  if (error) {
    return NextResponse.json(
      { erro: `Supabase erro: ${error.message}` },
      { status: 500 },
    );
  }

  const folderNames = (folders || [])
    .filter((f) => !f.name.includes("."))
    .map((f) => f.name);

  const albums = await Promise.all(
    folderNames.map(async (slug) => {
      const { data: files } = await supabase.storage
        .from("audios")
        .list(`albums/${slug}`, { limit: 500 });
      const trackCount = (files || []).filter((f) =>
        f.name.match(/\.(mp3|wav|m4a|flac|ogg)$/i),
      ).length;
      return { slug, trackCount };
    }),
  );

  return NextResponse.json({ albums, total: albums.length });
}
