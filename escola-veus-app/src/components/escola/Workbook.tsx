"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type WorkbookProps = {
  courseSlug: string;
  moduleNumber: number;
  workbookTitle: string;
};

type WorkbookData = {
  reflections: string[];
  table: { noticed: string; felt: string; remember: string };
  freeText: string;
};

const STARTER_PHRASES = [
  "O que me surpreendeu foi…",
  "Reconheço que…",
  "O que quero lembrar é…",
];

const REFLECTION_PROMPTS = [
  "O que descobri sobre mim neste módulo?",
  "Que padrão reconheci que não tinha visto antes?",
  "O que mudou na forma como vejo isto?",
];

export function Workbook({ courseSlug, moduleNumber, workbookTitle }: WorkbookProps) {
  const { user } = useAuth();
  const [data, setData] = useState<WorkbookData>({
    reflections: ["", "", ""],
    table: { noticed: "", felt: "", remember: "" },
    freeText: "",
  });
  const [saved, setSaved] = useState(true);
  const [activeSection, setActiveSection] = useState<number>(0);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load saved data
  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: journal } = await supabase
        .from("escola_journal")
        .select("content")
        .eq("user_id", user!.id)
        .eq("course_slug", courseSlug)
        .eq("module_number", moduleNumber)
        .eq("sublesson_letter", "workbook")
        .single();

      if (journal?.content) {
        try {
          const parsed = JSON.parse(journal.content);
          setData(parsed);
        } catch {
          // Legacy plain text — put in freeText
          setData((prev) => ({ ...prev, freeText: journal.content }));
        }
      }
    }
    load();
  }, [user, courseSlug, moduleNumber]);

  // Auto-save
  const save = useCallback(
    async (newData: WorkbookData) => {
      if (!user) return;
      setSaved(false);
      await supabase.from("escola_journal").upsert(
        {
          user_id: user.id,
          course_slug: courseSlug,
          module_number: moduleNumber,
          sublesson_letter: "workbook",
          content: JSON.stringify(newData),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_slug,module_number,sublesson_letter" }
      );
      setSaved(true);
    },
    [user, courseSlug, moduleNumber]
  );

  const updateData = useCallback(
    (updater: (prev: WorkbookData) => WorkbookData) => {
      setData((prev) => {
        const next = updater(prev);
        setSaved(false);
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => save(next), 1500);
        return next;
      });
    },
    [save]
  );

  const totalWords = [
    ...data.reflections,
    data.table.noticed,
    data.table.felt,
    data.table.remember,
    data.freeText,
  ]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  const sections = [
    { title: "Perguntas de reflexão", icon: "?" },
    { title: "Registo", icon: "=" },
    { title: "Espaco livre", icon: "~" },
  ];

  return (
    <div className="space-y-6">
      {/* Section tabs */}
      <div className="flex gap-1 rounded-lg bg-escola-bg p-1">
        {sections.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSection(i)}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              activeSection === i
                ? "bg-[var(--t-primary,#C9A96E)]/15 text-[var(--t-primary,#C9A96E)]"
                : "text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Section 0: Reflection prompts */}
      {activeSection === 0 && (
        <div className="space-y-4">
          {REFLECTION_PROMPTS.map((prompt, i) => (
            <div key={i} className="rounded-xl border border-escola-border bg-escola-card p-4">
              <label className="mb-2 block text-sm font-medium text-escola-creme">
                {prompt}
              </label>
              <textarea
                value={data.reflections[i] || ""}
                onChange={(e) =>
                  updateData((prev) => {
                    const r = [...prev.reflections];
                    r[i] = e.target.value;
                    return { ...prev, reflections: r };
                  })
                }
                placeholder="Escreve aqui..."
                className="min-h-[80px] w-full resize-y rounded-lg border border-escola-border bg-escola-bg px-4 py-3 font-serif text-sm leading-relaxed text-escola-creme placeholder:text-escola-creme-50/40 focus:border-[var(--t-primary,#C9A96E)]/40 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      {/* Section 1: Table — noticed / felt / remember */}
      {activeSection === 1 && (
        <div className="space-y-4">
          <p className="text-xs text-escola-creme-50">
            Regista o que ficou deste modulo em tres dimensoes.
          </p>
          {[
            { key: "noticed" as const, label: "O que notei", placeholder: "Padroes, reaccoes, pensamentos..." },
            { key: "felt" as const, label: "Onde senti", placeholder: "No corpo, na emocao, na memoria..." },
            { key: "remember" as const, label: "O que quero lembrar", placeholder: "Uma frase, uma imagem, uma decisao..." },
          ].map((field) => (
            <div key={field.key} className="rounded-xl border border-escola-border bg-escola-card p-4">
              <label
                className="mb-2 block text-xs uppercase tracking-wide"
                style={{ color: "var(--t-primary, #C9A96E)" }}
              >
                {field.label}
              </label>
              <textarea
                value={data.table[field.key]}
                onChange={(e) =>
                  updateData((prev) => ({
                    ...prev,
                    table: { ...prev.table, [field.key]: e.target.value },
                  }))
                }
                placeholder={field.placeholder}
                className="min-h-[60px] w-full resize-y rounded-lg border border-escola-border bg-escola-bg px-4 py-3 font-serif text-sm leading-relaxed text-escola-creme placeholder:text-escola-creme-50/40 focus:border-[var(--t-primary,#C9A96E)]/40 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      {/* Section 2: Free text */}
      {activeSection === 2 && (
        <div className="rounded-xl border border-escola-border bg-escola-card p-4">
          <label className="mb-2 block text-xs uppercase tracking-wide" style={{ color: "var(--t-primary, #C9A96E)" }}>
            As tuas palavras
          </label>
          <p className="mb-3 text-xs text-escola-creme-50">
            Escreve o que quiseres. Este espaco e so teu.
          </p>

          <textarea
            value={data.freeText}
            onChange={(e) => updateData((prev) => ({ ...prev, freeText: e.target.value }))}
            placeholder="O que me ficou deste modulo..."
            className="min-h-[160px] w-full resize-y rounded-lg border border-escola-border bg-escola-bg px-4 py-3 font-serif text-sm leading-relaxed text-escola-creme placeholder:text-escola-creme-50/40 focus:border-[var(--t-primary,#C9A96E)]/40 focus:outline-none"
          />

          {/* Starter phrases */}
          {data.freeText.length === 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {STARTER_PHRASES.map((phrase) => (
                <button
                  key={phrase}
                  onClick={() => updateData((prev) => ({ ...prev, freeText: phrase + " " }))}
                  className="rounded-full border border-escola-border px-3 py-1.5 font-serif text-xs italic text-escola-creme-50 transition-colors hover:border-[var(--t-primary,#C9A96E)]/40 hover:text-escola-creme"
                >
                  {phrase}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer: word count + save status */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-escola-creme-50">
          {totalWords > 0 && `${totalWords} ${totalWords === 1 ? "palavra" : "palavras"}`}
          {totalWords >= 50 && " — estas a ir fundo"}
        </span>
        <span className="text-[10px] text-escola-creme-50">
          {!saved ? "A guardar..." : totalWords > 0 ? "Guardado" : ""}
        </span>
      </div>
    </div>
  );
}
