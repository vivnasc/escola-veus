"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  buildSlideDeckFromConfig,
  DEFAULT_VOLUMES,
  getBaseScript,
  type Acto,
  type LessonConfig,
  type Slide,
} from "@/lib/course-slides";
import { SlidePreview } from "@/components/admin/SlidePreview";
import {
  LessonConfigEditor,
  type AgTrack,
} from "@/components/admin/LessonConfigEditor";

type CourseDefaults = {
  agTrack: string | null;
  volumeDb: Record<Acto, number>;
};

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
  const [defaultsSaveState, setDefaultsSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [renderJob, setRenderJob] = useState<RenderJob | null>(null);

  // Mix preview state
  const [mixEnabled, setMixEnabled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const deck = useMemo(
    () => buildSlideDeckFromConfig(slug, moduleNumber, sub, config),
    [slug, moduleNumber, sub, config],
  );

  // Load config + defaults + ag tracks on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [configRes, defaultsRes, tracksRes] = await Promise.all([
          fetch(`/api/admin/aulas/config?slug=${slug}&module=${moduleNumber}&sub=${sub}`),
          fetch(`/api/admin/aulas/course-defaults?slug=${slug}`),
          fetch("/api/admin/aulas/ag-tracks"),
        ]);
        const configJson = await configRes.json();
        const defaultsJson = await defaultsRes.json();
        const tracksJson = await tracksRes.json();
        if (!alive) return;
        setConfig(configJson.config ?? {});
        setDefaults(defaultsJson.defaults ?? { agTrack: null, volumeDb: DEFAULT_VOLUMES });
        setAgTracks(tracksJson.files ?? []);
      } catch {
        // Keep defaults
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

  // Debounced save of config on change (800ms)
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      setSaveState("saving");
      try {
        const res = await fetch("/api/admin/aulas/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, module: moduleNumber, sub, config }),
        });
        if (!res.ok) throw new Error("save failed");
        setSaveState("saved");
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
      } catch {
        setSaveState("error");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [config, loaded, slug, moduleNumber, sub]);

  // Mix audio: apenas AG em loop, volume modulado pelo slide actual.
  // Render real faz a modulacao determinisiticamente; aqui so e sample audivel.
  useEffect(() => {
    const resolvedTrack = config.agTrack || defaults.agTrack;
    if (!mixEnabled || !resolvedTrack) {
      audioRef.current?.pause();
      return;
    }
    const url = agTracks.find((t) => t.name === resolvedTrack)?.url;
    if (!url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }
    const el = audioRef.current;
    if (el.src !== url) el.src = url;
    if (isPlaying) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [mixEnabled, isPlaying, config.agTrack, defaults.agTrack, agTracks]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !currentSlide) return;
    if (currentSlide.tipo === "title" || currentSlide.tipo === "fecho" || currentSlide.tipo === "end") {
      el.volume = dbToLinear(-20);
      return;
    }
    const acto = "acto" in currentSlide ? currentSlide.acto : undefined;
    if (!acto) return;
    const db = config.volumeDb?.[acto] ?? defaults.volumeDb[acto] ?? DEFAULT_VOLUMES[acto];
    el.volume = Math.min(1, Math.max(0, dbToLinear(db)));
  }, [currentSlide, config.volumeDb, defaults.volumeDb]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // Save course defaults (AG track default for this course)
  const saveDefaults = useCallback(
    async (next: CourseDefaults) => {
      setDefaultsSaveState("saving");
      try {
        const res = await fetch("/api/admin/aulas/course-defaults", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, defaults: next }),
        });
        if (!res.ok) throw new Error("save failed");
        setDefaults(next);
        setDefaultsSaveState("saved");
        setTimeout(() => setDefaultsSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
      } catch {
        setDefaultsSaveState("error");
      }
    },
    [slug],
  );

  async function submitRender() {
    if (!deck) return;
    if (!confirm(`Renderizar MP4 de ${deck.courseTitle} M${moduleNumber}·${deck.subLetter}?\n\n${deck.slides.length} slides · ${Math.floor(deck.totalDurationSec / 60)}:${String(deck.totalDurationSec % 60).padStart(2, "0")}`)) return;
    try {
      setRenderJob({ jobId: "pending", status: "queued", submittedAt: Date.now() });
      const res = await fetch("/api/admin/aulas/render-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          module: moduleNumber,
          sub,
          config,
          defaults,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.jobId) throw new Error(json.erro ?? "render submit falhou");
      setRenderJob({ jobId: json.jobId, status: "queued", submittedAt: Date.now() });
    } catch (err) {
      setRenderJob({
        jobId: "error",
        status: "error",
        error: err instanceof Error ? err.message : String(err),
        submittedAt: Date.now(),
      });
    }
  }

  // Poll render status
  useEffect(() => {
    if (!renderJob || renderJob.jobId === "pending" || renderJob.jobId === "error") return;
    if (renderJob.status === "done" || renderJob.status === "error") return;
    const t = setInterval(async () => {
      try {
        const r = await fetch(`/api/admin/aulas/render-status?jobId=${renderJob.jobId}`);
        const j = await r.json();
        if (j.status === "done" || j.status === "error") {
          setRenderJob((rj) =>
            rj
              ? {
                  ...rj,
                  status: j.status,
                  videoUrl: j.videoUrl ?? null,
                  error: j.error ?? null,
                }
              : rj,
          );
        } else if (j.status === "running" && renderJob.status !== "running") {
          setRenderJob((rj) => (rj ? { ...rj, status: "running" } : rj));
        }
      } catch {
        // keep polling
      }
    }, 4000);
    return () => clearInterval(t);
  }, [renderJob]);

  if (!baseScript) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link href="/admin/producao/aulas" className="text-xs text-escola-creme-50 hover:text-escola-creme">
          ← Aulas
        </Link>
        <p className="mt-6 text-sm text-escola-creme">
          Script nao encontrado para {slug} M{modulo}·{sub.toUpperCase()}.
        </p>
        <p className="mt-2 text-xs text-escola-creme-50">
          So cursos com scripts completos em src/data/course-scripts/ aparecem aqui.
          Actualmente: Ouro Proprio.
        </p>
      </div>
    );
  }

  if (!deck) return null;

  const resolvedAgTrack = config.agTrack || defaults.agTrack;
  const isConfigured = !!resolvedAgTrack;
  const isAllEmpty =
    !config.script &&
    !config.blockSplits &&
    !config.timingOverrides &&
    !config.agTrack &&
    !config.volumeDb &&
    (config.globalTimingMultiplier == null || config.globalTimingMultiplier === 1);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/producao/aulas"
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            ← Aulas
          </Link>
          <h1 className="mt-2 font-serif text-2xl text-escola-creme">
            {deck.courseTitle} — M{deck.moduleNumber}·{deck.subLetter}
          </h1>
          <p className="text-sm text-escola-creme-50">{deck.subTitle}</p>
        </div>
        <div className="text-right text-xs text-escola-creme-50">
          <p>
            {deck.slides.length} slides · {Math.floor(deck.totalDurationSec / 60)}:
            {String(deck.totalDurationSec % 60).padStart(2, "0")}
          </p>
          <p className="mt-1">Mock B · fundo preto · sem imagens</p>
          <p className="mt-1">
            {saveState === "saving" && "A guardar..."}
            {saveState === "saved" && "Guardado"}
            {saveState === "error" && <span className="text-red-400">Erro a guardar</span>}
            {saveState === "idle" && !isAllEmpty && "Config guardada"}
            {saveState === "idle" && isAllEmpty && "A usar valores default"}
          </p>
        </div>
      </div>

      {/* Two columns: preview + editor */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-4">
          <SlidePreview
            deck={deck}
            onIndexChange={(_, s) => setCurrentSlide(s)}
            onPlayingChange={setIsPlaying}
          />

          {/* Mix preview controls */}
          <div className="rounded-xl border border-escola-border bg-escola-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-wider text-escola-dourado">
                Preview do mix (browser)
              </h3>
              <label className="flex items-center gap-2 text-xs text-escola-creme-50">
                <input
                  type="checkbox"
                  checked={mixEnabled}
                  onChange={(e) => setMixEnabled(e.target.checked)}
                />
                Tocar AG por baixo dos slides
              </label>
            </div>
            <p className="text-[10px] text-escola-creme-50">
              {resolvedAgTrack ? (
                <>
                  Faixa: <span className="text-escola-creme">{resolvedAgTrack}</span>. Volume muda
                  conforme o acto (lido dos sliders abaixo). Isto e so sample — o render real
                  aplica os volumes determinisiticamente no FFmpeg.
                </>
              ) : (
                <span>Escolhe uma faixa na tab &apos;Som&apos; para ouvires o mix.</span>
              )}
            </p>
          </div>

          {/* Render controls */}
          <div className="rounded-xl border border-escola-border bg-escola-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-wider text-escola-dourado">
                Renderizar MP4
              </h3>
              {!isConfigured && (
                <span className="text-[10px] text-red-400">
                  Escolhe uma faixa AG antes (tab Som)
                </span>
              )}
            </div>
            <button
              onClick={submitRender}
              disabled={!isConfigured || (renderJob?.status === "queued" || renderJob?.status === "running")}
              className="w-full rounded-lg bg-escola-dourado px-4 py-2.5 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {renderJob?.status === "queued" && "Em fila..."}
              {renderJob?.status === "running" && "A renderizar..."}
              {(!renderJob || renderJob.status === "done" || renderJob.status === "error") &&
                "Render MP4 (GitHub Actions · FFmpeg)"}
            </button>
            {renderJob && (
              <div className="mt-3 border-t border-escola-border pt-3 text-xs">
                <p className="text-escola-creme-50">
                  Job: <span className="font-mono text-escola-creme">{renderJob.jobId}</span> ·
                  status: {renderJob.status}
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

          {/* Course defaults quick-set */}
          <div className="rounded-xl border border-escola-border bg-escola-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-wider text-escola-dourado">
                Default do curso
              </h3>
              <span className="text-[10px] text-escola-creme-50">
                {defaultsSaveState === "saving" && "A guardar..."}
                {defaultsSaveState === "saved" && "Guardado"}
                {defaultsSaveState === "error" && <span className="text-red-400">Erro</span>}
              </span>
            </div>
            <p className="mb-2 text-[10px] text-escola-creme-50">
              Faixa AG default para todas as sub-aulas de {deck.courseTitle}:
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-escola-creme">
                {defaults.agTrack ?? <em className="text-escola-creme-50">nenhuma</em>}
              </span>
              {resolvedAgTrack && resolvedAgTrack !== defaults.agTrack && (
                <button
                  onClick={() =>
                    saveDefaults({ ...defaults, agTrack: resolvedAgTrack })
                  }
                  className="rounded border border-escola-border px-2 py-1 text-[10px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                >
                  Usar &quot;{resolvedAgTrack}&quot; como default do curso
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          {loaded && (
            <LessonConfigEditor
              baseScript={baseScript}
              defaults={defaults}
              config={config}
              onChange={setConfig}
              agTracks={agTracks}
              agTracksLoading={agTracksLoading}
              deck={deck}
            />
          )}
        </div>
      </div>
    </div>
  );
}
