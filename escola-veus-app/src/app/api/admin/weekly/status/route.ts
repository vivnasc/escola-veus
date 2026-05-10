import { NextRequest, NextResponse } from "next/server";

import { type BrandSlug } from "@/data/weekly-social/brand-config";
import { loadPlan, savePlan } from "@/lib/weekly-social/plan-storage";
import { currentYear } from "@/lib/weekly-social/schedule";
import type { WeeklyPlan, RenderMode, WeeklyPostStatus } from "@/lib/weekly-social/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

type RenderResult = {
  status?: "queued" | "downloading" | "rendering" | "uploading" | "done" | "failed";
  videoUrl?: string;
  url?: string;
  thumbnailUrl?: string;
  error?: string;
  progress?: number;
  renderVersion?: string | null;
  completedAt?: string;
  durationSec?: number | null;
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

function normalizeStatus(s: RenderResult["status"]): WeeklyPostStatus {
  if (s === "done") return "done";
  if (s === "failed") return "failed";
  if (s === "queued") return "queued";
  return "rendering";
}

async function refreshBrand(plan: WeeklyPlan): Promise<{
  totalJobs: number; done: number; rendering: number; failed: number;
}> {
  let dirty = false;
  let done = 0, rendering = 0, failed = 0, totalJobs = 0;

  for (const post of plan.posts) {
    if (!post.renderJobs) post.renderJobs = {};
    for (const mode of ["clip", "full"] as RenderMode[]) {
      const job = post.renderJobs[mode];
      if (!job) continue;
      totalJobs++;

      if (job.status === "done" && job.videoUrl) { done++; continue; }
      if (!job.jobId) {
        if (job.status === "failed") failed++;
        continue;
      }

      const result = await fetchResult(job.jobId);
      if (!result) continue;
      const newStatus = normalizeStatus(result.status);
      if (newStatus === "done") {
        const videoUrl = result.videoUrl || result.url || null;
        const versionChanged = result.renderVersion && result.renderVersion !== job.renderVersion;
        if (videoUrl !== job.videoUrl || job.status !== "done" || versionChanged) {
          job.videoUrl = videoUrl;
          job.thumbnailUrl = result.thumbnailUrl || job.thumbnailUrl;
          job.status = "done";
          job.errorMessage = undefined;
          if (result.renderVersion) job.renderVersion = result.renderVersion;
          if (result.completedAt) job.renderedAt = result.completedAt;
          dirty = true;
        }
        done++;
      } else if (newStatus === "failed") {
        if (job.status !== "failed") {
          job.status = "failed";
          job.errorMessage = result.error || "render falhou";
          dirty = true;
        }
        failed++;
      } else {
        if (job.status !== "rendering") {
          job.status = "rendering";
          dirty = true;
        }
        rendering++;
      }
    }

    // Retrocompat — videoUrl raiz reflecte o clip.
    const clipJob = post.renderJobs.clip;
    if (clipJob) {
      post.videoUrl = clipJob.videoUrl;
      post.thumbnailUrl = clipJob.thumbnailUrl;
      post.jobId = clipJob.jobId;
      post.status = clipJob.status;
      post.errorMessage = clipJob.errorMessage;
    }
  }
  if (dirty) await savePlan(plan);
  return { totalJobs, done, rendering, failed };
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
    // Mantém forma anterior: "total" agora é nº de jobs (2× nº posts).
    result[brand] = { plan, summary: {
      total: summary.totalJobs,
      done: summary.done,
      rendering: summary.rendering,
      failed: summary.failed,
    } };
  }

  return NextResponse.json(result);
}
