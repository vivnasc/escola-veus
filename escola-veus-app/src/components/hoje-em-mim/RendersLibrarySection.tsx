"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DIA_LONGO_PT,
  GLIFO_POR_DIA,
  KICKER_POR_DIA,
  phraseToCaptions,
  type DiaSemana,
} from "@/lib/hoje-em-mim/captions";

/**
 * Library de renders já produzidos. Espelha o padrão do "Bulks
 * anteriores" do VC Sabia, mas com extra: destaque grande do MP4
 * de HOJE no topo, pronto a baixar e postar manualmente.
 *
 * Carrega de /api/admin/hoje-em-mim/jobs/list e renderiza:
 *  - Card grande "📅 Hoje (date)" com o MP4 inline + downloads das
 *    captions + botão de copiar IG/TT/WA, quando existe um render
 *    para o dia actual
 *  - Lista colapsável dos jobs anteriores, cada um com nº de dias
 *    completos / total e botão para reabrir no JobSection acima
 */

type LibItem = {
  dayIndex: number;
  date: string;       // YYYY-MM-DD
  dia: DiaSemana;
  fraseTexto?: string;
  url: string | null;
};

type LibJob = {
  jobId: string;
  ano?: number;
  mes?: number;
  diaInicio?: number;
  diaFim?: number;
  startDate?: string;
  numDays?: number;
  createdAt?: string;
  completedCount: number;
  items: LibItem[];
};

function todayMaputoISO(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Maputo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // YYYY-MM-DD
}

const COBRE = "rgb(194, 143, 96)";
const COBRE_FRACO = "rgba(194, 143, 96, 0.55)";

export function RendersLibrarySection({
  onLoadJob,
  copied,
  onCopy,
}: {
  onLoadJob: (jobId: string) => void;
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const [jobs, setJobs] = useState<LibJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/hoje-em-mim/jobs/list", {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `HTTP ${res.status}`);
      setJobs(json.jobs || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Procura o item de hoje. Se houver vários jobs com o mesmo dia
  // (ex: re-renders), pega o mais recente (jobs já vêm sorted desc).
  const todayISO = todayMaputoISO();
  const todayItem = useMemo(() => {
    for (const job of jobs) {
      const it = job.items.find((i) => i.date === todayISO && i.url);
      if (it) return { job, item: it };
    }
    return null;
  }, [jobs, todayISO]);

  const downloadRemote = async (url: string, filename: string) => {
    try {
      const r = await fetch(url);
      const blob = await r.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objUrl);
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <h2 className="font-serif text-lg" style={{ color: COBRE }}>
          📚 Renders já produzidos
        </h2>
        <button
          onClick={load}
          disabled={loading}
          className="rounded border border-escola-border bg-escola-card px-2 py-0.5 text-[11px] text-escola-creme-50 hover:text-escola-creme disabled:opacity-40"
        >
          {loading ? "…" : "↻ refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-[11px] text-red-300">
          {error}
        </div>
      )}

      {todayItem && (
        <TodayHighlightCard
          item={todayItem.item}
          onCopy={onCopy}
          copied={copied}
          onDownload={downloadRemote}
        />
      )}

      {!todayItem && !loading && jobs.length > 0 && (
        <div
          className="rounded border p-3 text-[11px]"
          style={{ borderColor: COBRE_FRACO, background: "rgba(194,143,96,0.04)", color: COBRE }}
        >
          Sem MP4 produzido para hoje ({todayISO}). O destaque aparece aqui
          assim que renderizares o dia.
        </div>
      )}

      <details className="rounded border border-escola-border bg-escola-card/30">
        <summary className="cursor-pointer px-3 py-2 text-xs text-escola-creme-50 hover:text-escola-creme">
          {jobs.length === 0 && !loading
            ? "Sem jobs guardados ainda"
            : `Pacotes anteriores (${jobs.length})`}
        </summary>
        <div className="px-3 pb-3 space-y-1">
          {jobs.map((j) => {
            const range =
              j.ano && j.mes && j.diaInicio && j.diaFim
                ? `${j.ano}-${String(j.mes).padStart(2, "0")} · dias ${j.diaInicio}-${j.diaFim}`
                : j.jobId;
            const dt = j.createdAt
              ? new Date(j.createdAt).toLocaleString("pt-PT", {
                  timeZone: "Africa/Maputo",
                  year: "2-digit",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";
            const total = j.numDays ?? j.items.length;
            return (
              <div
                key={j.jobId}
                className="flex items-center justify-between gap-2 rounded border border-escola-border bg-escola-card/60 px-2 py-1.5 text-[11px]"
              >
                <button
                  onClick={() => onLoadJob(j.jobId)}
                  className="flex-1 text-left text-escola-creme hover:text-escola-dourado"
                >
                  <div>
                    <span className="font-mono">{range}</span>
                    <span className="ml-2 text-escola-creme-50">
                      · {j.completedCount}/{total} MP4
                    </span>
                  </div>
                  <div className="text-[9px] text-escola-creme-50">
                    {dt} · {j.jobId}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </details>
    </section>
  );
}

function TodayHighlightCard({
  item,
  onCopy,
  copied,
  onDownload,
}: {
  item: LibItem;
  onCopy: (key: string, text: string) => void;
  copied: string | null;
  onDownload: (url: string, filename: string) => void;
}) {
  const captions = item.fraseTexto
    ? phraseToCaptions({ phrase: item.fraseTexto, dia: item.dia })
    : null;
  const filename = `hoje-em-mim-${item.date}.mp4`;
  return (
    <div
      className="rounded-lg border-2 p-4 space-y-3"
      style={{
        borderColor: COBRE,
        background:
          "linear-gradient(180deg, rgba(194,143,96,0.10) 0%, rgba(194,143,96,0.03) 100%)",
      }}
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: COBRE }}>
            📅 Hoje · {item.date}
          </div>
          <div className="text-base font-serif text-escola-creme">
            {GLIFO_POR_DIA[item.dia]} {DIA_LONGO_PT[item.dia]} ·{" "}
            <span style={{ color: COBRE }}>{KICKER_POR_DIA[item.dia]}</span>
          </div>
          {item.fraseTexto && (
            <div className="mt-1 max-w-2xl text-xs italic text-escola-creme-50">
              {item.fraseTexto}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 items-start">
        {item.url && (
          <video
            src={item.url}
            controls
            playsInline
            preload="metadata"
            className="w-full max-w-[280px] rounded border border-escola-border bg-black"
            style={{ aspectRatio: "9/16" }}
          />
        )}
        <div className="space-y-2">
          {item.url && (
            <button
              onClick={() => onDownload(item.url!, filename)}
              className="w-full rounded border px-3 py-2 text-xs"
              style={{
                borderColor: COBRE,
                color: COBRE,
                background: "rgba(194,143,96,0.12)",
              }}
            >
              ↓ Descarregar MP4 ({filename})
            </button>
          )}
          {captions && (
            <>
              <button
                onClick={() => onCopy(`today-ig`, captions.instagram)}
                className="w-full rounded border border-escola-border bg-escola-card px-2 py-1.5 text-[11px] text-escola-creme-50 hover:text-escola-creme text-left"
              >
                {copied === "today-ig" ? "✓ copiado" : "📋 Copiar caption Instagram"}
              </button>
              <button
                onClick={() => onCopy(`today-tt`, captions.tiktok)}
                className="w-full rounded border border-escola-border bg-escola-card px-2 py-1.5 text-[11px] text-escola-creme-50 hover:text-escola-creme text-left"
              >
                {copied === "today-tt" ? "✓ copiado" : "📋 Copiar caption TikTok"}
              </button>
              <button
                onClick={() => onCopy(`today-wa`, captions.whatsapp)}
                className="w-full rounded border border-escola-border bg-escola-card px-2 py-1.5 text-[11px] text-escola-creme-50 hover:text-escola-creme text-left"
              >
                {copied === "today-wa" ? "✓ copiado" : "📋 Copiar caption WhatsApp Status"}
              </button>
            </>
          )}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="block w-full rounded border border-escola-border bg-escola-card/40 px-2 py-1.5 text-[10px] text-escola-creme-50 hover:text-escola-creme text-center"
            >
              ↗ Abrir MP4 directo em separador novo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
