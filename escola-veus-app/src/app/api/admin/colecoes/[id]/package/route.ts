import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  buildCarouselCaption,
  buildCarouselCsv,
  type CarouselPost,
} from "@/lib/carousel-social/metricool-csv";
import type { Dia, Slide } from "@/lib/carousel-types";
import { isoWeekToMonday, formatDate } from "@/lib/weekly-social/schedule";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/colecoes/[id]/package
 *
 * Empacota tudo o que a editora precisa para publicar a coleção:
 *  - mp4/dia-1.mp4 … dia-7.mp4
 *  - captions/dia-N-instagram.txt
 *  - captions/dia-N-tiktok.txt
 *  - captions/dia-N-whatsapp.txt
 *  - metricool.csv (2 linhas por dia: IG Reel + TikTok)
 *  - manifest.json
 *
 * Tudo automático a partir da coleção + do render-job mais recente.
 * Sem configuração manual por dia.
 *
 * Body: { startDate?: "YYYY-MM-DD"; time?: "HH:MM"; cta?: string }
 *  - startDate default: hoje
 *  - time default: 13:00
 *  - cta default: "Guarda este post para voltares mais tarde 💛"
 *
 * Returns: { zipUrl, days, skippedDays, sizeBytes }
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as {
    startDate?: string;
    /** Se enviado, calcula startDate = segunda da semana ISO N (ano opcional, default ano corrente). */
    weekNumber?: number;
    year?: number;
    time?: string;
    cta?: string;
  };
  let startDate = body.startDate;
  if (!startDate && Number.isFinite(body.weekNumber)) {
    const year = Number(body.year) || new Date().getUTCFullYear();
    const monday = isoWeekToMonday(year, Number(body.weekNumber));
    startDate = formatDate(monday);
  }
  if (!startDate) startDate = isoToday();
  const time = body.time || "13:00";
  const cta = body.cta ?? "Guarda este post para voltares mais tarde 💛";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ erro: "Supabase admin indisponível" }, { status: 500 });

  // 1. Carrega a coleção
  const { data: col, error: rdErr } = await admin
    .from("carousel_collections")
    .select("id, slug, title, dias")
    .eq("id", id)
    .maybeSingle();
  if (rdErr || !col) {
    return NextResponse.json({ erro: "coleção não encontrada" }, { status: 404 });
  }
  const slug = String(col.slug);
  const title = String(col.title);
  const dias = (col.dias as Dia[]) ?? [];

  // 2. Encontra o render-job mais recente desta coleção (jobId começa por slug-)
  const { data: storageList, error: lsErr } = await admin.storage
    .from("course-assets")
    .list("render-jobs", { limit: 1000, sortBy: { column: "name", order: "desc" } });
  if (lsErr) {
    return NextResponse.json({ erro: `Listar render-jobs falhou: ${lsErr.message}` }, { status: 500 });
  }
  const resultFiles = (storageList || [])
    .filter((f) => f.name.startsWith(`${slug}-`) && f.name.endsWith("-result.json"))
    .map((f) => f.name);
  if (resultFiles.length === 0) {
    return NextResponse.json(
      { erro: `Sem renders prontos para esta coleção (slug: ${slug}). Faz "Gerar vídeos" primeiro.` },
      { status: 404 }
    );
  }
  // Mais recente: o que tem timestamp maior. Naming: {slug}-{timestamp}-result.json
  const latest = resultFiles
    .map((name) => ({ name, ts: Number(name.match(/-(\d+)-result\.json$/)?.[1] ?? 0) }))
    .sort((a, b) => b.ts - a.ts)[0]!.name;

  const resultUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/render-jobs/${latest}`;
  const rRes = await fetch(resultUrl, { cache: "no-store" });
  if (!rRes.ok) {
    return NextResponse.json({ erro: `Falhou a ler ${latest}` }, { status: 500 });
  }
  const result = (await rRes.json()) as {
    jobId: string;
    status?: string;
    videos?: Array<{ file: string; url: string }>;
  };
  if (!result.videos || result.videos.length === 0) {
    return NextResponse.json({ erro: `Sem MP4 no render-job ${result.jobId}` }, { status: 400 });
  }

  // 3. Monta o ZIP — 1 dia por entrada na coleção, na ordem dia.numero
  const zip = new JSZip();
  const csvPosts: CarouselPost[] = [];
  const skippedDays: number[] = [];
  const builtDays: number[] = [];

  const sortedDias = [...dias].sort((a, b) => a.numero - b.numero);

  for (let i = 0; i < sortedDias.length; i++) {
    const dia = sortedDias[i];
    const dd = String(dia.numero).padStart(2, "0");

    // Vídeo: procura dia-N.mp4 no result
    const video = result.videos.find((v) => v.file === `dia-${dia.numero}.mp4`);
    if (!video) {
      skippedDays.push(dia.numero);
      continue;
    }

    // Texto da capa (linha1 + linha2) é o hook principal
    const capa = dia.slides.find((s): s is Extract<Slide, { tipo: "capa" }> => s.tipo === "capa");
    const cardTexto = capa ? [capa.linha1, capa.linha2].filter(Boolean).join("\n") : dia.veu;

    // CTA do dia (slide 6 normalmente)
    const ctaSlide = dia.slides.find((s): s is Extract<Slide, { tipo: "cta" }> => s.tipo === "cta");
    const ctaLine = ctaSlide ? `→ ${ctaSlide.recurso}\n${ctaSlide.url}` : cta;

    const tema = slugifyTag(dia.veu);

    const captionIg = buildCarouselCaption({
      texto: cardTexto,
      tema,
      cta: ctaLine,
      platform: "instagram",
    });
    const captionTt = buildCarouselCaption({
      texto: cardTexto,
      tema,
      platform: "tiktok",
    });
    const captionWa = buildCarouselCaption({
      texto: cardTexto,
      tema,
      platform: "whatsapp",
    });

    // MP4
    const mp4Res = await fetch(video.url, { cache: "no-store" });
    if (!mp4Res.ok) {
      skippedDays.push(dia.numero);
      continue;
    }
    const mp4Buf = await mp4Res.arrayBuffer();
    zip.file(`mp4/dia-${dd}.mp4`, mp4Buf);
    zip.file(`captions/dia-${dd}-instagram.txt`, captionIg);
    zip.file(`captions/dia-${dd}-tiktok.txt`, captionTt);
    zip.file(`captions/dia-${dd}-whatsapp.txt`, captionWa);

    const date = addDays(startDate, i);
    csvPosts.push({
      id: `${slug}-dia-${dia.numero}`,
      date,
      time,
      videoUrl: video.url,
      instagramCaption: captionIg,
      tiktokCaption: captionTt,
      tiktokTitle: cardTexto.replace(/\n/g, " ").slice(0, 80),
    });

    builtDays.push(dia.numero);
  }

  if (builtDays.length === 0) {
    return NextResponse.json({ erro: "Nenhum dia conseguiu ser empacotado" }, { status: 500 });
  }

  zip.file("metricool.csv", buildCarouselCsv(csvPosts));
  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        collectionId: id,
        slug,
        title,
        renderJobId: result.jobId,
        startDate,
        time,
        days: builtDays,
        skippedDays,
        builtAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  const zipBuf = await zip.generateAsync({ type: "uint8array", compression: "STORE" });

  // 4. Upload do ZIP
  const zipPath = `carrossel-packages/${slug}-${result.jobId}.zip`;
  const { error: upErr } = await admin.storage
    .from("course-assets")
    .upload(zipPath, zipBuf, { contentType: "application/zip", upsert: true });
  if (upErr) {
    return NextResponse.json({ erro: `ZIP upload: ${upErr.message}` }, { status: 500 });
  }

  const zipUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${zipPath}`;
  return NextResponse.json({
    zipUrl,
    days: builtDays.length,
    skippedDays,
    sizeBytes: zipBuf.byteLength,
    renderJobId: result.jobId,
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────

function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function slugifyTag(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}
