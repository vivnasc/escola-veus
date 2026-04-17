import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

/**
 * POST /api/admin/thinkdiffusion/generate
 *
 * Proxy to Automatic1111 txt2img API on ThinkDiffusion.
 * Avoids CORS issues by proxying through our server.
 *
 * Body: {
 *   serverUrl: string,    // ThinkDiffusion A1111 URL (e.g. https://xxx.thinkdiffusion.xyz:7860)
 *   prompt: string,
 *   negativePrompt?: string,
 *   width?: number,       // default 1920
 *   height?: number,      // default 1080
 *   cfgScale?: number,    // default 6
 *   steps?: number,       // default 35
 *   samplerName?: string, // default "DPM++ 2M Karras"
 *   batchSize?: number,   // default 1 (max 4)
 * }
 *
 * Returns: { images: string[] }  (base64 PNG)
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serverUrl,
      prompt,
      negativePrompt = "cartoon, illustration, painting, drawing, anime, 3d render, CGI, artificial, plastic, oversaturated, text, watermark, logo, signature, frame, border, low quality, blurry, out of focus, deformed, ugly",
      width = 1920,
      height = 1080,
      cfgScale = 6,
      steps = 35,
      samplerName = "DPM++ 2M Karras",
      batchSize = 1,
    } = body;

    if (!serverUrl || !prompt) {
      return NextResponse.json(
        { erro: "serverUrl e prompt obrigatorios." },
        { status: 400 },
      );
    }

    const baseUrl = serverUrl.replace(/\/+$/, "");

    const res = await fetch(`${baseUrl}/sdapi/v1/txt2img`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        negative_prompt: negativePrompt,
        width,
        height,
        cfg_scale: cfgScale,
        steps,
        sampler_name: samplerName,
        batch_size: Math.min(batchSize, 4),
        seed: -1,
        enable_hr: false,
        send_images: true,
        save_images: false,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { erro: `A1111 HTTP ${res.status}: ${text.slice(0, 300)}` },
        { status: 502 },
      );
    }

    const data = await res.json();

    if (!data.images || data.images.length === 0) {
      return NextResponse.json(
        { erro: "A1111 nao devolveu imagens." },
        { status: 500 },
      );
    }

    return NextResponse.json({ images: data.images });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
