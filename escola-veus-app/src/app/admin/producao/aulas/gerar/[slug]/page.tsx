"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import COURSES from "@/data/courses";

type ModuleStatus = "idle" | "generating" | "done" | "error";

type ModuleState = {
  status: ModuleStatus;
  saved?: Array<{ sub: string; ok: boolean; erro?: string }>;
  erro?: string;
  cacheRead?: number;
  cacheCreate?: number;
};

export default function GerarScriptsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const course = useMemo(() => COURSES.find((c) => c.slug === slug), [slug]);
  const [modulesState, setModulesState] = useState<Record<number, ModuleState>>({});

  if (!course) {
    return (
      <div className="p-6 text-escola-creme">
        Curso <code>{slug}</code> não existe.
      </div>
    );
  }

  async function generateModule(moduleNumber: number) {
    setModulesState((p) => ({ ...p, [moduleNumber]: { status: "generating" } }));
    try {
      const res = await fetch("/api/admin/aulas/generate-scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, module: moduleNumber }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setModulesState((p) => ({
          ...p,
          [moduleNumber]: {
            status: "error",
            erro: data.erro ?? "Falha sem mensagem",
            saved: data.saved,
          },
        }));
        return;
      }
      setModulesState((p) => ({
        ...p,
        [moduleNumber]: {
          status: "done",
          saved: data.saved,
          cacheRead: data.usage?.cache_read_input_tokens,
          cacheCreate: data.usage?.cache_creation_input_tokens,
        },
      }));
    } catch (err) {
      setModulesState((p) => ({
        ...p,
        [moduleNumber]: {
          status: "error",
          erro: err instanceof Error ? err.message : "Erro",
        },
      }));
    }
  }

  async function generateAll() {
    for (const mod of course!.modules) {
      // eslint-disable-next-line no-await-in-loop
      await generateModule(mod.number);
    }
  }

  const isOuroProprio = slug === "ouro-proprio";
  const totalSubs = course.modules.reduce((n, m) => n + m.subLessons.length, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/admin/producao/aulas"
          className="text-xs text-escola-creme-50 hover:text-escola-creme"
        >
          ← Aulas
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-escola-creme">
          Gerar scripts via Claude — {course.title}
        </h1>
        <p className="mt-1 text-sm text-escola-creme-50">
          {course.modules.length} módulos · {totalSubs} sub-aulas. Custo
          estimado ~€0.015/módulo (cache 1h activa).
        </p>
        {isOuroProprio && (
          <div className="mt-3 rounded-lg border border-amber-700/40 bg-amber-950/30 p-3 text-xs text-amber-200">
            ⚠ Ouro Próprio já tem scripts hardcoded em
            <code className="mx-1">course-scripts/ouro-proprio.ts</code>. Gerar
            aqui só sobrescreve o override em Supabase (não toca no ficheiro).
          </div>
        )}
      </div>

      <div className="mb-4">
        <button
          onClick={generateAll}
          className="rounded-lg border border-escola-dourado/40 bg-escola-card px-4 py-2 text-sm text-escola-creme hover:bg-escola-dourado/10"
        >
          Gerar todos os módulos (sequencial)
        </button>
      </div>

      <div className="space-y-3">
        {course.modules.map((mod) => {
          const state = modulesState[mod.number] ?? { status: "idle" as ModuleStatus };
          return (
            <div
              key={mod.number}
              className="rounded-lg border border-escola-border bg-escola-card p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-serif text-lg text-escola-creme">
                    Módulo {mod.number}: {mod.title}
                  </h3>
                  <p className="mt-1 text-xs text-escola-creme-50">
                    {mod.description}
                  </p>
                  <p className="mt-2 text-xs text-escola-creme-50">
                    Sub-aulas:{" "}
                    {mod.subLessons.map((s) => `${s.letter}. ${s.title}`).join(" · ")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => generateModule(mod.number)}
                    disabled={state.status === "generating"}
                    className="whitespace-nowrap rounded-md border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:border-escola-dourado/40 disabled:opacity-50"
                  >
                    {state.status === "generating"
                      ? "A gerar..."
                      : state.status === "done"
                        ? "↻ Regerar"
                        : `Gerar M${mod.number}`}
                  </button>
                  {state.status === "done" && (
                    <span className="text-xs text-emerald-300">✓ {state.saved?.filter((s) => s.ok).length}/{state.saved?.length ?? 0}</span>
                  )}
                  {state.status === "error" && (
                    <span className="text-xs text-rose-300">erro</span>
                  )}
                </div>
              </div>

              {state.status === "done" && state.saved && (
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  {state.saved.map((s) => (
                    <div
                      key={s.sub}
                      className={`rounded border px-2 py-1 ${
                        s.ok
                          ? "border-emerald-700/40 bg-emerald-950/20 text-emerald-200"
                          : "border-rose-700/40 bg-rose-950/20 text-rose-200"
                      }`}
                    >
                      M{mod.number}·{s.sub.toUpperCase()}{" "}
                      {s.ok ? (
                        <Link
                          href={`/admin/producao/aulas/preview/${slug}/${mod.number}/${s.sub}`}
                          className="ml-1 underline"
                        >
                          preview
                        </Link>
                      ) : (
                        <span className="ml-1 opacity-70">{s.erro}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {state.status === "done" && (state.cacheRead || state.cacheCreate) ? (
                <p className="mt-2 text-[11px] text-escola-creme-50">
                  cache: read {state.cacheRead ?? 0} / create {state.cacheCreate ?? 0} tokens
                </p>
              ) : null}

              {state.status === "error" && state.erro && (
                <p className="mt-2 text-xs text-rose-300">{state.erro}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg border border-escola-border bg-escola-card p-4 text-xs text-escola-creme-50">
        <p className="mb-2 font-medium text-escola-creme">Como funciona:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            Cada botão chama <code>POST /api/admin/aulas/generate-scripts</code>{" "}
            com <code>{`{ slug, module }`}</code>.
          </li>
          <li>
            Claude (sonnet-4-6) recebe o sistema PT-PT + tom Escola dos Véus +
            2 exemplos de Ouro Próprio (em cache 1h). User prompt: meta do
            curso + descrição do módulo + 3 sub-aulas.
          </li>
          <li>
            Output é JSON com 5 actos × N sub-aulas. Guarda em{" "}
            <code>course-assets/admin/aulas-config/{slug}/m&lt;N&gt;-&lt;letra&gt;.json</code>{" "}
            (campo <code>script</code>) preservando o resto do override
            (blockSplits, agTrack, etc.).
          </li>
          <li>
            Carrega <strong>preview</strong> em cada sub-aula para validar antes
            de mandar render.
          </li>
        </ul>
      </div>
    </div>
  );
}
