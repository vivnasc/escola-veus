import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

/**
 * POST /api/admin/shorts/render-thumbnail
 *
 * Renderiza um still 9:16 (1080x1920) via Shotstack: 1 imagem como
 * fundo + (opcional) verso sobreposto. Output JPG. Guarda em
 * bucket `escola-shorts`, pasta `thumbs/` no Supabase.
 *
 * Body: {
 *   imageUrl: string,
 *   text?: string,
 *   title?: string,   // usado no nome do ficheiro
 * }
 *
 * Returns: { url, path } | { erro }
 */

function buildThumbnailEdit(imageUrl: string, text: string) {
  const length = 1; // 1s — Shotstack still precisa de duracao > 0
  const tracks: Array<{ clips: unknown[] }> = [];

  if (text.trim()) {
    tracks.push({
      clips: [
        {
          asset: {
            type: "text",
            text: text.trim(),
            font: {
              family: "Montserrat ExtraBold",
              color: "#ffffff",
              size: 78,
              lineHeight: 1.15,
            },
            alignment: { horizontal: "center", vertical: "center" },
            background: {
              color: "#000000",
              opacity: 0.4,
              padding: 28,
              borderRadius: 14,
            },
            width: 980,
            height: 700,
          },
          start: 0,
          length,
          offset: { y: -0.05 },
        },
      ],
    });
  }

  tracks.push({
    clips: [
      {
        asset: { type: "image", src: imageUrl },
        start: 0,
        length,
        fit: "cover",
      },
    ],
  });

  return {
    timeline: { background: "#000000", tracks },
    output: {
      format: "jpg",
      resolution: "1080",
      aspectRatio: "9:16",
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, text, title } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ erro: "imageUrl obrigatorio." }, { status: 400 });
    }

    const apiKey = process.env.SHOTSTACK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { erro: "SHOTSTACK_API_KEY nao configurada." },
        { status: 500 },
      );
    }
    const env = process.env.SHOTSTACK_ENV || "stage";
    const baseUrl = `https://api.shotstack.io/${env}`;

    const edit = buildThumbnailEdit(imageUrl, typeof text === "string" ? text : "");

    const renderRes = await fetch(`${baseUrl}/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify(edit),
    });
    if (!renderRes.ok) {
      const err = await renderRes.text();
      return NextResponse.json(
        { erro: `Shotstack HTTP ${renderRes.status}: ${err.slice(0, 300)}` },
        { status: 502 },
      );
    }
    const renderData = await renderRes.json();
    const renderId = renderData.response?.id;
    if (!renderId) {
      return NextResponse.json({ erro: "Shotstack sem render ID." }, { status: 502 });
    }

    // Poll
    let imageUrlOut = "";
    const maxAttempts = 40; // ~3 min
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(`${baseUrl}/render/${renderId}`, {
        headers: { "x-api-key": apiKey },
      });
      if (!statusRes.ok) continue;
      const statusData = await statusRes.json();
      const status = statusData.response?.status;
      if (status === "done") {
        imageUrlOut = statusData.response?.url || "";
        break;
      }
      if (status === "failed") {
        return NextResponse.json(
          { erro: `Shotstack falhou: ${statusData.response?.error || "erro"}` },
          { status: 502 },
        );
      }
    }
    if (!imageUrlOut) {
      return NextResponse.json(
        { erro: "Timeout — thumbnail demorou mais de 3 min." },
        { status: 504 },
      );
    }

    // Save to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ url: imageUrlOut, path: "" });
    }

    try {
      const imgRes = await fetch(imageUrlOut);
      if (!imgRes.ok) return NextResponse.json({ url: imageUrlOut, path: "" });
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      });
      const slug =
        (title || "thumb").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50) ||
        "thumb";
      const filePath = `thumbs/${slug}-${Date.now()}.jpg`;
      const buf = new Uint8Array(await imgRes.arrayBuffer());
      const { error } = await supabase.storage
        .from("escola-shorts")
        .upload(filePath, buf, { contentType: "image/jpeg", upsert: true });
      if (error) return NextResponse.json({ url: imageUrlOut, path: "" });
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/escola-shorts/${filePath}`;
      return NextResponse.json({ url: publicUrl, path: filePath });
    } catch {
      return NextResponse.json({ url: imageUrlOut, path: "" });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Excepcao: ${msg}` }, { status: 500 });
  }
}
