import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/admin/thinkdiffusion/status
 *
 * Snapshot rápido da biblioteca de clips/tasks AG — sem tocar no Runway.
 * - clipsCount: quantos MP4s estão em course-assets/youtube/clips/
 * - tasksCount: quantos JSONs em course-assets/youtube/tasks/ (pendentes
 *   ou órfãos que o Runway já completou e ninguém recuperou)
 * - tasksRecent: os 10 mais recentes com taskId + imageName + idade
 *
 * Usado pelo widget de diagnóstico na página AG para a Vivianne ver de
 * onde é que "nada aparece" — se tasksCount === 0, então o save-task
 * nunca gravou (e os créditos ficaram por reclamar no Runway à mão).
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({
      clipsCount: 0,
      tasksCount: 0,
      tasksRecent: [],
      erro: "Supabase nao configurado.",
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Count clips (paginado).
  let clipsCount = 0;
  let offset = 0;
  while (true) {
    const { data } = await supabase.storage
      .from("course-assets")
      .list("youtube/clips", { limit: 1000, offset });
    if (!data || data.length === 0) break;
    clipsCount += data.filter((f) => f.name.match(/\.mp4$/i)).length;
    if (data.length < 1000) break;
    offset += 1000;
  }

  // List tasks (pending).
  const { data: taskFiles } = await supabase.storage
    .from("course-assets")
    .list("youtube/tasks", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
  const tasks = (taskFiles || []).filter((f) => f.name.endsWith(".json"));

  // Lê até 10 mais recentes para mostrar details.
  const recent: Array<{
    taskId: string;
    imageName?: string;
    createdAt?: string | null;
    ageMinutes?: number;
  }> = [];
  for (const t of tasks.slice(0, 10)) {
    const taskId = t.name.replace(/\.json$/, "");
    try {
      const r = await fetch(
        `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/tasks/${t.name}?t=${Date.now()}`,
        { cache: "no-store" },
      );
      const d = r.ok ? await r.json() : {};
      const createdAt = t.created_at || d.createdAt || null;
      let ageMinutes: number | undefined;
      if (createdAt) {
        ageMinutes = Math.round((Date.now() - new Date(createdAt).getTime()) / 60000);
      }
      recent.push({ taskId, imageName: d.imageName, createdAt, ageMinutes });
    } catch {
      recent.push({ taskId });
    }
  }

  return NextResponse.json({
    clipsCount,
    tasksCount: tasks.length,
    tasksRecent: recent,
  });
}
