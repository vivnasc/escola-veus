"use client";

import { useState } from "react";
import { defaultBlocksForActo, type Acto, type LessonConfig } from "@/lib/course-slides";
import type { LessonScript } from "@/data/course-scripts/ouro-proprio";

/**
 * Editor "tudo de uma vez" da sub-aula. Cinco campos (título + 4 actos
 * narrativos + frase final) numa só vista, para varrer acentos / corrigir
 * em massa sem navegar slide a slide.
 *
 * Edita o `config.script` directamente. Quando há `config.blockSplits` para
 * um acto, este editor avisa que mexer no texto do acto vai descartar a
 * quebra manual em blocos (porque a quebra deixa de fazer sentido).
 */

const FIELDS: Array<{
  key: keyof LessonScript;
  label: string;
  placeholder?: string;
  rows: number;
  acto?: Acto;
}> = [
  { key: "title", label: "Título da aula", rows: 1 },
  { key: "perguntaInicial", label: "I · Pergunta inicial", rows: 4, acto: "pergunta" },
  { key: "situacaoHumana", label: "II · Situação humana", rows: 10, acto: "situacao" },
  { key: "revelacaoPadrao", label: "III · Revelação do padrão", rows: 10, acto: "revelacao" },
  { key: "gestoConsciencia", label: "IV · Gesto de consciência", rows: 6, acto: "gesto" },
  { key: "fraseFinal", label: "V · Frase final", rows: 2, acto: "frase" },
];

export function BulkTextEditor({
  baseScript,
  config,
  onConfigChange,
}: {
  baseScript: LessonScript;
  config: LessonConfig;
  onConfigChange: (next: LessonConfig) => void;
}) {
  const [open, setOpen] = useState(false);

  function valueFor(field: keyof LessonScript): string {
    const override = config.script?.[field as keyof typeof config.script] as string | undefined;
    if (typeof override === "string" && override.length > 0) return override;
    return (baseScript[field] as string) ?? "";
  }

  function setField(field: keyof LessonScript, value: string, acto?: Acto) {
    const next: LessonConfig = {
      ...config,
      script: { ...(config.script ?? {}), [field]: value },
    };

    // Se o utilizador alterou o texto de um acto que tinha quebra manual de
    // blocos, reverter a quebra ao default (recomputado contra o novo texto)
    // para não ficar com blocos desfasados do conteúdo.
    if (acto && config.blockSplits?.[acto]) {
      const newBlocks = defaultBlocksForActo(acto, value);
      const splits = { ...(config.blockSplits ?? {}) };
      // Substitui pelo default (mais previsível) — se ela quiser reagrupar
      // depois, faz no editor contextual.
      splits[acto] = newBlocks;
      // Se o resultado bate certo com o default sobre o texto, limpa o override
      const matches = newBlocks.length === defaultBlocksForActo(acto, value).length;
      if (matches) delete splits[acto];
      next.blockSplits = Object.keys(splits).length === 0 ? undefined : splits;
    }

    onConfigChange(next);
  }

  function revertField(field: keyof LessonScript, acto?: Acto) {
    const nextScript = { ...(config.script ?? {}) };
    delete nextScript[field as keyof typeof nextScript];
    const next: LessonConfig = {
      ...config,
      script: Object.keys(nextScript).length === 0 ? undefined : nextScript,
    };
    if (acto && config.blockSplits?.[acto]) {
      const splits = { ...config.blockSplits };
      delete splits[acto];
      next.blockSplits = Object.keys(splits).length === 0 ? undefined : splits;
    }
    onConfigChange(next);
  }

  return (
    <div className="rounded-xl border border-escola-border bg-escola-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left"
      >
        <div>
          <h3 className="text-sm font-medium text-escola-creme">
            ✏️ Editar todos os textos desta aula
          </h3>
          <p className="mt-0.5 text-[11px] text-escola-creme-50">
            Os 5 campos do script de uma só vez. Útil para varrer acentos ou
            reescrever blocos. Auto-guarda.
          </p>
        </div>
        <span className="text-escola-creme-50">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-escola-border px-5 py-4">
          {FIELDS.map((f) => {
            const value = valueFor(f.key);
            const isOverride = !!(config.script?.[f.key as keyof typeof config.script]);
            const hasManualSplit = f.acto ? !!config.blockSplits?.[f.acto] : false;
            return (
              <div key={f.key as string}>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider text-escola-dourado">
                    {f.label}
                  </label>
                  <div className="flex items-center gap-2 text-[10px] text-escola-creme-50">
                    <span>{value.length} chars</span>
                    {isOverride && (
                      <button
                        onClick={() => revertField(f.key, f.acto)}
                        className="text-escola-creme-50 hover:text-escola-creme"
                        title="Repor texto original do repo (descarta quebra manual de blocos deste acto)"
                      >
                        ↩ original
                      </button>
                    )}
                  </div>
                </div>
                {f.key === "title" ? (
                  <input
                    value={value}
                    onChange={(e) => setField(f.key, e.target.value, f.acto)}
                    className={`w-full rounded border bg-escola-bg px-3 py-2 font-serif text-sm text-escola-creme focus:border-escola-dourado/50 focus:outline-none ${
                      isOverride ? "border-escola-dourado/30" : "border-escola-border"
                    }`}
                  />
                ) : (
                  <textarea
                    value={value}
                    onChange={(e) => setField(f.key, e.target.value, f.acto)}
                    rows={f.rows}
                    className={`w-full resize-y rounded border bg-escola-bg px-3 py-2 font-serif text-sm leading-relaxed text-escola-creme focus:border-escola-dourado/50 focus:outline-none ${
                      isOverride ? "border-escola-dourado/30" : "border-escola-border"
                    }`}
                  />
                )}
                {hasManualSplit && (
                  <p className="mt-1 text-[10px] text-escola-creme-50">
                    ⚠ Este acto tinha blocos partidos à mão. Mudar o texto aqui
                    descartou-os e voltou à quebra automática. Reagrupa no
                    editor contextual do slide se precisares.
                  </p>
                )}
              </div>
            );
          })}
          <p className="text-[10px] text-escola-creme-50">
            Os campos com borda dourada têm overrides em cima do script original.
            Carrega em &ldquo;↩ original&rdquo; para repor um campo individual.
          </p>
        </div>
      )}
    </div>
  );
}
