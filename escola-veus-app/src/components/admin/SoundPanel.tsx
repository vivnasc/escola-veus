"use client";

import { useRef, useState } from "react";
import { DEFAULT_VOLUMES, type Acto, type LessonConfig } from "@/lib/course-slides";

export type AgTrack = { name: string; url: string; size: number | null };

type CourseDefaults = { agTrack: string | null; volumeDb: Record<Acto, number> };

const ACTOS: Acto[] = ["pergunta", "situacao", "revelacao", "gesto", "frase"];
const ACTO_LABELS: Record<Acto, string> = {
  pergunta: "I · Pergunta",
  situacao: "II · Situação",
  revelacao: "III · Revelação",
  gesto: "IV · Gesto",
  frase: "V · Frase",
};

/**
 * Painel Som sempre visível — sem tabs escondidos. Lista toda a biblioteca
 * Ancient Ground com botão ▶ por faixa, destaca a activa, e tem sliders de
 * volume por acto.
 */
export function SoundPanel({
  defaults,
  config,
  onConfigChange,
  agTracks,
  agTracksLoading,
  onSaveAsCourseDefault,
}: {
  defaults: CourseDefaults;
  config: LessonConfig;
  onConfigChange: (next: LessonConfig) => void;
  agTracks: AgTrack[];
  agTracksLoading: boolean;
  onSaveAsCourseDefault: (trackName: string) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  function togglePlay(t: AgTrack) {
    if (!audioRef.current) audioRef.current = new Audio();
    if (playing === t.name) {
      audioRef.current.pause();
      setPlaying(null);
      return;
    }
    audioRef.current.src = t.url;
    audioRef.current.play().catch(() => {});
    setPlaying(t.name);
    audioRef.current.onended = () => setPlaying(null);
  }

  function setTrack(name: string | null) {
    onConfigChange({ ...config, agTrack: name ?? undefined });
  }

  function setVolume(acto: Acto, db: number | null) {
    const next = { ...(config.volumeDb ?? {}) };
    if (db == null) delete next[acto];
    else next[acto] = db;
    onConfigChange({ ...config, volumeDb: next });
  }

  const resolvedTrack = config.agTrack || defaults.agTrack;

  return (
    <div className="rounded-xl border border-escola-border bg-escola-card p-5">
      <h3 className="mb-1 text-sm font-medium text-escola-creme">🎵 Som — faixa Ancient Ground</h3>
      <p className="mb-4 text-[11px] text-escola-creme-50">
        Escolhe a faixa que vai tocar por baixo dos slides. Volume modulado por
        acto: mais baixo na pergunta/situação, mais presente no gesto/frase.
      </p>

      <div className="mb-2 flex items-center justify-between text-[11px]">
        <span className="text-escola-creme-50">
          Por defeito do curso: <span className="text-escola-creme">{defaults.agTrack ?? "— nenhuma —"}</span>
        </span>
        {resolvedTrack && resolvedTrack !== defaults.agTrack && (
          <button
            onClick={() => onSaveAsCourseDefault(resolvedTrack)}
            className="rounded border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
          >
            Guardar &ldquo;{resolvedTrack}&rdquo; como faixa por defeito do curso
          </button>
        )}
      </div>

      {agTracksLoading && <p className="text-xs text-escola-creme-50">A carregar faixas…</p>}
      {!agTracksLoading && agTracks.length === 0 && (
        <p className="text-xs text-escola-creme-50">
          Bucket vazio: põe ficheiros em <code>audios/albums/ancient-ground/</code>.
        </p>
      )}

      {!agTracksLoading && agTracks.length > 0 && (
        <div className="max-h-72 space-y-1 overflow-y-auto rounded border border-escola-border bg-escola-bg p-2">
          <p className="mb-1 text-[10px] text-escola-creme-50">
            Marca a caixinha da faixa que queres usar nesta sub-aula.
          </p>
          {agTracks.map((t) => {
            const selected = resolvedTrack === t.name;
            return (
              <label
                key={t.name}
                className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
                  selected ? "bg-escola-dourado/10" : "hover:bg-white/5"
                }`}
              >
                <input
                  type="radio"
                  name="ag-track"
                  checked={selected}
                  onChange={() => setTrack(t.name)}
                  className="h-4 w-4 shrink-0 accent-escola-dourado"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    togglePlay(t);
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-escola-border text-[11px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                  title={playing === t.name ? "Pausa" : "Tocar amostra"}
                >
                  {playing === t.name ? "⏸" : "▶"}
                </button>
                <span className="flex-1 truncate text-escola-creme">{t.name}</span>
                {selected && (
                  <span className="text-[9px] uppercase tracking-wider text-escola-dourado">
                    activa
                  </span>
                )}
              </label>
            );
          })}
          {resolvedTrack && (
            <button
              onClick={() => setTrack(null)}
              className="mt-1 w-full rounded border border-dashed border-escola-border px-2 py-1 text-[10px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
            >
              Limpar selecção (voltar à faixa por defeito do curso)
            </button>
          )}
        </div>
      )}

      <div className="mt-5 border-t border-escola-border pt-4">
        <h4 className="mb-2 text-xs font-medium text-escola-creme">Volume por acto (dB)</h4>
        <p className="mb-3 text-[11px] text-escola-creme-50">
          Negativo = mais baixo. Por defeito a faixa afasta-se nos momentos
          contemplativos e sobe no gesto/frase.
        </p>
        <div className="space-y-2">
          {ACTOS.map((acto) => {
            const current =
              config.volumeDb?.[acto] ?? defaults.volumeDb[acto] ?? DEFAULT_VOLUMES[acto];
            const overriden = config.volumeDb?.[acto] != null;
            return (
              <div key={acto} className="flex items-center gap-3 text-xs">
                <span className="w-28 shrink-0 text-escola-creme-50">{ACTO_LABELS[acto]}</span>
                <input
                  type="range"
                  min={-30}
                  max={0}
                  step={0.5}
                  value={current}
                  onChange={(e) => setVolume(acto, Number(e.target.value))}
                  className="flex-1"
                />
                <span
                  className={`w-14 text-right font-mono ${
                    overriden ? "text-escola-dourado" : "text-escola-creme-50"
                  }`}
                >
                  {current.toFixed(1)}dB
                </span>
                {overriden && (
                  <button
                    onClick={() => setVolume(acto, null)}
                    className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
                    title="Repor valor por defeito do curso"
                  >
                    ↺
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
