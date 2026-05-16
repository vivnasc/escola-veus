import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/hoje-em-mim/runway/submit
 *
 * Submete tasks Runway Gen4 Turbo (image_to_video) em lote.
 *
 * Padrão idêntico ao /api/admin/longos/generate-clips/submit, com 2
 * diferenças:
 *  - ratio "720:1280" (vertical 9:16)
 *  - imagem já está em Supabase (não geramos via fal.ai). Cada item do
 *    payload tem imageUrl + runwayMotion explícitos.
 *
 * O estado dos jobs fica em course-assets/admin/hoje-em-mim/runway.json
 * com a lista de items. O endpoint /runway/poll vai actualizando.
 *
 * Body: {
 *   items: Array<{
 *     id: string,             // identificador estável (uuid ou stamp)
 *     imageUrl: string,       // URL Supabase pública
 *     imageName?: string,     // só para display
 *     runwayMotion: string,   // prompt de motion específico, robusto
 *     promptRef?: string,     // id do MJ_VIDEO_PROMPTS para referência
 *     duration?: 5 | 10,      // default 10
 *   }>
 * }
 *
 * Returns: { submitted: number, failed: Array<{id, reason}>, state }
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
  /** URLs anteriores preservadas em re-submits/re-renders. */
  clipUrlHistory?: string[];
  error: string | null;
  submittedAt: string;
  completedAt: string | null;
  /** Tentativas falhadas de download/upload. */
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

async function loadState(supabase: SupabaseClient): Promise<State> {
  try {
    const { data } = await supabase.storage
      .from("course-assets")
      .download(STATE_PATH);
    if (!data) return { items: [], updatedAt: new Date().toISOString() };
    const txt = await data.text();
    return JSON.parse(txt) as State;
  } catch {
    return { items: [], updatedAt: new Date().toISOString() };
  }
}

async function saveState(supabase: SupabaseClient, state: State) {
  // Backup snapshot antes do save principal. Se o state corromper,
  // tens runway.history/<ts>.json para restaurar.
  try {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    await supabase.storage
      .from("course-assets")
      .upload(
        `admin/hoje-em-mim/runway.history/${ts}.json`,
        JSON.stringify(state, null, 2),
        { contentType: "application/json", upsert: false }
      );
  } catch {
    /* backup não bloqueia save */
  }

  state.updatedAt = new Date().toISOString();
  const { error } = await supabase.storage
    .from("course-assets")
    .upload(STATE_PATH, JSON.stringify(state, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (error) throw new Error(`Save state: ${error.message}`);
}

async function submitRunway(
  imageUrl: string,
  motionPrompt: string,
  duration: 5 | 10,
  runwayKey: string,
): Promise<{ taskId?: string; error?: string }> {
  try {
    const res = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${runwayKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "gen4_turbo",
        promptImage: imageUrl,
        promptText: motionPrompt,
        duration,
        ratio: "720:1280",
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { error: `Runway ${res.status}: ${txt.slice(0, 300)}` };
    }
    const data = await res.json();
    if (!data.id) return { error: "Runway sem taskId na resposta" };
    return { taskId: data.id as string };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

type Body = {
  items?: Array<{
    id?: string;
    imageUrl?: string;
    imageName?: string;
    runwayMotion?: string;
    promptRef?: string;
    duration?: number;
  }>;
};

export async function POST(req: NextRequest) {
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

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  const inputItems = Array.isArray(body.items) ? body.items : [];
  if (inputItems.length === 0) {
    return NextResponse.json({ erro: "items vazio" }, { status: 400 });
  }
  if (inputItems.length > 20) {
    return NextResponse.json(
      { erro: "máximo 20 items por batch" },
      { status: 400 }
    );
  }

  const state = await loadState(supabase);
  const failed: Array<{ id: string; reason: string }> = [];
  let submitted = 0;

  // Submete em paralelo (até 10)
  const BATCH = 10;
  for (let i = 0; i < inputItems.length; i += BATCH) {
    const chunk = inputItems.slice(i, i + BATCH);
    const results = await Promise.all(
      chunk.map(async (raw) => {
        const id = (raw.id || "").trim();
        const imageUrl = (raw.imageUrl || "").trim();
        const motion = (raw.runwayMotion || "").trim();
        const duration = raw.duration === 5 ? 5 : 10;
        if (!id || !imageUrl || !motion) {
          return {
            id: id || "(sem id)",
            error: "id, imageUrl e runwayMotion são obrigatórios",
          };
        }
        const r = await submitRunway(imageUrl, motion, duration, runwayKey);
        if (r.error) return { id, error: r.error };
        return {
          id,
          taskId: r.taskId!,
          imageUrl,
          imageName: raw.imageName,
          runwayMotion: motion,
          promptRef: raw.promptRef,
          duration,
        };
      })
    );
    for (const r of results) {
      if ("error" in r && r.error) {
        failed.push({ id: r.id, reason: r.error });
        continue;
      }
      const itm = r as {
        id: string;
        taskId: string;
        imageUrl: string;
        imageName?: string;
        runwayMotion: string;
        promptRef?: string;
        duration: 5 | 10;
      };
      // Re-submit do mesmo id: preserva clipUrl anterior em history para
      // a utilizadora não perder o vídeo já gerado se carregar 're-submeter'
      // por engano. O clipUrl actual passa a null porque vamos esperar pelo
      // novo render, mas a URL fica em clipUrlHistory.
      const existingIdx = state.items.findIndex((x) => x.id === itm.id);
      const existing = existingIdx >= 0 ? state.items[existingIdx] : null;
      const previousHistory = existing?.clipUrlHistory ?? [];
      const newHistory = existing?.clipUrl
        ? [...previousHistory, existing.clipUrl]
        : previousHistory;

      const newItem: StateItem = {
        id: itm.id,
        imageUrl: itm.imageUrl,
        imageName: itm.imageName,
        runwayMotion: itm.runwayMotion,
        promptRef: itm.promptRef,
        duration: itm.duration,
        ratio: "720:1280",
        runwayTaskId: itm.taskId,
        clipUrl: null,
        clipUrlHistory: newHistory.length > 0 ? newHistory : undefined,
        error: null,
        submittedAt: new Date().toISOString(),
        completedAt: null,
      };
      if (existingIdx >= 0) state.items[existingIdx] = newItem;
      else state.items.push(newItem);
      submitted++;
    }
  }

  await saveState(supabase, state);
  return NextResponse.json({ submitted, failed, state });
}
