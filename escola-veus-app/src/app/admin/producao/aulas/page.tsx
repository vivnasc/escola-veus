"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import COURSES from "@/data/courses";
import PromptEditor from "@/components/admin/PromptEditor";

type AulaStatus = { script: boolean; audio: boolean; video: boolean };
type AulaEntry = {
  id: string;
  titulo: string;
  curso: string;
  moduleNum: number | null;
  subLetter: string | null;
  status: AulaStatus;
};

export default function AulasPage() {
  const [open, setOpen] = useState<string | null>(COURSES[0]?.slug ?? null);
  const [tab, setTab] = useState<"cursos" | "prompts">("cursos");
  const [aulasStatus, setAulasStatus] = useState<AulaEntry[] | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    setLoadingStatus(true);
    fetch("/api/admin/aulas/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.aulas)) setAulasStatus(d.aulas);
      })
      .catch(() => {})
      .finally(() => setLoadingStatus(false));
  }, []);

  const totalModules = COURSES.reduce((n, c) => n + c.modules.length, 0);
  const totalSubLessons = COURSES.reduce(
    (n, c) => n + c.modules.reduce((m, mod) => m + mod.subLessons.length, 0),
    0,
  );

  // Helper: aulas do curso agrupadas por módulo
  function findAulaByKey(curso: string, moduleNum: number, subLetter: string): AulaEntry | null {
    if (!aulasStatus) return null;
    return (
      aulasStatus.find(
        (a) => a.curso === curso && a.moduleNum === moduleNum && a.subLetter === subLetter,
      ) ?? null
    );
  }

  // Resumo por curso (% de áudios gerados dos scripts existentes)
  function cursoProgress(cursoSlug: string): { generated: number; total: number } {
    if (!aulasStatus) return { generated: 0, total: 0 };
    const cursoAulas = aulasStatus.filter((a) => a.curso === cursoSlug);
    return {
      generated: cursoAulas.filter((a) => a.status.audio).length,
      total: cursoAulas.length,
    };
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-escola-creme">
          Aulas — Vídeos dos cursos
        </h2>
        <p className="mt-1 text-sm text-escola-creme-50">
          {COURSES.length} cursos · {totalModules} módulos · {totalSubLessons} aulas
        </p>
        <p className="mt-2 text-xs text-escola-creme-50">
          Vídeo = slides + música Ancient Ground (sem voz). Áudio ElevenLabs é
          entrega separada para quem prefere ouvir.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        <Link
          href="/admin/producao/audios"
          className="rounded-lg border border-escola-border bg-escola-card px-3 py-1.5 text-escola-creme hover:border-escola-dourado/40"
        >
          → Áudios ElevenLabs (cursos)
        </Link>
        <Link
          href="/admin/escola/materiais"
          className="rounded-lg border border-escola-border bg-escola-card px-3 py-1.5 text-escola-creme hover:border-escola-dourado/40"
        >
          → Manuais & cadernos
        </Link>
      </div>

      <nav className="mb-6 flex gap-1 border-b border-escola-border">
        {(["cursos", "prompts"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-xs transition-colors ${
              tab === t
                ? "border-escola-dourado text-escola-dourado"
                : "border-transparent text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            {t === "cursos" ? "Cursos" : "Prompts"}
          </button>
        ))}
      </nav>

      {tab === "prompts" && <PromptEditor collection="aulas" />}

      {tab === "cursos" && (
      <div className="space-y-2">
        {COURSES.map((c) => {
          const isOpen = open === c.slug;
          const subCount = c.modules.reduce((n, m) => n + m.subLessons.length, 0);
          const prog = cursoProgress(c.slug);
          const hasScripts = prog.total > 0;
          const pct = hasScripts ? Math.round((prog.generated / prog.total) * 100) : 0;

          return (
            <section
              key={c.slug}
              className="overflow-hidden rounded-xl border border-escola-border bg-escola-card"
            >
              <button
                onClick={() => setOpen(isOpen ? null : c.slug)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-escola-creme">
                    {c.number}. {c.title}
                  </p>
                  <p className="text-xs text-escola-creme-50">{c.subtitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs">
                  {hasScripts ? (
                    <Pill
                      label="áudios"
                      ok={prog.generated === prog.total}
                      partial={prog.generated > 0 && prog.generated < prog.total}
                      value={`${prog.generated}/${prog.total}`}
                      loading={loadingStatus && !aulasStatus}
                    />
                  ) : (
                    <Pill label="scripts" value="por escrever" />
                  )}
                  <span className="text-escola-creme-50">
                    {c.modules.length}M · {subCount}A
                  </span>
                </div>
              </button>

              {isOpen && (
                <ul className="divide-y divide-escola-border border-t border-escola-border">
                  {c.modules.map((mod) => (
                    <li key={mod.number} className="px-4 py-2.5">
                      <p className="text-sm text-escola-creme">
                        M{mod.number}. {mod.title}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {mod.subLessons.map((sub) => {
                          const aula = findAulaByKey(c.slug, mod.number, sub.letter);
                          return (
                            <div
                              key={sub.letter}
                              className="flex items-center gap-1 rounded border border-escola-border bg-escola-bg px-2 py-1"
                            >
                              <span className="text-[10px] text-escola-creme">
                                {sub.letter}
                              </span>
                              <Pill
                                label="áudio"
                                ok={!!aula?.status.audio}
                                value={aula ? (aula.status.audio ? "✓" : "×") : "—"}
                                loading={loadingStatus && !aulasStatus}
                              />
                              <Pill
                                label="vídeo"
                                ok={!!aula?.status.video}
                                value={aula ? (aula.status.video ? "✓" : "×") : "—"}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
        {!loadingStatus && (
          <p className="mt-4 text-xs text-escola-creme-50">
            {pct(aulasStatus)}% dos áudios dos cursos escritos já gerados. Cursos "por escrever"
            ainda não têm scripts em{" "}
            <code className="rounded bg-escola-border px-1">nomear-scripts.ts</code>.
          </p>
        )}
      </div>
      )}
    </div>
  );
}

function pct(aulas: AulaEntry[] | null): number {
  if (!aulas || aulas.length === 0) return 0;
  return Math.round(
    (aulas.filter((a) => a.status.audio).length / aulas.length) * 100,
  );
}

function Pill({
  label,
  value,
  ok,
  partial,
  loading,
}: {
  label: string;
  value: string;
  ok?: boolean;
  partial?: boolean;
  loading?: boolean;
}) {
  let cls = "bg-escola-border text-escola-creme-50";
  if (loading) cls = "bg-escola-border text-escola-creme-50 animate-pulse";
  else if (ok) cls = "bg-escola-dourado/10 text-escola-dourado";
  else if (partial) cls = "bg-escola-terracota/10 text-escola-terracota";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${cls}`}>
      <span className="text-[9px] uppercase tracking-wider opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}
