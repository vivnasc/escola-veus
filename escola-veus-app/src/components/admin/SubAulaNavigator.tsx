"use client";

import Link from "next/link";
import {
  getNextSubAula,
  getPrevSubAula,
  listAllSubAulas,
  subAulaHref,
} from "@/lib/lesson-nav";

/**
 * Navegador de sub-aulas no topo da preview admin:
 *   - Dropdown com todas as 24 sub-aulas do curso
 *   - Botões ← anterior / seguinte → para saltar sem ir ao dropdown
 *   - Mostra os títulos das sub-aulas vizinhas, para não decorar URLs
 *
 * Pattern: link-based (permite abrir em nova tab). A página dona é
 * client-side com `use(params)` — muda route e faz remount.
 */
export function SubAulaNavigator({
  slug,
  module,
  sub,
}: {
  slug: string;
  module: number;
  sub: string;
}) {
  const list = listAllSubAulas(slug);
  const prev = getPrevSubAula(slug, module, sub);
  const next = getNextSubAula(slug, module, sub);
  const currentValue = `${module}-${sub.toLowerCase()}`;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-escola-border bg-escola-card p-3">
      <Link
        href="/admin/producao/aulas"
        className="rounded border border-escola-border px-2 py-1 text-[11px] text-escola-creme-50 hover:border-escola-dourado/40 hover:text-escola-creme"
      >
        ← Aulas
      </Link>

      <div className="mx-2 h-4 w-px bg-escola-border" />

      {prev ? (
        <Link
          href={subAulaHref(prev)}
          className="rounded border border-escola-border px-2 py-1 text-[11px] text-escola-creme hover:border-escola-dourado/40"
          title={`Anterior: ${prev.label}`}
        >
          ← {`M${prev.module}·${prev.sub.toUpperCase()}`}
        </Link>
      ) : (
        <span className="rounded border border-escola-border px-2 py-1 text-[11px] text-escola-creme-50 opacity-30">
          ← primeira
        </span>
      )}

      <select
        value={currentValue}
        onChange={(e) => {
          const [m, s] = e.target.value.split("-");
          window.location.href = `/admin/producao/aulas/preview/${slug}/${m}/${s}`;
        }}
        className="min-w-0 max-w-[340px] flex-1 rounded border border-escola-border bg-escola-bg px-2 py-1 text-xs text-escola-creme focus:border-escola-dourado/50 focus:outline-none"
      >
        {list.map((s) => (
          <option key={`${s.module}-${s.sub}`} value={`${s.module}-${s.sub}`}>
            {s.label}
          </option>
        ))}
      </select>

      {next ? (
        <Link
          href={subAulaHref(next)}
          className="rounded border border-escola-border px-2 py-1 text-[11px] text-escola-creme hover:border-escola-dourado/40"
          title={`Seguinte: ${next.label}`}
        >
          {`M${next.module}·${next.sub.toUpperCase()}`} →
        </Link>
      ) : (
        <span className="rounded border border-escola-border px-2 py-1 text-[11px] text-escola-creme-50 opacity-30">
          última →
        </span>
      )}
    </div>
  );
}
