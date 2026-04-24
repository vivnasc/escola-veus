"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_VOLUMES,
  defaultBlocksForActo,
  type Acto,
  type LessonConfig,
  type SlideDeck,
} from "@/lib/course-slides";
import type { LessonScript } from "@/data/course-scripts/ouro-proprio";

/**
 * Editor de config de uma sub-aula (Track A do plano):
 *  - Texto dos 5 actos (com fallback para o script hardcoded)
 *  - Quebra em blocos override (mostra blocos automaticos; editaveis a mao)
 *  - Timing por slide + multiplicador global
 *  - Faixa Ancient Ground (com preview audio inline)
 *  - Volumes em dB por acto
 *
 * Nao toca em Supabase directamente — comunica atraves de onChange. A pagina
 * dona guarda debounced.
 */

export type AgTrack = {
  name: string;
  url: string;
  size: number | null;
};

type Props = {
  baseScript: LessonScript;
  defaults: { agTrack: string | null; volumeDb: Record<Acto, number> };
  config: LessonConfig;
  onChange: (next: LessonConfig) => void;
  agTracks: AgTrack[];
  agTracksLoading: boolean;
  deck: SlideDeck | null;
};

const ACTOS: Acto[] = ["pergunta", "situacao", "revelacao", "gesto", "frase"];
const ACTO_LABELS: Record<Acto, string> = {
  pergunta: "I · Pergunta",
  situacao: "II · Situacao",
  revelacao: "III · Revelacao",
  gesto: "IV · Gesto",
  frase: "V · Frase",
};
const SCRIPT_FIELDS: Array<{
  acto: Acto;
  field: keyof Pick<
    LessonScript,
    "perguntaInicial" | "situacaoHumana" | "revelacaoPadrao" | "gestoConsciencia" | "fraseFinal"
  >;
}> = [
  { acto: "pergunta", field: "perguntaInicial" },
  { acto: "situacao", field: "situacaoHumana" },
  { acto: "revelacao", field: "revelacaoPadrao" },
  { acto: "gesto", field: "gestoConsciencia" },
  { acto: "frase", field: "fraseFinal" },
];

export function LessonConfigEditor({
  baseScript,
  defaults,
  config,
  onChange,
  agTracks,
  agTracksLoading,
  deck,
}: Props) {
  const [tab, setTab] = useState<"texto" | "blocos" | "ritmo" | "som">("texto");

  function setScript<K extends keyof NonNullable<LessonConfig["script"]>>(
    field: K,
    value: string,
  ) {
    onChange({
      ...config,
      script: { ...(config.script ?? {}), [field]: value },
    });
  }

  function setBlockSplit(acto: Acto, blocks: string[]) {
    // Se ficar igual ao default, limpa o override para poupar Supabase.
    const fieldByActo: Record<Acto, keyof LessonScript> = {
      pergunta: "perguntaInicial",
      situacao: "situacaoHumana",
      revelacao: "revelacaoPadrao",
      gesto: "gestoConsciencia",
      frase: "fraseFinal",
    };
    const resolvedText =
      (config.script?.[fieldByActo[acto] as keyof typeof config.script] as string | undefined)?.trim() ||
      (baseScript[fieldByActo[acto]] as string);
    const defaults = defaultBlocksForActo(acto, resolvedText);
    const same =
      blocks.length === defaults.length && blocks.every((b, i) => b.trim() === defaults[i].trim());
    const nextSplits = { ...(config.blockSplits ?? {}) };
    if (same) {
      delete nextSplits[acto];
    } else {
      nextSplits[acto] = blocks.map((b) => b.trim()).filter(Boolean);
    }
    onChange({ ...config, blockSplits: nextSplits });
  }

  function setTiming(idx: number, seconds: number | null) {
    const next = { ...(config.timingOverrides ?? {}) };
    if (seconds == null) delete next[String(idx)];
    else next[String(idx)] = seconds;
    onChange({ ...config, timingOverrides: next });
  }

  function setGlobalMultiplier(m: number) {
    onChange({ ...config, globalTimingMultiplier: m });
  }

  function setAgTrack(track: string | null) {
    onChange({ ...config, agTrack: track ?? undefined });
  }

  function setVolume(acto: Acto, db: number | null) {
    const next = { ...(config.volumeDb ?? {}) };
    if (db == null) delete next[acto];
    else next[acto] = db;
    onChange({ ...config, volumeDb: next });
  }

  const resolvedAgTrack = config.agTrack || defaults.agTrack;

  return (
    <div className="rounded-xl border border-escola-border bg-escola-card">
      {/* Tabs */}
      <div className="flex border-b border-escola-border text-xs">
        {(["texto", "blocos", "ritmo", "som"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2.5 transition-colors ${
              tab === t
                ? "border-b-2 border-escola-dourado text-escola-creme"
                : "text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            {t === "texto" && "Texto"}
            {t === "blocos" && "Blocos"}
            {t === "ritmo" && "Ritmo"}
            {t === "som" && "Som"}
          </button>
        ))}
      </div>

      <div className="space-y-4 p-4">
        {tab === "texto" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-escola-creme-50">
                Titulo da aula
              </label>
              <input
                value={config.script?.title ?? baseScript.title}
                onChange={(e) => setScript("title", e.target.value)}
                className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 font-serif text-sm text-escola-creme focus:border-escola-dourado/50 focus:outline-none"
              />
            </div>

            {SCRIPT_FIELDS.map(({ acto, field }) => (
              <div key={field}>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider text-escola-dourado">
                    {ACTO_LABELS[acto]}
                  </label>
                  <span className="text-[10px] text-escola-creme-50">
                    {((config.script?.[field] as string | undefined) ?? baseScript[field])
                      .trim()
                      .length}{" "}
                    chars
                  </span>
                </div>
                <textarea
                  value={(config.script?.[field] as string | undefined) ?? baseScript[field]}
                  onChange={(e) => setScript(field, e.target.value)}
                  rows={acto === "frase" ? 2 : acto === "pergunta" ? 4 : 8}
                  className="w-full resize-y rounded border border-escola-border bg-escola-bg px-3 py-2 font-serif text-sm leading-relaxed text-escola-creme focus:border-escola-dourado/50 focus:outline-none"
                />
              </div>
            ))}

            <p className="text-[10px] text-escola-creme-50">
              Deixar em branco repoe o texto base do repo. Cada edicao grava
              automaticamente em Supabase.
            </p>
          </div>
        )}

        {tab === "blocos" && (
          <BlockEditor
            baseScript={baseScript}
            config={config}
            onSet={setBlockSplit}
          />
        )}

        {tab === "ritmo" && (
          <RhythmEditor
            deck={deck}
            config={config}
            onSetTiming={setTiming}
            onSetMultiplier={setGlobalMultiplier}
          />
        )}

        {tab === "som" && (
          <SoundEditor
            defaults={defaults}
            config={config}
            agTracks={agTracks}
            agTracksLoading={agTracksLoading}
            resolvedAgTrack={resolvedAgTrack}
            onSetAgTrack={setAgTrack}
            onSetVolume={setVolume}
          />
        )}
      </div>
    </div>
  );
}

function BlockEditor({
  baseScript,
  config,
  onSet,
}: {
  baseScript: LessonScript;
  config: LessonConfig;
  onSet: (acto: Acto, blocks: string[]) => void;
}) {
  const fieldByActo: Record<Acto, keyof LessonScript> = {
    pergunta: "perguntaInicial",
    situacao: "situacaoHumana",
    revelacao: "revelacaoPadrao",
    gesto: "gestoConsciencia",
    frase: "fraseFinal",
  };

  return (
    <div className="space-y-5">
      {ACTOS.map((acto) => {
        const field = fieldByActo[acto];
        const text =
          ((config.script?.[field as keyof typeof config.script] as string | undefined)?.trim() ||
            (baseScript[field] as string));
        const override = config.blockSplits?.[acto];
        const blocks = override && override.length > 0 ? override : defaultBlocksForActo(acto, text);
        const isOverride = !!override;

        return (
          <div key={acto}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-escola-dourado">
                {ACTO_LABELS[acto]}
              </span>
              <span className="text-[10px] text-escola-creme-50">
                {blocks.length} {blocks.length === 1 ? "bloco" : "blocos"}
                {isOverride && " · manual"}
              </span>
            </div>
            <div className="space-y-2">
              {blocks.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    value={b}
                    onChange={(e) => {
                      const next = [...blocks];
                      next[i] = e.target.value;
                      onSet(acto, next);
                    }}
                    rows={Math.max(2, Math.ceil(b.length / 90))}
                    className="flex-1 resize-y rounded border border-escola-border bg-escola-bg px-3 py-2 font-serif text-xs leading-relaxed text-escola-creme focus:border-escola-dourado/50 focus:outline-none"
                  />
                  <div className="flex flex-col gap-1">
                    {blocks.length > 1 && (
                      <button
                        onClick={() => onSet(acto, blocks.filter((_, j) => j !== i))}
                        className="rounded border border-escola-border px-2 py-1 text-[10px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                        title="Apagar bloco"
                      >
                        −
                      </button>
                    )}
                    {i < blocks.length - 1 && (
                      <button
                        onClick={() => {
                          // Juntar este bloco com o seguinte
                          const next = [...blocks];
                          next[i] = next[i].trim() + " " + next[i + 1].trim();
                          next.splice(i + 1, 1);
                          onSet(acto, next);
                        }}
                        className="rounded border border-escola-border px-2 py-1 text-[10px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                        title="Juntar com bloco seguinte"
                      >
                        ↓
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  onClick={() => onSet(acto, [...blocks, ""])}
                  className="rounded border border-escola-border px-3 py-1 text-[10px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                >
                  + bloco
                </button>
                {isOverride && (
                  <button
                    onClick={() => onSet(acto, defaultBlocksForActo(acto, text))}
                    className="rounded border border-escola-border px-3 py-1 text-[10px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                  >
                    Repor automatico
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-escola-creme-50">
        A quebra automatica parte em ~220 chars nos pontos finais. Edita aqui
        se quiseres partir um bloco noutro sitio.
      </p>
    </div>
  );
}

function RhythmEditor({
  deck,
  config,
  onSetTiming,
  onSetMultiplier,
}: {
  deck: SlideDeck | null;
  config: LessonConfig;
  onSetTiming: (idx: number, seconds: number | null) => void;
  onSetMultiplier: (m: number) => void;
}) {
  if (!deck) return null;
  const multiplier = config.globalTimingMultiplier ?? 1.0;

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-wider text-escola-dourado">
            Ritmo global
          </label>
          <span className="text-[10px] text-escola-creme-50">
            {multiplier.toFixed(2)}x {multiplier === 1 ? "(default)" : ""}
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={2.0}
          step={0.05}
          value={multiplier}
          onChange={(e) => onSetMultiplier(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[9px] text-escola-creme-50">
          <span>rapido (0.5x)</span>
          <span>default (1x)</span>
          <span>lento (2x)</span>
        </div>
      </div>

      <div className="space-y-1 border-t border-escola-border pt-3">
        <p className="mb-2 text-[10px] uppercase tracking-wider text-escola-creme-50">
          Override por slide (segundos)
        </p>
        {deck.slides.map((s, i) => {
          const hasOverride = config.timingOverrides?.[String(i)] != null;
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-7 shrink-0 text-right text-escola-creme-50">{i + 1}</span>
              <span className="w-14 shrink-0 text-[10px] uppercase text-escola-creme-50">
                {s.tipo === "conteudo" && "acto" in s ? s.acto : s.tipo}
              </span>
              <span className="flex-1 truncate text-escola-creme-50">
                {s.tipo === "conteudo" && "texto" in s
                  ? s.texto.slice(0, 48) + (s.texto.length > 48 ? "…" : "")
                  : s.tipo === "title" && "texto" in s
                    ? s.texto
                    : s.tipo === "acto-marker" && "label" in s
                      ? s.label
                      : s.tipo}
              </span>
              <input
                type="number"
                min={2}
                max={60}
                step={1}
                value={s.duracao}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  onSetTiming(i, Number.isFinite(v) && v > 0 ? v : null);
                }}
                className={`w-14 rounded border bg-escola-bg px-2 py-1 text-xs text-escola-creme focus:border-escola-dourado/50 focus:outline-none ${
                  hasOverride ? "border-escola-dourado/40" : "border-escola-border"
                }`}
              />
              {hasOverride && (
                <button
                  onClick={() => onSetTiming(i, null)}
                  className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
                  title="Repor automatico"
                >
                  ↺
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SoundEditor({
  defaults,
  config,
  agTracks,
  agTracksLoading,
  resolvedAgTrack,
  onSetAgTrack,
  onSetVolume,
}: {
  defaults: { agTrack: string | null; volumeDb: Record<Acto, number> };
  config: LessonConfig;
  agTracks: AgTrack[];
  agTracksLoading: boolean;
  resolvedAgTrack: string | null | undefined;
  onSetAgTrack: (track: string | null) => void;
  onSetVolume: (acto: Acto, db: number | null) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingName, setPlayingName] = useState<string | null>(null);

  function playTrack(t: AgTrack) {
    if (!audioRef.current) audioRef.current = new Audio();
    if (playingName === t.name) {
      audioRef.current.pause();
      setPlayingName(null);
      return;
    }
    audioRef.current.src = t.url;
    audioRef.current.play().catch(() => {});
    setPlayingName(t.name);
    audioRef.current.onended = () => setPlayingName(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-wider text-escola-dourado">
            Faixa Ancient Ground
          </label>
          {config.agTrack && config.agTrack !== defaults.agTrack && (
            <button
              onClick={() => onSetAgTrack(null)}
              className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
            >
              Repor default do curso
            </button>
          )}
        </div>
        <p className="mb-2 text-[10px] text-escola-creme-50">
          Default do curso: {defaults.agTrack ?? "por escolher"}.
          {resolvedAgTrack && resolvedAgTrack !== defaults.agTrack && (
            <> Override actual: {resolvedAgTrack}.</>
          )}
        </p>
        {agTracksLoading && (
          <p className="text-xs text-escola-creme-50">A carregar faixas...</p>
        )}
        {!agTracksLoading && agTracks.length === 0 && (
          <p className="text-xs text-escola-creme-50">
            Nenhuma faixa encontrada em audios/albums/ancient-ground/.
          </p>
        )}
        {!agTracksLoading && agTracks.length > 0 && (
          <div className="max-h-48 space-y-1 overflow-y-auto rounded border border-escola-border bg-escola-bg p-2">
            {agTracks.map((t) => {
              const selected = resolvedAgTrack === t.name;
              return (
                <div
                  key={t.name}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
                    selected ? "bg-escola-dourado/10" : "hover:bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => playTrack(t)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-escola-border text-[10px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                    title={playingName === t.name ? "Pausa" : "Play"}
                  >
                    {playingName === t.name ? "⏸" : "▶"}
                  </button>
                  <button
                    onClick={() => onSetAgTrack(t.name)}
                    className="flex-1 truncate text-left text-escola-creme"
                  >
                    {t.name}
                  </button>
                  {selected && (
                    <span className="text-[9px] uppercase tracking-wider text-escola-dourado">
                      activa
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-escola-border pt-4">
        <label className="mb-2 block text-[10px] uppercase tracking-wider text-escola-dourado">
          Volume por acto (dB)
        </label>
        <p className="mb-3 text-[10px] text-escola-creme-50">
          A faixa AG anda mais baixa nos actos contemplativos (pergunta, situacao)
          e sobe no gesto/frase final. Negativo = mais baixo.
        </p>
        <div className="space-y-2">
          {ACTOS.map((acto) => {
            const current =
              config.volumeDb?.[acto] ??
              defaults.volumeDb[acto] ??
              DEFAULT_VOLUMES[acto];
            const isOverride = config.volumeDb?.[acto] != null;
            return (
              <div key={acto} className="flex items-center gap-3 text-xs">
                <span className="w-24 shrink-0 text-escola-creme-50">
                  {ACTO_LABELS[acto]}
                </span>
                <input
                  type="range"
                  min={-30}
                  max={0}
                  step={0.5}
                  value={current}
                  onChange={(e) => onSetVolume(acto, Number(e.target.value))}
                  className="flex-1"
                />
                <span
                  className={`w-14 text-right font-mono ${
                    isOverride ? "text-escola-dourado" : "text-escola-creme-50"
                  }`}
                >
                  {current.toFixed(1)}dB
                </span>
                {isOverride && (
                  <button
                    onClick={() => onSetVolume(acto, null)}
                    className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
                    title="Repor default do curso"
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

// Pattern: a pagina dona pode importar este helper para fazer debounce do save.
export function useDebouncedEffect(
  fn: () => void,
  deps: unknown[],
  delayMs: number,
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setTimeout(fn, delayMs);
    return () => clearTimeout(t);
  }, deps);
}
