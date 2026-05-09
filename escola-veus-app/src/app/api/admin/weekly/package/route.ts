import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

import { type BrandSlug } from "@/data/weekly-social/brand-config";
import { loadPlan } from "@/lib/weekly-social/plan-storage";
import { buildCsv, type CsvPost } from "@/lib/weekly-social/metricool-csv";
import { currentYear } from "@/lib/weekly-social/schedule";
import { zipStoragePath, type WeeklyPlan } from "@/lib/weekly-social/types";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/weekly/package
 * Body: { week, year?, brands?: BrandSlug[] }
 *
 * Gera metricool.csv + ZIP por marca e sobe para Supabase em
 * course-assets/weekly-social/<year>-W<NN>/<brand>-<year>-W<NN>.zip.
 * Devolve URLs públicos.
 */

const BUCKET = "course-assets";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function planToCsvPosts(plan: WeeklyPlan): CsvPost[] {
  return plan.posts.map((p) => {
    const clipUrl = p.renderJobs?.clip?.videoUrl ?? p.videoUrl ?? null;
    const fullUrl = p.renderJobs?.full?.videoUrl ?? null;
    const thumb = p.renderJobs?.clip?.thumbnailUrl ?? p.thumbnailUrl ?? null;
    return {
      id: p.id,
      videoUrl: clipUrl,
      fullVideoUrl: fullUrl,
      thumbnailUrl: thumb,
      trackTitle: p.trackTitle || p.label,
      captions: p.captions,
      schedule: p.schedule,
      fullSchedule: p.fullSchedule,
    };
  });
}

function buildReadme(plan: WeeklyPlan, missingClip: string[], missingFull: string[]): string {
  const dn = plan.brand === "loranne" ? "Loranne" : "Ancient Ground";
  const withFull = plan.posts.filter((p) => p.renderJobs?.full?.videoUrl).length;
  const lines = [
    `${dn} — Semana ${plan.week} de ${plan.year}`,
    "═".repeat(60),
    "",
    `Posts planeados: ${plan.posts.length}`,
    `Versão clip (30s social): IG Reel · TikTok · YT Shorts`,
    `Versão full (3-5min): YT canal ${dn}`,
    `Linhas no CSV: ${plan.posts.length * 3} (social) + ${withFull} (YT canal) = ${plan.posts.length * 3 + withFull}`,
    "",
    "Como importar no Metricool:",
    `  1. Abre Metricool > workspace ${dn}`,
    "  2. Planning > Calendar > Import CSV",
    "  3. Drag & drop do metricool.csv (até 50 linhas; divide se preciso)",
    "  4. Verifica horários e clica Import",
    "",
  ];
  if (missingClip.length > 0) {
    lines.push("⚠ POSTS SEM CLIP:");
    for (const id of missingClip) lines.push(`  · ${id}`);
    lines.push("");
  }
  if (missingFull.length > 0) {
    lines.push("ℹ POSTS SEM FULL (não vão para YT canal):");
    for (const id of missingFull) lines.push(`  · ${id}`);
    lines.push("");
  }
  lines.push(`Gerado em ${new Date().toISOString()}`);
  return lines.join("\n");
}

async function packBrand(plan: WeeklyPlan): Promise<{
  url: string; zipName: string; sizeBytes: number;
  missing: string[]; missingFull: string[];
}> {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");

  const csvPosts = planToCsvPosts(plan);
  const csv = buildCsv(csvPosts);
  const missingClip = csvPosts.filter((p) => !p.videoUrl).map((p) => p.id);
  const missingFull = csvPosts.filter((p) => !p.fullVideoUrl).map((p) => p.id);

  const zip = new JSZip();
  zip.file("metricool.csv", csv);
  zip.file("posts.json", JSON.stringify(plan, null, 2));
  zip.file("README.txt", buildReadme(plan, missingClip, missingFull));

  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const path = zipStoragePath(plan.year, plan.week, plan.brand);
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: "application/zip", upsert: true });
  if (error) throw new Error(`upload zip ${path}: ${error.message}`);

  const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}?t=${Date.now()}`;
  const w = String(plan.week).padStart(2, "0");
  const zipName = `${plan.brand}-${plan.year}-W${w}.zip`;
  return { url, zipName, sizeBytes: buf.length, missing: missingClip, missingFull };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { week?: number; year?: number; brands?: BrandSlug[] };
    const week = Number(body.week);
    const year = Number(body.year ?? currentYear());
    if (!Number.isFinite(week)) {
      return NextResponse.json({ erro: "week obrigatória" }, { status: 400 });
    }
    const brands: BrandSlug[] = body.brands && body.brands.length > 0
      ? body.brands : ["loranne", "ancient-ground"];

    const result: Record<string, {
      url?: string; zipName?: string; sizeBytes?: number;
      missing?: string[]; missingFull?: string[]; erro?: string;
    }> = {};
    for (const brand of brands) {
      const plan = await loadPlan(year, week, brand);
      if (!plan) { result[brand] = { erro: "plan inexistente" }; continue; }
      result[brand] = await packBrand(plan);
    }
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
