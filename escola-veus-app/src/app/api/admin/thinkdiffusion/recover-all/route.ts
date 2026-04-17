import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 300;

/**
 * GET /api/admin/thinkdiffusion/recover-all
 *
 * Checks ALL known Runway taskIds, downloads completed clips, saves to Supabase.
 * One-click recovery — no input needed.
 */

const TASK_IDS = [
  "c9165ed8-c438-4427-ab9b-51fd003adf5d",
  "c2b3adee-fccd-4dba-a21a-86678d73edb1",
  "a0e6c045-6aa5-4bf9-b556-6cd4d203ada4",
  "b4ff4a68-13ff-41b6-aaad-8eac092019b9",
  "cda39b29-859d-45c7-9cfc-6af145ff0490",
  "993f57e3-a94c-46e8-80fc-76185ca5be04",
  "87b7ebb7-3153-432b-868d-680a4d267f57",
  "ee90dd73-9f64-4e5c-ab38-efbd3cce37ac",
  "1280e46b-9cf2-4945-8a53-c65c01b2d8d2",
  "b816a516-2e24-43c0-87b4-45c2c58b2655",
  "b1267cb1-fd35-4c61-8a3d-6333d36bb3c8",
  "947a87ba-aeb8-40d2-88d3-ecd8abc7311e",
  "c928af53-3237-49a0-8891-7dea313fed1c",
  "233148f0-cc1d-4b1f-9064-c0a655314eaa",
  "64aefb5c-e158-4379-bce5-ddf2815193f2",
  "aeaa0fb4-01cb-46e4-810c-143157a7b61b",
  "6d746865-369f-4922-aa10-3593256f796c",
  "fd412948-6477-4ecb-8a4d-3352a752f054",
  "e9fdf015-2154-40fc-a484-08fa3569dd2e",
];

export async function GET() {
  const apiKey = process.env.RUNWAY_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Keys em falta." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const results: Array<{ taskId: string; status: string; saved?: boolean; url?: string }> = [];

  for (const taskId of TASK_IDS) {
    try {
      // Check Runway status
      const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}`, "X-Runway-Version": "2024-11-06" },
      });

      if (!res.ok) {
        results.push({ taskId, status: `runway-error-${res.status}` });
        continue;
      }

      const data = await res.json();

      if (data.status === "SUCCEEDED" && data.output?.length > 0) {
        const videoUrl = data.output[0];

        // Check if already saved
        const filename = `recovered-${taskId.slice(0, 8)}.mp4`;
        const filePath = `youtube/clips/${filename}`;

        const { data: existing } = await supabase.storage
          .from("course-assets")
          .list("youtube/clips", { search: filename });

        if (existing && existing.length > 0) {
          results.push({ taskId, status: "already-saved", url: `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}` });
          continue;
        }

        // Download and save
        const vidRes = await fetch(videoUrl);
        if (!vidRes.ok) {
          results.push({ taskId, status: "download-failed" });
          continue;
        }

        const buffer = new Uint8Array(await vidRes.arrayBuffer());
        const { error } = await supabase.storage
          .from("course-assets")
          .upload(filePath, buffer, { contentType: "video/mp4", upsert: true });

        if (error) {
          results.push({ taskId, status: `upload-error: ${error.message}` });
        } else {
          results.push({ taskId, status: "recovered", saved: true, url: `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}` });
        }
      } else if (data.status === "FAILED") {
        results.push({ taskId, status: "failed-on-runway" });
      } else {
        results.push({ taskId, status: data.status || "unknown" });
      }
    } catch (err) {
      results.push({ taskId, status: `error: ${err instanceof Error ? err.message : String(err)}` });
    }
  }

  const recovered = results.filter((r) => r.saved).length;
  const alreadySaved = results.filter((r) => r.status === "already-saved").length;

  return NextResponse.json({
    total: TASK_IDS.length,
    recovered,
    alreadySaved,
    results,
  });
}
