"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import motionPrompts from "@/data/runway-motion-prompts.json";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";

type PromptItem = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
  // Reciclagem (opcional). Se presente, este prompt usa um clip existente de
  // outro ep em vez de gerar imagem MJ + motion Runway. Editado no tab
  // "Prompts" em /admin/producao/funil (via PromptEditor · PoolSuggestions).
  reuseClipId?: string;
  reuseClipUrl?: string;
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
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [generatingFal, setGeneratingFal] = useState<string | null>(null);
  const [falProgress, setFalProgress] = useState<{ promptId: string; done: number; total: number } | null>(null);
  const [clips, setClips] = useState<Record<string, ClipState>>({});
  // Motion prompts override em Supabase (editados via /admin/producao/funil/motions).
  // Se Supabase tiver a versão guardada, usa essa; senão cai no JSON bundled.
  const [motionOverride, setMotionOverride] = useState<Record<string, string> | null>(null);

  // ── Load motion prompts editados em Supabase (fallback: JSON bundled) ──
  useEffect(() => {
    fetch("/api/admin/prompts/runway-motion/load", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.prompts && typeof d.prompts === "object") {
          setMotionOverride(d.prompts);
        }
      })
      .catch(() => {});
  }, []);

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
  // Este endpoint faz ~100+ list-calls ao Supabase (1 por cada subpasta de
  // prompt × 2 orientações) — pode demorar 5-15s. loadingAssets permite à UI
  // mostrar "a carregar" em vez de "sem imagens" nesse período.
  const reloadAssets = useCallback(async () => {
    setLoadingAssets(true);
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
    } finally {
      setLoadingAssets(false);
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

  const getMotionPrompt = useCallback(
    (imageName: string) => {
      const promptId = imageName.replace(/-[hv]-\d+\.\w+$/, "");
      // Prioridade: override em Supabase (editado em /funil/motions) → bundle
      // JSON → _default. motionOverride pode ser null se Supabase vazio.
      const override = motionOverride || {};
      const bundle = motionPrompts as Record<string, string>;
      return (
        override[promptId] ||
        bundle[promptId] ||
        override["_default"] ||
        bundle["_default"]
      );
    },
    [motionOverride],
  );

  // ── Actions ────────────────────────────────────────────────────────────
  const copy = (text: string, tag: string) => {
    navigator.clipboard.writeText(text);
    setCopied(tag);
    setTimeout(() => setCopied(null), 1500);
  };

  const generateFalFor = async (prompt: PromptItem, variations = 4) => {
    setGeneratingFal(prompt.id);
    setErr(null);

    const existing = images.filter((i) => i.promptId === prompt.id);
    let hCount = existing.filter((i) => i.name.includes("-h-")).length;

    for (let v = 1; v <= variations; v++) {
      setFalProgress({ promptId: prompt.id, done: v - 1, total: variations });
      const num = ++hCount;
      const filename = `${prompt.id}-h-${String(num).padStart(2, "0")}.png`;
      const category = `${prompt.id}/horizontal`;

      try {
        const r = await fetch("/api/admin/thinkdiffusion/generate-falai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: prompt.prompt,
            width: config.width ?? 1920,
            height: config.height ?? 1080,
            category,
            filename,
          }),
        });
        const d = await r.json();
        if (!r.ok || !d.url) {
          setErr(`${prompt.id} v${v}: ${d.erro ?? `HTTP ${r.status}`}`);
          break;
        }
        setImages((prev) => [...prev, { name: filename, url: d.url, promptId: prompt.id }]);
      } catch (e) {
        setErr(`${prompt.id} v${v}: ${e instanceof Error ? e.message : String(e)}`);
        break;
      }
    }

    setFalProgress(null);
    setGeneratingFal(null);
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

  // Episódios dinâmicos: trailer + ep01..epNN do Funil Nomear.
  // Exclui categorias de aulas ("sagrado", "silencio", "nua", "fome", "chama",
  // "proprio", "e") e placeholders "serie-X" que existem no NOMEAR_PRESETS
  // mas NÃO são episódios do funil. Filtro: /^(trailer|ep\d+)$/.
  // Ordenado: trailer primeiro, depois ep01, ep02, ... por número.
  const epOptions = ((): string[] => {
    const EPISODE_RE = /^(trailer|ep\d+)$/;
    const seen = new Set<string>();
    for (const preset of NOMEAR_PRESETS) {
      for (const s of preset.scripts) {
        const key = s.id.split("-")[1];
        if (!key || !EPISODE_RE.test(key)) continue;
        seen.add(key);
      }
    }
    return Array.from(seen).sort((a, b) => {
      if (a === "trailer") return -1;
      if (b === "trailer") return 1;
      return parseInt(a.replace("ep", ""), 10) - parseInt(b.replace("ep", ""), 10);
    });
  })();

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
      <div className="mb-4 max-h-40 overflow-y-auto rounded border border-escola-border bg-escola-card/50 p-2">
        <div className="flex flex-wrap gap-1">
          {epOptions.map((ep) => {
            const epPrompts = funilPrompts.filter((p) =>
              ep === "trailer"
                ? p.id.startsWith("nomear-trailer")
                : p.id.startsWith(`nomear-${ep}`),
            );
            const reused = epPrompts.filter((p) => !!p.reuseClipId).length;
            // Contar imagens geradas (por ep, agregado de todos os prompts do ep).
            const imgCount = epPrompts.reduce(
              (sum, p) => sum + (imagesByPrompt.get(p.id)?.length ?? 0),
              0,
            );
            const hasImages = imgCount > 0;
            const active = filter === ep;
            return (
              <button
                key={ep}
                onClick={() => setFilter(ep)}
                className={`rounded border px-2 py-1 text-[11px] transition-colors ${
                  active
                    ? "border-escola-dourado bg-escola-dourado/10 text-escola-dourado"
                    : hasImages
                      ? "border-escola-dourado/40 bg-escola-dourado/5 text-escola-creme hover:border-escola-dourado"
                      : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
                }`}
                title={
                  `${ep} · ${epPrompts.length} prompts` +
                  (hasImages ? ` · ${imgCount} imagens geradas` : "")
                }
              >
                <span className="font-semibold">{ep}</span>
                <span className="ml-1 text-[9px] text-escola-creme-50">
                  · {epPrompts.length}
                </span>
                {hasImages && (
                  <span
                    className="ml-1 rounded bg-escola-dourado/20 px-1 text-[9px] font-bold text-escola-dourado"
                    title={`${imgCount} imagens geradas`}
                  >
                    📷{imgCount}
                  </span>
                )}
                {reused > 0 && (
                  <span
                    className="ml-1 text-[9px] text-escola-dourado"
                    title={`${reused} prompts reciclados (sem geração necessária)`}
                  >
                    ♻{reused}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Prompts ──────────────────────────────────────────────────── */}
      <ul className="space-y-3">
        {filtered.map((p) => {
          const imgs = imagesByPrompt.get(p.id) ?? [];
          const isReused = !!p.reuseClipId;
          return (
            <li
              key={p.id}
              className={`rounded-xl border p-4 ${
                isReused
                  ? "border-escola-dourado/40 bg-escola-dourado/5"
                  : "border-escola-border bg-escola-card"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-escola-dourado">
                    {p.id}
                    {isReused && (
                      <span className="ml-2 rounded bg-escola-dourado/20 px-1.5 py-0.5 text-[9px] font-semibold text-escola-dourado">
                        ♻ reciclado de {p.reuseClipId?.split("-")[1] ?? "?"}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-escola-creme-50">{p.mood.join(" · ")}</p>
                  <p className="mt-2 text-xs leading-relaxed text-escola-creme-50">{p.prompt}</p>
                </div>
                {!isReused && (
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <button
                      onClick={() => copy(p.prompt, p.id)}
                      className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-xs text-escola-creme hover:border-escola-dourado/40"
                    >
                      {copied === p.id ? "✓ copiado" : "copiar"}
                    </button>
                    <button
                      onClick={() => generateFalFor(p, 4)}
                      disabled={generatingFal !== null}
                      className="rounded bg-escola-coral px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {generatingFal === p.id && falProgress
                        ? `gerando ${falProgress.done}/${falProgress.total}…`
                        : "gerar 4× fal.ai"}
                    </button>
                  </div>
                )}
              </div>

              {/* Prompt reciclado: mostra o clip reutilizado em vez de upload zone. */}
              {isReused && p.reuseClipUrl && (
                <div className="mt-3 flex items-start gap-3 rounded border border-escola-dourado/40 bg-escola-bg p-2">
                  <video
                    src={p.reuseClipUrl}
                    className="h-24 w-40 shrink-0 rounded border border-escola-border"
                    muted
                    onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                    onMouseLeave={(e) => {
                      const v = e.currentTarget as HTMLVideoElement;
                      v.pause();
                      v.currentTime = 0;
                    }}
                  />
                  <div className="min-w-0 flex-1 text-[11px] text-escola-creme-50">
                    <p className="text-escola-dourado">
                      Sem geração necessária — poupa subscrição MJ + créditos Runway.
                    </p>
                    <p className="mt-1 truncate text-escola-creme" title={p.reuseClipId}>
                      fonte: {p.reuseClipId}
                    </p>
                    <p className="mt-1">
                      Para limpar esta reciclagem e voltar ao fluxo normal de geração, abre
                      o tab &quot;Prompts&quot; em /admin/producao/funil e clica &quot;✗ limpar&quot;
                      na secção de reciclagem deste prompt.
                    </p>
                  </div>
                </div>
              )}

              {/* Upload area (só para prompts NÃO reciclados) */}
              {!isReused && (
                <UploadZone
                  promptId={p.id}
                  uploading={uploading === p.id}
                  onFiles={(files) => uploadForPrompt(p.id, files)}
                />
              )}

              {/* Loading state: evita impressao de "vazio" enquanto Supabase
                  responde (o endpoint list-images demora 5-15s). */}
              {loadingAssets && imgs.length === 0 && (
                <div className="mt-3 flex items-center justify-center gap-2 rounded border border-dashed border-escola-border py-4 text-[11px] text-escola-creme-50">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-escola-dourado" />
                  A carregar imagens já guardadas em Supabase...
                </div>
              )}

              {/* Images */}
              {imgs.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {imgs.map((img) => {
                    const clip = clips[img.name];
                    const promptId = img.name.replace(/-[hv]-\d+\.\w+$/, "");
                    const currentMotion =
                      (motionOverride && motionOverride[promptId]) ||
                      (motionPrompts as Record<string, string>)[promptId] ||
                      "";
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
                            <div className="flex shrink-0 items-center gap-1">
                              <span className="text-escola-dourado">✓</span>
                              <button
                                onClick={() => {
                                  if (!confirm(`Regenerar clip para ${img.name}?\n\nPaga novos créditos Runway. Usa o motion prompt actual (editável abaixo).`)) return;
                                  generateClip(img);
                                }}
                                className="rounded border border-escola-border px-1.5 py-0.5 text-escola-creme-50 hover:border-escola-terracota hover:text-escola-terracota"
                                title="Regenerar clip com motion prompt actual"
                              >
                                ↻
                              </button>
                            </div>
                          ) : (
                            <span className="text-escola-terracota">{clip.error ?? "erro"}</span>
                          )}
                        </div>
                        {/* Motion prompt — visivel + editavel inline. Regeneracao
                            usa a versao actual aqui (depois de Guardar). */}
                        <MotionPromptInline
                          promptId={promptId}
                          currentMotion={currentMotion}
                          onSaved={(val) =>
                            setMotionOverride((prev) => ({ ...(prev ?? {}), [promptId]: val }))
                          }
                        />
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

// ─── MotionPromptInline ───────────────────────────────────────────────────
// Mostra o motion prompt actual de um promptId, editavel inline. Guarda em
// Supabase via /api/admin/prompts/runway-motion/save — merge com o JSON
// guardado (nao sobrepoe prompts dos outros promptIds).
//
// Desenhado para resolver "regenerar as cegas": o user ve o prompt que vai
// ser usado no ↻, edita se quiser, guarda, e SÓ DEPOIS regenera.

function MotionPromptInline({
  promptId,
  currentMotion,
  onSaved,
}: {
  promptId: string;
  currentMotion: string;
  onSaved: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentMotion);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Reset draft se o motion actual muda por fora (outro save)
  useEffect(() => {
    if (!editing) setDraft(currentMotion);
  }, [currentMotion, editing]);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      // Load todos os prompts actuais primeiro, faz merge deste e save.
      const r1 = await fetch("/api/admin/prompts/runway-motion/load", {
        cache: "no-store",
      });
      const d1 = await r1.json();
      const all = (d1?.prompts && typeof d1.prompts === "object") ? d1.prompts as Record<string, string> : {};
      all[promptId] = draft;
      const r2 = await fetch("/api/admin/prompts/runway-motion/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts: all }),
      });
      const d2 = await r2.json();
      if (!r2.ok || d2.erro) throw new Error(d2.erro || `HTTP ${r2.status}`);
      onSaved(draft);
      setEditing(false);
      setSavedMsg("✓ guardado — regenerar usa esta versão");
      setTimeout(() => setSavedMsg(null), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const isEmpty = !currentMotion.trim();

  return (
    <div className="border-t border-escola-border bg-escola-bg/50 px-2 py-1.5">
      <div className="mb-1 flex items-center justify-between text-[9px]">
        <span className="uppercase tracking-wider text-escola-creme-50">
          motion prompt (Runway)
          {isEmpty && (
            <span className="ml-1 text-escola-terracota">⚠ sem motion — usa _default</span>
          )}
        </span>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="rounded border border-escola-border px-1.5 py-0.5 text-escola-creme-50 hover:text-escola-creme"
          >
            editar
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={() => {
                setDraft(currentMotion);
                setEditing(false);
              }}
              disabled={saving}
              className="rounded border border-escola-border px-1.5 py-0.5 text-escola-creme-50 hover:text-escola-creme disabled:opacity-30"
            >
              cancelar
            </button>
            <button
              onClick={save}
              disabled={saving || draft === currentMotion}
              className="rounded bg-escola-dourado px-1.5 py-0.5 font-semibold text-escola-bg disabled:opacity-30"
            >
              {saving ? "..." : "guardar"}
            </button>
          </div>
        )}
      </div>
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[10px] text-escola-creme"
        />
      ) : (
        <p className="whitespace-pre-wrap text-[10px] leading-relaxed text-escola-creme">
          {currentMotion || "(vazio)"}
        </p>
      )}
      {savedMsg && (
        <p className="mt-1 text-[9px] text-escola-dourado">{savedMsg}</p>
      )}
      {err && (
        <p className="mt-1 text-[9px] text-escola-terracota">erro: {err}</p>
      )}
    </div>
  );
}
