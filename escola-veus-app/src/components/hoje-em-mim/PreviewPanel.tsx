"use client";

import { useMemo, useState } from "react";
import seed from "@/data/hoje-em-mim-frases.seed.json";
import {
  KICKER_POR_DIA,
  LABEL_POR_DIA,
  diaSemanaHoje,
  phraseToCaptions,
  type DiaSemana,
} from "@/lib/hoje-em-mim/captions";
import { NightMotionLibrary } from "./MotionLibrary";

type Variant = "A" | "B" | "C";

type Frase = { id: string; dia: DiaSemana; texto: string };

const DEFAULT_MEDIA = "/assets/vc-sabia/motions/db5056e4-aabc-43e6-ab9f-48f8d96c10a8.mp4";
const FALLBACK_MEDIA = "/assets/vc-sabia/motions/IMG_8599.webp";

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DIAS_PT_CURTO: Record<DiaSemana, string> = {
  mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui",
  fri: "Sex", sat: "Sáb", sun: "Dom",
};

function formatDatePT(d: Date) {
  return `${d.getDate()} de ${MESES_PT[d.getMonth()]} de ${d.getFullYear()}`;
}

const FRASES = seed.frases as Frase[];

export function HojeEmMimPreviewPanel() {
  const hoje = diaSemanaHoje();
  const [dia, setDia] = useState<DiaSemana>(hoje);
  const frasesDoDia = useMemo(() => FRASES.filter((f) => f.dia === dia), [dia]);
  const [variant, setVariant] = useState<Variant>("B");
  const [phraseId, setPhraseId] = useState<string>(frasesDoDia[0]?.id ?? FRASES[0].id);
  const [media, setMedia] = useState<string>(DEFAULT_MEDIA);
  const [copied, setCopied] = useState<string | null>(null);

  // Quando muda dia, escolhe primeira frase desse dia
  const phrase =
    frasesDoDia.find((f) => f.id === phraseId) ?? frasesDoDia[0] ?? FRASES[0];

  const dateLabel = formatDatePT(new Date());
  const isVideo = /\.(mp4|webm|mov)$/i.test(media);
  const captions = phraseToCaptions({ phrase: phrase.texto, dia: phrase.dia });
  const kicker = KICKER_POR_DIA[phrase.dia];

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6 p-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-serif text-escola-dourado">
          Hoje, em Mim — fecho do dia
        </h1>
        <p className="text-sm text-escola-creme-50">
          Post da noite (conta pessoal · IG + TikTok + WhatsApp Status manual).
          Tom contemplativo. Rotação editorial por dia da semana:{" "}
          <strong className="text-escola-creme">Seg</strong> pergunta ·{" "}
          <strong className="text-escola-creme">Ter</strong> gratidão ·{" "}
          <strong className="text-escola-creme">Qua</strong> soltar ·{" "}
          <strong className="text-escola-creme">Qui</strong> aprendi ·{" "}
          <strong className="text-escola-creme">Sex</strong> celebrar ·{" "}
          <strong className="text-escola-creme">Sáb</strong> corpo ·{" "}
          <strong className="text-escola-creme">Dom</strong> intenção.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 rounded-md border border-escola-border p-1">
          {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as DiaSemana[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDia(d);
                const primeira = FRASES.find((f) => f.dia === d);
                if (primeira) setPhraseId(primeira.id);
              }}
              className={`rounded px-3 py-1.5 text-xs transition-colors ${
                dia === d
                  ? "bg-escola-dourado text-escola-bg"
                  : "text-escola-creme-50 hover:text-escola-creme"
              }`}
              title={LABEL_POR_DIA[d]}
            >
              {DIAS_PT_CURTO[d]}
            </button>
          ))}
        </div>
        <div className="text-xs text-escola-creme-50 self-center">
          <span className="text-escola-dourado">{LABEL_POR_DIA[dia]}</span>
          {dia === hoje && (
            <span className="ml-2 rounded bg-escola-dourado/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-escola-dourado">
              hoje
            </span>
          )}
        </div>
      </div>

      <NightMotionLibrary selectedUrl={media} onSelect={setMedia} />

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
          value={phrase.id}
          onChange={(e) => setPhraseId(e.target.value)}
          className="rounded border border-escola-border bg-escola-card px-3 py-1.5 text-xs text-escola-creme"
        >
          {frasesDoDia.map((f) => (
            <option key={f.id} value={f.id}>
              {f.id} · {f.texto.slice(0, 60)}…
            </option>
          ))}
        </select>

        <input
          value={media}
          onChange={(e) => setMedia(e.target.value)}
          placeholder="/assets/hoje-em-mim/motions/…"
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
        <strong className="text-escola-creme">B</strong> — cartão de vidro fosco profundo (recomendado) ·{" "}
        <strong className="text-escola-creme">C</strong> — vidro + moldura dourada morna
      </div>

      <div className="flex flex-wrap gap-8">
        <Frame
          variant={variant}
          phrase={phrase.texto}
          kicker={kicker}
          dateLabel={dateLabel}
          media={media}
          isVideo={isVideo}
        />

        <div className="space-y-3 text-xs text-escola-creme-50">
          <div>
            <div className="text-escola-creme">Kicker</div>
            <div className="mt-1 font-serif text-base text-escola-dourado">{kicker}</div>
          </div>
          <div>
            <div className="text-escola-creme">Frase</div>
            <div className="mt-1 font-serif text-base text-escola-creme">{phrase.texto}</div>
          </div>
          <div>
            <div className="text-escola-creme">Dia editorial</div>
            <div className="mt-1">{LABEL_POR_DIA[phrase.dia]}</div>
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

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-escola-dourado">
          Captions para os 3 canais
        </h2>
        <p className="text-xs text-escola-creme-50">
          Gerados a partir da frase e do dia. Copia e cola na Metricool (IG/TikTok)
          ou no WhatsApp Status. Hashtags ajustadas ao tema do dia.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <CaptionCard
            label="Instagram"
            text={captions.instagram}
            copied={copied === "ig"}
            onCopy={() => copy("ig", captions.instagram)}
          />
          <CaptionCard
            label="TikTok"
            text={captions.tiktok}
            copied={copied === "tt"}
            onCopy={() => copy("tt", captions.tiktok)}
          />
          <CaptionCard
            label="WhatsApp Status"
            text={captions.whatsapp}
            copied={copied === "wa"}
            onCopy={() => copy("wa", captions.whatsapp)}
          />
        </div>
      </section>
    </div>
  );
}

function CaptionCard({
  label,
  text,
  copied,
  onCopy,
}: {
  label: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-escola-border bg-escola-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-escola-dourado">{label}</span>
        <button
          onClick={onCopy}
          className={`rounded px-2 py-1 text-xs transition-colors ${
            copied
              ? "bg-escola-dourado text-escola-bg"
              : "border border-escola-border text-escola-creme-50 hover:text-escola-creme"
          }`}
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-escola-creme">
        {text}
      </pre>
    </div>
  );
}

/**
 * Paleta noturna: violeta profundo + dourado morno (vs. luminoso da manhã VC Sabia).
 * Vinhetas mais densas para suportar a leitura à noite.
 */
function Frame({
  variant,
  phrase,
  kicker,
  dateLabel,
  media,
  isVideo,
}: {
  variant: Variant;
  phrase: string;
  kicker: string;
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
          style={{ filter: "brightness(0.65) saturate(0.85) hue-rotate(-8deg)" }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(0.65) saturate(0.85) hue-rotate(-8deg)" }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(10,5,25,0.05) 25%, rgba(10,5,25,0.75) 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-36"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,5,25,0.75) 0%, rgba(10,5,25,0) 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
        style={{
          background:
            "linear-gradient(to top, rgba(10,5,25,0.7) 0%, rgba(10,5,25,0) 100%)",
        }}
      />

      <header className="absolute inset-x-0 top-0 px-6 pt-6 text-center">
        <div
          className="font-serif italic text-escola-creme"
          style={{
            fontWeight: 400,
            fontSize: 13,
            letterSpacing: "0.06em",
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          {dateLabel}
        </div>
        <div
          className="mx-auto mt-1.5 font-sans text-escola-dourado"
          style={{
            fontSize: 9,
            fontWeight: 400,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            textShadow: "0 1px 4px rgba(0,0,0,0.7)",
          }}
        >
          Hoje, em Mim
        </div>
        <div className="mx-auto mt-2 h-px w-12 bg-escola-dourado/50" />
      </header>

      <main className="absolute inset-0 flex items-center justify-center px-6">
        {variant === "A" && <BodyVariantA phrase={phrase} kicker={kicker} />}
        {variant === "B" && <BodyVariantB phrase={phrase} kicker={kicker} />}
        {variant === "C" && <BodyVariantC phrase={phrase} kicker={kicker} />}
      </main>

      <footer className="absolute inset-x-0 bottom-0 px-6 pb-5 text-center">
        <div
          className="font-sans text-escola-creme-50"
          style={{
            fontWeight: 300,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          seteveus.space
        </div>
      </footer>
    </div>
  );
}

function BodyVariantA({ phrase, kicker }: { phrase: string; kicker: string }) {
  return (
    <p
      className="text-balance text-center font-serif italic text-escola-creme"
      style={{
        fontWeight: 500,
        fontSize: 22,
        lineHeight: 1.45,
        textShadow:
          "0 2px 12px rgba(0,0,0,0.75), 0 1px 2px rgba(0,0,0,0.95), 0 0 1px rgba(0,0,0,0.95)",
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
          textShadow: "0 1px 4px rgba(0,0,0,0.8)",
        }}
      >
        {kicker}
      </span>
      {phrase}
    </p>
  );
}

function BodyVariantB({ phrase, kicker }: { phrase: string; kicker: string }) {
  return (
    <div
      className="rounded-2xl px-5 py-6 text-center"
      style={{
        background: "rgba(15, 8, 35, 0.42)",
        backdropFilter: "blur(16px) saturate(135%)",
        WebkitBackdropFilter: "blur(16px) saturate(135%)",
        border: "1px solid rgba(245, 240, 230, 0.14)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
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
        {kicker}
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

function BodyVariantC({ phrase, kicker }: { phrase: string; kicker: string }) {
  return (
    <div
      className="relative rounded-2xl px-5 py-7 text-center"
      style={{
        background: "rgba(15, 8, 35, 0.22)",
        backdropFilter: "blur(8px) saturate(125%)",
        WebkitBackdropFilter: "blur(8px) saturate(125%)",
        border: "1px solid rgba(201, 169, 110, 0.5)",
        boxShadow:
          "0 6px 22px rgba(0,0,0,0.38), inset 0 0 0 1px rgba(201, 169, 110, 0.1)",
      }}
    >
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
          textShadow: "0 1px 6px rgba(0,0,0,0.7)",
        }}
      >
        {kicker}
      </div>
      <p
        className="text-balance font-serif italic text-escola-creme"
        style={{
          fontWeight: 500,
          fontSize: 21,
          lineHeight: 1.45,
          textShadow:
            "0 2px 10px rgba(0,0,0,0.75), 0 1px 2px rgba(0,0,0,0.9)",
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
