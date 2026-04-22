"use client";

import Link from "next/link";
import { useUniverse } from "@/contexts/UniverseContext";

type Track = { href: string; label: string; desc: string };

const TRACKS_CURSOS: Track[] = [
  {
    href: "/admin/producao/aulas",
    label: "Aulas",
    desc: "Vídeos dos cursos: slides + Ancient Ground (sem voz). Áudio ElevenLabs como entrega à parte.",
  },
  {
    href: "/admin/producao/funil",
    label: "Funil",
    desc: "122 vídeos Nomear (Colecção B): áudio + imagens abstractas + clips + texto + render.",
  },
  {
    href: "/admin/producao/shorts",
    label: "Shorts (Loranne)",
    desc: "30s verticais (TikTok / IG Reels / YouTube Shorts) com Loranne + versos.",
  },
  {
    href: "/admin/producao/audios",
    label: "Áudios",
    desc: "Geração ElevenLabs em massa para Funil (Nomear) e Aulas (cursos).",
  },
];

const TRACKS_AG: Track[] = [
  {
    href: "/admin/producao/ancient-ground",
    label: "Prompts + Clips",
    desc: "Vídeos natureza Moçambique: prompts ThinkDiffusion + clips Runway.",
  },
  {
    href: "/admin/producao/ancient-ground/montagem",
    label: "Vídeo longo (60 min)",
    desc: "Junta os clips num vídeo de ~60min com música ancient-ground, intro e fades.",
  },
  {
    href: "/admin/producao/ancient-ground/shorts",
    label: "Shorts AG",
    desc: "30s verticais para o canal AG: reusa clips Runway, música ancient-ground, texto próprio.",
  },
];

export default function ProducaoIndex() {
  const { universe } = useUniverse();
  const isAg = universe === "ag";
  const tracks = isAg ? TRACKS_AG : TRACKS_CURSOS;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 font-serif text-2xl font-semibold text-escola-creme">
            Produção {isAg ? "· Ancient Ground" : "· Cursos"}
          </h2>
          <p className="text-sm text-escola-creme-50">
            {isAg
              ? "Pipeline AG: imagens → clips motion → vídeo longo ou shorts → upload canal AG."
              : "Aulas · funil · shorts · áudios da Escola dos Véus."}
          </p>
        </div>
        <Link
          href="/admin/escola/manual-producao"
          className="shrink-0 rounded bg-escola-dourado/10 px-3 py-2 text-xs font-semibold text-escola-dourado hover:bg-escola-dourado/20"
        >
          📖 Manual de produção
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tracks.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-xl border border-escola-border bg-escola-card p-4 transition-colors hover:border-escola-dourado/40"
          >
            <p className="text-sm text-escola-creme">{t.label}</p>
            <p className="mt-1 text-xs text-escola-creme-50">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
