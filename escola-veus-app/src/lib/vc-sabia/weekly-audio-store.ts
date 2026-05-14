"use client";

import type { MorningMood } from "./audio";

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Segunda",
  tue: "Terça",
  wed: "Quarta",
  thu: "Quinta",
  fri: "Sexta",
  sat: "Sábado",
  sun: "Domingo",
};

export interface WeekdayAudio {
  url: string;
  mood: MorningMood;
  durationSec: number;
  generatedAt: string;
}

const STORAGE_KEY = "vc-sabia.weekly-audios.v1";

export function loadWeeklyAudios(): Partial<Record<Weekday, WeekdayAudio>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveWeeklyAudios(audios: Partial<Record<Weekday, WeekdayAudio>>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(audios));
}

/** Devolve o weekday actual (timezone do browser). Domingo→sun. */
export function todayWeekday(): Weekday {
  const idx = new Date().getDay();
  const map: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[idx];
}
