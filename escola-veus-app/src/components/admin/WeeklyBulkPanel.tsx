"use client";

/**
 * WeeklyBulkPanel — gera bulk semanal de shorts para Metricool, filtrado
 * por marca. Usado no topo das páginas /admin/producao/shorts (Loranne)
 * e /admin/producao/ancient-ground/shorts.
 *
 * Wraps as 4 rotas /api/admin/weekly/{preview,plan,dispatch,status,package}
 * com filtro `brands` à marca corrente.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RENDER_VERSION } from "@/lib/shorts/render-version";

type BrandSlug = "loranne" | "ancient-ground";

type Schedule = { date: string; time: string; timezone: string };

type PreviewLoranne = {
  day: string; albumSlug: string; albumTitle: string;
  trackNumber: number; trackTitle: string; verseSample: string;
  schedule: Record<"instagram" | "tiktok" | "youtube", Schedule>;
};
type PreviewAG = {
  day: string; label: string; temas: string[]; trackNumber: number;
  schedule: Record<"instagram" | "tiktok" | "youtube", Schedule>;
};

type RenderJob = {
  jobId: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  status: "planned" | "queued" | "rendering" | "done" | "failed";
  errorMessage?: string;
  renderVersion?: string;
  renderedAt?: string;
  attempts?: number;
};

type LoranneMood = "elevar" | "aterrar" | "acordar" | "lembrar" | "reunir-se" | "respirar" | "atravessar";

const MOOD_COLORS: Record<LoranneMood, string> = {
  elevar:     "bg-amber-600/30 text-amber-300 border-amber-700/40",
  aterrar:    "bg-yellow-800/30 text-yellow-300 border-yellow-700/40",
  acordar:    "bg-purple-600/30 text-purple-300 border-purple-700/40",
  lembrar:    "bg-rose-700/30 text-rose-300 border-rose-700/40",
  "reunir-se":"bg-escola-dourado/20 text-escola-dourado border-escola-dourado/40",
  respirar:   "bg-sky-700/30 text-sky-300 border-sky-700/40",
  atravessar: "bg-stone-700/30 text-stone-300 border-stone-700/40",
};

type WeeklyPost = {
  id: string;
  brandSlug: BrandSlug;
  day: string;
  trackTitle?: string; albumTitle?: string;
  label?: string; temas?: string[];
  mood?: LoranneMood;
  verses: string[];
  captions: { instagram: string; tiktok: string; youtube: { title: string; description: string } };
  storyChapters?: string[];
  storyTitle?: string;
  renderJobs?: { clip?: RenderJob; full?: RenderJob };
  // Legacy / retrocompat — pode estar populado mesmo com renderJobs preenchido (=clip).
  videoUrl: string | null;
  thumbnailUrl: string | null;
  jobId: string | null;
  status: "planned" | "queued" | "rendering" | "done" | "failed";
  errorMessage?: string;
};

type WeeklyPlan = {
  year: number; week: number; brand: BrandSlug;
  generatedAt: string; updatedAt: string;
  posts: WeeklyPost[];
};

type StatusEntry = {
  plan: WeeklyPlan | null;
  summary?: { total: number; done: number; rendering: number; failed: number };
};

const DAY_LABELS: Record<string, string> = {
  mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui", fri: "Sex", sat: "Sáb", sun: "Dom",
};

function isoWeekNow(): number {
  const d = new Date();
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  return Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default function WeeklyBulkPanel({
  brand,
  defaultOpen = false,
}: {
  brand: BrandSlug;
  defaultOpen?: boolean;
}) {
  const brandLabel = brand === "loranne" ? "Loranne" : "Ancient Ground";
  const [open, setOpen] = useState(defaultOpen);
  const [week, setWeek] = useState<number>(isoWeekNow());
  const [year] = useState<number>(new Date().getFullYear());
  const [preview, setPreview] = useState<PreviewLoranne[] | PreviewAG[] | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [statusEntry, setStatusEntry] = useState<StatusEntry | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [zip, setZip] = useState<{ url: string; zipName: string; missing: string[] } | null>(null);
  const [pollOn, setPollOn] = useState(false);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const brandsParam = `brands=${brand}`;

  const loadPreview = useCallback(async () => {
    setLoadingPreview(true);
    setErrors([]);
    try {
      const r = await fetch(`/api/admin/weekly/preview?week=${week}&year=${year}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || `HTTP ${r.status}`);
      setPreview(brand === "loranne" ? j.loranne : j.ag);
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setLoadingPreview(false);
    }
  }, [week, year, brand]);

  const loadStatus = useCallback(async () => {
    const r = await fetch(`/api/admin/weekly/status?week=${week}&year=${year}&${brandsParam}`);
    const j = await r.json();
    if (r.ok) setStatusEntry(j[brand] ?? null);
  }, [week, year, brand, brandsParam]);

  useEffect(() => {
    if (!open) return;
    void loadPreview();
    void loadStatus();
  }, [open, loadPreview, loadStatus]);

  const startPolling = useCallback(() => {
    if (pollTimer.current) return;
    setPollOn(true);
    pollTimer.current = setInterval(() => { void loadStatus(); }, 15_000);
  }, [loadStatus]);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null; }
    setPollOn(false);
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => {
    if (!statusEntry?.summary) return;
    if (statusEntry.summary.rendering === 0 && pollOn) stopPolling();
  }, [statusEntry, pollOn, stopPolling]);

  const generatePlan = useCallback(async () => {
    setBusy("plan");
    setErrors([]);
    try {
      const r = await fetch("/api/admin/weekly/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, year, brands: [brand] }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || `HTTP ${r.status}`);
      if (j.errors?.length) setErrors(j.errors.map((e: { message: string }) => e.message));
      await loadStatus();
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setBusy(null);
    }
  }, [week, year, brand, loadStatus]);

  const dispatchRenders = useCallback(async (force = false) => {
    if (force && !confirm(
      `Re-renderizar TODOS os clips e fulls de ${brandLabel} desta semana?\n\nOs vídeos actuais serão substituídos. Útil quando contos/captions/letras mudaram.`,
    )) return;
    setBusy(force ? "rerender-all" : "dispatch");
    setErrors([]);
    try {
      const r = await fetch("/api/admin/weekly/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, year, brands: [brand], force }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || `HTTP ${r.status}`);
      await loadStatus();
      startPolling();
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setBusy(null);
    }
  }, [week, year, brand, brandLabel, loadStatus, startPolling]);

  const packageZip = useCallback(async () => {
    setBusy("package");
    setErrors([]);
    try {
      const r = await fetch("/api/admin/weekly/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, year, brands: [brand] }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || `HTTP ${r.status}`);
      const z = j[brand];
      if (z?.url) setZip({ url: z.url, zipName: z.zipName, missing: z.missing || [] });
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setBusy(null);
    }
  }, [week, year, brand]);

  const planExists = useMemo(
    () => Boolean(statusEntry?.plan && statusEntry.plan.posts.length > 0),
    [statusEntry],
  );

  return (
    <section className="rounded-lg border border-escola-dourado/40 bg-escola-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <span className="text-sm font-semibold text-escola-dourado">
            {open ? "▾" : "▸"} Bulk semanal → Metricool
          </span>
          <span className="ml-2 text-xs text-escola-creme-50">
            Gera todos os shorts da semana de uma vez · CSV pronto para import
          </span>
        </div>
        {statusEntry?.summary && (
          <span className="text-xs text-escola-creme-50">
            sem {statusEntry.plan?.week ?? "?"}: {statusEntry.summary.done}/{statusEntry.summary.total}
          </span>
        )}
      </button>

      {open && (
        <div className="border-t border-escola-border p-4 space-y-4">
          {/* Selector + actions */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-escola-creme-50">Semana</label>
            <input
              type="number"
              min={1}
              max={53}
              value={week}
              onChange={(e) => setWeek(parseInt(e.target.value, 10) || 1)}
              className="w-16 rounded border border-escola-border bg-escola-bg-card px-2 py-1 text-xs text-escola-creme"
            />
            <span className="text-xs text-escola-creme-50">de {year}</span>
            <button
              onClick={() => { void loadPreview(); void loadStatus(); }}
              disabled={loadingPreview}
              className="ml-1 rounded border border-escola-border px-2 py-1 text-xs text-escola-creme hover:border-escola-dourado/40 disabled:opacity-50"
            >
              ↻
            </button>
            <span className="mx-2 text-escola-border">·</span>
            <button
              onClick={generatePlan}
              disabled={busy !== null}
              className="rounded border border-escola-dourado bg-escola-dourado/10 px-3 py-1 text-xs font-semibold text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
            >
              {busy === "plan" ? "..." : "1. Gerar plano"}
            </button>
            <button
              onClick={() => dispatchRenders(false)}
              disabled={busy !== null || !planExists}
              className="rounded border border-escola-dourado bg-escola-dourado/10 px-3 py-1 text-xs font-semibold text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
            >
              {busy === "dispatch" ? "..." : "2. Renderizar"}
            </button>
            <button
              onClick={() => dispatchRenders(true)}
              disabled={busy !== null || !planExists}
              className="rounded border border-escola-coral/40 bg-escola-coral/10 px-3 py-1 text-xs font-semibold text-escola-coral hover:bg-escola-coral/20 disabled:opacity-50"
              title="Reseta TODOS os renderJobs e re-dispatcha. Útil depois de mudar contos/letras/captions."
            >
              {busy === "rerender-all" ? "..." : "↻ Re-render tudo"}
            </button>
            <button
              onClick={packageZip}
              disabled={busy !== null || !planExists}
              className="rounded border border-escola-dourado bg-escola-dourado/10 px-3 py-1 text-xs font-semibold text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
            >
              {busy === "package" ? "..." : "3. Empacotar"}
            </button>
            {pollOn && <span className="text-xs text-escola-creme-50">⏱ polling…</span>}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded border border-red-700/40 bg-red-950/30 p-2 text-xs text-red-300">
              {errors.map((e, i) => <div key={i}>✗ {e}</div>)}
            </div>
          )}

          {/* Preview da semana (lista compacta) */}
          {preview && preview.length > 0 && (
            <div className="rounded border border-escola-border bg-escola-bg-card p-3">
              <div className="mb-2 text-xs font-semibold text-escola-creme">
                Preview · {brandLabel} · {preview.length} posts
              </div>
              <ul className="space-y-1 text-[11px]">
                {preview.map((r) => (
                  <li key={r.day} className="flex flex-wrap items-baseline gap-2">
                    <span className="w-10 font-semibold text-escola-creme">{DAY_LABELS[r.day]}</span>
                    <span className="text-escola-creme-50">{r.schedule.youtube.date}</span>
                    {"trackTitle" in r ? (
                      <>
                        <span className="text-escola-dourado">&quot;{r.trackTitle}&quot;</span>
                        <span className="text-escola-creme-50">· {r.albumTitle}</span>
                        {r.verseSample && (
                          <span className="ml-2 italic text-escola-creme-50">
                            &quot;{r.verseSample}&quot;
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-escola-dourado">{r.label}</span>
                        <span className="text-escola-creme-50">· {r.temas.join(" + ")}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Status & progresso */}
          {statusEntry?.plan && statusEntry.plan.posts.length > 0 && (
            <div className="rounded border border-escola-border bg-escola-bg-card p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-escola-creme">
                  Plano gerado em {new Date(statusEntry.plan.generatedAt).toLocaleString()}
                </span>
                {statusEntry.summary && (
                  <span className="text-escola-creme-50">
                    {statusEntry.summary.done}/{statusEntry.summary.total} prontos
                    {statusEntry.summary.rendering > 0 && ` · ${statusEntry.summary.rendering} a renderizar`}
                    {statusEntry.summary.failed > 0 && ` · ${statusEntry.summary.failed} falhados`}
                  </span>
                )}
              </div>
              {statusEntry.summary && (
                <div className="h-1.5 w-full rounded-full bg-escola-border">
                  <div
                    className="h-full rounded-full bg-escola-dourado"
                    style={{ width: `${Math.round((statusEntry.summary.done / Math.max(1, statusEntry.summary.total)) * 100)}%` }}
                  />
                </div>
              )}
              <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {statusEntry.plan.posts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    week={week}
                    year={year}
                    onRefresh={loadStatus}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Download */}
          {zip && (
            <a
              href={zip.url}
              download={zip.zipName}
              className="block rounded border border-escola-dourado bg-escola-dourado/10 p-3 text-center text-sm font-semibold text-escola-dourado hover:bg-escola-dourado/20"
            >
              ↓ Descarregar {zip.zipName}
              {zip.missing.length > 0 && (
                <span className="block text-xs text-escola-creme-50">
                  ⚠ {zip.missing.length} post(s) sem vídeo no CSV
                </span>
              )}
            </a>
          )}
        </div>
      )}
    </section>
  );
}

function PostStatusPill({ status }: { status: WeeklyPost["status"] }) {
  const color: Record<WeeklyPost["status"], string> = {
    planned: "bg-escola-border text-escola-creme-50",
    queued: "bg-blue-600/30 text-blue-300",
    rendering: "bg-amber-600/30 text-amber-300",
    done: "bg-emerald-600/30 text-emerald-300",
    failed: "bg-red-600/30 text-red-300",
  };
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase ${color[status]}`}>
      {status}
    </span>
  );
}

function PostCard({
  post, week, year,
  onRefresh,
}: {
  post: WeeklyPost;
  week: number;
  year: number;
  onRefresh: () => void;
}) {
  const title = post.trackTitle || post.label || post.id;
  const subtitle = post.albumTitle || (post.temas?.join(" + ")) || "";
  const [activeMode, setActiveMode] = useState<"clip" | "full">("clip");
  const [showCaptions, setShowCaptions] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [rerendering, setRerendering] = useState(false);
  const hasStory = (post.storyChapters?.length || 0) > 0;

  const doRerender = async () => {
    if (rerendering) return;
    if (!confirm(`Re-renderizar ${activeMode === "full" ? "Full" : "Clip 30s"} de "${title}"? O actual será substituído.`)) return;
    setRerendering(true);
    try {
      const r = await fetch("/api/admin/weekly/rerender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week, year,
          brand: post.brandSlug,
          postId: post.id,
          mode: activeMode,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || `HTTP ${r.status}`);
      onRefresh();
    } catch (e) {
      alert("Falhou: " + (e as Error).message);
    } finally {
      setRerendering(false);
    }
  };

  const clipJob: RenderJob = post.renderJobs?.clip || {
    jobId: post.jobId,
    videoUrl: post.videoUrl,
    thumbnailUrl: post.thumbnailUrl,
    status: post.status,
    errorMessage: post.errorMessage,
  };
  const fullJob: RenderJob | undefined = post.renderJobs?.full;
  // Para preview pré-render, finge um job vazio em mode=full para activar a tab.
  const fullJobOrPlaceholder: RenderJob = fullJob || {
    jobId: null, videoUrl: null, thumbnailUrl: null, status: "planned",
  };
  const active = activeMode === "full" ? fullJobOrPlaceholder : clipJob;
  const aggregateStatus: RenderJob["status"] =
    [clipJob, fullJob].some((j) => j?.status === "failed") ? "failed"
    : [clipJob, fullJob].every((j) => !j || j.status === "done") ? "done"
    : [clipJob, fullJob].some((j) => j?.status === "rendering") ? "rendering"
    : [clipJob, fullJob].some((j) => j?.status === "queued") ? "queued"
    : "planned";

  return (
    <div className="overflow-hidden rounded border border-escola-border bg-escola-bg-card">
      {/* Tabs clip/full — ambas sempre clicáveis (full mostra placeholder
          se ainda não foi dispatchado). */}
      <div className="flex border-b border-escola-border text-[10px]">
        {(["clip", "full"] as const).map((m) => {
          const job = m === "full" ? fullJob : clipJob;
          return (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`flex-1 px-2 py-1.5 transition-colors ${
                activeMode === m
                  ? "border-b-2 border-escola-dourado bg-escola-dourado/10 text-escola-dourado"
                  : "text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              {m === "clip" ? "Clip 30s" : "Full"}
              {job?.status === "done" && " ✓"}
              {job?.status === "rendering" && " ⏱"}
              {job?.status === "failed" && " ✗"}
            </button>
          );
        })}
      </div>

      <div className={`${activeMode === "full" ? "aspect-[16/9]" : "aspect-[9/16]"} bg-black`}>
        {active?.videoUrl ? (
          <video
            src={active.videoUrl}
            poster={active.thumbnailUrl || undefined}
            controls
            preload="metadata"
            className="h-full w-full"
          />
        ) : active?.thumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={active.thumbnailUrl} alt={title} className="h-full w-full object-cover opacity-60" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-escola-creme-50">
            {active?.status === "rendering" ? "a renderizar…" :
             active?.status === "queued" ? "em fila" :
             active?.status === "failed" ? "falhou" : "sem vídeo"}
          </div>
        )}
      </div>
      <div className="p-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-escola-creme">
              {DAY_LABELS[post.day]} · {title}
            </div>
            {subtitle && (
              <div className="truncate text-[10px] text-escola-creme-50">{subtitle}</div>
            )}
          </div>
          <PostStatusPill status={aggregateStatus} />
        </div>
        {post.mood && (
          <div className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-wide ${MOOD_COLORS[post.mood]}`}>
            ♡ {post.mood}
          </div>
        )}
        <RenderVersionBadge job={active} />
        {/* AG full sem conto — Claude story falhou ou plan velho */}
        {post.brandSlug === "ancient-ground" && activeMode === "full" && !hasStory && (
          <div className="mt-1 rounded border border-red-700/40 bg-red-950/30 px-1.5 py-0.5 text-[9px] text-red-300">
            ⚠ sem conto — Claude story falhou ou o plano é anterior à paralelização.
            Re-gera plano em &quot;1. Gerar plano&quot; para tentar.
          </div>
        )}
        {active?.errorMessage && (
          <div className="mt-1 text-[10px] text-red-300">✗ {active.errorMessage}</div>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
          {active?.videoUrl && (
            <>
              <a
                href={active.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-escola-creme-50 hover:text-escola-dourado"
              >
                ↗ abrir
              </a>
              <a
                href={active.videoUrl}
                download
                className="text-escola-creme-50 hover:text-escola-dourado"
              >
                ↓ download
              </a>
            </>
          )}
          <button
            onClick={doRerender}
            disabled={rerendering}
            className="ml-auto rounded border border-escola-coral/40 bg-escola-coral/10 px-2 py-0.5 text-[10px] text-escola-coral hover:bg-escola-coral/20 disabled:opacity-50"
            title={`Re-renderiza apenas o ${activeMode === "full" ? "Full" : "Clip"} deste post`}
          >
            {rerendering ? "…" : `↻ re-render ${activeMode}`}
          </button>
        </div>
        {/* YouTube title — sempre visível, é o asset crítico SEO. */}
        <div className="mt-2 rounded border border-escola-dourado/40 bg-escola-dourado/5 p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-wide text-escola-dourado">
              YouTube · título
            </span>
            <button
              onClick={async () => {
                try { await navigator.clipboard.writeText(post.captions.youtube.title); } catch {}
              }}
              className="text-[9px] text-escola-creme-50 hover:text-escola-dourado"
            >
              ⧉ copiar
            </button>
          </div>
          <div className="text-[11px] text-escola-creme break-words">
            {post.captions.youtube.title}
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <button
            onClick={() => setShowCaptions((v) => !v)}
            className="w-full rounded border border-escola-border px-2 py-1 text-[10px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
          >
            {showCaptions ? "▴ esconder legendas" : "▾ ver legendas"}
          </button>
          {hasStory && (
            <button
              onClick={() => setShowStory((v) => !v)}
              className="w-full rounded border border-escola-coral/30 bg-escola-coral/5 px-2 py-1 text-[10px] text-escola-coral hover:bg-escola-coral/10"
            >
              {showStory ? "▴ esconder conto" : `▾ ver conto (${post.storyChapters!.length} capítulos)`}
            </button>
          )}
        </div>
        {showCaptions && (
          <div className="mt-2 space-y-2 text-[10px]">
            <CaptionBlock label="Instagram" text={post.captions.instagram} />
            <CaptionBlock label="TikTok" text={post.captions.tiktok} />
            <CaptionBlock label="YouTube · descrição" text={post.captions.youtube.description} />
          </div>
        )}
        {showStory && hasStory && (
          <div className="mt-2 rounded border border-escola-coral/30 bg-black/30 p-2 text-[10px]">
            {post.storyTitle && (
              <div className="mb-2 font-semibold italic text-escola-coral">
                {post.storyTitle}
              </div>
            )}
            <ol className="list-decimal space-y-2 pl-4 text-escola-creme">
              {post.storyChapters!.map((c, i) => (
                <li key={i} className="leading-relaxed">{c}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

/** Badge por vídeo: versão renderizada + nº de tentativas + carimbo.
 *  Marca a verde se a versão coincidir com RENDER_VERSION actual,
 *  amarelo se for antiga (precisa re-render para apanhar as mudanças). */
function RenderVersionBadge({ job }: { job: RenderJob | undefined }) {
  if (!job) return null;
  const v = job.renderVersion;
  const attempts = job.attempts ?? 0;
  const renderedAt = job.renderedAt;
  if (!v && attempts === 0 && !renderedAt) return null;
  const isCurrent = v === RENDER_VERSION;
  const colorClass = !v
    ? "border-escola-border text-escola-creme-50"
    : isCurrent
    ? "border-emerald-700/40 bg-emerald-950/30 text-emerald-300"
    : "border-amber-700/40 bg-amber-950/30 text-amber-300";
  const time = renderedAt
    ? new Date(renderedAt).toLocaleString(undefined, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : null;
  return (
    <div
      className={`mt-1 flex flex-wrap items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] ${colorClass}`}
      title={!v ? "Sem versão registada" : isCurrent ? `Renderizado com a versão actual (${RENDER_VERSION})` : `Versão antiga: ${v}. Versão actual: ${RENDER_VERSION}. Re-renderiza para apanhar as mudanças.`}
    >
      {v && <span>{isCurrent ? "✓" : "⚠"} v={v}</span>}
      {!v && <span>sem versão</span>}
      {attempts > 0 && <span>· #{attempts}</span>}
      {time && <span>· {time}</span>}
    </div>
  );
}

function CaptionBlock({ label, text }: { label: string; text: string }) {
  return (
    <details className="rounded border border-escola-border bg-black/30 p-2">
      <summary className="cursor-pointer text-escola-dourado">{label}</summary>
      <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-[10px] text-escola-creme">
        {text}
      </pre>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
          } catch {}
        }}
        className="mt-1 text-[9px] text-escola-creme-50 hover:text-escola-dourado"
      >
        ⧉ copiar
      </button>
    </details>
  );
}
