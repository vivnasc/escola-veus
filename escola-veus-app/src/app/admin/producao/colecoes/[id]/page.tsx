"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import CollectionWorkspace from "@/components/admin/CollectionWorkspace";
import type { Dia, Slide as SlideType } from "@/lib/carousel-types";
import { themeById, type CarouselTheme } from "@/lib/carousel-themes";

type Colecao = {
  id: string;
  slug: string;
  title: string;
  brief: string;
  dias: Dia[];
  theme: { id?: string };
  updatedAt: string;
};

export default function ColecaoEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [col, setCol] = useState<Colecao | null>(null);
  const [theme, setThemeState] = useState<CarouselTheme>(themeById(undefined));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/admin/colecoes/${id}`, { cache: "no-store" });
        const data = await r.json();
        if (r.ok) {
          setCol(data);
          setThemeState(themeById(data.theme?.id));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function save() {
    if (!col) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/colecoes/${col.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dias: col.dias,
          title: col.title,
          theme: { id: theme.id },
        }),
      });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.erro || `HTTP ${r.status}`);
      }
      setDirty(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Falha ao guardar: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  // Auto-save 2s após uma alteração
  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(save, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [col, theme, dirty]);

  async function regenerateSlideFn(diaIdx: number, slideIdx: number, hint?: string): Promise<SlideType> {
    if (!col) throw new Error("colecção não carregada");
    const r = await fetch(`/api/admin/colecoes/${col.id}/regenerate-slide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diaIdx, slideIdx, hint }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.erro || `HTTP ${r.status}`);
    return data.slide as SlideType;
  }

  if (loading) {
    return <p className="text-sm text-escola-creme-50">A carregar…</p>;
  }
  if (!col) {
    return (
      <div>
        <p className="mb-2 text-sm text-red-300">Colecção não encontrada.</p>
        <Link href="/admin/producao/colecoes" className="text-xs text-escola-dourado underline">
          ← voltar à lista
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-baseline gap-3 text-xs text-escola-creme-50">
        <Link href="/admin/producao/colecoes" className="hover:text-escola-dourado">
          ← colecções
        </Link>
        <span>/ {col.slug}</span>
        <span className="ml-auto">
          {saving ? "a guardar…" : dirty ? "alterações por guardar" : "✓ guardado"}
        </span>
      </div>

      <CollectionWorkspace
        title={col.title}
        campanha={col.title}
        slug={col.slug}
        dias={col.dias}
        onDiasChange={(d) => {
          setCol({ ...col, dias: d });
          setDirty(true);
        }}
        onTitleChange={(t) => {
          setCol({ ...col, title: t });
          setDirty(true);
        }}
        theme={theme}
        onThemeChange={(t) => {
          setThemeState(t);
          setDirty(true);
        }}
        regenerateSlideFn={regenerateSlideFn}
        description={<p className="italic">{col.brief}</p>}
        extraHeaderActions={
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="rounded border border-escola-border px-3 py-2 text-xs text-escola-creme hover:border-escola-dourado/40 disabled:opacity-30"
          >
            {saving ? "…" : "💾 guardar agora"}
          </button>
        }
      />
    </div>
  );
}
