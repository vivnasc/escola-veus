"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_DURATION_SEC,
  MOOD_LABELS,
  MORNING_MOODS,
  type MorningMood,
} from "@/lib/vc-sabia/audio";
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  loadWeeklyAudios,
  saveWeeklyAudios,
  todayWeekday,
  type Weekday,
  type WeekdayAudio,
} from "@/lib/vc-sabia/weekly-audio-store";

interface Props {
  /** Notifica o parent quando o áudio do weekday actual muda. */
  onTodayAudioChange?: (audio: WeekdayAudio | null, weekday: Weekday) => void;
}

export function WeeklyAudios({ onTodayAudioChange }: Props) {
  const [audios, setAudios] = useState<Partial<Record<Weekday, WeekdayAudio>>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadWeeklyAudios();
    setAudios(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveWeeklyAudios(audios);
    if (onTodayAudioChange) {
      const td = todayWeekday();
      onTodayAudioChange(audios[td] ?? null, td);
    }
  }, [audios, hydrated, onTodayAudioChange]);

  const updateDay = (day: Weekday, partial: Partial<WeekdayAudio> | null) => {
    setAudios((prev) => {
      const next = { ...prev };
      if (partial === null) {
        delete next[day];
      } else {
        next[day] = { ...(next[day] as WeekdayAudio), ...partial } as WeekdayAudio;
      }
      return next;
    });
  };

  const today = hydrated ? todayWeekday() : null;
  const filled = Object.keys(audios).length;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-serif text-lg text-escola-dourado">
          Áudios da semana ({filled}/7)
        </h2>
        <p className="text-xs text-escola-creme-50">
          Gera um SFX por dia da semana. Os 7 ficam fixos e repetem-se semana
          após semana — não tens de gerar novos todos os dias. O áudio de{" "}
          <strong className="text-escola-creme">hoje</strong> toca a par do
          motion na preview em baixo.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {WEEKDAYS.map((day) => (
          <DayCard
            key={day}
            day={day}
            isToday={today === day}
            audio={audios[day] ?? null}
            onChange={(partial) => updateDay(day, partial)}
            onClear={() => updateDay(day, null)}
          />
        ))}
      </div>
    </section>
  );
}

interface DayCardProps {
  day: Weekday;
  isToday: boolean;
  audio: WeekdayAudio | null;
  onChange: (partial: Partial<WeekdayAudio>) => void;
  onClear: () => void;
}

function DayCard({ day, isToday, audio, onChange, onClear }: DayCardProps) {
  const [mood, setMood] = useState<MorningMood>(audio?.mood ?? "birds-dawn");
  const [duration, setDuration] = useState<number>(audio?.durationSec ?? DEFAULT_DURATION_SEC);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/vc-sabia/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, durationSec: duration }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro || `HTTP ${res.status}`);
      } else {
        onChange({
          url: json.audioUrl,
          mood,
          durationSec: duration,
          generatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      className={`space-y-2 rounded-lg border p-3 ${
        isToday
          ? "border-escola-dourado bg-escola-dourado/5"
          : "border-escola-border bg-escola-card/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="font-serif text-sm text-escola-creme">
          {WEEKDAY_LABELS[day]}
          {isToday && (
            <span className="ml-2 rounded bg-escola-dourado/20 px-1.5 py-0.5 text-[10px] text-escola-dourado">
              HOJE
            </span>
          )}
        </div>
        {audio && (
          <button
            onClick={onClear}
            className="text-[10px] text-escola-creme-50 hover:text-red-400"
            title="Limpar"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 text-[11px]">
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value as MorningMood)}
          className="flex-1 rounded border border-escola-border bg-escola-card px-1.5 py-1 text-escola-creme"
        >
          {MORNING_MOODS.map((m) => (
            <option key={m} value={m}>
              {MOOD_LABELS[m]}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={3}
          max={22}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-12 rounded border border-escola-border bg-escola-card px-1 py-1 text-escola-creme"
          title="Duração (s)"
        />
      </div>

      <button
        onClick={generate}
        disabled={generating}
        className="w-full rounded border border-escola-dourado/60 bg-escola-dourado/10 px-2 py-1 text-[11px] text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
      >
        {generating ? "A gerar…" : audio ? "Re-gerar" : "Gerar áudio"}
      </button>

      {error && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-1.5 text-[10px] text-red-300">
          {error}
        </div>
      )}

      {audio && (
        <div className="space-y-1">
          <audio src={audio.url} controls loop className="h-8 w-full" />
          <div className="truncate text-[10px] text-escola-creme-50">
            {MOOD_LABELS[audio.mood]} · {audio.durationSec}s
          </div>
        </div>
      )}
    </div>
  );
}
