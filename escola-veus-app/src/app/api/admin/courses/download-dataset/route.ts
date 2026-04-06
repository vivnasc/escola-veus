import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * GET /api/admin/courses/download-dataset
 * Serves the LoRA training dataset ZIP for download.
 */
export async function GET() {
  const zipPaths = [
    path.join(process.cwd(), "CURSOS/lora-training/seteveus-dataset.zip"),
    path.join(process.cwd(), "CURSOS/lora-training/dataset-seteveus.zip"),
  ];

  const zipPath = zipPaths.find((p) => existsSync(p));

  if (!zipPath) {
    return NextResponse.json(
      { erro: "Dataset ZIP nao encontrado." },
      { status: 404 }
    );
  }

  const data = await readFile(zipPath);

  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="seteveus-dataset.zip"',
      "Content-Length": String(data.length),
    },
  });
}
