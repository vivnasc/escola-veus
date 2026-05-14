"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Motion {
  name: string;
  url: string;
  sizeBytes: number;
  createdAt: string | null;
}

interface Props {
  selectedUrl: string;
  onSelect: (url: string) => void;
}

/**
 * Library de motions noturnos para "Hoje, em Mim".
 * Espelha o componente do VC Sabia mas aponta para
 * /api/admin/hoje-em-mim/motions (bucket separado).
 */
export function NightMotionLibrary({ selectedUrl, onSelect }: Props) {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/hoje-em-mim/motions");
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro || `Erro ${res.status}`);
      } else {
        setMotions(json.motions || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => /\.(mp4|webm|mov)$/i.test(f.name));
    if (list.length === 0) {
      setError("Sem ficheiros MP4/WebM/MOV.");
      return;
    }
    setUploading({ done: 0, total: list.length });
    setError(null);

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/admin/hoje-em-mim/motions/upload", {
          method: "POST",
          body: form,
        });
        const json = await res.json();
        if (!res.ok) {
          setError(`${file.name}: ${json.erro || `HTTP ${res.status}`}`);
          break;
        }
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error ? e.message : String(e)}`);
        break;
      }
      setUploading({ done: i + 1, total: list.length });
    }

    setUploading(null);
    await load();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg text-escola-dourado">
            Motion library · noite
          </h2>
          <p className="text-xs text-escola-creme-50">
            Clipes noturnos (água ao luar, brisa, lume baixo, sombras, etc.). Clica para usar.
            Arrasta MP4s para a zona em baixo para adicionar.{" "}
            {motions.length > 0 && `(${motions.length} no library)`}
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-escola-dourado/60 bg-escola-dourado/10 px-3 py-1.5 text-xs text-escola-dourado hover:bg-escola-dourado/20"
        >
          Upload ficheiros
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-lg border-2 border-dashed border-escola-border bg-escola-card/40 p-4 text-center text-xs text-escola-creme-50"
      >
        Arrasta vídeos MP4/WebM/MOV para aqui
      </div>

      {error && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {uploading && (
        <div className="rounded border border-escola-dourado/40 bg-escola-dourado/10 p-3 text-xs text-escola-dourado">
          A carregar {uploading.done} / {uploading.total}…
        </div>
      )}

      {loading ? (
        <div className="text-xs text-escola-creme-50">A carregar library…</div>
      ) : motions.length === 0 ? (
        <div className="rounded border border-escola-border bg-escola-card/40 p-6 text-center text-xs text-escola-creme-50">
          Ainda não há motions noturnos. Faz upload dos teus clips para começar.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {motions.map((m) => (
            <button
              key={m.url}
              onClick={() => onSelect(m.url)}
              className={`group relative overflow-hidden rounded-md border transition-all ${
                selectedUrl === m.url
                  ? "border-escola-dourado ring-2 ring-escola-dourado/40"
                  : "border-escola-border hover:border-escola-dourado/60"
              }`}
              title={m.name}
            >
              <video
                src={m.url}
                muted
                playsInline
                preload="metadata"
                className="aspect-[9/16] w-full bg-black object-cover"
                onMouseEnter={(e) => {
                  const v = e.currentTarget;
                  v.currentTime = 0;
                  v.play().catch(() => {});
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-left">
                <div className="truncate text-[10px] text-escola-creme">
                  {m.name}
                </div>
                <div className="text-[9px] text-escola-creme-50">
                  {(m.sizeBytes / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
