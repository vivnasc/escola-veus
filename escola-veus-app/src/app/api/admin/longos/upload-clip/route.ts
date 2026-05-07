import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/longos/upload-clip
 *
 * Cria signed upload URL para um clip MJ Video (extend) associado a uma cena
 * dum projecto longo. O browser faz PUT directo ao Supabase (contorna o
 * limite 4.5MB do body do Vercel — clips MJ extend 15s ficam ~10-30MB).
 *
 * Body: { slug, promptId }
 *   - slug:     slug do projecto longo (ex: "a-culpa-que-pesa")
 *   - promptId: id da cena (ex: "a-culpa-que-pesa-03-cozinha-vazia")
 *
 * Returns: { clipUploadUrl, clipUrl, clipPath }
 *
 * Path no Supabase: longos-clips/<slug>/<promptId>.mp4
 * Re-uploads do mesmo promptId sobrescrevem (upsert).
 */

const BUCKET = "course-assets";

export async function POST(req: NextRequest) {
  try {
    const { slug, promptId } = (await req.json()) as {
      slug?: string;
      promptId?: string;
    };

    if (!slug || !promptId) {
      return NextResponse.json(
        { erro: "slug + promptId obrigatórios" },
        { status: 400 },
      );
    }
    // Validate to avoid path traversal.
    if (!/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
      return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
    }
    if (!/^[a-z0-9][a-z0-9-]{0,120}$/.test(promptId)) {
      return NextResponse.json({ erro: "promptId inválido" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { erro: "Supabase não configurado" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const clipPath = `longos-clips/${slug}/${promptId}.mp4`;

    // upsert=true permite re-uploads do mesmo prompt sem ter de apagar antes.
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(clipPath, { upsert: true });
    if (error || !data) {
      return NextResponse.json(
        { erro: `sign falhou: ${error?.message ?? "unknown"}` },
        { status: 500 },
      );
    }

    const storageUrl = `${supabaseUrl}/storage/v1`;
    const clipUploadUrl = `${storageUrl}/object/upload/sign/${BUCKET}/${clipPath}?token=${data.token}`;
    const clipUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${clipPath}`;

    return NextResponse.json({ clipUploadUrl, clipUrl, clipPath });
  } catch (err) {
    return NextResponse.json(
      { erro: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
