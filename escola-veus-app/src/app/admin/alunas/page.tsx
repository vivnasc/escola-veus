"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCourseBySlug, COURSES } from "@/data/courses";

type StudentRow = {
  id: string;
  email: string;
  subscription_status: string;
  created_at: string;
};

type ProgressRow = {
  user_id: string;
  course_slug: string;
  current_module: number;
  modules_completed: number[];
  last_activity_at: string;
  completed_at: string | null;
};

export default function AdminAlunasPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [studentsRes, progressRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, subscription_status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("course_progress")
        .select("user_id, course_slug, current_module, modules_completed, last_activity_at, completed_at"),
    ]);

    if (studentsRes.data) setStudents(studentsRes.data);
    if (progressRes.data) setProgress(progressRes.data);
    setLoading(false);
  }

  const getStudentProgress = (userId: string) =>
    progress.filter((p) => p.user_id === userId);

  const selectedStudent = selected ? students.find((s) => s.id === selected) : null;
  const selectedProgress = selected ? getStudentProgress(selected) : [];

  if (loading) {
    return <p className="text-sm text-escola-creme-50">A carregar...</p>;
  }

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl font-semibold text-escola-creme">
        Alunas
      </h2>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Total" value={students.length} />
        <StatCard
          label="Activas"
          value={students.filter((s) => s.subscription_status === "active").length}
        />
        <StatCard
          label="Com cursos"
          value={new Set(progress.map((p) => p.user_id)).size}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Student list */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-escola-creme">
            Lista ({students.length})
          </h3>
          <div className="space-y-1 overflow-y-auto" style={{ maxHeight: "60vh" }}>
            {students.map((student) => {
              const sp = getStudentProgress(student.id);
              const isActive = student.subscription_status === "active";
              const lastActivity = sp.length > 0
                ? sp.sort((a, b) => new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime())[0].last_activity_at
                : null;

              const daysSinceActivity = lastActivity
                ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / 86400000)
                : null;

              return (
                <button
                  key={student.id}
                  onClick={() => setSelected(student.id === selected ? null : student.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    student.id === selected
                      ? "border-escola-dourado/40 bg-escola-card"
                      : "border-escola-border bg-escola-card hover:border-escola-dourado/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-escola-creme">
                        {student.email}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                            isActive
                              ? "bg-green-500/10 text-green-400"
                              : "bg-escola-creme-50/10 text-escola-creme-50"
                          }`}
                        >
                          {isActive ? "activa" : "inactiva"}
                        </span>
                        {sp.length > 0 && (
                          <span className="text-[10px] text-escola-creme-50">
                            {sp.length} {sp.length === 1 ? "curso" : "cursos"}
                          </span>
                        )}
                        {daysSinceActivity !== null && daysSinceActivity > 7 && (
                          <span className="rounded-full bg-escola-terracota/10 px-1.5 py-0.5 text-[10px] text-escola-terracota">
                            {daysSinceActivity}d parada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Student detail */}
        <div>
          {selectedStudent ? (
            <div>
              <h3 className="mb-3 text-sm font-medium text-escola-creme">
                {selectedStudent.email}
              </h3>

              <div className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4">
                <p className="text-xs text-escola-creme-50">
                  Membro desde{" "}
                  {new Date(selectedStudent.created_at).toLocaleDateString("pt-PT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-1 text-xs text-escola-creme-50">
                  Subscricao: {selectedStudent.subscription_status || "inactiva"}
                </p>
              </div>

              {selectedProgress.length === 0 ? (
                <p className="text-sm text-escola-creme-50">
                  Nenhum curso iniciado.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedProgress.map((p) => {
                    const course = getCourseBySlug(p.course_slug);
                    if (!course) return null;
                    const total = course.modules.length;
                    const done = p.modules_completed?.length ?? 0;
                    const pct = Math.round((done / total) * 100);

                    return (
                      <div
                        key={p.course_slug}
                        className="rounded-xl border border-escola-border bg-escola-card p-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-sm text-escola-creme">
                            {course.title}
                          </h4>
                          {p.completed_at ? (
                            <span className="rounded-full bg-escola-dourado/10 px-2 py-0.5 text-[10px] text-escola-dourado">
                              completo
                            </span>
                          ) : (
                            <span className="text-xs text-escola-dourado">{pct}%</span>
                          )}
                        </div>

                        {!p.completed_at && (
                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-escola-border">
                            <div
                              className="h-full rounded-full bg-escola-dourado"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between text-[10px] text-escola-creme-50">
                          <span>Modulo {p.current_module}</span>
                          <span>
                            Ultimo acesso:{" "}
                            {new Date(p.last_activity_at).toLocaleDateString("pt-PT", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-escola-creme-50">
                Selecciona uma aluna para ver detalhes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-escola-border bg-escola-card p-4 text-center">
      <p className="text-2xl font-semibold text-escola-dourado">{value}</p>
      <p className="mt-1 text-xs text-escola-creme-50">{label}</p>
    </div>
  );
}
