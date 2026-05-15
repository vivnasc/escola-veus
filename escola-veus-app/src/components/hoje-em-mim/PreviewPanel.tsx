"use client";

import { useEffect, useMemo, useState } from "react";
import seed from "@/data/hoje-em-mim-frases.seed.json";
import { MJ_VIDEO_PROMPTS } from "@/data/hoje-em-mim-mj-prompts";
import {
  DIA_LONGO_PT,
  GLIFO_POR_DIA,
  KICKER_POR_DIA,
  LABEL_POR_DIA,
  diaSemanaHoje,
  phraseToCaptions,
  type DiaSemana,
} from "@/lib/hoje-em-mim/captions";
import {
  DEFAULT_NIGHT_DURATION_SEC,
  NIGHT_MOOD_LABELS,
  NIGHT_MOOD_PROMPTS,
  NIGHT_MOODS,
  type NightMood,
} from "@/lib/hoje-em-mim/audio";
import { NightMotionLibrary } from "./MotionLibrary";

type Frase = { id: string; dia: DiaSemana; texto: string };

const DEFAULT_MEDIA = "/assets/hoje-em-mim/motions/lua-piscina-01.mp4";
const FALLBACK_MEDIA = "/assets/vc-sabia/motions/IMG_8599.webp";

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function daysInMonth(ano: number, mes: number): number {
  return new Date(ano, mes, 0).getDate();
}

const DIAS_PT_CURTO: Record<DiaSemana, string> = {
  mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui",
  fri: "Sex", sat: "Sáb", sun: "Dom",
};

const FRASES = seed.frases as Frase[];

/**
 * Paleta noturna "Carta Noturna".
 *  bg     #0E0820 indigo profundo
 *  cobre  #C28F60 cobre morno (não dourado)
 *  creme  #F2E9D8 papel velho
 *  papel  #E6D7BA tinta sépia
 */
const COBRE = "rgb(194, 143, 96)";
const COBRE_FRACO = "rgba(194, 143, 96, 0.55)";
const CREME = "rgb(242, 233, 216)";
const INDIGO = "rgba(14, 8, 32, 0.85)";

export function HojeEmMimPreviewPanel() {
  const hoje = diaSemanaHoje();
  const [dia, setDia] = useState<DiaSemana>(hoje);
  const frasesDoDia = useMemo(() => FRASES.filter((f) => f.dia === dia), [dia]);
  const [phraseId, setPhraseId] = useState<string>(frasesDoDia[0]?.id ?? FRASES[0].id);
  const [media, setMedia] = useState<string>(DEFAULT_MEDIA);
  const [audioUrlSelected, setAudioUrlSelected] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);

  // Estado do job mensal de render (bulk via workflow GitHub Actions).
  type RenderVideo = {
    dayIndex: number;
    date: string;
    dia: DiaSemana;
    fraseId: string;
    fraseTexto?: string;
    file: string | null;
    url: string | null;
    sizeBytes?: number;
    error?: string;
    captions?: { instagram: string; tiktok: string; whatsapp: string };
  };
  type JobResult = {
    jobId: string;
    status: "queued" | "rendering" | "done" | "failed";
    progress: number;
    total: number;
    videos?: RenderVideo[];
    error?: string;
    ano?: number;
    mes?: number;
    mesLabel?: string;
    diaInicio?: number;
    diaFim?: number;
    startDate?: string;
    numDays?: number;
    startedAt?: string;
    completedAt?: string;
  };

  const [jobId, setJobId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("hoje-em-mim.lastJobId");
  });
  const [jobResult, setJobResult] = useState<JobResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Config do job: range ano/mes/diaInicio/diaFim
  const now = new Date();
  const [ano, setAno] = useState<number>(now.getFullYear());
  const [mes, setMes] = useState<number>(now.getMonth() + 1);
  const [diaInicio, setDiaInicio] = useState<number>(now.getDate());
  const [diaFim, setDiaFim] = useState<number>(() => daysInMonth(now.getFullYear(), now.getMonth() + 1));
  const [durationSec, setDurationSec] = useState<number>(15);

  const phrase =
    frasesDoDia.find((f) => f.id === phraseId) ?? frasesDoDia[0] ?? FRASES[0];

  const isVideo = /\.(mp4|webm|mov)$/i.test(media);
  const captions = phraseToCaptions({ phrase: phrase.texto, dia: phrase.dia });
  const kicker = KICKER_POR_DIA[phrase.dia];
  const glifo = GLIFO_POR_DIA[phrase.dia];
  const diaLongo = DIA_LONGO_PT[phrase.dia];

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const pollJob = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/hoje-em-mim/render-status?jobId=${encodeURIComponent(id)}`);
      if (res.status === 404) return;
      const json = await res.json();
      if (res.ok) setJobResult(json as JobResult);
    } catch {
      /* polling silencioso */
    }
  };

  useEffect(() => {
    if (!jobId) return;
    pollJob(jobId);
    const interval = setInterval(() => {
      pollJob(jobId);
    }, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  // Pára o polling quando done|failed (mantém estado mas evita pedidos)
  useEffect(() => {
    if (jobResult && (jobResult.status === "done" || jobResult.status === "failed")) {
      // nada — o interval continua mas a UI já mostra final
    }
  }, [jobResult]);

  const numItens = Math.max(0, diaFim - diaInicio + 1);
  const dmax = daysInMonth(ano, mes);
  const rangeOk = diaInicio >= 1 && diaFim >= diaInicio && diaFim <= dmax;

  const submitJob = async () => {
    setSubmitError(null);
    if (!rangeOk) {
      setSubmitError(
        `Range inválido. Dias ${diaInicio}-${diaFim} para ${MESES_PT[mes - 1]} (${dmax} dias).`
      );
      return;
    }
    setSubmitting(true);
    try {
      const id = `hoje-em-mim-${ano}-${String(mes).padStart(2, "0")}-${String(diaInicio).padStart(2, "0")}-to-${String(diaFim).padStart(2, "0")}-${Date.now().toString(36)}`;
      const body = {
        jobId: id,
        ano,
        mes,
        diaInicio,
        diaFim,
        durationSec,
        motionPool: [media],
        audioPool: audioUrlSelected ? [audioUrlSelected] : [],
      };
      const res = await fetch("/api/admin/hoje-em-mim/render-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `HTTP ${res.status}`);
      setJobId(id);
      setJobResult(null);
      if (typeof window !== "undefined") {
        localStorage.setItem("hoje-em-mim.lastJobId", id);
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-serif" style={{ color: COBRE }}>
          Hoje, em Mim. Fecho do dia.
        </h1>
        <p className="text-sm text-escola-creme-50">
          Conta pessoal, post da noite. Identidade própria, "Carta Noturna":
          cobre morno em vez de dourado, dia da semana à vertical no lado, kicker
          como assinatura em baixo, glifo discreto, grão de papel.
        </p>
        <p className="text-xs text-escola-creme-50">
          Rotação editorial:
          {" "}<strong className="text-escola-creme">seg</strong> convite ·
          {" "}<strong className="text-escola-creme">ter</strong> gratidão ·
          {" "}<strong className="text-escola-creme">qua</strong> soltar ·
          {" "}<strong className="text-escola-creme">qui</strong> aprendi ·
          {" "}<strong className="text-escola-creme">sex</strong> celebro ·
          {" "}<strong className="text-escola-creme">sáb</strong> corpo ·
          {" "}<strong className="text-escola-creme">dom</strong> intenção.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 rounded-md border border-escola-border p-1">
          {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as DiaSemana[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDia(d);
                const primeira = FRASES.find((f) => f.dia === d);
                if (primeira) setPhraseId(primeira.id);
              }}
              className={`rounded px-3 py-1.5 text-xs transition-colors ${
                dia === d
                  ? "bg-escola-dourado text-escola-bg"
                  : "text-escola-creme-50 hover:text-escola-creme"
              }`}
              title={LABEL_POR_DIA[d]}
            >
              <span className="mr-1">{GLIFO_POR_DIA[d]}</span>
              {DIAS_PT_CURTO[d]}
            </button>
          ))}
        </div>
        <div className="text-xs text-escola-creme-50 self-center">
          <span style={{ color: COBRE }}>{LABEL_POR_DIA[dia]}</span>
          {dia === hoje && (
            <span
              className="ml-2 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
              style={{ background: "rgba(194, 143, 96, 0.18)", color: COBRE }}
            >
              hoje
            </span>
          )}
        </div>
      </div>

      <NightMotionLibrary selectedUrl={media} onSelect={setMedia} />

      <div className="flex flex-wrap gap-3">
        <select
          value={phrase.id}
          onChange={(e) => setPhraseId(e.target.value)}
          className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-xs text-escola-creme"
        >
          {frasesDoDia.map((f) => (
            <option key={f.id} value={f.id}>
              {f.id}. {f.texto.slice(0, 60)}…
            </option>
          ))}
        </select>

        <input
          value={media}
          onChange={(e) => setMedia(e.target.value)}
          placeholder="/assets/hoje-em-mim/motions/…"
          className="min-w-[280px] flex-1 rounded border border-escola-border bg-escola-card px-3 py-1.5 text-xs text-escola-creme"
        />

        <div className="flex gap-1 rounded-md border border-escola-border p-1 text-xs">
          <button
            onClick={() => setMedia(DEFAULT_MEDIA)}
            className={`rounded px-2 py-1 transition-colors ${
              media === DEFAULT_MEDIA
                ? "bg-escola-dourado/20 text-escola-dourado"
                : "text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            Lua na piscina
          </button>
          <button
            onClick={() => setMedia(FALLBACK_MEDIA)}
            className={`rounded px-2 py-1 transition-colors ${
              media === FALLBACK_MEDIA
                ? "bg-escola-dourado/20 text-escola-dourado"
                : "text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            Imagem fallback
          </button>
        </div>
      </div>

      <div className="text-xs text-escola-creme-50">
        Visual fixo "Janela de Lua": arco de cobre no topo, texto centrado,
        nome do dia em pé à direita, glifo e kicker em baixo como assinatura.
        Grão de papel sobre vídeo. Sem cartão de vidro.
      </div>

      <div className="flex flex-wrap gap-8">
        <Frame
          phrase={phrase.texto}
          kicker={kicker}
          glifo={glifo}
          diaLongo={diaLongo}
          media={media}
          isVideo={isVideo}
        />

        <div className="space-y-3 text-xs text-escola-creme-50">
          <div>
            <div className="text-escola-creme">Kicker</div>
            <div className="mt-1 font-serif text-base" style={{ color: COBRE }}>
              {glifo} {kicker}
            </div>
          </div>
          <div>
            <div className="text-escola-creme">Frase</div>
            <div className="mt-1 font-serif text-base text-escola-creme">{phrase.texto}</div>
          </div>
          <div>
            <div className="text-escola-creme">Dia editorial</div>
            <div className="mt-1">{LABEL_POR_DIA[phrase.dia]}</div>
          </div>
          <div>
            <div className="text-escola-creme">ID</div>
            <div className="mt-1">{phrase.id}</div>
          </div>
          <div>
            <div className="text-escola-creme">Motion</div>
            <div className="mt-1 break-all">{media}</div>
          </div>
          <div>
            <div className="text-escola-creme">Áudio</div>
            <input
              value={audioUrlSelected}
              onChange={(e) => setAudioUrlSelected(e.target.value)}
              placeholder="URL do MP3 (vazio = sem som)"
              className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[11px] text-escola-creme"
            />
            <div className="mt-1 text-[10px]">
              Gera um áudio na secção em baixo e cola a URL aqui, ou deixa vazio.
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-escola-border">
            <div className="text-escola-creme">Bulk mensal · Pacote Metricool</div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] block">
                Ano
                <input
                  type="number"
                  min={2020}
                  max={2100}
                  value={ano}
                  onChange={(e) => setAno(Number(e.target.value))}
                  className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[11px] text-escola-creme"
                />
              </label>
              <label className="text-[10px] block">
                Mês
                <select
                  value={mes}
                  onChange={(e) => {
                    const newMes = Number(e.target.value);
                    setMes(newMes);
                    const newDmax = daysInMonth(ano, newMes);
                    if (diaFim > newDmax) setDiaFim(newDmax);
                    if (diaInicio > newDmax) setDiaInicio(newDmax);
                  }}
                  className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[11px] text-escola-creme"
                >
                  {MESES_PT.map((label, i) => (
                    <option key={i} value={i + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[10px] block">
                Dia início
                <input
                  type="number"
                  min={1}
                  max={dmax}
                  value={diaInicio}
                  onChange={(e) => setDiaInicio(Number(e.target.value))}
                  className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[11px] text-escola-creme"
                />
              </label>
              <label className="text-[10px] block">
                Dia fim
                <input
                  type="number"
                  min={diaInicio}
                  max={dmax}
                  value={diaFim}
                  onChange={(e) => setDiaFim(Number(e.target.value))}
                  className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[11px] text-escola-creme"
                />
              </label>
              <label className="text-[10px] block col-span-2">
                Duração de cada vídeo (s)
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={durationSec}
                  onChange={(e) => setDurationSec(Number(e.target.value))}
                  className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[11px] text-escola-creme"
                />
              </label>
            </div>
            <button
              onClick={submitJob}
              disabled={submitting || !rangeOk}
              className="w-full rounded border px-3 py-2 text-xs disabled:opacity-50 transition-colors"
              style={{
                borderColor: COBRE,
                color: COBRE,
                background: "rgba(194, 143, 96, 0.1)",
              }}
            >
              {submitting
                ? "a submeter…"
                : `▶ Gerar dias ${diaInicio}-${diaFim} de ${MESES_PT[mes - 1]} ${ano} (${numItens})`}
            </button>
            {submitError && (
              <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-[11px] text-red-300">
                {submitError}
              </div>
            )}
            <div className="text-[10px] text-escola-creme-50">
              {numItens} jobs em paralelo no GitHub Actions (matrix). Cada
              item ~30s. Faz polling automático e mostra os MP4 conforme
              prontos. Motion e áudio usados: os que estão selecionados acima.
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-lg" style={{ color: COBRE }}>
          Captions para os 3 canais
        </h2>
        <p className="text-xs text-escola-creme-50">
          Gerados a partir da frase e do dia. Sem travessões. Copia e cola na
          Metricool (IG/TikTok) ou no WhatsApp Status. Hashtags ajustadas ao tema do dia.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <CaptionCard
            label="Instagram"
            text={captions.instagram}
            copied={copied === "ig"}
            onCopy={() => copy("ig", captions.instagram)}
          />
          <CaptionCard
            label="TikTok"
            text={captions.tiktok}
            copied={copied === "tt"}
            onCopy={() => copy("tt", captions.tiktok)}
          />
          <CaptionCard
            label="WhatsApp Status"
            text={captions.whatsapp}
            copied={copied === "wa"}
            onCopy={() => copy("wa", captions.whatsapp)}
          />
        </div>
      </section>

      <JobSection
        jobId={jobId}
        jobResult={jobResult}
        onReload={() => jobId && pollJob(jobId)}
        onChangeJobId={(id) => {
          setJobId(id);
          setJobResult(null);
          if (typeof window !== "undefined") {
            if (id) localStorage.setItem("hoje-em-mim.lastJobId", id);
            else localStorage.removeItem("hoje-em-mim.lastJobId");
          }
        }}
        copied={copied}
        onCopy={copy}
      />

      <AudioGeneratorSection />

      <MjPromptsSection copied={copied} onCopy={copy} />
    </div>
  );
}

type JobVideoUI = {
  dayIndex: number;
  date: string;
  dia: DiaSemana;
  fraseId: string;
  fraseTexto?: string;
  file: string | null;
  url: string | null;
  sizeBytes?: number;
  error?: string;
  captions?: { instagram: string; tiktok: string; whatsapp: string };
};

type JobResultUI = {
  jobId: string;
  status: "queued" | "rendering" | "done" | "failed";
  progress: number;
  total: number;
  videos?: JobVideoUI[];
  error?: string;
  ano?: number;
  mes?: number;
  mesLabel?: string;
  diaInicio?: number;
  diaFim?: number;
  startDate?: string;
  numDays?: number;
  startedAt?: string;
  completedAt?: string;
};

function isoTodayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function JobSection({
  jobId,
  jobResult,
  onReload,
  onChangeJobId,
  copied,
  onCopy,
}: {
  jobId: string | null;
  jobResult: JobResultUI | null;
  onReload: () => void;
  onChangeJobId: (id: string | null) => void;
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  if (!jobId) {
    return (
      <section className="space-y-3">
        <h2 className="font-serif text-lg" style={{ color: COBRE }}>
          Pack mensal · estado do job
        </h2>
        <p className="text-xs text-escola-creme-50">
          Sem job submetido. Configura o pack na coluna ao lado do preview e
          carrega "Submeter job". A UI vai fazer polling até estar pronto.
        </p>
      </section>
    );
  }

  const todayIso = isoTodayLocal();
  const todayVideo = jobResult?.videos?.find((v) => v.date === todayIso && v.url);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="font-serif text-lg" style={{ color: COBRE }}>
          Pack mensal · estado do job
        </h2>
        <div className="flex gap-2 items-center text-[11px] text-escola-creme-50">
          <span>jobId: <code className="text-escola-creme">{jobId}</code></span>
          <button
            onClick={onReload}
            className="rounded border border-escola-border bg-escola-card px-2 py-1 text-escola-creme-50 hover:text-escola-creme"
          >
            Recarregar
          </button>
          <button
            onClick={() => onChangeJobId(null)}
            className="rounded border border-escola-border bg-escola-card px-2 py-1 text-escola-creme-50 hover:text-red-300"
            title="Esquecer este job (não apaga ficheiros)"
          >
            Limpar
          </button>
        </div>
      </div>

      {!jobResult ? (
        <div className="text-xs text-escola-creme-50">A obter estado do job…</div>
      ) : (
        <>
          <JobProgressBar result={jobResult} />

          {todayVideo && (
            <TodayWidget video={todayVideo} copied={copied} onCopy={onCopy} />
          )}

          {jobResult.videos && jobResult.videos.length > 0 && (
            <JobVideoGrid videos={jobResult.videos} copied={copied} onCopy={onCopy} />
          )}
        </>
      )}
    </section>
  );
}

function JobProgressBar({ result }: { result: JobResultUI }) {
  const pct = result.total > 0 ? Math.round((result.progress / result.total) * 100) : 0;
  const statusLabel = {
    queued: "Em fila no GitHub Actions",
    rendering: `A renderizar ${result.progress}/${result.total}`,
    done: `Concluído. ${result.progress}/${result.total} vídeos`,
    failed: "Falhou",
  }[result.status];

  const statusColor = {
    queued: "text-escola-creme-50",
    rendering: "text-escola-dourado",
    done: "text-emerald-300",
    failed: "text-red-300",
  }[result.status];

  const rangeLabel =
    result.mesLabel && result.diaInicio && result.diaFim && result.ano
      ? `Dias ${result.diaInicio}-${result.diaFim} de ${result.mesLabel} ${result.ano}`
      : null;

  return (
    <div className="rounded-lg border border-escola-border bg-escola-card p-3 space-y-2">
      {rangeLabel && (
        <div className="text-xs" style={{ color: COBRE }}>{rangeLabel}</div>
      )}
      <div className="flex items-baseline justify-between text-xs">
        <span className={statusColor}>{statusLabel}</span>
        <span className="text-escola-creme-50">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-escola-bg">
        <div
          className="h-full transition-all"
          style={{
            width: `${pct}%`,
            background: result.status === "failed" ? "#7f1d1d" : COBRE,
          }}
        />
      </div>
      {result.error && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-[11px] text-red-300">
          {result.error}
        </div>
      )}
      {result.completedAt && (
        <div className="text-[10px] text-escola-creme-50">
          Concluído {result.completedAt.replace("T", " ").slice(0, 16)}
        </div>
      )}
    </div>
  );
}

function TodayWidget({
  video,
  copied,
  onCopy,
}: {
  video: JobVideoUI;
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  return (
    <div
      className="rounded-lg border-2 p-3 space-y-2"
      style={{ borderColor: COBRE, background: "rgba(194, 143, 96, 0.06)" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: COBRE }}>
            Hoje
          </span>
          <div className="font-serif text-base" style={{ color: COBRE }}>
            {video.date} · {DIA_LONGO_PT[video.dia]}
          </div>
        </div>
        {video.url && (
          <a
            href={video.url}
            download
            target="_blank"
            rel="noreferrer"
            className="rounded border px-3 py-1.5 text-xs"
            style={{
              borderColor: COBRE,
              color: COBRE,
              background: "rgba(194, 143, 96, 0.15)",
            }}
          >
            Descarregar MP4 ↓
          </a>
        )}
      </div>
      {video.url && (
        <video
          src={video.url}
          controls
          playsInline
          preload="metadata"
          className="w-48 aspect-[9/16] bg-black rounded"
        />
      )}
      {video.captions && (
        <div className="space-y-1.5">
          <CopyButton
            label="Caption WhatsApp Status"
            text={video.captions.whatsapp}
            keyId={`wa-today-${video.dayIndex}`}
            copied={copied}
            onCopy={onCopy}
          />
          <CopyButton
            label="Caption Instagram"
            text={video.captions.instagram}
            keyId={`ig-today-${video.dayIndex}`}
            copied={copied}
            onCopy={onCopy}
          />
          <CopyButton
            label="Caption TikTok"
            text={video.captions.tiktok}
            keyId={`tt-today-${video.dayIndex}`}
            copied={copied}
            onCopy={onCopy}
          />
        </div>
      )}
    </div>
  );
}

function CopyButton({
  label,
  text,
  keyId,
  copied,
  onCopy,
}: {
  label: string;
  text: string;
  keyId: string;
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const isCopied = copied === keyId;
  return (
    <button
      onClick={() => onCopy(keyId, text)}
      className="w-full rounded border px-2 py-1 text-left text-[11px] transition-colors"
      style={{
        borderColor: isCopied ? COBRE : "rgba(245, 240, 230, 0.16)",
        color: isCopied ? COBRE : undefined,
        background: isCopied ? "rgba(194, 143, 96, 0.15)" : undefined,
      }}
    >
      {isCopied ? "✓ copiado: " : "Copiar "}
      {label}
    </button>
  );
}

function JobVideoGrid({
  videos,
  copied,
  onCopy,
}: {
  videos: JobVideoUI[];
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  return (
    <div>
      <div className="text-xs text-escola-creme-50 mb-2">
        Todos os vídeos do pack ({videos.length}):
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <div
            key={`${v.dayIndex}-${v.fraseId}`}
            className="rounded-lg border border-escola-border bg-escola-card p-3 space-y-2"
          >
            <div className="flex items-baseline justify-between">
              <div className="text-xs" style={{ color: COBRE }}>
                {v.date} · {DIA_LONGO_PT[v.dia]}
              </div>
              <span className="text-[10px] text-escola-creme-50">{v.fraseId}</span>
            </div>
            {v.url ? (
              <>
                <video
                  src={v.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-[9/16] w-full bg-black rounded"
                />
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  {typeof v.sizeBytes === "number" && (
                    <span className="text-escola-creme-50">
                      {(v.sizeBytes / 1024 / 1024).toFixed(1)} MB
                    </span>
                  )}
                  <a
                    href={v.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="rounded border border-escola-border px-1.5 py-0.5 text-escola-dourado hover:text-escola-creme"
                  >
                    Descarregar ↓
                  </a>
                </div>
              </>
            ) : v.error ? (
              <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-[10px] text-red-300">
                {v.error}
              </div>
            ) : (
              <div className="aspect-[9/16] w-full rounded bg-escola-bg/40 flex items-center justify-center text-[10px] text-escola-creme-50">
                a renderizar…
              </div>
            )}
            {v.captions && v.url && (
              <details className="text-[10px] text-escola-creme-50">
                <summary className="cursor-pointer hover:text-escola-creme">
                  Captions
                </summary>
                <div className="mt-1 space-y-1">
                  <CopyButton
                    label="WhatsApp"
                    text={v.captions.whatsapp}
                    keyId={`wa-${v.dayIndex}`}
                    copied={copied}
                    onCopy={onCopy}
                  />
                  <CopyButton
                    label="Instagram"
                    text={v.captions.instagram}
                    keyId={`ig-${v.dayIndex}`}
                    copied={copied}
                    onCopy={onCopy}
                  />
                  <CopyButton
                    label="TikTok"
                    text={v.captions.tiktok}
                    keyId={`tt-${v.dayIndex}`}
                    copied={copied}
                    onCopy={onCopy}
                  />
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

type AudioOutput = {
  url: string;
  mood: NightMood;
  durationSec: number;
  sizeBytes: number;
};

function AudioGeneratorSection() {
  const [mood, setMood] = useState<NightMood>("grilos-tropicais");
  const [durationSec, setDurationSec] = useState<number>(DEFAULT_NIGHT_DURATION_SEC);
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<AudioOutput | null>(null);
  const [recent, setRecent] = useState<AudioOutput[]>([]);
  const [error, setError] = useState<string | null>(null);

  const gerar = async () => {
    setGenerating(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/admin/hoje-em-mim/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, durationSec }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro || `Erro ${res.status}`);
      } else {
        const out: AudioOutput = {
          url: json.audioUrl,
          mood: json.mood,
          durationSec: json.durationSec,
          sizeBytes: json.sizeBytes,
        };
        setOutput(out);
        setRecent((prev) => [out, ...prev].slice(0, 6));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-lg" style={{ color: COBRE }}>
        Áudio noturno. Gerar com ElevenLabs SFX
      </h2>
      <p className="text-xs text-escola-creme-50">
        Escolhe um mood e gera o SFX direto. Guarda em Supabase
        (course-assets/hoje-em-mim-audios/) e podes reutilizar em vários posts.
        Custo aproximado: 0,30 USD por geração de 10 a 12 segundos.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-escola-creme-50">
          mood
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as NightMood)}
            className="rounded border border-escola-border bg-escola-card px-2 py-1.5 text-xs text-escola-creme"
          >
            {NIGHT_MOODS.map((m) => (
              <option key={m} value={m}>
                {NIGHT_MOOD_LABELS[m]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-escola-creme-50">
          duração
          <input
            type="number"
            min={3}
            max={22}
            value={durationSec}
            onChange={(e) => setDurationSec(Number(e.target.value))}
            className="w-16 rounded border border-escola-border bg-escola-card px-2 py-1.5 text-xs text-escola-creme"
          />
          <span>s</span>
        </label>

        <button
          onClick={gerar}
          disabled={generating}
          className="rounded-md border px-3 py-1.5 text-xs disabled:opacity-50 transition-colors"
          style={{
            borderColor: COBRE,
            color: COBRE,
            background: "rgba(194, 143, 96, 0.1)",
          }}
        >
          {generating ? "a gerar…" : "Gerar áudio"}
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {output && (
        <div className="space-y-2 rounded border border-escola-border bg-escola-card p-3">
          <div className="text-xs text-escola-creme-50">
            <strong style={{ color: COBRE }}>{NIGHT_MOOD_LABELS[output.mood]}</strong>{" "}
            · {output.durationSec}s ·{" "}
            {(output.sizeBytes / 1024).toFixed(0)} KB
          </div>
          <audio src={output.url} controls className="w-full" />
          <a
            href={output.url}
            target="_blank"
            rel="noreferrer"
            className="block break-all text-[10px] underline"
            style={{ color: COBRE }}
          >
            {output.url}
          </a>
        </div>
      )}

      {recent.length > 1 && (
        <details className="text-xs text-escola-creme-50">
          <summary className="cursor-pointer hover:text-escola-creme">
            últimas {recent.length} gerações desta sessão
          </summary>
          <div className="mt-2 space-y-2">
            {recent.slice(1).map((r, i) => (
              <div
                key={`${r.url}-${i}`}
                className="rounded border border-escola-border bg-escola-bg/60 p-2"
              >
                <div className="mb-1 text-[10px]">
                  {NIGHT_MOOD_LABELS[r.mood]} · {r.durationSec}s
                </div>
                <audio src={r.url} controls className="w-full" />
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

function MjPromptsSection({
  copied,
  onCopy,
}: {
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const [onlyPrior, setOnlyPrior] = useState(false);
  const list = onlyPrior ? MJ_VIDEO_PROMPTS.filter((p) => p.prioritario) : MJ_VIDEO_PROMPTS;
  const totalShown = list.length;
  const totalAll = MJ_VIDEO_PROMPTS.length;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="font-serif text-lg" style={{ color: COBRE }}>
          Library de clips. {totalShown} de {totalAll} prompts
        </h2>
        <label className="flex items-center gap-2 text-xs text-escola-creme-50">
          <input
            type="checkbox"
            checked={onlyPrior}
            onChange={(e) => setOnlyPrior(e.target.checked)}
          />
          mostrar só os 5 prioritários ★
        </label>
      </div>
      <p className="text-xs text-escola-creme-50">
        30 prompts no total (1 por dia, com folga para 1 mês). Cada cartão tem
        o prompt Midjourney 9:16 e o mood ElevenLabs sugerido. Copia o MJ e
        gera o vídeo. O áudio gera direto aqui com o teu API key ElevenLabs
        configurado.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {list.map((p) => (
          <PromptCard
            key={p.id}
            prompt={p}
            copied={copied}
            onCopy={onCopy}
          />
        ))}
      </div>
    </section>
  );
}

function PromptCard({
  prompt,
  copied,
  onCopy,
}: {
  prompt: (typeof MJ_VIDEO_PROMPTS)[number];
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const audioPrompt = NIGHT_MOOD_PROMPTS[prompt.audioMood];
  const audioLabel = NIGHT_MOOD_LABELS[prompt.audioMood];
  const keyMj = `mj-${prompt.id}`;
  const keyAudio = `audio-${prompt.id}`;

  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const gerarAudio = async () => {
    setGenerating(true);
    setAudioError(null);
    try {
      const res = await fetch("/api/admin/hoje-em-mim/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: prompt.audioMood,
          durationSec: DEFAULT_NIGHT_DURATION_SEC,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAudioError(json.erro || `Erro ${res.status}`);
      } else {
        setAudioUrl(json.audioUrl);
      }
    } catch (e) {
      setAudioError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="rounded-lg border border-escola-border bg-escola-card p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: COBRE }}>
          {prompt.id} {prompt.prioritario ? "★" : ""}
        </span>
        <span className="text-[10px] text-escola-creme-50">
          áudio: <span className="text-escola-creme">{audioLabel}</span>
        </span>
      </div>

      <div className="rounded border border-escola-border bg-escola-bg p-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] text-escola-creme-50">Midjourney</span>
          <button
            onClick={() => onCopy(keyMj, prompt.prompt)}
            className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
              copied === keyMj
                ? "bg-escola-dourado text-escola-bg"
                : "border border-escola-border text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            {copied === keyMj ? "✓" : "Copiar"}
          </button>
        </div>
        <pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-snug text-escola-creme">
          {prompt.prompt}
        </pre>
      </div>

      <div className="rounded border border-escola-border bg-escola-bg p-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-escola-creme-50">ElevenLabs SFX</span>
          <div className="flex gap-1">
            <button
              onClick={() => onCopy(keyAudio, audioPrompt)}
              className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                copied === keyAudio
                  ? "bg-escola-dourado text-escola-bg"
                  : "border border-escola-border text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              {copied === keyAudio ? "✓" : "Copiar"}
            </button>
            <button
              onClick={gerarAudio}
              disabled={generating}
              className="rounded px-1.5 py-0.5 text-[10px] disabled:opacity-50 transition-colors"
              style={{
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: COBRE,
                color: COBRE,
                background: "rgba(194, 143, 96, 0.1)",
              }}
            >
              {generating ? "a gerar…" : "Gerar"}
            </button>
          </div>
        </div>
        <pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-snug text-escola-creme">
          {audioPrompt}
        </pre>
        {audioError && (
          <div className="rounded border border-red-700/40 bg-red-900/20 p-1.5 text-[10px] text-red-300">
            {audioError}
          </div>
        )}
        {audioUrl && (
          <audio src={audioUrl} controls className="w-full h-7" />
        )}
      </div>

      {prompt.notas && (
        <div className="text-[10px] italic text-escola-creme-50">{prompt.notas}</div>
      )}
    </div>
  );
}

function CaptionCard({
  label,
  text,
  copied,
  onCopy,
}: {
  label: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-escola-border bg-escola-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: COBRE }}>{label}</span>
        <button
          onClick={onCopy}
          className={`rounded px-2 py-1 text-xs transition-colors ${
            copied
              ? "bg-escola-dourado text-escola-bg"
              : "border border-escola-border text-escola-creme-50 hover:text-escola-creme"
          }`}
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-escola-creme">
        {text}
      </pre>
    </div>
  );
}

/**
 * Visual "Janela de Lua" (variante C aprovada).
 *  - Arco de cobre fino no topo (silhueta de janela)
 *  - Nome do dia escrito vertical (rotação 90°) no lado direito, em cobre
 *  - Texto centrado, em itálico serif, respirando
 *  - Glifo e kicker em baixo como assinatura, centrados
 *  - Grão de papel sobre o vídeo, vinheta densa, sem cartão de vidro
 *  - Marca de canto em cobre no topo esquerdo (cantoneira fina)
 */
function Frame({
  phrase,
  kicker,
  glifo,
  diaLongo,
  media,
  isVideo,
}: {
  phrase: string;
  kicker: string;
  glifo: string;
  diaLongo: string;
  media: string;
  isVideo: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-escola-border"
      style={{ width: 405, height: 720, background: "#0E0820" }}
    >
      {isVideo ? (
        <video
          src={media}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(1.2) saturate(1.05) contrast(1.05) hue-rotate(-4deg)" }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(1.2) saturate(1.05) contrast(1.05) hue-rotate(-4deg)" }}
        />
      )}

      {/* Grão de papel suave. SVG inline. */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          opacity: 0.04,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
        }}
      />

      {/* Vinheta densa para leitura noturna */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(14,8,32,0) 60%, rgba(14,8,32,0.22) 100%)",
        }}
      />

      {/* Arco de cobre, janela de lua */}
      <svg
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2"
        width="280"
        height="380"
        viewBox="0 0 280 380"
        fill="none"
      >
        <path
          d="M 20 380 L 20 140 A 120 120 0 0 1 260 140 L 260 380"
          stroke={COBRE_FRACO}
          strokeWidth="1.2"
          fill="none"
        />
        <circle cx="140" cy="140" r="3" fill={COBRE} opacity="0.7" />
      </svg>

      {/* Nome do dia logo abaixo do pontinho da lua, dentro do arco */}
      <div
        className="absolute inset-x-0 text-center font-sans"
        style={{
          top: 190,
          color: COBRE,
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: "0.42em",
          textTransform: "lowercase",
          textShadow: "0 1px 4px rgba(0,0,0,0.65)",
        }}
      >
        {diaLongo}
      </div>

      {/* Corpo: frase em itálico, centrada, respirando */}
      <main className="absolute inset-0 flex flex-col justify-center px-12 pt-10">
        <p
          className="font-serif italic text-center"
          style={{
            color: CREME,
            fontWeight: 400,
            fontSize: 24,
            lineHeight: 1.42,
            letterSpacing: "0.005em",
            textShadow:
              "0 2px 10px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.85)",
          }}
        >
          {phrase}
        </p>
      </main>

      {/* Assinatura: glifo + kicker centrados, seteveus.space por baixo */}
      <footer className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 px-12 pb-8">
        <div className="flex items-baseline justify-center gap-2">
          <span
            className="font-serif"
            style={{ color: COBRE, fontSize: 18, lineHeight: 1 }}
          >
            {glifo}
          </span>
          <span
            className="font-sans italic"
            style={{
              color: COBRE,
              fontSize: 13,
              letterSpacing: "0.08em",
              textShadow: "0 1px 4px rgba(0,0,0,0.6)",
            }}
          >
            {kicker}
          </span>
        </div>
        <div
          className="font-sans"
          style={{
            color: COBRE_FRACO,
            fontSize: 9,
            fontWeight: 400,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            textShadow: "0 1px 4px rgba(0,0,0,0.7)",
          }}
        >
          seteveus.space
        </div>
      </footer>

      {/* Cantoneira de cobre no topo esquerdo */}
      <div
        className="pointer-events-none absolute"
        style={{ left: 22, top: 22, width: 24, height: 1, background: COBRE_FRACO }}
      />
      <div
        className="pointer-events-none absolute"
        style={{ left: 22, top: 22, width: 1, height: 24, background: COBRE_FRACO }}
      />
    </div>
  );
}
