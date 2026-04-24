"use client";

import { use } from "react";
import Link from "next/link";
import { buildSlideDeck } from "@/lib/course-slides";
import { SlidePreview } from "@/components/admin/SlidePreview";

export default function AulaPreviewPage({
  params,
}: {
  params: Promise<{ slug: string; modulo: string; sub: string }>;
}) {
  const { slug, modulo, sub } = use(params);
  const moduleNumber = parseInt(modulo, 10);
  const deck = buildSlideDeck(slug, moduleNumber, sub);

  if (!deck) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link href="/admin/producao/aulas" className="text-xs text-escola-creme-50 hover:text-escola-creme">
          ← Aulas
        </Link>
        <p className="mt-6 text-sm text-escola-creme">
          Script nao encontrado para {slug} M{modulo}·{sub.toUpperCase()}.
        </p>
        <p className="mt-2 text-xs text-escola-creme-50">
          So cursos com scripts completos em src/data/course-scripts/ aparecem aqui.
          Actualmente: Ouro Proprio.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1360px] px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/producao/aulas"
            className="text-xs text-escola-creme-50 hover:text-escola-creme"
          >
            ← Aulas
          </Link>
          <h1 className="mt-2 font-serif text-2xl text-escola-creme">
            {deck.courseTitle} — M{deck.moduleNumber}·{deck.subLetter}
          </h1>
          <p className="text-sm text-escola-creme-50">{deck.subTitle}</p>
        </div>
        <div className="text-right text-xs text-escola-creme-50">
          <p>
            {deck.slides.length} slides ·{" "}
            {Math.floor(deck.totalDurationSec / 60)}:
            {String(deck.totalDurationSec % 60).padStart(2, "0")}
          </p>
          <p className="mt-1">Mock B · fundo preto · sem imagens</p>
        </div>
      </div>

      <SlidePreview deck={deck} />
    </div>
  );
}
