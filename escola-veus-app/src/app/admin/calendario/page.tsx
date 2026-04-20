"use client";

import { useState } from "react";
import {
  YOUTUBE_WEEKS,
  YOUTUBE_SCHEDULE,
  getDayLabel,
  getStatusLabel,
  type YouTubeVideo,
} from "@/data/youtube-calendar";
import { allWeeks } from "@/data/content-calendar-weeks";

type Tab = "youtube" | "social" | "upload";

export default function CalendarioPage() {
  const [tab, setTab] = useState<Tab>("youtube");

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-escola-creme">
          Calendário
        </h2>
        <p className="mt-1 text-sm text-escola-creme-50">
          YouTube · Instagram/WhatsApp · Upload agendado
        </p>
      </div>

      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-escola-border">
        {(["youtube", "social", "upload"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 border-b-2 px-3 py-2 text-xs transition-colors ${
              tab === t
                ? "border-escola-dourado text-escola-dourado"
                : "border-transparent text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            {t === "youtube" ? "YouTube" : t === "social" ? "Social" : "Upload"}
          </button>
        ))}
      </nav>

      {tab === "youtube" && <YouTubeTab />}
      {tab === "social" && <SocialTab />}
      {tab === "upload" && <UploadTab />}
    </div>
  );
}

function YouTubeTab() {
  return (
    <div>
      <div className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4 text-xs text-escola-creme-50">
        <p>
          Schedule: <span className="text-escola-creme">{YOUTUBE_SCHEDULE.daysOfWeek.join(", ")} · {YOUTUBE_SCHEDULE.publishTime}</span>
          {" · "}
          {YOUTUBE_WEEKS.length} semanas planeadas
        </p>
      </div>

      <div className="space-y-2">
        {YOUTUBE_WEEKS.map((w) => (
          <details
            key={w.number}
            className="overflow-hidden rounded-xl border border-escola-border bg-escola-card"
          >
            <summary className="cursor-pointer px-4 py-3 text-sm text-escola-creme">
              Semana {w.number} — {w.theme}{" "}
              <span className="text-xs text-escola-creme-50">
                · {w.videos.length} vídeos
              </span>
            </summary>
            <ul className="divide-y divide-escola-border border-t border-escola-border">
              {w.videos.map((v: YouTubeVideo) => (
                <li
                  key={v.number}
                  className="flex items-center justify-between px-4 py-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="truncate text-escola-creme">
                      #{v.number} {v.title}
                    </p>
                    <p className="text-escola-creme-50">
                      {getDayLabel(v.day)} · {v.courseOrigin}
                    </p>
                  </div>
                  <span className="ml-3 shrink-0 rounded-full bg-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50">
                    {getStatusLabel(v.status)}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}

function SocialTab() {
  return (
    <div>
      <div className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4 text-xs text-escola-creme-50">
        <p>
          {allWeeks.length} semanas Instagram/WhatsApp planeadas
        </p>
      </div>
      <div className="space-y-2">
        {allWeeks.map((w) => (
          <details
            key={w.weekNumber}
            className="overflow-hidden rounded-xl border border-escola-border bg-escola-card"
          >
            <summary className="cursor-pointer px-4 py-3 text-sm text-escola-creme">
              Semana {w.weekNumber} — {w.title}{" "}
              <span className="text-xs text-escola-creme-50">· {w.days.length} dias</span>
            </summary>
            <ul className="divide-y divide-escola-border border-t border-escola-border">
              {w.days.map((d, i) => (
                <li key={i} className="px-4 py-2 text-xs text-escola-creme-50">
                  <span className="text-escola-creme">{d.day}</span> · {d.slots.length} slots
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}

function UploadTab() {
  return (
    <div className="rounded-xl border border-escola-border bg-escola-card p-6">
      <h3 className="text-sm text-escola-creme">Upload YouTube — agendado</h3>
      <p className="mt-2 text-xs text-escola-creme-50">
        Stub. Liga aqui o YouTube Data API v3 para upload + agendamento por
        data, partindo dos vídeos renderizados em
        <code className="mx-1 rounded bg-escola-border px-1">
          course-assets/youtube/videos/
        </code>
        e dos slots planeados na aba YouTube.
      </p>
      <ul className="mt-4 space-y-1 text-xs text-escola-creme-50">
        <li>• OAuth2 da conta YouTube → token guardado em Vercel env</li>
        <li>• POST /upload com title, description, tags, thumbnail, scheduled_publish_at</li>
        <li>• Cron diário a publicar vídeos com publish_at &lt;= now</li>
      </ul>
    </div>
  );
}
