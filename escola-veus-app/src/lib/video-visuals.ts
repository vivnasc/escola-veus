/**
 * Video Visual Identity System — Mundo dos Véus
 *
 * Renders course-specific visuals directly on Canvas:
 * - Background gradients per territory
 * - Particle systems (gold dust, embers, mist, flowers, echoes)
 * - Silhouette figures (terracotta, faceless, pose-based)
 * - Scene-specific compositions
 *
 * Zero external images needed. Every video has unique visual identity.
 */

// ─── PALETTES ─────────────────────────────────────────────────────────────

export type CoursePalette = {
  bg: string;
  bgDeep: string;
  accent: string;
  accentSecondary: string;
  glow: string;
  silhouette: string;
  silhouetteGlow: string;
  text: string;
  textAccent: string;
  particleColors: string[];
};

const PALETTES: Record<string, CoursePalette> = {
  "ouro-proprio": {
    bg: "#1A1A2E",
    bgDeep: "#0D0D1A",
    accent: "#D4A853",
    accentSecondary: "#C9A96E",
    glow: "#FFD700",
    silhouette: "#C4745A",
    silhouetteGlow: "#C9A96E",
    text: "#F5F0E6",
    textAccent: "#D4A853",
    particleColors: ["#D4A853", "#C9A96E", "#FFD700", "#B8860B"],
  },
  "sangue-e-seda": {
    bg: "#1A0A0E",
    bgDeep: "#0D0508",
    accent: "#8B2252",
    accentSecondary: "#C4745A",
    glow: "#DC143C",
    silhouette: "#C4745A",
    silhouetteGlow: "#8B2252",
    text: "#F5F0E6",
    textAccent: "#E8A0B0",
    particleColors: ["#8B2252", "#DC143C", "#C4745A", "#FFB6C1"],
  },
  "a-arte-da-inteireza": {
    bg: "#1A1A30",
    bgDeep: "#0D0D1F",
    accent: "#8B5CF6",
    accentSecondary: "#6D8FCC",
    glow: "#B388FF",
    silhouette: "#C4745A",
    silhouetteGlow: "#8B5CF6",
    text: "#F5F0E6",
    textAccent: "#B388FF",
    particleColors: ["#8B5CF6", "#6D8FCC", "#B388FF", "#4FC3F7"],
  },
  "depois-do-fogo": {
    bg: "#1A1510",
    bgDeep: "#0D0A08",
    accent: "#E65100",
    accentSecondary: "#4CAF50",
    glow: "#FF6D00",
    silhouette: "#C4745A",
    silhouetteGlow: "#E65100",
    text: "#F5F0E6",
    textAccent: "#FFAB40",
    particleColors: ["#E65100", "#FF6D00", "#FFAB40", "#4CAF50"],
  },
  "olhos-abertos": {
    bg: "#1A1D2E",
    bgDeep: "#0D0E1A",
    accent: "#B0BEC5",
    accentSecondary: "#ECEFF1",
    glow: "#FFFFFF",
    silhouette: "#C4745A",
    silhouetteGlow: "#B0BEC5",
    text: "#F5F0E6",
    textAccent: "#ECEFF1",
    particleColors: ["#B0BEC5", "#ECEFF1", "#FFFFFF", "#78909C"],
  },
  "pele-nua": {
    bg: "#1F1518",
    bgDeep: "#0F0A0C",
    accent: "#D4A08A",
    accentSecondary: "#E8C0B0",
    glow: "#FFCCBC",
    silhouette: "#C4745A",
    silhouetteGlow: "#D4A08A",
    text: "#F5F0E6",
    textAccent: "#FFCCBC",
    particleColors: ["#D4A08A", "#FFCCBC", "#C4745A", "#E8C0B0"],
  },
  "limite-sagrado": {
    bg: "#1A1A20",
    bgDeep: "#0D0D10",
    accent: "#FFD700",
    accentSecondary: "#FFF176",
    glow: "#FFEB3B",
    silhouette: "#C4745A",
    silhouetteGlow: "#FFD700",
    text: "#F5F0E6",
    textAccent: "#FFD700",
    particleColors: ["#FFD700", "#FFF176", "#FFEB3B", "#FFC107"],
  },
  "flores-no-escuro": {
    bg: "#0A0A2E",
    bgDeep: "#05051A",
    accent: "#4FC3F7",
    accentSecondary: "#CE93D8",
    glow: "#80DEEA",
    silhouette: "#C4745A",
    silhouetteGlow: "#4FC3F7",
    text: "#F5F0E6",
    textAccent: "#80DEEA",
    particleColors: ["#4FC3F7", "#CE93D8", "#80DEEA", "#7E57C2"],
  },
  "o-peso-e-o-chao": {
    bg: "#1A1A1A",
    bgDeep: "#0D0D0D",
    accent: "#9E9E9E",
    accentSecondary: "#D4A853",
    glow: "#BDBDBD",
    silhouette: "#C4745A",
    silhouetteGlow: "#9E9E9E",
    text: "#F5F0E6",
    textAccent: "#BDBDBD",
    particleColors: ["#9E9E9E", "#BDBDBD", "#757575", "#D4A853"],
  },
  "voz-de-dentro": {
    bg: "#1A0D2E",
    bgDeep: "#0D051A",
    accent: "#7E57C2",
    accentSecondary: "#D4A853",
    glow: "#B388FF",
    silhouette: "#C4745A",
    silhouetteGlow: "#7E57C2",
    text: "#F5F0E6",
    textAccent: "#B388FF",
    particleColors: ["#7E57C2", "#D4A853", "#B388FF", "#9575CD"],
  },
  "o-fio-invisivel": {
    bg: "#0D1520",
    bgDeep: "#060A10",
    accent: "#B0C4DE",
    accentSecondary: "#D4A853",
    glow: "#E0E8F0",
    silhouette: "#C4745A",
    silhouetteGlow: "#B0C4DE",
    text: "#F5F0E6",
    textAccent: "#E0E8F0",
    particleColors: ["#B0C4DE", "#D4A853", "#E0E8F0", "#8FAABE"],
  },
  "o-espelho-do-outro": {
    bg: "#0A1A14",
    bgDeep: "#050D0A",
    accent: "#50C878",
    accentSecondary: "#D4A853",
    glow: "#76E8A0",
    silhouette: "#C4745A",
    silhouetteGlow: "#50C878",
    text: "#F5F0E6",
    textAccent: "#76E8A0",
    particleColors: ["#50C878", "#D4A853", "#76E8A0", "#3A9D5E"],
  },
  "o-silencio-que-grita": {
    bg: "#141820",
    bgDeep: "#0A0C10",
    accent: "#8899AA",
    accentSecondary: "#E0E0E0",
    glow: "#FFFFFF",
    silhouette: "#C4745A",
    silhouetteGlow: "#8899AA",
    text: "#F5F0E6",
    textAccent: "#E0E0E0",
    particleColors: ["#8899AA", "#E0E0E0", "#FFFFFF", "#667788"],
  },
  "a-teia": {
    bg: "#0D1A10",
    bgDeep: "#060D08",
    accent: "#6B8E23",
    accentSecondary: "#D4A853",
    glow: "#9ACD32",
    silhouette: "#C4745A",
    silhouetteGlow: "#6B8E23",
    text: "#F5F0E6",
    textAccent: "#9ACD32",
    particleColors: ["#6B8E23", "#D4A853", "#9ACD32", "#556B2F"],
  },
  "a-chama": {
    bg: "#1A0A08",
    bgDeep: "#0D0504",
    accent: "#DC3545",
    accentSecondary: "#FF6B35",
    glow: "#FF4500",
    silhouette: "#C4745A",
    silhouetteGlow: "#DC3545",
    text: "#F5F0E6",
    textAccent: "#FF6B35",
    particleColors: ["#DC3545", "#FF4500", "#FF6B35", "#8B0000"],
  },
  "a-mulher-antes-de-mae": {
    bg: "#1A1510",
    bgDeep: "#0D0A08",
    accent: "#C49A6C",
    accentSecondary: "#F5F0E6",
    glow: "#DEB887",
    silhouette: "#C4745A",
    silhouetteGlow: "#C49A6C",
    text: "#F5F0E6",
    textAccent: "#DEB887",
    particleColors: ["#C49A6C", "#DEB887", "#F5F0E6", "#8B7355"],
  },
  "o-oficio-de-ser": {
    bg: "#1A1510",
    bgDeep: "#0D0A08",
    accent: "#CD853F",
    accentSecondary: "#8B7355",
    glow: "#DEB887",
    silhouette: "#C4745A",
    silhouetteGlow: "#CD853F",
    text: "#F5F0E6",
    textAccent: "#DEB887",
    particleColors: ["#CD853F", "#DEB887", "#8B7355", "#D2B48C"],
  },
  "o-relogio-partido": {
    bg: "#141418",
    bgDeep: "#0A0A0D",
    accent: "#C0C0C0",
    accentSecondary: "#DAA520",
    glow: "#E8E8E8",
    silhouette: "#C4745A",
    silhouetteGlow: "#C0C0C0",
    text: "#F5F0E6",
    textAccent: "#DAA520",
    particleColors: ["#C0C0C0", "#DAA520", "#E8E8E8", "#808080"],
  },
  "a-coroa-escondida": {
    bg: "#1A0D1A",
    bgDeep: "#0D050D",
    accent: "#FFD700",
    accentSecondary: "#800080",
    glow: "#FFEB3B",
    silhouette: "#C4745A",
    silhouetteGlow: "#FFD700",
    text: "#F5F0E6",
    textAccent: "#FFD700",
    particleColors: ["#FFD700", "#800080", "#FFEB3B", "#9B30FF"],
  },
  "a-fome": {
    bg: "#1F1512",
    bgDeep: "#0F0A09",
    accent: "#D4A08A",
    accentSecondary: "#F5F0E6",
    glow: "#FFCCBC",
    silhouette: "#C4745A",
    silhouetteGlow: "#D4A08A",
    text: "#F5F0E6",
    textAccent: "#FFCCBC",
    particleColors: ["#D4A08A", "#FFCCBC", "#F5F0E6", "#C4745A"],
  },
};

// Default palette for unknown courses
const DEFAULT_PALETTE: CoursePalette = PALETTES["ouro-proprio"];

export function getCoursePalette(slug: string): CoursePalette {
  return PALETTES[slug] || DEFAULT_PALETTE;
}

// ─── PARTICLE SYSTEMS ─────────────────────────────────────────────────────

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
};

export type ParticleType =
  | "gold_dust"
  | "embers"
  | "mist"
  | "flowers"
  | "echoes"
  | "threads"
  | "stones";

const COURSE_PARTICLE_TYPE: Record<string, ParticleType> = {
  "ouro-proprio": "gold_dust",
  "sangue-e-seda": "threads",
  "a-arte-da-inteireza": "mist",
  "depois-do-fogo": "embers",
  "olhos-abertos": "mist",
  "pele-nua": "gold_dust",
  "limite-sagrado": "gold_dust",
  "flores-no-escuro": "flowers",
  "o-peso-e-o-chao": "stones",
  "voz-de-dentro": "echoes",
  "o-fio-invisivel": "threads",
  "o-espelho-do-outro": "mist",
  "o-silencio-que-grita": "echoes",
  "a-teia": "threads",
  "a-chama": "embers",
  "a-mulher-antes-de-mae": "gold_dust",
  "o-oficio-de-ser": "stones",
  "o-relogio-partido": "mist",
  "a-coroa-escondida": "gold_dust",
  "a-fome": "gold_dust",
};

// Deterministic particle generator based on time (no state needed)
function generateParticles(
  time: number,
  w: number,
  h: number,
  palette: CoursePalette,
  type: ParticleType,
  count: number = 40
): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 7919 + Math.floor(time * 0.5) * 31;
    const hash = (seed * 2654435761) >>> 0;
    const r1 = (hash & 0xffff) / 0xffff;
    const r2 = ((hash >> 16) & 0xffff) / 0xffff;
    const r3 = ((hash * 48271) & 0xffff) / 0xffff;
    const r4 = ((hash * 16807) & 0xffff) / 0xffff;

    const cycleTime = time + i * 3.7;
    const colorIdx = i % palette.particleColors.length;

    let x: number, y: number, size: number, alpha: number;

    switch (type) {
      case "gold_dust":
        x = r1 * w;
        y = (r2 * h + cycleTime * -8) % (h + 40) - 20;
        if (y < -20) y += h + 40;
        size = 1.5 + r3 * 3;
        alpha = 0.2 + r4 * 0.4;
        break;
      case "embers":
        x = r1 * w + Math.sin(cycleTime * 0.5 + i) * 30;
        y = h - ((cycleTime * 25 + r2 * h) % (h + 60));
        size = 2 + r3 * 4;
        alpha = Math.max(0, 0.5 - (h - y) / h * 0.5);
        break;
      case "mist":
        x = (r1 * w * 1.5 + cycleTime * 5) % (w * 1.5) - w * 0.25;
        y = r2 * h;
        size = 30 + r3 * 80;
        alpha = 0.03 + r4 * 0.06;
        break;
      case "flowers":
        x = r1 * w;
        y = r2 * h;
        size = 3 + r3 * 6;
        alpha = 0.3 + Math.sin(cycleTime * 0.8 + i * 2) * 0.2;
        break;
      case "echoes":
        // Concentric expanding rings
        const ringTime = (cycleTime * 0.3 + i * 0.5) % 4;
        const ringRadius = ringTime * w * 0.15;
        const angle = r1 * Math.PI * 2;
        x = w / 2 + Math.cos(angle) * ringRadius;
        y = h / 2 + Math.sin(angle) * ringRadius;
        size = 2 + r3 * 3;
        alpha = Math.max(0, 0.4 - ringTime * 0.1);
        break;
      case "threads":
        // Flowing silk threads
        x = r1 * w;
        y = (r2 * h + cycleTime * 12) % h;
        size = 1 + r3 * 2;
        alpha = 0.2 + Math.sin(cycleTime + i) * 0.15;
        break;
      case "stones":
        // Slow falling stones
        x = r1 * w;
        y = (r2 * h + cycleTime * 3) % h;
        size = 4 + r3 * 8;
        alpha = 0.15 + r4 * 0.1;
        break;
    }

    particles.push({
      x, y, vx: 0, vy: 0,
      size, alpha,
      color: palette.particleColors[colorIdx],
      life: 1, maxLife: 1,
    });
  }
  return particles;
}

// ─── SILHOUETTE RENDERING ─────────────────────────────────────────────────

export type SilhouettePose =
  | "standing"
  | "seated"
  | "curved"
  | "heart"
  | "open"
  | "walking"
  | "reaching"
  | "none";

// Map scene types to poses
const SCENE_POSE_MAP: Record<string, SilhouettePose> = {
  abertura: "none",
  pergunta: "standing",
  situacao: "seated",
  revelacao: "standing",
  gesto: "heart",
  frase_final: "none",
  cta: "open",
  fecho: "none",
};

export function getScenePose(sceneType: string): SilhouettePose {
  return SCENE_POSE_MAP[sceneType] || "none";
}

function drawSilhouette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pose: SilhouettePose,
  palette: CoursePalette,
  progress: number
) {
  if (pose === "none") return;

  ctx.save();

  // Center position, slightly right of center
  const cx = w * 0.5;
  const baseY = h * 0.85;
  const scale = h * 0.0035; // Figure about 40% of height

  // Glow behind silhouette
  const glowGrad = ctx.createRadialGradient(cx, baseY - 60 * scale, 0, cx, baseY - 60 * scale, 80 * scale);
  glowGrad.addColorStop(0, hexToRgba(palette.silhouetteGlow, 0.15));
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, w, h);

  // Silhouette color
  ctx.fillStyle = palette.silhouette;
  ctx.strokeStyle = "transparent";

  // Breathing animation
  const breathe = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;

  switch (pose) {
    case "standing":
      drawStandingFigure(ctx, cx, baseY, scale, breathe);
      break;
    case "seated":
      drawSeatedFigure(ctx, cx, baseY, scale, breathe);
      break;
    case "curved":
      drawCurvedFigure(ctx, cx, baseY, scale, breathe);
      break;
    case "heart":
      drawHeartFigure(ctx, cx, baseY, scale, breathe);
      break;
    case "open":
      drawOpenFigure(ctx, cx, baseY, scale, breathe);
      break;
    case "walking":
      drawWalkingFigure(ctx, cx, baseY, scale, breathe);
      break;
    case "reaching":
      drawReachingFigure(ctx, cx, baseY, scale, breathe);
      break;
  }

  ctx.restore();
}

// Basic figure parts
function drawHead(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, 10 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawStandingFigure(ctx: CanvasRenderingContext2D, cx: number, baseY: number, s: number, _b: number) {
  // Head
  drawHead(ctx, cx, baseY - 110 * s, s);
  // Neck
  ctx.fillRect(cx - 3 * s, baseY - 98 * s, 6 * s, 10 * s);
  // Torso
  ctx.beginPath();
  ctx.moveTo(cx - 18 * s, baseY - 88 * s);
  ctx.lineTo(cx + 18 * s, baseY - 88 * s);
  ctx.lineTo(cx + 14 * s, baseY - 40 * s);
  ctx.lineTo(cx - 14 * s, baseY - 40 * s);
  ctx.fill();
  // Left arm
  ctx.beginPath();
  ctx.moveTo(cx - 18 * s, baseY - 85 * s);
  ctx.quadraticCurveTo(cx - 28 * s, baseY - 60 * s, cx - 22 * s, baseY - 35 * s);
  ctx.lineTo(cx - 16 * s, baseY - 36 * s);
  ctx.quadraticCurveTo(cx - 22 * s, baseY - 60 * s, cx - 14 * s, baseY - 82 * s);
  ctx.fill();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(cx + 18 * s, baseY - 85 * s);
  ctx.quadraticCurveTo(cx + 28 * s, baseY - 60 * s, cx + 22 * s, baseY - 35 * s);
  ctx.lineTo(cx + 16 * s, baseY - 36 * s);
  ctx.quadraticCurveTo(cx + 22 * s, baseY - 60 * s, cx + 14 * s, baseY - 82 * s);
  ctx.fill();
  // Left leg
  ctx.fillRect(cx - 12 * s, baseY - 40 * s, 8 * s, 40 * s);
  // Right leg
  ctx.fillRect(cx + 4 * s, baseY - 40 * s, 8 * s, 40 * s);
}

function drawSeatedFigure(ctx: CanvasRenderingContext2D, cx: number, baseY: number, s: number, _b: number) {
  const sitY = baseY + 10 * s;
  drawHead(ctx, cx, sitY - 75 * s, s);
  ctx.fillRect(cx - 3 * s, sitY - 63 * s, 6 * s, 8 * s);
  // Torso (slightly forward lean)
  ctx.beginPath();
  ctx.moveTo(cx - 16 * s, sitY - 55 * s);
  ctx.lineTo(cx + 16 * s, sitY - 55 * s);
  ctx.lineTo(cx + 14 * s, sitY - 15 * s);
  ctx.lineTo(cx - 14 * s, sitY - 15 * s);
  ctx.fill();
  // Arms resting on knees
  ctx.beginPath();
  ctx.moveTo(cx - 16 * s, sitY - 50 * s);
  ctx.quadraticCurveTo(cx - 30 * s, sitY - 25 * s, cx - 25 * s, sitY - 5 * s);
  ctx.lineTo(cx - 19 * s, sitY - 7 * s);
  ctx.quadraticCurveTo(cx - 24 * s, sitY - 25 * s, cx - 12 * s, sitY - 47 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 16 * s, sitY - 50 * s);
  ctx.quadraticCurveTo(cx + 30 * s, sitY - 25 * s, cx + 25 * s, sitY - 5 * s);
  ctx.lineTo(cx + 19 * s, sitY - 7 * s);
  ctx.quadraticCurveTo(cx + 24 * s, sitY - 25 * s, cx + 12 * s, sitY - 47 * s);
  ctx.fill();
  // Legs (crossed/folded)
  ctx.beginPath();
  ctx.moveTo(cx - 14 * s, sitY - 15 * s);
  ctx.quadraticCurveTo(cx - 30 * s, sitY, cx - 25 * s, sitY + 5 * s);
  ctx.lineTo(cx + 25 * s, sitY + 5 * s);
  ctx.quadraticCurveTo(cx + 30 * s, sitY, cx + 14 * s, sitY - 15 * s);
  ctx.fill();
}

function drawCurvedFigure(ctx: CanvasRenderingContext2D, cx: number, baseY: number, s: number, _b: number) {
  // Head down, hunched
  drawHead(ctx, cx + 5 * s, baseY - 90 * s, s);
  ctx.fillRect(cx + 2 * s, baseY - 78 * s, 6 * s, 8 * s);
  // Curved torso
  ctx.beginPath();
  ctx.moveTo(cx - 15 * s, baseY - 70 * s);
  ctx.quadraticCurveTo(cx + 10 * s, baseY - 75 * s, cx + 18 * s, baseY - 65 * s);
  ctx.lineTo(cx + 14 * s, baseY - 35 * s);
  ctx.lineTo(cx - 14 * s, baseY - 40 * s);
  ctx.fill();
  // Arms hanging
  ctx.beginPath();
  ctx.moveTo(cx - 15 * s, baseY - 65 * s);
  ctx.quadraticCurveTo(cx - 25 * s, baseY - 45 * s, cx - 18 * s, baseY - 25 * s);
  ctx.lineTo(cx - 12 * s, baseY - 27 * s);
  ctx.quadraticCurveTo(cx - 19 * s, baseY - 45 * s, cx - 11 * s, baseY - 62 * s);
  ctx.fill();
  // Legs
  ctx.fillRect(cx - 12 * s, baseY - 40 * s, 8 * s, 40 * s);
  ctx.fillRect(cx + 4 * s, baseY - 35 * s, 8 * s, 35 * s);
}

function drawHeartFigure(ctx: CanvasRenderingContext2D, cx: number, baseY: number, s: number, b: number) {
  drawHead(ctx, cx, baseY - 108 * s, s);
  ctx.fillRect(cx - 3 * s, baseY - 96 * s, 6 * s, 8 * s);
  // Torso
  ctx.beginPath();
  ctx.moveTo(cx - 17 * s, baseY - 88 * s);
  ctx.lineTo(cx + 17 * s, baseY - 88 * s);
  ctx.lineTo(cx + 14 * s, baseY - 40 * s);
  ctx.lineTo(cx - 14 * s, baseY - 40 * s);
  ctx.fill();
  // Arms crossed on chest
  const armSpread = 2 + b * 2;
  ctx.beginPath();
  ctx.moveTo(cx - 17 * s, baseY - 85 * s);
  ctx.quadraticCurveTo(cx - 20 * s, baseY - 72 * s, cx - armSpread * s, baseY - 68 * s);
  ctx.lineTo(cx + armSpread * s, baseY - 65 * s);
  ctx.quadraticCurveTo(cx + 5 * s, baseY - 72 * s, cx + 17 * s, baseY - 85 * s);
  ctx.lineTo(cx + 13 * s, baseY - 82 * s);
  ctx.quadraticCurveTo(cx + 5 * s, baseY - 70 * s, cx + (armSpread - 4) * s, baseY - 63 * s);
  ctx.lineTo(cx - (armSpread - 4) * s, baseY - 65 * s);
  ctx.quadraticCurveTo(cx - 16 * s, baseY - 70 * s, cx - 13 * s, baseY - 82 * s);
  ctx.fill();
  // Legs
  ctx.fillRect(cx - 11 * s, baseY - 40 * s, 8 * s, 40 * s);
  ctx.fillRect(cx + 3 * s, baseY - 40 * s, 8 * s, 40 * s);
}

function drawOpenFigure(ctx: CanvasRenderingContext2D, cx: number, baseY: number, s: number, b: number) {
  drawHead(ctx, cx, baseY - 112 * s, s);
  ctx.fillRect(cx - 3 * s, baseY - 100 * s, 6 * s, 10 * s);
  // Torso
  ctx.beginPath();
  ctx.moveTo(cx - 18 * s, baseY - 90 * s);
  ctx.lineTo(cx + 18 * s, baseY - 90 * s);
  ctx.lineTo(cx + 14 * s, baseY - 40 * s);
  ctx.lineTo(cx - 14 * s, baseY - 40 * s);
  ctx.fill();
  // Arms wide open
  const spread = 40 + b * 5;
  ctx.beginPath();
  ctx.moveTo(cx - 18 * s, baseY - 87 * s);
  ctx.quadraticCurveTo(cx - 35 * s, baseY - 80 * s, cx - spread * s, baseY - 75 * s);
  ctx.lineTo(cx - spread * s, baseY - 70 * s);
  ctx.quadraticCurveTo(cx - 30 * s, baseY - 75 * s, cx - 14 * s, baseY - 83 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 18 * s, baseY - 87 * s);
  ctx.quadraticCurveTo(cx + 35 * s, baseY - 80 * s, cx + spread * s, baseY - 75 * s);
  ctx.lineTo(cx + spread * s, baseY - 70 * s);
  ctx.quadraticCurveTo(cx + 30 * s, baseY - 75 * s, cx + 14 * s, baseY - 83 * s);
  ctx.fill();
  // Legs
  ctx.fillRect(cx - 12 * s, baseY - 40 * s, 8 * s, 40 * s);
  ctx.fillRect(cx + 4 * s, baseY - 40 * s, 8 * s, 40 * s);
}

function drawWalkingFigure(ctx: CanvasRenderingContext2D, cx: number, baseY: number, s: number, b: number) {
  drawHead(ctx, cx + 3 * s, baseY - 110 * s, s);
  ctx.fillRect(cx + 0 * s, baseY - 98 * s, 6 * s, 10 * s);
  // Torso (slight forward lean)
  ctx.beginPath();
  ctx.moveTo(cx - 15 * s, baseY - 88 * s);
  ctx.lineTo(cx + 18 * s, baseY - 86 * s);
  ctx.lineTo(cx + 15 * s, baseY - 38 * s);
  ctx.lineTo(cx - 13 * s, baseY - 40 * s);
  ctx.fill();
  // Arms in walking motion
  const swing = Math.sin(b * Math.PI * 2) * 12;
  ctx.beginPath();
  ctx.moveTo(cx - 15 * s, baseY - 85 * s);
  ctx.quadraticCurveTo(cx - 22 * s, baseY - 60 * s, cx + (-20 + swing) * s, baseY - 45 * s);
  ctx.lineTo(cx + (-14 + swing) * s, baseY - 47 * s);
  ctx.quadraticCurveTo(cx - 18 * s, baseY - 60 * s, cx - 11 * s, baseY - 82 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 18 * s, baseY - 83 * s);
  ctx.quadraticCurveTo(cx + 25 * s, baseY - 60 * s, cx + (22 - swing) * s, baseY - 45 * s);
  ctx.lineTo(cx + (16 - swing) * s, baseY - 47 * s);
  ctx.quadraticCurveTo(cx + 21 * s, baseY - 60 * s, cx + 14 * s, baseY - 80 * s);
  ctx.fill();
  // Legs (stride)
  ctx.beginPath();
  ctx.moveTo(cx - 11 * s, baseY - 40 * s);
  ctx.lineTo(cx + (-8 + swing * 0.8) * s, baseY);
  ctx.lineTo(cx + (-2 + swing * 0.8) * s, baseY);
  ctx.lineTo(cx - 5 * s, baseY - 40 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 7 * s, baseY - 38 * s);
  ctx.lineTo(cx + (10 - swing * 0.8) * s, baseY);
  ctx.lineTo(cx + (16 - swing * 0.8) * s, baseY);
  ctx.lineTo(cx + 13 * s, baseY - 38 * s);
  ctx.fill();
}

function drawReachingFigure(ctx: CanvasRenderingContext2D, cx: number, baseY: number, s: number, b: number) {
  drawHead(ctx, cx, baseY - 110 * s, s);
  ctx.fillRect(cx - 3 * s, baseY - 98 * s, 6 * s, 10 * s);
  // Torso
  ctx.beginPath();
  ctx.moveTo(cx - 17 * s, baseY - 88 * s);
  ctx.lineTo(cx + 17 * s, baseY - 88 * s);
  ctx.lineTo(cx + 14 * s, baseY - 40 * s);
  ctx.lineTo(cx - 14 * s, baseY - 40 * s);
  ctx.fill();
  // Left arm at side
  ctx.beginPath();
  ctx.moveTo(cx - 17 * s, baseY - 85 * s);
  ctx.quadraticCurveTo(cx - 26 * s, baseY - 60 * s, cx - 20 * s, baseY - 35 * s);
  ctx.lineTo(cx - 14 * s, baseY - 36 * s);
  ctx.quadraticCurveTo(cx - 20 * s, baseY - 60 * s, cx - 13 * s, baseY - 82 * s);
  ctx.fill();
  // Right arm reaching forward
  const reach = 35 + b * 5;
  ctx.beginPath();
  ctx.moveTo(cx + 17 * s, baseY - 85 * s);
  ctx.quadraticCurveTo(cx + 30 * s, baseY - 88 * s, cx + reach * s, baseY - 85 * s);
  ctx.lineTo(cx + reach * s, baseY - 80 * s);
  ctx.quadraticCurveTo(cx + 28 * s, baseY - 83 * s, cx + 13 * s, baseY - 82 * s);
  ctx.fill();
  // Hand
  ctx.beginPath();
  ctx.arc(cx + (reach + 3) * s, baseY - 82 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();
  // Legs
  ctx.fillRect(cx - 12 * s, baseY - 40 * s, 8 * s, 40 * s);
  ctx.fillRect(cx + 4 * s, baseY - 40 * s, 8 * s, 40 * s);
}

// ─── MAIN DRAWING FUNCTIONS ───────────────────────────────────────────────

/**
 * Draw full course-branded background: gradient + particles + territory glow
 */
export function drawCourseBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  courseSlug: string,
  time: number,
  sceneProgress: number
) {
  const palette = getCoursePalette(courseSlug);
  const pType = COURSE_PARTICLE_TYPE[courseSlug] || "gold_dust";

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, palette.bgDeep);
  grad.addColorStop(0.4, palette.bg);
  grad.addColorStop(1, palette.bgDeep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Accent glow (center, subtle)
  const glowGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.5);
  glowGrad.addColorStop(0, hexToRgba(palette.accent, 0.06));
  glowGrad.addColorStop(0.5, hexToRgba(palette.accent, 0.02));
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, w, h);

  // Particles
  const particles = generateParticles(time, w, h, palette, pType, 50);
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (pType === "echoes") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (pType === "threads") {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.sin(time + p.x * 0.01) * 20, p.y + 15);
      ctx.lineWidth = p.size;
      ctx.strokeStyle = p.color;
      ctx.stroke();
    } else if (pType === "stones") {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Vignette
  const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
  vig.addColorStop(0, "transparent");
  vig.addColorStop(1, hexToRgba(palette.bgDeep, 0.6));
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Draw course-branded silhouette for a scene type
 */
export function drawCourseSilhouette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  courseSlug: string,
  sceneType: string,
  progress: number
) {
  const palette = getCoursePalette(courseSlug);
  const pose = getScenePose(sceneType);
  drawSilhouette(ctx, w, h, pose, palette, progress);
}

/**
 * Draw course-branded text overlay
 */
export function drawCourseText(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  courseSlug: string,
  text: string,
  sceneType: string,
  alpha: number
) {
  if (!text) return;

  const palette = getCoursePalette(courseSlug);
  const lines = text.split("\n");
  const isTitle = sceneType === "abertura" || sceneType === "fecho" || sceneType === "cta";
  const isFrase = sceneType === "frase_final";

  const fontSize = isTitle
    ? Math.round(w * 0.035)
    : isFrase
      ? Math.round(w * 0.028)
      : Math.round(w * 0.022);

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.font = `${fontSize}px Georgia, "Playfair Display", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = isTitle ? palette.textAccent : palette.text;

  const yBase = isTitle || isFrase ? h * 0.5 : h * 0.8;
  const lineH = fontSize * 1.6;
  const startY = yBase - (lines.length * lineH) / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, startY + i * lineH);
  });

  ctx.restore();
}

// ─── UTILITIES ────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
