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
import { findTrackUrl, extractTrackNumbers, closestTrackNumber } from "@/lib/weekly-social/clip-picker";
import { savePlan } from "@/lib/weekly-social/plan-storage";
import type { WeeklyPlan, WeeklyPost } from "@/lib/weekly-social/types";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { runSuggest } from "@/lib/shorts/suggest-core";
import { runSuggestAG } from "@/lib/shorts/suggest-ag-core";
import { getLoranneStanzas } from "@/lib/shorts/lyrics-stanzas";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // 7 + 3 chamadas Claude — pode demorar 60-90s

/**
 * POST /api/admin/weekly/plan
 * Body: { week: number, year?: number, brands?: ("loranne"|"ancient-ground")[] }
 *
 * Para cada marca:
 *   1. Determina os posts via rotação determinística.
 *   2. Atribui motionVariant (A/B/C/D) determinístico — ciclo entre os 4
 *      para variedade entre vídeos. Loranne acrescenta accent (cor por
 *      álbum).
 *   3. Resolve URL do MP3 (bucket audios/albums/<slug>).
 *   4. Chama suggest/suggest-ag para versos+captions.
 *   5. Calcula data+hora por plataforma.
 *   6. Grava em course-assets/weekly-social/<year>-W<NN>/<brand>-plan.json.
 *
 * Sem clip pools — vídeo é renderizado programaticamente via Remotion.
 */

type Body = {
  week?: number;
  year?: number;
  brands?: BrandSlug[];
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BUCKET_AUDIOS = "audios";

const MOTION_VARIANTS = ["A", "B", "C", "D"] as const;

/** Acentos Loranne por prefixo de álbum — cor que vai para o background. */
const LORANNE_ALBUM_ACCENTS: Record<string, string> = {
  eter: "#4A6FA5",
  sangue: "#B0344A",
  espelho: "#7E57C2",
  nua: "#D4A853",
  incenso: "#A088C0",
  fibra: "#E07050",
  grao: "#B08050",
  livro: "#5060A8",
};

function pickLoranneAccent(albumSlug: string): string {
  const prefix = albumSlug.split("-")[0];
  return LORANNE_ALBUM_ACCENTS[prefix] || "#D4A853";
}

/** Determinístico: ciclo dos 4 motions por (album, faixa) ou por (temas joined). */
function pickMotionVariant(seed: string): "A" | "B" | "C" | "D" {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return MOTION_VARIANTS[Math.abs(h) % 4];
}

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
      const posts: WeeklyPost[] = [];
      for (const day of brand.publishDays) {
        const dayIdx = DAY_ORDER.indexOf(day);
        const entry = pickWeeklyLoranne(week, dayIdx);
        const albumTitle = getAlbumTitle(entry.albumSlug);

        try {
          // Lista MP3s deste álbum no Supabase. Fallback: se a faixa pedida
          // não tem MP3 produzido, escolhe a mais próxima do mesmo álbum
          // (re-extrai versos dessa faixa).
          const tracks = await listAlbumTracks(entry.albumSlug);
          if (tracks.length === 0) {
            throw new Error(`Sem MP3 nenhum em audios/albums/${entry.albumSlug}/`);
          }
          let actualTrackNumber = entry.trackNumber;
          let musicUrl = findTrackUrl(tracks, actualTrackNumber);
          if (!musicUrl) {
            const available = extractTrackNumbers(tracks);
            if (available.length === 0) {
              throw new Error(`Sem MP3s identificáveis em audios/albums/${entry.albumSlug}/ (filenames sem padrão NN).`);
            }
            const fallback = closestTrackNumber(available, entry.trackNumber);
            if (!fallback) throw new Error(`Não foi possível escolher fallback para ${entry.albumSlug}.`);
            actualTrackNumber = fallback;
            musicUrl = findTrackUrl(tracks, actualTrackNumber);
          }
          if (!musicUrl) {
            throw new Error(`MP3 ${entry.albumSlug}/faixa ${entry.trackNumber} (e fallbacks) não encontrado.`);
          }

          // (Re-)extrai versos+captions usando o trackNumber realmente disponível.
          const trackTitle = getTrackTitle(entry.albumSlug, actualTrackNumber);
          const suggest = runSuggest({
            albumSlug: entry.albumSlug,
            trackNumber: actualTrackNumber,
          }) as Parameters<typeof buildLoranneCaptions>[0];

          const captions = buildLoranneCaptions(suggest, brand, { trackTitle, albumTitle, theme: null });
          const motionVariant = pickMotionVariant(`loranne/${entry.albumSlug}/${actualTrackNumber}`);
          const accent = pickLoranneAccent(entry.albumSlug);
          const trackLabel = `"${trackTitle}" · ${albumTitle}`;

          const stanzas = getLoranneStanzas(entry.albumSlug, actualTrackNumber);

          posts.push({
            id: `loranne-${entry.albumSlug}-f${actualTrackNumber}-w${week}-${day}`,
            brandSlug: "loranne",
            day,
            albumSlug: entry.albumSlug,
            trackNumber: actualTrackNumber,
            trackTitle,
            albumTitle,
            verses: (suggest.verses || []).slice(0, 2),
            syncedLyrics: stanzas,
            musicUrl,
            motionVariant,
            accent,
            trackLabel,
            captions,
            renderJobs: {},
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

    // ─── Ancient Ground ────────────────────────────────────────────────
    if (brands.includes("ancient-ground")) {
      const brand = BRANDS["ancient-ground"];
      const agTracks = await listAlbumTracks("ancient-ground");
      const posts: WeeklyPost[] = [];
      let slotIdx = 0;
      for (const day of brand.publishDays) {
        const entry = pickWeeklyAG(week, slotIdx);
        try {
          const suggest = await runSuggestAG({
            temas: [...entry.temas],
            trackNumber: entry.trackNumber,
          }) as Parameters<typeof buildAGCaptions>[0];

          let actualAgTrack = entry.trackNumber;
          let musicUrl = findTrackUrl(agTracks, actualAgTrack);
          if (!musicUrl) {
            const available = extractTrackNumbers(agTracks);
            if (available.length === 0) {
              throw new Error(`Sem MP3s identificáveis em audios/albums/ancient-ground/.`);
            }
            const fallback = closestTrackNumber(available, entry.trackNumber);
            if (!fallback) throw new Error(`Não foi possível escolher fallback AG.`);
            actualAgTrack = fallback;
            musicUrl = findTrackUrl(agTracks, actualAgTrack);
          }
          if (!musicUrl) {
            throw new Error(`MP3 ancient-ground/faixa ${entry.trackNumber} (e fallbacks) não encontrado.`);
          }

          const captions = buildAGCaptions(suggest, brand, {
            label: entry.label, trackNumber: actualAgTrack, temas: entry.temas,
          });
          const motionVariant = pickMotionVariant(`ag/${entry.temas.join("-")}/${actualAgTrack}`);
          const trackLabel = `Ancient Ground · ${entry.label}`;

          posts.push({
            id: `ag-${entry.temas.join("-")}-w${week}-${day}`,
            brandSlug: "ancient-ground",
            day,
            label: entry.label,
            trackNumber: actualAgTrack,
            temas: [...entry.temas],
            verses: (suggest.versos || []).slice(0, 2),
            renderJobs: {},
            musicUrl,
            motionVariant,
            trackLabel,
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
