import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { mkdtemp, writeFile, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const runtime = "nodejs";

/**
 * POST /api/admin/longos/concat-narration
 *
 * Concatena os MP3s dos capítulos numa única MP3 final, faz upload para
 * Supabase, e actualiza o projecto longo com narrationUrl + durationSec.
 *
 * Body: { slug: string, chunkUrls: string[] }
 *
 * Estratégia: download paralelo dos MP3s, ffmpeg concat demuxer (sem re-encode
 * — rápido, preserva qualidade), upload final, ffprobe para duração exacta.
 *
 * Vercel Pro: 5min serverless. 10 MP3s × ~5MB cada = 50MB download em paralelo
 * (rápido). Concat sem re-encode é instantâneo. Total: ~30-60s.
 */

async function getFfmpegPath(): Promise<string> {
  const mod = await import("@ffmpeg-installer/ffmpeg");
  const p =
    (mod as { path?: string; default?: { path: string } }).path ??
    (mod as { default?: { path: string } }).default?.path;
  if (!p) throw new Error("ffmpeg binary path nao encontrado");
  return p;
}

// Sem ffprobe-installer no package.json — usamos parse da stderr do ffmpeg.

function runProcess(cmd: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args);
    let stdout = "";
    let stderr = "";
    p.stdout.on("data", (c) => (stdout += c.toString()));
    p.stderr.on("data", (c) => (stderr += c.toString()));
    p.on("error", reject);
    p.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`exit ${code}: ${stderr.slice(-300)}`));
    });
  });
}

async function downloadTo(url: string, dest: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Download falhou ${r.status} ${url}`);
  const buf = new Uint8Array(await r.arrayBuffer());
  await writeFile(dest, buf);
}

export async function POST(req: NextRequest) {
  let body: { slug?: string; chunkUrls?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON invalido" }, { status: 400 });
  }
  const slug = (body.slug || "").trim();
  const chunkUrls = Array.isArray(body.chunkUrls) ? body.chunkUrls : [];
  if (!slug || chunkUrls.length === 0) {
    return NextResponse.json(
      { erro: "slug + chunkUrls[] obrigatorios" },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado" }, { status: 500 });
  }

  let workDir: string | null = null;
  try {
    workDir = await mkdtemp(join(tmpdir(), "longo-concat-"));
    const ffmpeg = await getFfmpegPath();

    // 1. Download paralelo dos MP3s
    const localPaths = chunkUrls.map((_, i) => join(workDir!, `chunk-${i}.mp3`));
    await Promise.all(chunkUrls.map((url, i) => downloadTo(url, localPaths[i])));

    // 2. ffmpeg concat demuxer (sem re-encode)
    // Cria ficheiro de lista no formato `file 'path'` por linha.
    const listPath = join(workDir, "list.txt");
    const listContent = localPaths
      .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
      .join("\n");
    await writeFile(listPath, listContent);

    const outPath = join(workDir, "out.mp3");
    await runProcess(ffmpeg, [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", listPath,
      "-c", "copy",
      outPath,
    ]);

    // 3. Duração exacta via parse da stderr do ffmpeg `-i` (sem ffprobe).
    // ffmpeg sem output sai com código 1 mas escreve "Duration: HH:MM:SS.SS"
    // na stderr — extraímos daí.
    let durationSec = 0;
    try {
      const { stderr } = await runProcess(ffmpeg, ["-i", outPath]).catch(
        (e: unknown) => ({ stdout: "", stderr: String(e) }),
      );
      const m = stderr.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
      if (m) {
        durationSec =
          parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseFloat(m[3]);
      }
    } catch {
      durationSec = 0;
    }

    // 4. Upload do MP3 final
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    const finalPath = `longos-audios/${slug}.mp3`;
    const buf = await readFile(outPath);
    const { error: upErr } = await supabase.storage
      .from("course-assets")
      .upload(finalPath, new Uint8Array(buf), {
        contentType: "audio/mpeg",
        upsert: true,
      });
    if (upErr) throw new Error(`Upload final: ${upErr.message}`);
    const narrationUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${finalPath}?t=${Date.now()}`;

    // 5. Patch o projecto longo com narrationUrl + durationSec
    try {
      const { data } = await supabase.storage
        .from("course-assets")
        .download(`admin/longos/${slug}.json`);
      if (data) {
        const proj = JSON.parse(await data.text());
        const updated = {
          ...proj,
          narrationUrl,
          durationSec,
          updatedAt: new Date().toISOString(),
        };
        await supabase.storage
          .from("course-assets")
          .upload(`admin/longos/${slug}.json`, JSON.stringify(updated, null, 2), {
            contentType: "application/json",
            upsert: true,
          });
      }
    } catch (e) {
      // Não bloqueia — a UI pode patch manualmente.
      console.warn("Patch projecto falhou:", e);
    }

    return NextResponse.json({
      narrationUrl,
      durationSec: +durationSec.toFixed(2),
      chunkCount: chunkUrls.length,
      sizeBytes: buf.byteLength,
    });
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  } finally {
    if (workDir) {
      rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
