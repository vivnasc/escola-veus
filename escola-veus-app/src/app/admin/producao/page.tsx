"use client";

import { useState, useRef, useCallback } from "react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

type PipelineStep = {
  step: number;
  total: number;
  label: string;
  status: "running" | "done" | "error";
  detail?: string;
};

type VideoResult = {
  status: string;
  title: string;
  audioUrl: string;
  manifestUrl: string;
  scenes: number;
  imagesGenerated: number;
  clipsAnimated: number;
};

type TabId = "video" | "aulas" | "config";

// ─── YOUTUBE HOOKS DATA ─────────────────────────────────────────────────────

const YOUTUBE_HOOKS = [
  { index: 0, title: "Porque sentes culpa quando gastas dinheiro em ti mesma?", duration: "6 min" },
  { index: 1, title: "3 frases sobre dinheiro que a tua mae te ensinou sem saber", duration: "7 min" },
  { index: 2, title: "O teste do preco: diz o teu valor em voz alta", duration: "5 min" },
];

const DEFAULT_VOICE_ID = "fnoNuVpfClX7lHKFbyZ2";

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function ProductionPage() {
  // Config
  const [falKey, setFalKey] = useState("");
  const [elevenKey, setElevenKey] = useState("");
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const [runwayKey, setRunwayKey] = useState("");
  const [animProvider, setAnimProvider] = useState<"runway" | "hailuo">("runway");

  // Tab
  const [activeTab, setActiveTab] = useState<TabId>("video");

  // Video production
  const [selectedHook, setSelectedHook] = useState(0);
  const [courseSlug] = useState("ouro-proprio");
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [isProducing, setIsProducing] = useState(false);
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // YouTube metadata
  const [ytTitle, setYtTitle] = useState("");
  const [ytDescription, setYtDescription] = useState("");
  const [ytTags, setYtTags] = useState("");

  // Test image
  const [testImageUrl, setTestImageUrl] = useState<string | null>(null);
  const [testImageLoading, setTestImageLoading] = useState(false);

  // Check if keys are configured
  const hasKeys = falKey.trim().length > 0 && elevenKey.trim().length > 0;

  // ─── PRODUCE VIDEO ──────────────────────────────────────────────────────

  const produceVideo = useCallback(async () => {
    if (!hasKeys) return;

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
          courseSlug,
          scriptType: "youtube",
          hookIndex: selectedHook,
          animationProvider: animProvider,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ erro: `HTTP ${res.status}` }));
        throw new Error(data.erro || `Erro ${res.status}`);
      }

      // Read SSE stream
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
          } catch { /* skip malformed */ }
        }
      }

      // Pre-fill YouTube metadata
      const hook = YOUTUBE_HOOKS[selectedHook];
      if (hook) {
        setYtTitle(hook.title);
        setYtDescription(
          `${hook.title}\n\nO curso Ouro Proprio vai muito mais fundo. Oito modulos para desatar o no entre o que sentes sobre dinheiro e quem realmente es.\n\nO primeiro modulo e gratuito: https://seteveus.space/cursos/ouro-proprio\n\n#escoladosveus #seteveus #ouroproprio #dinheiro #autoconhecimento #mulher`
        );
        setYtTags("escola dos veus, sete veus, ouro proprio, dinheiro, culpa, autoconhecimento, mulher, desenvolvimento pessoal");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Producao cancelada.");
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      }
    } finally {
      setIsProducing(false);
      abortRef.current = null;
    }
  }, [hasKeys, courseSlug, selectedHook, animProvider]);

  // ─── TEST IMAGE ─────────────────────────────────────────────────────────

  const testGenerateImage = useCallback(async () => {
    if (!falKey.trim()) return;
    setTestImageLoading(true);
    setTestImageUrl(null);

    try {
      const res = await fetch("/api/admin/courses/generate-image-flux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "faceless woman in long flowing navy dress with translucent golden veil, standing before ornate golden mirrors, soft golden glow, deep navy blue background, oil painting style, painterly brushstrokes, cinematic lighting, contemplative mood, no text",
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
      const msg = err instanceof Error ? err.message : "Erro";
      setError(msg);
    } finally {
      setTestImageLoading(false);
    }
  }, [falKey]);

  // ─── RENDER ─────────────────────────────────────────────────────────────

  return (
    <>
      <h1 className="font-serif text-2xl font-semibold text-escola-creme">
        Producao de Videos
      </h1>
      <p className="text-sm text-escola-creme-50 mt-1 mb-6">
        Pipeline automatico: Script &rarr; Voz (ElevenLabs) &rarr; Imagens (Flux) &rarr; Animacao (Runway/Hailuo) &rarr; Video (Remotion)
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-escola-border">
        {([
          { id: "video" as TabId, label: "Produzir Video" },
          { id: "aulas" as TabId, label: "Aulas (audio)" },
          { id: "config" as TabId, label: "Configuracao" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-escola-dourado text-escola-dourado"
                : "border-transparent text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: CONFIG ─────────────────────────────────────────────────── */}
      {activeTab === "config" && (
        <div className="rounded-xl border border-escola-border bg-escola-card p-6 space-y-6">
          <h2 className="font-serif text-xl font-medium text-escola-creme">
            API Keys
          </h2>
          <p className="text-xs text-escola-creme-50">
            As chaves ficam no browser (nao sao guardadas no servidor). Precisas de as inserir cada vez que abres a pagina.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-escola-creme-50 block mb-1">
                fal.ai API Key *
              </label>
              <input
                type="password"
                value={falKey}
                onChange={(e) => setFalKey(e.target.value)}
                className="w-full rounded-lg border border-escola-border bg-escola-bg px-4 py-3 text-sm text-escola-creme placeholder:text-escola-creme-50 focus:border-escola-dourado focus:outline-none"
                placeholder="fal-..."
              />
              <p className="text-[10px] text-escola-creme-50 mt-1">
                Imagens (Flux) + Animacao (Hailuo). Cria em fal.ai/dashboard/keys
              </p>
            </div>
            <div>
              <label className="text-xs text-escola-creme-50 block mb-1">
                ElevenLabs API Key *
              </label>
              <input
                type="password"
                value={elevenKey}
                onChange={(e) => setElevenKey(e.target.value)}
                className="w-full rounded-lg border border-escola-border bg-escola-bg px-4 py-3 text-sm text-escola-creme placeholder:text-escola-creme-50 focus:border-escola-dourado focus:outline-none"
                placeholder="xi-..."
              />
            </div>
            <div>
              <label className="text-xs text-escola-creme-50 block mb-1">
                Voice ID (ElevenLabs)
              </label>
              <input
                type="text"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full rounded-lg border border-escola-border bg-escola-bg px-4 py-3 text-sm text-escola-creme placeholder:text-escola-creme-50 focus:border-escola-dourado focus:outline-none"
                placeholder={DEFAULT_VOICE_ID}
              />
              <p className="text-[10px] text-escola-creme-50 mt-1">
                Muda aqui para testar vozes diferentes
              </p>
            </div>
            <div>
              <label className="text-xs text-escola-creme-50 block mb-1">
                Runway API Key (opcional)
              </label>
              <input
                type="password"
                value={runwayKey}
                onChange={(e) => setRunwayKey(e.target.value)}
                className="w-full rounded-lg border border-escola-border bg-escola-bg px-4 py-3 text-sm text-escola-creme placeholder:text-escola-creme-50 focus:border-escola-dourado focus:outline-none"
                placeholder="rw-..."
              />
              <p className="text-[10px] text-escola-creme-50 mt-1">
                Animacao premium. Sem isto, usa Hailuo (via fal.ai).
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs text-escola-creme-50 block mb-1">
              Motor de animacao
            </label>
            <select
              value={animProvider}
              onChange={(e) => setAnimProvider(e.target.value as "runway" | "hailuo")}
              className="rounded-lg border border-escola-border bg-escola-bg px-3 py-2.5 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
            >
              <option value="runway">Runway Gen-4 — melhor qualidade, cinematico</option>
              <option value="hailuo">Hailuo 2.3 (via fal.ai) — alternativa</option>
            </select>
          </div>

          {/* Test section */}
          <div className="border-t border-escola-border pt-4">
            <h3 className="text-sm font-medium text-escola-creme mb-2">Teste rapido</h3>
            <button
              onClick={testGenerateImage}
              disabled={!falKey.trim() || testImageLoading}
              className="rounded-lg bg-escola-dourado/20 border border-escola-dourado/30 px-4 py-2 text-sm text-escola-dourado hover:bg-escola-dourado/30 disabled:opacity-50"
            >
              {testImageLoading ? "A gerar imagem de teste..." : "Testar geracao de imagem (Flux)"}
            </button>
            {testImageUrl && (
              <div className="mt-4">
                <img
                  src={testImageUrl}
                  alt="Teste Flux"
                  className="rounded-lg max-w-md border border-escola-border"
                />
                <p className="text-xs text-escola-creme-50 mt-1">Imagem gerada com sucesso via Flux/fal.ai</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${hasKeys ? "bg-green-500" : "bg-escola-terracota"}`} />
            <span className="text-escola-creme-50">
              {hasKeys ? "Pronto para produzir" : "Insere as API keys (fal.ai + ElevenLabs)"}
            </span>
          </div>
        </div>
      )}

      {/* ─── TAB: PRODUCE VIDEO ──────────────────────────────────────────── */}
      {activeTab === "video" && (
        <div className="space-y-6">
          {/* Keys warning */}
          {!hasKeys && (
            <div className="rounded-xl border border-escola-terracota/30 bg-escola-terracota/5 p-4">
              <p className="text-sm text-escola-terracota">
                Vai ao separador Configuracao e insere as API keys antes de produzir.
              </p>
            </div>
          )}

          {/* Hook selector */}
          <div className="rounded-xl border border-escola-border bg-escola-card p-6">
            <h2 className="font-serif text-lg font-medium text-escola-creme mb-4">
              Ouro Proprio — YouTube Hooks
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
                    onChange={() => setSelectedHook(hook.index)}
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

            {/* Produce button */}
            <div className="mt-6 flex items-center gap-4">
              {isProducing ? (
                <button
                  onClick={() => abortRef.current?.abort()}
                  className="rounded-lg bg-escola-terracota/80 px-6 py-3 text-sm font-medium text-escola-creme hover:bg-escola-terracota"
                >
                  Cancelar producao
                </button>
              ) : (
                <button
                  onClick={produceVideo}
                  disabled={!hasKeys}
                  className="rounded-lg bg-escola-dourado px-6 py-3 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40"
                >
                  Produzir video completo
                </button>
              )}
              <span className="text-xs text-escola-creme-50">
                ~30 min, ~$3-4 (voz + imagens + animacao)
              </span>
            </div>
          </div>

          {/* Pipeline progress */}
          {pipelineSteps.length > 0 && (
            <div className="rounded-xl border border-escola-border bg-escola-card p-6">
              <h3 className="font-serif text-lg font-medium text-escola-creme mb-4">
                Pipeline
              </h3>
              <div className="space-y-3">
                {pipelineSteps.map((step) => (
                  <div key={step.step} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      step.status === "done"
                        ? "bg-green-500/20 text-green-400"
                        : step.status === "error"
                        ? "bg-escola-terracota/20 text-escola-terracota"
                        : "bg-escola-dourado/20 text-escola-dourado animate-pulse"
                    }`}>
                      {step.status === "done" ? "\u2713" : step.status === "error" ? "!" : step.step}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-escola-creme">{step.label}</p>
                      {step.detail && (
                        <p className="text-xs text-escola-creme-50">{step.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              {isProducing && pipelineSteps.length > 0 && (
                <div className="mt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-escola-border">
                    <div
                      className="h-full rounded-full bg-escola-dourado transition-all duration-500"
                      style={{
                        width: `${(pipelineSteps.filter((s) => s.status === "done").length / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-escola-terracota/30 bg-escola-terracota/5 p-4">
              <p className="text-sm text-escola-terracota">{error}</p>
            </div>
          )}

          {/* Video result + YouTube metadata */}
          {videoResult && (
            <div className="rounded-xl border border-escola-dourado/30 bg-escola-dourado/5 p-6 space-y-6">
              <div>
                <h3 className="font-serif text-lg font-medium text-escola-dourado mb-2">
                  Video produzido
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-escola-creme-50">Cenas:</span>{" "}
                    <span className="text-escola-creme">{videoResult.scenes}</span>
                  </div>
                  <div>
                    <span className="text-escola-creme-50">Imagens:</span>{" "}
                    <span className="text-escola-creme">{videoResult.imagesGenerated}</span>
                  </div>
                  <div>
                    <span className="text-escola-creme-50">Clips animados:</span>{" "}
                    <span className="text-escola-creme">{videoResult.clipsAnimated}</span>
                  </div>
                </div>
                {videoResult.audioUrl && videoResult.audioUrl !== "[audio-direct-download]" && (
                  <div className="mt-3">
                    <p className="text-xs text-escola-creme-50 mb-1">Audio narrado:</p>
                    <audio controls src={videoResult.audioUrl} className="w-full max-w-md h-10" />
                  </div>
                )}
                {videoResult.manifestUrl && (
                  <a
                    href={videoResult.manifestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-escola-dourado underline"
                  >
                    Ver manifesto Remotion (JSON)
                  </a>
                )}
              </div>

              {/* YouTube metadata editor */}
              <div className="border-t border-escola-dourado/20 pt-4">
                <h3 className="font-serif text-lg font-medium text-escola-creme mb-4">
                  YouTube — Metadados
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-escola-creme-50 block mb-1">Titulo</label>
                    <input
                      type="text"
                      value={ytTitle}
                      onChange={(e) => setYtTitle(e.target.value)}
                      className="w-full rounded-lg border border-escola-border bg-escola-bg px-4 py-3 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-escola-creme-50 block mb-1">Descricao</label>
                    <textarea
                      value={ytDescription}
                      onChange={(e) => setYtDescription(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-escola-border bg-escola-bg px-4 py-3 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none resize-y"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-escola-creme-50 block mb-1">Tags (separadas por virgula)</label>
                    <input
                      type="text"
                      value={ytTags}
                      onChange={(e) => setYtTags(e.target.value)}
                      className="w-full rounded-lg border border-escola-border bg-escola-bg px-4 py-3 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const text = `TITULO: ${ytTitle}\n\nDESCRICAO:\n${ytDescription}\n\nTAGS: ${ytTags}`;
                        navigator.clipboard.writeText(text);
                      }}
                      className="rounded-lg bg-escola-dourado/20 border border-escola-dourado/30 px-4 py-2.5 text-sm text-escola-dourado hover:bg-escola-dourado/30"
                    >
                      Copiar metadados
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: AULAS (placeholder for now) ────────────────────────────── */}
      {activeTab === "aulas" && (
        <div className="rounded-xl border border-escola-border bg-escola-card p-6">
          <p className="text-sm text-escola-creme-50">
            Geracao de audio por aula individual — em breve. Usa o separador &ldquo;Produzir Video&rdquo; para gerar videos YouTube completos.
          </p>
        </div>
      )}
    </>
  );
}
