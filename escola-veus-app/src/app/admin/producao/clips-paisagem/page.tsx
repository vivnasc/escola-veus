"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ClipUploader,
  type UploadedClip,
  CLIP_THEMES,
  CLIP_THEME_LABELS,
  parseClipTheme,
  type ClipTheme,
} from "@/components/admin/ClipUploader";

// Clips de paisagem 9:16 — matéria-prima para shorts Loranne e AG (ambos os
// pipelines consomem da mesma pool; o que muda é a música+texto que cada
// pólo acrescenta). Upload único feito aqui.
//
// Nota: clips da Escola (aulas, funil) vivem noutro sítio (course-assets) e
// não são afectados por esta página.

type Clip = {
  name: string;
  url: string;
  thumbUrl: string;
  createdAt: string | null;
  theme: ClipTheme;
};

export default function ClipsPaisagemPage() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [themeFilter, setThemeFilter] = useState<ClipTheme | "all">("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/shorts/list-clips-ag", { cache: "no-store" });
      const d = await r.json();
      const rows: Clip[] = (d.clips || []).map((c: Omit<Clip, "theme">) => ({
        ...c,
        theme: parseClipTheme(c.name),
      }));
      setClips(rows);
    } catch {
      setClips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUploaded = (ups: UploadedClip[]) => {
    // Optimistic: prepend na grelha. A próxima vez que load() correr, virá
    // via list-clips-ag oficial.
    const rows: Clip[] = ups.map((u) => ({
      name: u.name.replace(/\.mp4$/i, ""),
      url: u.clipUrl,
      thumbUrl: u.thumbUrl,
      createdAt: new Date().toISOString(),
      theme: u.theme,
    }));
    setClips((prev) => [...rows, ...prev]);
  };

  const removeClip = async (clip: Clip) => {
    if (!confirm(`Remover clip "${clip.name}"?`)) return;
    setDeleting(clip.name);
    try {
      const r = await fetch("/api/admin/shorts/upload-clips", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clip.name }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.erro || `HTTP ${r.status}`);
      }
      setClips((prev) => prev.filter((c) => c.name !== clip.name));
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(null);
    }
  };

  const filtered = clips.filter((c) => {
    if (themeFilter !== "all" && c.theme !== themeFilter) return false;
    if (query.trim() && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const themeCounts: Record<string, number> = {};
  for (const c of clips) themeCounts[c.theme] = (themeCounts[c.theme] || 0) + 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg text-escola-creme">
            Clips de paisagem · 9:16
          </h2>
          <p className="text-xs text-escola-creme-50">
            Matéria-prima para shorts Loranne e Ancient Ground. Faz upload dos
            clips que gerares por fora — cada pipeline (Loranne, AG) vai buscar
            daqui e acrescenta música e texto próprios.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/producao/shorts"
            className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:border-escola-coral"
          >
            → Shorts Loranne
          </Link>
          <Link
            href="/admin/producao/ancient-ground/shorts"
            className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:border-escola-coral"
          >
            → Shorts AG
          </Link>
        </div>
      </div>

      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          Upload · MP4 9:16
        </h3>
        <ClipUploader onUploaded={handleUploaded} />
      </section>

      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            {clips.length} clips
          </h3>
          <button
            onClick={load}
            disabled={loading}
            className="text-[10px] text-escola-creme-50 hover:text-escola-creme disabled:opacity-30"
          >
            {loading ? "..." : "↻ actualizar"}
          </button>
        </div>
        <div className="mb-3 flex flex-wrap gap-1">
          <button
            onClick={() => setThemeFilter("all")}
            className={`rounded border px-2 py-0.5 text-[10px] ${
              themeFilter === "all"
                ? "border-escola-coral bg-escola-coral/20 text-escola-coral"
                : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            Todos ({clips.length})
          </button>
          {CLIP_THEMES.map((t) => {
            const n = themeCounts[t] || 0;
            if (n === 0) return null;
            const active = themeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setThemeFilter(t)}
                className={`rounded border px-2 py-0.5 text-[10px] ${
                  active
                    ? "border-escola-coral bg-escola-coral/20 text-escola-coral"
                    : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
                }`}
              >
                {CLIP_THEME_LABELS[t]} ({n})
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisa livre no nome do ficheiro"
          className="mb-3 w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
        />

        {loading ? (
          <p className="text-xs text-escola-creme-50">A carregar...</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-escola-creme-50">
            {query || themeFilter !== "all"
              ? "Nenhum clip encontrado."
              : "Ainda não há clips. Faz upload acima."}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {filtered.map((c) => (
              <div
                key={c.url}
                className="group relative aspect-[9/16] overflow-hidden rounded border border-escola-border"
              >
                <video
                  src={c.url}
                  poster={c.thumbUrl}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  onMouseEnter={(e) => {
                    const v = e.currentTarget;
                    v.play().catch(() => {});
                  }}
                  onMouseLeave={(e) => {
                    const v = e.currentTarget;
                    v.pause();
                    v.currentTime = 0;
                  }}
                />
                <span className="absolute left-1 top-1 rounded bg-black/70 px-1 text-[9px] font-semibold text-escola-dourado">
                  {CLIP_THEME_LABELS[c.theme]}
                </span>
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/70 px-1 text-[9px] text-white">
                  {c.name}
                </span>
                <button
                  onClick={() => removeClip(c)}
                  disabled={deleting === c.name}
                  title="Remover clip"
                  className="absolute right-1 top-1 rounded bg-black/80 px-1.5 text-[10px] text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-100 disabled:opacity-30"
                >
                  {deleting === c.name ? "..." : "×"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
