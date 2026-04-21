"use client";

import { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import * as htmlToImage from "html-to-image";
import runwayMotionPrompts from "@/data/runway-motion-prompts.json";

const MOTION_PROMPTS = runwayMotionPrompts as Record<string, string>;

// ── Types ─────────────────────────────────────────────────────────────────────

type ImageItem = {
  name: string;
  url: string;
  promptId: string;
};

type MusicTrack = {
  name: string;
  url: string;
  sizeMB: number | null;
};

type AlbumItem = {
  slug: string;
  trackCount: number;
};

type SlotState = {
  imageUrl: string;
  promptId: string;
  motionPrompt: string;
  clipUrl: string;
  generating: boolean;
  error: string;
};

type ShortsState = {
  title: string;
  slots: SlotState[];
  album: string;
  trackUrl: string;
  trackName: string;
  theme: string;
  verses: [string, string];
  candidates: string[];
  albumTitle: string;
  trackTitle: string;
  tiktokCaption: string;
  youtubeTitle: string;
  youtubeDescription: string;
  thumbSlotIndex: number;
  thumbText: string;
  thumbnailUrl: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const CLIP_DURATION = 10;
const NUM_SLOTS = 3;

function motionForPromptId(promptId: string): string {
  return MOTION_PROMPTS[promptId] || "";
}

const EMPTY_SLOT: SlotState = {
  imageUrl: "",
  promptId: "",
  motionPrompt: "",
  clipUrl: "",
  generating: false,
  error: "",
};

const EMPTY_STATE: ShortsState = {
  title: "",
  slots: Array.from({ length: NUM_SLOTS }, () => ({ ...EMPTY_SLOT })),
  album: "",
  trackUrl: "",
  trackName: "",
  theme: "",
  verses: ["", ""],
  candidates: [],
  albumTitle: "",
  trackTitle: "",
  tiktokCaption: "",
  youtubeTitle: "",
  youtubeDescription: "",
  thumbSlotIndex: 0,
  thumbText: "",
  thumbnailUrl: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isVerticalImage(url: string): boolean {
  return url.includes("/vertical/") || /-v-\d+\./.test(url);
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignore */
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ShortsPage() {
  const [state, setState] = useState<ShortsState>(EMPTY_STATE);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [imageQuery, setImageQuery] = useState("");
  const [loadingImages, setLoadingImages] = useState(false);

  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);

  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [trackQuery, setTrackQuery] = useState("");
  const [loadingTracks, setLoadingTracks] = useState(false);

  const [suggesting, setSuggesting] = useState(false);

  const [engine, setEngine] = useState<"ffmpeg" | "shotstack">("ffmpeg");
  const overlay1Ref = useRef<HTMLDivElement>(null);
  const overlay2Ref = useRef<HTMLDivElement>(null);

  // Carrega Montserrat 800 uma vez para os overlays PNG ficarem bold de verdade
  useEffect(() => {
    const id = "montserrat-800-overlay";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&display=swap";
    document.head.appendChild(link);
  }, []);

  const [thumbnailing, setThumbnailing] = useState(false);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderLabel, setRenderLabel] = useState("");
  const [renderResult, setRenderResult] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Load persisted state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shorts-state");
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<ShortsState>;
        setState((prev) => ({
          ...prev,
          ...parsed,
          slots: parsed.slots
            ? parsed.slots.map((s) => ({ ...s, generating: false }))
            : prev.slots,
        }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const updateState = useCallback((patch: Partial<ShortsState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem("shorts-state", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // Load images
  useEffect(() => {
    setLoadingImages(true);
    fetch("/api/admin/thinkdiffusion/list-images")
      .then((r) => r.json())
      .then((data) => {
        const all: ImageItem[] = data.images || [];
        setImages(all.filter((im) => isVerticalImage(im.url)));
      })
      .catch(() => {})
      .finally(() => setLoadingImages(false));
  }, []);

  // Load albums
  useEffect(() => {
    setLoadingAlbums(true);
    fetch("/api/admin/music/list-albums")
      .then((r) => r.json())
      .then((data) => setAlbums(data.albums || []))
      .catch(() => {})
      .finally(() => setLoadingAlbums(false));
  }, []);

  // Load tracks when album changes
  useEffect(() => {
    if (!state.album) {
      setTracks([]);
      return;
    }
    setLoadingTracks(true);
    fetch(`/api/admin/music/list-album?album=${encodeURIComponent(state.album)}`)
      .then((r) => r.json())
      .then((data) => setTracks(data.tracks || []))
      .catch(() => {})
      .finally(() => setLoadingTracks(false));
  }, [state.album]);

  const filteredImages = imageQuery.trim()
    ? images.filter((im) => {
        const q = imageQuery.toLowerCase();
        return (
          im.name.toLowerCase().includes(q) ||
          im.promptId.toLowerCase().includes(q)
        );
      })
    : images.slice(0, 60);

  const filteredTracks = trackQuery.trim()
    ? tracks.filter((t) =>
        t.name.toLowerCase().includes(trackQuery.toLowerCase()),
      )
    : tracks;

  const updateSlot = (slotIdx: number, patch: Partial<SlotState>) => {
    setState((prev) => {
      const next = {
        ...prev,
        slots: prev.slots.map((s, i) => (i === slotIdx ? { ...s, ...patch } : s)),
      };
      try {
        localStorage.setItem("shorts-state", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const setSlotImage = (slotIdx: number, image: ImageItem) => {
    const existing = state.slots[slotIdx].motionPrompt;
    const fromLibrary = motionForPromptId(image.promptId);
    updateSlot(slotIdx, {
      imageUrl: image.url,
      promptId: image.promptId,
      // prefer the exact motion prompt from the YouTube library;
      // only keep the user's edit if the slot already had the same imageUrl
      motionPrompt: fromLibrary || existing,
      clipUrl: "",
      error: "",
    });
  };

  const clearSlot = (slotIdx: number) => {
    updateSlot(slotIdx, { ...EMPTY_SLOT });
  };

  // ── Animate ONE slot (Runway) ───────────────────────────────────────────────

  const animateSlot = async (slotIdx: number) => {
    const slot = state.slots[slotIdx];
    if (!slot.imageUrl) return;

    updateSlot(slotIdx, { generating: true, error: "", clipUrl: "" });
    try {
      const motionPrompt = slot.motionPrompt || motionForPromptId(slot.promptId);
      if (!motionPrompt.trim()) {
        throw new Error(
          "Sem motion prompt para esta imagem — acrescenta um prompt ao runway-motion-prompts.json ou escreve na caixa.",
        );
      }
      const res = await fetch("/api/admin/shorts/animate-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: slot.imageUrl,
          motionPrompt,
          label: slot.promptId,
          durationSec: CLIP_DURATION,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.erro) {
        throw new Error(data.erro || `HTTP ${res.status}`);
      }
      updateSlot(slotIdx, { clipUrl: data.url, generating: false });
    } catch (err) {
      updateSlot(slotIdx, {
        generating: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  // ── Suggest verses + captions ───────────────────────────────────────────────

  const suggest = async () => {
    if (!state.album || !state.trackName) {
      alert("Escolhe álbum e faixa primeiro.");
      return;
    }
    setSuggesting(true);
    try {
      const res = await fetch("/api/admin/shorts/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumSlug: state.album,
          trackName: state.trackName,
          theme: state.theme,
        }),
      });
      const data = await res.json();
      if (data.erro) throw new Error(data.erro);
      updateState({
        verses: [data.verses?.[0] || "", data.verses?.[1] || ""],
        candidates: Array.isArray(data.candidates) ? data.candidates : [],
        albumTitle: data.albumTitle || "",
        trackTitle: data.trackTitle || "",
        tiktokCaption: data.tiktokCaption || "",
        youtubeTitle: data.youtubeTitle || "",
        youtubeDescription: data.youtubeDescription || "",
      });
    } catch (err) {
      alert(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSuggesting(false);
    }
  };

  // ── Generate thumbnail (Shotstack JPG) ──────────────────────────────────────

  const generateThumbnail = async () => {
    const slot = state.slots[state.thumbSlotIndex];
    if (!slot?.imageUrl) {
      alert("Escolhe um slot com imagem primeiro.");
      return;
    }
    setThumbnailing(true);
    setThumbnailError(null);
    try {
      const text = state.thumbText.trim() || state.verses[0] || "";
      const res = await fetch("/api/admin/shorts/render-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: slot.imageUrl,
          text,
          title: state.title || state.trackName.replace(/\.[^.]+$/, "") || slot.promptId,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.erro) throw new Error(data.erro || `HTTP ${res.status}`);
      updateState({ thumbnailUrl: data.url });
    } catch (err) {
      setThumbnailError(err instanceof Error ? err.message : String(err));
    } finally {
      setThumbnailing(false);
    }
  };

  // ── Render final MP4 (SSE) ──────────────────────────────────────────────────

  const allClipsReady = state.slots.every((s) => s.imageUrl && s.clipUrl);
  const anyGenerating = state.slots.some((s) => s.generating);

  const startRender = async () => {
    if (!allClipsReady) {
      alert("Gera os 3 clips Runway primeiro.");
      return;
    }
    if (!state.trackUrl) {
      alert("Escolhe uma faixa primeiro.");
      return;
    }
    setRendering(true);
    setRenderProgress(0);
    setRenderLabel("A iniciar...");
    setRenderResult(null);
    setRenderError(null);

    try {
      const baseBody = {
        title: state.title || state.trackName.replace(/\.[^.]+$/, ""),
        clips: state.slots.map((s) => s.clipUrl),
        clipDuration: CLIP_DURATION,
        musicUrl: state.trackUrl,
        musicVolume: 0.9,
      };

      if (engine === "ffmpeg") {
        // FFmpeg em GitHub Actions — mesmo padrão do Ancient Ground.
        // Submit → workflow_dispatch → polling do result.json em Supabase.
        setRenderLabel("A desenhar overlays...");
        const [png1, png2] = await Promise.all([
          overlay1Ref.current
            ? htmlToImage.toPng(overlay1Ref.current, {
                pixelRatio: 1,
                cacheBust: true,
                backgroundColor: undefined,
              })
            : Promise.resolve(""),
          overlay2Ref.current
            ? htmlToImage.toPng(overlay2Ref.current, {
                pixelRatio: 1,
                cacheBust: true,
                backgroundColor: undefined,
              })
            : Promise.resolve(""),
        ]);

        setRenderLabel("A despachar GitHub Actions...");
        const submitRes = await fetch("/api/admin/shorts/render-short-submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...baseBody, overlayPngs: [png1, png2] }),
        });
        const submitData = await submitRes.json();
        if (!submitRes.ok || !submitData.jobId) {
          throw new Error(submitData.erro || `HTTP ${submitRes.status}`);
        }

        // Polling do result.json em Supabase
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
            const r = await fetch(`/api/admin/shorts/render-short-status?jobId=${encodeURIComponent(submitData.jobId)}`);
            data = await r.json();
          } catch {
            setRenderLabel("Ligação perdida — a tentar de novo...");
            continue;
          }
          if (data.erro) throw new Error(data.erro);
          const status = data.status || "...";
          const phase = data.phase ? ` (${data.phase})` : "";
          setRenderLabel(`${status}${phase}`);
          if (typeof data.progress === "number") setRenderProgress(data.progress);
          if (status === "failed") {
            throw new Error(data.error || "FFmpeg render failed.");
          }
          if (status === "done" && data.videoUrl) {
            setRenderResult(data.videoUrl);
            setRenderProgress(100);
            setRenderLabel("Short pronto!");
            break;
          }
        }
      } else {
        // Shotstack (fallback) — mantém SSE stream original.
        const endpoint = "/api/admin/shorts/render";
        const body = { ...baseBody, verses: state.verses };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ erro: `HTTP ${res.status}` }));
          throw new Error(err.erro || `HTTP ${res.status}`);
        }
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
              const ev = JSON.parse(line.slice(6));
              if (ev.type === "progress") {
                setRenderProgress(ev.percent);
                setRenderLabel(ev.label);
              } else if (ev.type === "result") {
                setRenderResult(ev.videoUrl);
                setRenderLabel("Short pronto!");
                setRenderProgress(100);
              } else if (ev.type === "error") {
                throw new Error(ev.message);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : String(err));
    } finally {
      setRendering(false);
    }
  };

  // ── View ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-escola-creme">
          Shorts · TikTok & YouTube (30s vertical)
        </h2>
        <button
          onClick={() => {
            if (!confirm("Limpar tudo e começar de novo?")) return;
            localStorage.removeItem("shorts-state");
            setState(EMPTY_STATE);
          }}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Limpar
        </button>
      </div>

      {/* ── 1. IMAGENS VERTICAIS ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          1. Escolhe 3 imagens verticais em sequência
        </h3>

        <input
          type="text"
          value={imageQuery}
          onChange={(e) => setImageQuery(e.target.value)}
          placeholder="Pesquisa (ex: mar, praia, veu, floresta...)"
          className="mb-3 w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
        />

        <div className="mb-3 flex gap-2">
          {state.slots.map((slot, i) => (
            <div
              key={i}
              className="relative aspect-[9/16] w-24 overflow-hidden rounded border border-escola-border bg-escola-bg"
            >
              {slot.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slot.imageUrl} alt="" className="h-full w-full object-cover" />
                  <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <button
                    onClick={() => clearSlot(i)}
                    className="absolute right-1 top-1 rounded bg-black/70 px-1.5 text-xs text-red-300 hover:text-red-100"
                  >
                    ×
                  </button>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-escola-creme-50">
                  #{i + 1}
                </div>
              )}
            </div>
          ))}
        </div>

        {loadingImages ? (
          <p className="text-xs text-escola-creme-50">A carregar imagens...</p>
        ) : (
          <div className="max-h-96 overflow-y-auto rounded border border-escola-border bg-escola-bg p-2">
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {filteredImages.map((im) => {
                const nextSlot = state.slots.findIndex((s) => !s.imageUrl);
                const disabled = nextSlot === -1;
                return (
                  <button
                    key={im.url}
                    onClick={() => !disabled && setSlotImage(nextSlot, im)}
                    disabled={disabled}
                    className="group relative aspect-[9/16] overflow-hidden rounded border border-escola-border hover:border-escola-coral disabled:opacity-30"
                    title={im.promptId}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={im.url} alt="" className="h-full w-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1 text-[10px] text-white">
                      {im.promptId}
                    </span>
                  </button>
                );
              })}
            </div>
            {filteredImages.length === 0 && (
              <p className="py-6 text-center text-xs text-escola-creme-50">
                Sem resultados. Muda a pesquisa.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ── 2. MOTION RUNWAY — 1 A 1 ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          2. Motion Runway (9:16 · {CLIP_DURATION}s) — gera 1 a 1, revê, regenera
        </h3>

        <div className="grid gap-3 sm:grid-cols-3">
          {state.slots.map((slot, i) => (
            <div
              key={i}
              className="space-y-2 rounded border border-escola-border bg-escola-bg p-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-escola-coral">#{i + 1}</span>
                <span className="truncate text-xs text-escola-creme-50">
                  {slot.promptId || "—"}
                </span>
              </div>
              <div className="relative aspect-[9/16] overflow-hidden rounded border border-escola-border">
                {slot.clipUrl ? (
                  <video
                    src={slot.clipUrl}
                    className="h-full w-full object-cover"
                    controls
                    muted
                    loop
                    playsInline
                  />
                ) : slot.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={slot.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-escola-creme-50">
                    sem imagem
                  </div>
                )}
                {slot.generating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">
                    A gerar...
                  </div>
                )}
              </div>
              <textarea
                value={slot.motionPrompt}
                onChange={(e) =>
                  updateSlot(i, { motionPrompt: e.target.value })
                }
                rows={3}
                placeholder={
                  slot.promptId
                    ? "Sem motion prompt para este id em runway-motion-prompts.json"
                    : "Escolhe imagem primeiro — motion prompt vem da biblioteca YouTube"
                }
                className="w-full rounded border border-escola-border bg-escola-bg-card px-2 py-1 text-xs text-escola-creme"
              />
              {slot.imageUrl && !motionForPromptId(slot.promptId) && !slot.motionPrompt && (
                <p className="text-[10px] text-amber-300">
                  Sem motion prompt definido para <code>{slot.promptId}</code>.
                </p>
              )}
              <button
                onClick={() => animateSlot(i)}
                disabled={!slot.imageUrl || slot.generating}
                className="w-full rounded bg-escola-coral px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30"
              >
                {slot.generating
                  ? "A gerar..."
                  : slot.clipUrl
                    ? "Regenerar motion"
                    : "Gerar motion"}
              </button>
              {slot.error && (
                <p className="break-words text-[10px] text-red-300">{slot.error}</p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-escola-creme-50">
          Runway demora ~1–3 min por clip. Podes gerar em paralelo (botão em cada).
        </p>
      </section>

      {/* ── 3. MUSICA LORANNE — ÁLBUM SELECCIONÁVEL ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          3. Música — escolhe álbum e faixa
        </h3>

        <div className="mb-3">
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
            Álbum
          </label>
          {loadingAlbums ? (
            <p className="text-xs text-escola-creme-50">A carregar álbuns...</p>
          ) : (
            <select
              value={state.album}
              onChange={(e) =>
                updateState({
                  album: e.target.value,
                  trackUrl: "",
                  trackName: "",
                })
              }
              className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
            >
              <option value="">— escolhe álbum —</option>
              {albums.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.slug} ({a.trackCount})
                </option>
              ))}
            </select>
          )}
        </div>

        {state.album && (
          <>
            <input
              type="text"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              placeholder="Pesquisa faixa (ex: faixa-17)"
              className="mb-3 w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
            />

            {loadingTracks ? (
              <p className="text-xs text-escola-creme-50">A carregar faixas...</p>
            ) : (
              <div className="max-h-72 overflow-y-auto rounded border border-escola-border bg-escola-bg">
                {filteredTracks.map((t) => {
                  const selected = state.trackUrl === t.url;
                  return (
                    <div
                      key={t.url}
                      className={`flex items-center gap-2 border-b border-escola-border/30 p-2 last:border-0 ${
                        selected ? "bg-escola-coral/10" : ""
                      }`}
                    >
                      <button
                        onClick={() =>
                          updateState({ trackUrl: t.url, trackName: t.name })
                        }
                        className={`w-24 shrink-0 rounded px-2 py-1 text-xs font-semibold ${
                          selected
                            ? "bg-escola-coral text-white"
                            : "border border-escola-border text-escola-creme hover:bg-escola-border/30"
                        }`}
                      >
                        {selected ? "Escolhida" : "Escolher"}
                      </button>
                      <span className="w-28 shrink-0 truncate text-xs text-escola-creme">
                        {t.name}
                      </span>
                      <audio src={t.url} controls className="h-8 flex-1" preload="none" />
                    </div>
                  );
                })}
                {filteredTracks.length === 0 && (
                  <p className="py-6 text-center text-xs text-escola-creme-50">
                    Sem resultados.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* ── 4. FRASES INSPIRADORAS (letra Loranne) ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          4. Frases inspiradoras · baseadas na letra
        </h3>

        {state.trackTitle ? (
          <p className="mb-3 text-xs text-escola-creme-50">
            <span className="text-escola-creme">{state.trackTitle}</span>
            {state.albumTitle ? ` · ${state.albumTitle}` : ""}
          </p>
        ) : (
          <p className="mb-3 text-xs text-escola-creme-50">
            Clica em &quot;Sugerir&quot; para extrair da letra da faixa escolhida em #3.
          </p>
        )}

        <div className="mb-3 flex items-center gap-2">
          <input
            type="text"
            value={state.theme}
            onChange={(e) => updateState({ theme: e.target.value })}
            placeholder="Tema (opcional · ex: véus, coragem, raiz)"
            className="flex-1 rounded border border-escola-border bg-escola-bg px-3 py-1.5 text-xs text-escola-creme"
          />
          <button
            onClick={suggest}
            disabled={suggesting || !state.album || !state.trackName}
            className="rounded bg-escola-coral px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-30"
          >
            {suggesting ? "..." : "Sugerir frases + legendas"}
          </button>
        </div>

        {state.candidates.length > 0 && (
          <details className="mb-3 rounded border border-escola-border bg-escola-bg px-3 py-2">
            <summary className="cursor-pointer text-[10px] uppercase tracking-wider text-escola-creme-50">
              Outras candidatas extraídas ({state.candidates.length})
            </summary>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {state.candidates.map((c, i) => (
                <div
                  key={`${i}-${c}`}
                  className="group flex items-stretch overflow-hidden rounded border border-escola-border bg-escola-bg-card"
                >
                  <span className="max-w-[400px] truncate px-2 py-1 text-xs text-escola-creme">
                    {c}
                  </span>
                  <button
                    onClick={() => updateState({ verses: [c, state.verses[1]] })}
                    className="border-l border-escola-border px-2 py-1 text-[10px] text-escola-coral hover:bg-escola-border/30"
                    title="Enviar para Frase 1"
                  >
                    → 1
                  </button>
                  <button
                    onClick={() => updateState({ verses: [state.verses[0], c] })}
                    className="border-l border-escola-border px-2 py-1 text-[10px] text-escola-coral hover:bg-escola-border/30"
                    title="Enviar para Frase 2"
                  >
                    → 2
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i}>
              <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
                Frase {i + 1} (overlay do clip {i === 0 ? "1" : "3"})
              </label>
              <textarea
                value={state.verses[i]}
                onChange={(e) => {
                  const next: [string, string] = [...state.verses];
                  next[i] = e.target.value;
                  updateState({ verses: next });
                }}
                rows={2}
                className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. LEGENDAS TIKTOK + YOUTUBE ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          5. Legenda TikTok · Título & Descrição YouTube
        </h3>

        <div className="space-y-3">
          <CopyField
            label="TikTok · legenda"
            value={state.tiktokCaption}
            onChange={(v) => updateState({ tiktokCaption: v })}
            rows={3}
            maxChars={150}
          />
          <CopyField
            label="YouTube · título (≤70)"
            value={state.youtubeTitle}
            onChange={(v) => updateState({ youtubeTitle: v })}
            rows={1}
            maxChars={70}
          />
          <CopyField
            label="YouTube · descrição"
            value={state.youtubeDescription}
            onChange={(v) => updateState({ youtubeDescription: v })}
            rows={6}
          />
        </div>
      </section>

      {/* ── 6. RENDER ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          6. Montar Short MP4 30s (9:16)
        </h3>

        <input
          type="text"
          value={state.title}
          onChange={(e) => updateState({ title: e.target.value })}
          placeholder="Título do ficheiro (opcional)"
          className="mb-3 w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
        />

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
          </div>
        )}

        {renderError && (
          <div className="mb-3 rounded bg-red-950/50 p-2 text-xs text-red-300">
            Erro: {renderError}
          </div>
        )}

        {renderResult && (
          <div className="mb-3 space-y-2">
            <div className="rounded bg-green-950/50 p-2 text-xs text-green-300">
              Short pronto!
            </div>
            <video
              src={renderResult}
              controls
              className="mx-auto aspect-[9/16] max-w-sm rounded"
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

        <div className="mb-3 flex items-center gap-4 text-xs">
          <span className="text-escola-creme-50">Motor:</span>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="radio"
              checked={engine === "ffmpeg"}
              onChange={() => setEngine("ffmpeg")}
            />
            <span className="text-escola-creme">FFmpeg · grátis <span className="text-escola-creme-50">(GitHub Actions)</span></span>
          </label>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="radio"
              checked={engine === "shotstack"}
              onChange={() => setEngine("shotstack")}
            />
            <span className="text-escola-creme-50">Shotstack · ~$0.20</span>
          </label>
        </div>

        <button
          onClick={startRender}
          disabled={
            !allClipsReady || !state.trackUrl || rendering || anyGenerating
          }
          className="rounded bg-escola-coral px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-30"
        >
          {rendering
            ? "A montar..."
            : `Montar Short MP4 (30s · 9:16 · ${engine === "ffmpeg" ? "FFmpeg" : "Shotstack"})`}
        </button>
        {!allClipsReady && (
          <p className="mt-2 text-xs text-escola-creme-50">
            Precisas dos 3 clips Runway gerados + 1 faixa escolhida.
          </p>
        )}
      </section>

      {/* ── 7. THUMBNAIL ── */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          7. Thumbnail · capa 9:16 (TikTok cover · YouTube Shorts)
        </h3>

        <div className="mb-3">
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
            Imagem base
          </label>
          <div className="flex gap-2">
            {state.slots.map((slot, i) => {
              const selected = state.thumbSlotIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => updateState({ thumbSlotIndex: i, thumbnailUrl: "" })}
                  disabled={!slot.imageUrl}
                  className={`relative aspect-[9/16] w-20 overflow-hidden rounded border transition-colors disabled:opacity-30 ${
                    selected
                      ? "border-escola-coral ring-2 ring-escola-coral"
                      : "border-escola-border hover:border-escola-coral"
                  }`}
                >
                  {slot.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={slot.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-escola-creme-50">
                      #{i + 1}
                    </div>
                  )}
                  <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
            Texto (opcional · default = verso 1)
          </label>
          <textarea
            value={state.thumbText}
            onChange={(e) => updateState({ thumbText: e.target.value })}
            rows={2}
            placeholder={state.verses[0] || "Sem verso 1 — gera as legendas em #4 ou escreve aqui"}
            className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
          />
        </div>

        {thumbnailError && (
          <div className="mb-3 rounded bg-red-950/50 p-2 text-xs text-red-300">
            Erro: {thumbnailError}
          </div>
        )}

        {state.thumbnailUrl && (
          <div className="mb-3 space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.thumbnailUrl}
              alt="thumbnail"
              className="mx-auto aspect-[9/16] max-w-[200px] rounded border border-escola-border"
            />
            <div className="flex gap-2">
              <a
                href={state.thumbnailUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="rounded bg-escola-coral px-3 py-1.5 text-xs font-semibold text-white"
              >
                Descarregar JPG
              </a>
              <button
                onClick={() => copyToClipboard(state.thumbnailUrl)}
                className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:bg-escola-border/30"
              >
                Copiar URL
              </button>
            </div>
          </div>
        )}

        <button
          onClick={generateThumbnail}
          disabled={thumbnailing || !state.slots[state.thumbSlotIndex]?.imageUrl}
          className="rounded bg-escola-coral px-4 py-2 text-sm font-semibold text-white disabled:opacity-30"
        >
          {thumbnailing
            ? "A gerar thumbnail..."
            : state.thumbnailUrl
              ? "Regenerar thumbnail"
              : "Gerar thumbnail"}
        </button>
        <p className="mt-2 text-xs text-escola-creme-50">
          Render via Shotstack (~10–20s). 1080×1920 JPG guardado em <code>shorts/thumbs/</code>.
        </p>
      </section>

      {/* ── OVERLAYS ESCONDIDOS — renderizados como PNG pelo html-to-image ── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
          pointerEvents: "none",
        }}
      >
        <OverlayCard ref={overlay1Ref} text={state.verses[0]} />
        <OverlayCard ref={overlay2Ref} text={state.verses[1]} />
      </div>
    </div>
  );
}

const OverlayCard = forwardRef<HTMLDivElement, { text: string }>(
  function OverlayCard({ text }, ref) {
    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1920,
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 80px",
          boxSizing: "border-box",
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            lineHeight: 1.18,
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            padding: "36px 44px",
            borderRadius: 22,
            backgroundColor: "rgba(0,0,0,0.42)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
            maxWidth: 900,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {text || " "}
        </div>
      </div>
    );
  },
);

// ── Small helpers ─────────────────────────────────────────────────────────────

function CopyField({
  label,
  value,
  onChange,
  rows,
  maxChars,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  maxChars?: number;
}) {
  const over = maxChars ? value.length > maxChars : false;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-wider text-escola-creme-50">
          {label}
        </label>
        <div className="flex items-center gap-3">
          {maxChars && (
            <span
              className={`text-[10px] ${over ? "text-red-400" : "text-escola-creme-50"}`}
            >
              {value.length}/{maxChars}
            </span>
          )}
          <button
            onClick={() => copyToClipboard(value)}
            disabled={!value}
            className="text-[10px] text-escola-coral hover:text-escola-coral/80 disabled:opacity-30"
          >
            Copiar
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
      />
    </div>
  );
}
