"use client";

import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import {
  buildCarouselCaption,
  buildCarouselCsv,
  type CarouselPost,
} from "@/lib/carousel-social/metricool-csv";
import type { Dia, Slide } from "@/lib/carousel-types";

/**
 * Exportador Metricool para colecções dinâmicas (geradas via Claude API
 * a partir do calendário anual). Espelha o exportador estático da Estação
 * dos Véus, mas:
 *  1. Carrega a coleção específica via /api/admin/colecoes/[id]
 *  2. Pré-preenche cada linha com o "veu" (tema) e capa.linha1+linha2 (texto)
 *  3. Filtra render-jobs cujo jobId começa pelo slug da coleção (convenção
 *     {slug}-{timestamp} estabelecida pelo render-submit)
 */

type DiaSemana = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DIAS_PT: Record<DiaSemana, string> = {
  mon: "Segunda",
  tue: "Terça",
  wed: "Quarta",
  thu: "Quinta",
  fri: "Sexta",
  sat: "Sábado",
  sun: "Domingo",
};

const DIAS_ORDEM: DiaSemana[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

type JobVideo = { file: string; url: string; sizeBytes?: number };
type RenderJob = {
  jobId: string;
  status?: string;
  videos?: JobVideo[];
  completedAt?: string;
  campanha?: string;
};

type Colecao = {
  id: string;
  slug: string;
  title: string;
  brief: string;
  dias: Dia[];
};

type DiaRow = {
  dia: DiaSemana;
  date: string;
  time: string;
  texto: string;
  tema: string;
  videoUrl: string;
};

function isoHoje(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function diaDaSemana(iso: string): DiaSemana {
  const [y, m, d] = iso.split("-").map(Number);
  const w = new Date(y, m - 1, d).getDay();
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as DiaSemana[])[w];
}

function diaNumeroFromFile(file: string): number | null {
  const m = file.match(/dia-(\d+)/i);
  return m ? Number(m[1]) : null;
}

/** Extrai um texto-frase forte a partir da capa do dia. */
function textoDoDia(dia: Dia): string {
  const capa = dia.slides.find((s): s is Extract<Slide, { tipo: "capa" }> => s.tipo === "capa");
  if (!capa) return "";
  const lines = [capa.linha1, capa.linha2].filter(Boolean).join(" ");
  return lines.trim();
}

function temaDoDia(dia: Dia): string {
  return dia.veu
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export default function ColecaoMetricoolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [col, setCol] = useState<Colecao | null>(null);
  const [loadingCol, setLoadingCol] = useState(true);
  const [colError, setColError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>(isoHoje());
  const [defaultTime, setDefaultTime] = useState<string>("13:00");
  const [cta, setCta] = useState<string>("Guarda este post para voltares mais tarde 💛");

  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [onlyThisCollection, setOnlyThisCollection] = useState(true);

  const [rows, setRows] = useState<DiaRow[]>([]);

  // Carrega a coleção
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCol(true);
      setColError(null);
      try {
        const res = await fetch(`/api/admin/colecoes/${id}`, { cache: "no-store" });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setColError(json.erro || `Erro ${res.status}`);
          return;
        }
        setCol(json as Colecao);
        // Pré-preenche rows: 1 por dia da coleção (até 7, mapeado para dias da semana)
        const dias = (json.dias as Dia[]) ?? [];
        setRows(
          dias.slice(0, 7).map((dia, i) => ({
            dia: DIAS_ORDEM[i],
            date: addDays(isoHoje(), i),
            time: "13:00",
            texto: textoDoDia(dia),
            tema: temaDoDia(dia),
            videoUrl: "",
          }))
        );
      } catch (e) {
        if (!cancelled) setColError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoadingCol(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Carrega lista de render-jobs
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingJobs(true);
      setJobsError(null);
      try {
        const res = await fetch("/api/admin/carrossel-veus/list-renders");
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setJobsError(json.erro || `Erro ${res.status}`);
        } else {
          setJobs((json.jobs as RenderJob[]) || []);
        }
      } catch (e) {
        if (!cancelled) setJobsError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoadingJobs(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Jobs filtrados (só desta coleção por defeito)
  const jobsForCollection = useMemo(() => {
    if (!col) return jobs;
    if (!onlyThisCollection) return jobs;
    return jobs.filter((j) => j.jobId.startsWith(`${col.slug}-`));
  }, [jobs, col, onlyThisCollection]);

  // Pré-seleciona o job mais recente desta coleção quando ambos carregam
  useEffect(() => {
    if (!selectedJobId && jobsForCollection.length > 0) {
      setSelectedJobId(jobsForCollection[0].jobId);
    }
  }, [jobsForCollection, selectedJobId]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.jobId === selectedJobId) ?? null,
    [jobs, selectedJobId]
  );

  const autoMapFromJob = () => {
    if (!selectedJob?.videos) return;
    setRows((prev) =>
      prev.map((r, i) => {
        const diaNum = i + 1;
        const v = selectedJob.videos!.find(
          (vv) => diaNumeroFromFile(vv.file) === diaNum
        );
        return v ? { ...r, videoUrl: v.url } : r;
      })
    );
  };

  const syncDates = (nextStart: string, nextTime: string) => {
    setRows((prev) =>
      prev.map((r, i) => ({
        ...r,
        dia: diaDaSemana(addDays(nextStart, i)),
        date: addDays(nextStart, i),
        time: r.time === defaultTime ? nextTime : r.time,
      }))
    );
    setStartDate(nextStart);
    setDefaultTime(nextTime);
  };

  const todosMp4: Array<{ jobId: string; file: string; url: string }> = useMemo(
    () =>
      jobsForCollection.flatMap((j) =>
        (j.videos || []).map((v) => ({ jobId: j.jobId, file: v.file, url: v.url }))
      ),
    [jobsForCollection]
  );

  const posts: CarouselPost[] = useMemo(() => {
    return rows
      .map((r) => {
        if (!r.videoUrl || !r.texto.trim()) return null;
        return {
          id: `${r.date}-${r.dia}`,
          date: r.date,
          time: r.time,
          videoUrl: r.videoUrl,
          instagramCaption: buildCarouselCaption({
            texto: r.texto.trim(),
            tema: r.tema.trim() || undefined,
            cta: cta || undefined,
            platform: "instagram",
          }),
          tiktokCaption: buildCarouselCaption({
            texto: r.texto.trim(),
            tema: r.tema.trim() || undefined,
            platform: "tiktok",
          }),
          tiktokTitle: r.texto.trim().slice(0, 80),
        } as CarouselPost;
      })
      .filter((x): x is CarouselPost => x !== null);
  }, [rows, cta]);

  const downloadCsv = () => {
    const csv = buildCarouselCsv(posts);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${col?.slug || "carrossel"}-metricool-${startDate}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loadingCol) {
    return <p className="p-4 text-sm text-escola-creme-50">A carregar coleção…</p>;
  }
  if (colError || !col) {
    return (
      <div className="p-4">
        <p className="mb-2 text-sm text-red-300">Erro: {colError || "coleção não encontrada"}</p>
        <Link href="/admin/producao/colecoes" className="text-xs text-escola-dourado underline">
          ← voltar à lista
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-baseline gap-3 text-xs text-escola-creme-50">
        <Link href={`/admin/producao/colecoes/${col.id}`} className="hover:text-escola-dourado">
          ← {col.title}
        </Link>
        <span>/ metricool CSV</span>
      </div>

      <header className="space-y-2">
        <h1 className="font-serif text-2xl text-escola-dourado">
          {col.title} · CSV Metricool
        </h1>
        <p className="text-sm text-escola-creme-50">
          MP4 1080×1920 por dia (gerados pelo workflow render-carrossel-veus).
          Cada dia da semana produz 2 linhas no CSV: Instagram Reel + TikTok.
          As frases vêm pré-preenchidas da capa de cada dia da coleção —
          edita o que precisares.
        </p>
      </header>

      {/* Selecção de job */}
      <section className="rounded-lg border border-escola-border bg-escola-card p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-lg text-escola-dourado">
            Renders desta coleção
          </h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[11px] text-escola-creme-50">
              <input
                type="checkbox"
                checked={onlyThisCollection}
                onChange={(e) => setOnlyThisCollection(e.target.checked)}
              />
              só desta coleção ({col.slug})
            </label>
            <button
              onClick={autoMapFromJob}
              disabled={!selectedJob}
              className="rounded border border-escola-dourado/60 bg-escola-dourado/10 px-2 py-1 text-xs text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-40"
            >
              Auto-mapear dia 1→Seg…
            </button>
          </div>
        </div>

        {loadingJobs && (
          <div className="text-xs text-escola-creme-50">A carregar lista de renders…</div>
        )}
        {jobsError && (
          <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-xs text-red-300">
            {jobsError}
          </div>
        )}
        {!loadingJobs && jobsForCollection.length === 0 && (
          <div className="rounded border border-escola-border bg-escola-bg p-3 text-xs text-escola-creme-50">
            {onlyThisCollection ? (
              <>
                Sem renders desta coleção ainda. Volta a{" "}
                <Link
                  href={`/admin/producao/colecoes/${col.id}`}
                  className="text-escola-dourado underline"
                >
                  /{col.slug}
                </Link>{" "}
                e dispara render dos 7 dias. Ou desmarca o filtro para ver todos os renders.
              </>
            ) : (
              "Nenhum render-job concluído no sistema."
            )}
          </div>
        )}

        {jobsForCollection.length > 0 && (
          <div className="space-y-2">
            <label className="block text-xs text-escola-creme-50">
              Job (mais recentes em cima)
              <select
                value={selectedJobId ?? ""}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
              >
                {jobsForCollection.map((j) => (
                  <option key={j.jobId} value={j.jobId}>
                    {j.jobId} · {j.videos?.length ?? 0} MP4
                    {j.completedAt ? ` · ${j.completedAt.slice(0, 16).replace("T", " ")}` : ""}
                  </option>
                ))}
              </select>
            </label>

            {selectedJob?.videos && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                {selectedJob.videos
                  .slice()
                  .sort((a, b) => (diaNumeroFromFile(a.file) ?? 99) - (diaNumeroFromFile(b.file) ?? 99))
                  .map((v) => (
                    <div
                      key={v.url}
                      className="rounded border border-escola-border bg-escola-bg p-1"
                      title={v.file}
                    >
                      <video
                        src={v.url}
                        muted
                        playsInline
                        preload="metadata"
                        controls
                        className="aspect-[9/16] w-full bg-black object-cover"
                      />
                      <div className="mt-1 truncate text-[10px] text-escola-creme">
                        {v.file}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Configuração global */}
      <section className="grid gap-3 rounded-lg border border-escola-border bg-escola-card p-4 sm:grid-cols-3">
        <label className="text-xs text-escola-creme-50">
          Data início (segunda da semana)
          <input
            type="date"
            value={startDate}
            onChange={(e) => syncDates(e.target.value, defaultTime)}
            className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
          />
        </label>
        <label className="text-xs text-escola-creme-50">
          Hora default (HH:MM Maputo · CAT)
          <input
            type="time"
            value={defaultTime}
            onChange={(e) => syncDates(startDate, e.target.value)}
            className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
          />
        </label>
        <label className="text-xs text-escola-creme-50">
          CTA Instagram (opcional)
          <input
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
          />
        </label>
      </section>

      {/* Linhas por dia */}
      <section className="space-y-3">
        {rows.map((r, i) => (
          <DiaCard
            key={`${r.dia}-${r.date}-${i}`}
            row={r}
            diaInfo={col.dias[i]}
            todosMp4={todosMp4}
            onTimeChange={(time) =>
              setRows((prev) => {
                const next = [...prev];
                next[i] = { ...next[i], time };
                return next;
              })
            }
            onTextChange={(texto) =>
              setRows((prev) => {
                const next = [...prev];
                next[i] = { ...next[i], texto };
                return next;
              })
            }
            onTemaChange={(tema) =>
              setRows((prev) => {
                const next = [...prev];
                next[i] = { ...next[i], tema };
                return next;
              })
            }
            onVideoChange={(videoUrl) =>
              setRows((prev) => {
                const next = [...prev];
                next[i] = { ...next[i], videoUrl };
                return next;
              })
            }
          />
        ))}
      </section>

      <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-escola-border bg-escola-card p-4 shadow-lg">
        <div className="text-xs text-escola-creme-50">
          <strong className="text-escola-creme">{posts.length}</strong> dia
          {posts.length === 1 ? "" : "s"} com MP4 + frase ·{" "}
          <strong className="text-escola-creme">{posts.length * 2}</strong>{" "}
          linhas no CSV (IG + TT)
        </div>
        <button
          onClick={downloadCsv}
          disabled={posts.length === 0}
          className="rounded-md border border-escola-dourado/60 bg-escola-dourado/10 px-4 py-2 text-sm text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-40"
        >
          Descarregar CSV Metricool
        </button>
      </footer>
    </div>
  );
}

function DiaCard({
  row,
  diaInfo,
  todosMp4,
  onTimeChange,
  onTextChange,
  onTemaChange,
  onVideoChange,
}: {
  row: DiaRow;
  diaInfo: Dia | undefined;
  todosMp4: Array<{ jobId: string; file: string; url: string }>;
  onTimeChange: (time: string) => void;
  onTextChange: (texto: string) => void;
  onTemaChange: (tema: string) => void;
  onVideoChange: (videoUrl: string) => void;
}) {
  return (
    <div className="rounded-lg border border-escola-border bg-escola-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
        <div>
          <div className="text-base text-escola-dourado">
            {DIAS_PT[row.dia]}{" "}
            <span className="text-xs text-escola-creme-50">{row.date}</span>
          </div>
          {diaInfo && (
            <div className="text-[11px] text-escola-creme-50">
              {diaInfo.veu} · <em>{diaInfo.subtitulo}</em>
            </div>
          )}
        </div>
        <input
          type="time"
          value={row.time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <label className="block text-xs text-escola-creme-50">
            Frase / texto principal
            <textarea
              rows={3}
              value={row.texto}
              onChange={(e) => onTextChange(e.target.value)}
              className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
              placeholder="Mensagem principal deste vídeo…"
            />
          </label>
          <label className="block text-xs text-escola-creme-50">
            Tema (hashtag única, sem #)
            <input
              value={row.tema}
              onChange={(e) => onTemaChange(e.target.value)}
              placeholder="ex: solidao"
              className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
            />
          </label>
          <label className="block text-xs text-escola-creme-50">
            MP4 a publicar
            <select
              value={row.videoUrl}
              onChange={(e) => onVideoChange(e.target.value)}
              className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
            >
              <option value="">escolhe um MP4</option>
              {todosMp4.map((v) => (
                <option key={v.url} value={v.url}>
                  {v.file} · {v.jobId.slice(0, 12)}…
                </option>
              ))}
            </select>
          </label>

          {row.texto.trim() && (
            <details className="text-xs text-escola-creme-50">
              <summary className="cursor-pointer hover:text-escola-creme">
                Pré-visualizar captions (IG · TikTok · WhatsApp manual)
              </summary>
              <div className="mt-2 grid gap-2 md:grid-cols-3">
                <CaptionPreview
                  label="Instagram (Reel)"
                  text={buildCarouselCaption({
                    texto: row.texto.trim(),
                    tema: row.tema.trim() || undefined,
                    platform: "instagram",
                  })}
                />
                <CaptionPreview
                  label="TikTok"
                  text={buildCarouselCaption({
                    texto: row.texto.trim(),
                    tema: row.tema.trim() || undefined,
                    platform: "tiktok",
                  })}
                />
                <CaptionPreview
                  label="WhatsApp Status"
                  text={buildCarouselCaption({
                    texto: row.texto.trim(),
                    tema: row.tema.trim() || undefined,
                    platform: "whatsapp",
                  })}
                />
              </div>
            </details>
          )}
        </div>

        <div className="w-40">
          {row.videoUrl ? (
            <video
              src={row.videoUrl}
              muted
              playsInline
              preload="metadata"
              controls
              className="aspect-[9/16] w-full bg-black object-cover rounded border border-escola-border"
            />
          ) : (
            <div className="aspect-[9/16] w-full rounded border border-dashed border-escola-border bg-escola-bg/30 flex items-center justify-center text-[10px] text-escola-creme-50 text-center px-2">
              sem MP4
              <br />
              selecionado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CaptionPreview({ label, text }: { label: string; text: string }) {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="rounded border border-escola-border bg-escola-bg p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] text-escola-dourado">{label}</span>
        <button
          onClick={onCopy}
          className="rounded border border-escola-border px-1.5 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-creme"
        >
          Copiar
        </button>
      </div>
      <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap break-words font-sans text-[10px] leading-relaxed text-escola-creme">
        {text}
      </pre>
    </div>
  );
}
