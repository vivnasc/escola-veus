import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/thinkdiffusion/import-prompts
 *
 * Parses a markdown file with motion prompts.
 * Format per image:
 *   ### filename.png
 *   MOTION: your prompt here
 *
 * Returns: { prompts: Record<filename, motionPrompt> }
 */

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    const prompts: Record<string, string> = {};

    const blocks = text.split(/^### /m);

    for (const block of blocks) {
      if (!block.trim()) continue;

      const lines = block.trim().split("\n");
      const filename = lines[0].trim();
      if (!filename.match(/\.(png|jpg|jpeg)$/i)) continue;

      const motionLine = lines.find((l) => l.startsWith("MOTION:"));
      if (motionLine) {
        const motion = motionLine.replace("MOTION:", "").trim();
        if (motion) prompts[filename] = motion;
      }
    }

    return NextResponse.json({ prompts, count: Object.keys(prompts).length });
  } catch (err) {
    return NextResponse.json({ erro: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
