"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { COURSES, getCourseBySlug } from "@/data/courses";
import { getCategoryForCourse } from "@/data/course-categories";
import { getTerritoryStyle } from "@/data/territory-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";

export default function CursoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const { courseProgress, isModuleCompleted, isModuleAccessible, startCourse, loading } =
    useProgress(slug);

  const course = getCourseBySlug(slug);
  if (!course) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <p className="text-escola-creme-50">Curso não encontrado.</p>
      </div>
    );
  }

  const category = getCategoryForCourse(slug);
  const themeStyle = getTerritoryStyle(slug);
  const totalModules = course.modules.length;
  const completedCount = courseProgress?.modules_completed?.length ?? 0;
  const progressPct = Math.round((completedCount / totalModules) * 100);
  const isStarted = !!courseProgress;
  const isComplete = !!courseProgress?.completed_at;

  const handleStart = async () => {
    await startCourse();
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-8" style={themeStyle}>
      {/* Back */}
      <Link
        href={isStarted ? "/" : "/cursos"}
        className="mb-6 inline-flex items-center gap-1 text-xs text-escola-creme-50 hover:text-escola-creme"
      >
        <span>&larr;</span> {isStarted ? "Início" : "Cursos"}
      </Link>

      {/* Header */}
      <header className="mb-6">
        {category && (
          <span className="mb-2 block text-xs uppercase tracking-widest text-escola-dourado/60">
            {category.title}
          </span>
        )}
        <h1 className="font-serif text-3xl font-semibold text-escola-creme">
          {course.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-escola-creme-50">
          {course.subtitle}
        </p>
      </header>

      {/* Progress bar (if started) */}
      {isStarted && !isComplete && (
        <div className="mb-6">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-escola-creme-50">
              {completedCount} de {totalModules} módulos
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--t-primary)" }}>{progressPct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-escola-border">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, backgroundColor: "var(--t-primary)" }}
            />
          </div>
        </div>
      )}

      {isComplete && (
        <div className="mb-6 rounded-xl border p-4 text-center" style={{ borderColor: "rgba(var(--t-primary-rgb), 0.3)", backgroundColor: "rgba(var(--t-primary-rgb), 0.05)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--t-primary)" }}>Curso completo</p>
          <Link
            href={`/cursos/${slug}/completo`}
            className="mt-1 text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            Ver certificado &rarr;
          </Link>
        </div>
      )}

      {/* Arc */}
      <div className="mb-8 rounded-xl border border-escola-border bg-escola-card p-5">
        <h2 className="mb-2 font-serif text-sm font-medium uppercase tracking-wide" style={{ color: "var(--t-primary)" }}>
          Arco emocional
        </h2>
        <p className="text-sm leading-relaxed text-escola-creme-50">
          {course.arcoEmocional}
        </p>
      </div>

      {/* Modules */}
      <h2 className="mb-4 font-serif text-lg font-medium text-escola-creme">
        Módulos
      </h2>
      <div className="space-y-3">
        {course.modules.map((mod) => {
          const completed = isModuleCompleted(mod.number);
          const accessible = isModuleAccessible(mod.number);
          const isCurrent = courseProgress?.current_module === mod.number;

          return (
            <div key={mod.number}>
              {accessible ? (
                <Link
                  href={`/cursos/${slug}/${mod.number}`}
                  className={`block rounded-xl border p-4 transition-colors ${
                    isCurrent
                      ? "border-escola-dourado/40 bg-escola-card"
                      : completed
                        ? "border-escola-dourado/20 bg-escola-card"
                        : "border-escola-border bg-escola-card hover:border-escola-dourado/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status indicator */}
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                        completed
                          ? "bg-escola-dourado/20 text-escola-dourado"
                          : isCurrent
                            ? "bg-escola-dourado/10 text-escola-dourado"
                            : "bg-escola-bg text-escola-creme-50"
                      }`}
                    >
                      {completed ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        mod.number
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-escola-creme">
                          {mod.title}
                        </h3>
                        {isCurrent && !completed && (
                          <span className="rounded-full bg-escola-dourado/10 px-2 py-0.5 text-[10px] text-escola-dourado">
                            actual
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-escola-creme-50">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  {/* Sub-lesson indicators */}
                  <div className="mt-2 flex gap-1.5 pl-11">
                    {mod.subLessons.map((sl) => (
                      <span
                        key={sl.letter}
                        className="rounded bg-escola-bg px-1.5 py-0.5 text-[10px] text-escola-creme-50"
                      >
                        {sl.letter}
                      </span>
                    ))}
                    {mod.workbook && (
                      <span className="rounded bg-escola-bg px-1.5 py-0.5 text-[10px] text-escola-creme-50">
                        Caderno
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="rounded-xl border border-escola-border/50 bg-escola-card/50 p-4 opacity-50">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-escola-bg text-sm text-escola-creme-50">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0110 0v4" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-escola-creme-50">
                        {mod.title}
                      </h3>
                      <p className="mt-0.5 text-[10px] text-escola-creme-50">
                        Completa o Módulo {mod.number - 1} para desbloquear
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* YouTube hooks */}
      {course.youtubeHooks && course.youtubeHooks.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-serif text-lg font-medium text-escola-creme">
            Vídeos gratuitos no YouTube
          </h2>
          <div className="space-y-2">
            {course.youtubeHooks.map((hook: { title: string; durationMin: number }, i: number) => (
              <div key={i} className="rounded-xl border border-escola-border bg-escola-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                    <svg className="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-escola-creme">{hook.title}</p>
                    <p className="text-xs text-escola-creme-50">{hook.durationMin} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Start CTA (if not started) */}
      {!isStarted && user && (
        <div className="mt-8">
          <button
            onClick={handleStart}
            className="w-full rounded-lg px-6 py-3 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--t-primary)" }}
          >
            Começar este curso
          </button>
        </div>
      )}

      {!user && (
        <div className="mt-8">
          <Link
            href="/entrar"
            className="block w-full rounded-lg px-6 py-3 text-center text-sm font-medium text-escola-bg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--t-primary)" }}
          >
            Entrar para começar
          </Link>
        </div>
      )}
    </div>
  );
}
