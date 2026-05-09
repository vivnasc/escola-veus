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
let useVideoConfig: () => { fps: number; durationInFrames: number };
let RemotionAudio: React.FC<{ src: string; volume: number | ((f: number) => number); loop?: boolean }>;
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
  useVideoConfig = () => ({ fps: 30, durationInFrames: 900 });
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
 * Letras divididas em stanzas, cada uma mostrada uniformemente sobre o
 * tempo total. Sem auto-timing por palavra (v1 deliberadamente — sync
 * preciso virá com ElevenLabs Scribe num passo posterior).
 *
 * Cada stanza recebe (totalFrames / N) frames. Fade in/out de 0.4s.
 */
const SyncedLyricsLayer: React.FC<{
  stanzas: string[];
  frame: number;
  fps: number;
  totalFrames: number;
}> = ({ stanzas, frame, fps, totalFrames }) => {
  if (stanzas.length === 0) return null;
  // Reserva os primeiros e últimos 2s para "respirar" (audio fade in/out).
  const buffer = Math.round(fps * 2);
  const usable = Math.max(totalFrames - buffer * 2, 1);
  const stanzaFrames = usable / stanzas.length;
  const fadeFrames = Math.round(fps * 0.4);

  // Index actual
  const adjusted = frame - buffer;
  if (adjusted < 0 || adjusted >= usable) return null;
  const i = Math.min(stanzas.length - 1, Math.floor(adjusted / stanzaFrames));
  const stanza = stanzas[i];
  if (!stanza) return null;

  const localFrame = adjusted - i * stanzaFrames;
  const inP = Math.min(1, localFrame / fadeFrames);
  const outP = Math.min(1, (stanzaFrames - localFrame) / fadeFrames);
  const opacity = Math.max(0, Math.min(1, Math.min(inP, outP)));

  return (
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
          fontSize: 56,
          fontWeight: 500,
          letterSpacing: 0.5,
          lineHeight: 1.4,
          color: "#F5F0E6",
          textShadow: "0 4px 30px rgba(0,0,0,0.95), 0 0 80px rgba(0,0,0,0.7)",
          whiteSpace: "pre-line",
          margin: 0,
        }}
      >
        {stanza}
      </p>
    </div>
  );
};

const VerseOverlay: React.FC<{
  text: string;
  frame: number;
  fps: number;
  startSec: number;
  endSec: number;
  position: "top" | "middle" | "bottom";
}> = ({ text, frame, fps, startSec, endSec, position }) => {
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
          fontSize: 64,
          fontWeight: 500,
          letterSpacing: 0.5,
          lineHeight: 1.4,
          color: "#F5F0E6",
          textShadow: "0 4px 30px rgba(0,0,0,0.95), 0 0 80px rgba(0,0,0,0.7)",
          whiteSpace: "pre-line",
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
};

export const ShortsComposition: React.FC<ShortsManifest> = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const accent = props.accent || ACCENT_DEFAULT;
  const Motion = props.brand === "loranne"
    ? LORANNE_MOTIONS[props.motionVariant as LoranneMotionVariant]
    : AG_MOTIONS[props.motionVariant as AGMotionVariant];

  const isSync = !!props.lyricsSync && Array.isArray(props.syncedLyrics) && props.syncedLyrics.length > 0;
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
        width: 1080, height: 1920,
        position: "relative", overflow: "hidden",
        background: "#000",
      }}
    >
      {/* 1. Background motion */}
      {props.brand === "loranne" ? (
        <Motion frame={frame} accent={accent} />
      ) : (
        // @ts-expect-error AG motion components don't take accent
        <Motion frame={frame} />
      )}

      {/* 2. Letras — sync (Loranne) ou estáticas 2 versos (AG fallback) */}
      {isSync ? (
        <SyncedLyricsLayer
          stanzas={props.syncedLyrics!}
          frame={frame}
          fps={fps}
          totalFrames={durationInFrames}
        />
      ) : (
        <>
          <VerseOverlay text={props.verses[0]} frame={frame} fps={fps} startSec={v1Start} endSec={v1End} position="middle" />
          <VerseOverlay text={props.verses[1]} frame={frame} fps={fps} startSec={v2Start} endSec={v2End} position="middle" />
        </>
      )}

      {/* 3. Audio */}
      {props.audioUrl && REMOTION_AVAILABLE && RemotionAudio && (
        <RemotionAudio src={props.audioUrl} volume={audioVolFn} />
      )}

      {/* 4. Signature + track label */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
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
              fontSize: 32,
              color: "rgba(245,240,230,0.85)",
              marginBottom: 8,
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
            fontSize: 22,
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
