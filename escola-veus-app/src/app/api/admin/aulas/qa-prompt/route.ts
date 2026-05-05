import { NextRequest, NextResponse } from "next/server";
import { loadQaExtras, saveQaExtras } from "@/lib/qa-extras";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * GET  /api/admin/aulas/qa-prompt
 *   Retorna { extraInstructions: string }.
 *
 * POST /api/admin/aulas/qa-prompt
 *   Body: { extraInstructions: string }
 *   Guarda em course-assets/admin/aulas-qa-prompt.json
 */

export async function GET(_req: NextRequest) {
  try {
    const extras = await loadQaExtras();
    return NextResponse.json({ extraInstructions: extras });
  } catch {
    return NextResponse.json({ extraInstructions: "" });
  }
}

export async function POST(req: NextRequest) {
  let body: { extraInstructions?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }
  if (typeof body.extraInstructions !== "string") {
    return NextResponse.json(
      { erro: "extraInstructions obrigatorio (string)" },
      { status: 400 },
    );
  }
  try {
    await saveQaExtras(body.extraInstructions);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { erro: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
