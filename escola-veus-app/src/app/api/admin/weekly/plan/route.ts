import { NextRequest, NextResponse } from "next/server";

import { BRANDS, ALL_PLATFORMS, DAY_ORDER, type BrandSlug } from "@/data/weekly-social/brand-config";
import {
  pickWeeklyLoranne,
  pickWeeklyAG,
  getTrackTitle,
  getAlbumTitle,
} from "@/data/weekly-social/weekly-rotation";
import { scheduleFor, currentYear } from "@/lib/weekly-social/schedule";
import { buildLoranneCaptions, buildAGCaptions } from "@/lib/weekly-social/captions";
import { pickLoranneClips, pickAGClips, findTrackUrl } from "@/lib/weekly-social/clip-picker";
import { savePlan } from "@/lib/weekly-social/plan-storage";
import type { WeeklyPlan, WeeklyPost } from "@/lib/weekly-social/types";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // 7 + 3 chamadas Claude — pode demorar 60-90s

/**
 * POST /api/admin/weekly/plan
 * Body: { week: number, year?: number, brands?: ("loranne"|"ancient-ground")[] }
 *
 * Para cada marca pedida (default: ambas):
 *   1. Determina os posts da semana via rotação determinística.
 *   2. Resolve URLs de música (bucket audios) e clips (escola-shorts).
 *   3. Chama suggest / suggest-ag para versos+captions.
 *   4. Calcula data+hora por plataforma (Maputo CAT).
 *   5. Grava o plan em course-assets/weekly-social/<year>-W<NN>/<brand>-plan.json.
 *
 * Devolve: { plans: { loranne?: WeeklyPlan, "ancient-ground"?: WeeklyPlan }, errors: [] }
 */

type Body = {
  week?: number;
  year?: number;
  brands?: BrandSlug[];
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET_AUDIOS = "audios";
const BUCKET_CLIPS = "escola-shorts";

async function listAlbumTracks(albumSlug: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  const { data, error } = await admin.storage
    .from(BUCKET_AUDIOS)
    .list(`albums/${albumSlug}`, { limit: 500, sortBy: { column: "name", order: "asc" } });
  if (error) throw new Error(`list ${albumSlug}: ${error.message}`);
  return (data || [])
    .filter((f) => /\.(mp3|wav|m4a|flac|ogg)$/i.test(f.name))
    .map((f) => ({
      name: f.name,
      url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_AUDIOS}/albums/${albumSlug}/${f.name}`,
    }));
}

async function listLoranneClips() {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  const all: { name: string; url: string }[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await admin.storage
      .from(BUCKET_CLIPS)
      .list("clips", { limit: 1000, offset });
    if (error) throw new Error(`list clips: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const f of data) {
      if (/\.mp4$/i.test(f.name)) {
        all.push({
          name: f.name.replace(/\.mp4$/i, ""),
          url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_CLIPS}/clips/${f.name}`,
        });
      }
    }
    if (data.length < 1000) break;
    offset += 1000;
  }
  return all;
}

async function listAGRaizesClips() {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  const all: { name: string; url: string }[] = [];
  // Lista as pastas (temas) primeiro
  const { data: folders, error: folderErr } = await admin.storage
    .from(BUCKET_CLIPS)
    .list("ag-raizes-clips", { limit: 100 });
  if (folderErr) throw new Error(`list ag-raizes folders: ${folderErr.message}`);
  for (const folder of folders || []) {
    if (folder.name.includes(".")) continue;
    const { data: files } = await admin.storage
      .from(BUCKET_CLIPS)
      .list(`ag-raizes-clips/${folder.name}`, { limit: 500 });
    for (const f of files || []) {
      if (/\.mp4$/i.test(f.name)) {
        all.push({
          name: f.name.replace(/\.mp4$/i, ""),
          url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_CLIPS}/ag-raizes-clips/${folder.name}/${f.name}`,
        });
      }
    }
  }
  return all;
}

async function callSuggest(req: NextRequest, body: object): Promise<unknown> {
  const url = new URL("/api/admin/shorts/suggest", req.nextUrl.origin);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`suggest ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function callSuggestAG(req: NextRequest, body: object): Promise<unknown> {
  const url = new URL("/api/admin/shorts/suggest-ag", req.nextUrl.origin);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`suggest-ag ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const week = Number(body.week);
    const year = Number(body.year ?? currentYear());
    if (!Number.isFinite(week) || week < 1 || week > 53) {
      return NextResponse.json({ erro: "week (1-53) obrigatória" }, { status: 400 });
    }

    const brands: BrandSlug[] = body.brands && body.brands.length > 0
      ? body.brands
      : ["loranne", "ancient-ground"];

    const plans: Partial<Record<BrandSlug, WeeklyPlan>> = {};
    const errors: { brand: BrandSlug; postId?: string; message: string }[] = [];

    // ─── Loranne ────────────────────────────────────────────────────────
    if (brands.includes("loranne")) {
      const brand = BRANDS.loranne;
      const loranneClipPool = await listLoranneClips();
      if (loranneClipPool.length < 3) {
        errors.push({ brand: "loranne", message: `Pool de clips Loranne tem ${loranneClipPool.length}, precisa ≥3.` });
      } else {
        const posts: WeeklyPost[] = [];
        for (const day of brand.publishDays) {
          const dayIdx = DAY_ORDER.indexOf(day);
          const entry = pickWeeklyLoranne(week, dayIdx);
          const trackTitle = getTrackTitle(entry.albumSlug, entry.trackNumber);
          const albumTitle = getAlbumTitle(entry.albumSlug);

          try {
            const suggest = await callSuggest(req, {
              albumSlug: entry.albumSlug,
              trackNumber: entry.trackNumber,
            }) as Parameters<typeof buildLoranneCaptions>[0];

            const tracks = await listAlbumTracks(entry.albumSlug);
            const musicUrl = findTrackUrl(tracks, entry.trackNumber);
            if (!musicUrl) throw new Error(`MP3 ${entry.albumSlug}/faixa ${entry.trackNumber} não encontrado em audios/albums/${entry.albumSlug}/`);

            const clipUrls = pickLoranneClips(loranneClipPool, entry.albumSlug, entry.trackNumber, week);
            const captions = buildLoranneCaptions(suggest, brand, { trackTitle, albumTitle, theme: null });

            posts.push({
              id: `loranne-${entry.albumSlug}-f${entry.trackNumber}-w${week}-${day}`,
              brandSlug: "loranne",
              day,
              albumSlug: entry.albumSlug,
              trackNumber: entry.trackNumber,
              trackTitle,
              albumTitle,
              verses: (suggest.verses || []).slice(0, 2),
              musicUrl,
              clipUrls,
              captions,
              schedule: Object.fromEntries(
                ALL_PLATFORMS.map((p) => [p, scheduleFor(year, week, day, brand.hoursByPlatform[p])]),
              ) as WeeklyPost["schedule"],
              videoUrl: null,
              thumbnailUrl: null,
              jobId: null,
              status: "planned",
            });
          } catch (e) {
            errors.push({
              brand: "loranne",
              postId: `loranne-${entry.albumSlug}-f${entry.trackNumber}-${day}`,
              message: e instanceof Error ? e.message : String(e),
            });
          }
        }

        const plan: WeeklyPlan = {
          year, week, brand: "loranne",
          generatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          posts,
        };
        await savePlan(plan);
        plans.loranne = plan;
      }
    }

    // ─── Ancient Ground ────────────────────────────────────────────────
    if (brands.includes("ancient-ground")) {
      const brand = BRANDS["ancient-ground"];
      const agClipPool = await listAGRaizesClips();
      const agTracks = await listAlbumTracks("ancient-ground");
      const posts: WeeklyPost[] = [];
      let slotIdx = 0;
      for (const day of brand.publishDays) {
        const entry = pickWeeklyAG(week, slotIdx);
        try {
          const clipUrls = pickAGClips(agClipPool, entry.temas, week);
          const suggest = await callSuggestAG(req, {
            temas: entry.temas,
            trackNumber: entry.trackNumber,
          }) as Parameters<typeof buildAGCaptions>[0];

          const musicUrl = findTrackUrl(agTracks, entry.trackNumber);
          if (!musicUrl) throw new Error(`MP3 ancient-ground/faixa ${entry.trackNumber} não encontrado.`);

          const captions = buildAGCaptions(suggest, brand, {
            label: entry.label, trackNumber: entry.trackNumber, temas: entry.temas,
          });

          posts.push({
            id: `ag-${entry.temas.join("-")}-w${week}-${day}`,
            brandSlug: "ancient-ground",
            day,
            label: entry.label,
            trackNumber: entry.trackNumber,
            temas: [...entry.temas],
            verses: (suggest.versos || []).slice(0, 2),
            musicUrl,
            clipUrls,
            captions,
            schedule: Object.fromEntries(
              ALL_PLATFORMS.map((p) => [p, scheduleFor(year, week, day, brand.hoursByPlatform[p])]),
            ) as WeeklyPost["schedule"],
            videoUrl: null,
            thumbnailUrl: null,
            jobId: null,
            status: "planned",
          });
        } catch (e) {
          errors.push({
            brand: "ancient-ground",
            postId: `ag-w${week}-${day}`,
            message: e instanceof Error ? e.message : String(e),
          });
        }
        slotIdx++;
      }

      const plan: WeeklyPlan = {
        year, week, brand: "ancient-ground",
        generatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        posts,
      };
      await savePlan(plan);
      plans["ancient-ground"] = plan;
    }

    return NextResponse.json({ plans, errors });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
