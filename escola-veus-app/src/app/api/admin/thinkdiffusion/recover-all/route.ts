import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 300;

/**
 * GET /api/admin/thinkdiffusion/recover-all
 *
 * Percorre TODOS os taskIds pendentes em `course-assets/youtube/tasks/*.json`
 * (guardados pelo save-task no momento do submit ao Runway), consulta cada
 * no Runway, descarrega os SUCCEEDED e guarda em `youtube/clips/` com o
 * nome original da imagem. Apaga o task JSON quando recuperado ou falhou,
 * para manter a "caixa" limpa.
 *
 * Zero input. Um clique recupera tudo o que deu timeout ou foi abandonado.
 */

type TaskRecord = {
  taskId: string;
  imageName?: string;
  imageUrl?: string;
  status?: string;
  createdAt?: string;
};

export async function GET() {
  const apiKey = process.env.RUNWAY_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Keys em falta." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // 1. Lista tasks pendentes (auto-descoberta).
  const { data: files, error: listErr } = await supabase.storage
    .from("course-assets")
    .list("youtube/tasks", { limit: 1000 });
  if (listErr) {
    return NextResponse.json({ erro: `List tasks: ${listErr.message}` }, { status: 500 });
  }
  const taskJsons = (files || []).filter((f) => f.name.endsWith(".json"));

  if (taskJsons.length === 0) {
    return NextResponse.json({
      total: 0,
      recovered: 0,
      failed: 0,
      pending: 0,
      message: "Nenhum task pendente em youtube/tasks/. Nada a recuperar.",
    });
  }

  // 2. Lista clips já existentes para não gravar duplicados.
  const existingClips = new Set<string>();
  let offset = 0;
  while (true) {
    const { data: clips } = await supabase.storage
      .from("course-assets")
      .list("youtube/clips", { limit: 1000, offset });
    if (!clips || clips.length === 0) break;
    for (const c of clips) existingClips.add(c.name);
    if (clips.length < 1000) break;
    offset += 1000;
  }

  const results: Array<{
    taskId: string;
    imageName?: string;
    status: string;
    url?: string;
  }> = [];

  for (const tf of taskJsons) {
    try {
      // Lê o JSON do task para ter imageName/imageUrl.
      const taskRes = await fetch(
        `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/tasks/${tf.name}?t=${Date.now()}`,
        { cache: "no-store" },
      );
      if (!taskRes.ok) {
        results.push({ taskId: tf.name.replace(".json", ""), status: `task-json-${taskRes.status}` });
        continue;
      }
      const record: TaskRecord = await taskRes.json();
      const taskId = record.taskId;
      const imageName = record.imageName;

      // Consulta Runway.
      const rwRes = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}`, "X-Runway-Version": "2024-11-06" },
      });
      if (!rwRes.ok) {
        results.push({ taskId, imageName, status: `runway-${rwRes.status}` });
        continue;
      }
      const rw = await rwRes.json();

      if (rw.status === "SUCCEEDED" && rw.output?.length > 0) {
        // Nome do ficheiro: usa imageName se disponível, senão cai em
        // "recovered-<8primeiros>". Substitui extensão por .mp4.
        const baseName = imageName
          ? imageName.replace(/\.\w+$/, ".mp4")
          : `recovered-${taskId.slice(0, 8)}.mp4`;

        if (existingClips.has(baseName)) {
          results.push({
            taskId,
            imageName,
            status: "already-saved",
            url: `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/clips/${baseName}`,
          });
          // Apaga o task JSON (job concluído).
          await supabase.storage.from("course-assets").remove([`youtube/tasks/${tf.name}`]);
          continue;
        }

        const vidRes = await fetch(rw.output[0]);
        if (!vidRes.ok) {
          results.push({ taskId, imageName, status: `download-${vidRes.status}` });
          continue;
        }
        const buf = new Uint8Array(await vidRes.arrayBuffer());
        const { error: upErr } = await supabase.storage
          .from("course-assets")
          .upload(`youtube/clips/${baseName}`, buf, {
            contentType: "video/mp4",
            upsert: true,
          });
        if (upErr) {
          results.push({ taskId, imageName, status: `upload: ${upErr.message}` });
          continue;
        }
        // Apaga task JSON — clip está em clips/.
        await supabase.storage.from("course-assets").remove([`youtube/tasks/${tf.name}`]);
        results.push({
          taskId,
          imageName,
          status: "recovered",
          url: `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/clips/${baseName}`,
        });
      } else if (rw.status === "FAILED") {
        // Apaga task JSON para não re-tentar.
        await supabase.storage.from("course-assets").remove([`youtube/tasks/${tf.name}`]);
        results.push({ taskId, imageName, status: "runway-failed" });
      } else {
        // PENDING / RUNNING / THROTTLED — deixa para próxima ronda.
        results.push({ taskId, imageName, status: rw.status || "unknown" });
      }
    } catch (err) {
      results.push({
        taskId: tf.name.replace(".json", ""),
        status: `error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  const recovered = results.filter((r) => r.status === "recovered").length;
  const alreadySaved = results.filter((r) => r.status === "already-saved").length;
  const failed = results.filter((r) => r.status === "runway-failed").length;
  const pending = results.filter((r) =>
    ["PENDING", "RUNNING", "THROTTLED", "unknown"].includes(r.status),
  ).length;

  return NextResponse.json({
    total: taskJsons.length,
    recovered,
    alreadySaved,
    failed,
    pending,
    results,
  });
}
