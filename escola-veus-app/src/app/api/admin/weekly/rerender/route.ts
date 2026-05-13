import { NextRequest, NextResponse } from "next/server";

import { type BrandSlug } from "@/data/weekly-social/brand-config";
import { loadPlan, savePlan } from "@/lib/weekly-social/plan-storage";
import { currentYear } from "@/lib/weekly-social/schedule";
import type { RenderMode, WeeklyPost } from "@/lib/weekly-social/types";
import { runRenderRemotionSubmit } from "@/lib/shorts/render-remotion-core";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/weekly/rerender
 * Body: { week, year?, brand, postId, mode }
 *
 * Reseta o renderJob específico (apaga jobId/videoUrl) e despacha um
 * novo render com manifesto actualizado (apanha mudanças de plan
 * recentes — ex: novos storyChapters, captions SEO actualizadas, etc.).
 *
 * Não toca no outro mode do mesmo post nem nos outros posts.
 */

type Body = {
  week?: number;
  year?: number;
  brand?: BrandSlug;
  postId?: string;
  mode?: RenderMode;
};

const MODE_DURATIONS: Record<RenderMode, number> = {
  clip: 30,
  full: 240,
};

async function dispatchPostMode(post: WeeklyPost, mode: RenderMode): Promise<{ jobId: string }> {
  const title = post.brandSlug === "loranne"
    ? `${post.trackTitle} · ${post.albumTitle}`
    : (post.label || post.id);
  const verses: [string, string] = [
    post.verses?.[0] || "",
    post.verses?.[1] || "",
  ];
  const durationSec = mode === "full"
    ? (post.audioDurationSec && post.audioDurationSec > 0 ? Math.ceil(post.audioDurationSec) : MODE_DURATIONS.full)
    : MODE_DURATIONS.clip;
  const isAgFull = post.brandSlug === "ancient-ground" && mode === "full";
  return runRenderRemotionSubmit({
    title,
    slug: `${post.id}-${mode}`,
    mode,
    brand: post.brandSlug,
    motionVariant: post.motionVariant,
    motionSeed: post.motionSeed,
    accent: post.accent,
    verses,
    syncedLyrics: post.brandSlug === "loranne" ? post.syncedLyrics : undefined,
    stanzaTimings: post.brandSlug === "loranne" ? post.stanzaTimings : undefined,
    audioDurationSec: post.audioDurationSec,
    lang: post.brandSlug === "loranne" ? post.lang : undefined,
    lyricsSync: post.brandSlug === "loranne" && (post.syncedLyrics?.length || 0) > 0,
    chorusStanzaIdx: post.brandSlug === "loranne" && mode === "clip"
      ? post.chorusStanzaIdx ?? null : null,
    storyChapters: isAgFull ? post.storyChapters : undefined,
    storyTitle: isAgFull ? post.storyTitle : undefined,
    audioUrl: post.musicUrl,
    audioVolume: 1,
    trackLabel: post.trackLabel,
    durationSec,
    orientation: mode === "full" ? "landscape" : "portrait",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const week = Number(body.week);
    const year = Number(body.year ?? currentYear());
    const brand = body.brand;
    const postId = body.postId;
    const mode = body.mode;

    if (!Number.isFinite(week)) {
      return NextResponse.json({ erro: "week obrigatória" }, { status: 400 });
    }
    if (!brand) {
      return NextResponse.json({ erro: "brand obrigatório" }, { status: 400 });
    }
    if (!postId) {
      return NextResponse.json({ erro: "postId obrigatório" }, { status: 400 });
    }
    if (mode !== "clip" && mode !== "full") {
      return NextResponse.json({ erro: "mode tem de ser 'clip' ou 'full'" }, { status: 400 });
    }

    const plan = await loadPlan(year, week, brand);
    if (!plan) {
      return NextResponse.json({ erro: "plan inexistente" }, { status: 404 });
    }
    const post = plan.posts.find((p) => p.id === postId);
    if (!post) {
      return NextResponse.json({ erro: `post ${postId} não encontrado` }, { status: 404 });
    }

    if (!post.renderJobs) post.renderJobs = {};
    const prevAttempts = post.renderJobs[mode]?.attempts ?? 0;
    // Apaga estado anterior do mode — força re-render
    post.renderJobs[mode] = {
      jobId: null,
      videoUrl: null,
      thumbnailUrl: null,
      status: "planned",
      attempts: prevAttempts,
    };

    try {
      const { jobId } = await dispatchPostMode(post, mode);
      post.renderJobs[mode] = {
        jobId,
        videoUrl: null,
        thumbnailUrl: null,
        status: "queued",
        attempts: prevAttempts + 1,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      post.renderJobs[mode] = {
        jobId: null,
        videoUrl: null,
        thumbnailUrl: null,
        status: "failed",
        errorMessage: msg,
        attempts: prevAttempts + 1,
      };
      await savePlan(plan);
      return NextResponse.json({ erro: msg }, { status: 502 });
    }

    // Retrocompat — se for clip, actualiza campos raiz
    if (mode === "clip") {
      const j = post.renderJobs.clip;
      if (j) {
        post.videoUrl = j.videoUrl;
        post.thumbnailUrl = j.thumbnailUrl;
        post.jobId = j.jobId;
        post.status = j.status;
        post.errorMessage = j.errorMessage;
      }
    }

    await savePlan(plan);
    return NextResponse.json({ ok: true, jobId: post.renderJobs[mode]?.jobId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
