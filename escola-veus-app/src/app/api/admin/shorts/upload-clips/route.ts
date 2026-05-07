import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// POST /api/admin/shorts/upload-clips
// Cria signed upload URLs para MP4s gerados por fora + thumbnail PNG extraída
// no browser. O browser faz PUT directo ao Supabase (contorna o limite de
// 4.5MB do body do Vercel). Os clips caem na pool partilhada Loranne+AG
// (página /admin/producao/clips-paisagem) e aparecem automaticamente nos
// pickers dos dois pólos via list-clips-ag.
//
// Body: { files: [{ name, theme }] }
//   - name:  nome original do ficheiro (para preservar extensão .mp4)
//   - theme: tema fixo (mar, rio, floresta, plantas, ceu, deserto, montanha,
//            noite, cidade, abstracto, outro) — vira prefixo no filename com
//            separador "_" para o picker filtrar (ex: "mar_onda-1234-0.mp4").
//
// Returns: { items: [{ name, clipPath, clipUploadUrl, clipToken, clipUrl,
//                       thumbPath, thumbUploadUrl, thumbToken, thumbUrl }] }
//
// DELETE /api/admin/shorts/upload-clips
// Body: { name: string }  (nome do ficheiro em /clips/ sem pasta)
//   Remove o MP4 e o PNG thumb (se existir) do bucket.

const BUCKET = "escola-shorts"; // legado — pool partilhada Loranne+AG

// Categorias válidas — alinha com src/lib/paisagem-categorias.ts (taxonomia
// do thinkdiffusion-prompts.json). Copiado aqui para não pagar import no hot
// path da API.
const VALID_THEMES = new Set([
  "mar", "mar2", "praia", "praia2", "rio", "chuva",
  "savana", "terra", "flora", "jardim", "caminho",
  "ceu", "noite", "nevoeiro", "fogo", "outro",
]);

type SignItem = {
  name: string;
  theme?: string;
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
        const theme = f.theme && VALID_THEMES.has(f.theme) ? f.theme : "outro";
        const base = slugify(f.name);
        const stamp = `${timestamp}-${i}`;
        // Formato: "{tema}_{base}-{stamp}.mp4". O separador "_" permite ao
        // picker extrair o tema (parseClipTheme). slugify() remove underscores
        // do base, mantendo o "_" único como separador de tema.
        const fileStem = `${theme}_${base}-${stamp}`;
        const clipPath = `clips/${fileStem}.mp4`;
        const thumbPath = `thumbs/${fileStem}.png`;

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
