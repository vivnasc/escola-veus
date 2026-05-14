"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_DURATION_SEC,
  MOOD_LABELS,
  MOOD_PROMPTS,
  MORNING_MOODS,
  type MorningMood,
} from "@/lib/vc-sabia/audio";

interface AudioFile {
  name: string;
  url: string;
  sizeBytes: number;
  createdAt: string | null;
}

interface Props {
  /** Notifica o parent do mapping mood -> activeUrl actualizado. */
  onActiveChange?: (active: Partial<Record<MorningMood, string>>) => void;
}

export function AudioLibrary({ onActiveChange }: Props) {
  const [byMood, setByMood] = useState<Record<string, AudioFile[]>>({});
  const [active, setActive] = useState<Partial<Record<MorningMood, string>>>({});
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [audiosRes, activeRes] = await Promise.all([
        fetch("/api/admin/vc-sabia/audios").then((r) => r.json()),
        fetch("/api/admin/vc-sabia/active-audios").then((r) => r.json()),
      ]);
      setByMood(audiosRes.byMood ?? {});
      setActive(activeRes.active ?? {});
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!hydrated) return;
    if (onActiveChange) onActiveChange(active);
    setSyncState("saving");
    fetch("/api/admin/vc-sabia/active-audios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    })
      .then((r) => {
        setSyncState(r.ok ? "saved" : "error");
        if (r.ok) setTimeout(() => setSyncState("idle"), 1500);
      })
      .catch(() => setSyncState("error"));
  }, [active, hydrated, onActiveChange]);

  const setMoodActive = (mood: MorningMood, url: string) => {
    setActive((prev) => ({ ...prev, [mood]: url }));
  };

  const filled = MORNING_MOODS.filter((m) => active[m]).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="font-serif text-lg text-escola-dourado">
          Áudio library ({filled}/8 moods com áudio activo)
        </h2>
        {syncState === "saving" && (
          <span className="text-[10px] text-escola-creme-50">a sincronizar...</span>
        )}
        {syncState === "saved" && (
          <span className="text-[10px] text-emerald-400">gravado</span>
        )}
        {syncState === "error" && (
          <span className="text-[10px] text-red-400">ERRO sincronização</span>
        )}
      </div>
      <p className="text-xs text-escola-creme-50">
        Geração via FAL Stable Audio (ambiente contemplativo, 5-47s). Cada
        elemento tem 1 áudio activo (radio verde) que toca quando se usa um
        motion tagged com esse elemento. Gera várias versões e escolhe a melhor.
        Demora ~20-40s por geração (FAL queue).
      </p>

      {loading ? (
        <div className="text-xs text-escola-creme-50">A carregar...</div>
      ) : (
        <div className="space-y-2">
          {MORNING_MOODS.map((mood) => (
            <MoodRow
              key={mood}
              mood={mood}
              audios={byMood[mood] ?? []}
              activeUrl={active[mood]}
              onSelect={(url) => setMoodActive(mood, url)}
              onReload={loadAll}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface MoodRowProps {
  mood: MorningMood;
  audios: AudioFile[];
  activeUrl: string | undefined;
  onSelect: (url: string) => void;
  onReload: () => void;
}

function MoodRow({ mood, audios, activeUrl, onSelect, onReload }: MoodRowProps) {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState<number>(DEFAULT_DURATION_SEC);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [promptText, setPromptText] = useState<string>(MOOD_PROMPTS[mood]);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const body: { mood: MorningMood; durationSec: number; promptOverride?: string } = {
        mood,
        durationSec: duration,
      };
      if (editingPrompt && promptText.trim() !== MOOD_PROMPTS[mood]) {
        body.promptOverride = promptText.trim();
      }
      const res = await fetch("/api/admin/vc-sabia/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro || `HTTP ${res.status}`);
      } else {
        onSelect(json.audioUrl);
        await onReload();
        setOpen(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  const hasActive = Boolean(activeUrl);

  return (
    <div
      className={`rounded-lg border ${
        hasActive ? "border-escola-dourado/60 bg-escola-dourado/5" : "border-escola-border bg-escola-card/40"
      }`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
              hasActive
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-escola-border/40 text-escola-creme-50"
            }`}
          >
            {hasActive ? "✓" : "○"}
          </span>
          <div>
            <div className="font-serif text-sm text-escola-creme">
              {MOOD_LABELS[mood]}
            </div>
            <div className="text-[11px] text-escola-creme-50">
              {audios.length === 0
                ? "Sem áudios gerados"
                : `${audios.length} gerado${audios.length === 1 ? "" : "s"}${
                    hasActive ? " · 1 activo" : " · escolhe o activo"
                  }`}
            </div>
          </div>
        </div>
        <span className="text-xs text-escola-creme-50">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-escola-border/60 p-3">
          {audios.length === 0 ? (
            <div className="text-[11px] text-escola-creme-50">
              Ainda não geraste nenhum áudio para este mood.
            </div>
          ) : (
            <div className="space-y-1.5">
              {audios.map((a) => {
                const isActive = activeUrl === a.url;
                return (
                  <div
                    key={a.url}
                    className={`flex items-center gap-2 rounded p-1.5 ${
                      isActive ? "bg-escola-dourado/10" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`active-${mood}`}
                      checked={isActive}
                      onChange={() => onSelect(a.url)}
                      className="h-3 w-3 accent-emerald-500"
                      title="Definir como activo"
                    />
                    <audio src={a.url} controls className="h-7 flex-1" />
                    <span className="shrink-0 text-[10px] text-escola-creme-50">
                      {(a.sizeBytes / 1024).toFixed(0)} KB
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2 border-t border-escola-border/40 pt-2">
            {editingPrompt ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-escola-creme-50">
                  <span>Prompt (em inglês, ElevenLabs)</span>
                  <button
                    onClick={() => {
                      setPromptText(MOOD_PROMPTS[mood]);
                      setEditingPrompt(false);
                    }}
                    className="text-escola-creme-50 hover:text-escola-creme"
                  >
                    cancelar
                  </button>
                </div>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-escola-border bg-escola-card px-2 py-1 text-[11px] text-escola-creme"
                />
              </div>
            ) : (
              <button
                onClick={() => setEditingPrompt(true)}
                className="block w-full rounded bg-escola-card/60 px-2 py-1.5 text-left text-[10px] text-escola-creme-50 hover:text-escola-creme"
                title="Clica para editar o prompt antes de gerar"
              >
                <span className="text-escola-dourado">Prompt:</span>{" "}
                {MOOD_PROMPTS[mood]}
              </button>
            )}

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[11px] text-escola-creme-50">
                Duração:
                <input
                  type="number"
                  min={5}
                  max={47}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-12 rounded border border-escola-border bg-escola-card px-1 py-0.5 text-escola-creme"
                />
                s
              </label>
              <button
                onClick={generate}
                disabled={generating}
                className="rounded border border-escola-dourado/60 bg-escola-dourado/10 px-2 py-1 text-[11px] text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
              >
                {generating
                  ? "A gerar..."
                  : editingPrompt && promptText.trim() !== MOOD_PROMPTS[mood]
                  ? "Gerar com prompt custom"
                  : "Gerar novo"}
              </button>
              {error && <span className="text-[10px] text-red-400">{error}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
