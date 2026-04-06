"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getCourseBySlug } from "@/data/courses";
import { useProgress } from "@/hooks/useProgress";

export default function ModuloCompletoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const moduloNum = parseInt(params.modulo as string, 10);
  const { courseProgress } = useProgress(slug);

  const course = getCourseBySlug(slug);
  if (!course) return null;

  const mod = course.modules.find((m) => m.number === moduloNum);
  if (!mod) return null;

  const totalModules = course.modules.length;
  const completedCount = courseProgress?.modules_completed?.length ?? 0;
  const isLastModule = moduloNum === totalModules;
  const nextModule = course.modules.find((m) => m.number === moduloNum + 1);

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-lg flex-col items-center justify-center px-4 text-center">
      {/* Progress ring */}
      <div className="mb-8">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="rgba(201,169,110,0.15)"
            strokeWidth="4"
          />
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="#C9A96E"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${(completedCount / totalModules) * 213.6} 213.6`}
            transform="rotate(-90 40 40)"
          />
          <text
            x="40" y="40"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#C9A96E"
            fontSize="18"
            fontWeight="600"
          >
            {completedCount}/{totalModules}
          </text>
        </svg>
      </div>

      {/* Title */}
      <h1 className="mb-2 font-serif text-2xl font-semibold text-escola-creme">
        Módulo {moduloNum} — Completo
      </h1>
      <p className="mb-2 font-serif text-lg text-escola-dourado">
        {mod.title}
      </p>

      {/* Description / closing phrase */}
      <p className="mb-8 max-w-xs text-sm leading-relaxed text-escola-creme-50">
        {isLastModule
          ? "Atravessaste este território inteiro. O que viste fica contigo."
          : nextModule
            ? `O próximo território espera. ${nextModule.description}`
            : "Pausa. Respira. O que viste fica contigo."}
      </p>

      {/* Actions */}
      <div className="flex w-full max-w-xs flex-col gap-3">
        {!isLastModule && nextModule ? (
          <Link
            href={`/cursos/${slug}/${moduloNum + 1}`}
            className="rounded-lg bg-escola-dourado px-6 py-3 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90"
          >
            Continuar para Módulo {moduloNum + 1}
          </Link>
        ) : (
          <Link
            href={`/cursos/${slug}/completo`}
            className="rounded-lg bg-escola-dourado px-6 py-3 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90"
          >
            Ver conclusão do curso
          </Link>
        )}

        <Link
          href="/"
          className="rounded-lg border border-escola-border px-6 py-3 text-sm text-escola-creme-50 transition-colors hover:text-escola-creme"
        >
          Descansar
        </Link>
      </div>
    </div>
  );
}
