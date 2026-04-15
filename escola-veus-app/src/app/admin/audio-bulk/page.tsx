"use client";

import { useState, useCallback } from "react";
import { NOMEAR_PRESETS, type NomearScript } from "@/data/nomear-scripts";

type ScriptRow = {
  id: string;
  titulo: string;
  texto: string;
  status: "pending" | "generating" | "done" | "error";
  audioUrl?: string;
  durationSec?: number;
  charsUsed?: number;
  error?: string;
};

const DEFAULT_VOICE_ID = "JGnWZj684pcXmK2SxYIv";
const SAMPLE_TEXT = "Há uma culpa que não é culpa. [pause] É uma voz antiga que confunde prazer com desperdício. [long pause] Chama-se herança.";

export default function AudioBulkPage() {
  // Config
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const [modelId, setModelId] = useState("eleven_multilingual_v2");
  const [folder, setFolder] = useState("youtube");
  // language code opcional — vazio = voice decide sotaque original (evita pt-BR forcado)
  const [languageCode, setLanguageCode] = useState("");

  // Voice test
  const [testText, setTestText] = useState(SAMPLE_TEXT);
  const [testLoading, setTestLoading] = useState(false);
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);

  // Bulk scripts
  const [scripts, setScripts] = useState<ScriptRow[]>([]);
  const [generating, setGenerating] = useState(false);

  // Manual add form
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");

  const [error, setError] = useState<string | null>(null);

  // ─── Actions ──────────────────────────────────────────────────────────

  // Deriva a pasta Supabase a partir do id do preset.
  // - curso-ouro-proprio-m1 → "curso-ouro-proprio"
  // - curso-limite-sagrado-m1 → "curso-limite-sagrado"
  // - nomear-serie-X → "youtube"
  function folderFromPresetId(presetId: string): string {
    if (presetId.startsWith("curso-ouro-proprio")) return "curso-ouro-proprio";
    if (presetId.startsWith("curso-limite-sagrado")) return "curso-limite-sagrado";
    if (presetId.startsWith("curso-")) return presetId.replace(/-m\d+$/, "");
    return "youtube";
  }

  const loadPreset = useCallback((presetId: string) => {
    const preset = NOMEAR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const rows: ScriptRow[] = preset.scripts.map((s: NomearScript) => ({
      id: s.id,
      titulo: s.titulo,
      texto: s.texto,
      status: "pending",
    }));
    setScripts(rows);
    // Auto-muda pasta Supabase conforme o tipo de preset (youtube vs curso)
    setFolder(folderFromPresetId(presetId));
    setError(null);
  }, []);

  const addManual = useCallback(() => {
    if (!newTitle.trim() || !newText.trim()) {
      setError("Título e texto obrigatórios");
      return;
    }
    setScripts((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        titulo: newTitle.trim(),
        texto: newText.trim(),
        status: "pending",
      },
    ]);
    setNewTitle("");
    setNewText("");
    setError(null);
  }, [newTitle, newText]);

  const removeScript = useCallback((id: string) => {
    setScripts((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setScripts([]);
  }, []);

  const testVoice = useCallback(async () => {
    setTestLoading(true);
    setError(null);
    setTestAudioUrl(null);
    try {
      const res = await fetch("/api/admin/audio-bulk/test-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testText, voiceId, modelId, languageCode: languageCode || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || `Erro ${res.status}`);
      setTestAudioUrl(data.audioDataUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setTestLoading(false);
    }
  }, [testText, voiceId, modelId]);

  const generateOne = useCallback(
    async (index: number) => {
      const script = scripts[index];
      if (!script || script.status === "generating") return;

      setScripts((prev) =>
        prev.map((s, i) => (i === index ? { ...s, status: "generating", error: undefined } : s)),
      );

      try {
        const res = await fetch("/api/admin/audio-bulk/generate-one", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: script.texto,
            voiceId,
            modelId,
            title: script.titulo,
            folder,
            languageCode: languageCode || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro || `Erro ${res.status}`);
        setScripts((prev) =>
          prev.map((s, i) =>
            i === index
              ? {
                  ...s,
                  status: "done",
                  audioUrl: data.audioUrl,
                  durationSec: data.durationSec,
                  charsUsed: data.charsUsed,
                }
              : s,
          ),
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro";
        setScripts((prev) =>
          prev.map((s, i) => (i === index ? { ...s, status: "error", error: msg } : s)),
        );
      }
    },
    [scripts, voiceId, modelId, folder],
  );

  const generateAll = useCallback(async () => {
    setGenerating(true);
    setError(null);
    // Sequential to avoid rate limits
    for (let i = 0; i < scripts.length; i++) {
      const current = scripts[i];
      if (current.status === "done") continue;
      await generateOne(i);
    }
    setGenerating(false);
  }, [scripts, generateOne]);

  const openAll = useCallback(() => {
    scripts.forEach((s) => {
      if (s.audioUrl) window.open(s.audioUrl, "_blank");
    });
  }, [scripts]);

  // ─── Stats ───────────────────────────────────────────────────────────

  const totalChars = scripts.reduce((sum, s) => sum + s.texto.length, 0);
  const doneCount = scripts.filter((s) => s.status === "done").length;
  const errorCount = scripts.filter((s) => s.status === "error").length;
  const totalDuration = scripts.reduce((sum, s) => sum + (s.durationSec || 0), 0);

  return (
    <>
      <h1 className="font-serif text-2xl font-semibold text-escola-creme">
        Geração de Áudio em Massa
      </h1>
      <p className="text-sm text-escola-creme-50 mt-1 mb-6">
        ElevenLabs → Supabase. Testa voz → carrega scripts → gera tudo → descarrega.
      </p>

      {error && (
        <div className="rounded-xl border border-escola-terracota/30 bg-escola-terracota/5 p-4 mb-4">
          <p className="text-sm text-escola-terracota">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs text-escola-creme-50 mt-1 underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* 1. Voz */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6 mb-4">
        <h2 className="font-serif text-lg font-medium text-escola-creme mb-3">1. Voz</h2>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs text-escola-creme-50 block mb-1">Voice ID</label>
            <input
              type="text"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none font-mono"
            />
            <p className="text-[10px] text-escola-creme-50 mt-0.5">
              Default: JGnWZj684pcXmK2SxYIv
            </p>
          </div>

          <div>
            <label className="text-xs text-escola-creme-50 block mb-1">Modelo</label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
            >
              <option value="eleven_multilingual_v2">Multilingual v2 (PT natural)</option>
              <option value="eleven_v3">v3 (expressivo, tags)</option>
              <option value="eleven_turbo_v2_5">Turbo v2.5 (rápido, mais barato)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-escola-creme-50 block mb-1">Pasta Supabase</label>
            <input
              type="text"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
            />
            <p className="text-[10px] text-escola-creme-50 mt-0.5">Ex: youtube, curso-ouro-proprio</p>
          </div>
        </div>

        {/* Language code opcional — evita pt-BR forcado */}
        <div className="mt-3">
          <label className="text-xs text-escola-creme-50 block mb-1">
            Language code (opcional — deixar VAZIO para voice decidir sotaque)
          </label>
          <input
            type="text"
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            placeholder="(vazio) | pt | pt-PT | en | es"
            className="w-full max-w-xs rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none font-mono"
          />
          <p className="text-[10px] text-escola-creme-50 mt-0.5">
            Vazio (recomendado): o voice ID mantem o sotaque original. &quot;pt&quot; pode forçar sotaque brasileiro em multilingual v2.
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-escola-border">
          <label className="text-xs text-escola-creme-50 block mb-1">Texto de teste</label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none resize-y font-mono"
          />
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <button
              onClick={testVoice}
              disabled={testLoading || !testText.trim()}
              className="rounded-lg border border-escola-dourado/40 px-4 py-1.5 text-xs text-escola-dourado hover:bg-escola-dourado/10 disabled:opacity-40"
            >
              {testLoading ? "A gerar..." : "Testar voz"}
            </button>
            {testAudioUrl && <audio controls src={testAudioUrl} className="h-8 flex-1 max-w-md" />}
          </div>
        </div>
      </div>

      {/* 2. Scripts */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-6 mb-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-serif text-lg font-medium text-escola-creme">2. Scripts</h2>
          <div className="flex gap-2 flex-wrap">
            {NOMEAR_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => loadPreset(p.id)}
                className="rounded-lg border border-escola-dourado/40 px-3 py-1.5 text-xs text-escola-dourado hover:bg-escola-dourado/10"
              >
                Carregar: {p.titulo}
              </button>
            ))}
            {scripts.length > 0 && (
              <button
                onClick={clearAll}
                className="rounded-lg border border-escola-terracota/30 px-3 py-1.5 text-xs text-escola-terracota hover:bg-escola-terracota/10"
              >
                Limpar todos
              </button>
            )}
          </div>
        </div>

        {/* Manual add */}
        <details className="mb-4">
          <summary className="text-xs text-escola-creme-50 cursor-pointer hover:text-escola-dourado">
            Adicionar script manualmente ▸
          </summary>
          <div className="mt-2 space-y-2 p-3 border border-escola-border rounded-lg">
            <input
              type="text"
              placeholder="Título"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
            />
            <textarea
              placeholder="Texto (com [pause] / [long pause] tags)"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={6}
              className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none resize-y font-mono"
            />
            <button
              onClick={addManual}
              className="rounded-lg bg-escola-dourado px-4 py-1.5 text-xs font-medium text-escola-bg hover:opacity-90"
            >
              Adicionar
            </button>
          </div>
        </details>

        {scripts.length === 0 ? (
          <p className="text-sm text-escola-creme-50/60 italic">
            Nenhum script carregado. Clica &quot;Carregar: Série Nomear&quot; em cima, ou adiciona manualmente.
          </p>
        ) : (
          <>
            {/* Summary */}
            <div className="flex items-center gap-4 flex-wrap text-xs text-escola-creme-50 mb-3 pb-3 border-b border-escola-border">
              <span>
                <span className="text-escola-creme font-medium">{scripts.length}</span> scripts
              </span>
              <span>
                ~<span className="text-escola-creme font-medium">{totalChars.toLocaleString()}</span> chars
              </span>
              {doneCount > 0 && (
                <span className="text-green-400">
                  {doneCount} pronto{doneCount > 1 ? "s" : ""}
                  {totalDuration > 0 && ` · ${Math.floor(totalDuration / 60)}m${Math.round(totalDuration % 60)}s áudio`}
                </span>
              )}
              {errorCount > 0 && <span className="text-escola-terracota">{errorCount} erros</span>}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap mb-4">
              <button
                onClick={generateAll}
                disabled={generating || doneCount === scripts.length}
                className="rounded-lg bg-escola-dourado px-5 py-2.5 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40"
              >
                {generating
                  ? "A gerar..."
                  : doneCount === scripts.length
                    ? "Todos prontos"
                    : doneCount > 0
                      ? `Continuar (faltam ${scripts.length - doneCount})`
                      : `Gerar todos (${scripts.length})`}
              </button>

              {doneCount > 0 && (
                <button
                  onClick={openAll}
                  className="rounded-lg border border-escola-dourado/40 px-4 py-2 text-xs text-escola-dourado hover:bg-escola-dourado/10"
                >
                  Abrir {doneCount} áudio{doneCount > 1 ? "s" : ""} em tabs
                </button>
              )}
            </div>

            {/* List */}
            <div className="space-y-2">
              {scripts.map((script, i) => (
                <div
                  key={script.id}
                  className={`border rounded-lg p-3 ${
                    script.status === "error"
                      ? "border-escola-terracota/40 bg-escola-terracota/5"
                      : script.status === "done"
                        ? "border-green-500/30"
                        : "border-escola-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        script.status === "done"
                          ? "bg-green-500"
                          : script.status === "error"
                            ? "bg-escola-terracota"
                            : script.status === "generating"
                              ? "bg-escola-dourado animate-pulse"
                              : "bg-escola-border"
                      }`}
                    />
                    <span className="text-[10px] font-mono text-escola-creme-50 w-5">{i + 1}</span>
                    <span className="text-sm text-escola-creme flex-1 truncate">
                      {script.titulo}
                    </span>
                    <span className="text-[10px] text-escola-creme-50 shrink-0">
                      {script.texto.length.toLocaleString()} chars
                      {script.durationSec && ` · ${script.durationSec.toFixed(1)}s`}
                    </span>
                    {script.status !== "generating" && script.status !== "done" && (
                      <button
                        onClick={() => generateOne(i)}
                        className="text-[10px] text-escola-dourado hover:underline shrink-0"
                      >
                        Gerar
                      </button>
                    )}
                    {script.status === "error" && (
                      <button
                        onClick={() => generateOne(i)}
                        className="text-[10px] text-escola-terracota hover:text-red-400 border border-escola-terracota/40 rounded px-2 py-0.5 shrink-0"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      onClick={() => removeScript(script.id)}
                      className="text-[10px] text-escola-creme-50 hover:text-escola-terracota shrink-0"
                      title="Remover"
                    >
                      ✕
                    </button>
                  </div>

                  {script.status === "error" && script.error && (
                    <p className="mt-1.5 text-[10px] text-escola-terracota">{script.error}</p>
                  )}

                  {script.status === "done" && script.audioUrl && (
                    <div className="mt-2 flex items-center gap-3 flex-wrap">
                      <audio controls src={script.audioUrl} className="h-7 flex-1 min-w-[200px] max-w-md" />
                      <a
                        href={script.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="text-[10px] text-escola-dourado hover:underline"
                      >
                        Descarregar
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
