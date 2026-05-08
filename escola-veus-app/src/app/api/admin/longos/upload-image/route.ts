import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/longos/upload-image
 *
 * Cria signed upload URL para uma imagem (gerada externamente em MJ ou
 * outro tool) associada a uma cena dum projecto longo. Browser faz PUT
 * directo ao Supabase, contornando limite 4.5MB do body Vercel.
 *
 * Espelha exactamente upload-clip mas para imagens (PNG/JPG/WEBP).
 *
 * Body: { slug, promptId, ext? } — ext default png
 * Returns: { imageUploadUrl, imageUrl, imagePath }
 *
 * Path Supabase: longos-images/<slug>/<promptId>.<ext>
 * Re-uploads sobrescrevem (upsert).
 */

const BUCKET = "course-assets";
const ALLOWED_EXTS = new Set(["png", "jpg", "jpeg", "webp"]);

export async function POST(req: NextRequest) {
  try {
    const { slug, promptId, ext } = (await req.json()) as {
      slug?: string;
      promptId?: string;
      ext?: string;
    };

    if (!slug || !promptId) {
      return NextResponse.json(
        { erro: "slug + promptId obrigatórios" },
        { status: 400 },
      );
    }
    if (!/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
      return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
    }
    if (!/^[a-z0-9][a-z0-9-]{0,120}$/.test(promptId)) {
      return NextResponse.json({ erro: "promptId inválido" }, { status: 400 });
    }
    const safeExt = (ext || "png").toLowerCase();
    if (!ALLOWED_EXTS.has(safeExt)) {
      return NextResponse.json(
        { erro: `ext inválida. Permitidas: ${[...ALLOWED_EXTS].join(", ")}` },
        { status: 400 },
      );
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

    const imagePath = `longos-images/${slug}/${promptId}.${safeExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(imagePath, { upsert: true });
    if (error || !data) {
      return NextResponse.json(
        { erro: `sign falhou: ${error?.message ?? "unknown"}` },
        { status: 500 },
      );
    }

    const storageUrl = `${supabaseUrl}/storage/v1`;
    const imageUploadUrl = `${storageUrl}/object/upload/sign/${BUCKET}/${imagePath}?token=${data.token}`;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${imagePath}`;

    return NextResponse.json({ imageUploadUrl, imageUrl, imagePath });
  } catch (err) {
    return NextResponse.json(
      { erro: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
