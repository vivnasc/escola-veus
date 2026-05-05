"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import * as htmlToImage from "html-to-image";
import JSZip from "jszip";
import { Slide } from "@/app/admin/producao/carrossel-veus/Slide";
import type { Dia, Slide as SlideType } from "@/lib/carousel-types";
import { romanFor } from "@/lib/carousel-types";
import { EditModal, FullscreenSlide } from "@/components/admin/CarouselEditor";

const PREVIEW_SCALE = 0.18;
const EXPORT_PIXEL_RATIO = 2;

type Colecao = {
  id: string;
  slug: string;
  title: string;
  brief: string;
  dias: Dia[];
  updatedAt: string;
};

export default function ColecaoEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [col, setCol] = useState<Colecao | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState<{ diaIdx: number; slideIdx: number } | null>(null);
  const [fullscreen, setFullscreen] = useState<{ dia: Dia; slide: SlideType; indice: number } | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/admin/colecoes/${id}`, { cache: "no-store" });
        const data = await r.json();
        if (r.ok) setCol(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function updateSlide(diaIdx: number, slideIdx: number, patch: Partial<SlideType>) {
    if (!col) return;
    const dias = col.dias.map((d, di) => {
      if (di !== diaIdx) return d;
      return {
        ...d,
        slides: d.slides.map((s, si) =>
          si === slideIdx ? ({ ...s, ...patch } as SlideType) : s
        ),
      };
    });
    setCol({ ...col, dias });
    setDirty(true);
  }

  function updateDia(diaIdx: number, patch: Partial<Dia>) {
    if (!col) return;
    const dias = col.dias.map((d, di) => {
      if (di !== diaIdx) return d;
      const merged: Dia = { ...d, ...patch };
      // refrescar romano se preciso
      merged.romano = romanFor(merged.numero, col.dias.length);
      return merged;
    });
    setCol({ ...col, dias });
    setDirty(true);
  }

  async function save() {
    if (!col) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/colecoes/${col.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dias: col.dias, title: col.title }),
      });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.erro || `HTTP ${r.status}`);
      }
      setDirty(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Falha ao guardar: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  async function downloadSlide(dia: Dia, slideIdx: number) {
    const key = `${dia.numero}-${slideIdx}`;
    setDownloading(key);
    try {
      const node = document.querySelector<HTMLElement>(`[data-slide="${key}"]`);
      if (!node) return;
      const dataUrl = await htmlToImage.toPng(node, {
        pixelRatio: EXPORT_PIXEL_RATIO,
        width: 1080,
        height: 1920,
        cacheBust: true,
      });
      const blob = await (await fetch(dataUrl)).blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${col?.slug ?? "slide"}-dia-${dia.numero}-slide-${slideIdx + 1}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  }

  async function downloadAllZip() {
    if (!col) return;
    setDownloading("all");
    try {
      const zip = new JSZip();
      for (const dia of col.dias) {
        const folder = zip.folder(`dia-${dia.numero}`)!;
        for (let i = 0; i < dia.slides.length; i++) {
          const key = `${dia.numero}-${i}`;
          const node = document.querySelector<HTMLElement>(`[data-slide="${key}"]`);
          if (!node) continue;
          const dataUrl = await htmlToImage.toPng(node, {
            pixelRatio: EXPORT_PIXEL_RATIO,
            width: 1080,
            height: 1920,
            cacheBust: true,
          });
          const blob = await (await fetch(dataUrl)).blob();
          folder.file(`slide-${i + 1}.png`, blob);
        }
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${col.slug}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-escola-creme-50">A carregar…</p>;
  }
  if (!col) {
    return (
      <div>
        <p className="mb-2 text-sm text-red-300">Colecção não encontrada.</p>
        <Link href="/admin/producao/colecoes" className="text-xs text-escola-dourado underline">
          ← voltar à lista
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-3">
        <Link href="/admin/producao/colecoes" className="text-xs text-escola-creme-50 hover:text-escola-dourado">
          ← colecções
        </Link>
        <span className="text-xs text-escola-creme-50">/ {col.slug}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <input
            value={col.title}
            onChange={(e) => {
              setCol({ ...col, title: e.target.value });
              setDirty(true);
            }}
            className="mb-2 w-full bg-transparent font-serif text-2xl font-semibold text-escola-creme focus:outline-none"
          />
          <p className="text-xs italic text-escola-creme-50">{col.brief}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={downloadAllZip}
            disabled={downloading !== null}
            className="rounded border border-escola-border px-3 py-2 text-xs text-escola-creme hover:border-escola-dourado/40 disabled:opacity-40"
          >
            {downloading === "all" ? "a gerar…" : "↓ PNGs (ZIP)"}
          </button>
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="rounded bg-escola-dourado/90 px-4 py-2 text-sm font-semibold text-escola-bg hover:bg-escola-dourado disabled:opacity-40"
          >
            {saving ? "A guardar…" : dirty ? "Guardar alterações" : "✓ Guardado"}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {col.dias.map((dia, diaIdx) => (
          <section key={dia.numero}>
            <header className="mb-3 flex items-baseline justify-between gap-2 border-b border-escola-border pb-2 text-sm">
              <span className="text-escola-creme-50">
                Dia {dia.numero} · <span className="text-escola-dourado">{dia.veu}</span> ·{" "}
                <em>{dia.subtitulo}</em>
              </span>
              <button
                onClick={() => setEditing({ diaIdx, slideIdx: -1 })}
                className="text-xs text-escola-creme-50 hover:text-escola-dourado"
              >
                ✏ editar dia
              </button>
            </header>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {dia.slides.map((slide, i) => {
                const key = `${dia.numero}-${i}`;
                return (
                  <div key={key} className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFullscreen({ dia, slide, indice: i })}
                      className="overflow-hidden rounded border border-escola-border bg-black hover:border-escola-dourado/60"
                    >
                      <div data-slide={key}>
                        <Slide dia={dia} slide={slide} indice={i} scale={PREVIEW_SCALE} />
                      </div>
                    </button>
                    <div className="flex w-full items-center justify-between gap-1 px-1">
                      <span className="text-[10px] uppercase tracking-wider text-escola-creme-50">
                        {tipoLabel(slide)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditing({ diaIdx, slideIdx: i })}
                          className="rounded bg-escola-card px-2 py-0.5 text-[10px] text-escola-creme hover:bg-escola-bg-light"
                        >
                          ✏
                        </button>
                        <button
                          onClick={() => downloadSlide(dia, i)}
                          disabled={downloading !== null}
                          className="rounded bg-escola-card px-2 py-0.5 text-[10px] text-escola-creme hover:bg-escola-bg-light disabled:opacity-40"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {editing && (
        <EditModal
          dia={col.dias[editing.diaIdx]}
          slideIdx={editing.slideIdx}
          onClose={() => setEditing(null)}
          onSaveDia={(patch) => updateDia(editing.diaIdx, patch)}
          onSaveSlide={(patch) =>
            editing.slideIdx >= 0 && updateSlide(editing.diaIdx, editing.slideIdx, patch)
          }
        />
      )}

      {fullscreen && (
        <FullscreenSlide
          dia={fullscreen.dia}
          slide={fullscreen.slide}
          indice={fullscreen.indice}
          onClose={() => setFullscreen(null)}
          onDownload={() => downloadSlide(fullscreen.dia, fullscreen.indice)}
        />
      )}

      <p className="mt-12 rounded border border-escola-border bg-escola-card p-3 text-[11px] text-escola-creme-50">
        Voz + vídeo: por agora, a pipeline de narração + MP4 funciona apenas para a Estação dos Véus
        em <Link href="/admin/producao/carrossel-veus" className="text-escola-dourado underline">
        /admin/producao/carrossel-veus</Link>. Avançar para gerar vídeos arbitrários a partir desta
        colecção é o próximo passo.
      </p>
    </div>
  );
}

function tipoLabel(s: SlideType) {
  if (s.tipo === "capa") return "capa";
  if (s.tipo === "cta") return "cta";
  return s.estilo;
}
