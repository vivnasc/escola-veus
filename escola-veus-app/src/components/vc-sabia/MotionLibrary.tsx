"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MOOD_LABELS, MORNING_MOODS, type MorningMood } from "@/lib/vc-sabia/audio";

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
  const [tagsHydrated, setTagsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(
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

  useEffect(() => {
    if (!tagsHydrated) return;
    if (onTagsChange) onTagsChange(tags);
    fetch("/api/admin/vc-sabia/motion-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    }).catch(() => {
      /* erros silenciosos para tags, sao auto-save em background */
    });
  }, [tags, tagsHydrated, onTagsChange]);

  const setMotionTag = (motionName: string, mood: MorningMood | "") => {
    setTags((prev) => {
      const next = { ...prev };
      if (mood === "") delete next[motionName];
      else next[motionName] = mood;
      return next;
    });
  };

  /** Extrai 1 frame de um motion via canvas. Retorna data URL JPEG. */
  const extractFrame = (url: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";

      const cleanup = () => {
        video.src = "";
      };
      const onLoaded = () => {
        video.currentTime = Math.min(0.5, video.duration / 4);
      };
      const onSeeked = () => {
        try {
          const canvas = document.createElement("canvas");
          const scale = Math.min(1, 768 / (video.videoWidth || 768));
          canvas.width = Math.round((video.videoWidth || 768) * scale);
          canvas.height = Math.round((video.videoHeight || 1366) * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("canvas ctx null");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        } catch (e) {
          reject(e);
        } finally {
          cleanup();
        }
      };
      video.addEventListener("loadeddata", onLoaded, { once: true });
      video.addEventListener("seeked", onSeeked, { once: true });
      video.addEventListener("error", () => {
        cleanup();
        reject(new Error(`Falha a ler ${url}`));
      });
    });

  const autoTagAll = async () => {
    if (motions.length === 0) return;
    setError(null);
    setAutoTagResult(null);
    setAutoTagging({ phase: "extracting", done: 0, total: motions.length });

    const frames: Array<{ name: string; base64: string }> = [];
    for (let i = 0; i < motions.length; i++) {
      try {
        const base64 = await extractFrame(motions[i].url);
        frames.push({ name: motions[i].name, base64 });
      } catch (e) {
        console.warn(`[auto-tag] falhou extrair ${motions[i].name}`, e);
      }
      setAutoTagging({ phase: "extracting", done: i + 1, total: motions.length });
    }

    if (frames.length === 0) {
      setError("Não consegui extrair nenhum frame.");
      setAutoTagging(null);
      return;
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
        setTags((prev) => ({ ...prev, ...json.tags }));
        setAutoTagResult({
          classified: json.classified,
          skipped: json.skipped,
          reasoning: json.reasoning || "",
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAutoTagging(null);
    }
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

      try {
        // Passo 1: pedir signed URL ao backend
        const sigRes = await fetch("/api/admin/vc-sabia/motions/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name }),
        });
        const sigText = await sigRes.text();
        if (!sigRes.ok) {
          setError(`${file.name}: signed-url HTTP ${sigRes.status}: ${sigText.slice(0, 200)}`);
          console.error("[MotionLibrary] signed-url falhou", sigRes.status, sigText);
          break;
        }
        const sig = JSON.parse(sigText) as { signedUrl: string; path: string };
        console.log(`[MotionLibrary]   signed URL OK → ${sig.path}`);

        // Passo 2: upload directo para Supabase via PUT
        const upRes = await fetch(sig.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "video/mp4" },
          body: file,
        });
        if (!upRes.ok) {
          const upText = await upRes.text();
          setError(`${file.name}: upload HTTP ${upRes.status}: ${upText.slice(0, 200)}`);
          console.error("[MotionLibrary] upload falhou", upRes.status, upText);
          break;
        }
        console.log(`[MotionLibrary]   upload OK`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`${file.name}: ${msg}`);
        console.error("[MotionLibrary] excepção", e);
        break;
      }
      setUploading({ done: i + 1, total: list.length });
    }

    setUploading(null);
    console.log("[MotionLibrary] Upload concluído. A refrescar lista");
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
        Arrasta vídeos MP4/WebM/MOV para aqui
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
        <div className="rounded border border-escola-dourado/40 bg-escola-dourado/10 p-3 text-xs text-escola-dourado">
          A carregar {uploading.done} / {uploading.total}…
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
