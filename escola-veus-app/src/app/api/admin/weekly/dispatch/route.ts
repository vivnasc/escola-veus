import { NextRequest, NextResponse } from "next/server";

import { type BrandSlug } from "@/data/weekly-social/brand-config";
import { loadPlan, savePlan } from "@/lib/weekly-social/plan-storage";
import { currentYear } from "@/lib/weekly-social/schedule";
import type { WeeklyPlan, WeeklyPost } from "@/lib/weekly-social/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/weekly/dispatch
 * Body: { week, year?, brands?: BrandSlug[] }
 *
 * Para cada post sem jobId, dispatcha render-short-submit. Update do plan
 * com jobId+status="queued". Não bloqueia até render done — UI faz polling
 * via /status.
 */

type Body = {
  week?: number;
  year?: number;
  brands?: BrandSlug[];
};

async function dispatchOne(req: NextRequest, post: WeeklyPost): Promise<{ jobId: string }> {
  const url = new URL("/api/admin/shorts/render-short-submit", req.nextUrl.origin);
  const title = post.brandSlug === "loranne"
    ? `${post.trackTitle} · ${post.albumTitle}`
    : (post.label || post.id);
  const body = {
    title,
    slug: post.id,
    clips: post.clipUrls,
    clipDuration: 10,
    musicUrl: post.musicUrl,
    musicVolume: 0.9,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`render-short-submit ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json() as Promise<{ jobId: string }>;
}

async function dispatchBrand(req: NextRequest, plan: WeeklyPlan): Promise<{
  dispatched: number; alreadyDone: number; errors: { postId: string; message: string }[];
}> {
  const errors: { postId: string; message: string }[] = [];
  let dispatched = 0;
  let alreadyDone = 0;

  for (const post of plan.posts) {
    if (post.videoUrl && post.status === "done") {
      alreadyDone++;
      continue;
    }
    if (post.jobId && post.status !== "failed") {
      // já dispatchado e ainda em curso — não re-dispatcha
      continue;
    }
    try {
      const { jobId } = await dispatchOne(req, post);
      post.jobId = jobId;
      post.status = "queued";
      post.errorMessage = undefined;
      dispatched++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      post.status = "failed";
      post.errorMessage = msg;
      errors.push({ postId: post.id, message: msg });
    }
  }

  await savePlan(plan);
  return { dispatched, alreadyDone, errors };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const week = Number(body.week);
    const year = Number(body.year ?? currentYear());
    if (!Number.isFinite(week)) {
      return NextResponse.json({ erro: "week obrigatória" }, { status: 400 });
    }

    const brands: BrandSlug[] = body.brands && body.brands.length > 0
      ? body.brands : ["loranne", "ancient-ground"];

    const summary: Record<string, unknown> = {};
    for (const brand of brands) {
      const plan = await loadPlan(year, week, brand);
      if (!plan) {
        summary[brand] = { erro: "plan inexistente — corre /plan primeiro." };
        continue;
      }
      summary[brand] = await dispatchBrand(req, plan);
    }
    return NextResponse.json({ summary });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
