/**
 * Storage Supabase para o tagging de moods.
 *
 * Path: course-assets/weekly-social/loranne-moods.json
 *
 * Ler é GET público (sem auth necessário — mesmo padrão dos plans).
 * Escrever requer service role key (admin).
 */

import { createSupabaseAdminClient } from "@/lib/supabase-server";
import {
  EMPTY_MOODS_DATA,
  type LoranneMoodsData,
  type TrackMoodAssignment,
} from "@/data/weekly-social/loranne-moods";

const BUCKET = "course-assets";
const STORAGE_PATH = "weekly-social/loranne-moods.json";

export async function loadMoodsData(): Promise<LoranneMoodsData> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return EMPTY_MOODS_DATA;
  const url = `${base}/storage/v1/object/public/${BUCKET}/${STORAGE_PATH}?t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return EMPTY_MOODS_DATA;
  try {
    return (await res.json()) as LoranneMoodsData;
  } catch {
    return EMPTY_MOODS_DATA;
  }
}

export async function saveMoodsData(data: LoranneMoodsData): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  const body = JSON.stringify(data, null, 2);
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(STORAGE_PATH, body, { contentType: "application/json", upsert: true });
  if (error) throw new Error(`upload moods falhou: ${error.message}`);
}

export async function patchTrackMood(
  trackKey: string,
  assignment: Pick<TrackMoodAssignment, "moods" | "reason"> & Partial<TrackMoodAssignment>,
): Promise<LoranneMoodsData> {
  const data = await loadMoodsData();
  data.tracks[trackKey] = {
    moods: assignment.moods,
    confidence: assignment.confidence ?? 1.0,
    reason: assignment.reason ?? "Editado manualmente.",
    updatedAt: new Date().toISOString(),
    source: assignment.source ?? "manual",
  };
  await saveMoodsData(data);
  return data;
}
