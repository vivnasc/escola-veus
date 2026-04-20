import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/**
 * GET /api/admin/youtube/render-status?id=<renderId>
 *
 * Proxies Shotstack's status endpoint so the browser does not need to hold
 * the Shotstack API key. Returns the render status + (if done) the MP4 URL.
 *
 * Returns: { status: string, url?: string, error?: string }
 */
export async function GET(req: NextRequest) {
  const renderId = req.nextUrl.searchParams.get("id");
  if (!renderId) return NextResponse.json({ erro: "id obrigatorio." }, { status: 400 });

  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey) return NextResponse.json({ erro: "SHOTSTACK_API_KEY nao configurada." }, { status: 500 });
  const env = process.env.SHOTSTACK_ENV || "stage";

  const res = await fetch(`https://api.shotstack.io/${env}/render/${renderId}`, {
    headers: { "x-api-key": apiKey },
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ erro: `Shotstack HTTP ${res.status}: ${err.slice(0, 300)}` }, { status: 502 });
  }

  const data = await res.json();
  const status = data.response?.status;
  const url = data.response?.url;
  const error = data.response?.error;

  return NextResponse.json({ status, url, error });
}
