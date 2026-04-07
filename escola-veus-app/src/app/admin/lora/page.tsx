"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type TrainingStatus = "idle" | "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

interface TrainingState {
  status: TrainingStatus;
  requestId: string | null;
  error: string | null;
  weightsUrl: string | null;
  logsTail: string | null;
}

export default function LoRAPage() {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<TrainingState>({
    status: "idle",
    requestId: null,
    error: null,
    weightsUrl: null,
    logsTail: null,
  });

  const [triggerWord, setTriggerWord] = useState("veus_figure");
  const [steps, setSteps] = useState(1000);
  const [uploading, setUploading] = useState(false);
  const [datasetUrl, setDatasetUrl] = useState("");
  const [imageCount, setImageCount] = useState(0);

  // Dataset generation
  const [basePrompt, setBasePrompt] = useState(
    "Minimalist flat vector illustration of a faceless human figure, smooth rounded silhouette, no race, no facial features, no clothing details, single dark muted purple color palette. Subtle layered veil integrated into the body, flowing asymmetrically from the head down one side. Soft organic shapes, clean edges, no outlines, no texture, no gradients or very subtle gradient. Neutral light background. Simple shadow under feet. Calm, symbolic, abstract, modern."
  );
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);

  const VARIATIONS = [
    "standing tall, arms relaxed at sides, veil flowing behind",
    "sitting cross-legged, veil draped over shoulders like a shawl",
    "walking forward, veil trailing behind like a path",
    "arms slightly open, veil lifting off the body, lighter tone",
    "kneeling, veil pooling on the ground around the figure",
    "back turned, looking over shoulder, veil covering half the body",
    "two figures facing each other, connected by a shared veil",
    "figure emerging from darkness, veil dissolving into light particles",
    "figure holding the veil in outstretched hands, examining it",
    "figure with multiple layered veils, each a slightly different shade",
    "figure mid-step on a bridge, veil blowing in wind",
    "figure standing before a mirror, reflection shows figure without veil",
    "figure reaching upward, veil sliding off naturally",
    "small figure and large figure side by side, same veil connecting them",
    "figure surrounded by falling veil fragments like petals",
    "figure standing in a doorway, veil caught on the threshold",
  ];

  async function generateDataset() {
    setGenerating(true);
    setGenProgress(0);
    const images: string[] = [];

    for (let i = 0; i < VARIATIONS.length; i++) {
      setGenProgress(i + 1);
      try {
        const prompt = `${basePrompt} ${VARIATIONS[i]}`;
        const res = await fetch("/api/admin/courses/generate-image-flux", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, courseSlug: "lora", sceneLabel: `dataset-${i}`, width: 1024, height: 1024 }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) images.push(data.url);
        }
      } catch { /* skip failed ones */ }
      setGeneratedImages([...images]);
    }

    setGenerating(false);
    setImageCount(images.length);
  }

  function removeImage(index: number) {
    setGeneratedImages((prev) => prev.filter((_, i) => i !== index));
  }

  // Restore training state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lora-training-fal");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch { /* ignore */ }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (state.requestId) {
      localStorage.setItem("lora-training-fal", JSON.stringify(state));
    }
  }, [state]);

  // Poll for status
  const checkStatus = useCallback(async () => {
    if (!state.requestId) return;
    try {
      const res = await fetch(`/api/admin/courses/train-lora/status?id=${state.requestId}`);
      const data = await res.json();

      if (data.erro) {
        setState((s) => ({ ...s, error: data.erro, status: "FAILED" }));
        return;
      }

      setState((s) => ({
        ...s,
        status: data.status as TrainingStatus,
        logsTail: data.logs_tail ?? s.logsTail,
        error: data.error || null,
        weightsUrl: data.weights_url || s.weightsUrl,
      }));
    } catch { /* keep polling */ }
  }, [state.requestId]);

  useEffect(() => {
    if (state.status === "IN_QUEUE" || state.status === "IN_PROGRESS") {
      pollRef.current = setInterval(checkStatus, 10000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [state.status, checkStatus]);

  // Upload images ZIP to Supabase
  async function uploadDataset(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload ZIP directly to our API which stores in Supabase
      const res = await fetch("/api/admin/courses/list-assets", {
        method: "POST",
        body: formData,
      });

      // Fallback: upload via Supabase direct
      const reader = new FileReader();
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uploadRes = await fetch("/api/admin/courses/save-manifest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseSlug: "lora",
            sceneLabel: "dataset",
            manifest: { type: "zip-upload", filename: file.name },
          }),
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          setDatasetUrl(data.manifestUrl?.replace(".json", ".zip") || "");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (e) {
      setState((s) => ({ ...s, error: e instanceof Error ? e.message : "Erro upload" }));
    } finally {
      setUploading(false);
    }
  }

  async function startTraining() {
    if (!datasetUrl) {
      setState((s) => ({ ...s, error: "Primeiro faz upload do ZIP de imagens." }));
      return;
    }

    setState({ status: "IN_QUEUE", requestId: null, error: null, weightsUrl: null, logsTail: null });

    try {
      const res = await fetch("/api/admin/courses/train-lora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images_data_url: datasetUrl,
          trigger_word: triggerWord,
          steps,
          is_style: true,
        }),
      });
      const data = await res.json();

      if (data.erro) {
        setState((s) => ({ ...s, status: "FAILED", error: data.erro }));
        return;
      }

      setState((s) => ({ ...s, requestId: data.request_id, status: "IN_QUEUE" }));
    } catch (e) {
      setState((s) => ({ ...s, status: "FAILED", error: e instanceof Error ? e.message : "Erro de rede" }));
    }
  }

  function resetTraining() {
    localStorage.removeItem("lora-training-fal");
    if (pollRef.current) clearInterval(pollRef.current);
    setState({ status: "idle", requestId: null, error: null, weightsUrl: null, logsTail: null });
  }

  const isActive = state.status === "IN_QUEUE" || state.status === "IN_PROGRESS";
  const isDone = state.status === "COMPLETED";
  const isFailed = state.status === "FAILED";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-escola-creme">Treinar LoRA</h1>
        <p className="mt-1 text-sm text-escola-creme-50">
          Treina a figurinha da Escola dos Véus via fal.ai. Usa a mesma FAL_KEY que ja tens.
        </p>
      </div>

      {/* Step 0: Generate dataset */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6">
        <h2 className="text-xs text-escola-creme-50 uppercase mb-4">0. Gerar imagens de referencia</h2>
        <p className="text-sm text-escola-creme mb-3">
          Gera {VARIATIONS.length} variações da figurinha automaticamente via Flux Pro (a tua FAL_KEY).
          Edita o prompt base se quiseres, depois clica gerar. Remove as que não gostares.
        </p>

        <textarea value={basePrompt} onChange={(e) => setBasePrompt(e.target.value)} rows={4}
          className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none resize-y font-mono leading-relaxed mb-3" />

        <button onClick={generateDataset} disabled={generating}
          className="rounded-lg bg-escola-dourado px-4 py-2 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
          {generating ? `A gerar... ${genProgress}/${VARIATIONS.length}` : `Gerar ${VARIATIONS.length} variações`}
        </button>

        {generatedImages.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-escola-creme-50 mb-2">{generatedImages.length} imagens geradas — clica para remover as que nao gostares:</p>
            <div className="grid grid-cols-4 gap-2">
              {generatedImages.map((url, i) => (
                <div key={i} className="relative group cursor-pointer" onClick={() => removeImage(i)}>
                  <img src={url} alt={`var-${i}`} className="w-full aspect-square object-cover rounded-lg border border-escola-border" />
                  <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/30 rounded-lg transition-colors flex items-center justify-center">
                    <span className="text-white text-xs opacity-0 group-hover:opacity-100">Remover</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 1: Upload dataset */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6">
        <h2 className="text-xs text-escola-creme-50 uppercase mb-4">1. Dataset de imagens</h2>
        <p className="text-sm text-escola-creme mb-3">
          Faz upload de um ZIP com as imagens acima (ou gera manualmente noutro sitio).
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input ref={fileInputRef} type="file" accept=".zip" className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadDataset(file);
              }} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="rounded-lg border border-escola-dourado/40 px-4 py-2 text-sm text-escola-dourado hover:bg-escola-dourado/10 disabled:opacity-40">
              {uploading ? "A enviar..." : "Upload ZIP"}
            </button>
            {datasetUrl && <span className="text-xs text-green-400">ZIP carregado</span>}
          </div>

          <div className="text-xs text-escola-creme-50">
            Ou cola o URL de um ZIP ja hospedado:
          </div>
          <input type="text" placeholder="https://... .zip"
            value={datasetUrl} onChange={(e) => setDatasetUrl(e.target.value)}
            className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme placeholder:text-escola-creme-50/40 focus:border-escola-dourado focus:outline-none" />
        </div>
      </div>

      {/* Step 2: Configure */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6">
        <h2 className="text-xs text-escola-creme-50 uppercase mb-4">2. Configuracao</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-escola-creme-50">Trigger word</label>
            <input type="text" value={triggerWord} onChange={(e) => setTriggerWord(e.target.value)}
              className="mt-1 w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-dourado font-mono focus:border-escola-dourado focus:outline-none" />
            <p className="mt-1 text-[10px] text-escola-creme-50">Usa esta palavra no prompt para activar o estilo</p>
          </div>
          <div>
            <label className="text-xs text-escola-creme-50">Steps de treino</label>
            <input type="number" value={steps} onChange={(e) => setSteps(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none" />
            <p className="mt-1 text-[10px] text-escola-creme-50">1000 = bom equilibrio (~5-10 min)</p>
          </div>
        </div>
      </div>

      {/* Step 3: Train */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6">
        <h2 className="text-xs text-escola-creme-50 uppercase mb-4">3. Treinar</h2>

        {state.status === "idle" && (
          <div>
            <div className="rounded-lg bg-escola-bg p-4 mb-4 text-xs text-escola-creme-50 space-y-1">
              <p className="text-escola-creme">O que vai acontecer:</p>
              <p>1. O fal.ai recebe o ZIP de imagens</p>
              <p>2. Treina um LoRA Flux durante {steps} passos (~5-10 min)</p>
              <p>3. Grava o ficheiro de pesos no Supabase</p>
              <p>4. A partir dai, todas as imagens geradas usam o teu estilo automaticamente</p>
            </div>

            <button onClick={startTraining} disabled={!datasetUrl}
              className="w-full rounded-lg bg-escola-dourado px-4 py-3 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
              Treinar LoRA
            </button>
          </div>
        )}

        {isActive && (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-sm text-escola-creme">
                  {state.status === "IN_QUEUE" ? "Na fila..." : "A treinar..."}
                </span>
              </div>
              <div className="w-full rounded-full bg-escola-bg h-2">
                <div className="bg-escola-dourado h-2 rounded-full transition-all duration-1000 animate-pulse"
                  style={{ width: state.status === "IN_QUEUE" ? "10%" : "60%" }} />
              </div>
            </div>
            <p className="text-xs text-escola-creme-50">
              Podes fechar esta pagina. O treino continua. Volta depois para ver o resultado.
            </p>
            {state.requestId && (
              <p className="mt-2 text-[10px] text-escola-dourado/60 font-mono">ID: {state.requestId}</p>
            )}
          </div>
        )}

        {isDone && (
          <div>
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-sm text-green-400">LoRA treinado com sucesso</span>
              </div>
              <p className="text-xs text-green-400/80">
                Todas as imagens geradas no pipeline vao usar o teu estilo automaticamente.
              </p>
              <p className="text-xs text-green-400/80 mt-1">
                No prompt, usa <code className="text-green-400 font-mono">{triggerWord}</code> para activar.
              </p>
            </div>

            <button onClick={resetTraining}
              className="text-xs text-escola-creme-50 hover:text-escola-creme">
              Treinar de novo (com novas imagens)
            </button>
          </div>
        )}

        {isFailed && (
          <div>
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 mb-4">
              <p className="text-sm text-escola-terracota mb-1">Erro no treino</p>
              <p className="text-xs text-escola-terracota/80">{state.error || "Erro desconhecido"}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={startTraining} disabled={!datasetUrl}
                className="rounded-lg bg-escola-dourado px-4 py-3 text-sm font-medium text-escola-bg hover:opacity-90">
                Tentar de novo
              </button>
              <button onClick={resetTraining}
                className="rounded-lg border border-escola-border px-4 py-3 text-sm text-escola-creme hover:border-escola-dourado/40">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {state.error && state.status === "idle" && (
          <p className="mt-2 text-xs text-escola-terracota">{state.error}</p>
        )}
      </div>
    </div>
  );
}
