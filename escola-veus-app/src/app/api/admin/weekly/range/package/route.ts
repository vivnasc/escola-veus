import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

import { type BrandSlug } from "@/data/weekly-social/brand-config";
import { loadPlan } from "@/lib/weekly-social/plan-storage";
import { buildCsv, type CsvPost } from "@/lib/weekly-social/metricool-csv";
import { currentYear } from "@/lib/weekly-social/schedule";
import { type WeeklyPlan } from "@/lib/weekly-social/types";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/weekly/range/package
 *
 * Body: {
 *   year, weeks: number[], brands?: BrandSlug[],
 *   days?: string[],            // filtro dia-da-semana (mon..sun)
 *   startDate?: "YYYY-MM-DD",   // filtro data exacta (inclusivo)
 *   endDate?:   "YYYY-MM-DD",   // filtro data exacta (inclusivo)
 * }
 *
 * Para cada (year, week, brand) carrega o plano semanal já existente
 * (gerado antes via /api/admin/weekly/plan), aplica os dois filtros
 * (dia-da-semana E intervalo de datas), gera um CSV Metricool por
 * semana, e bundle tudo num só ZIP:
 *
 *   <year>-W41/metricool.csv
 *   <year>-W41/posts.json
 *   <year>-W41/README.txt
 *   <year>-W42/metricool.csv
 *   ...
 *   RANGE-README.txt          (sumário do range + dicas import Metricool)
 *
 * Devolve URL público do ZIP. Path em Supabase usa sufixo
 *   weekly-social/<year>-range-W<first>-W<last>/<brand>-...zip
 *
 * Porquê 1 CSV por semana: Metricool aceita máx 50 linhas/import. Um
 * mês de Loranne = 31×3 = 93 linhas. Splittar por semana ISO mantém
 * cada CSV bem abaixo do limite (7×3 = 21 linhas) e dá-te uma
 * ordem natural de import.
 */

const BUCKET = "course-assets";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

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

type WeekResult = {
  week: number;
  posts: number;
  missing: string[];
  missingFull: string[];
  /** True se a semana foi pulada (plan inexistente ou sem posts após filtro). */
  skipped: boolean;
  skipReason?: string;
};

function buildPerWeekReadme(
  plan: WeeklyPlan,
  missingClip: string[],
  missingFull: string[],
  filteredDays: readonly string[] | null,
): string {
  const dn = plan.brand === "loranne" ? "Loranne" : "Ancient Ground";
  const withFull = plan.posts.filter((p) => p.renderJobs?.full?.videoUrl).length;
  const partialNote = filteredDays && filteredDays.length > 0
    ? ` (parcial: ${filteredDays.join(", ")})`
    : "";
  const lines = [
    `${dn} — Semana ${plan.week} de ${plan.year}${partialNote}`,
    "═".repeat(60),
    "",
    `Posts: ${plan.posts.length}`,
    `Linhas no CSV: ${plan.posts.length * 3} (social) + ${withFull} (YT canal)`,
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
  return lines.join("\n");
}

function buildRangeReadme(
  brand: BrandSlug,
  year: number,
  weeks: number[],
  perWeek: WeekResult[],
  filteredDays: readonly string[] | null,
): string {
  const dn = brand === "loranne" ? "Loranne" : "Ancient Ground";
  const totalPosts = perWeek.reduce((s, w) => s + w.posts, 0);
  const skipped = perWeek.filter((w) => w.skipped);
  const lines = [
    `${dn} — Range ${year} · semanas W${weeks[0]} → W${weeks[weeks.length - 1]} (${weeks.length} semanas)`,
    "═".repeat(70),
    "",
    `Total de posts: ${totalPosts}`,
    `Semanas com plano: ${perWeek.length - skipped.length}/${weeks.length}`,
  ];
  if (filteredDays && filteredDays.length > 0) {
    lines.push(`Dias filtrados: ${filteredDays.join(", ")}`);
  }
  lines.push("");
  lines.push("Como importar no Metricool:");
  lines.push(`  1. Abre Metricool > workspace ${dn}`);
  lines.push("  2. Planning > Calendar > Import CSV");
  lines.push("  3. Para CADA pasta semana W<N>/, drag-drop o metricool.csv");
  lines.push("  4. Verifica horários e clica Import");
  lines.push("");
  lines.push("Pastas:");
  for (const w of perWeek) {
    const wStr = `W${String(w.week).padStart(2, "0")}`;
    if (w.skipped) {
      lines.push(`  · ${wStr}: ⏭ pulada — ${w.skipReason}`);
    } else {
      const flags: string[] = [];
      if (w.missing.length > 0) flags.push(`${w.missing.length} sem clip`);
      if (w.missingFull.length > 0) flags.push(`${w.missingFull.length} sem full`);
      const flagStr = flags.length > 0 ? ` (${flags.join(", ")})` : "";
      lines.push(`  · ${wStr}: ${w.posts} post(s)${flagStr}`);
    }
  }
  lines.push("");
  lines.push(`Gerado em ${new Date().toISOString()}`);
  return lines.join("\n");
}

/** Devolve a data agendada do post (YYYY-MM-DD), tentando IG → TT → YT.
 *  Posts sempre têm as 3 plataformas; usar qualquer uma chega. */
function postDate(p: WeeklyPlan["posts"][number]): string | null {
  return (
    p.schedule?.instagram?.date ||
    p.schedule?.tiktok?.date ||
    p.schedule?.youtube?.date ||
    null
  );
}

async function packBrandRange(
  brand: BrandSlug,
  year: number,
  weeks: number[],
  filteredDays: readonly string[] | null,
  dateRange: { start: string; end: string } | null,
): Promise<{
  url: string;
  zipName: string;
  sizeBytes: number;
  totalPosts: number;
  perWeek: WeekResult[];
}> {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");

  const zip = new JSZip();
  const perWeek: WeekResult[] = [];

  for (const week of weeks) {
    const plan = await loadPlan(year, week, brand);
    if (!plan) {
      perWeek.push({
        week, posts: 0, missing: [], missingFull: [],
        skipped: true,
        skipReason: "plano inexistente — corre /plan para esta semana primeiro",
      });
      continue;
    }

    const posts = plan.posts.filter((p) => {
      if (filteredDays && !filteredDays.includes(p.day.toLowerCase())) return false;
      if (dateRange) {
        const d = postDate(p);
        if (!d) return true; // sem schedule, deixa entrar
        if (d < dateRange.start || d > dateRange.end) return false;
      }
      return true;
    });

    if (posts.length === 0) {
      const reasons: string[] = [];
      if (filteredDays) reasons.push(`não publica em ${filteredDays.join(", ")}`);
      if (dateRange) reasons.push(`fora do range ${dateRange.start}..${dateRange.end}`);
      perWeek.push({
        week, posts: 0, missing: [], missingFull: [],
        skipped: true,
        skipReason: reasons.join("; ") || "sem posts",
      });
      continue;
    }

    const effectivePlan = { ...plan, posts };
    const csvPosts = planToCsvPosts(effectivePlan);
    const csv = buildCsv(csvPosts);
    const missing = csvPosts.filter((p) => !p.videoUrl).map((p) => p.id);
    const missingFull = csvPosts.filter((p) => !p.fullVideoUrl).map((p) => p.id);

    const wStr = String(week).padStart(2, "0");
    const folder = `W${wStr}`;
    zip.file(`${folder}/metricool.csv`, csv);
    zip.file(`${folder}/posts.json`, JSON.stringify(effectivePlan, null, 2));
    zip.file(
      `${folder}/README.txt`,
      buildPerWeekReadme(effectivePlan, missing, missingFull, filteredDays),
    );

    perWeek.push({
      week, posts: posts.length, missing, missingFull, skipped: false,
    });
  }

  zip.file("RANGE-README.txt", buildRangeReadme(brand, year, weeks, perWeek, filteredDays));

  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  const first = String(weeks[0]).padStart(2, "0");
  const last = String(weeks[weeks.length - 1]).padStart(2, "0");
  const path = `weekly-social/${year}-range-W${first}-W${last}/${brand}-${year}-W${first}-W${last}.zip`;
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: "application/zip", upsert: true });
  if (error) throw new Error(`upload zip ${path}: ${error.message}`);

  const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}?t=${Date.now()}`;
  const zipName = `${brand}-${year}-W${first}-W${last}.zip`;
  const totalPosts = perWeek.reduce((s, w) => s + w.posts, 0);
  return { url, zipName, sizeBytes: buf.length, totalPosts, perWeek };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      year?: number;
      weeks?: number[];
      brands?: BrandSlug[];
      days?: string[];
      startDate?: string;
      endDate?: string;
    };
    const year = Number(body.year ?? currentYear());
    const weeks = (body.weeks || [])
      .map((w) => Number(w))
      .filter((w) => Number.isFinite(w) && w >= 1 && w <= 53)
      .sort((a, b) => a - b);
    if (weeks.length === 0) {
      return NextResponse.json({ erro: "weeks (array de semanas ISO) obrigatório" }, { status: 400 });
    }

    const brands: BrandSlug[] = body.brands && body.brands.length > 0
      ? body.brands : ["loranne", "ancient-ground"];

    const dayFilter = body.days && body.days.length > 0
      ? body.days
          .map((d) => d.toLowerCase().trim())
          .filter((d) => DAY_ORDER.includes(d))
      : null;

    const isoDate = /^\d{4}-\d{2}-\d{2}$/;
    const dateRange =
      body.startDate && body.endDate &&
      isoDate.test(body.startDate) && isoDate.test(body.endDate) &&
      body.startDate <= body.endDate
        ? { start: body.startDate, end: body.endDate }
        : null;

    const result: Record<string, {
      url?: string; zipName?: string; sizeBytes?: number;
      totalPosts?: number;
      perWeek?: WeekResult[];
      erro?: string;
    }> = {};
    for (const brand of brands) {
      try {
        result[brand] = await packBrandRange(brand, year, weeks, dayFilter, dateRange);
      } catch (e) {
        result[brand] = { erro: e instanceof Error ? e.message : String(e) };
      }
    }
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
