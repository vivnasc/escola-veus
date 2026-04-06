"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { TERRITORY_PROMPTS, SILHOUETTE_POSES } from "@/lib/comfyui-workflows";

type TerritoryKey = keyof typeof TERRITORY_PROMPTS;

interface GeneratedImage {
  url: string;
  path: string;
  territory: string;
  stage: number;
  type: string;
  prompt_id: string;
}

export default function TerritoriosPage() {
  const { user, loading: authLoading } = useAuth();

  // ComfyUI config
  const [comfyuiUrl, setComfyuiUrl] = useState("");
  const [loraName, setLoraName] = useState("");
  const [loraStrength, setLoraStrength] = useState(0.8);

  // Generation state
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryKey | "">(
    ""
  );
  const [selectedStage, setSelectedStage] = useState(0);
  const [genType, setGenType] = useState<"landscape" | "silhouette">(
    "landscape"
  );
  const [selectedPose, setSelectedPose] = useState("standing");
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState("");

  // Connection test
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "ok" | "error"
  >("idle");
  const [connectionInfo, setConnectionInfo] = useState("");

  // Batch generation
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });
  const [batchStop, setBatchStop] = useState(false);

  async function testConnection() {
    if (!comfyuiUrl) return;
    setConnectionStatus("testing");
    setConnectionInfo("");

    try {
      const res = await fetch("/api/admin/courses/test-comfyui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comfyuiUrl }),
      });
      const data = await res.json();

      if (data.ok) {
        setConnectionStatus("ok");
        const ckptCount = data.checkpoints?.length || 0;
        const loraCount = data.loras?.length || 0;
        setConnectionInfo(
          `Conectado. ${ckptCount} checkpoints, ${loraCount} LoRAs.`
        );
      } else {
        setConnectionStatus("error");
        setConnectionInfo(data.error || "Erro desconhecido.");
      }
    } catch {
      setConnectionStatus("error");
      setConnectionInfo("Falha de rede.");
    }
  }

  async function generateSingle() {
    if (!comfyuiUrl || !selectedTerritory) return;
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/courses/generate-territory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comfyuiUrl,
          territory: selectedTerritory,
          stage: selectedStage,
          type: genType,
          pose: selectedPose,
          loraName: loraName || undefined,
          loraStrength,
        }),
      });

      const data = await res.json();
      if (data.erro) {
        setError(data.erro);
      } else {
        setGeneratedImages((prev) => [data, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setGenerating(false);
    }
  }

  async function generateAllLandscapes() {
    if (!comfyuiUrl) return;
    setBatchRunning(true);
    setBatchStop(false);

    const territories = Object.keys(TERRITORY_PROMPTS) as TerritoryKey[];
    const total = territories.length * 4;
    setBatchProgress({ done: 0, total });

    for (const territory of territories) {
      for (let stage = 0; stage < 4; stage++) {
        if (batchStop) break;

        try {
          const res = await fetch("/api/admin/courses/generate-territory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              comfyuiUrl,
              territory,
              stage,
              type: "landscape",
              loraName: loraName || undefined,
              loraStrength,
            }),
          });

          const data = await res.json();
          if (!data.erro) {
            setGeneratedImages((prev) => [data, ...prev]);
          }
        } catch {
          // Continue with next
        }

        setBatchProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      }
      if (batchStop) break;
    }

    setBatchRunning(false);
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-escola-dourado border-t-transparent" />
      </div>
    );
  }

  const territoryEntries = Object.entries(TERRITORY_PROMPTS) as [
    TerritoryKey,
    (typeof TERRITORY_PROMPTS)[TerritoryKey],
  ][];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-escola-creme">
            Territorios Visuais
          </h1>
          <p className="mt-1 text-sm text-escola-creme-50">
            10 territorios, 4 estagios cada — 40 paisagens do Mundo dos Veus
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/cursos/producao"
            className="text-sm text-escola-creme-50 transition-colors hover:text-escola-dourado"
          >
            Producao
          </Link>
          <Link
            href="/admin"
            className="text-sm text-escola-creme-50 transition-colors hover:text-escola-dourado"
          >
            Admin
          </Link>
        </div>
      </div>

      {/* ComfyUI Config */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-4">
        <h2 className="mb-4 font-serif text-xl font-medium text-escola-creme">
          Conexao ComfyUI / ThinkDiffusion
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-escola-creme-50">
              ComfyUI URL
            </label>
            <input
              type="url"
              value={comfyuiUrl}
              onChange={(e) => setComfyuiUrl(e.target.value)}
              placeholder="https://xxx.thinkdiffusion.xyz"
              className="w-full rounded-lg border border-escola-border bg-escola-card px-4 py-3 text-sm text-escola-creme placeholder:text-escola-creme-50 focus:border-escola-dourado focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-escola-creme-50">
              LoRA (opcional)
            </label>
            <input
              type="text"
              value={loraName}
              onChange={(e) => setLoraName(e.target.value)}
              placeholder="mundo-dos-veus-v1.safetensors"
              className="w-full rounded-lg border border-escola-border bg-escola-card px-4 py-3 text-sm text-escola-creme placeholder:text-escola-creme-50 focus:border-escola-dourado focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-escola-creme-50">
              LoRA Strength
            </label>
            <input
              type="number"
              value={loraStrength}
              onChange={(e) => setLoraStrength(Number(e.target.value))}
              min={0}
              max={1}
              step={0.05}
              className="w-full rounded-lg border border-escola-border bg-escola-card px-4 py-3 text-sm text-escola-creme placeholder:text-escola-creme-50 focus:border-escola-dourado focus:outline-none"
            />
          </div>
          <div className="flex items-end gap-3">
            <button
              onClick={testConnection}
              disabled={!comfyuiUrl || connectionStatus === "testing"}
              className="rounded-lg bg-escola-dourado px-4 py-3 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-50"
            >
              {connectionStatus === "testing" ? "A testar..." : "Testar"}
            </button>
            {connectionStatus === "ok" && (
              <span className="text-xs text-escola-dourado">
                {connectionInfo}
              </span>
            )}
            {connectionStatus === "error" && (
              <span className="text-xs text-escola-terracota">
                {connectionInfo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Single Generation */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-4">
        <h2 className="mb-4 font-serif text-xl font-medium text-escola-creme">
          Gerar Imagem Individual
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs text-escola-creme-50">
              Territorio
            </label>
            <select
              value={selectedTerritory}
              onChange={(e) =>
                setSelectedTerritory(e.target.value as TerritoryKey)
              }
              className="w-full rounded-lg border border-escola-border bg-escola-card px-3 py-2.5 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
            >
              <option value="">Seleccionar...</option>
              {territoryEntries.map(([key, data]) => (
                <option key={key} value={key}>
                  {data.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-escola-creme-50">
              Estagio (0-3)
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(Number(e.target.value))}
              className="w-full rounded-lg border border-escola-border bg-escola-card px-3 py-2.5 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
            >
              <option value={0}>0 — Inicio</option>
              <option value={1}>1 — Emergencia</option>
              <option value={2}>2 — Transformacao</option>
              <option value={3}>3 — Integracao</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-escola-creme-50">
              Tipo
            </label>
            <select
              value={genType}
              onChange={(e) =>
                setGenType(e.target.value as "landscape" | "silhouette")
              }
              className="w-full rounded-lg border border-escola-border bg-escola-card px-3 py-2.5 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
            >
              <option value="landscape">Paisagem</option>
              <option value="silhouette">Silhueta</option>
            </select>
          </div>
          {genType === "silhouette" && (
            <div>
              <label className="mb-1 block text-xs text-escola-creme-50">
                Pose
              </label>
              <select
                value={selectedPose}
                onChange={(e) => setSelectedPose(e.target.value)}
                className="w-full rounded-lg border border-escola-border bg-escola-card px-3 py-2.5 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
              >
                {Object.entries(SILHOUETTE_POSES).map(([key, desc]) => (
                  <option key={key} value={key}>
                    {key} — {desc.slice(0, 40)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-end">
            <button
              onClick={generateSingle}
              disabled={generating || !comfyuiUrl || !selectedTerritory}
              className="rounded-lg bg-escola-dourado px-4 py-3 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-50"
            >
              {generating ? "A gerar..." : "Gerar"}
            </button>
          </div>
        </div>

        {selectedTerritory && (
          <div className="mt-4 rounded-lg border border-escola-border bg-escola-bg/50 p-3">
            <p className="text-xs text-escola-creme-50">
              <span className="font-medium text-escola-creme">Prompt:</span>{" "}
              {TERRITORY_PROMPTS[selectedTerritory].stages[selectedStage]}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-lg border border-escola-terracota/30 bg-escola-terracota/10 px-4 py-2 text-sm text-escola-terracota">
            {error}
          </div>
        )}
      </div>

      {/* Batch Generation */}
      <div className="rounded-xl border border-escola-border bg-escola-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-medium text-escola-creme">
              Gerar Todas as Paisagens
            </h2>
            <p className="mt-1 text-xs text-escola-creme-50">
              10 territorios x 4 estagios = 40 paisagens. Cada uma demora ~30s-2min.
            </p>
          </div>
          <div className="flex gap-3">
            {batchRunning ? (
              <button
                onClick={() => setBatchStop(true)}
                className="rounded-lg border border-escola-terracota/40 bg-escola-terracota/10 px-4 py-3 text-sm text-escola-terracota hover:bg-escola-terracota/20"
              >
                Parar
              </button>
            ) : (
              <button
                onClick={generateAllLandscapes}
                disabled={!comfyuiUrl}
                className="rounded-lg bg-escola-dourado px-4 py-3 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-50"
              >
                Gerar 40 Paisagens
              </button>
            )}
          </div>
        </div>
        {batchRunning && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-escola-creme-50">
              <span>
                {batchProgress.done} / {batchProgress.total}
              </span>
              <span>
                {Math.round(
                  (batchProgress.done / batchProgress.total) * 100
                )}
                %
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-escola-border">
              <div
                className="h-full rounded-full bg-escola-dourado transition-all"
                style={{
                  width: `${(batchProgress.done / batchProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Territory Overview Grid */}
      <div>
        <h2 className="mb-4 font-serif text-xl font-medium text-escola-creme">
          Mapa dos Territorios
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {territoryEntries.map(([key, data]) => (
            <div
              key={key}
              className="rounded-xl border border-escola-border bg-escola-card p-4"
            >
              <h3 className="font-serif text-base font-medium text-escola-creme">
                {data.name}
              </h3>
              <p className="mb-3 text-xs text-escola-creme-50">{key}</p>
              <div className="space-y-2">
                {data.stages.map((stage, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-escola-dourado/10 text-xs text-escola-dourado">
                      {i}
                    </span>
                    <p className="text-xs leading-relaxed text-escola-creme-50">
                      {stage.slice(0, 80)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div>
          <h2 className="mb-4 font-serif text-xl font-medium text-escola-creme">
            Imagens Geradas ({generatedImages.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {generatedImages.map((img, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-escola-border bg-escola-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`${img.territory} stage ${img.stage}`}
                  className="aspect-video w-full object-cover"
                />
                <div className="p-3">
                  <p className="text-sm font-medium text-escola-creme">
                    {img.territory} — Estagio {img.stage}
                  </p>
                  <p className="text-xs text-escola-creme-50">{img.type}</p>
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs text-escola-creme-50 hover:text-escola-dourado"
                  >
                    Abrir imagem
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
