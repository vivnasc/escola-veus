"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import funilSeed from "@/data/funil-prompts.seed.json";

type ImgPrompt = { id: string; category: string; mood: string[]; prompt: string };

const EPISODES = [
  { key: "trailer", label: "Trailer" },
  { key: "ep01", label: "ep01 — A culpa" },
  { key: "ep02", label: "ep02 — O extracto" },
  { key: "ep03", label: "ep03 — A vergonha" },
  { key: "ep04", label: "ep04 — O desconto" },
  { key: "ep05", label: "ep05 — Matemática" },
  { key: "ep06", label: "ep06 — A fome" },
  { key: "ep07", label: "ep07 — O sim" },
  { key: "ep08", label: "ep08 — O silêncio" },
  { key: "ep09", label: "ep09 — As frases" },
  { key: "ep10", label: "ep10 — A liberdade" },
] as const;

export default function MotionPromptsPage() {
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [epFilter, setEpFilter] = useState<string>("ep01");
  const [fromSeed, setFromSeed] = useState(false);

  const allImgPrompts = funilSeed.prompts as ImgPrompt[];

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/admin/prompts/runway-motion/load", { cache: "no-store" });
      const d = (await r.json()) as {
        prompts?: Record<string, string>;
        fromSeed?: boolean;
        erro?: string;
      };
      if (d.erro) throw new Error(d.erro);
      setPrompts(d.prompts ?? {});
      setFromSeed(!!d.fromSeed);
      setDirty(new Set());
      if (d.fromSeed) setInfo("A usar seed do repo. Guarda para persistir em Supabase.");
      else setInfo(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      const r = await fetch("/api/admin/prompts/runway-motion/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setInfo(`Guardado (${d.count} motion prompts).`);
      setDirty(new Set());
      setFromSeed(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  // Image prompts filtrados pelo episódio actual (para mostrar contexto ao user)
  const filteredImgPrompts = useMemo(() => {
    if (epFilter === "trailer") {
      return allImgPrompts.filter((p) => p.id.startsWith("nomear-trailer-"));
    }
    return allImgPrompts.filter((p) => p.id.startsWith(`nomear-${epFilter}-`));
  }, [allImgPrompts, epFilter]);

  const updatePrompt = (id: string, v: string) => {
    setPrompts((prev) => ({ ...prev, [id]: v }));
    setDirty((prev) => new Set(prev).add(id));
  };

  const defaultPrompt = prompts["_default"] ?? "";

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-escola-creme">
            Motion Prompts Runway — Funil
          </h2>
          <p className="mt-1 text-sm text-escola-creme-50">
            Edita o movimento que o Runway Gen-3 aplica a cada imagem. Guarda
            para persistir em Supabase — re-renders usam a versão guardada.
          </p>
        </div>
        <Link
          href="/admin/producao/funil"
          className="shrink-0 rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme-50 hover:text-escola-creme"
        >
          ← voltar
        </Link>
      </div>

      <div className="mb-4 rounded-lg border border-escola-border bg-escola-card p-3 text-xs text-escola-creme-50">
        <p className="mb-1 text-escola-dourado">💡 Dicas Runway Gen-3</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>
            Usa verbos activos: <i>flickers</i>, <i>drifts</i>, <i>rises</i>,{" "}
            <i>swings</i>, <i>traces</i>, <i>curls</i>.
          </li>
          <li>
            Descreve <b>pelo menos 1 elemento em movimento contínuo</b> (chama,
            vapor, cortina a respirar, gotas de chuva, pêndulo).
          </li>
          <li>
            Palavras como <i>steady</i>, <i>unchanged</i>, <i>holds still</i>,{" "}
            <i>static</i> fazem Runway gerar clips estáticos. Usa com moderação.
          </li>
          <li>
            Movimentos de câmara discretos: &quot;very slow push-in&quot;,{" "}
            &quot;slow horizontal drift right by two feet&quot;,{" "}
            &quot;almost-static orbit two degrees&quot;.
          </li>
        </ul>
      </div>

      {err && (
        <div className="mb-3 rounded bg-red-950/50 p-2 text-xs text-red-300">
          Erro: {err}
        </div>
      )}
      {info && (
        <div className="mb-3 rounded bg-escola-dourado/10 p-2 text-xs text-escola-dourado">
          {info}
        </div>
      )}
      {fromSeed && (
        <div className="mb-3 rounded bg-escola-terracota/10 p-2 text-xs text-escola-terracota">
          ⚠️ A ler do seed do repo. Faz uma edição + Guarda para que futuras
          alterações fiquem em Supabase (editável cross-device).
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {EPISODES.map((e) => (
          <button
            key={e.key}
            onClick={() => setEpFilter(e.key)}
            className={`rounded border px-2.5 py-1 text-xs transition-colors ${
              epFilter === e.key
                ? "border-escola-dourado bg-escola-dourado/10 text-escola-dourado"
                : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            {e.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          {dirty.size > 0 && (
            <span className="text-xs text-escola-terracota">
              {dirty.size} alterado{dirty.size > 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={save}
            disabled={saving || dirty.size === 0}
            className="rounded bg-escola-dourado px-4 py-1.5 text-xs font-semibold text-escola-bg disabled:opacity-30"
          >
            {saving ? "A guardar..." : "Guardar alterações"}
          </button>
        </div>
      </div>

      {loading && <p className="text-xs text-escola-creme-50">A carregar...</p>}

      {!loading && (
        <ul className="space-y-3">
          {filteredImgPrompts.map((img) => {
            const motion = prompts[img.id] ?? "";
            const isDirty = dirty.has(img.id);
            const isEmpty = !motion.trim();
            return (
              <li
                key={img.id}
                className={`rounded-xl border p-4 ${
                  isDirty
                    ? "border-escola-terracota bg-escola-card"
                    : isEmpty
                      ? "border-escola-border/40 bg-escola-card"
                      : "border-escola-border bg-escola-card"
                }`}
              >
                <div className="mb-2">
                  <p className="text-xs text-escola-dourado">
                    {img.id}
                    {isDirty && (
                      <span className="ml-2 rounded bg-escola-terracota/20 px-1.5 text-[9px] text-escola-terracota">
                        ● NÃO GUARDADO
                      </span>
                    )}
                    {isEmpty && !isDirty && (
                      <span className="ml-2 rounded bg-escola-terracota/20 px-1.5 text-[9px] text-escola-terracota">
                        ⚠ SEM MOTION (usa _default)
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-escola-creme-50">
                    mood: {img.mood.join(" · ")}
                  </p>
                </div>
                <details className="mb-2 rounded border border-escola-border bg-escola-bg/50 px-2 py-1.5 text-[10px] text-escola-creme-50">
                  <summary className="cursor-pointer text-escola-creme">
                    ver image prompt (contexto)
                  </summary>
                  <p className="mt-1">{img.prompt}</p>
                </details>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-escola-creme-50">
                  Motion prompt (Runway Gen-3)
                </label>
                <textarea
                  value={motion}
                  onChange={(e) => updatePrompt(img.id, e.target.value)}
                  rows={4}
                  placeholder="ex: Static camera. Steam rises slowly and curls from the cup. Dust drifts through the window beam."
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-xs text-escola-creme"
                />
                <p className="mt-1 text-[10px] text-escola-creme-50">
                  {motion.length} chars
                </p>
              </li>
            );
          })}
          {filteredImgPrompts.length === 0 && (
            <p className="text-xs text-escola-creme-50">
              Sem prompts de imagem para este episódio (adiciona em
              /admin/producao/funil tab Prompts primeiro).
            </p>
          )}
        </ul>
      )}

      <div className="mt-8 rounded-xl border border-escola-border bg-escola-card p-4">
        <p className="mb-2 text-xs text-escola-dourado">Default (fallback)</p>
        <p className="mb-2 text-[10px] text-escola-creme-50">
          Usado para qualquer imagem que não tenha motion prompt próprio acima.
        </p>
        <textarea
          value={defaultPrompt}
          onChange={(e) => updatePrompt("_default", e.target.value)}
          rows={3}
          className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-xs text-escola-creme"
        />
      </div>
    </div>
  );
}
