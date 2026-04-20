"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { OURO_PROPRIO_SCRIPTS } from "@/data/course-scripts/ouro-proprio";
import { OURO_PROPRIO_MANUAL } from "@/data/course-manuals/ouro-proprio";
import { OURO_PROPRIO_WORKBOOKS } from "@/data/course-workbooks/ouro-proprio";
import { OURO_PROPRIO_YOUTUBE } from "@/data/course-youtube/ouro-proprio";

const ADMIN_EMAILS = ["viv.saraiva@gmail.com"];

type Tab = "scripts" | "manual" | "cadernos" | "youtube";
type ReviewStatus = "pending" | "approved" | "needs_changes";

type ReviewNote = {
  key: string;
  status: ReviewStatus;
  note: string;
};

export default function RevisaoPage() {
  const { user } = useAuth();
  const isAdmin = ADMIN_EMAILS.includes(user?.email || "");

  const [tab, setTab] = useState<Tab>("scripts");
  const [selectedScript, setSelectedScript] = useState<string>("m1a");
  const [selectedModule, setSelectedModule] = useState(0);
  const [selectedYT, setSelectedYT] = useState(0);
  const [reviews, setReviews] = useState<Record<string, ReviewNote>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-escola-creme-50">Acesso restrito.</p>
      </div>
    );
  }

  function setReview(key: string, status: ReviewStatus, note: string) {
    setReviews((prev) => ({ ...prev, [key]: { key, status, note } }));
  }

  function getReview(key: string): ReviewNote {
    return reviews[key] || { key, status: "pending", note: "" };
  }

  // Count stats
  const allScriptKeys = Object.keys(OURO_PROPRIO_SCRIPTS);
  const approvedScripts = allScriptKeys.filter(
    (k) => getReview(`script-${k}`).status === "approved"
  ).length;
  const approvedManual = OURO_PROPRIO_MANUAL.chapters.filter(
    (_, i) => getReview(`manual-${i}`).status === "approved"
  ).length;
  const approvedWorkbooks = OURO_PROPRIO_WORKBOOKS.filter(
    (_, i) => getReview(`workbook-${i}`).status === "approved"
  ).length;
  const approvedYT = OURO_PROPRIO_YOUTUBE.filter(
    (_, i) => getReview(`youtube-${i}`).status === "approved"
  ).length;

  const script = OURO_PROPRIO_SCRIPTS[selectedScript];
  const chapter = OURO_PROPRIO_MANUAL.chapters[selectedModule];
  const workbook = OURO_PROPRIO_WORKBOOKS[selectedModule];
  const yt = OURO_PROPRIO_YOUTUBE[selectedYT];

  const tabs: { id: Tab; label: string; count: string }[] = [
    { id: "scripts", label: "Scripts", count: `${approvedScripts}/${allScriptKeys.length}` },
    { id: "manual", label: "Manual", count: `${approvedManual}/8` },
    { id: "cadernos", label: "Cadernos", count: `${approvedWorkbooks}/8` },
    { id: "youtube", label: "YouTube", count: `${approvedYT}/3` },
  ];

  function StatusBadge({ status }: { status: ReviewStatus }) {
    const colors = {
      pending: "bg-yellow-900/40 text-yellow-300",
      approved: "bg-green-900/40 text-green-300",
      needs_changes: "bg-red-900/40 text-red-300",
    };
    const labels = {
      pending: "Por rever",
      approved: "Aprovado",
      needs_changes: "Alterar",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  }

  function ReviewControls({ reviewKey }: { reviewKey: string }) {
    const review = getReview(reviewKey);
    return (
      <div className="mt-6 p-4 rounded-lg border border-white/10 bg-white/5">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setReview(reviewKey, "approved", review.note)}
            className={`px-4 py-2 rounded text-sm transition ${
              review.status === "approved"
                ? "bg-green-700 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Aprovar
          </button>
          <button
            onClick={() => setReview(reviewKey, "needs_changes", review.note)}
            className={`px-4 py-2 rounded text-sm transition ${
              review.status === "needs_changes"
                ? "bg-red-700 text-white"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            Pedir alteracao
          </button>
        </div>
        <textarea
          placeholder="Notas (ex: tom pesado, simplificar, mais concreto...)"
          value={review.note}
          onChange={(e) => setReview(reviewKey, review.status, e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded p-3 text-sm text-white/80 placeholder:text-white/30 resize-y min-h-[80px]"
        />
      </div>
    );
  }

  function ContentBlock({ label, content }: { label: string; content: string }) {
    const id = `${label}-${selectedScript}-${selectedModule}`;
    const isOpen = expandedSection === id;
    return (
      <div className="mb-4">
        <button
          onClick={() => setExpandedSection(isOpen ? null : id)}
          className="flex items-center gap-2 text-sm font-medium text-amber-400/80 hover:text-amber-300 transition"
        >
          <span className="text-xs">{isOpen ? "▼" : "▶"}</span>
          {label}
        </button>
        {isOpen && (
          <div className="mt-2 pl-4 border-l border-white/10 text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white/90 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
          Revisao de Conteudo
        </p>
        <h1 className="text-3xl font-serif text-escola-dourado">Ouro Proprio</h1>
        <p className="text-sm text-white/50 mt-1 italic">
          A relacao com dinheiro como espelho de ti
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/10 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-t text-sm transition ${
              tab === t.id
                ? "bg-white/10 text-escola-dourado"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {t.label}{" "}
            <span className="text-xs text-white/30">{t.count}</span>
          </button>
        ))}
      </div>

      {/* ─── SCRIPTS TAB ─── */}
      {tab === "scripts" && (
        <div>
          {/* Script selector */}
          <div className="flex flex-wrap gap-1 mb-6">
            {allScriptKeys.map((key) => {
              const s = OURO_PROPRIO_SCRIPTS[key];
              const review = getReview(`script-${key}`);
              return (
                <button
                  key={key}
                  onClick={() => setSelectedScript(key)}
                  className={`px-3 py-1.5 rounded text-xs transition ${
                    selectedScript === key
                      ? "bg-escola-dourado text-escola-bg font-bold"
                      : review.status === "approved"
                        ? "bg-green-900/30 text-green-300"
                        : review.status === "needs_changes"
                          ? "bg-red-900/30 text-red-300"
                          : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {key.toUpperCase()}
                </button>
              );
            })}
          </div>

          {script && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-serif text-escola-dourado">
                  M{script.moduleNumber}{script.subLetter}: {script.title}
                </h2>
                <StatusBadge status={getReview(`script-${selectedScript}`).status} />
              </div>

              <ContentBlock label="Pergunta Inicial" content={script.perguntaInicial} />
              <ContentBlock label="Situacao Humana" content={script.situacaoHumana} />
              <ContentBlock label="Revelacao do Padrao" content={script.revelacaoPadrao} />
              <ContentBlock label="Gesto de Consciencia" content={script.gestoConsciencia} />

              <div className="mt-4 p-3 rounded bg-white/5 border border-escola-dourado/30">
                <p className="text-xs text-escola-dourado/60 mb-1">Frase Final</p>
                <p className="text-white/80 italic">{script.fraseFinal}</p>
              </div>

              <ReviewControls reviewKey={`script-${selectedScript}`} />
            </div>
          )}
        </div>
      )}

      {/* ─── MANUAL TAB ─── */}
      {tab === "manual" && (
        <div>
          <div className="flex gap-1 mb-6">
            {OURO_PROPRIO_MANUAL.chapters.map((ch, i) => {
              const review = getReview(`manual-${i}`);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedModule(i)}
                  className={`px-3 py-1.5 rounded text-xs transition ${
                    selectedModule === i
                      ? "bg-escola-dourado text-escola-bg font-bold"
                      : review.status === "approved"
                        ? "bg-green-900/30 text-green-300"
                        : review.status === "needs_changes"
                          ? "bg-red-900/30 text-red-300"
                          : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  M{ch.moduleNumber}
                </button>
              );
            })}
          </div>

          {chapter && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-serif text-escola-dourado">
                  Modulo {chapter.moduleNumber}: {chapter.title}
                </h2>
                <StatusBadge status={getReview(`manual-${selectedModule}`).status} />
              </div>

              <p className="text-xs text-white/30 italic mb-4">
                {chapter.territoryStage}
              </p>

              <div className="text-white/70 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                {chapter.summary}
              </div>

              <h3 className="text-sm font-medium text-escola-terracota mb-3">
                Perguntas de reflexao
              </h3>
              <ul className="space-y-2 mb-6">
                {chapter.reflectionQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-white/60 pl-4">
                    <span className="text-escola-dourado">~ </span>{q}
                  </li>
                ))}
              </ul>

              <ReviewControls reviewKey={`manual-${selectedModule}`} />
            </div>
          )}
        </div>
      )}

      {/* ─── CADERNOS TAB ─── */}
      {tab === "cadernos" && (
        <div>
          <div className="flex gap-1 mb-6">
            {OURO_PROPRIO_WORKBOOKS.map((wb, i) => {
              const review = getReview(`workbook-${i}`);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedModule(i)}
                  className={`px-3 py-1.5 rounded text-xs transition ${
                    selectedModule === i
                      ? "bg-escola-dourado text-escola-bg font-bold"
                      : review.status === "approved"
                        ? "bg-green-900/30 text-green-300"
                        : review.status === "needs_changes"
                          ? "bg-red-900/30 text-red-300"
                          : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  C{wb.moduleNumber}
                </button>
              );
            })}
          </div>

          {workbook && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-serif text-escola-dourado">
                  {workbook.title}
                </h2>
                <StatusBadge status={getReview(`workbook-${selectedModule}`).status} />
              </div>

              <p className="text-sm text-white/60 mb-4">{workbook.intro}</p>

              <h3 className="text-sm font-medium text-escola-terracota mb-3">
                {workbook.mainExercise.title}
              </h3>
              <ol className="space-y-2 mb-6">
                {workbook.mainExercise.instructions.map((step, i) => (
                  <li key={i} className="text-sm text-white/60 pl-4 flex gap-2">
                    <span className="text-escola-dourado font-bold shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <h3 className="text-sm font-medium text-escola-terracota mb-3">
                Perguntas de reflexao
              </h3>
              <ul className="space-y-2 mb-4">
                {workbook.reflectionQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-white/60 pl-4">
                    <span className="text-escola-dourado">~ </span>{q}
                  </li>
                ))}
              </ul>

              <div className="mb-4 p-3 rounded bg-white/5 text-xs text-white/40">
                <span className="text-escola-dourado">Tabela de registo: </span>
                {workbook.registoColumns.join(" | ")}
              </div>

              <div className="p-3 rounded bg-white/5 border border-escola-dourado/30">
                <p className="text-xs text-escola-dourado/60 mb-1">Ponte para o proximo modulo</p>
                <p className="text-white/70 text-sm italic">{workbook.bridge}</p>
              </div>

              <ReviewControls reviewKey={`workbook-${selectedModule}`} />
            </div>
          )}
        </div>
      )}

      {/* ─── YOUTUBE TAB ─── */}
      {tab === "youtube" && (
        <div>
          <div className="flex gap-1 mb-6">
            {OURO_PROPRIO_YOUTUBE.map((v, i) => {
              const review = getReview(`youtube-${i}`);
              return (
                <button
                  key={i}
                  onClick={() => setSelectedYT(i)}
                  className={`px-3 py-1.5 rounded text-xs transition ${
                    selectedYT === i
                      ? "bg-escola-dourado text-escola-bg font-bold"
                      : review.status === "approved"
                        ? "bg-green-900/30 text-green-300"
                        : review.status === "needs_changes"
                          ? "bg-red-900/30 text-red-300"
                          : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  Video {v.number}
                </button>
              );
            })}
          </div>

          {yt && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-serif text-escola-dourado">
                  {yt.title}
                </h2>
                <StatusBadge status={getReview(`youtube-${selectedYT}`).status} />
              </div>

              <p className="text-xs text-white/30 mb-4">{yt.durationMin} minutos</p>

              <ContentBlock label="Gancho (primeiros 15 seg)" content={yt.gancho} />
              <ContentBlock label="Situacao" content={yt.situacao} />
              <ContentBlock label="Revelacao" content={yt.revelacao} />
              <ContentBlock label="Convite (CTA)" content={yt.convite} />

              <div className="mt-4 p-3 rounded bg-white/5 border border-escola-dourado/30">
                <p className="text-xs text-escola-dourado/60 mb-1">Frase Final (ultimo frame)</p>
                <p className="text-white/80 italic">{yt.fraseFinal}</p>
              </div>

              <ReviewControls reviewKey={`youtube-${selectedYT}`} />
            </div>
          )}
        </div>
      )}

      {/* ─── SUMMARY ─── */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <h3 className="text-sm text-white/40 uppercase tracking-widest mb-4">
          Resumo da revisao
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded bg-white/5">
            <span className="text-white/40">Scripts:</span>{" "}
            <span className="text-green-300">{approvedScripts} aprovados</span>,{" "}
            <span className="text-white/60">
              {allScriptKeys.filter((k) => getReview(`script-${k}`).status === "needs_changes").length} a alterar
            </span>
          </div>
          <div className="p-3 rounded bg-white/5">
            <span className="text-white/40">Manual:</span>{" "}
            <span className="text-green-300">{approvedManual} aprovados</span>
          </div>
          <div className="p-3 rounded bg-white/5">
            <span className="text-white/40">Cadernos:</span>{" "}
            <span className="text-green-300">{approvedWorkbooks} aprovados</span>
          </div>
          <div className="p-3 rounded bg-white/5">
            <span className="text-white/40">YouTube:</span>{" "}
            <span className="text-green-300">{approvedYT} aprovados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
