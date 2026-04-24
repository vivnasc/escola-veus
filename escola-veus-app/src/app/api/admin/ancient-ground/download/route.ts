import { NextRequest, NextResponse } from "next/server";

// Edge runtime: streaming nativo, não carrega o ficheiro em memória do
// servidor — passa os bytes do Supabase directo para o cliente.
export const runtime = "edge";

/**
 * GET /api/admin/ancient-ground/download?url=<supabaseUrl>&name=<filename>
 *
 * Proxy de download que força `Content-Type: application/octet-stream` +
 * `Content-Disposition: attachment`. Solução ao bug conhecido do iOS
 * Safari (browser e PWA) que ignora esses headers para `video/mp4` e
 * reproduz inline em vez de descarregar, impossibilitando guardar em
 * Ficheiros/Fotos sem sair pela app externa.
 *
 * Com octet-stream, o Safari não reconhece como vídeo e descarrega
 * normalmente.
 */
const ALLOWED_HOSTS = [
  "https://tdytdamtfillqyklgrmb.supabase.co",
];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const name = req.nextUrl.searchParams.get("name") || "video.mp4";

  if (!url) {
    return new NextResponse("url em falta", { status: 400 });
  }
  if (!ALLOWED_HOSTS.some((h) => url.startsWith(h))) {
    return new NextResponse("host não permitido", { status: 403 });
  }

  const upstream = await fetch(url);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse(`upstream ${upstream.status}`, { status: 502 });
  }

  const safeName = name.replace(/[^A-Za-z0-9._-]/g, "_");
  const headers = new Headers({
    // Força o browser a tratar como binário opaco → descarrega em vez
    // de fazer preview de vídeo.
    "Content-Type": "application/octet-stream",
    "Content-Disposition": `attachment; filename="${safeName}"`,
    "Cache-Control": "private, no-transform",
  });
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new NextResponse(upstream.body, {
    status: 200,
    headers,
  });
}
