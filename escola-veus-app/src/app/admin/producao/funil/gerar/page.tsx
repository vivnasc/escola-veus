"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import motionPrompts from "@/data/runway-motion-prompts.json";

type PromptItem = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
};

type PromptConfig = {
  checkpoint?: string;
  width?: number;
  height?: number;
  cfg_scale?: number;
  steps?: number;
  sampler_name?: string;
  batch_size?: number;
  negative_prompt?: string;
};

type UploadedImage = { name: string; url: string; promptId: string };

type ClipStatus = "idle" | "submitting" | "processing" | "done" | "failed";
type ClipState = {
  imageName: string;
  imageUrl: string;
  status: ClipStatus;
  taskId?: string;
  clipUrl?: string;
  error?: string;
};

export default function FunilGerarPage() {
  const [promptsList, setPromptsList] = useState<PromptItem[]>([]);
  const [config, setConfig] = useState<PromptConfig>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("trailer");

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [clips, setClips] = useState<Record<string, ClipState>>({});

  // ── Load prompts from Supabase Storage (with seed fallback) ────────────
  useEffect(() => {
    fetch("/api/admin/prompts/funil/load", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setPromptsList(d.prompts ?? []);
        setConfig(d.config ?? {});
      })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // ── Load existing images + clips ──────────────────────────────────────
  const reloadAssets = useCallback(async () => {
    try {
      const [imgRes, clipRes] = await Promise.all([
        fetch("/api/admin/thinkdiffusion/list-images").then((r) => r.json()),
        fetch("/api/admin/thinkdiffusion/list-clips").then((r) => r.json()),
      ]);
      if (Array.isArray(imgRes.images)) setImages(imgRes.images);
      if (Array.isArray(clipRes.clips)) {
        const st: Record<string, ClipState> = {};
        for (const c of clipRes.clips) {
          for (const ext of ["png", "jpg", "jpeg"]) {
            st[`${c.name}.${ext}`] = {
              imageName: `${c.name}.${ext}`,
              imageUrl: "",
              status: "done",
              clipUrl: c.url,
            };
          }
        }
        setClips((prev) => ({ ...st, ...prev }));
      }
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    reloadAssets();
  }, [reloadAssets]);

  // ── Derived ────────────────────────────────────────────────────────────
  const funilPrompts = useMemo(
    () => promptsList.filter((p) => p.id.startsWith("nomear-")),
    [promptsList],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return funilPrompts;
    if (filter === "trailer") return funilPrompts.filter((p) => p.id.startsWith("nomear-trailer"));
    if (filter.startsWith("ep")) return funilPrompts.filter((p) => p.id.startsWith(`nomear-${filter}`));
    return funilPrompts;
  }, [funilPrompts, filter]);

  const imagesByPrompt = useMemo(() => {
    const map = new Map<string, UploadedImage[]>();
    for (const img of images) {
      const list = map.get(img.promptId) ?? [];
      list.push(img);
      map.set(img.promptId, list);
    }
    return map;
  }, [images]);

  const getMotionPrompt = useCallback((imageName: string) => {
    const promptId = imageName.replace(/-[hv]-\d+\.\w+$/, "");
    return (
      (motionPrompts as Record<string, string>)[promptId] ||
      (motionPrompts as Record<string, string>)["_default"]
    );
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────
  const copy = (text: string, tag: string) => {
    navigator.clipboard.writeText(text);
    setCopied(tag);
    setTimeout(() => setCopied(null), 1500);
  };

  const uploadForPrompt = async (promptId: string, files: File[]) => {
    if (files.length === 0) return;
    setUploading(promptId);

    const existing = imagesByPrompt.get(promptId) ?? [];
    let hCount = existing.filter((i) => i.name.includes("-h-")).length;
    let vCount = existing.filter((i) => i.name.includes("-v-")).length;

    for (const file of files) {
      const orient = await new Promise<"h" | "v">((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.width >= img.height ? "h" : "v");
        img.onerror = () => resolve("h");
        img.src = URL.createObjectURL(file);
      });

      const num = orient === "h" ? ++hCount : ++vCount;
      const filename = `${promptId}-${orient}-${String(num).padStart(2, "0")}.${file.name.split(".").pop() ?? "png"}`;
      const category = `${promptId}/${orient === "h" ? "horizontal" : "vertical"}`;

      const fd = new FormData();
      fd.append("file", file);
      fd.append("filename", filename);
      fd.append("category", category);

      const r = await fetch("/api/admin/thinkdiffusion/save-image", { method: "POST", body: fd });
      const d = await r.json();
      if (d.url) {
        setImages((prev) => [...prev, { name: filename, url: d.url, promptId }]);
      } else {
        setErr(`Upload ${filename}: ${d.erro ?? "falhou"}`);
      }
    }
    setUploading(null);
  };

  const generateClip = async (img: UploadedImage) => {
    setClips((prev) => ({
      ...prev,
      [img.name]: { imageName: img.name, imageUrl: img.url, status: "submitting" },
    }));
    try {
      const r = await fetch("/api/admin/courses/submit-animation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          imageUrl: img.url,
          motionPrompt: getMotionPrompt(img.name),
          provider: "runway",
          ratio: img.name.includes("-v-") ? "720:1280" : "1280:720",
        }),
      });
      const d = await r.json();
      if (!d.taskId) throw new Error(d.erro ?? "sem taskId");

      fetch("/api/admin/thinkdiffusion/save-task", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ taskId: d.taskId, imageName: img.name, imageUrl: img.url }),
      }).catch(() => {});

      setClips((prev) => ({
        ...prev,
        [img.name]: { ...prev[img.name], taskId: d.taskId, status: "processing" },
      }));

      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 10000));
        const sr = await fetch("/api/admin/courses/animation-status", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tasks: [{ type: "clip", taskId: d.taskId }], provider: "runway" }),
        });
        const sd = await sr.json();
        const t = sd.tasks?.[0];
        if (t?.status === "done" && t.videoUrl) {
          let final = t.videoUrl;
          try {
            const save = await fetch("/api/admin/thinkdiffusion/save-clip", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ videoUrl: t.videoUrl, filename: img.name.replace(/\.\w+$/, ".mp4") }),
            });
            const sv = await save.json();
            if (sv.url) final = sv.url;
          } catch {
            /* keep runway url */
          }
          setClips((prev) => ({
            ...prev,
            [img.name]: { ...prev[img.name], status: "done", clipUrl: `${final}?t=${Date.now()}` },
          }));
          return;
        }
        if (t?.status === "failed") {
          setClips((prev) => ({
            ...prev,
            [img.name]: { ...prev[img.name], status: "failed", error: t.failureReason ?? "falhou" },
          }));
          return;
        }
      }
      setClips((prev) => ({
        ...prev,
        [img.name]: { ...prev[img.name], status: "failed", error: "timeout" },
      }));
    } catch (e) {
      setClips((prev) => ({
        ...prev,
        [img.name]: { ...prev[img.name], status: "failed", error: e instanceof Error ? e.message : String(e) },
      }));
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────
  if (loading) return <p className="text-xs text-escola-creme-50">A carregar...</p>;

  const epOptions = ["trailer", "ep01", "ep02", "ep03", "ep04", "ep05", "ep06", "ep07", "ep08", "ep09", "ep10"];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-escola-creme">
            Funil — Gerar imagens & clips
          </h2>
          <p className="mt-1 text-xs text-escola-creme-50">
            Copia o prompt → gera na ThinkDiffusion → arrasta ficheiros aqui → gera clip Runway.
          </p>
        </div>
        <Link
          href="/admin/producao/funil"
          className="text-xs text-escola-creme-50 hover:text-escola-creme"
        >
          ← voltar
        </Link>
      </div>

      {err && <p className="mb-3 text-xs text-escola-terracota">{err}</p>}

      {/* ── Settings ─────────────────────────────────────────────────── */}
      <details className="mb-4 rounded-xl border border-escola-border bg-escola-card">
        <summary className="cursor-pointer px-4 py-3 text-sm text-escola-creme">
          Settings ThinkDiffusion (copia para usar na UI web)
        </summary>
        <div className="space-y-3 border-t border-escola-border p-4 text-xs">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label="Checkpoint" value={config.checkpoint} />
            <Stat label="Width" value={config.width} />
            <Stat label="Height" value={config.height} />
            <Stat label="CFG" value={config.cfg_scale} />
            <Stat label="Steps" value={config.steps} />
            <Stat label="Sampler" value={config.sampler_name} />
          </div>
          <div>
            <label className="mb-1 block text-escola-creme-50">Negative prompt</label>
            <div className="flex items-start gap-2">
              <textarea
                readOnly
                value={config.negative_prompt ?? ""}
                className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme-50"
                rows={2}
              />
              <button
                onClick={() => copy(config.negative_prompt ?? "", "NEG")}
                className="rounded bg-escola-coral px-3 py-2 text-xs font-bold text-white"
              >
                {copied === "NEG" ? "✓ copiado" : "copiar"}
              </button>
            </div>
          </div>
        </div>
      </details>

      {/* ── Filtro ─────────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap gap-1">
        {epOptions.map((ep) => {
          const count = funilPrompts.filter((p) =>
            ep === "trailer" ? p.id.startsWith("nomear-trailer") : p.id.startsWith(`nomear-${ep}`),
          ).length;
          const active = filter === ep;
          return (
            <button
              key={ep}
              onClick={() => setFilter(ep)}
              className={`rounded border px-2.5 py-1 text-xs transition-colors ${
                active
                  ? "border-escola-dourado bg-escola-dourado/10 text-escola-dourado"
                  : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              {ep} · {count}
            </button>
          );
        })}
      </div>

      {/* ── Prompts ──────────────────────────────────────────────────── */}
      <ul className="space-y-3">
        {filtered.map((p) => {
          const imgs = imagesByPrompt.get(p.id) ?? [];
          return (
            <li key={p.id} className="rounded-xl border border-escola-border bg-escola-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-escola-dourado">{p.id}</p>
                  <p className="text-[10px] text-escola-creme-50">{p.mood.join(" · ")}</p>
                  <p className="mt-2 text-xs leading-relaxed text-escola-creme-50">{p.prompt}</p>
                </div>
                <button
                  onClick={() => copy(p.prompt, p.id)}
                  className="shrink-0 rounded bg-escola-coral px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {copied === p.id ? "✓ copiado" : "copiar"}
                </button>
              </div>

              {/* Upload area */}
              <UploadZone
                promptId={p.id}
                uploading={uploading === p.id}
                onFiles={(files) => uploadForPrompt(p.id, files)}
              />

              {/* Images */}
              {imgs.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {imgs.map((img) => {
                    const clip = clips[img.name];
                    return (
                      <div key={img.name} className="overflow-hidden rounded-lg border border-escola-border">
                        {clip?.status === "done" && clip.clipUrl ? (
                          <video src={clip.clipUrl} className="aspect-video w-full" controls muted />
                        ) : (
                          <img src={img.url} alt={img.name} className="aspect-video w-full object-cover" />
                        )}
                        <div className="flex items-center justify-between gap-1 border-t border-escola-border bg-escola-bg px-2 py-1 text-[10px]">
                          <span className="truncate text-escola-creme-50">{img.name}</span>
                          {!clip || clip.status === "idle" || clip.status === "failed" ? (
                            <button
                              onClick={() => generateClip(img)}
                              className="shrink-0 rounded border border-escola-border px-1.5 py-0.5 text-escola-creme hover:border-escola-dourado/40"
                            >
                              clip
                            </button>
                          ) : clip.status === "submitting" ? (
                            <span className="text-escola-creme-50">a enviar...</span>
                          ) : clip.status === "processing" ? (
                            <span className="text-escola-dourado">a gerar...</span>
                          ) : clip.status === "done" ? (
                            <span className="text-escola-dourado">✓</span>
                          ) : (
                            <span className="text-escola-terracota">{clip.error ?? "erro"}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div>
      <span className="text-escola-creme-50">{label}: </span>
      <strong className="text-escola-creme">{value ?? "—"}</strong>
    </div>
  );
}

function UploadZone({
  promptId,
  uploading,
  onFiles,
}: {
  promptId: string;
  uploading: boolean;
  onFiles: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
        if (files.length) onFiles(files);
      }}
      onClick={() => inputRef.current?.click()}
      className={`mt-3 cursor-pointer rounded border-2 border-dashed p-3 text-center text-xs transition-colors ${
        drag
          ? "border-escola-dourado bg-escola-dourado/5"
          : "border-escola-border text-escola-creme-50 hover:border-escola-dourado/40"
      }`}
    >
      {uploading ? "A carregar..." : "arrasta imagens aqui ou clica para escolher"}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
          void promptId;
        }}
      />
    </div>
  );
}
