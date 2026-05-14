"use client";

import { useState } from "react";
import seed from "@/data/vc-sabia-frases.seed.json";

type Variant = "A" | "B" | "C";

const SAMPLE_PHRASE_ID = "vsq-0021";
const DEFAULT_MEDIA = "/assets/vc-sabia/motions/db5056e4-aabc-43e6-ab9f-48f8d96c10a8.mp4";
const FALLBACK_MEDIA = "/assets/vc-sabia/motions/IMG_8599.webp";

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatDatePT(d: Date) {
  return `${d.getDate()} de ${MESES_PT[d.getMonth()]} de ${d.getFullYear()}`;
}

export default function VcSabiaPreviewPage() {
  const [variant, setVariant] = useState<Variant>("B");
  const [phraseId, setPhraseId] = useState<string>(SAMPLE_PHRASE_ID);
  const [media, setMedia] = useState<string>(DEFAULT_MEDIA);

  const phrase = seed.frases.find((f) => f.id === phraseId) ?? seed.frases[0];
  const dateLabel = formatDatePT(new Date());
  const isVideo = /\.(mp4|webm|mov)$/i.test(media);

  return (
    <div className="space-y-6 p-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-serif text-escola-dourado">
          VC Sabia Que…? — Preview de overlay
        </h1>
        <p className="text-sm text-escola-creme-50">
          Compara as três variantes de overlay sobre o ficheiro de teste.
          Frame renderiza a 405×720 (escala 0.375 do output final 1080×1920).
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 rounded-md border border-escola-border p-1">
          {(["A", "B", "C"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVariant(v)}
              className={`rounded px-3 py-1.5 text-xs transition-colors ${
                variant === v
                  ? "bg-escola-dourado text-escola-bg"
                  : "text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              Variante {v}
            </button>
          ))}
        </div>

        <select
          value={phraseId}
          onChange={(e) => setPhraseId(e.target.value)}
          className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-xs text-escola-creme"
        >
          {seed.frases.map((f) => (
            <option key={f.id} value={f.id}>
              {f.id} · {f.tema} · {f.texto.slice(0, 50)}…
            </option>
          ))}
        </select>

        <input
          value={media}
          onChange={(e) => setMedia(e.target.value)}
          placeholder="/assets/vc-sabia/motions/…"
          className="min-w-[280px] flex-1 rounded border border-escola-border bg-escola-card px-3 py-1.5 text-xs text-escola-creme"
        />

        <div className="flex gap-1 rounded-md border border-escola-border p-1 text-xs">
          <button
            onClick={() => setMedia(DEFAULT_MEDIA)}
            className={`rounded px-2 py-1 transition-colors ${
              media === DEFAULT_MEDIA
                ? "bg-escola-dourado/20 text-escola-dourado"
                : "text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            MP4 teste
          </button>
          <button
            onClick={() => setMedia(FALLBACK_MEDIA)}
            className={`rounded px-2 py-1 transition-colors ${
              media === FALLBACK_MEDIA
                ? "bg-escola-dourado/20 text-escola-dourado"
                : "text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            Imagem teste
          </button>
        </div>
      </div>

      <div className="text-xs text-escola-creme-50">
        Variante <strong className="text-escola-creme">A</strong> — só vinheta + texto com stroke ·{" "}
        <strong className="text-escola-creme">B</strong> — cartão de vidro fosco (recomendado) ·{" "}
        <strong className="text-escola-creme">C</strong> — vidro + moldura dourada
      </div>

      <div className="flex flex-wrap gap-8">
        <Frame
          variant={variant}
          phrase={phrase.texto}
          dateLabel={dateLabel}
          media={media}
          isVideo={isVideo}
        />

        <div className="space-y-3 text-xs text-escola-creme-50">
          <div>
            <div className="text-escola-creme">Frase</div>
            <div className="mt-1 font-serif text-base text-escola-creme">
              Sabias que — {phrase.texto}
            </div>
          </div>
          <div>
            <div className="text-escola-creme">Tema</div>
            <div className="mt-1">{phrase.tema}</div>
          </div>
          <div>
            <div className="text-escola-creme">ID</div>
            <div className="mt-1">{phrase.id}</div>
          </div>
          <div>
            <div className="text-escola-creme">Data</div>
            <div className="mt-1">{dateLabel}</div>
          </div>
          <div>
            <div className="text-escola-creme">Media</div>
            <div className="mt-1 break-all">{media}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame({
  variant,
  phrase,
  dateLabel,
  media,
  isVideo,
}: {
  variant: Variant;
  phrase: string;
  dateLabel: string;
  media: string;
  isVideo: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-escola-border"
      style={{ width: 405, height: 720 }}
    >
      {isVideo ? (
        <video
          src={media}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* vinheta radial — comum a todas as variantes */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(13,13,26,0) 35%, rgba(13,13,26,0.55) 100%)",
        }}
      />

      {/* gradiente topo para o título respirar */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, rgba(13,13,26,0.65) 0%, rgba(13,13,26,0) 100%)",
        }}
      />

      {/* gradiente rodapé */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background:
            "linear-gradient(to top, rgba(13,13,26,0.6) 0%, rgba(13,13,26,0) 100%)",
        }}
      />

      {/* cabeçalho */}
      <header className="absolute inset-x-0 top-0 px-6 pt-6 text-center">
        <div
          className="font-serif italic text-escola-creme"
          style={{
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: "0.02em",
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          VC Sabia Que…?
        </div>
        <div
          className="mt-1 font-serif text-escola-creme-50"
          style={{
            fontWeight: 400,
            fontSize: 11,
            letterSpacing: "0.06em",
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          {dateLabel}
        </div>
        <div className="mx-auto mt-3 h-px w-16 bg-escola-dourado/60" />
      </header>

      {/* corpo da frase */}
      <main className="absolute inset-0 flex items-center justify-center px-6">
        {variant === "A" && <BodyVariantA phrase={phrase} />}
        {variant === "B" && <BodyVariantB phrase={phrase} />}
        {variant === "C" && <BodyVariantC phrase={phrase} />}
      </main>

      {/* assinatura */}
      <footer className="absolute inset-x-0 bottom-0 px-6 pb-5 text-center">
        <div
          className="font-sans text-escola-creme-50"
          style={{
            fontWeight: 300,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          @escola.dos.veus
        </div>
      </footer>
    </div>
  );
}

function BodyVariantA({ phrase }: { phrase: string }) {
  return (
    <p
      className="text-balance text-center font-serif italic text-escola-creme"
      style={{
        fontWeight: 500,
        fontSize: 22,
        lineHeight: 1.45,
        textShadow:
          "0 2px 12px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,0.9)",
      }}
    >
      <span
        className="block font-sans not-italic text-escola-dourado"
        style={{
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 14,
          textShadow: "0 1px 4px rgba(0,0,0,0.7)",
        }}
      >
        Sabias que —
      </span>
      {phrase}
    </p>
  );
}

function BodyVariantB({ phrase }: { phrase: string }) {
  return (
    <div
      className="rounded-2xl px-5 py-6 text-center"
      style={{
        background: "rgba(20, 15, 30, 0.32)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        border: "1px solid rgba(245, 240, 230, 0.16)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="font-sans text-escola-dourado"
        style={{
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Sabias que —
      </div>
      <p
        className="text-balance font-serif italic text-escola-creme"
        style={{
          fontWeight: 500,
          fontSize: 21,
          lineHeight: 1.45,
        }}
      >
        {phrase}
      </p>
    </div>
  );
}

function BodyVariantC({ phrase }: { phrase: string }) {
  return (
    <div
      className="relative rounded-2xl px-5 py-7 text-center"
      style={{
        background: "rgba(20, 15, 30, 0.34)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
        border: "1px solid rgba(201, 169, 110, 0.55)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(201, 169, 110, 0.12), 0 0 0 4px rgba(201, 169, 110, 0.08)",
      }}
    >
      {/* cantos decorativos */}
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      <div
        className="font-sans text-escola-dourado"
        style={{
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Sabias que —
      </div>
      <p
        className="text-balance font-serif italic text-escola-creme"
        style={{
          fontWeight: 500,
          fontSize: 21,
          lineHeight: 1.45,
        }}
      >
        {phrase}
      </p>
    </div>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute h-3 w-3 border-escola-dourado";
  const map: Record<typeof pos, string> = {
    tl: "left-1.5 top-1.5 border-l border-t",
    tr: "right-1.5 top-1.5 border-r border-t",
    bl: "left-1.5 bottom-1.5 border-l border-b",
    br: "right-1.5 bottom-1.5 border-r border-b",
  };
  return <span className={`${base} ${map[pos]}`} aria-hidden />;
}
