import { OURO_PROPRIO_MANUAL } from "./ouro-proprio";
import type { ManualContent, ManualChapter } from "./ouro-proprio";

export type { ManualContent, ManualChapter };

const MANUALS: Record<string, ManualContent> = {
  "ouro-proprio": OURO_PROPRIO_MANUAL,
};

export function getManual(courseSlug: string): ManualContent | null {
  return MANUALS[courseSlug] ?? null;
}

export function getManualChapter(
  courseSlug: string,
  moduleNumber: number,
): ManualChapter | null {
  const manual = MANUALS[courseSlug];
  if (!manual) return null;
  return manual.chapters.find((c) => c.moduleNumber === moduleNumber) ?? null;
}

export function hasManual(courseSlug: string): boolean {
  return !!MANUALS[courseSlug];
}
