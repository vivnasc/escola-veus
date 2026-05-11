/**
 * Limpeza de mp4s órfãos em `course-assets/shorts/videos/`.
 *
 * Antes do fix de path estável (commit f3379e1 + sucessor), cada re-render
 * criava um novo ficheiro `lyric-{mode}-{slug}-{timestamp}.mp4`. Resultado:
 * todas as versões antigas acumuladas em Supabase, custando espaço.
 *
 * A partir do fix, mp4s vão para path estável `lyric-{mode}-{slug}.mp4`
 * (sem timestamp). Esta rota apaga TODOS os mp4s antigos com timestamp
 * no nome — esses são órfãos que ninguém referencia.
 *
 * Uso: POST /api/admin/weekly/cleanup
 *   body: { dryRun?: boolean }  → se dryRun=true só lista sem apagar
 */

import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const BUCKET = "course-assets";
const PREFIX = "shorts/videos";

// Padrão de filename ORFÃO: termina em "-<13-digit-timestamp>.mp4".
// Files no formato novo (sem timestamp) ficam preservados.
const ORPHAN_PATTERN = /-\d{13}\.mp4$/;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { dryRun?: boolean };
    const dryRun = body.dryRun === true;

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json(
        { erro: "SUPABASE_SERVICE_ROLE_KEY não configurada" },
        { status: 500 },
      );
    }

    // Lista tudo em shorts/videos. Supabase paginate em batches de 100;
    // weekly content + AG raramente ultrapassa, mas itera por segurança.
    const orphans: string[] = [];
    let offset = 0;
    const PAGE = 1000;
    while (true) {
      const { data, error } = await admin.storage
        .from(BUCKET)
        .list(PREFIX, { limit: PAGE, offset, sortBy: { column: "name", order: "asc" } });
      if (error) {
        return NextResponse.json({ erro: `list falhou: ${error.message}` }, { status: 500 });
      }
      if (!data || data.length === 0) break;
      for (const file of data) {
        if (file.name && ORPHAN_PATTERN.test(file.name)) {
          orphans.push(`${PREFIX}/${file.name}`);
        }
      }
      if (data.length < PAGE) break;
      offset += PAGE;
    }

    if (orphans.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0, found: 0, dryRun });
    }

    if (dryRun) {
      return NextResponse.json({ ok: true, found: orphans.length, dryRun: true, sample: orphans.slice(0, 20) });
    }

    // Supabase aceita lote de até 100 paths por delete. Splita.
    let deleted = 0;
    for (let i = 0; i < orphans.length; i += 100) {
      const chunk = orphans.slice(i, i + 100);
      const { error } = await admin.storage.from(BUCKET).remove(chunk);
      if (error) {
        return NextResponse.json(
          { erro: `delete falhou em chunk ${i}: ${error.message}`, deletedAtePonto: deleted },
          { status: 500 },
        );
      }
      deleted += chunk.length;
    }

    return NextResponse.json({ ok: true, deleted, found: orphans.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
