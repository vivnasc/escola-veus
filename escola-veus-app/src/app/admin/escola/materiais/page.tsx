"use client";

import COURSES from "@/data/courses";

export default function MateriaisPage() {
  const totalManuais = COURSES.length;
  const totalCadernos = COURSES.reduce(
    (n, c) => n + c.modules.filter((m) => m.workbook).length,
    0,
  );

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold text-escola-creme">
        Materiais — Manuais & Cadernos
      </h2>
      <p className="mt-1 text-sm text-escola-creme-50">
        {totalManuais} manuais previstos · {totalCadernos} cadernos de exercícios
      </p>
      <p className="mt-4 text-xs text-escola-creme-50">
        Editor PDF aqui dentro (por implementar). Por enquanto, lista os
        materiais previstos por curso.
      </p>

      <div className="mt-6 space-y-2">
        {COURSES.map((c) => (
          <section
            key={c.slug}
            className="rounded-xl border border-escola-border bg-escola-card p-4"
          >
            <p className="text-sm text-escola-creme">
              {c.number}. {c.title}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-escola-creme-50">
              <li>📘 Manual: {c.title} (1 PDF)</li>
              {c.modules
                .filter((m) => m.workbook)
                .map((m) => (
                  <li key={m.number}>
                    📒 Caderno M{m.number}: {m.workbook}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
