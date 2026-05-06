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
  dispatchedAt?: number;
};

type LiveStatus = {
  status: "queued" | "running" | "done" | "error" | "not_found" | "timeout";
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

  // Faixa AG do curso: a UI mostra a actual + permite escolher outra
  // antes de disparar o render.
  const [tracks, setTracks] = useState<Array<{ name: string; url: string }>>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [defaultTrack, setDefaultTrack] = useState<string | null>(null);
  const [trackSaving, setTrackSaving] = useState(false);
  const [playingName, setPlayingName] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Carrega faixas + default actual ao montar
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [tr, df] = await Promise.all([
          fetch("/api/admin/music/list-album?album=ancient-ground"),
          fetch(`/api/admin/aulas/course-defaults?slug=${slug}`),
        ]);
        const trJ = await tr.json();
        const dfJ = await df.json();
        if (!alive) return;
        setTracks(trJ.tracks ?? []);
        setDefaultTrack(dfJ.defaults?.agTrack ?? null);
      } finally {
        if (alive) setTracksLoading(false);
      }
    })();
    return () => {
      alive = false;
      audioRef.current?.pause();
    };
  }, [slug]);

  function togglePlay(t: { name: string; url: string }) {
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

  async function escolherFaixa(name: string) {
    setTrackSaving(true);
    try {
      const r = await fetch("/api/admin/aulas/course-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          defaults: { agTrack: name },
        }),
      });
      if (!r.ok) throw new Error("save failed");
      setDefaultTrack(name);
    } finally {
      setTrackSaving(false);
    }
  }

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
      const now = Date.now();
      const stamped: Job[] = (j.jobs ?? []).map((job) => ({
        ...job,
        dispatchedAt: job.status === "dispatched" ? now : undefined,
      }));
      setJobs(stamped);
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
      .filter((j) => {
        if (j.status === "error") return true;
        if (j.status === "dispatched" && j.jobId) {
          const live = liveByJob.get(j.jobId);
          return live?.status === "error" || live?.status === "timeout";
        }
        return false;
      })
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

    // Limite após o qual um job preso em queued/running é considerado
    // morto (workflow GitHub Actions falhou em step antes do render.mjs
    // poder escrever 'error' no result.json). Render típico = 3-5min,
    // 10min é largo.
    const STUCK_TIMEOUT_MS = 10 * 60 * 1000;

    async function tick() {
      const updates = await Promise.all(
        dispatched.map(async (j) => {
          const current = liveByJob.get(j.jobId!);
          if (current && (current.status === "done" || current.status === "error" || current.status === "timeout")) {
            return null; // terminado
          }

          // Timeout: se passou tempo demais em queued/running, presumir morto
          const dispatchedAt = j.dispatchedAt ?? Date.now();
          const ageMs = Date.now() - dispatchedAt;
          if (ageMs > STUCK_TIMEOUT_MS) {
            return [
              j.jobId!,
              {
                status: "timeout" as const,
                error: `Job em queued/running há ${Math.round(ageMs / 60000)}min — workflow GitHub Actions provavelmente falhou em step antes do render. Tenta novamente.`,
              } satisfies LiveStatus,
            ] as const;
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
    else if (live?.status === "timeout") counts.error++;
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

      {/* Painel de escolha da faixa AG do curso — pré-condição do render. */}
      <div className="mt-6 rounded-xl border border-escola-border bg-escola-card p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-escola-creme">
            🎵 Faixa Ancient Ground deste curso
          </h2>
          <span className="text-[11px] text-escola-creme-50">
            {trackSaving && "A guardar…"}
            {!trackSaving && defaultTrack && (
              <>activa: <span className="text-escola-creme">{defaultTrack}</span></>
            )}
            {!trackSaving && !defaultTrack && (
              <span className="text-red-400">nenhuma escolhida</span>
            )}
          </span>
        </div>
        <p className="mb-3 text-[11px] text-escola-creme-50">
          A faixa por defeito do curso vai para todas as 24 sub-aulas. Em
          sub-aulas individuais podes ainda fazer override no editor contextual.
        </p>
        {tracksLoading && (
          <p className="text-xs text-escola-creme-50">A carregar faixas…</p>
        )}
        {!tracksLoading && tracks.length === 0 && (
          <p className="text-xs text-escola-creme-50">
            Nenhuma faixa em <code>audios/albums/ancient-ground/</code>.
          </p>
        )}
        {!tracksLoading && tracks.length > 0 && (
          <div className="max-h-72 space-y-1 overflow-y-auto rounded border border-escola-border bg-escola-bg p-2">
            {tracks.map((t) => {
              const selected = defaultTrack === t.name;
              return (
                <label
                  key={t.name}
                  className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
                    selected ? "bg-escola-dourado/10" : "hover:bg-white/5"
                  }`}
                >
                  <input
                    type="radio"
                    name="ag-track-bulk"
                    checked={selected}
                    onChange={() => void escolherFaixa(t.name)}
                    className="h-4 w-4 shrink-0 accent-escola-dourado"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      togglePlay(t);
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-escola-border text-[11px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                    title={playingName === t.name ? "Pausa" : "Tocar amostra"}
                  >
                    {playingName === t.name ? "⏸" : "▶"}
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
          </div>
        )}
      </div>

      <div className="mt-6 mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={lancarTodos}
          disabled={dispatching || !defaultTrack}
          className="rounded-lg bg-escola-dourado px-4 py-2 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90 disabled:opacity-40"
          title={!defaultTrack ? "Escolhe uma faixa AG primeiro" : ""}
        >
          {dispatching
            ? "A despachar…"
            : !defaultTrack
              ? "Escolhe uma faixa AG primeiro"
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
                    if (live?.status === "timeout") return { label: "✗ workflow morreu (timeout)", color: "text-red-400" };
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
