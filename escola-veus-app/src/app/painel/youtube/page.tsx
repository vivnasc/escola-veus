"use client";

import { useState } from "react";
import Link from "next/link";
import {
  YOUTUBE_WEEKS,
  YOUTUBE_SCHEDULE,
  VIDEO_CHECKLIST,
  PRODUCTION_STEPS,
  YOUTUBE_DESCRIPTION_TEMPLATE,
  YOUTUBE_TAGS,
  getAllVideos,
  getDayLabel,
  getStatusLabel,
} from "@/data/youtube-calendar";
import type { YouTubeVideo, VideoStatus, YouTubeDay } from "@/data/youtube-calendar";
import { getCourseBySlug } from "@/data/courses";

// ─── Paleta Mundo dos Veus ──────────────────────────────────────────────────────

const PALETTE = {
  bg: "#1A1A2E",
  silhouette: "#C4745A",
  gold: "#C9A96E",
  violet: "#8B5CF6",
  cream: "#F5F0E6",
  warmGold: "#D4A853",
};

const STATUS_COLORS: Record<VideoStatus, { bg: string; text: string }> = {
  draft: { bg: "#374151", text: "#9CA3AF" },
  script_ready: { bg: "#92400E", text: "#FDE68A" },
  approved: { bg: "#065F46", text: "#6EE7B7" },
  producing: { bg: "#1E40AF", text: "#93C5FD" },
  review: { bg: "#6B21A8", text: "#C4B5FD" },
  scheduled: { bg: "#0E7490", text: "#67E8F9" },
  published: { bg: "#166534", text: "#86EFAC" },
};

const DAY_ICONS: Record<YouTubeDay, string> = {
  terca: "T",
  quinta: "Q",
  sabado: "S",
};

// ─── Components ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: VideoStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function VideoCard({ video, expanded, onToggle }: {
  video: YouTubeVideo;
  expanded: boolean;
  onToggle: () => void;
}) {
  const course = getCourseBySlug(video.courseOrigin);
  const secondaryCourse = video.secondaryCourse
    ? getCourseBySlug(video.secondaryCourse)
    : null;

  return (
    <div
      className="rounded-xl border transition-all"
      style={{
        borderColor: expanded ? PALETTE.gold + "40" : PALETTE.cream + "10",
        backgroundColor: expanded ? PALETTE.bg : PALETTE.bg + "CC",
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5"
      >
        <div className="flex items-start gap-3">
          {/* Day indicator */}
          <div
            className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold"
            style={{
              backgroundColor: PALETTE.violet + "20",
              color: PALETTE.violet,
            }}
          >
            {DAY_ICONS[video.day]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="text-xs font-medium"
                style={{ color: PALETTE.gold }}
              >
                Video {video.number}
              </span>
              <span
                className="text-xs"
                style={{ color: PALETTE.cream + "50" }}
              >
                {getDayLabel(video.day)}
              </span>
              <StatusBadge status={video.status} />
            </div>
            <h3
              className="text-sm sm:text-base font-semibold leading-snug"
              style={{ color: PALETTE.cream }}
            >
              {video.title}
            </h3>
            <p
              className="text-xs mt-1"
              style={{ color: PALETTE.cream + "60" }}
            >
              {course?.title ?? video.courseOrigin}
              {secondaryCourse ? ` + ${secondaryCourse.title}` : ""}
              {" · "}
              {video.territory}
            </p>
          </div>

          {/* Expand arrow */}
          <span
            className="flex-shrink-0 text-xs transition-transform"
            style={{
              color: PALETTE.cream + "40",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            &#9660;
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          className="px-4 sm:px-5 pb-5 space-y-4"
          style={{ borderTop: `1px solid ${PALETTE.cream}10` }}
        >
          {/* Strategy note */}
          <div className="pt-4">
            <p
              className="text-xs italic"
              style={{ color: PALETTE.cream + "70" }}
            >
              {video.description}
            </p>
          </div>

          {/* Full script */}
          {video.script && video.script.length > 0 && (
            <div className="space-y-4">
              {video.script.map((scene, i) => {
                const sectionLabels: Record<string, string> = {
                  gancho: "Gancho",
                  situacao: "Situação reconhecível",
                  padrao: "O padrão por baixo",
                  gesto: "Gesto de consciência",
                  fecho: "Frase final + CTA",
                };
                const sectionColors: Record<string, string> = {
                  gancho: PALETTE.silhouette,
                  situacao: PALETTE.violet,
                  padrao: PALETTE.gold,
                  gesto: PALETTE.warmGold,
                  fecho: PALETTE.silhouette,
                };
                return (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: sectionColors[scene.section] + "20", color: sectionColors[scene.section] }}
                      >
                        {scene.timestamp}
                      </span>
                      <h4
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: sectionColors[scene.section] }}
                      >
                        {sectionLabels[scene.section] ?? scene.section}
                      </h4>
                    </div>
                    <p
                      className="text-xs mb-2 italic"
                      style={{ color: PALETTE.cream + "50" }}
                    >
                      Visual: {scene.visual}
                    </p>
                    <blockquote
                      className="text-sm leading-relaxed pl-3"
                      style={{
                        color: PALETTE.cream + "E0",
                        borderLeft: `2px solid ${sectionColors[scene.section]}`,
                      }}
                    >
                      {scene.narration}
                    </blockquote>
                  </div>
                );
              })}
            </div>
          )}

          {/* Copy full narration button */}
          {video.script && video.script.length > 0 && (
            <button
              onClick={() => {
                const fullText = video.script.map((s) => s.narration).join("\n\n");
                navigator.clipboard.writeText(fullText);
              }}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{
                backgroundColor: PALETTE.violet + "20",
                color: PALETTE.violet,
              }}
            >
              Copiar narração completa
            </button>
          )}

          {/* YouTube description preview */}
          <details className="group">
            <summary
              className="text-xs font-medium cursor-pointer"
              style={{ color: PALETTE.violet }}
            >
              Ver descrição YouTube
            </summary>
            <pre
              className="mt-2 text-xs p-3 rounded-lg whitespace-pre-wrap overflow-x-auto"
              style={{
                backgroundColor: PALETTE.cream + "08",
                color: PALETTE.cream + "90",
              }}
            >
              {YOUTUBE_DESCRIPTION_TEMPLATE
                .replace("[TITULO]", video.title)
                .replace("[DESCRICAO_VIDEO]", video.description)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

function ChecklistPanel() {
  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{ backgroundColor: PALETTE.bg, border: `1px solid ${PALETTE.cream}10` }}
    >
      <h3
        className="text-sm font-semibold uppercase tracking-wider"
        style={{ color: PALETTE.gold }}
      >
        Checklist por Vídeo
      </h3>
      <ul className="space-y-2">
        {VIDEO_CHECKLIST.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs" style={{ color: PALETTE.cream + "B0" }}>
            <span
              className="flex-shrink-0 w-4 h-4 rounded border mt-0.5 flex items-center justify-center"
              style={{ borderColor: PALETTE.cream + "30" }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PipelinePanel() {
  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{ backgroundColor: PALETTE.bg, border: `1px solid ${PALETTE.cream}10` }}
    >
      <h3
        className="text-sm font-semibold uppercase tracking-wider"
        style={{ color: PALETTE.gold }}
      >
        Pipeline de Produção
      </h3>
      <p className="text-xs" style={{ color: PALETTE.cream + "60" }}>
        Produção na véspera (Seg/Qua/Sex). Ideal: 2-3 vídeos em avanço.
      </p>
      <ol className="space-y-2">
        {PRODUCTION_STEPS.map((s) => (
          <li key={s.step} className="flex items-start gap-2 text-xs" style={{ color: PALETTE.cream + "B0" }}>
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: PALETTE.violet + "20", color: PALETTE.violet }}
            >
              {s.step}
            </span>
            <div>
              <span style={{ color: PALETTE.cream + "D0" }}>{s.label}</span>
              <span className="ml-1" style={{ color: PALETTE.cream + "40" }}>
                — {s.responsible}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function StatsBar() {
  const all = getAllVideos();
  const counts: Record<VideoStatus, number> = {
    draft: 0, script_ready: 0, approved: 0,
    producing: 0, review: 0, scheduled: 0, published: 0,
  };
  for (const v of all) counts[v.status]++;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Total", value: all.length, color: PALETTE.cream },
        { label: "Rascunho", value: counts.draft, color: "#9CA3AF" },
        { label: "Em produção", value: counts.producing + counts.review, color: "#93C5FD" },
        { label: "Publicados", value: counts.published + counts.scheduled, color: "#86EFAC" },
      ].map((s) => (
        <div
          key={s.label}
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: PALETTE.cream + "08" }}
        >
          <div className="text-2xl font-bold" style={{ color: s.color }}>
            {s.value}
          </div>
          <div className="text-xs" style={{ color: PALETTE.cream + "60" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function YouTubeCalendarPage() {
  const [expandedVideo, setExpandedVideo] = useState<number | null>(null);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);
  const [showPanel, setShowPanel] = useState<"checklist" | "pipeline" | null>(null);

  const weeks = activeWeek
    ? YOUTUBE_WEEKS.filter((w) => w.number === activeWeek)
    : YOUTUBE_WEEKS;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0F0F1A" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 backdrop-blur-md"
        style={{ backgroundColor: "#0F0F1A" + "E8" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <Link
                href="/painel/marketing"
                className="text-xs mb-1 inline-block"
                style={{ color: PALETTE.violet }}
              >
                &larr; Marketing
              </Link>
              <h1
                className="text-lg sm:text-xl font-bold"
                style={{ color: PALETTE.cream, fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Calendário YouTube
              </h1>
              <p className="text-xs" style={{ color: PALETTE.cream + "60" }}>
                4 semanas · 12 videos · {YOUTUBE_SCHEDULE.daysOfWeek.map(getDayLabel).join(", ")} · {YOUTUBE_SCHEDULE.publishTime}h
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: PALETTE.cream + "80" }}>
              <span
                className="px-2 py-1 rounded"
                style={{ backgroundColor: PALETTE.violet + "20", color: PALETTE.violet }}
              >
                {YOUTUBE_SCHEDULE.durationRange.min}-{YOUTUBE_SCHEDULE.durationRange.max} min
              </span>
            </div>
          </div>

          {/* Stats */}
          <StatsBar />

          {/* Week filter */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto">
            <button
              onClick={() => setActiveWeek(null)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0"
              style={{
                backgroundColor: activeWeek === null ? PALETTE.violet : PALETTE.cream + "08",
                color: activeWeek === null ? "#fff" : PALETTE.cream + "80",
              }}
            >
              Todas
            </button>
            {YOUTUBE_WEEKS.map((w) => (
              <button
                key={w.number}
                onClick={() => setActiveWeek(activeWeek === w.number ? null : w.number)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0"
                style={{
                  backgroundColor: activeWeek === w.number ? PALETTE.violet : PALETTE.cream + "08",
                  color: activeWeek === w.number ? "#fff" : PALETTE.cream + "80",
                }}
              >
                Sem {w.number}
              </button>
            ))}

            <div className="flex-1" />

            {/* Tool buttons */}
            <button
              onClick={() => setShowPanel(showPanel === "checklist" ? null : "checklist")}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0"
              style={{
                backgroundColor: showPanel === "checklist" ? PALETTE.gold + "30" : PALETTE.cream + "08",
                color: showPanel === "checklist" ? PALETTE.gold : PALETTE.cream + "60",
              }}
            >
              Checklist
            </button>
            <button
              onClick={() => setShowPanel(showPanel === "pipeline" ? null : "pipeline")}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0"
              style={{
                backgroundColor: showPanel === "pipeline" ? PALETTE.gold + "30" : PALETTE.cream + "08",
                color: showPanel === "pipeline" ? PALETTE.gold : PALETTE.cream + "60",
              }}
            >
              Pipeline
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Side panel */}
        {showPanel === "checklist" && <ChecklistPanel />}
        {showPanel === "pipeline" && <PipelinePanel />}

        {/* Tags reference */}
        <div className="flex flex-wrap gap-1.5">
          {YOUTUBE_TAGS.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: PALETTE.cream + "08", color: PALETTE.cream + "50" }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week) => (
          <section key={week.number}>
            {/* Week header */}
            <div className="mb-3">
              <h2
                className="text-sm font-bold uppercase tracking-wider"
                style={{ color: PALETTE.gold }}
              >
                Semana {week.number} — {week.theme}
              </h2>
              <p
                className="text-xs mt-1"
                style={{ color: PALETTE.cream + "60" }}
              >
                {week.objective}
              </p>
            </div>

            {/* Videos */}
            <div className="space-y-2">
              {week.videos.map((video) => (
                <VideoCard
                  key={video.number}
                  video={video}
                  expanded={expandedVideo === video.number}
                  onToggle={() =>
                    setExpandedVideo(
                      expandedVideo === video.number ? null : video.number
                    )
                  }
                />
              ))}
            </div>
          </section>
        ))}

        {/* CTA template */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: PALETTE.silhouette + "15",
            border: `1px solid ${PALETTE.silhouette}30`,
          }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: PALETTE.silhouette }}
          >
            CTA padrão (primeiras 4 semanas)
          </h3>
          <p
            className="text-sm italic leading-relaxed"
            style={{ color: PALETTE.cream + "C0" }}
          >
            &ldquo;{YOUTUBE_SCHEDULE.ctaDefault}&rdquo;
          </p>
        </div>

        {/* Video structure reminder */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: PALETTE.cream + "05",
            border: `1px solid ${PALETTE.cream}08`,
          }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: PALETTE.gold }}
          >
            Estrutura de cada vídeo
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { time: "0:00", label: "Gancho", dur: "15s" },
              { time: "0:15", label: "Situação", dur: "~75s" },
              { time: "1:30", label: "Padrão", dur: "~2min" },
              { time: "3:30", label: "Gesto", dur: "~90s" },
              { time: "5:00", label: "Frase + CTA", dur: "30s" },
            ].map((s) => (
              <div
                key={s.time}
                className="rounded-lg p-2.5 text-center"
                style={{ backgroundColor: PALETTE.violet + "10" }}
              >
                <div className="text-xs font-mono" style={{ color: PALETTE.violet }}>
                  {s.time}
                </div>
                <div className="text-xs font-medium mt-0.5" style={{ color: PALETTE.cream + "D0" }}>
                  {s.label}
                </div>
                <div className="text-xs" style={{ color: PALETTE.cream + "40" }}>
                  {s.dur}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
