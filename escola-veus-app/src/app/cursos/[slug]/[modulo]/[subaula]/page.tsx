"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCourseBySlug } from "@/data/courses";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { useJournal } from "@/hooks/useJournal";
import { VideoPlayer } from "@/components/escola/VideoPlayer";
import { AudioPlayer } from "@/components/escola/AudioPlayer";
import { getTerritoryStyle } from "@/data/territory-themes";
import { useState } from "react";

export default function SubaulaPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const moduloNum = parseInt(params.modulo as string, 10);
  const subaulaLetter = (params.subaula as string).toUpperCase();
  const { user, isSubscribed } = useAuth();
  const { isSublessonCompleted, completeSublesson, startCourse, isModuleAccessible } =
    useProgress(slug);

  const course = getCourseBySlug(slug);
  if (!course) return <NotFound msg="Curso nao encontrado." />;

  const mod = course.modules.find((m) => m.number === moduloNum);
  if (!mod) return <NotFound msg="Modulo nao encontrado." />;

  const subIndex = mod.subLessons.findIndex((sl) => sl.letter === subaulaLetter);
  const sub = mod.subLessons[subIndex];
  if (!sub) return <NotFound msg="Sub-aula nao encontrada." />;

  const isFreeTier = mod.number === 1;
  const hasAccess = isFreeTier || isSubscribed;
  const themeStyle = getTerritoryStyle(slug);

  if (!hasAccess) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center px-4 text-center" style={themeStyle}>
        <p className="mb-3 text-sm text-escola-creme-50">
          Este modulo faz parte do curso completo.
        </p>
        <Link
          href="/subscrever"
          className="inline-block rounded-lg px-6 py-2.5 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--t-primary)" }}
        >
          Subscrever para aceder
        </Link>
      </div>
    );
  }

  if (!isModuleAccessible(moduloNum)) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center px-4 text-center" style={themeStyle}>
        <p className="mb-2 font-serif text-lg text-escola-creme">
          Este modulo ainda nao esta acessivel.
        </p>
        <p className="mb-6 text-sm text-escola-creme-50">
          Completa o Modulo {moduloNum - 1} para desbloquear.
        </p>
        <Link
          href={`/cursos/${slug}/${moduloNum - 1}`}
          className="text-sm hover:underline"
          style={{ color: "var(--t-primary)" }}
        >
          Ir para Modulo {moduloNum - 1}
        </Link>
      </div>
    );
  }

  // Determine next destination
  const isLastSub = subIndex === mod.subLessons.length - 1;
  const nextSubLetter = !isLastSub ? mod.subLessons[subIndex + 1].letter : null;

  const completed = isSublessonCompleted(moduloNum, subaulaLetter);

  const handleComplete = async () => {
    await startCourse();

    const nextMod = isLastSub ? moduloNum : moduloNum;
    const nextSub = nextSubLetter || "A";
    await completeSublesson(moduloNum, subaulaLetter, nextMod, nextSub);

    if (isLastSub) {
      if (mod.workbook) {
        router.push(`/cursos/${slug}/${moduloNum}/caderno`);
      } else {
        router.push(`/cursos/${slug}/${moduloNum}/completo`);
      }
    } else {
      router.push(`/cursos/${slug}/${moduloNum}/${nextSubLetter!.toLowerCase()}`);
    }
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
      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium"
            style={{ backgroundColor: "rgba(var(--t-primary-rgb), 0.1)", color: "var(--t-primary)" }}
          >
            {sub.letter}
          </span>
          <span className="text-xs text-escola-creme-50">
            Modulo {moduloNum} de {course.modules.length}
          </span>
        </div>
        <h1 className="font-serif text-2xl font-semibold text-escola-creme">
          {sub.title}
        </h1>
      </header>

      {/* Video Player */}
      <VideoPlayer
        courseSlug={slug}
        moduleNumber={moduloNum}
        sublessonLetter={subaulaLetter}
        fallbackDescription={sub.description}
      />

      {/* Audio "podcast" — entrega paralela ao video */}
      <AudioPlayer
        courseSlug={slug}
        moduleNumber={moduloNum}
        sublessonLetter={subaulaLetter}
      />

      {/* Content */}
      <div className="mb-8 rounded-xl border border-escola-border bg-escola-card p-5">
        <p className="text-sm leading-relaxed text-escola-creme-50">
          {sub.description}
        </p>
      </div>

      {/* Micro-reflection */}
      <MicroReflection
        courseSlug={slug}
        moduleNumber={moduloNum}
        sublessonLetter={subaulaLetter}
      />

      {/* Perguntar ao guia vive ao nivel do modulo (conversa unica para
          as 3 sub-aulas) — ver /cursos/<slug>/<moduloNum>. */}

      {/* Complete button */}
      <div className="mt-8">
        {completed ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-escola-creme-50">Sub-aula completada</p>
            {isLastSub ? (
              <Link
                href={mod.workbook ? `/cursos/${slug}/${moduloNum}/caderno` : `/cursos/${slug}/${moduloNum}/completo`}
                className="w-full rounded-lg px-6 py-3 text-center text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "rgba(var(--t-primary-rgb), 0.1)", color: "var(--t-primary)" }}
              >
                {mod.workbook ? "Ir para o caderno" : "Ver conclusao do modulo"}
              </Link>
            ) : (
              <Link
                href={`/cursos/${slug}/${moduloNum}/${nextSubLetter!.toLowerCase()}`}
                className="w-full rounded-lg px-6 py-3 text-center text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "rgba(var(--t-primary-rgb), 0.1)", color: "var(--t-primary)" }}
              >
                Proxima sub-aula &rarr;
              </Link>
            )}
          </div>
        ) : (
          <button
            onClick={handleComplete}
            className="w-full rounded-lg px-6 py-3 text-sm font-medium text-escola-bg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--t-primary)" }}
          >
            {isLastSub
              ? (mod.workbook ? "Completar e ir para o caderno" : "Completar sub-aula")
              : "Completar e continuar \u2192"}
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        {subIndex > 0 && (
          <Link
            href={`/cursos/${slug}/${moduloNum}/${mod.subLessons[subIndex - 1].letter.toLowerCase()}`}
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            &larr; {mod.subLessons[subIndex - 1].letter}
          </Link>
        )}
        {subIndex === 0 && moduloNum > 1 && (
          <Link
            href={`/cursos/${slug}/${moduloNum - 1}`}
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            &larr; Modulo {moduloNum - 1}
          </Link>
        )}
        <span />
        {!isLastSub && (
          <Link
            href={`/cursos/${slug}/${moduloNum}/${mod.subLessons[subIndex + 1].letter.toLowerCase()}`}
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            {mod.subLessons[subIndex + 1].letter} &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}

function MicroReflection({
  courseSlug,
  moduleNumber,
  sublessonLetter,
}: {
  courseSlug: string;
  moduleNumber: number;
  sublessonLetter: string;
}) {
  const { content, updateContent, saved, wordCount } = useJournal(
    courseSlug,
    moduleNumber,
    sublessonLetter
  );
  const [expanded, setExpanded] = useState(content.length > 0);

  return (
    <div className="rounded-xl border border-escola-border bg-escola-card p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h3
            className="text-xs uppercase tracking-wide"
            style={{ color: "var(--t-primary, #C9A96E)" }}
          >
            Pausa para reflexao
          </h3>
          <p className="mt-1 text-sm text-escola-creme-50">
            O que te ficou desta sub-aula?
          </p>
        </div>
        <span className="text-escola-creme-50">{expanded ? "\u2212" : "+"}</span>
      </button>

      {expanded && (
        <div className="mt-4">
          <textarea
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Escreve aqui... Este espaco e so teu."
            className="min-h-[100px] w-full resize-y rounded-lg border border-escola-border bg-escola-bg px-4 py-3 font-serif text-sm leading-relaxed text-escola-creme placeholder:text-escola-creme-50 focus:outline-none"
            style={{ borderColor: content.length > 0 ? "rgba(var(--t-primary-rgb), 0.3)" : undefined }}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-escola-creme-50">
              {wordCount > 0 && `${wordCount} ${wordCount === 1 ? "palavra" : "palavras"}`}
            </span>
            <span className="text-[10px] text-escola-creme-50">
              {!saved ? "A guardar..." : saved && content.length > 0 ? "Guardado" : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function NotFound({ msg }: { msg: string }) {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center">
      <p className="text-escola-creme-50">{msg}</p>
    </div>
  );
}
