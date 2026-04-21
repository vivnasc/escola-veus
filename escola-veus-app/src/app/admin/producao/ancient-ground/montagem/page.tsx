"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import videoPlan from "@/data/video-plan.json";
import youtubeMetadata from "@/data/youtube-metadata.json";

type SeoMeta = {
  thumbnailTitle: string;
  postTitle: string;
  description: string;
  hashtags: string[];
};

type YTMetadataVideo = { id: string; titulo_yt: string; descricao: string; hashtags: string[] };

function emptyseo(): SeoMeta {
  return { thumbnailTitle: "", postTitle: "", description: "", hashtags: [] };
}

// Template-based SEO generator per category — used for any of the 50 videos
// when there is no hand-written metadata. Output is meant as a proposal for
// the Vivianne to edit, not a final version.
type CategoryTemplate = {
  emoji: string;
  englishTitle: string; // e.g. "Indian Ocean"
  mood: string;         // e.g. "Relaxing Ocean Waves"
  setting: string;      // "Mozambique coastline"
  hook: string;         // first description paragraph
  perfectFor: string[]; // bullets
  hashtags: string[];
};

const CATEGORY_TEMPLATES: Record<string, CategoryTemplate> = {
  mar: {
    emoji: "🌊",
    englishTitle: "Indian Ocean",
    mood: "Relaxing Ocean Waves",
    setting: "Mozambique coastline",
    hook: "Immerse yourself in the breathtaking beauty of Mozambique's Indian Ocean coastline. Crystal clear turquoise waters, golden hour light, and gentle waves create the perfect atmosphere for meditation, study, or deep relaxation.",
    perfectFor: ["Meditation & mindfulness", "Study & focus", "Sleep & relaxation", "Yoga & breathing exercises", "Stress relief"],
    hashtags: ["#MozambiqueOcean", "#IndianOcean", "#RelaxingWaves", "#OceanSounds", "#TropicalOcean", "#CalmWaves"],
  },
  praia: {
    emoji: "🏖️",
    englishTitle: "Beaches of Mozambique",
    mood: "Tropical Paradise",
    setting: "Mozambique beaches — Tofo, Bazaruto, Vilankulo, Pemba, Ilha, Quirimbas",
    hook: "Discover the pristine beaches of Mozambique — from white sands in the south to remote shores in the north. This visual journey spans the entire 2,500 km coastline of one of Africa's most beautiful countries.",
    perfectFor: ["Meditation & mindfulness", "Holiday inspiration", "Sleep & relaxation", "Beach atmosphere", "Travel dreams"],
    hashtags: ["#MozambiqueBeaches", "#AfricanBeaches", "#TropicalParadise", "#Pemba", "#Tofo", "#Bazaruto"],
  },
  rio: {
    emoji: "🌿",
    englishTitle: "Rivers & Waterfalls",
    mood: "African Forest Ambience",
    setting: "Zambezi, Gorongosa, Mozambique interior",
    hook: "Journey deep into the rivers, waterfalls, and forests of Mozambique's interior. From the mighty Zambezi delta to hidden waterfalls in Gorongosa National Park, experience the lush tropical beauty of inland East Africa.",
    perfectFor: ["Meditation & mindfulness", "Study & focus", "Sleep with water sounds", "Forest bathing", "Stress relief"],
    hashtags: ["#AfricanRivers", "#Waterfalls", "#Gorongosa", "#Zambezi", "#ForestAmbience", "#RiverSounds"],
  },
  ceu: {
    emoji: "☁️",
    englishTitle: "African Sky",
    mood: "Dramatic Clouds & Sunsets",
    setting: "skies over Mozambique",
    hook: "Watch the magnificent skies of Mozambique — from golden sunsets over the savanna to dramatic storm clouds over the Indian Ocean. Africa's skies are among the most spectacular on Earth.",
    perfectFor: ["Meditation", "Creative inspiration", "Relaxation", "Contemplation", "Timelapse appreciation"],
    hashtags: ["#AfricanSky", "#AfricanSunset", "#DramaticClouds", "#GoldenHour", "#SkyTimelapse"],
  },
  chuva: {
    emoji: "🌧️",
    englishTitle: "Tropical Rain",
    mood: "Rain Sounds & African Music",
    setting: "Mozambique rainy season",
    hook: "Experience the beauty of tropical rain in Mozambique — from gentle monsoon showers on forest canopy to warm rain on pristine beaches. The rainy season transforms the landscape into a lush green paradise.",
    perfectFor: ["Sleep & relaxation", "Study & focus", "Meditation", "ASMR rain lovers", "Stress relief"],
    hashtags: ["#TropicalRain", "#RainSounds", "#AfricanRain", "#RainAmbience", "#SleepSounds", "#MonsoonRain"],
  },
  savana: {
    emoji: "🦁",
    englishTitle: "Golden Savanna",
    mood: "African Grasslands",
    setting: "Gorongosa, Mozambique savanna",
    hook: "Vast golden grasslands stretching to the horizon, ancient baobab trees, and the warm amber light of the African savanna. Experience the timeless beauty of Mozambique's interior landscapes.",
    perfectFor: ["Meditation", "Nature lovers", "Africa dreamers", "Relaxation", "Wildlife contemplation"],
    hashtags: ["#AfricanSavanna", "#Gorongosa", "#BaobabTree", "#GoldenGrassland", "#SavannaAmbience", "#WildAfrica"],
  },
  flora: {
    emoji: "🌺",
    englishTitle: "African Flora",
    mood: "Tropical Plants & Flowers",
    setting: "Mozambique wild flora",
    hook: "Step into the lush tropical flora of Mozambique — vibrant flowers, ancient trees, and tangled green life under the warm African sun. Nature in full bloom.",
    perfectFor: ["Meditation", "Botanical appreciation", "Calm background", "Art inspiration", "Relaxation"],
    hashtags: ["#AfricanFlora", "#TropicalFlowers", "#AfricanPlants", "#WildFlora", "#GreenNature"],
  },
  nevoeiro: {
    emoji: "🌫️",
    englishTitle: "Mysterious Mist",
    mood: "Misty Ambience",
    setting: "Mozambique highlands & coast in mist",
    hook: "Wander into the mysterious mist of Mozambique — soft fog drifting across forests, mountains, and coastline. A meditative landscape that invites deep stillness.",
    perfectFor: ["Meditation", "Deep relaxation", "Atmospheric writing", "Sleep", "Contemplation"],
    hashtags: ["#MistyForest", "#FogAmbience", "#MysteriousNature", "#MistyLandscape", "#CalmFog"],
  },
  fogo: {
    emoji: "🔥",
    englishTitle: "Fire & Embers",
    mood: "Campfire Ambience",
    setting: "Mozambique nightscapes",
    hook: "Gather around the warm glow of fire and embers under the African night. The ancient sound of crackling wood, the dance of flame — a primal calm.",
    perfectFor: ["Meditation", "Sleep", "Focused work", "Winter warmth", "Ancestral calm"],
    hashtags: ["#Campfire", "#FireSounds", "#EmbersGlow", "#AfricanNight", "#FireMeditation"],
  },
  terra: {
    emoji: "🟤",
    englishTitle: "Red Earth",
    mood: "Grounded African Soil",
    setting: "Mozambique interior",
    hook: "The deep red earth of Mozambique — cracked, warm, alive. Ancient landscapes that have watched civilisations rise and return to dust.",
    perfectFor: ["Meditation", "Grounding", "Slow reading", "Stillness", "Reconnecting"],
    hashtags: ["#RedEarth", "#AfricanSoil", "#GroundedNature", "#AfricanLandscape", "#AncestralEarth"],
  },
  noite: {
    emoji: "✨",
    englishTitle: "Starry Night",
    mood: "African Night Sky",
    setting: "Mozambique night skies",
    hook: "Beneath a canopy of stars so thick it feels like an ocean overhead. The African night — vast, silent, infinite. Let it hold you.",
    perfectFor: ["Sleep", "Deep meditation", "Stargazing sounds", "Nighttime study", "Cosmic contemplation"],
    hashtags: ["#StarryNight", "#AfricanSky", "#NightAmbience", "#MilkyWay", "#SleepUnderStars"],
  },
  caminho: {
    emoji: "🛤️",
    englishTitle: "Paths & Trails",
    mood: "Forest & Savanna Walks",
    setting: "Mozambique wild paths",
    hook: "Follow the quiet paths of Mozambique — through forest, savanna, and memory. Every trail holds a story in its dust.",
    perfectFor: ["Meditation", "Journey reflections", "Walking inspiration", "Contemplative work", "Stillness"],
    hashtags: ["#ForestPath", "#AfricanTrails", "#WildPath", "#NatureWalk", "#PathMeditation"],
  },
};

function smartSeoForVideo(
  videoId: string,
  planTitle: string,
  categorias: string[],
  durationMin: number,
): SeoMeta {
  const primary = categorias[0] || "mar";
  const tpl = CATEGORY_TEMPLATES[primary] || CATEGORY_TEMPLATES.mar;

  const postTitle = `${tpl.emoji} ${tpl.englishTitle} Mozambique — ${durationMin} Min ${tpl.mood} & African Music`;

  const description = [
    tpl.hook,
    "",
    `This video features real landscapes inspired by ${tpl.setting}, paired with original African-inspired instrumental music from Ancient Ground (music.seteveus.space).`,
    "",
    "🌍 Mozambique has over 2,500 km of pristine Indian Ocean coastline and vast interior landscapes, making it one of the most visually stunning countries in Africa.",
    "",
    "🎵 Music: Ancient Ground — music.seteveus.space",
    `📍 Inspired by: Mozambique, East Africa`,
    "",
    "Perfect for:",
    ...tpl.perfectFor.map((p) => `• ${p}`),
    "",
    "🎵 Ancient Ground — music.seteveus.space",
  ].join("\n");

  // Merge category hashtags with universal Moçambique tags (dedup).
  const universal = ["#Mozambique", "#Moçambique", "#AfricanNature", "#RelaxingNature", "#AmbientVideo", "#Meditation", "#CalmMusic"];
  const hashtags = Array.from(new Set([...tpl.hashtags, ...universal])).slice(0, 15);

  return {
    thumbnailTitle: planTitle, // short PT title shown on thumbnail
    postTitle,
    description,
    hashtags,
  };
}

// Prefer hand-written metadata from youtube-metadata.json when available;
// otherwise fall back to the category-based template generator above.
function seoFromMetadata(videoId: string, planTitle: string, categorias: string[] = [], durationMin = 60): SeoMeta {
  const meta = (youtubeMetadata as { videos: YTMetadataVideo[] }).videos.find((v) => v.id === videoId);
  if (meta) {
    return {
      thumbnailTitle: planTitle,
      postTitle: meta.titulo_yt,
      description: meta.descricao,
      hashtags: meta.hashtags,
    };
  }
  return smartSeoForVideo(videoId, planTitle, categorias, durationMin);
}

// ── Constants ────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://tdytdamtfillqyklgrmb.supabase.co";
const MUSIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/audios/albums/ancient-ground`;
const TOTAL_MUSIC_PAIRS = 50; // 100 faixas em 50 pares (1+2, 3+4, etc.)
const CLIP_DURATION = 10; // seconds — matches Runway gen4_turbo clip length
const DURATION_PRESETS: Array<{ label: string; seconds: number; credits: number }> = [
  { label: "5 min (teste — 5 créditos)", seconds: 300, credits: 5 },
  { label: "10 min (10 créditos)", seconds: 600, credits: 10 },
  { label: "30 min (30 créditos)", seconds: 1800, credits: 30 },
  { label: "1 h (60 créditos)", seconds: 3600, credits: 60 },
];
const DEFAULT_VIDEO_DURATION = 3600;
const AG_INTRO_URL = "https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/course-assets/youtube/brand/intro.mp4";
const AG_INTRO_DURATION = 5;

// ── Types ────────────────────────────────────────────────────────────────────

type ClipSlot = {
  index: number;
  url: string;
  loaded: boolean;
};

type ClipGroup = {
  promptId: string;
  clips: string[]; // ordered list of URLs (4 variations)
};

type ProjectState = {
  title: string;
  clips: ClipSlot[];
  musicPair: number;
  groupOrder?: string[]; // ordered promptIds
  groupClips?: Record<string, string[]>; // promptId → ordered clip URLs
  thumbnailUrl?: string;
  composedThumbnailDataUrl?: string; // canvas-composed thumbnail (data: URL)
  seo?: SeoMeta;
  videoId?: string; // video-XX from plan
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMusicPairUrls(pairNum: number): [string, string] {
  const a = (pairNum - 1) * 2 + 1;
  const b = a + 1;
  const padA = String(a).padStart(2, "0");
  const padB = String(b).padStart(2, "0");
  return [
    `${MUSIC_BASE}/faixa-${padA}.mp3`,
    `${MUSIC_BASE}/faixa-${padB}.mp3`,
  ];
}

// Extract promptId from clip filename.
// "mar-01-golden-hour-h-01.mp4" → "mar-01-golden-hour"
// "mar-01-golden-hour-h-01.mp4.mp4" → "mar-01-golden-hour"
// URL with ?t=timestamp handled upstream.
function promptIdFromClipName(name: string): string {
  return name.replace(/\.mp4(\.mp4)?$/i, "").replace(/-[hv]-\d+$/, "");
}

// Natural sort for promptIds: "mar-01" < "mar-02" < ... < "mar-15"
function comparePromptIds(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function fileNameFromUrl(url: string): string {
  const last = url.split("/").pop() || "";
  return last.split("?")[0];
}

function buildGroups(clipUrls: string[]): ClipGroup[] {
  const map = new Map<string, string[]>();
  for (const url of clipUrls) {
    if (!url) continue;
    const name = fileNameFromUrl(url);
    const pid = promptIdFromClipName(name);
    if (!pid) continue;
    if (!map.has(pid)) map.set(pid, []);
    map.get(pid)!.push(url);
  }
  const groups: ClipGroup[] = [];
  for (const [promptId, urls] of map) {
    urls.sort((a, b) => fileNameFromUrl(a).localeCompare(fileNameFromUrl(b)));
    groups.push({ promptId, clips: urls });
  }
  groups.sort((a, b) => comparePromptIds(a.promptId, b.promptId));
  return groups;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function YouTubeMontagem() {
  const [title, setTitle] = useState("");
  // Group state: ordered promptIds + per-group ordered clip URLs.
  const [groupOrder, setGroupOrder] = useState<string[]>([]);
  const [groupClips, setGroupClips] = useState<Record<string, string[]>>({});
  const [videoDuration, setVideoDuration] = useState<number>(DEFAULT_VIDEO_DURATION);
  // FadeOut em segundos. 0 = corte seco (rápido, -c:v copy). >0 = fade para
  // preto + silêncio no fim (mais ~15min de runner para 1h).
  const [fadeOut, setFadeOut] = useState<number>(3);
  // Intro Ancient Ground. Default ligado — prepend do clip de brand ao início
  // de cada render. URL hardcoded; se um dia mudares, basta substituir o MP4
  // em course-assets/youtube/brand/intro.mp4 (não precisas tocar aqui).
  const [useIntro, setUseIntro] = useState<boolean>(true);
  const totalClipsNeeded = Math.ceil(videoDuration / CLIP_DURATION);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [composedThumbnailDataUrl, setComposedThumbnailDataUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [seo, setSeo] = useState<SeoMeta>(emptyseo());
  const [musicPair, setMusicPair] = useState(1); // pair 1 = faixas 01+02
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Diagnóstico do piscar (não afecta o render — só o preview).
  // trimEdges: salta 0.3s do início e 0.3s do fim de cada clip (testa frames-edge Runway)
  // hardCut: desliga o fade 75ms entre buffers A/B (testa transição CSS)
  // loopSingleClip: repete só o 1º clip 4x (isola edges-do-clip vs jump-cut entre clips)
  const [trimEdges, setTrimEdges] = useState(false);
  const [hardCut, setHardCut] = useState(false);
  const [loopSingleClip, setLoopSingleClip] = useState(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const TRIM = 0.3;

  // Derived: flat ordered clip URLs respecting groupOrder + per-group order.
  const orderedClipUrls: string[] = groupOrder.flatMap((pid) => groupClips[pid] || []);

  // O preview pode tocar uma sequência diferente do render (ex: loop dum só clip
  // para diagnóstico). previewClipUrls é o que vai para o player; orderedClipUrls
  // continua a ser o que vai para o render Shotstack.
  const previewClipUrls: string[] = useMemo(() => {
    if (loopSingleClip && orderedClipUrls.length > 0) {
      return [orderedClipUrls[0], orderedClipUrls[0], orderedClipUrls[0], orderedClipUrls[0]];
    }
    return orderedClipUrls;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loopSingleClip, orderedClipUrls.join("|")]);

  // Auto-load clips from Supabase on mount (only if no saved state yet).
  useEffect(() => {
    const saved = localStorage.getItem("yt-montagem-state");
    if (saved) return; // hydrated below
    fetch("/api/admin/thinkdiffusion/list-clips")
      .then((r) => r.json())
      .then((data) => {
        if (!data.clips || data.clips.length === 0) return;
        const horizontal = data.clips
          .filter((c: { name: string }) => c.name.includes("-h-"))
          .map((c: { url: string }) => c.url);
        const groups = buildGroups(horizontal);
        setGroupOrder(groups.map((g) => g.promptId));
        setGroupClips(Object.fromEntries(groups.map((g) => [g.promptId, g.clips])));
      })
      .catch(() => {});
  }, []);

  // Render
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderLabel, setRenderLabel] = useState("");
  const [renderResult, setRenderResult] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  // "ffmpeg" = GitHub Actions + FFmpeg (grátis, mais controlo). "shotstack" =
  // serviço pago, mantido como fallback até validarmos o FFmpeg em produção.
  const [renderEngine, setRenderEngine] = useState<"ffmpeg" | "shotstack">("ffmpeg");

  // Preview
  const [previewing, setPreviewing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [previewClipIndex, setPreviewClipIndex] = useState(0);
  const [previewTime, setPreviewTime] = useState(0);
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);
  const [activeBuffer, setActiveBuffer] = useState<0 | 1>(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("yt-montagem-state");
      if (saved) {
        const state: ProjectState = JSON.parse(saved);
        if (state.title) setTitle(state.title);
        if (state.musicPair) setMusicPair(state.musicPair);
        if (state.thumbnailUrl) setThumbnailUrl(state.thumbnailUrl);
        if (state.composedThumbnailDataUrl) setComposedThumbnailDataUrl(state.composedThumbnailDataUrl);
        if (state.videoId) setVideoId(state.videoId);
        if (state.seo) setSeo(state.seo);
        if (state.groupOrder && state.groupClips) {
          setGroupOrder(state.groupOrder);
          setGroupClips(state.groupClips);
        } else if (state.clips) {
          // Legacy: migrate old flat clips to groups.
          const urls = state.clips.map((c) => c.url).filter((u) => u);
          const groups = buildGroups(urls);
          setGroupOrder(groups.map((g) => g.promptId));
          setGroupClips(Object.fromEntries(groups.map((g) => [g.promptId, g.clips])));
        }
      }
    } catch { /* ignore */ }
  }, []);

  const saveState = useCallback(() => {
    const state: ProjectState = {
      title, clips: [], musicPair, groupOrder, groupClips,
      thumbnailUrl, composedThumbnailDataUrl, videoId, seo,
    };
    localStorage.setItem("yt-montagem-state", JSON.stringify(state));
  }, [title, musicPair, groupOrder, groupClips, thumbnailUrl, composedThumbnailDataUrl, videoId, seo]);

  useEffect(() => {
    saveState();
  }, [title, musicPair, groupOrder, groupClips, thumbnailUrl, composedThumbnailDataUrl, videoId, seo, saveState]);

  // Legacy migration: older localStorage only kept `title` (the human titulo),
  // never `videoId`. If title matches a plan entry, restore the videoId.
  useEffect(() => {
    if (videoId || !title) return;
    const plan = (videoPlan as Array<{id: string; titulo: string}>).find((v) => v.titulo === title);
    if (plan) setVideoId(plan.id);
  }, [videoId, title]);

  // Auto-generate SEO when a video is selected but the fields are still empty.
  // Covers the case where videoId comes from localStorage (user had selected a
  // video in a previous session before the SEO generator existed).
  useEffect(() => {
    if (!videoId) return;
    if (seo.postTitle.trim() || seo.description.trim()) return; // user already has content
    const plan = (videoPlan as Array<{id: string; titulo: string; categorias: string[]}>).find((v) => v.id === videoId);
    if (!plan) return;
    const durationMin = Math.round(videoDuration / 60);
    setSeo(seoFromMetadata(videoId, plan.titulo, plan.categorias, durationMin));
  }, [videoId, seo.postTitle, seo.description]);

  // Sync with Supabase — re-fetch and merge (keeps user ordering, adds new clips).
  const syncClipsFromSupabase = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/thinkdiffusion/list-clips");
      const data = await r.json();
      if (!data.clips) return;
      const horizontal = data.clips
        .filter((c: { name: string }) => c.name.includes("-h-"))
        .map((c: { url: string }) => c.url);
      const fresh = buildGroups(horizontal);
      const freshIds = fresh.map((g) => g.promptId);
      // Preserve existing group order, append new groups at end.
      const mergedOrder = [
        ...groupOrder.filter((id) => freshIds.includes(id)),
        ...freshIds.filter((id) => !groupOrder.includes(id)),
      ];
      // For each group, preserve user order but add new clips and drop deleted.
      const mergedClips: Record<string, string[]> = {};
      for (const g of fresh) {
        const existing = groupClips[g.promptId] || [];
        const freshSet = new Set(g.clips.map(fileNameFromUrl));
        const existingSet = new Set(existing.map(fileNameFromUrl));
        const kept = existing.filter((u) => freshSet.has(fileNameFromUrl(u)));
        const added = g.clips.filter((u) => !existingSet.has(fileNameFromUrl(u)));
        mergedClips[g.promptId] = [...kept, ...added];
      }
      setGroupOrder(mergedOrder);
      setGroupClips(mergedClips);
    } catch { /* ignore */ }
  }, [groupOrder, groupClips]);

  // Music pair URLs
  const [musicUrlA, musicUrlB] = getMusicPairUrls(musicPair);
  const audioRefB = useRef<HTMLAudioElement>(null);

  // When track A ends, play track B, and vice-versa (loop)
  const handleTrackEnd = () => {
    if (currentTrackIndex === 0) {
      setCurrentTrackIndex(1);
      if (audioRefB.current) {
        audioRefB.current.currentTime = 0;
        audioRefB.current.volume = 0.3;
        audioRefB.current.play().catch(() => {});
      }
    } else {
      setCurrentTrackIndex(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Preview controls — double-buffered to avoid load-delay between clips.
  // Buffer A plays clip N, buffer B preloads clip N+1, then swap.
  const getBuffer = (bufIdx: 0 | 1) => (bufIdx === 0 ? videoRefA.current : videoRefB.current);

  const preloadInto = (bufIdx: 0 | 1, url: string | undefined, startAt = 0) => {
    const el = getBuffer(bufIdx);
    if (!el) return;
    if (!url) { el.removeAttribute("src"); el.load(); return; }
    if (el.src !== url) {
      el.src = url;
      el.load();
    }
    el.pause();
    el.currentTime = startAt;
  };

  const clearAdvanceTimer = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  };

  // Quando o trimEdges está activo, não podemos esperar pelo `onEnded` — temos
  // de avançar antes do último 0.3s. Este timer é a única forma de avançar.
  // Quando trimEdges está off, o `onEnded` dispara e ignoramos o timer.
  const scheduleTrimAdvance = (bufIdx: 0 | 1, msRemaining: number) => {
    clearAdvanceTimer();
    if (!trimEdges) return;
    advanceTimerRef.current = setTimeout(() => {
      advancePreview(bufIdx);
    }, Math.max(0, msRemaining));
  };

  const startPreview = () => {
    if (previewClipUrls.length === 0) return;
    setPreviewing(true);
    setPaused(false);
    setPreviewClipIndex(0);
    setPreviewTime(0);
    setActiveBuffer(0);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {});
    }

    const startAt = trimEdges ? TRIM : 0;
    // Buffer 0 = clip 0 (plays), buffer 1 = clip 1 (preload).
    preloadInto(0, previewClipUrls[0], startAt);
    preloadInto(1, previewClipUrls[1], startAt);
    const a = getBuffer(0);
    if (a) a.play().catch(() => {});

    startClipTimer(0, 0);
    if (trimEdges) {
      const effectiveMs = (CLIP_DURATION - 2 * TRIM) * 1000;
      scheduleTrimAdvance(0, effectiveMs);
    }
  };

  const stopPreview = () => {
    setPreviewing(false);
    setPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    clearAdvanceTimer();
    videoRefA.current?.pause();
    videoRefB.current?.pause();
    if (audioRef.current) audioRef.current.pause();
  };

  const pausePreview = () => {
    setPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
    clearAdvanceTimer();
    getBuffer(activeBuffer)?.pause();
    audioRef.current?.pause();
    audioRefB.current?.pause();
  };

  const resumePreview = () => {
    setPaused(false);
    const cur = getBuffer(activeBuffer);
    if (cur) cur.play().catch(() => {});
    if (currentTrackIndex === 0) audioRef.current?.play().catch(() => {});
    else audioRefB.current?.play().catch(() => {});
    // Resume timer accounting for already-elapsed time on this clip.
    const cur2 = getBuffer(activeBuffer);
    const elapsedOnClip = cur2 ? cur2.currentTime : 0;
    startClipTimer(previewClipIndex, elapsedOnClip);
    if (trimEdges) {
      const endAt = CLIP_DURATION - TRIM;
      const remainingMs = Math.max(0, (endAt - elapsedOnClip) * 1000);
      scheduleTrimAdvance(activeBuffer, remainingMs);
    }
  };

  const startClipTimer = (clipIndex: number, startElapsed = 0) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const startTime = Date.now() - startElapsed * 1000;
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setPreviewTime(clipIndex * CLIP_DURATION + elapsed);
    }, 100);
  };

  // Advance when the active clip ends naturally — no setInterval for clip swap.
  const advancePreview = (endedBufIdx: 0 | 1) => {
    clearAdvanceTimer();
    const nextIndex = previewClipIndex + 1;
    if (nextIndex >= previewClipUrls.length) {
      stopPreview();
      return;
    }
    const startAt = trimEdges ? TRIM : 0;
    // The buffer that just ended now preloads the clip AFTER next.
    const newActive: 0 | 1 = endedBufIdx === 0 ? 1 : 0;
    const preloadUrl = previewClipUrls[nextIndex + 1];
    preloadInto(endedBufIdx, preloadUrl, startAt);

    setActiveBuffer(newActive);
    setPreviewClipIndex(nextIndex);

    const cur = getBuffer(newActive);
    if (cur) {
      cur.currentTime = startAt;
      cur.play().catch(() => {});
    }
    startClipTimer(nextIndex, 0);
    if (trimEdges) {
      const effectiveMs = (CLIP_DURATION - 2 * TRIM) * 1000;
      scheduleTrimAdvance(newActive, effectiveMs);
    }
  };

  const filledClips = orderedClipUrls.length;

  // Render MP4 via Shotstack — decoupled submit/poll/save flow so long renders
  // survive browser reloads and are not bound to Vercel's 300s function cap.
  const startRender = async () => {
    const validClips = orderedClipUrls.filter((u) => u && u.trim().length > 0);
    if (validClips.length === 0) return;

    setRendering(true);
    setRenderProgress(0);
    setRenderLabel("A submeter ao Shotstack...");
    setRenderResult(null);
    setRenderError(null);

    try {
      const submitRes = await fetch("/api/admin/youtube/render-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          uniqueClips: validClips,
          targetDuration: videoDuration,
          musicUrls: [musicUrlA, musicUrlB],
          musicVolume: 0.8,
          clipDuration: CLIP_DURATION,
        }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok || !submitData.renderId) {
        throw new Error(submitData.erro || `HTTP ${submitRes.status}`);
      }
      localStorage.setItem("yt-pending-render", JSON.stringify({ renderId: submitData.renderId, title, thumbnailUrl: composedThumbnailDataUrl || thumbnailUrl || null, seo, startedAt: Date.now() }));
      await pollAndSaveRender(submitData.renderId);
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : String(err));
      setRendering(false);
    }
  };

  // Poll Shotstack status and save to Supabase once done. Safe to call on page
  // mount to resume a pending render (renderId stored in localStorage).
  const pollAndSaveRender = useCallback(async (renderId: string) => {
    setRendering(true);
    setRenderError(null);

    const progressMap: Record<string, number> = {
      queued: 10, fetching: 30, rendering: 60, saving: 85, done: 95, failed: 0,
    };

    // Poll every 10s. No client-side timeout — Shotstack tells us when done/failed.
    let lastStatus = "";
    while (true) {
      await new Promise((r) => setTimeout(r, 10_000));
      let data: { status?: string; url?: string; error?: string; erro?: string };
      try {
        const r = await fetch(`/api/admin/youtube/render-status?id=${encodeURIComponent(renderId)}`);
        data = await r.json();
      } catch {
        setRenderLabel("Ligacao perdida — a tentar de novo...");
        continue;
      }
      if (data.erro) { setRenderError(data.erro); setRendering(false); return; }
      const status = data.status || "...";
      if (status !== lastStatus) {
        setRenderLabel(status);
        setRenderProgress(progressMap[status] ?? 50);
        lastStatus = status;
      }
      if (status === "failed") {
        setRenderError(data.error || "Shotstack render failed.");
        setRendering(false);
        localStorage.removeItem("yt-pending-render");
        return;
      }
      if (status === "done" && data.url) {
        setRenderLabel("A guardar no Supabase...");
        setRenderProgress(90);
        try {
          const saved = await fetch("/api/admin/youtube/render-save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shotstackUrl: data.url,
              title,
              thumbnailUrl: composedThumbnailDataUrl || thumbnailUrl || undefined,
              seo,
            }),
          });
          const savedData = await saved.json();
          if (!saved.ok) throw new Error(savedData.erro || `Save HTTP ${saved.status}`);
          setRenderResult(savedData.videoUrl);
          setRenderProgress(100);
          setRenderLabel("Video pronto!");
          localStorage.setItem("yt-last-ffmpeg-render", JSON.stringify({
            videoUrl: savedData.videoUrl,
            completedAt: Date.now(),
          }));
        } catch (err) {
          // Shotstack has the file; save failed. Show Shotstack URL so nothing is lost.
          setRenderResult(data.url);
          setRenderLabel(`Supabase upload falhou — descarrega do Shotstack. (${err instanceof Error ? err.message : err})`);
        }
        setRendering(false);
        localStorage.removeItem("yt-pending-render");
        return;
      }
    }
  }, [title, thumbnailUrl, composedThumbnailDataUrl, seo]);

  // Render MP4 via FFmpeg em GitHub Actions — dispatch e polling ao result.json
  // em Supabase. O workflow corre ffmpeg, faz upload e escreve o resultado.
  const pollFfmpegStatus = useCallback(async (jobId: string) => {
    setRendering(true);
    setRenderError(null);

    while (true) {
      await new Promise((r) => setTimeout(r, 10_000));
      let data: {
        status?: string;
        phase?: string;
        progress?: number;
        videoUrl?: string;
        error?: string;
        erro?: string;
      };
      try {
        const r = await fetch(`/api/admin/youtube/render-ffmpeg-status?jobId=${encodeURIComponent(jobId)}`);
        data = await r.json();
      } catch {
        setRenderLabel("Ligacao perdida — a tentar de novo...");
        continue;
      }
      if (data.erro) { setRenderError(data.erro); setRendering(false); return; }
      const status = data.status || "...";
      const phase = data.phase ? ` (${data.phase})` : "";
      setRenderLabel(`${status}${phase}`);
      if (typeof data.progress === "number") setRenderProgress(data.progress);
      if (status === "failed") {
        setRenderError(data.error || "FFmpeg render failed. Ver logs em GitHub Actions.");
        setRendering(false);
        localStorage.removeItem("yt-pending-ffmpeg-render");
        return;
      }
      if (status === "done" && data.videoUrl) {
        setRenderResult(data.videoUrl);
        setRenderProgress(100);
        setRenderLabel("Video pronto!");
        setRendering(false);
        localStorage.removeItem("yt-pending-ffmpeg-render");
        // Persist o último render completado para sobreviver a reloads.
        localStorage.setItem("yt-last-ffmpeg-render", JSON.stringify({
          videoUrl: data.videoUrl,
          completedAt: Date.now(),
        }));
        return;
      }
    }
  }, []);

  const startFfmpegRender = async () => {
    const validClips = orderedClipUrls.filter((u) => u && u.trim().length > 0);
    if (validClips.length === 0) return;

    setRendering(true);
    setRenderProgress(0);
    setRenderLabel("A despachar GitHub Actions...");
    setRenderResult(null);
    setRenderError(null);

    try {
      const res = await fetch("/api/admin/youtube/render-ffmpeg-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          // slug do ficheiro: preferimos o título (ex: "oceano-indico") ao
          // videoId ("video-01") para os MP4s terem nome legível no Supabase.
          // Se não houver título, cai para videoId.
          slug: title || videoId || undefined,
          uniqueClips: validClips,
          targetDuration: videoDuration,
          musicUrls: [musicUrlA, musicUrlB],
          musicVolume: 0.8,
          clipDuration: CLIP_DURATION,
          // Parâmetros que resolvem o piscar: trim de 0.3s nas pontas dos clips
          // + xfade longo de 1.5s. Deterministico, ao contrário do Shotstack.
          trimEdge: 0.3,
          crossfade: 1.5,
          fps: 30,
          fadeOut,
          introUrl: useIntro ? AG_INTRO_URL : undefined,
          introDuration: AG_INTRO_DURATION,
          thumbnailDataUrl: composedThumbnailDataUrl || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
          seo,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.jobId) {
        throw new Error(data.erro || `HTTP ${res.status}`);
      }
      localStorage.setItem("yt-pending-ffmpeg-render", JSON.stringify({
        jobId: data.jobId,
        startedAt: Date.now(),
      }));
      await pollFfmpegStatus(data.jobId);
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : String(err));
      setRendering(false);
    }
  };

  // Resume any pending render if the user reloads the page.
  // Se não houver pending, restaura o último render completado (para que a
  // Vivianne veja o link do vídeo mesmo depois de recarregar a página).
  useEffect(() => {
    try {
      const raw = localStorage.getItem("yt-pending-render");
      const rawF = localStorage.getItem("yt-pending-ffmpeg-render");
      const hasPending = !!(raw || rawF);

      if (raw) {
        const pending: { renderId?: string } = JSON.parse(raw);
        if (pending.renderId) pollAndSaveRender(pending.renderId);
      }
      if (rawF) {
        const pf: { jobId?: string } = JSON.parse(rawF);
        if (pf.jobId) pollFfmpegStatus(pf.jobId);
      }

      // Nenhum render em curso → mostra o último vídeo gerado (se houver).
      if (!hasPending) {
        const last = localStorage.getItem("yt-last-ffmpeg-render");
        if (last) {
          const parsed: { videoUrl?: string } = JSON.parse(last);
          if (parsed.videoUrl) {
            setRenderResult(parsed.videoUrl);
            setRenderLabel("Último vídeo gerado nesta página");
          }
        }
      }
    } catch { /* ignore */ }
    // Only on mount — callbacks read the latest state via closures.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Download project JSON
  const downloadProject = () => {
    const project = {
      title,
      specs: {
        duration: videoDuration,
        uniqueClips: filledClips,
        totalClips: totalClipsNeeded,
        clipDuration: CLIP_DURATION,
      },
      music: {
        pair: musicPair,
        urlA: musicUrlA,
        urlB: musicUrlB,
        album: "ancient-ground",
        loop: "A → B → A → B...",
      },
      thumbnail: thumbnailUrl || null,
      thumbnailComposedDataUrl: composedThumbnailDataUrl || null,
      videoId: videoId || null,
      seo,
      groups: groupOrder.map((pid) => ({
        promptId: pid,
        clips: groupClips[pid] || [],
      })),
      clips: orderedClipUrls,
    };

    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "video"}-project.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset project
  const resetProject = () => {
    if (!confirm("Limpar tudo e começar de novo?")) return;
    setTitle("");
    setVideoId("");
    setSeo(emptyseo());
    setGroupOrder([]);
    setGroupClips({});
    setThumbnailUrl("");
    setComposedThumbnailDataUrl("");
    setMusicPair(1);
    localStorage.removeItem("yt-montagem-state");
  };

  // Group reorder: move group at index from→to
  const moveGroup = (promptId: string, newPosition: number) => {
    setGroupOrder((prev) => {
      const idx = prev.indexOf(promptId);
      if (idx < 0 || newPosition < 0 || newPosition >= prev.length) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      next.splice(newPosition, 0, promptId);
      return next;
    });
  };

  // Intra-group swap: move clip at URL to a new position within its group
  const moveClipInGroup = (promptId: string, clipUrl: string, newPosition: number) => {
    setGroupClips((prev) => {
      const current = prev[promptId] || [];
      const idx = current.indexOf(clipUrl);
      if (idx < 0 || newPosition < 0 || newPosition >= current.length) return prev;
      const next = [...current];
      next.splice(idx, 1);
      next.splice(newPosition, 0, clipUrl);
      return { ...prev, [promptId]: next };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-escola-creme">
          Montagem YouTube
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-escola-creme-50">
            {filledClips} clips únicos · {Math.round(videoDuration / 60)} min alvo
          </span>
          <button
            onClick={resetProject}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Limpar
          </button>
        </div>
      </div>

      {/* ── 1. TITULO ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          1. Vídeo
        </h3>
        <select
          value={videoId}
          onChange={(e) => {
            const id = e.target.value;
            const plan = (videoPlan as Array<{id: string; titulo: string; categorias: string[]}>).find((v) => v.id === id);
            setVideoId(id);
            setTitle(plan?.titulo || "");
            // Auto-fill SEO (hand-written metadata OR generated template).
            if (id && plan) {
              const durationMin = Math.round(videoDuration / 60);
              setSeo(seoFromMetadata(id, plan.titulo, plan.categorias, durationMin));
            }
          }}
          className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
        >
          <option value="">Selecciona o vídeo...</option>
          {(videoPlan as Array<{id: string; titulo: string; categorias: string[]}>).map((v) => (
            <option key={v.id} value={v.id}>
              {v.id.replace("video-", "#")} — {v.titulo} ({v.categorias.join(" + ")})
            </option>
          ))}
        </select>
      </section>

      {/* ── 2. MUSICA ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          2. Música — Ancient Ground (Loranne)
        </h3>
        <p className="mb-2 text-xs text-escola-creme-50">
          Cada par = 2 faixas do mesmo prompt que fazem loop contínuo.
        </p>
        <div className="flex items-center gap-3">
          <select
            value={musicPair}
            onChange={(e) => { setMusicPair(Number(e.target.value)); setCurrentTrackIndex(0); }}
            className="rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
          >
            {Array.from({ length: TOTAL_MUSIC_PAIRS }, (_, i) => {
              const a = (i * 2 + 1).toString().padStart(2, "0");
              const b = (i * 2 + 2).toString().padStart(2, "0");
              return (
                <option key={i + 1} value={i + 1}>
                  Par {i + 1} — Faixas {a} + {b}
                </option>
              );
            })}
          </select>
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${currentTrackIndex === 0 ? "text-escola-coral" : "text-escola-creme-50"}`}>A</span>
            <audio
              ref={audioRef}
              src={musicUrlA}
              controls
              onEnded={handleTrackEnd}
              className="h-8 flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${currentTrackIndex === 1 ? "text-escola-coral" : "text-escola-creme-50"}`}>B</span>
            <audio
              ref={audioRefB}
              src={musicUrlB}
              controls
              onEnded={handleTrackEnd}
              className="h-8 flex-1"
            />
          </div>
        </div>
      </section>

      {/* ── 3. CLIPS POR GRUPO ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            3. Clips por grupo ({groupOrder.length} grupos · {filledClips} clips · {Math.floor(filledClips * CLIP_DURATION / 60)}:{String((filledClips * CLIP_DURATION) % 60).padStart(2, "0")})
          </h3>
          <button
            onClick={syncClipsFromSupabase}
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            Sincronizar Supabase
          </button>
        </div>

        <p className="mb-3 text-xs text-escola-creme-50">
          Dropdown <b>esquerdo (grupo)</b> = posição do grupo na sequência dos 15 grupos.
          Dropdown <b>direito (variação)</b> = ordem dos 4 clips dentro do grupo.
        </p>

        <div className="space-y-4">
          {groupOrder.map((promptId, gIdx) => {
            const clipsInGroup = groupClips[promptId] || [];
            return (
              <div key={promptId} className="rounded border border-escola-border bg-escola-bg p-3">
                <div className="mb-2 flex items-center gap-2">
                  <select
                    value={gIdx}
                    onChange={(e) => moveGroup(promptId, Number(e.target.value))}
                    className="rounded bg-escola-coral px-2 py-0.5 text-xs font-bold text-white border-none cursor-pointer"
                  >
                    {groupOrder.map((_, n) => (
                      <option key={n} value={n}>Grupo {n + 1}</option>
                    ))}
                  </select>
                  <span className="text-xs font-semibold text-escola-creme">{promptId}</span>
                  <span className="text-xs text-escola-creme-50">({clipsInGroup.length} clips)</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {clipsInGroup.map((url, cIdx) => {
                    const fileName = fileNameFromUrl(url).replace(/\.mp4(\.mp4)?$/i, "");
                    return (
                      <div key={url} className="space-y-1">
                        <div className="relative aspect-video overflow-hidden rounded border border-green-800/50">
                          <video src={url} className="h-full w-full object-cover" muted playsInline
                            onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                            onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                          />
                          <select
                            value={cIdx}
                            onChange={(e) => moveClipInGroup(promptId, url, Number(e.target.value))}
                            className="absolute top-1 left-1 rounded bg-black/80 px-1 text-xs text-white border-none cursor-pointer"
                          >
                            {clipsInGroup.map((_, n) => (
                              <option key={n} value={n}>{n + 1}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-xs text-green-300 truncate">{fileName}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {groupOrder.length === 0 && (
            <p className="text-sm text-escola-creme-50">
              Sem clips carregados. Clica em &quot;Sincronizar Supabase&quot; acima.
            </p>
          )}
        </div>
      </section>

      {/* ── 3B. THUMBNAIL ── */}
      <SeoComposerSection
        thumbnailUrl={thumbnailUrl}
        onSelect={setThumbnailUrl}
        seo={seo}
        onSeoChange={setSeo}
        videoId={videoId}
        title={title}
        composedDataUrl={composedThumbnailDataUrl}
        onComposedChange={setComposedThumbnailDataUrl}
        videoDurationSec={videoDuration}
      />


      {/* ── 4. PREVIEW ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          4. Preview
        </h3>

        {/* Diagnóstico do piscar — afecta só o preview, NÃO o render Shotstack. */}
        <div className="mb-3 rounded border border-escola-border/60 bg-black/20 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-escola-creme-50">
            Diagnóstico piscar (só preview)
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-escola-creme">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={trimEdges}
                onChange={(e) => setTrimEdges(e.target.checked)}
                disabled={previewing}
              />
              <span>Cortar 0.3s das pontas <span className="text-escola-creme-50">(testa frames-edge Runway)</span></span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hardCut}
                onChange={(e) => setHardCut(e.target.checked)}
              />
              <span>Cut duro <span className="text-escola-creme-50">(sem fade 75ms)</span></span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={loopSingleClip}
                onChange={(e) => setLoopSingleClip(e.target.checked)}
                disabled={previewing}
              />
              <span>Loop do 1º clip 4x <span className="text-escola-creme-50">(isola edge vs jump-cut)</span></span>
            </label>
          </div>
          <p className="mt-2 text-xs text-escola-creme-50">
            Se o piscar desaparece com <strong>Cortar 0.3s</strong> → são frames-edge dos clips Runway (aplicar ao render).<br />
            Se desaparece com <strong>Cut duro</strong> → é o fade CSS do preview (cosmético, render não é afectado).<br />
            Se desaparece com <strong>Loop 1 clip</strong> → o piscar vem do jump-cut entre clips diferentes (precisa crossfade maior ou reordenar grupos).
          </p>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded bg-black">
          <video
            ref={videoRefA}
            className={`absolute inset-0 h-full w-full object-cover ${hardCut ? "" : "transition-opacity duration-75"}`}
            style={{ opacity: activeBuffer === 0 ? 1 : 0 }}
            muted
            playsInline
            preload="auto"
            onEnded={() => { if (!trimEdges) advancePreview(0); }}
          />
          <video
            ref={videoRefB}
            className={`absolute inset-0 h-full w-full object-cover ${hardCut ? "" : "transition-opacity duration-75"}`}
            style={{ opacity: activeBuffer === 1 ? 1 : 0 }}
            muted
            playsInline
            preload="auto"
            onEnded={() => { if (!trimEdges) advancePreview(1); }}
          />

          {previewing && (
            <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 text-xs text-white">
              Clip {previewClipIndex + 1}/{previewClipUrls.length} —{" "}
              {Math.floor(previewTime / 60)}:
              {String(Math.floor(previewTime % 60)).padStart(2, "0")}
            </div>
          )}

          {!previewing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-escola-creme-50">
                {filledClips === 0
                  ? "Adiciona clips acima para ver o preview"
                  : `${filledClips} clips prontos — clica Play`}
              </p>
            </div>
          )}
        </div>

        {previewing && (
          <div className="mt-2 h-1.5 w-full rounded-full bg-escola-border">
            <div
              className="h-full rounded-full bg-escola-coral transition-all"
              style={{ width: `${(previewTime / videoDuration) * 100}%` }}
            />
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {!previewing ? (
            <button
              onClick={startPreview}
              disabled={filledClips === 0}
              className="rounded bg-escola-coral px-4 py-2 text-sm font-semibold text-white disabled:opacity-30"
            >
              ▶ Play
            </button>
          ) : (
            <>
              {paused ? (
                <button
                  onClick={resumePreview}
                  className="rounded bg-escola-coral px-4 py-2 text-sm font-semibold text-white"
                >
                  ▶ Continuar
                </button>
              ) : (
                <button
                  onClick={pausePreview}
                  className="rounded bg-yellow-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  ⏸ Pause
                </button>
              )}
              <button
                onClick={stopPreview}
                className="rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white"
              >
                ⏹ Parar
              </button>
            </>
          )}

          <button
            onClick={downloadProject}
            disabled={filledClips === 0}
            className="rounded border border-escola-border px-4 py-2 text-sm text-escola-creme hover:bg-escola-border/30 disabled:opacity-30"
          >
            Guardar projecto (.json)
          </button>
        </div>
      </section>

      {/* ── 5. RENDER MP4 ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          5. Gerar MP4
        </h3>

        <p className="mb-3 text-xs text-escola-creme-50">
          Os {filledClips} clips únicos serão repetidos pela ORDEM definida (sem baralhar) para preencher {Math.round(videoDuration / 60)} min ({totalClipsNeeded} clips × {CLIP_DURATION}s).
          O vídeo fica no Supabase assim que o render termina.
        </p>

        <div className="mb-3 rounded border border-escola-border/60 bg-black/20 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-escola-creme-50">
            Motor de render
          </p>
          <div className="flex flex-col gap-2 text-sm text-escola-creme sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={renderEngine === "ffmpeg"}
                onChange={() => setRenderEngine("ffmpeg")}
                disabled={rendering}
              />
              <span>
                FFmpeg <span className="text-green-400">(grátis, GitHub Actions)</span>
                <span className="ml-2 text-escola-creme-50">— xfade 1.5s + trim 0.3s, determinístico</span>
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={renderEngine === "shotstack"}
                onChange={() => setRenderEngine("shotstack")}
                disabled={rendering}
              />
              <span>
                Shotstack <span className="text-yellow-400">(pago, ~1 cr/min)</span>
                <span className="ml-2 text-escola-creme-50">— fallback</span>
              </span>
            </label>
          </div>
        </div>

        {rendering && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs text-escola-creme-50">
              <span>{renderLabel}</span>
              <span>{renderProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-escola-border">
              <div
                className="h-full rounded-full bg-escola-coral transition-all"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
            <button
              onClick={() => {
                if (!confirm("Destravar o render? Usa isto quando o workflow GitHub foi cancelado ou falhou mas a barra ficou parada. NÃO cancela o render em si — só desbloqueia a UI para poderes começar outro.")) return;
                localStorage.removeItem("yt-pending-ffmpeg-render");
                localStorage.removeItem("yt-pending-render");
                setRendering(false);
                setRenderProgress(0);
                setRenderLabel("");
                setRenderError(null);
              }}
              className="mt-2 text-xs text-escola-creme-50 hover:text-red-300 underline decoration-dotted"
              title="Limpa o estado local. Usa só se o render travou ou foi cancelado no GitHub."
            >
              Destravar render / cancelar polling
            </button>
          </div>
        )}

        {renderError && (
          <div className="mb-3 rounded bg-red-950/50 p-2 text-xs text-red-300">
            Erro: {renderError}
          </div>
        )}

        {renderResult && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between rounded bg-green-950/50 p-2 text-xs text-green-300">
              <span>{renderLabel || "Vídeo pronto!"}</span>
              <button
                onClick={() => {
                  localStorage.removeItem("yt-last-ffmpeg-render");
                  setRenderResult(null);
                  setRenderLabel("");
                }}
                className="text-green-400/60 hover:text-green-200"
                title="Esconder (não apaga o ficheiro do Supabase)"
              >
                ✕ esconder
              </button>
            </div>
            <video
              src={renderResult}
              controls
              className="w-full rounded"
            />
            <a
              href={renderResult}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded bg-escola-coral px-4 py-2 text-sm font-semibold text-white"
            >
              Abrir / Descarregar MP4
            </a>
          </div>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-escola-creme-50">Duração:</label>
            <select
              value={videoDuration}
              onChange={(e) => setVideoDuration(Number(e.target.value))}
              disabled={rendering}
              className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme disabled:opacity-50"
            >
              {DURATION_PRESETS.map((p) => {
                const mins = p.seconds / 60;
                const durLabel = mins < 60 ? `${mins} min` : `${mins / 60} h`;
                const costLabel = renderEngine === "ffmpeg"
                  ? "grátis"
                  : `${p.credits} créditos`;
                return (
                  <option key={p.seconds} value={p.seconds}>
                    {durLabel} · {costLabel}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-escola-creme-50">Fade-out:</label>
            <select
              value={fadeOut}
              onChange={(e) => setFadeOut(Number(e.target.value))}
              disabled={rendering}
              className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme disabled:opacity-50"
              title="Fade do vídeo para preto + áudio para silêncio no fim. 0 = corte seco (mais rápido). >0 = re-encoda o final, ~15min extra para 1h."
            >
              <option value={0}>0s (corte seco · rápido)</option>
              <option value={2}>2s (subtil)</option>
              <option value={3}>3s (recomendado)</option>
              <option value={5}>5s (longo)</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-escola-creme-50" title={`Prepend do clip ${AG_INTRO_DURATION}s Ancient Ground. Música sobe de 20% → 100% durante o intro.`}>
            <input
              type="checkbox"
              checked={useIntro}
              onChange={(e) => setUseIntro(e.target.checked)}
              disabled={rendering}
            />
            <span>Intro AG <span className="text-escola-creme/80">({AG_INTRO_DURATION}s)</span></span>
          </label>
        </div>

        <button
          onClick={renderEngine === "ffmpeg" ? startFfmpegRender : startRender}
          disabled={filledClips === 0 || rendering}
          className="rounded bg-escola-coral px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-30"
        >
          {rendering
            ? "A renderizar..."
            : `Gerar MP4 de ${Math.round(videoDuration / 60)} min (${filledClips} clips únicos${renderEngine === "ffmpeg" ? " — FFmpeg grátis" : ` → ${totalClipsNeeded} total · Shotstack`})`}
        </button>
      </section>

      {/* ── 6. UPLOAD MANUAL DO MP4 (drag-and-drop) ── */}
      <UploadMp4Section
        title={title}
        thumbnailUrl={composedThumbnailDataUrl || thumbnailUrl}
        seo={seo}
      />
    </div>
  );
}

// ── Upload MP4 drag-and-drop ─────────────────────────────────────────────────

function UploadMp4Section({
  title,
  thumbnailUrl,
  seo,
}: {
  title: string;
  thumbnailUrl: string;
  seo: SeoMeta;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ videoUrl: string; thumbnailUrl: string | null; seoUrl: string | null; filename: string } | null>(null);
  const [error, setError] = useState<string>("");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Só ficheiros de vídeo.");
      return;
    }
    if (!title.trim()) {
      setError("Escolhe um vídeo em cima (secção 1) — o nome do ficheiro será derivado do título.");
      return;
    }

    setError("");
    setResult(null);
    setUploading(true);
    setProgress(0);

    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    if (thumbnailUrl) form.append("thumbnailUrl", thumbnailUrl);
    if (seo) form.append("seo", JSON.stringify(seo));

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/youtube/upload-mp4");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        setUploading(false);
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status !== 200) { setError(data.erro || `HTTP ${xhr.status}`); return; }
          setResult(data);
          setProgress(100);
        } catch {
          setError("Resposta invalida do servidor.");
        }
      };
      xhr.onerror = () => { setUploading(false); setError("Erro de rede."); };
      xhr.send(form);
    } catch (err) {
      setUploading(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
        6. Guardar MP4 já renderizado (drag-and-drop)
      </h3>
      <p className="mb-3 text-xs text-escola-creme-50">
        Arrasta aqui o MP4 que já descarregaste do Shotstack. Vou renomear para{" "}
        <code className="rounded bg-black/40 px-1">{(title || "youtube").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}-&lt;timestamp&gt;.mp4</code>{" "}
        e guardar no Supabase (youtube/videos/) junto com a thumbnail composta e o SEO.
      </p>

      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex aspect-[5/1] w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-sm transition ${
          dragging ? "border-escola-coral bg-escola-coral/10 text-escola-coral" : "border-escola-border text-escola-creme-50 hover:border-escola-coral/60"
        }`}
      >
        <input
          type="file"
          accept="video/mp4,video/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {dragging ? "Larga aqui o MP4..." : "Arrasta ou clica para escolher o MP4"}
      </label>

      {uploading && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-escola-creme-50">
            <span>A enviar para Supabase...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-escola-border">
            <div className="h-full rounded-full bg-escola-coral transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && <div className="mt-3 rounded bg-red-950/50 p-2 text-xs text-red-300">Erro: {error}</div>}

      {result && (
        <div className="mt-3 space-y-2 rounded bg-green-950/50 p-3 text-xs text-green-300">
          <p>Guardado como <code className="rounded bg-black/40 px-1">{result.filename}</code></p>
          <div className="flex flex-wrap gap-2">
            <a href={result.videoUrl} target="_blank" rel="noopener noreferrer" className="rounded bg-escola-coral px-3 py-1 font-semibold text-white">
              Abrir vídeo
            </a>
            {result.thumbnailUrl && (
              <a href={result.thumbnailUrl} target="_blank" rel="noopener noreferrer" className="rounded border border-escola-border px-3 py-1 text-escola-creme hover:bg-escola-border/30">
                Thumbnail
              </a>
            )}
            {result.seoUrl && (
              <a href={result.seoUrl} target="_blank" rel="noopener noreferrer" className="rounded border border-escola-border px-3 py-1 text-escola-creme hover:bg-escola-border/30">
                SEO JSON
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ── SEO + Thumbnail composer ─────────────────────────────────────────────────

type ImageItem = { name: string; url: string; promptId: string };

const THUMB_W = 1280;
const THUMB_H = 720;

// Compose a YouTube thumbnail (1280x720) on canvas:
// background image (cover) + bottom gradient + title (DM Serif) + tagline.
async function composeThumbnail(
  imageUrl: string,
  title: string,
  tagline: string,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = THUMB_W;
  canvas.height = THUMB_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Load image (CORS so we can export the canvas).
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = (e) => reject(e);
    i.src = imageUrl;
  });

  // Cover-fit the image to 1280x720.
  const imgRatio = img.width / img.height;
  const targetRatio = THUMB_W / THUMB_H;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (imgRatio > targetRatio) {
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, THUMB_W, THUMB_H);

  // Bottom gradient overlay for legibility.
  const grad = ctx.createLinearGradient(0, THUMB_H * 0.45, 0, THUMB_H);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, THUMB_W, THUMB_H);

  // Title: large, white, with shadow. Wrap to 2 lines max.
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 96px "DM Serif Display", "Times New Roman", serif`;
  ctx.textBaseline = "alphabetic";
  const padX = 64;
  const maxW = THUMB_W - padX * 2;
  const lines = wrapText(ctx, title, maxW, 2);
  let y = THUMB_H - 80 - (lines.length - 1) * 100;
  for (const line of lines) {
    ctx.fillText(line, padX, y);
    y += 100;
  }

  // Tagline (smaller, coral).
  if (tagline) {
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#E94560";
    ctx.font = `600 36px "Nunito", system-ui, sans-serif`;
    ctx.fillText(tagline, padX, THUMB_H - 28);
  }

  return canvas.toDataURL("image/png");
}

// Wrap text to up to maxLines, ellipsis the last line if it overflows.
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const tryLine = line ? `${line} ${w}` : w;
    if (ctx.measureText(tryLine).width > maxWidth) {
      if (line) lines.push(line);
      line = w;
      if (lines.length >= maxLines - 1) break;
    } else {
      line = tryLine;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length >= maxLines && words.length > lines.flatMap((l) => l.split(" ")).length) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(last + "…").width > maxWidth && last.length > 0) last = last.slice(0, -1);
    lines[maxLines - 1] = last + "…";
  }
  return lines;
}

function SeoComposerSection({
  thumbnailUrl,
  onSelect,
  seo,
  onSeoChange,
  videoId,
  title,
  composedDataUrl,
  onComposedChange,
  videoDurationSec,
}: {
  thumbnailUrl: string;
  onSelect: (url: string) => void;
  seo: SeoMeta;
  onSeoChange: (s: SeoMeta) => void;
  videoId: string;
  title: string;
  composedDataUrl: string;
  onComposedChange: (dataUrl: string) => void;
  videoDurationSec: number;
}) {
  const [composing, setComposing] = useState(false);
  const [composeError, setComposeError] = useState<string>("");

  // Re-compose when image, title, or tagline changes.
  useEffect(() => {
    if (!thumbnailUrl || !seo.thumbnailTitle.trim()) {
      onComposedChange("");
      return;
    }
    let cancelled = false;
    setComposing(true);
    setComposeError("");
    composeThumbnail(thumbnailUrl, seo.thumbnailTitle, "music.seteveus.space")
      .then((dataUrl) => { if (!cancelled) onComposedChange(dataUrl); })
      .catch((e) => { if (!cancelled) setComposeError(e?.message || "Erro a compor (CORS na imagem?)"); })
      .finally(() => { if (!cancelled) setComposing(false); });
    return () => { cancelled = true; };
  }, [thumbnailUrl, seo.thumbnailTitle, onComposedChange]);

  const downloadComposed = () => {
    if (!composedDataUrl) return;
    const a = document.createElement("a");
    a.href = composedDataUrl;
    a.download = `thumbnail-${videoId || "youtube"}.png`;
    a.click();
  };

  const refillFromMetadata = () => {
    // Resolve plan via videoId OR title (legacy state may lack videoId).
    const plans = videoPlan as Array<{id: string; titulo: string; categorias: string[]}>;
    const plan =
      plans.find((v) => v.id === videoId) ||
      plans.find((v) => v.titulo === title);
    if (!plan) {
      alert("Escolhe um vídeo em cima (secção 1) antes de gerar SEO.");
      return;
    }
    const durationMin = Math.round(videoDurationSec / 60);
    onSeoChange(seoFromMetadata(plan.id, plan.titulo, plan.categorias, durationMin));
  };

  const updateSeo = (patch: Partial<SeoMeta>) => onSeoChange({ ...seo, ...patch });

  return (
    <>
      {/* 3B — Picker da imagem base */}
      <ThumbnailSection thumbnailUrl={thumbnailUrl} onSelect={onSelect} />

      {/* 3C — SEO + Thumbnail composer */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
            3C. SEO + Thumbnail YouTube
          </h3>
          <button
            onClick={refillFromMetadata}
            disabled={!videoId && !title}
            className="text-xs text-escola-creme-50 hover:text-escola-creme disabled:opacity-30"
          >
            Gerar proposta SEO
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Esquerda: campos editáveis */}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-escola-creme-50">
                Título da thumbnail (curto, 2-4 palavras)
              </label>
              <input
                type="text"
                value={seo.thumbnailTitle}
                onChange={(e) => updateSeo({ thumbnailTitle: e.target.value })}
                placeholder="Oceano Índico"
                className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-escola-creme-50">
                Título do post YouTube (SEO completo)
              </label>
              <input
                type="text"
                value={seo.postTitle}
                onChange={(e) => updateSeo({ postTitle: e.target.value })}
                placeholder="🌊 Indian Ocean Mozambique — 10 Min Relaxing..."
                className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
              />
              <p className="mt-1 text-xs text-escola-creme-50">{seo.postTitle.length}/100 chars</p>
            </div>
            <div>
              <label className="mb-1 block text-xs text-escola-creme-50">Descrição</label>
              <textarea
                value={seo.description}
                onChange={(e) => updateSeo({ description: e.target.value })}
                rows={6}
                className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
              />
              <p className="mt-1 text-xs text-escola-creme-50">{seo.description.length} chars</p>
            </div>
            <div>
              <label className="mb-1 block text-xs text-escola-creme-50">
                Hashtags (uma por linha ou separadas por espaço)
              </label>
              <textarea
                value={seo.hashtags.join(" ")}
                onChange={(e) =>
                  updateSeo({
                    hashtags: e.target.value
                      .split(/\s+/)
                      .map((h) => h.trim())
                      .filter((h) => h.startsWith("#")),
                  })
                }
                rows={3}
                className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-xs text-escola-creme"
              />
              <p className="mt-1 text-xs text-escola-creme-50">{seo.hashtags.length} hashtags</p>
            </div>
          </div>

          {/* Direita: preview da thumbnail composta */}
          <div className="space-y-2">
            <p className="text-xs text-escola-creme-50">Preview thumbnail YouTube (1280×720)</p>
            <div className="relative aspect-video w-full overflow-hidden rounded border border-escola-border bg-black">
              {composedDataUrl ? (
                <img src={composedDataUrl} alt="Thumbnail composta" className="h-full w-full object-cover" />
              ) : thumbnailUrl ? (
                <div className="flex h-full w-full items-center justify-center text-xs text-escola-creme-50">
                  {composing ? "A compor..." : "Escreve um título para gerar"}
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-escola-creme-50">
                  Escolhe uma imagem em 3B
                </div>
              )}
            </div>
            {composeError && (
              <p className="text-xs text-red-400">{composeError}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadComposed}
                disabled={!composedDataUrl}
                className="rounded bg-escola-coral px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30"
              >
                Descarregar PNG
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(seo.postTitle)}
                disabled={!seo.postTitle}
                className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:bg-escola-border/30 disabled:opacity-30"
              >
                Copiar título
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(`${seo.description}\n\n${seo.hashtags.join(" ")}`)}
                disabled={!seo.description}
                className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:bg-escola-border/30 disabled:opacity-30"
              >
                Copiar descrição + hashtags
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ThumbnailSection({
  thumbnailUrl,
  onSelect,
}: {
  thumbnailUrl: string;
  onSelect: (url: string) => void;
}) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const [expanded, setExpanded] = useState(false);

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/thinkdiffusion/list-images");
      const data = await r.json();
      const onlyH = (data.images || []).filter((i: ImageItem) =>
        i.name.match(/-h-\d+\.\w+$/i)
      );
      onlyH.sort((a: ImageItem, b: ImageItem) => a.name.localeCompare(b.name));
      setImages(onlyH);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (expanded && images.length === 0) loadImages();
  }, [expanded, images.length, loadImages]);

  const uniquePromptIds = Array.from(new Set(images.map((i) => i.promptId))).sort();
  const filtered = filter ? images.filter((i) => i.promptId === filter) : images;

  return (
    <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-escola-coral">
          3B. Thumbnail YouTube
        </h3>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-escola-creme-50 hover:text-escola-creme"
        >
          {expanded ? "Fechar" : "Escolher imagem"}
        </button>
      </div>

      {thumbnailUrl && (
        <div className="mt-3 flex items-start gap-3">
          <div className="relative aspect-video w-40 overflow-hidden rounded border border-escola-coral">
            <img src={thumbnailUrl} alt="Thumbnail" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xs text-escola-creme">Thumbnail selecionada</p>
            <p className="text-xs text-escola-creme-50 break-all">{fileNameFromUrl(thumbnailUrl)}</p>
            <button
              onClick={() => onSelect("")}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remover
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
            >
              <option value="">Todos ({images.length})</option>
              {uniquePromptIds.map((pid) => (
                <option key={pid} value={pid}>{pid}</option>
              ))}
            </select>
            <button
              onClick={loadImages}
              className="text-xs text-escola-creme-50 hover:text-escola-creme"
            >
              {loading ? "A carregar..." : "Recarregar"}
            </button>
          </div>

          <div className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-6">
            {filtered.map((img) => (
              <button
                key={img.url}
                onClick={() => { onSelect(img.url); setExpanded(false); }}
                className={`relative aspect-video overflow-hidden rounded border transition ${
                  thumbnailUrl === img.url
                    ? "border-escola-coral ring-2 ring-escola-coral"
                    : "border-escola-border hover:border-escola-coral/60"
                }`}
              >
                <img src={img.url} alt={img.name} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
          {filtered.length === 0 && !loading && (
            <p className="text-xs text-escola-creme-50">Sem imagens.</p>
          )}
        </div>
      )}
    </section>
  );
}
