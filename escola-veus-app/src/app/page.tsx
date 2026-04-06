"use client";

import Link from "next/link";
import Image from "next/image";
import { getCourseBySlug } from "@/data/courses";
import { COURSE_CATEGORIES } from "@/data/course-categories";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { allProgress, loading: progressLoading } = useProgress();

  const loading = authLoading || progressLoading;

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-sm text-escola-creme-50">A carregar...</div>
      </div>
    );
  }

  const inProgress = user ? allProgress.filter((p) => !p.completed_at) : [];
  const completed = user ? allProgress.filter((p) => p.completed_at) : [];

  return (
    <div className="min-h-dvh">
      {/* ─── HERO ─── */}
      <div className="relative overflow-hidden">
        {/* Mandala como fundo blur */}
        <div className="absolute inset-0">
          <Image
            src="/hero-mandala.png"
            alt=""
            fill
            className="object-cover object-center opacity-20 blur-sm scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-escola-bg/40 via-escola-bg/60 to-escola-bg" />
        </div>

        <div className="relative flex flex-col items-center text-center px-6 pt-12 pb-16">
          {/* Mandala card */}
          <div className="relative">
            <Image
              src="/hero-mandala.png"
              alt="Os 7 Véus"
              width={320}
              height={320}
              className="h-52 sm:h-64 md:h-72 w-auto rounded-2xl shadow-2xl ring-1 ring-white/10"
              priority
            />
          </div>

          {/* Favicon + nome */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <Image
              src="/escola_veus_favicon-192.png"
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 rounded-2xl"
            />
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-escola-creme tracking-wide">
              Escola dos Véus
            </h1>
            <p className="text-sm text-escola-dourado tracking-widest">
              Vê o que estava invisível.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-10 w-full max-w-xs space-y-3">
            {!user ? (
              <>
                <Link
                  href="/entrar"
                  className="block w-full py-3.5 rounded-xl bg-escola-dourado text-center text-sm font-medium text-escola-bg hover:bg-escola-dourado-light transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/registar"
                  className="block w-full py-3.5 rounded-xl border border-white/10 text-center text-sm text-escola-creme hover:bg-white/5 transition-colors"
                >
                  Criar conta
                </Link>
              </>
            ) : (
              <Link
                href="/cursos"
                className="block w-full py-3.5 rounded-xl bg-escola-dourado text-center text-sm font-medium text-escola-bg hover:bg-escola-dourado-light transition-colors"
              >
                Explorar cursos
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ─── CONTEUDO ─── */}
      <div className="max-w-screen-lg mx-auto px-6 space-y-14 pb-32">

        {/* Progresso (autenticado) */}
        {inProgress.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-semibold text-escola-creme mb-4">
              Continuar
            </h2>
            <div className="space-y-3">
              {inProgress.map((p) => {
                const course = getCourseBySlug(p.course_slug);
                if (!course) return null;
                const totalModules = course.modules.length;
                const completedModules = p.modules_completed?.length ?? 0;
                const pct = Math.round((completedModules / totalModules) * 100);
                return (
                  <Link
                    key={p.course_slug}
                    href={`/cursos/${p.course_slug}/${p.current_module}/${p.current_sublesson.toLowerCase()}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-escola-dourado/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-escola-dourado">{pct}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-escola-creme font-medium truncate">{course.title}</p>
                      <p className="text-xs text-escola-creme-50">
                        Módulo {p.current_module}, Sub-aula {p.current_sublesson}
                      </p>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-escola-creme-50/40 group-hover:translate-x-1 transition-transform flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Completos (autenticado) */}
        {completed.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-semibold text-escola-creme mb-4">
              Completos
            </h2>
            <div className="space-y-2">
              {completed.map((p) => {
                const course = getCourseBySlug(p.course_slug);
                if (!course) return null;
                return (
                  <Link
                    key={p.course_slug}
                    href={`/cursos/${p.course_slug}/completo`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-escola-dourado/10 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-escola-dourado" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-escola-creme font-medium">{course.title}</p>
                      <p className="text-xs text-escola-creme-50">
                        {p.completed_at && new Date(p.completed_at).toLocaleDateString("pt-PT", { day: "numeric", month: "long" })}
                      </p>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-escola-creme-50/40 group-hover:translate-x-1 transition-transform flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Catalogo por categoria */}
        {COURSE_CATEGORIES.map((cat) => (
          <section key={cat.slug}>
            <h2 className="font-serif text-2xl font-semibold text-escola-creme mb-2">
              {cat.title}
            </h2>
            <p className="text-sm text-escola-creme-50 mb-6">{cat.subtitle}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cat.courses.map((slug) => {
                const course = getCourseBySlug(slug);
                if (!course) return null;
                const isClickable = !!user;
                const Card = isClickable ? Link : "div";
                const cardProps = isClickable
                  ? { href: `/cursos/${slug}` }
                  : {};
                return (
                  <Card
                    key={slug}
                    {...(cardProps as any)}
                    className="group text-left p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-all block"
                  >
                    <div className="aspect-square rounded-lg mb-3 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-escola-dourado/20 to-escola-dourado/5">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-escola-dourado/20 group-hover:text-escola-dourado/40 transition-colors">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-escola-creme truncate">{course.title}</p>
                    <p className="text-[10px] text-escola-creme-50 mt-0.5">{course.modules.length} módulos</p>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}

        {/* CTA final (visitante) */}
        {!user && (
          <div className="text-center pt-4">
            <Link
              href="/entrar"
              className="inline-block rounded-xl bg-escola-dourado px-8 py-3 text-sm font-medium text-escola-bg hover:bg-escola-dourado-light transition-colors"
            >
              Entrar na escola
            </Link>
            <p className="mt-4 text-[11px] text-escola-creme-50/40">
              Uma escola de autoconhecimento criada por Vivianne dos Santos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
