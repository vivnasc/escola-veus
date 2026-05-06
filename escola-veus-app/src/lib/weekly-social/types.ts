/**
 * Types do plan semanal — partilhados entre rotas API e UI.
 */

import type { PlatformCaptions } from "./captions";
import type { ScheduleSlot } from "./schedule";
import type { BrandSlug, Platform } from "@/data/weekly-social/brand-config";

export type WeeklyPostStatus =
  | "planned"     // criado mas não dispatchado para render
  | "queued"      // dispatchado, render-job aceite
  | "rendering"   // a renderizar
  | "done"        // mp4 disponível em videoUrl
  | "failed";

export type WeeklyPost = {
  id: string;
  brandSlug: BrandSlug;
  day: string; // mon..sun
  // Loranne-only
  albumSlug?: string;
  trackNumber?: number;
  trackTitle?: string;
  albumTitle?: string;
  // AG-only
  label?: string;
  temas?: string[];
  // Comum
  verses: string[];
  musicUrl: string;
  clipUrls: string[];
  captions: PlatformCaptions;
  schedule: Record<Platform, ScheduleSlot>;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  jobId: string | null;
  status: WeeklyPostStatus;
  errorMessage?: string;
};

export type WeeklyPlan = {
  year: number;
  week: number;
  brand: BrandSlug;
  generatedAt: string; // ISO
  updatedAt: string;
  posts: WeeklyPost[];
};

/** Path em Supabase course-assets onde gravamos os plans + ZIPs. */
export function planStoragePath(year: number, week: number, brand: BrandSlug): string {
  const w = String(week).padStart(2, "0");
  return `weekly-social/${year}-W${w}/${brand}-plan.json`;
}

export function zipStoragePath(year: number, week: number, brand: BrandSlug): string {
  const w = String(week).padStart(2, "0");
  return `weekly-social/${year}-W${w}/${brand}-${year}-W${w}.zip`;
}
