import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// POST /api/admin/shorts/upload-clips
// Cria signed upload URLs para MP4s gerados por fora (Runway ilimitado) +
// thumbnail PNG extraída no browser. O browser faz PUT directo ao Supabase
// (contorna o limite de 4.5MB do body do Vercel). Os clips caem no mesmo
// bucket `escola-shorts/clips/` que o animate-one usa — aparecem automaticamente
// em Loranne (list-clips) e AG (list-clips-ag).
//
// Body: { files: [{ name, label? }] }
//   - name:  nome original do ficheiro (para preservar extensão .mp4)
//   - label: prefixo amigável (ex: "loranne-mar", "ag-deserto"); default = basename
//
// Returns: { items: [{ name, clipPath, clipUploadUrl, clipToken, clipUrl,
//                       thumbPath, thumbUploadUrl, thumbToken, thumbUrl }] }
//
// DELETE /api/admin/shorts/upload-clips
// Body: { name: string }  (nome do ficheiro em /clips/ sem pasta)
//   Remove o MP4 e o PNG thumb (se existir) do bucket.

const BUCKET = "escola-shorts";

type SignItem = {
  name: string;
  label?: string;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "clip";
}

export async function POST(req: NextRequest) {
  try {
    const { files } = (await req.json()) as { files?: SignItem[] };

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ erro: "files[] obrigatório." }, { status: 400 });
    }
    if (files.length > 20) {
      return NextResponse.json({ erro: "Máximo 20 ficheiros por pedido." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase não configurado." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const storageUrl = `${supabaseUrl}/storage/v1`;
    const timestamp = Date.now();

    const items = await Promise.all(
      files.map(async (f, i) => {
        const base = slugify(f.label || f.name);
        const stamp = `${timestamp}-${i}`;
        const clipPath = `clips/${base}-${stamp}.mp4`;
        const thumbPath = `thumbs/${base}-${stamp}.png`;

        const [clipSign, thumbSign] = await Promise.all([
          supabase.storage.from(BUCKET).createSignedUploadUrl(clipPath),
          supabase.storage.from(BUCKET).createSignedUploadUrl(thumbPath),
        ]);

        if (clipSign.error || !clipSign.data) {
          throw new Error(`sign clip: ${clipSign.error?.message || "unknown"}`);
        }
        if (thumbSign.error || !thumbSign.data) {
          throw new Error(`sign thumb: ${thumbSign.error?.message || "unknown"}`);
        }

        return {
          name: f.name,
          clipPath,
          clipToken: clipSign.data.token,
          clipUploadUrl: `${storageUrl}/object/upload/sign/${BUCKET}/${clipPath}?token=${clipSign.data.token}`,
          clipUrl: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${clipPath}`,
          thumbPath,
          thumbToken: thumbSign.data.token,
          thumbUploadUrl: `${storageUrl}/object/upload/sign/${BUCKET}/${thumbPath}?token=${thumbSign.data.token}`,
          thumbUrl: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${thumbPath}`,
        };
      }),
    );

    return NextResponse.json({ items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { name } = (await req.json()) as { name?: string };
    if (!name || typeof name !== "string") {
      return NextResponse.json({ erro: "name obrigatório." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase não configurado." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const safe = name.replace(/^.*\//, "").replace(/\.\./g, "");
    const clipKey = safe.endsWith(".mp4") ? safe : `${safe}.mp4`;
    const thumbKey = clipKey.replace(/\.mp4$/, ".png");

    await supabase.storage.from(BUCKET).remove([`clips/${clipKey}`, `thumbs/${thumbKey}`]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
