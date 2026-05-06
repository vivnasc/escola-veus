"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type WeeklyPost = {
  id: string;
  brandSlug: BrandSlug;
  day: string;
  albumSlug?: string; trackNumber?: number; trackTitle?: string; albumTitle?: string;
  label?: string; temas?: string[];
  verses: string[];
  musicUrl: string;
  clipUrls: string[];
  captions: { instagram: string; tiktok: string; youtube: { title: string; description: string } };
  schedule: Record<"instagram" | "tiktok" | "youtube", Schedule>;
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

type StatusResp = Record<string, {
  plan: WeeklyPlan | null;
  summary?: { total: number; done: number; rendering: number; failed: number };
}>;

const DAY_LABELS: Record<string, string> = {
  mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui", fri: "Sex", sat: "Sáb", sun: "Dom",
};

function isoWeekNow(): number {
  const d = new Date();
  // ISO week — copia simples
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  return Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default function WeeklySocialPage() {
  const [week, setWeek] = useState<number>(isoWeekNow());
  const [year] = useState<number>(new Date().getFullYear());
  const [preview, setPreview] = useState<{ loranne: PreviewLoranne[]; ag: PreviewAG[] } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [status, setStatus] = useState<StatusResp | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [zips, setZips] = useState<{ loranne?: { url: string; zipName: string; missing: string[] }; "ancient-ground"?: { url: string; zipName: string; missing: string[] } }>({});
  const [pollOn, setPollOn] = useState(false);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadPreview = useCallback(async () => {
    setLoadingPreview(true);
    setErrors([]);
    try {
      const r = await fetch(`/api/admin/weekly/preview?week=${week}&year=${year}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || `HTTP ${r.status}`);
      setPreview({ loranne: j.loranne, ag: j.ag });
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setLoadingPreview(false);
    }
  }, [week, year]);

  const loadStatus = useCallback(async () => {
    const r = await fetch(`/api/admin/weekly/status?week=${week}&year=${year}`);
    const j = await r.json();
    if (r.ok) setStatus(j);
  }, [week, year]);

  // Carrega preview e status quando muda a semana
  useEffect(() => {
    void loadPreview();
    void loadStatus();
  }, [loadPreview, loadStatus]);

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

  // Pára polling quando todos prontos
  useEffect(() => {
    if (!status) return;
    const allDone = Object.values(status).every((s) => {
      if (!s.summary) return true; // plan vazio, ignora
      return s.summary.rendering === 0;
    });
    if (allDone && pollOn) stopPolling();
  }, [status, pollOn, stopPolling]);

  const generatePlan = useCallback(async () => {
    setBusy("plan");
    setErrors([]);
    try {
      const r = await fetch("/api/admin/weekly/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, year }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || `HTTP ${r.status}`);
      if (j.errors?.length) {
        setErrors(j.errors.map((e: { message: string }) => e.message));
      }
      await loadStatus();
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setBusy(null);
    }
  }, [week, year, loadStatus]);

  const dispatchRenders = useCallback(async () => {
    setBusy("dispatch");
    setErrors([]);
    try {
      const r = await fetch("/api/admin/weekly/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, year }),
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
  }, [week, year, loadStatus, startPolling]);

  const packageZips = useCallback(async () => {
    setBusy("package");
    setErrors([]);
    try {
      const r = await fetch("/api/admin/weekly/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, year }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || `HTTP ${r.status}`);
      setZips(j);
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setBusy(null);
    }
  }, [week, year]);

  const allDone = useMemo(() => {
    if (!status) return false;
    return Object.values(status).every((s) => {
      if (!s.plan) return true;
      return s.plan.posts.every((p) => p.status === "done");
    });
  }, [status]);

  const planExists = useMemo(() =>
    status && Object.values(status).some((s) => s.plan && s.plan.posts.length > 0),
    [status]);

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-escola-creme">
            Conteúdo semanal — Metricool
          </h2>
          <p className="mt-1 text-sm text-escola-creme-50">
            Loranne (7/sem) + Ancient Ground (3/sem) × Instagram · TikTok · YouTube Shorts
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <label className="text-xs text-escola-creme-50">Semana</label>
        <input
          type="number"
          min={1}
          max={53}
          value={week}
          onChange={(e) => setWeek(parseInt(e.target.value, 10) || 1)}
          className="w-20 rounded-lg border border-escola-border bg-escola-card px-3 py-1.5 text-sm text-escola-creme"
        />
        <span className="text-xs text-escola-creme-50">de {year}</span>
        <button
          onClick={() => void loadPreview()}
          disabled={loadingPreview}
          className="ml-2 rounded-lg border border-escola-border bg-escola-card px-3 py-1.5 text-xs text-escola-creme hover:border-escola-dourado/40 disabled:opacity-50"
        >
          {loadingPreview ? "..." : "↻ Recarregar"}
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 rounded-lg border border-red-700/40 bg-red-950/30 p-3 text-xs text-red-300">
          {errors.map((e, i) => <div key={i}>✗ {e}</div>)}
        </div>
      )}

      {/* ── Step 1: Preview ─────────────────────────────────────── */}
      <section className="mb-6">
        <h3 className="mb-3 font-serif text-lg text-escola-dourado">1. Preview da semana</h3>
        {!preview && <p className="text-xs text-escola-creme-50">A carregar…</p>}
        {preview && (
          <div className="grid gap-6 md:grid-cols-2">
            <BrandPreview brand="loranne" rows={preview.loranne} />
            <BrandPreview brand="ancient-ground" rows={preview.ag} />
          </div>
        )}
      </section>

      {/* ── Step 2: Plan ─────────────────────────────────────── */}
      <section className="mb-6">
        <h3 className="mb-3 font-serif text-lg text-escola-dourado">2. Gerar plano + captions</h3>
        <p className="mb-3 text-xs text-escola-creme-50">
          Chama Claude para gerar versos overlay + captions IG/TT/YT por post.
          Selecciona clips e MP3 do Supabase. ~60-90s.
        </p>
        <div className="flex gap-2">
          <button
            onClick={generatePlan}
            disabled={busy !== null}
            className="rounded-lg border border-escola-dourado bg-escola-dourado/10 px-4 py-2 text-sm font-semibold text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
          >
            {busy === "plan" ? "A gerar..." : "Gerar plano"}
          </button>
          {planExists && (
            <span className="self-center text-xs text-escola-creme-50">
              ✓ plan existente — clicar regenera
            </span>
          )}
        </div>
        {status && Object.entries(status).map(([brand, s]) =>
          s.plan && s.plan.posts.length > 0 && (
            <div key={brand} className="mt-4">
              <PlanDetails plan={s.plan} />
            </div>
          ),
        )}
      </section>

      {/* ── Step 3: Render ─────────────────────────────────────── */}
      <section className="mb-6">
        <h3 className="mb-3 font-serif text-lg text-escola-dourado">3. Renderizar shorts</h3>
        <p className="mb-3 text-xs text-escola-creme-50">
          Dispatcha jobs de render para GitHub Actions. ~5-15 min por short, paralelo.
          Polling automático a cada 15s.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={dispatchRenders}
            disabled={busy !== null || !planExists}
            className="rounded-lg border border-escola-dourado bg-escola-dourado/10 px-4 py-2 text-sm font-semibold text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
          >
            {busy === "dispatch" ? "A dispatchar..." : "Renderizar tudo"}
          </button>
          <button
            onClick={() => void loadStatus()}
            disabled={busy !== null}
            className="rounded-lg border border-escola-border bg-escola-card px-3 py-2 text-xs text-escola-creme hover:border-escola-dourado/40"
          >
            ↻ Refresh
          </button>
          {pollOn && <span className="text-xs text-escola-creme-50">⏱ polling…</span>}
        </div>
        {status && (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {Object.entries(status).map(([brand, s]) => (
              <BrandRenderStatus key={brand} brand={brand as BrandSlug} state={s} />
            ))}
          </div>
        )}
      </section>

      {/* ── Step 4: Package ─────────────────────────────────────── */}
      <section className="mb-6">
        <h3 className="mb-3 font-serif text-lg text-escola-dourado">4. Empacotar ZIPs</h3>
        <p className="mb-3 text-xs text-escola-creme-50">
          Cria <code>metricool.csv</code> + ZIP por marca. Vídeos em falta entram no CSV vazios.
        </p>
        <div className="flex gap-2">
          <button
            onClick={packageZips}
            disabled={busy !== null || !planExists}
            className="rounded-lg border border-escola-dourado bg-escola-dourado/10 px-4 py-2 text-sm font-semibold text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
          >
            {busy === "package" ? "A empacotar..." : allDone ? "Empacotar" : "Empacotar (alguns sem vídeo)"}
          </button>
        </div>
        {(zips.loranne || zips["ancient-ground"]) && (
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {(["loranne", "ancient-ground"] as BrandSlug[]).map((b) => {
              const z = zips[b];
              if (!z) return null;
              return (
                <a
                  key={b}
                  href={z.url}
                  download={z.zipName}
                  className="rounded-lg border border-escola-dourado bg-escola-dourado/10 p-4 hover:bg-escola-dourado/20"
                >
                  <div className="font-semibold text-escola-dourado">↓ {z.zipName}</div>
                  <div className="mt-1 text-xs text-escola-creme-50">
                    {z.missing.length === 0
                      ? "todos os vídeos prontos"
                      : `${z.missing.length} post(s) sem vídeo`}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function BrandPreview({ brand, rows }: {
  brand: BrandSlug;
  rows: PreviewLoranne[] | PreviewAG[];
}) {
  const title = brand === "loranne" ? "Loranne" : "Ancient Ground";
  return (
    <div className="rounded-lg border border-escola-border bg-escola-card p-4">
      <h4 className="mb-3 font-serif text-base font-semibold text-escola-creme">{title}</h4>
      <ul className="space-y-2 text-xs">
        {rows.map((r) => (
          <li key={r.day} className="border-b border-escola-border pb-2 last:border-0">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-escola-creme">
                {DAY_LABELS[r.day]}
              </span>
              <span className="text-escola-creme-50">
                {r.schedule.youtube.date}
              </span>
            </div>
            {"trackTitle" in r ? (
              <>
                <div className="mt-1 text-escola-dourado">
                  &quot;{r.trackTitle}&quot; · {r.albumTitle}
                </div>
                {r.verseSample && (
                  <div className="mt-0.5 italic text-escola-creme-50">
                    &quot;{r.verseSample}&quot;
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mt-1 text-escola-dourado">{r.label}</div>
                <div className="mt-0.5 text-escola-creme-50">
                  {r.temas.join(" + ")} · faixa {r.trackNumber}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrandRenderStatus({ brand, state }: {
  brand: BrandSlug;
  state: { plan: WeeklyPlan | null; summary?: { total: number; done: number; rendering: number; failed: number } };
}) {
  const title = brand === "loranne" ? "Loranne" : "Ancient Ground";
  if (!state.plan) {
    return (
      <div className="rounded-lg border border-escola-border bg-escola-card p-3 text-xs">
        <div className="font-semibold text-escola-creme">{title}</div>
        <div className="mt-1 text-escola-creme-50">sem plan — gera primeiro</div>
      </div>
    );
  }
  const s = state.summary || { total: state.plan.posts.length, done: 0, rendering: 0, failed: 0 };
  const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
  return (
    <div className="rounded-lg border border-escola-border bg-escola-card p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-escola-creme">{title}</span>
        <span className="text-escola-creme-50">{s.done}/{s.total} ({pct}%)</span>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-full bg-escola-border">
        <div className="h-full rounded-full bg-escola-dourado" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
        <span className="text-escola-creme-50">⏱ {s.rendering} a renderizar</span>
        <span className="text-emerald-400">✓ {s.done} prontos</span>
        <span className="text-red-400">✗ {s.failed} falhados</span>
      </div>
    </div>
  );
}

function PlanDetails({ plan }: { plan: WeeklyPlan }) {
  const [open, setOpen] = useState(false);
  const title = plan.brand === "loranne" ? "Loranne" : "Ancient Ground";
  return (
    <div className="rounded-lg border border-escola-border bg-escola-card p-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-xs"
      >
        <span className="font-semibold text-escola-creme">
          {open ? "▾" : "▸"} {title} — {plan.posts.length} posts (gerado {new Date(plan.generatedAt).toLocaleString()})
        </span>
      </button>
      {open && (
        <ul className="mt-3 space-y-2 text-[11px]">
          {plan.posts.map((p) => (
            <li key={p.id} className="border-b border-escola-border pb-2 last:border-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-escola-creme">
                  {DAY_LABELS[p.day]} · {p.trackTitle || p.label}
                </span>
                <PostStatusPill status={p.status} />
              </div>
              <details className="mt-1">
                <summary className="cursor-pointer text-escola-creme-50">verso + caption IG</summary>
                {p.verses.length > 0 && (
                  <div className="mt-1 italic text-escola-dourado">&quot;{p.verses[0]}&quot;</div>
                )}
                <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-black/20 p-2 text-[10px] text-escola-creme">
                  {p.captions.instagram}
                </pre>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
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
    <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase ${color[status]}`}>
      {status}
    </span>
  );
}
