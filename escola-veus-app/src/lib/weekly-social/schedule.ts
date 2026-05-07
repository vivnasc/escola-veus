/**
 * Schedule — converte (year, weekNumber, dayKey, time) em data+hora
 * absoluta. Fuso default Maputo (CAT, UTC+2).
 */

import { TIMEZONE, DAY_ORDER, type DayOfWeek } from "@/data/weekly-social/brand-config";

export type ScheduleSlot = {
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  timezone: string;
};

/** Lunes (Mon) da semana ISO N. */
export function isoWeekToMonday(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Mon = new Date(jan4);
  week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const target = new Date(week1Mon);
  target.setUTCDate(week1Mon.getUTCDate() + (week - 1) * 7);
  return target;
}

export function dateForDay(monday: Date, dayIndex: number): Date {
  const d = new Date(monday);
  d.setUTCDate(monday.getUTCDate() + dayIndex);
  return d;
}

export function formatDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function scheduleFor(
  year: number,
  weekNumber: number,
  dayKey: DayOfWeek,
  timeHHMM: string,
): ScheduleSlot {
  const monday = isoWeekToMonday(year, weekNumber);
  const dayIdx = DAY_ORDER.indexOf(dayKey);
  if (dayIdx < 0) throw new Error(`dia inválido: ${dayKey}`);
  const d = dateForDay(monday, dayIdx);
  return { date: formatDate(d), time: timeHHMM, timezone: TIMEZONE };
}

export function currentYear(): number {
  return new Date().getUTCFullYear();
}
