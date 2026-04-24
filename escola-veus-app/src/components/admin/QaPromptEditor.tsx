"use client";

import { useEffect, useState } from "react";

/**
 * Editor das instrucoes extras do system prompt do Q&A.
 * Guardadas em course-assets/admin/aulas-qa-prompt.json. Cada pergunta a
 * /api/courses/ask carrega estas instrucoes e anexa-as ao fim do system
 * prompt construido por renderSystemPrompt.
 *
 * Permite afinar tom sem deploy.
 */
export function QaPromptEditor() {
  const [value, setValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/aulas/qa-prompt", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setValue(d.extraInstructions ?? "");
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Debounced save
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      setState("saving");
      try {
        const res = await fetch("/api/admin/aulas/qa-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ extraInstructions: value }),
        });
        if (!res.ok) throw new Error("save failed");
        setState("saved");
        setTimeout(() => setState((s) => (s === "saved" ? "idle" : s)), 1500);
      } catch {
        setState("error");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [value, loaded]);

  return (
    <div className="rounded-xl border border-escola-border bg-escola-card p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-escola-creme">
          Instruções extras para o Q&A com Claude
        </h3>
        <span className="text-[10px] text-escola-creme-50">
          {state === "saving" && "A guardar…"}
          {state === "saved" && "✓ Guardado"}
          {state === "error" && <span className="text-red-400">Erro a guardar</span>}
        </span>
      </div>
      <p className="mb-4 text-xs leading-relaxed text-escola-creme-50">
        O que escreveres aqui é <strong>anexado ao fim</strong> do system
        prompt em todas as perguntas. Usa para afinar tom, vocabulário, limites,
        frases que não queres ouvir, exemplos concretos, etc. Guarda automático.
        Sem deploy.
      </p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={20}
        placeholder="Ex.: Responde sempre em 2 parágrafos curtos. Nunca uses a palavra 'jornada'. Quando a aluna pergunta algo financeiro concreto, remete para contabilista."
        className="w-full resize-y rounded-lg border border-escola-border bg-escola-bg px-4 py-3 font-serif text-sm leading-relaxed text-escola-creme placeholder:text-escola-creme-50 focus:border-escola-dourado/50 focus:outline-none"
      />
      <p className="mt-2 text-[10px] text-escola-creme-50">
        {value.length} chars · o prompt base vive em{" "}
        <code className="rounded bg-escola-border px-1">src/lib/course-context.ts</code>.
      </p>
    </div>
  );
}
