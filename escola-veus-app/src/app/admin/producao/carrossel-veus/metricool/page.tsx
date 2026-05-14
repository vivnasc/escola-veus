"use client";

import { useMemo, useRef, useState } from "react";
import {
  buildCarouselCaption,
  buildCarouselCsv,
  type CarouselPost,
} from "@/lib/carousel-social/metricool-csv";

/**
 * Exportador Metricool para carrosséis · conta pessoal (IG + TikTok).
 *
 * Fluxo:
 *  1. Para cada dia: arrasta os PNGs/JPGs do carrossel (até 10).
 *     O app faz upload para Supabase e mostra-te as thumbnails.
 *  2. Define data + hora + frase + tema.
 *  3. Descarrega CSV pronto para drag-drop em Metricool > Planning > Calendar > Import CSV.
 *
 * WhatsApp Status fica de fora — usa a caption "WhatsApp" abaixo para publicar manual.
 *
 * NOTA: o upload é para o bucket Supabase `course-assets`, pasta
 * `carrossel-social/{slug-do-dia}/`. URLs públicas são geradas automaticamente.
 */

type DiaSemana = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const DIAS_PT: Record<DiaSemana, string> = {
  mon: "Segunda",
  tue: "Terça",
  wed: "Quarta",
  thu: "Quinta",
  fri: "Sexta",
  sat: "Sábado",
  sun: "Domingo",
};

const DIAS_ORDEM: DiaSemana[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

type SlideUpload = {
  name: string;
  url: string;
  sizeBytes: number;
};

type DiaRow = {
  dia: DiaSemana;
  date: string;
  time: string;
  texto: string;
  tema: string;
  slides: SlideUpload[];
  uploading: { done: number; total: number } | null;
  error: string | null;
};

function isoHoje(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function diaDaSemana(iso: string): DiaSemana {
  const [y, m, d] = iso.split("-").map(Number);
  const w = new Date(y, m - 1, d).getDay();
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as DiaSemana[])[w];
}

export default function CarrosselMetricoolPage() {
  const [startDate, setStartDate] = useState<string>(isoHoje());
  const [defaultTime, setDefaultTime] = useState<string>("13:00");
  const [cta, setCta] = useState<string>("Guarda este post para voltares mais tarde 💛");
  const [folderPrefix, setFolderPrefix] = useState<string>(() =>
    `semana-${isoHoje()}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase()
  );

  const [rows, setRows] = useState<DiaRow[]>(() =>
    DIAS_ORDEM.map((dia, i) => ({
      dia,
      date: addDays(isoHoje(), i),
      time: "13:00",
      texto: "",
      tema: "",
      slides: [],
      uploading: null,
      error: null,
    }))
  );

  const syncDates = (nextStart: string, nextTime: string) => {
    setRows((prev) =>
      prev.map((r, i) => ({
        ...r,
        dia: diaDaSemana(addDays(nextStart, i)),
        date: addDays(nextStart, i),
        time: r.time === defaultTime ? nextTime : r.time,
      }))
    );
    setStartDate(nextStart);
    setDefaultTime(nextTime);
  };

  const uploadSlides = async (rowIdx: number, files: FileList | File[]) => {
    const list = Array.from(files).filter((f) =>
      /\.(png|jpe?g|webp)$/i.test(f.name)
    );
    if (list.length === 0) {
      setRows((prev) => {
        const next = [...prev];
        next[rowIdx] = { ...next[rowIdx], error: "Sem PNG/JPG/WebP." };
        return next;
      });
      return;
    }

    setRows((prev) => {
      const next = [...prev];
      next[rowIdx] = {
        ...next[rowIdx],
        uploading: { done: 0, total: list.length },
        error: null,
      };
      return next;
    });

    const uploaded: SlideUpload[] = [];
    const folder = `${folderPrefix}-${rows[rowIdx].dia}-${rows[rowIdx].date}`
      .replace(/[^a-z0-9-]/gi, "-")
      .toLowerCase();

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      try {
        const res = await fetch("/api/admin/carrossel-veus/social-upload", {
          method: "POST",
          body: form,
        });
        const json = await res.json();
        if (!res.ok) {
          setRows((prev) => {
            const next = [...prev];
            next[rowIdx] = {
              ...next[rowIdx],
              error: `${file.name}: ${json.erro || `HTTP ${res.status}`}`,
              uploading: null,
            };
            return next;
          });
          return;
        }
        uploaded.push({
          name: json.name,
          url: json.url,
          sizeBytes: json.sizeBytes,
        });
      } catch (e) {
        setRows((prev) => {
          const next = [...prev];
          next[rowIdx] = {
            ...next[rowIdx],
            error: `${file.name}: ${e instanceof Error ? e.message : String(e)}`,
            uploading: null,
          };
          return next;
        });
        return;
      }
      setRows((prev) => {
        const next = [...prev];
        next[rowIdx] = {
          ...next[rowIdx],
          uploading: { done: i + 1, total: list.length },
        };
        return next;
      });
    }

    setRows((prev) => {
      const next = [...prev];
      const merged = [...next[rowIdx].slides, ...uploaded].slice(0, 10);
      next[rowIdx] = {
        ...next[rowIdx],
        slides: merged,
        uploading: null,
      };
      return next;
    });
  };

  const removeSlide = (rowIdx: number, slideIdx: number) => {
    setRows((prev) => {
      const next = [...prev];
      const slides = next[rowIdx].slides.filter((_, i) => i !== slideIdx);
      next[rowIdx] = { ...next[rowIdx], slides };
      return next;
    });
  };

  const posts: CarouselPost[] = useMemo(() => {
    return rows
      .map((r) => {
        if (r.slides.length === 0 || !r.texto.trim()) return null;
        const post: CarouselPost = {
          id: `${r.date}-${r.dia}`,
          date: r.date,
          time: r.time,
          slideUrls: r.slides.map((s) => s.url),
          instagramCaption: buildCarouselCaption({
            texto: r.texto.trim(),
            tema: r.tema.trim() || undefined,
            cta: cta || undefined,
            platform: "instagram",
          }),
          tiktokCaption: buildCarouselCaption({
            texto: r.texto.trim(),
            tema: r.tema.trim() || undefined,
            platform: "tiktok",
          }),
          tiktokTitle: r.texto.trim().slice(0, 80),
        };
        return post;
      })
      .filter((x): x is CarouselPost => x !== null);
  }, [rows, cta]);

  const totalSlides = posts.reduce((acc, p) => acc + p.slideUrls.length, 0);

  const downloadCsv = () => {
    const csv = buildCarouselCsv(posts);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carrossel-veus-pessoal-${startDate}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const previewWhatsapp = (texto: string, tema: string) =>
    buildCarouselCaption({
      texto: texto.trim() || "(frase do dia)",
      tema: tema.trim() || undefined,
      platform: "whatsapp",
    });

  return (
    <div className="space-y-6 p-4">
      <header className="space-y-2">
        <h1 className="font-serif text-2xl text-escola-dourado">
          Carrossel · CSV Metricool (conta pessoal)
        </h1>
        <p className="text-sm text-escola-creme-50">
          1 carrossel por dia, em Instagram + TikTok. Por cada dia, arrasta os
          slides PNG/JPG (até 10) e o app faz upload para Supabase. Depois
          descarregas um CSV que vais arrastar para a Metricool em{" "}
          <strong className="text-escola-creme">
            Planning &gt; Calendar &gt; Import CSV
          </strong>
          . O WhatsApp Status fica de fora — usa o texto pré-formatado para
          colares quando publicares no telemóvel.
        </p>
      </header>

      <section className="grid gap-3 rounded-lg border border-escola-border bg-escola-card p-4 sm:grid-cols-4">
        <label className="text-xs text-escola-creme-50">
          Data início (segunda da semana)
          <input
            type="date"
            value={startDate}
            onChange={(e) => syncDates(e.target.value, defaultTime)}
            className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
          />
        </label>
        <label className="text-xs text-escola-creme-50">
          Hora default (HH:MM CAT)
          <input
            type="time"
            value={defaultTime}
            onChange={(e) => syncDates(startDate, e.target.value)}
            className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
          />
        </label>
        <label className="text-xs text-escola-creme-50">
          CTA Instagram (opcional)
          <input
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
          />
        </label>
        <label className="text-xs text-escola-creme-50">
          Pasta Supabase (identificador da semana)
          <input
            value={folderPrefix}
            onChange={(e) => setFolderPrefix(e.target.value)}
            className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 font-mono text-escola-creme"
          />
        </label>
      </section>

      <section className="space-y-3">
        {rows.map((r, i) => (
          <DiaCard
            key={`${r.dia}-${r.date}-${i}`}
            row={r}
            onTimeChange={(time) =>
              setRows((prev) => {
                const next = [...prev];
                next[i] = { ...next[i], time };
                return next;
              })
            }
            onTextChange={(texto) =>
              setRows((prev) => {
                const next = [...prev];
                next[i] = { ...next[i], texto };
                return next;
              })
            }
            onTemaChange={(tema) =>
              setRows((prev) => {
                const next = [...prev];
                next[i] = { ...next[i], tema };
                return next;
              })
            }
            onUpload={(files) => uploadSlides(i, files)}
            onRemoveSlide={(idx) => removeSlide(i, idx)}
            whatsappPreview={previewWhatsapp(r.texto, r.tema)}
          />
        ))}
      </section>

      <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-escola-border bg-escola-card p-4 shadow-lg">
        <div className="text-xs text-escola-creme-50">
          <strong className="text-escola-creme">{posts.length}</strong> dia
          {posts.length === 1 ? "" : "s"} com slides ·{" "}
          <strong className="text-escola-creme">{totalSlides}</strong> slide
          {totalSlides === 1 ? "" : "s"} no total ·{" "}
          <strong className="text-escola-creme">{posts.length * 2}</strong>{" "}
          linhas no CSV (IG + TT)
        </div>
        <button
          onClick={downloadCsv}
          disabled={posts.length === 0}
          className="rounded-md border border-escola-dourado/60 bg-escola-dourado/10 px-4 py-2 text-sm text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-40"
        >
          Descarregar CSV Metricool
        </button>
      </footer>
    </div>
  );
}

function DiaCard({
  row,
  onTimeChange,
  onTextChange,
  onTemaChange,
  onUpload,
  onRemoveSlide,
  whatsappPreview,
}: {
  row: DiaRow;
  onTimeChange: (time: string) => void;
  onTextChange: (texto: string) => void;
  onTemaChange: (tema: string) => void;
  onUpload: (files: FileList | File[]) => void;
  onRemoveSlide: (idx: number) => void;
  whatsappPreview: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="rounded-lg border border-escola-border bg-escola-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
        <div className="text-base text-escola-dourado">
          {DIAS_PT[row.dia]}{" "}
          <span className="text-xs text-escola-creme-50">{row.date}</span>
        </div>
        <input
          type="time"
          value={row.time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-xs text-escola-creme-50">
            Frase / texto principal
            <textarea
              rows={3}
              value={row.texto}
              onChange={(e) => onTextChange(e.target.value)}
              className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
              placeholder="Mensagem principal deste carrossel…"
            />
          </label>
          <label className="block text-xs text-escola-creme-50">
            Tema (hashtag única, sem #)
            <input
              value={row.tema}
              onChange={(e) => onTemaChange(e.target.value)}
              placeholder="ex: autoamor"
              className="mt-1 w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme"
            />
          </label>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-escola-creme-50">
            <span>
              Slides ({row.slides.length}/10){" "}
              {row.uploading && (
                <span className="text-escola-dourado">
                  · a carregar {row.uploading.done}/{row.uploading.total}
                </span>
              )}
            </span>
            <button
              onClick={() => inputRef.current?.click()}
              className="rounded border border-escola-dourado/60 bg-escola-dourado/10 px-2 py-1 text-[11px] text-escola-dourado hover:bg-escola-dourado/20"
            >
              Escolher ficheiros
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) onUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <div
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) onUpload(e.dataTransfer.files);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            className={`rounded-lg border-2 border-dashed p-3 text-center text-xs transition-colors ${
              dragOver
                ? "border-escola-dourado bg-escola-dourado/5 text-escola-dourado"
                : "border-escola-border bg-escola-bg/30 text-escola-creme-50"
            }`}
          >
            Arrasta PNG/JPG dos slides para aqui
          </div>

          {row.error && (
            <div className="mt-2 rounded border border-red-700/40 bg-red-900/20 p-2 text-xs text-red-300">
              {row.error}
            </div>
          )}

          {row.slides.length > 0 && (
            <div className="mt-2 grid grid-cols-5 gap-1">
              {row.slides.map((s, idx) => (
                <div
                  key={s.url}
                  className="relative aspect-[9/16] overflow-hidden rounded border border-escola-border"
                  title={s.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.url}
                    alt={`slide ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-1 text-[10px] text-escola-creme">
                    {idx + 1}
                    {idx === 0 ? " (capa)" : ""}
                  </div>
                  <button
                    onClick={() => onRemoveSlide(idx)}
                    className="absolute right-0.5 bottom-0.5 rounded bg-black/60 px-1 text-[10px] text-red-300 hover:bg-black/80"
                    title="Remover"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {row.texto.trim() && (
        <details className="mt-3 text-xs text-escola-creme-50">
          <summary className="cursor-pointer hover:text-escola-creme">
            Pré-visualizar captions (IG · TikTok · WhatsApp)
          </summary>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <CaptionPreview label="Instagram" text={whatsappPreview /* substituído abaixo */} hidden />
            <CaptionPreview
              label="Instagram"
              text={buildCarouselCaption({
                texto: row.texto.trim(),
                tema: row.tema.trim() || undefined,
                platform: "instagram",
              })}
            />
            <CaptionPreview
              label="TikTok"
              text={buildCarouselCaption({
                texto: row.texto.trim(),
                tema: row.tema.trim() || undefined,
                platform: "tiktok",
              })}
            />
            <CaptionPreview label="WhatsApp Status (manual)" text={whatsappPreview} />
          </div>
        </details>
      )}
    </div>
  );
}

function CaptionPreview({
  label,
  text,
  hidden,
}: {
  label: string;
  text: string;
  hidden?: boolean;
}) {
  if (hidden) return null;
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="rounded border border-escola-border bg-escola-bg p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] text-escola-dourado">{label}</span>
        <button
          onClick={onCopy}
          className="rounded border border-escola-border px-1.5 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-creme"
        >
          Copiar
        </button>
      </div>
      <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap break-words font-sans text-[10px] leading-relaxed text-escola-creme">
        {text}
      </pre>
    </div>
  );
}
