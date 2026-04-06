/**
 * Remotion Video Composition — Escola dos Véus
 *
 * This component defines the full video structure that Remotion renders to MP4.
 * It receives a manifest (scenes + audio + metadata) and assembles everything:
 *   - Video clips as background (with dissolve transitions)
 *   - Narration audio (ElevenLabs)
 *   - Text overlays (Playfair Display, creme on navy)
 *   - Background music (ambient, low volume)
 *   - Intentional silences between sections
 *
 * Usage with Remotion CLI:
 *   npx remotion render VideoComposition --props='manifest.json' out.mp4
 *
 * Usage with Remotion Lambda:
 *   renderMediaOnLambda({ composition: "VideoComposition", inputProps: manifest })
 */

import React from "react";
// NOTE: These imports require `remotion` package to be installed.
// Install with: npm i remotion @remotion/cli
// The types below allow the code to be read and understood without the package.

// Type stubs — replaced by real Remotion imports at build time
type RemotionFC<T> = React.FC<T>;

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type SceneData = {
  type: string;
  narration: string;
  overlayText: string;
  durationSec: number;
  imageUrl: string | null;
  animationUrl: string | null;
};

export type VideoManifest = {
  courseSlug: string;
  title: string;
  sceneLabel: string;
  audioUrl: string;
  backgroundMusicUrl?: string;
  scenes: SceneData[];
};

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────

const COLORS = {
  background: "#1A1A2E",
  text: "#F5F0E6",
  accent: "#D4A853",
  silhouette: "#C4745A",
} as const;

const FONTS = {
  heading: "Playfair Display, Cormorant Garamond, Georgia, serif",
  body: "Cormorant Garamond, Georgia, serif",
} as const;

const FPS = 30;
const DISSOLVE_FRAMES = 30; // 1 second dissolve between scenes

// ─── HELPER: Convert seconds to frames ──────────────────────────────────────

function secToFrames(sec: number): number {
  return Math.round(sec * FPS);
}

// ─── SCENE COMPONENTS ───────────────────────────────────────────────────────

/**
 * Text overlay with fade-in animation.
 * Appears centered, creme on dark, with Playfair Display.
 */
const TextOverlay: React.FC<{
  text: string;
  frame: number;
  startFrame: number;
  endFrame: number;
  fontSize?: number;
  isTitle?: boolean;
}> = ({ text, frame, startFrame, endFrame, fontSize = 48, isTitle }) => {
  if (!text || frame < startFrame || frame > endFrame) return null;

  const fadeInDuration = 30; // 1 second
  const fadeOutDuration = 30;
  const progress = frame - startFrame;
  const remaining = endFrame - frame;

  let opacity = 1;
  if (progress < fadeInDuration) opacity = progress / fadeInDuration;
  if (remaining < fadeOutDuration) opacity = Math.min(opacity, remaining / fadeOutDuration);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10%",
        opacity,
        zIndex: 10,
      }}
    >
      <p
        style={{
          color: COLORS.text,
          fontFamily: isTitle ? FONTS.heading : FONTS.body,
          fontSize,
          fontWeight: isTitle ? 600 : 400,
          textAlign: "center",
          lineHeight: 1.4,
          whiteSpace: "pre-line",
          textShadow: "0 2px 20px rgba(0,0,0,0.8)",
          maxWidth: "80%",
        }}
      >
        {text}
      </p>
    </div>
  );
};

/**
 * Video/Image background for a scene.
 * Shows animated clip if available, falls back to still image,
 * falls back to solid color.
 */
const SceneBackground: React.FC<{
  scene: SceneData;
  frame: number;
  startFrame: number;
  endFrame: number;
}> = ({ scene, frame, startFrame, endFrame }) => {
  const progress = frame - startFrame;
  const remaining = endFrame - frame;

  // Dissolve in/out
  let opacity = 1;
  if (progress < DISSOLVE_FRAMES) opacity = progress / DISSOLVE_FRAMES;
  if (remaining < DISSOLVE_FRAMES) opacity = Math.min(opacity, remaining / DISSOLVE_FRAMES);

  const src = scene.animationUrl || scene.imageUrl;

  if (!src) {
    // Solid background with subtle gradient
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at center, ${COLORS.background}ee, ${COLORS.background})`,
          opacity,
        }}
      />
    );
  }

  const isVideo = scene.animationUrl && (
    scene.animationUrl.endsWith(".mp4") ||
    scene.animationUrl.endsWith(".webm") ||
    scene.animationUrl.endsWith(".webp")
  );

  if (isVideo) {
    // In real Remotion, use <Video /> component from 'remotion'
    // For now, use HTML video element (Remotion will handle frame-accurate rendering)
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

  // Still image with subtle Ken Burns effect (slow zoom)
  const zoomProgress = progress / (endFrame - startFrame);
  const scale = 1 + zoomProgress * 0.05; // 5% zoom over scene duration

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

// ─── MAIN COMPOSITION ───────────────────────────────────────────────────────

/**
 * Main video composition.
 *
 * When used with Remotion:
 *   import { Composition } from 'remotion';
 *   <Composition component={VideoComposition} ... />
 *
 * The component renders frame-by-frame. Remotion calls it for each frame
 * and composites the result into the final video.
 */
export const VideoComposition: RemotionFC<VideoManifest> = (props) => {
  const { scenes, audioUrl, backgroundMusicUrl, title } = props;

  // Calculate timeline: each scene starts after the previous one ends
  // with overlap for dissolves
  const timeline: { scene: SceneData; startFrame: number; endFrame: number }[] = [];
  let currentFrame = 0;

  for (const scene of scenes) {
    const duration = secToFrames(scene.durationSec);
    timeline.push({
      scene,
      startFrame: currentFrame,
      endFrame: currentFrame + duration,
    });
    // Next scene starts slightly before this one ends (dissolve overlap)
    currentFrame += duration - DISSOLVE_FRAMES;
  }

  // Total duration is the end of the last scene
  const totalFrames = timeline.length > 0
    ? timeline[timeline.length - 1].endFrame
    : 0;

  // In real Remotion, useCurrentFrame() gives the current frame number.
  // This is a placeholder — Remotion replaces it at render time.
  // For preview/documentation purposes we use 0.
  const frame = 0; // Replace with: const frame = useCurrentFrame();

  // Determine which overlay text to show based on scene type
  const getOverlayFontSize = (type: string): number => {
    switch (type) {
      case "abertura": return 56;
      case "frase_final": return 44;
      case "cta": return 36;
      case "fecho": return 40;
      case "pergunta": return 42;
      default: return 36;
    }
  };

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: COLORS.background,
        position: "relative",
        overflow: "hidden",
        fontFamily: FONTS.body,
      }}
    >
      {/* Layer 1: Scene backgrounds (video clips or images) */}
      {timeline.map(({ scene, startFrame, endFrame }, i) => (
        <SceneBackground
          key={i}
          scene={scene}
          frame={frame}
          startFrame={startFrame}
          endFrame={endFrame}
        />
      ))}

      {/* Layer 2: Text overlays */}
      {timeline.map(({ scene, startFrame, endFrame }, i) => {
        if (!scene.overlayText) return null;

        // Delay text appearance slightly after scene starts
        const textDelay = scene.type === "abertura" ? 30 : 15;
        const isTitle = scene.type === "abertura" || scene.type === "fecho";

        return (
          <TextOverlay
            key={`text-${i}`}
            text={scene.overlayText}
            frame={frame}
            startFrame={startFrame + textDelay}
            endFrame={endFrame - 10}
            fontSize={getOverlayFontSize(scene.type)}
            isTitle={isTitle}
          />
        );
      })}

      {/* Layer 3: Narration audio */}
      {/* In real Remotion: <Audio src={audioUrl} /> */}
      {audioUrl && (
        <audio src={audioUrl} style={{ display: "none" }} />
      )}

      {/* Layer 4: Background music (low volume) */}
      {/* In real Remotion: <Audio src={backgroundMusicUrl} volume={0.08} /> */}
      {backgroundMusicUrl && (
        <audio src={backgroundMusicUrl} style={{ display: "none" }} />
      )}

      {/* Watermark / Logo — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 40,
          opacity: 0.3,
          color: COLORS.text,
          fontFamily: FONTS.heading,
          fontSize: 18,
          letterSpacing: 2,
        }}
      >
        SETE VEUS
      </div>
    </div>
  );
};

/**
 * Remotion registration helper.
 *
 * In your Remotion root file (remotion/Root.tsx), use:
 *
 *   import { Composition } from 'remotion';
 *   import { VideoComposition } from './VideoComposition';
 *
 *   export const Root = () => (
 *     <Composition
 *       id="VideoComposition"
 *       component={VideoComposition}
 *       durationInFrames={calculateTotalFrames(manifest)}
 *       fps={30}
 *       width={1920}
 *       height={1080}
 *       defaultProps={manifest}
 *     />
 *   );
 */
export function calculateTotalFrames(manifest: VideoManifest): number {
  let frames = 0;
  for (const scene of manifest.scenes) {
    frames += secToFrames(scene.durationSec);
    if (frames > DISSOLVE_FRAMES) frames -= DISSOLVE_FRAMES; // overlap
  }
  return frames + DISSOLVE_FRAMES; // add back last scene's full length
}

export { FPS, DISSOLVE_FRAMES, COLORS, FONTS };
export default VideoComposition;
