"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getCourseBySlug } from "@/data/courses";
import { getTerritoryTheme } from "@/data/territory-themes";
import { renderDiagram, DIAGRAM_LABELS, type Diagram, type DiagramType } from "@/lib/diagrams";
import type { LessonConfig } from "@/lib/course-slides";

type Suggestion = {
  moduleNumber: number;
  sub: string;
  slideIdx: number;
  acto: string;
  type: DiagramType;
  terms: string[];
  central?: string;
  reason: string;
};

type Status = "pending" | "accepted" | "rejected" | "applying" | "applied" | "error";

export default function DiagramasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const course = getCourseBySlug(slug);
  const accent = getTerritoryTheme(slug)?.primary ?? "#C9A96E";

  const [items, setItems] = useState<Array<Suggestion & { status: Status; error?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [failed, setFailed] = useState<number[]>([]);

  async function safeJson(res: Response) {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return { ok: res.ok, data, erro: res.ok ? undefined : (data?.erro ?? `HTTP ${res.status}`) };
    } catch {
      return {
        ok: false,
        data: {},
        erro: `Resposta inválida (HTTP ${res.status}). ${text.slice(0, 120)}`,
      };
    }
  }

  async function pedir(modules: number[], appendToExisting = false) {
    setLoading(true);
    setRequestError(null);
    setProgress({ current: 0, total: modules.length });
    const acc: Suggestion[] = appendToExisting
      ? items.map(({ status: _s, error: _e, ...rest }) => rest)
      : [];
    const newFailed: number[] = [];
    const errs: string[] = [];

    if (!appendToExisting) setItems([]);

    for (let i = 0; i < modules.length; i++) {
      const m = modules[i];
      try {
        const r = await fetch("/api/admin/aulas/suggest-diagrams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, module: m }),
        });
        const { ok, data, erro } = await safeJson(r);
        if (!ok) {
          newFailed.push(m);
          errs.push(`M${m}: ${erro}`);
        } else {
          const sugs = (data.suggestions as Suggestion[]) ?? [];
          for (const s of sugs) {
            const dup = acc.some(
              (a) =>
                a.moduleNumber === s.moduleNumber &&
                a.sub === s.sub &&
                a.slideIdx === s.slideIdx,
            );
            if (!dup) acc.push(s);
          }
          setItems(acc.map((s) => ({ ...s, status: "pending" as Status })));
        }
      } catch (err) {
        newFailed.push(m);
        errs.push(`M${m}: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setProgress({ current: i + 1, total: modules.length });
      }
    }

    setFailed(newFailed);
    if (errs.length > 0) setRequestError(errs.join(" · "));
    setLoading(false);
    setProgress(null);
  }

  function pedirTudo() {
    if (!course) return;
    void pedir(course.modules.map((m) => m.number));
  }
  function tentarFalhados() {
    if (failed.length === 0) return;
    void pedir([...failed], true);
  }

  async function aplicar(idx: number) {
    setItems((p) => p.map((it, i) => (i === idx ? { ...it, status: "applying" } : it)));
    const it = items[idx];
    try {
      const cfgRes = await fetch(
        `/api/admin/aulas/config?slug=${slug}&module=${it.moduleNumber}&sub=${it.sub}`,
      );
      const cfg = (await cfgRes.json()).config ?? {};
      const diagram: Diagram = {
        type: it.type,
        terms: it.terms,
        central: it.central,
      };
      const next: LessonConfig = {
        ...cfg,
        diagrams: { ...(cfg.diagrams ?? {}), [String(it.slideIdx)]: diagram },
      };
      const r = await fetch("/api/admin/aulas/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, module: it.moduleNumber, sub: it.sub, config: next }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setItems((p) => p.map((x, i) => (i === idx ? { ...x, status: "applied" } : x)));
    } catch (err) {
      setItems((p) =>
        p.map((x, i) =>
          i === idx
            ? { ...x, status: "error", error: err instanceof Error ? err.message : String(err) }
            : x,
        ),
      );
    }
  }

  async function aplicarAceites() {
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === "accepted" || items[i].status === "pending") {
        // eslint-disable-next-line no-await-in-loop
        await aplicar(i);
      }
    }
  }

  const stats = {
    pending: items.filter((i) => i.status === "pending").length,
    accepted: items.filter((i) => i.status === "accepted").length,
    applied: items.filter((i) => i.status === "applied").length,
    rejected: items.filter((i) => i.status === "rejected").length,
    err: items.filter((i) => i.status === "error").length,
  };

  if (!course) {
    return <div className="p-6 text-sm text-escola-creme">Curso não encontrado.</div>;
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
        Diagramas — Claude propõe · {course.title}
      </h1>
      <p className="text-sm text-escola-creme-50">
        A Claude lê o curso e propõe pequenas infografias minimais nos slides
        onde fazem sentido. Tu aceitas, rejeitas ou aplicas selectivamente.
      </p>

      <div className="my-5 flex flex-wrap items-center gap-3">
        <button
          onClick={pedirTudo}
          disabled={loading}
          className="rounded-lg bg-escola-dourado px-4 py-2 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading
            ? progress
              ? `A pedir à Claude… (M${progress.current}/${progress.total})`
              : "A pedir…"
            : items.length === 0
              ? "Pedir sugestões"
              : "Pedir nova revisão"}
        </button>

        {failed.length > 0 && !loading && (
          <button
            onClick={tentarFalhados}
            className="rounded border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20"
          >
            ↻ Tentar só os módulos com erro ({failed.map((m) => `M${m}`).join(", ")})
          </button>
        )}

        {items.length > 0 && (
          <>
            <button
              onClick={aplicarAceites}
              disabled={stats.pending + stats.accepted === 0}
              className="rounded border border-escola-dourado/40 bg-escola-dourado/10 px-3 py-2 text-xs text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-40"
            >
              Aplicar todas as pendentes/aceites ({stats.pending + stats.accepted})
            </button>
            <span className="text-[11px] text-escola-creme-50">
              {items.length} sugestões · ✓ {stats.applied} · • {stats.pending} · ✗ {stats.rejected}
            </span>
          </>
        )}
      </div>

      {requestError && (
        <p className="mb-4 rounded border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-300">
          {requestError}
        </p>
      )}

      {!loading && items.length === 0 && !requestError && (
        <p className="text-xs text-escola-creme-50">
          Carrega em &ldquo;Pedir sugestões&rdquo; — a Claude varre todos os
          módulos e devolve infografias propostas (~30-90s).
        </p>
      )}

      <div className="space-y-4">
        {items.map((it, idx) => {
          const diagram: Diagram = { type: it.type, terms: it.terms, central: it.central };
          const svg = renderDiagram(diagram, accent);
          const isFinal =
            it.status === "applied" || it.status === "rejected" || it.status === "error";
          return (
            <section
              key={`${it.moduleNumber}-${it.sub}-${it.slideIdx}-${idx}`}
              className={`rounded-xl border p-4 transition-opacity ${
                isFinal ? "opacity-50" : ""
              } ${
                it.status === "applied"
                  ? "border-escola-dourado/40 bg-escola-dourado/5"
                  : it.status === "error"
                    ? "border-red-400/40 bg-red-500/5"
                    : "border-escola-border bg-escola-card"
              }`}
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-escola-dourado">
                    M{it.moduleNumber}·{it.sub.toUpperCase()} · slide {it.slideIdx + 1} · {it.acto}
                  </p>
                  <p className="mt-1 font-serif text-base text-escola-creme">
                    {DIAGRAM_LABELS[it.type]}
                  </p>
                  {it.reason && (
                    <p className="mt-1 text-[11px] italic text-escola-creme-50">
                      &ldquo;{it.reason}&rdquo;
                    </p>
                  )}
                </div>
                <Link
                  href={`/admin/producao/aulas/preview/${slug}/${it.moduleNumber}/${it.sub}`}
                  target="_blank"
                  className="rounded border border-escola-border px-2 py-1 text-[10px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                >
                  abrir preview ↗
                </Link>
              </div>

              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-escola-bg p-4">
                  <p className="mb-2 text-[10px] uppercase tracking-wider text-escola-creme-50">
                    Pré-visualização SVG
                  </p>
                  <div
                    className="flex justify-center"
                    style={{ maxHeight: "260px", overflow: "hidden" }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                </div>
                <div className="rounded-lg bg-escola-bg p-4 text-xs text-escola-creme">
                  {it.central && (
                    <div className="mb-1">
                      <span className="text-escola-creme-50">central: </span>
                      <span className="text-escola-dourado">{it.central}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-escola-creme-50">termos:</span>
                    <ul className="mt-1 list-disc pl-4 text-escola-creme">
                      {it.terms.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {(it.status === "pending" || it.status === "accepted") && (
                  <>
                    <button
                      onClick={() =>
                        setItems((p) => p.map((x, i) => (i === idx ? { ...x, status: "rejected" } : x)))
                      }
                      className="rounded border border-escola-border px-3 py-1 text-escola-creme-50 hover:border-red-400/40 hover:text-red-300"
                    >
                      ✗ Rejeitar
                    </button>
                    {it.status === "pending" ? (
                      <button
                        onClick={() =>
                          setItems((p) => p.map((x, i) => (i === idx ? { ...x, status: "accepted" } : x)))
                        }
                        className="rounded border border-escola-border px-3 py-1 text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                      >
                        Marcar aceite
                      </button>
                    ) : (
                      <span className="text-[10px] text-escola-dourado">aceite</span>
                    )}
                    <button
                      onClick={() => aplicar(idx)}
                      className="rounded border border-escola-dourado/40 bg-escola-dourado/10 px-3 py-1 text-escola-dourado hover:bg-escola-dourado/20"
                    >
                      ✓ Aplicar agora
                    </button>
                  </>
                )}
                {it.status === "applying" && (
                  <span className="text-[11px] text-escola-creme-50">A aplicar…</span>
                )}
                {it.status === "applied" && (
                  <span className="text-[11px] text-escola-dourado">✓ Aplicado</span>
                )}
                {it.status === "rejected" && (
                  <span className="text-[11px] text-escola-creme-50">✗ Rejeitado</span>
                )}
                {it.status === "error" && (
                  <span className="text-[11px] text-red-300">erro: {it.error}</span>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
