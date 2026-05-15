import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/render
 *
 * Compoe o MP4 final via Shotstack:
 *  - motion video (silenciado, em loop se preciso)
 *  - HTML overlay com variante C (cartao de vidro + frase + assinatura)
 *  - audio activo do mood do motion
 *
 * Body: { motionUrl, audioUrl?, phrase, dateLabel, durationSec? }
 * Returns: { videoUrl, renderId }
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "SHOTSTACK_API_KEY nao configurada" }, { status: 503 });
  }
  const env = process.env.SHOTSTACK_ENV || "stage";
  const baseUrl = `https://api.shotstack.io/${env}`;

  let body: {
    motionUrl?: string;
    audioUrl?: string | null;
    phrase?: string;
    dateLabel?: string;
    durationSec?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }

  const motionUrl = body.motionUrl?.trim();
  const audioUrl = body.audioUrl?.trim() || null;
  const phrase = (body.phrase || "").trim();
  const dateLabel = (body.dateLabel || "").trim();
  const durationSec = Math.max(5, Math.min(20, Number(body.durationSec ?? 12)));

  if (!motionUrl) {
    return NextResponse.json({ erro: "motionUrl em falta" }, { status: 400 });
  }
  if (!phrase) {
    return NextResponse.json({ erro: "phrase em falta" }, { status: 400 });
  }

  // Loop do motion para preencher a duracao. Assume motion ~5s.
  const motionUnit = 5;
  const motionClips: Array<Record<string, unknown>> = [];
  for (let t = 0; t < durationSec; t += motionUnit) {
    motionClips.push({
      asset: { type: "video", src: motionUrl, volume: 0 },
      start: t,
      length: Math.min(motionUnit, durationSec - t),
      fit: "cover",
    });
  }

  // HTML overlay (variante C: cartao de vidro com moldura dourada)
  const overlayHtml = `<div class="wrap"><div class="card"><div class="kicker">Sabias que...</div><div class="phrase">${escapeHtml(
    phrase
  )}</div><div class="footer">${escapeHtml(dateLabel)} &middot; seteveus.space</div></div></div>`;
  const overlayCss = `
.wrap { width: 1080px; height: 1920px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 280px; box-sizing: border-box; font-family: 'Cormorant Garamond', Georgia, serif; }
.card { width: 880px; padding: 60px 60px 50px; background: rgba(255,255,255,0.14); border: 2.5px solid rgba(212,175,55,0.85); border-radius: 28px; text-align: center; box-shadow: 0 0 60px rgba(0,0,0,0.25); }
.kicker { color: #D4AF37; font-style: italic; font-size: 52px; margin-bottom: 28px; letter-spacing: 0.04em; }
.phrase { color: #FAF7F0; font-style: italic; font-size: 58px; line-height: 1.32; }
.footer { color: rgba(250,247,240,0.72); font-family: Georgia, serif; font-size: 22px; margin-top: 36px; letter-spacing: 0.04em; }
`;

  const overlayClip = {
    asset: {
      type: "html",
      html: overlayHtml,
      css: overlayCss,
      width: 1080,
      height: 1920,
      background: "transparent",
    },
    start: 0,
    length: durationSec,
  };

  const tracks: Array<Record<string, unknown>> = [
    { clips: [overlayClip] }, // overlay no topo (track 1)
  ];

  if (audioUrl) {
    tracks.push({
      clips: [
        {
          asset: { type: "audio", src: audioUrl, volume: 0.85 },
          start: 0,
          length: durationSec,
          effect: "fadeOut",
        },
      ],
    });
  }

  tracks.push({ clips: motionClips }); // motion no fundo

  const edit = {
    timeline: {
      background: "#000000",
      tracks,
    },
    output: {
      format: "mp4",
      size: { width: 1080, height: 1920 },
      fps: 30,
    },
  };

  // Submit
  const renderRes = await fetch(`${baseUrl}/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify(edit),
  });
  if (!renderRes.ok) {
    const t = await renderRes.text();
    return NextResponse.json(
      { erro: `Shotstack submit ${renderRes.status}: ${t.slice(0, 300)}` },
      { status: 502 }
    );
  }
  const renderData = (await renderRes.json()) as {
    response?: { id?: string; message?: string };
  };
  const renderId = renderData.response?.id;
  if (!renderId) {
    return NextResponse.json(
      { erro: `Shotstack sem render ID: ${JSON.stringify(renderData).slice(0, 300)}` },
      { status: 502 }
    );
  }

  // Poll (max ~4 min)
  const start = Date.now();
  const timeoutMs = 240_000;
  let videoUrl: string | null = null;
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 4000));
    const sr = await fetch(`${baseUrl}/render/${renderId}`, {
      headers: { "x-api-key": apiKey },
    });
    if (!sr.ok) continue;
    const sd = (await sr.json()) as {
      response?: { status?: string; url?: string; error?: string };
    };
    const status = sd.response?.status;
    if (status === "done" || status === "completed") {
      videoUrl = sd.response?.url ?? null;
      break;
    }
    if (status === "failed") {
      return NextResponse.json(
        { erro: `Shotstack falhou: ${sd.response?.error || "sem detalhe"}` },
        { status: 502 }
      );
    }
  }

  if (!videoUrl) {
    return NextResponse.json(
      { erro: `Timeout (${Math.round((Date.now() - start) / 1000)}s). Render pode ainda estar a acabar.`, renderId },
      { status: 504 }
    );
  }

  return NextResponse.json({ videoUrl, renderId, durationSec });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
