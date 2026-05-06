/**
 * Helpers de storage Supabase para plans semanais.
 */

import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { planStoragePath, type WeeklyPlan } from "./types";
import type { BrandSlug } from "@/data/weekly-social/brand-config";

const BUCKET = "course-assets";

export async function loadPlan(
  year: number,
  week: number,
  brand: BrandSlug,
): Promise<WeeklyPlan | null> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  const path = planStoragePath(year, week, brand);
  const url = `${base}/storage/v1/object/public/${BUCKET}/${path}?t=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  try {
    return (await res.json()) as WeeklyPlan;
  } catch {
    return null;
  }
}

export async function savePlan(plan: WeeklyPlan): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  const path = planStoragePath(plan.year, plan.week, plan.brand);
  const updated: WeeklyPlan = { ...plan, updatedAt: new Date().toISOString() };
  const body = JSON.stringify(updated, null, 2);
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, body, { contentType: "application/json", upsert: true });
  if (error) throw new Error(`upload plan falhou: ${error.message}`);
}
