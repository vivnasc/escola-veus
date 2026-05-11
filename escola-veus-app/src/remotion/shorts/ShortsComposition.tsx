/**
 * ShortsComposition — Remotion comp 1080x1920 / 30fps / 30s default.
 *
 * Renderiza:
 *   1. Background motion (Loranne A/B/C/D ou AG A/B/C/D) — frame-based, sem
 *      imagens externas.
 *   2. Audio MP3 (Loranne ou AG) com fade in/out.
 *   3. Overlay de versos — 2 frases, cada uma fade in/out em momentos
 *      definidos (default: 3-13s e 16-26s).
 *   4. Signature minimal em baixo (Loranne ou Ancient Ground).
 *
 * Manifest passado por --props='manifest.json' contém todos os campos.
 */

import React from "react";
import { LORANNE_MOTIONS, type LoranneMotionVariant } from "./LoranneMotion";
import { AG_MOTIONS, type AGMotionVariant } from "./AGMotion";

// Remotion dynamic load (mesmo padrão do VideoComposition.tsx).
let useCurrentFrame: () => number;
let useVideoConfig: () => { fps: number; durationInFrames: number; width: number; height: number };
let RemotionAudio: React.FC<{
  src: string;
  volume: number | ((f: number) => number);
  loop?: boolean;
  startFrom?: number;
}>;
let REMOTION_AVAILABLE = false;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const remotion = require("remotion");
  useCurrentFrame = remotion.useCurrentFrame;
  useVideoConfig = remotion.useVideoConfig;
  RemotionAudio = remotion.Audio;
  REMOTION_AVAILABLE = true;
} catch {
  useCurrentFrame = () => 0;
  useVideoConfig = () => ({ fps: 30, durationInFrames: 900, width: 1080, height: 1920 });
}

export type ShortsManifest = {
  brand: "loranne" | "ancient-ground";
  motionVariant: "A" | "B" | "C" | "D";
  /** Cor de acento — só Loranne usa, varia por álbum. */
  accent?: string;
  /** Modo: 2 versos estáticos OU letras a passar em sync. */
  lyricsSync?: boolean;
  /** 2 versos para overlay (modo estático — AG e fallback). */
  verses: [string, string];
  /** Letras inteiras divididas em "stanzas" (modo sync — Loranne lyric video).
   *  Cada stanza é mostrada por um intervalo proporcional ao seu peso. */
  syncedLyrics?: string[];
  /** Timing real por stanza (segundos absolutos) — vindo do Scribe.
   *  Quando presente, sobrepõe-se à distribuição uniforme. */
  stanzaTimings?: { text: string; startSec: number; endSec: number }[];
  /** Conto Claude (AG full) — capítulos passam como texto sobre instrumental. */
  storyChapters?: string[];
  /** Título do conto AG. */
  storyTitle?: string;
  /** URL do MP3. */
  audioUrl: string;
  /** Volume do MP3 (0-1). */
  audioVolume?: number;
  /** Para Loranne: "Faixa · Álbum". Para AG: label do triplete. */
  trackLabel?: string;
  /** Sub-line opcional. */
  signature?: string;
  /** Duração em segundos. Default: 30 (clip) ou 240 (full). */
  durationSec?: number;
  /** Modo de produção: "clip" (30-60s social) ou "full" (3-5 min YT canal). */
  mode?: "clip" | "full";
  /** FPS (default 30). */
  fps?: number;
  /** Onde arrancar o áudio (segundos absolutos no MP3). 0 para full mode;
   *  para clip Loranne com chorus, é o segundo do refrão menos lead-in. */
  audioStartFromSec?: number;
  /** Orientação do canvas. Default "portrait" (1080x1920) — clips IG/TT/YT-Shorts.
   *  "landscape" (1920x1080) — fulls YT canal (Metricool rejeita vertical em YT VIDEO). */
  orientation?: "portrait" | "landscape";
};

const DEFAULT_FPS = 30;
const DEFAULT_DURATION_SEC = 30;

export function calculateShortsTotalFrames(manifest: ShortsManifest): number {
  const fps = manifest.fps ?? DEFAULT_FPS;
  const sec = manifest.durationSec ?? DEFAULT_DURATION_SEC;
  return Math.round(fps * sec);
}

const ACCENT_DEFAULT = "#D4A853";

function easedFade(frame: number, startFrame: number, endFrame: number, fadeFrames: number): number {
  if (frame < startFrame) return 0;
  if (frame > endFrame) return 0;
  const inProgress = Math.min(1, (frame - startFrame) / fadeFrames);
  const outProgress = Math.min(1, (endFrame - frame) / fadeFrames);
  return Math.min(inProgress, outProgress);
}

/**
 * Letras divididas em stanzas, mostradas em sync com o áudio.
 *
 * Quando `stanzaTimings` é fornecido (vindo do ElevenLabs Scribe), cada
 * stanza aparece exactamente quando começa a ser cantada e desaparece
 * quando acaba. Fade in/out de 0.4s nos limites.
 *
 * Sem timings (fallback), distribui uniformemente pelo tempo total —
 * útil quando Scribe falhou ou não está configurado.
 */
const SyncedLyricsLayer: React.FC<{
  stanzas: string[];
  stanzaTimings?: { text: string; startSec: number; endSec: number }[];
  frame: number;
  fps: number;
  totalFrames: number;
  /** Cap por estanza no modo uniform (sem timings). Útil para AG story
   *  onde queremos pacing rápido (~7s/capítulo) independente da duração
   *  do áudio. Última stanza fica visível até ao fim. */
  maxSecPerStanza?: number;
  typeScale?: number;
}> = ({ stanzas, stanzaTimings, frame, fps, totalFrames, maxSecPerStanza, typeScale = 1 }) => {
  if (stanzas.length === 0) return null;

  const fadeFrames = Math.round(fps * 0.4);
  const currentSec = frame / fps;

  // Modo SYNC com timings reais
  if (stanzaTimings && stanzaTimings.length > 0) {
    // 1ª prioridade: stanza activa na janela actual.
    let active = stanzaTimings.find(
      (t) => currentSec >= t.startSec - 0.4 && currentSec <= t.endSec + 0.4,
    );
    // 2ª prioridade: stanza mais recente cujo startSec <= currentSec.
    //   Evita "ecrã vazio" entre stanzas — mostra a anterior até a próxima
    //   começar (continuidade visual em vez de "estático" perceived).
    if (!active) {
      for (let i = stanzaTimings.length - 1; i >= 0; i--) {
        if (stanzaTimings[i].startSec <= currentSec) {
          active = stanzaTimings[i];
          break;
        }
      }
    }
    // 3ª prioridade: primeira stanza (caso ainda nem a primeira começou).
    if (!active) active = stanzaTimings[0];
    if (!active || !active.text) return null;

    const startFrame = Math.round(active.startSec * fps);
    const endFrame = Math.round(active.endSec * fps);
    const inP = Math.min(1, Math.max(0, (frame - (startFrame - fadeFrames)) / fadeFrames));
    const outP = Math.min(1, Math.max(0, ((endFrame + fadeFrames) - frame) / fadeFrames));
    const opacity = Math.max(0.3, Math.min(1, Math.min(inP, outP)));

    return <StanzaText text={active.text} opacity={opacity} typeScale={typeScale} />;
  }

  // Fallback uniforme (sem Scribe)
  const buffer = Math.round(fps * 2);
  const usable = Math.max(totalFrames - buffer * 2, 1);
  // Se maxSecPerStanza estiver definido, cada stanza ocupa no máximo
  // esse tempo (pacing rápido para AG story). Última stanza estende-se
  // até ao fim do tempo disponível para não cortar a mensagem final.
  const cappedStanzaFrames = maxSecPerStanza
    ? Math.min(usable / stanzas.length, maxSecPerStanza * fps)
    : usable / stanzas.length;
  const adjusted = frame - buffer;
  if (adjusted < 0) return null;
  if (adjusted >= usable) {
    // Pós-narrativa (modo capped): mostra última stanza com fade-out suave.
    if (maxSecPerStanza) {
      return <StanzaText text={stanzas[stanzas.length - 1]} opacity={0.6} typeScale={typeScale} />;
    }
    return null;
  }
  let i = Math.floor(adjusted / cappedStanzaFrames);
  if (i >= stanzas.length) i = stanzas.length - 1;
  const stanza = stanzas[i];
  if (!stanza) return null;

  const localFrame = adjusted - i * cappedStanzaFrames;
  const inP = Math.min(1, localFrame / fadeFrames);
  const outP = Math.min(1, (cappedStanzaFrames - localFrame) / fadeFrames);
  const opacity = Math.max(0, Math.min(1, Math.min(inP, outP)));

  return <StanzaText text={stanza} opacity={opacity} typeScale={typeScale} />;
};

/** Garante que cada linha (frase) começa com maiúscula, mantendo o
 *  resto do texto intacto. Hashtags (#tag), mentions (@) e URLs ficam
 *  intactos. Aplica-se ao display do vídeo — fonte fica intocada. */
function capitalizeLines(text: string): string {
  return text.split("\n").map((line) => {
    const trimmed = line.trimStart();
    if (!trimmed) return line;
    if (/^[#@]/.test(trimmed) || /^https?:\/\//.test(trimmed)) return line;
    const m = trimmed.match(/^([^\p{L}]*)(\p{L})(.*)$/u);
    if (!m) return line;
    const [, prefix, ch, rest] = m;
    const indent = line.slice(0, line.length - trimmed.length);
    return indent + prefix + ch.toLocaleUpperCase("pt-PT") + rest;
  }).join("\n");
}

const StanzaText: React.FC<{ text: string; opacity: number; typeScale?: number }> = ({ text, opacity, typeScale = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 0, right: 0, top: "50%",
      transform: "translateY(-50%)",
      textAlign: "center",
      padding: "0 8%",
      opacity,
      zIndex: 10,
    }}
  >
    <p
      style={{
        fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
        fontSize: Math.round(56 * typeScale),
        fontWeight: 500,
        letterSpacing: 0.5,
        lineHeight: 1.4,
        color: "#F5F0E6",
        textShadow: "0 4px 30px rgba(0,0,0,0.95), 0 0 80px rgba(0,0,0,0.7)",
        whiteSpace: "pre-line",
        margin: 0,
      }}
    >
      {capitalizeLines(text)}
    </p>
  </div>
);

const VerseOverlay: React.FC<{
  text: string;
  frame: number;
  fps: number;
  startSec: number;
  endSec: number;
  position: "top" | "middle" | "bottom";
  typeScale?: number;
}> = ({ text, frame, fps, startSec, endSec, position, typeScale = 1 }) => {
  if (!text) return null;
  const startFrame = Math.round(startSec * fps);
  const endFrame = Math.round(endSec * fps);
  const fadeFrames = Math.round(fps * 0.6);
  const opacity = easedFade(frame, startFrame, endFrame, fadeFrames);
  if (opacity <= 0) return null;

  const top = position === "top" ? "20%" : position === "middle" ? "50%" : "70%";

  return (
    <div
      style={{
        position: "absolute",
        left: 0, right: 0, top,
        transform: "translateY(-50%)",
        textAlign: "center",
        padding: "0 8%",
        opacity,
        zIndex: 10,
      }}
    >
      <p
        style={{
          fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
          fontSize: Math.round(64 * typeScale),
          fontWeight: 500,
          letterSpacing: 0.5,
          lineHeight: 1.4,
          color: "#F5F0E6",
          textShadow: "0 4px 30px rgba(0,0,0,0.95), 0 0 80px rgba(0,0,0,0.7)",
          whiteSpace: "pre-line",
          margin: 0,
        }}
      >
        {capitalizeLines(text)}
      </p>
    </div>
  );
};

export const ShortsComposition: React.FC<ShortsManifest> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width: canvasW, height: canvasH } = useVideoConfig();
  // Escala tipográfica: 1.0 em portrait 1080×1920; cresce em landscape
  // (1920×1080) usando min(W,H) — texto não fica diminuto numa canvas wide.
  const typeScale = Math.min(canvasW, canvasH) / 1080;

  const accent = props.accent || ACCENT_DEFAULT;
  const Motion = props.brand === "loranne"
    ? LORANNE_MOTIONS[props.motionVariant as LoranneMotionVariant]
    : AG_MOTIONS[props.motionVariant as AGMotionVariant];

  const isSync = !!props.lyricsSync && Array.isArray(props.syncedLyrics) && props.syncedLyrics.length > 0;
  const hasStory = props.brand === "ancient-ground"
    && props.mode === "full"
    && Array.isArray(props.storyChapters)
    && props.storyChapters.length > 0;
  // Tempos default dos 2 versos (modo estático, AG).
  const totalSec = durationInFrames / fps;
  const v1Start = isSync ? 0 : 3;
  const v1End = isSync ? 0 : Math.min(13, totalSec / 2 - 1);
  const v2Start = isSync ? 0 : Math.min(16, totalSec / 2 + 1);
  const v2End = isSync ? 0 : Math.min(26, totalSec - 4);

  const audioVolume = props.audioVolume ?? 1;
  const fadeFrames = Math.round(fps * 1.5);
  const audioVolFn = (f: number) => {
    let v = audioVolume;
    if (f < fadeFrames) v *= f / fadeFrames;
    if (f > durationInFrames - fadeFrames) v *= Math.max(0, (durationInFrames - f) / fadeFrames);
    return Math.max(0, Math.min(1, v));
  };

  const sigOpacity = easedFade(frame, Math.round(fps * 0.5), durationInFrames, Math.round(fps * 0.8));

  return (
    <div
      style={{
        width: canvasW, height: canvasH,
        position: "relative", overflow: "hidden",
        background: "#000",
      }}
    >
      {/* 1. Background motion — ambas as marcas aceitam accent agora. */}
      <Motion frame={frame} accent={accent} />

      {/* 2. Texto — story chapters (AG full), lyrics sync (Loranne) ou 2 versos */}
      {hasStory ? (
        <SyncedLyricsLayer
          stanzas={props.storyChapters!}
          stanzaTimings={undefined}
          frame={frame}
          fps={fps}
          totalFrames={durationInFrames}
          maxSecPerStanza={7.5}
          typeScale={typeScale}
        />
      ) : isSync ? (
        <SyncedLyricsLayer
          stanzas={props.syncedLyrics!}
          stanzaTimings={props.stanzaTimings}
          frame={frame}
          fps={fps}
          totalFrames={durationInFrames}
          typeScale={typeScale}
        />
      ) : (
        <>
          <VerseOverlay text={props.verses[0]} frame={frame} fps={fps} startSec={v1Start} endSec={v1End} position="middle" typeScale={typeScale} />
          <VerseOverlay text={props.verses[1]} frame={frame} fps={fps} startSec={v2Start} endSec={v2End} position="middle" typeScale={typeScale} />
        </>
      )}

      {/* 3. Audio */}
      {props.audioUrl && REMOTION_AVAILABLE && RemotionAudio && (
        <RemotionAudio
          src={props.audioUrl}
          volume={audioVolFn}
          startFrom={props.audioStartFromSec ? Math.round(props.audioStartFromSec * fps) : undefined}
        />
      )}

      {/* 4. Signature + track label */}
      <div
        style={{
          position: "absolute",
          bottom: Math.round(80 * typeScale),
          left: 0, right: 0,
          textAlign: "center",
          opacity: sigOpacity,
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        {props.trackLabel && (
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: Math.round(32 * typeScale),
              color: "rgba(245,240,230,0.85)",
              marginBottom: Math.round(8 * typeScale),
              textShadow: "0 2px 20px rgba(0,0,0,0.95)",
              letterSpacing: 0.5,
            }}
          >
            ♪ {props.trackLabel}
          </div>
        )}
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: Math.round(22 * typeScale),
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(245,240,230,0.55)",
            textShadow: "0 2px 20px rgba(0,0,0,0.95)",
          }}
        >
          {props.signature || (props.brand === "loranne" ? "◯ Loranne" : "Ancient Ground")}
        </div>
      </div>
    </div>
  );
};

export default ShortsComposition;
