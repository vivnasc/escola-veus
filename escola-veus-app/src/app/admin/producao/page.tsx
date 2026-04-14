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
  animationError?: string;
  animationSubmittedAt?: number;
  audioStartSec?: number;
  audioEndSec?: number;
  // Per-scene render settings (editable in Step 6)
  transitionIn?: string;   // "fade" | "none"
  transitionOut?: string;  // "fade" | "none"
  textDelaySec?: number;   // delay before text appears (default 1s)
  narrationVolume?: number; // 0-100 (default 100)
};

type AnimationTask = { type: string; taskId: string; status?: string; videoUrl?: string | null; failureReason?: string | null };

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

const DEFAULT_VOICE_ID = "JGnWZj684pcXmK2SxYIv";


const SCENE_LABELS: Record<string, string> = {
  abertura: "Abertura", pergunta: "Pergunta", situacao: "Situacao",
  revelacao: "Revelacao", gesto: "Gesto", frase_final: "Frase Final",
  cta: "CTA", fecho: "Fecho",
  // v2
  trailer: "Trailer", gancho: "Gancho", reconhecimento: "Reconhecimento",
  framework: "Framework", exemplo: "Exemplo", exercicio: "Exercicio",
  reframe: "Reframe",
};

const STYLE = "cinematic digital painting, elegant faceless feminine silhouette with visible body language and natural human posture, figure has a real body with hands arms shoulders hips, draped in flowing translucent fabric layers, warm skin-like terracotta tones (#C4745A) visible through semi-transparent veils in dark navy-purple (#1A1A2E to #2D2045), warm golden light (#D4A853) glowing softly from within, the figure faces the viewer as if in intimate conversation, expressive body posture and hand gestures, no face no eyes no mouth but strong human presence, no race, smooth organic flowing shapes, dark navy background (#0D0D1A), 16:9 widescreen cinematic composition, large central figure, emotional and intimate mood, no photorealism, no cartoon, no text, no words, no letters";

const MOTION: Record<string, string> = {
  // v1
  abertura: "slow cinematic camera drift downward, figure standing still facing the viewer, gentle breathing, fabric flowing softly in wind",
  pergunta: "figure tilting head slightly as if asking a question, hands moving gently, natural breathing rhythm",
  situacao: "slow camera tracking, figure turning body slightly toward viewer, one hand rising to gesture",
  revelacao: "figure slowly lifting hands outward, fabric layers falling away from shoulders, golden light revealing skin underneath",
  gesto: "figure slowly placing hand on own chest, intimate gesture, natural body weight shift",
  frase_final: "very slow zoom in on figure, calm confident posture, hands resting at sides, steady breathing",
  cta: "figure taking one step forward toward viewer, arms opening gently in welcome, warm golden light expanding",
  fecho: "figure standing still, silhouette glowing golden, slow fade to dark navy",
  // v2
  trailer: "slow cinematic, figure emerging from darkness toward the viewer, body becoming visible, confident presence",
  gancho: "figure breathing naturally, one hand moving to emphasize a point, intimate direct presence facing camera",
  reconhecimento: "figure nodding slowly as if understanding, hand touching chin contemplatively, natural body language",
  framework: "figure using both hands to gesture while speaking, open expressive body language, fabric flowing with movement",
  exemplo: "figure extending one hand toward viewer as if offering something, warm inviting gesture, natural movement",
  exercicio: "figure placing both hands on chest, eyes down, intimate self-connection gesture, slow breathing",
  reframe: "figure standing tall with confident posture, chin slightly lifted, golden light growing from within",
};

const COURSE_BACKGROUND_MUSIC: Record<string, string> = {
  "ouro-proprio": "https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/curso-ouro-proprio/faixa-01.mp3",
};

const LORA_TRIGGER = "veus_figure";
const ANIMATION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

function buildMotionPrompt(scene: SceneData): string {
  const fallback = MOTION[scene.type] || "slow cinematic movement, figure breathing naturally, subtle body movement";
  if (!scene.visualNote || scene.visualNote.length < 20) return fallback;
  const cleaned = scene.visualNote.replace(/#[0-9A-Fa-f]{6}/g, "").replace(/\(.*?\)/g, "").trim();
  return `slow cinematic, ${cleaned}, natural human breathing and subtle gestures, fabric flowing gently, no sudden movements`;
}

function buildPrompt(visualNote: string): string {
  const trigger = `${LORA_TRIGGER}, `;
  if (visualNote && visualNote.length > 20) {
    const cleaned = visualNote.replace(/#[0-9A-Fa-f]{6}/g, "").replace(/\(.*?\)/g, "").trim();
    return `${trigger}${cleaned}, facing the viewer, ${STYLE}`;
  }
  return `${trigger}figure facing viewer in intimate conversation, ${STYLE}`;
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
  // showVoiceField removed — voice ID is always visible
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
  const scenesRef = useRef<SceneData[]>([]);

  // Subtitles
  const [srt, setSrt] = useState("");
  const [vtt, setVtt] = useState("");

  // Render
  const [renderProgress, setRenderProgress] = useState<number | null>(null);
  const [renderLabel, setRenderLabel] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Background music — 3 faixas: startSec + volume (duração = automática da cena)
  const [bgMusicUrl, setBgMusicUrl] = useState("");
  const [bgMusicStart, setBgMusicStart] = useState(0);
  const [bgMusicVol, setBgMusicVol] = useState(12);
  const [openingMusicUrl, setOpeningMusicUrl] = useState("");
  const [openingMusicStart, setOpeningMusicStart] = useState(0);
  const [openingMusicVol, setOpeningMusicVol] = useState(80);
  const [closingMusicUrl, setClosingMusicUrl] = useState("");
  const [closingMusicStart, setClosingMusicStart] = useState(0);
  const [closingMusicVol, setClosingMusicVol] = useState(80);

  // Manifest
  const [manifestUrl, setManifestUrl] = useState("");

  // YouTube metadata
  const [ytTitle, setYtTitle] = useState("");
  const [ytDescription, setYtDescription] = useState("");
  const [ytTags, setYtTags] = useState("");

  // ─── AUTO-SAVE progress to localStorage + Supabase ──────────────────
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (scenes.length === 0) return;
    const payload = {
      scenes, step, completed, srt, vtt, videoUrl, totalAudioDuration, scriptApproved,
      bgMusicUrl, bgMusicStart, bgMusicVol,
      openingMusicUrl, openingMusicStart, openingMusicVol,
      closingMusicUrl, closingMusicStart, closingMusicVol,
    };
    // Save to localStorage immediately
    try { localStorage.setItem(storageKey, JSON.stringify(payload)); } catch { /* quota */ }

    // Debounced save to Supabase (every 10s max)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch("/api/admin/courses/save-manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: selectedCourse, hookIndex: selectedHook, data: payload }),
      }).catch(() => {});
    }, 10000);
  }, [scenes, step, completed, srt, vtt, videoUrl, totalAudioDuration, scriptApproved, storageKey, selectedCourse, selectedHook, bgMusicUrl, bgMusicStart, bgMusicVol, openingMusicUrl, openingMusicStart, openingMusicVol, closingMusicUrl, closingMusicStart, closingMusicVol]);

  // Keep scenesRef in sync so polling always reads latest state
  useEffect(() => { scenesRef.current = scenes; }, [scenes]);

  // ─── RESTORE progress: localStorage first, then Supabase ──────────────
  function applyProgressData(data: Record<string, unknown>) {
    setScenes(data.scenes as SceneData[]);
    setStep((data.step as number) ?? 0);
    setCompleted((data.completed as boolean[]) ?? Array(6).fill(false));
    setVoiceId(DEFAULT_VOICE_ID);
    setSrt((data.srt as string) ?? "");
    setVtt((data.vtt as string) ?? "");
    setBgMusicUrl((data.bgMusicUrl as string) ?? "");
    setBgMusicStart((data.bgMusicStart as number) ?? 0);
    setBgMusicVol((data.bgMusicVol as number) ?? 12);
    setOpeningMusicUrl((data.openingMusicUrl as string) ?? "");
    setOpeningMusicStart((data.openingMusicStart as number) ?? 0);
    setOpeningMusicVol((data.openingMusicVol as number) ?? 80);
    setClosingMusicUrl((data.closingMusicUrl as string) ?? "");
    setClosingMusicStart((data.closingMusicStart as number) ?? 0);
    setClosingMusicVol((data.closingMusicVol as number) ?? 80);
    setVideoUrl((data.videoUrl as string) ?? "");
    setTotalAudioDuration((data.totalAudioDuration as number) ?? 0);
    setScriptApproved((data.scriptApproved as boolean) ?? false);
  }

  useEffect(() => {
    // 1. Try localStorage
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.scenes?.length > 0) {
          applyProgressData(data);
          return;
        }
      }
    } catch { /* parse error */ }

    // 2. Try Supabase (cross-device)
    fetch(`/api/admin/courses/save-manifest?courseSlug=${selectedCourse}&hookIndex=${selectedHook}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data?.scenes?.length > 0) {
          applyProgressData(res.data);
          // Also save to localStorage for faster next load
          try { localStorage.setItem(storageKey, JSON.stringify(res.data)); } catch { /* */ }
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          voiceId: voiceId.trim() || DEFAULT_VOICE_ID,
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
    let totalDur = 0;
    setScenes((prev) => {
      const updated = [...prev];
      let t = 0;
      for (const s of updated) {
        s.audioStartSec = t;
        const dur = s.audioDurationSec || s.durationSec;
        s.audioEndSec = t + dur;
        if (s.audioDurationSec) s.durationSec = Math.min(s.audioDurationSec + 2, 10);
        t += s.durationSec;
      }
      totalDur = t;
      return updated;
    });
    setTotalAudioDuration(totalDur);
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
    if (!scene.imageUrl) {
      setError(`Cena ${index} nao tem imagem. Gera a imagem primeiro.`);
      return;
    }
    setLoading((p) => ({ ...p, [`anim-${index}`]: true }));
    setError(null);
    try {
      const motion = buildMotionPrompt(scene);
      const res = await fetch("/api/admin/courses/submit-animation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: scene.imageUrl, motionPrompt: motion, provider: "runway", courseSlug: selectedCourse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || `Erro ${res.status}`);
      setScenes((prev) => {
        const n = [...prev];
        n[index] = { ...n[index], animationTaskId: data.taskId, animationStatus: "processing", animationError: undefined, animationSubmittedAt: Date.now() };
        return n;
      });
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro ao submeter animacao"); }
    finally { setLoading((p) => ({ ...p, [`anim-${index}`]: false })); }
  }, [scenes, selectedCourse]);

  const submitAllAnimations = useCallback(async () => {
    setLoading((p) => ({ ...p, allAnim: true }));
    // Only submit scenes that have images AND don't already have a successful animation
    const needsAnimation = scenes.map((s, i) => ({ s, i })).filter(({ s }) => s.imageUrl && s.animationStatus !== "done");
    if (needsAnimation.length === 0) {
      setError("Todas as cenas ja tem animacao. Usa 'Re-submeter' individualmente se quiseres.");
      setLoading((p) => ({ ...p, allAnim: false }));
      return;
    }
    await Promise.all(needsAnimation.map(({ i }) => submitSceneAnimation(i)));
    setLoading((p) => ({ ...p, allAnim: false }));
    startPolling();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes, submitSceneAnimation]);

  const startPolling = useCallback(() => {
    setAnimPolling(true);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(async () => {
      const current = scenesRef.current;
      const now = Date.now();

      // Check for timeouts FIRST — mark timed-out scenes before polling
      let hadTimeout = false;
      const timedOutIds = new Set<string>();
      for (const s of current) {
        if (s.animationTaskId && s.animationStatus === "processing" && s.animationSubmittedAt) {
          if (now - s.animationSubmittedAt > ANIMATION_TIMEOUT_MS) {
            timedOutIds.add(s.animationTaskId);
            hadTimeout = true;
          }
        }
      }
      if (hadTimeout) {
        setScenes((prev) => {
          const n = [...prev];
          for (let i = 0; i < n.length; i++) {
            if (n[i].animationTaskId && timedOutIds.has(n[i].animationTaskId!)) {
              n[i] = { ...n[i], animationStatus: "timeout", animationError: "Timeout: Runway nao respondeu em 5 minutos. Creditos podem ter sido consumidos." };
            }
          }
          return n;
        });
        setError("Uma ou mais animacoes excederam o tempo limite de 5 minutos.");
      }

      // Now poll only scenes still processing (not timed out)
      const tasks = current.filter((s) => s.animationTaskId && s.animationStatus === "processing" && !timedOutIds.has(s.animationTaskId!))
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
              n[idx] = {
                ...n[idx],
                animationStatus: t.status,
                animationUrl: t.videoUrl || undefined,
                animationError: t.failureReason || (t.status === "failed" ? "Runway falhou sem razao especifica" : undefined),
              };
            }
          }
          return n;
        });
        if (data.allDone) {
          if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          setAnimPolling(false);
        }
      } catch { /* retry next cycle */ }
    }, 15000);
  }, [selectedCourse]);

  // Auto-resume polling on page load if there are animations in processing state
  const hasProcessing = scenes.some((s) => s.animationTaskId && s.animationStatus === "processing");
  useEffect(() => {
    if (hasProcessing && !pollTimerRef.current) {
      startPolling();
    }
    return () => { if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; } };
  }, [hasProcessing, startPolling]);

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
          transitionIn: s.transitionIn || "fade", transitionOut: s.transitionOut || "fade",
          textDelaySec: s.textDelaySec ?? null, narrationVolume: s.narrationVolume ?? 100,
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
      // 1. Submit — returns taskId immediately
      const res = await fetch("/api/admin/courses/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: selectedCourse }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const debugInfo = d.debug ? ` | ${JSON.stringify(d.debug).slice(0, 500)}` : "";
        throw new Error((d.erro || `Erro ${res.status}`) + debugInfo);
      }
      const { taskId } = await res.json();
      if (!taskId) throw new Error("Sem taskId");

      setError("A gerar musica... (pode demorar 30-90s)");

      // 2. Poll for result
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        try {
          const statusRes = await fetch("/api/admin/courses/music-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId, courseSlug: selectedCourse }),
          });
          if (!statusRes.ok) continue;
          const status = await statusRes.json();

          if (status.status === "done" && status.audioUrl) {
            setBgMusicUrl(status.audioUrl);
            setError(null);
            return;
          }
          if (status.status === "failed") {
            throw new Error("Suno falhou a gerar musica.");
          }
        } catch (e) {
          if (e instanceof Error && e.message.includes("falhou")) throw e;
        }
      }
      throw new Error("Timeout: musica nao ficou pronta em 2.5 minutos.");
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
        backgroundMusic: {
          url: bgMusicUrl || COURSE_BACKGROUND_MUSIC[selectedCourse] || "",
          volume: bgMusicVol / 100,
          startSec: bgMusicStart,
        },
        openingMusic: {
          url: openingMusicUrl || "",
          volume: openingMusicVol / 100,
          startSec: openingMusicStart,
          durationSec: scenes.find((s) => s.type === "abertura")?.durationSec || 5,
        },
        closingMusic: {
          url: closingMusicUrl || openingMusicUrl || "",
          volume: closingMusicUrl ? closingMusicVol / 100 : openingMusicVol / 100,
          startSec: closingMusicUrl ? closingMusicStart : openingMusicStart,
          durationSec: scenes.find((s) => s.type === "fecho")?.durationSec || 8,
        },
        scenes: scenes.map((s) => ({
          type: s.type, narration: s.narration, overlayText: s.overlayText,
          durationSec: s.durationSec, imageUrl: s.imageUrl || null,
          animationUrl: s.animationUrl || null, audioUrl: s.audioUrl || null,
          audioStartSec: s.audioStartSec ?? null, audioEndSec: s.audioEndSec ?? null,
          transitionIn: s.transitionIn || "fade",
          transitionOut: s.transitionOut || "fade",
          textDelaySec: s.textDelaySec ?? (s.type === "abertura" ? 1.5 : 1),
          narrationVolume: s.narrationVolume ?? 100,
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
  }, [scenes, selectedCourse, selectedHook, bgMusicUrl, openingMusicUrl, closingMusicUrl, markComplete]);

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
  const terminalStatuses = new Set(["done", "failed", "timeout", "error", "polling_error"]);
  const animsComplete = scenes.filter((s) => s.animationTaskId).length > 0 &&
    scenes.filter((s) => s.animationTaskId).every((s) => terminalStatuses.has(s.animationStatus || ""));
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

            {/* Voice ID — escondido, já tem default correcto */}

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
                    <textarea value={scene.visualNote} onChange={(e) => {
                      setScenes((prev) => { const n = [...prev]; n[i] = { ...n[i], visualNote: e.target.value }; return n; });
                    }} rows={2} placeholder="Descreve o visual desta cena..."
                      className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[10px] text-escola-creme font-mono resize-y focus:border-escola-dourado focus:outline-none" />
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
            <p className="text-xs text-escola-creme-50">Cada animacao demora ~3-5 min no Runway. Timeout automatico aos 5 min.</p>

            {error && (
              <div className="rounded-lg border border-escola-terracota/30 bg-escola-terracota/10 p-3">
                <p className="text-xs text-escola-terracota">{error}</p>
              </div>
            )}

            {/* ── Status summary bar ── */}
            {scenes.length > 0 && (() => {
              const done = scenes.filter((s) => s.animationStatus === "done").length;
              const failed = scenes.filter((s) => s.animationStatus === "failed" || s.animationStatus === "timeout" || s.animationStatus === "error" || s.animationStatus === "polling_error").length;
              const processing = scenes.filter((s) => s.animationStatus === "processing").length;
              const pending = scenes.length - done - failed - processing;
              return (
                <div className="flex items-center gap-4 rounded-lg border border-escola-border bg-escola-bg/50 px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-xs text-escola-creme">{done} pronto{done !== 1 ? "s" : ""}</span>
                  </div>
                  {failed > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-escola-terracota" />
                      <span className="text-xs text-escola-terracota font-medium">{failed} falhou</span>
                    </div>
                  )}
                  {processing > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-escola-dourado animate-pulse" />
                      <span className="text-xs text-escola-creme">{processing} a processar</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-escola-border" />
                    <span className="text-xs text-escola-creme-50">{pending} pendente{pending !== 1 ? "s" : ""}</span>
                  </div>
                  <span className="text-[10px] text-escola-creme-50 ml-auto">
                    Imagens: {scenes.filter((s) => s.imageUrl).length}/{scenes.length}
                  </span>
                </div>
              );
            })()}

            <div className="space-y-2">
              {scenes.map((scene, i) => {
                const isFailed = scene.animationStatus === "failed" || scene.animationStatus === "timeout" || scene.animationStatus === "error" || scene.animationStatus === "polling_error";
                return (
                <div key={i} className={`border rounded-lg p-3 ${isFailed ? "border-escola-terracota/40 bg-escola-terracota/5" : "border-escola-border"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-escola-creme-50 font-mono w-4">{i + 1}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        scene.animationStatus === "done" ? "bg-green-500"
                        : isFailed ? "bg-escola-terracota"
                        : scene.animationTaskId ? "bg-escola-dourado animate-pulse"
                        : "bg-escola-border"
                      }`} />
                      <span className="text-xs text-escola-dourado">{SCENE_LABELS[scene.type] || scene.type}</span>
                      <span className={`text-[10px] ${isFailed ? "text-escola-terracota font-medium" : "text-escola-creme-50"}`}>
                        {scene.animationStatus === "done" ? "Pronto"
                          : scene.animationStatus === "timeout" ? "Timeout (5 min)"
                          : isFailed ? "Falhou"
                          : scene.animationTaskId ? "A processar..."
                          : "Pendente"}
                      </span>
                      {scene.animationStatus === "processing" && scene.animationSubmittedAt && (
                        <span className="text-[9px] text-escola-creme-50">
                          ({Math.floor((Date.now() - scene.animationSubmittedAt) / 1000)}s)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <select onChange={(e) => {
                        const target = Number(e.target.value);
                        if (isNaN(target) || target === i) return;
                        setScenes((prev) => {
                          const n = [...prev];
                          const pick = (s: SceneData) => ({ imageUrl: s.imageUrl, animationUrl: s.animationUrl, animationTaskId: s.animationTaskId, animationStatus: s.animationStatus, animationError: s.animationError, animationSubmittedAt: s.animationSubmittedAt });
                          const a = pick(n[i]), b = pick(n[target]);
                          n[i] = { ...n[i], ...b }; n[target] = { ...n[target], ...a };
                          return n;
                        });
                        e.target.value = "";
                      }} value="" className="rounded border border-escola-border bg-escola-bg px-1 py-0.5 text-[10px] text-escola-creme-50 focus:border-escola-dourado focus:outline-none">
                        <option value="">Trocar com...</option>
                        {scenes.map((s, j) => j !== i ? (
                          <option key={j} value={j}>{j + 1}. {SCENE_LABELS[s.type] || s.type}</option>
                        ) : null)}
                      </select>
                      <button onClick={() => generateSceneImage(i)} disabled={loading[`img-${i}`]}
                        className="text-[10px] text-escola-creme-50 hover:text-escola-dourado disabled:opacity-40">
                        {loading[`img-${i}`] ? "img..." : "Nova imagem"}
                      </button>
                      {isFailed && (
                        <button onClick={() => {
                          setScenes((prev) => {
                            const n = [...prev];
                            n[i] = { ...n[i], animationTaskId: undefined, animationStatus: undefined, animationUrl: undefined, animationError: undefined, animationSubmittedAt: undefined };
                            return n;
                          });
                        }}
                          className="text-[10px] text-escola-terracota hover:text-escola-creme font-medium border border-escola-terracota/30 rounded px-1.5 py-0.5">
                          Limpar
                        </button>
                      )}
                      <button onClick={() => { submitSceneAnimation(i); startPolling(); }} disabled={!scene.imageUrl || loading[`anim-${i}`]}
                        className="text-[10px] text-escola-creme-50 hover:text-escola-dourado disabled:opacity-40">
                        {loading[`anim-${i}`] ? "..." : scene.animationTaskId ? "Re-submeter" : "Submeter"}
                      </button>
                    </div>
                  </div>
                  {/* Failure reason — prominent display */}
                  {isFailed && scene.animationError && (
                    <div className="mt-1.5 rounded border border-escola-terracota/20 bg-escola-terracota/10 px-2.5 py-1.5">
                      <p className="text-[10px] text-escola-terracota leading-relaxed">
                        {scene.animationError}
                      </p>
                    </div>
                  )}
                  {scene.narration && (
                    <p className="mt-1 text-[10px] text-escola-creme-50 italic line-clamp-2">
                      {scene.narration.replace(/\[.*?\]/g, "").slice(0, 120)}{scene.narration.length > 120 ? "..." : ""}
                    </p>
                  )}
                  <div className="mt-2 space-y-1.5">
                    <details className="group">
                      <summary className="text-[9px] text-escola-creme-50 uppercase cursor-pointer hover:text-escola-dourado">Visual (prompt) ▸</summary>
                      <textarea value={scene.visualNote} onChange={(e) => {
                        setScenes((prev) => { const n = [...prev]; n[i] = { ...n[i], visualNote: e.target.value }; return n; });
                      }} rows={2} className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-[10px] text-escola-creme font-mono resize-y focus:border-escola-dourado focus:outline-none" />
                    </details>
                    {scene.animationUrl ? (
                      <video controls src={scene.animationUrl} className="w-full max-w-sm rounded" />
                    ) : scene.imageUrl ? (
                      <img src={scene.imageUrl} alt={scene.type} className="w-32 aspect-video object-cover rounded opacity-60" />
                    ) : null}
                  </div>
                </div>
                );
              })}
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

            {/* ── Per-scene timeline editor ── */}
            <div className="border border-escola-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-escola-creme-50 font-medium">Timeline — ajusta cada cena antes de renderizar</p>
                <span className="text-[10px] text-escola-creme-50">
                  Total: {scenes.reduce((sum, s) => sum + (s.durationSec || 0), 0)}s
                </span>
              </div>

              {scenes.map((scene, i) => {
                const cumStart = scenes.slice(0, i).reduce((sum, s) => sum + (s.durationSec || 0), 0);
                return (
                <div key={i} className="border border-escola-border rounded-lg p-3 space-y-2">
                  {/* Header row */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-escola-creme-50 font-mono w-4">{i + 1}</span>
                    <span className="text-xs text-escola-dourado font-medium">{SCENE_LABELS[scene.type] || scene.type}</span>
                    <span className="text-[9px] text-escola-creme-50">({cumStart}s–{cumStart + scene.durationSec}s)</span>
                    {scene.animationUrl && <span className="text-[9px] text-green-400">clip</span>}
                    {!scene.animationUrl && scene.imageUrl && <span className="text-[9px] text-escola-creme-50">imagem+zoom</span>}
                    {scene.audioUrl && <span className="text-[9px] text-escola-creme-50">audio</span>}
                  </div>

                  {/* Controls row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Duration */}
                    <div className="flex items-center gap-1">
                      <label className="text-[9px] text-escola-creme-50">Dur:</label>
                      <input type="number" min={1} max={30} step={0.5} value={scene.durationSec}
                        onChange={(e) => { setScenes((prev) => { const n = [...prev]; n[i] = { ...n[i], durationSec: Number(e.target.value) || 1 }; return n; }); }}
                        className="w-14 rounded border border-escola-border bg-escola-bg px-1 py-0.5 text-[10px] text-escola-creme text-center focus:border-escola-dourado focus:outline-none" />
                      <span className="text-[9px] text-escola-creme-50">s</span>
                    </div>

                    {/* Transition In */}
                    <div className="flex items-center gap-1">
                      <label className="text-[9px] text-escola-creme-50">Entrada:</label>
                      <select value={scene.transitionIn || "fade"}
                        onChange={(e) => { setScenes((prev) => { const n = [...prev]; n[i] = { ...n[i], transitionIn: e.target.value }; return n; }); }}
                        className="rounded border border-escola-border bg-escola-bg px-1 py-0.5 text-[10px] text-escola-creme focus:border-escola-dourado focus:outline-none">
                        <option value="fade">Fade</option>
                        <option value="none">Nenhuma</option>
                      </select>
                    </div>

                    {/* Transition Out */}
                    <div className="flex items-center gap-1">
                      <label className="text-[9px] text-escola-creme-50">Saida:</label>
                      <select value={scene.transitionOut || "fade"}
                        onChange={(e) => { setScenes((prev) => { const n = [...prev]; n[i] = { ...n[i], transitionOut: e.target.value }; return n; }); }}
                        className="rounded border border-escola-border bg-escola-bg px-1 py-0.5 text-[10px] text-escola-creme focus:border-escola-dourado focus:outline-none">
                        <option value="fade">Fade</option>
                        <option value="none">Nenhuma</option>
                      </select>
                    </div>

                    {/* Text delay */}
                    <div className="flex items-center gap-1">
                      <label className="text-[9px] text-escola-creme-50">Texto em:</label>
                      <input type="number" min={0} max={5} step={0.5} value={scene.textDelaySec ?? (scene.type === "abertura" ? 1.5 : 1)}
                        onChange={(e) => { setScenes((prev) => { const n = [...prev]; n[i] = { ...n[i], textDelaySec: Number(e.target.value) }; return n; }); }}
                        className="w-12 rounded border border-escola-border bg-escola-bg px-1 py-0.5 text-[10px] text-escola-creme text-center focus:border-escola-dourado focus:outline-none" />
                      <span className="text-[9px] text-escola-creme-50">s</span>
                    </div>

                    {/* Narration volume */}
                    <div className="flex items-center gap-1">
                      <label className="text-[9px] text-escola-creme-50">Vol voz:</label>
                      <input type="range" min={0} max={100} value={scene.narrationVolume ?? 100}
                        onChange={(e) => { setScenes((prev) => { const n = [...prev]; n[i] = { ...n[i], narrationVolume: Number(e.target.value) }; return n; }); }}
                        className="w-16 h-1 accent-escola-dourado" />
                      <span className="text-[9px] text-escola-creme-50 w-6">{scene.narrationVolume ?? 100}%</span>
                    </div>
                  </div>

                  {/* Overlay text — editable */}
                  {scene.overlayText && (
                    <div>
                      <label className="text-[9px] text-escola-creme-50">Texto na tela:</label>
                      <input type="text" value={scene.overlayText}
                        onChange={(e) => { setScenes((prev) => { const n = [...prev]; n[i] = { ...n[i], overlayText: e.target.value }; return n; }); }}
                        className="w-full mt-0.5 rounded border border-escola-border bg-escola-bg px-2 py-1 text-[10px] text-escola-creme focus:border-escola-dourado focus:outline-none" />
                    </div>
                  )}

                  {/* Preview row: thumbnail + audio */}
                  <div className="flex items-center gap-3">
                    {scene.animationUrl ? (
                      <video src={scene.animationUrl} className="w-24 aspect-video object-cover rounded" muted />
                    ) : scene.imageUrl ? (
                      <img src={scene.imageUrl} alt="" className="w-24 aspect-video object-cover rounded opacity-70" />
                    ) : null}
                    {scene.audioUrl && (
                      <audio controls src={scene.audioUrl} className="h-7 flex-1 max-w-xs" />
                    )}
                  </div>
                </div>
                );
              })}
            </div>

            {/* Music — 3 tracks */}
            <div className="border border-escola-border rounded-lg p-4 space-y-4">
              <p className="text-xs text-escola-creme-50 font-medium">Musica (3 faixas):</p>

              {/* 1. Opening music */}
              <div className="space-y-1.5">
                <p className="text-[11px] text-escola-dourado font-medium">1. Abertura (cena sem narracao)</p>
                <input type="text" placeholder="URL da faixa (Loranne, Suno, etc)" value={openingMusicUrl}
                  onChange={(e) => setOpeningMusicUrl(e.target.value)}
                  className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-1.5 text-xs text-escola-creme placeholder:text-escola-creme-50/50 focus:border-escola-dourado focus:outline-none" />
                {openingMusicUrl && (() => {
                  const openDur = scenes.find((s) => s.type === "abertura")?.durationSec || 5;
                  return (
                    <>
                      <audio controls src={openingMusicUrl} className="w-full max-w-md h-8" />
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <label className="text-[9px] text-escola-creme-50">Comecar no seg:</label>
                          <input type="number" min={0} step={1} value={openingMusicStart} onChange={(e) => setOpeningMusicStart(Number(e.target.value))}
                            className="w-14 rounded border border-escola-border bg-escola-bg px-1 py-0.5 text-[10px] text-escola-creme text-center focus:border-escola-dourado focus:outline-none" />
                          <span className="text-[9px] text-escola-creme-50">({openDur}s da cena)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <label className="text-[9px] text-escola-creme-50">Vol:</label>
                          <input type="range" min={0} max={100} value={openingMusicVol} onChange={(e) => setOpeningMusicVol(Number(e.target.value))}
                            className="w-20 h-1 accent-escola-dourado" />
                          <span className="text-[9px] text-escola-creme-50 w-6">{openingMusicVol}%</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* 2. Instrumental (continuous under narration) */}
              <div className="space-y-1.5">
                <p className="text-[11px] text-escola-dourado font-medium">2. Instrumental continuo (~12% volume)</p>
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="URL do instrumental" value={bgMusicUrl}
                    onChange={(e) => setBgMusicUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-escola-border bg-escola-bg px-3 py-1.5 text-xs text-escola-creme placeholder:text-escola-creme-50/50 focus:border-escola-dourado focus:outline-none" />
                  <button onClick={generateMusic} disabled={loading.music}
                    className="whitespace-nowrap rounded-lg border border-escola-dourado/40 px-3 py-1.5 text-xs text-escola-dourado hover:bg-escola-dourado/10 disabled:opacity-40">
                    {loading.music ? "A gerar..." : "Gerar (Suno)"}
                  </button>
                </div>
                {error && !loading.music && <p className="text-[10px] text-escola-terracota">{error}</p>}
                {bgMusicUrl && (() => {
                  const narrationDur = scenes.filter((s) => s.type !== "abertura" && s.type !== "fecho").reduce((sum, s) => sum + (s.durationSec || 0), 0);
                  return (
                    <>
                      <audio controls src={bgMusicUrl} className="w-full max-w-md h-8" />
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <label className="text-[9px] text-escola-creme-50">Comecar no seg:</label>
                          <input type="number" min={0} step={1} value={bgMusicStart} onChange={(e) => setBgMusicStart(Number(e.target.value))}
                            className="w-14 rounded border border-escola-border bg-escola-bg px-1 py-0.5 text-[10px] text-escola-creme text-center focus:border-escola-dourado focus:outline-none" />
                          <span className="text-[9px] text-escola-creme-50">({narrationDur}s de narracao)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <label className="text-[9px] text-escola-creme-50">Vol:</label>
                          <input type="range" min={0} max={100} value={bgMusicVol} onChange={(e) => setBgMusicVol(Number(e.target.value))}
                            className="w-20 h-1 accent-escola-dourado" />
                          <span className="text-[9px] text-escola-creme-50 w-6">{bgMusicVol}%</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* 3. Closing music */}
              <div className="space-y-1.5">
                <p className="text-[11px] text-escola-dourado font-medium">3. Fecho (cena sem narracao)</p>
                <input type="text" placeholder={openingMusicUrl ? "Vazio = mesma da abertura" : "URL da faixa"} value={closingMusicUrl}
                  onChange={(e) => setClosingMusicUrl(e.target.value)}
                  className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-1.5 text-xs text-escola-creme placeholder:text-escola-creme-50/50 focus:border-escola-dourado focus:outline-none" />
                {closingMusicUrl ? (() => {
                  const closeDur = scenes.find((s) => s.type === "fecho")?.durationSec || 8;
                  return (
                    <>
                      <audio controls src={closingMusicUrl} className="w-full max-w-md h-8" />
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <label className="text-[9px] text-escola-creme-50">Comecar no seg:</label>
                          <input type="number" min={0} step={1} value={closingMusicStart} onChange={(e) => setClosingMusicStart(Number(e.target.value))}
                            className="w-14 rounded border border-escola-border bg-escola-bg px-1 py-0.5 text-[10px] text-escola-creme text-center focus:border-escola-dourado focus:outline-none" />
                          <span className="text-[9px] text-escola-creme-50">({closeDur}s da cena)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <label className="text-[9px] text-escola-creme-50">Vol:</label>
                          <input type="range" min={0} max={100} value={closingMusicVol} onChange={(e) => setClosingMusicVol(Number(e.target.value))}
                            className="w-20 h-1 accent-escola-dourado" />
                          <span className="text-[9px] text-escola-creme-50 w-6">{closingMusicVol}%</span>
                        </div>
                      </div>
                    </>
                  );
                })() : openingMusicUrl ? (
                  <p className="text-[10px] text-escola-creme-50 italic">Vai usar a mesma faixa e trecho da abertura.</p>
                ) : null}
              </div>
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
