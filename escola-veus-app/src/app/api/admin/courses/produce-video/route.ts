import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/produce-video
 *
 * Full automated pipeline: Script → Audio → Images → Animation → Manifest.
 * Calls external APIs DIRECTLY (no internal HTTP calls between routes).
 *
 * Body: {
 *   courseSlug: string,
 *   scriptType: "youtube" | "lesson",
 *   hookIndex?: number,
 *   moduleNum?: number,
 *   subLetter?: string,
 *   animationProvider?: "runway" | "hailuo",
 *   voiceId?: string,
 * }
 */

type PipelineStep = {
  step: number;
  total: number;
  label: string;
  status: "running" | "done" | "error";
  detail?: string;
};

type SceneAsset = {
  type: string;
  narration: string;
  overlayText: string;
  durationSec: number;
  visualNote: string;
  imageUrl?: string;
  animationUrl?: string;
  audioStartSec?: number;
  audioEndSec?: number;
};

function createSSEStream() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController | null = null;
  const stream = new ReadableStream({ start(c) { controller = c; } });
  function send(data: PipelineStep | { result: unknown }) {
    if (controller) controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  }
  function close() { if (controller) controller.close(); }
  return { stream, send, close };
}

// ─── DIRECT API CALLS (no internal HTTP) ────────────────────────────────────

async function generateAudioDirect(
  text: string,
  voiceId: string,
): Promise<{ buffer: ArrayBuffer; durationSec: number }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY nao configurada no Vercel.");

  const processedText = text.replace(/\n\n+/g, "... ... ").replace(/\.\s+/g, ". ... ");

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: processedText,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.75, similarity_boost: 0.85, style: 0.1 },
      speed: 0.9,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 200)}`);
  }

  const buffer = await res.arrayBuffer();
  // Estimate duration: MP3 at ~128kbps = ~16KB/sec
  const durationSec = buffer.byteLength / 16000;
  return { buffer, durationSec };
}

async function generateImageDirect(
  prompt: string,
  courseSlug: string,
  sceneLabel: string,
): Promise<string | null> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) throw new Error("FAL_KEY nao configurada no Vercel.");

  // Use Flux Pro (simpler, no reference images needed for now)
  const res = await fetch("https://fal.run/fal-ai/flux/dev", {
    method: "POST",
    headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      image_size: { width: 1920, height: 1080 },
      num_images: 1,
      enable_safety_checker: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Flux ${res.status} for ${sceneLabel}: ${err.slice(0, 200)}`);
    return null;
  }

  const data = await res.json();
  const imageUrl = data.images?.[0]?.url;

  if (!imageUrl) return null;

  // Upload to Supabase
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return imageUrl; // Return fal.ai URL directly

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) return imageUrl;
  const imgBuffer = await imgRes.arrayBuffer();

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const filePath = `courses/${courseSlug}/images/${sceneLabel}-${Date.now()}.png`;
  const { error } = await supabase.storage
    .from("course-assets")
    .upload(filePath, new Uint8Array(imgBuffer), { contentType: "image/png", upsert: true });

  if (error) return imageUrl;
  return `${supabaseUrl}/storage/v1/object/public/course-assets/${filePath}`;
}

async function animateImageDirect(
  sourceImageUrl: string,
  motionPrompt: string,
  provider: "runway" | "hailuo",
): Promise<string | null> {
  if (provider === "runway") {
    const apiKey = process.env.RUNWAY_API_KEY;
    if (!apiKey) throw new Error("RUNWAY_API_KEY nao configurada no Vercel.");

    const createRes = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "gen4_turbo",
        promptImage: sourceImageUrl,
        promptText: motionPrompt,
        duration: 10,
        ratio: "1280:720",
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error(`Runway create ${createRes.status}: ${err.slice(0, 200)}`);
      return null;
    }

    const { id: taskId } = await createRes.json();
    if (!taskId) return null;

    // Poll (max 5 min)
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const statusRes = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}`, "X-Runway-Version": "2024-11-06" },
      });
      if (!statusRes.ok) continue;
      const status = await statusRes.json();
      if (status.status === "FAILED") return null;
      if (status.status === "SUCCEEDED" && status.output?.length > 0) return status.output[0];
    }
    return null;
  }

  // Hailuo via fal.ai
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) return null;

  const res = await fetch("https://fal.run/fal-ai/minimax/video-01-live/image-to-video", {
    method: "POST",
    headers: { Authorization: `Key ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: sourceImageUrl, prompt: motionPrompt }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.video?.url || null;
}

// ─── MAIN HANDLER ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const {
    courseSlug,
    scriptType,
    hookIndex = 0,
    moduleNum,
    subLetter,
    animationProvider = "runway",
    voiceId,
  } = await req.json();

  if (!courseSlug || !scriptType) {
    return NextResponse.json({ erro: "courseSlug e scriptType obrigatorios." }, { status: 400 });
  }

  const voice = voiceId || process.env.ELEVENLABS_VOICE_ID || "fnoNuVpfClX7lHKFbyZ2";
  const { stream, send, close } = createSSEStream();
  const totalSteps = 5;

  (async () => {
    try {
      // ─── STEP 1: PARSE SCRIPT ────────────────────────────────────────

      send({ step: 1, total: totalSteps, label: "A ler o script...", status: "running" });

      let scenes: SceneAsset[];
      let videoTitle: string;

      if (scriptType === "youtube") {
        const { YOUTUBE_SCRIPTS } = await import("@/data/youtube-scripts");
        const ytScript = YOUTUBE_SCRIPTS.find(
          (s) => s.courseSlug === courseSlug && s.hookIndex === hookIndex,
        );
        if (!ytScript) throw new Error(`Script YouTube nao encontrado: ${courseSlug} hook ${hookIndex}`);
        videoTitle = ytScript.title;
        scenes = ytScript.scenes.map((s) => ({
          type: s.type, narration: s.narration, overlayText: s.overlayText,
          durationSec: s.durationSec, visualNote: s.visualNote,
        }));
      } else {
        if (moduleNum === undefined || !subLetter) throw new Error("moduleNum e subLetter obrigatorios.");
        const mod = await import(`@/data/course-scripts/${courseSlug}`);
        const scripts = mod.scripts || mod.default || [];
        const lesson = scripts.find((s: { moduleNumber: number; subLetter: string }) =>
          s.moduleNumber === moduleNum && s.subLetter.toUpperCase() === subLetter.toUpperCase());
        if (!lesson) throw new Error(`Script nao encontrado: ${courseSlug} m${moduleNum}${subLetter}`);
        videoTitle = lesson.title;
        scenes = [
          { type: "abertura", narration: "", overlayText: lesson.title, durationSec: 12, visualNote: "Abertura" },
          { type: "pergunta", narration: lesson.perguntaInicial, overlayText: "", durationSec: 25, visualNote: "Pergunta" },
          { type: "situacao", narration: lesson.situacaoHumana, overlayText: "", durationSec: 120, visualNote: "Situacao" },
          { type: "revelacao", narration: lesson.revelacaoPadrao, overlayText: "", durationSec: 130, visualNote: "Revelacao" },
          { type: "gesto", narration: lesson.gestoConsciencia, overlayText: "", durationSec: 55, visualNote: "Gesto" },
          { type: "frase_final", narration: lesson.fraseFinal, overlayText: lesson.fraseFinal, durationSec: 18, visualNote: "Frase final" },
          { type: "fecho", narration: "", overlayText: "Sete Veus", durationSec: 8, visualNote: "Fecho" },
        ];
      }

      const sceneLabel = scriptType === "youtube" ? `yt-hook${hookIndex}` : `m${moduleNum}${subLetter?.toLowerCase()}`;
      send({ step: 1, total: totalSteps, label: "Script carregado", status: "done", detail: `${scenes.length} cenas` });

      // ─── STEP 2: GENERATE AUDIO (direct ElevenLabs call) ─────────────

      send({ step: 2, total: totalSteps, label: "A gerar audio...", status: "running" });

      const audioChunks: ArrayBuffer[] = [];
      let currentTime = 0;

      for (const scene of scenes) {
        if (!scene.narration || scene.narration.trim() === "") {
          scene.audioStartSec = currentTime;
          scene.audioEndSec = currentTime + scene.durationSec;
          currentTime += scene.durationSec;
          continue;
        }

        const { buffer, durationSec } = await generateAudioDirect(scene.narration, voice);
        scene.audioStartSec = currentTime;
        scene.audioEndSec = currentTime + durationSec;
        scene.durationSec = durationSec + 1; // +1s breathing room
        audioChunks.push(buffer);
        currentTime += durationSec + 1;
      }

      // Combine and upload audio
      const totalSize = audioChunks.reduce((sum, c) => sum + c.byteLength, 0);
      const combined = new Uint8Array(totalSize);
      let offset = 0;
      for (const chunk of audioChunks) {
        combined.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }

      let audioUrl = "[no-supabase]";
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (serviceKey && supabaseUrl) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
        const audioPath = `courses/${courseSlug}/audio/${sceneLabel}-${Date.now()}.mp3`;
        const { error } = await supabase.storage
          .from("course-assets")
          .upload(audioPath, combined, { contentType: "audio/mpeg", upsert: true });
        if (!error) audioUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${audioPath}`;
      }

      send({ step: 2, total: totalSteps, label: "Audio gerado", status: "done", detail: `${Math.round(currentTime / 60)}m${Math.round(currentTime % 60)}s` });

      // ─── STEP 3: GENERATE IMAGES (direct fal.ai call) ────────────────

      send({ step: 3, total: totalSteps, label: `A gerar ${scenes.length} imagens...`, status: "running" });

      const { buildScenePrompt } = await import("@/data/scene-prompts");

      // Generate in batches of 3
      for (let i = 0; i < scenes.length; i += 3) {
        const batch = scenes.slice(i, i + 3);
        await Promise.all(batch.map(async (scene, bi) => {
          const prompt = buildScenePrompt(courseSlug, scene.type, scene.visualNote);
          const url = await generateImageDirect(prompt, courseSlug, `${sceneLabel}-${scene.type}`);
          if (url) scenes[i + bi].imageUrl = url;
        }));
      }

      const imgCount = scenes.filter((s) => s.imageUrl).length;
      send({ step: 3, total: totalSteps, label: "Imagens geradas", status: "done", detail: `${imgCount}/${scenes.length}` });

      // ─── STEP 4: ANIMATE IMAGES (direct Runway/Hailuo call) ──────────

      send({ step: 4, total: totalSteps, label: "A animar imagens...", status: "running" });

      const MOTION: Record<string, string> = {
        abertura: "slow cinematic camera drift downward, golden particles floating",
        pergunta: "silhouette breathing slowly, golden light pulsing gently",
        situacao: "slow camera tracking, environment subtly alive",
        revelacao: "mirrors uncovering, veils lifting in slow motion",
        gesto: "hand extending, golden particles gathering in palm",
        frase_final: "very slow zoom into darkness",
        cta: "gentle wind, floating golden particles, warm light expanding",
        fecho: "slow dissolve upward into navy sky",
      };

      const scenesWithImages = scenes.filter((s) => s.imageUrl);
      for (let i = 0; i < scenesWithImages.length; i += 2) {
        const batch = scenesWithImages.slice(i, i + 2);
        await Promise.all(batch.map(async (scene) => {
          const motion = MOTION[scene.type] || "slow cinematic movement";
          const url = await animateImageDirect(scene.imageUrl!, motion, animationProvider as "runway" | "hailuo");
          if (url) scene.animationUrl = url;
        }));
      }

      const animCount = scenesWithImages.filter((s) => s.animationUrl).length;
      send({ step: 4, total: totalSteps, label: "Animacao completa", status: "done", detail: `${animCount}/${scenesWithImages.length}` });

      // ─── STEP 5: SAVE MANIFEST ───────────────────────────────────────

      send({ step: 5, total: totalSteps, label: "A guardar manifesto...", status: "running" });

      const manifest = {
        courseSlug, title: videoTitle, sceneLabel, audioUrl,
        scenes: scenes.map((s) => ({
          type: s.type, narration: s.narration, overlayText: s.overlayText,
          durationSec: s.durationSec, imageUrl: s.imageUrl || null,
          animationUrl: s.animationUrl || null,
          audioStartSec: s.audioStartSec ?? null, audioEndSec: s.audioEndSec ?? null,
        })),
        totalDurationSec: currentTime,
        createdAt: new Date().toISOString(),
      };

      let manifestUrl = "";
      if (serviceKey && supabaseUrl) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
        const path = `courses/${courseSlug}/manifests/${sceneLabel}-${Date.now()}.json`;
        const { error } = await supabase.storage
          .from("course-assets")
          .upload(path, new TextEncoder().encode(JSON.stringify(manifest, null, 2)),
            { contentType: "application/json", upsert: true });
        if (!error) manifestUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${path}`;
      }

      send({ step: 5, total: totalSteps, label: "Pipeline completo", status: "done" });
      send({
        result: {
          status: "complete", title: videoTitle, audioUrl, manifestUrl,
          scenes: scenes.length,
          imagesGenerated: scenes.filter((s) => s.imageUrl).length,
          clipsAnimated: scenes.filter((s) => s.animationUrl).length,
        },
      });
    } catch (err) {
      send({ step: 0, total: totalSteps, label: "Erro no pipeline", status: "error", detail: err instanceof Error ? err.message : String(err) });
    } finally {
      close();
    }
  })();

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}
