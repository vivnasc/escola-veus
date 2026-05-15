"use client";

import { useCallback, useEffect, useState } from "react";

import { DEFAULT_DESIGN, type VcSabiaDesign } from "@/lib/vc-sabia/design";

export { DEFAULT_DESIGN };
export type { VcSabiaDesign };

interface Props {
  design: VcSabiaDesign;
  onChange: (d: VcSabiaDesign) => void;
}

/** Hook partilhado: carrega + persiste design no Supabase. */
export function useDesignSettings() {
  const [design, setDesign] = useState<VcSabiaDesign>(DEFAULT_DESIGN);
  const [loaded, setLoaded] = useState(false);
  const [syncState, setSyncState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  useEffect(() => {
    fetch("/api/admin/vc-sabia/design-settings")
      .then((r) => r.json())
      .then((j) => {
        if (j.design) setDesign({ ...DEFAULT_DESIGN, ...j.design });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const update = useCallback((next: VcSabiaDesign) => {
    setDesign(next);
    setSyncState("saving");
    fetch("/api/admin/vc-sabia/design-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ design: next }),
    })
      .then((r) => {
        setSyncState(r.ok ? "saved" : "error");
        if (r.ok) setTimeout(() => setSyncState("idle"), 1200);
      })
      .catch(() => setSyncState("error"));
  }, []);

  return { design, loaded, syncState, update };
}

export function DesignSettingsPanel({ design, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const set = <K extends keyof VcSabiaDesign>(k: K, v: VcSabiaDesign[K]) =>
    onChange({ ...design, [k]: v });

  const reset = () => onChange(DEFAULT_DESIGN);

  return (
    <section className="space-y-2 rounded-lg border border-escola-border bg-escola-card/40 p-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="font-serif text-sm text-escola-dourado">
            🎨 Design do overlay (cores, posição)
          </h2>
          <p className="text-[10px] text-escola-creme-50">
            Aplica-se ao render dos MP4 e à preview. Auto-saves em Supabase.
          </p>
        </div>
        <span className="text-xs text-escola-creme-50">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-escola-border/40 pt-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <ColorField
              label="Fundo do cartão"
              value={design.cardBg}
              onChange={(v) => set("cardBg", v)}
            />
            <NumField
              label="Opacidade fundo"
              value={design.cardBgOpacity}
              min={0}
              max={1}
              step={0.02}
              onChange={(v) => set("cardBgOpacity", v)}
            />
            <ColorField
              label="Moldura do cartão"
              value={design.cardBorder}
              onChange={(v) => set("cardBorder", v)}
            />
            <ColorField
              label="Cantos dourados"
              value={design.cornerColor}
              onChange={(v) => set("cornerColor", v)}
            />
            <ColorField
              label="Kicker 'Sabias que...'"
              value={design.kickerColor}
              onChange={(v) => set("kickerColor", v)}
            />
            <ColorField
              label="Texto da frase"
              value={design.phraseColor}
              onChange={(v) => set("phraseColor", v)}
            />
            <ColorField
              label="Footer (data + URL)"
              value={design.footerColor}
              onChange={(v) => set("footerColor", v)}
            />
            <NumField
              label="Posição Y do cartão"
              value={design.cardY}
              min={400}
              max={1500}
              step={10}
              onChange={(v) => set("cardY", v)}
            />
            <NumField
              label="Tamanho kicker"
              value={design.kickerSize}
              min={28}
              max={80}
              step={2}
              onChange={(v) => set("kickerSize", v)}
            />
            <NumField
              label="Tamanho frase"
              value={design.phraseSize}
              min={32}
              max={90}
              step={2}
              onChange={(v) => set("phraseSize", v)}
            />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-escola-border/40 pt-2">
            <button
              onClick={reset}
              className="rounded border border-escola-border bg-escola-card/40 px-2 py-1 text-[10px] text-escola-creme-50 hover:text-escola-creme"
            >
              ↺ Default
            </button>
            <PresetButton
              label="Dourado clássico"
              preset={DEFAULT_DESIGN}
              onApply={onChange}
            />
            <PresetButton
              label="Branco sobre escuro"
              preset={{
                ...DEFAULT_DESIGN,
                cardBg: "#000000",
                cardBgOpacity: 0.32,
                cardBorder: "#FFFFFF",
                cornerColor: "#FFFFFF",
                kickerColor: "#FFFFFF",
                phraseColor: "#FFFFFF",
                footerColor: "#FFFFFF",
              }}
              onApply={onChange}
            />
            <PresetButton
              label="Negro sobre claro"
              preset={{
                ...DEFAULT_DESIGN,
                cardBg: "#FAF7F0",
                cardBgOpacity: 0.6,
                cardBorder: "#2B2A26",
                cornerColor: "#2B2A26",
                kickerColor: "#5B4E2E",
                phraseColor: "#1B1A16",
                footerColor: "#5B4E2E",
              }}
              onApply={onChange}
            />
            <PresetButton
              label="Magenta vibrante"
              preset={{
                ...DEFAULT_DESIGN,
                cardBg: "#1A0B1A",
                cardBgOpacity: 0.24,
                cardBorder: "#F0A8E5",
                cornerColor: "#F0A8E5",
                kickerColor: "#F0A8E5",
                phraseColor: "#FFF5FA",
                footerColor: "#F0A8E5",
              }}
              onApply={onChange}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-[10px] text-escola-creme-50">
      <span>{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-10 rounded border border-escola-border bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 rounded border border-escola-border bg-escola-card px-1.5 py-0.5 font-mono text-[10px] text-escola-creme"
        />
      </div>
    </label>
  );
}

function NumField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-[10px] text-escola-creme-50">
      <span>
        {label}: <span className="text-escola-creme">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-emerald-500"
      />
    </label>
  );
}

function PresetButton({
  label,
  preset,
  onApply,
}: {
  label: string;
  preset: VcSabiaDesign;
  onApply: (d: VcSabiaDesign) => void;
}) {
  return (
    <button
      onClick={() => onApply(preset)}
      className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300 hover:bg-emerald-500/20"
      title="Aplica este conjunto de cores"
    >
      {label}
    </button>
  );
}
