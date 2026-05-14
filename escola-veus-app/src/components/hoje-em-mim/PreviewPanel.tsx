"use client";

import { useMemo, useState } from "react";
import seed from "@/data/hoje-em-mim-frases.seed.json";
import { MJ_VIDEO_PROMPTS } from "@/data/hoje-em-mim-mj-prompts";
import {
  DIA_LONGO_PT,
  GLIFO_POR_DIA,
  KICKER_POR_DIA,
  LABEL_POR_DIA,
  diaSemanaHoje,
  phraseToCaptions,
  type DiaSemana,
} from "@/lib/hoje-em-mim/captions";
import {
  NIGHT_MOOD_LABELS,
  NIGHT_MOOD_PROMPTS,
} from "@/lib/hoje-em-mim/audio";
import { NightMotionLibrary } from "./MotionLibrary";

type Variant = "A" | "B" | "C";

type Frase = { id: string; dia: DiaSemana; texto: string };

const DEFAULT_MEDIA = "/assets/vc-sabia/motions/db5056e4-aabc-43e6-ab9f-48f8d96c10a8.mp4";
const FALLBACK_MEDIA = "/assets/vc-sabia/motions/IMG_8599.webp";

const DIAS_PT_CURTO: Record<DiaSemana, string> = {
  mon: "Seg", tue: "Ter", wed: "Qua", thu: "Qui",
  fri: "Sex", sat: "Sáb", sun: "Dom",
};

const FRASES = seed.frases as Frase[];

/**
 * Paleta noturna "Carta Noturna".
 *  bg     #0E0820 indigo profundo
 *  cobre  #C28F60 cobre morno (não dourado)
 *  creme  #F2E9D8 papel velho
 *  papel  #E6D7BA tinta sépia
 */
const COBRE = "rgb(194, 143, 96)";
const COBRE_FRACO = "rgba(194, 143, 96, 0.55)";
const CREME = "rgb(242, 233, 216)";
const INDIGO = "rgba(14, 8, 32, 0.85)";

export function HojeEmMimPreviewPanel() {
  const hoje = diaSemanaHoje();
  const [dia, setDia] = useState<DiaSemana>(hoje);
  const frasesDoDia = useMemo(() => FRASES.filter((f) => f.dia === dia), [dia]);
  const [variant, setVariant] = useState<Variant>("A");
  const [phraseId, setPhraseId] = useState<string>(frasesDoDia[0]?.id ?? FRASES[0].id);
  const [media, setMedia] = useState<string>(DEFAULT_MEDIA);
  const [copied, setCopied] = useState<string | null>(null);

  const phrase =
    frasesDoDia.find((f) => f.id === phraseId) ?? frasesDoDia[0] ?? FRASES[0];

  const isVideo = /\.(mp4|webm|mov)$/i.test(media);
  const captions = phraseToCaptions({ phrase: phrase.texto, dia: phrase.dia });
  const kicker = KICKER_POR_DIA[phrase.dia];
  const glifo = GLIFO_POR_DIA[phrase.dia];
  const diaLongo = DIA_LONGO_PT[phrase.dia];

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
        <h1 className="text-2xl font-serif" style={{ color: COBRE }}>
          Hoje, em Mim. Fecho do dia.
        </h1>
        <p className="text-sm text-escola-creme-50">
          Conta pessoal, post da noite. Identidade própria, "Carta Noturna":
          cobre morno em vez de dourado, dia da semana à vertical no lado, kicker
          como assinatura em baixo, glifo discreto, grão de papel.
        </p>
        <p className="text-xs text-escola-creme-50">
          Rotação editorial:
          {" "}<strong className="text-escola-creme">seg</strong> convite ·
          {" "}<strong className="text-escola-creme">ter</strong> gratidão ·
          {" "}<strong className="text-escola-creme">qua</strong> soltar ·
          {" "}<strong className="text-escola-creme">qui</strong> aprendi ·
          {" "}<strong className="text-escola-creme">sex</strong> celebro ·
          {" "}<strong className="text-escola-creme">sáb</strong> corpo ·
          {" "}<strong className="text-escola-creme">dom</strong> intenção.
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
              <span className="mr-1">{GLIFO_POR_DIA[d]}</span>
              {DIAS_PT_CURTO[d]}
            </button>
          ))}
        </div>
        <div className="text-xs text-escola-creme-50 self-center">
          <span style={{ color: COBRE }}>{LABEL_POR_DIA[dia]}</span>
          {dia === hoje && (
            <span
              className="ml-2 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
              style={{ background: "rgba(194, 143, 96, 0.18)", color: COBRE }}
            >
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
              {f.id}. {f.texto.slice(0, 60)}…
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
        Variante <strong className="text-escola-creme">A</strong> Carta aberta:
        texto respira, dia vertical à esquerda, kicker em baixo como assinatura.{" "}
        <strong className="text-escola-creme">B</strong> Carta selada: idem com selo
        de cera em cobre no canto.{" "}
        <strong className="text-escola-creme">C</strong> Janela de lua: arco superior
        em cobre, texto centrado, dia em pé à direita.
      </div>

      <div className="flex flex-wrap gap-8">
        <Frame
          variant={variant}
          phrase={phrase.texto}
          kicker={kicker}
          glifo={glifo}
          diaLongo={diaLongo}
          media={media}
          isVideo={isVideo}
        />

        <div className="space-y-3 text-xs text-escola-creme-50">
          <div>
            <div className="text-escola-creme">Kicker</div>
            <div className="mt-1 font-serif text-base" style={{ color: COBRE }}>
              {glifo} {kicker}
            </div>
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
            <div className="text-escola-creme">Media</div>
            <div className="mt-1 break-all">{media}</div>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-serif text-lg" style={{ color: COBRE }}>
          Captions para os 3 canais
        </h2>
        <p className="text-xs text-escola-creme-50">
          Gerados a partir da frase e do dia. Sem travessões. Copia e cola na
          Metricool (IG/TikTok) ou no WhatsApp Status. Hashtags ajustadas ao tema do dia.
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

      <MjPromptsSection copied={copied} onCopy={copy} />
    </div>
  );
}

function MjPromptsSection({
  copied,
  onCopy,
}: {
  copied: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const [onlyPrior, setOnlyPrior] = useState(true);
  const list = onlyPrior ? MJ_VIDEO_PROMPTS.filter((p) => p.prioritario) : MJ_VIDEO_PROMPTS;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-lg" style={{ color: COBRE }}>
          Library de clips. Prompts Midjourney + áudio noturno
        </h2>
        <label className="flex items-center gap-2 text-xs text-escola-creme-50">
          <input
            type="checkbox"
            checked={onlyPrior}
            onChange={(e) => setOnlyPrior(e.target.checked)}
          />
          só prioritários (5)
        </label>
      </div>
      <p className="text-xs text-escola-creme-50">
        Cada cartão tem o prompt Midjourney V7 video para 9:16 lento (12 a 15s) e o
        mood ElevenLabs sugerido para acompanhar. Copia, gera, faz upload no library
        em cima.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {list.map((p) => {
          const audioPrompt = NIGHT_MOOD_PROMPTS[p.audioMood];
          const audioLabel = NIGHT_MOOD_LABELS[p.audioMood];
          const keyMj = `mj-${p.id}`;
          const keyAudio = `audio-${p.id}`;
          return (
            <div
              key={p.id}
              className="rounded-lg border border-escola-border bg-escola-card p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: COBRE }}>
                  {p.id} {p.prioritario ? "★" : ""}
                </span>
                <span className="text-[10px] text-escola-creme-50">
                  áudio: <span className="text-escola-creme">{audioLabel}</span>
                </span>
              </div>

              <div className="rounded border border-escola-border bg-escola-bg p-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] text-escola-creme-50">Midjourney</span>
                  <button
                    onClick={() => onCopy(keyMj, p.prompt)}
                    className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                      copied === keyMj
                        ? "bg-escola-dourado text-escola-bg"
                        : "border border-escola-border text-escola-creme-50 hover:text-escola-creme"
                    }`}
                  >
                    {copied === keyMj ? "✓" : "Copiar"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-snug text-escola-creme">
                  {p.prompt}
                </pre>
              </div>

              <div className="rounded border border-escola-border bg-escola-bg p-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] text-escola-creme-50">ElevenLabs SFX</span>
                  <button
                    onClick={() => onCopy(keyAudio, audioPrompt)}
                    className={`rounded px-1.5 py-0.5 text-[10px] transition-colors ${
                      copied === keyAudio
                        ? "bg-escola-dourado text-escola-bg"
                        : "border border-escola-border text-escola-creme-50 hover:text-escola-creme"
                    }`}
                  >
                    {copied === keyAudio ? "✓" : "Copiar"}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-snug text-escola-creme">
                  {audioPrompt}
                </pre>
              </div>

              {p.notas && (
                <div className="text-[10px] italic text-escola-creme-50">
                  {p.notas}
                </div>
              )}
            </div>
          );
        })}
      </div>
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
        <span className="text-xs font-medium" style={{ color: COBRE }}>{label}</span>
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
 * Visual "Carta Noturna".
 * Distingue do VC Sabia por:
 *  - Nome do dia escrito vertical (rotação 90°) no lado esquerdo (Var A/B)
 *    ou direito (Var C)
 *  - Kicker e glifo aparecem em baixo, como assinatura, e não no topo
 *  - Cobre morno (#C28F60) substitui o dourado luminoso
 *  - Camada de grão de papel sobre o vídeo
 *  - Sem cartão de vidro: texto respira na tela
 *  - Variante B inclui selo de cera com o glifo
 *  - Variante C usa arco de cobre fino (silhueta de janela de lua)
 */
function Frame({
  variant,
  phrase,
  kicker,
  glifo,
  diaLongo,
  media,
  isVideo,
}: {
  variant: Variant;
  phrase: string;
  kicker: string;
  glifo: string;
  diaLongo: string;
  media: string;
  isVideo: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-escola-border"
      style={{ width: 405, height: 720, background: "#0E0820" }}
    >
      {isVideo ? (
        <video
          src={media}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(0.55) saturate(0.7) contrast(1.05) hue-rotate(-10deg)" }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(0.55) saturate(0.7) contrast(1.05) hue-rotate(-10deg)" }}
        />
      )}

      {/* Grão de papel suave. SVG inline em base64 leve. */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          opacity: 0.18,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>\")",
        }}
      />

      {/* Vinhetas densas para suportar leitura noturna */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(14,8,32,0.05) 20%, rgba(14,8,32,0.82) 100%)",
        }}
      />

      {variant === "C" ? (
        // Janela de lua: arco de cobre no topo
        <svg
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2"
          width="280"
          height="380"
          viewBox="0 0 280 380"
          fill="none"
        >
          <path
            d="M 20 380 L 20 140 A 120 120 0 0 1 260 140 L 260 380"
            stroke={COBRE_FRACO}
            strokeWidth="1.2"
            fill="none"
          />
          <circle cx="140" cy="140" r="3" fill={COBRE} opacity="0.7" />
        </svg>
      ) : (
        // Variantes A e B: dia vertical no lado esquerdo
        <div
          className="absolute font-sans"
          style={{
            left: 24,
            top: "50%",
            transform: "translateY(-50%) rotate(-90deg)",
            transformOrigin: "center",
            color: COBRE_FRACO,
            fontSize: 11,
            letterSpacing: "0.42em",
            textTransform: "lowercase",
            whiteSpace: "nowrap",
          }}
        >
          {diaLongo}
        </div>
      )}

      {variant === "C" && (
        // Variante C: dia vertical no lado direito
        <div
          className="absolute font-sans"
          style={{
            right: 24,
            top: "50%",
            transform: "translateY(-50%) rotate(90deg)",
            transformOrigin: "center",
            color: COBRE_FRACO,
            fontSize: 11,
            letterSpacing: "0.42em",
            textTransform: "lowercase",
            whiteSpace: "nowrap",
          }}
        >
          {diaLongo}
        </div>
      )}

      {/* Corpo: frase em itálico, alinhada à esquerda, respirando */}
      <main className="absolute inset-0 flex flex-col justify-center px-12 pt-10">
        <p
          className="font-serif italic"
          style={{
            color: CREME,
            fontWeight: 400,
            fontSize: 24,
            lineHeight: 1.42,
            letterSpacing: "0.005em",
            textAlign: variant === "C" ? "center" : "left",
            textShadow:
              "0 2px 10px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.85)",
          }}
        >
          {phrase}
        </p>
      </main>

      {/* Assinatura em baixo: glifo + kicker em cobre */}
      <footer
        className="absolute inset-x-0 bottom-0 flex items-baseline gap-2 px-12 pb-10"
        style={{ justifyContent: variant === "C" ? "center" : "flex-start" }}
      >
        <span
          className="font-serif"
          style={{
            color: COBRE,
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          {glifo}
        </span>
        <span
          className="font-sans italic"
          style={{
            color: COBRE,
            fontSize: 13,
            letterSpacing: "0.08em",
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          {kicker}
        </span>
      </footer>

      {/* Variante B: selo de cera no canto superior direito */}
      {variant === "B" && (
        <div
          className="absolute font-serif flex items-center justify-center"
          style={{
            right: 22,
            top: 22,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, rgba(194,143,96,0.95) 0%, rgba(132,86,52,0.95) 70%, rgba(80,46,22,0.95) 100%)",
            color: "#1a0e05",
            fontSize: 20,
            fontWeight: 600,
            boxShadow:
              "0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,220,180,0.4)",
          }}
        >
          {glifo}
        </div>
      )}

      {/* Monograma h,m no canto inferior direito, sem URL */}
      <div
        className="absolute font-serif italic"
        style={{
          right: 14,
          bottom: 14,
          color: COBRE_FRACO,
          fontSize: 11,
          letterSpacing: "0.1em",
        }}
      >
        h,m
      </div>

      {/* Topo: linha de cobre fina no canto, sem data */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: 22,
          top: 22,
          width: 24,
          height: 1,
          background: COBRE_FRACO,
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          left: 22,
          top: 22,
          width: 1,
          height: 24,
          background: COBRE_FRACO,
        }}
      />
    </div>
  );
}
