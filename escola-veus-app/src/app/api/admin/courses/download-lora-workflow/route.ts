import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * GET /api/admin/courses/download-lora-workflow
 * Serves the ComfyUI test workflow JSON for download.
 */
export async function GET() {
  const workflowPath = path.join(
    process.cwd(),
    "CURSOS/lora-training/comfyui-test-workflow.json"
  );

  if (!existsSync(workflowPath)) {
    return NextResponse.json(
      { erro: "Workflow nao encontrado." },
      { status: 404 }
    );
  }

  const data = await readFile(workflowPath, "utf-8");

  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="comfyui-test-workflow.json"',
    },
  });
}
