"use client";

import { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import JSZip from "jszip";
import { CAMPANHA, DIAS, type Dia, type Slide as SlideType } from "./content";
import { Slide } from "./Slide";

const PREVIEW_SCALE = 0.18; // 1080×1920 → ~194×346 no preview
const EXPORT_PIXEL_RATIO = 2; // 2160×3840 PNG final

const SUPABASE_URL = "https://tdytdamtfillqyklgrmb.supabase.co";
const AG_MUSIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/audios/albums/ancient-ground`;
const AG_TOTAL_TRACKS = 100;

function agTrackUrl(n: number): string {
  return `${AG_MUSIC_BASE}/faixa-${String(n).padStart(2, "0")}.mp3`;
}

type VideoEntry = { file: string; url: string; sizeBytes: number };
type RenderStatus = {
  jobId: string;
  status: "queued" | "running" | "done" | "failed" | "not_found";
  progress?: number;
  phase?: string;
  videos?: VideoEntry[];
  error?: string;
};

type DownloadKey = string; // `dia-slide`

function fileNameFor(dia: Dia, slideIdx: number) {
  return `veu-${dia.numero}-slide-${slideIdx + 1}.png`;
}

async function nodeToPng(node: HTMLElement): Promise<Blob> {
  // Captura sempre o div "real" (1080×1920) — o pixelRatio dá 2160×3840.
  const dataUrl = await htmlToImage.toPng(node, {
    pixelRatio: EXPORT_PIXEL_RATIO,
    width: 1080,
    height: 1920,
    cacheBust: true,
  });
  const res = await fetch(dataUrl);
  return await res.blob();
}

export default function CarrosselVeusPage() {
  const refs = useRef<Map<DownloadKey, HTMLDivElement>>(new Map());
  const [busy, setBusy] = useState<DownloadKey | "all" | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  // Vídeos (voz + música)
  const [musicTrack, setMusicTrack] = useState<number>(1);
  const [musicVolume, setMusicVolume] = useState<number>(0.4);
  const [submittingVideo, setSubmittingVideo] = useState(false);
  const [job, setJob] = useState<RenderStatus | null>(null);
  const [workflowUrl, setWorkflowUrl] = useState<string | null>(null);

  // Polling do status do job
  useEffect(() => {
    if (!job?.jobId) return;
    if (job.status === "done" || job.status === "failed") return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/admin/carrossel-veus/render-status?jobId=${encodeURIComponent(job.jobId)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = (await res.json()) as RenderStatus;
          setJob(data);
        }
      } catch {
        // mantém o último estado conhecido
      }
    }, 5000);
    return () => clearInterval(id);
  }, [job?.jobId, job?.status]);

  async function submitVideoJob() {
    setSubmittingVideo(true);
    try {
      const res = await fetch("/api/admin/carrossel-veus/render-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          musicUrl: agTrackUrl(musicTrack),
          musicVolume,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || `HTTP ${res.status}`);
      setJob({ jobId: data.jobId, status: "queued" });
      setWorkflowUrl(data.workflowRunUrl || null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(`Falha a submeter: ${msg}`);
    } finally {
      setSubmittingVideo(false);
    }
  }

  function setRef(key: DownloadKey, el: HTMLDivElement | null) {
    if (el) refs.current.set(key, el);
    else refs.current.delete(key);
  }

  async function downloadSlide(dia: Dia, slideIdx: number) {
    const key = `${dia.numero}-${slideIdx}`;
    const node = refs.current.get(key);
    if (!node) return;
    // o nó tem o wrapper escalado; precisamos do filho real (1080×1920)
    const real = node.firstElementChild as HTMLElement | null;
    if (!real) return;
    setBusy(key);
    try {
      const blob = await nodeToPng(real);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileNameFor(dia, slideIdx);
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
          const key = `${dia.numero}-${i}`;
          const node = refs.current.get(key);
          const real = node?.firstElementChild as HTMLElement | null;
          if (!real) continue;
          const blob = await nodeToPng(real);
          folder.file(fileNameFor(dia, i), blob);
          done++;
          setProgress({ done, total: 42 });
        }
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
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

  async function downloadDiaZip(dia: Dia) {
    const key = `dia-${dia.numero}`;
    setBusy(key);
    try {
      const zip = new JSZip();
      const folder = zip.folder(`dia-${dia.numero}`)!;
      for (let i = 0; i < dia.slides.length; i++) {
        const k = `${dia.numero}-${i}`;
        const node = refs.current.get(k);
        const real = node?.firstElementChild as HTMLElement | null;
        if (!real) continue;
        const blob = await nodeToPng(real);
        folder.file(fileNameFor(dia, i), blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dia-${dia.numero}-${slugifyVeu(dia.veu)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
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
            42 slides verticais (1080×1920, exportados a 2160×3840) para status diário do WhatsApp.
            7 dias × 6 slides. Clica em "PNG" para descarregar um, ou "ZIP" para descarregar o dia/tudo.
          </p>
        </div>
        <button
          onClick={downloadAllZip}
          disabled={busy !== null}
          className="shrink-0 rounded bg-escola-dourado/90 px-4 py-2 text-sm font-semibold text-escola-bg hover:bg-escola-dourado disabled:opacity-40"
        >
          {busy === "all"
            ? `A gerar… ${progress?.done ?? 0}/${progress?.total ?? 42}`
            : "↓ Descarregar tudo (ZIP)"}
        </button>
      </div>

      <div className="space-y-10">
        {DIAS.map((dia) => (
          <section key={dia.numero}>
            <header className="mb-3 flex items-baseline justify-between gap-3 border-b border-escola-border pb-2">
              <div>
                <h3 className="font-serif text-lg text-escola-creme">
                  Dia {dia.numero} · <span className="text-escola-dourado">{dia.veu}</span>
                </h3>
                <p className="text-xs italic text-escola-creme-50">{dia.subtitulo}</p>
              </div>
              <button
                onClick={() => downloadDiaZip(dia)}
                disabled={busy !== null}
                className="shrink-0 rounded border border-escola-border px-3 py-1 text-xs text-escola-creme hover:border-escola-dourado/40 disabled:opacity-40"
              >
                {busy === `dia-${dia.numero}` ? "A gerar…" : "↓ Dia (ZIP)"}
              </button>
            </header>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {dia.slides.map((slide, i) => {
                const key = `${dia.numero}-${i}`;
                return (
                  <div key={key} className="flex flex-col items-center gap-2">
                    <div
                      ref={(el) => setRef(key, el)}
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
                        {busy === key ? "…" : "↓ PNG"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-lg border border-escola-border bg-escola-card p-5">
        <h3 className="mb-2 font-serif text-lg text-escola-creme">
          Vídeos com voz + música (status WhatsApp ~60s)
        </h3>
        <p className="mb-4 text-xs text-escola-creme-50">
          Gera 7 MP4 verticais (1 por dia) com narração ElevenLabs (voz dos Véus) e
          uma faixa Ancient Ground por baixo. Corre numa GitHub Action (~15-30 min).
          Quando terminar, descarregas aqui.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block text-xs text-escola-creme-50">
            Faixa Ancient Ground (1–{AG_TOTAL_TRACKS})
            <input
              type="number"
              min={1}
              max={AG_TOTAL_TRACKS}
              value={musicTrack}
              onChange={(e) =>
                setMusicTrack(Math.max(1, Math.min(AG_TOTAL_TRACKS, Number(e.target.value) || 1)))
              }
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
              onClick={submitVideoJob}
              disabled={submittingVideo || (job !== null && job.status !== "done" && job.status !== "failed")}
              className="w-full rounded bg-escola-dourado/90 px-4 py-2 text-sm font-semibold text-escola-bg hover:bg-escola-dourado disabled:opacity-40"
            >
              {submittingVideo ? "A submeter…" : "▶ Gerar vídeos"}
            </button>
          </div>
        </div>

        {job && (
          <div className="mt-5 rounded border border-escola-border bg-escola-bg p-4 text-xs">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="text-escola-creme-50">Job:</span>{" "}
                <code className="text-escola-dourado">{job.jobId}</code>
              </div>
              <span
                className={
                  job.status === "done"
                    ? "rounded bg-green-700/30 px-2 py-0.5 text-green-300"
                    : job.status === "failed"
                    ? "rounded bg-red-700/30 px-2 py-0.5 text-red-300"
                    : "rounded bg-escola-dourado/20 px-2 py-0.5 text-escola-dourado"
                }
              >
                {job.status}
                {job.phase ? ` · ${job.phase}` : ""}
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
            {job.error && <p className="mb-2 text-red-300">Erro: {job.error}</p>}
            {job.status === "done" && job.videos && job.videos.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 font-semibold text-escola-creme">Descarregar:</p>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {job.videos.map((v) => (
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
    </div>
  );
}

function tipoLabel(s: SlideType) {
  if (s.tipo === "capa") return "capa";
  if (s.tipo === "cta") return "cta";
  return s.estilo;
}

function slugifyVeu(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
