"use client";

import Link from "next/link";

const TRACKS = [
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
    href: "/admin/producao/ancient-ground",
    label: "Ancient Ground",
    desc: "Vídeos natureza Moçambique: prompts ThinkDiffusion + clips Runway.",
  },
  {
    href: "/admin/producao/ancient-ground/montagem",
    label: "AG — Montagem",
    desc: "Junta clips em vídeo de ~60min com música Loranne (ancient-ground).",
  },
  {
    href: "/admin/producao/shorts",
    label: "Shorts",
    desc: "30s verticais (TikTok / IG Reels / YouTube Shorts) com Loranne + versos.",
  },
  {
    href: "/admin/producao/audios",
    label: "Audios",
    desc: "Geração ElevenLabs em massa para Funil (Nomear) e Aulas (cursos).",
  },
] as const;

export default function ProducaoIndex() {
  return (
    <div>
      <h2 className="mb-2 font-serif text-2xl font-semibold text-escola-creme">
        Producao
      </h2>
      <p className="mb-6 text-sm text-escola-creme-50">
        Quatro tracks de produção + audios + montagem.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TRACKS.map((t) => (
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
