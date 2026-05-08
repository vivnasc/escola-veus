"use client";

/**
 * Motion preview — vê as 4+4 opções de background animado a correr lado a
 * lado em frames 9:16. Cada opção mostra também a letra/verso AG sobreposta
 * para tu veres como fica com texto. Escolhe e diz-me a letra (ex: "Loranne A,
 * AG D") para eu codificar a composição Remotion final.
 *
 * Sem chamadas API — pura renderização CSS/SVG no browser.
 */

import { useState } from "react";
import {
  LoranneMandalaA,
  LoranneVeusB,
  LoranneCosmicC,
  LoranneCombinacaoD,
  AGCapulanaA,
  AGSolHorizonteB,
  AGPadraoTradicionalC,
  AGCombinacaoD,
} from "@/components/motion-preview/MotionOptions";

const LORANNE_OPTIONS = [
  { id: "A", label: "Mandala respirante", Component: LoranneMandalaA },
  { id: "B", label: "Véus em fluxo", Component: LoranneVeusB },
  { id: "C", label: "Pó cósmico", Component: LoranneCosmicC },
  { id: "D", label: "Combinação", Component: LoranneCombinacaoD },
] as const;

const AG_OPTIONS = [
  { id: "A", label: "Capulana abstracta", Component: AGCapulanaA },
  { id: "B", label: "Sol e horizonte", Component: AGSolHorizonteB },
  { id: "C", label: "Padrão tradicional + brisa", Component: AGPadraoTradicionalC },
  { id: "D", label: "Combinação", Component: AGCombinacaoD },
] as const;

const ALBUM_ACCENTS: Record<string, { label: string; color: string }> = {
  Eter: { label: "Eter (azul-noite)", color: "#4A6FA5" },
  Sangue: { label: "Sangue (vermelho)", color: "#B0344A" },
  Espelho: { label: "Espelho (roxo)", color: "#7E57C2" },
  Nua: { label: "Nua (creme/dourado)", color: "#D4A853" },
  Incenso: { label: "Incenso (lilás)", color: "#A088C0" },
  Fibra: { label: "Fibra (laranja)", color: "#E07050" },
  Grão: { label: "Grão (terra)", color: "#B08050" },
  Livro: { label: "Livro (índigo)", color: "#5060A8" },
} as const;

export default function MotionPreviewPage() {
  const [selectedAccent, setSelectedAccent] = useState<keyof typeof ALBUM_ACCENTS>("Nua");
  const accent = ALBUM_ACCENTS[selectedAccent].color;

  const lorannePreview = "Estas mãos\nfizeram almoço\ne relatórios";
  const agPreview = "antes do tambor\nera o pé\nbatendo a terra";

  return (
    <div>
      <style jsx global>{`
        @keyframes motion-spin-slow { from { transform: translate(-50%,-50%) rotate(0); } to { transform: translate(-50%,-50%) rotate(360deg); } }
        .motion-spin-slow { animation: motion-spin-slow 60s linear infinite; }
        @keyframes motion-mandala { 0%,100% { transform: translate(-50%,-50%) scale(1) rotate(0); opacity: 0.8; } 50% { transform: translate(-50%,-50%) scale(1.04) rotate(180deg); opacity: 1; } }
        .motion-mandala { animation: motion-mandala 12s ease-in-out infinite; transform-origin: center; }
        @keyframes motion-veu { 0% { transform: translateX(-30%); opacity: 0; } 50% { opacity: 0.4; } 100% { transform: translateX(30%); opacity: 0; } }
        .motion-veu { animation: motion-veu 8s ease-in-out infinite; }
        @keyframes motion-particle { 0%,100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-20px); opacity: 0.7; } }
        .motion-particle { animation: motion-particle 6s ease-in-out infinite; }
        @keyframes motion-twinkle { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }
        .motion-twinkle { animation: motion-twinkle 3s ease-in-out infinite; }
        @keyframes motion-pan-slow { from { transform: translateX(-5%); } to { transform: translateX(5%); } }
        .motion-pan-slow { animation: motion-pan-slow 30s ease-in-out infinite alternate; }
        @keyframes motion-sun { 0% { left: -20%; top: 30%; } 50% { left: 50%; top: 15%; transform: translateX(-50%); } 100% { left: 110%; top: 30%; transform: translateX(-100%); } }
        .motion-sun { animation: motion-sun 30s ease-in-out infinite; box-shadow: 0 0 60px rgba(255,210,127,0.5); }
        @keyframes motion-sway { 0%,100% { transform: translateX(0); } 50% { transform: translateX(2%); } }
        .motion-sway { animation: motion-sway 8s ease-in-out infinite; transform-origin: center; }
        .bg-gradient-radial { background: radial-gradient(ellipse at center, var(--tw-gradient-stops)); }
      `}</style>

      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-escola-creme">
          Motion preview
        </h2>
        <p className="mt-1 text-sm text-escola-creme-50">
          Vê as 4 + 4 opções a animar. Diz-me a letra escolhida (ex: &quot;Loranne A,
          AG D&quot;) e eu meto na pipeline Remotion.
        </p>
      </div>

      {/* ───── LORANNE ───── */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg text-escola-dourado">
            Loranne · 4 opções
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-escola-creme-50">Cor de acento (varia por álbum):</span>
            <select
              value={selectedAccent}
              onChange={(e) => setSelectedAccent(e.target.value as keyof typeof ALBUM_ACCENTS)}
              className="rounded border border-escola-border bg-escola-card px-2 py-1 text-escola-creme"
            >
              {Object.entries(ALBUM_ACCENTS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LORANNE_OPTIONS.map(({ id, label, Component }) => (
            <PreviewCard key={id} brandId="Loranne" optId={id} label={label}>
              <Component accent={accent} />
              {/* Lyrics overlay simulado */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <div
                  className="whitespace-pre-line"
                  style={{
                    fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                    fontSize: "1.6rem",
                    lineHeight: 1.4,
                    color: "#F5F0E6",
                    textShadow: "0 2px 20px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.6)",
                    fontWeight: 500,
                    letterSpacing: 0.5,
                  }}
                >
                  {lorannePreview}
                </div>
              </div>
              {/* Signature */}
              <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] uppercase tracking-[0.3em]" style={{ color: "rgba(245,240,230,0.4)" }}>
                ◯ Loranne
              </div>
            </PreviewCard>
          ))}
        </div>
      </section>

      {/* ───── ANCIENT GROUND ───── */}
      <section>
        <div className="mb-4">
          <h3 className="font-serif text-lg text-escola-dourado">
            Ancient Ground · 4 opções
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AG_OPTIONS.map(({ id, label, Component }) => (
            <PreviewCard key={id} brandId="AG" optId={id} label={label}>
              <Component />
              {/* Verso AG simulado */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <div
                  className="whitespace-pre-line"
                  style={{
                    fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                    fontSize: "1.5rem",
                    lineHeight: 1.4,
                    color: "#FFE9C0",
                    textShadow: "0 2px 20px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.6)",
                    fontWeight: 500,
                  }}
                >
                  {agPreview}
                </div>
              </div>
              <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] uppercase tracking-[0.3em]" style={{ color: "rgba(255,233,192,0.5)" }}>
                · Ancient Ground ·
              </div>
            </PreviewCard>
          ))}
        </div>
      </section>
    </div>
  );
}

function PreviewCard({
  brandId, optId, label, children,
}: {
  brandId: string; optId: string; label: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-escola-border bg-escola-card p-2">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-escola-creme">
          <span className="text-escola-dourado">{optId}.</span> {label}
        </span>
        <span className="text-[10px] text-escola-creme-50">{brandId}</span>
      </div>
      {/* Frame 9:16 */}
      <div className="relative mx-auto aspect-[9/16] w-full overflow-hidden rounded">
        {children}
      </div>
    </div>
  );
}
