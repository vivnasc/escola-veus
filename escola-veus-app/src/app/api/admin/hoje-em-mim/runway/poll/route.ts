import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET/POST /api/admin/hoje-em-mim/runway/poll
 *
 * Verifica tasks Runway pendentes (clipUrl null e runwayTaskId presente)
 * em course-assets/admin/hoje-em-mim/runway.json. Para cada SUCCEEDED:
 *  1. Download do MP4 do CDN Runway (com retry exponencial 3x)
 *  2. Upload para course-assets/hoje-em-mim-motions/<id>.mp4
 *     (assim aparece no motion library do preview automaticamente)
 *  3. Patch state: clipUrl ← URL Supabase, completedAt
 *
 * Garantias contra perda de clips:
 *  - Backup do state em admin/hoje-em-mim/runway.history/<ts>.json antes
 *    de cada save. Se o state corromper, há sempre snapshots.
 *  - Retry com backoff (1s, 3s, 9s) no download do Runway CDN. Se o
 *    upload Supabase falhar, runwayTaskId é PRESERVADO para próximo poll.
 *  - Cron Vercel chama de 5 em 5 minutos, mesmo com browser fechado,
 *    antes que a URL CDN Runway expire.
 *
 * Cliente chama em loop a cada 15-30s além do cron, para feedback
 * imediato à utilizadora.
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
  /** URLs anteriores (preservadas em re-submits ou re-renders). */
  clipUrlHistory?: string[];
  error: string | null;
  submittedAt: string;
  completedAt: string | null;
  /** Quantas vezes tentámos descarregar o MP4 do Runway sem sucesso. */
  downloadAttempts?: number;
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
  // Backup antes de gravar. Snapshot diário do state, com timestamp.
  // 7 dias de history são suficientes para restaurar se algo correr mal.
  try {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `admin/hoje-em-mim/runway.history/${ts}.json`;
    await supabase.storage
      .from("course-assets")
      .upload(
        backupPath,
        JSON.stringify(state, null, 2),
        { contentType: "application/json", upsert: false }
      );
  } catch {
    /* backup falha não bloqueia o save principal */
  }

  state.updatedAt = new Date().toISOString();
  await supabase.storage
    .from("course-assets")
    .upload(STATE_PATH, JSON.stringify(state, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
}

/** Download Runway CDN com retry exponencial. Devolve null se 3 tentativas falharem. */
async function downloadRunwayClip(url: string): Promise<ArrayBuffer | null> {
  const delays = [0, 1000, 3000, 9000];
  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt] > 0) {
      await new Promise((r) => setTimeout(r, delays[attempt]));
    }
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (r.ok) return await r.arrayBuffer();
      // Se for 4xx (URL inválida/expirada), não vale a pena tentar mais
      if (r.status >= 400 && r.status < 500) return null;
    } catch {
      /* tenta de novo */
    }
  }
  return null;
}

/**
 * Suporta GET (cron Vercel) e POST (UI). Cron Vercel envia
 * `Authorization: Bearer ${CRON_SECRET}` automaticamente. Para UI,
 * deixamos passar (já está atrás de auth admin via Next).
 */
async function handle(req: NextRequest) {
  const runwayKey = process.env.RUNWAY_API_KEY;
  if (!runwayKey) {
    return NextResponse.json(
      { erro: "RUNWAY_API_KEY não configurada" },
      { status: 500 },
    );
  }

  // Verifica auth do cron Vercel se o pedido tiver `?cron=1`
  const isCron = req.nextUrl.searchParams.get("cron") === "1";
  if (isCron) {
    const cronSecret = process.env.CRON_SECRET;
    const auth = req.headers.get("authorization");
    if (cronSecret && auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ erro: "cron auth falhou" }, { status: 401 });
    }
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

            // Retry com backoff. CDN Runway pode falhar transitoriamente.
            const buffer = await downloadRunwayClip(videoUrl);
            if (!buffer) {
              const attempts = (item.downloadAttempts ?? 0) + 1;
              item.downloadAttempts = attempts;
              if (attempts < 5) {
                // Mantém runwayTaskId para o próximo poll tentar de novo.
                stillPending++;
                modified = true;
                return;
              }
              // Após 5 tentativas, dá-se por vencido para esta URL.
              const reason = `Download Runway CDN falhou após 5 tentativas (URL pode ter expirado)`;
              failed.push({ id: item.id, reason });
              item.error = reason;
              item.runwayTaskId = null;
              modified = true;
              return;
            }

            const safeId = item.id.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-").slice(0, 100);
            const filePath = `hoje-em-mim-motions/${safeId}.mp4`;
            const { error: upErr } = await supabase.storage
              .from("course-assets")
              .upload(filePath, new Uint8Array(buffer), {
                contentType: "video/mp4",
                upsert: true,
              });
            if (upErr) {
              // PRESERVA runwayTaskId para o próximo poll tentar de novo.
              // Só marca como falhado depois de 3 tentativas de upload.
              const attempts = (item.downloadAttempts ?? 0) + 1;
              item.downloadAttempts = attempts;
              if (attempts < 3) {
                stillPending++;
                modified = true;
                return;
              }
              failed.push({ id: item.id, reason: `Upload falhou: ${upErr.message}` });
              item.error = `Upload falhou: ${upErr.message}`;
              item.runwayTaskId = null;
              modified = true;
              return;
            }

            // Sucesso. Preserva clipUrl anterior em history se houver.
            if (item.clipUrl && !item.clipUrlHistory?.includes(item.clipUrl)) {
              item.clipUrlHistory = [...(item.clipUrlHistory ?? []), item.clipUrl];
            }
            item.clipUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
            item.completedAt = new Date().toISOString();
            item.runwayTaskId = null;
            item.error = null;
            item.downloadAttempts = 0;
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

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
