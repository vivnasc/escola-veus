import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

import { phraseToCaptions } from "@/lib/vc-sabia/captions";
import { buildVcSabiaCsv, type VcSabiaCsvPost } from "@/lib/vc-sabia/metricool-csv";
import seed from "@/data/vc-sabia-frases.seed.json";

export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/bulk-package
 *
 * Quando todos os jobs do batch terminaram, monta:
 *  - mp4/<DD>-<date>.mp4: 1 ficheiro por dia
 *  - captions/<DD>-whatsapp.txt: caption WhatsApp por dia
 *  - captions/<DD>-instagram.txt
 *  - captions/<DD>-tiktok.txt
 *  - metricool.csv: 1 linha por (dia x plataforma) = 2N linhas
 *  - manifest.json: lista do batch
 *
 * ZIP fica em course-assets/vc-sabia-packages/<batchId>.zip
 *
 * Body: { batchId }
 * Returns: { zipUrl, days, sizeBytes }
 */
export async function POST(req: NextRequest) {
  let body: { batchId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }
  const batchId = body.batchId?.trim();
  if (!batchId) {
    return NextResponse.json({ erro: "batchId em falta" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  // 1) Carregar batch + todos os results
  const batchRes = await fetch(
    `${supabaseUrl}/storage/v1/object/public/course-assets/vc-sabia-batches/${batchId}.json`,
    { cache: "no-store" }
  );
  if (!batchRes.ok) {
    return NextResponse.json({ erro: "Batch nao encontrado" }, { status: 404 });
  }
  const batch = (await batchRes.json()) as {
    batchId: string;
    year: number;
    month: number;
    jobs: Array<{ day: number; date: string; jobId: string; phraseId: string; phraseText: string }>;
  };

  // Para cada job carrega result (para obter videoUrl)
  const completedJobs: Array<{
    day: number;
    date: string;
    phraseId: string;
    phraseText: string;
    phraseTheme: string;
    videoUrl: string;
  }> = [];
  const skippedDays: number[] = [];

  for (const j of batch.jobs) {
    const rRes = await fetch(
      `${supabaseUrl}/storage/v1/object/public/course-assets/render-jobs/${j.jobId}-result.json`,
      { cache: "no-store" }
    );
    if (!rRes.ok) {
      skippedDays.push(j.day);
      continue;
    }
    const result = await rRes.json();
    if (result.status !== "done" || !result.videoUrl) {
      skippedDays.push(j.day);
      continue;
    }
    // Lookup theme do seed
    const seedPhrase = seed.frases.find((f) => f.id === j.phraseId);
    const phraseTheme = seedPhrase?.tema || "beleza-de-existir";
    completedJobs.push({
      day: j.day,
      date: j.date,
      phraseId: j.phraseId,
      phraseText: j.phraseText,
      phraseTheme,
      videoUrl: result.videoUrl,
    });
  }

  if (completedJobs.length === 0) {
    return NextResponse.json(
      { erro: "Nenhum dia completo ainda. Espera todos os renders terminarem." },
      { status: 400 }
    );
  }

  // 2) Construir ZIP
  const zip = new JSZip();
  const csvPosts: VcSabiaCsvPost[] = [];

  for (const job of completedJobs) {
    const dd = String(job.day).padStart(2, "0");
    const captions = phraseToCaptions({
      phrase: job.phraseText,
      theme: job.phraseTheme,
    });

    // Download do MP4 e mete no ZIP
    const mp4Res = await fetch(job.videoUrl);
    if (!mp4Res.ok) {
      skippedDays.push(job.day);
      continue;
    }
    const mp4Buf = await mp4Res.arrayBuffer();
    zip.file(`mp4/${dd}-${job.date}.mp4`, mp4Buf);

    zip.file(`captions/${dd}-instagram.txt`, captions.instagram);
    zip.file(`captions/${dd}-tiktok.txt`, captions.tiktok);
    zip.file(`captions/${dd}-whatsapp.txt`, captions.whatsapp);

    csvPosts.push({
      date: job.date,
      videoUrl: job.videoUrl,
      captionInstagram: captions.instagram,
      captionTiktok: captions.tiktok,
      timeInstagram: "10:00",
      timeTiktok: "10:30",
    });
  }

  zip.file("metricool.csv", buildVcSabiaCsv(csvPosts));
  zip.file(
    "manifest.json",
    JSON.stringify(
      {
        batchId,
        year: batch.year,
        month: batch.month,
        days: completedJobs.length,
        skippedDays,
        builtAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  const zipBuf = await zip.generateAsync({
    type: "uint8array",
    compression: "STORE", // MP4s ja sao comprimidos
  });

  // 3) Upload do ZIP para Supabase
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const zipPath = `vc-sabia-packages/${batchId}.zip`;
  const { error: upErr } = await supabase.storage
    .from("course-assets")
    .upload(zipPath, zipBuf, {
      contentType: "application/zip",
      upsert: true,
    });
  if (upErr) {
    return NextResponse.json(
      { erro: `ZIP upload: ${upErr.message}` },
      { status: 500 }
    );
  }

  const zipUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${zipPath}`;

  return NextResponse.json({
    zipUrl,
    days: completedJobs.length,
    skippedDays,
    sizeBytes: zipBuf.byteLength,
  });
}
