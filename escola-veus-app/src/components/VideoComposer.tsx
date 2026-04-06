"use client";

import { useState, useRef } from "react";
import type { VideoScene } from "@/data/youtube-scripts";
import { SCENE_MOTION_PROMPTS } from "@/lib/comfyui-workflows";

// ─── TYPES ────────────────────────────────────────────────────────────────

export type ComposerScene = VideoScene & {
  imageUrl: string | null;
  approved: boolean;
};

type ClipStatus = "idle" | "generating" | "done" | "error";

type SceneClip = {
  status: ClipStatus;
  videoUrl: string | null;
  error: string | null;
};

// ─── COMPONENT ────────────────────────────────────────────────────────────

/**
 * VideoComposer — orchestrates real video clip generation via Wan 2.1.
 *
 * Pipeline per scene:
 *   1. Source image (uploaded by user or generated) →
 *   2. Wan 2.1 on ThinkDiffusion (image-to-video) →
 *   3. Animated video clip (5-10 seconds) →
 *   4. All clips + audio → final video (ffmpeg or manual montage)
 */
export default function VideoComposer({
  scenes,
  audioUrl,
  title,
  comfyuiUrl,
  courseSlug,
  hookIndex,
}: {
  scenes: ComposerScene[];
  audioUrl: string | null;
  title: string;
  comfyuiUrl?: string;
  courseSlug?: string;
  hookIndex?: number;
}) {
  const [clips, setClips] = useState<Record<number, SceneClip>>({});
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const shouldStop = useRef(false);

  function getClip(idx: number): SceneClip {
    return clips[idx] || { status: "idle", videoUrl: null, error: null };
  }

  function updateClip(idx: number, patch: Partial<SceneClip>) {
    setClips((prev) => ({
      ...prev,
      [idx]: { ...getClip(idx), ...patch },
    }));
  }

  const doneClips = scenes.filter((_, i) => getClip(i).status === "done").length;
  const hasComfyUI = !!comfyuiUrl?.trim();

  // ── Generate a single video clip ──────────────────────────────────

  async function generateClip(idx: number) {
    const scene = scenes[idx];
    if (!scene?.imageUrl || !hasComfyUI || !courseSlug) return;

    updateClip(idx, { status: "generating", error: null });

    try {
      const motionPrompt = buildMotionPrompt(scene);

      const res = await fetch("/api/admin/courses/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comfyuiUrl: comfyuiUrl!.trim(),
          sourceImageUrl: scene.imageUrl,
          motionPrompt,
          courseSlug,
          sceneLabel: `yt-hook${hookIndex ?? 0}-scene${idx}`,
          durationSec: scene.durationSec <= 15 ? 5 : 10,
          width: 1280,
          height: 720,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ erro: `HTTP ${res.status}` }));
        throw new Error(data.erro || `Erro ${res.status}`);
      }

      const data = await res.json();
      updateClip(idx, { status: "done", videoUrl: data.url });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      updateClip(idx, { status: "error", error: msg });
    }
  }

  // ── Generate all clips ────────────────────────────────────────────

  async function generateAllClips() {
    if (!hasComfyUI) return;

    shouldStop.current = false;
    setBatchRunning(true);

    const scenesWithImages = scenes
      .map((s, i) => ({ scene: s, idx: i }))
      .filter(({ scene, idx }) => scene.imageUrl && getClip(idx).status !== "done");

    setBatchProgress({ current: 0, total: scenesWithImages.length });

    for (let i = 0; i < scenesWithImages.length; i++) {
      if (shouldStop.current) break;
      setBatchProgress({ current: i + 1, total: scenesWithImages.length });
      await generateClip(scenesWithImages[i].idx);

      // Wan 2.1 is heavy — wait between clips
      if (i < scenesWithImages.length - 1) {
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    setBatchRunning(false);
  }

  // ── Upload a video clip manually ──────────────────────────────────

  function handleClipUpload(idx: number, file: File) {
    const url = URL.createObjectURL(file);
    updateClip(idx, { status: "done", videoUrl: url });
  }

  // ── Build motion prompt from scene ────────────────────────────────

  function buildMotionPrompt(scene: ComposerScene): string {
    const baseMotion = SCENE_MOTION_PROMPTS[scene.type] || SCENE_MOTION_PROMPTS["situacao"];
    // Add visual note context for more specific animation
    const visualContext = scene.visualNote
      ? `, ${scene.visualNote.replace(/[#()\[\]]/g, "").slice(0, 100)}`
      : "";
    return `${baseMotion}${visualContext}, smooth slow cinematic motion, 24fps, high quality`;
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-escola-dourado font-medium">
            Video Clips — Wan 2.1
          </h3>
          <p className="text-xs text-escola-creme-50 mt-1">
            Cada imagem e animada em video real pelo Wan 2.1 no ThinkDiffusion.
            {!hasComfyUI && " Configura o URL do ComfyUI acima."}
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm text-escola-creme">
            {doneClips}/{scenes.length} clips
          </span>
          {audioUrl && (
            <span className="text-xs text-green-400 block">Audio OK</span>
          )}
        </div>
      </div>

      {/* Batch actions */}
      <div className="flex items-center gap-3">
        {!batchRunning && hasComfyUI && doneClips < scenes.length && (
          <button
            onClick={generateAllClips}
            className="px-5 py-2.5 bg-escola-dourado text-escola-bg rounded-lg font-medium hover:bg-escola-dourado-quente transition-colors"
          >
            Gerar todos os video clips
          </button>
        )}
        {batchRunning && (
          <>
            <div className="flex-1">
              <div className="h-2 bg-escola-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-escola-dourado transition-all duration-1000"
                  style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-escola-creme-50 mt-1">
                Clip {batchProgress.current}/{batchProgress.total} — Wan 2.1 a animar...
              </p>
            </div>
            <button
              onClick={() => { shouldStop.current = true; }}
              className="px-4 py-2 bg-red-900/50 text-red-300 rounded-lg text-sm hover:bg-red-900/70"
            >
              Parar
            </button>
          </>
        )}
      </div>

      {/* Scene clips grid */}
      <div className="grid grid-cols-1 gap-3">
        {scenes.map((scene, idx) => {
          const clip = getClip(idx);
          return (
            <div key={idx} className="flex gap-4 bg-escola-bg rounded-lg p-4">
              {/* Video preview or image */}
              <div className="w-48 h-28 rounded-lg overflow-hidden flex-shrink-0 border border-escola-border relative">
                {clip.videoUrl ? (
                  <video
                    src={clip.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                    onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                  />
                ) : scene.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={scene.imageUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="text-escola-creme/60 text-xs">Foto estatica</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-escola-card flex items-center justify-center">
                    <span className="text-escola-creme-50 text-xs">Sem imagem</span>
                  </div>
                )}
                {clip.status === "generating" && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-6 h-6 border-2 border-escola-dourado border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                      <span className="text-xs text-escola-dourado">Wan 2.1...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Scene info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-escola-dourado font-mono text-xs uppercase">
                    {idx + 1}. {scene.type}
                  </span>
                  <span className="text-escola-creme-50 text-xs">~{scene.durationSec}s</span>
                  {clip.status === "done" && (
                    <span className="text-xs text-green-400">Video OK</span>
                  )}
                </div>
                {scene.overlayText && (
                  <p className="text-sm text-escola-creme mb-1">&ldquo;{scene.overlayText}&rdquo;</p>
                )}
                <p className="text-xs text-escola-creme-50 italic line-clamp-2">
                  {scene.visualNote}
                </p>
                {clip.error && (
                  <p className="text-xs text-red-400 mt-1">{clip.error}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                {hasComfyUI && scene.imageUrl && clip.status !== "generating" && (
                  <button
                    onClick={() => generateClip(idx)}
                    className={`text-xs px-3 py-1.5 rounded transition-colors ${
                      clip.status === "done"
                        ? "bg-green-800/40 text-green-300 hover:bg-green-800/60"
                        : clip.status === "error"
                        ? "bg-red-800/40 text-red-300 hover:bg-red-800/60"
                        : "bg-escola-dourado/20 text-escola-dourado hover:bg-escola-dourado/30"
                    }`}
                  >
                    {clip.status === "done" ? "Regerar" : clip.status === "error" ? "Tentar de novo" : "Animar (Wan 2.1)"}
                  </button>
                )}
                <label className="text-xs px-3 py-1.5 bg-escola-card text-escola-creme-50 rounded cursor-pointer hover:text-escola-creme text-center">
                  Carregar clip
                  <input
                    type="file"
                    accept="video/*,.webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleClipUpload(idx, f);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Download / export section */}
      {doneClips > 0 && (
        <div className="border-t border-escola-bg pt-4 space-y-3">
          <h4 className="text-sm text-escola-dourado">Exportar</h4>

          {/* Option 1: Download all clips + audio for manual montage */}
          <div className="flex flex-wrap gap-3">
            {scenes.map((scene, idx) => {
              const clip = getClip(idx);
              if (!clip.videoUrl) return null;
              return (
                <a
                  key={idx}
                  href={clip.videoUrl}
                  download={`${idx + 1}-${scene.type}.webp`}
                  className="text-xs px-3 py-1.5 bg-escola-card text-escola-creme-50 rounded hover:text-escola-creme"
                >
                  {idx + 1}. {scene.type}
                </a>
              );
            })}
            {audioUrl && (
              <a
                href={audioUrl}
                download={`${title.replace(/[^a-zA-Z0-9]/g, "-")}-audio.mp3`}
                className="text-xs px-3 py-1.5 bg-escola-dourado/20 text-escola-dourado rounded hover:bg-escola-dourado/30"
              >
                Audio completo
              </a>
            )}
          </div>

          <p className="text-xs text-escola-creme-50">
            Descarrega os clips + audio e monta no CapCut, DaVinci Resolve ou outro editor.
            Os clips ja estao animados — so precisas de os juntar com o audio e adicionar o texto.
          </p>

          {/* Montage instructions */}
          <details className="bg-escola-bg rounded-lg">
            <summary className="px-4 py-3 text-xs text-escola-creme-50 cursor-pointer">
              Guia de montagem rapida
            </summary>
            <div className="px-4 pb-4 text-xs text-escola-creme-50 space-y-2">
              <p>1. Abre o CapCut (gratis) ou DaVinci Resolve</p>
              <p>2. Importa todos os clips por ordem (1-abertura, 2-pergunta, etc.)</p>
              <p>3. Importa o audio e coloca na timeline</p>
              <p>4. Alinha cada clip com a parte correspondente do audio</p>
              <p>5. Adiciona o texto de overlay por cima de cada clip</p>
              <p>6. Adiciona transicoes dissolve (0.5-1s) entre clips</p>
              <p>7. Exporta em 1080p MP4</p>
            </div>
          </details>
        </div>
      )}

      {/* Not enough to compose */}
      {doneClips === 0 && !batchRunning && (
        <p className="text-xs text-escola-creme-50">
          {!hasComfyUI
            ? "Configura o URL do ComfyUI (ThinkDiffusion) acima para gerar video clips."
            : scenes.every((s) => !s.imageUrl)
            ? "Adiciona imagens as cenas primeiro (biblioteca ou upload individual)."
            : "Clica 'Gerar todos os video clips' para animar as imagens com Wan 2.1."}
        </p>
      )}
    </div>
  );
}
