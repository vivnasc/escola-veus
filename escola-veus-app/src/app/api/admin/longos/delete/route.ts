import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/longos/delete
 *
 * Apaga um projecto longo + todos os assets associados:
 *  - admin/longos/<slug>.json (manifest do projecto)
 *  - longos-clips/<slug>/*.mp4 (todos os clips MJ Video da cena)
 *  - longos-audios/<slug>.mp3 + <slug>-cap-NN.mp3 (narração + chunks)
 *  - longos-subtitles/<slug>.srt (legendas)
 *  - longos-videos/<slug>-*.mp4 (vídeos finais + previews)
 *
 * Body: { slug, keepNarration?: boolean, keepClips?: boolean }
 *   - keepNarration: NÃO apaga MP3s da narração (útil em re-gerar projecto
 *     mantendo a voz já gravada)
 *   - keepClips: NÃO apaga clips MJ Video uploaded (útil em re-gerar
 *     projecto mantendo as imagens animadas que ela já fez)
 *
 * Returns: { ok, deleted: { manifest, clips, audios, subtitles, videos } }
 */

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  let body: { slug?: string; keepNarration?: boolean; keepClips?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const slug = (body.slug || "").trim();
  if (!slug || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
    return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
  }

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  const deleted = {
    manifest: 0,
    clips: 0,
    audios: 0,
    subtitles: 0,
    videos: 0,
  };

  // 1. Manifest principal
  const { error: mfError } = await supabase.storage
    .from("course-assets")
    .remove([`admin/longos/${slug}.json`]);
  if (!mfError) deleted.manifest = 1;

  // 2. Clips (longos-clips/<slug>/*.mp4) — só se keepClips !== true
  if (!body.keepClips) {
    try {
      const { data: clipFiles } = await supabase.storage
        .from("course-assets")
        .list(`longos-clips/${slug}`, { limit: 500 });
      if (Array.isArray(clipFiles) && clipFiles.length > 0) {
        const paths = clipFiles.map((f) => `longos-clips/${slug}/${f.name}`);
        await supabase.storage.from("course-assets").remove(paths);
        deleted.clips = paths.length;
      }
    } catch {
      /* folder pode não existir */
    }
  }

  // 3. Audios (narração final + chunks) — só se keepNarration !== true
  if (!body.keepNarration) {
    try {
      const { data: audioFiles } = await supabase.storage
        .from("course-assets")
        .list("longos-audios", { limit: 1000 });
      if (Array.isArray(audioFiles)) {
        const paths = audioFiles
          .filter((f) =>
            f.name === `${slug}.mp3` ||
            f.name.startsWith(`${slug}-cap-`),
          )
          .map((f) => `longos-audios/${f.name}`);
        if (paths.length > 0) {
          await supabase.storage.from("course-assets").remove(paths);
          deleted.audios = paths.length;
        }
      }
    } catch {
      /* ignore */
    }
  }

  // 4. SRT
  await supabase.storage
    .from("course-assets")
    .remove([`longos-subtitles/${slug}.srt`])
    .then((r) => {
      if (!r.error) deleted.subtitles = 1;
    });

  // 5. Vídeos finais + previews (longos-videos/<slug>-*.mp4)
  try {
    const { data: videoFiles } = await supabase.storage
      .from("course-assets")
      .list("longos-videos", { limit: 500 });
    if (Array.isArray(videoFiles)) {
      const paths = videoFiles
        .filter((f) => f.name.startsWith(`${slug}-`) || f.name === `${slug}.mp4`)
        .map((f) => `longos-videos/${f.name}`);
      if (paths.length > 0) {
        await supabase.storage.from("course-assets").remove(paths);
        deleted.videos = paths.length;
      }
    }
  } catch {
    /* ignore */
  }

  return NextResponse.json({ ok: true, deleted });
}
