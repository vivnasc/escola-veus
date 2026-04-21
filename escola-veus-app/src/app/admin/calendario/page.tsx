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
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [srtUrl, setSrtUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsStr, setTagsStr] = useState("escola dos véus, nomear, contemplativo");
  const [publishAt, setPublishAt] = useState("");
  const [privacy, setPrivacy] = useState<"private" | "unlisted" | "public">("private");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ videoId: string; watchUrl: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setUploading(true);
    setErr(null);
    setResult(null);
    try {
      const r = await fetch("/api/admin/youtube/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl,
          title,
          description,
          tags: tagsStr.split(",").map((t) => t.trim()).filter(Boolean),
          thumbnailUrl: thumbnailUrl || undefined,
          srtUrl: srtUrl || undefined,
          publishAt: publishAt ? new Date(publishAt).toISOString() : undefined,
          privacyStatus: privacy,
        }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setResult(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-escola-border bg-escola-card p-4 text-xs text-escola-creme-50">
        <p className="mb-2 text-escola-creme">Setup (uma vez, ~15 min):</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Google Cloud Console → New Project → Enable "YouTube Data API v3"</li>
          <li>APIs &amp; Services → Credentials → Create OAuth Client ID (Desktop app)</li>
          <li>Guarda <code className="rounded bg-escola-bg px-1">client_id</code> e <code className="rounded bg-escola-bg px-1">client_secret</code></li>
          <li>
            Vai a{" "}
            <a
              href="https://developers.google.com/oauthplayground/"
              target="_blank"
              rel="noreferrer"
              className="text-escola-dourado underline"
            >
              OAuth Playground
            </a>
            , cog ⚙️ → "Use your own OAuth credentials" → cola client_id/secret
          </li>
          <li>
            Scope: <code className="rounded bg-escola-bg px-1">https://www.googleapis.com/auth/youtube.upload</code> +{" "}
            <code className="rounded bg-escola-bg px-1">https://www.googleapis.com/auth/youtube.force-ssl</code>
          </li>
          <li>Authorize APIs (entra com a conta do canal), Exchange code for token → copia <code className="rounded bg-escola-bg px-1">refresh_token</code></li>
          <li>
            No Vercel, Settings → Environment Variables, adiciona:
            <code className="ml-1 rounded bg-escola-bg px-1">GOOGLE_OAUTH_CLIENT_ID</code>
            {", "}
            <code className="rounded bg-escola-bg px-1">GOOGLE_OAUTH_CLIENT_SECRET</code>
            {", "}
            <code className="rounded bg-escola-bg px-1">GOOGLE_OAUTH_REFRESH_TOKEN</code>
          </li>
        </ol>
      </div>

      <div className="space-y-3 rounded-xl border border-escola-border bg-escola-card p-4 text-xs">
        <Field label="Video URL (Supabase MP4)" value={videoUrl} onChange={setVideoUrl} placeholder="https://…/funil-videos/trailer-…mp4" />
        <Field label="Thumbnail URL (opcional)" value={thumbnailUrl} onChange={setThumbnailUrl} placeholder="https://…/thumbnails/ep01-…png" />
        <Field label="SRT URL (opcional)" value={srtUrl} onChange={setSrtUrl} placeholder="https://…/subtitles/ep01-…srt" />
        <Field label="Título" value={title} onChange={setTitle} placeholder="Título do vídeo no YouTube" />
        <div>
          <label className="mb-1 block text-escola-creme-50">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
          />
        </div>
        <Field label="Tags (separadas por vírgula)" value={tagsStr} onChange={setTagsStr} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-escola-creme-50">Agendamento (opcional)</label>
            <input
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
              className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
            />
          </div>
          <div>
            <label className="mb-1 block text-escola-creme-50">Visibilidade (se sem agendamento)</label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as "private" | "unlisted" | "public")}
              className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
            >
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>
        <button
          onClick={submit}
          disabled={uploading || !videoUrl || !title}
          className="w-full rounded bg-escola-coral px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {uploading ? "A enviar para YouTube..." : "Upload YouTube"}
        </button>
        {err && <p className="text-escola-terracota">{err}</p>}
        {result && (
          <div className="rounded border border-escola-dourado bg-escola-bg p-3">
            <p className="text-escola-dourado">✓ Upload OK — {result.videoId}</p>
            <a
              href={result.watchUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-escola-creme-50 underline"
            >
              {result.watchUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-escola-creme-50">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
      />
    </div>
  );
}
