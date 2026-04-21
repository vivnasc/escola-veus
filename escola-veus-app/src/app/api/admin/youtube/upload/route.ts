import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/youtube/upload
 *
 * Faz upload de um MP4 para o canal YouTube da Vivianne via YouTube Data API v3.
 * Suporta agendamento via publishAt (ISO 8601).
 *
 * Env obrigatorias:
 *   GOOGLE_OAUTH_CLIENT_ID
 *   GOOGLE_OAUTH_CLIENT_SECRET
 *   GOOGLE_OAUTH_REFRESH_TOKEN  (scope youtube.upload, obtido via OAuth playground)
 *
 * Body: {
 *   videoUrl: string,           // URL do MP4 no Supabase
 *   title: string,
 *   description?: string,
 *   tags?: string[],
 *   thumbnailUrl?: string,       // opcional
 *   srtUrl?: string,             // opcional (adiciona como caption)
 *   publishAt?: string,          // ISO 8601; se presente → scheduled
 *   madeForKids?: boolean,       // default false
 *   categoryId?: string,         // default "22" (People & Blogs)
 *   privacyStatus?: "public" | "unlisted" | "private",  // default private se publishAt
 * }
 *
 * Retorna: { videoId, watchUrl }
 */

type Body = {
  videoUrl?: string;
  title?: string;
  description?: string;
  tags?: string[];
  thumbnailUrl?: string;
  srtUrl?: string;
  publishAt?: string;
  madeForKids?: boolean;
  categoryId?: string;
  privacyStatus?: "public" | "unlisted" | "private";
};

export async function POST(req: NextRequest) {
  try {
    const {
      videoUrl,
      title,
      description = "",
      tags = [],
      thumbnailUrl,
      srtUrl,
      publishAt,
      madeForKids = false,
      categoryId = "22",
      privacyStatus,
    }: Body = await req.json();

    if (!videoUrl || !title) {
      return NextResponse.json({ erro: "videoUrl e title obrigatorios." }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json(
        {
          erro:
            "Falta config OAuth Google. Env vars necessarias: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN. Ver docs de setup em /CURSOS/MANUAL-PRODUCAO-FUNIL.md (passo 8).",
        },
        { status: 500 },
      );
    }

    const { google } = await import("googleapis");
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    const youtube = google.youtube({ version: "v3", auth: oauth2 });

    // Download video from Supabase (to stream to YouTube)
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      return NextResponse.json(
        { erro: `Download video ${videoRes.status}` },
        { status: 502 },
      );
    }
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
    const { Readable } = await import("node:stream");
    const videoStream = Readable.from(videoBuffer);

    const status: Record<string, unknown> = {
      privacyStatus: publishAt ? "private" : privacyStatus ?? "private",
      selfDeclaredMadeForKids: madeForKids,
    };
    if (publishAt) {
      status.publishAt = publishAt;
      status.privacyStatus = "private"; // YouTube agenda em private + publica automaticamente
    }

    const insertRes = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: title.slice(0, 100),
          description: description.slice(0, 5000),
          tags: tags.slice(0, 20),
          categoryId,
          defaultLanguage: "pt",
          defaultAudioLanguage: "pt",
        },
        status,
      },
      media: {
        body: videoStream,
      },
    });

    const videoId = insertRes.data.id;
    if (!videoId) {
      return NextResponse.json({ erro: "YouTube nao devolveu videoId." }, { status: 502 });
    }

    // Upload thumbnail (optional)
    if (thumbnailUrl) {
      try {
        const tRes = await fetch(thumbnailUrl);
        if (tRes.ok) {
          const tBuf = Buffer.from(await tRes.arrayBuffer());
          const { Readable: ReadableT } = await import("node:stream");
          await youtube.thumbnails.set({
            videoId,
            media: { mimeType: "image/png", body: ReadableT.from(tBuf) },
          });
        }
      } catch {
        /* non-fatal */
      }
    }

    // Upload SRT as caption track (optional)
    if (srtUrl) {
      try {
        const sRes = await fetch(srtUrl);
        if (sRes.ok) {
          const sBuf = Buffer.from(await sRes.arrayBuffer());
          const { Readable: ReadableS } = await import("node:stream");
          await youtube.captions.insert({
            part: ["snippet"],
            requestBody: {
              snippet: {
                videoId,
                language: "pt",
                name: "Português",
                isDraft: false,
              },
            },
            media: {
              mimeType: "application/x-subrip",
              body: ReadableS.from(sBuf),
            },
          });
        }
      } catch {
        /* non-fatal */
      }
    }

    return NextResponse.json({
      videoId,
      watchUrl: `https://youtu.be/${videoId}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
