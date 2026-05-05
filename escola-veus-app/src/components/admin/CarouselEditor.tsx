"use client";

import { useEffect, useState } from "react";
import { Slide } from "@/app/admin/producao/carrossel-veus/Slide";
import type { Dia, Slide as SlideType } from "@/lib/carousel-types";

/**
 * Modal de edição de um slide ou de metadados do dia.
 * Usa estado local para os inputs; commit só acontece em "Guardar".
 */
export function EditModal({
  dia,
  slideIdx,
  onClose,
  onSaveDia,
  onSaveSlide,
}: {
  dia: Dia;
  slideIdx: number; // -1 = editar dia (veu+subtitulo); >=0 = editar slide
  onClose: () => void;
  onSaveDia: (patch: Partial<Dia>) => void;
  onSaveSlide: (patch: Partial<SlideType>) => void;
}) {
  const isDia = slideIdx === -1;
  const slide = isDia ? null : dia.slides[slideIdx];

  const [veu, setVeu] = useState(dia.veu);
  const [subtitulo, setSubtitulo] = useState(dia.subtitulo);
  const [linha1, setLinha1] = useState(slide?.tipo === "capa" ? slide.linha1 : "");
  const [linha2, setLinha2] = useState(slide?.tipo === "capa" ? slide.linha2 : "");
  const [titulo, setTitulo] = useState(slide?.tipo === "conteudo" ? slide.titulo ?? "" : "");
  const [texto, setTexto] = useState(slide?.tipo === "conteudo" ? slide.texto : "");
  const [estilo, setEstilo] = useState<"poetico" | "prosa">(
    slide?.tipo === "conteudo" ? slide.estilo : "prosa"
  );
  const [icone, setIcone] = useState(slide?.tipo === "cta" ? slide.icone : "");
  const [recurso, setRecurso] = useState(slide?.tipo === "cta" ? slide.recurso : "");
  const [descricao, setDescricao] = useState(slide?.tipo === "cta" ? slide.descricao : "");
  const [url, setUrl] = useState(slide?.tipo === "cta" ? slide.url : "");

  function save() {
    if (isDia) {
      onSaveDia({ veu, subtitulo });
    } else if (slide?.tipo === "capa") {
      onSaveSlide({ tipo: "capa", linha1, linha2 });
    } else if (slide?.tipo === "conteudo") {
      onSaveSlide({ tipo: "conteudo", estilo, titulo: titulo || undefined, texto });
    } else if (slide?.tipo === "cta") {
      onSaveSlide({ tipo: "cta", icone, recurso, descricao, url });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-escola-border bg-escola-card p-5">
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-lg text-escola-creme">
            {isDia ? `Editar Dia ${dia.numero}` : `Editar slide ${slideIdx + 1} · ${dia.veu}`}
          </h3>
          <button onClick={onClose} className="text-escola-creme-50 hover:text-escola-creme">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-sm">
          {isDia && (
            <>
              <Field label="Palavra-tema (maiúsculas, ex: PERMANÊNCIA)">
                <input
                  value={veu}
                  onChange={(e) => setVeu(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
              <Field label="Subtítulo (italic, no fim da capa)">
                <input
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
            </>
          )}

          {slide?.tipo === "capa" && (
            <>
              <Field label="Linha 1 (abertura)">
                <input
                  value={linha1}
                  onChange={(e) => setLinha1(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
              <Field label="Linha 2 (abertura)">
                <input
                  value={linha2}
                  onChange={(e) => setLinha2(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
            </>
          )}

          {slide?.tipo === "conteudo" && (
            <>
              <Field label="Estilo">
                <div className="flex gap-2">
                  {(["prosa", "poetico"] as const).map((e) => (
                    <button
                      key={e}
                      onClick={() => setEstilo(e)}
                      className={`rounded border px-3 py-1 text-xs ${
                        estilo === e
                          ? "border-escola-dourado text-escola-dourado"
                          : "border-escola-border text-escola-creme-50"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Título pequeno (opcional, ex: HÁBITO DA ESTAÇÃO)">
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="vazio = sem título"
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme placeholder:text-escola-creme-50"
                />
              </Field>
              <Field label="Texto (Enter para quebra de linha em poético)">
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  rows={6}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
            </>
          )}

          {slide?.tipo === "cta" && (
            <>
              <Field label="Ícone (emoji)">
                <input
                  value={icone}
                  onChange={(e) => setIcone(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
              <Field label="Recurso (ex: Os 7 Véus do Despertar)">
                <input
                  value={recurso}
                  onChange={(e) => setRecurso(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
              <Field label="Descrição">
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={2}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
              <Field label="URL (mostrado em terracota)">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                />
              </Field>
            </>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:border-escola-dourado/40"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            className="rounded bg-escola-dourado/90 px-4 py-1.5 text-xs font-semibold text-escola-bg hover:bg-escola-dourado"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-escola-creme-50">
        {label}
      </span>
      {children}
    </label>
  );
}

/**
 * Mostra um único slide preenchendo o ecrã (mantém aspect 9:16).
 * Útil em mobile para ver o slide grande sem precisar fazer download.
 */
export function FullscreenSlide({
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
