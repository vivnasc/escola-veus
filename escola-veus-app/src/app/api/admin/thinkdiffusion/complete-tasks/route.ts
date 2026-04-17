import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 300;

/**
 * GET /api/admin/thinkdiffusion/complete-tasks
 *
 * Checks ALL pending tasks in Supabase, downloads completed clips,
 * saves to Supabase with correct names. Run anytime to recover clips.
 */
export async function GET() {
  const apiKey = process.env.RUNWAY_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Keys em falta." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // List all pending tasks
  const { data: taskFiles } = await supabase.storage
    .from("course-assets")
    .list("youtube/tasks", { limit: 500 });

  if (!taskFiles || taskFiles.length === 0) {
    return NextResponse.json({ message: "Sem tasks pendentes.", total: 0 });
  }

  const results: Array<{ taskId: string; imageName: string; status: string }> = [];

  for (const file of taskFiles) {
    if (!file.name.endsWith(".json")) continue;

    // Read task info
    const { data: fileData } = await supabase.storage
      .from("course-assets")
      .download(`youtube/tasks/${file.name}`);

    if (!fileData) continue;

    const text = await fileData.text();
    const task = JSON.parse(text);

    if (task.status === "done") {
      results.push({ taskId: task.taskId, imageName: task.imageName, status: "already-done" });
      continue;
    }

    // Check Runway
    try {
      const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${task.taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}`, "X-Runway-Version": "2024-11-06" },
      });

      if (!res.ok) {
        results.push({ taskId: task.taskId, imageName: task.imageName, status: `runway-${res.status}` });
        continue;
      }

      const data = await res.json();

      if (data.status === "SUCCEEDED" && data.output?.length > 0) {
        // Download clip
        const videoUrl = data.output[0];
        const vidRes = await fetch(videoUrl);
        if (!vidRes.ok) {
          results.push({ taskId: task.taskId, imageName: task.imageName, status: "download-failed" });
          continue;
        }

        // Save with correct name
        const clipName = task.imageName.replace(/\.\w+$/, ".mp4");
        const buffer = new Uint8Array(await vidRes.arrayBuffer());
        const { error } = await supabase.storage
          .from("course-assets")
          .upload(`youtube/clips/${clipName}`, buffer, { contentType: "video/mp4", upsert: true });

        if (error) {
          results.push({ taskId: task.taskId, imageName: task.imageName, status: `upload-error: ${error.message}` });
          continue;
        }

        // Update task status to done
        const updated = JSON.stringify({ ...task, status: "done", clipUrl: `${supabaseUrl}/storage/v1/object/public/course-assets/youtube/clips/${clipName}` });
        await supabase.storage
          .from("course-assets")
          .upload(`youtube/tasks/${file.name}`, new TextEncoder().encode(updated), { contentType: "application/json", upsert: true });

        results.push({ taskId: task.taskId, imageName: task.imageName, status: "saved" });
      } else if (data.status === "FAILED") {
        results.push({ taskId: task.taskId, imageName: task.imageName, status: "failed-on-runway" });
      } else {
        results.push({ taskId: task.taskId, imageName: task.imageName, status: `still-${data.status}` });
      }
    } catch (err) {
      results.push({ taskId: task.taskId, imageName: task.imageName, status: `error: ${String(err)}` });
    }
  }

  const saved = results.filter((r) => r.status === "saved").length;
  return NextResponse.json({ total: results.length, saved, results });
}
