"use client";

import { useState } from "react";
import WeeklyBulkPanel from "@/components/admin/WeeklyBulkPanel";

/**
 * Bulk semanal — gera ZIPs Metricool por marca, todos numa só página.
 *
 * Tabs internas: Loranne | Ancient Ground. Cada tab usa o mesmo componente
 * WeeklyBulkPanel, filtrado pela marca.
 */

type Brand = "loranne" | "ancient-ground";

const TABS: { id: Brand; label: string }[] = [
  { id: "loranne", label: "Loranne" },
  { id: "ancient-ground", label: "Ancient Ground" },
];

export default function BulkSemanalPage() {
  const [tab, setTab] = useState<Brand>("loranne");

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-escola-creme">
          Bulk semanal · Metricool
        </h2>
        <p className="mt-1 text-sm text-escola-creme-50">
          Gera todos os shorts da semana de uma vez, por marca. CSV pronto
          para drag-drop em Planning &gt; Calendar &gt; Import CSV.
        </p>
      </div>

      <nav className="mb-6 flex gap-1 border-b border-escola-border">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`border-b-2 px-3 py-2 text-xs transition-colors ${
              tab === id
                ? "border-escola-dourado text-escola-dourado"
                : "border-transparent text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <WeeklyBulkPanel key={tab} brand={tab} defaultOpen />
    </div>
  );
}
