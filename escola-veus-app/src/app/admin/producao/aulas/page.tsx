"use client";

import { useState } from "react";
import COURSES from "@/data/courses";

export default function AulasPage() {
  const [open, setOpen] = useState<string | null>(COURSES[0]?.slug ?? null);

  const totalModules = COURSES.reduce((n, c) => n + c.modules.length, 0);
  const totalSubLessons = COURSES.reduce(
    (n, c) => n + c.modules.reduce((m, mod) => m + mod.subLessons.length, 0),
    0,
  );

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

      <div className="space-y-2">
        {COURSES.map((c) => {
          const isOpen = open === c.slug;
          const subCount = c.modules.reduce((n, m) => n + m.subLessons.length, 0);

          return (
            <section
              key={c.slug}
              className="overflow-hidden rounded-xl border border-escola-border bg-escola-card"
            >
              <button
                onClick={() => setOpen(isOpen ? null : c.slug)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm text-escola-creme">
                    {c.number}. {c.title}
                  </p>
                  <p className="text-xs text-escola-creme-50">{c.subtitle}</p>
                </div>
                <span className="ml-3 shrink-0 text-xs text-escola-creme-50">
                  {c.modules.length} · {subCount} aulas
                </span>
              </button>

              {isOpen && (
                <ul className="divide-y divide-escola-border border-t border-escola-border">
                  {c.modules.map((mod) => (
                    <li key={mod.number} className="px-4 py-2.5">
                      <p className="text-sm text-escola-creme">
                        M{mod.number}. {mod.title}
                      </p>
                      <p className="mt-1 text-xs text-escola-creme-50">
                        {mod.subLessons.map((s) => s.letter).join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
