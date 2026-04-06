"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

type PipelineStep = {
  step: number;
  total: number;
  label: string;
  status: "running" | "done" | "error";
  detail?: string;
};

type AnimationTask = { type: string; taskId: string; status?: string; videoUrl?: string | null };

type VideoResult = {
  status: string;
  title: string;
  audioUrl: string;
  backgroundMusicUrl?: string;
  manifestUrl: string;
  scenes: number;
  imagesGenerated: number;
  animationsSubmitted?: number;
  animationTaskIds?: AnimationTask[];
};

type SceneEdit = {
  type: string;
  narration: string;
  overlayText: string;
};

// ─── YOUTUBE HOOKS DATA ─────────────────────────────────────────────────────

const YOUTUBE_HOOKS = [
  { index: 0, title: "Porque sentes culpa quando gastas dinheiro em ti mesma?", duration: "6 min" },
  { index: 1, title: "3 frases sobre dinheiro que a tua mae te ensinou sem saber", duration: "7 min" },
  { index: 2, title: "O teste do preco: diz o teu valor em voz alta", duration: "5 min" },
];

const DEFAULT_VOICE_ID = "fnoNuVpfClX7lHKFbyZ2";

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function ProductionPage() {
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const [showVoiceField, setShowVoiceField] = useState(false);

  // Video production
  const [selectedHook, setSelectedHook] = useState(0);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [isProducing, setIsProducing] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Script preview/approval
  const [scriptScenes, setScriptScenes] = useState<SceneEdit[]>([]);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptApproved, setScriptApproved] = useState(false);

  // Animation polling
  const [animTasks, setAnimTasks] = useState<AnimationTask[]>([]);
  const [animPolling, setAnimPolling] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // YouTube metadata
  const [ytTitle, setYtTitle] = useState("");
  const [ytDescription, setYtDescription] = useState("");
  const [ytTags, setYtTags] = useState("");

  // Test image
  const [testImageUrl, setTestImageUrl] = useState<string | null>(null);
  const [testImageLoading, setTestImageLoading] = useState(false);

  // ─── LOAD SCRIPT FOR PREVIEW ────────────────────────────────────────────

  const loadScript = useCallback(async () => {
    setScriptLoading(true);
    setScriptApproved(false);
    setError(null);

    try {
      const res = await fetch("/api/admin/courses/preview-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: "ouro-proprio",
          scriptType: "youtube",
          hookIndex: selectedHook,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ erro: `HTTP ${res.status}` }));
        throw new Error(data.erro || `Erro ${res.status}`);
      }

      const data = await res.json();
      setScriptScenes(data.scenes || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro";
      setError(msg);
    } finally {
      setScriptLoading(false);
    }
  }, [selectedHook]);

  // Load script when hook changes
  useEffect(() => {
    loadScript();
  }, [loadScript]);

  // ─── PRODUCE VIDEO ──────────────────────────────────────────────────────

  const produceVideo = useCallback(async () => {
    if (!scriptApproved) return;

    setIsProducing(true);
    setPipelineSteps([]);
    setVideoResult(null);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/admin/courses/produce-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: "ouro-proprio",
          scriptType: "youtube",
          hookIndex: selectedHook,
          animationProvider: "runway",
          voiceId: voiceId.trim() || undefined,
          // Send edited scenes if user modified them
          editedScenes: scriptScenes.length > 0 ? scriptScenes : undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ erro: `HTTP ${res.status}` }));
        throw new Error(data.erro || `Erro ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Sem stream de resposta.");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.result) {
              setVideoResult(data.result);
              if (data.result.animationTaskIds?.length > 0) {
                setAnimTasks(data.result.animationTaskIds);
                startAnimationPolling(data.result.animationTaskIds);
              }
            } else if (data.step !== undefined) {
              setPipelineSteps((prev) => {
                const existing = prev.findIndex((s) => s.step === data.step);
                if (existing >= 0) {
                  const updated = [...prev];
                  updated[existing] = data;
                  return updated;
                }
                return [...prev, data];
              });
            }
          } catch { /* skip */ }
        }
      }

      const hook = YOUTUBE_HOOKS[selectedHook];
      if (hook) {
        setYtTitle(hook.title);
        setYtDescription(`${hook.title}\n\nSe isto fez sentido, subscreve. Ha mais a caminho.\n\n#escoladosveus #seteveus #ouroproprio #dinheiro #autoconhecimento`);
        setYtTags("escola dos veus, sete veus, ouro proprio, dinheiro, culpa, autoconhecimento, mulher");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Producao cancelada.");
      } else {
        setError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setIsProducing(false);
      abortRef.current = null;
    }
  }, [scriptApproved, selectedHook, voiceId, scriptScenes]);

  // ─── ANIMATION POLLING ──────────────────────────────────────────────────

  function startAnimationPolling(tasks: AnimationTask[]) {
    setAnimPolling(true);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/courses/animation-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks, provider: "runway" }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setAnimTasks(data.tasks);
        if (data.allDone) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setAnimPolling(false);
        }
      } catch { /* retry */ }
    }, 15000);
  }

  // ─── TEST IMAGE ─────────────────────────────────────────────────────────

  const testGenerateImage = useCallback(async () => {
    setTestImageLoading(true);
    setTestImageUrl(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/courses/generate-image-flux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "a solid terracotta colored silhouette figure standing in a shop holding a small bag, thought bubble with floating numbers above, the figure is a warm terracotta shape with subtle golden outline glow clearly visible against dark background — no face no features just a human shape, flat minimalist editorial illustration, dark navy blue background, warm gold and terracotta accent colors, clean simple shapes, contemplative mood, no photorealism, no cartoon face, no text, no words",
          courseSlug: "ouro-proprio",
          sceneLabel: "teste",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ erro: `HTTP ${res.status}` }));
        throw new Error(data.erro || `Erro ${res.status}`);
      }
      const data = await res.json();
      setTestImageUrl(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setTestImageLoading(false);
    }
  }, []);

  // ─── SCENE LABEL ────────────────────────────────────────────────────────

  const SCENE_LABELS: Record<string, string> = {
    abertura: "Abertura",
    pergunta: "Pergunta",
    situacao: "Situacao",
    revelacao: "Revelacao",
    gesto: "Gesto",
    frase_final: "Frase Final",
    cta: "CTA",
    fecho: "Fecho",
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────

  return (
    <>
      <h1 className="font-serif text-2xl font-semibold text-escola-creme">
        Producao de Videos
      </h1>
      <p className="text-sm text-escola-creme-50 mt-1 mb-6">
        1. Escolhe o hook &rarr; 2. Revê o script &rarr; 3. Aprova &rarr; 4. Produz
      </p>

      {/* Hook selector */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6 mb-6">
        <h2 className="font-serif text-lg font-medium text-escola-creme mb-4">
          1. Escolhe o video
        </h2>
        <div className="space-y-2">
          {YOUTUBE_HOOKS.map((hook) => (
            <label
              key={hook.index}
              className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                selectedHook === hook.index
                  ? "border-escola-dourado bg-escola-dourado/5"
                  : "border-escola-border hover:border-escola-dourado/30"
              }`}
            >
              <input
                type="radio"
                name="hook"
                checked={selectedHook === hook.index}
                onChange={() => { setSelectedHook(hook.index); setScriptApproved(false); }}
                className="accent-[#D4A853]"
              />
              <div className="flex-1">
                <p className="text-sm text-escola-creme">{hook.title}</p>
                <p className="text-xs text-escola-creme-50">{hook.duration}</p>
              </div>
              <span className="text-xs text-escola-creme-50">Hook {hook.index + 1}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Script preview & approval */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-medium text-escola-creme">
            2. Revê o script
          </h2>
          {scriptApproved && (
            <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full">Aprovado</span>
          )}
        </div>

        {scriptLoading ? (
          <p className="text-sm text-escola-creme-50 animate-pulse">A carregar script...</p>
        ) : scriptScenes.length === 0 ? (
          <p className="text-sm text-escola-creme-50">Nenhum script encontrado para este hook.</p>
        ) : (
          <div className="space-y-4">
            {scriptScenes.map((scene, i) => (
              <div key={i} className="border border-escola-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-escola-dourado bg-escola-dourado/10 px-2 py-0.5 rounded">
                    {SCENE_LABELS[scene.type] || scene.type}
                  </span>
                  {!scene.narration && (
                    <span className="text-[10px] text-escola-creme-50">(sem narracao)</span>
                  )}
                </div>
                {scene.narration ? (
                  <textarea
                    value={scene.narration}
                    onChange={(e) => {
                      const updated = [...scriptScenes];
                      updated[i] = { ...updated[i], narration: e.target.value };
                      setScriptScenes(updated);
                      setScriptApproved(false);
                    }}
                    rows={Math.max(2, Math.ceil(scene.narration.length / 80))}
                    className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none resize-y"
                  />
                ) : (
                  <p className="text-xs text-escola-creme-50 italic">
                    {scene.overlayText ? `Texto no ecra: "${scene.overlayText}"` : "Cena silenciosa"}
                  </p>
                )}
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2">
              {scriptApproved ? (
                <button
                  onClick={() => setScriptApproved(false)}
                  className="rounded-lg border border-escola-border px-4 py-2.5 text-sm text-escola-creme-50 hover:text-escola-creme"
                >
                  Editar novamente
                </button>
              ) : (
                <button
                  onClick={() => setScriptApproved(true)}
                  className="rounded-lg bg-escola-dourado px-6 py-2.5 text-sm font-medium text-escola-bg hover:opacity-90"
                >
                  Aprovar script
                </button>
              )}
              <button
                onClick={loadScript}
                className="text-xs text-escola-creme-50 hover:text-escola-creme"
              >
                Repor original
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Produce */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6 mb-6">
        <h2 className="font-serif text-lg font-medium text-escola-creme mb-4">
          3. Produzir
        </h2>

        {/* Voice ID toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowVoiceField(!showVoiceField)}
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            {showVoiceField ? "Esconder opcoes de voz" : "Mudar voz"}
          </button>
          {showVoiceField && (
            <div className="mt-2">
              <input
                type="text"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full max-w-md rounded-lg border border-escola-border bg-escola-bg px-4 py-2.5 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
                placeholder="Voice ID do ElevenLabs"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isProducing ? (
            <button
              onClick={() => abortRef.current?.abort()}
              className="rounded-lg bg-escola-terracota/80 px-6 py-3 text-sm font-medium text-escola-creme hover:bg-escola-terracota"
            >
              Cancelar
            </button>
          ) : (
            <button
              onClick={produceVideo}
              disabled={!scriptApproved}
              className="rounded-lg bg-escola-dourado px-6 py-3 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40"
            >
              {scriptApproved ? "Produzir video completo" : "Aprova o script primeiro"}
            </button>
          )}
          <button
            onClick={testGenerateImage}
            disabled={testImageLoading}
            className="rounded-lg border border-escola-border px-4 py-3 text-sm text-escola-creme-50 hover:border-escola-dourado/30 hover:text-escola-creme disabled:opacity-50"
          >
            {testImageLoading ? "A gerar..." : "Testar imagem"}
          </button>
        </div>
      </div>

      {/* Test image result */}
      {testImageUrl && (
        <div className="rounded-xl border border-escola-border bg-escola-card p-4 mb-6">
          <img src={testImageUrl} alt="Teste" className="rounded-lg w-full max-w-lg border border-escola-border" />
        </div>
      )}

      {/* Pipeline progress */}
      {pipelineSteps.length > 0 && (
        <div className="rounded-xl border border-escola-border bg-escola-card p-6 mb-6">
          <h3 className="font-serif text-lg font-medium text-escola-creme mb-4">Pipeline</h3>
          <div className="mb-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-escola-border">
              <div className="h-full rounded-full bg-escola-dourado transition-all duration-500"
                style={{ width: `${(pipelineSteps.filter((s) => s.status === "done").length / 5) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-3">
            {pipelineSteps.map((step) => (
              <div key={step.step} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.status === "done" ? "bg-green-500/20 text-green-400"
                  : step.status === "error" ? "bg-escola-terracota/20 text-escola-terracota"
                  : "bg-escola-dourado/20 text-escola-dourado animate-pulse"
                }`}>
                  {step.status === "done" ? "\u2713" : step.status === "error" ? "!" : step.step}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-escola-creme">{step.label}</p>
                  {step.detail && <p className="text-xs text-escola-creme-50">{step.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-escola-terracota/30 bg-escola-terracota/5 p-4 mb-6">
          <p className="text-sm text-escola-terracota">{error}</p>
        </div>
      )}

      {/* Video result */}
      {videoResult && (
        <div className="rounded-xl border border-escola-dourado/30 bg-escola-dourado/5 p-6 space-y-6">
          <div>
            <h3 className="font-serif text-lg font-medium text-escola-dourado mb-2">Video produzido</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><span className="text-escola-creme-50">Cenas:</span> <span className="text-escola-creme">{videoResult.scenes}</span></div>
              <div><span className="text-escola-creme-50">Imagens:</span> <span className="text-escola-creme">{videoResult.imagesGenerated}</span></div>
              <div><span className="text-escola-creme-50">Animacoes:</span> <span className="text-escola-creme">{videoResult.animationsSubmitted || 0}</span></div>
            </div>

            {/* Animation status */}
            {animTasks.length > 0 && (
              <div className="mt-4 border-t border-escola-border pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-sm font-medium text-escola-creme">Animacoes Runway</h4>
                  {animPolling && <span className="text-xs text-escola-dourado animate-pulse">a verificar...</span>}
                  {!animPolling && animTasks.every((t) => t.status === "done") && <span className="text-xs text-green-400">Todas prontas</span>}
                </div>
                <div className="space-y-2">
                  {animTasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className={`w-2 h-2 rounded-full ${
                        task.status === "done" ? "bg-green-500" : task.status === "failed" ? "bg-escola-terracota" : "bg-escola-dourado animate-pulse"
                      }`} />
                      <span className="text-escola-creme-50 w-24">{SCENE_LABELS[task.type] || task.type}</span>
                      <span className="text-escola-creme text-xs">{task.status === "done" ? "Pronto" : task.status === "failed" ? "Falhou" : "A processar..."}</span>
                      {task.videoUrl && <a href={task.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-escola-dourado underline">Ver clip</a>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {videoResult.audioUrl && videoResult.audioUrl !== "[no-supabase]" && (
              <div className="mt-3">
                <p className="text-xs text-escola-creme-50 mb-1">Audio narrado:</p>
                <audio controls src={videoResult.audioUrl} className="w-full max-w-md h-10" />
              </div>
            )}
            {videoResult.backgroundMusicUrl && (
              <div className="mt-3">
                <p className="text-xs text-escola-creme-50 mb-1">Musica de fundo (ambiente):</p>
                <audio controls src={videoResult.backgroundMusicUrl} className="w-full max-w-md h-10" />
              </div>
            )}
            {videoResult.manifestUrl && (
              <a href={videoResult.manifestUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs text-escola-dourado underline">
                Ver manifesto (JSON)
              </a>
            )}
          </div>

          {/* YouTube metadata */}
          <div className="border-t border-escola-dourado/20 pt-4">
            <h3 className="font-serif text-lg font-medium text-escola-creme mb-4">YouTube</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-escola-creme-50 block mb-1">Titulo</label>
                <input type="text" value={ytTitle} onChange={(e) => setYtTitle(e.target.value)}
                  className="w-full rounded-lg border border-escola-border bg-escola-bg px-4 py-3 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-escola-creme-50 block mb-1">Descricao</label>
                <textarea value={ytDescription} onChange={(e) => setYtDescription(e.target.value)} rows={5}
                  className="w-full rounded-lg border border-escola-border bg-escola-bg px-4 py-3 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none resize-y" />
              </div>
              <div>
                <label className="text-xs text-escola-creme-50 block mb-1">Tags</label>
                <input type="text" value={ytTags} onChange={(e) => setYtTags(e.target.value)}
                  className="w-full rounded-lg border border-escola-border bg-escola-bg px-4 py-3 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none" />
              </div>
              <button onClick={() => navigator.clipboard.writeText(`TITULO: ${ytTitle}\n\nDESCRICAO:\n${ytDescription}\n\nTAGS: ${ytTags}`)}
                className="rounded-lg bg-escola-dourado/20 border border-escola-dourado/30 px-4 py-2.5 text-sm text-escola-dourado hover:bg-escola-dourado/30">
                Copiar metadados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
