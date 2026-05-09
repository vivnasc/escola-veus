import { NextRequest, NextResponse } from "next/server";

import { type BrandSlug } from "@/data/weekly-social/brand-config";
import { loadPlan, savePlan } from "@/lib/weekly-social/plan-storage";
import { currentYear } from "@/lib/weekly-social/schedule";
import type { WeeklyPlan, WeeklyPost, RenderMode } from "@/lib/weekly-social/types";
import { runRenderRemotionSubmit } from "@/lib/shorts/render-remotion-core";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/weekly/dispatch
 * Body: { week, year?, brands?: BrandSlug[] }
 *
 * Para cada post sem renderJobs.{clip,full}.videoUrl, dispatcha render
 * Remotion. 2 jobs por post: clip (30s social) + full (3-5 min YT canal).
 *
 * Loranne usa lyricsSync=true (letras passam em sync).
 * AG usa lyricsSync=false (2 versos estáticos overlay).
 */

type Body = {
  week?: number;
  year?: number;
  brands?: BrandSlug[];
  /** Se true, reseta todos os renderJobs antes de dispatchar (re-render forçado). */
  force?: boolean;
};

const MODE_DURATIONS: Record<RenderMode, number> = {
  clip: 30,
  full: 240,
};

async function dispatchOnePostMode(post: WeeklyPost, mode: RenderMode): Promise<{ jobId: string }> {
  const title = post.brandSlug === "loranne"
    ? `${post.trackTitle} · ${post.albumTitle}`
    : (post.label || post.id);
  const verses: [string, string] = [
    post.verses?.[0] || "",
    post.verses?.[1] || "",
  ];
  // Para mode=full, prefere a duração real do áudio (Scribe) — clip mantém-se 30s.
  const durationSec = mode === "full"
    ? (post.audioDurationSec && post.audioDurationSec > 0 ? Math.ceil(post.audioDurationSec) : MODE_DURATIONS.full)
    : MODE_DURATIONS.clip;
  // AG mode=full passa storyChapters (texto a passar) em vez de só verses overlay
  const isAgFull = post.brandSlug === "ancient-ground" && mode === "full";
  return runRenderRemotionSubmit({
    title,
    slug: `${post.id}-${mode}`,
    mode,
    brand: post.brandSlug,
    motionVariant: post.motionVariant,
    accent: post.accent,
    verses,
    syncedLyrics: post.brandSlug === "loranne" ? post.syncedLyrics : undefined,
    stanzaTimings: post.brandSlug === "loranne" ? post.stanzaTimings : undefined,
    audioDurationSec: post.audioDurationSec,
    lyricsSync: post.brandSlug === "loranne" && (post.syncedLyrics?.length || 0) > 0,
    storyChapters: isAgFull ? post.storyChapters : undefined,
    storyTitle: isAgFull ? post.storyTitle : undefined,
    audioUrl: post.musicUrl,
    audioVolume: 1,
    trackLabel: post.trackLabel,
    durationSec,
  });
}

async function dispatchBrand(plan: WeeklyPlan, force: boolean): Promise<{
  dispatched: number;
  alreadyDone: number;
  errors: { postId: string; mode: RenderMode; message: string }[];
}> {
  const errors: { postId: string; mode: RenderMode; message: string }[] = [];
  let dispatched = 0;
  let alreadyDone = 0;

  for (const post of plan.posts) {
    if (!post.renderJobs) post.renderJobs = {};
    for (const mode of ["clip", "full"] as RenderMode[]) {
      if (force) {
        // Reseta o job antes de dispatchar — força re-render mesmo se já
        // existir videoUrl ou estiver em curso.
        post.renderJobs[mode] = {
          jobId: null,
          videoUrl: null,
          thumbnailUrl: null,
          status: "planned",
        };
      }
      const job = post.renderJobs[mode];
      if (job?.videoUrl && job.status === "done") {
        alreadyDone++;
        continue;
      }
      if (job?.jobId && job.status !== "failed") {
        // já dispatchado e ainda em curso — não re-dispatcha
        continue;
      }
      try {
        const { jobId } = await dispatchOnePostMode(post, mode);
        post.renderJobs[mode] = {
          jobId,
          videoUrl: null,
          thumbnailUrl: null,
          status: "queued",
        };
        dispatched++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        post.renderJobs[mode] = {
          jobId: null,
          videoUrl: null,
          thumbnailUrl: null,
          status: "failed",
          errorMessage: msg,
        };
        errors.push({ postId: post.id, mode, message: msg });
      }
    }

    // Mantém retrocompat — videoUrl/jobId/status raiz reflectem o clip.
    const clipJob = post.renderJobs.clip;
    if (clipJob) {
      post.videoUrl = clipJob.videoUrl;
      post.thumbnailUrl = clipJob.thumbnailUrl;
      post.jobId = clipJob.jobId;
      post.status = clipJob.status;
      post.errorMessage = clipJob.errorMessage;
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
    const force = body.force === true;

    const summary: Record<string, unknown> = {};
    for (const brand of brands) {
      const plan = await loadPlan(year, week, brand);
      if (!plan) {
        summary[brand] = { erro: "plan inexistente — corre /plan primeiro." };
        continue;
      }
      summary[brand] = await dispatchBrand(plan, force);
    }
    return NextResponse.json({ summary, force });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
