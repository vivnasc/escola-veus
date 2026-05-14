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

/**
 * Carrega do servidor (Supabase Storage) com fallback para localStorage se
 * o fetch falhar. Mapping partilhado entre browsers/dispositivos.
 */
export async function loadWeeklyAudiosRemote(): Promise<
  Partial<Record<Weekday, WeekdayAudio>>
> {
  try {
    const res = await fetch("/api/admin/vc-sabia/weekly-audios", {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      const remote = (json?.audios ?? {}) as Partial<Record<Weekday, WeekdayAudio>>;
      // Cache local para acesso offline rapido no proximo load.
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
        } catch {
          /* ignore */
        }
      }
      return remote;
    }
  } catch {
    /* fall through */
  }
  // Fallback: localStorage.
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Persiste no servidor. Tambem actualiza o cache local em paralelo.
 * Retorna true se o servidor confirmou. Se falhar, ficheiro fica so em
 * localStorage e a UI mostra warning.
 */
export async function saveWeeklyAudiosRemote(
  audios: Partial<Record<Weekday, WeekdayAudio>>
): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(audios));
    } catch {
      /* ignore */
    }
  }
  try {
    const res = await fetch("/api/admin/vc-sabia/weekly-audios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audios }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Devolve o weekday actual (timezone do browser). Domingo→sun. */
export function todayWeekday(): Weekday {
  const idx = new Date().getDay();
  const map: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[idx];
}
