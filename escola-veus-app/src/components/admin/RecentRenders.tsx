"use client";

// RecentRenders: secção sempre visível com os últimos vídeos gerados,
// lidos directamente do Supabase (não depende de localStorage). Serve de
// "histórico" entre dispositivos — a Vivianne troca de PC ou telemóvel e
// continua a ver tudo, sem ter de ir ao Supabase à mão.
//
// Para cada vídeo mostramos: preview, dados (duração, tamanho, data),
// botões mobile-first para partilhar / copiar título / copiar descrição,
// e link para o MP4. Usa o mesmo ShareVideoActions que as páginas já usam
// após render fresco.

import { useEffect, useState } from "react";
import { ShareVideoActions } from "./ShareVideoActions";

type VideoKind = "long" | "short";

type Seo = {
  postTitle?: string;
  youtubeTitle?: string;
  description?: string;
  youtubeDescription?: string;
  hashtags?: string[];
  durationSec?: number | null;
  sizeBytes?: number | null;
  width?: number | null;
  height?: number | null;
} & Record<string, unknown>;

type VideoItem = {
  name: string;
  url: string;
  thumbnailUrl?: string | null;
  seo?: Seo | null;
  createdAt?: string | null;
};

function formatDuration(totalSec: number): string {
  const s = Math.round(totalSec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentRenders({
  kind,
  title = "📂 Últimos vídeos gerados",
  subtitle,
  reloadKey,
}: {
  kind: VideoKind;
  title?: string;
  subtitle?: string;
  // Quando este valor muda, força refetch do Supabase. Usar por exemplo
  // para recarregar a lista automaticamente quando um novo render termina.
  reloadKey?: number | string;
}) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [openItem, setOpenItem] = useState<string | null>(null);

  const endpoint =
    kind === "long"
      ? "/api/admin/ancient-ground/list-long-videos"
      : "/api/admin/ancient-ground/list-short-videos";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(endpoint, { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro || `HTTP ${r.status}`);
      setVideos(d.videos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, reloadKey]);

  return (
    <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            {title}
          </h3>
          <p className="mt-0.5 text-[11px] text-escola-creme-50">
            {subtitle ||
              "Directamente do Supabase — disponível em qualquer PC ou telemóvel."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="text-xs text-escola-creme-50 hover:text-escola-creme disabled:opacity-30"
          >
            {loading ? "A carregar..." : "🔄 Refrescar"}
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            {expanded ? "Esconder" : "Mostrar"}
          </button>
        </div>
      </div>

      {!expanded ? null : loading && videos.length === 0 ? (
        <p className="text-xs text-escola-creme-50">A carregar do Supabase...</p>
      ) : error ? (
        <p className="text-xs text-red-300">Erro: {error}</p>
      ) : videos.length === 0 ? (
        <p className="text-xs text-escola-creme-50">
          Ainda não há vídeos gerados. Gera um em baixo e aparecerá aqui automaticamente.
        </p>
      ) : (
        <div
          className={
            kind === "short"
              ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
              : "space-y-3"
          }
        >
          {videos.map((v: VideoItem) => (
            <VideoCard
              key={v.url}
              video={v}
              kind={kind}
              open={openItem === v.url}
              onToggle={() => { setOpenItem(openItem === v.url ? null : v.url); }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function VideoCard({
  video,
  kind,
  open,
  onToggle,
}: {
  video: VideoItem;
  kind: VideoKind;
  open: boolean;
  onToggle: () => void;
}) {
  const title =
    video.seo?.postTitle ||
    video.seo?.youtubeTitle ||
    (video.seo?.title as string | undefined) ||
    video.name;
  const duration = video.seo?.durationSec ? formatDuration(video.seo.durationSec) : null;
  const size = video.seo?.sizeBytes ? formatBytes(video.seo.sizeBytes) : null;
  const date = formatDate(video.createdAt);

  // Layout vertical (9:16) para shorts, horizontal (16:9) para longos.
  const aspectClass = kind === "short" ? "aspect-[9/16]" : "aspect-video";

  return (
    <div className="overflow-hidden rounded-lg border border-escola-border bg-escola-bg">
      <button
        onClick={onToggle}
        className={`relative block w-full ${aspectClass} bg-black`}
        title="Clica para ver / esconder o player"
      >
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <video
            src={video.url}
            className="h-full w-full object-cover"
            muted
            preload="metadata"
          />
        )}
        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
          {duration || (kind === "short" ? "30s" : "")}
        </span>
        <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
          {open ? "▼" : "▶"}
        </span>
      </button>

      <div className="space-y-2 p-3 text-xs">
        <p className="line-clamp-2 font-medium text-escola-creme" title={title}>
          {title}
        </p>
        <p className="flex flex-wrap gap-x-2 text-[10px] text-escola-creme-50">
          {date && <span>{date}</span>}
          {size && <span>{size}</span>}
        </p>

        {/* Botões SEMPRE visíveis: é o ponto de toda a secção — copiar SEO
            e partilhar não deve exigir clique extra. O player em si fica
            atrás do thumbnail (clicar expande, mas já não é necessário). */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-escola-creme-50">
            Para publicar no YouTube:
          </p>
          <QuickCopyButtons video={video} />
        </div>

        <div className="space-y-2 border-t border-escola-border/50 pt-2">
          <p className="text-[10px] uppercase tracking-wider text-escola-creme-50">
            Partilhar / baixar:
          </p>
          <ShareVideoActions
            videoUrl={video.url}
            title={title}
            text={
              (video.seo?.description as string | undefined) ||
              (video.seo?.youtubeDescription as string | undefined) ||
              ""
            }
            mode={kind}
          />
        </div>

        {open && (
          <div className="border-t border-escola-border/50 pt-2">
            <video src={video.url} controls className="w-full rounded" />
          </div>
        )}
      </div>
    </div>
  );
}

function QuickCopyButtons({ video }: { video: VideoItem }) {
  const title =
    video.seo?.postTitle ||
    video.seo?.youtubeTitle ||
    (video.seo?.title as string | undefined) ||
    video.name;
  const description =
    (video.seo?.description as string | undefined) ||
    (video.seo?.youtubeDescription as string | undefined) ||
    "";
  const hashtags =
    (Array.isArray(video.seo?.hashtags) && (video.seo!.hashtags as string[]).join(" ")) || "";
  const descPlusTags = [description, hashtags].filter(Boolean).join("\n\n");

  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(label);
        setTimeout(() => setCopied(null), 1800);
      },
      () => setCopied(null),
    );
  };

  // Feedback visível: o nome do botão muda para "✓ Copiado!" durante 1.8s.
  const btn = (label: string) => (copied === label ? "✓ Copiado!" : label);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => copy(title, "title")}
        disabled={!title}
        className="flex-1 min-w-[100px] rounded border border-escola-border bg-escola-bg px-3 py-2 text-xs text-escola-creme hover:bg-escola-border/30 disabled:opacity-30"
      >
        {copied === "title" ? "✓ Copiado!" : "📋 Título"}
      </button>
      <button
        onClick={() => copy(descPlusTags, "desc")}
        disabled={!descPlusTags}
        className="flex-1 min-w-[140px] rounded border border-escola-border bg-escola-bg px-3 py-2 text-xs text-escola-creme hover:bg-escola-border/30 disabled:opacity-30"
      >
        {copied === "desc" ? "✓ Copiado!" : "📋 Descrição"}
      </button>
      <button
        onClick={() =>
          copy(
            `TÍTULO:\n${title}\n\nDESCRIÇÃO:\n${descPlusTags}\n\nVÍDEO:\n${video.url}`,
            "all",
          )
        }
        className="flex-1 min-w-[100px] rounded bg-escola-dourado px-3 py-2 text-xs font-semibold text-escola-bg hover:bg-escola-dourado/90"
      >
        {copied === "all" ? "✓ Copiado!" : "📋 TUDO"}
      </button>
    </div>
  );
}
