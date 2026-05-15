"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import seed from "@/data/hoje-em-mim-frases.seed.json";
import { MJ_VIDEO_PROMPTS } from "@/data/hoje-em-mim-mj-prompts";
import { HEM_THEMES, getTheme, DEFAULT_THEME_ID } from "@/lib/hoje-em-mim/themes";
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

type HemTab = "bulk" | "preview" | "motions" | "audios" | "prompts";
const HEM_TABS: Array<{ id: HemTab; label: string; icon: string }> = [
  { id: "bulk", label: "Pack mensal", icon: "📦" },
  { id: "preview", label: "Preview", icon: "🎬" },
  { id: "motions", label: "Motions + Runway", icon: "🎞" },
  { id: "audios", label: "Áudios", icon: "🔊" },
  { id: "prompts", label: "Prompts (Claude review)", icon: "✍️" },
];

export function HojeEmMimPreviewPanel() {
  const [activeTab, setActiveTab] = useState<HemTab>("bulk");
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
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [useAllMotions, setUseAllMotions] = useState<boolean>(true);
  const [useAllAudios, setUseAllAudios] = useState<boolean>(true);

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

      // Se "Usar todos os motions" está on, vai buscar a library inteira.
      // O servidor faz shuffle por defeito para evitar imagens iguais
      // em dias consecutivos.
      let motionPool: string[] = [media].filter(Boolean);
      let audioPoolList: string[] = audioUrlSelected ? [audioUrlSelected] : [];
      if (useAllMotions) {
        try {
          const r = await fetch("/api/admin/hoje-em-mim/motions");
          const j = await r.json();
          if (r.ok && Array.isArray(j.motions)) {
            motionPool = j.motions.map((m: { url: string }) => m.url);
          }
        } catch {
          /* mantém o single media como fallback */
        }
      }
      if (useAllAudios) {
        try {
          const r = await fetch("/api/admin/hoje-em-mim/audios");
          const j = await r.json();
          if (r.ok && j.audiosByMood) {
            const flat: string[] = [];
            for (const list of Object.values(j.audiosByMood)) {
              for (const a of list as Array<{ url: string }>) flat.push(a.url);
            }
            if (flat.length > 0) audioPoolList = flat;
          }
        } catch {
          /* mantém o single audio */
        }
      }

      const body = {
        jobId: id,
        ano,
        mes,
        diaInicio,
        diaFim,
        durationSec,
        motionPool,
        audioPool: audioPoolList,
        themePool: [themeId],
        shuffleMotions: true,
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

      <nav className="flex flex-wrap gap-1 border-b border-escola-border/40">
        {HEM_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`-mb-px rounded-t-md border-b-2 px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === t.id
                ? "border-escola-dourado bg-escola-dourado/10 text-escola-dourado"
                : "border-transparent text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {activeTab === "preview" && (
      <>
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
          themeId={themeId}
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
      </>
      )}

      {activeTab === "bulk" && (
      <>
      <section className="space-y-3 rounded-lg border border-escola-border bg-escola-card p-4">
        <h2 className="text-base font-serif" style={{ color: COBRE }}>
          📦 Bulk mensal · Pacote Metricool
        </h2>
        <p className="text-xs text-escola-creme-50">
          Define o range de dias, escolhe motion + áudio + tema globais, e
          submete o pack. Cria 1 vídeo por dia em paralelo via GitHub Actions.
        </p>
        <div className="grid grid-cols-2 gap-2 max-w-xl">
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
          <label className="text-[10px] block col-span-2">
            Tema visual (overlay)
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
              className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[11px] text-escola-creme"
            >
              {HEM_THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <span className="block mt-0.5 text-[10px] text-escola-creme-50/80 italic">
              {getTheme(themeId).notas}
            </span>
          </label>
          <label className="flex items-start gap-2 col-span-2 text-[11px] text-escola-creme cursor-pointer">
            <input
              type="checkbox"
              checked={useAllMotions}
              onChange={(e) => setUseAllMotions(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Usar todos os motions da library, embaralhados.
              <span className="block text-[10px] text-escola-creme-50">
                Evita que motions parecidos (várias variações do mesmo prompt)
                fiquem em dias consecutivos. Recomendado.
              </span>
            </span>
          </label>
          {!useAllMotions && (
            <label className="text-[10px] block col-span-2">
              Motion (URL único) — escolhe na tab Motions
              <input
                value={media}
                onChange={(e) => setMedia(e.target.value)}
                placeholder="/assets/hoje-em-mim/motions/…"
                className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 font-mono text-[10px] text-escola-creme"
              />
            </label>
          )}
          <label className="flex items-start gap-2 col-span-2 text-[11px] text-escola-creme cursor-pointer">
            <input
              type="checkbox"
              checked={useAllAudios}
              onChange={(e) => setUseAllAudios(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Usar todos os áudios da library, rodando por dia.
              <span className="block text-[10px] text-escola-creme-50">
                Cada dia ganha um áudio diferente do que tens em
                course-assets/hoje-em-mim-audios/. Recomendado.
              </span>
            </span>
          </label>
          {!useAllAudios && (
            <label className="text-[10px] block col-span-2">
              Áudio (URL único) — gera na tab Áudios
              <input
                value={audioUrlSelected}
                onChange={(e) => setAudioUrlSelected(e.target.value)}
                placeholder="vazio = sem som"
                className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 font-mono text-[10px] text-escola-creme"
              />
            </label>
          )}
        </div>
        <button
          onClick={submitJob}
          disabled={submitting || !rangeOk}
          className="w-full max-w-xl rounded border px-3 py-2 text-xs disabled:opacity-50 transition-colors"
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
          {numItens} jobs em paralelo no GitHub Actions (matrix). Cada item
          ~30s. Faz polling automático abaixo e mostra os MP4 conforme
          ficam prontos.
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
      </>
      )}

      {activeTab === "motions" && (
      <>
        <NightMotionLibrary selectedUrl={media} onSelect={setMedia} />
        <RunwayPipelineSection />
      </>
      )}

      {activeTab === "audios" && <AudioGeneratorSection />}

      {activeTab === "prompts" && <MjPromptsSection copied={copied} onCopy={copy} />}
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
            <JobVideoGrid videos={jobResult.videos} copied={copied} onCopy={onCopy} jobId={jobResult.jobId} />
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
  jobId,
}: {
  videos: JobVideoUI[];
  copied: string | null;
  onCopy: (key: string, text: string) => void;
  jobId: string;
}) {
  return (
    <div>
      <div className="text-xs text-escola-creme-50 mb-2">
        Todos os vídeos do pack ({videos.length}). Carrega "Editar" para
        substituir motion, áudio, tema ou frase e re-renderizar só esse dia.
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <JobVideoCard
            key={`${v.dayIndex}-${v.fraseId}`}
            video={v}
            jobId={jobId}
            copied={copied}
            onCopy={onCopy}
          />
        ))}
      </div>
    </div>
  );
}

function JobVideoCard({
  video,
  jobId,
  copied,
  onCopy,
}: {
  video: JobVideoUI;
  jobId: string;
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [motionUrl, setMotionUrl] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [themeOverride, setThemeOverride] = useState<string>("");
  const [fraseTexto, setFraseTexto] = useState<string>(video.fraseTexto ?? "");
  const [rerendering, setRerendering] = useState(false);
  const [rerenderError, setRerenderError] = useState<string | null>(null);

  const [motionsList, setMotionsList] = useState<Array<{ name: string; url: string }>>([]);
  const [audiosList, setAudiosList] = useState<Array<{ mood: string; name: string; url: string }>>([]);
  const [listsLoaded, setListsLoaded] = useState(false);

  const ensureListsLoaded = async () => {
    if (listsLoaded) return;
    try {
      const [mRes, aRes] = await Promise.all([
        fetch("/api/admin/hoje-em-mim/motions"),
        fetch("/api/admin/hoje-em-mim/audios"),
      ]);
      const mJson = await mRes.json();
      const aJson = await aRes.json();
      if (mRes.ok && Array.isArray(mJson.motions)) {
        setMotionsList(
          mJson.motions.map((m: { name: string; url: string }) => ({ name: m.name, url: m.url }))
        );
      }
      if (aRes.ok && aJson.audiosByMood) {
        const flat: Array<{ mood: string; name: string; url: string }> = [];
        for (const [mood, list] of Object.entries(aJson.audiosByMood)) {
          for (const a of list as Array<{ name: string; url: string }>) {
            flat.push({ mood, name: a.name, url: a.url });
          }
        }
        setAudiosList(flat);
      }
      setListsLoaded(true);
    } catch {
      /* silencioso */
    }
  };

  const reRender = async () => {
    setRerenderError(null);
    setRerendering(true);
    try {
      const overrides: {
        motionUrl?: string;
        audioUrl?: string | null;
        theme?: string;
        fraseTexto?: string;
      } = {};
      if (motionUrl.trim()) overrides.motionUrl = motionUrl.trim();
      if (audioUrl === "-") {
        overrides.audioUrl = null;
      } else if (audioUrl) {
        overrides.audioUrl = audioUrl;
      }
      if (themeOverride.trim()) overrides.theme = themeOverride.trim();
      if (fraseTexto.trim() && fraseTexto.trim() !== (video.fraseTexto ?? "").trim()) {
        overrides.fraseTexto = fraseTexto.trim();
      }
      const res = await fetch("/api/admin/hoje-em-mim/render-rerender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          dayIndex: video.dayIndex,
          overrides,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `HTTP ${res.status}`);
      setEditing(false);
    } catch (e) {
      setRerenderError(e instanceof Error ? e.message : String(e));
    } finally {
      setRerendering(false);
    }
  };

  return (
    <div className="rounded-lg border border-escola-border bg-escola-card p-3 space-y-2">
      <div className="flex items-baseline justify-between">
        <div className="text-xs" style={{ color: COBRE }}>
          {video.date} · {DIA_LONGO_PT[video.dia]}
        </div>
        <span className="text-[10px] text-escola-creme-50">{video.fraseId}</span>
      </div>

      {video.url ? (
        <>
          <video
            src={video.url}
            controls
            playsInline
            preload="metadata"
            className="aspect-[9/16] w-full bg-black rounded"
          />
          <div className="flex items-center justify-between gap-2 text-[10px]">
            {typeof video.sizeBytes === "number" && (
              <span className="text-escola-creme-50">
                {(video.sizeBytes / 1024 / 1024).toFixed(1)} MB
              </span>
            )}
            <a
              href={video.url}
              download
              target="_blank"
              rel="noreferrer"
              className="rounded border border-escola-border px-1.5 py-0.5 text-escola-dourado hover:text-escola-creme"
            >
              Descarregar ↓
            </a>
          </div>
        </>
      ) : video.error ? (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-[10px] text-red-300">
          {video.error}
        </div>
      ) : (
        <div className="aspect-[9/16] w-full rounded bg-escola-bg/40 flex items-center justify-center text-[10px] text-escola-creme-50">
          a renderizar…
        </div>
      )}

      <button
        onClick={async () => {
          if (!editing) await ensureListsLoaded();
          setEditing((v) => !v);
        }}
        className="w-full rounded border border-escola-border bg-escola-bg/60 px-2 py-1 text-[10px] text-escola-creme-50 hover:text-escola-creme"
      >
        {editing ? "Cancelar edição" : "Editar e re-renderizar este dia"}
      </button>

      {editing && (
        <div className="space-y-2 rounded border border-escola-border bg-escola-bg/50 p-2">
          <label className="block text-[10px] text-escola-creme-50">
            Motion alternativo
            <select
              value={motionUrl}
              onChange={(e) => setMotionUrl(e.target.value)}
              className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-1.5 py-1 text-[10px] text-escola-creme"
            >
              <option value="">manter ({truncateUrl(video.fraseId)})</option>
              {motionsList.map((m) => (
                <option key={m.url} value={m.url}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-[10px] text-escola-creme-50">
            Áudio alternativo
            <select
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-1.5 py-1 text-[10px] text-escola-creme"
            >
              <option value="">manter</option>
              <option value="-">sem áudio</option>
              {audiosList.map((a) => (
                <option key={a.url} value={a.url}>
                  {a.mood} · {a.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-[10px] text-escola-creme-50">
            Tema visual (cores)
            <select
              value={themeOverride}
              onChange={(e) => setThemeOverride(e.target.value)}
              className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-1.5 py-1 text-[10px] text-escola-creme"
            >
              <option value="">manter</option>
              {HEM_THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-[10px] text-escola-creme-50">
            Frase (editar texto)
            <textarea
              rows={3}
              value={fraseTexto}
              onChange={(e) => setFraseTexto(e.target.value)}
              className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-1.5 py-1 text-[10px] text-escola-creme"
            />
          </label>

          <button
            onClick={reRender}
            disabled={rerendering}
            className="w-full rounded border px-2 py-1 text-[11px] disabled:opacity-50"
            style={{
              borderColor: COBRE,
              color: COBRE,
              background: "rgba(194, 143, 96, 0.1)",
            }}
          >
            {rerendering ? "a re-renderizar…" : "Re-renderizar com estas mudanças"}
          </button>
          {rerenderError && (
            <div className="rounded border border-red-700/40 bg-red-900/20 p-1.5 text-[10px] text-red-300">
              {rerenderError}
            </div>
          )}
        </div>
      )}

      {video.captions && video.url && (
        <details className="text-[10px] text-escola-creme-50">
          <summary className="cursor-pointer hover:text-escola-creme">
            Captions
          </summary>
          <div className="mt-1 space-y-1">
            <CopyButton
              label="WhatsApp"
              text={video.captions.whatsapp}
              keyId={`wa-${video.dayIndex}`}
              copied={copied}
              onCopy={onCopy}
            />
            <CopyButton
              label="Instagram"
              text={video.captions.instagram}
              keyId={`ig-${video.dayIndex}`}
              copied={copied}
              onCopy={onCopy}
            />
            <CopyButton
              label="TikTok"
              text={video.captions.tiktok}
              keyId={`tt-${video.dayIndex}`}
              copied={copied}
              onCopy={onCopy}
            />
          </div>
        </details>
      )}
    </div>
  );
}

function truncateUrl(s: string): string {
  if (!s) return "";
  return s.length > 24 ? s.slice(0, 24) + "…" : s;
}

type AudioOutput = {
  url: string;
  mood: NightMood;
  durationSec: number;
  sizeBytes: number;
};

type RunwayImage = {
  name: string;
  url: string;
  sizeBytes: number;
  createdAt: string | null;
};

type RunwayStateItem = {
  id: string;
  imageUrl: string;
  imageName?: string;
  runwayMotion: string;
  promptRef?: string;
  duration: 5 | 10;
  ratio: "720:1280";
  runwayTaskId: string | null;
  clipUrl: string | null;
  error: string | null;
  submittedAt: string;
  completedAt: string | null;
};

type RunwayState = {
  items: RunwayStateItem[];
  updatedAt: string | null;
};

function RunwayPipelineSection() {
  const [images, setImages] = useState<RunwayImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [uploading, setUploading] = useState<{ done: number; total: number; current: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<RunwayState>({ items: [], updatedAt: null });
  const [polling, setPolling] = useState(false);

  // Por imagem, escolha de prompt MJ (para auto-preencher o motion).
  // Map imageName → promptId
  const [promptByImage, setPromptByImage] = useState<Record<string, string>>({});
  // Motion editável por imagem (default: prompt.runwayMotion)
  const [motionByImage, setMotionByImage] = useState<Record<string, string>>({});
  // Duração por imagem
  const [durationByImage, setDurationByImage] = useState<Record<string, 5 | 10>>({});

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadImages = async () => {
    setLoadingImages(true);
    setUploadError(null);
    try {
      const res = await fetch("/api/admin/hoje-em-mim/images");
      const json = await res.json();
      if (res.ok) setImages(json.images || []);
      else setUploadError(json.erro || `Erro ${res.status}`);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingImages(false);
    }
  };

  const loadState = async () => {
    try {
      const res = await fetch("/api/admin/hoje-em-mim/runway/state");
      const json = await res.json();
      if (res.ok) setState({ items: json.items || [], updatedAt: json.updatedAt });
    } catch {
      /* silencioso */
    }
  };

  useEffect(() => {
    loadImages();
    loadState();
  }, []);

  // Auto-poll de 20s enquanto há pending
  useEffect(() => {
    const hasPending = state.items.some((i) => i.runwayTaskId && !i.clipUrl);
    if (!hasPending) return;
    const interval = setInterval(() => {
      pollNow();
    }, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.items.map((i) => i.runwayTaskId).join(",")]);

  const pollNow = async () => {
    setPolling(true);
    try {
      await fetch("/api/admin/hoje-em-mim/runway/poll", { method: "POST" });
      await loadState();
    } catch {
      /* silencioso */
    } finally {
      setPolling(false);
    }
  };

  const uploadImages = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => /\.(png|jpe?g|webp)$/i.test(f.name));
    if (list.length === 0) {
      setUploadError("Sem PNG/JPG/WebP.");
      return;
    }
    setUploadError(null);
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      setUploading({ done: i, total: list.length, current: file.name });
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/admin/hoje-em-mim/images/upload", {
          method: "POST",
          body: form,
        });
        const json = await res.json();
        if (!res.ok) {
          setUploadError(`${file.name}: ${json.erro || `HTTP ${res.status}`}`);
          setUploading(null);
          await loadImages();
          return;
        }
      } catch (e) {
        setUploadError(`${file.name}: ${e instanceof Error ? e.message : String(e)}`);
        setUploading(null);
        await loadImages();
        return;
      }
    }
    setUploading(null);
    await loadImages();
  };

  const setPromptForImage = (imageName: string, promptId: string) => {
    setPromptByImage((p) => ({ ...p, [imageName]: promptId }));
    const mj = MJ_VIDEO_PROMPTS.find((x) => x.id === promptId);
    if (mj) {
      setMotionByImage((m) => ({ ...m, [imageName]: mj.runwayMotion }));
    }
  };

  const buildSubmitItem = (img: RunwayImage) => {
    const promptId = promptByImage[img.name] || "";
    const motion = motionByImage[img.name] || "";
    if (!motion.trim()) return null;
    const duration = durationByImage[img.name] || 5;
    // ID estável para o item Runway: derivado do imageName (sem extensão)
    const safeId = img.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .slice(0, 80);
    return {
      id: safeId,
      imageUrl: img.url,
      imageName: img.name,
      runwayMotion: motion.trim(),
      promptRef: promptId || undefined,
      duration,
    };
  };

  const submitOne = async (img: RunwayImage) => {
    const item = buildSubmitItem(img);
    if (!item) {
      setSubmitError(`${img.name}: motion prompt vazio. Escolhe um prompt MJ ou escreve um.`);
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/hoje-em-mim/runway/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [item] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `HTTP ${res.status}`);
      if (json.failed?.length > 0) {
        setSubmitError(`${json.failed[0].id}: ${json.failed[0].reason}`);
      }
      await loadState();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const submitAllUnsubmitted = async () => {
    const submittedImageNames = new Set(
      state.items
        .filter((i) => i.runwayTaskId || i.clipUrl)
        .map((i) => i.imageName)
        .filter((n): n is string => !!n)
    );
    const candidates = images
      .filter((img) => !submittedImageNames.has(img.name))
      .map((img) => buildSubmitItem(img))
      .filter((x): x is NonNullable<ReturnType<typeof buildSubmitItem>> => x !== null);
    if (candidates.length === 0) {
      setSubmitError("Nenhuma imagem com motion prompt definido para submeter.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/hoje-em-mim/runway/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: candidates }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `HTTP ${res.status}`);
      if (json.failed?.length > 0) {
        setSubmitError(`${json.failed.length} falhou: ${json.failed[0].reason}`);
      }
      await loadState();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  // Batch: revê todos os motion prompts das imagens carregadas via Claude
  // vision. Aplica cada sugestão directo no estado motionByImage.
  const [reviewingBatch, setReviewingBatch] = useState(false);
  const [reviewBatchStatus, setReviewBatchStatus] = useState<string>("");
  const [reviewBatchError, setReviewBatchError] = useState<string | null>(null);

  const reviewAllPrompts = async () => {
    if (images.length === 0) {
      setReviewBatchError("Sem imagens MJ carregadas.");
      return;
    }
    setReviewBatchError(null);
    setReviewingBatch(true);
    setReviewBatchStatus(`A enviar ${images.length} imagens ao Claude…`);
    try {
      const items = images.map((img) => {
        const pid = promptByImage[img.name] || "";
        const mj = pid ? MJ_VIDEO_PROMPTS.find((p) => p.id === pid) : null;
        return {
          id: img.name,
          imageUrl: img.url,
          scene: mj?.prompt,
          currentPrompt: motionByImage[img.name] ?? mj?.runwayMotion ?? "",
        };
      });
      const res = await fetch("/api/admin/hoje-em-mim/runway-prompts/review-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `HTTP ${res.status}`);
      const results = json.results || {};
      const next: Record<string, string> = { ...motionByImage };
      let applied = 0;
      let failed = 0;
      for (const [id, r] of Object.entries(results)) {
        const result = r as { suggestedPrompt?: string; error?: string };
        if (result.suggestedPrompt) {
          next[id] = result.suggestedPrompt;
          applied++;
        } else {
          failed++;
        }
      }
      setMotionByImage(next);
      setReviewBatchStatus(
        `Claude aplicou ${applied} sugestões${failed > 0 ? `, ${failed} falharam` : ""}.`
      );
    } catch (e) {
      setReviewBatchError(e instanceof Error ? e.message : String(e));
    } finally {
      setReviewingBatch(false);
    }
  };

  const pendingCount = state.items.filter((i) => i.runwayTaskId && !i.clipUrl).length;
  const doneCount = state.items.filter((i) => i.clipUrl).length;
  const failedCount = state.items.filter((i) => i.error && !i.clipUrl).length;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <h2 className="font-serif text-lg" style={{ color: COBRE }}>
          Imagens MJ → Runway Gen4 Turbo (motion library)
        </h2>
        <div className="flex gap-2 items-center text-[11px] text-escola-creme-50">
          <span>
            {state.items.length} no estado · {doneCount} prontos · {pendingCount} a renderizar
            {failedCount > 0 && ` · ${failedCount} falharam`}
          </span>
          <button
            onClick={pollNow}
            disabled={polling}
            className="rounded border border-escola-border bg-escola-card px-2 py-1 text-escola-creme-50 hover:text-escola-creme disabled:opacity-50"
          >
            {polling ? "a atualizar…" : "Atualizar"}
          </button>
        </div>
      </div>
      <p className="text-xs text-escola-creme-50">
        Pipeline: geras a imagem no Midjourney (9:16, com o prompt do cartão
        em baixo), fazes upload aqui, escolhes o prompt para preencher o
        motion automaticamente, e submetes à Runway. O MP4 resultante vai
        direto para o motion library no topo da página.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => imageInputRef.current?.click()}
          className="rounded border px-3 py-1.5 text-xs"
          style={{ borderColor: COBRE, color: COBRE, background: "rgba(194, 143, 96, 0.1)" }}
        >
          Upload imagens MJ
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) uploadImages(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          onClick={reviewAllPrompts}
          disabled={reviewingBatch || images.length === 0}
          className="rounded border px-3 py-1.5 text-xs disabled:opacity-50"
          style={{ borderColor: COBRE, color: COBRE, background: "rgba(194, 143, 96, 0.1)" }}
        >
          {reviewingBatch
            ? "Claude a rever…"
            : `🤖 Rever todos os ${images.length} motion prompts (Claude vision)`}
        </button>
        <button
          onClick={submitAllUnsubmitted}
          disabled={submitting || images.length === 0}
          className="rounded border px-3 py-1.5 text-xs disabled:opacity-50"
          style={{ borderColor: COBRE_FRACO, color: COBRE_FRACO, background: "rgba(194, 143, 96, 0.04)" }}
        >
          {submitting ? "a submeter…" : "Submeter todos os pendentes à Runway"}
        </button>
      </div>

      {reviewBatchStatus && (
        <div className="rounded border border-emerald-700/40 bg-emerald-900/15 p-2 text-xs text-emerald-300">
          {reviewBatchStatus}
        </div>
      )}
      {reviewBatchError && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-xs text-red-300">
          {reviewBatchError}
        </div>
      )}

      {uploading && (
        <div className="rounded border border-escola-dourado/40 bg-escola-dourado/10 p-2 text-xs text-escola-dourado">
          A carregar {uploading.done + 1}/{uploading.total}. {uploading.current}
        </div>
      )}
      {uploadError && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-xs text-red-300">
          {uploadError}
        </div>
      )}
      {submitError && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-xs text-red-300">
          {submitError}
        </div>
      )}

      {loadingImages ? (
        <div className="text-xs text-escola-creme-50">A carregar imagens…</div>
      ) : images.length === 0 ? (
        <div className="rounded border border-escola-border bg-escola-card/40 p-6 text-center text-xs text-escola-creme-50">
          Sem imagens MJ. Faz upload de pelo menos uma para começar.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => {
            const stateItem = state.items.find((s) => s.imageName === img.name);
            const promptId = promptByImage[img.name] || stateItem?.promptRef || "";
            const motion = motionByImage[img.name] ?? stateItem?.runwayMotion ?? "";
            const duration = durationByImage[img.name] ?? stateItem?.duration ?? 5;

            const statusBadge =
              stateItem?.clipUrl ? "✓ pronto" :
              stateItem?.runwayTaskId ? "a renderizar" :
              stateItem?.error ? "falhou" : null;

            return (
              <div key={img.url} className="rounded-lg border border-escola-border bg-escola-card p-3 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-[10px] text-escola-creme-50 flex-1" title={img.name}>
                    {img.name}
                  </span>
                  {statusBadge && (
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px]"
                      style={{
                        background: stateItem?.clipUrl
                          ? "rgba(16,185,129,0.15)"
                          : stateItem?.error
                            ? "rgba(127,29,29,0.25)"
                            : "rgba(194,143,96,0.18)",
                        color: stateItem?.clipUrl
                          ? "#6ee7b7"
                          : stateItem?.error
                            ? "#fca5a5"
                            : COBRE,
                      }}
                    >
                      {statusBadge}
                    </span>
                  )}
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full aspect-[9/16] object-cover rounded border border-escola-border"
                />

                <label className="block text-[10px] text-escola-creme-50">
                  Prompt MJ associado (auto-preenche motion)
                  <select
                    value={promptId}
                    onChange={(e) => setPromptForImage(img.name, e.target.value)}
                    className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[11px] text-escola-creme"
                  >
                    <option value="">— escolhe um —</option>
                    {MJ_VIDEO_PROMPTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} {p.prioritario ? "★" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-[10px] text-escola-creme-50">
                  Motion prompt (Runway)
                  <textarea
                    rows={4}
                    value={motion}
                    onChange={(e) => setMotionByImage((m) => ({ ...m, [img.name]: e.target.value }))}
                    placeholder="static camera, ... (descreve movimento específico, não genérico)"
                    className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 font-mono text-[10px] text-escola-creme"
                  />
                </label>

                <ClaudeReviewButton
                  imageUrl={img.url}
                  currentPrompt={motion}
                  scene={promptId ? MJ_VIDEO_PROMPTS.find((p) => p.id === promptId)?.prompt : undefined}
                  onAccept={(newPrompt) =>
                    setMotionByImage((m) => ({ ...m, [img.name]: newPrompt }))
                  }
                />

                <div className="flex items-center gap-2 text-[10px]">
                  <label className="text-escola-creme-50">
                    duração
                    <select
                      value={duration}
                      onChange={(e) => setDurationByImage((d) => ({ ...d, [img.name]: Number(e.target.value) as 5 | 10 }))}
                      className="ml-1 rounded border border-escola-border bg-escola-bg px-1.5 py-0.5 text-[11px] text-escola-creme"
                    >
                      <option value={5}>5s (poupa, faz loop)</option>
                      <option value={10}>10s</option>
                    </select>
                  </label>
                  <button
                    onClick={() => submitOne(img)}
                    disabled={submitting || !motion.trim() || (!!stateItem?.runwayTaskId)}
                    className="ml-auto rounded border px-2 py-0.5 text-[10px] disabled:opacity-50"
                    style={{ borderColor: COBRE, color: COBRE, background: "rgba(194, 143, 96, 0.1)" }}
                  >
                    {stateItem?.runwayTaskId ? "a renderizar" : stateItem?.clipUrl ? "re-submeter" : "Submeter"}
                  </button>
                </div>

                {stateItem?.clipUrl && (
                  <video
                    src={stateItem.clipUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full aspect-[9/16] bg-black rounded"
                  />
                )}
                {stateItem?.error && (
                  <div className="rounded border border-red-700/40 bg-red-900/20 p-1.5 text-[10px] text-red-300">
                    {stateItem.error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

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

  // Audio library (já gerados em Supabase). Mostra o que está herdado.
  const [library, setLibrary] = useState<Record<string, Array<{ name: string; url: string; sizeBytes: number }>>>({});
  const [loadingLib, setLoadingLib] = useState(true);
  const loadLibrary = async () => {
    setLoadingLib(true);
    try {
      const res = await fetch("/api/admin/hoje-em-mim/audios");
      const json = await res.json();
      if (res.ok) setLibrary(json.audiosByMood || {});
    } catch {
      /* silencioso */
    } finally {
      setLoadingLib(false);
    }
  };
  useEffect(() => {
    loadLibrary();
  }, []);

  // Batch: gera 1 áudio por cada mood (10 chamadas paralelas)
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);

  const gerarBatchTodosMoods = async () => {
    setBatchError(null);
    setBatchRunning(true);
    setBatchProgress({ done: 0, total: NIGHT_MOODS.length });
    let done = 0;
    let failed = 0;
    for (const m of NIGHT_MOODS) {
      try {
        const res = await fetch("/api/admin/hoje-em-mim/audio/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood: m, durationSec: DEFAULT_NIGHT_DURATION_SEC }),
        });
        if (!res.ok) failed++;
      } catch {
        failed++;
      }
      done++;
      setBatchProgress({ done, total: NIGHT_MOODS.length });
    }
    setBatchRunning(false);
    if (failed > 0) setBatchError(`${failed} mood(s) falharam.`);
    await loadLibrary();
  };

  const totalAudios = Object.values(library).reduce((acc, arr) => acc + arr.length, 0);

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

      <div className="border-t border-escola-border/40 pt-3 space-y-2">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h3 className="font-serif text-base" style={{ color: COBRE }}>
            Library de áudios já gerados ({totalAudios})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={loadLibrary}
              className="rounded border border-escola-border bg-escola-card px-2 py-1 text-[11px] text-escola-creme-50 hover:text-escola-creme"
            >
              Recarregar
            </button>
            <button
              onClick={gerarBatchTodosMoods}
              disabled={batchRunning}
              className="rounded border px-3 py-1 text-[11px] disabled:opacity-50"
              style={{ borderColor: COBRE, color: COBRE, background: "rgba(194, 143, 96, 0.1)" }}
            >
              {batchRunning
                ? `Gerar ${batchProgress?.done ?? 0}/${batchProgress?.total ?? NIGHT_MOODS.length}…`
                : `🔊 Gerar 1 áudio por cada um dos ${NIGHT_MOODS.length} moods (~$3 USD)`}
            </button>
          </div>
        </div>
        {batchError && (
          <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-[11px] text-red-300">
            {batchError}
          </div>
        )}
        {loadingLib ? (
          <div className="text-[11px] text-escola-creme-50">A carregar library…</div>
        ) : totalAudios === 0 ? (
          <div className="rounded border border-escola-border bg-escola-card/40 p-3 text-[11px] text-escola-creme-50 text-center">
            Sem áudios gerados ainda. Carrega no botão "Gerar 1 áudio por cada mood".
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {NIGHT_MOODS.map((m) => {
              const list = library[m] ?? [];
              if (list.length === 0) {
                return (
                  <div
                    key={m}
                    className="rounded border border-escola-border bg-escola-card/30 p-2"
                  >
                    <div className="text-[11px]" style={{ color: COBRE }}>
                      {NIGHT_MOOD_LABELS[m]}
                    </div>
                    <div className="text-[10px] text-escola-creme-50 italic">
                      sem áudio gerado
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={m}
                  className="rounded border border-escola-border bg-escola-card p-2 space-y-1.5"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px]" style={{ color: COBRE }}>
                      {NIGHT_MOOD_LABELS[m]}
                    </span>
                    <span className="text-[10px] text-escola-creme-50">{list.length}</span>
                  </div>
                  {list.slice(0, 2).map((a) => (
                    <div key={a.url} className="space-y-1">
                      <audio src={a.url} controls className="w-full h-7" />
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(a.url);
                          } catch {
                            /* ignore */
                          }
                        }}
                        className="w-full rounded border border-escola-border px-1 py-0.5 text-[9px] text-escola-creme-50 hover:text-escola-creme"
                      >
                        Copiar URL
                      </button>
                    </div>
                  ))}
                  {list.length > 2 && (
                    <div className="text-[9px] text-escola-creme-50">
                      mais {list.length - 2} mais antigo(s) no Supabase
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
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
          <span className="text-[10px] text-escola-creme-50">Midjourney (imagem)</span>
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

      <div className="rounded border border-escola-border bg-escola-bg p-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] text-escola-creme-50">Runway Gen4 Turbo (motion)</span>
          <button
            onClick={() => onCopy(`runway-${prompt.id}`, prompt.runwayMotion)}
            className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
              copied === `runway-${prompt.id}`
                ? "bg-escola-dourado text-escola-bg"
                : "border border-escola-border text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            {copied === `runway-${prompt.id}` ? "✓" : "Copiar"}
          </button>
        </div>
        <pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-snug text-escola-creme">
          {prompt.runwayMotion}
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
  themeId,
}: {
  phrase: string;
  kicker: string;
  glifo: string;
  diaLongo: string;
  media: string;
  isVideo: boolean;
  themeId?: string;
}) {
  const theme = getTheme(themeId);
  const COBRE_LOCAL = theme.highlight;
  const COBRE_FRACO_LOCAL = theme.highlightSoft;
  const CREME_LOCAL = theme.text;
  const BG_LOCAL = theme.bg;
  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-escola-border"
      style={{ width: 405, height: 720, background: BG_LOCAL }}
    >
      {isVideo ? (
        <video
          src={media}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(1.45) saturate(1.1) contrast(0.95)" }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(1.45) saturate(1.1) contrast(0.95)" }}
        />
      )}

      {/* Gradient scrim subtil. Sem blur (estava a fazer artefactos
          estranhos). Apenas uma sobreposição de cor de fundo no centro e
          no rodapé para dar contraste ao texto, sem distorcer o motion. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.32) 50%, rgba(0,0,0,0.32) 75%, rgba(0,0,0,0.55) 100%)",
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
          stroke={COBRE_FRACO_LOCAL}
          strokeWidth="1.2"
          fill="none"
        />
        <circle cx="140" cy="140" r="3" fill={COBRE_LOCAL} opacity="0.7" />
      </svg>

      {/* Nome do dia logo abaixo do pontinho da lua, dentro do arco */}
      <div
        className="absolute inset-x-0 text-center font-sans"
        style={{
          top: 190,
          color: COBRE_LOCAL,
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
            color: CREME_LOCAL,
            fontWeight: 400,
            fontSize: 24,
            lineHeight: 1.42,
            letterSpacing: "0.005em",
            textShadow:
              "0 2px 14px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.95), 0 1px 1px rgba(0,0,0,1)",
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
            style={{ color: COBRE_LOCAL, fontSize: 18, lineHeight: 1 }}
          >
            {glifo}
          </span>
          <span
            className="font-sans italic"
            style={{
              color: COBRE_LOCAL,
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
            color: COBRE_FRACO_LOCAL,
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
        style={{ left: 22, top: 22, width: 24, height: 1, background: COBRE_FRACO_LOCAL }}
      />
      <div
        className="pointer-events-none absolute"
        style={{ left: 22, top: 22, width: 1, height: 24, background: COBRE_FRACO_LOCAL }}
      />
    </div>
  );
}

function ClaudeReviewButton({
  imageUrl,
  currentPrompt,
  scene,
  onAccept,
}: {
  imageUrl: string;
  currentPrompt: string;
  scene?: string;
  onAccept: (newPrompt: string) => void;
}) {
  const [reviewing, setReviewing] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string>("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const review = async () => {
    setReviewing(true);
    setError(null);
    setSuggestion(null);
    setReasoning("");
    setConcerns([]);
    try {
      const res = await fetch("/api/admin/hoje-em-mim/runway-prompts/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, currentPrompt, scene }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `HTTP ${res.status}`);
      setSuggestion(json.suggestedPrompt);
      setReasoning(json.reasoning || "");
      setConcerns(Array.isArray(json.concerns) ? json.concerns : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <button
        onClick={review}
        disabled={reviewing}
        className="w-full rounded border px-2 py-1 text-[10px] disabled:opacity-50"
        style={{ borderColor: COBRE_FRACO, color: COBRE, background: "rgba(194, 143, 96, 0.06)" }}
      >
        {reviewing ? "Claude a olhar para a imagem…" : "🤖 Rever motion prompt com Claude (vision)"}
      </button>
      {error && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-1.5 text-[10px] text-red-300">
          {error}
        </div>
      )}
      {suggestion && (
        <div className="rounded border border-escola-dourado/40 bg-escola-dourado/5 p-2 space-y-1.5">
          <div className="text-[10px] text-escola-creme-50">Sugestão do Claude:</div>
          <pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-snug text-escola-creme">
            {suggestion}
          </pre>
          {reasoning && (
            <div className="text-[10px] italic text-escola-creme-50">{reasoning}</div>
          )}
          {concerns.length > 0 && (
            <ul className="text-[10px] text-amber-300 space-y-0.5">
              {concerns.map((c, i) => (
                <li key={i}>⚠ {c}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                onAccept(suggestion);
                setSuggestion(null);
              }}
              className="rounded border px-2 py-0.5 text-[10px]"
              style={{ borderColor: COBRE, color: COBRE, background: "rgba(194, 143, 96, 0.15)" }}
            >
              Usar sugestão
            </button>
            <button
              onClick={() => setSuggestion(null)}
              className="rounded border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-creme"
            >
              Manter o meu
            </button>
            <button
              onClick={review}
              className="rounded border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-creme"
            >
              Tentar de novo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
