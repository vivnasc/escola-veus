import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

/**
 * POST /api/admin/courses/generate-subtitles
 *
 * Generate SRT and WebVTT subtitles from scene narrations + timestamps.
 *
 * Body: {
 *   scenes: Array<{ narration: string, audioStartSec: number, audioEndSec: number, type: string }>,
 *   title?: string
 * }
 * Returns: { srt: string, vtt: string }
 */

type SceneInput = {
  narration: string;
  audioStartSec: number;
  audioEndSec: number;
  type: string;
};

type SubtitleChunk = {
  index: number;
  startSec: number;
  endSec: number;
  text: string;
};

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function formatVTTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function buildChunks(scenes: SceneInput[]): SubtitleChunk[] {
  const chunks: SubtitleChunk[] = [];
  let index = 1;

  for (const scene of scenes) {
    const narration = scene.narration?.trim();
    if (!narration) continue;

    const words = narration.split(/\s+/);
    const windowDuration = scene.audioEndSec - scene.audioStartSec;

    if (windowDuration <= 0) continue;

    // Break into chunks of ~10 words
    const chunkSize = 10;
    const wordGroups: string[][] = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      wordGroups.push(words.slice(i, i + chunkSize));
    }

    const numChunks = wordGroups.length;
    const chunkDuration = windowDuration / numChunks;

    for (let i = 0; i < numChunks; i++) {
      const startSec = scene.audioStartSec + i * chunkDuration;
      const endSec = scene.audioStartSec + (i + 1) * chunkDuration;
      chunks.push({
        index,
        startSec,
        endSec,
        text: wordGroups[i].join(" "),
      });
      index++;
    }
  }

  return chunks;
}

function generateSRT(chunks: SubtitleChunk[]): string {
  return chunks
    .map(
      (c) =>
        `${c.index}\n${formatSRTTime(c.startSec)} --> ${formatSRTTime(c.endSec)}\n${c.text}`,
    )
    .join("\n\n");
}

function generateVTT(chunks: SubtitleChunk[], title?: string): string {
  const header = title ? `WEBVTT - ${title}` : "WEBVTT";
  const body = chunks
    .map(
      (c) =>
        `${c.index}\n${formatVTTTime(c.startSec)} --> ${formatVTTTime(c.endSec)}\n${c.text}`,
    )
    .join("\n\n");
  return `${header}\n\n${body}`;
}

export async function POST(req: NextRequest) {
  try {
    const { scenes, title } = await req.json();

    if (!scenes || !Array.isArray(scenes)) {
      return NextResponse.json({ erro: "scenes array obrigatorio." }, { status: 400 });
    }

    const validScenes: SceneInput[] = scenes.filter(
      (s: SceneInput) =>
        s.narration &&
        s.narration.trim() !== "" &&
        typeof s.audioStartSec === "number" &&
        typeof s.audioEndSec === "number",
    );

    const chunks = buildChunks(validScenes);
    const srt = generateSRT(chunks);
    const vtt = generateVTT(chunks, title);

    return NextResponse.json({ srt, vtt });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
