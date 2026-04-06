import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/test-comfyui
 * Tests connectivity to a ComfyUI (ThinkDiffusion) instance.
 *
 * Body: { comfyuiUrl: string }
 * Returns: { ok: boolean, system_stats?: object, error?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { comfyuiUrl } = await req.json();

    if (!comfyuiUrl) {
      return NextResponse.json(
        { ok: false, error: "comfyuiUrl obrigatorio." },
        { status: 400 }
      );
    }

    // Test /system_stats endpoint (lightweight, always available)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${comfyuiUrl}/system_stats`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({
        ok: false,
        error: `ComfyUI respondeu com status ${res.status}`,
      });
    }

    const stats = await res.json();

    // Also check available checkpoints
    let checkpoints: string[] = [];
    try {
      const modelsRes = await fetch(
        `${comfyuiUrl}/object_info/CheckpointLoaderSimple`
      );
      if (modelsRes.ok) {
        const info = await modelsRes.json();
        const ckptInput =
          info?.CheckpointLoaderSimple?.input?.required?.ckpt_name;
        if (Array.isArray(ckptInput) && Array.isArray(ckptInput[0])) {
          checkpoints = ckptInput[0];
        }
      }
    } catch {
      // Non-critical
    }

    // Check available LoRAs
    let loras: string[] = [];
    try {
      const loraRes = await fetch(`${comfyuiUrl}/object_info/LoraLoader`);
      if (loraRes.ok) {
        const info = await loraRes.json();
        const loraInput = info?.LoraLoader?.input?.required?.lora_name;
        if (Array.isArray(loraInput) && Array.isArray(loraInput[0])) {
          loras = loraInput[0];
        }
      }
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      ok: true,
      system_stats: stats,
      checkpoints,
      loras,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout =
      msg.includes("abort") || msg.includes("timeout");
    return NextResponse.json({
      ok: false,
      error: isTimeout
        ? "Timeout: ComfyUI nao respondeu em 10 segundos."
        : `Erro de conexao: ${msg}`,
    });
  }
}
