"use client";

import { useState, useEffect } from "react";

// Load prompts from the JSON file via import
import promptsData from "@/data/thinkdiffusion-prompts.json";

type PromptItem = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [generating, setGenerating] = useState(false);
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

  const filteredPrompts = selectedCategory === "all"
    ? promptsData.prompts
    : promptsData.prompts.filter((p: PromptItem) => p.category === selectedCategory);

  const alreadyGenerated = new Set(images.map((img) => img.promptId));

  const pendingPrompts = filteredPrompts.filter(
    (p: PromptItem) => !alreadyGenerated.has(p.id)
  );

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

  // Generate ONE image
  const generateOne = async (prompt: PromptItem): Promise<GeneratedImage | null> => {
    setCurrentPrompt(prompt.id);
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
        promptId: prompt.id,
        base64: data.images[0],
        saved: false,
      };

      setImages((prev) => [...prev, img]);

      // Auto-save to Supabase
      if (autoSave) {
        await saveImage(img);
      }

      return img;
    } catch (err) {
      setError(`${prompt.id}: ${err instanceof Error ? err.message : String(err)}`);
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
    setProgress({ done: 0, total: pendingPrompts.length });

    for (let i = 0; i < pendingPrompts.length; i++) {
      if (!generating && i > 0) break; // cancelled
      setProgress({ done: i, total: pendingPrompts.length });
      await generateOne(pendingPrompts[i]);
    }

    setProgress((p) => ({ ...p, done: p.total }));
    setGenerating(false);
    setCurrentPrompt("");
  };

  const stopGenerating = () => {
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

      {/* ── CATEGORY FILTER ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          2. Prompts ({filteredPrompts.length} total · {pendingPrompts.length} por gerar)
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
            const done = alreadyGenerated.has(p.id);
            const img = images.find((i) => i.promptId === p.id);
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 rounded border px-2 py-1 text-xs ${
                  done
                    ? "border-green-800/50 bg-green-950/20 text-green-300"
                    : "border-escola-border text-escola-creme-50"
                }`}
              >
                <span className="font-mono font-bold">{done ? "✓" : "○"}</span>
                <span className="flex-1">{p.id}</span>
                <span className="text-escola-creme-50/50">{p.mood.join(", ")}</span>
                {img?.saved && <span className="text-green-400">☁</span>}
                {!done && !generating && (
                  <button
                    onClick={() => generateOne(p)}
                    className="rounded bg-escola-coral/20 px-2 py-0.5 text-escola-coral hover:bg-escola-coral/30"
                  >
                    Gerar
                  </button>
                )}
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

        <div className="mb-3 flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-escola-creme-50">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
            Guardar automaticamente no Supabase
          </label>
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
              Gerar {pendingPrompts.length} imagens pendentes
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
