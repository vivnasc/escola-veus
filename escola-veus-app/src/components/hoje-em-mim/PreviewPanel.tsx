"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import seed from "@/data/hoje-em-mim-frases.seed.json";
import { MJ_VIDEO_PROMPTS } from "@/data/hoje-em-mim-mj-prompts";
import { HEM_THEMES, getTheme, DEFAULT_THEME_ID } from "@/lib/hoje-em-mim/themes";
import {
  DIA_LONGO_PT,
  GLIFO_POR_DIA,
  GLIFO_ESPECIAL,
  KICKER_POR_DIA,
  KICKER_ESPECIAL,
  LABEL_POR_DIA,
  LABEL_ESPECIAL,
  detectDiaEspecial,
  diaSemanaHoje,
  phraseToCaptions,
  type DiaEspecial,
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
import { AutoTagMotionsSection } from "./AutoTagMotions";
import {
  planAudioSequence,
  planMotionSequence,
  seedFromRange,
  motionFamilyKey,
  MOOD_POR_DIA,
  MOOD_ESPECIAL,
  moodFromAudioUrl,
} from "@/lib/hoje-em-mim/pairing";

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

function isoDate(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

function diaFromIso(iso: string): DiaSemana {
  const [y, m, d] = iso.split("-").map(Number);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as DiaSemana[])[w];
}

/** Espelha o buildItems do servidor (sem shuffle, mas mostra a rotação
 *  que vai ser usada). Útil para preview-antes-de-submeter. */
function computePreviewItems(opts: {
  ano: number;
  mes: number;
  diaInicio: number;
  diaFim: number;
  motionPool: string[];
  audioPool: string[];
  moodByMotion?: Record<string, string>;
  frasesPorDia: Record<DiaSemana, Array<{ id: string; texto: string; dia: DiaSemana }>>;
  frasesEspeciais: Record<DiaEspecial, Array<{ id: string; texto: string }>>;
}): Array<{
  dayIndex: number;
  date: string;
  dia: DiaSemana;
  especial: DiaEspecial | null;
  fraseId: string;
  fraseTexto: string;
  motionUrl: string;
  audioUrl: string | null;
}> {
  const items: Array<{
    dayIndex: number;
    date: string;
    dia: DiaSemana;
    especial: DiaEspecial | null;
    fraseId: string;
    fraseTexto: string;
    motionUrl: string;
    audioUrl: string | null;
  }> = [];
  const fraseCursor: Record<DiaSemana, number> = {
    mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0,
  };
  const especialCursor: Record<DiaEspecial, number> = {
    fim_mes: 0, inicio_mes: 0, fim_ano: 0, inicio_ano: 0,
  };
  const startDate = isoDate(opts.ano, opts.mes, opts.diaInicio);
  const numDays = opts.diaFim - opts.diaInicio + 1;

  // Pré-calcula sequências sem repetição (motions) e por mood (audios)
  const seed = seedFromRange(opts.ano, opts.mes, opts.diaInicio);
  const diasMeta: Array<{ dia: DiaSemana; especial: DiaEspecial | null }> = [];
  for (let i = 0; i < numDays; i++) {
    const date = addDays(startDate, i);
    diasMeta.push({ dia: diaFromIso(date), especial: detectDiaEspecial(date) });
  }
  const motionSeq = planMotionSequence(opts.motionPool, numDays, seed, {
    moodByMotion: opts.moodByMotion,
    dias: diasMeta,
  });
  const audioSeq = planAudioSequence(opts.audioPool, diasMeta, seed);

  for (let i = 0; i < numDays; i++) {
    const date = addDays(startDate, i);
    const { dia, especial } = diasMeta[i];

    let frase: { id: string; texto: string } | null = null;
    if (especial && opts.frasesEspeciais[especial]?.length > 0) {
      const epool = opts.frasesEspeciais[especial];
      frase = epool[especialCursor[especial] % epool.length];
      especialCursor[especial]++;
    } else {
      const pool = opts.frasesPorDia[dia];
      if (!pool || pool.length === 0) continue;
      frase = pool[fraseCursor[dia] % pool.length];
      fraseCursor[dia]++;
    }

    items.push({
      dayIndex: i,
      date,
      dia,
      especial,
      fraseId: frase.id,
      fraseTexto: frase.texto,
      motionUrl: motionSeq[i] ?? "",
      audioUrl: audioSeq[i] ?? null,
    });
  }
  return items;
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
// O bulk já tem mini-frame de preview por linha (RowFramePreview), por
// isso a tab "Preview" standalone foi removida da navegação. O bloco
// activeTab === "preview" continua no código (mais abaixo) caso queiramos
// reintroduzi-la no futuro como "Test render single", mas hoje é
// inalcançável e a UI tem menos ruído.
const HEM_TABS: Array<{ id: HemTab; label: string; icon: string }> = [
  { id: "bulk", label: "Pack mensal", icon: "📦" },
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
  const [useAllAudios, setUseAllAudios] = useState<boolean>(true);

  // Libraries de motions e áudios disponíveis. Cada item pode ser
  // seleccionado ou deseleccionado individualmente para entrar no bulk.
  type MotionLib = { name: string; url: string; sizeBytes: number; createdAt: string | null };
  type AudioLib = { mood: string; name: string; url: string; sizeBytes: number };
  const [motionsLib, setMotionsLib] = useState<MotionLib[]>([]);
  const [audiosLib, setAudiosLib] = useState<AudioLib[]>([]);
  const [loadingMotionsLib, setLoadingMotionsLib] = useState(false);
  const [loadingAudiosLib, setLoadingAudiosLib] = useState(false);
  const [selectedMotionUrls, setSelectedMotionUrls] = useState<Set<string>>(new Set());
  const [selectedAudioUrls, setSelectedAudioUrls] = useState<Set<string>>(new Set());

  // Overrides per-dayIndex que a Vivianne edita inline na pré-montagem.
  // Anula a rotação automática quando há um valor aqui.
  type DayOverride = {
    fraseTexto?: string;
    motionUrl?: string;
    audioUrl?: string | null;
    theme?: string;
  };
  const [overridesByDay, setOverridesByDay] = useState<Record<number, DayOverride>>({});

  // Mood por motion URL (preenchido pelo auto-tag Claude). Permite que
  // a pairing alinhe motion com o ritual do dia (sexta = lareira, etc).
  const [moodByMotion, setMoodByMotion] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/hoje-em-mim/motion-prompts");
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (json.moodByMotion && typeof json.moodByMotion === "object") {
          setMoodByMotion(json.moodByMotion);
        }
      } catch {
        /* silencioso */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persistência dos overridesByDay. Carregamento per-mês ao mudar ano/mês,
  // gravação debounced para Supabase + localStorage imediato. Sem isto,
  // qualquer re-render que recalcule items perdia as edições inline.
  const monthKey = `${ano}-${String(mes).padStart(2, "0")}`;
  const [overridesLoaded, setOverridesLoaded] = useState(false);
  const [allMonthOverrides, setAllMonthOverrides] = useState<
    Record<string, Record<number, DayOverride>>
  >({});
  // Flag: utilizador já editou algo nesta sessão para este mês.
  // Sem isto, o fetch async do Supabase chega depois e clobbera
  // edições in-progress — que foi o que aconteceu antes (a Vivianne
  // editava motion/áudio e depois o render saía com a config antiga).
  const userEditedRef = useRef(false);
  useEffect(() => {
    let cancelled = false;
    setOverridesLoaded(false);
    userEditedRef.current = false;
    (async () => {
      // 1. localStorage imediato — serve enquanto Supabase responde
      let local: Record<string, Record<number, DayOverride>> | null = null;
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("hoje-em-mim.overrides");
          if (raw) local = JSON.parse(raw);
        } catch {
          /* ignore */
        }
      }
      if (local && !cancelled) {
        setAllMonthOverrides(local);
        setOverridesByDay(local[monthKey] ?? {});
      }
      // 2. Supabase (canónico) — só sobrescreve se utilizador ainda
      //    NÃO editou nada nesta sessão. Senão respeita o que está
      //    em memória e deixa o save debounced propagar.
      try {
        const res = await fetch("/api/admin/hoje-em-mim/overrides");
        if (cancelled) return;
        const json = await res.json();
        if (res.ok && json.byMonth) {
          if (!userEditedRef.current) {
            setAllMonthOverrides(json.byMonth);
            setOverridesByDay(json.byMonth[monthKey] ?? {});
          } else {
            // Apenas absorve outros meses, mantém o actual em memória
            setAllMonthOverrides((prev) => ({
              ...json.byMonth,
              [monthKey]: prev[monthKey] ?? {},
            }));
          }
        }
      } catch {
        /* silencioso */
      } finally {
        if (!cancelled) setOverridesLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // monthKey muda quando ano/mes mudam: recarrega overrides do mês certo
  }, [monthKey]);

  // Wrapper: marca "userEdited" sempre que setOverridesByDay é chamado
  // do user code. Garante que o fetch async não clobbera.
  const setOverridesByDayUserAction = useCallback(
    (next: Record<number, DayOverride> | ((prev: Record<number, DayOverride>) => Record<number, DayOverride>)) => {
      userEditedRef.current = true;
      setOverridesByDay(next);
    },
    []
  );

  useEffect(() => {
    if (!overridesLoaded) return;
    const next = { ...allMonthOverrides, [monthKey]: overridesByDay };
    setAllMonthOverrides(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hoje-em-mim.overrides", JSON.stringify(next));
      } catch {
        /* quota */
      }
    }
    const t = setTimeout(() => {
      fetch("/api/admin/hoje-em-mim/overrides", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ monthKey, overrides: overridesByDay }),
      }).catch(() => {
        /* silencioso, ainda temos localStorage */
      });
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overridesByDay, monthKey, overridesLoaded]);

  const loadMotionsLib = useCallback(async () => {
    setLoadingMotionsLib(true);
    try {
      const r = await fetch("/api/admin/hoje-em-mim/motions");
      const j = await r.json();
      if (r.ok && Array.isArray(j.motions)) {
        setMotionsLib(j.motions);
        setSelectedMotionUrls((prev) => {
          if (prev.size > 0) return prev;
          return new Set(j.motions.map((m: { url: string }) => m.url));
        });
      }
    } finally {
      setLoadingMotionsLib(false);
    }
  }, []);

  const loadAudiosLib = useCallback(async () => {
    setLoadingAudiosLib(true);
    try {
      const r = await fetch("/api/admin/hoje-em-mim/audios");
      const j = await r.json();
      if (r.ok && j.audiosByMood) {
        const flat: AudioLib[] = [];
        for (const [mood, list] of Object.entries(j.audiosByMood)) {
          for (const a of list as Array<{ name: string; url: string; sizeBytes: number }>) {
            flat.push({ mood, name: a.name, url: a.url, sizeBytes: a.sizeBytes });
          }
        }
        setAudiosLib(flat);
        setSelectedAudioUrls((prev) => {
          if (prev.size > 0) return prev;
          return new Set(flat.map((a) => a.url));
        });
      }
    } finally {
      setLoadingAudiosLib(false);
    }
  }, []);

  useEffect(() => {
    loadMotionsLib();
    loadAudiosLib();
  }, [loadMotionsLib, loadAudiosLib]);

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

  // Atalho: render rápido de UM vídeo para hoje, com a motion + áudio +
  // tema actualmente seleccionados. Não passa pelo useAllMotions: usa
  // exactamente o que está nos campos.
  const submitTodayQuick = async () => {
    setSubmitError(null);
    if (!media) {
      setSubmitError(
        "Sem motion seleccionado. Vai à tab Motions e escolhe um clip (ou cola URL em baixo)."
      );
      return;
    }
    setSubmitting(true);
    try {
      const today = new Date();
      const todayAno = today.getFullYear();
      const todayMes = today.getMonth() + 1;
      const todayDia = today.getDate();
      const id = `hoje-em-mim-${todayAno}-${String(todayMes).padStart(2, "0")}-${String(todayDia).padStart(2, "0")}-quick-${Date.now().toString(36)}`;
      const body = {
        jobId: id,
        ano: todayAno,
        mes: todayMes,
        diaInicio: todayDia,
        diaFim: todayDia,
        durationSec,
        motionPool: [media],
        audioPool: audioUrlSelected ? [audioUrlSelected] : [],
        themePool: [themeId],
        shuffleMotions: false,
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

      // Usa os clips e áudios que a utilizadora seleccionou nos pickers
      // visuais. Fallback: se nada estiver seleccionado, single media URL.
      let motionPool: string[] =
        selectedMotionUrls.size > 0
          ? Array.from(selectedMotionUrls)
          : [media].filter(Boolean);
      // Pool de áudio: TUDO o que existe na library. A pairing depois
      // escolhe o mood certo por dia. Não pedimos selecção manual.
      let audioPoolList: string[] = audiosLib.map((a) => a.url);
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
        moodByMotion,
        itemOverrides: Object.fromEntries(
          Object.entries(overridesByDay).filter(([, v]) =>
            v && (v.fraseTexto || v.motionUrl || v.audioUrl !== undefined || v.theme)
          )
        ),
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
      <QuickRenderPanel
        media={media}
        setMedia={setMedia}
        audioUrlSelected={audioUrlSelected}
        setAudioUrlSelected={setAudioUrlSelected}
        themeId={themeId}
        setThemeId={setThemeId}
        durationSec={durationSec}
        onRender={submitTodayQuick}
        submitting={submitting}
        submitError={submitError}
        phrase={phrase}
      />

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
        </div>

        <BulkClipPicker
          motions={motionsLib}
          loading={loadingMotionsLib}
          selected={selectedMotionUrls}
          onChange={setSelectedMotionUrls}
          onReload={loadMotionsLib}
        />

        <div
          className="rounded-lg border p-3 text-[11px] max-w-xl"
          style={{
            borderColor: COBRE_FRACO,
            background: "rgba(194, 143, 96, 0.04)",
          }}
        >
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div style={{ color: COBRE }} className="font-medium">
              🔊 Áudios — pareamento automático por mood do dia
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-escola-creme-50">
                {audiosLib.length} no library
              </span>
              <button
                onClick={loadAudiosLib}
                className="rounded border border-escola-border bg-escola-card px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-creme"
                title="Recarregar library"
              >
                ↻
              </button>
            </div>
          </div>
          <div className="mt-1 text-[10px] text-escola-creme-50 leading-snug">
            O sistema lê todos os áudios disponíveis e escolhe automaticamente
            o mood certo por dia: seg→grilos/brisa, ter→lareira/coro,
            qua→chuva/maré, qui→tigela, sex→tambor/lareira,
            sáb→coruja/brisa, dom→lua/sussurro. Vê o mood resultante por dia
            na pré-montagem abaixo (🔊 mood com ✓ quando casa com o motion).
            Para tirar um ficheiro mau específico do pool, vai à tab Áudios.
          </div>
        </div>

        <BulkPreviewTable
          ano={ano}
          mes={mes}
          diaInicio={diaInicio}
          diaFim={diaFim}
          motionPool={
            selectedMotionUrls.size > 0
              ? Array.from(selectedMotionUrls)
              : ([media].filter(Boolean) as string[])
          }
          audioPool={audiosLib.map((a) => a.url)}
          motionsLib={motionsLib}
          audiosLib={audiosLib}
          themeId={themeId}
          overrides={overridesByDay}
          onChangeOverrides={setOverridesByDayUserAction}
          moodByMotion={moodByMotion}
        />

        {(() => {
          const ovCount = Object.values(overridesByDay).filter(
            (v) =>
              v &&
              (v.fraseTexto || v.motionUrl || v.audioUrl !== undefined || v.theme)
          ).length;
          return (
            <div className="max-w-xl space-y-1">
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
              {ovCount > 0 && (
                <div
                  className="rounded border px-2 py-1 text-[10px]"
                  style={{
                    borderColor: COBRE_FRACO,
                    background: "rgba(194, 143, 96, 0.06)",
                    color: COBRE,
                  }}
                >
                  ✓ {ovCount} dia(s) com edição manual — vão para o render
                  exactamente como editaste (motion, áudio, frase, tema).
                </div>
              )}
            </div>
          );
        })()}
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
        <AutoTagMotionsSection />
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

          {jobResult.videos && jobResult.videos.some((v) => v.url) && (
            <MetricoolCsvButton videos={jobResult.videos} />
          )}

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

function MetricoolCsvButton({
  videos,
}: {
  videos: JobVideoUI[];
}) {
  const ready = videos.filter(
    (v): v is JobVideoUI & { url: string; captions: NonNullable<JobVideoUI["captions"]> } =>
      !!v.url && !!v.captions
  );
  if (ready.length === 0) return null;

  const download = async () => {
    const { buildHemCsv } = await import("@/lib/hoje-em-mim/metricool-csv");
    const csv = buildHemCsv(
      ready.map((v) => ({
        date: v.date,
        time: "19:00",
        videoUrl: v.url,
        captions: v.captions,
        fraseTexto: v.fraseTexto,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const first = ready[0].date;
    const last = ready[ready.length - 1].date;
    a.download = `hoje-em-mim-metricool-${first}-a-${last}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-escola-border bg-escola-card p-3 flex flex-wrap items-baseline justify-between gap-3">
      <div className="text-xs">
        <strong style={{ color: COBRE }}>
          📅 Pacote Metricool pronto
        </strong>
        <span className="ml-2 text-escola-creme-50">
          {ready.length} posts agendados às 19h em IG (Reel) + TikTok.
        </span>
      </div>
      <button
        onClick={download}
        className="rounded border px-3 py-1.5 text-xs"
        style={{ borderColor: COBRE, color: COBRE, background: "rgba(194, 143, 96, 0.1)" }}
      >
        Descarregar CSV Metricool ↓
      </button>
    </div>
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
  const failed = videos.filter((v) => !v.url);
  const ok = videos.filter((v) => v.url);
  const [filter, setFilter] = useState<"all" | "failed" | "ok">(
    failed.length > 0 ? "failed" : "all"
  );
  const [bulkRerendering, setBulkRerendering] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    done: number;
    total: number;
    current: number;
  } | null>(null);

  const visible =
    filter === "failed" ? failed : filter === "ok" ? ok : videos;
  // Falhados primeiro quando "all"
  const ordered =
    filter === "all" ? [...failed, ...ok] : visible;

  const rerenderAllFailed = async () => {
    if (failed.length === 0) return;
    if (!confirm(`Re-renderizar ${failed.length} dia(s) falhado(s)?`)) return;
    setBulkRerendering(true);
    setBulkProgress({ done: 0, total: failed.length, current: -1 });
    for (let i = 0; i < failed.length; i++) {
      const v = failed[i];
      setBulkProgress({ done: i, total: failed.length, current: v.dayIndex });
      try {
        await fetch("/api/admin/hoje-em-mim/render-rerender", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, dayIndex: v.dayIndex, overrides: {} }),
        });
      } catch {
        /* segue, mostra mensagem no card */
      }
    }
    setBulkProgress({ done: failed.length, total: failed.length, current: -1 });
    setBulkRerendering(false);
    alert(
      `${failed.length} re-render(s) lançados. Faz Recarregar daqui a ~30s para ver os MP4 actualizados.`
    );
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="text-escola-creme">
          {videos.length} dias ·{" "}
          <span className="text-emerald-400">✅ {ok.length} OK</span>
          {failed.length > 0 && (
            <span className="text-red-300"> · ❌ {failed.length} falhados</span>
          )}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setFilter("all")}
            className={`rounded border px-2 py-0.5 ${filter === "all" ? "border-escola-dourado text-escola-dourado" : "border-escola-border text-escola-creme-50"}`}
          >
            Tudo
          </button>
          {failed.length > 0 && (
            <button
              onClick={() => setFilter("failed")}
              className={`rounded border px-2 py-0.5 ${filter === "failed" ? "border-red-500 text-red-300 bg-red-900/20" : "border-escola-border text-escola-creme-50"}`}
            >
              Só falhados ({failed.length})
            </button>
          )}
          <button
            onClick={() => setFilter("ok")}
            className={`rounded border px-2 py-0.5 ${filter === "ok" ? "border-emerald-500 text-emerald-300" : "border-escola-border text-escola-creme-50"}`}
          >
            Só OK ({ok.length})
          </button>
        </div>
        {failed.length > 0 && (
          <button
            onClick={rerenderAllFailed}
            disabled={bulkRerendering}
            className="ml-auto rounded border border-red-700/60 bg-red-900/30 px-2 py-0.5 text-red-200 hover:bg-red-900/50 disabled:opacity-50"
          >
            {bulkRerendering
              ? `🔄 ${bulkProgress?.done ?? 0}/${bulkProgress?.total ?? failed.length}…`
              : `🔄 Re-renderizar ${failed.length} falhado(s)`}
          </button>
        )}
      </div>
      <div className="mb-2 text-[10px] text-escola-creme-50">
        Carrega "Editar" num card para substituir motion, áudio, tema ou frase
        e re-renderizar só esse dia. Para falhados, usa "Re-render" para tentar
        de novo com a mesma config.
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ordered.map((v) => (
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

  const isFailed = !video.url;
  return (
    <div
      className="rounded-lg border p-3 space-y-2"
      style={{
        borderColor: isFailed ? "rgba(220, 38, 38, 0.6)" : undefined,
        background: isFailed ? "rgba(127, 29, 29, 0.12)" : undefined,
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-xs" style={{ color: COBRE }}>
          {video.date} · {DIA_LONGO_PT[video.dia]}
          {isFailed && (
            <span className="ml-2 rounded bg-red-900/50 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-red-200">
              ❌ falhou
            </span>
          )}
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

  // Persistência: carrega no mount + auto-save com debounce. Garante que
  // as sugestões do Claude e edições manuais sobrevivem a refresh/F5
  // e mudança de device.
  const [draftsLoaded, setDraftsLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Primeiro o localStorage (imediato), depois Supabase (canónico).
      try {
        if (typeof window !== "undefined") {
          const local = localStorage.getItem("hoje-em-mim.runway-drafts");
          if (local) {
            const parsed = JSON.parse(local);
            if (!cancelled) {
              if (parsed.motions) setMotionByImage(parsed.motions);
              if (parsed.prompts) setPromptByImage(parsed.prompts);
              if (parsed.durations) setDurationByImage(parsed.durations);
            }
          }
        }
        const res = await fetch("/api/admin/hoje-em-mim/motion-prompts");
        if (cancelled) return;
        const json = await res.json();
        if (res.ok) {
          if (json.motions && Object.keys(json.motions).length > 0) {
            setMotionByImage(json.motions);
          }
          if (json.prompts && Object.keys(json.prompts).length > 0) {
            setPromptByImage(json.prompts);
          }
          if (json.durations && Object.keys(json.durations).length > 0) {
            setDurationByImage(json.durations);
          }
        }
      } catch {
        /* silencioso */
      } finally {
        if (!cancelled) setDraftsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-save debounced: localStorage imediato, Supabase com 1.5s delay.
  useEffect(() => {
    if (!draftsLoaded) return;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "hoje-em-mim.runway-drafts",
          JSON.stringify({
            motions: motionByImage,
            prompts: promptByImage,
            durations: durationByImage,
          })
        );
      } catch {
        /* quota cheia? silencioso */
      }
    }
    const t = setTimeout(() => {
      fetch("/api/admin/hoje-em-mim/motion-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          motions: motionByImage,
          prompts: promptByImage,
          durations: durationByImage,
        }),
      }).catch(() => {
        /* silencioso, ainda temos localStorage */
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [draftsLoaded, motionByImage, promptByImage, durationByImage]);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  // Estado per-imagem para acções individuais (submit, claude review).
  // Permite clicar Submeter em 3 cards diferentes em paralelo sem
  // bloquear o resto da UI ou o botão de bulk. Padrão herdado do
  // funil-gerar (src/app/admin/producao/funil/gerar/page.tsx).
  const [busyByImage, setBusyByImage] = useState<Record<string, boolean>>({});
  const [errorByImage, setErrorByImage] = useState<Record<string, string>>({});

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
      setErrorByImage((e) => ({
        ...e,
        [img.name]: "motion prompt vazio. Escolhe um prompt MJ ou escreve um.",
      }));
      return;
    }
    // State per-imagem: não bloqueia o resto da UI. Podes clicar Submeter
    // em vários cards em simultâneo.
    setBusyByImage((b) => ({ ...b, [img.name]: true }));
    setErrorByImage((e) => {
      const next = { ...e };
      delete next[img.name];
      return next;
    });
    try {
      const res = await fetch("/api/admin/hoje-em-mim/runway/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [item] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `HTTP ${res.status}`);
      if (json.failed?.length > 0) {
        setErrorByImage((e) => ({
          ...e,
          [img.name]: json.failed[0].reason,
        }));
      }
      await loadState();
    } catch (e) {
      setErrorByImage((errs) => ({
        ...errs,
        [img.name]: e instanceof Error ? e.message : String(e),
      }));
    } finally {
      setBusyByImage((b) => {
        const next = { ...b };
        delete next[img.name];
        return next;
      });
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
    setSubmitSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/hoje-em-mim/runway/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: candidates }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `HTTP ${res.status}`);
      const submitted = json.submitted ?? 0;
      const failedN = json.failed?.length ?? 0;
      if (failedN > 0) {
        setSubmitError(`${failedN} falhou: ${json.failed[0].reason}`);
      }
      if (submitted > 0) {
        setSubmitSuccess(
          `✓ ${submitted} submetidos à Runway. Vão aparecer com status "a renderizar" e a Runway entrega em 1-3 min cada.`
        );
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

  const reviewAllPrompts = async (): Promise<Record<string, string>> => {
    if (images.length === 0) {
      setReviewBatchError("Sem imagens MJ carregadas.");
      return motionByImage;
    }
    setReviewBatchError(null);
    setReviewingBatch(true);

    // Skip images que já têm clip gerado com sucesso ou task em curso.
    // Não vale a pena gastar Claude credits a re-rever motions já feitos.
    const alreadyDone = new Set(
      state.items
        .filter((i) => i.clipUrl || i.runwayTaskId)
        .map((i) => i.imageName)
        .filter((n): n is string => !!n)
    );
    const imagesToReview = images.filter((img) => !alreadyDone.has(img.name));
    if (imagesToReview.length === 0) {
      setReviewBatchStatus(
        `Todas as ${images.length} imagens já têm clip ou task em curso. Nada para rever.`
      );
      setReviewingBatch(false);
      return motionByImage;
    }
    const skipped = images.length - imagesToReview.length;
    if (skipped > 0) {
      setReviewBatchStatus(
        `A saltar ${skipped} imagens já com clip. A rever ${imagesToReview.length} pendentes…`
      );
    }

    const allItems = imagesToReview.map((img) => {
      const pid = promptByImage[img.name] || "";
      const mj = pid ? MJ_VIDEO_PROMPTS.find((p) => p.id === pid) : null;
      return {
        id: img.name,
        imageUrl: img.url,
        scene: mj?.prompt,
        currentPrompt: motionByImage[img.name] ?? mj?.runwayMotion ?? "",
      };
    });

    // O endpoint /review-batch aceita no máximo 30 items por chamada.
    // Quando há mais (típico: 30-50 imagens MJ), partimos em chunks de 25
    // e enviamos sequencialmente. Mostramos progresso à utilizadora.
    const CHUNK_SIZE = 25;
    const chunks: Array<typeof allItems> = [];
    for (let i = 0; i < allItems.length; i += CHUNK_SIZE) {
      chunks.push(allItems.slice(i, i + CHUNK_SIZE));
    }

    const next: Record<string, string> = { ...motionByImage };
    let applied = 0;
    let failed = 0;

    try {
      for (let i = 0; i < chunks.length; i++) {
        setReviewBatchStatus(
          chunks.length === 1
            ? `Claude a olhar para ${chunks[i].length} imagens…`
            : `Claude a rever batch ${i + 1}/${chunks.length} (${chunks[i].length} imagens)…`
        );
        const res = await fetch("/api/admin/hoje-em-mim/runway-prompts/review-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: chunks[i] }),
        });
        const json = await res.json();
        if (!res.ok) {
          // Em vez de abortar, regista a falha e segue para o próximo chunk
          failed += chunks[i].length;
          continue;
        }
        const results = json.results || {};
        for (const [id, r] of Object.entries(results)) {
          const result = r as { suggestedPrompt?: string; error?: string };
          if (result.suggestedPrompt) {
            next[id] = result.suggestedPrompt;
            applied++;
          } else {
            failed++;
          }
        }
        // Aplica incrementalmente para a utilizadora ver os prompts a
        // serem preenchidos chunk a chunk
        setMotionByImage({ ...next });
      }
      setReviewBatchStatus(
        `Claude aplicou ${applied} sugestões${failed > 0 ? `, ${failed} falharam` : ""}.`
      );
    } catch (e) {
      setReviewBatchError(e instanceof Error ? e.message : String(e));
    } finally {
      setReviewingBatch(false);
    }
    return next;
  };

  // Combo: Claude review chunked + Runway submit num click. Usa o map
  // de motions devolvido pelo review (evita stale closure de
  // motionByImage entre setState e submit).
  const reviewAndSubmitAll = async () => {
    const nextMotions = await reviewAllPrompts();

    const submittedNames = new Set(
      state.items
        .filter((i) => i.runwayTaskId || i.clipUrl)
        .map((i) => i.imageName)
        .filter((n): n is string => !!n)
    );
    const candidates = images
      .filter((img) => !submittedNames.has(img.name))
      .map((img) => {
        const motion = (nextMotions[img.name] ?? "").trim();
        if (!motion) return null;
        const pid = promptByImage[img.name] || "";
        const duration = durationByImage[img.name] || 5;
        const safeId = img.name
          .replace(/\.[^.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9-]+/g, "-")
          .slice(0, 80);
        return {
          id: safeId,
          imageUrl: img.url,
          imageName: img.name,
          runwayMotion: motion,
          promptRef: pid || undefined,
          duration,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (candidates.length === 0) {
      setSubmitError(
        "Sem candidatos para Runway. Claude pode ter falhado todos os prompts."
      );
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/hoje-em-mim/runway/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: candidates }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || `HTTP ${res.status}`);
      const submitted = json.submitted ?? 0;
      const failedN = json.failed?.length ?? 0;
      if (failedN > 0) {
        setSubmitError(`${failedN} falhou: ${json.failed[0].reason}`);
      }
      if (submitted > 0) {
        setSubmitSuccess(
          `✓ ${submitted} submetidos à Runway. Vão aparecer com status "a renderizar" e a Runway entrega em 1-3 min cada.`
        );
      }
      await loadState();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = state.items.filter((i) => i.runwayTaskId && !i.clipUrl).length;
  const doneCount = state.items.filter((i) => i.clipUrl).length;
  const failedCount = state.items.filter((i) => i.error && !i.clipUrl).length;

  // Pré-calcula candidatos ao submit-all para mostrar contagem no botão.
  // Imagens elegíveis: sem taskId pendente, sem clipUrl, COM motion prompt.
  const submittedNames = new Set(
    state.items
      .filter((i) => i.runwayTaskId || i.clipUrl)
      .map((i) => i.imageName)
      .filter((n): n is string => !!n)
  );
  const eligibleForSubmit = images.filter((img) => {
    if (submittedNames.has(img.name)) return false;
    const motion = motionByImage[img.name] ?? "";
    return motion.trim().length > 0;
  });
  const missingMotion = images.filter((img) => {
    if (submittedNames.has(img.name)) return false;
    const motion = motionByImage[img.name] ?? "";
    return motion.trim().length === 0;
  });

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
          onClick={reviewAndSubmitAll}
          disabled={reviewingBatch || submitting || images.length === 0}
          className="rounded border px-3 py-1.5 text-xs disabled:opacity-50 font-medium"
          style={{
            borderColor: COBRE,
            color: "#FFF8E8",
            background: COBRE,
          }}
        >
          {reviewingBatch
            ? "Claude a rever…"
            : submitting
              ? "a submeter à Runway…"
              : `✨ Claude review + Runway submit (${images.length})`}
        </button>
        <button
          onClick={reviewAllPrompts}
          disabled={reviewingBatch || images.length === 0}
          className="rounded border px-3 py-1.5 text-xs disabled:opacity-50"
          style={{ borderColor: COBRE, color: COBRE, background: "rgba(194, 143, 96, 0.1)" }}
        >
          {reviewingBatch
            ? "Claude a rever…"
            : `🤖 Só rever com Claude (${images.length})`}
        </button>
        <button
          onClick={submitAllUnsubmitted}
          disabled={submitting || eligibleForSubmit.length === 0}
          className="rounded border px-3 py-1.5 text-xs disabled:opacity-50"
          style={{
            borderColor: eligibleForSubmit.length > 0 ? COBRE : COBRE_FRACO,
            color: eligibleForSubmit.length > 0 ? COBRE : COBRE_FRACO,
            background:
              eligibleForSubmit.length > 0
                ? "rgba(194, 143, 96, 0.1)"
                : "rgba(194, 143, 96, 0.04)",
          }}
        >
          {submitting
            ? "a submeter…"
            : eligibleForSubmit.length === 0
              ? missingMotion.length > 0
                ? `${missingMotion.length} sem motion — corre o review primeiro`
                : "Nada para submeter"
              : `▶ Só submeter ${eligibleForSubmit.length} à Runway`}
        </button>
      </div>

      {missingMotion.length > 0 && eligibleForSubmit.length > 0 && (
        <div className="rounded border border-amber-700/40 bg-amber-900/15 p-2 text-[11px] text-amber-300">
          ⚠ {missingMotion.length} imagem{missingMotion.length === 1 ? "" : "ns"} sem
          motion prompt definido. Vão ficar de fora do submit. Corre "Rever
          todos os motion prompts" ou preenche manualmente nos cards.
        </div>
      )}

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
      {submitSuccess && (
        <div className="rounded border border-emerald-700/40 bg-emerald-900/20 p-2 text-xs text-emerald-300 flex items-baseline justify-between gap-2">
          <span>{submitSuccess}</span>
          <button
            onClick={() => setSubmitSuccess(null)}
            className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
          >
            fechar
          </button>
        </div>
      )}
      {submitError && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-xs text-red-300 flex items-baseline justify-between gap-2">
          <span>{submitError}</span>
          <button
            onClick={() => setSubmitError(null)}
            className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
          >
            fechar
          </button>
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
                    disabled={!!busyByImage[img.name] || !motion.trim() || (!!stateItem?.runwayTaskId)}
                    className="ml-auto rounded border px-2 py-0.5 text-[10px] disabled:opacity-50"
                    style={{ borderColor: COBRE, color: COBRE, background: "rgba(194, 143, 96, 0.1)" }}
                  >
                    {busyByImage[img.name]
                      ? "a submeter…"
                      : stateItem?.runwayTaskId
                        ? "a renderizar"
                        : stateItem?.clipUrl
                          ? "re-submeter"
                          : "Submeter"}
                  </button>
                </div>

                {errorByImage[img.name] && (
                  <div className="rounded border border-red-700/40 bg-red-900/20 p-1.5 text-[10px] text-red-300">
                    {errorByImage[img.name]}
                  </div>
                )}

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
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={loadLibrary}
              className="rounded border border-escola-border bg-escola-card px-2 py-1 text-[11px] text-escola-creme-50 hover:text-escola-creme"
            >
              Recarregar
            </button>
            <button
              onClick={async () => {
                if (!confirm("Apaga todos os áudios inválidos (corruptos/zero-bytes)?")) return;
                try {
                  const res = await fetch("/api/admin/hoje-em-mim/audios/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cleanInvalid: true, minBytes: 1024 }),
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.erro || `HTTP ${res.status}`);
                  alert(`Apagados ${json.deleted} áudios inválidos.`);
                  await loadLibrary();
                } catch (e) {
                  alert(e instanceof Error ? e.message : String(e));
                }
              }}
              className="rounded border border-red-700/40 bg-red-900/20 px-2 py-1 text-[11px] text-red-300 hover:bg-red-900/30"
            >
              🗑 Limpar inválidos
            </button>
            <button
              onClick={async () => {
                if (
                  !confirm(
                    "Apaga áudios repetidos: para cada mood mantém só o mais recente. Confirma?"
                  )
                )
                  return;
                try {
                  const res = await fetch("/api/admin/hoje-em-mim/audios/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ keepOnePerMood: true }),
                  });
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.erro || `HTTP ${res.status}`);
                  alert(`Apagados ${json.deleted} áudios repetidos (ficou 1 por mood).`);
                  await loadLibrary();
                } catch (e) {
                  alert(e instanceof Error ? e.message : String(e));
                }
              }}
              className="rounded border border-red-700/40 bg-red-900/20 px-2 py-1 text-[11px] text-red-300 hover:bg-red-900/30"
              title="Mantém só o ficheiro mais recente de cada mood. Apaga os repetidos."
            >
              🗑 Manter só 1 por mood
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
                  {list.map((a) => {
                    // Extrai o path para o delete: tira tudo até bucket
                    const match = a.url.match(
                      /course-assets\/(hoje-em-mim-audios\/[^?]+)/
                    );
                    const path = match ? match[1] : null;
                    return (
                      <div
                        key={a.url}
                        className="space-y-1 rounded border border-escola-border/40 p-1"
                      >
                        <audio src={a.url} controls className="w-full h-7" />
                        <div className="flex gap-1">
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(a.url);
                              } catch {
                                /* ignore */
                              }
                            }}
                            className="flex-1 rounded border border-escola-border px-1 py-0.5 text-[9px] text-escola-creme-50 hover:text-escola-creme"
                          >
                            Copiar URL
                          </button>
                          {path && (
                            <button
                              onClick={async () => {
                                if (!confirm(`Apagar ${a.url.split("/").pop()}?`)) return;
                                try {
                                  const res = await fetch(
                                    "/api/admin/hoje-em-mim/audios/delete",
                                    {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ path }),
                                    }
                                  );
                                  const json = await res.json();
                                  if (!res.ok)
                                    throw new Error(
                                      json.erro || `HTTP ${res.status}`
                                    );
                                  await loadLibrary();
                                } catch (e) {
                                  alert(
                                    e instanceof Error ? e.message : String(e)
                                  );
                                }
                              }}
                              title="Apagar este ficheiro"
                              className="rounded border border-red-700/40 bg-red-900/20 px-1.5 py-0.5 text-[9px] text-red-300 hover:bg-red-900/30"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
  const [observed, setObserved] = useState<string>("");
  const [dynamicElement, setDynamicElement] = useState<string>("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const review = async () => {
    setReviewing(true);
    setError(null);
    setSuggestion(null);
    setReasoning("");
    setObserved("");
    setDynamicElement("");
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
      setObserved(json.observed || "");
      setDynamicElement(json.dynamicElement || "");
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
          {observed && (
            <div className="text-[10px] text-escola-creme-50">
              <span className="font-medium" style={{ color: COBRE }}>O que viu:</span>{" "}
              <span className="text-escola-creme">{observed}</span>
            </div>
          )}
          {dynamicElement && (
            <div className="text-[10px] text-escola-creme-50">
              <span className="font-medium" style={{ color: COBRE }}>Elemento a mexer:</span>{" "}
              <span className="text-escola-creme">{dynamicElement}</span>
            </div>
          )}
          <div className="text-[10px] text-escola-creme-50">Motion prompt:</div>
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

/**
 * QuickRenderPanel — tudo o que precisas para fazer 1 vídeo HOJE,
 * inline numa só vista:
 *   1. Picker visual de motion (thumbnails do library)
 *   2. Picker de áudio agrupado por mood
 *   3. Picker de tema (paletas de cor + amostra)
 *   4. Preview da frase do dia
 *   5. Botão grande "Render para hoje"
 *
 * Não precisas de ir a outras tabs.
 */
function QuickRenderPanel({
  media,
  setMedia,
  audioUrlSelected,
  setAudioUrlSelected,
  themeId,
  setThemeId,
  durationSec,
  onRender,
  submitting,
  submitError,
  phrase,
}: {
  media: string;
  setMedia: (s: string) => void;
  audioUrlSelected: string;
  setAudioUrlSelected: (s: string) => void;
  themeId: string;
  setThemeId: (s: string) => void;
  durationSec: number;
  onRender: () => void;
  submitting: boolean;
  submitError: string | null;
  phrase: Frase;
}) {
  const [motions, setMotions] = useState<Array<{ name: string; url: string }>>([]);
  const [audios, setAudios] = useState<Record<string, Array<{ name: string; url: string }>>>({});
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    fetch("/api/admin/hoje-em-mim/motions")
      .then((r) => r.json())
      .then((j) => setMotions(j.motions || []))
      .catch(() => {});
    fetch("/api/admin/hoje-em-mim/audios")
      .then((r) => r.json())
      .then((j) => setAudios(j.audiosByMood || {}))
      .catch(() => {});
  }, []);

  const theme = getTheme(themeId);
  const audioLabel = audioUrlSelected
    ? audioUrlSelected.split("/").pop()?.slice(0, 30)
    : "sem som";
  const motionLabel = media ? media.split("/").pop()?.slice(0, 40) : "nenhum";

  return (
    <section
      className="space-y-4 rounded-lg border-2 p-4"
      style={{ borderColor: COBRE, background: "rgba(194, 143, 96, 0.06)" }}
    >
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-lg font-serif" style={{ color: COBRE }}>
          ⚡ Render para hoje
        </h2>
        <span className="text-[11px] text-escola-creme-50">
          {phrase.texto.slice(0, 60)}…
        </span>
      </div>

      {/* Resumo das escolhas + jump-to-step */}
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <button
          onClick={() => setStep(1)}
          className="rounded border p-2 text-left transition-colors"
          style={{
            borderColor: step === 1 ? COBRE : "rgba(245, 240, 230, 0.16)",
            background: step === 1 ? "rgba(194, 143, 96, 0.12)" : "transparent",
          }}
        >
          <div className="text-[9px] uppercase tracking-wider text-escola-creme-50">
            1 · Imagem (motion)
          </div>
          <div className="mt-0.5 truncate font-mono text-[10px] text-escola-creme">
            {motionLabel}
          </div>
        </button>
        <button
          onClick={() => setStep(2)}
          className="rounded border p-2 text-left transition-colors"
          style={{
            borderColor: step === 2 ? COBRE : "rgba(245, 240, 230, 0.16)",
            background: step === 2 ? "rgba(194, 143, 96, 0.12)" : "transparent",
          }}
        >
          <div className="text-[9px] uppercase tracking-wider text-escola-creme-50">
            2 · Som
          </div>
          <div className="mt-0.5 truncate text-[10px] text-escola-creme">
            {audioLabel}
          </div>
        </button>
        <button
          onClick={() => setStep(3)}
          className="rounded border p-2 text-left transition-colors"
          style={{
            borderColor: step === 3 ? COBRE : "rgba(245, 240, 230, 0.16)",
            background: step === 3 ? "rgba(194, 143, 96, 0.12)" : "transparent",
          }}
        >
          <div className="text-[9px] uppercase tracking-wider text-escola-creme-50">
            3 · Tema (contraste)
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ background: theme.highlight }}
            />
            <span className="truncate text-[10px] text-escola-creme">
              {theme.label}
            </span>
          </div>
        </button>
      </div>

      {/* Step 1: Motion picker */}
      {step === 1 && (
        <div className="space-y-2">
          <div className="text-xs text-escola-creme-50">
            Clica numa imagem para escolher o motion. Carrega vídeos no Supabase
            via tab Motions ou cola URL manual em baixo.
          </div>
          {motions.length === 0 ? (
            <div className="rounded border border-escola-border bg-escola-card/40 p-3 text-[11px] text-escola-creme-50">
              Sem motions no library. Vai à tab Motions para fazer upload, ou cola
              URL em baixo.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 max-h-72 overflow-y-auto">
              {motions.map((m) => (
                <button
                  key={m.url}
                  onClick={() => setMedia(m.url)}
                  className={`relative overflow-hidden rounded border transition-all ${
                    media === m.url
                      ? "ring-2"
                      : "border-escola-border hover:border-escola-dourado/60"
                  }`}
                  style={{
                    borderColor: media === m.url ? COBRE : undefined,
                    boxShadow: media === m.url ? `0 0 0 2px ${COBRE}` : undefined,
                  }}
                  title={m.name}
                >
                  <video
                    src={m.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="aspect-[9/16] w-full bg-black object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 text-[9px] text-escola-creme">
                    {m.name.slice(0, 20)}
                  </div>
                </button>
              ))}
            </div>
          )}
          <label className="block text-[10px] text-escola-creme-50">
            Ou cola URL directa:
            <input
              value={media}
              onChange={(e) => setMedia(e.target.value)}
              placeholder="https://… ou /assets/hoje-em-mim/motions/…"
              className="mt-0.5 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 font-mono text-[10px] text-escola-creme"
            />
          </label>
          <button
            onClick={() => setStep(2)}
            className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-[11px] text-escola-creme-50 hover:text-escola-creme"
          >
            → Próximo (som)
          </button>
        </div>
      )}

      {/* Step 2: Audio picker */}
      {step === 2 && (
        <div className="space-y-2">
          <div className="text-xs text-escola-creme-50">
            Clica num áudio para escolher. Gera novos na tab Áudios.
          </div>
          <button
            onClick={() => setAudioUrlSelected("")}
            className={`rounded border px-2 py-1 text-[11px] ${
              !audioUrlSelected ? "ring-2" : ""
            }`}
            style={{
              borderColor: !audioUrlSelected ? COBRE : "rgba(245, 240, 230, 0.16)",
              color: !audioUrlSelected ? COBRE : undefined,
              background: !audioUrlSelected
                ? "rgba(194, 143, 96, 0.1)"
                : "transparent",
            }}
          >
            🔇 sem som
          </button>
          <div className="max-h-72 overflow-y-auto space-y-2">
            {Object.entries(audios).map(([mood, list]) => (
              <div key={mood} className="space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-escola-creme-50">
                  {NIGHT_MOOD_LABELS[mood as keyof typeof NIGHT_MOOD_LABELS] ?? mood}
                </div>
                <div className="grid gap-1 sm:grid-cols-2">
                  {list.map((a) => (
                    <AudioPickerItem
                      key={a.url}
                      audio={a}
                      selected={audioUrlSelected === a.url}
                      onSelect={() => setAudioUrlSelected(a.url)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(audios).length === 0 && (
              <div className="rounded border border-escola-border bg-escola-card/40 p-3 text-[11px] text-escola-creme-50">
                Sem áudios. Vai à tab Áudios e clica em "Gerar 1 áudio por cada
                mood" para ter biblioteca.
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-[11px] text-escola-creme-50 hover:text-escola-creme"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-[11px] text-escola-creme-50 hover:text-escola-creme"
            >
              → Próximo (tema)
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Theme picker (contrast) */}
      {step === 3 && (
        <div className="space-y-2">
          <div className="text-xs text-escola-creme-50">
            Escolhe o tema visual. Muda a cor do texto, do arco, do glifo. Se a
            tua imagem é muito escura/clara, escolhe um tema mais contrastante.
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {HEM_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className="rounded border p-2.5 text-left transition-colors"
                style={{
                  borderColor: themeId === t.id ? COBRE : "rgba(245, 240, 230, 0.16)",
                  background:
                    themeId === t.id
                      ? "rgba(194, 143, 96, 0.08)"
                      : "transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-[9px]"
                    style={{
                      background: t.bg,
                      border: `2px solid ${t.highlight}`,
                      color: t.text,
                    }}
                  >
                    Aa
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px]" style={{ color: t.highlight }}>
                      {t.label}
                    </div>
                    <div className="text-[10px] text-escola-creme-50 truncate">
                      {t.notas}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-[11px] text-escola-creme-50 hover:text-escola-creme"
            >
              ← Voltar
            </button>
            <button
              onClick={() => setStep(4)}
              className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-[11px] text-escola-creme-50 hover:text-escola-creme"
            >
              → Confirmar
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm + Render */}
      {step === 4 && (
        <div className="space-y-3">
          <div className="rounded border border-escola-border bg-escola-card p-3 space-y-2 text-[11px]">
            <div>
              <span className="text-escola-creme-50">Imagem: </span>
              <span className="font-mono text-escola-creme">{motionLabel}</span>
            </div>
            <div>
              <span className="text-escola-creme-50">Som: </span>
              <span className="text-escola-creme">{audioLabel}</span>
            </div>
            <div>
              <span className="text-escola-creme-50">Tema: </span>
              <span style={{ color: theme.highlight }}>{theme.label}</span>
            </div>
            <div>
              <span className="text-escola-creme-50">Duração: </span>
              <span className="text-escola-creme">{durationSec}s</span>
            </div>
            <div>
              <span className="text-escola-creme-50">Frase de hoje: </span>
              <span className="italic text-escola-creme">"{phrase.texto}"</span>
            </div>
          </div>
          <button
            onClick={onRender}
            disabled={submitting || !media}
            className="w-full rounded border-2 px-4 py-3 text-sm disabled:opacity-50 transition-colors"
            style={{
              borderColor: COBRE,
              color: "#FFF8E8",
              background: media ? COBRE : "rgba(194, 143, 96, 0.4)",
              fontWeight: 500,
            }}
          >
            {submitting ? "a submeter…" : "▶ Gerar MP4 para hoje"}
          </button>
          {!media && (
            <div className="text-[11px] text-amber-300">
              Volta ao passo 1 e escolhe um motion antes de renderizar.
            </div>
          )}
          {submitError && (
            <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-[11px] text-red-300">
              {submitError}
            </div>
          )}
          <button
            onClick={() => setStep(1)}
            className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-[11px] text-escola-creme-50 hover:text-escola-creme"
          >
            ← Mudar algo
          </button>
        </div>
      )}
    </section>
  );
}

function AudioPickerItem({
  audio,
  selected,
  onSelect,
}: {
  audio: { name: string; url: string };
  selected: boolean;
  onSelect: () => void;
}) {
  const [errored, setErrored] = useState(false);
  return (
    <button
      onClick={onSelect}
      disabled={errored}
      className="rounded border p-1.5 text-left text-[10px] transition-colors disabled:opacity-60"
      style={{
        borderColor: errored
          ? "rgba(220, 38, 38, 0.5)"
          : selected
            ? COBRE
            : "rgba(245, 240, 230, 0.16)",
        background: errored
          ? "rgba(127, 29, 29, 0.12)"
          : selected
            ? "rgba(194, 143, 96, 0.1)"
            : "transparent",
      }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-escola-creme">{audio.name}</span>
        {errored && (
          <a
            href={audio.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 text-[9px] text-red-300 underline"
          >
            testar →
          </a>
        )}
      </div>
      {errored ? (
        <div className="mt-1 text-[9px] text-red-300">
          ✗ não carrega (clica "testar" para ver no browser)
        </div>
      ) : (
        <audio
          src={audio.url}
          controls
          preload="metadata"
          className="mt-1 h-6 w-full"
          onClick={(e) => e.stopPropagation()}
          onError={() => setErrored(true)}
        />
      )}
    </button>
  );
}

function BulkClipPicker({
  motions,
  loading,
  selected,
  onChange,
  onReload,
}: {
  motions: Array<{ name: string; url: string }>;
  loading: boolean;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  onReload: () => void;
}) {
  const toggle = (url: string) => {
    const next = new Set(selected);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    onChange(next);
  };
  const selectAll = () => onChange(new Set(motions.map((m) => m.url)));
  const clearAll = () => onChange(new Set());

  return (
    <div className="space-y-2 max-w-xl">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="text-xs text-escola-creme">
          Clips a incluir <span className="text-escola-creme-50">({selected.size}/{motions.length})</span>
        </div>
        <div className="flex gap-1 text-[10px]">
          <button
            onClick={selectAll}
            className="rounded border border-escola-border bg-escola-card px-2 py-0.5 text-escola-creme-50 hover:text-escola-creme"
          >
            Tudo
          </button>
          <button
            onClick={clearAll}
            className="rounded border border-escola-border bg-escola-card px-2 py-0.5 text-escola-creme-50 hover:text-escola-creme"
          >
            Limpar
          </button>
          <button
            onClick={onReload}
            className="rounded border border-escola-border bg-escola-card px-2 py-0.5 text-escola-creme-50 hover:text-escola-creme"
          >
            ↻
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-[10px] text-escola-creme-50">A carregar library…</div>
      ) : motions.length === 0 ? (
        <div className="text-[10px] text-escola-creme-50 italic">
          Sem motions no library. Faz upload na tab Motions + Runway.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 max-h-72 overflow-y-auto">
          {motions.map((m) => {
            const on = selected.has(m.url);
            return (
              <button
                key={m.url}
                onClick={() => toggle(m.url)}
                className="relative rounded border overflow-hidden transition-all"
                style={{
                  borderColor: on ? COBRE : "rgba(245, 240, 230, 0.16)",
                  boxShadow: on ? `0 0 0 1.5px ${COBRE}` : undefined,
                  opacity: on ? 1 : 0.45,
                }}
                title={m.name}
              >
                <video
                  src={m.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-[9/16] w-full bg-black object-cover"
                />
                <div className="absolute top-0.5 right-0.5">
                  <div
                    className="h-4 w-4 rounded-full flex items-center justify-center text-[10px]"
                    style={{
                      background: on ? COBRE : "rgba(0,0,0,0.6)",
                      color: on ? "#1a0e05" : "#888",
                    }}
                  >
                    {on ? "✓" : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BulkAudioPicker({
  audios,
  loading,
  selected,
  onChange,
  onReload,
}: {
  audios: Array<{ mood: string; name: string; url: string }>;
  loading: boolean;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  onReload: () => void;
}) {
  // Agrupa por mood. Cada mood mostra UMA linha: checkbox liga/desliga
  // todos os ficheiros desse mood (a pairing escolhe o ficheiro certo
  // por dia). Player toca o primeiro ficheiro como amostra. "+N" expande
  // para gestão fina caso queiras remover ficheiros maus individualmente.
  const byMood: Record<string, Array<{ mood: string; name: string; url: string }>> = {};
  for (const a of audios) {
    if (!byMood[a.mood]) byMood[a.mood] = [];
    byMood[a.mood].push(a);
  }
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpand = (mood: string) => {
    const next = new Set(expanded);
    if (next.has(mood)) next.delete(mood);
    else next.add(mood);
    setExpanded(next);
  };

  const toggleOne = (url: string) => {
    const next = new Set(selected);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    onChange(next);
  };
  const toggleMood = (mood: string) => {
    const urls = byMood[mood]?.map((a) => a.url) ?? [];
    const allOn = urls.every((u) => selected.has(u));
    const next = new Set(selected);
    if (allOn) urls.forEach((u) => next.delete(u));
    else urls.forEach((u) => next.add(u));
    onChange(next);
  };

  const selectAll = () => onChange(new Set(audios.map((a) => a.url)));
  const clearAll = () => onChange(new Set());

  return (
    <div className="space-y-2 max-w-xl">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="text-xs text-escola-creme">
          Áudios a incluir{" "}
          <span className="text-escola-creme-50">
            ({selected.size}/{audios.length})
          </span>
        </div>
        <div className="flex gap-1 text-[10px]">
          <button
            onClick={selectAll}
            className="rounded border border-escola-border bg-escola-card px-2 py-0.5 text-escola-creme-50 hover:text-escola-creme"
          >
            Tudo
          </button>
          <button
            onClick={clearAll}
            className="rounded border border-escola-border bg-escola-card px-2 py-0.5 text-escola-creme-50 hover:text-escola-creme"
          >
            Sem som
          </button>
          <button
            onClick={onReload}
            className="rounded border border-escola-border bg-escola-card px-2 py-0.5 text-escola-creme-50 hover:text-escola-creme"
          >
            ↻
          </button>
        </div>
      </div>
      <div className="text-[9px] text-escola-creme-50 italic">
        Pareamento por mood: a pré-montagem escolhe automaticamente o
        ficheiro certo dentro de cada mood ligado.
      </div>
      {loading ? (
        <div className="text-[10px] text-escola-creme-50">
          A carregar library…
        </div>
      ) : audios.length === 0 ? (
        <div className="text-[10px] text-escola-creme-50 italic">
          Sem áudios no library. Gera na tab Áudios.
        </div>
      ) : (
        <div className="space-y-1">
          {Object.entries(byMood).map(([mood, list]) => {
            const onCount = list.filter((a) => selected.has(a.url)).length;
            const allOn = onCount === list.length;
            const someOn = onCount > 0;
            const isExpanded = expanded.has(mood);
            const sample = list[0];
            return (
              <div
                key={mood}
                className="rounded border"
                style={{
                  borderColor: someOn ? COBRE : "rgba(245, 240, 230, 0.16)",
                  background: someOn ? "rgba(194, 143, 96, 0.06)" : "transparent",
                }}
              >
                <div className="flex items-center gap-2 px-2 py-1.5 text-[11px]">
                  <input
                    type="checkbox"
                    checked={allOn}
                    ref={(el) => {
                      if (el) el.indeterminate = someOn && !allOn;
                    }}
                    onChange={() => toggleMood(mood)}
                    className="shrink-0"
                  />
                  <span className="flex-1 truncate text-escola-creme">
                    {NIGHT_MOOD_LABELS[mood as keyof typeof NIGHT_MOOD_LABELS] ?? mood}
                  </span>
                  <span className="text-[9px] text-escola-creme-50">
                    {onCount}/{list.length}
                  </span>
                  {sample && (
                    <audio
                      src={sample.url}
                      controls
                      preload="metadata"
                      className="h-6 w-32 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {list.length > 1 && (
                    <button
                      onClick={() => toggleExpand(mood)}
                      className="rounded border border-escola-border px-1 text-[9px] text-escola-creme-50 hover:text-escola-creme"
                      title={isExpanded ? "Colapsar" : "Ver todos os ficheiros deste mood"}
                    >
                      {isExpanded ? "−" : `+${list.length - 1}`}
                    </button>
                  )}
                </div>
                {isExpanded && (
                  <div className="border-t border-escola-border/40 px-2 py-1.5 space-y-1">
                    {list.map((a) => {
                      const on = selected.has(a.url);
                      return (
                        <label
                          key={a.url}
                          className="flex items-center gap-2 text-[10px]"
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggleOne(a.url)}
                            className="shrink-0"
                          />
                          <span className="flex-1 truncate text-escola-creme-50">
                            {a.name}
                          </span>
                          <audio
                            src={a.url}
                            controls
                            preload="metadata"
                            className="h-5 w-24 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function moodFromAudioUrlClient(url: string): string | null {
  const m = url.match(/hoje-em-mim-audios\/([^/]+)\//);
  return m ? m[1] : null;
}

/** Mini-frame 9:16 para a tabela. Replica fielmente o design aprovado
 *  (variante C) do render-one.mjs:
 *
 *   - Cantoneira de cobre no canto sup esq
 *   - Arco janela-de-lua (semicírculo) com o ponto de cobre no apex
 *   - Halo radial atrás do dia da semana dentro do arco
 *   - Nome do dia em Cormorant Garamond por baixo do apex
 *   - Frase central multilinha
 *   - Kicker + glifo no rodapé sup
 *   - "SETEVEUS.SPACE" no rodapé inf
 *
 *  Usa o mesmo viewBox 1080×1920 do render: garante que o que se vê
 *  no preview é o que vai sair no MP4 (escalado, com motion por
 *  baixo via hover-to-play). */
function RowFramePreview({
  motionUrl,
  frase,
  dia,
  especial,
  theme,
  audioMood,
  motionMood,
}: {
  motionUrl: string;
  frase: string;
  dia: DiaSemana;
  especial: DiaEspecial | null;
  theme: ReturnType<typeof getTheme>;
  audioMood: string | null;
  motionMood: string | null;
}) {
  const kicker = especial ? KICKER_ESPECIAL[especial] : KICKER_POR_DIA[dia];
  const glifo = especial ? GLIFO_ESPECIAL[especial] : GLIFO_POR_DIA[dia];
  const moodMatch =
    audioMood && motionMood ? audioMood === motionMood : null;

  // Quebra a frase em linhas para caber dentro do arco. Heurística
  // simples: ~24 chars por linha (proporcional ao render real).
  const fraseLines = (() => {
    const maxChars = 26;
    const words = frase.split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > maxChars && cur.length > 0) {
        lines.push(cur);
        cur = w;
      } else {
        cur = (cur + " " + w).trim();
      }
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 8);
  })();
  // Centro vertical (~960) ajustado pelo nº de linhas
  const fraseSize = fraseLines.length > 6 ? 46 : fraseLines.length > 4 ? 54 : 62;
  const lineH = fraseSize * 1.18;
  const fraseStartY = 960 - ((fraseLines.length - 1) * lineH) / 2;

  return (
    <div className="flex flex-col items-start gap-1">
      <div
        className="relative overflow-hidden rounded border"
        style={{
          borderColor: theme.highlightSoft,
          background: theme.bg,
          width: 152,
          height: 270,
        }}
      >
        {motionUrl && (
          <video
            src={motionUrl}
            muted
            loop
            playsInline
            preload="metadata"
            onMouseEnter={(e) => {
              e.currentTarget.play().catch(() => {});
            }}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
            className="absolute inset-0 h-full w-full object-cover opacity-95"
          />
        )}
        {/* SVG overlay no mesmo viewBox 1080×1920 do render. Tudo o que
            está aqui é o que vai sair no MP4. */}
        <svg
          viewBox="0 0 1080 1920"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0"
        >
          <defs>
            <radialGradient id={`arcDayScrim-${dia}-${especial ?? "x"}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.bg} stopOpacity="0.65" />
              <stop offset="100%" stopColor={theme.bg} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`vignette-${dia}-${especial ?? "x"}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.bg} stopOpacity="0.0" />
              <stop offset="60%" stopColor={theme.bg} stopOpacity="0.5" />
              <stop offset="100%" stopColor={theme.bg} stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Vignette para legibilidade */}
          <rect x="0" y="0" width="1080" height="1920" fill={`url(#vignette-${dia}-${especial ?? "x"})`} />

          {/* Halo atrás do dia */}
          <rect x="280" y="472" width="520" height="86" fill={`url(#arcDayScrim-${dia}-${especial ?? "x"})`} />

          {/* Cantoneira topo esquerdo */}
          <line x1="60" y1="60" x2="124" y2="60" stroke={theme.highlightSoft} strokeWidth="3" />
          <line x1="60" y1="60" x2="60" y2="124" stroke={theme.highlightSoft} strokeWidth="3" />

          {/* Arco janela de lua */}
          <path
            d="M 220 1098 L 220 459 A 320 320 0 0 1 860 459 L 860 1098"
            stroke={theme.highlightSoft}
            strokeWidth="3"
            fill="none"
          />
          {/* Ponto cobre no apex do arco */}
          <circle cx="540" cy="459" r="8" fill={theme.highlight} opacity="0.7" />

          {/* Dia da semana */}
          <text
            x="540"
            y="507"
            textAnchor="middle"
            fontFamily="'Cormorant Garamond', serif"
            fontWeight="400"
            fontSize="29"
            letterSpacing="6"
            fill={theme.highlight}
          >
            {DIA_LONGO_PT[dia].toUpperCase()}
          </text>

          {/* Frase, multi-linha, centrada */}
          {fraseLines.map((line, i) => (
            <text
              key={i}
              x="540"
              y={fraseStartY + i * lineH}
              textAnchor="middle"
              fontFamily="'Cormorant Garamond', serif"
              fontStyle="italic"
              fontWeight="400"
              fontSize={fraseSize}
              fill={theme.text}
            >
              {line}
            </text>
          ))}

          {/* Kicker + glifo */}
          <text
            x="540"
            y="1770"
            textAnchor="middle"
            fontFamily="'Cormorant Garamond', serif"
            fontStyle="italic"
            fontWeight="400"
            fontSize="36"
            fill={theme.highlight}
          >
            <tspan fontSize="42" fontStyle="normal">{glifo}</tspan>
            {"  "}{kicker}
          </text>

          {/* SETEVEUS.SPACE */}
          <text
            x="540"
            y="1822"
            textAnchor="middle"
            fontFamily="'Cormorant Garamond', serif"
            fontWeight="400"
            fontSize="24"
            letterSpacing="8"
            fill={theme.highlightSoft}
          >
            SETEVEUS.SPACE
          </text>
        </svg>
      </div>
      <div
        className="rounded px-1 py-0.5 text-[8px]"
        style={{
          background: theme.bg,
          color: theme.highlight,
          border: `1px solid ${theme.highlightSoft}`,
        }}
        title="Tema activo nesta linha"
      >
        🎨 {theme.label.split(" (")[0]}
      </div>
      {(audioMood || motionMood) && (
        <div className="text-[8px] text-escola-creme-50 leading-tight">
          {motionMood && <div>🎞 {motionMood}</div>}
          {audioMood && (
            <div style={{ color: moodMatch === true ? "#7bb380" : undefined }}>
              🔊 {audioMood} {moodMatch === false ? "≠" : moodMatch === true ? "✓" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BulkPreviewTable({
  ano,
  mes,
  diaInicio,
  diaFim,
  motionPool,
  audioPool,
  motionsLib,
  audiosLib,
  themeId,
  overrides,
  onChangeOverrides,
  moodByMotion,
}: {
  ano: number;
  mes: number;
  diaInicio: number;
  diaFim: number;
  motionPool: string[];
  audioPool: string[];
  motionsLib: Array<{ name: string; url: string }>;
  audiosLib: Array<{ name: string; url: string; mood: string }>;
  themeId: string;
  overrides: Record<number, { fraseTexto?: string; motionUrl?: string; audioUrl?: string | null; theme?: string }>;
  onChangeOverrides: (next: Record<number, { fraseTexto?: string; motionUrl?: string; audioUrl?: string | null; theme?: string }>) => void;
  moodByMotion: Record<string, string>;
}) {
  const items = useMemo(() => {
    const frasesPorDia: Record<DiaSemana, Array<{ id: string; texto: string; dia: DiaSemana }>> = {
      mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [],
    };
    for (const f of FRASES) frasesPorDia[f.dia].push(f);
    const fEspRaw = (seed as unknown as {
      frases_especiais?: Partial<Record<DiaEspecial, Array<{ id: string; texto: string }>>>;
    }).frases_especiais;
    const frasesEspeciais: Record<DiaEspecial, Array<{ id: string; texto: string }>> = {
      fim_mes: fEspRaw?.fim_mes ?? [],
      inicio_mes: fEspRaw?.inicio_mes ?? [],
      fim_ano: fEspRaw?.fim_ano ?? [],
      inicio_ano: fEspRaw?.inicio_ano ?? [],
    };
    return computePreviewItems({
      ano,
      mes,
      diaInicio,
      diaFim,
      motionPool,
      audioPool,
      moodByMotion,
      frasesPorDia,
      frasesEspeciais,
    });
  }, [ano, mes, diaInicio, diaFim, motionPool, audioPool, moodByMotion]);

  const setOverride = (dayIndex: number, patch: { fraseTexto?: string; motionUrl?: string; audioUrl?: string | null; theme?: string }) => {
    const next = { ...overrides };
    const current = next[dayIndex] || {};
    next[dayIndex] = { ...current, ...patch };
    onChangeOverrides(next);
  };
  const clearOverride = (dayIndex: number, key: "fraseTexto" | "motionUrl" | "audioUrl" | "theme") => {
    const next = { ...overrides };
    if (next[dayIndex]) {
      const c = { ...next[dayIndex] };
      delete c[key];
      if (Object.keys(c).length === 0) delete next[dayIndex];
      else next[dayIndex] = c;
    }
    onChangeOverrides(next);
  };

  const [regenerating, setRegenerating] = useState<number | null>(null);
  const [regenError, setRegenError] = useState<Record<number, string | null>>({});

  // Escolhe um áudio do library que case com o mood pedido.
  // Preferência: 1) mood do motion (se tagged) → 2) mood preferido
  // do dia → 3) primeiro áudio do pool.
  const pickAudioForMotion = useCallback(
    (
      motionUrl: string,
      dia: DiaSemana,
      especial: DiaEspecial | null
    ): string | null => {
      if (audiosLib.length === 0) return null;
      const motionMood = moodByMotion[motionUrl];
      const moodPref = especial ? MOOD_ESPECIAL[especial] : MOOD_POR_DIA[dia];
      const tryMoods = motionMood
        ? [motionMood, ...moodPref.filter((m) => m !== motionMood)]
        : moodPref;
      for (const mood of tryMoods) {
        const candidates = audiosLib.filter((a) => a.mood === mood);
        if (candidates.length > 0) {
          // Aleatório dentro do mesmo mood para variar entre runs
          return candidates[Math.floor(Math.random() * candidates.length)].url;
        }
      }
      return audiosLib[Math.floor(Math.random() * audiosLib.length)].url;
    },
    [audiosLib, moodByMotion]
  );

  // Escolhe um motion alternativo respeitando o mood do dia e
  // evitando família igual ao actual e motion exactamente igual.
  const pickAlternateMotion = useCallback(
    (
      currentUrl: string,
      dia: DiaSemana,
      especial: DiaEspecial | null
    ): string => {
      if (motionsLib.length <= 1) return currentUrl;
      const moodPref = especial ? MOOD_ESPECIAL[especial] : MOOD_POR_DIA[dia];
      const currentFam = motionFamilyKey(currentUrl);
      const inMood = motionsLib.filter((m) => {
        const mm = moodByMotion[m.url];
        return mm && moodPref.includes(mm as never);
      });
      const tryLists = [
        inMood.filter(
          (m) => m.url !== currentUrl && motionFamilyKey(m.url) !== currentFam
        ),
        inMood.filter((m) => m.url !== currentUrl),
        motionsLib.filter(
          (m) => m.url !== currentUrl && motionFamilyKey(m.url) !== currentFam
        ),
        motionsLib.filter((m) => m.url !== currentUrl),
      ];
      for (const list of tryLists) {
        if (list.length > 0) {
          return list[Math.floor(Math.random() * list.length)].url;
        }
      }
      return currentUrl;
    },
    [motionsLib, moodByMotion]
  );

  // Re-shuffle de uma linha: novo motion (mood-aware, anti-família)
  // e novo áudio que case com o mood do novo motion. Setado como
  // override para sobreviver a re-renders e ser persistido.
  const shuffleRow = (
    dayIndex: number,
    dia: DiaSemana,
    especial: DiaEspecial | null,
    currentMotion: string
  ) => {
    const nextMotion = pickAlternateMotion(currentMotion, dia, especial);
    const nextAudio = pickAudioForMotion(nextMotion, dia, especial);
    setOverride(dayIndex, { motionUrl: nextMotion, audioUrl: nextAudio });
  };

  // Quando o utilizador troca motion via dropdown, auto-pareia o
  // áudio com o mood do novo motion. Evita o "troquei motion mas
  // áudio ficou estranho" — o que tu pediste hoje.
  const changeMotion = (
    dayIndex: number,
    dia: DiaSemana,
    especial: DiaEspecial | null,
    newMotionUrl: string
  ) => {
    const nextAudio = pickAudioForMotion(newMotionUrl, dia, especial);
    setOverride(dayIndex, { motionUrl: newMotionUrl, audioUrl: nextAudio });
  };

  // Re-shuffle global: re-rola todas as linhas que NÃO foram
  // editadas manualmente (preserva overrides existentes).
  const reshuffleAll = () => {
    const next = { ...overrides };
    for (const it of items) {
      const cur = next[it.dayIndex] || {};
      if (cur.motionUrl || cur.audioUrl !== undefined) continue;
      const m = pickAlternateMotion(it.motionUrl, it.dia, it.especial);
      const a = pickAudioForMotion(m, it.dia, it.especial);
      next[it.dayIndex] = { ...cur, motionUrl: m, audioUrl: a };
    }
    onChangeOverrides(next);
  };

  const regenFrase = async (
    dayIndex: number,
    dia: DiaSemana,
    especial: DiaEspecial | null
  ) => {
    setRegenerating(dayIndex);
    setRegenError((p) => ({ ...p, [dayIndex]: null }));
    try {
      const avoid = items.map((it) => {
        const ov = overrides[it.dayIndex];
        return ov?.fraseTexto ?? it.fraseTexto;
      });
      const res = await fetch("/api/admin/hoje-em-mim/phrase/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dia, especial, avoid }),
      });
      const json = (await res.json()) as { phrase?: string; erro?: string };
      if (!res.ok || !json.phrase) {
        throw new Error(json.erro ?? "Falhou regeneracao");
      }
      setOverride(dayIndex, { fraseTexto: json.phrase });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setRegenError((p) => ({ ...p, [dayIndex]: msg }));
    } finally {
      setRegenerating(null);
    }
  };

  const overrideCount = Object.values(overrides).filter(
    (v) => v && (v.fraseTexto || v.motionUrl || v.audioUrl !== undefined || v.theme)
  ).length;

  if (items.length === 0) {
    return (
      <div className="rounded border border-escola-border bg-escola-card/40 p-3 text-[11px] text-escola-creme-50">
        Sem items para pré-montar (verifica range, motions e frases).
      </div>
    );
  }

  return (
    <details
      open
      className="rounded-lg border max-w-5xl"
      style={{ borderColor: COBRE_FRACO, background: "rgba(194, 143, 96, 0.04)" }}
    >
      <summary
        className="cursor-pointer px-3 py-2 text-xs font-medium"
        style={{ color: COBRE }}
      >
        🔍 Pré-montagem editável ({items.length} dias{overrideCount > 0 ? ` · ${overrideCount} com override` : ""}) — clica em qualquer célula para mudar
      </summary>
      <div className="overflow-x-auto px-3 pb-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <button
            onClick={reshuffleAll}
            className="rounded border px-2 py-1 text-[11px] hover:opacity-80"
            style={{ borderColor: COBRE, color: COBRE, background: "rgba(194, 143, 96, 0.06)" }}
            title="Re-rola motion + áudio de todas as linhas que não tens editadas manualmente. Respeita o mood do dia."
          >
            🎲 Re-shuffle tudo (preserva overrides)
          </button>
          <span className="text-escola-creme-50">
            ou clica 🎲 numa linha para trocar só essa
          </span>
        </div>
        <table className="w-full text-[10px]">
          <thead className="text-escola-creme-50 uppercase tracking-wider">
            <tr>
              <th className="text-left py-1 pr-2">Data</th>
              <th className="text-left py-1 pr-2">Dia</th>
              <th className="text-left py-1 pr-2">Preview</th>
              <th className="text-left py-1 pr-2 min-w-[260px]">Frase</th>
              <th className="text-left py-1 pr-2">Motion</th>
              <th className="text-left py-1 pr-2">Áudio</th>
              <th className="text-left py-1 pr-2">Tema</th>
            </tr>
          </thead>
          <tbody className="text-escola-creme align-top">
            {items.map((it) => {
              const ov = overrides[it.dayIndex] || {};
              const fraseEff = ov.fraseTexto ?? it.fraseTexto;
              const motionEff = ov.motionUrl ?? it.motionUrl;
              const audioEff = ov.audioUrl !== undefined ? ov.audioUrl : it.audioUrl;
              const themeEff = ov.theme ?? themeId;
              const rowTheme = getTheme(themeEff);
              return (
                <tr
                  key={it.dayIndex}
                  className="border-t border-escola-border/40"
                >
                  <td className="py-1.5 pr-2 whitespace-nowrap">{it.date}</td>
                  <td className="py-1.5 pr-2 whitespace-nowrap">
                    {DIA_LONGO_PT[it.dia]}
                    {it.especial && (
                      <div
                        className="mt-0.5 rounded px-1 py-0.5 text-[9px]"
                        style={{
                          background: "rgba(194, 143, 96, 0.18)",
                          color: COBRE,
                        }}
                        title={LABEL_ESPECIAL[it.especial]}
                      >
                        {KICKER_ESPECIAL[it.especial]}
                      </div>
                    )}
                    <div className="mt-1 text-[9px] text-escola-creme-50">
                      ritmo: {it.especial ?? it.dia}
                    </div>
                  </td>
                  <td className="py-1.5 pr-2">
                    <RowFramePreview
                      motionUrl={motionEff}
                      frase={fraseEff}
                      dia={it.dia}
                      especial={it.especial}
                      theme={rowTheme}
                      audioMood={audioEff ? moodFromAudioUrlClient(audioEff) : null}
                      motionMood={moodByMotion[motionEff] ?? null}
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <div className="flex items-start gap-1">
                      <textarea
                        value={fraseEff}
                        onChange={(e) => setOverride(it.dayIndex, { fraseTexto: e.target.value })}
                        rows={3}
                        className="flex-1 rounded border border-escola-border bg-escola-bg px-1.5 py-1 text-[10px] italic text-escola-creme"
                        style={{
                          borderColor: ov.fraseTexto ? COBRE : undefined,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => regenFrase(it.dayIndex, it.dia, it.especial)}
                        disabled={regenerating === it.dayIndex}
                        title="Regenerar com Claude (mantém o ritmo do dia, evita repetir frases já usadas)"
                        className="shrink-0 rounded border px-1.5 py-1 text-[11px] hover:opacity-80 disabled:opacity-40"
                        style={{ borderColor: COBRE_FRACO, color: COBRE }}
                      >
                        {regenerating === it.dayIndex ? "…" : "🤖"}
                      </button>
                    </div>
                    {regenError[it.dayIndex] && (
                      <div className="mt-0.5 text-[9px] text-red-400">
                        {regenError[it.dayIndex]}
                      </div>
                    )}
                    {ov.fraseTexto && (
                      <button
                        onClick={() => clearOverride(it.dayIndex, "fraseTexto")}
                        className="mt-0.5 text-[9px] text-escola-creme-50 hover:text-escola-creme underline"
                      >
                        repor original
                      </button>
                    )}
                  </td>
                  <td className="py-1.5 pr-2">
                    <div className="flex items-start gap-1">
                      <select
                        value={motionEff}
                        onChange={(e) =>
                          changeMotion(it.dayIndex, it.dia, it.especial, e.target.value)
                        }
                        className="w-full max-w-[180px] rounded border border-escola-border bg-escola-bg px-1 py-0.5 text-[10px] text-escola-creme"
                        style={{ borderColor: ov.motionUrl ? COBRE : undefined }}
                      >
                        <option value={motionEff}>
                          {motionsLib.find((m) => m.url === motionEff)?.name ?? motionEff.split("/").pop() ?? "?"}
                        </option>
                        {motionsLib
                          .filter((m) => m.url !== motionEff)
                          .map((m) => (
                            <option key={m.url} value={m.url}>
                              {m.name}
                              {moodByMotion[m.url] ? ` · ${moodByMotion[m.url]}` : ""}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          shuffleRow(it.dayIndex, it.dia, it.especial, motionEff)
                        }
                        title="Sortear novo motion (mood do dia, família diferente) e áudio que case"
                        className="shrink-0 rounded border px-1.5 py-1 text-[11px] hover:opacity-80"
                        style={{ borderColor: COBRE_FRACO, color: COBRE }}
                      >
                        🎲
                      </button>
                    </div>
                    {moodByMotion[motionEff] && (
                      <div className="mt-0.5 text-[9px] text-escola-creme-50">
                        mood: {moodByMotion[motionEff]}
                      </div>
                    )}
                  </td>
                  <td className="py-1.5 pr-2">
                    <select
                      value={audioEff || ""}
                      onChange={(e) =>
                        setOverride(it.dayIndex, { audioUrl: e.target.value || null })
                      }
                      className="w-full max-w-[180px] rounded border border-escola-border bg-escola-bg px-1 py-0.5 text-[10px] text-escola-creme"
                      style={{ borderColor: ov.audioUrl !== undefined ? COBRE : undefined }}
                    >
                      <option value="">— sem som —</option>
                      {audioEff && (
                        <option value={audioEff}>
                          {audiosLib.find((a) => a.url === audioEff)?.name ?? audioEff.split("/").pop()}
                        </option>
                      )}
                      {audiosLib
                        .filter((a) => a.url !== audioEff)
                        .map((a) => (
                          <option key={a.url} value={a.url}>
                            {a.mood} · {a.name}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="py-1.5 pr-2">
                    <select
                      value={themeEff}
                      onChange={(e) => setOverride(it.dayIndex, { theme: e.target.value })}
                      className="rounded border border-escola-border bg-escola-bg px-1 py-0.5 text-[10px]"
                      style={{
                        color: rowTheme.highlight,
                        borderColor: ov.theme ? COBRE : undefined,
                      }}
                    >
                      {HEM_THEMES.map((t) => (
                        <option key={t.id} value={t.id} style={{ color: t.highlight }}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-2 text-[10px] text-escola-creme-50 italic">
          Edita inline — frase, motion, áudio, tema por dia. Células com border cobre = override. O servidor faz shuffle do motionPool mas honra cada override.
        </div>
      </div>
    </details>
  );
}
