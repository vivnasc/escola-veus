"use client";

import { useState, useEffect } from "react";

// JSON actua como seed/fallback. Em runtime carregamos da API (Supabase).
import seedPrompts from "@/data/thinkdiffusion-prompts.json";
import videoPlan from "@/data/video-plan.json";
import motionPrompts from "@/data/runway-motion-prompts.json";

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

export default function ThinkDiffusionPage() {
  // Prompts editaveis — carregados da API no mount, com fallback para o JSON seed
  const [promptsList, setPromptsList] = useState<PromptItem[]>(
    seedPrompts.prompts as PromptItem[]
  );
  const [promptsSource, setPromptsSource] = useState<"supabase" | "json" | "loading">("loading");

  // Edicao inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Novo prompt
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPromptId, setNewPromptId] = useState("");
  const [newPromptCategory, setNewPromptCategory] = useState("");
  const [newPromptMood, setNewPromptMood] = useState("");
  const [newPromptText, setNewPromptText] = useState("");

  const CATEGORIES = [...new Set(promptsList.map((p) => p.category))].sort();

  const reloadPrompts = async () => {
    try {
      const r = await fetch("/api/admin/thinkdiffusion/prompts", { cache: "no-store" });
      const data = await r.json();
      if (Array.isArray(data.prompts) && data.prompts.length > 0) {
        setPromptsList(data.prompts as PromptItem[]);
        setPromptsSource(data.source === "supabase" ? "supabase" : "json");
      }
    } catch {
      setPromptsSource("json");
    }
  };

  const savePromptEdit = async (id: string) => {
    setSavingId(id);
    try {
      const r = await fetch("/api/admin/thinkdiffusion/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, prompt: editDraft }),
      });
      const data = await r.json();
      if (data.ok) {
        setPromptsList((prev) =>
          prev.map((p) => (p.id === id ? { ...p, prompt: editDraft } : p))
        );
        setEditingId(null);
        setEditDraft("");
      } else {
        alert("Erro a guardar: " + (data.erro || "desconhecido"));
      }
    } finally {
      setSavingId(null);
    }
  };

  const addNewPrompt = async () => {
    if (!newPromptId || !newPromptCategory || !newPromptText) {
      alert("id, categoria e prompt sao obrigatorios");
      return;
    }
    const mood = newPromptMood
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    const r = await fetch("/api/admin/thinkdiffusion/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newPromptId,
        category: newPromptCategory,
        mood,
        prompt: newPromptText,
      }),
    });
    const data = await r.json();
    if (data.ok) {
      await reloadPrompts();
      setShowAddForm(false);
      setNewPromptId("");
      setNewPromptCategory("");
      setNewPromptMood("");
      setNewPromptText("");
    } else {
      alert("Erro: " + (data.erro || "desconhecido"));
    }
  };

  const deletePrompt = async (id: string) => {
    if (!confirm(`Apagar prompt ${id}?`)) return;
    const r = await fetch(`/api/admin/thinkdiffusion/prompts?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await r.json();
    if (data.ok) {
      setPromptsList((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Erro: " + (data.erro || "desconhecido"));
    }
  };

  const seedSupabase = async () => {
    if (!confirm("Importar todos os prompts do JSON para Supabase? (upsert — nao apaga existentes)"))
      return;
    const r = await fetch("/api/admin/thinkdiffusion/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "seed" }),
    });
    const data = await r.json();
    if (data.ok) {
      alert(`Importados ${data.count} prompts.`);
      await reloadPrompts();
    } else {
      alert("Erro: " + (data.erro || "desconhecido"));
    }
  };

  // Editable motion prompts per image
  const [editedMotion, setEditedMotion] = useState<Record<string, string>>({});

  const getMotionPrompt = (imageName: string) => {
    if (editedMotion[imageName]) return editedMotion[imageName];
    const promptId = imageName.replace(/-[hv]-\d+\.\w+$/, "");
    return (motionPrompts as Record<string, string>)[promptId] || (motionPrompts as Record<string, string>)["_default"];
  };

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
          motionPrompt: getMotionPrompt(imageName),
          provider: "runway",
          ratio: imageName.includes("-v-") ? "720:1280" : "1280:720",
        }),
      });

      const data = await res.json();
      if (data.erro) throw new Error(data.erro);
      if (!data.taskId) throw new Error("Sem taskId");

      setClips((prev) => ({ ...prev, [imageName]: { ...prev[imageName], taskId: data.taskId, status: "processing" } }));

      // Save taskId to Supabase IMMEDIATELY — never lose it
      fetch("/api/admin/thinkdiffusion/save-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: data.taskId, imageName, imageUrl }),
      }).catch(() => {});

      // Poll for completion + save to Supabase
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
            // Save clip to Supabase
            let finalUrl = task.videoUrl;
            try {
              const saveRes = await fetch("/api/admin/thinkdiffusion/save-clip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoUrl: task.videoUrl, filename: imageName.replace(/\.\w+$/, ".mp4") }),
              });
              const saveData = await saveRes.json();
              if (saveData.url) finalUrl = saveData.url;
            } catch { /* keep Runway URL */ }

            setClips((prev) => ({ ...prev, [imageName]: { ...prev[imageName], status: "done", clipUrl: finalUrl + "?t=" + Date.now() } }));
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
  const [showSettings, setShowSettings] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
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

  // On mount: carregar prompts da API (com fallback para JSON seed)
  useEffect(() => {
    reloadPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On mount: check Supabase for existing uploaded images via server API
  useEffect(() => {
    // Sync images
    fetch("/api/admin/thinkdiffusion/list-images")
      .then((r) => r.json())
      .then((data) => {
        if (data.images && data.images.length > 0) setUploadedImages(data.images);
      })
      .catch(() => {});

    // Sync existing clips
    fetch("/api/admin/thinkdiffusion/list-clips")
      .then((r) => r.json())
      .then((data) => {
        if (data.clips) {
          const clipState: Record<string, ClipState> = {};
          for (const clip of data.clips) {
            // Match by base name: mar-01-golden-hour-h-01 (without extension)
            // Try matching with .png and .jpg extensions
            const baseName = clip.name;
            const possibleImageNames = [`${baseName}.png`, `${baseName}.jpg`, `${baseName}.jpeg`];
            for (const imgName of possibleImageNames) {
              clipState[imgName] = {
                imageUrl: "",
                imageName: imgName,
                status: "done",
                clipUrl: clip.url,
              };
            }
          }
          setClips(clipState);
        }
      })
      .catch(() => {});
  }, []);

  // On mount: auto-recover Runway taskIds pendentes. Se houver clips que
  // terminaram no Runway mas o cliente desistiu (timeout, fechou browser,
  // recarga), apanha-os sem precisar de clique. Notifica só quando há
  // algo realmente recuperado, para não fazer ruido desnecessário.
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/thinkdiffusion/recover-all", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.erro) return;
        if (d.recovered > 0 || d.alreadySaved > 0 || d.pending > 0) {
          const parts = [
            d.recovered > 0 ? `${d.recovered} recuperados agora` : null,
            d.pending > 0 ? `${d.pending} ainda a gerar no Runway` : null,
          ].filter(Boolean);
          if (parts.length > 0) {
            setCurrentPrompt(`✨ Auto-recover: ${parts.join(" · ")}`);
            setTimeout(() => setCurrentPrompt(""), 6000);
          }
          if (d.recovered > 0) {
            // Re-sincroniza a lista de clips localmente.
            fetch("/api/admin/thinkdiffusion/list-clips")
              .then((r) => r.json())
              .then((data) => {
                if (!data.clips) return;
                const clipState: Record<string, ClipState> = {};
                for (const clip of data.clips) {
                  const baseName = clip.name;
                  for (const ext of [".png", ".jpg", ".jpeg"]) {
                    clipState[baseName + ext] = {
                      imageUrl: "",
                      imageName: baseName + ext,
                      status: "done",
                      clipUrl: clip.url,
                    };
                  }
                }
                setClips(clipState);
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => { /* silencioso — não é bloqueador */ });
    return () => controller.abort();
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
    ? promptsList.filter((p: PromptItem) => activeVideo.categorias.includes(p.category))
    : selectedCategory === "all"
    ? promptsList
    : promptsList.filter((p: PromptItem) => p.category === selectedCategory);

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
          category: promptsList.find((p: PromptItem) => p.id === img.promptId)?.category || "",
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
          width: seedPrompts.config.width,
          height: seedPrompts.config.height,
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

      {/* ── DASHBOARD ESTADO DOS VIDEOS ── */}
      <AgStatusDashboard />

      {/* ── THINKDIFFUSION SETTINGS (collapsible) ── */}
      <section className="rounded-lg border border-escola-coral/40 bg-escola-bg-card p-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowSettings(!showSettings)}>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            {showSettings ? "▼" : "▶"} Settings ThinkDiffusion
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

        {showSettings && (<>
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
              value={seedPrompts.config.negative_prompt}
              className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme-50"
              rows={2}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(seedPrompts.config.negative_prompt);
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
        </>)}
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

      {/* ── PROMPTS (editaveis) ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <div className="flex items-center justify-between">
          <h3
            className="text-sm font-semibold uppercase tracking-wider text-escola-coral cursor-pointer"
            onClick={() => setShowPrompts(!showPrompts)}
          >
            {showPrompts ? "▼" : "▶"} Prompts ({filteredPrompts.length} total) — clica para {showPrompts ? "ocultar" : "ver"}
          </h3>
          <span className={`text-[10px] uppercase tracking-wider ${
            promptsSource === "supabase" ? "text-green-500"
              : promptsSource === "json" ? "text-yellow-500" : "text-escola-creme-50"
          }`}>
            {promptsSource === "supabase" ? "● editavel (supabase)"
              : promptsSource === "json" ? "○ read-only (json fallback)"
              : "a carregar..."}
          </span>
        </div>
        {showPrompts && (<>
        <div className="mt-3 mb-3 flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded px-2 py-1 text-xs ${selectedCategory === "all" ? "bg-escola-coral text-white" : "bg-escola-border text-escola-creme-50"}`}
          >
            Todos ({promptsList.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = promptsList.filter((p: PromptItem) => p.category === cat).length;
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

        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded bg-green-700 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
          >
            {showAddForm ? "× cancelar" : "+ novo prompt"}
          </button>
          {promptsSource === "json" && (
            <button
              onClick={seedSupabase}
              className="rounded bg-yellow-700 px-3 py-1 text-xs font-semibold text-white hover:bg-yellow-600"
              title="Importa todos os prompts do JSON para Supabase (upsert)"
            >
              ↑ importar JSON para Supabase
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="mb-3 rounded border border-green-800/50 bg-green-950/20 p-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="id (ex: mar-16-novo)"
                value={newPromptId}
                onChange={(e) => setNewPromptId(e.target.value)}
                className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
              />
              <input
                type="text"
                placeholder="categoria (ex: mar)"
                value={newPromptCategory}
                onChange={(e) => setNewPromptCategory(e.target.value)}
                className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
              />
              <input
                type="text"
                placeholder="mood (ex: calma, vasto)"
                value={newPromptMood}
                onChange={(e) => setNewPromptMood(e.target.value)}
                className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
              />
            </div>
            <textarea
              placeholder="prompt completo..."
              value={newPromptText}
              onChange={(e) => setNewPromptText(e.target.value)}
              rows={4}
              className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
            />
            <button
              onClick={addNewPrompt}
              className="rounded bg-green-700 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600"
            >
              Criar prompt
            </button>
          </div>
        )}

        {/* Prompts list editaveis */}
        <div className="space-y-2">
          {filteredPrompts.map((p: PromptItem) => {
            const count = variationCounts[p.id] || 0;
            const complete = count >= variationsPerPrompt;
            const isEditing = editingId === p.id;
            const isSaving = savingId === p.id;
            return (
              <div
                key={p.id}
                className={`rounded border p-3 ${
                  isEditing
                    ? "border-blue-600 bg-blue-950/20"
                    : complete
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

                {isEditing ? (
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={6}
                    className="mb-2 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
                  />
                ) : (
                  <p className="mb-2 text-xs leading-relaxed text-escola-creme-50/70 whitespace-pre-wrap">
                    {p.prompt}
                  </p>
                )}

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => savePromptEdit(p.id)}
                        disabled={isSaving || promptsSource !== "supabase"}
                        className="flex-1 rounded bg-blue-700 py-2 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50"
                      >
                        {isSaving ? "a guardar..." : "✓ GUARDAR"}
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditDraft(""); }}
                        className="rounded bg-escola-border px-3 py-2 text-sm text-escola-creme-50 hover:bg-escola-bg"
                      >
                        cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(p.prompt);
                          setCurrentPrompt(p.id);
                          setTimeout(() => setCurrentPrompt(""), 2000);
                        }}
                        className={`flex-1 rounded py-2 text-sm font-bold ${
                          currentPrompt === p.id
                            ? "bg-green-700 text-white"
                            : "bg-escola-coral text-white hover:bg-escola-coral/90"
                        }`}
                      >
                        {currentPrompt === p.id ? "✓ COPIADO!" : "COPIAR"}
                      </button>
                      <button
                        onClick={() => { setEditingId(p.id); setEditDraft(p.prompt); }}
                        disabled={promptsSource !== "supabase"}
                        className="rounded bg-blue-800 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={promptsSource !== "supabase" ? "Importa primeiro o JSON para Supabase" : "Editar prompt"}
                      >
                        ✎ editar
                      </button>
                      <button
                        onClick={() => deletePrompt(p.id)}
                        disabled={promptsSource !== "supabase"}
                        className="rounded bg-red-900 px-3 py-2 text-sm text-white hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        title={promptsSource !== "supabase" ? "Importa primeiro o JSON para Supabase" : "Apagar prompt"}
                      >
                        🗑
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </>)}
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
          4. Upload de Imagens + Gerar Clips
        </h3>
        <p className="mb-3 text-xs text-escola-creme-50">
          Arrasta imagens para cada prompt. Horizontais e verticais são separadas automaticamente.
        </p>

        {/* Motion prompts: download template + upload filled */}
        {uploadedImages.length > 0 && (
          <div className="mb-4 flex gap-2">
            <a
              href="/api/admin/thinkdiffusion/export-template"
              download
              className="rounded bg-escola-border px-4 py-2 text-sm font-semibold text-escola-creme hover:bg-escola-border/80"
            >
              Download template motion prompts (.md)
            </a>
            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".md,.txt";
                input.onchange = async () => {
                  if (!input.files?.[0]) return;
                  const text = await input.files[0].text();
                  const res = await fetch("/api/admin/thinkdiffusion/import-prompts", {
                    method: "POST",
                    body: text,
                  });
                  const data = await res.json();
                  if (data.prompts) {
                    setEditedMotion(data.prompts);
                    setError(null);
                    setCurrentPrompt(`${data.count} motion prompts carregados!`);
                    setTimeout(() => setCurrentPrompt(""), 3000);
                  } else {
                    setError(data.erro || "Erro ao importar.");
                  }
                };
                input.click();
              }}
              className="rounded bg-escola-coral px-4 py-2 text-sm font-semibold text-white hover:bg-escola-coral/90"
            >
              Upload motion prompts (.md)
            </button>
          </div>
        )}

        {/* Widget de estado — visibilidade do que há/não há em Supabase e
            no Runway. Primeira coisa que a Vivianne vê se "nada aparece". */}
        <RecoveryStatusWidget />

        {/* Recuperação automática — usa os taskIds guardados em Supabase
            no momento do submit (youtube/tasks/*.json). Um clique recupera
            tudo o que deu timeout ou foi abandonado. Créditos Runway não
            se perdem: o task fica acessível por tempo no dev.runwayml.com. */}
        <div className="mb-4 rounded-lg border border-green-700/50 bg-green-950/10 p-4">
          <h4 className="mb-2 text-sm font-semibold text-green-400">
            ✨ Recuperar clips automaticamente (zero input)
          </h4>
          <p className="mb-2 text-xs text-escola-creme-50">
            Lê todos os taskIds pendentes em Supabase, consulta o Runway e
            guarda os clips que já terminaram. Usa isto se deu timeout e
            tens medo de ter perdido créditos — os clips estão lá.
          </p>
          <button
            onClick={async () => {
              setCurrentPrompt("A consultar taskIds pendentes...");
              try {
                const res = await fetch("/api/admin/thinkdiffusion/recover-all");
                const d = await res.json();
                if (d.erro) throw new Error(d.erro);
                const msg = `✓ ${d.recovered} recuperados · ${d.alreadySaved} já tinhas · ${d.failed} falharam · ${d.pending} ainda a gerar (${d.total} total)`;
                setCurrentPrompt(msg);
                setTimeout(() => setCurrentPrompt(""), 8000);
                // Força reload da lista de clips na biblioteca.
                window.dispatchEvent(new Event("focus"));
              } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
                setCurrentPrompt("");
              }
            }}
            className="w-full rounded bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-500"
          >
            RECUPERAR TUDO AUTOMATICAMENTE
          </button>
        </div>

        {/* Recover clips by taskId (manual fallback) */}
        <div className="mb-4 rounded-lg border border-yellow-800/50 bg-yellow-950/10 p-4">
          <h4 className="mb-2 text-sm font-semibold text-yellow-400">Recuperar clips perdidos (manual)</h4>
          <p className="mb-2 text-xs text-escola-creme-50">
            Vai a dev.runwayml.com → Request History → copia os taskIds dos URLs (ex: /v1/tasks/<strong>abc123-def456</strong>). Cola aqui, um por linha.
          </p>
          <textarea
            id="recovery-taskids"
            rows={4}
            placeholder="Cole taskIds aqui, um por linha..."
            className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-xs text-escola-creme mb-2"
          />
          <button
            onClick={async () => {
              const textarea = document.getElementById("recovery-taskids") as HTMLTextAreaElement;
              const taskIds = textarea.value.split("\n").map((l) => l.trim()).filter((l) => l.length > 10);
              if (taskIds.length === 0) { setError("Cola taskIds primeiro."); return; }

              setCurrentPrompt(`A recuperar ${taskIds.length} clips...`);
              let recovered = 0;

              for (const taskId of taskIds) {
                try {
                  const statusRes = await fetch("/api/admin/courses/animation-status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tasks: [{ type: "clip", taskId }], provider: "runway" }),
                  });
                  const statusData = await statusRes.json();
                  const task = statusData.tasks?.[0];

                  if (task?.status === "done" && task?.videoUrl) {
                    const saveRes = await fetch("/api/admin/thinkdiffusion/save-clip", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ videoUrl: task.videoUrl, filename: `recovered-${taskId.slice(0, 8)}.mp4` }),
                    });
                    const saveData = await saveRes.json();
                    if (saveData.url) recovered++;
                  }
                } catch { /* skip */ }
              }

              setCurrentPrompt(`✓ ${recovered}/${taskIds.length} clips recuperados!`);
              setTimeout(() => setCurrentPrompt(""), 5000);
            }}
            className="w-full rounded bg-yellow-600 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-500"
          >
            RECUPERAR CLIPS
          </button>
        </div>

        {/* Recover timeout clips (in-memory) */}
        {(() => {
          const timeoutClips = Object.values(clips).filter((c) => c.status === "failed" && c.taskId);
          if (timeoutClips.length === 0) return null;
          return (
            <div className="mb-4">
              <button
                onClick={async () => {
                  for (const clip of timeoutClips) {
                    if (!clip.taskId) continue;
                    setClips((prev) => ({ ...prev, [clip.imageName]: { ...prev[clip.imageName], status: "processing" } }));

                    try {
                      const statusRes = await fetch("/api/admin/courses/animation-status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tasks: [{ type: "clip", taskId: clip.taskId }], provider: "runway" }),
                      });
                      const statusData = await statusRes.json();
                      const task = statusData.tasks?.[0];

                      if (task?.status === "done" && task?.videoUrl) {
                        let finalUrl = task.videoUrl;
                        try {
                          const saveRes = await fetch("/api/admin/thinkdiffusion/save-clip", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ videoUrl: task.videoUrl, filename: clip.imageName.replace(/\.\w+$/, ".mp4") }),
                          });
                          const saveData = await saveRes.json();
                          if (saveData.url) finalUrl = saveData.url;
                        } catch { /* keep Runway URL */ }
                        setClips((prev) => ({ ...prev, [clip.imageName]: { ...prev[clip.imageName], status: "done", clipUrl: finalUrl } }));
                      } else {
                        setClips((prev) => ({ ...prev, [clip.imageName]: { ...prev[clip.imageName], status: "failed", error: task?.status || "Ainda a processar" } }));
                      }
                    } catch (err) {
                      setClips((prev) => ({ ...prev, [clip.imageName]: { ...prev[clip.imageName], status: "failed", error: String(err) } }));
                    }
                  }
                }}
                className="w-full rounded-lg bg-green-700 px-6 py-4 text-lg font-bold text-white shadow-lg hover:bg-green-600"
              >
                RECUPERAR {timeoutClips.length} CLIPS TIMEOUT
              </button>
            </div>
          );
        })()}

        {/* Generate ALL clips button */}
        {uploadedImages.length > 0 && (() => {
          const hImages = uploadedImages.filter((i) => i.name.includes("-h-"));
          const withoutClip = hImages.filter((i) => !clips[i.name] || clips[i.name].status === "idle");
          const processing = Object.values(clips).filter((c) => c.status === "processing" || c.status === "submitting").length;
          const done = Object.values(clips).filter((c) => c.status === "done").length;
          const cost = withoutClip.length * 50;

          return (
            <div className="mb-4 rounded-lg border border-escola-coral/40 bg-escola-bg p-4">
              <div className="mb-2 text-xs text-escola-creme-50">
                {hImages.length} horizontais · {done} clips prontos · {processing > 0 ? `${processing} a processar · ` : ""}{withoutClip.length} por gerar · {cost} créditos
              </div>
              <button
                onClick={async () => {
                  for (let i = 0; i < withoutClip.length; i++) {
                    generateClip(withoutClip[i].url, withoutClip[i].name);
                    if (i < withoutClip.length - 1) await new Promise((r) => setTimeout(r, 5000));
                  }
                }}
                disabled={withoutClip.length === 0 || processing > 0}
                className="w-full rounded-lg bg-escola-coral px-6 py-4 text-lg font-bold text-white shadow-lg hover:bg-escola-coral/90 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {processing > 0
                  ? `A processar ${processing} clips...`
                  : withoutClip.length === 0
                  ? `✓ Todos os ${done} clips horizontais gerados`
                  : `GERAR ${withoutClip.length} CLIPS HORIZONTAIS (${cost} cr)`}
              </button>
            </div>
          );
        })()}

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
                          <textarea
                            value={getMotionPrompt(img.name)}
                            onChange={(e) => setEditedMotion((prev) => ({ ...prev, [img.name]: e.target.value }))}
                            rows={2}
                            className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme mb-1"
                            placeholder="Motion prompt..."
                          />
                          {clip?.status === "submitting" ? (
                            <span className="block text-center text-xs text-yellow-400">A enviar...</span>
                          ) : clip?.status === "processing" ? (
                            <span className="block text-center text-xs text-yellow-400 animate-pulse">A processar...</span>
                          ) : clip?.status === "done" ? (<>
                            <div className="flex gap-1">
                              <button
                                onClick={() => generateClip(img.url, img.name)}
                                className="flex-1 rounded bg-yellow-700 py-1 text-xs font-bold text-white hover:bg-yellow-600"
                              >
                                Regenerar (50 cr)
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm("Apagar este clip?")) return;
                                  const clipName = img.name.replace(/\.\w+$/, ".mp4");
                                  await fetch("/api/admin/thinkdiffusion/save-clip", {
                                    method: "DELETE",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ filename: clipName }),
                                  });
                                  setClips((prev) => { const n = { ...prev }; delete n[img.name]; return n; });
                                }}
                                className="rounded bg-red-800 px-2 py-1 text-xs text-white hover:bg-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          </>) : clip?.status === "failed" ? (<>
                            <span className="block text-center text-xs text-red-400 mb-1">{clip.error || "Erro"}</span>
                            <button
                              onClick={() => generateClip(img.url, img.name)}
                              className="w-full rounded bg-escola-coral py-1 text-xs font-bold text-white hover:bg-escola-coral/90"
                            >
                              Tentar de novo (50 cr)
                            </button>
                          </>) : (
                            <button
                              onClick={() => generateClip(img.url, img.name)}
                              className="w-full rounded bg-escola-coral py-1 text-xs font-bold text-white hover:bg-escola-coral/90"
                            >
                              {img.name.includes("-v-") ? "Gerar Short (50 cr)" : "Gerar clip (50 cr)"}
                            </button>
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

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard de estado por vídeo Ancient Ground
// ─────────────────────────────────────────────────────────────────────────────

type AgStatus = {
  promptsCount: number;
  imagesCount: number;
  clipsCount: number;
  videoRendered: boolean;
};
type AgVideo = {
  id: string;
  titulo: string;
  categorias: string[];
  status: AgStatus;
};

function AgStatusDashboard() {
  const [videos, setVideos] = useState<AgVideo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || videos) return;
    setLoading(true);
    fetch("/api/admin/ancient-ground/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.videos)) setVideos(d.videos);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, videos]);

  const summary = videos
    ? {
        rendered: videos.filter((v) => v.status.videoRendered).length,
        withImages: videos.filter((v) => v.status.imagesCount > 0).length,
        total: videos.length,
      }
    : null;

  return (
    <section className="rounded-lg border border-escola-border bg-escola-bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            Dashboard de estado dos vídeos AG
          </h3>
          <p className="text-xs text-escola-creme-50">
            {summary
              ? `${summary.rendered}/${summary.total} renderizados · ${summary.withImages}/${summary.total} com imagens`
              : "clica para carregar"}
          </p>
        </div>
        <span className="text-escola-creme-50">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-escola-border">
          {loading && (
            <p className="p-4 text-xs text-escola-creme-50">A carregar (~3s)...</p>
          )}
          {videos && (
            <ul className="divide-y divide-escola-border">
              {videos.map((v) => (
                <li key={v.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-escola-creme">
                        {v.id.replace("video-", "#")} · {v.titulo}
                      </p>
                      <p className="text-[10px] text-escola-creme-50">
                        {v.categorias.join(" + ")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <AgPill
                      label="prompts"
                      ok={v.status.promptsCount > 0}
                      value={String(v.status.promptsCount)}
                    />
                    <AgPill
                      label="imagens"
                      ok={v.status.promptsCount > 0 && v.status.imagesCount >= v.status.promptsCount}
                      partial={
                        v.status.imagesCount > 0 && v.status.imagesCount < v.status.promptsCount
                      }
                      value={`${v.status.imagesCount}`}
                    />
                    <AgPill
                      label="clips"
                      ok={v.status.clipsCount > 0 && v.status.clipsCount >= v.status.promptsCount}
                      partial={
                        v.status.clipsCount > 0 && v.status.clipsCount < v.status.promptsCount
                      }
                      value={`${v.status.clipsCount}`}
                    />
                    <AgPill
                      label="render"
                      ok={v.status.videoRendered}
                      value={v.status.videoRendered ? "✓" : "×"}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function AgPill({
  label,
  value,
  ok,
  partial,
}: {
  label: string;
  value: string;
  ok?: boolean;
  partial?: boolean;
}) {
  let cls = "bg-escola-border text-escola-creme-50";
  if (ok) cls = "bg-escola-dourado/10 text-escola-dourado";
  else if (partial) cls = "bg-escola-terracota/10 text-escola-terracota";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${cls}`}>
      <span className="text-[9px] uppercase tracking-wider opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

// ── Widget de estado de recuperação Runway ─────────────────────────────────
// Mostra clips guardados vs tasks pendentes. Ajuda a Vivianne a perceber se
// "nada aparece" porque:
//   (a) os taskIds foram guardados mas o Runway ainda os está a gerar ou
//       os outputs já expiraram → tenta recover-all.
//   (b) NADA foi guardado (save-task falhou silenciosamente) → única via
//       é dev.runwayml.com > Request History + fallback manual.

function RecoveryStatusWidget() {
  const [status, setStatus] = useState<{
    clipsCount: number;
    tasksCount: number;
    tasksRecent: Array<{ taskId: string; imageName?: string; ageMinutes?: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/thinkdiffusion/status", { cache: "no-store" });
      const d = await r.json();
      setStatus(d);
    } catch {
      // keep null
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading && !status) {
    return (
      <div className="mb-4 rounded-lg border border-escola-border bg-escola-bg-card p-4 text-xs text-escola-creme-50">
        A verificar estado da biblioteca...
      </div>
    );
  }
  if (!status) return null;

  const noTasks = status.tasksCount === 0;
  const manyPending = status.tasksCount > 0;

  return (
    <div
      className={`mb-4 rounded-lg border p-4 text-xs ${
        noTasks
          ? "border-red-700/50 bg-red-950/10"
          : manyPending
            ? "border-yellow-700/50 bg-yellow-950/10"
            : "border-escola-border bg-escola-bg-card"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-escola-creme">📊 Estado da biblioteca</h4>
        <button
          onClick={load}
          className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
        >
          🔄 Refrescar
        </button>
      </div>
      <div className="mb-2 flex flex-wrap gap-3 text-escola-creme-50">
        <span>
          Clips guardados: <strong className="text-escola-creme">{status.clipsCount}</strong>
        </span>
        <span>
          Tasks pendentes: <strong className={status.tasksCount > 0 ? "text-yellow-300" : "text-escola-creme"}>{status.tasksCount}</strong>
        </span>
      </div>

      {noTasks && status.clipsCount === 0 && (
        <p className="text-red-300">
          Nenhum clip e nenhuma task pendente. Se submeteste clips e deu timeout, os taskIds
          não foram guardados em Supabase (erro silencioso do save-task). Tens duas opções:
          <br />1) Voltar a gerar (custo novo).
          <br />2) Ir a <a className="underline" href="https://dev.runwayml.com" target="_blank" rel="noopener">dev.runwayml.com</a> → Request History → copiar taskIds e colar no fallback manual em baixo.
        </p>
      )}
      {noTasks && status.clipsCount > 0 && (
        <p className="text-escola-creme-50">
          Biblioteca OK, sem tasks pendentes. Se falta algum clip, provavelmente o submit foi feito sem passar pelo save-task — vê dev.runwayml.com para os mais recentes.
        </p>
      )}
      {manyPending && (
        <>
          <p className="mb-2 text-yellow-300">
            {status.tasksCount} task{status.tasksCount === 1 ? "" : "s"} pendente{status.tasksCount === 1 ? "" : "s"} — cliquem em <strong>RECUPERAR TUDO</strong> em baixo para consultar o Runway.
          </p>
          {status.tasksRecent.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-[10px] text-escola-creme-50">
                Ver {status.tasksRecent.length} mais recentes
              </summary>
              <ul className="mt-1 space-y-0.5 pl-4 text-[10px] text-escola-creme-50">
                {status.tasksRecent.map((t) => (
                  <li key={t.taskId}>
                    <code className="text-escola-creme">{t.taskId.slice(0, 8)}</code>
                    {t.imageName && <> · {t.imageName}</>}
                    {typeof t.ageMinutes === "number" && <> · há {t.ageMinutes}min</>}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}
