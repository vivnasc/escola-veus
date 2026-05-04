"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

/**
 * /admin/producao/longos/[slug]
 *
 * Detail view dum projecto long-form. Fase 1: read-only (script +
 * capítulos + prompts visíveis), download JSON, edit título/thumbnail,
 * editar narrationUrl manualmente. Fase 2/3 expandem: image gen, render.
 */

type LongoProject = {
  slug: string;
  titulo: string;
  tema: string;
  thumbnailText: string;
  capitulos: { titulo: string; ancora: string }[];
  script: string;
  prompts: { id: string; category: string; mood: string[]; prompt: string }[];
  promptCount: number;
  wordCount: number;
  narrationUrl?: string;
  durationSec?: number; // real, vem do MP3 gerado
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

const DEFAULT_VOICE_ID = "JGnWZj684pcXmK2SxYIv"; // mesma voz dos mini-eps Nomear

// Parte o script por capítulos (## headings markdown). Cada capítulo é
// um chunk para gerar separadamente em ElevenLabs (mais fiável que enviar
// 3000+ palavras numa só chamada — fica dentro dos limits de char por
// request seja qual for o plano, e permite progress bar).
function splitScriptByChapters(script: string): { titulo: string; texto: string }[] {
  const lines = script.split("\n");
  const chapters: { titulo: string; texto: string }[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];
  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      if (currentLines.length > 0 || currentTitle) {
        chapters.push({
          titulo: currentTitle || "Intro",
          texto: currentLines.join("\n").trim(),
        });
      }
      currentTitle = m[1].trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentLines.length > 0 || currentTitle) {
    chapters.push({
      titulo: currentTitle || "Intro",
      texto: currentLines.join("\n").trim(),
    });
  }
  // Filtra capítulos sem texto (só título)
  return chapters.filter((c) => c.texto.length > 20);
}

export default function LongoDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;

  const [project, setProject] = useState<LongoProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [narrationInput, setNarrationInput] = useState("");
  const [tituloDraft, setTituloDraft] = useState("");
  const [thumbDraft, setThumbDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // Geração automática de narração via ElevenLabs (chunked by chapter + concat)
  const [narrating, setNarrating] = useState(false);
  const [narrProgress, setNarrProgress] = useState<{
    phase: "idle" | "chunks" | "concat" | "done";
    currentChunk: number;
    totalChunks: number;
    chunkUrls: string[];
    chunkErrors: string[];
  } | null>(null);
  const [narrErr, setNarrErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/longos/load?slug=${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setProject(d as LongoProject);
      setNarrationInput((d as LongoProject).narrationUrl ?? "");
      setTituloDraft((d as LongoProject).titulo ?? "");
      setThumbDraft((d as LongoProject).thumbnailText ?? "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const patchProject = async (patch: Partial<LongoProject>) => {
    if (!project) return;
    setSaving(true);
    setInfo(null);
    try {
      const r = await fetch("/api/admin/longos/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: project.slug, ...patch }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setProject(d.project as LongoProject);
      setInfo("✓ Guardado");
      setTimeout(() => setInfo(null), 2000);
    } catch (e) {
      setInfo(`Erro: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Gerar narração automaticamente via ElevenLabs ────────────────────
  // Workflow:
  //   1. Parte o script por capítulos (## headings).
  //   2. Para cada capítulo, POST /api/admin/audio-bulk/generate-one (já
  //      existe — mesma infra dos mini-eps Nomear). Voz default
  //      JGnWZj684pcXmK2SxYIv. Folder: longos-audios/<slug>-cap-N.
  //   3. No fim, POST /api/admin/longos/concat-narration que faz ffmpeg
  //      concat e patcha o projecto com narrationUrl + durationSec real.
  const generateNarration = async () => {
    if (!project) return;
    if (
      project.narrationUrl &&
      !confirm("Já existe narração para este projecto. Re-gerar (vai sobrescrever)?")
    ) {
      return;
    }
    const chapters = splitScriptByChapters(project.script);
    if (chapters.length === 0) {
      setNarrErr("Sem capítulos detectados no script (precisa de ## headings)");
      return;
    }

    setNarrating(true);
    setNarrErr(null);
    setNarrProgress({
      phase: "chunks",
      currentChunk: 0,
      totalChunks: chapters.length,
      chunkUrls: [],
      chunkErrors: [],
    });

    const chunkUrls: string[] = [];
    const chunkErrors: string[] = [];

    // 1. Gerar cada capítulo em série (audio-bulk endpoint — mesma infra do funil).
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      setNarrProgress({
        phase: "chunks",
        currentChunk: i,
        totalChunks: chapters.length,
        chunkUrls: [...chunkUrls],
        chunkErrors: [...chunkErrors],
      });
      try {
        const r = await fetch("/api/admin/audio-bulk/generate-one", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: ch.texto,
            voiceId: DEFAULT_VOICE_ID,
            modelId: "eleven_multilingual_v2",
            title: `${project.slug}-cap-${String(i + 1).padStart(2, "0")}`,
            folder: "longos-audios",
          }),
        });
        const d = await r.json();
        if (!r.ok || d.erro || !d.audioUrl) {
          chunkErrors.push(`cap${i + 1} (${ch.titulo}): ${d.erro || `HTTP ${r.status}`}`);
          continue;
        }
        chunkUrls.push(d.audioUrl);
      } catch (e) {
        chunkErrors.push(
          `cap${i + 1} (${ch.titulo}): ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    if (chunkUrls.length === 0) {
      setNarrating(false);
      setNarrErr(
        `Nenhum capítulo foi gerado com sucesso. Erros: ${chunkErrors.join("; ")}`,
      );
      return;
    }

    // 2. Concatenar tudo num MP3 final + patch o projecto.
    setNarrProgress({
      phase: "concat",
      currentChunk: chapters.length,
      totalChunks: chapters.length,
      chunkUrls: [...chunkUrls],
      chunkErrors: [...chunkErrors],
    });

    try {
      const r = await fetch("/api/admin/longos/concat-narration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: project.slug, chunkUrls }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) {
        throw new Error(d.erro || `HTTP ${r.status}`);
      }
      setNarrProgress({
        phase: "done",
        currentChunk: chapters.length,
        totalChunks: chapters.length,
        chunkUrls: [...chunkUrls],
        chunkErrors: [...chunkErrors],
      });
      setInfo(
        `✓ Narração gerada: ${Math.round((d.durationSec ?? 0) / 60)} min · ${chapters.length} capítulos · ${chunkErrors.length} erros`,
      );
      // Recarrega o projecto para mostrar o novo narrationUrl + durationSec.
      await load();
    } catch (e) {
      setNarrErr(
        `Concat falhou: ${e instanceof Error ? e.message : String(e)}. Os capítulos individuais ficaram em Supabase (longos-audios/${project.slug}-cap-*.mp3) e podes concatenar manualmente.`,
      );
    } finally {
      setNarrating(false);
    }
  };

  const downloadJson = () => {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.slug}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadScript = () => {
    if (!project) return;
    const text = `# ${project.titulo}\n\n${project.script}`;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.slug}-script.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (loading) return <p className="text-xs text-escola-creme-50">A carregar...</p>;
  if (err)
    return (
      <div className="space-y-2">
        <p className="text-xs text-escola-terracota">{err}</p>
        <Link
          href="/admin/producao/longos"
          className="text-xs text-escola-creme-50 underline"
        >
          ← voltar à lista
        </Link>
      </div>
    );
  if (!project) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href="/admin/producao/longos"
            className="text-[10px] text-escola-creme-50 hover:text-escola-creme"
          >
            ← projectos longos
          </Link>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-escola-creme">
            {project.titulo}
          </h1>
          <p className="text-[10px] text-escola-creme-50">
            <code>{project.slug}</code> ·{" "}
            {project.durationSec
              ? `${Math.floor(project.durationSec / 60)}:${String(
                  Math.round(project.durationSec % 60),
                ).padStart(2, "0")} min real`
              : `${project.wordCount} palavras`}{" "}
            · {project.promptCount} cenas
            {project.updatedAt && (
              <>
                {" "}
                · actualizado{" "}
                {new Date(project.updatedAt).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 text-[10px]">
          <button
            onClick={downloadJson}
            className="rounded border border-escola-border bg-escola-card px-2 py-1 text-escola-creme-50 hover:text-escola-creme"
          >
            ⬇ JSON
          </button>
          <button
            onClick={downloadScript}
            className="rounded border border-escola-border bg-escola-card px-2 py-1 text-escola-creme-50 hover:text-escola-creme"
          >
            ⬇ Script .md
          </button>
        </div>
      </div>

      {info && <p className="text-xs text-escola-dourado">{info}</p>}

      {/* Tema */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-3">
        <p className="text-[10px] uppercase tracking-wider text-escola-creme-50">
          Tema original
        </p>
        <p className="mt-1 text-xs text-escola-creme">{project.tema}</p>
      </section>

      {/* Editáveis */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <h2 className="mb-3 text-sm text-escola-creme">Metadata editável</h2>
        <div className="space-y-3 text-xs">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
              Título do vídeo
            </label>
            <div className="flex gap-2">
              <input
                value={tituloDraft}
                onChange={(e) => setTituloDraft(e.target.value)}
                className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
              />
              {tituloDraft !== project.titulo && (
                <button
                  onClick={() => patchProject({ titulo: tituloDraft })}
                  disabled={saving}
                  className="rounded bg-escola-dourado px-2 py-1 text-[10px] font-semibold text-escola-bg disabled:opacity-40"
                >
                  guardar
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
              Thumbnail text (UPPERCASE auto)
            </label>
            <div className="flex gap-2">
              <input
                value={thumbDraft}
                onChange={(e) => setThumbDraft(e.target.value)}
                maxLength={60}
                className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
              />
              {thumbDraft !== project.thumbnailText && (
                <button
                  onClick={() => patchProject({ thumbnailText: thumbDraft })}
                  disabled={saving}
                  className="rounded bg-escola-dourado px-2 py-1 text-[10px] font-semibold text-escola-bg disabled:opacity-40"
                >
                  guardar
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── Narração ElevenLabs (automática) ────────────────────── */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <h2 className="mb-2 text-sm text-escola-creme">
          🎙 Narração ElevenLabs
          {project.durationSec ? (
            <span className="ml-2 text-[10px] text-escola-dourado">
              {Math.floor(project.durationSec / 60)}:
              {String(Math.round(project.durationSec % 60)).padStart(2, "0")} min real
            </span>
          ) : null}
        </h2>

        {project.narrationUrl ? (
          <div className="mb-3 space-y-2">
            <audio
              src={project.narrationUrl}
              controls
              preload="metadata"
              className="w-full max-w-md"
            />
            <p className="text-[10px] text-escola-creme-50">
              <code>{project.narrationUrl}</code>
            </p>
          </div>
        ) : (
          <p className="mb-3 text-[11px] text-escola-creme-50">
            Sem narração ainda. Gera com 1 clique abaixo (parte por capítulo,
            usa a mesma voz dos mini-eps Nomear).
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={generateNarration}
            disabled={narrating}
            className="rounded bg-escola-dourado px-3 py-1.5 font-semibold text-escola-bg disabled:opacity-40"
          >
            {narrating
              ? "A gerar..."
              : project.narrationUrl
                ? "↻ Re-gerar narração"
                : "🎙 Gerar narração com ElevenLabs"}
          </button>
          <p className="text-[10px] text-escola-creme-50">
            Voz <code>JGnWZj684pcXmK2SxYIv</code> · model{" "}
            <code>eleven_multilingual_v2</code> · ~3-5 min para gerar 20-30 min de
            áudio · custo ElevenLabs por chars.
          </p>
        </div>

        {narrErr && (
          <p className="mt-2 text-xs text-escola-terracota">{narrErr}</p>
        )}

        {narrProgress && (
          <div className="mt-3 rounded border border-escola-dourado/40 bg-escola-bg p-2">
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="text-escola-dourado">
                {narrProgress.phase === "chunks"
                  ? `A gerar capítulo ${narrProgress.currentChunk + 1}/${narrProgress.totalChunks}…`
                  : narrProgress.phase === "concat"
                    ? "A concatenar capítulos com ffmpeg…"
                    : narrProgress.phase === "done"
                      ? "✓ Narração pronta"
                      : ""}
              </span>
              <span className="text-escola-creme-50">
                {narrProgress.chunkUrls.length} ok ·{" "}
                {narrProgress.chunkErrors.length} erros
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded bg-escola-bg">
              <div
                className="h-full bg-escola-dourado transition-all"
                style={{
                  width: `${
                    narrProgress.phase === "concat"
                      ? 95
                      : narrProgress.phase === "done"
                        ? 100
                        : (narrProgress.currentChunk / Math.max(1, narrProgress.totalChunks)) * 90
                  }%`,
                }}
              />
            </div>
            {narrProgress.chunkErrors.length > 0 && (
              <details className="mt-1">
                <summary className="cursor-pointer text-[10px] text-escola-terracota">
                  {narrProgress.chunkErrors.length} erros (clica p/ ver)
                </summary>
                <ul className="mt-1 space-y-0.5 text-[10px] text-escola-terracota">
                  {narrProgress.chunkErrors.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {/* Override manual: caso queira colar URL externa em vez de gerar. */}
        <details className="mt-3 rounded border border-escola-border bg-escola-bg/40 p-2">
          <summary className="cursor-pointer text-[10px] text-escola-creme-50 hover:text-escola-creme">
            Avançado: colar URL de MP3 externo (override manual)
          </summary>
          <div className="mt-2 flex gap-2 text-xs">
            <input
              value={narrationInput}
              onChange={(e) => setNarrationInput(e.target.value)}
              placeholder="https://...mp3"
              className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
            />
            {narrationInput !== (project.narrationUrl ?? "") && (
              <button
                onClick={() =>
                  patchProject({
                    narrationUrl: narrationInput || undefined,
                    // Sem durationSec — desconhecida até carregar o áudio.
                  })
                }
                disabled={saving}
                className="rounded bg-escola-dourado px-2 py-1 text-[10px] font-semibold text-escola-bg disabled:opacity-40"
              >
                guardar URL
              </button>
            )}
          </div>
        </details>
      </section>

      {/* Capítulos */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <h2 className="mb-2 text-sm text-escola-creme">
          Capítulos ({project.capitulos.length})
        </h2>
        <ol className="space-y-2 text-xs">
          {project.capitulos.map((c, i) => (
            <li key={i} className="rounded border border-escola-border bg-escola-bg p-2">
              <p className="font-semibold text-escola-creme">
                {i + 1}. {c.titulo}
              </p>
              <p className="text-[11px] italic text-escola-creme-50">{c.ancora}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Script */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm text-escola-creme">
            Script ({project.wordCount} palavras
            {project.durationSec
              ? ` · ${Math.floor(project.durationSec / 60)} min reais`
              : ""}
            )
          </h2>
          <button
            onClick={() => {
              navigator.clipboard.writeText(project.script);
              setInfo("✓ Script copiado para clipboard");
              setTimeout(() => setInfo(null), 1500);
            }}
            className="rounded border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-creme"
          >
            copiar
          </button>
        </div>
        <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-escola-creme-50">
          {project.script}
        </pre>
      </section>

      {/* Prompts */}
      <section className="rounded-xl border border-escola-border bg-escola-card p-4">
        <h2 className="mb-2 text-sm text-escola-creme">
          Image prompts ({project.prompts.length})
        </h2>
        <ul className="space-y-1.5 text-[11px]">
          {project.prompts.map((p, i) => (
            <li
              key={p.id + i}
              className="rounded border border-escola-border bg-escola-bg p-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-escola-creme">{p.id}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(p.prompt);
                    setInfo(`✓ Prompt ${p.id} copiado`);
                    setTimeout(() => setInfo(null), 1500);
                  }}
                  className="rounded border border-escola-border px-1.5 py-0.5 text-[9px] text-escola-creme-50 hover:text-escola-creme"
                >
                  copiar
                </button>
              </div>
              <p className="text-escola-creme-50">mood: {p.mood.join(" · ")}</p>
              <p className="mt-1 text-escola-creme-50">{p.prompt}</p>
            </li>
          ))}
        </ul>
      </section>

      <details className="rounded border border-escola-border bg-escola-card/40 p-3 text-[10px] text-escola-creme-50">
        <summary className="cursor-pointer text-escola-creme">
          📍 Próximos passos (Fase 2/3)
        </summary>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            Cola cada prompt no MJ → guarda imagens em Supabase. Este passo vai
            ter UI dedicada na Fase 2 (drag &amp; drop tipo /funil/gerar).
          </li>
          <li>
            Cola o script no ElevenLabs Pro → gera 1 MP3 ou 4-5 chunks → faz
            upload → cola URL acima.
          </li>
          <li>
            Quando tiveres MP3 + clips Runway, a Fase 3 vai render automático
            o long-form 15-25 min com capítulos visuais e crossfades 1-2s.
          </li>
        </ol>
      </details>
    </div>
  );
}
