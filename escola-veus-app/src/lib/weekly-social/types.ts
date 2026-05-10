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

export type RenderMode = "clip" | "full";

export type RenderJob = {
  jobId: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  status: WeeklyPostStatus;
  errorMessage?: string;
  /** Versão do worker/composição usada (stamp do RENDER_VERSION). Permite
   *  ver à vista se um vídeo foi feito com código antigo (precisa
   *  re-render) ou com a versão actual. */
  renderVersion?: string;
  /** ISO timestamp quando o render terminou (completedAt do result.json). */
  renderedAt?: string;
  /** Quantas vezes este (post, mode) foi dispatchado para render. */
  attempts?: number;
};

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
  /** Letras inteiras divididas em stanzas para lyric video sync (Loranne). */
  syncedLyrics?: string[];
  /** Timing real por stanza (segundos absolutos no áudio) — vindo do Scribe. */
  stanzaTimings?: { text: string; startSec: number; endSec: number }[];
  /** Duração total do áudio em segundos (do Scribe — última palavra + 2s tail). */
  audioDurationSec?: number;
  /** Idioma da letra (PT/EN) — para Scribe usar language_code certo. */
  lang?: "PT" | "EN";
  /** Índice da primeira stanza marcada como [Chorus] em syncedLyrics.
   *  Worker usa para arrancar o clip 30s no refrão (ponto mais alto da
   *  faixa) em vez do início. null/undefined = sem refrão detectado,
   *  clip arranca em 0. */
  chorusStanzaIdx?: number | null;
  /** Conto Claude para AG fulls — capítulos passam como texto sobre música. */
  storyChapters?: string[];
  /** Título do conto AG (para signature/metadata). */
  storyTitle?: string;
  /** Synopsis Claude (Loranne) — 1 linha que explica do que se trata. */
  synopsis?: string;
  /** Schedule alternativo para mode=full (AG: Mon/Wed/Fri, vs clip Tue/Thu/Sat). */
  fullSchedule?: Record<Platform, ScheduleSlot>;
  musicUrl: string;
  /** Variante de motion Remotion (A/B/C/D). */
  motionVariant: "A" | "B" | "C" | "D";
  accent?: string;
  trackLabel?: string;
  /** Pipeline antigo — não usado pelo Remotion. */
  clipUrls?: string[];
  captions: PlatformCaptions;
  schedule: Record<Platform, ScheduleSlot>;

  /** 2 modes — clip (30s social) e full (3-5min YT canal). */
  renderJobs: Partial<Record<RenderMode, RenderJob>>;

  /** @deprecated — antigos campos para retrocompat. videoUrl=clip videoUrl. */
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  jobId?: string | null;
  status?: WeeklyPostStatus;
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
