"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getCourseBySlug } from "@/data/courses";
import { getTerritoryStyle } from "@/data/territory-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { ManualChapterCard } from "@/components/escola/ManualChapterCard";
import { AskClaude } from "@/components/escola/AskClaude";
import { getManualChapter } from "@/data/course-manuals";

export default function ModuloPage() {
  const params = useParams();
  const slug = params.slug as string;
  const moduloNum = parseInt(params.modulo as string, 10);
  const { user, isSubscribed } = useAuth();
  const { isSublessonCompleted, isModuleCompleted, isModuleAccessible, courseProgress } =
    useProgress(slug);

  const course = getCourseBySlug(slug);
  if (!course) return <NotFound />;

  const themeStyle = getTerritoryStyle(slug);
  const mod = course.modules.find((m) => m.number === moduloNum);
  if (!mod) return <NotFound />;

  const isFreeTier = mod.number === 1;
  const hasAccess = isFreeTier || isSubscribed;
  const accessible = isModuleAccessible(moduloNum);
  const completed = isModuleCompleted(moduloNum);
  const chapter = getManualChapter(slug, moduloNum);

  // Count completed sub-lessons for this module
  const completedSubs = mod.subLessons.filter((sl) =>
    isSublessonCompleted(moduloNum, sl.letter)
  ).length;
  const totalSubs = mod.subLessons.length;

  // Find first incomplete sub-lesson
  const firstIncomplete = mod.subLessons.find(
    (sl) => !isSublessonCompleted(moduloNum, sl.letter)
  );

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-8" style={themeStyle}>
      {/* Back */}
      <Link
        href={`/cursos/${slug}`}
        className="mb-6 inline-flex items-center gap-1 text-xs text-escola-creme-50 hover:text-escola-creme"
      >
        <span>&larr;</span> {course.title}
      </Link>

      {/* Header */}
      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--t-primary)", opacity: 0.6 }}>
            Módulo {mod.number} de {course.modules.length}
          </span>
          {completed && (
            <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: "rgba(var(--t-primary-rgb), 0.1)", color: "var(--t-primary)" }}>
              completo
            </span>
          )}
        </div>
        <h1 className="font-serif text-2xl font-semibold text-escola-creme">
          {mod.title}
        </h1>
        <p className="mt-1 text-sm text-escola-creme-50">{mod.description}</p>

        {/* Territorio: evocacao literaria (so texto, serif, italico) */}
        {chapter?.territoryStage && (
          <p className="mt-5 font-serif text-sm italic leading-relaxed text-escola-creme-50">
            {chapter.territoryStage}
          </p>
        )}
      </header>

      {/* Access gate */}
      {!hasAccess ? (
        <div className="rounded-xl border border-escola-dourado/30 bg-escola-card p-6 text-center">
          <p className="mb-3 text-sm text-escola-creme-50">
            Este módulo faz parte do curso completo.
          </p>
          <Link
            href="/subscrever"
            className="inline-block rounded-lg bg-escola-dourado px-6 py-2.5 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90"
          >
            Subscrever para aceder
          </Link>
        </div>
      ) : !accessible ? (
        <div className="rounded-xl border border-escola-border bg-escola-card p-6 text-center">
          <p className="mb-2 text-sm text-escola-creme-50">
            Completa o Módulo {moduloNum - 1} para desbloquear.
          </p>
          <Link
            href={`/cursos/${slug}/${moduloNum - 1}`}
            className="text-sm text-escola-dourado hover:underline"
          >
            Ir para Módulo {moduloNum - 1}
          </Link>
        </div>
      ) : (
        <>
          {/* Sub-lesson progress */}
          {totalSubs > 0 && (
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-escola-creme-50">
                  {completedSubs} de {totalSubs} sub-aulas
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-escola-border">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(completedSubs / totalSubs) * 100}%`, backgroundColor: "var(--t-primary)" }}
                />
              </div>
            </div>
          )}

          {/* Continue button */}
          {firstIncomplete && !completed && (
            <Link
              href={`/cursos/${slug}/${moduloNum}/${firstIncomplete.letter.toLowerCase()}`}
              className="mb-6 block rounded-lg px-6 py-3 text-center text-sm font-medium text-escola-bg transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--t-primary)" }}
            >
              {completedSubs === 0 ? "Começar" : "Continuar"} &rarr; Sub-aula {firstIncomplete.letter}
            </Link>
          )}

          {/* Sub-lessons list */}
          <h2 className="mb-3 font-serif text-lg font-medium text-escola-creme">
            Sub-aulas
          </h2>
          <div className="space-y-2">
            {mod.subLessons.map((sl) => {
              const subCompleted = isSublessonCompleted(moduloNum, sl.letter);
              return (
                <Link
                  key={sl.letter}
                  href={`/cursos/${slug}/${moduloNum}/${sl.letter.toLowerCase()}`}
                  className="block rounded-lg border border-escola-border bg-escola-card p-4 transition-colors hover:border-escola-dourado/40"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                        subCompleted
                          ? "bg-[rgba(var(--t-primary-rgb,201,169,110),0.2)] text-[var(--t-primary,#C9A96E)]"
                          : "bg-escola-bg text-escola-creme-50"
                      }`}
                    >
                      {subCompleted ? (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        sl.letter
                      )}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-escola-creme">
                        {sl.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-escola-creme-50">
                        {sl.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Capitulo do manual PDF */}
          <ManualChapterCard courseSlug={slug} moduleNumber={moduloNum} />

          {/* Workbook */}
          {mod.workbook && (
            <Link
              href={`/cursos/${slug}/${moduloNum}/caderno`}
              className="mt-4 block rounded-xl border bg-escola-card p-4 transition-colors"
              style={{ borderColor: "rgba(var(--t-primary-rgb), 0.2)" }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(var(--t-primary-rgb), 0.1)" }}>
                  <svg className="h-3.5 w-3.5" style={{ color: "var(--t-primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-xs uppercase tracking-wide" style={{ color: "var(--t-primary)" }}>
                    Caderno de exercícios
                  </h3>
                  <p className="mt-0.5 text-sm text-escola-creme">{mod.workbook}</p>
                </div>
              </div>
            </Link>
          )}

          {/* Module complete link */}
          {completed && (
            <Link
              href={`/cursos/${slug}/${moduloNum}/completo`}
              className="mt-4 block rounded-lg px-6 py-3 text-center text-sm font-medium"
              style={{ backgroundColor: "rgba(var(--t-primary-rgb), 0.1)", color: "var(--t-primary)" }}
            >
              Ver conclusão do módulo
            </Link>
          )}

          {/* Perguntar ao guia — ao nivel do modulo (conversa unica para
              as 3 sub-aulas, cacheada 1h pela Claude). */}
          <div className="mt-6">
            <AskClaude courseSlug={slug} moduleNumber={moduloNum} />
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        {mod.number > 1 && (
          <Link
            href={`/cursos/${slug}/${mod.number - 1}`}
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            &larr; Módulo {mod.number - 1}
          </Link>
        )}
        <span />
        {mod.number < course.modules.length && (
          <Link
            href={`/cursos/${slug}/${mod.number + 1}`}
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            Módulo {mod.number + 1} &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center">
      <p className="text-escola-creme-50">Módulo não encontrado.</p>
    </div>
  );
}
