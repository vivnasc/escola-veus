import { NextRequest, NextResponse } from "next/server";

import {
  BRANDS, ALL_PLATFORMS, DAY_ORDER,
} from "@/data/weekly-social/brand-config";
import {
  pickWeeklyLoranne, pickWeeklyAG, getTrackTitle, getAlbumTitle,
} from "@/data/weekly-social/weekly-rotation";
import { ALL_LYRICS } from "@/lib/loranne";
import { scheduleFor, currentYear } from "@/lib/weekly-social/schedule";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/weekly/preview?week=19&year=2026
 *
 * Devolve o que iria entrar na semana sem chamar Claude nem listar Supabase.
 * UI usa para mostrar o "what's coming" antes de gerar o plan.
 */

function firstStrongLine(lyrics: string): string {
  const lines = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^\[.*\]$/.test(l) && !/^\(.+\)$/.test(l));
  return lines.find((l) => l.length >= 25 && l.length <= 70) || lines[0] || "";
}

export async function GET(req: NextRequest) {
  const week = Number(req.nextUrl.searchParams.get("week"));
  const year = Number(req.nextUrl.searchParams.get("year") ?? currentYear());
  if (!Number.isFinite(week) || week < 1 || week > 53) {
    return NextResponse.json({ erro: "week (1-53) obrigatória" }, { status: 400 });
  }

  // Loranne
  const loranne = BRANDS.loranne.publishDays.map((day) => {
    const dayIdx = DAY_ORDER.indexOf(day);
    const entry = pickWeeklyLoranne(week, dayIdx);
    const lyrics = ALL_LYRICS[`${entry.albumSlug}/${entry.trackNumber}`] || "";
    return {
      day,
      albumSlug: entry.albumSlug,
      albumTitle: getAlbumTitle(entry.albumSlug),
      trackNumber: entry.trackNumber,
      trackTitle: getTrackTitle(entry.albumSlug, entry.trackNumber),
      verseSample: firstStrongLine(lyrics),
      schedule: Object.fromEntries(
        ALL_PLATFORMS.map((p) => [p, scheduleFor(year, week, day, BRANDS.loranne.hoursByPlatform[p])]),
      ),
    };
  });

  // AG
  const ag = BRANDS["ancient-ground"].publishDays.map((day, slotIdx) => {
    const entry = pickWeeklyAG(week, slotIdx);
    return {
      day,
      label: entry.label,
      temas: entry.temas,
      trackNumber: entry.trackNumber,
      schedule: Object.fromEntries(
        ALL_PLATFORMS.map((p) => [p, scheduleFor(year, week, day, BRANDS["ancient-ground"].hoursByPlatform[p])]),
      ),
    };
  });

  return NextResponse.json({ year, week, loranne, ag });
}
