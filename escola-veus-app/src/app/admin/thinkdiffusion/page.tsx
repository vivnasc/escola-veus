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

  // Generate ONE image — calls ThinkDiffusion A1111 DIRECTLY from browser
  const generateOne = async (prompt: PromptItem, variationNum: number): Promise<GeneratedImage | null> => {
    const fullId = `${prompt.id}-v${variationNum}`;
    setCurrentPrompt(fullId);
    setError(null);

    try {
      const baseUrl = serverUrl.trim().replace(/\/+$/, "");

      // Call A1111 API directly from browser (has ThinkDiffusion session cookies)
      const res = await fetch(`${baseUrl}/sdapi/v1/txt2img`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.prompt,
          negative_prompt: promptsData.config.negative_prompt,
          width: promptsData.config.width,
          height: promptsData.config.height,
          cfg_scale: promptsData.config.cfg_scale,
          steps: promptsData.config.steps,
          sampler_name: promptsData.config.sampler_name,
          batch_size: 1,
          seed: -1,
          send_images: true,
          save_images: false,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`A1111 HTTP ${res.status}: ${errText.slice(0, 200)}`);
      }

      const data = await res.json();
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

        {/* Settings to copy once */}
        <div className="mb-3 rounded bg-escola-bg p-3">
          <p className="mb-2 text-xs font-semibold text-escola-coral">Configura UMA VEZ no ThinkDiffusion:</p>
          <div className="grid grid-cols-3 gap-2 text-xs text-escola-creme-50">
            <span>Width: <strong className="text-escola-creme">1920</strong></span>
            <span>Height: <strong className="text-escola-creme">1080</strong></span>
            <span>CFG: <strong className="text-escola-creme">6</strong></span>
            <span>Steps: <strong className="text-escola-creme">35</strong></span>
            <span>Sampler: <strong className="text-escola-creme">DPM++ 2M Karras</strong></span>
            <span>Batch: <strong className="text-escola-creme">4</strong></span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(promptsData.config.negative_prompt);
              alert("Negative prompt copiado! Cola no campo Negative Prompt do ThinkDiffusion.");
            }}
            className="mt-2 rounded bg-escola-border px-3 py-1 text-xs text-escola-creme hover:bg-escola-border/80"
          >
            Copiar Negative Prompt
          </button>
        </div>

        {/* Prompts list with COPY buttons */}
        <div className="space-y-2">
          {filteredPrompts.map((p: PromptItem) => (
            <div
              key={p.id}
              className="rounded border border-escola-border bg-escola-bg p-3"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-escola-creme">{p.id}</span>
                <span className="text-xs text-escola-creme-50">{p.mood.join(", ")}</span>
              </div>
              <p className="mb-2 text-xs leading-relaxed text-escola-creme-50">
                {p.prompt.slice(0, 120)}...
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(p.prompt);
                  setCurrentPrompt(p.id);
                  setTimeout(() => setCurrentPrompt(""), 2000);
                }}
                className={`w-full rounded py-2 text-sm font-bold ${
                  currentPrompt === p.id
                    ? "bg-green-700 text-white"
                    : "bg-escola-coral text-white hover:bg-escola-coral/90"
                }`}
              >
                {currentPrompt === p.id ? "✓ COPIADO!" : `COPIAR PROMPT`}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── GENERATE VIA SCRIPT ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          3. Gerar via API (automático)
        </h3>

        <div className="mb-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-escola-creme-50">
            Variações por prompt:
            <select
              value={variationsPerPrompt}
              onChange={(e) => setVariationsPerPrompt(Number(e.target.value))}
              className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
            >
              {[4, 7, 10, 20, 30].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-3 text-xs text-escola-creme-50">
          {filteredPrompts.length} prompts × {variationsPerPrompt} variações = <strong className="text-escola-creme">{totalImages} imagens</strong> ·
          ~{estimatedMinutes} min · ~${estimatedCost}
        </div>

        <div className="mb-4 rounded bg-escola-bg p-3">
          <p className="mb-2 text-sm text-escola-creme">
            <strong>Como funciona:</strong>
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-xs text-escola-creme-50">
            <li>Clica no botão abaixo para <strong className="text-escola-creme">copiar o script</strong></li>
            <li>Vai ao tab do <strong className="text-escola-creme">ThinkDiffusion</strong></li>
            <li>Abre a consola: <strong className="text-escola-creme">F12</strong> → tab <strong className="text-escola-creme">Console</strong></li>
            <li>Cola o script (<strong className="text-escola-creme">Ctrl+V</strong>) e carrega <strong className="text-escola-creme">Enter</strong></li>
            <li>As imagens geram automaticamente e vão para o Supabase</li>
          </ol>
        </div>

        <button
          onClick={async () => {
            const params = new URLSearchParams();
            if (selectedVideo) params.set("video", selectedVideo);
            else if (selectedCategory !== "all") params.set("category", selectedCategory);
            params.set("variations", String(variationsPerPrompt));

            const res = await fetch(`/api/admin/thinkdiffusion/gen-script?${params}`);
            const script = await res.text();
            await navigator.clipboard.writeText(script);
            setCurrentPrompt("SCRIPT_COPIED");
            setTimeout(() => setCurrentPrompt(""), 3000);
          }}
          className={`w-full rounded-lg px-6 py-4 text-lg font-bold shadow-lg ${
            currentPrompt === "SCRIPT_COPIED"
              ? "bg-green-700 text-white"
              : "bg-escola-coral text-white hover:bg-escola-coral/90"
          }`}
        >
          {currentPrompt === "SCRIPT_COPIED"
            ? "✓ SCRIPT COPIADO! Agora cola na consola do ThinkDiffusion (F12)"
            : `COPIAR SCRIPT (${totalImages} imagens)`}
        </button>
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
