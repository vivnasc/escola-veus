"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCourseBySlug } from "@/data/courses";

type AnalyticsData = {
  totalMembers: number;
  activeSubscribers: number;
  trialUsers: number;
  cancelledUsers: number;
  activeLearners7d: number;
  sublessonsCompleted7d: number;
  coursesCompleted: number;
  topCourses: { slug: string; count: number }[];
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const [total, active, trial, cancelled, progressRes, sublessonsRes, completedRes] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("subscription_status", "active"),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("subscription_status", "trial"),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("subscription_status", "cancelled"),
        supabase
          .from("course_progress")
          .select("user_id, last_activity_at"),
        supabase
          .from("sublesson_progress")
          .select("id", { count: "exact", head: true })
          .eq("completed", true)
          .gte("completed_at", sevenDaysAgo),
        supabase
          .from("course_progress")
          .select("course_slug, completed_at")
          .not("completed_at", "is", null),
      ]);

    // Active learners in last 7 days
    const activeLearners = new Set(
      (progressRes.data || [])
        .filter((p) => new Date(p.last_activity_at) > new Date(sevenDaysAgo))
        .map((p) => p.user_id)
    ).size;

    // Top courses by completions
    const courseCompletions: Record<string, number> = {};
    for (const cp of completedRes.data || []) {
      courseCompletions[cp.course_slug] = (courseCompletions[cp.course_slug] || 0) + 1;
    }
    const topCourses = Object.entries(courseCompletions)
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setData({
      totalMembers: total.count ?? 0,
      activeSubscribers: active.count ?? 0,
      trialUsers: trial.count ?? 0,
      cancelledUsers: cancelled.count ?? 0,
      activeLearners7d: activeLearners,
      sublessonsCompleted7d: sublessonsRes.count ?? 0,
      coursesCompleted: completedRes.data?.length ?? 0,
      topCourses,
    });
  }

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl font-semibold text-escola-creme">
        Analytics
      </h2>

      {/* Membership stats */}
      <h3 className="mb-3 text-xs uppercase tracking-widest text-escola-dourado/60">
        Membros
      </h3>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Total" value={data?.totalMembers ?? "..."} />
        <MetricCard label="Subscritoras" value={data?.activeSubscribers ?? "..."} />
        <MetricCard label="Em trial" value={data?.trialUsers ?? "..."} />
        <MetricCard label="Canceladas" value={data?.cancelledUsers ?? "..."} />
      </div>

      {/* Learning stats */}
      <h3 className="mb-3 text-xs uppercase tracking-widest text-escola-dourado/60">
        Aprendizado (ultimos 7 dias)
      </h3>
      <div className="mb-8 grid grid-cols-3 gap-3">
        <MetricCard label="Activas" value={data?.activeLearners7d ?? "..."} />
        <MetricCard label="Sub-aulas feitas" value={data?.sublessonsCompleted7d ?? "..."} />
        <MetricCard label="Cursos completos" value={data?.coursesCompleted ?? "..."} />
      </div>

      {/* Top courses */}
      {data && data.topCourses.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-xs uppercase tracking-widest text-escola-dourado/60">
            Cursos mais completados
          </h3>
          <div className="space-y-2">
            {data.topCourses.map((tc) => {
              const course = getCourseBySlug(tc.slug);
              return (
                <div
                  key={tc.slug}
                  className="flex items-center justify-between rounded-lg border border-escola-border bg-escola-card px-4 py-3"
                >
                  <span className="text-sm text-escola-creme">
                    {course?.title ?? tc.slug}
                  </span>
                  <span className="text-sm font-medium text-escola-dourado">
                    {tc.count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Placeholder for charts */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-8 text-center">
        <p className="text-sm text-escola-creme-50">
          Graficos de crescimento e retencao em breve.
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-escola-border bg-escola-card p-4">
      <p className="text-2xl font-semibold text-escola-dourado">{value}</p>
      <p className="mt-1 text-xs text-escola-creme-50">{label}</p>
    </div>
  );
}
