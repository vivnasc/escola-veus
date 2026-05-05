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

/**
 * Gera uma legenda sugerida para o post — capa + uma frase chave + CTA.
 * Pensada para WhatsApp/IG: voz calma, sem exclamações.
 */
function captionFor(dia: Dia): string {
  const capa = dia.slides.find((s) => s.tipo === "capa") as Extract<SlideType, { tipo: "capa" }> | undefined;
  const cta = dia.slides.find((s) => s.tipo === "cta") as Extract<SlideType, { tipo: "cta" }> | undefined;
  const conteudos = dia.slides.filter(
    (s): s is Extract<SlideType, { tipo: "conteudo" }> => s.tipo === "conteudo"
  );
  const primeiraProsa = conteudos.find((c) => c.estilo === "prosa")?.texto || conteudos[0]?.texto || "";

  return [
    `${dia.veu} · Dia ${dia.numero}/7`,
    `— ${dia.subtitulo}`,
    "",
    capa ? `${capa.linha1}\n${capa.linha2}` : "",
    "",
    primeiraProsa.replace(/\n+/g, " ").slice(0, 280),
    "",
    cta ? `${cta.recurso}\n${cta.url}` : "",
  ]
    .filter((s) => s !== null && s !== undefined)
    .join("\n")
    .trim();
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
  const [withoutVoice, setWithoutVoice] = useState<boolean>(false);
  const [slideDuration, setSlideDuration] = useState<number>(8);
  const [previewDia, setPreviewDia] = useState<number | null>(null);
  const [fullscreenSlide, setFullscreenSlide] = useState<{ dia: Dia; slide: SlideType; indice: number } | null>(null);
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
  /**
   * Submete um job de render. `dias` opcional: se omitido, gera os 7. Se passado
   * (ex.: [3]), só gera os dias indicados. Em modo `withoutVoice` ignora voz e
   * usa duração fixa por slide. Em modo normal envia só os áudios dos dias
   * pedidos (não os 42 sempre).
   */
  async function submitRender(opts?: { dias?: number[]; withoutVoiceOverride?: boolean }) {
    const dias = opts?.dias;
    const noVoice = opts?.withoutVoiceOverride ?? withoutVoice;

    // Quais dias estão a ser gerados
    const targetDias = dias ? DIAS.filter((d) => dias.includes(d.numero)) : DIAS;

    // Validar áudios para esses dias quando há voz
    if (!noVoice) {
      for (const dia of targetDias) {
        for (let i = 0; i < dia.slides.length; i++) {
          if (!audios[audioKey(dia.numero, i + 1)]?.url) {
            alert(
              `Falta voz no Dia ${dia.numero} · slide ${i + 1}. Gera-a primeiro ou marca "sem voz".`
            );
            return;
          }
        }
      }
    }

    const busyKey = dias ? `submit-${dias.join(",")}` : "submit-render";
    setBusy(busyKey);
    try {
      const currentJobId = jobId || `carrossel-veus-${Date.now()}`;
      if (!jobId) setJobId(currentJobId);

      const audiosList = noVoice
        ? []
        : targetDias.flatMap((dia) =>
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
          jobId: currentJobId,
          audios: audiosList,
          musicUrl: agTrackUrl(musicTrack),
          musicVolume,
          withoutVoice: noVoice,
          slideDuration,
          dias: dias ?? null,
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
              Clica <span className="text-escola-dourado">▶</span> em cada slide para gerar a voz dessa narração.
              Ouve, regera com <span className="text-escola-dourado">↻</span> se não gostares.
              {audiosCount > 0 && ` · ${audiosCount}/42 prontas`}
            </p>
          </div>
          <button
            onClick={generateAllVoices}
            disabled={generatingAll}
            className="shrink-0 rounded border border-escola-border px-3 py-2 text-xs text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme disabled:opacity-40"
            title="Gera todas as que ainda faltam, em sequência"
          >
            {generatingAll
              ? `${progress?.done ?? 0}/${progress?.total ?? 42}`
              : "↻ gerar todas as que faltam"}
          </button>
        </header>

        <div className="space-y-4">
          {DIAS.map((dia) => (
            <details key={dia.numero} className="rounded border border-escola-border bg-escola-bg" open>
              <summary className="cursor-pointer list-none px-4 py-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="text-escola-creme">Dia {dia.numero}</span>{" "}
                    <span className="text-escola-dourado">{dia.veu}</span>
                    <span className="ml-3 text-xs text-escola-creme-50">
                      {dia.slides.filter((_, i) => audios[audioKey(dia.numero, i + 1)]?.url).length}/{dia.slides.length} vozes
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreviewDia(dia.numero);
                      }}
                      className="rounded bg-escola-dourado/20 px-3 py-1 text-xs font-semibold text-escola-dourado hover:bg-escola-dourado/30"
                      title="Pré-visualizar slides em sequência (com voz se já existir, ou só com música/timer)"
                    >
                      ▶ Preview
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        submitRender({ dias: [dia.numero] });
                      }}
                      disabled={
                        busy?.startsWith("submit-") ||
                        (renderJob !== null && renderJob.status !== "done" && renderJob.status !== "failed")
                      }
                      className="rounded bg-escola-violeta/30 px-3 py-1 text-xs font-semibold text-escola-creme hover:bg-escola-violeta/50 disabled:opacity-30"
                      title="Gerar MP4 só deste dia (não precisa esperar pelos outros)"
                    >
                      ▶ Gerar vídeo deste dia
                    </button>
                  </div>
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
                        {String(i + 1).padStart(2, "0")} ·{" "}
                        <span className="text-escola-dourado">{tipoLabel(slide)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-2 text-xs italic text-escola-creme-50">{text}</p>
                        {a?.url ? (
                          <audio controls src={a.url} className="h-8 w-full" preload="none" />
                        ) : a?.error ? (
                          <p className="text-xs text-red-300">erro: {a.error}</p>
                        ) : a?.generating ? (
                          <p className="text-xs text-escola-dourado">a gerar…</p>
                        ) : (
                          <p className="text-xs text-escola-creme-50">
                            <em>por gerar — clica ▶ à direita</em>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => regenerateOne(dia, i)}
                        disabled={a?.generating || generatingAll}
                        className="shrink-0 rounded border border-escola-border px-3 py-1 text-sm text-escola-creme hover:border-escola-dourado/40 disabled:opacity-30"
                        title={a?.url ? "Regerar esta voz" : "Gerar esta voz"}
                      >
                        {a?.generating ? "…" : a?.url ? "↻" : "▶"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </div>
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
                      <button
                        type="button"
                        onClick={() => setFullscreenSlide({ dia, slide, indice: i })}
                        className="overflow-hidden rounded border border-escola-border bg-black transition-colors hover:border-escola-dourado/60"
                        title="Abrir em ecrã inteiro"
                      >
                        <div ref={(el) => setRef(k, el)}>
                          <Slide dia={dia} slide={slide} indice={i} scale={PREVIEW_SCALE} />
                        </div>
                      </button>
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
          7 MP4 verticais. Renderizados numa GitHub Action (~10-25 min) com música
          Ancient Ground por baixo. Por defeito usa a voz já gerada; podes optar
          por <em>sem voz</em> (vídeo só com música, slides com duração fixa).
        </p>

        <label className="mb-4 flex cursor-pointer items-center gap-3 rounded border border-escola-border bg-escola-bg p-3">
          <input
            type="checkbox"
            checked={withoutVoice}
            onChange={(e) => setWithoutVoice(e.target.checked)}
            className="h-4 w-4"
          />
          <div>
            <p className="text-sm text-escola-creme">Sem voz — vídeo só com música</p>
            <p className="text-xs text-escola-creme-50">
              Não precisa das 42 narrações. Cada slide aparece durante a duração fixa em baixo.
            </p>
          </div>
        </label>

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
          {withoutVoice ? (
            <label className="block text-xs text-escola-creme-50">
              Duração por slide ({slideDuration}s)
              <input
                type="range"
                min={3}
                max={20}
                step={1}
                value={slideDuration}
                onChange={(e) => setSlideDuration(Number(e.target.value))}
                className="mt-2 w-full"
              />
            </label>
          ) : (
            <div />
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={() => submitRender()}
            disabled={
              (!withoutVoice && !allAudiosReady) ||
              busy === "submit-render" ||
              (renderJob !== null && renderJob.status !== "done" && renderJob.status !== "failed")
            }
            className="w-full rounded bg-escola-dourado/90 px-4 py-2 text-sm font-semibold text-escola-bg hover:bg-escola-dourado disabled:opacity-40 sm:w-auto"
            title={!withoutVoice && !allAudiosReady ? "Gera as 42 vozes primeiro, ou marca sem voz" : ""}
          >
            {busy === "submit-render"
              ? "A submeter…"
              : withoutVoice
              ? "▶ Gerar vídeos (sem voz)"
              : "▶ Gerar vídeos com voz"}
          </button>
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
              <div className="mt-3 space-y-6">
                <p className="font-semibold text-escola-creme">Vídeos prontos:</p>
                {renderJob.videos.map((v) => {
                  const m = v.file.match(/dia-(\d+)/);
                  const diaNum = m ? Number(m[1]) : 0;
                  const dia = DIAS.find((d) => d.numero === diaNum);
                  return (
                    <VideoResultCard
                      key={v.file}
                      file={v.file}
                      url={v.url}
                      sizeBytes={v.sizeBytes}
                      dia={dia}
                    />
                  );
                })}
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
          slideDuration={slideDuration}
          onClose={() => setPreviewDia(null)}
        />
      )}

      {fullscreenSlide && (
        <FullscreenSlide
          dia={fullscreenSlide.dia}
          slide={fullscreenSlide.slide}
          indice={fullscreenSlide.indice}
          onClose={() => setFullscreenSlide(null)}
          onDownload={() => downloadSlide(fullscreenSlide.dia, fullscreenSlide.indice)}
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
  slideDuration,
  onClose,
}: {
  dia: Dia;
  audios: Record<string, AudioState>;
  musicUrl: string;
  musicVolume: number;
  slideDuration: number;
  onClose: () => void;
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const voiceRef = useRef<HTMLAudioElement>(null);
  const musicAudioRef = useRef<HTMLAudioElement>(null);
  const noVoiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slide = dia.slides[slideIdx];
  const voiceUrl = audios[audioKey(dia.numero, slideIdx + 1)]?.url;

  function clearNoVoiceTimer() {
    if (noVoiceTimerRef.current) {
      clearTimeout(noVoiceTimerRef.current);
      noVoiceTimerRef.current = null;
    }
  }

  // Avança para o próximo slide (ou pára no fim).
  function advance() {
    if (slideIdx >= dia.slides.length - 1) {
      setPlaying(false);
      return;
    }
    setTimeout(() => setSlideIdx((i) => i + 1), RESPIRACAO_MS);
  }

  // Carrega voz (se existir) ou agenda timer (se não existir) quando muda o slide.
  useEffect(() => {
    clearNoVoiceTimer();
    if (!playing) return;
    if (voiceUrl) {
      if (voiceRef.current) {
        voiceRef.current.src = voiceUrl;
        voiceRef.current.load();
        voiceRef.current.play().catch(() => {});
      }
    } else {
      // sem voz neste slide → avança após slideDuration segundos
      noVoiceTimerRef.current = setTimeout(advance, slideDuration * 1000);
    }
    return clearNoVoiceTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceUrl, slideIdx, playing, slideDuration]);

  // Música: arranque/paragem segue o estado playing
  useEffect(() => {
    const a = musicAudioRef.current;
    if (!a) return;
    a.volume = musicVolume;
    a.loop = true;
    if (playing) a.play().catch(() => {});
    else a.pause();
  }, [playing, musicVolume]);

  function onVoiceEnded() {
    advance();
  }

  function start() {
    setSlideIdx(0);
    setPlaying(true);
  }

  function stop() {
    setPlaying(false);
    clearNoVoiceTimer();
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

/* ─── FullscreenSlide ─────────────────────────────────────────
   Mostra um único slide preenchendo o ecrã (mantém aspect 9:16).
   Útil em mobile — vê-se grande sem precisar fazer download do PNG.
*/
function FullscreenSlide({
  dia,
  slide,
  indice,
  onClose,
  onDownload,
}: {
  dia: Dia;
  slide: SlideType;
  indice: number;
  onClose: () => void;
  onDownload: () => void;
}) {
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    function fit() {
      const margin = 80;
      const sH = (window.innerHeight - margin) / 1920;
      const sW = (window.innerWidth - 32) / 1080;
      setScale(Math.max(0.15, Math.min(sH, sW)));
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4">
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          onClick={onDownload}
          className="rounded bg-escola-card px-3 py-2 text-xs text-escola-creme hover:bg-escola-bg-light"
        >
          ↓ PNG
        </button>
        <button
          onClick={onClose}
          className="rounded bg-escola-card px-3 py-2 text-xs text-escola-creme hover:bg-escola-bg-light"
        >
          ✕
        </button>
      </div>
      <p className="mb-3 text-center text-xs text-escola-creme-50">
        Dia {dia.numero} · {dia.veu} · slide {indice + 1}/{dia.slides.length}
      </p>
      <div className="overflow-hidden rounded border border-escola-border">
        <Slide dia={dia} slide={slide} indice={indice} scale={scale} />
      </div>
    </div>
  );
}

/* ─── VideoResultCard ─────────────────────────────────────────
   Player do MP4 + legenda editável + botões copiar/descarregar.
*/
function VideoResultCard({
  file,
  url,
  sizeBytes,
  dia,
}: {
  file: string;
  url: string;
  sizeBytes: number;
  dia?: Dia;
}) {
  const [caption, setCaption] = useState(dia ? captionFor(dia) : "");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      alert("Não consegui copiar — selecciona e copia à mão.");
    }
  }

  return (
    <div className="rounded border border-escola-border bg-escola-card p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-sm text-escola-creme">
          {dia ? (
            <>
              Dia {dia.numero} · <span className="text-escola-dourado">{dia.veu}</span>
            </>
          ) : (
            file
          )}
        </p>
        <span className="text-[10px] text-escola-creme-50">
          {(sizeBytes / 1024 / 1024).toFixed(1)} MB
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[200px_1fr]">
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          className="aspect-[9/16] w-full rounded border border-escola-border bg-black"
        />
        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase tracking-wider text-escola-creme-50">
            Legenda (editável)
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={8}
            className="w-full rounded border border-escola-border bg-escola-bg p-2 text-xs text-escola-creme"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copy}
              className="rounded bg-escola-dourado/90 px-3 py-1.5 text-xs font-semibold text-escola-bg hover:bg-escola-dourado"
            >
              {copied ? "✓ copiada" : "⧉ copiar legenda"}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              download
              className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:border-escola-dourado/40"
            >
              ↓ descarregar MP4
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
