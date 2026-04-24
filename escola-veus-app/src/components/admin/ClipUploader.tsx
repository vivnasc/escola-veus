"use client";

import { useRef, useState } from "react";
import {
  CATEGORIAS_PAISAGEM,
  CATEGORIA_LABELS,
  parseCategoriaPaisagem,
  type CategoriaPaisagem,
} from "@/lib/paisagem-categorias";

// Upload de clips verticais 9:16 (paisagem/natureza) gerados por fora para a
// pool partilhada Loranne+AG (página /admin/producao/clips-paisagem). Fluxo:
//  1. Browser pede signed upload URLs ao servidor (/api/admin/shorts/upload-clips)
//  2. Extrai um frame PNG de cada vídeo via <video>+canvas (serve de thumbnail
//     e de imageUrl para o slot Loranne — quem precisa de uma imagem para a
//     geração de YouTube thumbnail).
//  3. PUT directo ao Supabase (contorna limite 4.5MB do Vercel).
//
// A categoria (mar, rio, savana…) vira prefixo do filename com separador "_"
// (ex: "savana_leao-1734-0.mp4") para o picker de cada pólo filtrar.

// Re-export para não partir imports de outros ficheiros (Loranne e AG pages
// importavam ClipUploader para esta API). Migração incremental.
export const CLIP_THEMES = CATEGORIAS_PAISAGEM;
export const CLIP_THEME_LABELS = CATEGORIA_LABELS;
export type ClipTheme = CategoriaPaisagem;
export const parseClipTheme = parseCategoriaPaisagem;

export type UploadedClip = {
  name: string;      // nome do ficheiro em clips/ sem pasta (ex: "mar_onda-17234-0.mp4")
  clipUrl: string;   // URL pública do MP4
  thumbUrl: string;  // URL pública do PNG (primeiro frame)
  width: number;
  height: number;
  durationSec: number;
  theme: ClipTheme;
};

type FileStatus = {
  id: string;
  filename: string;
  stage: "queued" | "thumb" | "signing" | "uploading" | "done" | "error";
  progress: number; // 0-100
  error?: string;
  result?: UploadedClip;
};

type Props = {
  onUploaded: (clips: UploadedClip[]) => void;
  className?: string;
  compact?: boolean; // versão mais pequena (para AG section já densa)
};

const MAX_BYTES = 150 * 1024 * 1024; // 150MB — bucket limite é 200MB, damos margem
const MIN_VERTICAL_RATIO = 0.45; // aceita 9:16 (0.5625) e próximos
const MAX_VERTICAL_RATIO = 0.65;

async function extractFirstFramePng(file: File): Promise<{ blob: Blob; width: number; height: number; durationSec: number }> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    await new Promise<void>((resolve, reject) => {
      const onErr = () => reject(new Error("Vídeo não legível."));
      video.addEventListener("loadeddata", () => resolve(), { once: true });
      video.addEventListener("error", onErr, { once: true });
    });

    // Procura ~0.2s para não apanhar black frame inicial
    video.currentTime = Math.min(0.2, (video.duration || 1) / 4);
    await new Promise<void>((resolve) => {
      video.addEventListener("seeked", () => resolve(), { once: true });
    });

    const w = video.videoWidth;
    const h = video.videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D não disponível.");
    ctx.drawImage(video, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
    if (!blob) throw new Error("Falha a gerar PNG.");
    return { blob, width: w, height: h, durationSec: video.duration || 0 };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function putToSignedUrl(url: string, body: Blob, contentType: string, onProgress?: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload falhou: HTTP ${xhr.status} ${xhr.responseText.slice(0, 200)}`));
    };
    xhr.onerror = () => reject(new Error("Upload falhou: erro de rede."));
    xhr.send(body);
  });
}

export function ClipUploader({ onUploaded, className, compact }: Props) {
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState<ClipTheme | "">("");
  const inputRef = useRef<HTMLInputElement>(null);

  const updateStatus = (id: string, patch: Partial<FileStatus>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    if (!theme) {
      alert("Escolhe um tema antes de fazer upload.");
      return;
    }
    const chosenTheme: ClipTheme = theme;

    const initial: FileStatus[] = Array.from(list).map((f) => ({
      id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 8)}`,
      filename: f.name,
      stage: "queued",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...initial]);
    setBusy(true);

    const fileArray = Array.from(list);
    const uploaded: UploadedClip[] = [];

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const status = initial[i];

      if (!file.type.startsWith("video/") && !/\.(mp4|mov|webm|m4v)$/i.test(file.name)) {
        updateStatus(status.id, { stage: "error", error: "Não é vídeo." });
        continue;
      }
      if (file.size > MAX_BYTES) {
        updateStatus(status.id, { stage: "error", error: `Maior que ${Math.round(MAX_BYTES / 1024 / 1024)}MB.` });
        continue;
      }

      try {
        // 1. Thumb via canvas
        updateStatus(status.id, { stage: "thumb", progress: 5 });
        const { blob: thumbBlob, width, height, durationSec } = await extractFirstFramePng(file);

        const ratio = width / height;
        if (ratio < MIN_VERTICAL_RATIO || ratio > MAX_VERTICAL_RATIO) {
          updateStatus(status.id, {
            stage: "error",
            error: `Aspect ratio ${width}×${height} não é 9:16.`,
          });
          continue;
        }

        // 2. Pede signed URLs
        updateStatus(status.id, { stage: "signing", progress: 10 });
        const signRes = await fetch("/api/admin/shorts/upload-clips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: [{ name: file.name, theme: chosenTheme }] }),
        });
        const signData = await signRes.json();
        if (!signRes.ok || !signData.items?.[0]) {
          throw new Error(signData.erro || `Sign HTTP ${signRes.status}`);
        }
        const item = signData.items[0];

        // 3. PUT clip + thumb em paralelo
        updateStatus(status.id, { stage: "uploading", progress: 15 });
        await Promise.all([
          putToSignedUrl(item.clipUploadUrl, file, file.type || "video/mp4", (pct) =>
            updateStatus(status.id, { progress: 15 + Math.round(pct * 0.8) }),
          ),
          putToSignedUrl(item.thumbUploadUrl, thumbBlob, "image/png"),
        ]);

        const result: UploadedClip = {
          name: item.clipPath.replace(/^clips\//, ""),
          clipUrl: item.clipUrl,
          thumbUrl: item.thumbUrl,
          width,
          height,
          durationSec,
          theme: chosenTheme,
        };
        uploaded.push(result);
        updateStatus(status.id, { stage: "done", progress: 100, result });
      } catch (err) {
        updateStatus(status.id, {
          stage: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (uploaded.length > 0) onUploaded(uploaded);
    setBusy(false);
  };

  const clearDone = () => setFiles((prev) => prev.filter((f) => f.stage !== "done"));

  return (
    <div
      className={`rounded border border-dashed border-escola-border bg-escola-bg/40 p-3 ${className || ""}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as ClipTheme | "")}
          disabled={busy}
          className="rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-xs text-escola-creme"
        >
          <option value="">— tema —</option>
          {CLIP_THEMES.map((t) => (
            <option key={t} value={t}>{CLIP_THEME_LABELS[t]}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (!theme) {
              alert("Escolhe um tema primeiro.");
              return;
            }
            inputRef.current?.click();
          }}
          disabled={busy || !theme}
          className="rounded bg-escola-coral px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30"
        >
          {busy ? "A carregar..." : compact ? "+ Upload" : "+ Escolher MP4s"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
        {!compact && (
          <span className="text-[11px] text-escola-creme-50">
            9:16 · máx 150MB · todos os ficheiros escolhidos ganham o tema seleccionado
          </span>
        )}
        {compact && !theme && (
          <span className="text-[11px] text-amber-300">escolhe um tema primeiro</span>
        )}
        {files.some((f) => f.stage === "done") && (
          <button
            onClick={clearDone}
            className="ml-auto text-[10px] text-escola-creme-50 hover:text-escola-creme"
          >
            Limpar concluídos
          </button>
        )}
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-2 rounded bg-escola-bg px-2 py-1 text-[11px]"
            >
              <span className="flex-1 truncate text-escola-creme">{f.filename}</span>
              {f.stage === "error" ? (
                <span className="text-red-300">✗ {f.error}</span>
              ) : f.stage === "done" ? (
                <span className="text-green-300">✓ pronto</span>
              ) : (
                <>
                  <span className="text-escola-creme-50">
                    {f.stage === "thumb"
                      ? "thumb..."
                      : f.stage === "signing"
                        ? "sign..."
                        : f.stage === "uploading"
                          ? `${f.progress}%`
                          : "..."}
                  </span>
                  <div className="h-1 w-20 rounded bg-escola-border">
                    <div
                      className="h-full rounded bg-escola-coral"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
