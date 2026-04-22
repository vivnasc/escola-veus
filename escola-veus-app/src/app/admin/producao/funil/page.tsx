"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";
import funilSeed from "@/data/funil-prompts.seed.json";
import PromptEditor from "@/components/admin/PromptEditor";

type Prompt = { id: string; category: string; mood: string[]; prompt: string };

type EpStatus = {
  script: boolean;
  audio: boolean;
  promptsTotal: number;
  imagesCount: number;
  clipsCount: number;
  video: boolean;
  srt: boolean;
};

type EpStatusEntry = {
  id: string;
  titulo: string;
  curso: string;
  epKey: string;
  status: EpStatus;
};

export default function FunilPage() {
  const [openSerie, setOpenSerie] = useState<string | null>(NOMEAR_PRESETS[0]?.id ?? null);
  const [tab, setTab] = useState<"series" | "prompts">("series");
  const [statusMap, setStatusMap] = useState<Map<string, EpStatus> | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Extrai chave do episodio: "nomear-trailer-..." -> "trailer", "nomear-ep01-..." -> "ep01"
  const epKeyFromId = (id: string) => id.split("-")[1] ?? "";

  const promptsByEp = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of funilSeed.prompts as Prompt[]) {
      if (!p.id.startsWith("nomear-")) continue;
      const key = epKeyFromId(p.id);
      if (key) map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, []);

  useEffect(() => {
    setStatusLoading(true);
    fetch("/api/admin/funil/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!Array.isArray(d.episodes)) return;
        const m = new Map<string, EpStatus>();
        for (const ep of d.episodes as EpStatusEntry[]) m.set(ep.id, ep.status);
        setStatusMap(m);
      })
      .catch(() => {})
      .finally(() => setStatusLoading(false));
  }, []);

  const totalEpisodes = NOMEAR_PRESETS.reduce((n, s) => n + s.scripts.length, 0);
  const episodesWithPrompts = [...promptsByEp.keys()].length;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-escola-creme">
            Funil — Nomear
          </h2>
          <p className="mt-1 text-sm text-escola-creme-50">
            {NOMEAR_PRESETS.length} séries · {totalEpisodes} episódios ·{" "}
            <span className="text-escola-dourado">{episodesWithPrompts}</span> com
            imagens
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-xs">
        <Link
          href="/admin/producao/funil/gerar"
          className="rounded-lg border border-escola-dourado bg-escola-dourado/10 px-3 py-1.5 font-semibold text-escola-dourado hover:bg-escola-dourado/20"
        >
          → Gerar imagens & clips
        </Link>
        <Link
          href="/admin/producao/funil/montar"
          className="rounded-lg border border-escola-dourado bg-escola-dourado/10 px-3 py-1.5 font-semibold text-escola-dourado hover:bg-escola-dourado/20"
        >
          → Montar vídeo final
        </Link>
        <Link
          href="/admin/producao/shorts/nomear"
          className="rounded-lg border border-escola-coral bg-escola-coral/10 px-3 py-1.5 font-semibold text-escola-coral hover:bg-escola-coral/20"
        >
          → Gerar Short 9:16 (TikTok/Reels/YT)
        </Link>
        <Link
          href="/admin/producao/funil/motions"
          className="rounded-lg border border-escola-border bg-escola-card px-3 py-1.5 text-escola-creme hover:border-escola-dourado/40"
        >
          → Editar motion prompts Runway
        </Link>
        <Link
          href="/admin/producao/audios"
          className="rounded-lg border border-escola-border bg-escola-card px-3 py-1.5 text-escola-creme hover:border-escola-dourado/40"
        >
          → Áudios ElevenLabs (Nomear)
        </Link>
      </div>

      <nav className="mb-6 flex gap-1 border-b border-escola-border">
        {(["series", "prompts"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-xs transition-colors ${
              tab === t
                ? "border-escola-dourado text-escola-dourado"
                : "border-transparent text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            {t === "series" ? "Séries" : "Prompts"}
          </button>
        ))}
      </nav>

      {tab === "prompts" && <PromptEditor collection="funil" />}

      {tab === "series" && (
      <div className="space-y-2">
        {NOMEAR_PRESETS.map((serie) => {
          const open = openSerie === serie.id;
          const withPrompts = serie.scripts.filter((s) => {
            const key = epKeyFromId(s.id);
            return key && promptsByEp.has(key);
          }).length;

          return (
            <section
              key={serie.id}
              className="overflow-hidden rounded-xl border border-escola-border bg-escola-card"
            >
              <button
                onClick={() => setOpenSerie(open ? null : serie.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm text-escola-creme">{serie.titulo}</p>
                  <p className="text-xs text-escola-creme-50">
                    {serie.scripts.length} episódios · {withPrompts} com imagens
                  </p>
                </div>
                <span className="text-escola-creme-50">{open ? "−" : "+"}</span>
              </button>

              {open && (
                <ul className="divide-y divide-escola-border border-t border-escola-border">
                  {serie.scripts.map((ep) => {
                    const key = epKeyFromId(ep.id);
                    const promptsCount = key ? promptsByEp.get(key) ?? 0 : 0;
                    const st = statusMap?.get(ep.id);
                    return (
                      <li key={ep.id} className="px-4 py-2.5 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-escola-creme">{ep.titulo}</p>
                            <p className="text-[10px] text-escola-creme-50">
                              {ep.id} · {ep.curso}
                            </p>
                          </div>
                        </div>
                        {/* Checklist */}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <Pill label="script" ok value={"✓"} />
                          <Pill
                            label="áudio"
                            ok={!!st?.audio}
                            value={st?.audio ? "✓" : "×"}
                            loading={statusLoading && !st}
                          />
                          <Pill
                            label="prompts"
                            ok={promptsCount > 0}
                            value={`${promptsCount}`}
                          />
                          <Pill
                            label="imagens"
                            ok={promptsCount > 0 && (st?.imagesCount ?? 0) >= promptsCount}
                            partial={(st?.imagesCount ?? 0) > 0 && (st?.imagesCount ?? 0) < promptsCount}
                            value={st ? `${st.imagesCount}/${promptsCount}` : promptsCount > 0 ? `?/${promptsCount}` : "—"}
                            loading={statusLoading && !st}
                          />
                          <Pill
                            label="clips"
                            ok={promptsCount > 0 && (st?.clipsCount ?? 0) >= promptsCount}
                            partial={(st?.clipsCount ?? 0) > 0 && (st?.clipsCount ?? 0) < promptsCount}
                            value={st ? `${st.clipsCount}/${promptsCount}` : promptsCount > 0 ? `?/${promptsCount}` : "—"}
                            loading={statusLoading && !st}
                          />
                          <Pill
                            label="vídeo"
                            ok={!!st?.video}
                            value={st?.video ? "✓" : "×"}
                            loading={statusLoading && !st}
                          />
                          <Pill
                            label="srt"
                            ok={!!st?.srt}
                            value={st?.srt ? "✓" : "×"}
                            loading={statusLoading && !st}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
      )}
    </div>
  );
}

function Pill({
  label,
  value,
  ok,
  partial,
  loading,
}: {
  label: string;
  value: string;
  ok?: boolean;
  partial?: boolean;
  loading?: boolean;
}) {
  let cls = "bg-escola-border text-escola-creme-50";
  if (loading) cls = "bg-escola-border text-escola-creme-50 animate-pulse";
  else if (ok) cls = "bg-escola-dourado/10 text-escola-dourado";
  else if (partial) cls = "bg-escola-terracota/10 text-escola-terracota";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${cls}`}>
      <span className="text-[9px] uppercase tracking-wider opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}
