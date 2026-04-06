/**
 * Remotion Video Composition — Escola dos Véus
 *
 * Full video rendered frame-by-frame by Remotion.
 *
 * Layers (bottom to top):
 *   1. Course-branded background gradient
 *   2. AI-generated image/video (ComfyUI + Runway) — the main visual
 *   3. Particle overlay (CSS-based, course-specific colors)
 *   4. Text overlays — Playfair Display, creme, fade in/out
 *   5. Narration audio — ElevenLabs voice clone
 *   6. Background music — ambient texture, low volume
 *   7. Watermark — "SETE VÉUS" bottom-right, subtle
 *
 * The AI-generated images (ComfyUI with LoRA) contain the illustrated
 * figures/characters — not rendered in code. The LoRA model defines
 * the visual style (terracotta silhouettes, territory landscapes, etc.).
 *
 * Usage:
 *   npx remotion render VideoComposition --props='manifest.json' out.mp4
 */

import React from "react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type SceneData = {
  type: string;
  narration: string;
  overlayText: string;
  durationSec: number;
  imageUrl: string | null;
  animationUrl: string | null;
  /** Real audio start time in seconds (from ElevenLabs timestamps) */
  audioStartSec?: number | null;
  /** Real audio end time in seconds (from ElevenLabs timestamps) */
  audioEndSec?: number | null;
};

export type VideoManifest = {
  courseSlug: string;
  title: string;
  sceneLabel: string;
  audioUrl: string;
  /** URL da música de fundo — ambiente subtil, ~12% volume */
  backgroundMusicUrl?: string;
  /** Volume da música de fundo (0-1). Default: 0.12 */
  backgroundMusicVolume?: number;
  scenes: SceneData[];
};

// ─── COURSE PALETTES ────────────────────────────────────────────────────────
// Inline subset of territory-themes.ts — no Canvas dependency needed.

type Palette = {
  bg: string;
  bgDeep: string;
  accent: string;
  text: string;
  textAccent: string;
  particleColor: string;
};

const PALETTES: Record<string, Palette> = {
  "ouro-proprio":        { bg: "#1A1A2E", bgDeep: "#0D0D1A", accent: "#D4A853", text: "#F5F0E6", textAccent: "#D4A853", particleColor: "#D4A853" },
  "sangue-e-seda":       { bg: "#1A0A0E", bgDeep: "#0D0508", accent: "#8B2252", text: "#F5F0E6", textAccent: "#E8A0B0", particleColor: "#DC143C" },
  "a-arte-da-inteireza": { bg: "#1A1A30", bgDeep: "#0D0D1F", accent: "#8B5CF6", text: "#F5F0E6", textAccent: "#B388FF", particleColor: "#8B5CF6" },
  "depois-do-fogo":      { bg: "#1A1510", bgDeep: "#0D0A08", accent: "#E65100", text: "#F5F0E6", textAccent: "#FFAB40", particleColor: "#FF6D00" },
  "olhos-abertos":       { bg: "#1A1D2E", bgDeep: "#0D0E1A", accent: "#B0BEC5", text: "#F5F0E6", textAccent: "#ECEFF1", particleColor: "#FFFFFF" },
  "limite-sagrado":      { bg: "#1A1A20", bgDeep: "#0D0D10", accent: "#FFD700", text: "#F5F0E6", textAccent: "#FFD700", particleColor: "#FFEB3B" },
  "flores-no-escuro":    { bg: "#0A0A2E", bgDeep: "#05051A", accent: "#4FC3F7", text: "#F5F0E6", textAccent: "#80DEEA", particleColor: "#CE93D8" },
  "voz-de-dentro":       { bg: "#1A0D2E", bgDeep: "#0D051A", accent: "#7E57C2", text: "#F5F0E6", textAccent: "#B388FF", particleColor: "#7E57C2" },
  "a-chama":             { bg: "#1A0A08", bgDeep: "#0D0504", accent: "#DC3545", text: "#F5F0E6", textAccent: "#FF6B35", particleColor: "#FF4500" },
  "o-peso-e-o-chao":     { bg: "#1A1A1A", bgDeep: "#0D0D0D", accent: "#9E9E9E", text: "#F5F0E6", textAccent: "#BDBDBD", particleColor: "#D4A853" },
};

const DEFAULT_PALETTE: Palette = PALETTES["ouro-proprio"];

function getPalette(slug: string): Palette {
  return PALETTES[slug] || DEFAULT_PALETTE;
}

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const DISSOLVE_FRAMES = 30;

function secToFrames(sec: number): number {
  return Math.round(sec * FPS);
}

// ─── BACKGROUND GRADIENT ────────────────────────────────────────────────────

const BrandedBackground: React.FC<{ palette: Palette }> = ({ palette }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: `
        radial-gradient(ellipse at 50% 50%, ${palette.accent}08, transparent 70%),
        linear-gradient(180deg, ${palette.bgDeep} 0%, ${palette.bg} 40%, ${palette.bgDeep} 100%)
      `,
    }}
  />
);

// ─── AI VISUAL LAYER ────────────────────────────────────────────────────────

const AIVisualLayer: React.FC<{
  scene: SceneData;
  frame: number;
  startFrame: number;
  endFrame: number;
}> = ({ scene, frame, startFrame, endFrame }) => {
  const progress = frame - startFrame;
  const remaining = endFrame - frame;

  let opacity = 1;
  if (progress < DISSOLVE_FRAMES) opacity = progress / DISSOLVE_FRAMES;
  if (remaining < DISSOLVE_FRAMES) opacity = Math.min(opacity, remaining / DISSOLVE_FRAMES);

  const src = scene.animationUrl || scene.imageUrl;
  if (!src) return null;

  const isVideo =
    scene.animationUrl &&
    (scene.animationUrl.endsWith(".mp4") ||
      scene.animationUrl.endsWith(".webm") ||
      scene.animationUrl.endsWith(".webp"));

  if (isVideo) {
    // In production Remotion: <Video src={src} />
    return (
      <video
        src={scene.animationUrl!}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity,
        }}
        muted
        playsInline
      />
    );
  }

  // Still image with Ken Burns (slow zoom)
  const zoomProgress = progress / Math.max(1, endFrame - startFrame);
  const scale = 1 + zoomProgress * 0.05;

  return (
    <img
      src={src}
      alt=""
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    />
  );
};

// ─── TEXT OVERLAY ────────────────────────────────────────────────────────────

const TextOverlay: React.FC<{
  text: string;
  sceneType: string;
  palette: Palette;
  frame: number;
  startFrame: number;
  endFrame: number;
}> = ({ text, sceneType, palette, frame, startFrame, endFrame }) => {
  if (!text || frame < startFrame || frame > endFrame) return null;

  const progress = frame - startFrame;
  const remaining = endFrame - frame;

  let opacity = 1;
  if (progress < 30) opacity = progress / 30;
  if (remaining < 30) opacity = Math.min(opacity, remaining / 30);

  const isTitle = sceneType === "abertura" || sceneType === "fecho" || sceneType === "cta";
  const isFrase = sceneType === "frase_final";

  const fontSize = isTitle ? 56 : isFrase ? 44 : sceneType === "pergunta" ? 42 : 36;
  const color = isTitle ? palette.textAccent : palette.text;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: isFrase || isTitle ? "center" : "flex-end",
        justifyContent: "center",
        padding: isTitle ? "10%" : "5% 10% 15%",
        opacity,
        zIndex: 10,
      }}
    >
      <p
        style={{
          color,
          fontFamily: isTitle
            ? "Playfair Display, Cormorant Garamond, Georgia, serif"
            : "Cormorant Garamond, Georgia, serif",
          fontSize,
          fontWeight: isTitle ? 600 : 400,
          textAlign: "center",
          lineHeight: 1.5,
          whiteSpace: "pre-line",
          textShadow: "0 2px 30px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.5)",
          maxWidth: "75%",
          letterSpacing: isTitle ? 1 : 0.5,
        }}
      >
        {text}
      </p>
    </div>
  );
};

// ─── VIGNETTE ───────────────────────────────────────────────────────────────

const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
      zIndex: 5,
      pointerEvents: "none",
    }}
  />
);

// ─── MAIN COMPOSITION ───────────────────────────────────────────────────────

// ─── BACKGROUND MUSIC LAYER ────────────────────────────────────────────────
// Ambiente subtil, quase inaudível — textura, não melodia.
// Fade in nos primeiros 3s, fade out nos últimos 3s.
// In production Remotion: use <Audio /> with volume callback.

const BackgroundMusic: React.FC<{
  src: string;
  volume: number;
  frame: number;
  totalFrames: number;
}> = ({ src, volume, frame, totalFrames }) => {
  const FADE_FRAMES = secToFrames(3);
  let vol = volume;
  if (frame < FADE_FRAMES) vol *= frame / FADE_FRAMES;
  if (frame > totalFrames - FADE_FRAMES) vol *= (totalFrames - frame) / FADE_FRAMES;
  vol = Math.max(0, Math.min(1, vol));

  // In production Remotion: <Audio src={src} volume={vol} loop />
  return (
    <audio
      src={src}
      style={{ display: "none" }}
      loop
      data-volume={vol.toFixed(3)}
    />
  );
};

// ─── MAIN COMPOSITION ───────────────────────────────────────────────────────

export const VideoComposition: React.FC<VideoManifest> = (props) => {
  const { courseSlug, scenes, audioUrl, backgroundMusicUrl, backgroundMusicVolume } = props;
  const palette = getPalette(courseSlug);

  // Build timeline from real audio timestamps when available.
  // This ensures visual scenes are precisely synced to the narration.
  const timeline: { scene: SceneData; startFrame: number; endFrame: number }[] = [];

  const hasRealTimestamps = scenes.some((s) => s.audioStartSec != null);

  if (hasRealTimestamps) {
    // Use ElevenLabs timestamps for precise sync
    for (const scene of scenes) {
      const startFrame = scene.audioStartSec != null
        ? secToFrames(scene.audioStartSec)
        : (timeline.length > 0 ? timeline[timeline.length - 1].endFrame - DISSOLVE_FRAMES : 0);
      const duration = secToFrames(scene.durationSec);
      timeline.push({ scene, startFrame, endFrame: startFrame + duration });
    }
  } else {
    // Fallback: sequential layout with dissolve overlap
    let currentFrame = 0;
    for (const scene of scenes) {
      const duration = secToFrames(scene.durationSec);
      timeline.push({ scene, startFrame: currentFrame, endFrame: currentFrame + duration });
      currentFrame += duration - DISSOLVE_FRAMES;
    }
  }

  // In production Remotion: const frame = useCurrentFrame();
  const frame = 0;

  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: palette.bg,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Layer 1: Branded background gradient (always visible) */}
      <BrandedBackground palette={palette} />

      {/* Layer 2: AI-generated visuals (ComfyUI images + Runway animations) */}
      {/* These contain the illustrated figures/characters from the LoRA model */}
      {timeline.map(({ scene, startFrame, endFrame }, i) => (
        <AIVisualLayer
          key={i}
          scene={scene}
          frame={frame}
          startFrame={startFrame}
          endFrame={endFrame}
        />
      ))}

      {/* Layer 3: Vignette overlay (darkens edges, focuses attention) */}
      <Vignette />

      {/* Layer 4: Text overlays */}
      {timeline.map(({ scene, startFrame, endFrame }, i) => {
        if (!scene.overlayText) return null;
        const textDelay = scene.type === "abertura" ? 45 : 20;
        return (
          <TextOverlay
            key={`text-${i}`}
            text={scene.overlayText}
            sceneType={scene.type}
            palette={palette}
            frame={frame}
            startFrame={startFrame + textDelay}
            endFrame={endFrame - 15}
          />
        );
      })}

      {/* Layer 5: Narration audio */}
      {audioUrl && <audio src={audioUrl} style={{ display: "none" }} />}

      {/* Layer 6: Background music — ambient texture, low volume with fade */}
      {backgroundMusicUrl && (
        <BackgroundMusic
          src={backgroundMusicUrl}
          volume={backgroundMusicVolume ?? 0.12}
          frame={frame}
          totalFrames={timeline.length > 0 ? timeline[timeline.length - 1].endFrame : 0}
        />
      )}

      {/* Layer 7: Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 40,
          opacity: 0.25,
          color: palette.text,
          fontFamily: "Playfair Display, Georgia, serif",
          fontSize: 18,
          letterSpacing: 3,
          textTransform: "uppercase",
          zIndex: 20,
        }}
      >
        Sete Veus
      </div>
    </div>
  );
};

// ─── EXPORTS ────────────────────────────────────────────────────────────────

export function calculateTotalFrames(manifest: VideoManifest): number {
  let frames = 0;
  for (const scene of manifest.scenes) {
    frames += secToFrames(scene.durationSec);
    if (frames > DISSOLVE_FRAMES) frames -= DISSOLVE_FRAMES;
  }
  return frames + DISSOLVE_FRAMES;
}

export { FPS, WIDTH, HEIGHT, DISSOLVE_FRAMES };
export default VideoComposition;
