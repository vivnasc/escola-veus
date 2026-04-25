"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildSlideDeckFromConfig,
  DEFAULT_VOLUMES,
  getBaseScript,
  type Acto,
  type LessonConfig,
  type Slide,
} from "@/lib/course-slides";
import { SlidePreview } from "@/components/admin/SlidePreview";
import { SubAulaNavigator } from "@/components/admin/SubAulaNavigator";
import {
  CurrentSlideEditor,
  computeBlockIndex,
} from "@/components/admin/CurrentSlideEditor";
import { SoundPanel, type AgTrack } from "@/components/admin/SoundPanel";

type CourseDefaults = { agTrack: string | null; volumeDb: Record<Acto, number> };

type RenderJob = {
  jobId: string;
  status: "queued" | "running" | "done" | "error";
  videoUrl?: string | null;
  error?: string | null;
  submittedAt: number;
};

function dbToLinear(db: number) {
  return Math.pow(10, db / 20);
}

export default function AulaPreviewPage({
  params,
}: {
  params: Promise<{ slug: string; modulo: string; sub: string }>;
}) {
  const { slug, modulo, sub } = use(params);
  const moduleNumber = parseInt(modulo, 10);
  const baseScript = getBaseScript(slug, moduleNumber, sub);

  const [config, setConfig] = useState<LessonConfig>({});
  const [defaults, setDefaults] = useState<CourseDefaults>({
    agTrack: null,
    volumeDb: { ...DEFAULT_VOLUMES },
  });
  const [agTracks, setAgTracks] = useState<AgTrack[]>([]);
  const [agTracksLoading, setAgTracksLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [defaultsSaveState, setDefaultsSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [renderJob, setRenderJob] = useState<RenderJob | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mixEnabled, setMixEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const deck = useMemo(
    () => buildSlideDeckFromConfig(slug, moduleNumber, sub, config),
    [slug, moduleNumber, sub, config],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [c, d, a] = await Promise.all([
          fetch(`/api/admin/aulas/config?slug=${slug}&module=${moduleNumber}&sub=${sub}`),
          fetch(`/api/admin/aulas/course-defaults?slug=${slug}`),
          fetch("/api/admin/music/list-album?album=ancient-ground"),
        ]);
        const cj = await c.json();
        const dj = await d.json();
        const aj = await a.json();
        if (!alive) return;
        setConfig(cj.config ?? {});
        setDefaults(dj.defaults ?? { agTrack: null, volumeDb: DEFAULT_VOLUMES });
        setAgTracks(
          (aj.tracks ?? []).map((t: { name: string; url: string; sizeMB: number | null }) => ({
            name: t.name,
            url: t.url,
            size: t.sizeMB != null ? Math.round(t.sizeMB * 1024 * 1024) : null,
          })),
        );
      } finally {
        if (alive) {
          setLoaded(true);
          setAgTracksLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug, moduleNumber, sub]);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      setSaveState("saving");
      try {
        const r = await fetch("/api/admin/aulas/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, module: moduleNumber, sub, config }),
        });
        if (!r.ok) throw new Error();
        setSaveState("saved");
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
      } catch {
        setSaveState("error");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [config, loaded, slug, moduleNumber, sub]);

  // Mix audio
  useEffect(() => {
    const track = config.agTrack || defaults.agTrack;
    if (!mixEnabled || !track) {
      audioRef.current?.pause();
      return;
    }
    const url = agTracks.find((t) => t.name === track)?.url;
    if (!url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    const el = audioRef.current;
    if (el.src !== url) el.src = url;
    if (isPlaying) el.play().catch(() => {});
    else el.pause();
  }, [mixEnabled, isPlaying, config.agTrack, defaults.agTrack, agTracks]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !currentSlide) return;
    let db = -20;
    if (currentSlide.tipo === "conteudo" && "acto" in currentSlide) {
      db = config.volumeDb?.[currentSlide.acto] ?? defaults.volumeDb[currentSlide.acto] ?? DEFAULT_VOLUMES[currentSlide.acto];
    } else if (currentSlide.tipo === "fecho") {
      db = -60;
    }
    el.volume = Math.min(1, Math.max(0, dbToLinear(db)));
  }, [currentSlide, config.volumeDb, defaults.volumeDb]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const saveCourseDefault = useCallback(
    async (trackName: string) => {
      const next = { ...defaults, agTrack: trackName };
      setDefaultsSaveState("saving");
      try {
        const r = await fetch("/api/admin/aulas/course-defaults", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, defaults: next }),
        });
        if (!r.ok) throw new Error();
        setDefaults(next);
        setDefaultsSaveState("saved");
        setTimeout(() => setDefaultsSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
      } catch {
        setDefaultsSaveState("error");
      }
    },
    [slug, defaults],
  );

  async function submitRender() {
    if (!deck) return;
    const resolved = config.agTrack || defaults.agTrack;
    if (!resolved) {
      alert("Escolhe uma faixa Ancient Ground primeiro (painel Som).");
      return;
    }
    if (
      !confirm(
        `Renderizar MP4 de ${deck.courseTitle} M${moduleNumber}·${deck.subLetter}?\n\n${deck.slides.length} slides · ${Math.floor(deck.totalDurationSec / 60)}:${String(deck.totalDurationSec % 60).padStart(2, "0")}\n\nFaixa: ${resolved}`,
      )
    )
      return;
    try {
      setRenderJob({ jobId: "pending", status: "queued", submittedAt: Date.now() });
      const r = await fetch("/api/admin/aulas/render-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, module: moduleNumber, sub, config, defaults }),
      });
      const j = await r.json();
      if (!r.ok || !j.jobId) throw new Error(j.erro ?? "Falha a despachar");
      setRenderJob({ jobId: j.jobId, status: "queued", submittedAt: Date.now() });
    } catch (err) {
      setRenderJob({
        jobId: "error",
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        submittedAt: Date.now(),
      });
    }
  }

  useEffect(() => {
    if (!renderJob || renderJob.jobId === "pending" || renderJob.jobId === "error") return;
    if (renderJob.status === "done" || renderJob.status === "error") return;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/admin/aulas/render-status?jobId=${renderJob.jobId}`);
        const j = await r.json();
        if (j.status === "done" || j.status === "error") {
          setRenderJob((rj) =>
            rj ? { ...rj, status: j.status, videoUrl: j.videoUrl ?? null, error: j.error ?? null } : rj,
          );
        } else if (j.status === "running" && renderJob.status !== "running") {
          setRenderJob((rj) => (rj ? { ...rj, status: "running" } : rj));
        }
      } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [renderJob]);

  if (!baseScript) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <SubAulaNavigator slug={slug} module={moduleNumber} sub={sub} />
        <p className="mt-6 text-sm text-escola-creme">
          Script não encontrado para {slug} M{modulo}·{sub.toUpperCase()}.
        </p>
        <p className="mt-2 text-xs text-escola-creme-50">
          Só cursos com scripts em <code>src/data/course-scripts/</code> aparecem. Hoje: Ouro Próprio.
        </p>
      </div>
    );
  }
  if (!deck) return null;

  const resolvedAgTrack = config.agTrack || defaults.agTrack;
  const isConfigured = !!resolvedAgTrack;
  const isRendering = renderJob?.status === "queued" || renderJob?.status === "running";
  const hasCustomScript =
    !!config.script || !!config.blockSplits || !!config.timingOverrides || !!config.volumeDb || !!config.agTrack;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      {/* Navegador */}
      <SubAulaNavigator slug={slug} module={moduleNumber} sub={sub} />

      {/* Header */}
      <div className="mt-4 mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-escola-creme">
            {deck.courseTitle} — M{deck.moduleNumber}·{deck.subLetter}
          </h1>
          <p className="text-sm text-escola-creme-50">{deck.subTitle}</p>
        </div>
        <div className="text-right text-xs text-escola-creme-50">
          <p>
            {deck.slides.length} slides ·{" "}
            {Math.floor(deck.totalDurationSec / 60)}:{String(deck.totalDurationSec % 60).padStart(2, "0")}
          </p>
          <p className="mt-1">
            {saveState === "saving" && "A guardar…"}
            {saveState === "saved" && "✓ Guardado"}
            {saveState === "error" && <span className="text-red-400">Erro a guardar</span>}
            {saveState === "idle" && hasCustomScript && "✓ Configuração guardada"}
            {saveState === "idle" && !hasCustomScript && "A usar valores por defeito"}
          </p>
        </div>
      </div>

      {/* Preview — grande, centrado */}
      <div className="mb-4 overflow-hidden rounded-xl">
        <SlidePreview
          deck={deck}
          controlledIndex={currentIdx}
          onIndexChange={(i, s) => {
            setCurrentIdx(i);
            setCurrentSlide(s);
          }}
          onPlayingChange={setIsPlaying}
        />
      </div>

      {/* Tira de slides — clica para saltar */}
      <div className="mb-6 flex gap-1 overflow-x-auto pb-2">
        {deck.slides.map((s, i) => {
          const active = i === currentIdx;
          const label = stripLabel(s, i);
          return (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`shrink-0 whitespace-nowrap rounded px-2 py-1 text-[10px] transition-colors ${
                active
                  ? "bg-escola-dourado text-escola-bg"
                  : "border border-escola-border bg-escola-card text-escola-creme-50 hover:text-escola-creme"
              }`}
              title={`Slide ${i + 1} · ${s.duracao}s`}
            >
              {i + 1}. {label}
            </button>
          );
        })}
      </div>

      {/* Editor contextual do slide actual */}
      <div className="mb-6">
        <CurrentSlideEditor
          deck={deck}
          slideIdx={currentIdx}
          baseScript={baseScript}
          config={config}
          onConfigChange={setConfig}
        />
      </div>

      {/* Mix preview (toggle) */}
      <div className="mb-6 rounded-xl border border-escola-border bg-escola-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[10px] uppercase tracking-wider text-escola-dourado">
              🎧 Pré-visualização do som (browser)
            </h3>
            <p className="mt-1 text-[11px] text-escola-creme-50">
              {resolvedAgTrack ? (
                <>
                  Toca <span className="text-escola-creme">{resolvedAgTrack}</span> em loop enquanto
                  avanças pelos slides. Volume muda conforme o acto.
                </>
              ) : (
                <>Escolhe uma faixa no painel Som para ouvires a mistura.</>
              )}
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-escola-creme-50">
            <input
              type="checkbox"
              checked={mixEnabled}
              onChange={(e) => setMixEnabled(e.target.checked)}
              disabled={!resolvedAgTrack}
            />
            Tocar AG por baixo
          </label>
        </div>
      </div>

      {/* SOM — sempre visível, sem tabs */}
      <div className="mb-6">
        {loaded && (
          <SoundPanel
            defaults={defaults}
            config={config}
            onConfigChange={setConfig}
            agTracks={agTracks}
            agTracksLoading={agTracksLoading}
            onSaveAsCourseDefault={saveCourseDefault}
          />
        )}
        {defaultsSaveState === "saving" && (
          <p className="mt-1 text-[10px] text-escola-creme-50">A guardar por defeito do curso…</p>
        )}
        {defaultsSaveState === "saved" && (
          <p className="mt-1 text-[10px] text-escola-creme-50">✓ Por defeito do curso guardado</p>
        )}
      </div>

      {/* RITMO GLOBAL */}
      <div className="mb-6 rounded-xl border border-escola-border bg-escola-card p-5">
        <h3 className="mb-2 text-sm font-medium text-escola-creme">⏱ Ritmo global</h3>
        <p className="mb-3 text-[11px] text-escola-creme-50">
          Multiplicador em cima do pace automático (1 segundo por cada 5 caracteres).
          0.5× = mais rápido, 2× = mais lento.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0.5}
            max={2.0}
            step={0.05}
            value={config.globalTimingMultiplier ?? 1}
            onChange={(e) =>
              setConfig({ ...config, globalTimingMultiplier: Number(e.target.value) })
            }
            className="flex-1"
          />
          <span className="w-20 text-right font-mono text-xs text-escola-creme">
            {(config.globalTimingMultiplier ?? 1).toFixed(2)}×
          </span>
          {config.globalTimingMultiplier != null && config.globalTimingMultiplier !== 1 && (
            <button
              onClick={() => {
                const { globalTimingMultiplier: _unused, ...rest } = config;
                setConfig(rest);
              }}
              className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
              title="Repor 1×"
            >
              ↺
            </button>
          )}
        </div>
      </div>

      {/* RENDER */}
      <div className="mb-6 rounded-xl border border-escola-dourado/40 bg-escola-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-escola-creme">🎬 Renderizar MP4</h3>
          {!isConfigured && (
            <span className="text-[10px] text-red-400">
              Escolhe uma faixa no painel Som primeiro
            </span>
          )}
        </div>
        <button
          onClick={submitRender}
          disabled={!isConfigured || isRendering}
          className="w-full rounded-lg bg-escola-dourado px-4 py-3 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {renderJob?.status === "queued" && "Em fila…"}
          {renderJob?.status === "running" && "A renderizar…"}
          {(!renderJob || renderJob.status === "done" || renderJob.status === "error") &&
            "Renderizar MP4 (GitHub Actions · FFmpeg)"}
        </button>
        {renderJob && (
          <div className="mt-4 border-t border-escola-border pt-3 text-xs">
            <p className="text-escola-creme-50">
              Job: <span className="font-mono text-escola-creme">{renderJob.jobId}</span> · estado:{" "}
              {renderJob.status}
            </p>
            {renderJob.status === "done" && renderJob.videoUrl && (
              <div className="mt-2">
                <a
                  href={renderJob.videoUrl}
                  target="_blank"
                  rel="noopener"
                  className="text-escola-dourado hover:underline"
                >
                  Abrir MP4 renderizado ↗
                </a>
                <video
                  src={renderJob.videoUrl}
                  controls
                  className="mt-2 aspect-video w-full rounded-lg bg-black"
                />
              </div>
            )}
            {renderJob.status === "error" && (
              <p className="mt-2 text-red-400">{renderJob.error ?? "Erro desconhecido"}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function stripLabel(s: Slide, _i: number): string {
  if (s.tipo === "title") return "Título";
  if (s.tipo === "acto-marker") return `${s.romano}·marker`;
  if (s.tipo === "conteudo") return `${s.romano}·${actoShort(s.acto)}`;
  if (s.tipo === "fecho") return "fecho";
  if (s.tipo === "end") return "fim";
  return "";
}

function actoShort(a: Acto): string {
  return { pergunta: "P", situacao: "S", revelacao: "R", gesto: "G", frase: "F" }[a];
}
