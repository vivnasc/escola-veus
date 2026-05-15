"use client";

import { useCallback, useEffect, useState } from "react";

interface Phrase {
  id: string;
  tema: string;
  texto: string;
  source: "seed" | "override";
}

const TEMAS = [
  "autoconhecimento",
  "autoamor",
  "autoperdao",
  "florescer-no-tempo-certo",
  "presenca-leve",
  "suavidade-e-descanso",
  "sonhar-com-raizes",
  "inteireza",
  "corpo-como-casa",
  "confianca-no-caminho",
  "gratidao",
  "alegria-simples",
  "beleza-de-existir",
];

export function PhrasesPanel() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [syncState, setSyncState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/vc-sabia/phrases", { cache: "no-store" });
      const j = await r.json();
      if (r.ok && Array.isArray(j.phrases)) {
        setPhrases(j.phrases);
      } else {
        setError(j.erro || `HTTP ${r.status}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(async (next: Phrase[]) => {
    setSyncState("saving");
    const overrides: Record<string, { tema: string; texto: string }> = {};
    for (const p of next) {
      overrides[p.id] = { tema: p.tema, texto: p.texto };
    }
    try {
      const r = await fetch("/api/admin/vc-sabia/phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overrides }),
      });
      setSyncState(r.ok ? "saved" : "error");
      if (r.ok) {
        setDirty(false);
        setTimeout(() => setSyncState((s) => (s === "saved" ? "idle" : s)), 1500);
      }
    } catch {
      setSyncState("error");
    }
  }, []);

  const update = (id: string, partial: Partial<Phrase>) => {
    setPhrases((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...partial } : p));
      setDirty(true);
      return next;
    });
  };

  const addNew = () => {
    const used = new Set(phrases.map((p) => p.id));
    let n = phrases.length + 1;
    let id = "";
    do {
      id = `vsq-${String(n).padStart(4, "0")}`;
      n++;
    } while (used.has(id));
    setPhrases((prev) => [
      ...prev,
      { id, tema: "beleza-de-existir", texto: "", source: "override" },
    ]);
    setDirty(true);
  };

  const regenerate = async (id: string) => {
    setRegenerating(id);
    try {
      const others = phrases.filter((p) => p.id !== id).map((p) => p.texto);
      const r = await fetch("/api/admin/vc-sabia/phrase/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avoid: others.slice(0, 30) }),
      });
      const j = await r.json();
      if (r.ok && j.phrase) {
        update(id, { texto: j.phrase, tema: j.theme || phrases.find((p) => p.id === id)?.tema });
      } else {
        setError(j.erro || `HTTP ${r.status}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRegenerating(null);
    }
  };

  const visible = phrases.filter((p) => {
    if (filter && p.tema !== filter) return false;
    if (search && !p.texto.toLowerCase().includes(search.toLowerCase()) && !p.id.includes(search)) return false;
    return true;
  });

  const stats = {
    total: phrases.length,
    edited: phrases.filter((p) => p.source === "override").length,
    seed: phrases.filter((p) => p.source === "seed").length,
  };

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg text-escola-dourado">
            Frases do "Sabias que..." ({stats.total})
          </h2>
          <p className="text-xs text-escola-creme-50">
            {stats.seed} do seed + {stats.edited} editadas/novas. Edita inline,
            adiciona com botão + ou regenera com Claude.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {syncState === "saving" && (
            <span className="text-[10px] text-escola-creme-50">a gravar...</span>
          )}
          {syncState === "saved" && (
            <span className="text-[10px] text-emerald-400">✓ gravado</span>
          )}
          {syncState === "error" && (
            <span className="text-[10px] text-red-400">erro ao gravar</span>
          )}
          <button
            onClick={() => persist(phrases)}
            disabled={!dirty || syncState === "saving"}
            className="rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
          >
            {dirty ? "💾 Guardar alterações" : "✓ Sem alterações"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
        >
          <option value="">Todos os temas</option>
          {TEMAS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar texto ou id..."
          className="rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
        />
        <button
          onClick={addNew}
          className="rounded border border-escola-dourado/60 bg-escola-dourado/10 px-2 py-1 text-xs text-escola-dourado hover:bg-escola-dourado/20"
        >
          + Adicionar frase
        </button>
        <span className="text-[10px] text-escola-creme-50">
          A mostrar {visible.length} de {phrases.length}
        </span>
      </div>

      {error && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-xs text-escola-creme-50">A carregar...</div>
      ) : (
        <div className="space-y-2">
          {visible.map((p) => (
            <div
              key={p.id}
              className={`flex items-start gap-2 rounded-lg border p-2 ${
                p.source === "override"
                  ? "border-escola-dourado/40 bg-escola-dourado/5"
                  : "border-escola-border bg-escola-card/40"
              }`}
            >
              <div className="shrink-0 space-y-1 text-[10px] text-escola-creme-50">
                <div className="font-mono text-escola-creme">{p.id}</div>
                <select
                  value={p.tema}
                  onChange={(e) => update(p.id, { tema: e.target.value })}
                  className="rounded border border-escola-border bg-escola-card px-1 py-0.5 text-[10px] text-escola-creme"
                >
                  {TEMAS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {p.source === "override" && (
                  <div className="text-[9px] text-escola-dourado">editada</div>
                )}
              </div>
              <textarea
                value={p.texto}
                onChange={(e) => update(p.id, { texto: e.target.value })}
                rows={2}
                className="flex-1 rounded border border-escola-border bg-escola-card px-2 py-1 text-[11px] italic text-escola-creme"
                placeholder="Sabias que..."
              />
              <button
                onClick={() => regenerate(p.id)}
                disabled={regenerating === p.id}
                className="shrink-0 rounded border border-emerald-500/60 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                title="Claude regenera (evita repetir as outras)"
              >
                {regenerating === p.id ? "..." : "✨"}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
