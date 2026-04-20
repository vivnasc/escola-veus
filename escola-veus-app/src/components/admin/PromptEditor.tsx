"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type PromptItem = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
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

export default function PromptEditor({ collection, categorySuggestions = [] }: Props) {
  const [data, setData] = useState<PromptFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    if (!filter) return data.prompts;
    return data.prompts.filter(
      (p) =>
        p.id.includes(filter) || p.category.includes(filter) || p.prompt.includes(filter),
    );
  }, [data, filter]);

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

      {info && <p className="text-xs text-escola-dourado">{info}</p>}
      {err && <p className="text-xs text-escola-terracota">{err}</p>}

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
                  <p className="truncate text-xs text-escola-creme">{p.id}</p>
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
