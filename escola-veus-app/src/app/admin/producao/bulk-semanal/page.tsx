"use client";

import { useState } from "react";
import RangeBulkPanel from "@/components/admin/RangeBulkPanel";
import { VcSabiaPreviewPanel } from "@/components/vc-sabia/PreviewPanel";
import { HojeEmMimPreviewPanel } from "@/components/hoje-em-mim/PreviewPanel";

/**
 * Bulk por período. Quatro sub-produções:
 *  - Loranne e Ancient Ground (RangeBulkPanel: range de dias → ZIP
 *    Metricool com 1 CSV por semana ISO; substituiu o WeeklyBulkPanel)
 *  - VC Sabia Que…?, post da manhã (conta pessoal), motion + frase
 *  - Hoje, em Mim, post da noite (conta pessoal), fecho do dia,
 *    rotação editorial por dia da semana
 */

type SubProducao = "loranne" | "ancient-ground" | "vc-sabia" | "hoje-em-mim";

const TABS: { id: SubProducao; label: string }[] = [
  { id: "loranne", label: "Loranne" },
  { id: "ancient-ground", label: "Ancient Ground" },
  { id: "vc-sabia", label: "VC Sabia Que…? (manhã)" },
  { id: "hoje-em-mim", label: "Hoje, em Mim (noite)" },
];

export default function BulkSemanalPage() {
  const [tab, setTab] = useState<SubProducao>("loranne");

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-escola-creme">
          Bulk por período · Metricool
        </h2>
        <p className="mt-1 text-sm text-escola-creme-50">
          Gera shorts para um intervalo de dias (semanas, mês, mês parcial).
          Empacota 1 CSV por semana ISO para drag-drop em Planning &gt;
          Calendar &gt; Import CSV.
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

      {tab === "vc-sabia" ? (
        <VcSabiaPreviewPanel />
      ) : tab === "hoje-em-mim" ? (
        <HojeEmMimPreviewPanel />
      ) : (
        <RangeBulkPanel key={tab} brand={tab as "loranne" | "ancient-ground"} />
      )}
    </div>
  );
}
