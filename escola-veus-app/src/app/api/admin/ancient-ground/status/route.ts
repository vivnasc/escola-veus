import { NextResponse } from "next/server";
import videoPlan from "@/data/video-plan.json";
import promptsData from "@/data/thinkdiffusion-prompts.json";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/ancient-ground/status
 *
 * Estado actual de cada vídeo Ancient Ground planeado (video-plan.json).
 *
 * Para cada vídeo AG:
 *   - prompts: número de prompts correspondentes à categoria(s) em
 *     thinkdiffusion-prompts.json
 *   - imagesCount: total de imagens geradas em youtube/images/<promptId>/horizontal/
 *   - clipsCount: total de clips em youtube/clips/ por prefixo de promptId
 *   - videoRendered: há MP4 em youtube/videos/ com prefixo do videoId
 */

type Prompt = { id: string; category: string; mood: string[]; prompt: string };
type VideoEntry = {
  id: string;
  titulo: string;
  categorias: string[];
  prompts: number;
  variacoes: number;
};

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
  const [clips, videos, imageFolders] = await Promise.all([
    listAll(supabase, "youtube/clips"),
    listAll(supabase, "youtube/videos"),
    listAll(supabase, "youtube/images"),
  ]);

  // Image counts per promptId (only AG categories — não nomear)
  const agImageFolders = imageFolders.filter((n) => !n.startsWith("nomear-"));
  const imageCounts = await Promise.all(
    agImageFolders.map(async (folderName) => {
      const files = await listAll(supabase, `youtube/images/${folderName}/horizontal`);
      return {
        folder: folderName,
        count: files.filter((f) => /\.(png|jpe?g)$/i.test(f)).length,
      };
    }),
  );
  const imagesByPrompt = new Map<string, number>();
  for (const { folder, count } of imageCounts) imagesByPrompt.set(folder, count);

  // Clips count per promptId (non-nomear clips)
  const clipsByPrompt = new Map<string, number>();
  for (const c of clips) {
    if (!/\.mp4$/i.test(c)) continue;
    if (c.startsWith("nomear-")) continue;
    // Match base name before "-h-NN.mp4"
    const m = c.match(/^(.+?)-[hv]-\d+\.mp4$/);
    if (m) {
      clipsByPrompt.set(m[1], (clipsByPrompt.get(m[1]) ?? 0) + 1);
    }
  }

  // Build per-video status using video-plan.json
  const plan = videoPlan as VideoEntry[];
  const promptsList = promptsData.prompts as Prompt[];

  const result = plan.map((v) => {
    // Prompts matching any of this video's categories
    const matchingPrompts = promptsList.filter((p) =>
      v.categorias.includes(p.category),
    );
    const promptsCount = matchingPrompts.length;
    const imagesTotal = matchingPrompts.reduce(
      (acc, p) => acc + (imagesByPrompt.get(p.id) ?? 0),
      0,
    );
    const clipsTotal = matchingPrompts.reduce(
      (acc, p) => acc + (clipsByPrompt.get(p.id) ?? 0),
      0,
    );
    // Video final: procura MP4 com prefixo do videoId
    const videoRendered = videos.some(
      (f) => f.endsWith(".mp4") && f.startsWith(`${v.id}-`),
    );
    return {
      id: v.id,
      titulo: v.titulo,
      categorias: v.categorias,
      status: {
        promptsCount,
        imagesCount: imagesTotal,
        clipsCount: clipsTotal,
        videoRendered,
      },
    };
  });

  return NextResponse.json({ videos: result });
}
