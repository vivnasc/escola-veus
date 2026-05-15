import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/admin/hoje-em-mim/runway/poll
 *
 * Verifica tasks Runway pendentes (clipUrl null e runwayTaskId presente)
 * em course-assets/admin/hoje-em-mim/runway.json. Para cada SUCCEEDED:
 *  1. Download do MP4 do CDN Runway
 *  2. Upload para course-assets/hoje-em-mim-motions/<id>.mp4
 *     (assim aparece no motion library do preview automaticamente)
 *  3. Patch state: clipUrl ← URL Supabase, completedAt
 *
 * Cliente chama em loop a cada 15-30s até pending=0.
 *
 * Returns: { pending, completed, failed, total }
 */

type StateItem = {
  id: string;
  imageUrl: string;
  imageName?: string;
  runwayMotion: string;
  promptRef?: string;
  duration: 5 | 10;
  ratio: "720:1280";
  runwayTaskId: string | null;
  clipUrl: string | null;
  error: string | null;
  submittedAt: string;
  completedAt: string | null;
};

type State = {
  items: StateItem[];
  updatedAt: string;
};

const STATE_PATH = "admin/hoje-em-mim/runway.json";

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function loadState(supabase: SupabaseClient): Promise<State | null> {
  try {
    const { data } = await supabase.storage
      .from("course-assets")
      .download(STATE_PATH);
    if (!data) return null;
    return JSON.parse(await data.text()) as State;
  } catch {
    return null;
  }
}

async function saveState(supabase: SupabaseClient, state: State) {
  state.updatedAt = new Date().toISOString();
  await supabase.storage
    .from("course-assets")
    .upload(STATE_PATH, JSON.stringify(state, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
}

export async function POST() {
  const runwayKey = process.env.RUNWAY_API_KEY;
  if (!runwayKey) {
    return NextResponse.json(
      { erro: "RUNWAY_API_KEY não configurada" },
      { status: 500 },
    );
  }
  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const state = await loadState(supabase);
  if (!state) {
    return NextResponse.json({ pending: 0, completed: 0, failed: [], total: 0 });
  }

  const pending = state.items.filter((i) => !i.clipUrl && i.runwayTaskId);
  if (pending.length === 0) {
    return NextResponse.json({
      pending: 0,
      completed: 0,
      failed: [],
      total: state.items.length,
      message: "Sem tasks Runway pendentes",
    });
  }

  let completed = 0;
  const failed: Array<{ id: string; reason: string }> = [];
  let stillPending = 0;
  let modified = false;

  const BATCH = 10;
  for (let i = 0; i < pending.length; i += BATCH) {
    const chunk = pending.slice(i, i + BATCH);
    await Promise.all(
      chunk.map(async (item) => {
        const taskId = item.runwayTaskId!;
        try {
          const res = await fetch(
            `https://api.dev.runwayml.com/v1/tasks/${taskId}`,
            {
              headers: {
                Authorization: `Bearer ${runwayKey}`,
                "X-Runway-Version": "2024-11-06",
              },
            },
          );
          if (!res.ok) {
            stillPending++;
            return;
          }
          const data = await res.json();

          if (data.status === "SUCCEEDED" && Array.isArray(data.output) && data.output.length > 0) {
            const videoUrl = data.output[0];
            const vidRes = await fetch(videoUrl);
            if (!vidRes.ok) {
              stillPending++;
              return;
            }
            // Vai directo para o motion library para aparecer no preview
            const safeId = item.id.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").slice(0, 100);
            const filePath = `hoje-em-mim-motions/${safeId}.mp4`;
            const buffer = new Uint8Array(await vidRes.arrayBuffer());
            const { error: upErr } = await supabase.storage
              .from("course-assets")
              .upload(filePath, buffer, {
                contentType: "video/mp4",
                upsert: true,
              });
            if (upErr) {
              failed.push({ id: item.id, reason: `Upload: ${upErr.message}` });
              item.error = `Upload falhou: ${upErr.message}`;
              item.runwayTaskId = null;
              modified = true;
              return;
            }
            item.clipUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
            item.completedAt = new Date().toISOString();
            item.runwayTaskId = null;
            item.error = null;
            completed++;
            modified = true;
          } else if (data.status === "FAILED") {
            const reason = data.failure || "Runway falhou (sem detalhe)";
            failed.push({ id: item.id, reason });
            item.error = reason;
            item.runwayTaskId = null;
            modified = true;
          } else {
            stillPending++;
          }
        } catch (err) {
          const reason = err instanceof Error ? err.message : String(err);
          failed.push({ id: item.id, reason });
          stillPending++;
        }
      }),
    );
  }

  if (modified) await saveState(supabase, state);

  return NextResponse.json({
    pending: stillPending,
    completed,
    failed,
    total: state.items.length,
  });
}
