"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCourseBySlug } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { Workbook } from "@/components/escola/Workbook";
import { getTerritoryStyle, getTerritoryTheme } from "@/data/territory-themes";
import { generateWorkbookPDF } from "@/lib/generate-pdf";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CadernoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const moduloNum = parseInt(params.modulo as string, 10);
  const { user, isSubscribed } = useAuth();
  const { completeModule, isModuleCompleted } = useProgress(slug);
  const [hasContent, setHasContent] = useState(false);

  const course = getCourseBySlug(slug);
  if (!course) return <NotFound />;

  const mod = course.modules.find((m) => m.number === moduloNum);
  if (!mod) return <NotFound />;

  const isFreeTier = mod.number === 1;
  const hasAccess = isFreeTier || isSubscribed;
  const themeStyle = getTerritoryStyle(slug);
  const theme = getTerritoryTheme(slug);
  const completed = isModuleCompleted(moduloNum);

  // Check if workbook has content (for PDF button)
  useEffect(() => {
    if (!user) return;
    async function check() {
      const { data } = await supabase
        .from("escola_journal")
        .select("content")
        .eq("user_id", user!.id)
        .eq("course_slug", slug)
        .eq("module_number", moduloNum)
        .eq("sublesson_letter", "workbook")
        .single();
      if (data?.content) {
        try {
          const parsed = JSON.parse(data.content);
          const hasText =
            parsed.reflections?.some((r: string) => r.length > 0) ||
            parsed.table?.noticed?.length > 0 ||
            parsed.table?.felt?.length > 0 ||
            parsed.table?.remember?.length > 0 ||
            parsed.freeText?.length > 0;
          setHasContent(hasText);
        } catch {
          setHasContent(data.content.length > 0);
        }
      }
    }
    check();
  }, [user, slug, moduloNum]);

  const handleExportPDF = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("escola_journal")
      .select("content")
      .eq("user_id", user.id)
      .eq("course_slug", slug)
      .eq("module_number", moduloNum)
      .eq("sublesson_letter", "workbook")
      .single();

    if (!data?.content) return;

    try {
      const parsed = JSON.parse(data.content);
      generateWorkbookPDF(
        course.title,
        mod.title,
        moduloNum,
        parsed,
        theme.primary
      );
    } catch {
      // fallback
    }
  };

  if (!hasAccess) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center px-4 text-center" style={themeStyle}>
        <p className="mb-3 text-sm text-escola-creme-50">
          Este modulo faz parte do curso completo.
        </p>
        <Link
          href="/subscrever"
          className="inline-block rounded-lg px-6 py-2.5 text-sm font-medium text-escola-bg"
          style={{ backgroundColor: "var(--t-primary)" }}
        >
          Subscrever para aceder
        </Link>
      </div>
    );
  }

  const handleComplete = async () => {
    await completeModule(moduloNum);
    router.push(`/cursos/${slug}/${moduloNum}/completo`);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-8 pb-8" style={themeStyle}>
      {/* Breadcrumb */}
      <Link
        href={`/cursos/${slug}/${moduloNum}`}
        className="mb-6 inline-flex items-center gap-1 text-xs text-escola-creme-50 hover:text-escola-creme"
      >
        <span>&larr;</span> Modulo {moduloNum}
      </Link>

      {/* Header */}
      <header className="mb-8">
        <span
          className="mb-1 block text-xs uppercase tracking-widest"
          style={{ color: "var(--t-primary)", opacity: 0.6 }}
        >
          Caderno de exercicios
        </span>
        <h1 className="font-serif text-2xl font-semibold text-escola-creme">
          {mod.workbook}
        </h1>
        <p className="mt-2 text-sm text-escola-creme-50">
          Modulo {moduloNum} &middot; {course.title}
        </p>
      </header>

      {/* PDF Download */}
      <div className="mb-8 rounded-xl border bg-escola-card p-5" style={{ borderColor: "rgba(var(--t-primary-rgb), 0.2)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(var(--t-primary-rgb), 0.1)" }}
            >
              <svg
                className="h-5 w-5"
                style={{ color: "var(--t-primary)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-escola-creme">
                Exportar caderno
              </p>
              <p className="text-xs text-escola-creme-50">
                {hasContent ? "PDF com as tuas reflexoes" : "Preenche para exportar"}
              </p>
            </div>
          </div>
          {hasContent && (
            <button
              onClick={handleExportPDF}
              className="rounded-lg px-4 py-2 text-xs font-medium text-escola-bg transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--t-primary)" }}
            >
              PDF
            </button>
          )}
        </div>
      </div>

      {/* Interactive Workbook */}
      <Workbook
        courseSlug={slug}
        moduleNumber={moduloNum}
        workbookTitle={mod.workbook || mod.title}
      />

      {/* Complete module */}
      <div className="mt-8">
        {completed ? (
          <div className="text-center">
            <p className="mb-3 text-xs text-escola-creme-50">Modulo completado</p>
            <Link
              href={`/cursos/${slug}/${moduloNum}/completo`}
              className="inline-block rounded-lg px-6 py-3 text-sm font-medium"
              style={{ backgroundColor: "rgba(var(--t-primary-rgb), 0.1)", color: "var(--t-primary)" }}
            >
              Ver conclusao
            </Link>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            className="w-full rounded-lg px-6 py-3 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--t-primary)" }}
          >
            Completar modulo
          </button>
        )}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center">
      <p className="text-escola-creme-50">Nao encontrado.</p>
    </div>
  );
}
