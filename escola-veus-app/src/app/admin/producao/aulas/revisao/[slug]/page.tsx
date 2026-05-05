"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getCourseBySlug } from "@/data/courses";

/**
 * Revisão Claude do curso. Pede sugestões de acentos / travessões /
 * ortografia ao Claude para todas as sub-aulas. A Vivianne aceita ou
 * rejeita uma a uma (ou tudo de uma vez). Aplicar = guarda override no
 * mesmo endpoint /api/admin/aulas/config que a preview usa.
 */

type Field =
  | "title"
  | "perguntaInicial"
  | "situacaoHumana"
  | "revelacaoPadrao"
  | "gestoConsciencia"
  | "fraseFinal";

type Suggestion = {
  moduleNumber: number;
  sub: string;
  field: Field;
  original: string;
  suggested: string;
  reason: string;
};

type Status = "pending" | "accepted" | "rejected" | "applying" | "applied" | "error";

const FIELD_LABELS: Record<Field, string> = {
  title: "Título",
  perguntaInicial: "I · Pergunta",
  situacaoHumana: "II · Situação",
  revelacaoPadrao: "III · Revelação",
  gestoConsciencia: "IV · Gesto",
  fraseFinal: "V · Frase final",
};

export default function RevisaoCursoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const course = getCourseBySlug(slug);
  const [items, setItems] = useState<Array<Suggestion & { status: Status; error?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [hideAccepted, setHideAccepted] = useState(false);

  async function pedirRevisao() {
    setLoading(true);
    setRequestError(null);
    setItems([]);
    try {
      const r = await fetch("/api/admin/aulas/review-accents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro ?? `HTTP ${r.status}`);
      setItems(
        (j.suggestions as Suggestion[]).map((s) => ({ ...s, status: "pending" as Status })),
      );
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function aplicarItem(idx: number) {
    const it = items[idx];
    setItems((prev) => {
      const n = [...prev];
      n[idx] = { ...n[idx], status: "applying" };
      return n;
    });
    try {
      // Carrega config actual desta sub-aula (para não pisar overrides
      // existentes — só toca no campo desta sugestão).
      const cfgRes = await fetch(
        `/api/admin/aulas/config?slug=${slug}&module=${it.moduleNumber}&sub=${it.sub}`,
      );
      const cfgJson = await cfgRes.json();
      const config = cfgJson.config ?? {};
      const nextConfig = {
        ...config,
        script: { ...(config.script ?? {}), [it.field]: it.suggested },
      };
      // Se o acto correspondente tinha quebra manual de blocos, descartar
      // (ficaria desalinhada com o novo texto).
      const actoOf: Record<string, string> = {
        perguntaInicial: "pergunta",
        situacaoHumana: "situacao",
        revelacaoPadrao: "revelacao",
        gestoConsciencia: "gesto",
        fraseFinal: "frase",
      };
      const acto = actoOf[it.field];
      if (acto && nextConfig.blockSplits?.[acto]) {
        const splits = { ...nextConfig.blockSplits };
        delete splits[acto];
        nextConfig.blockSplits = Object.keys(splits).length === 0 ? undefined : splits;
      }
      const saveRes = await fetch("/api/admin/aulas/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          module: it.moduleNumber,
          sub: it.sub,
          config: nextConfig,
        }),
      });
      if (!saveRes.ok) throw new Error(`HTTP ${saveRes.status}`);
      setItems((prev) => {
        const n = [...prev];
        n[idx] = { ...n[idx], status: "applied" };
        return n;
      });
    } catch (err) {
      setItems((prev) => {
        const n = [...prev];
        n[idx] = {
          ...n[idx],
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        };
        return n;
      });
    }
  }

  async function aplicarTodos() {
    const pending = items
      .map((it, i) => ({ it, i }))
      .filter(({ it }) => it.status === "pending" || it.status === "accepted");
    for (const { i } of pending) {
      // eslint-disable-next-line no-await-in-loop
      await aplicarItem(i);
    }
  }

  function rejeitar(idx: number) {
    setItems((prev) => {
      const n = [...prev];
      n[idx] = { ...n[idx], status: "rejected" };
      return n;
    });
  }

  function aceitar(idx: number) {
    setItems((prev) => {
      const n = [...prev];
      n[idx] = { ...n[idx], status: "accepted" };
      return n;
    });
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm text-escola-creme">Curso não encontrado.</p>
      </div>
    );
  }

  const stats = {
    pending: items.filter((i) => i.status === "pending").length,
    accepted: items.filter((i) => i.status === "accepted").length,
    applied: items.filter((i) => i.status === "applied").length,
    rejected: items.filter((i) => i.status === "rejected").length,
  };

  const visible = hideAccepted
    ? items.filter((i) => i.status !== "applied" && i.status !== "rejected")
    : items;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <div className="mb-5">
        <Link
          href="/admin/producao/aulas"
          className="text-xs text-escola-creme-50 hover:text-escola-creme"
        >
          ← Aulas
        </Link>
        <h1 className="mt-2 font-serif text-2xl text-escola-creme">
          Revisão Claude · {course.title}
        </h1>
        <p className="mt-1 text-sm text-escola-creme-50">
          A Claude lê todos os textos das {course.modules.reduce((n, m) => n + m.subLessons.length, 0)} sub-aulas e
          devolve sugestões de acentos PT-PT, travessões em conteúdo, e ortografia. Tu decides
          quais aplicar.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={pedirRevisao}
          disabled={loading}
          className="rounded-lg bg-escola-dourado px-4 py-2 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "A pedir revisão à Claude…" : items.length === 0 ? "Pedir revisão" : "Pedir nova revisão"}
        </button>

        {items.length > 0 && (
          <>
            <button
              onClick={aplicarTodos}
              disabled={stats.pending + stats.accepted === 0}
              className="rounded border border-escola-dourado/40 bg-escola-dourado/10 px-3 py-2 text-xs text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-40"
            >
              Aplicar todas as pendentes/aceites ({stats.pending + stats.accepted})
            </button>
            <label className="flex items-center gap-1.5 text-[11px] text-escola-creme-50">
              <input
                type="checkbox"
                checked={hideAccepted}
                onChange={(e) => setHideAccepted(e.target.checked)}
              />
              Esconder já aplicadas/rejeitadas
            </label>
            <span className="text-[11px] text-escola-creme-50">
              {items.length} sugestões · ✓ {stats.applied} · • {stats.pending} · ✗ {stats.rejected}
            </span>
          </>
        )}
      </div>

      {requestError && (
        <p className="mb-4 rounded border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {requestError}
        </p>
      )}

      {!loading && items.length === 0 && !requestError && (
        <p className="text-sm text-escola-creme-50">
          Carrega em &ldquo;Pedir revisão&rdquo; e a Claude varre o curso. Pode demorar 20-60s.
        </p>
      )}

      <div className="space-y-3">
        {visible.map((item) => {
          const idx = items.indexOf(item);
          const isFinal = item.status === "applied" || item.status === "rejected";
          return (
            <article
              key={`${item.moduleNumber}-${item.sub}-${item.field}-${idx}`}
              className={`rounded-xl border p-4 ${
                item.status === "applied"
                  ? "border-escola-dourado/40 bg-escola-dourado/5"
                  : item.status === "rejected"
                    ? "border-escola-border bg-escola-card opacity-60"
                    : item.status === "accepted"
                      ? "border-escola-dourado/30 bg-escola-card"
                      : "border-escola-border bg-escola-card"
              }`}
            >
              <header className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-escola-dourado/10 px-2 py-0.5 text-escola-dourado">
                    M{item.moduleNumber}·{item.sub.toUpperCase()}
                  </span>
                  <span className="text-escola-creme-50">{FIELD_LABELS[item.field]}</span>
                  <span className="text-escola-creme-50">· {item.reason}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/producao/aulas/preview/${slug}/${item.moduleNumber}/${item.sub}`}
                    target="_blank"
                    className="text-escola-creme-50 hover:text-escola-creme"
                  >
                    abrir preview ↗
                  </Link>
                  {item.status === "applied" && <span className="text-escola-dourado">✓ aplicada</span>}
                  {item.status === "rejected" && <span className="text-escola-creme-50">✗ rejeitada</span>}
                  {item.status === "applying" && <span className="text-escola-creme-50">a aplicar…</span>}
                  {item.status === "error" && (
                    <span className="text-red-400">erro: {item.error}</span>
                  )}
                </div>
              </header>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-escola-creme-50">
                    Original
                  </p>
                  <p className="whitespace-pre-line rounded border border-escola-border bg-escola-bg/40 p-3 font-serif text-sm leading-relaxed text-escola-creme-50">
                    {item.original}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-escola-dourado">
                    Sugerido
                  </p>
                  <p className="whitespace-pre-line rounded border border-escola-dourado/30 bg-escola-bg/40 p-3 font-serif text-sm leading-relaxed text-escola-creme">
                    {item.suggested}
                  </p>
                </div>
              </div>

              {!isFinal && (
                <div className="mt-3 flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => rejeitar(idx)}
                    className="rounded border border-escola-border px-3 py-1 text-escola-creme-50 hover:border-red-400/40 hover:text-red-300"
                  >
                    ✗ Rejeitar
                  </button>
                  {item.status !== "accepted" && (
                    <button
                      onClick={() => aceitar(idx)}
                      className="rounded border border-escola-border px-3 py-1 text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                      title="Marcar como aceite (não aplica ainda)"
                    >
                      Marcar aceite
                    </button>
                  )}
                  <button
                    onClick={() => aplicarItem(idx)}
                    disabled={item.status === "applying"}
                    className="rounded bg-escola-dourado px-3 py-1 text-escola-bg hover:opacity-90 disabled:opacity-40"
                  >
                    ✓ Aplicar agora
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
