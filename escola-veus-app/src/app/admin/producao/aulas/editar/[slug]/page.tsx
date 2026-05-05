"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getCourseBySlug } from "@/data/courses";
import { getBaseScript, type LessonConfig } from "@/lib/course-slides";
import type { LessonScript } from "@/data/course-scripts/ouro-proprio";

/**
 * Editor global do curso — 24 sub-aulas em coluna, todos os 5 campos
 * editáveis. Auto-guarda por sub-aula. Browser Ctrl+F encontra acentos
 * errados. Cada card colapsa/expande individualmente.
 */

type Entry = {
  module: number;
  sub: string;
  config: LessonConfig;
  base: LessonScript | null;
  saveState: "idle" | "saving" | "saved" | "error";
  saveTimer?: ReturnType<typeof setTimeout> | null;
  open: boolean;
};

const FIELDS: Array<{
  key: keyof LessonScript;
  label: string;
  rows: number;
}> = [
  { key: "title", label: "Título", rows: 1 },
  { key: "perguntaInicial", label: "I · Pergunta", rows: 3 },
  { key: "situacaoHumana", label: "II · Situação", rows: 8 },
  { key: "revelacaoPadrao", label: "III · Revelação", rows: 8 },
  { key: "gestoConsciencia", label: "IV · Gesto", rows: 5 },
  { key: "fraseFinal", label: "V · Frase final", rows: 2 },
];

export default function EditarCursoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const course = getCourseBySlug(slug);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("");
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/admin/aulas/config-bulk?slug=${slug}`);
        const j = await r.json();
        if (!alive) return;
        const list: Entry[] = (j.entries ?? []).map(
          (e: { module: number; sub: string; config: LessonConfig }) => ({
            module: e.module,
            sub: e.sub,
            config: e.config ?? {},
            base: getBaseScript(slug, e.module, e.sub),
            saveState: "idle" as const,
            open: false,
          }),
        );
        setEntries(list);
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [slug]);

  function valueFor(entry: Entry, field: keyof LessonScript): string {
    const override = entry.config.script?.[field as keyof typeof entry.config.script] as
      | string
      | undefined;
    if (typeof override === "string" && override.length > 0) return override;
    return (entry.base?.[field] as string) ?? "";
  }

  function setValue(idx: number, field: keyof LessonScript, value: string) {
    setEntries((prev) => {
      const next = [...prev];
      const e = next[idx];
      const nextConfig: LessonConfig = {
        ...e.config,
        script: { ...(e.config.script ?? {}), [field]: value },
      };
      // Se o utilizador estiver a tocar num campo de acto que tinha quebra
      // manual de blocos, abandonamos a quebra (volta ao automático sobre o
      // novo texto) — para não ficar desalinhada.
      if (field !== "title") {
        const actoOf: Record<string, keyof NonNullable<LessonConfig["blockSplits"]>> = {
          perguntaInicial: "pergunta",
          situacaoHumana: "situacao",
          revelacaoPadrao: "revelacao",
          gestoConsciencia: "gesto",
          fraseFinal: "frase",
        };
        const acto = actoOf[field as string];
        if (acto && nextConfig.blockSplits?.[acto]) {
          const splits = { ...nextConfig.blockSplits };
          delete splits[acto];
          nextConfig.blockSplits = Object.keys(splits).length === 0 ? undefined : splits;
        }
      }
      next[idx] = { ...e, config: nextConfig, saveState: "idle" };
      return next;
    });
    scheduleSave(idx);
  }

  function scheduleSave(idx: number) {
    setEntries((prev) => prev); // força captura do entries actualizado no closure
    const key = `${idx}`;
    const existing = timersRef.current.get(key);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      void saveEntry(idx);
      timersRef.current.delete(key);
    }, 800);
    timersRef.current.set(key, timer);
  }

  async function saveEntry(idx: number) {
    setEntries((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], saveState: "saving" };
      return next;
    });
    try {
      const e = entriesRef.current[idx] ?? entries[idx];
      const body = {
        slug,
        module: e.module,
        sub: e.sub,
        config: e.config,
      };
      const r = await fetch("/api/admin/aulas/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      setEntries((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], saveState: "saved" };
        return next;
      });
      setTimeout(() => {
        setEntries((prev) => {
          const next = [...prev];
          if (next[idx]?.saveState === "saved") {
            next[idx] = { ...next[idx], saveState: "idle" };
          }
          return next;
        });
      }, 1500);
    } catch {
      setEntries((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], saveState: "error" };
        return next;
      });
    }
  }

  // Mantém referência sempre actualizada do estado para o save closure
  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  function toggleAll(open: boolean) {
    setEntries((prev) => prev.map((e) => ({ ...e, open })));
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm text-escola-creme">Curso não encontrado.</p>
      </div>
    );
  }

  const filtered = filter.trim()
    ? entries.filter((e) => {
        const lower = filter.toLowerCase();
        return FIELDS.some((f) => valueFor(e, f.key).toLowerCase().includes(lower));
      })
    : entries;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      {/* Cabeçalho */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/producao/aulas"
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            ← Aulas
          </Link>
          <h1 className="mt-2 font-serif text-2xl text-escola-creme">
            Editar texto · {course.title}
          </h1>
          <p className="text-sm text-escola-creme-50">
            Todas as {entries.length || "—"} sub-aulas numa só vista. Auto-guarda
            por sub-aula. Usa <kbd className="rounded bg-escola-border px-1 text-[10px]">⌘/Ctrl+F</kbd>{" "}
            para encontrar acentos errados.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar (ex: nao)"
            className="w-44 rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme focus:border-escola-dourado/50 focus:outline-none"
          />
          <button
            onClick={() => toggleAll(true)}
            className="rounded border border-escola-border px-2 py-1 text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
          >
            Abrir todas
          </button>
          <button
            onClick={() => toggleAll(false)}
            className="rounded border border-escola-border px-2 py-1 text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
          >
            Fechar todas
          </button>
        </div>
      </div>

      {!loaded && (
        <p className="text-xs text-escola-creme-50">A carregar overrides do curso…</p>
      )}

      {loaded && filtered.length === 0 && (
        <p className="text-xs text-escola-creme-50">
          {filter
            ? `Nenhuma sub-aula tem "${filter}".`
            : "Nenhuma sub-aula com script base. Verifica src/data/course-scripts/."}
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((e) => {
          const i = entries.findIndex((x) => x.module === e.module && x.sub === e.sub);
          const subTitle = course.modules
            .find((m) => m.number === e.module)
            ?.subLessons.find((sl) => sl.letter.toUpperCase() === e.sub.toUpperCase())?.title;
          const hasBase = !!e.base;
          return (
            <section
              key={`${e.module}-${e.sub}`}
              className="overflow-hidden rounded-xl border border-escola-border bg-escola-card"
            >
              <button
                onClick={() => {
                  setEntries((prev) => {
                    const n = [...prev];
                    n[i] = { ...n[i], open: !n[i].open };
                    return n;
                  });
                }}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-escola-creme">
                    M{e.module}·{e.sub.toUpperCase()}{" "}
                    <span className="text-escola-creme-50">— {subTitle ?? "(sem título)"}</span>
                  </p>
                  {!hasBase && (
                    <p className="text-[10px] text-escola-creme-50">
                      Script base ainda não escrito (só Ouro Próprio tem texto).
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2 text-[10px]">
                  <Link
                    href={`/admin/producao/aulas/preview/${slug}/${e.module}/${e.sub}`}
                    onClick={(ev) => ev.stopPropagation()}
                    className="rounded border border-escola-border px-2 py-0.5 text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                  >
                    abrir preview ↗
                  </Link>
                  {e.saveState === "saving" && <span className="text-escola-creme-50">A guardar…</span>}
                  {e.saveState === "saved" && <span className="text-escola-dourado">✓</span>}
                  {e.saveState === "error" && <span className="text-red-400">erro</span>}
                  <span className="text-escola-creme-50">{e.open ? "−" : "+"}</span>
                </div>
              </button>

              {e.open && hasBase && (
                <div className="space-y-3 border-t border-escola-border px-4 py-4">
                  {FIELDS.map((f) => {
                    const value = valueFor(e, f.key);
                    const isOverride = !!(
                      e.config.script?.[f.key as keyof typeof e.config.script]
                    );
                    return (
                      <div key={f.key as string}>
                        <div className="mb-1 flex items-center justify-between">
                          <label className="text-[10px] uppercase tracking-wider text-escola-dourado">
                            {f.label}
                          </label>
                          <span className="text-[10px] text-escola-creme-50">
                            {value.length} chars{isOverride && " · editado"}
                          </span>
                        </div>
                        {f.key === "title" ? (
                          <input
                            value={value}
                            onChange={(ev) => setValue(i, f.key, ev.target.value)}
                            className={`w-full rounded border bg-escola-bg px-3 py-2 font-serif text-sm text-escola-creme focus:border-escola-dourado/50 focus:outline-none ${
                              isOverride ? "border-escola-dourado/30" : "border-escola-border"
                            }`}
                          />
                        ) : (
                          <textarea
                            value={value}
                            onChange={(ev) => setValue(i, f.key, ev.target.value)}
                            rows={f.rows}
                            className={`w-full resize-y rounded border bg-escola-bg px-3 py-2 font-serif text-sm leading-relaxed text-escola-creme focus:border-escola-dourado/50 focus:outline-none ${
                              isOverride ? "border-escola-dourado/30" : "border-escola-border"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
