"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import * as htmlToImage from "html-to-image";

// Shorts AG — reaproveitam clips Runway já pagos (listados em escola-shorts/clips/*
// via list-clips-ag), música do álbum ancient-ground (100 faixas) e 2 versos
// próprios sobrepostos. O renderer (render-short-submit + workflow) é o mesmo
// que os shorts Loranne, só muda o conteúdo do manifest.

type AgClip = {
  name: string;
  url: string;
  createdAt: string | null;
};

type SlotState = {
  clipUrl: string;
  clipName: string;
};

const EMPTY_SLOTS: SlotState[] = [
  { clipUrl: "", clipName: "" },
  { clipUrl: "", clipName: "" },
  { clipUrl: "", clipName: "" },
];

const CLIP_DURATION = 10;
const SUPABASE_URL = "https://tdytdamtfillqyklgrmb.supabase.co";
const AG_MUSIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/audios/albums/ancient-ground`;
const AG_TOTAL_TRACKS = 100;
const DEFAULT_HASHTAGS = "#AncientGround #nature #meditation #ambient";

function agTrackUrl(n: number): string {
  return `${AG_MUSIC_BASE}/faixa-${String(n).padStart(2, "0")}.mp3`;
}

export default function AncientGroundShortsPage() {
  const [clips, setClips] = useState<AgClip[]>([]);
  const [loadingClips, setLoadingClips] = useState(false);
  const [clipQuery, setClipQuery] = useState("");

  const [slots, setSlots] = useState<SlotState[]>(EMPTY_SLOTS);
  const [verse1, setVerse1] = useState("");
  const [verse2, setVerse2] = useState("");
  const [trackNumber, setTrackNumber] = useState<number>(1);
  const [musicVolume, setMusicVolume] = useState(0.8);

  const [title, setTitle] = useState("");
  const [tiktokCaption, setTiktokCaption] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");
  const [youtubeDescription, setYoutubeDescription] = useState("");

  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderLabel, setRenderLabel] = useState("");
  const [renderResult, setRenderResult] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const overlay1Ref = useRef<HTMLDivElement>(null);
  const overlay2Ref = useRef<HTMLDivElement>(null);

  // Montserrat 800 — necessário para os overlays PNG ficarem com peso certo.
  useEffect(() => {
    const id = "montserrat-800-overlay";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap";
    document.head.appendChild(link);
  }, []);

  // Persist simples em localStorage (key próprio para não colidir com shorts Loranne).
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ag-shorts-state");
      if (!saved) return;
      const s = JSON.parse(saved);
      if (Array.isArray(s.slots) && s.slots.length === 3) setSlots(s.slots);
      if (typeof s.verse1 === "string") setVerse1(s.verse1);
      if (typeof s.verse2 === "string") setVerse2(s.verse2);
      if (typeof s.trackNumber === "number") setTrackNumber(s.trackNumber);
      if (typeof s.title === "string") setTitle(s.title);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "ag-shorts-state",
        JSON.stringify({ slots, verse1, verse2, trackNumber, title }),
      );
    } catch { /* ignore */ }
  }, [slots, verse1, verse2, trackNumber, title]);

  // Lista de clips já animados em Supabase.
  useEffect(() => {
    setLoadingClips(true);
    fetch("/api/admin/shorts/list-clips-ag")
      .then((r) => r.json())
      .then((d) => setClips(d.clips || []))
      .catch(() => setClips([]))
      .finally(() => setLoadingClips(false));
  }, []);

  // Legendas geradas automaticamente a partir dos versos+faixa. O operador pode
  // sempre editar à mão — os textareas são livres.
  useEffect(() => {
    const base = [verse1, verse2].filter((s) => s.trim()).join(" / ");
    const core = base.length > 100 ? base.slice(0, 97) + "..." : base;
    const tiktok = `${core}\n\n${DEFAULT_HASHTAGS}`.trim();
    setTiktokCaption(tiktok.length > 150 ? tiktok.slice(0, 147) + "..." : tiktok);

    const yTitle = title || verse1 || "Ancient Ground · Short";
    setYoutubeTitle(yTitle.length > 70 ? yTitle.slice(0, 67) + "..." : yTitle);

    const yDesc = [
      verse1,
      verse2,
      "",
      `Ancient Ground · faixa ${String(trackNumber).padStart(2, "0")}`,
      "",
      DEFAULT_HASHTAGS,
    ].join("\n");
    setYoutubeDescription(yDesc);
  }, [verse1, verse2, title, trackNumber]);

  const filteredClips = clipQuery.trim()
    ? clips.filter((c) => c.name.toLowerCase().includes(clipQuery.toLowerCase()))
    : clips.slice(0, 60);

  const allClipsReady = slots.every((s) => s.clipUrl);

  const pickClip = (clip: AgClip) => {
    const nextSlot = slots.findIndex((s) => !s.clipUrl);
    if (nextSlot === -1) return;
    setSlots((prev) => prev.map((s, i) => (i === nextSlot ? { clipUrl: clip.url, clipName: clip.name } : s)));
  };

  const clearSlot = (i: number) => {
    setSlots((prev) => prev.map((s, j) => (j === i ? { clipUrl: "", clipName: "" } : s)));
  };

  const startRender = async () => {
    if (!allClipsReady) {
      alert("Escolhe 3 clips primeiro.");
      return;
    }
    setRendering(true);
    setRenderProgress(0);
    setRenderLabel("A desenhar overlays...");
    setRenderResult(null);
    setRenderError(null);

    try {
      const [png1, png2] = await Promise.all([
        overlay1Ref.current
          ? htmlToImage.toPng(overlay1Ref.current, { pixelRatio: 1, cacheBust: true, backgroundColor: undefined })
          : Promise.resolve(""),
        overlay2Ref.current
          ? htmlToImage.toPng(overlay2Ref.current, { pixelRatio: 1, cacheBust: true, backgroundColor: undefined })
          : Promise.resolve(""),
      ]);

      setRenderLabel("A despachar GitHub Actions...");
      const submit = await fetch("/api/admin/shorts/render-short-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || `ancient-ground-short-${Date.now()}`,
          clips: slots.map((s) => s.clipUrl),
          clipDuration: CLIP_DURATION,
          musicUrl: agTrackUrl(trackNumber),
          musicVolume,
          overlayPngs: [png1, png2],
          seo: { tiktokCaption, youtubeTitle, youtubeDescription, channel: "ancient-ground" },
        }),
      });
      const submitData = await submit.json();
      if (!submit.ok || !submitData.jobId) {
        throw new Error(submitData.erro || `HTTP ${submit.status}`);
      }

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
        if (status === "failed") throw new Error(data.error || "Render falhou.");
        if (status === "done" && data.videoUrl) {
          setRenderResult(data.videoUrl);
          setRenderProgress(100);
          setRenderLabel("Short pronto!");
          break;
        }
      }
    } catch (err) {
      setRenderError(err instanceof Error ? err.message : String(err));
    } finally {
      setRendering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-escola-creme">
          Shorts Ancient Ground · 30s vertical (reusa clips Runway já pagos)
        </h2>
        <button
          onClick={() => {
            if (!confirm("Limpar slots e texto?")) return;
            setSlots(EMPTY_SLOTS);
            setVerse1("");
            setVerse2("");
            setTitle("");
          }}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Limpar
        </button>
      </div>

      {/* 1. CLIPS */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          1. Escolhe 3 clips da biblioteca motion
        </h3>
        <p className="mb-2 text-xs text-escola-creme-50">
          Clips já gerados via Runway (bucket escola-shorts/clips). Reaproveitamos sem pagar créditos novos.
        </p>
        <input
          type="text"
          value={clipQuery}
          onChange={(e) => setClipQuery(e.target.value)}
          placeholder="Filtrar por nome (ex: mar, praia, floresta...)"
          className="mb-3 w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-sm text-escola-creme"
        />

        <div className="mb-3 flex gap-2">
          {slots.map((slot, i) => (
            <div
              key={i}
              className="relative aspect-[9/16] w-24 overflow-hidden rounded border border-escola-border bg-escola-bg"
            >
              {slot.clipUrl ? (
                <>
                  <video src={slot.clipUrl} className="h-full w-full object-cover" muted />
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

        {loadingClips ? (
          <p className="text-xs text-escola-creme-50">A carregar clips...</p>
        ) : (
          <>
            <div className="grid grid-cols-6 gap-2 md:grid-cols-8">
              {filteredClips.map((c) => {
                const nextSlot = slots.findIndex((s) => !s.clipUrl);
                const used = slots.some((s) => s.clipUrl === c.url);
                const disabled = nextSlot === -1 || used;
                return (
                  <button
                    key={c.url}
                    onClick={() => !disabled && pickClip(c)}
                    disabled={disabled}
                    title={c.name}
                    className={`relative aspect-[9/16] overflow-hidden rounded border ${
                      disabled
                        ? "border-escola-border/30 opacity-30"
                        : "border-escola-border hover:border-escola-coral"
                    }`}
                  >
                    <video src={c.url} className="h-full w-full object-cover" muted />
                  </button>
                );
              })}
            </div>
            {filteredClips.length === 0 && (
              <p className="text-xs text-escola-creme-50">Nenhum clip encontrado.</p>
            )}
            <p className="mt-2 text-xs text-escola-creme-50">
              {clips.length} clips em biblioteca · a mostrar {filteredClips.length}
            </p>
          </>
        )}
      </section>

      {/* 2. TEXTO */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          2. Texto (2 frases sobrepostas)
        </h3>
        <p className="mb-2 text-xs text-escola-creme-50">
          A 1ª frase aparece na 1ª metade (0–15s), a 2ª na 2ª metade (15–30s).
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
              Frase 1 (0–15s)
            </label>
            <textarea
              value={verse1}
              onChange={(e) => setVerse1(e.target.value)}
              rows={3}
              placeholder="onde o tempo dorme, a água lembra"
              className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-sm text-escola-creme"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
              Frase 2 (15–30s)
            </label>
            <textarea
              value={verse2}
              onChange={(e) => setVerse2(e.target.value)}
              rows={3}
              placeholder="respira — aqui também é casa"
              className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-sm text-escola-creme"
            />
          </div>
        </div>
      </section>

      {/* 3. MÚSICA */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          3. Música Ancient Ground
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-escola-creme-50">Faixa:</label>
          <select
            value={trackNumber}
            onChange={(e) => setTrackNumber(Number(e.target.value))}
            className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-sm text-escola-creme"
          >
            {Array.from({ length: AG_TOTAL_TRACKS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                faixa-{String(n).padStart(2, "0")}
              </option>
            ))}
          </select>
          <label className="text-xs text-escola-creme-50">Volume:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={musicVolume}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-xs text-escola-creme-50">{Math.round(musicVolume * 100)}%</span>
        </div>
        <audio key={trackNumber} controls src={agTrackUrl(trackNumber)} className="mt-3 w-full" />
      </section>

      {/* 4. RENDER */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          4. Renderizar
        </h3>
        <div className="mb-3">
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
            Título (slug do ficheiro MP4)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex: ancient-ground-oceano"
            className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-sm text-escola-creme"
          />
        </div>

        {rendering && (
          <div className="mb-3 rounded bg-escola-bg p-3 text-xs">
            <div className="mb-1 flex justify-between">
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
            <div className="rounded bg-green-950/50 p-2 text-xs text-green-300">Short pronto!</div>
            <video src={renderResult} controls className="w-full max-w-sm rounded" />
            <div>
              <a
                href={renderResult}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded bg-escola-coral px-4 py-2 text-sm font-semibold text-white"
              >
                Abrir / Descarregar MP4
              </a>
            </div>
          </div>
        )}

        <button
          onClick={startRender}
          disabled={rendering || !allClipsReady}
          className="rounded bg-escola-coral px-4 py-2 text-sm font-semibold text-white disabled:opacity-30"
        >
          {rendering ? "A renderizar..." : "Renderizar short"}
        </button>
      </section>

      {/* 5. LEGENDAS */}
      <section className="rounded-lg border border-escola-border bg-escola-bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-escola-coral">
          5. Legendas para publicar
        </h3>
        <div className="space-y-3">
          <CopyField
            label="TikTok / Instagram caption"
            value={tiktokCaption}
            onChange={setTiktokCaption}
            rows={3}
            maxChars={150}
          />
          <CopyField
            label="YouTube title"
            value={youtubeTitle}
            onChange={setYoutubeTitle}
            rows={1}
            maxChars={70}
          />
          <CopyField
            label="YouTube description"
            value={youtubeDescription}
            onChange={setYoutubeDescription}
            rows={6}
          />
        </div>
      </section>

      {/* Overlays 1080×1920 escondidos — renderizados para PNG antes do submit. */}
      <div
        aria-hidden
        style={{ position: "fixed", left: "-99999px", top: 0, pointerEvents: "none" }}
      >
        <OverlayCard ref={overlay1Ref} text={verse1} />
        <OverlayCard ref={overlay2Ref} text={verse2} />
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
            onClick={() => navigator.clipboard?.writeText(value).catch(() => {})}
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
