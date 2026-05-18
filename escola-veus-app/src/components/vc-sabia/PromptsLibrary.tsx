"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIES,
  buildMotionPrompt,
  dailyRotation,
  type MotionCategory,
} from "@/lib/vc-sabia/motions-library";

type ViewMode = "browse" | "calendar";

export function PromptsLibrary() {
  const [view, setView] = useState<ViewMode>("browse");
  const [filterTema, setFilterTema] = useState<string>("");
  const [filterMood, setFilterMood] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const allThemes = useMemo(
    () => Array.from(new Set(CATEGORIES.map((c) => c.tema))).sort(),
    []
  );
  const allMoods = useMemo(
    () => Array.from(new Set(CATEGORIES.map((c) => c.mood))).sort(),
    []
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return CATEGORIES.filter((c) => {
      if (filterTema && c.tema !== filterTema) return false;
      if (filterMood && c.mood !== filterMood) return false;
      if (s) {
        const inName = c.name.toLowerCase().includes(s);
        const inSubject = c.subjects.some((subj) =>
          subj.toLowerCase().includes(s)
        );
        if (!inName && !inSubject) return false;
      }
      return true;
    });
  }, [filterTema, filterMood, search]);

  const totalPrompts = useMemo(
    () => CATEGORIES.reduce((acc, c) => acc + c.subjects.length, 0),
    []
  );

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-escola-border bg-escola-card/40 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-escola-creme">
              Biblioteca de prompts Midjourney
            </h2>
            <p className="text-xs text-escola-creme-50">
              {totalPrompts} prompts · {CATEGORIES.length} categorias · cobre 6
              meses de produção diária (rotação determinista, 1 variante por dia
              sem repetir).
            </p>
          </div>
          <div className="flex gap-1 rounded-md border border-escola-border bg-escola-card p-0.5">
            <button
              onClick={() => setView("browse")}
              className={`rounded px-3 py-1 text-xs ${
                view === "browse"
                  ? "bg-escola-dourado/20 text-escola-dourado"
                  : "text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`rounded px-3 py-1 text-xs ${
                view === "calendar"
                  ? "bg-escola-dourado/20 text-escola-dourado"
                  : "text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              Calendário 6 meses
            </button>
          </div>
        </div>

        {view === "browse" && (
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 procurar (ex: lótus, lavanda, vela…)"
              className="min-w-[200px] flex-1 rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme placeholder:text-escola-creme-50/60"
            />
            <select
              value={filterTema}
              onChange={(e) => setFilterTema(e.target.value)}
              className="rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
            >
              <option value="">Todos os temas</option>
              {allThemes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value)}
              className="rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
            >
              <option value="">Todos os moods</option>
              {allMoods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {(filterTema || filterMood || search) && (
              <button
                onClick={() => {
                  setFilterTema("");
                  setFilterMood("");
                  setSearch("");
                }}
                className="rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme-50 hover:text-escola-creme"
              >
                limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {view === "browse" ? (
        <BrowseView
          categories={filtered}
          copy={copy}
          copiedKey={copiedKey}
        />
      ) : (
        <CalendarView copy={copy} copiedKey={copiedKey} />
      )}
    </div>
  );
}

function BrowseView({
  categories,
  copy,
  copiedKey,
}: {
  categories: MotionCategory[];
  copy: (key: string, text: string) => void;
  copiedKey: string | null;
}) {
  if (categories.length === 0) {
    return (
      <div className="rounded border border-escola-border bg-escola-card/40 p-6 text-center text-xs text-escola-creme-50">
        Sem categorias para os filtros activos.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {categories.map((c) => (
        <div
          key={c.name}
          className="rounded-lg border border-escola-border bg-escola-card/40 p-3"
        >
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-escola-creme">
              {c.name}
            </h3>
            <div className="flex gap-1 text-[10px]">
              <span className="rounded bg-escola-dourado/15 px-1.5 py-0.5 text-escola-dourado">
                {c.tema}
              </span>
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">
                mood: {c.mood}
              </span>
              <span className="rounded bg-escola-border/30 px-1.5 py-0.5 text-escola-creme-50">
                {c.subjects.length} variantes
              </span>
            </div>
          </div>
          <p className="mb-2 text-[10px] italic text-escola-creme-50">
            {c.atmosphere}
          </p>
          <div className="space-y-1.5">
            {c.subjects.map((subj, i) => {
              const prompt = buildMotionPrompt({
                subject: subj,
                atmosphere: c.atmosphere,
                mood: c.mood,
              });
              const key = `${c.name}-${i}`;
              return (
                <div
                  key={key}
                  className="rounded border border-escola-border bg-black/40 p-2"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] text-escola-creme-50">
                      v{i + 1} · {subj.slice(0, 80)}
                      {subj.length > 80 ? "…" : ""}
                    </span>
                    <button
                      onClick={() => copy(key, prompt)}
                      className="shrink-0 rounded border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300 hover:bg-violet-500/20"
                    >
                      {copiedKey === key ? "✓ copiado" : "⌘ copiar prompt"}
                    </button>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded bg-black/60 p-2 font-mono text-[10px] text-escola-creme-50">
                    {prompt}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarView({
  copy,
  copiedKey,
}: {
  copy: (key: string, text: string) => void;
  copiedKey: string | null;
}) {
  const [startDate, setStartDate] = useState<string>("2026-06-01");
  const [days, setDays] = useState<number>(180);

  const rotation = useMemo(() => {
    const [y, m, d] = startDate.split("-").map(Number);
    if (!y || !m || !d) return [];
    return dailyRotation(new Date(Date.UTC(y, m - 1, d)), days);
  }, [startDate, days]);

  // agrupa por mes
  const byMonth = useMemo(() => {
    const groups = new Map<string, typeof rotation>();
    for (const r of rotation) {
      const key = `${r.date.getUTCFullYear()}-${String(r.date.getUTCMonth() + 1).padStart(2, "0")}`;
      const list = groups.get(key) || [];
      list.push(r);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [rotation]);

  const monthsPT = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-escola-border bg-escola-card/40 p-3">
        <label className="flex flex-col gap-1 text-xs text-escola-creme-50">
          Data de início
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-escola-creme-50">
          Nº de dias
          <input
            type="number"
            min={7}
            max={365}
            value={days}
            onChange={(e) => setDays(Math.max(7, Math.min(365, Number(e.target.value))))}
            className="w-24 rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
          />
        </label>
      </div>

      {byMonth.map(([key, entries]) => {
        const [y, m] = key.split("-").map(Number);
        return (
          <div
            key={key}
            className="rounded-lg border border-escola-border bg-escola-card/40 p-3"
          >
            <h3 className="mb-2 text-sm font-semibold text-escola-creme">
              {monthsPT[m - 1]} {y} · {entries.length} dias
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-escola-creme-50">
                <thead className="text-escola-creme">
                  <tr>
                    <th className="px-2 py-1 text-left">Dia</th>
                    <th className="px-2 py-1 text-left">Categoria</th>
                    <th className="px-2 py-1 text-left">Variante</th>
                    <th className="px-2 py-1 text-left">Tema</th>
                    <th className="px-2 py-1 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((r, idx) => {
                    const key = `cal-${r.date.toISOString()}-${r.variantIndex}`;
                    return (
                      <tr
                        key={idx}
                        className="border-t border-escola-border/30 align-top"
                      >
                        <td className="px-2 py-1">
                          <div>{r.date.getUTCDate()}</div>
                          <div className="text-[9px]">
                            {r.date.toISOString().slice(0, 10)}
                          </div>
                        </td>
                        <td className="px-2 py-1">{r.category.name}</td>
                        <td className="px-2 py-1">v{r.variantIndex + 1}</td>
                        <td className="px-2 py-1 text-[10px]">
                          <span className="rounded bg-escola-dourado/15 px-1 py-0.5 text-escola-dourado">
                            {r.category.tema}
                          </span>
                        </td>
                        <td className="px-2 py-1 text-right">
                          <button
                            onClick={() => copy(key, r.prompt)}
                            className="rounded border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300 hover:bg-violet-500/20"
                          >
                            {copiedKey === key ? "✓" : "⌘ copy"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
