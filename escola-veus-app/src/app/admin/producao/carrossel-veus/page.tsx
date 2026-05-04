"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import JSZip from "jszip";
import { CAMPANHA, DIAS, type Dia, type Slide as SlideType } from "./content";
import { Slide } from "./Slide";

const PREVIEW_SCALE = 0.18;
const EXPORT_PIXEL_RATIO = 2;

const SUPABASE_URL = "https://tdytdamtfillqyklgrmb.supabase.co";
const AG_MUSIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/audios/albums/ancient-ground`;
const AG_TOTAL_TRACKS = 100;
const agTrackUrl = (n: number) => `${AG_MUSIC_BASE}/faixa-${String(n).padStart(2, "0")}.mp3`;

type AudioState = {
  url?: string;
  durationSec?: number;
  generating?: boolean;
  error?: string;
};

type RenderStatus = {
  jobId: string;
  status: "queued" | "running" | "done" | "failed" | "not_found";
  progress?: number;
  phase?: string;
  videos?: Array<{ file: string; url: string; sizeBytes: number }>;
  error?: string;
};

const RESPIRACAO_MS = 1000;

function deriveText(dia: Dia, slide: SlideType): string {
  if (slide.tipo === "capa") {
    return `Véu da ${dia.veu.toLowerCase()}. ${slide.linha1} ${slide.linha2}`;
  }
  if (slide.tipo === "conteudo") {
    const titulo = slide.titulo ? `${slide.titulo}. ` : "";
    return titulo + slide.texto.replace(/\n+/g, " ");
  }
  return `${slide.recurso}. ${slide.descricao}`;
}

function audioKey(dia: number, slide: number) {
  return `${dia}-${slide}`;
}

export default function CarrosselVeusPage() {
  const refs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  // ─── Vozes ──────────────────────────────────────────
  const [jobId, setJobId] = useState<string>("");
  const [audios, setAudios] = useState<Record<string, AudioState>>({});
  const [generatingAll, setGeneratingAll] = useState(false);

  // ─── Vídeo ──────────────────────────────────────────
  const [musicTrack, setMusicTrack] = useState<number>(1);
  const [musicVolume, setMusicVolume] = useState<number>(0.4);
  const [previewDia, setPreviewDia] = useState<number | null>(null);
  const [renderJob, setRenderJob] = useState<RenderStatus | null>(null);
  const [workflowUrl, setWorkflowUrl] = useState<string | null>(null);

  const allAudiosReady = useMemo(() => {
    for (const dia of DIAS) {
      for (let i = 0; i < dia.slides.length; i++) {
        const k = audioKey(dia.numero, i + 1);
        if (!audios[k]?.url) return false;
      }
    }
    return true;
  }, [audios]);

  const audiosCount = useMemo(
    () => Object.values(audios).filter((a) => a.url).length,
    [audios]
  );

  // Polling do job de render
  useEffect(() => {
    if (!renderJob?.jobId) return;
    if (renderJob.status === "done" || renderJob.status === "failed") return;
    const id = setInterval(async () => {
      try {
        const r = await fetch(
          `/api/admin/carrossel-veus/render-status?jobId=${encodeURIComponent(renderJob.jobId)}`,
          { cache: "no-store" }
        );
        if (r.ok) setRenderJob((await r.json()) as RenderStatus);
      } catch {}
    }, 5000);
    return () => clearInterval(id);
  }, [renderJob?.jobId, renderJob?.status]);

  function setRef(key: string, el: HTMLDivElement | null) {
    if (el) refs.current.set(key, el);
    else refs.current.delete(key);
  }

  // ─── Geração de voz ──────────────────────────────
  async function generateVoice(dia: Dia, slideIndex: number, currentJobId: string) {
    const slide = dia.slides[slideIndex];
    const slideNum = slideIndex + 1;
    const k = audioKey(dia.numero, slideNum);
    const text = deriveText(dia, slide);

    setAudios((prev) => ({ ...prev, [k]: { ...prev[k], generating: true, error: undefined } }));

    try {
      const r = await fetch("/api/admin/carrossel-veus/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: currentJobId, dia: dia.numero, slide: slideNum, text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.erro || `HTTP ${r.status}`);
      setAudios((prev) => ({
        ...prev,
        [k]: { url: data.audioUrl, durationSec: data.durationSec, generating: false },
      }));
      return data.audioUrl as string;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setAudios((prev) => ({ ...prev, [k]: { ...prev[k], generating: false, error: msg } }));
      throw err;
    }
  }

  async function generateAllVoices() {
    const newJobId = jobId || `carrossel-veus-${Date.now()}`;
    setJobId(newJobId);
    setGeneratingAll(true);
    let done = 0;
    const total = DIAS.reduce((a, d) => a + d.slides.length, 0);
    setProgress({ done, total });

    try {
      for (const dia of DIAS) {
        for (let i = 0; i < dia.slides.length; i++) {
          const k = audioKey(dia.numero, i + 1);
          if (audios[k]?.url) {
            done++;
            setProgress({ done, total });
            continue;
          }
          await generateVoice(dia, i, newJobId);
          done++;
          setProgress({ done, total });
        }
      }
    } finally {
      setGeneratingAll(false);
      setProgress(null);
    }
  }

  async function regenerateOne(dia: Dia, slideIndex: number) {
    const newJobId = jobId || `carrossel-veus-${Date.now()}`;
    setJobId(newJobId);
    try {
      await generateVoice(dia, slideIndex, newJobId);
    } catch {}
  }

  // ─── Submit render final ──────────────────────────
  async function submitRender() {
    if (!allAudiosReady) {
      alert("Faltam áudios. Gera as 42 vozes primeiro.");
      return;
    }
    setBusy("submit-render");
    try {
      const audiosList = DIAS.flatMap((dia) =>
        dia.slides.map((_, i) => ({
          dia: dia.numero,
          slide: i + 1,
          url: audios[audioKey(dia.numero, i + 1)]!.url!,
        }))
      );
      const r = await fetch("/api/admin/carrossel-veus/render-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          audios: audiosList,
          musicUrl: agTrackUrl(musicTrack),
          musicVolume,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.erro || `HTTP ${r.status}`);
      setRenderJob({ jobId: data.jobId, status: "queued" });
      setWorkflowUrl(data.workflowRunUrl || null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Falha ao submeter: ${msg}`);
    } finally {
      setBusy(null);
    }
  }

  // ─── PNG downloads (mantém-se) ─────────────────────
  async function nodeToPng(node: HTMLElement) {
    const dataUrl = await htmlToImage.toPng(node, {
      pixelRatio: EXPORT_PIXEL_RATIO,
      width: 1080,
      height: 1920,
      cacheBust: true,
    });
    const res = await fetch(dataUrl);
    return res.blob();
  }

  async function downloadSlide(dia: Dia, slideIdx: number) {
    const k = audioKey(dia.numero, slideIdx + 1);
    const node = refs.current.get(k);
    const real = node?.firstElementChild as HTMLElement | null;
    if (!real) return;
    setBusy(k);
    try {
      const blob = await nodeToPng(real);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `veu-${dia.numero}-slide-${slideIdx + 1}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }

  async function downloadAllZip() {
    setBusy("all");
    setProgress({ done: 0, total: 42 });
    try {
      const zip = new JSZip();
      let done = 0;
      for (const dia of DIAS) {
        const folder = zip.folder(`dia-${dia.numero}`)!;
        for (let i = 0; i < dia.slides.length; i++) {
          const k = audioKey(dia.numero, i + 1);
          const node = refs.current.get(k);
          const real = node?.firstElementChild as HTMLElement | null;
          if (!real) continue;
          const blob = await nodeToPng(real);
          folder.file(`veu-${dia.numero}-slide-${i + 1}.png`, blob);
          done++;
          setProgress({ done, total: 42 });
        }
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "carrossel-veus.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 font-serif text-2xl font-semibold text-escola-creme">
            Carrossel · {CAMPANHA}
          </h2>
          <p className="text-sm text-escola-creme-50">
            42 slides verticais (7 dias × 6) para status do WhatsApp. Fluxo:
            <br />
            <span className="text-escola-dourado">1.</span> Gera as 42 vozes ·
            <span className="text-escola-dourado"> 2.</span> Pré-visualiza cada dia (slide + voz + música) ·
            <span className="text-escola-dourado"> 3.</span> Gera os 7 vídeos MP4
          </p>
        </div>
        <button
          onClick={downloadAllZip}
          disabled={busy !== null}
          className="shrink-0 rounded bg-escola-dourado/90 px-4 py-2 text-sm font-semibold text-escola-bg hover:bg-escola-dourado disabled:opacity-40"
        >
          {busy === "all" ? `${progress?.done ?? 0}/${progress?.total ?? 42}` : "↓ PNGs (ZIP)"}
        </button>
      </div>

      {/* ─── Painel de VOZES ──────────────────────────── */}
      <section className="mb-10 rounded-lg border border-escola-border bg-escola-card p-5">
        <header className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg text-escola-creme">1. Vozes (ElevenLabs)</h3>
            <p className="text-xs text-escola-creme-50">
              {audiosCount === 0
                ? "Gera as 42 narrações. Podes ouvir cada uma e regerar individualmente."
                : `${audiosCount}/42 vozes geradas. Ouve, regera as que não gostares.`}
            </p>
          </div>
          <button
            onClick={generateAllVoices}
            disabled={generatingAll}
            className="shrink-0 rounded bg-escola-violeta px-4 py-2 text-sm font-semibold text-escola-creme hover:bg-escola-violeta-dark disabled:opacity-40"
          >
            {generatingAll
              ? `A gerar… ${progress?.done ?? 0}/${progress?.total ?? 42}`
              : audiosCount > 0
              ? "↻ Continuar / regenerar todas"
              : "▶ Gerar 42 vozes"}
          </button>
        </header>

        {audiosCount > 0 && (
          <div className="space-y-4">
            {DIAS.map((dia) => (
              <details key={dia.numero} className="rounded border border-escola-border bg-escola-bg" open>
                <summary className="cursor-pointer list-none px-4 py-3 text-sm">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-escola-creme">Dia {dia.numero}</span>{" "}
                      <span className="text-escola-dourado">{dia.veu}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreviewDia(dia.numero);
                      }}
                      disabled={!dia.slides.every((_, i) => audios[audioKey(dia.numero, i + 1)]?.url)}
                      className="rounded bg-escola-dourado/20 px-3 py-1 text-xs font-semibold text-escola-dourado hover:bg-escola-dourado/30 disabled:opacity-30"
                    >
                      ▶ Preview vídeo do dia
                    </button>
                  </div>
                </summary>
                <ul className="space-y-2 px-4 pb-4">
                  {dia.slides.map((slide, i) => {
                    const k = audioKey(dia.numero, i + 1);
                    const a = audios[k];
                    const text = deriveText(dia, slide);
                    return (
                      <li key={k} className="flex items-start gap-3 rounded border border-escola-border bg-escola-card p-3">
                        <div className="w-12 shrink-0 text-xs text-escola-creme-50">
                          {String(i + 1).padStart(2, "0")} · <span className="text-escola-dourado">{tipoLabel(slide)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="mb-2 line-clamp-2 text-xs italic text-escola-creme-50">{text}</p>
                          {a?.url ? (
                            <audio controls src={a.url} className="h-8 w-full" preload="none" />
                          ) : a?.error ? (
                            <p className="text-xs text-red-300">erro: {a.error}</p>
                          ) : a?.generating ? (
                            <p className="text-xs text-escola-creme-50">a gerar…</p>
                          ) : (
                            <p className="text-xs text-escola-creme-50">por gerar</p>
                          )}
                        </div>
                        <button
                          onClick={() => regenerateOne(dia, i)}
                          disabled={a?.generating || generatingAll}
                          className="shrink-0 rounded border border-escola-border px-2 py-1 text-xs text-escola-creme hover:border-escola-dourado/40 disabled:opacity-30"
                          title="Regerar esta voz"
                        >
                          ↻
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </details>
            ))}
          </div>
        )}
      </section>

      {/* ─── SLIDES (preview/downloads PNG) ──────────────────── */}
      <section className="mb-10">
        <h3 className="mb-4 font-serif text-lg text-escola-creme">Slides (PNG individuais)</h3>
        <div className="space-y-8">
          {DIAS.map((dia) => (
            <div key={dia.numero}>
              <header className="mb-3 border-b border-escola-border pb-2 text-sm text-escola-creme-50">
                Dia {dia.numero} · <span className="text-escola-dourado">{dia.veu}</span> ·{" "}
                <em>{dia.subtitulo}</em>
              </header>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                {dia.slides.map((slide, i) => {
                  const k = audioKey(dia.numero, i + 1);
                  return (
                    <div key={k} className="flex flex-col items-center gap-2">
                      <div
                        ref={(el) => setRef(k, el)}
                        className="overflow-hidden rounded border border-escola-border bg-black"
                      >
                        <Slide dia={dia} slide={slide} indice={i} scale={PREVIEW_SCALE} />
                      </div>
                      <div className="flex w-full items-center justify-between gap-2 px-1">
                        <span className="text-[10px] uppercase tracking-wider text-escola-creme-50">
                          {tipoLabel(slide)}
                        </span>
                        <button
                          onClick={() => downloadSlide(dia, i)}
                          disabled={busy !== null}
                          className="rounded bg-escola-card px-2 py-0.5 text-[10px] text-escola-creme hover:bg-escola-bg-light disabled:opacity-40"
                        >
                          ↓ PNG
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── VÍDEOS finais ──────────────────────────── */}
      <section className="rounded-lg border border-escola-border bg-escola-card p-5">
        <h3 className="mb-2 font-serif text-lg text-escola-creme">3. Vídeos finais (MP4)</h3>
        <p className="mb-4 text-xs text-escola-creme-50">
          7 MP4 verticais ~60s cada. Renderizados numa GitHub Action (~15-25 min) com a
          voz que já tens + música Ancient Ground por baixo.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block text-xs text-escola-creme-50">
            Faixa Ancient Ground (1–{AG_TOTAL_TRACKS})
            <input
              type="number"
              min={1}
              max={AG_TOTAL_TRACKS}
              value={musicTrack}
              onChange={(e) => setMusicTrack(Math.max(1, Math.min(AG_TOTAL_TRACKS, Number(e.target.value) || 1)))}
              className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-sm text-escola-creme"
            />
          </label>
          <label className="block text-xs text-escola-creme-50">
            Volume da música ({musicVolume.toFixed(2)})
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </label>
          <div className="flex items-end">
            <button
              onClick={submitRender}
              disabled={
                !allAudiosReady ||
                busy === "submit-render" ||
                (renderJob !== null && renderJob.status !== "done" && renderJob.status !== "failed")
              }
              className="w-full rounded bg-escola-dourado/90 px-4 py-2 text-sm font-semibold text-escola-bg hover:bg-escola-dourado disabled:opacity-40"
              title={!allAudiosReady ? "Gera as 42 vozes primeiro" : ""}
            >
              {busy === "submit-render" ? "A submeter…" : "▶ Gerar vídeos"}
            </button>
          </div>
        </div>

        {renderJob && (
          <div className="mt-5 rounded border border-escola-border bg-escola-bg p-4 text-xs">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="text-escola-creme-50">Job:</span>{" "}
                <code className="text-escola-dourado">{renderJob.jobId}</code>
              </div>
              <span
                className={
                  renderJob.status === "done"
                    ? "rounded bg-green-700/30 px-2 py-0.5 text-green-300"
                    : renderJob.status === "failed"
                    ? "rounded bg-red-700/30 px-2 py-0.5 text-red-300"
                    : "rounded bg-escola-dourado/20 px-2 py-0.5 text-escola-dourado"
                }
              >
                {renderJob.status}
                {renderJob.phase ? ` · ${renderJob.phase}` : ""}
              </span>
            </div>
            {workflowUrl && (
              <p className="mb-2 text-escola-creme-50">
                Logs:{" "}
                <a className="text-escola-dourado underline" href={workflowUrl} target="_blank" rel="noreferrer">
                  GitHub Actions
                </a>
              </p>
            )}
            {renderJob.error && <p className="mb-2 text-red-300">Erro: {renderJob.error}</p>}
            {renderJob.status === "done" && renderJob.videos && renderJob.videos.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 font-semibold text-escola-creme">Descarregar:</p>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {renderJob.videos.map((v) => (
                    <li key={v.file}>
                      <a
                        href={v.url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="block rounded border border-escola-border bg-escola-card px-3 py-2 text-center text-escola-creme hover:border-escola-dourado/40"
                      >
                        ↓ {v.file.replace(".mp4", "")}
                        <span className="ml-1 text-[10px] text-escola-creme-50">
                          {(v.sizeBytes / 1024 / 1024).toFixed(1)} MB
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {previewDia !== null && (
        <PreviewModal
          dia={DIAS.find((d) => d.numero === previewDia)!}
          audios={audios}
          musicUrl={agTrackUrl(musicTrack)}
          musicVolume={musicVolume}
          onClose={() => setPreviewDia(null)}
        />
      )}
    </div>
  );
}

function tipoLabel(s: SlideType) {
  if (s.tipo === "capa") return "capa";
  if (s.tipo === "cta") return "cta";
  return s.estilo;
}

/* ─── PreviewModal ─────────────────────────────────────────
   Reproduz o que a Action vai produzir: 6 slides em sequência,
   cada um com a sua voz, música por baixo a musicVolume.
*/
function PreviewModal({
  dia,
  audios,
  musicUrl,
  musicVolume,
  onClose,
}: {
  dia: Dia;
  audios: Record<string, AudioState>;
  musicUrl: string;
  musicVolume: number;
  onClose: () => void;
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const voiceRef = useRef<HTMLAudioElement>(null);
  const musicAudioRef = useRef<HTMLAudioElement>(null);

  const slide = dia.slides[slideIdx];
  const voiceUrl = audios[audioKey(dia.numero, slideIdx + 1)]?.url;

  // Carrega nova voz quando muda o slide e (se playing) começa
  useEffect(() => {
    if (!voiceRef.current || !voiceUrl) return;
    voiceRef.current.src = voiceUrl;
    voiceRef.current.load();
    if (playing) {
      voiceRef.current.play().catch(() => {});
    }
  }, [voiceUrl, slideIdx, playing]);

  // Música: arranque/paragem segue o estado playing
  useEffect(() => {
    const a = musicAudioRef.current;
    if (!a) return;
    a.volume = musicVolume;
    a.loop = true;
    if (playing) a.play().catch(() => {});
    else a.pause();
  }, [playing, musicVolume]);

  // Quando a voz acaba: 1s respiração → próximo slide (ou fim)
  function onVoiceEnded() {
    if (slideIdx >= dia.slides.length - 1) {
      setPlaying(false);
      return;
    }
    setTimeout(() => setSlideIdx((i) => i + 1), RESPIRACAO_MS);
  }

  function start() {
    setSlideIdx(0);
    setPlaying(true);
    // pequena espera para o useEffect carregar voiceUrl no <audio>
    setTimeout(() => {
      voiceRef.current?.play().catch(() => {});
    }, 50);
  }

  function stop() {
    setPlaying(false);
    voiceRef.current?.pause();
    musicAudioRef.current?.pause();
  }

  // Escala para caber na viewport: ~min(80vh, 80vw * 16/9 inverso)
  const previewScale = 0.45;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6">
      <button
        onClick={() => {
          stop();
          onClose();
        }}
        className="absolute right-6 top-6 rounded bg-escola-card px-3 py-2 text-sm text-escola-creme hover:bg-escola-bg-light"
      >
        ✕ Fechar
      </button>

      <div className="mb-3 text-center">
        <p className="font-serif text-xl text-escola-creme">
          Dia {dia.numero} · <span className="text-escola-dourado">{dia.veu}</span>
        </p>
        <p className="text-xs text-escola-creme-50">
          slide {slideIdx + 1}/{dia.slides.length}
        </p>
      </div>

      <div className="overflow-hidden rounded border border-escola-border bg-black">
        <Slide dia={dia} slide={slide} indice={slideIdx} scale={previewScale} />
      </div>

      <div className="mt-4 flex items-center gap-3">
        {!playing ? (
          <button
            onClick={start}
            className="rounded bg-escola-dourado/90 px-5 py-2 text-sm font-semibold text-escola-bg hover:bg-escola-dourado"
          >
            ▶ Tocar
          </button>
        ) : (
          <button
            onClick={stop}
            className="rounded bg-escola-card px-5 py-2 text-sm font-semibold text-escola-creme hover:bg-escola-bg-light"
          >
            ⏸ Pausar
          </button>
        )}
        <button
          onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
          disabled={slideIdx === 0}
          className="rounded border border-escola-border px-3 py-2 text-sm text-escola-creme disabled:opacity-30"
        >
          ‹
        </button>
        <button
          onClick={() => setSlideIdx((i) => Math.min(dia.slides.length - 1, i + 1))}
          disabled={slideIdx === dia.slides.length - 1}
          className="rounded border border-escola-border px-3 py-2 text-sm text-escola-creme disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {/* Áudio da voz (visível para debug, controlos podem ficar escondidos) */}
      <audio
        ref={voiceRef}
        onEnded={onVoiceEnded}
        className="mt-3 w-80"
        controls
      />

      {/* Música em loop, sem controlos visíveis */}
      <audio ref={musicAudioRef} src={musicUrl} preload="auto" />
    </div>
  );
}
