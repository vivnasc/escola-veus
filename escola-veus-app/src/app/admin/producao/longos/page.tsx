"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/**
 * /admin/producao/longos
 *
 * Pipeline novo para vídeos long-form (15-25 min) estilo Corvo Seco / Loranne.
 * Independente do funil curto. Fluxo:
 *   1. Tu dás o tema. Claude gera script (~3000 palavras) + 25-35 image prompts
 *      + thumbnail text + capítulos.
 *   2. Tu revês, regeras se quiseres, guardas em Supabase.
 *   3. (próxima fase) Geras imagens MJ + clips Runway, gravas narração ElevenLabs,
 *      assembleia final 15-25 min MP4.
 */

type Project = {
  slug: string;
  titulo: string;
  tema: string;
  duracaoAlvo: number | null;
  promptCount: number;
  wordCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  hasNarration: boolean;
  hasVideo: boolean;
  hasThumbnail: boolean;
};

type GenResult = {
  titulo: string;
  slug: string;
  tema: string;
  duracaoAlvo: number;
  thumbnailText: string;
  capitulos: { titulo: string; ancora: string }[];
  script: string;
  prompts: { id: string; category: string; mood: string[]; prompt: string }[];
  promptCount: number;
  wordCount: number;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheCreationTokens: number;
    costUsd: number;
  };
};

export default function LongosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [tema, setTema] = useState("");
  const [duracaoAlvo, setDuracaoAlvo] = useState(20);
  const [generating, setGenerating] = useState(false);
  const [genErr, setGenErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<GenResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/longos/list", { cache: "no-store" });
      const d = await r.json();
      if (Array.isArray(d.projects)) setProjects(d.projects);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const generate = async () => {
    if (!tema.trim()) {
      setGenErr("Preenche o tema primeiro");
      return;
    }
    setGenerating(true);
    setGenErr(null);
    setPreview(null);
    try {
      const r = await fetch("/api/admin/longos/gen-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: tema.trim(), duracaoAlvo }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setPreview(d as GenResult);
    } catch (e) {
      setGenErr(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  const saveProject = async () => {
    if (!preview) return;
    setSaving(true);
    setInfo(null);
    try {
      const r = await fetch("/api/admin/longos/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preview),
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setInfo(`✓ Projecto "${preview.titulo}" guardado em Supabase.`);
      setPreview(null);
      setTema("");
      reload();
    } catch (e) {
      setInfo(`Erro: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-escola-creme">
          Longos — Vídeos contemplativos 15-25 min
        </h1>
        <p className="mt-1 text-xs text-escola-creme-50">
          Pipeline novo, estilo Corvo Seco. Claude gera script + image prompts +
          thumbnail. Tu gravas narração ElevenLabs e revês. Output: 1 vídeo
          long-form por semana.
        </p>
      </div>

      {/* ── Gerar novo projecto ───────────────────────────────────── */}
      <section className="rounded-xl border border-escola-dourado/40 bg-escola-dourado/5 p-4">
        <h2 className="mb-3 text-sm font-semibold text-escola-dourado">
          ✨ Gerar novo projecto long-form
        </h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
              Tema
            </label>
            <textarea
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              rows={3}
              placeholder="Ex: A culpa que herdamos das mães e avós, e como começar a devolvê-la sem trair quem nos amou."
              className="w-full rounded border border-escola-border bg-escola-bg px-3 py-2 text-xs text-escola-creme"
              disabled={generating}
            />
            <p className="mt-1 text-[10px] text-escola-creme-50">
              Quanto mais específico (com tensão emocional concreta), melhor o
              script. Vai-se a 2-4 frases que descrevem o ângulo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="text-escola-creme-50">Duração-alvo:</label>
            <select
              value={duracaoAlvo}
              onChange={(e) => setDuracaoAlvo(parseInt(e.target.value, 10))}
              disabled={generating}
              className="rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
            >
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={25}>25 min</option>
              <option value={30}>30 min</option>
            </select>
            <button
              onClick={generate}
              disabled={generating || !tema.trim()}
              className="rounded bg-escola-dourado px-4 py-1.5 text-xs font-semibold text-escola-bg disabled:opacity-40"
            >
              {generating
                ? "A gerar (1-3 min — Claude com adaptive thinking)..."
                : "✨ Gerar projecto"}
            </button>
            {genErr && (
              <span className="text-xs text-escola-terracota">{genErr}</span>
            )}
          </div>
          <p className="text-[10px] text-escola-creme-50">
            Sonnet 4.6 + adaptive thinking · ~$0.10-0.15 por projecto · 1-3 min de espera.
          </p>
        </div>

        {/* Preview do resultado */}
        {preview && (
          <div className="mt-4 space-y-3 rounded border border-escola-dourado/40 bg-escola-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] text-escola-creme-50">
                  Slug: <code>{preview.slug}</code> · {preview.wordCount} palavras
                  · {preview.promptCount} cenas · custo $
                  {preview.usage.costUsd.toFixed(4)}
                </p>
                <h3 className="font-serif text-xl text-escola-creme">
                  {preview.titulo}
                </h3>
                <p className="text-xs text-escola-dourado">
                  Thumbnail: {preview.thumbnailText}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={saveProject}
                  disabled={saving}
                  className="rounded bg-escola-dourado px-3 py-1.5 text-xs font-semibold text-escola-bg disabled:opacity-40"
                >
                  {saving ? "A guardar..." : "✓ Guardar projecto"}
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="rounded border border-escola-border px-3 py-1 text-[10px] text-escola-creme-50 hover:text-escola-terracota"
                >
                  ✗ Descartar
                </button>
              </div>
            </div>

            <details className="rounded border border-escola-border bg-escola-bg/50 p-2">
              <summary className="cursor-pointer text-xs text-escola-creme-50 hover:text-escola-creme">
                Capítulos ({preview.capitulos.length})
              </summary>
              <ul className="mt-2 space-y-1 text-xs">
                {preview.capitulos.map((c, i) => (
                  <li key={i} className="rounded bg-escola-card p-2">
                    <p className="font-semibold text-escola-creme">
                      {i + 1}. {c.titulo}
                    </p>
                    <p className="text-[11px] italic text-escola-creme-50">
                      {c.ancora}
                    </p>
                  </li>
                ))}
              </ul>
            </details>

            <details className="rounded border border-escola-border bg-escola-bg/50 p-2">
              <summary className="cursor-pointer text-xs text-escola-creme-50 hover:text-escola-creme">
                Script ({preview.wordCount} palavras)
              </summary>
              <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-escola-creme-50">
                {preview.script}
              </pre>
            </details>

            <details className="rounded border border-escola-border bg-escola-bg/50 p-2">
              <summary className="cursor-pointer text-xs text-escola-creme-50 hover:text-escola-creme">
                Image prompts ({preview.prompts.length})
              </summary>
              <ul className="mt-2 space-y-1.5">
                {preview.prompts.map((p, i) => (
                  <li
                    key={p.id + i}
                    className="rounded border border-escola-border bg-escola-card p-2 text-[11px]"
                  >
                    <p className="text-escola-creme">
                      <b>{p.id}</b>
                    </p>
                    <p className="text-escola-creme-50">
                      mood: {p.mood.join(" · ")}
                    </p>
                    <p className="mt-1 text-escola-creme-50">{p.prompt}</p>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </section>

      {info && (
        <p
          className={`text-xs ${
            info.startsWith("✓") ? "text-escola-dourado" : "text-escola-terracota"
          }`}
        >
          {info}
        </p>
      )}

      {/* ── Lista de projectos guardados ──────────────────────────── */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm text-escola-creme">
            Projectos guardados ({projects.length})
          </h2>
          <button
            onClick={reload}
            className="rounded border border-escola-border bg-escola-card px-2 py-1 text-[10px] text-escola-creme-50 hover:text-escola-creme"
          >
            ↻ recarregar
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-escola-creme-50">A carregar...</p>
        ) : projects.length === 0 ? (
          <p className="rounded border border-dashed border-escola-border p-6 text-center text-xs text-escola-creme-50">
            Sem projectos ainda. Gera o primeiro acima.
          </p>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li
                key={p.slug}
                className="rounded-xl border border-escola-border bg-escola-card p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-base text-escola-creme">
                      {p.titulo}
                    </p>
                    <p className="text-[10px] text-escola-creme-50">
                      <code>{p.slug}</code> · {p.duracaoAlvo}min ·{" "}
                      {p.wordCount} palavras · {p.promptCount} cenas
                    </p>
                    <p className="mt-1 truncate text-[11px] text-escola-creme-50">
                      {p.tema}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-[10px]">
                    <div className="flex gap-1">
                      <Pill ok={p.hasNarration} label="🎙 narração" />
                      <Pill ok={p.hasThumbnail} label="🖼 thumb" />
                      <Pill ok={p.hasVideo} label="🎬 vídeo" />
                    </div>
                    <p className="text-escola-creme-50">
                      {p.updatedAt
                        ? new Date(p.updatedAt).toLocaleDateString("pt-PT", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex gap-1.5 text-[10px]">
                  <Link
                    href={`/admin/producao/longos/${p.slug}`}
                    className="rounded border border-escola-dourado/40 bg-escola-dourado/10 px-2 py-1 font-semibold text-escola-dourado hover:bg-escola-dourado/20"
                  >
                    abrir →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Roadmap nota */}
      <details className="rounded border border-escola-border bg-escola-card/40 p-3 text-[10px] text-escola-creme-50">
        <summary className="cursor-pointer text-escola-creme">
          📍 Roadmap deste pipeline
        </summary>
        <ul className="mt-2 space-y-1 pl-4">
          <li>
            ✅ <b>Fase 1 (agora)</b>: gerador Claude (script + prompts +
            thumbnail), CRUD de projectos.
          </li>
          <li>
            ⏳ <b>Fase 2</b>: gerar imagens MJ + clips Runway dos prompts (mesma
            UX do funil curto, mais cenas, possibilidade de reusar pool
            existente).
          </li>
          <li>
            ⏳ <b>Fase 3</b>: assembleia final — upload MP3 narração, render
            ffmpeg 15-25 min com clips esticados, capítulos, música em loop,
            crossfades 1-2s, output MP4 1920×1080.
          </li>
        </ul>
      </details>
    </div>
  );
}

function Pill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 ${
        ok
          ? "bg-escola-dourado/20 text-escola-dourado"
          : "bg-escola-border text-escola-creme-50"
      }`}
    >
      {label}
    </span>
  );
}
