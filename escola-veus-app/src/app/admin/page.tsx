"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Stats = {
  totalProfiles: number;
  activeSubscribers: number;
  totalCourses: number;
  activeLearners: number;
  inactiveCount: number;
  recentSignups: number;
  coursesCompleted: number;
};

type Alert = {
  type: "new_member" | "inactive" | "course_completed";
  message: string;
  time: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();

    const [profilesRes, subscribersRes, progressRes, recentRes, completedRes] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("subscription_status", "active"),
        supabase
          .from("course_progress")
          .select("user_id, last_activity_at, completed_at, course_slug"),
        supabase
          .from("profiles")
          .select("email, created_at")
          .gte("created_at", twoDaysAgo)
          .order("created_at", { ascending: false }),
        supabase
          .from("course_progress")
          .select("user_id, course_slug, completed_at")
          .not("completed_at", "is", null)
          .gte("completed_at", sevenDaysAgo),
      ]);

    const progressData = progressRes.data || [];
    const activeLearners = new Set(
      progressData
        .filter((p) => new Date(p.last_activity_at) > new Date(sevenDaysAgo))
        .map((p) => p.user_id)
    ).size;

    const inactiveCount = new Set(
      progressData
        .filter(
          (p) =>
            !p.completed_at &&
            new Date(p.last_activity_at) < new Date(sevenDaysAgo)
        )
        .map((p) => p.user_id)
    ).size;

    setStats({
      totalProfiles: profilesRes.count ?? 0,
      activeSubscribers: subscribersRes.count ?? 0,
      totalCourses: 20,
      activeLearners,
      inactiveCount,
      recentSignups: recentRes.data?.length ?? 0,
      coursesCompleted: completedRes.data?.length ?? 0,
    });

    // Build alerts
    const newAlerts: Alert[] = [];

    // New signups
    if (recentRes.data) {
      for (const profile of recentRes.data.slice(0, 5)) {
        newAlerts.push({
          type: "new_member",
          message: `Nova membro: ${profile.email}`,
          time: profile.created_at,
        });
      }
    }

    // Completed courses
    if (completedRes.data) {
      for (const cp of completedRes.data.slice(0, 5)) {
        newAlerts.push({
          type: "course_completed",
          message: `Curso completo: ${cp.course_slug}`,
          time: cp.completed_at!,
        });
      }
    }

    // Sort by time
    newAlerts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setAlerts(newAlerts.slice(0, 10));
  }

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl font-semibold text-escola-creme">
        Dashboard
      </h2>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Membros" value={stats?.totalProfiles ?? "..."} />
        <StatCard label="Subscritoras" value={stats?.activeSubscribers ?? "..."} />
        <StatCard label="Activas (7d)" value={stats?.activeLearners ?? "..."} />
        <StatCard
          label="Paradas (+7d)"
          value={stats?.inactiveCount ?? "..."}
          warning={!!stats && stats.inactiveCount > 0}
        />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-sm font-medium text-escola-creme">
            Actividade recente
          </h3>
          <div className="space-y-1">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-escola-border bg-escola-card px-4 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      alert.type === "new_member"
                        ? "bg-green-400"
                        : alert.type === "course_completed"
                          ? "bg-escola-dourado"
                          : "bg-escola-terracota"
                    }`}
                  />
                  <span className="text-sm text-escola-creme">{alert.message}</span>
                </div>
                <span className="text-[10px] text-escola-creme-50">
                  {new Date(alert.time).toLocaleDateString("pt-PT", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <h3 className="mb-3 text-sm font-medium text-escola-creme">
        Accoes rapidas
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <QuickAction href="/admin/alunas" label="Ver alunas" />
        <QuickAction href="/admin/conteudo" label="Publicar conteudo" />
        <QuickAction href="/admin/cursos" label="Gerir cursos" />
        <QuickAction href="/admin/analytics" label="Ver analytics" />
        <QuickAction href="/" label="Ver site" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  warning,
}: {
  label: string;
  value: number | string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl border border-escola-border bg-escola-card p-4 text-center">
      <p
        className={`text-2xl font-semibold ${
          warning ? "text-escola-terracota" : "text-escola-dourado"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-escola-creme-50">{label}</p>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-escola-border bg-escola-card px-4 py-3 text-center text-sm text-escola-creme transition-colors hover:border-escola-dourado/40"
    >
      {label}
    </Link>
  );
}
