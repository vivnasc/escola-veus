"use client";

import {
  defaultBlocksForActo,
  type Acto,
  type LessonConfig,
  type Slide,
  type SlideDeck,
} from "@/lib/course-slides";
import type { LessonScript } from "@/data/course-scripts/ouro-proprio";

/**
 * Editor contextual do slide corrente. Em vez de cinco textareas todas
 * empilhadas, mostra só o texto que corresponde ao slide activo (mais
 * o controlo de duração). A edição no sítio evita saltar entre
 * ecrã-cheio e formulário.
 */

const ACTO_LABELS: Record<Acto, string> = {
  pergunta: "I · Pergunta",
  situacao: "II · Situação",
  revelacao: "III · Revelação",
  gesto: "IV · Gesto",
  frase: "V · Frase",
};

const FIELD_BY_ACTO: Record<Acto, keyof LessonScript> = {
  pergunta: "perguntaInicial",
  situacao: "situacaoHumana",
  revelacao: "revelacaoPadrao",
  gesto: "gestoConsciencia",
  frase: "fraseFinal",
};

/**
 * Dado um slide de tipo "conteudo", calcula em que posição está dentro
 * dos blocos do seu acto (0-indexed). Percorre o deck até ao slide e
 * conta blocos do mesmo acto.
 */
export function computeBlockIndex(deck: SlideDeck, slideIdx: number): number {
  const target = deck.slides[slideIdx];
  if (!target || target.tipo !== "conteudo") return -1;
  let count = -1;
  for (let i = 0; i <= slideIdx; i++) {
    const s = deck.slides[i];
    if (s.tipo === "conteudo" && s.acto === target.acto) count++;
  }
  return count;
}

export function CurrentSlideEditor({
  deck,
  slideIdx,
  baseScript,
  config,
  onConfigChange,
}: {
  deck: SlideDeck;
  slideIdx: number;
  baseScript: LessonScript;
  config: LessonConfig;
  onConfigChange: (next: LessonConfig) => void;
}) {
  const slide = deck.slides[slideIdx];
  if (!slide) return null;

  function setDuracao(seconds: number) {
    const next = { ...(config.timingOverrides ?? {}) };
    next[String(slideIdx)] = seconds;
    onConfigChange({ ...config, timingOverrides: next });
  }

  function resetDuracao() {
    const next = { ...(config.timingOverrides ?? {}) };
    delete next[String(slideIdx)];
    onConfigChange({ ...config, timingOverrides: next });
  }

  function setTitulo(value: string) {
    onConfigChange({
      ...config,
      script: { ...(config.script ?? {}), title: value },
    });
  }

  function setBlockText(acto: Acto, blockIdx: number, value: string) {
    const field = FIELD_BY_ACTO[acto];
    const resolvedText =
      ((config.script?.[field as keyof typeof config.script] as string | undefined)?.trim() ||
        (baseScript[field] as string));
    const currentBlocks =
      config.blockSplits?.[acto] && config.blockSplits[acto]!.length > 0
        ? [...config.blockSplits[acto]!]
        : defaultBlocksForActo(acto, resolvedText);
    currentBlocks[blockIdx] = value;
    onConfigChange({
      ...config,
      blockSplits: { ...(config.blockSplits ?? {}), [acto]: currentBlocks },
    });
  }

  const hasCustomDuration = config.timingOverrides?.[String(slideIdx)] != null;
  const header = headerFor(slide);

  return (
    <div className="rounded-xl border border-escola-dourado/30 bg-escola-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-escola-dourado">
            Slide {slideIdx + 1} de {deck.slides.length}
          </p>
          <p className="mt-0.5 font-serif text-base text-escola-creme">{header}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-escola-creme-50">Duração:</span>
          <input
            type="number"
            min={2}
            max={60}
            step={1}
            value={slide.duracao}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v) && v > 0) setDuracao(v);
            }}
            className={`w-16 rounded border bg-escola-bg px-2 py-1 text-right font-mono text-xs text-escola-creme focus:border-escola-dourado/50 focus:outline-none ${
              hasCustomDuration ? "border-escola-dourado/40" : "border-escola-border"
            }`}
          />
          <span className="text-escola-creme-50">s</span>
          {hasCustomDuration && (
            <button
              onClick={resetDuracao}
              className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
              title="Repor automático (1s/5chars)"
            >
              ↺ auto
            </button>
          )}
        </div>
      </div>

      {slide.tipo === "title" && (
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
            Título da aula
          </label>
          <input
            value={config.script?.title ?? baseScript.title}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 font-serif text-sm text-escola-creme focus:border-escola-dourado/50 focus:outline-none"
          />
        </div>
      )}

      {slide.tipo === "conteudo" && (() => {
        const blockIdx = computeBlockIndex(deck, slideIdx);
        return (
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
              Texto deste bloco
            </label>
            <textarea
              value={slide.texto}
              onChange={(e) => setBlockText(slide.acto, blockIdx, e.target.value)}
              rows={slide.acto === "frase" ? 3 : 6}
              className="w-full resize-y rounded border border-escola-border bg-escola-bg px-3 py-2 font-serif text-sm leading-relaxed text-escola-creme focus:border-escola-dourado/50 focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-escola-creme-50">
              {slide.texto.length} chars · duração automática: 1s por 5 chars.
            </p>
          </div>
        );
      })()}

      {slide.tipo === "acto-marker" && (
        <p className="text-xs italic text-escola-creme-50">
          Marcador intersticial — número romano em grande centrado. Sem texto
          editável. Só a duração.
        </p>
      )}

      {slide.tipo === "fecho" && (
        <p className="text-xs italic text-escola-creme-50">
          Fecho — ecrã preto 2s. Sem texto.
        </p>
      )}

      {slide.tipo === "end" && (
        <p className="text-xs italic text-escola-creme-50">
          Cartão final — &ldquo;Escola dos Véus · seteveus.space&rdquo; (fixo).
        </p>
      )}
    </div>
  );
}

function headerFor(slide: Slide): string {
  if (slide.tipo === "title") return "Título da aula";
  if (slide.tipo === "acto-marker") return `${ACTO_LABELS[slide.acto]} · marcador`;
  if (slide.tipo === "conteudo") return `${ACTO_LABELS[slide.acto]}`;
  if (slide.tipo === "fecho") return "Fecho";
  if (slide.tipo === "end") return "Cartão final";
  return "Slide";
}
