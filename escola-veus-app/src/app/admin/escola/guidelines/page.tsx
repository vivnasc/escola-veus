"use client";

import { useState } from "react";
import { getAllCourses } from "@/data/courses";
import {
  SCRIPT_STRUCTURE,
  TONE_GUIDELINES,
  VISUAL_GUIDELINES,
  VISUAL_PALETTE,
  TERRITORY_GUIDES,
  AUDIO_GUIDELINES,
  MANUAL_GUIDELINES,
  WORKBOOK_GUIDELINES,
  PIPELINE_STAGES,
  LAUNCH_ORDER,
  LEGAL_DISCLAIMER,
  buildScriptPrompt,
  buildVisualPrompt,
} from "@/data/course-guidelines";
import Link from "next/link";

type Tab =
  | "script"
  | "tone"
  | "visual"
  | "territories"
  | "audio"
  | "pdf"
  | "pipeline"
  | "generator";

export default function GuidelinesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("script");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState(1);
  const [selectedSub, setSelectedSub] = useState("A");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const courses = getAllCourses();
  const course = courses.find((c) => c.slug === selectedCourse);

  function generateScriptPrompt() {
    if (!course) return;
    const mod = course.modules.find((m) => m.number === selectedModule);
    if (!mod) return;
    const sub = mod.subLessons.find((s) => s.letter === selectedSub);
    if (!sub) return;
    const guide = TERRITORY_GUIDES[course.slug];
    if (!guide) return;

    const prompt = buildScriptPrompt({
      courseTitle: course.title,
      courseSubtitle: course.subtitle,
      arcoEmocional: course.arcoEmocional,
      moduleNumber: mod.number,
      moduleTitle: mod.title,
      moduleDescription: mod.description,
      subLetter: sub.letter,
      subTitle: sub.title,
      subDescription: sub.description,
      territoryGuide: guide,
    });
    setGeneratedPrompt(prompt);
  }

  function generateVisualPromptForSection(sectionName: string) {
    if (!course) return;
    const prompt = buildVisualPrompt({
      courseSlug: course.slug,
      moduleNumber: selectedModule,
      sectionName,
      silhouettePose: "standing",
    });
    setGeneratedPrompt(prompt);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "script", label: "Script" },
    { key: "tone", label: "Tom" },
    { key: "visual", label: "Visual" },
    { key: "territories", label: "Territorios" },
    { key: "audio", label: "Audio" },
    { key: "pdf", label: "PDFs" },
    { key: "pipeline", label: "Pipeline" },
    { key: "generator", label: "Gerador" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-escola-creme">
          Guidelines de Producao
        </h1>
        <p className="mt-1 text-sm text-escola-creme-50">
          Referencia completa para produzir cada curso da Escola dos Veus
        </p>
      </div>

      {/* Navigation links */}
      <div className="flex gap-4 text-sm">
        <Link
          href="/admin/cursos/producao"
          className="text-escola-creme-50 hover:text-escola-creme transition-colors"
        >
          Producao
        </Link>
        <Link
          href="/admin/cursos/territorios"
          className="text-escola-creme-50 hover:text-escola-creme transition-colors"
        >
          Territorios
        </Link>
        <Link
          href="/admin"
          className="text-escola-creme-50 hover:text-escola-creme transition-colors"
        >
          Admin
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-escola-border flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "text-escola-creme border-b-2 border-escola-dourado"
                : "text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Script Structure ── */}
      {activeTab === "script" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-escola-border bg-escola-card p-6">
            <h2 className="font-serif text-xl font-medium text-escola-creme mb-2">
              Estrutura de Cada Video-Aula
            </h2>
            <p className="text-sm text-escola-creme-50 mb-6">
              Todos os videos seguem esta estrutura. Duracao total:{" "}
              {SCRIPT_STRUCTURE.totalDurationMin.min}-
              {SCRIPT_STRUCTURE.totalDurationMin.max} minutos.
            </p>
            <div className="space-y-4">
              {SCRIPT_STRUCTURE.sections.map((section, i) => (
                <div
                  key={section.name}
                  className="flex gap-4 rounded-lg bg-escola-bg p-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-escola-dourado/10 flex items-center justify-center text-escola-dourado text-sm font-mono">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-1">
                      <h3 className="text-escola-creme font-medium">
                        {section.label}
                      </h3>
                      <span className="text-xs text-escola-dourado">
                        {section.durationSec.min}-{section.durationSec.max}s
                      </span>
                    </div>
                    <p className="text-sm text-escola-creme-50 mb-2">
                      {section.instruction}
                    </p>
                    <p className="text-xs text-escola-creme-50/70 italic">
                      Voz: {section.voiceNote}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tone ── */}
      {activeTab === "tone" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-escola-border bg-escola-card p-6">
            <h2 className="font-serif text-xl font-medium text-escola-creme mb-4">
              Tom e Voz
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-escola-dourado text-sm font-medium mb-2">
                  Quem fala
                </h3>
                <p className="text-sm text-escola-creme-50">
                  {TONE_GUIDELINES.voice.who}
                </p>
                <p className="text-sm text-escola-creme-50 mt-2">
                  {TONE_GUIDELINES.voice.style}
                </p>
                <p className="text-sm text-escola-creme mt-2">
                  Pronome: <strong>{TONE_GUIDELINES.voice.pronoun}</strong>
                </p>
              </div>
              <div>
                <h3 className="text-escola-dourado text-sm font-medium mb-2">
                  Escrita
                </h3>
                <div className="space-y-2 text-sm text-escola-creme-50">
                  <p>
                    <span className="text-escola-creme">Frases:</span>{" "}
                    {TONE_GUIDELINES.writing.sentenceLength}
                  </p>
                  <p>
                    <span className="text-escola-creme">Paragrafos:</span>{" "}
                    {TONE_GUIDELINES.writing.paragraphLength}
                  </p>
                  <p>
                    <span className="text-escola-creme">Ritmo:</span>{" "}
                    {TONE_GUIDELINES.writing.rhythm}
                  </p>
                  <p>
                    <span className="text-escola-creme">Referencias:</span>{" "}
                    {TONE_GUIDELINES.writing.references}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-escola-border bg-escola-card p-6">
              <h3 className="text-escola-terracota text-sm font-medium mb-3">
                Proibido
              </h3>
              <ul className="space-y-2">
                {TONE_GUIDELINES.voice.forbidden.map((item, i) => (
                  <li key={i} className="text-sm text-escola-creme-50 flex gap-2">
                    <span className="text-escola-terracota shrink-0">x</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-escola-border bg-escola-card p-6">
              <h3 className="text-green-400 text-sm font-medium mb-3">
                Encorajado
              </h3>
              <ul className="space-y-2">
                {TONE_GUIDELINES.voice.encouraged.map((item, i) => (
                  <li key={i} className="text-sm text-escola-creme-50 flex gap-2">
                    <span className="text-green-400 shrink-0">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── Visual ── */}
      {activeTab === "visual" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-escola-border bg-escola-card p-6">
            <h2 className="font-serif text-xl font-medium text-escola-creme mb-4">
              Paleta Visual
            </h2>
            <div className="flex flex-wrap gap-4 mb-6">
              {Object.entries(VISUAL_PALETTE).map(([name, hex]) => (
                <div key={name} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border border-escola-border"
                    style={{ backgroundColor: hex }}
                  />
                  <div>
                    <p className="text-sm text-escola-creme">{name}</p>
                    <p className="text-xs text-escola-creme-50 font-mono">{hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-escola-border bg-escola-card p-6">
              <h3 className="text-escola-dourado text-sm font-medium mb-3">
                Ceu
              </h3>
              <p className="text-sm text-escola-creme-50">
                {VISUAL_GUIDELINES.sky.description}
              </p>
              <p className="text-sm text-escola-creme-50 mt-2">
                {VISUAL_GUIDELINES.sky.progression}
              </p>
            </div>
            <div className="rounded-xl border border-escola-border bg-escola-card p-6">
              <h3 className="text-escola-dourado text-sm font-medium mb-3">
                Silhueta
              </h3>
              <p className="text-sm text-escola-creme-50 mb-3">
                {VISUAL_GUIDELINES.silhouette.description}
              </p>
              <div className="space-y-1">
                {Object.entries(VISUAL_GUIDELINES.silhouette.poses).map(
                  ([key, desc]) => (
                    <p key={key} className="text-xs text-escola-creme-50">
                      <span className="text-escola-dourado font-mono">
                        {key}
                      </span>{" "}
                      -- {desc}
                    </p>
                  )
                )}
              </div>
            </div>
            <div className="rounded-xl border border-escola-border bg-escola-card p-6">
              <h3 className="text-escola-dourado text-sm font-medium mb-3">
                Tipografia
              </h3>
              <p className="text-sm text-escola-creme-50">
                {VISUAL_GUIDELINES.typography.font}
              </p>
              <p className="text-sm text-escola-creme-50 mt-1">
                {VISUAL_GUIDELINES.typography.color}
              </p>
            </div>
            <div className="rounded-xl border border-escola-border bg-escola-card p-6">
              <h3 className="text-escola-dourado text-sm font-medium mb-3">
                Transicoes
              </h3>
              <p className="text-sm text-escola-creme-50">
                {VISUAL_GUIDELINES.transitions.style}
              </p>
              <p className="text-sm text-escola-terracota mt-2 text-xs">
                {VISUAL_GUIDELINES.transitions.forbidden}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Territories ── */}
      {activeTab === "territories" && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-medium text-escola-creme mb-2">
            10 Territorios do Mundo dos Veus
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(TERRITORY_GUIDES).map(([slug, guide]) => (
              <div
                key={slug}
                className="rounded-xl border border-escola-border bg-escola-card p-5 space-y-3"
              >
                <div>
                  <h3 className="text-escola-creme font-medium">
                    {guide.territory}
                  </h3>
                  <p className="text-escola-dourado text-sm">{guide.course}</p>
                  <p className="text-xs text-escola-creme-50 mt-1">
                    Cor: {guide.color}
                  </p>
                </div>
                <p className="text-sm text-escola-creme-50">
                  {guide.transformation}
                </p>
                <div className="space-y-2">
                  {guide.stageDescriptions.map((desc, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-xs text-escola-dourado font-mono shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-escola-creme-50">{desc}</p>
                    </div>
                  ))}
                </div>
                {guide.connections.length > 0 && (
                  <div className="border-t border-escola-border pt-2">
                    {guide.connections.map((c, i) => (
                      <p key={i} className="text-xs text-escola-creme-50/60 italic">
                        ~ {c}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Audio ── */}
      {activeTab === "audio" && (
        <div className="rounded-xl border border-escola-border bg-escola-card p-6">
          <h2 className="font-serif text-xl font-medium text-escola-creme mb-4">
            Audio -- ElevenLabs
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm text-escola-creme-50">
                <span className="text-escola-creme">Voice ID:</span>{" "}
                <code className="text-escola-dourado">
                  {AUDIO_GUIDELINES.voiceId}
                </code>
              </p>
              <p className="text-sm text-escola-creme-50">
                <span className="text-escola-creme">Modelo v2:</span>{" "}
                {AUDIO_GUIDELINES.model}
              </p>
              <p className="text-sm text-escola-creme-50">
                <span className="text-escola-creme">Modelo v3:</span>{" "}
                {AUDIO_GUIDELINES.modelV3}
              </p>
              <p className="text-sm text-escola-creme-50">
                <span className="text-escola-creme">Formato:</span>{" "}
                {AUDIO_GUIDELINES.format}
              </p>
              <p className="text-sm text-escola-creme-50">
                <span className="text-escola-creme">Naming:</span>{" "}
                <code className="text-escola-dourado text-xs">
                  {AUDIO_GUIDELINES.naming}
                </code>
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-escola-dourado text-sm font-medium">
                Settings
              </h3>
              {Object.entries(AUDIO_GUIDELINES.settings).map(
                ([key, val]) => (
                  <p key={key} className="text-sm text-escola-creme-50">
                    <span className="text-escola-creme font-mono text-xs">
                      {key}:
                    </span>{" "}
                    {String(val)}
                  </p>
                )
              )}
            </div>
          </div>
          <div className="mt-6 border-t border-escola-border pt-4">
            <h3 className="text-escola-dourado text-sm font-medium mb-2">
              Marcadores de Pausa
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(AUDIO_GUIDELINES.pauseMarkers).map(
                ([key, val]) => (
                  <code
                    key={key}
                    className="rounded-lg bg-escola-bg px-3 py-1 text-sm text-escola-dourado"
                  >
                    {val}
                  </code>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PDFs ── */}
      {activeTab === "pdf" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-escola-border bg-escola-card p-6">
            <h2 className="font-serif text-xl font-medium text-escola-creme mb-4">
              Manual do Curso (~{MANUAL_GUIDELINES.pages} paginas)
            </h2>
            <ol className="space-y-2">
              {MANUAL_GUIDELINES.structure.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-escola-creme-50">
                  <span className="text-escola-dourado font-mono shrink-0">
                    {i + 1}.
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border border-escola-border bg-escola-card p-6">
            <h2 className="font-serif text-xl font-medium text-escola-creme mb-4">
              Caderno de Exercicios ({WORKBOOK_GUIDELINES.count} por curso, ~
              {WORKBOOK_GUIDELINES.pagesPerWorkbook} pag cada)
            </h2>
            <ol className="space-y-2">
              {WORKBOOK_GUIDELINES.structure.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-escola-creme-50">
                  <span className="text-escola-dourado font-mono shrink-0">
                    {i + 1}.
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* ── Pipeline ── */}
      {activeTab === "pipeline" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-escola-border bg-escola-card p-6">
            <h2 className="font-serif text-xl font-medium text-escola-creme mb-4">
              Pipeline de Producao
            </h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {PIPELINE_STAGES.map((stage, i) => (
                <div key={stage.stage} className="flex items-center gap-2">
                  <div className="bg-escola-dourado/10 text-escola-dourado px-3 py-1.5 rounded-lg text-sm">
                    {stage.label}
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <span className="text-escola-creme-50/30">&rarr;</span>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {PIPELINE_STAGES.map((stage) => (
                <div
                  key={stage.stage}
                  className="rounded-lg bg-escola-bg p-4"
                >
                  <h3 className="text-escola-creme text-sm font-medium">
                    {stage.label}
                  </h3>
                  <p className="text-xs text-escola-creme-50 mt-1">
                    {stage.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-escola-border bg-escola-card p-6">
            <h2 className="font-serif text-xl font-medium text-escola-creme mb-4">
              Ordem de Lancamento
            </h2>
            <div className="space-y-2">
              {LAUNCH_ORDER.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-center gap-4 rounded-lg bg-escola-bg px-4 py-3"
                >
                  <span className="text-escola-dourado font-mono text-sm w-6">
                    {item.priority}.
                  </span>
                  <span className="text-escola-creme text-sm flex-1">
                    {item.slug}
                  </span>
                  <span className="text-xs text-escola-creme-50">
                    {item.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-escola-border bg-escola-card p-4">
            <p className="text-xs text-escola-creme-50 italic">
              {LEGAL_DISCLAIMER}
            </p>
          </div>
        </div>
      )}

      {/* ── Prompt Generator ── */}
      {activeTab === "generator" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-escola-border bg-escola-card p-6">
            <h2 className="font-serif text-xl font-medium text-escola-creme mb-4">
              Gerador de Prompts
            </h2>
            <p className="text-sm text-escola-creme-50 mb-6">
              Selecciona um curso e sub-aula para gerar o prompt de script ou
              visual.
            </p>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div>
                <label className="block text-xs text-escola-creme-50 mb-1">
                  Curso
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setSelectedModule(1);
                    setSelectedSub("A");
                  }}
                  className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2.5 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {courses.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.number}. {c.title}
                    </option>
                  ))}
                </select>
              </div>
              {course && (
                <div>
                  <label className="block text-xs text-escola-creme-50 mb-1">
                    Modulo
                  </label>
                  <select
                    value={selectedModule}
                    onChange={(e) => {
                      setSelectedModule(Number(e.target.value));
                      setSelectedSub("A");
                    }}
                    className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2.5 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
                  >
                    {course.modules.map((m) => (
                      <option key={m.number} value={m.number}>
                        M{m.number}: {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {course && (
                <div>
                  <label className="block text-xs text-escola-creme-50 mb-1">
                    Sub-aula
                  </label>
                  <select
                    value={selectedSub}
                    onChange={(e) => setSelectedSub(e.target.value)}
                    className="w-full rounded-lg border border-escola-border bg-escola-bg px-3 py-2.5 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
                  >
                    {course.modules
                      .find((m) => m.number === selectedModule)
                      ?.subLessons.map((s) => (
                        <option key={s.letter} value={s.letter}>
                          {s.letter}) {s.title}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={generateScriptPrompt}
                disabled={!course}
                className="rounded-lg bg-escola-dourado px-4 py-3 text-sm font-medium text-escola-bg hover:opacity-90 disabled:opacity-50"
              >
                Gerar Prompt de Script
              </button>
              <button
                onClick={() =>
                  generateVisualPromptForSection("situacao_humana")
                }
                disabled={!course}
                className="rounded-lg border border-escola-border bg-escola-card px-4 py-3 text-sm text-escola-creme hover:border-escola-dourado/40 disabled:opacity-50"
              >
                Gerar Prompt Visual
              </button>
            </div>

            {generatedPrompt && (
              <div className="relative">
                <pre className="rounded-lg bg-escola-bg p-3 text-xs text-escola-creme-50 whitespace-pre-wrap overflow-x-auto max-h-[60vh] overflow-y-auto">
                  {generatedPrompt}
                </pre>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(generatedPrompt)
                  }
                  className="absolute top-3 right-3 text-xs rounded-lg border border-escola-border bg-escola-card px-3 py-1 text-escola-creme-50 hover:border-escola-dourado/40"
                >
                  Copiar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
