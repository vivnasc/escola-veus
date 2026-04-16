import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/music/list-album?album=ancient-ground
 *
 * Lista faixas mp3 de um album no bucket `audios` do Supabase.
 * Bucket e publico — URLs directos prontos para usar em videos.
 *
 * Query: album (slug do album, ex: "ancient-ground")
 * Returns: { album, tracks: [{ name, url, sizeMB }], total }
 */

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { erro: "Supabase nao configurado." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const album = searchParams.get("album");

  if (!album) {
    return NextResponse.json(
      { erro: "Falta parametro 'album'." },
      { status: 400 },
    );
  }

  const supabase = createClient(url, key);
  const path = `albums/${album}`;

  const { data, error } = await supabase.storage
    .from("audios")
    .list(path, { limit: 500, sortBy: { column: "name", order: "asc" } });

  if (error) {
    return NextResponse.json(
      { erro: `Supabase erro: ${error.message}` },
      { status: 500 },
    );
  }

  const tracks = (data || [])
    .filter((f) => f.name.match(/\.(mp3|wav|m4a|flac|ogg)$/i))
    .map((f) => ({
      name: f.name,
      url: `${url}/storage/v1/object/public/audios/${path}/${f.name}`,
      sizeMB: f.metadata?.size
        ? Math.round((f.metadata.size / 1024 / 1024) * 10) / 10
        : null,
    }));

  return NextResponse.json({
    album,
    tracks,
    total: tracks.length,
  });
}
