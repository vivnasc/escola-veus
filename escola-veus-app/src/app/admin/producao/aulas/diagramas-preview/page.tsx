"use client";

import { useState } from "react";
import Link from "next/link";
import {
  renderDiagram,
  DIAGRAM_LABELS,
  type Diagram,
  type DiagramType,
} from "@/lib/diagrams";
import { ambientParticles, ambientPresence } from "@/lib/slide-ambient";

/**
 * Galeria local de diagramas — vês todos os 5 templates no fundo roxo da
 * Escola, com termos de exemplo editáveis. ZERO chamadas a Claude, zero
 * GitHub Actions, zero custo. Use para iterar visualmente antes de
 * gastar créditos a aplicar a sub-aulas reais.
 *
 * Selector de cor de acento permite testar em qualquer território.
 */

const ACCENTS: Array<{ name: string; color: string }> = [
  { name: "Ouro Próprio (#D4A853)", color: "#D4A853" },
  { name: "Sangue e Seda (#A0344A)", color: "#A0344A" },
  { name: "Pele Nua (#C4745A)", color: "#C4745A" },
  { name: "A Chama (#D4533B)", color: "#D4533B" },
  { name: "Limite Sagrado (#D4A853)", color: "#D4A853" },
  { name: "Voz de Dentro (#6D28D9)", color: "#6D28D9" },
  { name: "O Silêncio que Grita (#7E8EA6)", color: "#7E8EA6" },
];

const SAMPLES: Record<DiagramType, Diagram> = {
  circulo: { type: "circulo", terms: ["dignidade"] },
  triade: { type: "triade", terms: ["medo", "vergonha", "desejo"] },
  pareado: { type: "pareado", terms: ["agarrar", "soltar"] },
  sequencia: {
    type: "sequencia",
    terms: ["abrir", "respirar", "notar", "fechar"],
  },
  anel: {
    type: "anel",
    central: "dinheiro",
    terms: ["medo", "vergonha", "controlo", "alívio", "culpa", "desejo"],
  },
};

export default function DiagramasPreviewPage() {
  const [accent, setAccent] = useState(ACCENTS[0].color);
  const [diagrams, setDiagrams] = useState<Record<DiagramType, Diagram>>({
    ...SAMPLES,
  });

  function setDiagram(type: DiagramType, next: Diagram) {
    setDiagrams((prev) => ({ ...prev, [type]: next }));
  }

  function setTerm(type: DiagramType, idx: number, value: string) {
    const d = diagrams[type];
    const terms = [...d.terms];
    terms[idx] = value;
    setDiagram(type, { ...d, terms });
  }

  function setCentral(type: DiagramType, value: string) {
    setDiagram(type, { ...diagrams[type], central: value });
  }

  function reset(type: DiagramType) {
    setDiagram(type, SAMPLES[type]);
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/producao/aulas"
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            ← Aulas
          </Link>
          <h1 className="mt-2 font-serif text-2xl text-escola-creme">
            Galeria de diagramas — pré-visualização local
          </h1>
          <p className="mt-1 text-sm text-escola-creme-50">
            Os 5 templates com termos editáveis. Sem chamadas a Claude, sem
            renders. Testa aqui antes de aplicar a sub-aulas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-escola-creme-50">
            Cor de acento
          </label>
          <select
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme focus:border-escola-dourado/50 focus:outline-none"
          >
            {ACCENTS.map((a) => (
              <option key={a.color} value={a.color}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {(Object.keys(SAMPLES) as DiagramType[]).map((t) => {
          const d = diagrams[t];
          return (
            <section
              key={t}
              className="overflow-hidden rounded-xl border border-escola-border bg-escola-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-escola-border px-4 py-3">
                <div>
                  <h2 className="font-serif text-base text-escola-creme">
                    {DIAGRAM_LABELS[t]}
                  </h2>
                  <p className="text-[11px] text-escola-creme-50">
                    Tipo: <code className="rounded bg-escola-border px-1">{t}</code>
                  </p>
                </div>
                <button
                  onClick={() => reset(t)}
                  className="rounded border border-escola-border px-2 py-1 text-[10px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
                >
                  ↩ termos de exemplo
                </button>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[1fr_320px]">
                {/* Slide simulado: fundo roxo, partículas no fundo, silhueta
                    a respirar, fio vertical à esquerda, marca da Escola
                    no canto, diagrama centrado. Tudo o que vai estar no
                    slide real. */}
                <div
                  className="relative aspect-video overflow-hidden rounded-lg"
                  style={{ backgroundColor: "#141428" }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ pointerEvents: "none" }}
                    dangerouslySetInnerHTML={{ __html: ambientParticles(1920, 1080, accent) }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ pointerEvents: "none" }}
                    dangerouslySetInnerHTML={{ __html: ambientPresence(accent) }}
                  />

                  {/* Fio vertical à esquerda */}
                  <div
                    className="absolute"
                    style={{
                      left: "4%",
                      top: "12%",
                      bottom: "12%",
                      width: "1px",
                      backgroundColor: accent,
                      opacity: 0.35,
                    }}
                  />

                  {/* Label do acto (placeholder) */}
                  <div
                    className="absolute left-[6%] top-[6%] text-[8px] uppercase"
                    style={{ color: accent, letterSpacing: "3px" }}
                  >
                    III · REVELAÇÃO
                  </div>

                  {/* Diagrama centrado */}
                  <div
                    className="absolute inset-0 flex items-center justify-center px-[10%]"
                    dangerouslySetInnerHTML={{ __html: renderDiagram(d, accent) }}
                  />

                  {/* Marca da Escola no canto inferior direito */}
                  <div
                    className="absolute right-[6%] bottom-[6%]"
                    style={{ color: accent, fontFamily: '"Nunito", sans-serif' }}
                  >
                    <div
                      className="ml-auto mb-1 h-px w-12"
                      style={{ backgroundColor: accent, opacity: 0.4 }}
                    />
                    <div
                      className="text-[8px] uppercase"
                      style={{ opacity: 0.6, letterSpacing: "5px" }}
                    >
                      Escola dos Véus
                    </div>
                  </div>
                </div>

                {/* Inputs para os termos */}
                <div className="space-y-3">
                  {t === "anel" && (
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-dourado">
                        Central
                      </label>
                      <input
                        value={d.central ?? ""}
                        onChange={(e) => setCentral(t, e.target.value)}
                        className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-sm text-escola-creme focus:border-escola-dourado/50 focus:outline-none"
                      />
                    </div>
                  )}
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-dourado">
                      Termos ({d.terms.length})
                    </label>
                    <div className="space-y-1.5">
                      {d.terms.map((term, i) => (
                        <input
                          key={i}
                          value={term}
                          placeholder={`Termo ${i + 1}`}
                          onChange={(e) => setTerm(t, i, e.target.value)}
                          className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-sm text-escola-creme focus:border-escola-dourado/50 focus:outline-none"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-8 text-center text-[11px] text-escola-creme-50">
        Quando estiveres satisfeita com a estética, vai ao{" "}
        <Link
          href="/admin/producao/aulas"
          className="text-escola-dourado hover:underline"
        >
          painel de aulas
        </Link>{" "}
        e usa a Revisão Claude ou o picker individual no slide para aplicar a
        sub-aulas reais.
      </p>
    </div>
  );
}
