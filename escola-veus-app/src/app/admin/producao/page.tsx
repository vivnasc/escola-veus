"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

type SceneData = {
  type: string;
  narration: string;
  overlayText: string;
  visualNote: string;
  durationSec: number;
  audioUrl?: string;
  audioDurationSec?: number;
  imageUrl?: string;
  animationTaskId?: string;
  animationStatus?: string;
  animationUrl?: string;
  audioStartSec?: number;
  audioEndSec?: number;
};

type AnimationTask = { type: string; taskId: string; status?: string; videoUrl?: string | null };

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const YOUTUBE_HOOKS: Record<string, { index: number; title: string; duration: string }[]> = {
  "geral": [
    { index: 0, title: "Escola dos Véus — O que escondes de ti?", duration: "2 min" },
  ],
  "ouro-proprio": [
    { index: 0, title: "Porque sentes culpa quando gastas contigo (v2)", duration: "13 min" },
    { index: 1, title: "3 frases sobre dinheiro que a tua mae te ensinou sem saber", duration: "7 min" },
    { index: 2, title: "O teste do preco: diz o teu valor em voz alta", duration: "5 min" },
  ],
  "limite-sagrado": [
    { index: 0, title: "Porque dizes sim quando queres dizer não", duration: "13 min" },
  ],
};

const COURSE_OPTIONS = [
  { slug: "geral", label: "Trailer do Canal" },
  { slug: "limite-sagrado", label: "Limite Sagrado" },
  { slug: "ouro-proprio", label: "Ouro Próprio" },
];

const DEFAULT_VOICE_ID = "fnoNuVpfClX7lHKFbyZ2";

const SCENE_LABELS: Record<string, string> = {
  abertura: "Abertura", pergunta: "Pergunta", situacao: "Situacao",
  revelacao: "Revelacao", gesto: "Gesto", frase_final: "Frase Final",
  cta: "CTA", fecho: "Fecho",
  // v2
  trailer: "Trailer", gancho: "Gancho", reconhecimento: "Reconhecimento",
  framework: "Framework", exemplo: "Exemplo", exercicio: "Exercicio",
  reframe: "Reframe",
};

const STYLE = "minimalist flat illustration, faceless human figure made entirely of translucent layered veils, the veils ARE the body, no solid skin visible, figure composed of flowing semi-transparent fabric layers in dark navy-purple (#1A1A2E to #2D2045), warm golden light (#D4A853) glowing softly from within between veil layers, no race no facial features no clothing details, smooth organic flowing shapes, clean edges, no outlines, terracotta (#C4745A) accent details, dark navy background (#0D0D1A), calm symbolic abstract modern, large central figure filling the frame, 16:9 widescreen composition, no photorealism, no cartoon, no text, no words, no letters";

const MOTION: Record<string, string> = {
  abertura: "slow cinematic camera drift downward, golden particles floating",
  pergunta: "silhouette breathing slowly, golden light pulsing gently",
  situacao: "slow camera tracking, environment subtly alive",
  revelacao: "mirrors uncovering, veils lifting in slow motion",
  gesto: "hand extending, golden particles gathering in palm",
  frase_final: "very slow zoom into darkness",
  cta: "gentle wind, floating golden particles, warm light expanding",
  fecho: "slow dissolve upward into navy sky",
  // v2
  trailer: "slow cinematic sequence, veils lifting, silhouette emerging, golden light",
  gancho: "silhouette breathing slowly, golden light pulsing gently",
  reconhecimento: "slow camera tracking, environment subtly alive",
  framework: "didactic animation, diagrams appearing, slow reveal",
  exemplo: "narrative scene, warm lighting, dissolve transitions",
  exercicio: "hand on chest, golden glow growing, calm",
  reframe: "very slow zoom, text appearing in warm light",
};

const COURSE_BACKGROUND_MUSIC: Record<string, string> = {
  "ouro-proprio": "https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/curso-ouro-proprio/faixa-01.mp3",
};

const LORA_TRIGGER = "veus_figure";

function buildPrompt(visualNote: string): string {
  const trigger = `${LORA_TRIGGER}, `;
  if (visualNote && visualNote.length > 20) {
    const cleaned = visualNote.replace(/#[0-9A-Fa-f]{6}/g, "").replace(/\(.*?\)/g, "").trim();
    return `${trigger}${cleaned}, ${STYLE}`;
  }
  return `${trigger}contemplative scene, ${STYLE}`;
}

// ─── STEP INDICATOR ─────────────────────────────────────────────────────────

const STEPS = ["Script", "Audio", "Imagens", "Animacoes", "Legendas", "Resultado"];

function StepIndicator({ current, completed }: { current: number; completed: boolean[] }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              i === current
                ? "bg-escola-dourado text-escola-bg"
                : completed[i]
                ? "bg-green-500/20 text-green-400"
                : "bg-escola-border text-escola-creme-50"
            }`}
          >
            {completed[i] ? "\u2713" : i + 1}
          </div>
          <span className={`text-xs hidden sm:block ${i === current ? "text-escola-dourado" : "text-escola-creme-50"}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && <div className="w-4 h-px bg-escola-border mx-1" />}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function ProductionPage() {
  const [selectedCourse, setSelectedCourse] = useState("geral");
  const [selectedHook, setSelectedHook] = useState(0);

  // ─── localStorage persistence key ────────────────────────────────────
  const storageKey = `producao-${selectedCourse}-hook${selectedHook}`;

  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(Array(6).fill(false));
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const [showVoiceField, setShowVoiceField] = useState(false);
  const [scenes, setScenes] = useState<SceneData[]>([]);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptApproved, setScriptApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Audio
  const [totalAudioDuration, setTotalAudioDuration] = useState(0);

  // Animations
  const [animPolling, setAnimPolling] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subtitles
  const [srt, setSrt] = useState("");
  const [vtt, setVtt] = useState("");

  // Render
  const [renderProgress, setRenderProgress] = useState<number | null>(null);
  const [renderLabel, setRenderLabel] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Background music
  const [bgMusicUrl, setBgMusicUrl] = useState("");
  const [customMusicUrl, setCustomMusicUrl] = useState("");

  // Manifest
  const [manifestUrl, setManifestUrl] = useState("");

  // YouTube metadata
  const [ytTitle, setYtTitle] = useState("");
  const [ytDescription, setYtDescription] = useState("");
  const [ytTags, setYtTags] = useState("");

  // ─── AUTO-SAVE progress to localStorage ──────────────────────────────
  useEffect(() => {
    if (scenes.length === 0) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        scenes, step, completed, voiceId, srt, vtt, bgMusicUrl, videoUrl,
        totalAudioDuration, scriptApproved,
      }));
    } catch { /* quota exceeded — silent */ }
  }, [scenes, step, completed, voiceId, srt, vtt, bgMusicUrl, videoUrl, totalAudioDuration, scriptApproved, storageKey]);

  // ─── RESTORE progress from localStorage on course/hook change ────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.scenes?.length > 0) {
          setScenes(data.scenes);
          setStep(data.step ?? 0);
          setCompleted(data.completed ?? Array(6).fill(false));
          setVoiceId(data.voiceId ?? DEFAULT_VOICE_ID);
          setSrt(data.srt ?? "");
          setVtt(data.vtt ?? "");
          setBgMusicUrl(data.bgMusicUrl ?? "");
          setVideoUrl(data.videoUrl ?? "");
          setTotalAudioDuration(data.totalAudioDuration ?? 0);
          setScriptApproved(data.scriptApproved ?? false);
          return; // don't load from API — we have saved progress
        }
      }
    } catch { /* parse error — ignore, load fresh */ }
  }, [storageKey]);

  const markComplete = useCallback((s: number) => {
    setCompleted((prev) => { const n = [...prev]; n[s] = true; return n; });
  }, []);

  // ─── STEP 1: LOAD SCRIPT ─────────────────────────────────────────────────

  const loadScript = useCallback(async () => {
    setScriptLoading(true);
    setScriptApproved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/courses/preview-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: selectedCourse, scriptType: "youtube", hookIndex: selectedHook }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.erro || `Erro ${res.status}`); }
      const data = await res.json();
      setScenes((data.scenes || []).map((s: SceneData) => ({
        ...s,
        visualNote: s.visualNote || "",
        durationSec: s.durationSec || 15,
      })));
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro"); }
    finally { setScriptLoading(false); }
  }, [selectedCourse, selectedHook]);

  // Only auto-load script if no saved progress exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) { const d = JSON.parse(saved); if (d.scenes?.length > 0) return; }
    } catch { /* ignore */ }
    loadScript();
  }, [loadScript, storageKey]);

  // ─── STEP 2: GENERATE AUDIO ──────────────────────────────────────────────

  const generateSceneAudio = useCallback(async (index: number) => {
    const scene = scenes[index];
    if (!scene.narration?.trim()) return;
    setLoading((p) => ({ ...p, [`audio-${index}`]: true }));
    setError(null);
    try {
      const res = await fetch("/api/admin/courses/generate-scene-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: selectedCourse,
          sceneLabel: `yt-hook${selectedHook}`,
          sceneIndex: index,
          narration: scene.narration,
          voiceId: voiceId.trim() || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.erro || `Erro ${res.status}`); }
      const data = await res.json();
      setScenes((prev) => {
        const n = [...prev];
        n[index] = { ...n[index], audioUrl: data.audioUrl, audioDurationSec: data.durationSec };
        return n;
      });
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading((p) => ({ ...p, [`audio-${index}`]: false })); }
  }, [scenes, selectedCourse, selectedHook, voiceId]);

  const generateAllAudio = useCallback(async () => {
    setLoading((p) => ({ ...p, allAudio: true }));
    // Limpar áudios antigos para ficar claro que está a regenerar
    setScenes((prev) => prev.map((s) => ({ ...s, audioUrl: undefined, audioDurationSec: undefined })));
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].narration?.trim()) {
        await generateSceneAudio(i);
      }
    }
    // Compute timestamps
    setScenes((prev) => {
      const updated = [...prev];
      let t = 0;
      for (const s of updated) {
        s.audioStartSec = t;
        const dur = s.audioDurationSec || s.durationSec;
        s.audioEndSec = t + dur;
        if (s.audioDurationSec) s.durationSec = s.audioDurationSec + 1;
        t += s.durationSec;
      }
      time = t;
      return updated;
    });
    setTotalAudioDuration(time);
    setLoading((p) => ({ ...p, allAudio: false }));
  }, [scenes, generateSceneAudio]);


  // ─── STEP 3: GENERATE IMAGES ─────────────────────────────────────────────

  const generateSceneImage = useCallback(async (index: number) => {
    const scene = scenes[index];
    setLoading((p) => ({ ...p, [`img-${index}`]: true }));
    setError(null);
    try {
      const prompt = buildPrompt(scene.visualNote);
      const res = await fetch("/api/admin/courses/generate-image-flux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, courseSlug: selectedCourse, sceneLabel: `yt-hook${selectedHook}-${scene.type}` }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.erro || `Erro ${res.status}`); }
      const data = await res.json();
      setScenes((prev) => { const n = [...prev]; n[index] = { ...n[index], imageUrl: data.url }; return n; });
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading((p) => ({ ...p, [`img-${index}`]: false })); }
  }, [scenes, selectedCourse, selectedHook]);

  const generateAllImages = useCallback(async () => {
    setLoading((p) => ({ ...p, allImages: true }));
    for (let i = 0; i < scenes.length; i += 3) {
      const batch = scenes.slice(i, Math.min(i + 3, scenes.length));
      await Promise.all(batch.map((_, bi) => generateSceneImage(i + bi)));
    }
    setLoading((p) => ({ ...p, allImages: false }));
  }, [scenes, generateSceneImage]);

  // ─── STEP 4: SUBMIT ANIMATIONS ───────────────────────────────────────────

  const submitSceneAnimation = useCallback(async (index: number) => {
    const scene = scenes[index];
    if (!scene.imageUrl) return;
    setLoading((p) => ({ ...p, [`anim-${index}`]: true }));
    setError(null);
    try {
      const motion = MOTION[scene.type] || "slow cinematic movement";
      const res = await fetch("/api/admin/courses/submit-animation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: scene.imageUrl, motionPrompt: motion, provider: "runway", courseSlug: selectedCourse }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.erro || `Erro ${res.status}`); }
      const data = await res.json();
      setScenes((prev) => {
        const n = [...prev];
        n[index] = { ...n[index], animationTaskId: data.taskId, animationStatus: "processing" };
        return n;
      });
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading((p) => ({ ...p, [`anim-${index}`]: false })); }
  }, [scenes, selectedCourse]);

  const submitAllAnimations = useCallback(async () => {
    setLoading((p) => ({ ...p, allAnim: true }));
    const withImages = scenes.map((s, i) => ({ s, i })).filter(({ s }) => s.imageUrl);
    await Promise.all(withImages.map(({ i }) => submitSceneAnimation(i)));
    setLoading((p) => ({ ...p, allAnim: false }));
    startPolling();
  }, [scenes, submitSceneAnimation]);

  function startPolling() {
    setAnimPolling(true);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(async () => {
      const tasks = scenes.filter((s) => s.animationTaskId && s.animationStatus === "processing")
        .map((s) => ({ type: s.type, taskId: s.animationTaskId! }));
      if (tasks.length === 0) {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        setAnimPolling(false);
        return;
      }
      try {
        const res = await fetch("/api/admin/courses/animation-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks, provider: "runway", courseSlug: selectedCourse }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setScenes((prev) => {
          const n = [...prev];
          for (const t of data.tasks) {
            const idx = n.findIndex((s) => s.animationTaskId === t.taskId);
            if (idx >= 0) {
              n[idx] = { ...n[idx], animationStatus: t.status, animationUrl: t.videoUrl || undefined };
            }
          }
          return n;
        });
        if (data.allDone) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setAnimPolling(false);
        }
      } catch { /* retry */ }
    }, 15000);
  }

  // ─── STEP 5: SUBTITLES ───────────────────────────────────────────────────

  const generateSubtitles = useCallback(async () => {
    setLoading((p) => ({ ...p, subs: true }));
    setError(null);
    try {
      const res = await fetch("/api/admin/courses/generate-subtitles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenes: scenes.map((s) => ({
            narration: s.narration,
            audioStartSec: s.audioStartSec ?? 0,
            audioEndSec: s.audioEndSec ?? s.durationSec,
            type: s.type,
          })),
          title: (YOUTUBE_HOOKS[selectedCourse] || [])[selectedHook]?.title,
          courseSlug: selectedCourse,
        }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.erro || `Erro ${res.status}`); }
      const data = await res.json();
      setSrt(data.srt || "");
      setVtt(data.vtt || "");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading((p) => ({ ...p, subs: false })); }
  }, [scenes, selectedHook, selectedCourse]);

  // ─── STEP 6: SAVE MANIFEST ───────────────────────────────────────────────

  const saveManifest = useCallback(async () => {
    setLoading((p) => ({ ...p, manifest: true }));
    setError(null);
    try {
      const hooks = YOUTUBE_HOOKS[selectedCourse] || [];
      const manifest = {
        courseSlug: selectedCourse,
        title: hooks[selectedHook]?.title,
        audioUrls: scenes.filter((s) => s.audioUrl).map((s) => ({ type: s.type, url: s.audioUrl })),
        backgroundMusicUrl: bgMusicUrl || COURSE_BACKGROUND_MUSIC[selectedCourse] || "",
        scenes: scenes.map((s) => ({
          type: s.type, narration: s.narration, overlayText: s.overlayText,
          durationSec: s.durationSec, imageUrl: s.imageUrl || null,
          animationUrl: s.animationUrl || null, animationTaskId: s.animationTaskId || null,
          audioUrl: s.audioUrl || null, audioStartSec: s.audioStartSec ?? null, audioEndSec: s.audioEndSec ?? null,
        })),
        totalDurationSec: totalAudioDuration,
        createdAt: new Date().toISOString(),
      };
      const res = await fetch("/api/admin/courses/save-manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: selectedCourse, sceneLabel: `yt-hook${selectedHook}`, manifest }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.erro || `Erro ${res.status}`); }
      const data = await res.json();
      setManifestUrl(data.manifestUrl);
      const hook = hooks[selectedHook];
      if (hook) {
        setYtTitle(hook.title);
        setYtDescription(`${hook.title}\n\nEscola dos Veus — autoconhecimento com profundidade.\n\n#escoladosveus #seteveus #autoconhecimento`);
        setYtTags("escola dos veus, sete veus, autoconhecimento, " + selectedCourse.replace(/-/g, " "));
      }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading((p) => ({ ...p, manifest: false })); }
  }, [scenes, selectedCourse, selectedHook, totalAudioDuration, bgMusicUrl]);

  // ─── GENERATE BACKGROUND MUSIC ─────────────────────────────────────────

  const generateMusic = useCallback(async () => {
    setLoading((p) => ({ ...p, music: true }));
    setError(null);
    try {
      const res = await fetch("/api/admin/courses/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: selectedCourse }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.erro || `Erro ${res.status}`); }
      const data = await res.json();
      setBgMusicUrl(data.audioUrl);
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading((p) => ({ ...p, music: false })); }
  }, [selectedCourse]);

  // ─── RENDER FINAL VIDEO ───────────────────────────────────────────────

  const renderVideo = useCallback(async () => {
    setLoading((p) => ({ ...p, render: true }));
    setRenderProgress(0);
    setRenderLabel("A iniciar...");
    setVideoUrl("");
    setError(null);
    try {
      const renderHooks = YOUTUBE_HOOKS[selectedCourse] || [];
      const manifest = {
        courseSlug: selectedCourse,
        title: renderHooks[selectedHook]?.title,
        sceneLabel: `yt-hook${selectedHook}`,
        audioUrl: scenes.find((s) => s.audioUrl)?.audioUrl || "",
        backgroundMusicUrl: bgMusicUrl || COURSE_BACKGROUND_MUSIC[selectedCourse] || "",
        backgroundMusicVolume: 0.12,
        scenes: scenes.map((s) => ({
          type: s.type, narration: s.narration, overlayText: s.overlayText,
          durationSec: s.durationSec, imageUrl: s.imageUrl || null,
          animationUrl: s.animationUrl || null,
          audioStartSec: s.audioStartSec ?? null, audioEndSec: s.audioEndSec ?? null,
        })),
      };

      const res = await fetch("/api/admin/courses/render-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest }),
      });

      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.erro || `Erro ${res.status}`); }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Sem stream");
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
            if (data.type === "progress") {
              setRenderProgress(data.percent);
              setRenderLabel(data.label);
            } else if (data.type === "result") {
              setVideoUrl(data.videoUrl);
              setRenderProgress(100);
              setRenderLabel("Video pronto!");
              markComplete(5);
            } else if (data.type === "error") {
              throw new Error(data.message);
            }
          } catch (e) {
            if (e instanceof Error && e.message !== "Unexpected end of JSON input") throw e;
          }
        }
      }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro no render"); }
    finally { setLoading((p) => ({ ...p, render: false })); }
  }, [scenes, selectedCourse, selectedHook, bgMusicUrl, markComplete]);

  function downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }


  // ─── RENDER ───────────────────────────────────────────────────────────────

  const audioComplete = scenes.length > 0 && scenes.filter((s) => s.narration?.trim()).every((s) => s.audioUrl);
  const imagesComplete = scenes.length > 0 && scenes.every((s) => s.imageUrl);
  const animsComplete = scenes.filter((s) => s.animationTaskId).length > 0 &&
    scenes.filter((s) => s.animationTaskId).every((s) => s.animationStatus === "done" || s.animationStatus === "failed");
  const subsComplete = srt.length > 0;

  return (
    <>
      <h1 className="font-serif text-2xl font-semibold text-escola-creme">
        Producao de Videos
      </h1>
      <p className="text-sm text-escola-creme-50 mt-1 mb-4">
        Pipeline passo a passo — revisa e controla cada etapa
      </p>

      <StepIndicator current={step} completed={completed} />

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-escola-terracota/30 bg-escola-terracota/5 p-4 mb-4">
          <p className="text-sm text-escola-terracota">{error}</p>
          <button onClick={() => setError(null)} className="text-xs text-escola-creme-50 mt-1 underline">Fechar</button>
        </div>
      )}

      {/* ─── STEP 1: SCRIPT ──────────────────────────────────────────────── */}
      <div className={`rounded-xl border bg-escola-card p-6 mb-4 ${step === 0 ? "border-escola-dourado/50" : "border-escola-border"}`}>
        <button onClick={() => setStep(0)} className="w-full text-left">
          <h2 className="font-serif text-lg font-medium text-escola-creme flex items-center gap-2">
            {completed[0] && <span className="text-green-400 text-sm">&#10003;</span>}
            1. Script
          </h2>
        </button>

        {step === 0 && (
          <div className="mt-4 space-y-4">
            {/* Course selector */}
            <div className="space-y-2">
              <label className="text-xs text-escola-creme-50">Curso:</label>
              <select value={selectedCourse}
                onChange={(e) => { setSelectedCourse(e.target.value); setSelectedHook(0); setScriptApproved(false); }}
                className="w-full max-w-md rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none">
                {COURSE_OPTIONS.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Hook selector */}
            <div className="space-y-2">
              {(YOUTUBE_HOOKS[selectedCourse] || []).map((hook) => (
                <label key={hook.index} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${selectedHook === hook.index ? "border-escola-dourado bg-escola-dourado/5" : "border-escola-border hover:border-escola-dourado/30"}`}>
                  <input type="radio" name="hook" checked={selectedHook === hook.index}
                    onChange={() => { setSelectedHook(hook.index); setScriptApproved(false); }}
                    className="accent-[#D4A853]" />
                  <div className="flex-1">
                    <p className="text-sm text-escola-creme">{hook.title}</p>
                    <p className="text-xs text-escola-creme-50">{hook.duration}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Voice toggle */}
            <div>
              <button onClick={() => setShowVoiceField(!showVoiceField)} className="text-xs text-escola-creme-50 hover:text-escola-creme">
                {showVoiceField ? "Esconder voz" : "Mudar voz"}
              </button>
              {showVoiceField && (
                <input type="text" value={voiceId} onChange={(e) => setVoiceId(e.target.value)}
                  className="mt-2 w-full max-w-md rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
                  placeholder="Voice ID do ElevenLabs" />
              )}
            </div>

            {/* Script scenes */}
            {scriptLoading ? (
              <p className="text-sm text-escola-creme-50 animate-pulse">A carregar...</p>
            ) : (
              <div className="space-y-3">
                {scenes.map((scene, i) => (
                  <div key={i} className="border border-escola-border rounded-lg p-3">
                    <span className="text-xs font-medium text-escola-dourado bg-escola-dourado/10 px-2 py-0.5 rounded">
                      {SCENE_LABELS[scene.type] || scene.type}
                    </span>
                    {scene.narration ? (
                      <>
                        <textarea value={scene.narration}
                          onChange={(e) => {
                            const n = [...scenes]; n[i] = { ...n[i], narration: e.target.value };
                            setScenes(n); setScriptApproved(false);
                          }}
                          rows={Math.max(3, Math.ceil(scene.narration.length / 80))}
                          className="mt-2 w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none resize-y font-mono leading-relaxed" />
                        {/* v3 pause indicators */}
                        {(() => {
                          const longPauses = (scene.narration.match(/\[long pause\]/g) || []).length;
                          const pauses = (scene.narration.match(/\[pause\]/g) || []).length;
                          const shortPauses = (scene.narration.match(/\[short pause\]/g) || []).length;
                          const tags = (scene.narration.match(/\[(calm|thoughtful|whispers|sighs)\]/g) || []).length;
                          const words = scene.narration.split(/\s+/).length;
                          const totalPauses = longPauses + pauses + shortPauses;
                          return (
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-escola-creme-50">
                                v3: {longPauses}×[long] {pauses}×[pause] {shortPauses}×[short] {tags}×tags ~{words} palavras
                              </span>
                              {totalPauses === 0 && <span className="text-[10px] text-escola-terracota">Sem pausas — adiciona [pause] ou [short pause] para o v3 respirar</span>}
                            </div>
                          );
                        })()}
                      </>
                    ) : (
                      <p className="mt-1 text-xs text-escola-creme-50 italic">
                        {scene.overlayText ? `Texto: "${scene.overlayText}"` : "Cena silenciosa"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              {scriptApproved ? (
                <>
                  <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full">Aprovado</span>
                  <button onClick={() => setScriptApproved(false)} className="text-xs text-escola-creme-50 hover:text-escola-creme">Editar</button>
                </>
              ) : (
                <button onClick={() => { setScriptApproved(true); markComplete(0); setStep(1); }}
                  disabled={scenes.length === 0}
                  className="rounded-lg bg-escola-dourado px-6 py-2.5 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
                  Aprovar e avancar
                </button>
              )}
              <button onClick={loadScript} className="text-xs text-escola-creme-50 hover:text-escola-creme">Repor original</button>
              <button onClick={() => {
                localStorage.removeItem(storageKey);
                setStep(0); setCompleted(Array(6).fill(false)); setScenes([]);
                setSrt(""); setVtt(""); setBgMusicUrl(""); setVideoUrl("");
                setTotalAudioDuration(0); setScriptApproved(false); setError(null);
              }} className="text-xs text-escola-terracota hover:text-red-400">Limpar progresso guardado</button>
            </div>
          </div>
        )}
      </div>

      {/* ─── STEP 2: AUDIO ───────────────────────────────────────────────── */}
      <div className={`rounded-xl border bg-escola-card p-6 mb-4 ${step === 1 ? "border-escola-dourado/50" : "border-escola-border"}`}>
        <button onClick={() => completed[0] && setStep(1)} className="w-full text-left">
          <h2 className="font-serif text-lg font-medium text-escola-creme flex items-center gap-2">
            {completed[1] && <span className="text-green-400 text-sm">&#10003;</span>}
            2. Audio
          </h2>
        </button>

        {step === 1 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 mb-3">
              <button onClick={generateAllAudio} disabled={loading.allAudio}
                className="rounded-lg bg-escola-dourado px-5 py-2.5 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
                {loading.allAudio ? "A gerar..." : scenes.some((s) => s.audioUrl) ? "Re-gerar todo o audio" : "Gerar todo o audio"}
              </button>
              {scenes.some((s) => s.audioUrl) && !loading.allAudio && (
                <button onClick={() => setScenes((prev) => prev.map((s) => ({ ...s, audioUrl: undefined, audioDurationSec: undefined })))}
                  className="text-xs text-escola-creme-50 hover:text-escola-terracota">
                  Limpar todos
                </button>
              )}
              {totalAudioDuration > 0 && (
                <span className="text-xs text-escola-creme-50">
                  Total: {Math.floor(totalAudioDuration / 60)}m{Math.round(totalAudioDuration % 60)}s
                </span>
              )}
            </div>

            {scenes.map((scene, i) => (
              <div key={i} className="border border-escola-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-escola-dourado">{SCENE_LABELS[scene.type] || scene.type}</span>
                  {scene.narration?.trim() && (
                    <button onClick={() => generateSceneAudio(i)} disabled={loading[`audio-${i}`]}
                      className="text-xs text-escola-creme-50 hover:text-escola-dourado disabled:opacity-40">
                      {loading[`audio-${i}`] ? "..." : scene.audioUrl ? "Re-gerar" : "Gerar"}
                    </button>
                  )}
                </div>
                {scene.audioUrl ? (
                  <div className="mt-2">
                    <audio controls src={scene.audioUrl} className="w-full h-8" />
                    <p className="text-[10px] text-escola-creme-50 mt-1">{scene.audioDurationSec?.toFixed(1)}s</p>
                  </div>
                ) : !scene.narration?.trim() ? (
                  <p className="text-[10px] text-escola-creme-50 mt-1">Sem narracao ({scene.durationSec}s silencio)</p>
                ) : null}
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(0)} className="text-xs text-escola-creme-50 hover:text-escola-creme">Voltar</button>
              <button onClick={() => { markComplete(1); setStep(2); }} disabled={!audioComplete}
                className="rounded-lg bg-escola-dourado px-5 py-2.5 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
                Avancar para imagens
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── STEP 3: IMAGES ──────────────────────────────────────────────── */}
      <div className={`rounded-xl border bg-escola-card p-6 mb-4 ${step === 2 ? "border-escola-dourado/50" : "border-escola-border"}`}>
        <button onClick={() => completed[1] && setStep(2)} className="w-full text-left">
          <h2 className="font-serif text-lg font-medium text-escola-creme flex items-center gap-2">
            {completed[2] && <span className="text-green-400 text-sm">&#10003;</span>}
            3. Imagens
          </h2>
        </button>

        {step === 2 && (
          <div className="mt-4 space-y-3">
            <button onClick={generateAllImages} disabled={loading.allImages}
              className="rounded-lg bg-escola-dourado px-5 py-2.5 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
              {loading.allImages ? "A gerar..." : "Gerar todas as imagens"}
            </button>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {scenes.map((scene, i) => (
                <div key={i} className="border border-escola-border rounded-lg overflow-hidden">
                  {scene.imageUrl ? (
                    <img src={scene.imageUrl} alt={scene.type} className="w-full aspect-video object-cover" />
                  ) : (
                    <div className="w-full aspect-video bg-escola-bg flex items-center justify-center">
                      <span className="text-xs text-escola-creme-50">Sem imagem</span>
                    </div>
                  )}
                  <div className="p-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-escola-dourado">{SCENE_LABELS[scene.type] || scene.type}</span>
                      <button onClick={() => generateSceneImage(i)} disabled={loading[`img-${i}`]}
                        className="text-[10px] text-escola-creme-50 hover:text-escola-dourado disabled:opacity-40">
                        {loading[`img-${i}`] ? "..." : scene.imageUrl ? "Re-gerar (Flux)" : "Gerar (Flux)"}
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Colar URL de imagem (DALL-E, etc)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) { setScenes((prev) => { const n = [...prev]; n[i] = { ...n[i], imageUrl: val }; return n; }); (e.target as HTMLInputElement).value = ""; }
                          }
                        }}
                        className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-0.5 text-[10px] text-escola-creme placeholder:text-escola-creme-50/40 focus:border-escola-dourado focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="text-xs text-escola-creme-50 hover:text-escola-creme">Voltar</button>
              <button onClick={() => { markComplete(2); setStep(3); }} disabled={!imagesComplete}
                className="rounded-lg bg-escola-dourado px-5 py-2.5 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
                Avancar para animacoes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── STEP 4: ANIMATIONS ──────────────────────────────────────────── */}
      <div className={`rounded-xl border bg-escola-card p-6 mb-4 ${step === 3 ? "border-escola-dourado/50" : "border-escola-border"}`}>
        <button onClick={() => completed[2] && setStep(3)} className="w-full text-left">
          <h2 className="font-serif text-lg font-medium text-escola-creme flex items-center gap-2">
            {completed[3] && <span className="text-green-400 text-sm">&#10003;</span>}
            4. Animacoes
            {animPolling && <span className="text-xs text-escola-dourado animate-pulse ml-2">a verificar...</span>}
          </h2>
        </button>

        {step === 3 && (
          <div className="mt-4 space-y-3">
            <button onClick={submitAllAnimations} disabled={loading.allAnim}
              className="rounded-lg bg-escola-dourado px-5 py-2.5 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
              {loading.allAnim ? "A submeter..." : "Submeter todas as animacoes"}
            </button>
            <p className="text-xs text-escola-creme-50">Cada animacao demora ~3-5 min no Runway.</p>

            <div className="space-y-2">
              {scenes.map((scene, i) => (
                <div key={i} className="border border-escola-border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        scene.animationStatus === "done" ? "bg-green-500"
                        : scene.animationStatus === "failed" ? "bg-escola-terracota"
                        : scene.animationTaskId ? "bg-escola-dourado animate-pulse"
                        : "bg-escola-border"
                      }`} />
                      <span className="text-xs text-escola-dourado">{SCENE_LABELS[scene.type] || scene.type}</span>
                      <span className="text-[10px] text-escola-creme-50">
                        {scene.animationStatus === "done" ? "Pronto" : scene.animationStatus === "failed" ? "Falhou" : scene.animationTaskId ? "A processar..." : "Pendente"}
                      </span>
                    </div>
                    <button onClick={() => submitSceneAnimation(i)} disabled={!scene.imageUrl || loading[`anim-${i}`]}
                      className="text-[10px] text-escola-creme-50 hover:text-escola-dourado disabled:opacity-40">
                      {loading[`anim-${i}`] ? "..." : scene.animationTaskId ? "Re-submeter" : "Submeter"}
                    </button>
                  </div>
                  {scene.animationUrl && (
                    <div className="mt-2">
                      <video controls src={scene.animationUrl} className="w-full max-w-sm rounded" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="text-xs text-escola-creme-50 hover:text-escola-creme">Voltar</button>
              <button onClick={() => { markComplete(3); setStep(4); }}
                disabled={!animsComplete && scenes.some((s) => s.animationTaskId)}
                className="rounded-lg bg-escola-dourado px-5 py-2.5 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
                Avancar para legendas
              </button>
              <button onClick={() => { markComplete(3); setStep(4); }}
                className="text-xs text-escola-creme-50 hover:text-escola-creme">
                Saltar (sem animacoes)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── STEP 5: SUBTITLES ───────────────────────────────────────────── */}
      <div className={`rounded-xl border bg-escola-card p-6 mb-4 ${step === 4 ? "border-escola-dourado/50" : "border-escola-border"}`}>
        <button onClick={() => completed[2] && setStep(4)} className="w-full text-left">
          <h2 className="font-serif text-lg font-medium text-escola-creme flex items-center gap-2">
            {completed[4] && <span className="text-green-400 text-sm">&#10003;</span>}
            5. Legendas
          </h2>
        </button>

        {step === 4 && (
          <div className="mt-4 space-y-3">
            <button onClick={generateSubtitles} disabled={loading.subs}
              className="rounded-lg bg-escola-dourado px-5 py-2.5 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
              {loading.subs ? "A gerar..." : "Gerar legendas"}
            </button>

            {srt && (
              <>
                <div className="border border-escola-border rounded-lg p-3 max-h-60 overflow-y-auto">
                  <textarea value={srt} onChange={(e) => setSrt(e.target.value)}
                    rows={12}
                    className="w-full bg-transparent text-xs text-escola-creme font-mono focus:outline-none resize-y" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => downloadFile(srt, `hook-${selectedHook + 1}.srt`)}
                    className="text-xs text-escola-dourado hover:underline">Descarregar SRT</button>
                  <button onClick={() => downloadFile(vtt, `hook-${selectedHook + 1}.vtt`)}
                    className="text-xs text-escola-dourado hover:underline">Descarregar VTT</button>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(3)} className="text-xs text-escola-creme-50 hover:text-escola-creme">Voltar</button>
              <button onClick={() => { markComplete(4); setStep(5); }}
                className="rounded-lg bg-escola-dourado px-5 py-2.5 text-sm font-medium text-escola-bg hover:opacity-90">
                {subsComplete ? "Avancar" : "Saltar legendas"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── STEP 6: RESULT ──────────────────────────────────────────────── */}
      <div className={`rounded-xl border bg-escola-card p-6 mb-4 ${step === 5 ? "border-escola-dourado/50" : "border-escola-border"}`}>
        <button onClick={() => completed[3] && setStep(5)} className="w-full text-left">
          <h2 className="font-serif text-lg font-medium text-escola-creme flex items-center gap-2">
            {completed[5] && <span className="text-green-400 text-sm">&#10003;</span>}
            6. Resultado Final
          </h2>
        </button>

        {step === 5 && (
          <div className="mt-4 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="border border-escola-border rounded-lg p-3 text-center">
                <p className="text-escola-dourado text-lg font-medium">{scenes.length}</p>
                <p className="text-xs text-escola-creme-50">Cenas</p>
              </div>
              <div className="border border-escola-border rounded-lg p-3 text-center">
                <p className="text-escola-dourado text-lg font-medium">{scenes.filter((s) => s.audioUrl).length}</p>
                <p className="text-xs text-escola-creme-50">Audio</p>
              </div>
              <div className="border border-escola-border rounded-lg p-3 text-center">
                <p className="text-escola-dourado text-lg font-medium">{scenes.filter((s) => s.imageUrl).length}</p>
                <p className="text-xs text-escola-creme-50">Imagens</p>
              </div>
              <div className="border border-escola-border rounded-lg p-3 text-center">
                <p className="text-escola-dourado text-lg font-medium">{scenes.filter((s) => s.animationUrl).length}</p>
                <p className="text-xs text-escola-creme-50">Clips</p>
              </div>
            </div>

            {/* Background music */}
            <div className="border border-escola-border rounded-lg p-4 space-y-3">
              <p className="text-xs text-escola-creme-50 font-medium">Musica de fundo:</p>

              {/* Instrumental (under narration) */}
              <div className="space-y-1.5">
                <p className="text-[11px] text-escola-dourado font-medium">Instrumental (por baixo da narracao):</p>
                <div className="flex items-center gap-2">
                  <button onClick={generateMusic} disabled={loading.music}
                    className="rounded-lg border border-escola-dourado/40 px-3 py-1.5 text-xs text-escola-dourado hover:bg-escola-dourado/10 disabled:opacity-40">
                    {loading.music ? "A gerar..." : "Gerar instrumental (Suno)"}
                  </button>
                </div>
              </div>

              {/* Loranne track (scenes without narration: abertura, fecho, transitions) */}
              <div className="space-y-1.5">
                <p className="text-[11px] text-escola-dourado font-medium">Loranne — cenas sem narracao (abertura, fecho):</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="URL da faixa da Loranne (music.seteveus.space)"
                    value={customMusicUrl}
                    onChange={(e) => setCustomMusicUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-escola-border bg-escola-bg px-3 py-1.5 text-xs text-escola-creme placeholder:text-escola-creme-50/50 focus:border-escola-dourado focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (customMusicUrl.trim()) {
                        setBgMusicUrl(customMusicUrl.trim());
                      }
                    }}
                    disabled={!customMusicUrl.trim()}
                    className="whitespace-nowrap rounded-lg border border-escola-dourado/40 px-3 py-1.5 text-xs text-escola-dourado hover:bg-escola-dourado/10 disabled:opacity-40"
                  >
                    Usar esta faixa
                  </button>
                </div>
                <p className="text-[10px] text-escola-creme-50 italic">A musica da Loranne tem vocais — usar apenas em cenas sem narracao para nao haver duas vozes.</p>
              </div>

              {bgMusicUrl && <audio controls src={bgMusicUrl} className="w-full max-w-md h-8" />}
              {!bgMusicUrl && <p className="text-[10px] text-escola-creme-50 italic">Sem musica. Gera instrumental para fundo ou usa uma faixa da Loranne para cenas silenciosas.</p>}
            </div>

            {/* Render final video */}
            <div className="border border-escola-dourado/30 rounded-xl p-4 bg-escola-dourado/5 space-y-3">
              <h3 className="font-serif text-base font-medium text-escola-dourado">Renderizar MP4</h3>
              <p className="text-xs text-escola-creme-50">
                Gera o video final com todas as camadas: imagens, animacoes, narracao, musica de fundo, legendas e watermark.
              </p>

              <div className="flex items-center gap-3">
                <button onClick={renderVideo} disabled={loading.render}
                  className="rounded-lg bg-escola-dourado px-6 py-2.5 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-40">
                  {loading.render ? "A renderizar..." : "Renderizar video final"}
                </button>
                <button onClick={() => { saveManifest(); }} disabled={loading.manifest}
                  className="rounded-lg border border-escola-border px-4 py-2.5 text-sm text-escola-creme-50 hover:text-escola-creme disabled:opacity-40">
                  {loading.manifest ? "..." : "Guardar manifesto"}
                </button>
                {manifestUrl && (
                  <a href={manifestUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-escola-dourado underline">
                    JSON
                  </a>
                )}
              </div>

              {renderProgress !== null && (
                <div>
                  <div className="h-2 overflow-hidden rounded-full bg-escola-border">
                    <div className="h-full rounded-full bg-escola-dourado transition-all duration-300"
                      style={{ width: `${renderProgress}%` }} />
                  </div>
                  <p className="text-xs text-escola-creme-50 mt-1">{renderLabel}</p>
                </div>
              )}

              {videoUrl && (
                <div className="space-y-2">
                  <video controls src={videoUrl} className="w-full max-w-lg rounded-lg border border-escola-border" />
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-block text-sm text-escola-dourado underline">
                    Descarregar MP4
                  </a>
                </div>
              )}
            </div>

            {/* YouTube metadata */}
            {manifestUrl && (
              <div className="border-t border-escola-border pt-4 space-y-3">
                <h3 className="font-serif text-lg font-medium text-escola-creme">YouTube</h3>
                <div>
                  <label className="text-xs text-escola-creme-50 block mb-1">Titulo</label>
                  <input type="text" value={ytTitle} onChange={(e) => setYtTitle(e.target.value)}
                    className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-escola-creme-50 block mb-1">Descricao</label>
                  <textarea value={ytDescription} onChange={(e) => setYtDescription(e.target.value)} rows={4}
                    className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none resize-y" />
                </div>
                <div>
                  <label className="text-xs text-escola-creme-50 block mb-1">Tags</label>
                  <input type="text" value={ytTags} onChange={(e) => setYtTags(e.target.value)}
                    className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none" />
                </div>
                <button onClick={() => navigator.clipboard.writeText(`TITULO: ${ytTitle}\n\nDESCRICAO:\n${ytDescription}\n\nTAGS: ${ytTags}`)}
                  className="rounded-lg bg-escola-dourado/20 border border-escola-dourado/30 px-4 py-2 text-sm text-escola-dourado hover:bg-escola-dourado/30">
                  Copiar metadados
                </button>
              </div>
            )}

            <button onClick={() => setStep(4)} className="text-xs text-escola-creme-50 hover:text-escola-creme">Voltar</button>
          </div>
        )}
      </div>
    </>
  );
}
