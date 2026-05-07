import { NextRequest, NextResponse } from "next/server";

import { type BrandSlug } from "@/data/weekly-social/brand-config";
import { loadPlan, savePlan } from "@/lib/weekly-social/plan-storage";
import { currentYear } from "@/lib/weekly-social/schedule";
import type { WeeklyPlan, WeeklyPost } from "@/lib/weekly-social/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/admin/weekly/status?week=19&year=2026
 *
 * Para cada post com jobId, lê o result.json em course-assets/render-jobs/.
 * Actualiza videoUrl, thumbnailUrl, status no plan.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

type RenderResult = {
  status?: "queued" | "downloading" | "rendering" | "uploading" | "done" | "failed";
  videoUrl?: string;
  url?: string;
  thumbnailUrl?: string;
  error?: string;
  progress?: number;
};

async function fetchResult(jobId: string): Promise<RenderResult | null> {
  if (!SUPABASE_URL) return null;
  const url = `${SUPABASE_URL}/storage/v1/object/public/course-assets/render-jobs/${encodeURIComponent(jobId)}-result.json?t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  try {
    return (await res.json()) as RenderResult;
  } catch {
    return null;
  }
}

async function refreshBrand(plan: WeeklyPlan): Promise<{
  total: number; done: number; rendering: number; failed: number;
}> {
  let dirty = false;
  let done = 0, rendering = 0, failed = 0;
  for (const post of plan.posts) {
    if (post.status === "done" && post.videoUrl) { done++; continue; }
    if (!post.jobId) {
      if (post.status === "failed") failed++;
      continue;
    }
    const result = await fetchResult(post.jobId);
    if (!result) continue;
    if (result.status === "done") {
      const videoUrl = result.videoUrl || result.url || null;
      if (videoUrl !== post.videoUrl || post.status !== "done") {
        post.videoUrl = videoUrl;
        post.thumbnailUrl = result.thumbnailUrl || post.thumbnailUrl;
        post.status = "done";
        post.errorMessage = undefined;
        dirty = true;
      }
      done++;
    } else if (result.status === "failed") {
      if (post.status !== "failed") {
        post.status = "failed";
        post.errorMessage = result.error || "render falhou";
        dirty = true;
      }
      failed++;
    } else {
      if (post.status !== "rendering") {
        post.status = "rendering";
        dirty = true;
      }
      rendering++;
    }
  }
  if (dirty) await savePlan(plan);
  return { total: plan.posts.length, done, rendering, failed };
}

export async function GET(req: NextRequest) {
  const week = Number(req.nextUrl.searchParams.get("week"));
  const year = Number(req.nextUrl.searchParams.get("year") ?? currentYear());
  if (!Number.isFinite(week)) {
    return NextResponse.json({ erro: "week obrigatória" }, { status: 400 });
  }

  const brandsParam = req.nextUrl.searchParams.get("brands");
  const brands: BrandSlug[] = brandsParam
    ? (brandsParam.split(",") as BrandSlug[])
    : ["loranne", "ancient-ground"];

  const result: Record<string, {
    plan: WeeklyPlan | null;
    summary?: { total: number; done: number; rendering: number; failed: number };
  }> = {};

  for (const brand of brands) {
    const plan = await loadPlan(year, week, brand);
    if (!plan) { result[brand] = { plan: null }; continue; }
    const summary = await refreshBrand(plan);
    result[brand] = { plan, summary };
  }

  return NextResponse.json(result);
}
