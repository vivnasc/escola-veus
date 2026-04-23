"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";

type PromptItem = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
  // Reciclagem (opcional). Quando presente, este prompt NÃO precisa de ser
  // gerado — o clip reutilizado (`reuseClipId`) substitui a imagem MJ + motion
  // Runway. Ver PoolSuggestions abaixo para o workflow de escolha.
  reuseClipId?: string;
  reuseClipUrl?: string;
};

type PromptConfig = {
  checkpoint?: string;
  width?: number;
  height?: number;
  cfg_scale?: number;
  steps?: number;
  sampler_name?: string;
  batch_size?: number;
  negative_prompt?: string;
};

type PromptFile = {
  config: PromptConfig;
  prompts: PromptItem[];
  fromSeed?: boolean;
};

type Props = {
  collection: "funil" | "aulas";
  /** Lista de categorias conhecidas para mostrar no dropdown (sugestoes) */
  categorySuggestions?: string[];
};

// Extrai "ep01" de "nomear-ep01-..." ou "trailer" de "nomear-trailer-...".
// Usado para: (a) excluir clips do próprio ep nas sugestões, (b) gravar a
// reutilização no clipOrder per-ep consumido pelo /montar.
function episodeFromPromptId(id: string): string {
  const parts = id.split("-");
  return parts[1] ?? "";
}

export default function PromptEditor({ collection, categorySuggestions = [] }: Props) {
  const [data, setData] = useState<PromptFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [reuseFilter, setReuseFilter] = useState<"todos" | "reciclados" | "pendentes">(
    "todos",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Generator: gera ~10 prompts para um ep via Claude API com few-shot dos
  // eps existentes. Ver /api/admin/funil/gen-prompts.
  type GenPreview = {
    prompts: PromptItem[];
    usage: {
      inputTokens: number;
      outputTokens: number;
      cacheReadTokens: number;
      cacheCreationTokens: number;
      costUsd: number;
    };
    episode: string;
  };
  const [genEp, setGenEp] = useState<string>("");
  const [genCount, setGenCount] = useState<number>(10);
  const [genLoading, setGenLoading] = useState(false);
  const [genPreview, setGenPreview] = useState<GenPreview | null>(null);
  const [genErr, setGenErr] = useState<string | null>(null);

  // Bulk generation: percorre todos os eps em falta e gera prompts serialmente.
  // Serial (não paralelo) porque: (a) cache do Claude aquece nos eps seguintes,
  // (b) evita rate limits, (c) é interruptível.
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkCancel, setBulkCancel] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{
    currentEp: string;
    done: number;
    total: number;
    promptsAdded: number;
    costUsd: number;
    errors: string[];
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/admin/prompts/${collection}/load`, { cache: "no-store" });
      const d = (await r.json()) as PromptFile & { erro?: string };
      if (d.erro) throw new Error(d.erro);
      setData(d);
      if (d.fromSeed) setInfo("A usar seed do repo (Supabase vazio). Guarda para persistir.");
      else setInfo(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => {
    const set = new Set<string>(categorySuggestions);
    if (data) for (const p of data.prompts) set.add(p.category);
    return [...set].sort();
  }, [data, categorySuggestions]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.prompts.filter((p) => {
      if (reuseFilter === "reciclados" && !p.reuseClipId) return false;
      if (reuseFilter === "pendentes" && p.reuseClipId) return false;
      if (!filter) return true;
      return (
        p.id.includes(filter) || p.category.includes(filter) || p.prompt.includes(filter)
      );
    });
  }, [data, filter, reuseFilter]);

  const reuseStats = useMemo(() => {
    if (!data) return { total: 0, reused: 0, pending: 0 };
    let reused = 0;
    for (const p of data.prompts) if (p.reuseClipId) reused++;
    return {
      total: data.prompts.length,
      reused,
      pending: data.prompts.length - reused,
    };
  }, [data]);

  function setConfig<K extends keyof PromptConfig>(key: K, value: PromptConfig[K]) {
    setData((d) => (d ? { ...d, config: { ...d.config, [key]: value } } : d));
  }

  function updatePrompt(id: string, patch: Partial<PromptItem>) {
    setData((d) =>
      d
        ? { ...d, prompts: d.prompts.map((p) => (p.id === id ? { ...p, ...patch } : p)) }
        : d,
    );
  }

  function deletePrompt(id: string) {
    if (!confirm(`Apagar prompt "${id}"?`)) return;
    setData((d) => (d ? { ...d, prompts: d.prompts.filter((p) => p.id !== id) } : d));
  }

  function addPrompt() {
    const base = `novo-${Date.now().toString(36)}`;
    setData((d) =>
      d
        ? {
            ...d,
            prompts: [
              ...d.prompts,
              { id: base, category: categories[0] ?? "sem-categoria", mood: [], prompt: "" },
            ],
          }
        : d,
    );
    setExpandedId(base);
  }

  // ── Generator: Claude API → N image prompts para um ep ────────────────
  async function generate() {
    if (!genEp) {
      setGenErr("Escolhe um episódio (ex: ep11)");
      return;
    }
    setGenLoading(true);
    setGenErr(null);
    setGenPreview(null);
    try {
      const r = await fetch("/api/admin/funil/gen-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episode: genEp, count: genCount }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setGenPreview({
        prompts: d.prompts as PromptItem[],
        usage: d.usage,
        episode: genEp,
      });
    } catch (e) {
      setGenErr(e instanceof Error ? e.message : String(e));
    } finally {
      setGenLoading(false);
    }
  }

  function insertGenerated(picked: PromptItem[]) {
    setData((d) => {
      if (!d) return d;
      const existingIds = new Set(d.prompts.map((p) => p.id));
      // Evita colisões de id — se já existe, append timestamp suffix
      const deduped = picked.map((p) => {
        if (!existingIds.has(p.id)) return p;
        const suffix = Date.now().toString(36).slice(-4);
        return { ...p, id: `${p.id}-${suffix}` };
      });
      return { ...d, prompts: [...d.prompts, ...deduped] };
    });
    setGenPreview(null);
    setInfo(`+${picked.length} prompts inseridos. Guarda para persistir.`);
  }

  // Lista todos os eps da colecção (trailer + ep01..epN) que ainda NÃO têm
  // prompts — candidatos ao bulk generate.
  function missingEps(): string[] {
    if (!data) return [];
    const haveEp = new Set<string>();
    for (const p of data.prompts) {
      const k = p.id.split("-")[1];
      if (k) haveEp.add(k);
    }
    const all: string[] = [];
    const seen = new Set<string>();
    for (const preset of NOMEAR_PRESETS) {
      for (const s of preset.scripts) {
        const k = s.id.split("-")[1];
        if (!k || seen.has(k)) continue;
        seen.add(k);
        if (!haveEp.has(k)) all.push(k);
      }
    }
    return all;
  }

  async function generateBulk() {
    const eps = missingEps();
    if (eps.length === 0) {
      setGenErr("Sem eps em falta — a colecção já está completa.");
      return;
    }
    const estimate = eps.length * 0.03;
    if (
      !confirm(
        `Vais gerar ${genCount} prompts para ${eps.length} eps em falta (${eps.slice(0, 5).join(", ")}${eps.length > 5 ? "…" : ""}).\n\n` +
          `Estimativa de custo: ~$${estimate.toFixed(2)} (Sonnet 4.6 com prompt caching).\n` +
          `Tempo: ~${Math.round((eps.length * 20) / 60)} min a correr serialmente.\n\n` +
          `Podes cancelar a meio — os eps já gerados ficam.\n\nContinuar?`,
      )
    ) {
      return;
    }

    setBulkRunning(true);
    setBulkCancel(false);
    setGenErr(null);
    setBulkProgress({
      currentEp: eps[0],
      done: 0,
      total: eps.length,
      promptsAdded: 0,
      costUsd: 0,
      errors: [],
    });

    let totalAdded = 0;
    let totalCost = 0;
    const errors: string[] = [];

    for (let i = 0; i < eps.length; i++) {
      if (bulkCancel) break;
      const ep = eps[i];
      setBulkProgress({
        currentEp: ep,
        done: i,
        total: eps.length,
        promptsAdded: totalAdded,
        costUsd: totalCost,
        errors,
      });

      try {
        const r = await fetch("/api/admin/funil/gen-prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ episode: ep, count: genCount }),
        });
        const d = await r.json();
        if (!r.ok || d.erro) {
          errors.push(`${ep}: ${d.erro || `HTTP ${r.status}`}`);
          continue;
        }
        const prompts = Array.isArray(d.prompts) ? (d.prompts as PromptItem[]) : [];
        insertGenerated(prompts);
        totalAdded += prompts.length;
        totalCost += d.usage?.costUsd ?? 0;
      } catch (e) {
        errors.push(`${ep}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    setBulkProgress({
      currentEp: "",
      done: eps.length,
      total: eps.length,
      promptsAdded: totalAdded,
      costUsd: totalCost,
      errors,
    });
    setBulkRunning(false);
    setInfo(
      `Bulk: +${totalAdded} prompts em ${eps.length - errors.length}/${eps.length} eps · custo $${totalCost.toFixed(3)}. Guarda para persistir.`,
    );
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    setErr(null);
    setInfo(null);
    try {
      const r = await fetch(`/api/admin/prompts/${collection}/save`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ config: data.config, prompts: data.prompts }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setInfo(`Guardado: ${d.count} prompts`);
      setData((prev) => (prev ? { ...prev, fromSeed: false } : prev));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-xs text-escola-creme-50">A carregar prompts...</p>;
  if (!data) return <p className="text-xs text-escola-terracota">{err ?? "Sem dados."}</p>;

  const cfg = data.config;

  return (
    <div className="space-y-4">
      {/* ── Config ─────────────────────────────────────────── */}
      <details className="rounded-xl border border-escola-border bg-escola-card">
        <summary className="cursor-pointer px-4 py-3 text-sm text-escola-creme">
          Settings ThinkDiffusion
        </summary>
        <div className="grid grid-cols-2 gap-3 border-t border-escola-border p-4 text-xs sm:grid-cols-3">
          <ConfigField label="Checkpoint" value={cfg.checkpoint ?? ""} onChange={(v) => setConfig("checkpoint", v)} />
          <ConfigField label="Width" value={cfg.width ?? 0} type="number" onChange={(v) => setConfig("width", Number(v))} />
          <ConfigField label="Height" value={cfg.height ?? 0} type="number" onChange={(v) => setConfig("height", Number(v))} />
          <ConfigField label="CFG" value={cfg.cfg_scale ?? 0} type="number" step="0.5" onChange={(v) => setConfig("cfg_scale", Number(v))} />
          <ConfigField label="Steps" value={cfg.steps ?? 0} type="number" onChange={(v) => setConfig("steps", Number(v))} />
          <ConfigField label="Sampler" value={cfg.sampler_name ?? ""} onChange={(v) => setConfig("sampler_name", v)} />
          <ConfigField label="Batch" value={cfg.batch_size ?? 0} type="number" onChange={(v) => setConfig("batch_size", Number(v))} />
          <div className="col-span-2 sm:col-span-3">
            <label className="mb-1 block text-escola-creme-50">Negative prompt</label>
            <textarea
              value={cfg.negative_prompt ?? ""}
              onChange={(e) => setConfig("negative_prompt", e.target.value)}
              rows={3}
              className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
            />
          </div>
        </div>
      </details>

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="filtrar por id, categoria ou texto..."
          className="flex-1 min-w-[200px] rounded border border-escola-border bg-escola-card px-3 py-1.5 text-xs text-escola-creme"
        />
        <span className="text-xs text-escola-creme-50">
          {filtered.length}/{data.prompts.length}
        </span>
        <button
          onClick={addPrompt}
          className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-xs text-escola-creme hover:border-escola-dourado/40"
        >
          + novo
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-escola-coral px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {saving ? "A guardar..." : "Guardar"}
        </button>
      </div>

      {/* Reuse filter chips — só para funil (os prompts das aulas não têm reuse). */}
      {collection === "funil" && (
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          {(
            [
              { key: "todos", label: `Todos · ${reuseStats.total}` },
              {
                key: "pendentes",
                label: `Pendentes · ${reuseStats.pending}`,
              },
              {
                key: "reciclados",
                label: `♻ Reciclados · ${reuseStats.reused}`,
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setReuseFilter(opt.key)}
              className={`rounded-full border px-2.5 py-0.5 ${
                reuseFilter === opt.key
                  ? "border-escola-dourado bg-escola-dourado/10 text-escola-dourado"
                  : "border-escola-border text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="text-escola-creme-50">
            💡 reciclados não precisam de geração MJ/Runway
          </span>
        </div>
      )}

      {info && <p className="text-xs text-escola-dourado">{info}</p>}
      {err && <p className="text-xs text-escola-terracota">{err}</p>}

      {/* ── Gerador de prompts (Claude API) ───────────────────── */}
      {collection === "funil" && (
        <details className="rounded-xl border border-escola-dourado/40 bg-escola-dourado/5 p-3">
          <summary className="cursor-pointer text-xs font-semibold text-escola-dourado">
            ✨ Gerar prompts do script (Claude API)
          </summary>
          <div className="mt-3 space-y-2 text-xs">
            <p className="text-[10px] text-escola-creme-50">
              Claude lê o script ElevenLabs deste ep + 6 exemplos reais dos teus ep01-10, e
              devolve {genCount} prompts no mesmo tom editorial. Sonnet 4.6 · ~$0.02-0.05/ep.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-escola-creme-50">Ep:</label>
              <input
                value={genEp}
                onChange={(e) => setGenEp(e.target.value.trim())}
                placeholder="ep11"
                disabled={bulkRunning}
                className="w-20 rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme disabled:opacity-40"
              />
              <label className="text-escola-creme-50">Quantos:</label>
              <input
                type="number"
                min={3}
                max={15}
                value={genCount}
                onChange={(e) => setGenCount(parseInt(e.target.value, 10) || 10)}
                disabled={bulkRunning}
                className="w-16 rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme disabled:opacity-40"
              />
              <button
                onClick={generate}
                disabled={genLoading || !genEp || bulkRunning}
                className="rounded bg-escola-dourado px-3 py-1.5 text-[11px] font-semibold text-escola-bg disabled:opacity-40"
              >
                {genLoading ? "A gerar (15-30s)..." : "✨ Gerar 1 ep"}
              </button>
              {(() => {
                const miss = missingEps();
                return (
                  <button
                    onClick={generateBulk}
                    disabled={bulkRunning || genLoading || miss.length === 0}
                    className="rounded border border-escola-dourado bg-escola-dourado/10 px-3 py-1.5 text-[11px] font-semibold text-escola-dourado hover:bg-escola-dourado/20 disabled:opacity-40"
                    title={
                      miss.length === 0
                        ? "Colecção completa — não há eps em falta"
                        : `Gera ${genCount} prompts para cada um dos ${miss.length} eps em falta`
                    }
                  >
                    ✨✨ Gerar TODOS os eps em falta ({miss.length})
                  </button>
                );
              })()}
              {bulkRunning && (
                <button
                  onClick={() => setBulkCancel(true)}
                  className="rounded border border-escola-terracota px-3 py-1.5 text-[11px] text-escola-terracota hover:bg-escola-terracota/10"
                >
                  ⏹ cancelar
                </button>
              )}
              {genErr && (
                <span className="text-escola-terracota">{genErr}</span>
              )}
            </div>

            {bulkProgress && (
              <div className="mt-2 rounded border border-escola-dourado/40 bg-escola-card p-2">
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="text-escola-dourado">
                    {bulkRunning
                      ? `A gerar ${bulkProgress.currentEp}…`
                      : `✓ Bulk terminado`}
                  </span>
                  <span className="text-escola-creme-50">
                    {bulkProgress.done}/{bulkProgress.total} eps · +
                    {bulkProgress.promptsAdded} prompts · $
                    {bulkProgress.costUsd.toFixed(3)}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-escola-bg">
                  <div
                    className="h-full bg-escola-dourado transition-all"
                    style={{
                      width: `${(bulkProgress.done / Math.max(1, bulkProgress.total)) * 100}%`,
                    }}
                  />
                </div>
                {bulkProgress.errors.length > 0 && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-[10px] text-escola-terracota">
                      {bulkProgress.errors.length} erros (clica p/ ver)
                    </summary>
                    <ul className="mt-1 space-y-0.5 text-[10px] text-escola-terracota">
                      {bulkProgress.errors.map((e, i) => (
                        <li key={i}>• {e}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {!bulkRunning && bulkProgress.done > 0 && (
                  <p className="mt-1 text-[10px] text-escola-dourado">
                    💡 Clica <b>Guardar</b> (canto superior direito) para
                    persistir em Supabase.
                  </p>
                )}
              </div>
            )}

            {genPreview && (
              <div className="mt-3 space-y-2 rounded border border-escola-dourado/40 bg-escola-card p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-escola-dourado">
                    {genPreview.prompts.length} prompts gerados para{" "}
                    <b>{genPreview.episode}</b> · custo{" "}
                    <b>${genPreview.usage.costUsd.toFixed(4)}</b>
                    {genPreview.usage.cacheReadTokens > 0 && (
                      <span className="ml-2 text-escola-creme-50">
                        (cache hit: {genPreview.usage.cacheReadTokens} tok)
                      </span>
                    )}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => insertGenerated(genPreview.prompts)}
                      className="rounded bg-escola-dourado px-3 py-1 text-[10px] font-semibold text-escola-bg"
                    >
                      ✓ Inserir todos ({genPreview.prompts.length})
                    </button>
                    <button
                      onClick={() => setGenPreview(null)}
                      className="rounded border border-escola-border px-2 py-1 text-[10px] text-escola-creme-50 hover:text-escola-terracota"
                    >
                      ✗ descartar
                    </button>
                  </div>
                </div>
                <ul className="max-h-96 space-y-1 overflow-y-auto">
                  {genPreview.prompts.map((p, i) => (
                    <li
                      key={p.id + i}
                      className="rounded border border-escola-border bg-escola-bg p-2 text-[10px]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-escola-creme" title={p.id}>
                          <b>{p.id}</b>
                        </span>
                        <button
                          onClick={() => insertGenerated([p])}
                          className="shrink-0 rounded border border-escola-dourado/50 bg-escola-dourado/10 px-2 py-0.5 text-[9px] text-escola-dourado hover:bg-escola-dourado/20"
                        >
                          + só este
                        </button>
                      </div>
                      <p className="text-escola-creme-50">
                        mood: {p.mood.join(" · ")}
                      </p>
                      <p className="mt-1 text-escola-creme-50">{p.prompt}</p>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-escola-creme-50">
                  💡 Lembra-te de clicar <b>Guardar</b> depois de inserires.
                </p>
              </div>
            )}
          </div>
        </details>
      )}

      {/* ── Lista ─────────────────────────────────────────── */}
      <ul className="space-y-2">
        {filtered.map((p) => {
          const open = expandedId === p.id;
          return (
            <li key={p.id} className="rounded-xl border border-escola-border bg-escola-card">
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <button
                  onClick={() => setExpandedId(open ? null : p.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-xs text-escola-creme">
                    {p.id}
                    {p.reuseClipId && (
                      <span
                        className="ml-2 rounded bg-escola-dourado/20 px-1.5 py-0.5 text-[9px] font-semibold text-escola-dourado"
                        title={`Reciclado de ${p.reuseClipId}`}
                      >
                        ♻ {episodeFromPromptId(p.reuseClipId)}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[10px] text-escola-creme-50">
                    {p.category} · {p.mood.join(", ")}
                  </p>
                </button>
                <button
                  onClick={() => deletePrompt(p.id)}
                  className="shrink-0 rounded border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-terracota"
                >
                  apagar
                </button>
              </div>
              {open && (
                <div className="space-y-2 border-t border-escola-border p-3 text-xs">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <PromptField
                      label="id"
                      value={p.id}
                      onChange={(v) => updatePrompt(p.id, { id: v })}
                    />
                    <PromptField
                      label="category"
                      value={p.category}
                      onChange={(v) => updatePrompt(p.id, { category: v })}
                      list={categories}
                    />
                  </div>
                  <PromptField
                    label="mood (virgulas)"
                    value={p.mood.join(", ")}
                    onChange={(v) =>
                      updatePrompt(p.id, {
                        mood: v
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                  <div>
                    <label className="mb-1 block text-escola-creme-50">prompt</label>
                    <textarea
                      value={p.prompt}
                      onChange={(e) => updatePrompt(p.id, { prompt: e.target.value })}
                      rows={5}
                      className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
                    />
                  </div>

                  {/* Reciclagem — só faz sentido para prompts do funil (nomear-*) */}
                  {collection === "funil" && (
                    <PoolSuggestions
                      prompt={p}
                      onPick={(clipId, clipUrl) =>
                        updatePrompt(p.id, { reuseClipId: clipId, reuseClipUrl: clipUrl })
                      }
                      onClear={() =>
                        updatePrompt(p.id, { reuseClipId: undefined, reuseClipUrl: undefined })
                      }
                    />
                  )}
                </div>
              )}
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-xl border border-escola-border bg-escola-card px-4 py-6 text-center text-xs text-escola-creme-50">
            Sem prompts. Usa <strong className="text-escola-creme">+ novo</strong> para criar.
          </li>
        )}
      </ul>
    </div>
  );
}

function ConfigField({
  label,
  value,
  onChange,
  type = "text",
  step,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: "text" | "number";
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-escola-creme-50">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
      />
    </div>
  );
}

function PromptField({
  label,
  value,
  onChange,
  list,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  list?: string[];
}) {
  const listId = list ? `dl-${label.replace(/\W/g, "")}` : undefined;
  return (
    <div>
      <label className="mb-1 block text-escola-creme-50">{label}</label>
      <input
        value={value}
        list={listId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1 text-escola-creme"
      />
      {list && (
        <datalist id={listId}>
          {list.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      )}
    </div>
  );
}

// ─── PoolSuggestions ────────────────────────────────────────────────────────
// Sugere clips da pool para este prompt com base em mood + keywords do texto.
// Se o user escolhe um candidato, o prompt fica marcado como "reciclado" e
// não precisa de gerar imagem MJ + motion Runway — o /montar puxa directo
// o clip existente.
//
// O utilizador pode sempre limpar a reciclagem para voltar ao fluxo normal.
// O matcher está em /api/admin/funil/pool-match (score: moods*2 + keywords - usage*0.5).

type Candidate = {
  clipId: string;
  clipUrl: string;
  score: number;
  mood: string[];
  episode: string;
  imagePrompt: string;
  usageCount: number;
  matchedMood: string[];
  matchedKeywords: string[];
};

function PoolSuggestions({
  prompt,
  onPick,
  onClear,
}: {
  prompt: PromptItem;
  onPick: (clipId: string, clipUrl: string) => void;
  onClear: () => void;
}) {
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const currentEp = episodeFromPromptId(prompt.id);

  const search = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/admin/funil/pool-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: {
            mood: prompt.mood,
            prompt: prompt.prompt,
          },
          excludeEpisode: currentEp,
          limit: 6,
        }),
      });
      const d = await r.json();
      if (!r.ok || d.erro) throw new Error(d.erro || `HTTP ${r.status}`);
      setCandidates(Array.isArray(d.candidates) ? d.candidates : []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [prompt.mood, prompt.prompt, currentEp]);

  // Estado reciclado: mostra clip actual e botão de limpar.
  if (prompt.reuseClipId && prompt.reuseClipUrl) {
    return (
      <div className="rounded-lg border border-escola-dourado/40 bg-escola-dourado/5 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-escola-dourado">
            ♻ Reciclado — não precisa de gerar imagem/motion
          </p>
          <button
            onClick={onClear}
            className="rounded border border-escola-border px-2 py-0.5 text-[10px] text-escola-creme-50 hover:text-escola-terracota"
          >
            ✗ limpar
          </button>
        </div>
        <div className="flex items-start gap-2">
          <video
            src={prompt.reuseClipUrl}
            className="h-20 w-32 shrink-0 rounded border border-escola-border"
            muted
            preload="none"
            onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
            onMouseLeave={(e) => {
              const v = e.currentTarget as HTMLVideoElement;
              v.pause();
              v.currentTime = 0;
            }}
          />
          <p className="text-[10px] text-escola-creme-50">
            <span className="text-escola-creme">{prompt.reuseClipId}</span>
            <br />
            Este slot vai usar este clip. A geração MJ/Runway é pulada — passa
            para o montar automaticamente quando abrires o ep
            <code className="mx-1">{currentEp}</code>.
          </p>
        </div>
      </div>
    );
  }

  // Estado não-reciclado: botão "ver sugestões" → lista de candidatos.
  return (
    <div className="rounded-lg border border-escola-border bg-escola-bg/40 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] text-escola-creme">
          Reciclagem ♻ <span className="text-escola-creme-50">(opcional)</span>
        </p>
        <button
          onClick={search}
          disabled={loading || (!prompt.mood.length && !prompt.prompt.trim())}
          className="rounded border border-escola-border bg-escola-card px-2 py-0.5 text-[10px] text-escola-creme hover:border-escola-dourado/40 disabled:opacity-40"
        >
          {loading
            ? "a procurar..."
            : candidates === null
              ? "Ver sugestões da pool"
              : "↻ re-procurar"}
        </button>
      </div>
      {(!prompt.mood.length && !prompt.prompt.trim()) && (
        <p className="text-[10px] text-escola-creme-50">
          Preenche mood ou prompt primeiro — matcher precisa de sinal.
        </p>
      )}
      {err && <p className="text-[10px] text-escola-terracota">{err}</p>}
      {candidates !== null && !loading && candidates.length === 0 && (
        <p className="text-[10px] text-escola-creme-50">
          Nenhum candidato acima do threshold. Gera nova imagem MJ normalmente.
        </p>
      )}
      {candidates && candidates.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {candidates.map((c) => {
            const highUse = c.usageCount >= 2;
            return (
              <li
                key={c.clipId}
                className="overflow-hidden rounded border border-escola-border bg-escola-card"
              >
                <div className="relative">
                  <video
                    src={c.clipUrl}
                    className="aspect-video w-full"
                    muted
                    preload="none"
                    onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                    onMouseLeave={(e) => {
                      const v = e.currentTarget as HTMLVideoElement;
                      v.pause();
                      v.currentTime = 0;
                    }}
                  />
                  <span className="absolute left-1 top-1 rounded bg-escola-bg/80 px-1.5 py-0.5 text-[9px] text-escola-creme-50">
                    {c.episode} · score {c.score}
                  </span>
                  {c.usageCount > 0 && (
                    <span
                      className={`absolute right-1 top-1 rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                        highUse
                          ? "bg-escola-terracota/80 text-white"
                          : "bg-escola-dourado/80 text-escola-bg"
                      }`}
                      title={`Já reutilizado ${c.usageCount}× noutros eps`}
                    >
                      ♻ {c.usageCount}
                    </span>
                  )}
                </div>
                <div className="p-1.5 text-[10px]">
                  <p className="truncate text-escola-creme" title={c.clipId}>
                    {c.clipId.replace(/^nomear-/, "")}
                  </p>
                  {c.matchedMood.length > 0 && (
                    <p className="truncate text-escola-dourado">
                      mood: {c.matchedMood.join(" · ")}
                    </p>
                  )}
                  {c.matchedKeywords.length > 0 && (
                    <p
                      className="truncate text-escola-creme-50"
                      title={c.matchedKeywords.join(", ")}
                    >
                      kw: {c.matchedKeywords.slice(0, 3).join(", ")}
                      {c.matchedKeywords.length > 3 && "…"}
                    </p>
                  )}
                  <button
                    onClick={() => onPick(c.clipId, c.clipUrl)}
                    className={`mt-1 w-full rounded px-2 py-1 text-[10px] font-semibold ${
                      highUse
                        ? "border border-escola-terracota/40 bg-escola-terracota/10 text-escola-terracota hover:bg-escola-terracota/20"
                        : "bg-escola-dourado text-escola-bg hover:opacity-90"
                    }`}
                    title={
                      highUse
                        ? "Já foi usado 2× — evita repetição excessiva"
                        : undefined
                    }
                  >
                    Reciclar este
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
