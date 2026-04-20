"use client";

import Link from "next/link";
import { COURSES } from "@/data/courses";
import { COURSE_CATEGORIES } from "@/data/course-categories";

export default function AdminCursosPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-escola-creme">
          Cursos
        </h2>
        <span className="text-sm text-escola-creme-50">
          {COURSES.length} cursos
        </span>
      </div>

      {COURSE_CATEGORIES.map((category) => (
        <div key={category.slug} className="mb-8">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-escola-dourado">
            {category.title} — {category.subtitle}
          </h3>

          <div className="overflow-hidden rounded-xl border border-escola-border">
            {category.courses.map((slug, i) => {
              const course = COURSES.find((c) => c.slug === slug);
              if (!course) return null;
              return (
                <div
                  key={slug}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i > 0 ? "border-t border-escola-border" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-escola-creme">
                      {course.title}
                    </p>
                    <p className="text-xs text-escola-creme-50">
                      {course.modules.length} modulos /{" "}
                      {course.modules.reduce(
                        (acc, m) => acc + m.subLessons.length,
                        0
                      )}{" "}
                      sub-aulas
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-escola-dourado/10 px-2.5 py-0.5 text-[10px] font-medium text-escola-dourado">
                      Rascunho
                    </span>
                    <Link
                      href={`/cursos/${slug}`}
                      className="text-xs text-escola-creme-50 hover:text-escola-creme"
                    >
                      Ver &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
