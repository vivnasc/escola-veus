"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import raizesPromptsData from "@/data/ag-raizes-prompts.json";
import {
  RAIZES_TEMAS,
  RAIZES_TEMA_LABELS,
  RAIZES_TEMA_DESCRICOES,
  type RaizTema,
} from "@/lib/ag-raizes-temas";

// Raízes Ancient Ground — página dedicada para carregar imagens humano-culturais
// geradas em Midjourney. Fluxo:
//   1. Escolhes o tema (15: machamba, pesca, batuque…)
//   2. Copias um dos 4 prompts pré-escritos → gerar no MJ
//   3. Arrastas as imagens geradas para a drop zone
//   4. Servidor auto-nomeia "{tema}-{NN}.{ext}" e guarda em
//      escola-shorts/ag-raizes/{tema}/
//   5. Depois (fluxo separado) cada imagem vai ao Runway para animar → clip AG

type RaizPrompt = {
  id: string;
  theme: RaizTema;
  mood: string[];
  prompt: string;
};

type RaizImage = {
  tema: RaizTema;
  filename: string;
  url: string;
  createdAt: string | null;
};

type FileStatus = {
  id: string;
  filename: string;
  stage: "queued" | "signing" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
};

const ALL_PROMPTS = (raizesPromptsData as { prompts: RaizPrompt[] }).prompts;

function promptsForTema(tema: RaizTema): RaizPrompt[] {
  return ALL_PROMPTS.filter((p) => p.theme === tema);
}

function putToSignedUrl(
  url: string,
  body: Blob,
  contentType: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`HTTP ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Erro de rede"));
    xhr.send(body);
  });
}

function extOf(filename: string): string {
  const m = filename.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "png";
}

export default function RaizesAGPage() {
  const [selectedTema, setSelectedTema] = useState<RaizTema>("machamba");
  const [images, setImages] = useState<RaizImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<FileStatus[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/ancient-ground/raizes", { cache: "no-store" });
      const d = await r.json();
      setImages(d.items || []);
    } catch {
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const imagesOfTema = images.filter((i) => i.tema === selectedTema);
  const counts: Partial<Record<RaizTema, number>> = {};
  for (const img of images) counts[img.tema] = (counts[img.tema] || 0) + 1;

  const copyPrompt = async (promptText: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(promptId);
      setTimeout(() => setCopied((c) => (c === promptId ? null : c)), 1500);
    } catch {
      alert("Falhou a copiar — copia à mão.");
    }
  };

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const files = Array.from(list);
    const imageFiles = files.filter((f) => /^image\/(png|jpe?g|webp)$/i.test(f.type) || /\.(png|jpe?g|webp)$/i.test(f.name));
    if (imageFiles.length === 0) {
      alert("Nenhuma imagem válida (png, jpg, webp).");
      return;
    }

    const initial: FileStatus[] = imageFiles.map((f) => ({
      id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 8)}`,
      filename: f.name,
      stage: "queued",
      progress: 0,
    }));
    setUploads((prev) => [...prev, ...initial]);
    setBusy(true);

    try {
      // 1. Pede signed URLs em batch (servidor aloca índices sequenciais)
      initial.forEach((s) => {
        setUploads((prev) => prev.map((x) => (x.id === s.id ? { ...x, stage: "signing", progress: 5 } : x)));
      });
      const signRes = await fetch("/api/admin/ancient-ground/raizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema: selectedTema,
          files: imageFiles.map((f) => ({ ext: extOf(f.name) })),
        }),
      });
      const signData = await signRes.json();
      if (!signRes.ok || !Array.isArray(signData.items)) {
        throw new Error(signData.erro || `Sign HTTP ${signRes.status}`);
      }

      // 2. Upload paralelo de cada ficheiro
      const newImages: RaizImage[] = [];
      await Promise.all(
        imageFiles.map(async (file, i) => {
          const status = initial[i];
          const item = signData.items[i];
          try {
            setUploads((prev) =>
              prev.map((x) => (x.id === status.id ? { ...x, stage: "uploading", progress: 10 } : x)),
            );
            await putToSignedUrl(item.uploadUrl, file, item.contentType, (pct) =>
              setUploads((prev) =>
                prev.map((x) =>
                  x.id === status.id ? { ...x, progress: 10 + Math.round(pct * 0.85) } : x,
                ),
              ),
            );
            newImages.push({
              tema: selectedTema,
              filename: item.filename,
              url: item.publicUrl,
              createdAt: new Date().toISOString(),
            });
            setUploads((prev) =>
              prev.map((x) =>
                x.id === status.id ? { ...x, stage: "done", progress: 100, filename: item.filename } : x,
              ),
            );
          } catch (err) {
            setUploads((prev) =>
              prev.map((x) =>
                x.id === status.id
                  ? {
                      ...x,
                      stage: "error",
                      error: err instanceof Error ? err.message : String(err),
                    }
                  : x,
              ),
            );
          }
        }),
      );

      // Optimistic: prepend na grelha
      if (newImages.length > 0) {
        setImages((prev) => [...newImages, ...prev]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploads((prev) =>
        prev.map((x) => (x.stage === "signing" ? { ...x, stage: "error", error: msg } : x)),
      );
    } finally {
      setBusy(false);
    }
  };

  const clearDone = () => setUploads((prev) => prev.filter((u) => u.stage !== "done"));

  const removeImage = async (img: RaizImage) => {
    if (!confirm(`Remover "${img.filename}"?`)) return;
    setDeleting(img.filename);
    try {
      const r = await fetch("/api/admin/ancient-ground/raizes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: img.tema, filename: img.filename }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.erro || `HTTP ${r.status}`);
      }
      setImages((prev) => prev.filter((x) => !(x.tema === img.tema && x.filename === img.filename)));
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg text-escola-creme">
            Raízes · imagens humano-culturais AG
          </h2>
          <p className="text-xs text-escola-creme-50">
            Gera no Midjourney com os prompts abaixo, arrasta para a drop zone.
            Servidor auto-nomeia <code>{"{tema}-{NN}.{ext}"}</code>. Depois cada
            imagem vai ao Runway para animar e entra nos shorts AG.
          </p>
        </div>
        <Link
          href="/admin/producao/ancient-ground/shorts"
          className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:border-escola-coral"
        >
          → Editor Shorts AG
        </Link>
      </div>

      {/* Tema picker */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          Tema
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {RAIZES_TEMAS.map((t) => {
            const n = counts[t] || 0;
            const active = selectedTema === t;
            return (
              <button
                key={t}
                onClick={() => setSelectedTema(t)}
                className={`rounded border px-3 py-1 text-xs ${
                  active
                    ? "border-escola-coral bg-escola-coral/20 text-escola-coral"
                    : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
                }`}
              >
                {RAIZES_TEMA_LABELS[t]} {n > 0 && <span className="opacity-70">({n})</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Descrição + Prompts */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            {RAIZES_TEMA_LABELS[selectedTema]}
          </h3>
          <span className="text-[10px] text-escola-creme-50">
            {promptsForTema(selectedTema).length} prompts · {imagesOfTema.length} imagens
          </span>
        </div>
        <p className="mb-4 text-xs text-escola-creme-50">
          {RAIZES_TEMA_DESCRICOES[selectedTema]}
        </p>

        <div className="space-y-2">
          {promptsForTema(selectedTema).map((p) => (
            <div
              key={p.id}
              className="rounded border border-escola-border bg-escola-bg p-3"
            >
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-escola-creme-50">
                  {p.id} · <span className="text-escola-dourado">{p.mood.join(" + ")}</span>
                </span>
                <button
                  onClick={() => copyPrompt(p.prompt, p.id)}
                  className="rounded border border-escola-border px-2 py-0.5 text-[10px] hover:border-escola-coral"
                >
                  {copied === p.id ? "✓ copiado" : "copiar"}
                </button>
              </div>
              <p className="whitespace-pre-wrap text-xs text-escola-creme">{p.prompt}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Drop zone */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          Upload imagens de <span className="text-escola-dourado">{RAIZES_TEMA_LABELS[selectedTema]}</span>
        </h3>
        <p className="mb-3 text-xs text-escola-creme-50">
          PNG · JPG · WebP. Arrasta directamente do MJ ou do Finder. Próximo
          número sequencial é atribuído automaticamente.
        </p>

        <div
          onClick={() => !busy && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!busy) handleFiles(e.dataTransfer.files);
          }}
          className={`flex min-h-[120px] cursor-pointer items-center justify-center rounded border-2 border-dashed p-6 text-center transition-colors ${
            busy
              ? "border-escola-border/30 opacity-50"
              : dragOver
                ? "border-escola-coral bg-escola-coral/10"
                : "border-escola-border bg-escola-bg/40 hover:border-escola-coral"
          }`}
        >
          <div>
            <p className="text-sm text-escola-creme">
              {busy ? "A carregar…" : "Arrasta imagens aqui"}
            </p>
            <p className="mt-1 text-[10px] text-escola-creme-50">ou clica para escolher</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />

        {uploads.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-escola-creme-50">
                Fila ({uploads.length})
              </span>
              {uploads.some((u) => u.stage === "done") && (
                <button
                  onClick={clearDone}
                  className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
                >
                  Limpar concluídos
                </button>
              )}
            </div>
            <ul className="space-y-1">
              {uploads.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-2 rounded bg-escola-bg px-2 py-1 text-[11px]"
                >
                  <span className="flex-1 truncate text-escola-creme">{u.filename}</span>
                  {u.stage === "error" ? (
                    <span className="text-red-300">✗ {u.error}</span>
                  ) : u.stage === "done" ? (
                    <span className="text-green-300">✓</span>
                  ) : (
                    <>
                      <span className="text-escola-creme-50">
                        {u.stage === "signing" ? "sign…" : `${u.progress}%`}
                      </span>
                      <div className="h-1 w-20 rounded bg-escola-border">
                        <div className="h-full rounded bg-escola-coral" style={{ width: `${u.progress}%` }} />
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Grelha */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            Imagens · {RAIZES_TEMA_LABELS[selectedTema]} ({imagesOfTema.length})
          </h3>
          <button
            onClick={load}
            disabled={loading}
            className="text-[10px] text-escola-creme-50 hover:text-escola-creme disabled:opacity-30"
          >
            {loading ? "…" : "↻ actualizar"}
          </button>
        </div>
        {loading ? (
          <p className="text-xs text-escola-creme-50">A carregar…</p>
        ) : imagesOfTema.length === 0 ? (
          <p className="text-xs text-escola-creme-50">
            Ainda não há imagens neste tema. Copia um prompt acima, gera no MJ,
            arrasta para a drop zone.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {imagesOfTema.map((img) => (
              <div
                key={img.filename}
                className="group relative aspect-square overflow-hidden rounded border border-escola-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.filename} className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/70 px-1 text-[9px] text-white">
                  {img.filename}
                </span>
                <button
                  onClick={() => removeImage(img)}
                  disabled={deleting === img.filename}
                  title="Remover"
                  className="absolute right-1 top-1 rounded bg-black/80 px-1.5 text-[10px] text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-100 disabled:opacity-30"
                >
                  {deleting === img.filename ? "…" : "×"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
