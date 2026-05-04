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
  duracaoAlvo: number;
  thumbnailText: string;
  capitulos: { titulo: string; ancora: string }[];
  script: string;
  prompts: { id: string; category: string; mood: string[]; prompt: string }[];
  promptCount: number;
  wordCount: number;
  narrationUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

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
            <code>{project.slug}</code> · {project.duracaoAlvo}min · {project.wordCount}{" "}
            palavras · {project.promptCount} cenas
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

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
              URL da narração ElevenLabs (MP3 em Supabase ou externo)
            </label>
            <div className="flex gap-2">
              <input
                value={narrationInput}
                onChange={(e) => setNarrationInput(e.target.value)}
                placeholder="https://...mp3"
                className="flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
              />
              {narrationInput !== (project.narrationUrl ?? "") && (
                <button
                  onClick={() =>
                    patchProject({ narrationUrl: narrationInput || undefined })
                  }
                  disabled={saving}
                  className="rounded bg-escola-dourado px-2 py-1 text-[10px] font-semibold text-escola-bg disabled:opacity-40"
                >
                  guardar URL
                </button>
              )}
            </div>
            {project.narrationUrl && (
              <audio
                src={project.narrationUrl}
                controls
                className="mt-2 w-full max-w-md"
              />
            )}
            <p className="mt-1 text-[10px] text-escola-creme-50">
              💡 Cola o script no ElevenLabs Pro, gera o MP3, faz upload para
              Supabase course-assets/longos-audios/, copia o URL para aqui.
            </p>
          </div>
        </div>
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
            Script ({project.wordCount} palavras · ~{project.duracaoAlvo}min)
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
