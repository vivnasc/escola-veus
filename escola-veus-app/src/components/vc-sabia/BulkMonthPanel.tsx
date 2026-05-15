"use client";

import { useCallback, useEffect, useState } from "react";

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

type Status = "queued" | "running" | "done" | "failed" | "missing" | "error" | "unknown";

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

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function BulkMonthPanel() {
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [startDay, setStartDay] = useState<number>(now.getDate());
  const [endDay, setEndDay] = useState<number>(daysInMonth(now.getFullYear(), now.getMonth() + 1));
  const [batchId, setBatchId] = useState<string | null>(null);
  const [status, setStatus] = useState<BatchStatus | null>(null);
  const [starting, setStarting] = useState(false);
  const [packaging, setPackaging] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setStarting(true);
    setError(null);
    setZipUrl(null);
    try {
      const res = await fetch("/api/admin/vc-sabia/bulk-month", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, startDay, endDay }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro || `HTTP ${res.status}`);
      } else {
        setBatchId(json.batchId);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setStarting(false);
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
      const json = await res.json();
      setStatus(json);
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

  const allDone =
    status && status.summary.done === status.summary.total && status.summary.total > 0;

  return (
    <section className="space-y-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4">
      <div>
        <h2 className="font-serif text-lg text-emerald-300">
          Bulk mensal · Pacote Metricool
        </h2>
        <p className="text-xs text-escola-creme-50">
          Gera todos os MP4s do mês de uma vez (1 por dia), com motion +
          overlay + áudio. Cada render corre em GitHub Actions em paralelo.
          Quando todos terminam, podes empacotar tudo num ZIP com MP4s +
          captions + CSV pronto para Metricool.
        </p>
      </div>

      {!batchId && (
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
          <button
            onClick={start}
            disabled={starting || endDay < startDay}
            className="rounded-md border border-emerald-500/60 bg-emerald-500/15 px-4 py-2 text-xs text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
          >
            {starting
              ? "A despachar..."
              : `▶ Gerar dias ${startDay}-${endDay} de ${MESES_PT[month - 1]} ${year} (${endDay - startDay + 1})`}
          </button>
        </div>
      )}

      {error && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {batchId && status && (
        <>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-escola-creme-50">Batch:</span>
            <code className="text-escola-creme">{batchId}</code>
            <span className="text-escola-creme-50">·</span>
            <span className="text-emerald-300">
              {status.summary.done}/{status.summary.total} feitos
            </span>
            {status.summary.running > 0 && (
              <span className="text-amber-300">
                · {status.summary.running} a renderizar
              </span>
            )}
            {status.summary.queued > 0 && (
              <span className="text-escola-creme-50">
                · {status.summary.queued} em fila
              </span>
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
                  <th className="px-2 py-1 text-left">Motion</th>
                  <th className="px-2 py-1 text-left">Áudio</th>
                  <th className="px-2 py-1 text-left">Estado</th>
                  <th className="px-2 py-1 text-left">MP4</th>
                </tr>
              </thead>
              <tbody>
                {status.jobs.map((j) => (
                  <tr key={j.jobId} className="border-t border-escola-border/30">
                    <td className="px-2 py-1">{j.day}</td>
                    <td className="px-2 py-1">
                      {j.phraseText ? j.phraseText.slice(0, 50) + "…" : "—"}
                    </td>
                    <td className="px-2 py-1">
                      {j.motionName ? j.motionName.slice(0, 18) + "…" : "—"}
                    </td>
                    <td className="px-2 py-1">{j.audioUrl ? "✓" : "—"}</td>
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
              title={
                allDone
                  ? "Cria ZIP com todos os MP4s + Metricool CSV + WhatsApp txt"
                  : "Espera todos os dias terminarem"
              }
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
              onClick={() => {
                setBatchId(null);
                setStatus(null);
                setZipUrl(null);
              }}
              className="rounded-md border border-escola-border bg-escola-card/40 px-3 py-1.5 text-xs text-escola-creme-50 hover:text-escola-creme"
            >
              ↺ Novo mês
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
