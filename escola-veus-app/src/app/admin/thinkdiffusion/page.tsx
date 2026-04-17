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

type ClipState = {
  imageUrl: string;
  imageName: string;
  taskId?: string;
  status: "idle" | "submitting" | "processing" | "done" | "failed";
  clipUrl?: string;
  error?: string;
};

const CATEGORIES = [...new Set(promptsData.prompts.map((p: PromptItem) => p.category))].sort();

export default function ThinkDiffusionPage() {
  // Runway clips
  const [clips, setClips] = useState<Record<string, ClipState>>({});

  const generateClip = async (imageUrl: string, imageName: string) => {
    setClips((prev) => ({ ...prev, [imageName]: { imageUrl, imageName, status: "submitting" } }));

    try {
      const res = await fetch("/api/admin/courses/submit-animation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          motionPrompt: "slow cinematic camera movement, gentle natural motion, soft light changes, 4k film quality",
          provider: "runway",
        }),
      });

      const data = await res.json();
      if (data.erro) throw new Error(data.erro);
      if (!data.taskId) throw new Error("Sem taskId");

      setClips((prev) => ({ ...prev, [imageName]: { ...prev[imageName], taskId: data.taskId, status: "processing" } }));

      // Poll for completion
      const pollClip = async (taskId: string) => {
        for (let i = 0; i < 60; i++) {
          await new Promise((r) => setTimeout(r, 10000));

          const statusRes = await fetch("/api/admin/courses/animation-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tasks: [{ type: "clip", taskId }], provider: "runway" }),
          });

          const statusData = await statusRes.json();
          const task = statusData.tasks?.[0];

          if (task?.status === "done" && task?.videoUrl) {
            setClips((prev) => ({ ...prev, [imageName]: { ...prev[imageName], status: "done", clipUrl: task.videoUrl } }));
            return;
          }
          if (task?.status === "failed") {
            setClips((prev) => ({ ...prev, [imageName]: { ...prev[imageName], status: "failed", error: task.failureReason || "Falhou" } }));
            return;
          }
        }
        setClips((prev) => ({ ...prev, [imageName]: { ...prev[imageName], status: "failed", error: "Timeout" } }));
      };

      pollClip(data.taskId);
    } catch (err) {
      setClips((prev) => ({
        ...prev,
        [imageName]: { ...prev[imageName], status: "failed", error: err instanceof Error ? err.message : String(err) },
      }));
    }
  };

  // Upload state
  const [uploadPromptId, setUploadPromptId] = useState("");
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0, current: "" });
  const [uploadedImages, setUploadedImages] = useState<Array<{ name: string; url: string; promptId: string }>>([]);
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

  // On mount: check Supabase for existing uploaded images
  useEffect(() => {
    const syncWithSupabase = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      const found: Array<{ name: string; url: string; promptId: string }> = [];

      for (const p of promptsData.prompts) {
        const promptFolder = p.id.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        for (const orient of ["horizontal", "vertical"]) {
          const { data } = await supabase.storage
            .from("course-assets")
            .list(`youtube/images/${promptFolder}/${orient}`, { limit: 100 });

          if (data) {
            for (const f of data) {
              if (f.name.match(/\.(png|jpg|jpeg)$/i)) {
                found.push({
                  name: f.name,
                  url: `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/images/${promptFolder}/${orient}/${f.name}`,
                  promptId: p.id,
                });
              }
            }
          }
        }
      }

      if (found.length > 0) setUploadedImages(found);
    };

    syncWithSupabase();
  }, []);

  useEffect(() => {
  }, []);

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

  // Generate ONE image via fal.ai (server-side, no CORS issues)
  const generateOne = async (prompt: PromptItem, variationNum: number): Promise<GeneratedImage | null> => {
    const fullId = `${prompt.id}-v${variationNum}`;
    setCurrentPrompt(fullId);
    setError(null);

    try {
      const res = await fetch("/api/admin/thinkdiffusion/generate-falai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.prompt,
          width: promptsData.config.width,
          height: promptsData.config.height,
          category: prompt.category,
          filename: `${fullId}.png`,
        }),
      });

      const data = await res.json();
      if (data.erro) throw new Error(data.erro);
      if (!data.url) throw new Error("Sem URL da imagem");

      const img: GeneratedImage = {
        promptId: fullId,
        base64: "",
        saved: true,
        url: data.url,
      };

      setImages((prev) => [...prev, img]);

      return img;
    } catch (err) {
      setError(`${fullId}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  };

  // Generate ALL pending
  const generateAll = async () => {
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

  // Upload files for a specific prompt
  const handleFileUploadForPrompt = async (files: File[], promptId: string) => {
    setUploadProgress({ done: 0, total: files.length, current: `${promptId}...` });

    const existing = uploadedImages.filter((i) => i.promptId === promptId);
    let hCount = existing.filter((i) => i.name.includes("-h-")).length;
    let vCount = existing.filter((i) => i.name.includes("-v-")).length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ done: i, total: files.length, current: `${promptId} ${i + 1}/${files.length}` });

      try {
        const orientation = await new Promise<"h" | "v">((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img.width >= img.height ? "h" : "v");
          img.onerror = () => resolve("h");
          img.src = URL.createObjectURL(file);
        });

        const count = orientation === "h" ? ++hCount : ++vCount;
        const padded = String(count).padStart(2, "0");
        const orient = orientation === "h" ? "horizontal" : "vertical";
        const ext = file.name.endsWith(".jpg") || file.name.endsWith(".jpeg") ? "jpg" : "png";
        const newName = `${promptId}-${orientation}-${padded}.${ext}`;
        const category = `${promptId.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}/${orient}`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("filename", newName);
        formData.append("category", category);

        const res = await fetch("/api/admin/thinkdiffusion/save-image", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.url) {
          setUploadedImages((prev) => [...prev, { name: newName, url: data.url, promptId }]);
        } else if (data.erro) {
          setError(`${newName}: ${data.erro}`);
        }
      } catch (err) {
        setError(`Erro: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    setUploadProgress((p) => ({ ...p, done: p.total, current: "Completo!" }));
  };

  const savedCount = images.filter((i) => i.saved).length;

  // Upload files per prompt — FormData binary, no compression
  const handleFileUpload = async (files: File[]) => {
    if (!uploadPromptId) {
      setError("Selecciona o prompt primeiro!");
      return;
    }

    setUploadProgress({ done: 0, total: files.length, current: "A preparar..." });

    const existing = uploadedImages.filter((i) => i.promptId === uploadPromptId);
    let hCount = existing.filter((i) => i.name.includes("-h-")).length;
    let vCount = existing.filter((i) => i.name.includes("-v-")).length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ done: i, total: files.length, current: `${uploadPromptId} ${i + 1}/${files.length}` });

      try {
        // Detect orientation
        const orientation = await new Promise<"h" | "v">((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img.width >= img.height ? "h" : "v");
          img.onerror = () => resolve("h");
          img.src = URL.createObjectURL(file);
        });

        const count = orientation === "h" ? ++hCount : ++vCount;
        const padded = String(count).padStart(2, "0");
        const orient = orientation === "h" ? "horizontal" : "vertical";
        const ext = file.name.endsWith(".jpg") || file.name.endsWith(".jpeg") ? "jpg" : "png";
        const newName = `${uploadPromptId}-${orientation}-${padded}.${ext}`;
        const category = `${uploadPromptId.split("-").slice(0, -1).join("-") || "misc"}/${orient}`;

        // Send as FormData (binary, not base64 — stays under 4.5MB limit)
        const formData = new FormData();
        formData.append("file", file);
        formData.append("filename", newName);
        formData.append("category", category);

        const res = await fetch("/api/admin/thinkdiffusion/save-image", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.url) {
          setUploadedImages((prev) => [...prev, { name: newName, url: data.url, promptId: uploadPromptId }]);
        } else if (data.erro) {
          setError(`${newName}: ${data.erro}`);
        }
      } catch (err) {
        setError(`Erro: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    setUploadProgress((p) => ({ ...p, done: p.total, current: "Completo!" }));
  };

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

      {/* ── THINKDIFFUSION SETTINGS ── */}
      <section className="rounded-lg border border-escola-coral/40 bg-escola-bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            Settings ThinkDiffusion (Automatic1111)
          </h3>
          <a
            href="https://www.thinkdiffusion.com/sd"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-escola-coral px-3 py-1 text-xs font-bold text-white hover:bg-escola-coral/90"
          >
            Abrir ThinkDiffusion →
          </a>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 rounded bg-escola-bg p-3 text-xs">
          <div><span className="text-escola-creme-50">Checkpoint:</span> <strong className="text-escola-creme">RealVisXL v4</strong></div>
          <div><span className="text-escola-creme-50">Width:</span> <strong className="text-escola-creme">1920</strong></div>
          <div><span className="text-escola-creme-50">Height:</span> <strong className="text-escola-creme">1080</strong></div>
          <div><span className="text-escola-creme-50">CFG Scale:</span> <strong className="text-escola-creme">6</strong></div>
          <div><span className="text-escola-creme-50">Steps:</span> <strong className="text-escola-creme">35</strong></div>
          <div><span className="text-escola-creme-50">Sampler:</span> <strong className="text-escola-creme">DPM++ 2M Karras</strong></div>
          <div><span className="text-escola-creme-50">Batch size:</span> <strong className="text-escola-creme">4</strong></div>
          <div><span className="text-escola-creme-50">Vertical:</span> <strong className="text-escola-creme">1080 × 1920</strong></div>
          <div><span className="text-escola-creme-50">Horizontal:</span> <strong className="text-escola-creme">1920 × 1080</strong></div>
        </div>

        <div>
          <p className="mb-1 text-xs text-escola-creme-50">Negative prompt (cola no ThinkDiffusion uma vez):</p>
          <div className="flex items-start gap-2">
            <textarea
              readOnly
              value={promptsData.config.negative_prompt}
              className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme-50"
              rows={2}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(promptsData.config.negative_prompt);
                setCurrentPrompt("NEG_COPIED");
                setTimeout(() => setCurrentPrompt(""), 2000);
              }}
              className={`rounded px-3 py-2 text-xs font-bold ${
                currentPrompt === "NEG_COPIED" ? "bg-green-700 text-white" : "bg-escola-coral text-white"
              }`}
            >
              {currentPrompt === "NEG_COPIED" ? "✓ Copiado" : "Copiar"}
            </button>
          </div>
        </div>
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

        {/* Prompts list with COPY buttons */}
        <div className="space-y-2">
          {filteredPrompts.map((p: PromptItem) => {
            const count = variationCounts[p.id] || 0;
            const complete = count >= variationsPerPrompt;
            return (
              <div
                key={p.id}
                className={`rounded border p-3 ${
                  complete
                    ? "border-green-800/50 bg-green-950/20"
                    : count > 0
                    ? "border-yellow-800/50 bg-yellow-950/20"
                    : "border-escola-border bg-escola-bg"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-escola-creme">{p.id}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-escola-creme-50">{p.mood.join(", ")}</span>
                    <span className="tabular-nums text-xs text-escola-creme-50">{count}/{variationsPerPrompt}</span>
                  </div>
                </div>
                <p className="mb-2 text-xs leading-relaxed text-escola-creme-50/70">
                  {p.prompt.slice(0, 150)}...
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
                  {currentPrompt === p.id ? "✓ COPIADO!" : "COPIAR PROMPT"}
                </button>
              </div>
            );
          })}
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
              disabled={pendingPrompts.length === 0}
              className="w-full rounded-lg bg-escola-coral px-6 py-4 text-lg font-bold text-white shadow-lg hover:bg-escola-coral/90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              GERAR {pendingPrompts.length} IMAGENS (~{estimatedMinutes} min)
            </button>
          ) : (
            <button
              onClick={stopGenerating}
              className="w-full rounded-lg bg-red-700 px-6 py-4 text-lg font-bold text-white shadow-lg hover:bg-red-600"
            >
              PARAR
            </button>
          )}
        </div>
      </section>

      {/* ── UPLOAD ALL AT ONCE ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          4. Upload de Imagens (ThinkDiffusion → Supabase)
        </h3>
        <p className="mb-3 text-xs text-escola-creme-50">
          Arrasta imagens para cada prompt. Horizontais e verticais são separadas automaticamente.
        </p>

        {uploadProgress.total > 0 && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs text-escola-creme-50">
              <span>{uploadProgress.current}</span>
              <span>{uploadProgress.done}/{uploadProgress.total}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-escola-border">
              <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filteredPrompts.map((p: PromptItem) => {
            const uploaded = uploadedImages.filter((i) => i.promptId === p.id);
            const hImgs = uploaded.filter((i) => i.name.includes("-h-"));
            const vImgs = uploaded.filter((i) => i.name.includes("-v-"));
            return (
              <div key={p.id} className={`rounded border p-3 ${uploaded.length > 0 ? "border-green-800/50 bg-green-950/10" : "border-escola-border bg-escola-bg"}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-escola-creme">{uploaded.length > 0 ? "✓ " : ""}{p.id}</span>
                  <span className={`text-xs font-bold ${uploaded.length > 0 ? "text-green-400" : "text-escola-creme-50"}`}>{uploaded.length > 0 ? `${hImgs.length}H + ${vImgs.length}V` : "sem imagens"}</span>
                </div>
                <div
                    className="flex min-h-24 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-escola-coral/40 bg-escola-bg-card p-4 hover:border-escola-coral/80 hover:bg-escola-coral/5 transition-colors"
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
                      if (files.length > 0) handleFileUploadForPrompt(files, p.id);
                    }}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.multiple = true;
                      input.accept = "image/*";
                      input.onchange = () => {
                        if (input.files && input.files.length > 0) handleFileUploadForPrompt(Array.from(input.files), p.id);
                      };
                      input.click();
                    }}
                  >
                    <div className="text-center">
                      <p className="text-sm font-bold text-escola-coral">Arrasta ou clica</p>
                      <p className="text-xs text-escola-creme-50">{p.id}</p>
                    </div>
                  </div>
                {uploaded.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {uploaded.map((img) => {
                      const clip = clips[img.name];
                      return (
                        <div key={img.name} className="space-y-1">
                          <div className={`relative overflow-hidden rounded border border-green-800/50 ${img.name.includes("-v-") ? "aspect-[9/16]" : "aspect-video"}`}>
                            {clip?.status === "done" && clip.clipUrl ? (
                              <video src={clip.clipUrl} controls className="h-full w-full object-cover" />
                            ) : (
                              <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                            )}
                            {clip?.status === "processing" && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <span className="text-xs text-white animate-pulse">Runway...</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-green-300 truncate">{img.name}</p>
                          {!clip || clip.status === "idle" ? (
                            <button
                              onClick={() => generateClip(img.url, img.name)}
                              className="w-full rounded bg-escola-coral py-1 text-xs font-bold text-white hover:bg-escola-coral/90"
                            >
                              Gerar clip
                            </button>
                          ) : clip.status === "submitting" ? (
                            <span className="block text-center text-xs text-yellow-400">A enviar...</span>
                          ) : clip.status === "processing" ? (
                            <span className="block text-center text-xs text-yellow-400 animate-pulse">A processar...</span>
                          ) : clip.status === "done" ? (
                            <span className="block text-center text-xs text-green-400">✓ Clip pronto</span>
                          ) : (
                            <span className="block text-center text-xs text-red-400">{clip.error || "Erro"}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
