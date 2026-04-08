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

const STORAGE_KEY_IMAGES = "lora-dataset-images";
const STORAGE_KEY_TRAINING = "lora-training-fal";

export default function LoRAPage() {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<TrainingState>({
    status: "idle",
    requestId: null,
    error: null,
    weightsUrl: null,
    logsTail: null,
  });

  const [triggerWord, setTriggerWord] = useState("veus_figure");
  const [steps, setSteps] = useState(1000);
  const [datasetUrl, setDatasetUrl] = useState("");
  const [creatingZip, setCreatingZip] = useState(false);

  // Dataset generation
  const [basePrompt, setBasePrompt] = useState(
    "Minimalist flat illustration, faceless human figure made entirely of translucent layered veils, the veils ARE the body, no solid skin visible, figure composed of flowing semi-transparent fabric layers in dark navy-purple (#1A1A2E to #2D2045), warm golden light (#D4A853) glowing softly from within the figure between the veil layers, no race no facial features no clothing details, smooth organic flowing shapes, clean edges, no outlines, dark navy background (#0D0D1A), terracotta (#C4745A) accent details, calm symbolic abstract modern, 16:9 widescreen composition, no photorealism, no cartoon, no text, no words, no letters."
  );
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);

  const VARIATIONS = [
    // Poses base (8)
    "standing tall, arms relaxed, veils flowing down like a long dress, golden light strongest at chest",
    "sitting cross-legged, veils pooling around like fabric petals, golden glow at center",
    "walking forward mid-step, veils trailing behind like a flowing path, light pulsing from within",
    "arms slightly open, outer veil layers lifting off the body revealing more golden light",
    "kneeling, veils cascading to the ground, head bowed, soft golden halo around the figure",
    "back turned, looking over shoulder, veils wrapping asymmetrically, light escaping through gaps",
    "figure seated on ground, legs to one side, veils spread around like fabric pool, golden warmth at core",
    "figure standing with head tilted down, contemplative, veils heavy on shoulders, faint golden glow within",
    // Interaccao com veus (6)
    "figure gently pulling one veil layer away from the body, golden light pouring through the gap",
    "figure with hands on chest, veils parting at the heart, brightest golden glow at center",
    "figure reaching upward, top veils sliding off like water, golden light rising",
    "figure surrounded by falling veil fragments dissolving into golden particles",
    "figure holding a single veil layer in outstretched hand, examining it, golden light between fingers",
    "figure mid-turn, veils spiraling outward like flowing fabric, golden sparks trailing",
    // Narrativas (6)
    "two figures facing each other, connected by a shared flowing veil, golden thread between them",
    "small child figure and tall adult figure, same veil material, the child more opaque the adult more translucent",
    "figure standing before a dark mirror, reflection shows the figure with fewer veils and more golden light",
    "figure emerging from complete darkness, first veil layers becoming visible, faint golden spark inside",
    "figure walking alone on empty dark ground, single veil trailing behind, soft golden footprints left behind",
    "figure crouching, arms wrapped around knees, veils tight and dense, tiny golden crack of light at center",
    // Composicoes finais (4)
    "figure fully luminous, all veils fallen at feet as petals, body now pure golden light silhouette",
    "figure standing in a doorway threshold, veils caught behind, stepping forward into warm light",
    "close-up torso view, layers of translucent veils visible, golden light between each layer, abstract",
    "figure from far away, small in vast dark navy space, single golden glow marking their presence",
  ];

  // ── Persist generated images ──────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_IMAGES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGeneratedImages(parsed);
        }
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (generatedImages.length > 0) {
      localStorage.setItem(STORAGE_KEY_IMAGES, JSON.stringify(generatedImages));
    }
  }, [generatedImages]);

  // ── Persist training state ────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRAINING);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (state.requestId || state.status !== "idle") {
      localStorage.setItem(STORAGE_KEY_TRAINING, JSON.stringify(state));
    }
  }, [state]);

  // ── Poll training status ──────────────────────────────────────────────
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

  // ── Generate dataset images ───────────────────────────────────────────
  async function generateDataset() {
    setGenerating(true);
    setGenProgress(0);
    const images: string[] = [...generatedImages];

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
  }

  function removeImage(index: number) {
    const updated = generatedImages.filter((_, i) => i !== index);
    setGeneratedImages(updated);
    if (updated.length === 0) {
      localStorage.removeItem(STORAGE_KEY_IMAGES);
    }
  }

  function clearAllImages() {
    setGeneratedImages([]);
    setDatasetUrl("");
    localStorage.removeItem(STORAGE_KEY_IMAGES);
  }

  // ── Create ZIP + Train ────────────────────────────────────────────────
  async function createZipAndTrain() {
    if (generatedImages.length < 5) {
      setState((s) => ({ ...s, error: "Precisa de pelo menos 5 imagens para treinar." }));
      return;
    }

    // Step 1: Create ZIP
    setCreatingZip(true);
    setState((s) => ({ ...s, error: null }));

    try {
      const zipRes = await fetch("/api/admin/courses/create-dataset-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls: generatedImages }),
      });
      const zipData = await zipRes.json();

      if (zipData.erro) {
        setState((s) => ({ ...s, error: `ZIP: ${zipData.erro}` }));
        setCreatingZip(false);
        return;
      }

      setDatasetUrl(zipData.zipUrl);
      setCreatingZip(false);

      // Step 2: Start training
      setState({ status: "IN_QUEUE", requestId: null, error: null, weightsUrl: null, logsTail: null });

      const trainRes = await fetch("/api/admin/courses/train-lora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images_data_url: zipData.zipUrl,
          trigger_word: triggerWord,
          steps,
          is_style: true,
        }),
      });
      const trainData = await trainRes.json();

      if (trainData.erro) {
        setState((s) => ({ ...s, status: "FAILED", error: trainData.erro }));
        return;
      }

      setState((s) => ({ ...s, requestId: trainData.request_id, status: "IN_QUEUE" }));
    } catch (e) {
      setState((s) => ({ ...s, status: "FAILED", error: e instanceof Error ? e.message : "Erro de rede" }));
      setCreatingZip(false);
    }
  }

  function resetTraining() {
    localStorage.removeItem(STORAGE_KEY_TRAINING);
    if (pollRef.current) clearInterval(pollRef.current);
    setState({ status: "idle", requestId: null, error: null, weightsUrl: null, logsTail: null });
    setDatasetUrl("");
  }

  const isActive = state.status === "IN_QUEUE" || state.status === "IN_PROGRESS";
  const isDone = state.status === "COMPLETED";
  const isFailed = state.status === "FAILED";
  const canTrain = generatedImages.length >= 5 && state.status === "idle" && !creatingZip;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-escola-creme">Treinar LoRA — Figurinha</h1>
        <p className="mt-1 text-sm text-escola-creme-50">
          Conceito A: O Veu e o Corpo. Gera imagens, remove as mas, treina automaticamente.
        </p>
      </div>

      {/* Step 1: Generate dataset */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6">
        <h2 className="text-xs text-escola-creme-50 uppercase mb-4">1. Gerar imagens de referencia</h2>
        <p className="text-sm text-escola-creme mb-3">
          Gera {VARIATIONS.length} variações via Flux Pro. Edita o prompt base se quiseres.
          As imagens ficam guardadas mesmo que feches a pagina.
        </p>

        <textarea value={basePrompt} onChange={(e) => setBasePrompt(e.target.value)} rows={4}
          className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none resize-y font-mono leading-relaxed mb-3" />

        <div className="flex items-center gap-3">
          <button onClick={generateDataset} disabled={generating || isActive}
            className="rounded-lg bg-escola-dourado px-4 py-2 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
            {generating ? `A gerar... ${genProgress}/${VARIATIONS.length}` : `Gerar ${VARIATIONS.length} variações`}
          </button>
          {generatedImages.length > 0 && !generating && (
            <button onClick={clearAllImages}
              className="text-xs text-escola-creme-50 hover:text-escola-terracota">
              Limpar todas
            </button>
          )}
        </div>

        {generatedImages.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-escola-creme-50 mb-2">
              {generatedImages.length} imagens no dataset — clica para remover as que nao gostares:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {generatedImages.map((url, i) => (
                <div key={url} className="relative group cursor-pointer" onClick={() => removeImage(i)}>
                  <img src={url} alt={`var-${i}`} className="w-full aspect-square object-cover rounded-lg border border-escola-border" />
                  <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/30 rounded-lg transition-colors flex items-center justify-center">
                    <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-medium">Remover</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Configure + Train */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6">
        <h2 className="text-xs text-escola-creme-50 uppercase mb-4">2. Treinar</h2>

        {state.status === "idle" && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-escola-creme-50">Trigger word</label>
                <input type="text" value={triggerWord} onChange={(e) => setTriggerWord(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-dourado font-mono focus:border-escola-dourado focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-escola-creme-50">Steps de treino</label>
                <input type="number" value={steps} onChange={(e) => setSteps(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none" />
              </div>
            </div>

            <div className="rounded-lg bg-escola-bg p-4 mb-4 text-xs text-escola-creme-50 space-y-1">
              <p className="text-escola-creme">O que vai acontecer:</p>
              <p>1. Cria ZIP com as {generatedImages.length} imagens do dataset</p>
              <p>2. Treina LoRA Flux durante {steps} passos (~5-10 min)</p>
              <p>3. Grava pesos no Supabase</p>
              <p>4. Todas as imagens dos videos passam a usar o teu estilo</p>
            </div>

            <button onClick={createZipAndTrain} disabled={!canTrain}
              className="w-full rounded-lg bg-escola-dourado px-4 py-3 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
              {creatingZip
                ? "A criar ZIP..."
                : generatedImages.length < 5
                  ? `Precisa de pelo menos 5 imagens (tens ${generatedImages.length})`
                  : `Criar ZIP + Treinar com ${generatedImages.length} imagens`}
            </button>

            {state.error && (
              <p className="mt-2 text-xs text-escola-terracota">{state.error}</p>
            )}
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
              Podes fechar esta pagina. O treino continua no fal.ai. Volta depois para ver o resultado.
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
                <span className="text-green-400 text-lg">&#10003;</span>
                <span className="text-sm text-green-400">LoRA treinado com sucesso</span>
              </div>
              <p className="text-xs text-green-400/80">
                Todas as imagens geradas no pipeline vao usar o teu estilo automaticamente.
              </p>
              <p className="text-xs text-green-400/80 mt-1">
                Trigger word: <code className="text-green-400 font-mono">{triggerWord}</code>
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
              <button onClick={createZipAndTrain} disabled={generatedImages.length < 5}
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
      </div>
    </div>
  );
}
