"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";
import funilSeed from "@/data/funil-prompts.seed.json";
import PromptEditor from "@/components/admin/PromptEditor";

type Prompt = { id: string; category: string; mood: string[]; prompt: string };

export default function FunilPage() {
  const [openSerie, setOpenSerie] = useState<string | null>(NOMEAR_PRESETS[0]?.id ?? null);
  const [tab, setTab] = useState<"series" | "prompts">("series");

  const promptsByEp = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of funilSeed.prompts as Prompt[]) {
      const m = p.id.match(/^nomear-(ep\d+)/);
      if (m) map.set(m[1], (map.get(m[1]) ?? 0) + 1);
    }
    return map;
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
            const m = s.id.match(/^nomear-(ep\d+)/);
            return m && promptsByEp.has(m[1]);
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
                    const m = ep.id.match(/^nomear-(ep\d+)/);
                    const count = m ? promptsByEp.get(m[1]) ?? 0 : 0;
                    return (
                      <li
                        key={ep.id}
                        className="flex items-center justify-between px-4 py-2.5 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-escola-creme">{ep.titulo}</p>
                          <p className="text-xs text-escola-creme-50">
                            {ep.id} · {ep.curso}
                          </p>
                        </div>
                        <span
                          className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                            count > 0
                              ? "bg-escola-dourado/10 text-escola-dourado"
                              : "bg-escola-border text-escola-creme-50"
                          }`}
                        >
                          {count > 0 ? `${count} imagens` : "sem imagens"}
                        </span>
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
