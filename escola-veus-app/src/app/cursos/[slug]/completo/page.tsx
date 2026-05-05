"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getCourseBySlug } from "@/data/courses";
import { getCategoryForCourse } from "@/data/course-categories";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function generateCertCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "VEU-";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function CursoCompletoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const { courseProgress, completeCourse } = useProgress(slug);
  const [certCode, setCertCode] = useState<string | null>(null);

  const course = getCourseBySlug(slug);
  const category = getCategoryForCourse(slug);

  // Issue certificate on first visit
  useEffect(() => {
    if (!user || !courseProgress) return;

    // Mark course as complete if not already
    if (!courseProgress.completed_at) {
      completeCourse();
    }

    // Check for existing certificate
    supabase
      .from("escola_certificates")
      .select("certificate_code")
      .eq("user_id", user.id)
      .eq("course_slug", slug)
      .single()
      .then(({ data }) => {
        if (data) {
          setCertCode(data.certificate_code);
        } else {
          // Create one
          const code = generateCertCode();
          supabase
            .from("escola_certificates")
            .insert({
              user_id: user.id,
              course_slug: slug,
              certificate_code: code,
            })
            .then(() => setCertCode(code));
        }
      });
  }, [user, courseProgress, slug, completeCourse]);

  if (!course) return null;

  // Find next course in same category
  const categoryCourses = category?.courses || [];
  const currentIndex = categoryCourses.indexOf(slug as never);
  const nextSlug = currentIndex >= 0 && currentIndex < categoryCourses.length - 1
    ? categoryCourses[currentIndex + 1]
    : null;
  const nextCourse = nextSlug ? getCourseBySlug(nextSlug) : null;

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-lg flex-col items-center justify-center px-4 text-center">
      {/* Celebration */}
      <div className="mb-6">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="#C9A96E" strokeWidth="2" />
          <path
            d="M20 33l8 8 16-16"
            stroke="#C9A96E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="mb-2 font-serif text-3xl font-semibold text-escola-creme">
        Atravessaste este território.
      </h1>

      <p className="mb-2 font-serif text-xl text-escola-dourado">
        {course.title}
      </p>

      <p className="mb-8 max-w-sm text-sm leading-relaxed text-escola-creme-50">
        {course.arcoEmocional}
      </p>

      {/* Certificate */}
      {certCode && (
        <div className="mb-8 w-full max-w-sm rounded-xl border border-escola-dourado/30 bg-escola-card p-6">
          <p className="mb-1 text-xs uppercase tracking-widest text-escola-dourado/60">
            Certificado
          </p>
          <p className="font-serif text-lg text-escola-creme">
            {course.title}
          </p>
          <p className="mt-1 text-xs text-escola-creme-50">
            {user?.email}
          </p>
          <p className="mt-3 font-mono text-sm tracking-wider text-escola-dourado">
            {certCode}
          </p>
          <p className="mt-1 text-[10px] text-escola-creme-50">
            {new Date().toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex w-full max-w-xs flex-col gap-3">
        {nextCourse && (
          <Link
            href={`/cursos/${nextCourse.slug}`}
            className="rounded-lg bg-escola-dourado px-6 py-3 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90"
          >
            Próximo: {nextCourse.title}
          </Link>
        )}

        <Link
          href="/"
          className="rounded-lg border border-escola-border px-6 py-3 text-sm text-escola-creme-50 transition-colors hover:text-escola-creme"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
