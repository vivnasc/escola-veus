import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { RAIZES_TEMAS, parseRaizTema, type RaizTema } from "@/lib/ag-raizes-temas";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * /api/admin/ancient-ground/raizes-clips
 *
 * Pool de clips raízes Ancient Ground — completamente separado do pool
 * Loranne paisagem (que vive em escola-shorts/clips/). Estes vêm de duas
 * fontes:
 *  (a) animate-raiz — Runway image-to-video corrido aqui pela app
 *  (b) upload directo (POST sign aqui) — clips gerados externamente
 *      (Runway ilimitado, MJ video, qualquer ferramenta)
 *
 * Storage: escola-shorts/ag-raizes-clips/{tema}/{tema}-NN.mp4
 *
 * GET    -> lista clips (opcional ?tema=X). Devolve { items: [{tema, filename, url, createdAt}] }
 * POST   -> { tema, files: [{ext}] } → signed upload URLs com auto-NN
 * DELETE -> { tema, filename } → remove
 */

const BUCKET = "escola-shorts";
const PREFIX = "ag-raizes-clips";

type Item = {
  tema: RaizTema;
  filename: string;
  url: string;
  createdAt: string | null;
};

function publicUrl(supabaseUrl: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}

function sanitizeExt(ext: string): string {
  const e = ext.toLowerCase().replace(/^\./, "").replace(/[^a-z0-9]/g, "");
  if (["mp4", "mov", "webm", "m4v"].includes(e)) return e === "m4v" ? "mp4" : e;
  return "mp4";
}

function mimeForExt(ext: string): string {
  if (ext === "mov") return "video/quicktime";
  if (ext === "webm") return "video/webm";
  return "video/mp4";
}

function parseIndex(filename: string, tema: RaizTema): number | null {
  const base = filename.replace(/\.[^.]+$/, "");
  const prefix = `${tema}-`;
  if (!base.startsWith(prefix)) return null;
  const m = base.slice(prefix.length).match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

async function listTema(
  supabase: SupabaseClient,
  tema: RaizTema,
): Promise<{ name: string; created_at?: string | null }[]> {
  const all: { name: string; created_at?: string | null }[] = [];
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(`${PREFIX}/${tema}`, {
        limit: pageSize,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
    if (error || !data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const temaFilter = searchParams.get("tema");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ items: [], erro: "Supabase não configurado." }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const temas: readonly RaizTema[] =
      temaFilter && (RAIZES_TEMAS as readonly string[]).includes(temaFilter)
        ? [temaFilter as RaizTema]
        : RAIZES_TEMAS;

    const items: Item[] = [];
    for (const t of temas) {
      const files = await listTema(supabase, t);
      for (const f of files) {
        if (!f.name.match(/\.(mp4|mov|webm)$/i)) continue;
        items.push({
          tema: t,
          filename: f.name,
          url: publicUrl(supabaseUrl, `${PREFIX}/${t}/${f.name}`),
          createdAt: f.created_at || null,
        });
      }
    }

    return NextResponse.json({ items, total: items.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ items: [], erro: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tema, files } = (await req.json()) as {
      tema?: string;
      files?: { ext?: string }[];
    };

    if (!tema || !(RAIZES_TEMAS as readonly string[]).includes(tema)) {
      return NextResponse.json({ erro: "tema inválido." }, { status: 400 });
    }
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
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Próximo NN livre = max(NN existentes) + 1
    const existing = await listTema(supabase, tema as RaizTema);
    let nextIdx = 1;
    for (const f of existing) {
      const n = parseIndex(f.name, tema as RaizTema);
      if (n !== null && n >= nextIdx) nextIdx = n + 1;
    }

    const storageUrl = `${supabaseUrl}/storage/v1`;
    const items = await Promise.all(
      files.map(async (f, i) => {
        const ext = sanitizeExt(f.ext || "mp4");
        const idx = nextIdx + i;
        const filename = `${tema}-${String(idx).padStart(2, "0")}.${ext}`;
        const path = `${PREFIX}/${tema}/${filename}`;

        const sign = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
        if (sign.error || !sign.data) {
          throw new Error(`sign: ${sign.error?.message || "unknown"}`);
        }

        return {
          filename,
          path,
          contentType: mimeForExt(ext),
          uploadUrl: `${storageUrl}/object/upload/sign/${BUCKET}/${path}?token=${sign.data.token}`,
          publicUrl: publicUrl(supabaseUrl, path),
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
    const { tema, filename } = (await req.json()) as {
      tema?: string;
      filename?: string;
    };
    if (!tema || !(RAIZES_TEMAS as readonly string[]).includes(tema)) {
      return NextResponse.json({ erro: "tema inválido." }, { status: 400 });
    }
    if (!filename || typeof filename !== "string") {
      return NextResponse.json({ erro: "filename obrigatório." }, { status: 400 });
    }
    const parsedTema = parseRaizTema(filename);
    if (parsedTema !== tema) {
      return NextResponse.json({ erro: "filename não corresponde ao tema." }, { status: 400 });
    }
    const safe = filename.replace(/^.*\//, "").replace(/\.\./g, "");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ erro: "Supabase não configurado." }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { error } = await supabase.storage.from(BUCKET).remove([`${PREFIX}/${tema}/${safe}`]);
    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
