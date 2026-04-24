"use client";

import { useState } from "react";
import { getManualChapter, hasManual } from "@/data/course-manuals";

/**
 * Card expansivel com o capitulo do manual PDF correspondente ao modulo:
 *   - Territorio (evocacao literaria, 1 linha em italico)
 *   - Resumo
 *   - Perguntas de reflexao
 *   - Link para descarregar o PDF completo do manual do curso
 *
 * Dados servidos directamente do bundle (src/data/course-manuals/).
 * Se o curso ainda nao tem manual escrito, o componente nao renderiza.
 */
export function ManualChapterCard({
  courseSlug,
  moduleNumber,
}: {
  courseSlug: string;
  moduleNumber: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!hasManual(courseSlug)) return null;
  const chapter = getManualChapter(courseSlug, moduleNumber);
  if (!chapter) return null;

  return (
    <div
      className="mt-4 overflow-hidden rounded-xl border bg-escola-card"
      style={{ borderColor: "rgba(var(--t-primary-rgb), 0.2)" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(var(--t-primary-rgb), 0.1)" }}
          >
            <svg
              className="h-3.5 w-3.5"
              style={{ color: "var(--t-primary)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h10"
              />
            </svg>
          </span>
          <div>
            <h3
              className="text-xs uppercase tracking-wide"
              style={{ color: "var(--t-primary)" }}
            >
              Capitulo do manual
            </h3>
            <p className="mt-0.5 text-sm text-escola-creme">{chapter.title}</p>
          </div>
        </div>
        <span className="text-escola-creme-50">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-escola-border px-4 py-4">
          <p className="italic text-xs text-escola-creme-50">
            {chapter.territoryStage}
          </p>

          <p className="whitespace-pre-line font-serif text-sm leading-relaxed text-escola-creme">
            {chapter.summary}
          </p>

          {chapter.reflectionQuestions.length > 0 && (
            <div>
              <p
                className="mb-2 text-[10px] uppercase tracking-wider"
                style={{ color: "var(--t-primary)" }}
              >
                Perguntas para ficar
              </p>
              <ul className="space-y-2 font-serif text-sm leading-relaxed text-escola-creme">
                {chapter.reflectionQuestions.map((q, i) => (
                  <li key={i} className="pl-4 -indent-4">
                    — {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2">
            <a
              href={`/api/courses/manual?slug=${encodeURIComponent(courseSlug)}`}
              target="_blank"
              rel="noopener"
              className="inline-block rounded-lg px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "rgba(var(--t-primary-rgb), 0.1)",
                color: "var(--t-primary)",
              }}
            >
              Descarregar manual completo (PDF)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
