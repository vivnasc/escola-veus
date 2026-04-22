import { NextResponse } from "next/server";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/shorts/status
 *
 * Estado dos Shorts "Snippet Nomear" — um short por episódio Nomear.
 * Cada short = trecho curto (15-30s) da narração + imagem MJ cropada 9:16
 * + texto overlay + mandala fecho.
 *
 * Para cada episódio Nomear:
 *   - hasEpisodeAudio: tem MP3 do Nomear (fonte para cortar snippet)
 *   - hasEpisodeImages: tem imagens MJ no episódio (fonte para crop 9:16)
 *   - snippetAudio: existe MP3 cortado em shorts/audio/ com prefixo do epKey
 *   - verticalImage: existe PNG 9:16 em shorts/images/ com prefixo do epKey
 *   - rendered: existe MP4 em shorts/videos/ com prefixo do epKey
 */

function titleToSlug(title: string): string {
  return (title || "audio")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function epKeyFromId(id: string): string {
  return id.split("-")[1] ?? "";
}

async function listAll(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  path: string,
): Promise<string[]> {
  const out: string[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .list(path, { limit: 1000, offset });
    if (error || !data || data.length === 0) break;
    for (const f of data) if (f.name) out.push(f.name);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return out;
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Top-level listings
  const [episodeAudios, episodeImages, shortsAudio, shortsImages, shortsVideos] = await Promise.all([
    listAll(supabase, "youtube"),
    listAll(supabase, "youtube/images"),
    listAll(supabase, "shorts/audio"),
    listAll(supabase, "shorts/images"),
    listAll(supabase, "shorts/videos"),
  ]);

  // Episode-level flags
  const hasAnyImage = new Set<string>();
  for (const f of episodeImages) {
    if (f.startsWith("nomear-")) {
      const m = f.match(/^nomear-([^-]+)-/);
      if (m) hasAnyImage.add(m[1]);
    }
  }

  // Flatten all Nomear scripts
  const allScripts: { id: string; titulo: string; curso: string; epKey: string }[] = [];
  for (const preset of NOMEAR_PRESETS) {
    for (const s of preset.scripts) {
      if (!s.id.startsWith("nomear-")) continue;
      allScripts.push({
        id: s.id,
        titulo: s.titulo,
        curso: s.curso,
        epKey: epKeyFromId(s.id),
      });
    }
  }

  const result = allScripts.map((s) => {
    const slug = titleToSlug(s.titulo);
    const hasEpisodeAudio = episodeAudios.some(
      (a) => a.endsWith(".mp3") && a.startsWith(`${slug}-`),
    );
    const hasEpisodeImages = hasAnyImage.has(s.epKey);
    const snippetAudio = shortsAudio.some(
      (f) => f.endsWith(".mp3") && f.startsWith(`${s.epKey}-`),
    );
    const verticalImage = shortsImages.some(
      (f) => /\.(png|jpe?g)$/i.test(f) && f.startsWith(`${s.epKey}-`),
    );
    const rendered = shortsVideos.some(
      (f) => f.endsWith(".mp4") && f.startsWith(`${s.epKey}-`),
    );
    return {
      id: s.id,
      titulo: s.titulo,
      curso: s.curso,
      epKey: s.epKey,
      status: {
        hasEpisodeAudio,
        hasEpisodeImages,
        snippetAudio,
        verticalImage,
        rendered,
      },
    };
  });

  return NextResponse.json({ shorts: result });
}
