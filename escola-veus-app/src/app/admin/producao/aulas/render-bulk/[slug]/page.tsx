"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getCourseBySlug } from "@/data/courses";

/**
 * Página de render em batch — dispara o render MP4 para todas as
 * sub-aulas do curso e mostra tabela com status individual + polling
 * automático até cada job ficar "done" ou "error".
 */

type JobStatus = "dispatched" | "skipped_no_track" | "skipped_no_script" | "error";
type Job = {
  module: number;
  sub: string;
  jobId: string | null;
  status: JobStatus;
  error?: string;
};

type LiveStatus = {
  status: "queued" | "running" | "done" | "error" | "not_found";
  videoUrl?: string | null;
  error?: string | null;
};

export default function RenderBulkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const course = getCourseBySlug(slug);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [liveByJob, setLiveByJob] = useState<Map<string, LiveStatus>>(new Map());
  const [dispatching, setDispatching] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [excludeM1A, setExcludeM1A] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function lancar(only?: Array<{ module: number; sub: string }>) {
    setDispatching(true);
    setRequestError(null);
    setJobs([]);
    setLiveByJob(new Map());
    try {
      const r = await fetch("/api/admin/aulas/render-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, only }),
      });
      const text = await r.text();
      let j: { jobs?: Job[]; erro?: string };
      try {
        j = JSON.parse(text);
      } catch {
        throw new Error(`HTTP ${r.status}: ${text.slice(0, 120)}`);
      }
      if (!r.ok) throw new Error(j.erro ?? `HTTP ${r.status}`);
      setJobs(j.jobs ?? []);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : String(err));
    } finally {
      setDispatching(false);
    }
  }

  function lancarTodos() {
    if (!course) return;
    const all = course.modules.flatMap((m) =>
      m.subLessons.map((sl) => ({ module: m.number, sub: sl.letter.toLowerCase() })),
    );
    const filtered = excludeM1A
      ? all.filter((s) => !(s.module === 1 && s.sub === "a"))
      : all;
    if (
      !confirm(
        `Vais despachar ${filtered.length} renders MP4 (cada um leva 5-10 min em GitHub Actions; correm em paralelo).\n\nContinuar?`,
      )
    )
      return;
    void lancar(filtered);
  }

  function lancarSoErros() {
    const failedSubs = jobs
      .filter((j) => j.status === "error" || (j.status === "dispatched" && j.jobId && liveByJob.get(j.jobId)?.status === "error"))
      .map((j) => ({ module: j.module, sub: j.sub }));
    if (failedSubs.length === 0) return;
    void lancar(failedSubs);
  }

  // Polling: a cada 5s, vai a /render-status para cada job dispatched que
  // ainda não está done/error.
  useEffect(() => {
    if (jobs.length === 0) return;
    const dispatched = jobs.filter((j) => j.status === "dispatched" && j.jobId);
    if (dispatched.length === 0) return;

    async function tick() {
      const updates = await Promise.all(
        dispatched.map(async (j) => {
          const current = liveByJob.get(j.jobId!);
          if (current && (current.status === "done" || current.status === "error")) {
            return null; // já terminado, não voltar a perguntar
          }
          try {
            const r = await fetch(`/api/admin/aulas/render-status?jobId=${j.jobId}`);
            if (!r.ok) return null;
            const data = (await r.json()) as LiveStatus;
            return [j.jobId!, data] as const;
          } catch {
            return null;
          }
        }),
      );
      setLiveByJob((prev) => {
        const next = new Map(prev);
        for (const u of updates) {
          if (u) next.set(u[0], u[1]);
        }
        return next;
      });
    }

    void tick();
    pollRef.current = setInterval(tick, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm text-escola-creme">Curso não encontrado.</p>
      </div>
    );
  }

  const totalSubs = course.modules.reduce((n, m) => n + m.subLessons.length, 0);

  // Estatísticas live
  const counts = {
    queued: 0,
    running: 0,
    done: 0,
    error: 0,
    skipped: 0,
  };
  for (const j of jobs) {
    if (j.status === "skipped_no_track" || j.status === "skipped_no_script") {
      counts.skipped++;
      continue;
    }
    if (j.status === "error") {
      counts.error++;
      continue;
    }
    const live = j.jobId ? liveByJob.get(j.jobId) : undefined;
    if (live?.status === "done") counts.done++;
    else if (live?.status === "error") counts.error++;
    else if (live?.status === "running") counts.running++;
    else counts.queued++;
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <Link
        href="/admin/producao/aulas"
        className="text-xs text-escola-creme-50 hover:text-escola-creme"
      >
        ← Aulas
      </Link>
      <h1 className="mt-2 font-serif text-2xl text-escola-creme">
        Render bulk · {course.title}
      </h1>
      <p className="mt-1 text-sm text-escola-creme-50">
        Dispara o render MP4 para várias sub-aulas em paralelo (GitHub Actions
        · FFmpeg). {totalSubs} sub-aulas no total.
      </p>

      <div className="mt-6 mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={lancarTodos}
          disabled={dispatching}
          className="rounded-lg bg-escola-dourado px-4 py-2 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {dispatching
            ? "A despachar…"
            : `🎬 Renderizar ${excludeM1A ? totalSubs - 1 : totalSubs} sub-aulas`}
        </button>
        <label className="flex items-center gap-1.5 text-[11px] text-escola-creme-50">
          <input
            type="checkbox"
            checked={excludeM1A}
            onChange={(e) => setExcludeM1A(e.target.checked)}
          />
          Excluir M1·A (já aprovado / já renderizado)
        </label>
        {jobs.length > 0 && counts.error > 0 && (
          <button
            onClick={lancarSoErros}
            disabled={dispatching}
            className="rounded border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-40"
          >
            ↻ Re-tentar só os {counts.error} com erro
          </button>
        )}
      </div>

      {requestError && (
        <div className="mb-4 rounded border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-300">
          {requestError}
        </div>
      )}

      {jobs.length > 0 && (
        <>
          <div className="mb-3 flex flex-wrap gap-3 text-[11px] text-escola-creme-50">
            <span>{counts.done} ✓ done</span>
            <span>{counts.running} ⚙ a renderizar</span>
            <span>{counts.queued} ⌛ na fila</span>
            <span>{counts.error} ✗ erro</span>
            <span>{counts.skipped} ⊘ saltado</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-escola-border">
            <table className="w-full text-xs">
              <thead className="bg-escola-card text-escola-creme-50">
                <tr>
                  <th className="px-3 py-2 text-left">Sub-aula</th>
                  <th className="px-3 py-2 text-left">Estado</th>
                  <th className="px-3 py-2 text-left">Job</th>
                  <th className="px-3 py-2 text-left">Resultado</th>
                </tr>
              </thead>
              <tbody className="bg-escola-bg">
                {jobs.map((j) => {
                  const live = j.jobId ? liveByJob.get(j.jobId) : undefined;
                  const finalStatus = (() => {
                    if (j.status === "skipped_no_track") return { label: "⊘ sem faixa AG", color: "text-escola-creme-50" };
                    if (j.status === "skipped_no_script") return { label: "⊘ sem script", color: "text-escola-creme-50" };
                    if (j.status === "error") return { label: "✗ falhou ao despachar", color: "text-red-400" };
                    if (live?.status === "done") return { label: "✓ pronto", color: "text-escola-dourado" };
                    if (live?.status === "error") return { label: "✗ erro no render", color: "text-red-400" };
                    if (live?.status === "running") return { label: "⚙ a renderizar…", color: "text-escola-creme" };
                    return { label: "⌛ na fila", color: "text-escola-creme-50" };
                  })();
                  return (
                    <tr key={`${j.module}-${j.sub}`} className="border-t border-escola-border">
                      <td className="px-3 py-2 text-escola-creme">
                        M{j.module}·{j.sub.toUpperCase()}
                      </td>
                      <td className={`px-3 py-2 ${finalStatus.color}`}>{finalStatus.label}</td>
                      <td className="px-3 py-2 font-mono text-[10px] text-escola-creme-50">
                        {j.jobId ? j.jobId.slice(-12) : "—"}
                        {j.error && <div className="text-red-400">{j.error.slice(0, 80)}</div>}
                        {live?.error && <div className="text-red-400">{live.error.slice(0, 80)}</div>}
                      </td>
                      <td className="px-3 py-2">
                        {live?.videoUrl ? (
                          <a
                            href={live.videoUrl}
                            target="_blank"
                            rel="noopener"
                            className="text-escola-dourado hover:underline"
                          >
                            abrir MP4 ↗
                          </a>
                        ) : (
                          <Link
                            href={`/admin/producao/aulas/preview/${slug}/${j.module}/${j.sub}`}
                            className="text-escola-creme-50 hover:text-escola-creme"
                          >
                            preview ↗
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {jobs.length === 0 && !dispatching && (
        <p className="text-xs text-escola-creme-50">
          Antes de despachar, certifica-te que tens uma faixa AG por defeito do
          curso (vai a qualquer preview, painel Som, &ldquo;Guardar X como faixa por
          defeito do curso&rdquo;). Sub-aulas sem faixa configurada são saltadas.
        </p>
      )}
    </div>
  );
}
