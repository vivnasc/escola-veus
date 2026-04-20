import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/admin/youtube/render-submit
 *
 * Submits a YouTube-ambient-video render to Shotstack. Returns the renderId
 * immediately; the client polls status via /render-status and saves to Supabase
 * via /render-save when done. This avoids the 300s Vercel function cap for long
 * (e.g. 1h) renders.
 *
 * Body: {
 *   title: string,
 *   uniqueClips: string[],       // Runway MP4 URLs in the desired playback order
 *   targetDuration: number,      // seconds (e.g. 3600 for 1h)
 *   musicUrls: string[],         // 1-2 ancient-ground tracks for A/B loop
 *   musicVolume?: number,        // 0-1 (default 0.8)
 *   clipDuration?: number,       // seconds per clip (default 15)
 * }
 *
 * Returns: { renderId: string }
 */
export async function POST(req: NextRequest) {
  const {
    uniqueClips,
    targetDuration = 3600,
    musicUrls,
    musicVolume = 0.8,
    clipDuration = 15,
  } = await req.json();

  if (!Array.isArray(uniqueClips) || uniqueClips.length === 0) {
    return NextResponse.json({ erro: "uniqueClips[] obrigatorio." }, { status: 400 });
  }
  if (!Array.isArray(musicUrls) || musicUrls.length === 0) {
    return NextResponse.json({ erro: "musicUrls[] obrigatorio." }, { status: 400 });
  }

  const valid = uniqueClips.filter((u: string) => u && u.trim().length > 0);
  const totalNeeded = Math.ceil(targetDuration / clipDuration);

  // Loop user-supplied order (no shuffle) to preserve group sequencing.
  const clips: string[] = [];
  while (clips.length < totalNeeded) clips.push(...valid);
  const finalClips = clips.slice(0, totalNeeded);

  const edit = buildEdit(finalClips, musicUrls, musicVolume, clipDuration);

  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: "SHOTSTACK_API_KEY nao configurada." }, { status: 500 });
  const env = process.env.SHOTSTACK_ENV || "stage";
  const baseUrl = `https://api.shotstack.io/${env}`;

  const res = await fetch(`${baseUrl}/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify(edit),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ erro: `Shotstack HTTP ${res.status}: ${err.slice(0, 400)}` }, { status: 502 });
  }

  const data = await res.json();
  const renderId = data.response?.id;
  if (!renderId) return NextResponse.json({ erro: "Shotstack nao devolveu render ID." }, { status: 502 });

  return NextResponse.json({ renderId, totalClips: finalClips.length, durationSec: targetDuration });
}

function buildEdit(
  clips: string[],
  musicUrls: string[],
  musicVolume: number,
  clipDuration: number,
) {
  // Crossfade between clips using 2 alternating tracks.
  // Each clip has a 0.5s fade in + fade out. Adjacent clips overlap by 0.5s so
  // the out-fade of clip N happens simultaneously with the in-fade of clip N+1.
  // This masks any dark first/last frames that Runway-generated clips often
  // have, eliminating the flashing between cuts. Clips on the same track
  // cannot overlap, so we alternate even-indexed clips on track A and
  // odd-indexed on track B.
  const OVERLAP = 0.5; // seconds
  const stride = clipDuration - OVERLAP; // how much time each clip advances the timeline
  const trackA: unknown[] = [];
  const trackB: unknown[] = [];
  clips.forEach((url, i) => {
    const clip = {
      asset: { type: "video" as const, src: url, volume: 0 },
      start: i * stride,
      length: clipDuration,
      fit: "crop" as const,
      transition: { in: "fade" as const, out: "fade" as const },
    };
    (i % 2 === 0 ? trackA : trackB).push(clip);
  });

  // With overlap, total timeline = last clip end = (N-1)*stride + clipDuration.
  const totalDuration = (clips.length - 1) * stride + clipDuration;

  const ESTIMATED_TRACK_DURATION = 210;
  const musicClips: unknown[] = [];
  let musicTime = 0;
  let musicIdx = 0;
  while (musicTime < totalDuration) {
    const url = musicUrls[musicIdx % musicUrls.length];
    const remaining = totalDuration - musicTime;
    const length = Math.min(ESTIMATED_TRACK_DURATION, remaining);
    musicClips.push({
      asset: { type: "audio" as const, src: url, volume: musicVolume },
      start: musicTime,
      length,
      transition: {
        in: musicTime === 0 ? ("fade" as const) : undefined,
        out: remaining <= ESTIMATED_TRACK_DURATION ? ("fade" as const) : undefined,
      },
    });
    musicTime += length;
    musicIdx++;
  }

  return {
    timeline: {
      background: "#000000",
      // Shotstack renders lower-indexed tracks below higher-indexed ones, so
      // trackA (even clips) and trackB (odd clips) layer on top of each other;
      // their fades create the crossfade effect at overlaps.
      tracks: [{ clips: trackA }, { clips: trackB }, { clips: musicClips }],
    },
    output: { format: "mp4" as const, resolution: "1080" as const, fps: 30 },
  };
}
