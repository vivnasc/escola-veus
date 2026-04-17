"use client";

import { useState, useEffect } from "react";

// Load prompts from the JSON file via import
import promptsData from "@/data/thinkdiffusion-prompts.json";
import videoPlan from "@/data/video-plan.json";

type PromptItem = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
};

type VideoEntry = {
  id: string;
  titulo: string;
  categorias: string[];
  prompts: number;
  variacoes: number;
};

type GeneratedImage = {
  promptId: string;
  base64: string;
  saved: boolean;
  url?: string;
};

const CATEGORIES = [...new Set(promptsData.prompts.map((p: PromptItem) => p.category))].sort();

export default function ThinkDiffusionPage() {
  const [serverUrl, setServerUrl] = useState("");
  const [selectedVideo, setSelectedVideo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [variationsPerPrompt, setVariationsPerPrompt] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [autoSave, setAutoSave] = useState(true);

  // Restore server URL from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("thinkdiffusion-url");
    if (saved) setServerUrl(saved);
    const savedImages = localStorage.getItem("thinkdiffusion-images");
    if (savedImages) {
      try { setImages(JSON.parse(savedImages)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (serverUrl) localStorage.setItem("thinkdiffusion-url", serverUrl);
  }, [serverUrl]);

  useEffect(() => {
    if (images.length > 0) {
      localStorage.setItem("thinkdiffusion-images", JSON.stringify(
        images.map((img) => ({ ...img, base64: img.base64.slice(0, 100) + "..." }))
      ));
    }
  }, [images]);

  // Filter by video or category
  const activeVideo = (videoPlan as VideoEntry[]).find((v) => v.id === selectedVideo);

  const filteredPrompts = activeVideo
    ? promptsData.prompts.filter((p: PromptItem) => activeVideo.categorias.includes(p.category))
    : selectedCategory === "all"
    ? promptsData.prompts
    : promptsData.prompts.filter((p: PromptItem) => p.category === selectedCategory);

  // Count how many variations exist per prompt
  const variationCounts: Record<string, number> = {};
  for (const img of images) {
    const baseId = img.promptId.replace(/-v\d+$/, "");
    variationCounts[baseId] = (variationCounts[baseId] || 0) + 1;
  }

  // Prompts that still need more variations
  const pendingPrompts: { prompt: PromptItem; variationNum: number }[] = [];
  for (const p of filteredPrompts) {
    const existing = variationCounts[p.id] || 0;
    for (let v = existing + 1; v <= variationsPerPrompt; v++) {
      pendingPrompts.push({ prompt: p, variationNum: v });
    }
  }

  const totalImages = filteredPrompts.length * variationsPerPrompt;
  const estimatedMinutes = Math.ceil((pendingPrompts.length * 25) / 60);
  const estimatedCost = ((pendingPrompts.length * 25) / 3600 * 0.79).toFixed(2);

  // Save image to Supabase
  const saveImage = async (img: GeneratedImage) => {
    try {
      const res = await fetch("/api/admin/thinkdiffusion/save-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: img.base64,
          filename: `${img.promptId}.png`,
          category: promptsData.prompts.find((p: PromptItem) => p.id === img.promptId)?.category || "",
        }),
      });
      const data = await res.json();
      if (data.url) {
        setImages((prev) =>
          prev.map((i) => (i.promptId === img.promptId ? { ...i, saved: true, url: data.url } : i))
        );
        return data.url;
      }
    } catch { /* ignore */ }
    return null;
  };

  // Generate ONE image (with variation number)
  const generateOne = async (prompt: PromptItem, variationNum: number): Promise<GeneratedImage | null> => {
    const fullId = `${prompt.id}-v${variationNum}`;
    setCurrentPrompt(fullId);
    setError(null);

    try {
      const res = await fetch("/api/admin/thinkdiffusion/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverUrl: serverUrl.trim(),
          prompt: prompt.prompt,
          negativePrompt: promptsData.config.negative_prompt,
          width: promptsData.config.width,
          height: promptsData.config.height,
          cfgScale: promptsData.config.cfg_scale,
          steps: promptsData.config.steps,
          samplerName: promptsData.config.sampler_name,
          batchSize: 1,
        }),
      });

      const data = await res.json();
      if (data.erro) throw new Error(data.erro);
      if (!data.images || data.images.length === 0) throw new Error("Sem imagens");

      const img: GeneratedImage = {
        promptId: fullId,
        base64: data.images[0],
        saved: false,
      };

      setImages((prev) => [...prev, img]);

      if (autoSave) {
        await saveImage(img);
      }

      return img;
    } catch (err) {
      setError(`${fullId}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  };

  // Generate ALL pending
  const generateAll = async () => {
    if (!serverUrl.trim()) {
      setError("Introduz o URL do ThinkDiffusion primeiro.");
      return;
    }

    setGenerating(true);
    setStopped(false);
    setProgress({ done: 0, total: pendingPrompts.length });

    for (let i = 0; i < pendingPrompts.length; i++) {
      if (stopped) break;
      setProgress({ done: i, total: pendingPrompts.length });
      await generateOne(pendingPrompts[i].prompt, pendingPrompts[i].variationNum);
    }

    setProgress((p) => ({ ...p, done: p.total }));
    setGenerating(false);
    setCurrentPrompt("");
  };

  const stopGenerating = () => {
    setStopped(true);
    setGenerating(false);
  };

  const savedCount = images.filter((i) => i.saved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-escola-creme">
          ThinkDiffusion — Gerar Imagens
        </h2>
        <span className="text-xs text-escola-creme-50">
          {images.length} geradas · {savedCount} guardadas no Supabase
        </span>
      </div>

      {/* ── SERVER URL ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          1. URL do ThinkDiffusion
        </h3>
        <p className="mb-2 text-xs text-escola-creme-50">
          Abre ThinkDiffusion → lança Automatic1111 → copia o URL da barra do browser.
        </p>
        <input
          type="text"
          placeholder="https://xxxxx.thinkdiffusion.xyz:7860"
          value={serverUrl}
          onChange={(e) => setServerUrl(e.target.value)}
          className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme placeholder:text-escola-creme-50/40"
        />
      </section>

      {/* ── VIDEO SELECTOR ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          2. Escolher Vídeo
        </h3>
        <select
          value={selectedVideo}
          onChange={(e) => {
            setSelectedVideo(e.target.value);
            if (e.target.value) {
              const v = (videoPlan as VideoEntry[]).find((x) => x.id === e.target.value);
              if (v) setVariationsPerPrompt(v.variacoes);
            }
          }}
          className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
        >
          <option value="">Todos (sem filtro de vídeo)</option>
          {(videoPlan as VideoEntry[]).map((v) => (
            <option key={v.id} value={v.id}>
              {v.id.replace("video-", "#")} — {v.titulo} ({v.categorias.join(" + ")})
            </option>
          ))}
        </select>
        {activeVideo && (
          <div className="mt-2 rounded bg-escola-bg p-2 text-xs text-escola-creme-50">
            <strong className="text-escola-creme">{activeVideo.titulo}</strong> —
            categorias: {activeVideo.categorias.join(", ")} ·
            {filteredPrompts.length} prompts × {variationsPerPrompt} variações =
            <strong className="text-escola-coral"> ~{filteredPrompts.length * variationsPerPrompt} imagens</strong>
            <br />Imagens guardadas em: <code className="text-escola-coral">youtube/images/{activeVideo.id}/</code>
          </div>
        )}
      </section>

      {/* ── CATEGORY FILTER ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          3. Prompts ({filteredPrompts.length} total · {pendingPrompts.length} por gerar)
        </h3>
        <div className="mb-3 flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded px-2 py-1 text-xs ${selectedCategory === "all" ? "bg-escola-coral text-white" : "bg-escola-border text-escola-creme-50"}`}
          >
            Todos ({promptsData.prompts.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = promptsData.prompts.filter((p: PromptItem) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded px-2 py-1 text-xs ${selectedCategory === cat ? "bg-escola-coral text-white" : "bg-escola-border text-escola-creme-50"}`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Prompts list */}
        <div className="max-h-60 space-y-1 overflow-y-auto">
          {filteredPrompts.map((p: PromptItem) => {
            const count = variationCounts[p.id] || 0;
            const complete = count >= variationsPerPrompt;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 rounded border px-2 py-1 text-xs ${
                  complete
                    ? "border-green-800/50 bg-green-950/20 text-green-300"
                    : count > 0
                    ? "border-yellow-800/50 bg-yellow-950/20 text-yellow-300"
                    : "border-escola-border text-escola-creme-50"
                }`}
              >
                <span className="font-mono font-bold">{complete ? "✓" : count > 0 ? `${count}` : "○"}</span>
                <span className="flex-1">{p.id}</span>
                <span className="text-escola-creme-50/50">{p.mood.join(", ")}</span>
                <span className="tabular-nums">{count}/{variationsPerPrompt}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── GENERATE ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          3. Gerar
        </h3>

        <div className="mb-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-escola-creme-50">
            Variações por prompt:
            <select
              value={variationsPerPrompt}
              onChange={(e) => setVariationsPerPrompt(Number(e.target.value))}
              className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
            >
              {[4, 10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-escola-creme-50">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
            Guardar no Supabase
          </label>
        </div>
        <div className="mb-3 text-xs text-escola-creme-50">
          {filteredPrompts.length} prompts × {variationsPerPrompt} variações = <strong className="text-escola-creme">{totalImages} imagens</strong> ·
          Pendentes: <strong className="text-escola-coral">{pendingPrompts.length}</strong> ·
          ~{estimatedMinutes} min · ~${estimatedCost}
        </div>

        {generating && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs text-escola-creme-50">
              <span>A gerar: {currentPrompt}</span>
              <span>{progress.done}/{progress.total}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-escola-border">
              <div
                className="h-full rounded-full bg-escola-coral transition-all"
                style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3 rounded bg-red-950/50 p-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          {!generating ? (
            <button
              onClick={generateAll}
              disabled={!serverUrl.trim() || pendingPrompts.length === 0}
              className="rounded bg-escola-coral px-4 py-2 text-sm font-semibold text-white disabled:opacity-30"
            >
              Gerar tudo ({pendingPrompts.length} imagens, ~{estimatedMinutes} min, ~${estimatedCost})
            </button>
          ) : (
            <button
              onClick={stopGenerating}
              className="rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Parar
            </button>
          )}
        </div>
      </section>

      {/* ── GALLERY ── */}
      {images.length > 0 && (
        <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
            Galeria ({images.length} imagens)
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img) => (
              <div key={img.promptId} className="space-y-1">
                <div className="relative aspect-video overflow-hidden rounded border border-escola-border">
                  {img.url ? (
                    <img src={img.url} alt={img.promptId} className="h-full w-full object-cover" />
                  ) : img.base64.length > 200 ? (
                    <img
                      src={`data:image/png;base64,${img.base64}`}
                      alt={img.promptId}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-escola-bg text-xs text-escola-creme-50">
                      (preview indisponivel)
                    </div>
                  )}
                  {img.saved && (
                    <span className="absolute top-1 right-1 rounded bg-green-800/80 px-1 text-xs text-white">
                      ☁ Supabase
                    </span>
                  )}
                </div>
                <p className="text-xs text-escola-creme-50">{img.promptId}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
