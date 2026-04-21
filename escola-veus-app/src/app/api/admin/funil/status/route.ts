import { NextResponse } from "next/server";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";
import funilSeed from "@/data/funil-prompts.seed.json";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/funil/status
 *
 * Retorna estado actual de produção por episódio Nomear:
 *  - script: existe sempre
 *  - audio: há MP3 em youtube/ com prefixo do title-slug
 *  - prompts: contagem em funil-prompts.seed.json (por epKey prefix)
 *  - images: contagem em youtube/images/<promptId>/horizontal/
 *  - clips: contagem em youtube/clips/ com prefixo nomear-<epKey>-
 *  - video: há MP4 em youtube/funil-videos/ com slug matching
 *  - srt: há SRT em youtube/subtitles/ com prefixo ep-key
 *
 * Response: { episodes: [{ id, titulo, curso, epKey, status: {...} }, ...] }
 */

type Prompt = { id: string; category: string; mood: string[]; prompt: string };

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

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 500 });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  async function listAll(path: string): Promise<string[]> {
    const out: string[] = [];
    const pageSize = 1000;
    let offset = 0;
    while (true) {
      const { data, error } = await supabase.storage
        .from("course-assets")
        .list(path, { limit: pageSize, offset });
      if (error || !data || data.length === 0) break;
      for (const f of data) if (f.name) out.push(f.name);
      if (data.length < pageSize) break;
      offset += pageSize;
    }
    return out;
  }

  // One-shot listing of top-level folders we need
  const [audios, clips, videos, subtitles, imageFolders] = await Promise.all([
    listAll("youtube"),
    listAll("youtube/clips"),
    listAll("youtube/funil-videos"),
    listAll("youtube/subtitles"),
    listAll("youtube/images"),
  ]);

  // For each image folder (a promptId), we need to know how many horizontal images exist.
  // Rather than fetch every subfolder separately (slow), fetch in parallel only the
  // folders that start with "nomear-".
  const nomearImageFolders = imageFolders.filter((n) => n.startsWith("nomear-"));
  const imageCounts = await Promise.all(
    nomearImageFolders.map(async (folderName) => {
      const files = await listAll(`youtube/images/${folderName}/horizontal`);
      return { folder: folderName, count: files.filter((f) => /\.(png|jpe?g)$/i.test(f)).length };
    }),
  );
  const imagesByPrompt = new Map<string, number>();
  for (const { folder, count } of imageCounts) imagesByPrompt.set(folder, count);

  // Build lookup: promptsCount by epKey (from seed)
  const promptsByEp = new Map<string, { total: number; promptIds: string[] }>();
  for (const p of funilSeed.prompts as Prompt[]) {
    if (!p.id.startsWith("nomear-")) continue;
    const key = epKeyFromId(p.id);
    if (!key) continue;
    const entry = promptsByEp.get(key) ?? { total: 0, promptIds: [] };
    entry.total += 1;
    entry.promptIds.push(p.id);
    promptsByEp.set(key, entry);
  }

  const audiosByEp = new Map<string, boolean>();
  const clipsByEp = new Map<string, number>();
  const videosByEp = new Map<string, boolean>();
  const srtByEp = new Map<string, boolean>();

  // Flatten all Nomear scripts from presets.
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

  // Audio: look for files in `youtube/` that start with title-slug of the script.
  for (const s of allScripts) {
    const slug = titleToSlug(s.titulo);
    const has = audios.some((a) => a.endsWith(".mp3") && a.startsWith(`${slug}-`));
    if (has) audiosByEp.set(s.epKey, true);
  }

  // Clips: count by episode prefix `nomear-<epKey>-` in youtube/clips
  for (const c of clips) {
    if (!/\.mp4$/i.test(c)) continue;
    const m = c.match(/^nomear-([^-]+)-/);
    if (m) {
      clipsByEp.set(m[1], (clipsByEp.get(m[1]) ?? 0) + 1);
    }
  }

  // Videos: final funnel MP4s. Filename pattern: <slug-of-title>-<ts>.mp4 OR <epKey>-<ts>.mp4.
  // We check both — any match means episode has a rendered video.
  for (const s of allScripts) {
    const slug = titleToSlug(s.titulo);
    const has = videos.some(
      (v) => v.endsWith(".mp4") && (v.startsWith(`${slug}-`) || v.startsWith(`${s.epKey}-`)),
    );
    if (has) videosByEp.set(s.epKey, true);
  }

  // SRT: filename pattern `<epKey>-<ts>.srt`
  for (const s of subtitles) {
    if (!s.endsWith(".srt")) continue;
    const m = s.match(/^([^-]+)-/);
    if (m) srtByEp.set(m[1], true);
  }

  // Aggregate per episode
  const episodes = allScripts.map((s) => {
    const promptInfo = promptsByEp.get(s.epKey) ?? { total: 0, promptIds: [] };
    const imagesTotal = promptInfo.promptIds.reduce(
      (acc, pid) => acc + (imagesByPrompt.get(pid) ?? 0),
      0,
    );
    return {
      id: s.id,
      titulo: s.titulo,
      curso: s.curso,
      epKey: s.epKey,
      status: {
        script: true,
        audio: audiosByEp.get(s.epKey) ?? false,
        promptsTotal: promptInfo.total,
        imagesCount: imagesTotal,
        clipsCount: clipsByEp.get(s.epKey) ?? 0,
        video: videosByEp.get(s.epKey) ?? false,
        srt: srtByEp.get(s.epKey) ?? false,
      },
    };
  });

  return NextResponse.json({ episodes });
}
