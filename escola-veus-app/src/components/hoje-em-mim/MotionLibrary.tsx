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

type UploadFeedback =
  | { kind: "uploading"; done: number; total: number; currentName: string }
  | { kind: "ok"; uploaded: number; total: number }
  | { kind: "error"; message: string }
  | null;

/**
 * Library de motions noturnos para "Hoje, em Mim".
 * Espelha o componente do VC Sabia mas aponta para
 * /api/admin/hoje-em-mim/motions (bucket separado).
 *
 * Diferenças desta versão para suportar iPad e ficheiros grandes:
 *  - Limite de 150 MB (vídeos do iPhone podem chegar a 100 MB+)
 *  - Estado de upload mostra nome do ficheiro corrente e bytes
 *  - Após upload mostra "OK · X ficheiros carregados" verde
 *  - Botão "Recarregar library" sempre visível, caso a listagem demore
 *  - Hint sobre comprimir vídeo do iPad/iPhone antes de subir
 */
export function NightMotionLibrary({ selectedUrl, onSelect }: Props) {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<UploadFeedback>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hoje-em-mim/motions");
      const json = await res.json();
      if (!res.ok) {
        setFeedback({
          kind: "error",
          message: json.erro || `Erro ao listar (${res.status})`,
        });
      } else {
        setMotions(json.motions || []);
      }
    } catch (e) {
      setFeedback({
        kind: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) =>
      /\.(mp4|webm|mov|m4v)$/i.test(f.name)
    );
    if (list.length === 0) {
      setFeedback({
        kind: "error",
        message:
          "Sem ficheiros MP4/WebM/MOV/M4V. No iPad: Files app → seleciona vídeo → garante que tem extensão.",
      });
      return;
    }

    let okCount = 0;
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      setFeedback({
        kind: "uploading",
        done: i,
        total: list.length,
        currentName: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`,
      });

      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/admin/hoje-em-mim/motions/upload", {
          method: "POST",
          body: form,
        });
        const json = await res.json();
        if (!res.ok) {
          setFeedback({
            kind: "error",
            message: `${file.name}: ${json.erro || `HTTP ${res.status}`}`,
          });
          // recarrega lista para mostrar os que já passaram
          await load();
          return;
        }
        okCount++;
      } catch (e) {
        setFeedback({
          kind: "error",
          message: `${file.name}: ${
            e instanceof Error ? e.message : String(e)
          }`,
        });
        await load();
        return;
      }
    }

    setFeedback({ kind: "ok", uploaded: okCount, total: list.length });
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
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-serif text-lg text-escola-dourado">
            Motion library · noite
          </h2>
          <p className="text-xs text-escola-creme-50">
            Clipes noturnos (água ao luar, brisa, lume baixo, sombras…). Toca
            num para o usares. No iPad usa o botão. No iPhone, comprime o vídeo
            em Photos → Editar → Exportar antes de subir, para reduzir do
            HEVC pesado.{" "}
            {motions.length > 0 && (
              <strong className="text-escola-creme">{motions.length} no library.</strong>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => load()}
            className="rounded-md border border-escola-border bg-escola-card px-3 py-1.5 text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            Recarregar
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-escola-dourado/60 bg-escola-dourado/10 px-3 py-1.5 text-xs text-escola-dourado hover:bg-escola-dourado/20"
          >
            Upload ficheiros
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
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
        Arrasta MP4/MOV para aqui (computador). No iPad usa o botão "Upload
        ficheiros" em cima.
      </div>

      {feedback?.kind === "uploading" && (
        <div className="rounded border border-escola-dourado/40 bg-escola-dourado/10 p-3 text-xs text-escola-dourado space-y-1">
          <div>
            A carregar {feedback.done + 1} / {feedback.total}…
          </div>
          <div className="text-[11px] text-escola-creme-50">
            {feedback.currentName}
          </div>
        </div>
      )}

      {feedback?.kind === "ok" && (
        <div className="rounded border border-emerald-700/40 bg-emerald-900/20 p-3 text-xs text-emerald-300">
          OK. {feedback.uploaded} de {feedback.total} ficheiro
          {feedback.total === 1 ? "" : "s"} carregado
          {feedback.uploaded === 1 ? "" : "s"} para o library.
        </div>
      )}

      {feedback?.kind === "error" && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-3 text-xs text-red-300 space-y-2">
          <div className="font-medium">Erro no upload.</div>
          <div className="break-words">{feedback.message}</div>
          <div className="text-[11px] text-red-200/70">
            Se o vídeo for grande, abre-o em Photos → Editar → reduz qualidade
            ou duração, e exporta. Aceita-se até 150 MB por ficheiro.
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-xs text-escola-creme-50">A carregar library…</div>
      ) : motions.length === 0 ? (
        <div className="rounded border border-escola-border bg-escola-card/40 p-6 text-center text-xs text-escola-creme-50">
          Ainda não há motions noturnos. Faz upload do primeiro clipe para
          começar (carrega o botão em cima à direita).
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
