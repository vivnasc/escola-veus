"use client";

import { useEffect, useMemo, useState } from "react";
import { ShareVideoActions } from "@/components/admin/ShareVideoActions";
import { YouTubePublishSteps } from "@/components/admin/YouTubePublishSteps";
import {
  YOUTUBE_WEEKS,
  YOUTUBE_SCHEDULE,
  getDayLabel,
  getStatusLabel,
  type YouTubeVideo,
} from "@/data/youtube-calendar";
import { allWeeks } from "@/data/content-calendar-weeks";
import { useUniverse } from "@/contexts/UniverseContext";
import { RecentRenders } from "@/components/admin/RecentRenders";

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
  slotId: string;
};

// ID estável e legível: "YYYY-MM-DD-short" ou "...-long". Usado como chave
// no ficheiro ag-schedule.json guardado no Supabase.
function slotIdFor(dateISO: string, type: AgSlotType): string {
  const yyyyMmDd = dateISO.slice(0, 10);
  return `${yyyyMmDd}-${type === "longo" ? "long" : "short"}`;
}

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

    const mk = (d: Date, type: AgSlotType, label: string): AgSlot => ({
      dateISO: d.toISOString(),
      type,
      label,
      slotId: slotIdFor(d.toISOString(), type),
    });
    out.push({
      weekLabel: `Semana de ${monday.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}`,
      start: monday,
      slots: [
        mk(monday, "short", "Short · Segunda"),
        mk(wednesday, "short", "Short · Quarta"),
        mk(friday, "longo", "Vídeo longo · Sexta"),
      ],
    });
  }
  return out;
}

// ── Schedule AG (qual vídeo em que dia) ─────────────────────────────────────

type ScheduleEntry = {
  videoName: string;
  videoUrl: string;
  publishedAt?: string | null; // ISO string quando foi publicado
  publishedUrl?: string | null; // link do vídeo no YouTube
  notes?: string | null;
};

type ScheduleMap = Record<string, ScheduleEntry>;

type AvailableVideo = {
  name: string;
  url: string;
  thumbnailUrl?: string | null;
  createdAt?: string | null;
  seo?: Record<string, unknown> | null;
};

function PlanoAgTab() {
  const weeks = useMemo(() => nextWeeksAgSlots(8), []);

  const [schedule, setSchedule] = useState<ScheduleMap>({});
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [longVideos, setLongVideos] = useState<AvailableVideo[]>([]);
  const [shortVideos, setShortVideos] = useState<AvailableVideo[]>([]);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);

  // Carrega tudo ao mount: schedule + 2 bibliotecas (longos + shorts).
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/ancient-ground/schedule", { cache: "no-store" });
        const d = await r.json();
        setSchedule(d.slots || {});
      } catch { /* ignore */ }
      setScheduleLoaded(true);
    })();
    fetch("/api/admin/ancient-ground/list-long-videos", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setLongVideos(d.videos || []))
      .catch(() => setLongVideos([]));
    fetch("/api/admin/ancient-ground/list-short-videos", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setShortVideos(d.videos || []))
      .catch(() => setShortVideos([]));
  }, []);

  // Persiste no Supabase em cada mudança (debounce 400ms para evitar
  // chamadas a cada keystroke futuro).
  const persist = async (next: ScheduleMap, slotIdBeingSaved: string) => {
    setSavingSlot(slotIdBeingSaved);
    try {
      await fetch("/api/admin/ancient-ground/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: next }),
      });
    } finally {
      setSavingSlot(null);
    }
  };

  const setSlotEntry = (slotId: string, entry: ScheduleEntry | null) => {
    setSchedule((prev) => {
      const next = { ...prev };
      if (entry === null) {
        delete next[slotId];
      } else {
        next[slotId] = entry;
      }
      persist(next, slotId);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Biblioteca dos vídeos prontos — primeira coisa visível. Caso de
          uso dominante: ir ao calendário para publicar, e para isso precisas
          de ver os vídeos, não de fazer scroll pelo plano inteiro. */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          🎬 Vídeos AG prontos a publicar
        </h3>
        <p className="mb-3 text-xs text-escola-creme-50">
          Clica num vídeo para abrir os 3 passos de publicação (⬇ MP4 / ↗ Partilhar / 📋 SEO). Não precisas de ir ao Supabase.
        </p>
        <div className="space-y-4">
          <RecentRenders
            kind="long"
            title="Longos (60 min)"
            subtitle="Sextas · canal AG."
          />
          <RecentRenders
            kind="short"
            title="Shorts (30s)"
            subtitle="Segundas + Quartas · canal AG + TikTok + Instagram."
          />
        </div>
      </div>

      {/* 2. Plano das próximas semanas — consulta secundária. Colapsado
          por default para não empurrar a biblioteca para baixo. */}
      <details className="rounded-xl border border-escola-border bg-escola-card">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold uppercase tracking-wider text-escola-coral hover:bg-escola-bg/40">
          🗓️ Plano das próximas {weeks.length} semanas · associar vídeos a datas
        </summary>
        <div className="space-y-4 p-4">
          <div className="rounded-xl border border-escola-border bg-escola-bg p-3 text-xs text-escola-creme-50">
            <p>
              Ritmo:{" "}
              <span className="text-escola-creme">Seg · Qua (shorts 30s)</span> +{" "}
              <span className="text-escola-creme">Sex (longo 60 min)</span>
              . Publicação às <span className="text-escola-creme">10:00</span>.
            </p>
            <p className="mt-1">
              Para cada slot, escolhe um vídeo já gerado. Fica associado e visível em qualquer dispositivo — ao chegar a hora basta copiar título/descrição e publicar.
            </p>
          </div>
          <div className="space-y-2">
            {weeks.map((w) => (
              <div
                key={w.start.toISOString()}
                className="overflow-hidden rounded-xl border border-escola-border bg-escola-bg"
              >
                <div className="border-b border-escola-border px-4 py-2 text-sm text-escola-creme">
                  {w.weekLabel}
                </div>
                <div className="divide-y divide-escola-border">
                  {w.slots.map((s: AgSlot) => (
                    <PlanoSlot
                      key={s.slotId}
                      slot={s}
                      entry={schedule[s.slotId] || null}
                      available={s.type === "longo" ? longVideos : shortVideos}
                      scheduleLoaded={scheduleLoaded}
                      saving={savingSlot === s.slotId}
                      onChange={(entry) => setSlotEntry(s.slotId, entry)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  );
}

// ── Slot individual do plano ────────────────────────────────────────────────

function PlanoSlot({
  slot,
  entry,
  available,
  scheduleLoaded,
  saving,
  onChange,
}: {
  slot: AgSlot;
  entry: ScheduleEntry | null;
  available: AvailableVideo[];
  scheduleLoaded: boolean;
  saving: boolean;
  onChange: (entry: ScheduleEntry | null) => void;
}) {
  const [copiedAll, setCopiedAll] = useState(false);
  const associated = available.find((v) => v.name === entry?.videoName) || null;

  const dateLabel = new Date(slot.dateISO).toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const title =
    (associated?.seo?.["postTitle"] as string | undefined) ||
    (associated?.seo?.["youtubeTitle"] as string | undefined) ||
    (associated?.seo?.["title"] as string | undefined) ||
    associated?.name ||
    "";
  const description =
    (associated?.seo?.["description"] as string | undefined) ||
    (associated?.seo?.["youtubeDescription"] as string | undefined) ||
    "";
  const hashtags = Array.isArray(associated?.seo?.["hashtags"])
    ? (associated!.seo!["hashtags"] as string[]).join(" ")
    : "";

  const associate = (name: string) => {
    if (!name) {
      onChange(null);
      return;
    }
    const v = available.find((vv) => vv.name === name);
    if (!v) return;
    onChange({
      videoName: v.name,
      videoUrl: v.url,
      publishedAt: entry?.publishedAt ?? null,
      publishedUrl: entry?.publishedUrl ?? null,
    });
  };

  const markPublished = () => {
    if (!entry) return;
    onChange({
      ...entry,
      publishedAt: entry.publishedAt ? null : new Date().toISOString(),
    });
  };

  const copyAll = () => {
    const text = `TÍTULO:\n${title}\n\nDESCRIÇÃO:\n${description}${hashtags ? `\n\n${hashtags}` : ""}\n\nVÍDEO:\n${entry?.videoUrl || ""}`;
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 1800);
      },
      () => {},
    );
  };

  const isPast = new Date(slot.dateISO).getTime() < Date.now();
  const published = !!entry?.publishedAt;

  // Badge topo-direita: indica estado do slot.
  let badge: { text: string; cls: string };
  if (published) badge = { text: "✓ Publicado", cls: "bg-green-900/40 text-green-300" };
  else if (entry) badge = { text: "📋 Pronto", cls: "bg-escola-dourado/20 text-escola-dourado" };
  else if (isPast) badge = { text: "⚠ Perdeu", cls: "bg-red-900/30 text-red-300" };
  else badge = { text: "— Em falta", cls: "bg-escola-border text-escola-creme-50" };

  return (
    <div className="px-4 py-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-escola-creme">{slot.label}</p>
          <p className="text-[11px] text-escola-creme-50">{dateLabel}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      {/* Picker: escolhe qual vídeo vai aqui. */}
      <div className="mb-2 flex items-center gap-2">
        <select
          value={entry?.videoName || ""}
          onChange={(e) => associate(e.target.value)}
          disabled={!scheduleLoaded || saving}
          className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-xs text-escola-creme disabled:opacity-50"
        >
          <option value="">
            {available.length === 0
              ? "(nenhum vídeo disponível — gera em Produção)"
              : "— Escolher vídeo —"}
          </option>
          {available.map((v) => (
            <option key={v.name} value={v.name}>
              {(v.seo?.["postTitle"] as string | undefined) ||
                (v.seo?.["youtubeTitle"] as string | undefined) ||
                v.name}
            </option>
          ))}
        </select>
        {saving && <span className="shrink-0 text-[10px] text-escola-creme-50">A guardar...</span>}
      </div>

      {/* Vídeo associado: player + publicação em 3 passos (igual ao funil). */}
      {associated && entry && (
        <div className="space-y-3">
          <div className="rounded border border-escola-border/60 bg-escola-bg p-2 text-xs">
            {associated.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={associated.thumbnailUrl}
                alt={title}
                className={`w-full rounded ${slot.type === "longo" ? "aspect-video" : "aspect-[9/16] max-w-[180px]"} object-cover`}
              />
            ) : null}
            {title && <p className="mt-2 font-medium text-escola-creme">{title}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={markPublished}
                className={`rounded border px-3 py-2 text-xs ${
                  published
                    ? "border-green-700 bg-green-950/40 text-green-300"
                    : "border-escola-border text-escola-creme hover:bg-escola-border/20"
                }`}
              >
                {published ? "✓ Publicado (clica para reverter)" : "Marcar como publicado"}
              </button>
              <button
                onClick={() => {
                  if (!confirm("Desassociar este vídeo do slot?")) return;
                  onChange(null);
                }}
                className="rounded border border-escola-border px-3 py-2 text-xs text-red-300 hover:bg-red-950/30"
              >
                Desassociar
              </button>
            </div>
            {published && entry.publishedAt && (
              <p className="mt-2 text-[10px] text-green-300">
                Marcado publicado em{" "}
                {new Date(entry.publishedAt).toLocaleString("pt-PT", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          {/* 3 passos manuais até configurarmos o OAuth do canal AG. */}
          {!published && (
            <YouTubePublishSteps
              videoUrl={entry.videoUrl}
              title={title}
              description={description + (hashtags ? `\n\n${hashtags}` : "")}
              tags={Array.isArray(associated?.seo?.["hashtags"])
                ? (associated!.seo!["hashtags"] as string[]).map((h) => h.replace(/^#/, ""))
                : []}
              thumbnailUrl={associated.thumbnailUrl}
              channel="ag"
              channelLabel="canal Ancient Ground · 3 passos"
              kind={slot.type === "longo" ? "long" : "short"}
            />
          )}
        </div>
      )}

      {/* Copiar TUDO one-shot (atalho retrocompat). */}
      {associated && entry && (
        <button
          onClick={copyAll}
          className="mt-2 w-full rounded bg-escola-dourado/20 px-3 py-1.5 text-xs font-semibold text-escola-dourado hover:bg-escola-dourado/30"
        >
          {copiedAll ? "✓ Copiado atalho!" : "📋 Atalho: copiar título + descrição + URL num só texto"}
        </button>
      )}

      {!associated && isPast && !entry && (
        <p className="text-[11px] text-red-300">Este slot ficou por publicar.</p>
      )}
      {!associated && !isPast && !entry && (
        <p className="text-[11px] text-escola-creme-50">
          Sem vídeo associado. Escolhe um ou <a href="/admin/producao/ancient-ground" className="text-escola-dourado underline">gera novo em Produção</a>.
        </p>
      )}
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
