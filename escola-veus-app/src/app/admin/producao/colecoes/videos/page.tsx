"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Video = { file: string; url: string; sizeBytes: number };
type Job = {
  jobId: string;
  status: string;
  videos: Video[];
  completedAt?: string;
  musicUrl?: string | null;
  musicVolume?: number;
};

export default function VideosPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/colecoes/videos/list", { cache: "no-store" });
        if (r.ok) {
          const data = await r.json();
          setJobs(data.items || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // achata: cada vídeo passa a ser uma entrada (mesmo job pode ter vários dias)
  const all = jobs.flatMap((j) =>
    j.videos.map((v) => ({
      ...v,
      jobId: j.jobId,
      completedAt: j.completedAt,
    }))
  );

  const filtered = filter
    ? all.filter(
        (v) =>
          v.jobId.toLowerCase().includes(filter.toLowerCase()) ||
          v.file.toLowerCase().includes(filter.toLowerCase())
      )
    : all;

  // Agrupar por jobId (= colecção + timestamp)
  const byJob = new Map<string, typeof filtered>();
  for (const v of filtered) {
    if (!byJob.has(v.jobId)) byJob.set(v.jobId, []);
    byJob.get(v.jobId)!.push(v);
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-3 text-xs text-escola-creme-50">
        <Link href="/admin/producao/colecoes" className="hover:text-escola-dourado">
          ← carrosséis
        </Link>
        <span>/ vídeos prontos</span>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 font-serif text-2xl font-semibold text-escola-creme">
          Vídeos prontos (MP4)
        </h2>
        <p className="text-sm text-escola-creme-50">
          Todos os carrosséis em vídeo gerados pela Action — agregados do Supabase, qualquer
          browser. Reproduz na página, descarrega ou copia o link directo.
        </p>
        <input
          type="text"
          placeholder="filtrar por nome / job (ex: 'maternidade', 'estacao')"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mt-3 w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme placeholder:text-escola-creme-50"
        />
      </div>

      {loading ? (
        <p className="text-sm text-escola-creme-50">A carregar do Supabase…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-escola-border p-8 text-center">
          <p className="text-sm text-escola-creme-50">
            Ainda não há vídeos. Vai a uma colecção, gera um e ele aparece aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(byJob.entries()).map(([jobId, vids]) => {
            // Tenta extrair nome amigável do jobId (slug-timestamp)
            const slug = jobId.replace(/-\d+$/, "");
            return (
              <section key={jobId}>
                <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-escola-border pb-2 text-sm">
                  <div>
                    <span className="text-escola-creme">{slug}</span>{" "}
                    <code className="text-[10px] text-escola-creme-50">{jobId}</code>
                  </div>
                  {vids[0].completedAt && (
                    <span className="text-[10px] text-escola-creme-50">
                      {new Date(vids[0].completedAt).toLocaleString("pt-PT")}
                    </span>
                  )}
                </header>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {vids.map((v) => (
                    <div
                      key={v.file}
                      className="overflow-hidden rounded border border-escola-border bg-escola-card"
                    >
                      <video
                        src={v.url}
                        controls
                        playsInline
                        preload="metadata"
                        className="aspect-[9/16] w-full bg-black"
                      />
                      <div className="flex items-center justify-between gap-1 p-2 text-[10px]">
                        <span className="text-escola-creme">
                          {v.file.replace(".mp4", "")}
                        </span>
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="rounded bg-escola-bg px-2 py-0.5 text-escola-creme-50 hover:text-escola-dourado"
                        >
                          ↓ {(v.sizeBytes / 1024 / 1024).toFixed(1)}MB
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
