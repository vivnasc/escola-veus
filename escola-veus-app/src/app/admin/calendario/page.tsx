"use client";

import { useMemo, useState } from "react";
import {
  YOUTUBE_WEEKS,
  YOUTUBE_SCHEDULE,
  getDayLabel,
  getStatusLabel,
  type YouTubeVideo,
} from "@/data/youtube-calendar";
import { allWeeks } from "@/data/content-calendar-weeks";
import { useUniverse } from "@/contexts/UniverseContext";

// Tabs disponíveis por universo.
// - Cursos: YouTube (plano), Social (Instagram/WhatsApp), Upload (canal Cursos)
// - AG: Plano AG (seg/qua short, sex longo), Upload AG (canal AG)
type CursosTab = "youtube" | "social" | "upload";
type AgTab = "plano" | "upload";

const CURSOS_TABS: { key: CursosTab; label: string }[] = [
  { key: "youtube", label: "YouTube" },
  { key: "social", label: "Social" },
  { key: "upload", label: "Upload" },
];

const AG_TABS: { key: AgTab; label: string }[] = [
  { key: "plano", label: "Plano AG" },
  { key: "upload", label: "Upload AG" },
];

export default function CalendarioPage() {
  const { universe } = useUniverse();
  const isAg = universe === "ag";

  const [cursosTab, setCursosTab] = useState<CursosTab>("youtube");
  const [agTab, setAgTab] = useState<AgTab>("plano");

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-escola-creme">
          Calendário {isAg ? "· Ancient Ground" : "· Cursos"}
        </h2>
        <p className="mt-1 text-sm text-escola-creme-50">
          {isAg
            ? "Segundas + quartas: short · Sextas: vídeo longo 60 min · Canal YouTube AG."
            : "YouTube · Instagram/WhatsApp · Upload agendado (canal Escola dos Véus)."}
        </p>
      </div>

      {isAg ? (
        <>
          <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-escola-border">
            {AG_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setAgTab(key)}
                className={`shrink-0 border-b-2 px-3 py-2 text-xs transition-colors ${
                  agTab === key
                    ? "border-escola-dourado text-escola-dourado"
                    : "border-transparent text-escola-creme-50 hover:text-escola-creme"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          {agTab === "plano" && <PlanoAgTab />}
          {agTab === "upload" && (
            <UploadTab
              channel="ag"
              defaultTags="ancient ground, nature, meditation, ambient"
              placeholderVideoUrl="https://…/course-assets/youtube/videos/ancient-ground-…mp4"
              helpLabel="Canal YouTube Ancient Ground (env: YT_AG_*)"
            />
          )}
        </>
      ) : (
        <>
          <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-escola-border">
            {CURSOS_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCursosTab(key)}
                className={`shrink-0 border-b-2 px-3 py-2 text-xs transition-colors ${
                  cursosTab === key
                    ? "border-escola-dourado text-escola-dourado"
                    : "border-transparent text-escola-creme-50 hover:text-escola-creme"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
          {cursosTab === "youtube" && <YouTubeTab />}
          {cursosTab === "social" && <SocialTab />}
          {cursosTab === "upload" && (
            <UploadTab
              channel="cursos"
              defaultTags="escola dos véus, nomear, contemplativo"
              placeholderVideoUrl="https://…/funil-videos/trailer-…mp4"
              helpLabel="Canal YouTube Escola dos Véus (env: GOOGLE_OAUTH_*)"
            />
          )}
        </>
      )}
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

// ── Plano AG ─────────────────────────────────────────────────────────────────

type AgSlotType = "short" | "longo";
type AgSlot = {
  dateISO: string;
  type: AgSlotType;
  label: string;
};

function nextWeeksAgSlots(weeks = 8): { weekLabel: string; start: Date; slots: AgSlot[] }[] {
  // Começa na próxima segunda-feira a partir de hoje.
  const today = new Date();
  const day = today.getDay(); // 0=dom, 1=seg, ...
  const daysUntilMonday = (1 - day + 7) % 7 || 7;
  const firstMonday = new Date(today);
  firstMonday.setHours(10, 0, 0, 0); // publicação 10:00 (ajustável)
  firstMonday.setDate(today.getDate() + daysUntilMonday);

  const out: { weekLabel: string; start: Date; slots: AgSlot[] }[] = [];
  for (let w = 0; w < weeks; w++) {
    const monday = new Date(firstMonday);
    monday.setDate(firstMonday.getDate() + w * 7);
    const wednesday = new Date(monday);
    wednesday.setDate(monday.getDate() + 2);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    out.push({
      weekLabel: `Semana de ${monday.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}`,
      start: monday,
      slots: [
        { dateISO: monday.toISOString(), type: "short", label: "Short · Segunda" },
        { dateISO: wednesday.toISOString(), type: "short", label: "Short · Quarta" },
        { dateISO: friday.toISOString(), type: "longo", label: "Vídeo longo · Sexta" },
      ],
    });
  }
  return out;
}

function PlanoAgTab() {
  const weeks = useMemo(() => nextWeeksAgSlots(8), []);
  return (
    <div>
      <div className="mb-4 rounded-xl border border-escola-border bg-escola-card p-4 text-xs text-escola-creme-50">
        <p>
          Ritmo:{" "}
          <span className="text-escola-creme">Seg · Qua (shorts 30s)</span> +{" "}
          <span className="text-escola-creme">Sex (longo 60 min)</span>
          {" · "}
          {weeks.length} semanas visíveis
        </p>
        <p className="mt-1">
          Cada slot abaixo é um alvo de publicação. Para já lista só datas — a seguir ligamos ao estado (rendered / scheduled / published) puxando do Supabase.
        </p>
      </div>
      <div className="space-y-2">
        {weeks.map((w) => (
          <div key={w.start.toISOString()} className="overflow-hidden rounded-xl border border-escola-border bg-escola-card">
            <div className="border-b border-escola-border px-4 py-2 text-sm text-escola-creme">
              {w.weekLabel}
            </div>
            <ul className="divide-y divide-escola-border">
              {w.slots.map((s) => (
                <li key={s.dateISO} className="flex items-center justify-between px-4 py-2 text-xs">
                  <div>
                    <p className="text-escola-creme">{s.label}</p>
                    <p className="text-escola-creme-50">
                      {new Date(s.dateISO).toLocaleDateString("pt-PT", {
                        weekday: "long",
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                      s.type === "longo"
                        ? "bg-escola-coral/20 text-escola-coral"
                        : "bg-escola-border text-escola-creme-50"
                    }`}
                  >
                    {s.type === "longo" ? "60 min" : "30s vertical"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Upload (com prop channel: escolhe canal YouTube) ─────────────────────────

function UploadTab({
  channel,
  defaultTags,
  placeholderVideoUrl,
  helpLabel,
}: {
  channel: "cursos" | "ag";
  defaultTags: string;
  placeholderVideoUrl: string;
  helpLabel: string;
}) {
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [srtUrl, setSrtUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsStr, setTagsStr] = useState(defaultTags);
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
          channel,
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
        <p className="mb-1 text-escola-dourado">{helpLabel}</p>
        {channel === "ag" ? (
          <p>
            Requer OAuth separado do canal AG. Envs:{" "}
            <code className="rounded bg-escola-bg px-1">YT_AG_CLIENT_ID</code>
            {", "}
            <code className="rounded bg-escola-bg px-1">YT_AG_CLIENT_SECRET</code>
            {", "}
            <code className="rounded bg-escola-bg px-1">YT_AG_REFRESH_TOKEN</code>.
            Se estas envs não estiverem configuradas, o endpoint retorna erro claro.
          </p>
        ) : (
          <p>
            Canal Escola dos Véus. Envs:{" "}
            <code className="rounded bg-escola-bg px-1">GOOGLE_OAUTH_CLIENT_ID</code>
            {", "}
            <code className="rounded bg-escola-bg px-1">GOOGLE_OAUTH_CLIENT_SECRET</code>
            {", "}
            <code className="rounded bg-escola-bg px-1">GOOGLE_OAUTH_REFRESH_TOKEN</code>.
          </p>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-escola-border bg-escola-card p-4 text-xs">
        <Field label="Video URL (Supabase MP4)" value={videoUrl} onChange={setVideoUrl} placeholder={placeholderVideoUrl} />
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
          {uploading ? "A enviar para YouTube..." : `Upload YouTube (${channel === "ag" ? "canal AG" : "canal Cursos"})`}
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
