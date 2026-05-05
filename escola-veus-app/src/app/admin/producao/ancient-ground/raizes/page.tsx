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

// Raízes Ancient Ground — página dedicada à matéria-prima dos shorts AG.
// Fluxo completo nesta página:
//   1. Escolhes tema (machamba, pesca, batuque, …)
//   2. Copias um dos 4 prompts MJ → geras imagem no Midjourney
//   3. Arrastas a imagem para a drop zone (auto-nomeada {tema}-NN.ext)
//   4. Carregas "Animar" na imagem → Runway image-to-video → clip {tema}-NN.mp4
//      OU arrastas um clip externo (Runway ilimitado, MJ video, etc) para a
//      zona de clips → mesmo destino, mesma nomenclatura.
//   5. Os clips ficam em escola-shorts/ag-raizes-clips/{tema}/ — separados
//      do pool Loranne (paisagem) por princípio.

type RaizPrompt = {
  id: string;
  theme: RaizTema;
  mood: string[];
  prompt: string;
  motion: string;
};

type RaizImage = {
  tema: RaizTema;
  filename: string;
  url: string;
  createdAt: string | null;
};

type RaizClip = {
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

type AnimStatus = {
  imageFilename: string;
  stage: "starting" | "running" | "done" | "error";
  message: string;
  resultClipUrl?: string;
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

  // Imagens
  const [images, setImages] = useState<RaizImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [uploads, setUploads] = useState<FileStatus[]>([]);
  const [busy, setBusy] = useState(false);

  // Clips (animados via animate-raiz ou carregados externamente)
  const [clips, setClips] = useState<RaizClip[]>([]);
  const [loadingClips, setLoadingClips] = useState(true);
  const [clipUploads, setClipUploads] = useState<FileStatus[]>([]);
  const [clipBusy, setClipBusy] = useState(false);

  // Animação Runway
  const [anims, setAnims] = useState<Record<string, AnimStatus>>({});
  const [motionOverride, setMotionOverride] = useState<Record<string, string>>({});

  const [copied, setCopied] = useState<string | null>(null);
  const [deletingImg, setDeletingImg] = useState<string | null>(null);
  const [deletingClip, setDeletingClip] = useState<string | null>(null);
  const [dragOverImg, setDragOverImg] = useState(false);
  const [dragOverClip, setDragOverClip] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const clipInputRef = useRef<HTMLInputElement>(null);

  const loadImages = useCallback(async () => {
    setLoadingImages(true);
    try {
      const r = await fetch("/api/admin/ancient-ground/raizes", { cache: "no-store" });
      const d = await r.json();
      setImages(d.items || []);
    } catch {
      setImages([]);
    } finally {
      setLoadingImages(false);
    }
  }, []);

  const loadClips = useCallback(async () => {
    setLoadingClips(true);
    try {
      const r = await fetch("/api/admin/ancient-ground/raizes-clips", { cache: "no-store" });
      const d = await r.json();
      setClips(d.items || []);
    } catch {
      setClips([]);
    } finally {
      setLoadingClips(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
    loadClips();
  }, [loadImages, loadClips]);

  const imagesOfTema = images.filter((i) => i.tema === selectedTema);
  const clipsOfTema = clips.filter((c) => c.tema === selectedTema);
  const imageCounts: Partial<Record<RaizTema, number>> = {};
  const clipCounts: Partial<Record<RaizTema, number>> = {};
  for (const img of images) imageCounts[img.tema] = (imageCounts[img.tema] || 0) + 1;
  for (const c of clips) clipCounts[c.tema] = (clipCounts[c.tema] || 0) + 1;

  const copyPrompt = async (promptText: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(promptId);
      setTimeout(() => setCopied((c) => (c === promptId ? null : c)), 1500);
    } catch {
      alert("Falhou a copiar — copia à mão.");
    }
  };

  // Upload genérico (signed URL + PUT directo, mesmo padrão para imagens e clips)
  type UploadKind = "image" | "clip";
  type SignItem = {
    filename: string;
    contentType: string;
    uploadUrl: string;
    publicUrl: string;
  };

  const performUpload = async (
    kind: UploadKind,
    files: File[],
    setQueue: React.Dispatch<React.SetStateAction<FileStatus[]>>,
    setBusyFlag: React.Dispatch<React.SetStateAction<boolean>>,
    onSuccess: (newItems: { filename: string; url: string }[]) => void,
  ) => {
    if (files.length === 0) return;
    const initial: FileStatus[] = files.map((f) => ({
      id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 8)}`,
      filename: f.name,
      stage: "queued",
      progress: 0,
    }));
    setQueue((prev) => [...prev, ...initial]);
    setBusyFlag(true);

    const endpoint =
      kind === "image"
        ? "/api/admin/ancient-ground/raizes"
        : "/api/admin/ancient-ground/raizes-clips";

    try {
      initial.forEach((s) => {
        setQueue((prev) => prev.map((x) => (x.id === s.id ? { ...x, stage: "signing", progress: 5 } : x)));
      });
      const signRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema: selectedTema,
          files: files.map((f) => ({ ext: extOf(f.name) })),
        }),
      });
      const signData = await signRes.json();
      if (!signRes.ok || !Array.isArray(signData.items)) {
        throw new Error(signData.erro || `Sign HTTP ${signRes.status}`);
      }

      const newItems: { filename: string; url: string }[] = [];
      await Promise.all(
        files.map(async (file, i) => {
          const status = initial[i];
          const item = signData.items[i] as SignItem;
          try {
            setQueue((prev) =>
              prev.map((x) => (x.id === status.id ? { ...x, stage: "uploading", progress: 10 } : x)),
            );
            await putToSignedUrl(item.uploadUrl, file, item.contentType, (pct) =>
              setQueue((prev) =>
                prev.map((x) =>
                  x.id === status.id ? { ...x, progress: 10 + Math.round(pct * 0.85) } : x,
                ),
              ),
            );
            newItems.push({ filename: item.filename, url: item.publicUrl });
            setQueue((prev) =>
              prev.map((x) =>
                x.id === status.id ? { ...x, stage: "done", progress: 100, filename: item.filename } : x,
              ),
            );
          } catch (err) {
            setQueue((prev) =>
              prev.map((x) =>
                x.id === status.id
                  ? { ...x, stage: "error", error: err instanceof Error ? err.message : String(err) }
                  : x,
              ),
            );
          }
        }),
      );
      if (newItems.length > 0) onSuccess(newItems);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setQueue((prev) =>
        prev.map((x) => (x.stage === "signing" ? { ...x, stage: "error", error: msg } : x)),
      );
    } finally {
      setBusyFlag(false);
    }
  };

  const handleImageFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const files = Array.from(list).filter((f) =>
      /^image\/(png|jpe?g|webp)$/i.test(f.type) || /\.(png|jpe?g|webp)$/i.test(f.name),
    );
    if (files.length === 0) {
      alert("Nenhuma imagem válida (png, jpg, webp).");
      return;
    }
    await performUpload("image", files, setUploads, setBusy, (newItems) => {
      const newImages: RaizImage[] = newItems.map((it) => ({
        tema: selectedTema,
        filename: it.filename,
        url: it.url,
        createdAt: new Date().toISOString(),
      }));
      setImages((prev) => [...newImages, ...prev]);
    });
  };

  const handleClipFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const files = Array.from(list).filter((f) =>
      /^video\//i.test(f.type) || /\.(mp4|mov|webm|m4v)$/i.test(f.name),
    );
    if (files.length === 0) {
      alert("Nenhum vídeo válido (mp4, mov, webm).");
      return;
    }
    await performUpload("clip", files, setClipUploads, setClipBusy, (newItems) => {
      const newClips: RaizClip[] = newItems.map((it) => ({
        tema: selectedTema,
        filename: it.filename,
        url: it.url,
        createdAt: new Date().toISOString(),
      }));
      setClips((prev) => [...newClips, ...prev]);
    });
  };

  const clearDoneImages = () => setUploads((prev) => prev.filter((u) => u.stage !== "done"));
  const clearDoneClips = () => setClipUploads((prev) => prev.filter((u) => u.stage !== "done"));

  const removeImage = async (img: RaizImage) => {
    if (!confirm(`Remover imagem "${img.filename}"?`)) return;
    setDeletingImg(img.filename);
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
      setDeletingImg(null);
    }
  };

  const removeClip = async (clip: RaizClip) => {
    if (!confirm(`Remover clip "${clip.filename}"?`)) return;
    setDeletingClip(clip.filename);
    try {
      const r = await fetch("/api/admin/ancient-ground/raizes-clips", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: clip.tema, filename: clip.filename }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.erro || `HTTP ${r.status}`);
      }
      setClips((prev) => prev.filter((x) => !(x.tema === clip.tema && x.filename === clip.filename)));
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setDeletingClip(null);
    }
  };

  // Default motion = motion do 1º prompt do tema. User pode editar via input
  // por imagem (motionOverride[filename]) antes de carregar Animar.
  const defaultMotionForTema = (tema: RaizTema): string => {
    const first = ALL_PROMPTS.find((p) => p.theme === tema);
    return first?.motion || "";
  };

  const animateImage = async (img: RaizImage) => {
    const motionPrompt = motionOverride[img.filename] || defaultMotionForTema(img.tema);
    if (!motionPrompt.trim()) {
      alert("Sem motion prompt — escreve um ou edita o JSON.");
      return;
    }
    setAnims((prev) => ({
      ...prev,
      [img.filename]: { imageFilename: img.filename, stage: "starting", message: "A enviar ao Runway…" },
    }));
    try {
      setAnims((prev) => ({
        ...prev,
        [img.filename]: { ...prev[img.filename], stage: "running", message: "Runway a gerar (~3 min)…" },
      }));
      const r = await fetch("/api/admin/ancient-ground/animate-raiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: img.url,
          motionPrompt,
          tema: img.tema,
          durationSec: 10,
        }),
      });
      const data = await r.json();
      if (!r.ok || data.erro) throw new Error(data.erro || `HTTP ${r.status}`);

      setAnims((prev) => ({
        ...prev,
        [img.filename]: {
          imageFilename: img.filename,
          stage: "done",
          message: `Clip pronto: ${data.filename}`,
          resultClipUrl: data.url,
        },
      }));
      // Optimistic: prepend o novo clip à lista
      setClips((prev) => [
        {
          tema: img.tema,
          filename: data.filename,
          url: data.url,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      setAnims((prev) => ({
        ...prev,
        [img.filename]: {
          imageFilename: img.filename,
          stage: "error",
          message: err instanceof Error ? err.message : String(err),
        },
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg text-escola-creme">
            Raízes · matéria-prima dos shorts AG
          </h2>
          <p className="text-xs text-escola-creme-50">
            Pipeline completo por tema: gera imagem no Midjourney → arrasta →
            <strong> animar</strong> via Runway aqui, OU arrasta um clip já gerado
            por fora. Pool AG isolada da paisagem Loranne.
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
            const ni = imageCounts[t] || 0;
            const nc = clipCounts[t] || 0;
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
                title={`${ni} imagens · ${nc} clips`}
              >
                {RAIZES_TEMA_LABELS[t]}{" "}
                {(ni > 0 || nc > 0) && (
                  <span className="opacity-70">
                    ({ni}/{nc})
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-escola-creme-50">
          Contadores: <strong>imagens</strong> / <strong>clips</strong>
        </p>
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

      {/* Imagens — drop zone + grelha + animar */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            Imagens (MJ) · {RAIZES_TEMA_LABELS[selectedTema]} ({imagesOfTema.length})
          </h3>
          <button
            onClick={loadImages}
            disabled={loadingImages}
            className="text-[10px] text-escola-creme-50 hover:text-escola-creme disabled:opacity-30"
          >
            {loadingImages ? "…" : "↻"}
          </button>
        </div>

        <div
          onClick={() => !busy && imageInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setDragOverImg(true);
          }}
          onDragLeave={() => setDragOverImg(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOverImg(false);
            if (!busy) handleImageFiles(e.dataTransfer.files);
          }}
          className={`flex min-h-[80px] cursor-pointer items-center justify-center rounded border-2 border-dashed p-4 text-center transition-colors ${
            busy
              ? "border-escola-border/30 opacity-50"
              : dragOverImg
                ? "border-escola-coral bg-escola-coral/10"
                : "border-escola-border bg-escola-bg/40 hover:border-escola-coral"
          }`}
        >
          <div>
            <p className="text-xs text-escola-creme">
              {busy ? "A carregar…" : "Arrasta imagens MJ aqui (PNG · JPG · WebP)"}
            </p>
            <p className="text-[10px] text-escola-creme-50">ou clica</p>
          </div>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleImageFiles(e.target.files);
            if (imageInputRef.current) imageInputRef.current.value = "";
          }}
        />

        {uploads.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-escola-creme-50">
                Fila imagens ({uploads.length})
              </span>
              {uploads.some((u) => u.stage === "done") && (
                <button
                  onClick={clearDoneImages}
                  className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
                >
                  Limpar concluídos
                </button>
              )}
            </div>
            <ul className="space-y-1">
              {uploads.map((u) => (
                <li key={u.id} className="flex items-center gap-2 rounded bg-escola-bg px-2 py-1 text-[11px]">
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

        {imagesOfTema.length === 0 ? (
          <p className="mt-3 text-xs text-escola-creme-50">
            Ainda não há imagens neste tema. Copia um prompt acima, gera no MJ,
            arrasta para cima.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {imagesOfTema.map((img) => {
              const anim = anims[img.filename];
              const animating = anim?.stage === "starting" || anim?.stage === "running";
              return (
                <div
                  key={img.filename}
                  className="group relative rounded border border-escola-border bg-escola-bg p-2"
                >
                  <div className="relative aspect-square overflow-hidden rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.filename} className="h-full w-full object-cover" loading="lazy" />
                    {animating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] text-white">
                        {anim.message}
                      </div>
                    )}
                    <button
                      onClick={() => removeImage(img)}
                      disabled={deletingImg === img.filename || animating}
                      title="Remover imagem"
                      className="absolute right-1 top-1 rounded bg-black/80 px-1.5 text-[10px] text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-100 disabled:opacity-30"
                    >
                      {deletingImg === img.filename ? "…" : "×"}
                    </button>
                  </div>
                  <div className="mt-1.5 truncate text-[10px] text-escola-creme-50">
                    {img.filename}
                  </div>
                  <details className="mt-1">
                    <summary className="cursor-pointer text-[10px] text-escola-creme-50 hover:text-escola-creme">
                      motion (override)
                    </summary>
                    <textarea
                      value={motionOverride[img.filename] ?? defaultMotionForTema(img.tema)}
                      onChange={(e) =>
                        setMotionOverride((prev) => ({ ...prev, [img.filename]: e.target.value }))
                      }
                      rows={3}
                      className="mt-1 w-full rounded border border-escola-border bg-escola-bg-card px-1.5 py-1 text-[10px] text-escola-creme"
                    />
                  </details>
                  <button
                    onClick={() => animateImage(img)}
                    disabled={animating}
                    className="mt-1.5 w-full rounded bg-escola-coral px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-40"
                  >
                    {animating ? "A animar…" : anim?.stage === "done" ? "↻ Animar de novo" : "✨ Animar"}
                  </button>
                  {anim?.stage === "error" && (
                    <p className="mt-1 break-words text-[10px] text-red-300">{anim.message}</p>
                  )}
                  {anim?.stage === "done" && (
                    <p className="mt-1 text-[10px] text-green-300">✓ {anim.message}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Clips — animados aqui ou carregados externamente */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            Clips · {RAIZES_TEMA_LABELS[selectedTema]} ({clipsOfTema.length})
          </h3>
          <button
            onClick={loadClips}
            disabled={loadingClips}
            className="text-[10px] text-escola-creme-50 hover:text-escola-creme disabled:opacity-30"
          >
            {loadingClips ? "…" : "↻"}
          </button>
        </div>
        <p className="mb-3 text-xs text-escola-creme-50">
          Clips Runway (animados aqui) <em>ou</em> arrastados de fora. Auto-nomeados{" "}
          <code>{selectedTema}-NN.mp4</code>. Vão para{" "}
          <code>escola-shorts/ag-raizes-clips/{selectedTema}/</code>.
        </p>

        <div
          onClick={() => !clipBusy && clipInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!clipBusy) setDragOverClip(true);
          }}
          onDragLeave={() => setDragOverClip(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOverClip(false);
            if (!clipBusy) handleClipFiles(e.dataTransfer.files);
          }}
          className={`flex min-h-[80px] cursor-pointer items-center justify-center rounded border-2 border-dashed p-4 text-center transition-colors ${
            clipBusy
              ? "border-escola-border/30 opacity-50"
              : dragOverClip
                ? "border-escola-coral bg-escola-coral/10"
                : "border-escola-border bg-escola-bg/40 hover:border-escola-coral"
          }`}
        >
          <div>
            <p className="text-xs text-escola-creme">
              {clipBusy ? "A carregar…" : "Arrasta clips externos aqui (MP4 · MOV · WebM)"}
            </p>
            <p className="text-[10px] text-escola-creme-50">ou clica</p>
          </div>
        </div>
        <input
          ref={clipInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleClipFiles(e.target.files);
            if (clipInputRef.current) clipInputRef.current.value = "";
          }}
        />

        {clipUploads.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-escola-creme-50">
                Fila clips ({clipUploads.length})
              </span>
              {clipUploads.some((u) => u.stage === "done") && (
                <button
                  onClick={clearDoneClips}
                  className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
                >
                  Limpar concluídos
                </button>
              )}
            </div>
            <ul className="space-y-1">
              {clipUploads.map((u) => (
                <li key={u.id} className="flex items-center gap-2 rounded bg-escola-bg px-2 py-1 text-[11px]">
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

        {clipsOfTema.length === 0 ? (
          <p className="mt-3 text-xs text-escola-creme-50">
            Ainda não há clips neste tema. Anima uma imagem acima ou arrasta um
            clip externo.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {clipsOfTema.map((c) => (
              <div
                key={c.filename}
                className="group relative aspect-[9/16] overflow-hidden rounded border border-escola-border"
              >
                <video
                  src={c.url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  onMouseEnter={(e) => {
                    e.currentTarget.play().catch(() => {});
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/70 px-1 text-[9px] text-white">
                  {c.filename}
                </span>
                <button
                  onClick={() => removeClip(c)}
                  disabled={deletingClip === c.filename}
                  title="Remover clip"
                  className="absolute right-1 top-1 rounded bg-black/80 px-1.5 text-[10px] text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-100 disabled:opacity-30"
                >
                  {deletingClip === c.filename ? "…" : "×"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
