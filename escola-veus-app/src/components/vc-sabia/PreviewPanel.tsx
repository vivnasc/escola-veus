"use client";

import { useState } from "react";
import seed from "@/data/vc-sabia-frases.seed.json";
import { phraseToCaptions } from "@/lib/vc-sabia/captions";
import {
  DEFAULT_DURATION_SEC,
  MOOD_LABELS,
  MORNING_MOODS,
  type MorningMood,
} from "@/lib/vc-sabia/audio";
import { MotionLibrary } from "./MotionLibrary";

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

export function VcSabiaPreviewPanel() {
  const [variant, setVariant] = useState<Variant>("C");
  const [phraseId, setPhraseId] = useState<string>(SAMPLE_PHRASE_ID);
  const [media, setMedia] = useState<string>(DEFAULT_MEDIA);
  const [copied, setCopied] = useState<string | null>(null);

  const phrase = seed.frases.find((f) => f.id === phraseId) ?? seed.frases[0];
  const dateLabel = formatDatePT(new Date());
  const isVideo = /\.(mp4|webm|mov)$/i.test(media);
  const captions = phraseToCaptions({ phrase: phrase.texto, theme: phrase.tema });

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
          VC Sabia Que…? — Preview de overlay
        </h1>
        <p className="text-sm text-escola-creme-50">
          Compara as três variantes de overlay sobre o ficheiro de teste.
          Frame renderiza a 405×720 (escala 0.375 do output final 1080×1920).
        </p>
      </header>

      <MotionLibrary selectedUrl={media} onSelect={setMedia} />

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

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-escola-dourado">
          Captions para os 3 canais
        </h2>
        <p className="text-xs text-escola-creme-50">
          Gerados automaticamente a partir da frase e do tema. Carrega no
          botão para copiar — depois cola na Metricool (IG/TikTok) ou no
          WhatsApp Status.
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

      <AudioGeneratorSection />
    </div>
  );
}

function AudioGeneratorSection() {
  const [mood, setMood] = useState<MorningMood>("birds-dawn");
  const [durationSec, setDurationSec] = useState<number>(DEFAULT_DURATION_SEC);
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/admin/vc-sabia/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, durationSec }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro || `Erro ${res.status}`);
      } else {
        setAudioUrl(json.audioUrl);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-lg text-escola-dourado">
        Áudio de manhã · ElevenLabs SFX
      </h2>
      <p className="text-xs text-escola-creme-50">
        Escolhe um mood e gera um SFX ambiente para servir de fundo ao motion.
        Custa ~$0.30 por geração (~10s). O ficheiro é guardado em Supabase
        Storage e pode ser reutilizado em múltiplos posts.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-escola-creme-50">
          Mood:
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as MorningMood)}
            className="rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
          >
            {MORNING_MOODS.map((m) => (
              <option key={m} value={m}>
                {MOOD_LABELS[m]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-escola-creme-50">
          Duração:
          <input
            type="number"
            min={3}
            max={22}
            value={durationSec}
            onChange={(e) => setDurationSec(Number(e.target.value))}
            className="w-16 rounded border border-escola-border bg-escola-card px-2 py-1 text-xs text-escola-creme"
          />
          <span>s</span>
        </label>

        <button
          onClick={generate}
          disabled={generating}
          className="rounded-md border border-escola-dourado/60 bg-escola-dourado/10 px-3 py-1.5 text-xs text-escola-dourado transition-colors hover:bg-escola-dourado/20 disabled:opacity-50"
        >
          {generating ? "A gerar…" : "Gerar áudio"}
        </button>
      </div>

      {error && (
        <div className="rounded border border-red-700/40 bg-red-900/20 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {audioUrl && (
        <div className="space-y-2 rounded border border-escola-border bg-escola-card p-3">
          <audio src={audioUrl} controls className="w-full" />
          <a
            href={audioUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-escola-dourado hover:underline"
          >
            {audioUrl}
          </a>
        </div>
      )}
    </section>
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

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(13,13,26,0) 35%, rgba(13,13,26,0.55) 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, rgba(13,13,26,0.65) 0%, rgba(13,13,26,0) 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background:
            "linear-gradient(to top, rgba(13,13,26,0.6) 0%, rgba(13,13,26,0) 100%)",
        }}
      />

      <header className="absolute inset-x-0 top-0 px-6 pt-6 text-center">
        <div
          className="font-serif italic text-escola-creme"
          style={{
            fontWeight: 400,
            fontSize: 13,
            letterSpacing: "0.06em",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          {dateLabel}
        </div>
        <div className="mx-auto mt-2 h-px w-12 bg-escola-dourado/60" />
      </header>

      <main className="absolute inset-0 flex items-center justify-center px-6">
        {variant === "A" && <BodyVariantA phrase={phrase} />}
        {variant === "B" && <BodyVariantB phrase={phrase} />}
        {variant === "C" && <BodyVariantC phrase={phrase} />}
      </main>

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
          seteveus.space
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
        background: "rgba(20, 15, 30, 0.14)",
        backdropFilter: "blur(6px) saturate(120%)",
        WebkitBackdropFilter: "blur(6px) saturate(120%)",
        border: "1px solid rgba(201, 169, 110, 0.55)",
        boxShadow:
          "0 6px 22px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(201, 169, 110, 0.1)",
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
          textShadow: "0 1px 6px rgba(0,0,0,0.6)",
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
          textShadow:
            "0 2px 10px rgba(0,0,0,0.65), 0 1px 2px rgba(0,0,0,0.85)",
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
