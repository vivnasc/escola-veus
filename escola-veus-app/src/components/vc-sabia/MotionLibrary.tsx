"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MOOD_LABELS, MORNING_MOODS, type MorningMood } from "@/lib/vc-sabia/audio";
import { posterFrag } from "@/lib/video-poster";

export interface Motion {
  name: string;
  url: string;
  sizeBytes: number;
  createdAt: string | null;
}

interface Props {
  selectedUrl: string;
  onSelect: (url: string) => void;
  /** Notifica parent quando tags de motion mudam. */
  onTagsChange?: (tags: Record<string, MorningMood>) => void;
}

export function MotionLibrary({ selectedUrl, onSelect, onTagsChange }: Props) {
  const [motions, setMotions] = useState<Motion[]>([]);
  const [tags, setTags] = useState<Record<string, MorningMood>>({});
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [tagsHydrated, setTagsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{
    done: number;
    total: number;
    currentFile?: string;
    currentSizeMB?: string;
    percent?: number;
  } | null>(
    null
  );
  const [autoTagging, setAutoTagging] = useState<{
    phase: "extracting" | "asking-claude";
    done?: number;
    total?: number;
  } | null>(null);
  const [autoTagResult, setAutoTagResult] = useState<{
    classified: number;
    skipped: number;
    reasoning: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [motionsRes, tagsRes] = await Promise.all([
        fetch("/api/admin/vc-sabia/motions").then((r) => r.json()),
        fetch("/api/admin/vc-sabia/motion-tags").then((r) => r.json()),
      ]);
      setMotions(motionsRes.motions || []);
      setTags(tagsRes.tags || {});
      setCategories(tagsRes.categories || {});
      setTagsHydrated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-select primeiro motion se nao ha selecao (preview arranca limpa)
  useEffect(() => {
    if (!selectedUrl && motions.length > 0) {
      onSelect(motions[0].url);
    }
  }, [motions, selectedUrl, onSelect]);

  useEffect(() => {
    if (!tagsHydrated) return;
    if (onTagsChange) onTagsChange(tags);
    fetch("/api/admin/vc-sabia/motion-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags, categories }),
    }).catch(() => {
      /* erros silenciosos para tags, sao auto-save em background */
    });
  }, [tags, categories, tagsHydrated, onTagsChange]);

  const setMotionTag = (motionName: string, mood: MorningMood | "") => {
    setTags((prev) => {
      const next = { ...prev };
      if (mood === "") delete next[motionName];
      else next[motionName] = mood;
      return next;
    });
  };

  /** Extrai 1 frame de um motion via canvas. Retorna data URL JPEG.
   *  Suporta iOS: video em DOM off-screen, loadedmetadata trigger, timeout. */
  const extractFrame = (url: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.style.position = "fixed";
      video.style.left = "-9999px";
      video.style.top = "0";
      video.style.width = "1px";
      video.style.height = "1px";
      video.style.opacity = "0";
      video.style.pointerEvents = "none";
      document.body.appendChild(video);

      let done = false;
      const cleanup = () => {
        try {
          document.body.removeChild(video);
        } catch {
          /* já removido */
        }
      };
      const finish = (fn: () => void) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        cleanup();
        fn();
      };
      const timer = setTimeout(() => {
        finish(() => reject(new Error("timeout 15s a ler video")));
      }, 15000);

      const tryCapture = () => {
        try {
          const canvas = document.createElement("canvas");
          const w = video.videoWidth || 768;
          const h = video.videoHeight || 1366;
          const scale = Math.min(1, 768 / w);
          canvas.width = Math.round(w * scale);
          canvas.height = Math.round(h * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("canvas ctx null");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const data = canvas.toDataURL("image/jpeg", 0.7);
          if (!data || data.length < 100) throw new Error("dataURL vazio (CORS?)");
          finish(() => resolve(data));
        } catch (e) {
          finish(() => reject(e));
        }
      };

      video.addEventListener("seeked", tryCapture, { once: true });
      video.addEventListener(
        "loadedmetadata",
        () => {
          const seekTo = Math.min(0.5, (video.duration || 1) / 4);
          if (Math.abs(video.currentTime - seekTo) < 0.001) {
            // já está no ponto certo, capturamos directamente
            tryCapture();
          } else {
            video.currentTime = seekTo;
          }
        },
        { once: true }
      );
      video.addEventListener("error", () => {
        const code = video.error?.code;
        finish(() => reject(new Error(`video error code ${code ?? "?"}`)));
      });

      video.src = url;
      video.load();
    });

  const autoTagAll = async () => {
    if (motions.length === 0) return;
    setError(null);
    setAutoTagResult(null);

    // Saltar motions que ja tem mood + categoria visual classificados.
    const needsClassification = motions.filter(
      (m) => !tags[m.name] || !categories[m.name]
    );
    const alreadyDone = motions.length - needsClassification.length;
    if (needsClassification.length === 0) {
      setAutoTagResult({
        classified: 0,
        skipped: 0,
        reasoning: `Todos os ${motions.length} motions ja estao classificados (mood + categoria). Nada a fazer.`,
      });
      return;
    }

    setAutoTagging({ phase: "extracting", done: 0, total: needsClassification.length });
    console.log(`[auto-tag] ${needsClassification.length} motions por classificar (${alreadyDone} ja feitos)`);

    const frames: Array<{ name: string; base64: string }> = [];
    const failed: string[] = [];
    for (let i = 0; i < needsClassification.length; i++) {
      const m = needsClassification[i];
      try {
        const base64 = await extractFrame(m.url);
        frames.push({ name: m.name, base64 });
        console.log(`[auto-tag]   ${i + 1}/${needsClassification.length} ${m.name} OK`);
      } catch (e) {
        failed.push(m.name);
        console.warn(`[auto-tag]   ${i + 1}/${needsClassification.length} ${m.name} FAIL`, e);
      }
      setAutoTagging({ phase: "extracting", done: i + 1, total: needsClassification.length });
    }

    if (frames.length === 0) {
      setError(
        `Não consegui extrair nenhum frame. Os ${failed.length} falharam (provável CORS ou bloqueio do browser). Tenta noutro browser (Chrome desktop) ou avisa-me.`
      );
      setAutoTagging(null);
      return;
    }
    if (failed.length > 0) {
      console.warn(`[auto-tag] ${failed.length} frames falharam:`, failed);
    }

    setAutoTagging({ phase: "asking-claude" });

    try {
      const res = await fetch("/api/admin/vc-sabia/motions/auto-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro || `HTTP ${res.status}`);
      } else {
        const mergedTags = { ...tags, ...json.tags };
        const mergedCategories = { ...categories, ...(json.categories || {}) };
        setTags(mergedTags);
        setCategories(mergedCategories);
        try {
          await fetch("/api/admin/vc-sabia/motion-tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tags: mergedTags, categories: mergedCategories }),
          });
        } catch { /* retry manual */ }
        onTagsChange?.(mergedTags);
        const newCats = Object.keys(json.categories || {}).length;
        setAutoTagResult({
          classified: json.classified,
          skipped: json.skipped + failed.length,
          reasoning:
            (alreadyDone > 0 ? `${alreadyDone} motions ja classificados (saltados). ` : "") +
            (json.reasoning || "") +
            (newCats > 0 ? ` · ${newCats} categorias visuais classificadas.` : "") +
            (failed.length
              ? ` · ${failed.length} clips não foram extraídos: ${failed.slice(0, 3).join(", ")}${failed.length > 3 ? "…" : ""}`
              : ""),
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAutoTagging(null);
    }
  };

  const uploadFileXhr = (url: string, file: File, onProgress: (pct: number) => void): Promise<number> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => resolve(xhr.status);
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.ontimeout = () => reject(new Error("Timeout (ficheiro demasiado grande para a ligação)"));
      xhr.timeout = 300_000; // 5 min por ficheiro
      xhr.send(file);
    });
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => /\.(mp4|webm|mov)$/i.test(f.name));
    if (list.length === 0) {
      setError("Sem ficheiros MP4/WebM/MOV.");
      return;
    }
    setUploading({ done: 0, total: list.length });
    setError(null);
    console.log(`[MotionLibrary] A iniciar upload de ${list.length} ficheiros`);

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      const sizeMB = (file.size / 1024 / 1024).toFixed(1);
      console.log(`[MotionLibrary] ${i + 1}/${list.length}: ${file.name} (${sizeMB} MB)`);
      setUploading({ done: i, total: list.length, currentFile: file.name, currentSizeMB: sizeMB, percent: 0 });

      try {
        const sigRes = await fetch("/api/admin/vc-sabia/motions/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name }),
        });
        const sigText = await sigRes.text();
        if (!sigRes.ok) {
          setError(`${file.name}: signed-url HTTP ${sigRes.status}: ${sigText.slice(0, 200)}`);
          break;
        }
        const sig = JSON.parse(sigText) as { signedUrl: string; path: string };

        const status = await uploadFileXhr(sig.signedUrl, file, (pct) => {
          setUploading({ done: i, total: list.length, currentFile: file.name, currentSizeMB: sizeMB, percent: pct });
        });
        if (status < 200 || status >= 300) {
          setError(`${file.name}: upload HTTP ${status}`);
          break;
        }
        console.log(`[MotionLibrary]   upload OK (${sizeMB} MB)`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`${file.name}: ${msg}`);
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
            Motion library
          </h2>
          <p className="text-xs text-escola-creme-50">
            Clica num clip para o usar na preview. Arrasta MP4s para a zona em
            baixo para adicionar mais. {motions.length > 0 && `(${motions.length} no library)`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={autoTagAll}
            disabled={autoTagging !== null || motions.length === 0}
            className="rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
            title="Claude vision olha para o 1º frame de cada motion e classifica em água/vento/lume/terra"
          >
            {autoTagging?.phase === "extracting"
              ? `A extrair frames ${autoTagging.done}/${autoTagging.total}…`
              : autoTagging?.phase === "asking-claude"
              ? "Claude a classificar…"
              : "Auto-classificar"}
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
        Arrasta vídeos MP4/WebM/MOV para aqui (até 50 MB por ficheiro)
      </div>

      {error && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {autoTagResult && (
        <div className="space-y-1 rounded border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          <div>
            <strong>Claude classificou {autoTagResult.classified} motion(s)</strong>
            {autoTagResult.skipped > 0 &&
              ` · saltou ${autoTagResult.skipped} (não bateu nas 4 categorias)`}
          </div>
          {autoTagResult.reasoning && (
            <div className="text-[11px] italic text-emerald-200/80">
              {autoTagResult.reasoning}
            </div>
          )}
          <div className="text-[11px] text-emerald-200/60">
            Revê os dropdowns das thumbnails. Podes ajustar manualmente o que
            não bate certo.
          </div>
        </div>
      )}

      {uploading && (
        <div className="space-y-1.5 rounded border border-escola-dourado/40 bg-escola-dourado/10 p-3 text-xs text-escola-dourado">
          <div>
            A carregar {uploading.done + 1} / {uploading.total}
            {uploading.currentFile && (
              <span className="text-escola-creme-50">
                {" "}· {uploading.currentFile} · {uploading.currentSizeMB} MB
              </span>
            )}
          </div>
          {typeof uploading.percent === "number" && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-escola-border/40">
              <div
                className="h-full rounded-full bg-escola-dourado transition-all duration-300"
                style={{ width: `${uploading.percent}%` }}
              />
            </div>
          )}
          {typeof uploading.percent === "number" && (
            <div className="text-right text-[10px] text-escola-creme-50">
              {uploading.percent}%
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-xs text-escola-creme-50">A carregar library…</div>
      ) : motions.length === 0 ? (
        <div className="rounded border border-escola-border bg-escola-card/40 p-6 text-center text-xs text-escola-creme-50">
          Ainda não há motions. Faz upload dos teus clips para começar.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {motions.map((m) => {
            const isSelected = selectedUrl === m.url;
            const motionMood = tags[m.name];
            return (
              <div
                key={m.url}
                className={`group relative overflow-hidden rounded-md border transition-all ${
                  isSelected
                    ? "border-escola-dourado ring-2 ring-escola-dourado/40"
                    : "border-escola-border hover:border-escola-dourado/60"
                }`}
              >
                <button
                  onClick={() => onSelect(m.url)}
                  className="block w-full text-left"
                  title={m.name}
                >
                  <video
                    src={posterFrag(m.url)}
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
                </button>
                <div className="space-y-1 bg-black/70 p-1.5">
                  <div className="truncate text-[10px] text-escola-creme">
                    {m.name}
                  </div>
                  <select
                    value={motionMood ?? ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      setMotionTag(m.name, e.target.value as MorningMood | "")
                    }
                    className={`w-full rounded border bg-escola-card px-1 py-0.5 text-[10px] ${
                      motionMood
                        ? "border-escola-dourado/60 text-escola-dourado"
                        : "border-red-700/40 text-red-300"
                    }`}
                  >
                    <option value="">⚠ sem mood</option>
                    {MORNING_MOODS.map((mm) => (
                      <option key={mm} value={mm}>
                        {MOOD_LABELS[mm]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
