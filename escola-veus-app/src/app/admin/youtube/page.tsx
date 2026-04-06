"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllCourses } from "@/data/courses";
import {
  getScriptsForCourse,
  getFullNarration,
} from "@/data/youtube-scripts";
import type { YouTubeScript } from "@/data/youtube-scripts";
import type { ComposerScene } from "@/components/VideoComposer";
import Link from "next/link";
import dynamic from "next/dynamic";

const VideoComposer = dynamic(() => import("@/components/VideoComposer"), { ssr: false });

const DEFAULT_VOICE_ID = "fnoNuVpfClX7lHKFbyZ2";

type AudioStatus = "idle" | "generating" | "done" | "error";
type ImageStatus = "idle" | "generating" | "done" | "error";

type SceneStatus = {
  audioStatus: AudioStatus;
  audioUrl: string | null;
  audioError: string | null;
  imageStatus: ImageStatus;
  imageUrl: string | null;
  imageError: string | null;
  editedNarration: string | null;
};

// Image in the library (uploaded by user)
type LibraryImage = {
  id: string;
  name: string;
  url: string;
  tags: string[]; // auto-extracted from filename
};

// Map scene types to likely image keywords
const SCENE_IMAGE_HINTS: Record<string, string[]> = {
  abertura: ["territorio", "paisagem", "casa", "espelho", "campo", "ponte", "arvore", "jardim", "caminho", "sala", "lago"],
  pergunta: ["silhueta", "presenca", "reflexao", "contemplacao"],
  situacao: ["silhueta", "avanco", "peso", "coragem", "contemplacao"],
  revelacao: ["espelho", "composicao", "territorio", "paisagem"],
  gesto: ["silhueta", "autoconexao", "recepcao", "abrir", "soltar", "maos"],
  frase_final: ["escuro", "territorio", "paisagem"],
  cta: ["territorio", "paisagem", "ouro", "espelho", "casa"],
  fecho: ["escuro", "territorio"],
};

// Map course slugs to territory image keywords
const COURSE_TERRITORY_MAP: Record<string, string[]> = {
  "ouro-proprio": ["ouro", "espelho", "casa", "dourado"],
  "sangue-e-seda": ["sangue", "seda", "arvore", "raiz"],
  "arte-da-inteireza": ["inteireza", "ponte", "margem"],
  "depois-do-fogo": ["fogo", "campo", "queimado", "broto"],
  "olhos-abertos": ["olhos", "aberto", "encruzilhada", "nevoeiro"],
  "pele-nua": ["pele", "lembra", "corpo", "paisagem"],
  "limite-sagrado": ["limite", "sagrado", "muralha", "luz"],
  "flores-no-escuro": ["flores", "escuro", "jardim", "subterraneo", "bioluminescen"],
  "peso-e-o-chao": ["peso", "chao", "caminho", "pedra"],
  "voz-de-dentro": ["voz", "dentro", "sala", "eco"],
};

function sceneKey(courseSlug: string, hookIndex: number, sceneIndex: number) {
  return `${courseSlug}-hook${hookIndex}-scene${sceneIndex}`;
}

function extractTags(filename: string): string[] {
  const name = filename
    .replace(/\.[^.]+$/, "") // remove extension
    .toLowerCase()
    .replace(/[-_]/g, " ");
  return name.split(/\s+/).filter((w) => w.length > 2);
}

function scoreMatch(tags: string[], keywords: string[]): number {
  let score = 0;
  for (const tag of tags) {
    for (const kw of keywords) {
      if (tag.includes(kw) || kw.includes(tag)) score++;
    }
  }
  return score;
}

export default function YouTubePage() {
  const { user } = useAuth();

  // Config
  const [apiKey, setApiKey] = useState("");
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const [modelo, setModelo] = useState<"v2" | "v3">("v2");
  const [speed, setSpeed] = useState(0.9);
  const [comfyuiUrl, setComfyuiUrl] = useState("");
  const [loraName, setLoraName] = useState("");
  const [showConfig, setShowConfig] = useState(false);

  // Selection
  const [selectedCourse, setSelectedCourse] = useState("");

  // Per-scene statuses
  const [statuses, setStatuses] = useState<Record<string, SceneStatus>>({});

  // Image library
  const [library, setLibrary] = useState<LibraryImage[]>([]);
  const [libraryDragOver, setLibraryDragOver] = useState(false);

  // Batch
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const shouldStop = useRef(false);

  // Full narration editing per hook
  const [fullNarrations, setFullNarrations] = useState<Record<string, string>>({});

  // Supabase library loading
  const [libraryLoading, setLibraryLoading] = useState(false);

  const courses = getAllCourses();
  const hooks = selectedCourse ? getScriptsForCourse(selectedCourse) : [];

  // Load images from Supabase on course change
  useEffect(() => {
    if (!selectedCourse) return;
    loadLibraryFromSupabase(selectedCourse);
  }, [selectedCourse]);

  async function loadLibraryFromSupabase(courseSlug: string) {
    setLibraryLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/list-assets?courseSlug=${courseSlug}&type=youtube`);
      if (res.ok) {
        const data = await res.json();
        if (data.images && data.images.length > 0) {
          const supabaseImages: LibraryImage[] = data.images.map((img: { name: string; url: string }) => ({
            id: `sb-${img.name}`,
            name: img.name,
            url: img.url,
            tags: extractTags(img.name),
          }));
          setLibrary((prev) => {
            // merge, don't duplicate
            const existing = new Set(prev.map((i) => i.name));
            return [...prev, ...supabaseImages.filter((i) => !existing.has(i.name))];
          });
        }
      }
    } catch {
      // silently fail - library is optional
    }
    setLibraryLoading(false);
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-escola-creme-50">Acesso restrito.</p>
      </div>
    );
  }

  function getStatus(key: string): SceneStatus {
    return (
      statuses[key] || {
        audioStatus: "idle",
        audioUrl: null,
        audioError: null,
        imageStatus: "idle",
        imageUrl: null,
        imageError: null,
        editedNarration: null,
      }
    );
  }

  function updateStatus(key: string, patch: Partial<SceneStatus>) {
    setStatuses((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || getStatus(key)), ...patch },
    }));
  }

  function getFullNarrationKey(hook: YouTubeScript) {
    return `${hook.courseSlug}-hook${hook.hookIndex}`;
  }

  function getEditableNarration(hook: YouTubeScript) {
    const key = getFullNarrationKey(hook);
    return fullNarrations[key] ?? getFullNarration(hook);
  }

  function setEditableNarration(hook: YouTubeScript, value: string) {
    const key = getFullNarrationKey(hook);
    setFullNarrations((prev) => ({ ...prev, [key]: value }));
  }

  // ── Library: bulk upload ──────────────────────────────────────────

  function addToLibrary(files: FileList | File[]) {
    const newImages: LibraryImage[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const url = URL.createObjectURL(file);
      newImages.push({
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        url,
        tags: extractTags(file.name),
      });
    }
    setLibrary((prev) => [...prev, ...newImages]);
    return newImages;
  }

  // ── Auto-assign images to scenes ──────────────────────────────────

  function autoAssignImages(hook: YouTubeScript) {
    if (library.length === 0) return;

    const courseKeywords = COURSE_TERRITORY_MAP[hook.courseSlug] || [];
    const used = new Set<string>();

    hook.scenes.forEach((scene, idx) => {
      const key = sceneKey(hook.courseSlug, hook.hookIndex, idx);
      const st = getStatus(key);
      if (st.imageStatus === "done") return; // already has image

      const sceneKeywords = [
        ...(SCENE_IMAGE_HINTS[scene.type] || []),
        ...courseKeywords,
      ];

      // Score each library image
      let bestImg: LibraryImage | null = null;
      let bestScore = 0;

      for (const img of library) {
        if (used.has(img.id)) continue;
        const s = scoreMatch(img.tags, sceneKeywords);
        if (s > bestScore) {
          bestScore = s;
          bestImg = img;
        }
      }

      // If no keyword match, use territory images for territory scenes, silhouettes for silhouette scenes
      if (!bestImg) {
        const isSilhouetteScene = ["pergunta", "situacao", "gesto"].includes(scene.type);
        for (const img of library) {
          if (used.has(img.id)) continue;
          const isSilhouetteImg = img.tags.some((t) => t.includes("silhueta") || t.includes("silhouette"));
          if (isSilhouetteScene === isSilhouetteImg) {
            bestImg = img;
            break;
          }
        }
      }

      // Fallback: use any remaining image
      if (!bestImg) {
        for (const img of library) {
          if (!used.has(img.id)) {
            bestImg = img;
            break;
          }
        }
      }

      if (bestImg) {
        used.add(bestImg.id);
        updateStatus(key, { imageStatus: "done", imageUrl: bestImg.url });
      }
    });
  }

  // ── Bulk: upload + auto-assign in one step ────────────────────────

  function handleBulkDrop(hook: YouTubeScript, files: FileList | File[]) {
    const newImages = addToLibrary(files);
    if (newImages.length > 0) {
      // Small delay to let state update
      setTimeout(() => autoAssignImages(hook), 100);
    }
  }

  // ── Audio generation ──────────────────────────────────────────────

  async function generateHookAudio(hook: YouTubeScript) {
    const narration = getEditableNarration(hook);
    const key = `${hook.courseSlug}-hook${hook.hookIndex}-full`;

    updateStatus(key, { audioStatus: "generating", audioError: null });

    try {
      const body: Record<string, unknown> = {
        script: narration,
        courseSlug: hook.courseSlug,
        moduleNum: 0,
        subLetter: `yt-hook-${hook.hookIndex}`,
        model: modelo,
        speed,
      };
      if (apiKey.trim()) body.apiKey = apiKey.trim();
      if (voiceId.trim()) body.voiceId = voiceId.trim();

      const res = await fetch("/api/admin/courses/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ erro: `HTTP ${res.status}` }));
        throw new Error(data.erro || `Erro ${res.status}`);
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("audio/")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        updateStatus(key, { audioStatus: "done", audioUrl: url });
      } else {
        const data = await res.json();
        updateStatus(key, { audioStatus: "done", audioUrl: data.url });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      updateStatus(key, { audioStatus: "error", audioError: msg });
    }
  }

  // ── Image generation per scene (ThinkDiffusion) ───────────────────

  async function generateSceneImage(hook: YouTubeScript, sceneIdx: number) {
    const scene = hook.scenes[sceneIdx];
    if (!scene) return;
    const key = sceneKey(hook.courseSlug, hook.hookIndex, sceneIdx);
    if (!comfyuiUrl.trim()) return;

    updateStatus(key, { imageStatus: "generating", imageError: null });

    try {
      const { buildLandscapeWorkflow } = await import("@/lib/comfyui-workflows");
      const prompt = `${scene.visualNote}. Style: dark atmospheric, pre-dawn sky #1A1A2E, terracotta silhouette, gold accents, cinematic, School of Life aesthetic`;
      const workflow = buildLandscapeWorkflow({
        prompt,
        loraName: loraName || undefined,
      });

      const res = await fetch("/api/admin/courses/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comfyuiUrl: comfyuiUrl.trim(),
          workflow,
          courseSlug: hook.courseSlug,
          moduleNum: 0,
          assetType: "youtube",
          filename: `yt-hook${hook.hookIndex}-scene${sceneIdx}.png`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ erro: `HTTP ${res.status}` }));
        throw new Error(data.erro || `Erro ${res.status}`);
      }

      const data = await res.json();
      updateStatus(key, { imageStatus: "done", imageUrl: data.url });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      updateStatus(key, { imageStatus: "error", imageError: msg });
    }
  }

  async function batchGenerateImages(hook: YouTubeScript) {
    if (!comfyuiUrl.trim()) return;
    shouldStop.current = false;
    setBatchRunning(true);
    setBatchProgress({ current: 0, total: hook.scenes.length });

    for (let i = 0; i < hook.scenes.length; i++) {
      if (shouldStop.current) break;
      setBatchProgress({ current: i + 1, total: hook.scenes.length });
      const key = sceneKey(hook.courseSlug, hook.hookIndex, i);
      const st = getStatus(key);
      if (st.imageStatus === "done") continue;
      await generateSceneImage(hook, i);
      if (i < hook.scenes.length - 1) await new Promise((r) => setTimeout(r, 3000));
    }
    setBatchRunning(false);
  }

  // ── Single image upload ───────────────────────────────────────────

  function handleImageUpload(hook: YouTubeScript, sceneIdx: number, file: File) {
    const url = URL.createObjectURL(file);
    const key = sceneKey(hook.courseSlug, hook.hookIndex, sceneIdx);
    updateStatus(key, { imageStatus: "done", imageUrl: url });
    // Also add to library
    addToLibrary([file]);
  }

  function handleAudioUpload(hook: YouTubeScript, file: File) {
    const url = URL.createObjectURL(file);
    const key = `${hook.courseSlug}-hook${hook.hookIndex}-full`;
    updateStatus(key, { audioStatus: "done", audioUrl: url });
  }

  // ── Assign library image to scene ─────────────────────────────────

  function assignLibraryImage(hook: YouTubeScript, sceneIdx: number, img: LibraryImage) {
    const key = sceneKey(hook.courseSlug, hook.hookIndex, sceneIdx);
    updateStatus(key, { imageStatus: "done", imageUrl: img.url });
  }

  // ── Counts ────────────────────────────────────────────────────────

  function getHookImageCount(hook: YouTubeScript) {
    return hook.scenes.filter((_, i) => {
      const key = sceneKey(hook.courseSlug, hook.hookIndex, i);
      return statuses[key]?.imageStatus === "done";
    }).length;
  }

  // ── Build composer scenes ─────────────────────────────────────────

  function buildComposerScenes(hook: YouTubeScript): ComposerScene[] {
    return hook.scenes.map((scene, idx) => {
      const key = sceneKey(hook.courseSlug, hook.hookIndex, idx);
      const st = getStatus(key);
      return { ...scene, imageUrl: st.imageUrl, approved: true };
    });
  }

  function isReadyToCompose(hook: YouTubeScript): boolean {
    const audioKey = `${hook.courseSlug}-hook${hook.hookIndex}-full`;
    const audioSt = getStatus(audioKey);
    return audioSt.audioStatus === "done" && getHookImageCount(hook) > 0;
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-escola-bg text-escola-creme p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/admin" className="text-escola-creme-50 hover:text-escola-creme text-sm">
            HUB
          </Link>
          <span className="text-escola-creme-50">/</span>
          <h1 className="font-serif text-3xl text-escola-creme">Videos YouTube</h1>
        </div>
        <p className="text-escola-creme-50 text-sm mb-8">
          Larga as imagens do OneDrive, gera o audio, e o video monta-se sozinho.
        </p>

        {/* ── Config (collapsible) ─────────────────────────────── */}
        <div className="bg-escola-card rounded-xl mb-8 overflow-hidden">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex items-center justify-between px-6 py-4 text-sm text-escola-creme-50 hover:text-escola-creme"
          >
            <span>Configuracao (ElevenLabs, ThinkDiffusion)</span>
            <span className={`transition-transform ${showConfig ? "rotate-180" : ""}`}>&#9662;</span>
          </button>
          {showConfig && (
            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-escola-bg pt-4">
              <div>
                <label className="block text-xs text-escola-creme-50 mb-1">ElevenLabs API Key</label>
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-escola-bg border border-escola-border rounded px-3 py-2 text-sm text-escola-creme"
                  placeholder="xi-... (vazio = env var do Vercel)" />
              </div>
              <div>
                <label className="block text-xs text-escola-creme-50 mb-1">Voice ID</label>
                <input type="text" value={voiceId} onChange={(e) => setVoiceId(e.target.value)}
                  className="w-full bg-escola-bg border border-escola-border rounded px-3 py-2 text-sm text-escola-creme" />
              </div>
              <div>
                <label className="block text-xs text-escola-creme-50 mb-1">Modelo</label>
                <select value={modelo} onChange={(e) => setModelo(e.target.value as "v2" | "v3")}
                  className="w-full bg-escola-bg border border-escola-border rounded px-3 py-2 text-sm text-escola-creme">
                  <option value="v2">Multilingual v2</option>
                  <option value="v3">Eleven v3</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-escola-creme-50 mb-1">Velocidade: {speed.toFixed(1)}x</label>
                <input type="range" min="0.5" max="1.5" step="0.05" value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full accent-escola-dourado" />
              </div>
              <div>
                <label className="block text-xs text-escola-creme-50 mb-1">ComfyUI URL (ThinkDiffusion)</label>
                <input type="text" value={comfyuiUrl} onChange={(e) => setComfyuiUrl(e.target.value)}
                  className="w-full bg-escola-bg border border-escola-border rounded px-3 py-2 text-sm text-escola-creme"
                  placeholder="https://your-instance.thinkdiffusion.com" />
              </div>
              <div>
                <label className="block text-xs text-escola-creme-50 mb-1">LoRA (opcional)</label>
                <input type="text" value={loraName} onChange={(e) => setLoraName(e.target.value)}
                  className="w-full bg-escola-bg border border-escola-border rounded px-3 py-2 text-sm text-escola-creme"
                  placeholder="seteveus-style.safetensors" />
              </div>
            </div>
          )}
        </div>

        {/* ── Image Library (drag-drop zone) ─────────────────── */}
        <div
          className={`rounded-xl mb-8 border-2 border-dashed transition-all ${
            libraryDragOver
              ? "border-escola-dourado bg-escola-dourado/5"
              : library.length > 0
              ? "border-escola-border bg-escola-card"
              : "border-escola-border bg-escola-card"
          }`}
          onDragOver={(e) => { e.preventDefault(); setLibraryDragOver(true); }}
          onDragLeave={() => setLibraryDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setLibraryDragOver(false);
            if (e.dataTransfer.files.length > 0) {
              addToLibrary(e.dataTransfer.files);
            }
          }}
        >
          {library.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-escola-creme-50 text-lg mb-2">
                Larga aqui as imagens do OneDrive
              </p>
              <p className="text-escola-creme-50 text-xs mb-4">
                Aceita multiplas imagens. Auto-atribui as cenas por nome do ficheiro.
              </p>
              <label className="inline-block px-4 py-2 bg-escola-bg border border-escola-border rounded text-sm text-escola-creme-50 cursor-pointer hover:text-escola-creme">
                Ou clica para seleccionar
                <input type="file" accept="image/*" multiple
                  onChange={(e) => { if (e.target.files) addToLibrary(e.target.files); }}
                  className="hidden" />
              </label>
              {libraryLoading && <p className="text-xs text-escola-creme-50 mt-3">A carregar do Supabase...</p>}
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-escola-creme-50 uppercase">
                  Biblioteca — {library.length} imagens
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-escola-creme-50 cursor-pointer hover:text-escola-creme">
                    + Adicionar mais
                    <input type="file" accept="image/*" multiple
                      onChange={(e) => { if (e.target.files) addToLibrary(e.target.files); }}
                      className="hidden" />
                  </label>
                  <button onClick={() => setLibrary([])}
                    className="text-xs text-escola-creme-50 hover:text-red-400">Limpar</button>
                </div>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {library.map((img) => (
                  <div key={img.id} className="aspect-square rounded overflow-hidden border border-escola-border group relative"
                    title={img.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                      <span className="text-[8px] text-escola-creme text-center leading-tight break-all">
                        {img.name.replace(/\.[^.]+$/, "")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Course selector ────────────────────────────────── */}
        <div className="mb-8">
          <label className="block text-sm text-escola-creme-50 mb-2">Selecciona o curso</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-escola-card border border-escola-border rounded px-4 py-3 text-escola-creme w-full max-w-md">
            <option value="">-- Escolhe um curso --</option>
            {courses.map((c) => {
              const courseHooks = getScriptsForCourse(c.slug);
              return (
                <option key={c.slug} value={c.slug} disabled={courseHooks.length === 0}>
                  {c.number}. {c.title} — {courseHooks.length} hooks
                </option>
              );
            })}
          </select>
        </div>

        {/* ── Hooks list ─────────────────────────────────────── */}
        {hooks.length > 0 && (
          <div className="space-y-4">
            {hooks.map((hook) => {
              const audioKey = `${hook.courseSlug}-hook${hook.hookIndex}-full`;
              const audioSt = getStatus(audioKey);
              const imageCount = getHookImageCount(hook);
              const ready = isReadyToCompose(hook);

              return (
                <details key={`${hook.courseSlug}-${hook.hookIndex}`}
                  className="bg-escola-card rounded-xl overflow-hidden group">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                    <div className="flex items-center gap-3">
                      <span className="text-escola-dourado font-mono text-sm w-8">H{hook.hookIndex + 1}</span>
                      <div>
                        <span className="text-escola-creme">{hook.title}</span>
                        <span className="text-xs text-escola-creme-50 ml-3">
                          {hook.durationMin} min — {hook.scenes.length} cenas
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {ready && <span className="text-xs text-green-400">Pronto</span>}
                      {!ready && audioSt.audioStatus === "done" && (
                        <span className="text-xs text-green-400">Audio OK</span>
                      )}
                      <span className="text-xs text-escola-creme-50">
                        Imagens: {imageCount}/{hook.scenes.length}
                      </span>
                      <span className="text-escola-creme-50 group-open:rotate-180 transition-transform">&#9662;</span>
                    </div>
                  </summary>

                  <div className="px-6 pb-6 border-t border-escola-bg space-y-6 pt-4">

                    {/* ── Quick actions bar ── */}
                    <div className="flex flex-wrap items-center gap-3">
                      {library.length > 0 && imageCount < hook.scenes.length && (
                        <button onClick={() => autoAssignImages(hook)}
                          className="text-sm px-4 py-2 bg-escola-dourado text-escola-creme rounded hover:bg-escola-dourado/80">
                          Auto-atribuir imagens da biblioteca
                        </button>
                      )}
                      {audioSt.audioStatus !== "done" && (
                        <button onClick={() => generateHookAudio(hook)}
                          disabled={audioSt.audioStatus === "generating"}
                          className="text-sm px-4 py-2 bg-escola-dourado text-escola-bg rounded hover:bg-escola-dourado hover:opacity-90 disabled:opacity-40">
                          {audioSt.audioStatus === "generating" ? "A gerar audio..." : "Gerar Audio"}
                        </button>
                      )}
                      {audioSt.audioStatus !== "done" && (
                        <label className="text-sm px-4 py-2 bg-escola-bg border border-escola-border rounded text-escola-creme-50 cursor-pointer hover:text-escola-creme">
                          Carregar MP3
                          <input type="file" accept="audio/*"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAudioUpload(hook, f); }}
                            className="hidden" />
                        </label>
                      )}
                      {comfyuiUrl.trim() && imageCount < hook.scenes.length && !batchRunning && (
                        <button onClick={() => batchGenerateImages(hook)}
                          className="text-sm px-4 py-2 bg-escola-border text-escola-creme-50 rounded hover:bg-escola-card">
                          Gerar imagens (ThinkDiffusion)
                        </button>
                      )}
                      {batchRunning && (
                        <button onClick={() => { shouldStop.current = true; }}
                          className="text-sm px-3 py-2 bg-red-600/80 text-escola-creme rounded">
                          Parar ({batchProgress.current}/{batchProgress.total})
                        </button>
                      )}
                    </div>

                    {/* Audio status */}
                    {audioSt.audioError && <p className="text-xs text-red-400">{audioSt.audioError}</p>}
                    {audioSt.audioUrl && (
                      <div className="flex items-center gap-3">
                        <audio controls src={audioSt.audioUrl} className="h-10 flex-1 max-w-lg" />
                        <button onClick={() => generateHookAudio(hook)}
                          disabled={audioSt.audioStatus === "generating"}
                          className="text-xs text-escola-creme-50 hover:text-escola-creme">
                          Regerar
                        </button>
                      </div>
                    )}

                    {/* ── Narration (collapsible) ── */}
                    <details className="bg-escola-bg rounded-lg">
                      <summary className="px-4 py-3 text-xs text-escola-creme-50 cursor-pointer">
                        Script da narracao (editavel)
                      </summary>
                      <div className="px-4 pb-4">
                        <textarea
                          value={getEditableNarration(hook)}
                          onChange={(e) => setEditableNarration(hook, e.target.value)}
                          className="w-full bg-transparent border border-escola-border rounded-lg px-3 py-2 text-sm text-escola-creme leading-relaxed resize-y min-h-32 max-h-64"
                          spellCheck={false} />
                        <button onClick={() => setEditableNarration(hook, getFullNarration(hook))}
                          className="text-xs text-escola-creme-50 hover:text-escola-creme mt-1">
                          Repor original
                        </button>
                      </div>
                    </details>

                    {/* ── Scenes with images ── */}
                    <div>
                      <p className="text-xs text-escola-creme-50 uppercase mb-3">
                        Cenas — clica na imagem para substituir, ou larga imagens na biblioteca acima
                      </p>

                      {/* Bulk drop zone for this hook */}
                      <div
                        className="border border-dashed border-escola-border rounded-lg p-2 mb-3 text-center"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files.length > 0) handleBulkDrop(hook, e.dataTransfer.files);
                        }}
                      >
                        <p className="text-xs text-escola-creme-50 py-1">
                          Larga imagens aqui para auto-atribuir a este hook
                        </p>
                      </div>

                      <div className="space-y-3">
                        {hook.scenes.map((scene, idx) => {
                          const key = sceneKey(hook.courseSlug, hook.hookIndex, idx);
                          const st = getStatus(key);
                          return (
                            <div key={idx} className="flex gap-4 bg-escola-bg rounded-lg p-4">
                              {/* Image preview / upload */}
                              <div
                                className="w-40 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-escola-border cursor-pointer relative group/img"
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept = "image/*";
                                  input.onchange = (ev) => {
                                    const f = (ev.target as HTMLInputElement).files?.[0];
                                    if (f) handleImageUpload(hook, idx, f);
                                  };
                                  input.click();
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const f = e.dataTransfer.files[0];
                                  if (f?.type.startsWith("image/")) handleImageUpload(hook, idx, f);
                                }}
                              >
                                {st.imageUrl ? (
                                  <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={st.imageUrl} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-escola-creme text-xs">Substituir</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full bg-escola-card flex items-center justify-center">
                                    <span className="text-escola-creme-50 text-2xl">+</span>
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
                                </div>
                                {scene.overlayText && (
                                  <p className="text-sm text-escola-creme mb-1">&ldquo;{scene.overlayText}&rdquo;</p>
                                )}
                                {scene.narration && (
                                  <p className="text-xs text-escola-creme-50 line-clamp-2">{scene.narration}</p>
                                )}
                                <p className="text-xs text-escola-creme-50 mt-1 italic">{scene.visualNote}</p>
                                {st.imageError && <p className="text-xs text-red-400 mt-1">{st.imageError}</p>}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-2 shrink-0">
                                {comfyuiUrl.trim() && (
                                  <button onClick={() => generateSceneImage(hook, idx)}
                                    disabled={st.imageStatus === "generating"}
                                    className={`text-xs px-3 py-1.5 rounded ${
                                      st.imageStatus === "generating"
                                        ? "bg-yellow-800/40 text-yellow-300 animate-pulse"
                                        : "bg-escola-border text-escola-creme-50 hover:bg-escola-card"
                                    }`}>
                                    {st.imageStatus === "generating" ? "A gerar..." : "Gerar (IA)"}
                                  </button>
                                )}
                                {/* Library quick-pick: show first 3 matching images */}
                                {!st.imageUrl && library.length > 0 && (
                                  <div className="flex gap-1">
                                    {library.slice(0, 3).map((img) => (
                                      <button key={img.id} onClick={() => assignLibraryImage(hook, idx, img)}
                                        className="w-6 h-6 rounded overflow-hidden border border-escola-border hover:border-escola-dourado"
                                        title={img.name}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── Compor Video ── */}
                    <div className="border-t border-escola-bg pt-4">
                      {imageCount > 0 ? (
                        <VideoComposer
                          scenes={buildComposerScenes(hook)}
                          audioUrl={audioSt.audioUrl}
                          title={hook.title}
                          comfyuiUrl={comfyuiUrl}
                          courseSlug={hook.courseSlug}
                          hookIndex={hook.hookIndex}
                        />
                      ) : (
                        <p className="text-xs text-escola-creme-50">
                          Adiciona imagens as cenas para gerar video clips com Wan 2.1.
                        </p>
                      )}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        )}

        {selectedCourse && hooks.length === 0 && (
          <p className="text-escola-creme-50 text-sm">Este curso ainda nao tem hooks YouTube definidos.</p>
        )}
      </div>
    </div>
  );
}
