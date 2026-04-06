"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type TrainingStatus = "idle" | "starting" | "processing" | "succeeded" | "failed" | "canceled";

interface TrainingState {
  status: TrainingStatus;
  trainingId: string | null;
  progress: number;
  error: string | null;
  outputUrl: string | null;
  logsTail: string | null;
}

export default function LoRAPage() {
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<TrainingState>({
    status: "idle",
    trainingId: null,
    progress: 0,
    error: null,
    outputUrl: null,
    logsTail: null,
  });

  const [showLogs, setShowLogs] = useState(false);

  // Restore training state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lora-training");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.trainingId && (parsed.status === "starting" || parsed.status === "processing")) {
          setState(parsed);
        } else if (parsed.status === "succeeded") {
          setState(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (state.trainingId) {
      localStorage.setItem("lora-training", JSON.stringify(state));
    }
  }, [state]);

  // Poll for status
  const checkStatus = useCallback(async () => {
    if (!state.trainingId) return;
    try {
      const res = await fetch(`/api/admin/courses/train-lora/status?id=${state.trainingId}`);
      const data = await res.json();

      if (data.erro) {
        setState((s) => ({ ...s, error: data.erro, status: "failed" }));
        return;
      }

      setState((s) => ({
        ...s,
        status: data.status as TrainingStatus,
        progress: data.progress ?? s.progress,
        logsTail: data.logs_tail ?? s.logsTail,
        error: data.error,
        outputUrl: data.weights_url || data.replicate_url || null,
      }));
    } catch {
      // Network error, keep polling
    }
  }, [state.trainingId]);

  // Start/stop polling
  useEffect(() => {
    if (state.status === "starting" || state.status === "processing") {
      pollRef.current = setInterval(checkStatus, 10000); // every 10s
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [state.status, checkStatus]);

  async function startTraining() {
    setState({ status: "starting", trainingId: null, progress: 0, error: null, outputUrl: null, logsTail: null });

    try {
      const res = await fetch("/api/admin/courses/train-lora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.erro) {
        setState((s) => ({ ...s, status: "failed", error: data.erro }));
        return;
      }

      setState((s) => ({
        ...s,
        trainingId: data.training_id,
        status: "starting",
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        status: "failed",
        error: e instanceof Error ? e.message : "Erro de rede",
      }));
    }
  }

  function resetTraining() {
    localStorage.removeItem("lora-training");
    if (pollRef.current) clearInterval(pollRef.current);
    setState({ status: "idle", trainingId: null, progress: 0, error: null, outputUrl: null, logsTail: null });
  }

  const isActive = state.status === "starting" || state.status === "processing";
  const isDone = state.status === "succeeded";
  const isFailed = state.status === "failed" || state.status === "canceled";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-escola-creme">Treinar LoRA</h1>
        <p className="mt-1 text-sm text-escola-creme-50">
          Um botao. O Replicate treina o modelo por ti. ~$1.50, ~2-5 minutos.
        </p>
      </div>

      {/* Setup check */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6">
        <h2 className="text-xs text-escola-creme-50 uppercase mb-4">Pre-requisito</h2>
        <div className="flex items-start gap-3">
          <span className="text-escola-dourado font-mono shrink-0">1.</span>
          <div className="text-sm text-escola-creme">
            <p>Vai ao <strong>Replicate.com</strong>, cria conta, e copia o teu API Token:</p>
            <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer"
              className="inline-block mt-2 rounded-lg border border-escola-border bg-escola-bg px-3 py-1.5 text-xs text-escola-dourado hover:border-escola-dourado/40">
              Abrir Replicate -- API Tokens
            </a>
          </div>
        </div>
        <div className="flex items-start gap-3 mt-3">
          <span className="text-escola-dourado font-mono shrink-0">2.</span>
          <div className="text-sm text-escola-creme">
            <p>No Vercel, adiciona a variavel de ambiente:</p>
            <div className="rounded-lg bg-escola-bg p-3 mt-2 flex items-center justify-between gap-2">
              <code className="text-xs text-escola-dourado">REPLICATE_API_TOKEN = (o token que copiaste)</code>
            </div>
            <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer"
              className="inline-block mt-2 rounded-lg border border-escola-border bg-escola-bg px-3 py-1.5 text-xs text-escola-creme-50 hover:border-escola-dourado/40">
              Vercel -- Settings -- Environment Variables
            </a>
          </div>
        </div>
      </div>

      {/* Training card */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-medium text-escola-creme">seteveus_style</h2>
          <span className="rounded-full bg-escola-dourado/10 px-2 py-0.5 text-[10px] text-escola-dourado">Flux LoRA -- 59 imagens</span>
        </div>

        {/* IDLE state */}
        {state.status === "idle" && (
          <div>
            <div className="rounded-lg bg-escola-bg p-4 mb-4 text-xs text-escola-creme-50 space-y-1">
              <p>O que vai acontecer:</p>
              <p className="text-escola-creme">1. O Replicate descarrega o dataset (59 imagens + descricoes)</p>
              <p className="text-escola-creme">2. Pre-processa e legenda as imagens automaticamente</p>
              <p className="text-escola-creme">3. Treina o LoRA durante ~1000 passos (~2-5 min)</p>
              <p className="text-escola-creme">4. Guarda o ficheiro .safetensors no Supabase automaticamente</p>
              <p className="mt-2">Custo: ~$1.50 USD (cobrado pelo Replicate)</p>
            </div>

            <button onClick={startTraining}
              className="w-full rounded-lg bg-escola-dourado px-4 py-3 text-sm font-medium text-escola-bg hover:opacity-90">
              Treinar LoRA
            </button>
          </div>
        )}

        {/* ACTIVE state */}
        {isActive && (
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-escola-creme">
                  {state.status === "starting" ? "A iniciar..." : "A treinar..."}
                </span>
                <span className="text-xs text-escola-creme-50">
                  {state.progress > 0 ? `${state.progress}%` : "..."}
                </span>
              </div>
              <div className="w-full rounded-full bg-escola-bg h-2">
                <div
                  className="bg-escola-dourado h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(state.progress, state.status === "starting" ? 2 : 5)}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg bg-escola-bg p-3 text-xs text-escola-creme-50">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span>A processar no Replicate...</span>
              </div>
              <p>Podes fechar esta pagina. O treino continua. Volta depois para ver o resultado.</p>
              {state.trainingId && (
                <p className="mt-1 text-escola-dourado/60 font-mono">ID: {state.trainingId}</p>
              )}
            </div>

            {/* Logs toggle */}
            {state.logsTail && (
              <div className="mt-3">
                <button onClick={() => setShowLogs(!showLogs)} className="text-xs text-escola-creme-50 hover:text-escola-creme">
                  {showLogs ? "Esconder logs" : "Ver logs"}
                </button>
                {showLogs && (
                  <pre className="mt-2 rounded-lg bg-escola-bg p-3 text-xs text-escola-creme-50 font-mono overflow-x-auto max-h-40 overflow-y-auto">
                    {state.logsTail}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* SUCCESS state */}
        {isDone && (
          <div>
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 text-lg">OK</span>
                <span className="text-sm text-green-400">LoRA treinado com sucesso</span>
              </div>

              {state.outputUrl && (
                <a href={state.outputUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-block rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-400 hover:bg-green-500/20">
                  Descarregar seteveus_style.safetensors
                </a>
              )}

              {!state.outputUrl && (
                <p className="text-xs text-green-400/60">
                  O modelo foi treinado. Verifica no dashboard do Replicate.
                </p>
              )}
            </div>

            <div className="rounded-lg bg-escola-bg p-4 text-xs text-escola-creme-50 space-y-2">
              <p className="uppercase text-escola-creme">Como usar</p>
              <p>1. Descarrega o ficheiro .safetensors</p>
              <p>2. No ComfyUI (ThinkDiffusion), faz upload para <code className="text-escola-dourado">/workspace/ComfyUI/models/loras/</code></p>
              <p>3. No no LoraLoader, selecciona o ficheiro e usa forca <strong>0.7</strong></p>
              <p>4. No prompt, usa a palavra <code className="text-escola-dourado">seteveus_style</code></p>
            </div>

            <button onClick={resetTraining}
              className="mt-4 text-xs text-escola-creme-50 hover:text-escola-creme">
              Treinar de novo
            </button>
          </div>
        )}

        {/* FAILED state */}
        {isFailed && (
          <div>
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 mb-4">
              <p className="text-sm text-escola-terracota mb-1">Erro no treino</p>
              <p className="text-xs text-escola-terracota/80">{state.error || "Erro desconhecido"}</p>
              {state.logsTail && (
                <pre className="mt-2 text-xs text-escola-terracota/60 font-mono overflow-x-auto max-h-32 overflow-y-auto">
                  {state.logsTail}
                </pre>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={startTraining}
                className="rounded-lg bg-escola-dourado px-4 py-3 text-sm font-medium text-escola-bg hover:opacity-90">
                Tentar de novo
              </button>
              <button onClick={resetTraining}
                className="rounded-lg border border-escola-border bg-escola-card px-4 py-3 text-sm text-escola-creme hover:border-escola-dourado/40">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6">
        <h3 className="text-xs text-escola-creme-50 uppercase mb-3">Detalhes tecnicos</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-escola-creme-50">Modelo base</span>
            <p className="text-escola-creme">Flux.1 (Black Forest Labs)</p>
          </div>
          <div>
            <span className="text-escola-creme-50">Metodo</span>
            <p className="text-escola-creme">LoRA (rank 32)</p>
          </div>
          <div>
            <span className="text-escola-creme-50">Dataset</span>
            <p className="text-escola-creme">59 imagens + auto-caption</p>
          </div>
          <div>
            <span className="text-escola-creme-50">Trigger word</span>
            <p className="text-escola-dourado font-mono">seteveus_style</p>
          </div>
          <div>
            <span className="text-escola-creme-50">Trainer</span>
            <p className="text-escola-creme">fast-flux-trainer (8x H100)</p>
          </div>
          <div>
            <span className="text-escola-creme-50">Servico</span>
            <a href="https://replicate.com" target="_blank" rel="noopener noreferrer" className="text-escola-creme hover:text-escola-dourado">
              Replicate.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
