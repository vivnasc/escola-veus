"use client";

import { useCallback, useEffect, useState } from "react";

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Devolve a data actual no fuso de Maputo (UTC+2, CAT). */
function todayMaputo(): { year: number; month: number; day: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Maputo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { year: get("year"), month: get("month"), day: get("day") };
}

type Status = "queued" | "running" | "done" | "failed" | "missing" | "error" | "unknown";

interface PlanEntry {
  day: number;
  date: string;
  dateLabel: string;
  phrase: string;
  phraseId?: string;
  phraseTheme?: string;
  motionName: string;
  motionUrl: string;
  audioUrl: string | null;
  mood?: string | null;
}

interface JobStatus {
  day: number;
  date: string;
  jobId: string;
  phraseText?: string;
  motionName?: string;
  audioUrl?: string | null;
  status: Status;
  progress: number;
  videoUrl?: string | null;
  error?: string | null;
  message?: string | null;
}

interface BatchStatus {
  batchId: string;
  year: number;
  month: number;
  jobs: JobStatus[];
  summary: {
    total: number;
    queued: number;
    running: number;
    done: number;
    failed: number;
    missing: number;
  };
}

type Phase = "config" | "plan" | "submitted";

export function BulkMonthPanel() {
  const t = todayMaputo();
  const [year, setYear] = useState<number>(t.year);
  const [month, setMonth] = useState<number>(t.month);
  const [startDay, setStartDay] = useState<number>(t.day);
  const [endDay, setEndDay] = useState<number>(daysInMonth(t.year, t.month));
  const [phraseStartIndex, setPhraseStartIndex] = useState<number>(0);
  const [motionStartIndex, setMotionStartIndex] = useState<number>(0);

  const [phase, setPhase] = useState<Phase>("config");
  const [preparing, setPreparing] = useState(false);
  const [plan, setPlan] = useState<PlanEntry[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [status, setStatus] = useState<BatchStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [packaging, setPackaging] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<number | null>(null);
  const [regenAll, setRegenAll] = useState(false);

  const preparePlan = async () => {
    setPreparing(true);
    setError(null);
    setPlan([]);
    try {
      const res = await fetch("/api/admin/vc-sabia/bulk-month/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month,
          startDay,
          endDay,
          phraseStartIndex,
          motionStartIndex,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro || `HTTP ${res.status}`);
      } else {
        setPlan(json.plan || []);
        setPhase("plan");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPreparing(false);
    }
  };

  const regenPhrase = async (idx: number) => {
    setRegenerating(idx);
    setError(null);
    try {
      const avoidList = plan.map((p) => p.phrase);
      const res = await fetch("/api/admin/vc-sabia/phrase/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avoid: avoidList }),
      });
      const json = await res.json();
      if (res.ok && json.phrase) {
        setPlan((prev) =>
          prev.map((p, i) => (i === idx ? { ...p, phrase: json.phrase } : p))
        );
      } else {
        setError(json.erro || `HTTP ${res.status}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRegenerating(null);
    }
  };

  const updatePhrase = (idx: number, value: string) => {
    setPlan((prev) => prev.map((p, i) => (i === idx ? { ...p, phrase: value } : p)));
  };

  const regenAllPhrases = async () => {
    if (plan.length === 0) return;
    setRegenAll(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/vc-sabia/phrase/batch-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: plan.length,
          avoid: plan.map((p) => p.phrase),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro || `HTTP ${res.status}`);
      } else if (Array.isArray(json.phrases)) {
        const fresh: { phrase?: string; theme?: string }[] = json.phrases;
        setPlan((prev) =>
          prev.map((p, i) => {
            const f = fresh[i];
            if (!f || !f.phrase) return p;
            return { ...p, phrase: f.phrase, phraseTheme: f.theme || p.phraseTheme };
          })
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRegenAll(false);
    }
  };

  const submitPlan = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/vc-sabia/bulk-month", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, startDay, endDay, plan }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro || `HTTP ${res.status}`);
      } else {
        setBatchId(json.batchId);
        setPhase("submitted");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const fetchStatus = useCallback(async () => {
    if (!batchId) return;
    try {
      const res = await fetch(
        `/api/admin/vc-sabia/bulk-status?batchId=${encodeURIComponent(batchId)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      setStatus(await res.json());
    } catch {
      /* ignore */
    }
  }, [batchId]);

  useEffect(() => {
    if (!batchId) return;
    fetchStatus();
    const t = setInterval(fetchStatus, 7000);
    return () => clearInterval(t);
  }, [batchId, fetchStatus]);

  const pkg = async () => {
    if (!batchId) return;
    setPackaging(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/vc-sabia/bulk-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro || `HTTP ${res.status}`);
      } else {
        setZipUrl(json.zipUrl);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPackaging(false);
    }
  };

  const reset = () => {
    setPhase("config");
    setPlan([]);
    setBatchId(null);
    setStatus(null);
    setZipUrl(null);
    setError(null);
  };

  const allDone =
    status && status.summary.done === status.summary.total && status.summary.total > 0;

  return (
    <section className="space-y-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4">
      <div>
        <h2 className="font-serif text-lg text-emerald-300">
          Bulk mensal · Pacote Metricool
        </h2>
        <p className="text-xs text-escola-creme-50">
          {phase === "config" &&
            "Escolhe range, prepara o plano, edita as frases, e só depois renderizas tudo em batch."}
          {phase === "plan" &&
            "Revê + edita o plano. Cada frase é editável. Clica ✨ para Claude regenerar a frase do dia (sem repetir as outras)."}
          {phase === "submitted" &&
            "Renders a correr no GitHub Actions em paralelo. Quando todos acabarem podes empacotar."}
        </p>
      </div>

      {error && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* STEP 1: config */}
      {phase === "config" && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-escola-creme-50">
            Ano
            <input
              type="number"
              min={2025}
              max={2030}
              value={year}
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
                setEndDay(daysInMonth(year, m));
                setStartDay(1);
              }}
              className="rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
            >
              {MESES_PT.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-escola-creme-50">
            Dia início
            <input
              type="number"
              min={1}
              max={daysInMonth(year, month)}
              value={startDay}
              onChange={(e) =>
                setStartDay(Math.max(1, Math.min(daysInMonth(year, month), Number(e.target.value))))
              }
              className="w-16 rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-escola-creme-50">
            Dia fim
            <input
              type="number"
              min={startDay}
              max={daysInMonth(year, month)}
              value={endDay}
              onChange={(e) =>
                setEndDay(Math.max(startDay, Math.min(daysInMonth(year, month), Number(e.target.value))))
              }
              className="w-16 rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-escola-creme-50" title="Índice da frase do seed para o dia 1. Útil para continuar onde paraste num bulk anterior.">
            Frase start
            <input
              type="number"
              min={0}
              value={phraseStartIndex}
              onChange={(e) => setPhraseStartIndex(Math.max(0, Number(e.target.value)))}
              className="w-16 rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-escola-creme-50" title="Índice do motion da library para o dia 1.">
            Motion start
            <input
              type="number"
              min={0}
              value={motionStartIndex}
              onChange={(e) => setMotionStartIndex(Math.max(0, Number(e.target.value)))}
              className="w-16 rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
            />
          </label>
          <button
            onClick={preparePlan}
            disabled={preparing || endDay < startDay}
            className="rounded-md border border-emerald-500/60 bg-emerald-500/15 px-4 py-2 text-xs text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
          >
            {preparing
              ? "A preparar..."
              : `📋 Preparar plano (${endDay - startDay + 1} dias)`}
          </button>
        </div>
      )}

      {/* STEP 2: plan edit */}
      {phase === "plan" && (
        <>
          {plan.some((p) => !p.audioUrl) && (
            <div className="rounded border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-200">
              ⚠ {plan.filter((p) => !p.audioUrl).length} dia(s) sem áudio. Vai à
              Motion library (atribui mood a estes motions) ou à Áudio library
              (gera/activa áudio para o mood). Ou ignora e renderiza sem som.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={regenAllPhrases}
              disabled={regenAll}
              className="rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
              title={`Claude regenera as ${plan.length} frases todas de uma vez, no padrão 'X em natureza. Tu também. Confia em Y.'`}
            >
              {regenAll
                ? "Claude a gerar..."
                : `✨ Regenerar TODAS com Claude (${plan.length})`}
            </button>
            <span className="text-[11px] text-escola-creme-50">
              Garante padrão "Sabias que... + frase de natureza"
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-escola-creme-50">
              <thead className="text-escola-creme">
                <tr>
                  <th className="px-2 py-1 text-left">Dia</th>
                  <th className="px-2 py-1 text-left">Frase (editável)</th>
                  <th className="px-2 py-1 text-left">Motion</th>
                  <th className="px-2 py-1 text-left">Áudio</th>
                </tr>
              </thead>
              <tbody>
                {plan.map((p, i) => (
                  <tr key={p.day} className="border-t border-escola-border/30">
                    <td className="px-2 py-1 align-top">
                      <div>{p.day}</div>
                      <div className="text-[9px] text-escola-creme-50">{p.date}</div>
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex items-start gap-1">
                        <textarea
                          value={p.phrase}
                          onChange={(e) => updatePhrase(i, e.target.value)}
                          rows={2}
                          className="flex-1 rounded border border-escola-border bg-escola-card px-2 py-1 text-[11px] text-escola-creme"
                        />
                        <button
                          onClick={() => regenPhrase(i)}
                          disabled={regenerating === i}
                          className="shrink-0 rounded border border-emerald-500/60 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                          title="Claude regenera esta frase (evita repetir as outras)"
                        >
                          {regenerating === i ? "…" : "✨"}
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-1 align-top">
                      {p.motionName.slice(0, 18)}…
                    </td>
                    <td className="px-2 py-1 align-top">
                      {p.audioUrl ? p.mood : <span className="text-red-300">⚠ sem áudio</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={submitPlan}
              disabled={submitting}
              className="rounded-md border border-emerald-500/60 bg-emerald-500/15 px-4 py-2 text-xs text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
            >
              {submitting
                ? "A despachar..."
                : `▶ Confirmar e gerar ${plan.length} renders`}
            </button>
            <button
              onClick={reset}
              className="rounded-md border border-escola-border bg-escola-card/40 px-3 py-1.5 text-xs text-escola-creme-50 hover:text-escola-creme"
            >
              ↺ Voltar
            </button>
          </div>
        </>
      )}

      {/* STEP 3: status */}
      {phase === "submitted" && status && (
        <>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-escola-creme-50">Batch:</span>
            <code className="text-escola-creme">{batchId}</code>
            <span className="text-escola-creme-50">·</span>
            <span className="text-emerald-300">
              {status.summary.done}/{status.summary.total} feitos
            </span>
            {status.summary.running > 0 && (
              <span className="text-amber-300">· {status.summary.running} a renderizar</span>
            )}
            {status.summary.queued > 0 && (
              <span className="text-escola-creme-50">· {status.summary.queued} em fila</span>
            )}
            {status.summary.failed > 0 && (
              <span className="text-red-300">· {status.summary.failed} falharam</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-escola-creme-50">
              <thead className="text-escola-creme">
                <tr>
                  <th className="px-2 py-1 text-left">Dia</th>
                  <th className="px-2 py-1 text-left">Frase</th>
                  <th className="px-2 py-1 text-left">Estado</th>
                  <th className="px-2 py-1 text-left">MP4</th>
                </tr>
              </thead>
              <tbody>
                {status.jobs.map((j) => (
                  <tr key={j.jobId} className="border-t border-escola-border/30">
                    <td className="px-2 py-1">{j.day}</td>
                    <td className="px-2 py-1">
                      {j.phraseText ? j.phraseText.slice(0, 60) + "…" : "—"}
                    </td>
                    <td className="px-2 py-1">
                      <StatusBadge status={j.status} progress={j.progress} />
                    </td>
                    <td className="px-2 py-1">
                      {j.videoUrl ? (
                        <a
                          href={j.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="text-emerald-300 hover:underline"
                        >
                          ↓ baixar
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={pkg}
              disabled={!allDone || packaging}
              className="rounded-md border border-emerald-500/60 bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
            >
              {packaging
                ? "A empacotar..."
                : allDone
                ? "📦 Gerar pacote Metricool (ZIP)"
                : `📦 Pacote disponível quando os ${status.summary.total} estiverem feitos`}
            </button>
            {zipUrl && (
              <a
                href={zipUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="rounded-md border border-emerald-500/60 bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/25"
              >
                ↓ Download ZIP
              </a>
            )}
            <button
              onClick={reset}
              className="rounded-md border border-escola-border bg-escola-card/40 px-3 py-1.5 text-xs text-escola-creme-50 hover:text-escola-creme"
            >
              ↺ Novo bulk
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function StatusBadge({ status, progress }: { status: Status; progress: number }) {
  const map: Record<Status, { label: string; cls: string }> = {
    queued: { label: "em fila", cls: "text-escola-creme-50" },
    running: { label: `${progress}%`, cls: "text-amber-300" },
    done: { label: "✓ feito", cls: "text-emerald-300" },
    failed: { label: "✗ falhou", cls: "text-red-300" },
    missing: { label: "?", cls: "text-escola-creme-50" },
    error: { label: "erro", cls: "text-red-300" },
    unknown: { label: "?", cls: "text-escola-creme-50" },
  };
  const m = map[status] || map.unknown;
  return <span className={m.cls}>{m.label}</span>;
}
