"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  slug: string;
  title: string;
  brief: string;
  numDias: number;
  createdAt: string;
  updatedAt: string;
};

export default function ColecoesIndex() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // form da nova colecção
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [numDias, setNumDias] = useState(7);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/colecoes/list", { cache: "no-store" });
      const data = await r.json();
      if (r.ok) setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createColecao() {
    if (!title.trim() || !brief.trim()) {
      alert("Dá um título e um brief antes de gerar.");
      return;
    }
    setCreating(true);
    try {
      const r = await fetch("/api/admin/colecoes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, brief, numDias }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.erro || `HTTP ${r.status}`);
      // redirect para o editor
      window.location.href = `/admin/producao/colecoes/${data.id}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Falhou: ${msg}`);
    } finally {
      setCreating(false);
    }
  }

  async function remove(id: string, titleStr: string) {
    if (!confirm(`Apagar "${titleStr}"? Não dá para recuperar.`)) return;
    const r = await fetch(`/api/admin/colecoes/${id}`, { method: "DELETE" });
    if (!r.ok) {
      alert("Não consegui apagar.");
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 font-serif text-2xl font-semibold text-escola-creme">
            Colecções de carrossel
          </h2>
          <p className="text-sm text-escola-creme-50">
            Cada colecção é uma série temática (ex: "A Estação dos Véus", "Lua Cheia", "Maternidade")
            com N dias × 6 slides cada. Dás um brief, o Claude escreve, tu refinas.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="shrink-0 rounded bg-escola-dourado/90 px-4 py-2 text-sm font-semibold text-escola-bg hover:bg-escola-dourado"
        >
          + Nova colecção
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-escola-creme-50">A carregar…</p>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-escola-border p-8 text-center">
          <p className="mb-3 text-sm text-escola-creme-50">
            Ainda não há colecções. A primeira é uma boa.
          </p>
          <button
            onClick={() => setShowNew(true)}
            className="rounded bg-escola-dourado/90 px-4 py-2 text-sm font-semibold text-escola-bg hover:bg-escola-dourado"
          >
            + Criar a primeira
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((it) => (
            <li
              key={it.id}
              className="group rounded-xl border border-escola-border bg-escola-card p-4 transition-colors hover:border-escola-dourado/40"
            >
              <div className="flex items-baseline justify-between gap-2">
                <Link
                  href={`/admin/producao/colecoes/${it.id}`}
                  className="text-sm font-semibold text-escola-creme hover:text-escola-dourado"
                >
                  {it.title}
                </Link>
                <span className="text-[10px] text-escola-creme-50">
                  {it.numDias} dias
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs italic text-escola-creme-50">
                {it.brief}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-escola-creme-50">
                  {new Date(it.updatedAt).toLocaleDateString("pt-PT")}
                </span>
                <button
                  onClick={() => remove(it.id, it.title)}
                  className="text-[10px] text-escola-creme-50 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
                >
                  apagar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-lg border border-escola-border bg-escola-card p-5">
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <h3 className="font-serif text-lg text-escola-creme">Nova colecção</h3>
              <button
                onClick={() => setShowNew(false)}
                className="text-escola-creme-50 hover:text-escola-creme"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-wider text-escola-creme-50">
                  Título
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: A Estação Quente, Lua Cheia, Maternidade"
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme placeholder:text-escola-creme-50"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-wider text-escola-creme-50">
                  Brief — descreve o que queres ensinar
                </span>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  rows={6}
                  placeholder={[
                    "Exemplo:",
                    "Série de 7 dias sobre maternidade consciente em Maputo. Cada dia explora um véu",
                    "que a maternidade levanta — perda, repetição, identidade, corpo, comunidade.",
                    "Voz íntima, dirigida a mães primíparas. CTA: livro Os 7 Véus, Colecção Espelhos,",
                    "diagnóstico LUMINA."
                  ].join("\n")}
                  className="w-full rounded border border-escola-border bg-escola-bg px-2 py-1.5 text-escola-creme placeholder:text-escola-creme-50"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-wider text-escola-creme-50">
                  Número de dias ({numDias})
                </span>
                <input
                  type="range"
                  min={3}
                  max={12}
                  value={numDias}
                  onChange={(e) => setNumDias(Number(e.target.value))}
                  className="w-full"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowNew(false)}
                disabled={creating}
                className="rounded border border-escola-border px-3 py-1.5 text-xs text-escola-creme hover:border-escola-dourado/40 disabled:opacity-30"
              >
                Cancelar
              </button>
              <button
                onClick={createColecao}
                disabled={creating}
                className="rounded bg-escola-dourado/90 px-4 py-1.5 text-xs font-semibold text-escola-bg hover:bg-escola-dourado disabled:opacity-40"
              >
                {creating ? "A gerar com Claude… (até 90s)" : "✦ Gerar com Claude"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
