"use client";

import { useCallback, useEffect, useState } from "react";
import { MOOD_LABELS, MORNING_MOODS, type MorningMood } from "@/lib/vc-sabia/audio";
import { phraseToCaptions } from "@/lib/vc-sabia/captions";

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
  phraseReused?: boolean;
  motionName: string;
  motionUrl: string;
  motionReused?: boolean;
  audioUrl: string | null;
  mood?: string | null;
}

interface JobStatus {
  day: number;
  date: string;
  jobId: string;
  phraseText?: string;
  phraseTheme?: string;
  phraseId?: string;
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
  /** Mapping mood -> audioUrl activo. Carregado quando entra no plan. */
  const [activeAudios, setActiveAudios] = useState<Partial<Record<MorningMood, string>>>({});
  /** Tags actuais dos motions, carregadas com o plano. */
  const [motionTags, setMotionTags] = useState<Record<string, MorningMood>>({});
  /** Estado de copia da legenda (feedback visual: dia -> plataforma). */
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  /** Lista de batches anteriores carregada do Supabase. */
  const [pastBatches, setPastBatches] = useState<Array<{
    batchId: string;
    year?: number;
    month?: number;
    startDay?: number;
    endDay?: number;
    createdAt?: string;
    jobs?: number;
  }>>([]);
  const [planHistory, setPlanHistory] = useState<{
    batchCount: number;
    usedPhrases: number;
    usedMotions: number;
    phrasesReusedInPlan: number;
    motionsReusedInPlan: number;
  } | null>(null);

  const refreshPastBatches = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/vc-sabia/bulk-list", { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      setPastBatches(j.batches || []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (phase === "config") refreshPastBatches();
  }, [phase, refreshPastBatches]);

  const loadPastBatch = (id: string) => {
    setBatchId(id);
    setStatus(null);
    setZipUrl(null);
    setError(null);
    setPhase("submitted");
  };

  const [deletingBatch, setDeletingBatch] = useState<string | null>(null);
  const deletePastBatch = async (id: string) => {
    if (!confirm(`Apagar o batch ${id}? Apaga todos os MP4s, manifests, captions e o ZIP. Esta acção é irreversível.`)) return;
    setDeletingBatch(id);
    try {
      const res = await fetch("/api/admin/vc-sabia/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId: id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro || `HTTP ${res.status}`);
      } else {
        await refreshPastBatches();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeletingBatch(null);
    }
  };

  const preparePlan = async () => {
    setPreparing(true);
    setError(null);
    setPlan([]);
    try {
      const [planRes, activeRes, tagsRes] = await Promise.all([
        fetch("/api/admin/vc-sabia/bulk-month/preview", {
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
        }),
        fetch("/api/admin/vc-sabia/active-audios"),
        fetch("/api/admin/vc-sabia/motion-tags"),
      ]);
      const planJson = await planRes.json();
      if (!planRes.ok) {
        setError(planJson.erro || `HTTP ${planRes.status}`);
        return;
      }
      const activeJson = activeRes.ok ? await activeRes.json() : { active: {} };
      const tagsJson = tagsRes.ok ? await tagsRes.json() : { tags: {} };
      setActiveAudios(activeJson.active || {});
      setMotionTags(tagsJson.tags || {});
      setPlan(planJson.plan || []);
      setPlanHistory(planJson.history || null);
      setPhase("plan");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPreparing(false);
    }
  };

  /** Muda o mood deste motion: persiste em motion-tags.json e
   *  actualiza audioUrl da linha (e de outras linhas com mesmo motion). */
  const setRowMood = async (idx: number, mood: MorningMood | "") => {
    const motionName = plan[idx]?.motionName;
    if (!motionName) return;

    const nextTags = { ...motionTags };
    if (mood === "") delete nextTags[motionName];
    else nextTags[motionName] = mood;
    setMotionTags(nextTags);

    const newAudioUrl = mood && activeAudios[mood] ? activeAudios[mood]! : null;
    setPlan((prev) =>
      prev.map((p) =>
        p.motionName === motionName ? { ...p, mood: mood || null, audioUrl: newAudioUrl } : p
      )
    );

    try {
      await fetch("/api/admin/vc-sabia/motion-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: nextTags }),
      });
    } catch {
      /* erro silencioso */
    }
  };

  /** Muda apenas o áudio desta linha (override pontual, não persiste). */
  const setRowAudio = (idx: number, audioUrl: string | null) => {
    setPlan((prev) => prev.map((p, i) => (i === idx ? { ...p, audioUrl } : p)));
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

  const copyToClipboard = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      /* ignore */
    }
  };

  const [retrying, setRetrying] = useState<Record<string, "loading" | { error: string } | undefined>>({});

  const retryJob = async (jobId: string) => {
    console.log(`[retry] ${jobId} start`);
    setRetrying((r) => ({ ...r, [jobId]: "loading" }));
    try {
      const res = await fetch("/api/admin/vc-sabia/render-retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const json = await res.json();
      console.log(`[retry] ${jobId} response`, res.status, json);
      if (!res.ok) {
        setRetrying((r) => ({
          ...r,
          [jobId]: { error: json.erro || `HTTP ${res.status}` },
        }));
        return;
      }
      // limpa estado de retry desta linha e refresca status
      setRetrying((r) => {
        const next = { ...r };
        delete next[jobId];
        return next;
      });
      await fetchStatus();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[retry] ${jobId} exception`, e);
      setRetrying((r) => ({ ...r, [jobId]: { error: msg } }));
    }
  };

  const downloadTxt = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allDone =
    status && status.summary.done === status.summary.total && status.summary.total > 0;
  /** Empacotar e possivel se ha pelo menos 1 done e nada esta em curso.
   *  Dias falhados sao skipped pelo bulk-package automaticamente. */
  const canPackage =
    !!status &&
    status.summary.done > 0 &&
    status.summary.running === 0 &&
    status.summary.queued === 0;

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

      {phase === "config" && pastBatches.length > 0 && (
        <div className="space-y-2 rounded border border-escola-border/40 bg-escola-card/40 p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-escola-creme">
              Bulks anteriores ({pastBatches.length})
            </h3>
            <button
              onClick={refreshPastBatches}
              className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
            >
              ↻ refresh
            </button>
          </div>
          <div className="space-y-1">
            {pastBatches.map((b) => (
              <div
                key={b.batchId}
                className="flex items-stretch gap-1 rounded border border-escola-border bg-escola-card/60 hover:bg-escola-card"
              >
                <button
                  onClick={() => loadPastBatch(b.batchId)}
                  className="flex-1 px-2 py-1.5 text-left text-[11px] text-escola-creme-50 hover:text-escola-creme"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-escola-creme">
                      {b.year && b.month
                        ? `${b.year}-${String(b.month).padStart(2, "0")}`
                        : "?"}
                      {b.startDay && b.endDay
                        ? ` · dias ${b.startDay}-${b.endDay}`
                        : ""}
                      {b.jobs !== undefined ? ` · ${b.jobs} jobs` : ""}
                    </span>
                    {b.createdAt && (
                      <span className="text-[9px] text-escola-creme-50">
                        {new Date(b.createdAt).toLocaleString("pt-PT", {
                          timeZone: "Africa/Maputo",
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 truncate text-[9px] text-escola-creme-50">
                    {b.batchId}
                  </div>
                </button>
                <button
                  onClick={() => deletePastBatch(b.batchId)}
                  disabled={deletingBatch === b.batchId}
                  className="rounded border-l border-escola-border px-2 text-[14px] text-red-400 hover:bg-red-900/30 hover:text-red-300 disabled:opacity-50"
                  title="Apagar este batch (MP4s, manifests, ZIP)"
                >
                  {deletingBatch === b.batchId ? "…" : "×"}
                </button>
              </div>
            ))}
          </div>
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

          {planHistory && (planHistory.phrasesReusedInPlan > 0 || planHistory.motionsReusedInPlan > 0) && (
            <div className="rounded border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-200">
              ⚠ Reutilização detectada (de {planHistory.batchCount} batches anteriores):
              {planHistory.phrasesReusedInPlan > 0 && (
                <> {planHistory.phrasesReusedInPlan} frase(s) repetida(s) (já usadas).</>
              )}
              {planHistory.motionsReusedInPlan > 0 && (
                <> {planHistory.motionsReusedInPlan} motion(s) repetido(s).</>
              )}{" "}
              Cada repetição está marcada com ↺.
            </div>
          )}

          {planHistory && planHistory.batchCount > 0 && (
            <div className="text-[10px] text-escola-creme-50">
              Histórico: {planHistory.batchCount} batches · {planHistory.usedPhrases}/90+ frases já posted ·{" "}
              {planHistory.usedMotions} motions já usados
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
                  <th className="px-2 py-1 text-left">Motion · Mood</th>
                  <th className="px-2 py-1 text-left">Áudio (override)</th>
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
                          className={`flex-1 rounded border bg-escola-card px-2 py-1 text-[11px] text-escola-creme ${
                            p.phraseReused
                              ? "border-amber-500/60"
                              : "border-escola-border"
                          }`}
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
                      {p.phraseReused && (
                        <div className="mt-1 text-[9px] text-amber-300">
                          ↺ esta frase já foi usada em batch anterior
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1 align-top">
                      <div className="space-y-1">
                        <div
                          className={`truncate text-[10px] ${
                            p.motionReused ? "text-amber-300" : "text-escola-creme-50"
                          }`}
                          title={p.motionName}
                        >
                          {p.motionReused && "↺ "}
                          {p.motionName.slice(0, 20)}…
                        </div>
                        <select
                          value={(p.mood as string) || ""}
                          onChange={(e) =>
                            setRowMood(i, e.target.value as MorningMood | "")
                          }
                          className={`w-full rounded border bg-escola-card px-1 py-0.5 text-[10px] ${
                            p.mood
                              ? "border-escola-dourado/60 text-escola-dourado"
                              : "border-red-700/40 text-red-300"
                          }`}
                          title="Mood deste motion. Auto-saves para Supabase + actualiza audio da linha."
                        >
                          <option value="">⚠ sem mood</option>
                          {MORNING_MOODS.map((m) => (
                            <option key={m} value={m}>
                              {MOOD_LABELS[m]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-2 py-1 align-top">
                      <select
                        value={p.audioUrl || ""}
                        onChange={(e) => setRowAudio(i, e.target.value || null)}
                        className={`w-full rounded border bg-escola-card px-1 py-0.5 text-[10px] ${
                          p.audioUrl
                            ? "border-emerald-500/40 text-emerald-300"
                            : "border-red-700/40 text-red-300"
                        }`}
                        title="Override do áudio desta linha. Lista os áudios activos de todos os moods."
                      >
                        <option value="">⚠ sem áudio (silencioso)</option>
                        {MORNING_MOODS.filter((m) => activeAudios[m]).map((m) => (
                          <option key={m} value={activeAudios[m]}>
                            {MOOD_LABELS[m]}
                          </option>
                        ))}
                      </select>
                      {p.audioUrl && (
                        <audio src={p.audioUrl} controls className="mt-1 h-6 w-full" />
                      )}
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {status.jobs.map((j) => {
              const phraseText = j.phraseText || "";
              const captions = phraseText
                ? phraseToCaptions({ phrase: phraseText, theme: j.phraseTheme || "beleza-de-existir" })
                : null;
              const ddPad = String(j.day).padStart(2, "0");
              return (
                <div
                  key={j.jobId}
                  className={`flex flex-col gap-2 rounded-lg border p-2 ${
                    j.status === "done"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : j.status === "failed"
                      ? "border-red-700/40 bg-red-900/10"
                      : j.status === "running"
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-escola-border bg-escola-card/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-lg text-escola-creme">
                        {j.day}
                      </span>
                      <span className="text-[10px] text-escola-creme-50">
                        {j.date}
                      </span>
                    </div>
                    <StatusBadge status={j.status} progress={j.progress} />
                  </div>

                  {j.videoUrl ? (
                    <video
                      src={j.videoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="aspect-[9/16] w-full rounded bg-black"
                    />
                  ) : (
                    <div className="flex aspect-[9/16] w-full items-center justify-center rounded bg-escola-card/60 text-[11px] text-escola-creme-50">
                      {j.status === "failed" ? "✗ falhou" : "a aguardar..."}
                    </div>
                  )}

                  {phraseText && (
                    <div className="rounded bg-escola-card/40 p-1.5 text-[10px] italic text-escola-creme">
                      {phraseText}
                    </div>
                  )}

                  {j.status === "failed" && (
                    <div className="space-y-1">
                      {j.error && (
                        <div className="rounded border border-red-700/40 bg-red-900/20 p-1 text-[9px] text-red-300">
                          {j.error.slice(0, 200)}
                        </div>
                      )}
                      <button
                        onClick={() => retryJob(j.jobId)}
                        disabled={retrying[j.jobId] === "loading"}
                        className="block w-full rounded border border-amber-500/60 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                        title="Re-despacha o workflow"
                      >
                        {retrying[j.jobId] === "loading"
                          ? "↻ A re-despachar..."
                          : "↻ Retry"}
                      </button>
                      {retrying[j.jobId] && retrying[j.jobId] !== "loading" && (
                        <div className="rounded border border-red-700/40 bg-red-900/20 p-1 text-[9px] text-red-300">
                          retry erro:{" "}
                          {(retrying[j.jobId] as { error: string }).error}
                        </div>
                      )}
                    </div>
                  )}

                  {j.videoUrl && (
                    <a
                      href={j.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={`vc-sabia-${ddPad}.mp4`}
                      className="rounded border border-emerald-500/60 bg-emerald-500/10 px-2 py-1 text-center text-[11px] text-emerald-300 hover:bg-emerald-500/20"
                    >
                      ↓ MP4
                    </a>
                  )}

                  {captions && (
                    <div className="space-y-1 border-t border-escola-border/30 pt-1.5">
                      <button
                        onClick={() =>
                          copyToClipboard(`wa-${j.day}`, captions.whatsapp)
                        }
                        className="block w-full rounded border border-emerald-500/60 bg-emerald-500/10 px-2 py-0.5 text-left text-[10px] text-emerald-300 hover:bg-emerald-500/20"
                        title="WhatsApp Status"
                      >
                        {copiedKey === `wa-${j.day}` ? "✓ copiado" : "📋 WhatsApp"}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(`ig-${j.day}`, captions.instagram)
                        }
                        className="block w-full rounded border border-escola-border bg-escola-card/40 px-2 py-0.5 text-left text-[10px] text-escola-creme hover:bg-escola-card/60"
                      >
                        {copiedKey === `ig-${j.day}` ? "✓ copiado" : "📋 Instagram"}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(`tt-${j.day}`, captions.tiktok)
                        }
                        className="block w-full rounded border border-escola-border bg-escola-card/40 px-2 py-0.5 text-left text-[10px] text-escola-creme hover:bg-escola-card/60"
                      >
                        {copiedKey === `tt-${j.day}` ? "✓ copiado" : "📋 TikTok"}
                      </button>
                      <button
                        onClick={() =>
                          downloadTxt(
                            `vc-sabia-${ddPad}-legendas.txt`,
                            `WHATSAPP\n${"=".repeat(40)}\n${captions.whatsapp}\n\n\nINSTAGRAM\n${"=".repeat(40)}\n${captions.instagram}\n\n\nTIKTOK\n${"=".repeat(40)}\n${captions.tiktok}\n`
                          )
                        }
                        className="block w-full rounded border border-escola-border bg-escola-card/40 px-2 py-0.5 text-left text-[10px] text-escola-creme-50 hover:text-escola-creme"
                      >
                        ↓ .txt (3 redes)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={pkg}
              disabled={!canPackage || packaging}
              className="rounded-md border border-emerald-500/60 bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
              title={
                canPackage
                  ? allDone
                    ? "Gera ZIP com todos os MP4s feitos + Metricool CSV"
                    : `${status.summary.done} feitos, ${status.summary.failed} falhados serao skipped`
                  : "Espera os jobs em curso/fila terminarem"
              }
            >
              {packaging
                ? "A empacotar..."
                : allDone
                ? "📦 Gerar pacote Metricool (ZIP)"
                : canPackage
                ? `📦 Empacotar (${status.summary.done} feitos, ${status.summary.failed} falhados ignorados)`
                : `📦 Espera os ${status.summary.queued + status.summary.running} em curso`}
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
