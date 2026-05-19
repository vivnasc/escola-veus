"use client";

/**
 * RangeBulkPanel — substitui o WeeklyBulkPanel. Gera/dispatcha/empacota
 * shorts para um RANGE de dias (não só uma semana). Compatível com o
 * fluxo Metricool: o pacote final é UM ZIP com 1 CSV por semana ISO
 * (cada CSV bem abaixo do limite de 50 linhas), ordenado para drag-drop
 * sequencial.
 *
 * Mental model: igual ao vc-sabia BulkMonthPanel — ano/mês/dia início/
 * dia fim. Sob o capot calcula as semanas ISO cobertas e itera os
 * endpoints semanais existentes (/plan, /dispatch, /status) por semana,
 * agregando o status. O endpoint novo /api/admin/weekly/range/package
 * faz o bundling final.
 */

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import WeeklyBulkPanel from "@/components/admin/WeeklyBulkPanel";

type BrandSlug = "loranne" | "ancient-ground";

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DAY_LABELS: Record<string, string> = {
  mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui", fri: "Sex", sat: "Sáb", sun: "Dom",
};

const BRAND_PUBLISH_DAYS: Record<BrandSlug, readonly string[]> = {
  loranne: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  "ancient-ground": ["tue", "thu", "sat"],
};

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function todayMaputo(): { year: number; month: number; day: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Maputo",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** ISO 8601 week number for a date. Edge case: dias do início de Jan ou fim
 *  de Dez podem cair em semanas do ano vizinho — assumimos que o user não
 *  cruza ano num único range (raro; se acontecer, divide em dois ranges). */
function isoWeekOf(year: number, month: number, day: number): number {
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function weeksInRange(year: number, month: number, startDay: number, endDay: number): number[] {
  const set = new Set<number>();
  for (let d = startDay; d <= endDay; d++) {
    set.add(isoWeekOf(year, month, d));
  }
  return [...set].sort((a, b) => a - b);
}

type WeekSummary = {
  total: number; done: number; rendering: number; failed: number;
};

type WeekState = {
  week: number;
  planExists: boolean;
  posts: number; // count após filtro de dias (se aplicado)
  summary?: WeekSummary;
  missingDays?: string[];
  error?: string;
};

type ZipOutput = {
  url: string;
  zipName: string;
  totalPosts: number;
  perWeek: { week: number; posts: number; skipped: boolean; skipReason?: string }[];
};

export default function RangeBulkPanel({ brand }: { brand: BrandSlug }) {
  const brandLabel = brand === "loranne" ? "Loranne" : "Ancient Ground";
  const t = todayMaputo();
  const [year, setYear] = useState<number>(t.year);
  const [month, setMonth] = useState<number>(t.month);
  const [startDay, setStartDay] = useState<number>(1);
  const [endDay, setEndDay] = useState<number>(daysInMonth(t.year, t.month));
  const [packDays, setPackDays] = useState<string[] | null>(null);

  const weeks = useMemo(
    () => weeksInRange(year, month, startDay, endDay),
    [year, month, startDay, endDay],
  );
  const dayCount = endDay - startDay + 1;

  const [weekStates, setWeekStates] = useState<Map<number, WeekState>>(new Map());
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [zipOutput, setZipOutput] = useState<ZipOutput | null>(null);
  /** Semanas expandidas para edição per-post (mostra WeeklyBulkPanel inline). */
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const toggleWeek = useCallback((w: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w);
      else next.add(w);
      return next;
    });
  }, []);

  // Polling para acompanhar dispatches em curso.
  const [pollOn, setPollOn] = useState(false);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStatusForWeek = useCallback(
    async (week: number): Promise<WeekState> => {
      try {
        const r = await fetch(
          `/api/admin/weekly/status?year=${year}&week=${week}&brands=${brand}`,
          { cache: "no-store" },
        );
        if (!r.ok) {
          return { week, planExists: false, posts: 0, error: `HTTP ${r.status}` };
        }
        const j = await r.json();
        const entry = j[brand];
        if (!entry?.plan) {
          return { week, planExists: false, posts: 0 };
        }
        const expectedDays = BRAND_PUBLISH_DAYS[brand];
        const haveDays = new Set<string>(entry.plan.posts.map((p: { day: string }) => p.day));
        const missingDays = expectedDays.filter((d) => !haveDays.has(d));
        return {
          week,
          planExists: true,
          posts: entry.plan.posts.length,
          summary: entry.summary,
          missingDays: missingDays.length > 0 ? [...missingDays] : undefined,
        };
      } catch (e) {
        return {
          week, planExists: false, posts: 0,
          error: e instanceof Error ? e.message : String(e),
        };
      }
    },
    [year, brand],
  );

  const loadAllStatus = useCallback(async () => {
    const results = await Promise.all(weeks.map((w) => loadStatusForWeek(w)));
    const map = new Map<number, WeekState>();
    for (const r of results) map.set(r.week, r);
    setWeekStates(map);
  }, [weeks, loadStatusForWeek]);

  // Refresh quando muda o range (e ao montar).
  useEffect(() => {
    loadAllStatus();
  }, [loadAllStatus]);

  const startPolling = useCallback(() => {
    if (pollTimer.current) return;
    setPollOn(true);
    pollTimer.current = setInterval(() => loadAllStatus(), 7000);
  }, [loadAllStatus]);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    setPollOn(false);
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // Para auto-parar polling quando tudo está done/failed sem nada a renderizar.
  const aggregated = useMemo(() => {
    let total = 0, done = 0, rendering = 0, failed = 0;
    let planned = 0, missing = 0;
    for (const w of weekStates.values()) {
      if (w.planExists) planned++;
      if (w.missingDays) missing += w.missingDays.length;
      if (w.summary) {
        total += w.summary.total;
        done += w.summary.done;
        rendering += w.summary.rendering;
        failed += w.summary.failed;
      }
    }
    return { total, done, rendering, failed, planned, missing };
  }, [weekStates]);

  useEffect(() => {
    if (pollOn && aggregated.rendering === 0) stopPolling();
  }, [aggregated.rendering, pollOn, stopPolling]);

  const generateAllPlans = useCallback(async () => {
    setBusy("plan");
    setErrors([]);
    const collected: string[] = [];
    try {
      for (const week of weeks) {
        const r = await fetch("/api/admin/weekly/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ week, year, brands: [brand] }),
        });
        const j = await r.json();
        if (!r.ok) {
          collected.push(`W${week}: ${j.erro || `HTTP ${r.status}`}`);
          continue;
        }
        if (j.errors?.length) {
          collected.push(
            ...j.errors.map((e: { message: string }) => `W${week}: ${e.message}`),
          );
        }
        if (Array.isArray(j.loranneSkippedAlbums) && j.loranneSkippedAlbums.length > 0) {
          collected.push(
            `W${week}: ℹ Álbuns sem MP3 (ignorados): ${j.loranneSkippedAlbums.join(", ")}`,
          );
        }
      }
      if (collected.length > 0) setErrors(collected);
      await loadAllStatus();
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setBusy(null);
    }
  }, [weeks, year, brand, loadAllStatus]);

  const dispatchAll = useCallback(
    async (rerenderAll = false) => {
      setBusy(rerenderAll ? "rerender-all" : "dispatch");
      setErrors([]);
      const collected: string[] = [];
      try {
        for (const week of weeks) {
          const r = await fetch("/api/admin/weekly/dispatch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ week, year, brands: [brand], rerenderAll }),
          });
          const j = await r.json();
          if (!r.ok) {
            collected.push(`W${week}: ${j.erro || `HTTP ${r.status}`}`);
          }
        }
        if (collected.length > 0) setErrors(collected);
        await loadAllStatus();
        startPolling();
      } catch (e) {
        setErrors([(e as Error).message]);
      } finally {
        setBusy(null);
      }
    },
    [weeks, year, brand, loadAllStatus, startPolling],
  );

  const packageRange = useCallback(async () => {
    setBusy("package");
    setErrors([]);
    setZipOutput(null);
    try {
      // Range exacto de datas — exclui dias fora do range que possam estar
      // nos planos das semanas-borda (ex: Oct 10-20 cobre W41, mas W41
      // começa Oct 6; sem filtro, viriam posts de Oct 6-9 também).
      const pad = (n: number) => String(n).padStart(2, "0");
      const startDate = `${year}-${pad(month)}-${pad(startDay)}`;
      const endDate = `${year}-${pad(month)}-${pad(endDay)}`;
      const r = await fetch("/api/admin/weekly/range/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year, weeks, brands: [brand],
          startDate, endDate,
          ...(packDays && packDays.length > 0 ? { days: packDays } : {}),
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || `HTTP ${r.status}`);
      const out = j[brand];
      if (out?.erro) throw new Error(out.erro);
      if (out?.url) {
        setZipOutput({
          url: out.url,
          zipName: out.zipName,
          totalPosts: out.totalPosts,
          perWeek: out.perWeek || [],
        });
      }
    } catch (e) {
      setErrors([(e as Error).message]);
    } finally {
      setBusy(null);
    }
  }, [year, month, startDay, endDay, weeks, brand, packDays]);

  const planExists = aggregated.planned > 0;

  return (
    <section className="space-y-3 rounded-lg border border-escola-border bg-escola-bg-card p-4">
      <div>
        <h2 className="font-serif text-lg text-escola-creme">
          Bulk por período · {brandLabel}
        </h2>
        <p className="text-xs text-escola-creme-50">
          Escolhe o intervalo de dias. O sistema calcula as semanas ISO
          cobertas, gera/dispacha por semana e empacota um ZIP único com
          1 CSV Metricool por semana (drag-drop sequencial).
        </p>
      </div>

      {/* Range inputs */}
      <div className="flex flex-wrap items-end gap-2 rounded border border-escola-border bg-escola-card/40 p-3">
        <label className="flex flex-col gap-1 text-xs text-escola-creme-50">
          Ano
          <input
            type="number" min={2025} max={2030} value={year}
            onChange={(e) => {
              const y = Number(e.target.value);
              setYear(y);
              setEndDay(Math.min(endDay, daysInMonth(y, month)));
            }}
            className="w-20 rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-escola-creme-50">
          Mês
          <select
            value={month}
            onChange={(e) => {
              const m = Number(e.target.value);
              setMonth(m);
              setStartDay(1);
              setEndDay(daysInMonth(year, m));
            }}
            className="rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
          >
            {MESES_PT.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-escola-creme-50">
          Dia início
          <input
            type="number" min={1} max={daysInMonth(year, month)} value={startDay}
            onChange={(e) =>
              setStartDay(Math.max(1, Math.min(daysInMonth(year, month), Number(e.target.value))))
            }
            className="w-16 rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-escola-creme-50">
          Dia fim
          <input
            type="number" min={startDay} max={daysInMonth(year, month)} value={endDay}
            onChange={(e) =>
              setEndDay(Math.max(startDay, Math.min(daysInMonth(year, month), Number(e.target.value))))
            }
            className="w-16 rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
          />
        </label>
        <div className="text-xs text-escola-creme-50">
          → cobre <strong className="text-escola-creme">{weeks.length}</strong> semana(s) ISO
          ({weeks.map((w) => `W${w}`).join(", ")}), {dayCount} dia(s).
        </div>
      </div>

      {/* Actions row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={generateAllPlans}
          disabled={busy !== null}
          className="rounded border border-escola-dourado bg-escola-dourado/10 px-3 py-1 text-xs font-semibold text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
          title={`Itera /api/admin/weekly/plan para cada uma das ${weeks.length} semana(s).`}
        >
          {busy === "plan" ? "..." : `1. Gerar planos (${weeks.length})`}
        </button>
        <button
          onClick={() => dispatchAll(false)}
          disabled={busy !== null || !planExists}
          className="rounded border border-escola-dourado bg-escola-dourado/10 px-3 py-1 text-xs font-semibold text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
        >
          {busy === "dispatch" ? "..." : "2. Dispatch novos"}
        </button>
        <button
          onClick={() => dispatchAll(true)}
          disabled={busy !== null || !planExists}
          className="rounded border border-escola-coral/40 bg-escola-coral/10 px-3 py-1 text-xs font-semibold text-escola-coral hover:bg-escola-coral/20 disabled:opacity-50"
          title="Reseta TODOS os renderJobs em todas as semanas do range e re-dispatcha."
        >
          {busy === "rerender-all" ? "..." : "↻ Re-render tudo (range)"}
        </button>
        <button
          onClick={packageRange}
          disabled={busy !== null || !planExists}
          className="rounded border border-escola-dourado bg-escola-dourado/10 px-3 py-1 text-xs font-semibold text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-50"
          title={packDays && packDays.length > 0
            ? `Empacotar apenas ${packDays.join("+")} (zip parcial; 1 CSV por semana com esses dias).`
            : "Empacotar o range inteiro: 1 ZIP com 1 CSV por semana."}
        >
          {busy === "package"
            ? "..."
            : packDays && packDays.length > 0
              ? `3. Empacotar mês (${packDays.join("+")})`
              : "3. Empacotar mês"}
        </button>
        {/* Chips de dia para filtrar (mesmo padrão do panel semanal). */}
        <div className="flex items-center gap-0.5 rounded border border-escola-dourado/20 bg-escola-creme/5 px-1.5 py-0.5">
          <span className="mr-1 text-[10px] uppercase tracking-wide text-escola-creme-50">só:</span>
          {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((d) => {
            const on = packDays?.includes(d) ?? false;
            return (
              <button
                key={d}
                onClick={() => {
                  setPackDays((prev) => {
                    const set = new Set(prev ?? []);
                    if (set.has(d)) set.delete(d);
                    else set.add(d);
                    const arr = [...set];
                    return arr.length > 0 ? arr : null;
                  });
                }}
                disabled={busy !== null}
                className={`rounded px-1 py-0.5 text-[10px] font-mono uppercase transition disabled:opacity-50 ${
                  on ? "bg-escola-dourado/30 text-escola-dourado" : "text-escola-creme-50 hover:bg-escola-creme/10"
                }`}
                title={on ? `Remover ${d}` : `Filtrar a ${d}`}
              >
                {d}
              </button>
            );
          })}
          {packDays && packDays.length > 0 && (
            <button
              onClick={() => setPackDays(null)}
              disabled={busy !== null}
              className="ml-1 rounded px-1 py-0.5 text-[10px] text-escola-creme-50 hover:bg-escola-creme/10 disabled:opacity-50"
              title="Limpar filtro"
            >
              ✕
            </button>
          )}
        </div>
        {pollOn && <span className="text-xs text-escola-creme-50">⏱ polling…</span>}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-0.5 rounded border border-red-700/40 bg-red-950/30 p-2 text-xs text-red-300">
          {errors.map((e, i) => <div key={i}>✗ {e}</div>)}
        </div>
      )}

      {/* Aggregated summary */}
      {aggregated.total > 0 && (
        <div className="rounded border border-escola-border bg-escola-card/40 p-3 text-xs">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold text-escola-creme">Progresso agregado</span>
            <span className="text-escola-creme-50">
              {aggregated.done}/{aggregated.total} prontos
              {aggregated.rendering > 0 && ` · ${aggregated.rendering} a renderizar`}
              {aggregated.failed > 0 && ` · ${aggregated.failed} falhados`}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-escola-border">
            <div
              className="h-full rounded-full bg-escola-dourado"
              style={{ width: `${Math.round((aggregated.done / Math.max(1, aggregated.total)) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Per-week table + accordion para editar cada semana */}
      {weeks.length > 0 && (
        <div className="overflow-x-auto rounded border border-escola-border bg-escola-card/40">
          <table className="w-full text-[11px] text-escola-creme-50">
            <thead className="text-escola-creme">
              <tr className="border-b border-escola-border">
                <th className="px-2 py-1.5 text-left">Semana</th>
                <th className="px-2 py-1.5 text-left">Plano</th>
                <th className="px-2 py-1.5 text-left">Posts</th>
                <th className="px-2 py-1.5 text-left">Render</th>
                <th className="px-2 py-1.5 text-left">Notas</th>
                <th className="px-2 py-1.5 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => {
                const s = weekStates.get(w);
                const isOpen = expandedWeeks.has(w);
                return (
                  <Fragment key={w}>
                    <tr className="border-t border-escola-border/30">
                      <td className="px-2 py-1 font-mono text-escola-creme">W{String(w).padStart(2, "0")}</td>
                      <td className="px-2 py-1">
                        {s?.planExists ? (
                          <span className="text-emerald-300">✓ gerado</span>
                        ) : (
                          <span className="text-escola-creme-50">— sem plano</span>
                        )}
                      </td>
                      <td className="px-2 py-1">{s?.posts ?? 0}</td>
                      <td className="px-2 py-1">
                        {s?.summary ? (
                          <span>
                            {s.summary.done}/{s.summary.total}
                            {s.summary.rendering > 0 && (
                              <span className="ml-1 text-amber-300">· {s.summary.rendering} a render</span>
                            )}
                            {s.summary.failed > 0 && (
                              <span className="ml-1 text-red-300">· {s.summary.failed} falh</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-escola-creme-50">—</span>
                        )}
                      </td>
                      <td className="px-2 py-1 text-[10px]">
                        {s?.missingDays && s.missingDays.length > 0 && (
                          <span className="text-amber-300">
                            ⚠ faltam {s.missingDays.map((d) => DAY_LABELS[d]).join(", ")}
                          </span>
                        )}
                        {s?.error && (
                          <span className="text-red-300">{s.error}</span>
                        )}
                      </td>
                      <td className="px-2 py-1 text-right">
                        <button
                          onClick={() => toggleWeek(w)}
                          disabled={!s?.planExists}
                          className="rounded border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme hover:border-escola-dourado/40 disabled:opacity-30"
                          title={s?.planExists
                            ? (isOpen ? "Esconder detalhe" : "Ver/editar posts desta semana")
                            : "Gera o plano primeiro"}
                        >
                          {isOpen ? "▾ esconder" : "▸ ver/editar"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && s?.planExists && (
                      <tr className="border-t border-escola-border/30">
                        <td colSpan={6} className="bg-escola-bg-card/40 p-2">
                          <WeeklyBulkPanel
                            brand={brand}
                            week={w}
                            year={year}
                            embedded
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ZIP output */}
      {zipOutput && (
        <div className="space-y-2 rounded border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-emerald-300">📦 Pacote pronto:</span>
            <code className="text-escola-creme">{zipOutput.zipName}</code>
            <span className="text-escola-creme-50">· {zipOutput.totalPosts} posts</span>
          </div>
          <a
            href={zipOutput.url}
            target="_blank"
            rel="noreferrer"
            download={zipOutput.zipName}
            className="inline-block rounded border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20"
          >
            ↓ Download ZIP
          </a>
          <div className="text-[10px] text-escola-creme-50">
            Conteúdo: 1 pasta W&lt;NN&gt;/ por semana com metricool.csv +
            posts.json + README.txt. Importa cada CSV separadamente em
            Metricool &gt; Planning &gt; Calendar &gt; Import CSV.
          </div>
          {zipOutput.perWeek.some((w) => w.skipped) && (
            <div className="text-[10px] text-amber-300">
              Semanas puladas:{" "}
              {zipOutput.perWeek
                .filter((w) => w.skipped)
                .map((w) => `W${w.week} (${w.skipReason})`)
                .join("; ")}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
