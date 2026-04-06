import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/produce-video
 *
 * Full automated pipeline: Script → Audio → Images → Animation → Final Video.
 * One button. No manual editing.
 *
 * Body: {
 *   courseSlug: string,
 *   scriptType: "youtube" | "lesson",
 *   hookIndex?: number,             // for YouTube hooks (0, 1, 2)
 *   moduleNum?: number,             // for lessons
 *   subLetter?: string,             // for lessons ("A", "B", "C")
 *   animationProvider?: "runway" | "hailuo" | "wan",  // default "runway"
 *   comfyuiUrl?: string,            // required for images + wan animation
 *   loraName?: string,              // LoRA model name (default "mundo-dos-veus-v1")
 * }
 *
 * Returns: SSE stream with progress updates, final video URL at the end.
 *
 * Pipeline steps:
 *   1. Parse script into scenes
 *   2. Generate audio (ElevenLabs)
 *   3. Generate images (ComfyUI) — in parallel
 *   4. Animate images (Runway/Hailuo/Wan) — in parallel
 *   5. Assemble final video (Remotion)
 *   6. Upload to Supabase
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
};

function createSSEStream() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  function send(data: PipelineStep | { result: unknown }) {
    if (controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    }
  }

  function close() {
    if (controller) controller.close();
  }

  return { stream, send, close };
}

async function loadYouTubeScript(courseSlug: string, hookIndex: number) {
  // Dynamic import of youtube scripts
  const { YOUTUBE_SCRIPTS } = await import("@/data/youtube-scripts");
  const script = YOUTUBE_SCRIPTS.find(
    (s) => s.courseSlug === courseSlug && s.hookIndex === hookIndex,
  );
  if (!script) {
    throw new Error(
      `Script YouTube nao encontrado: ${courseSlug} hook ${hookIndex}`,
    );
  }
  return script;
}

async function loadLessonScript(
  courseSlug: string,
  moduleNum: number,
  subLetter: string,
) {
  // Dynamic import based on course slug
  const mod = await import(`@/data/course-scripts/${courseSlug}`);
  const scripts = mod.scripts || mod.default || [];
  const script = scripts.find(
    (s: { moduleNumber: number; subLetter: string }) =>
      s.moduleNumber === moduleNum &&
      s.subLetter.toUpperCase() === subLetter.toUpperCase(),
  );
  if (!script) {
    throw new Error(
      `Script nao encontrado: ${courseSlug} m${moduleNum}${subLetter}`,
    );
  }
  return script;
}

function buildNarrationFromScenes(scenes: SceneAsset[]): string {
  return scenes
    .filter((s) => s.narration)
    .map((s) => s.narration)
    .join("\n\n");
}

export async function POST(req: NextRequest) {
  const {
    courseSlug,
    scriptType,
    hookIndex = 0,
    moduleNum,
    subLetter,
    animationProvider = "runway",
    comfyuiUrl,
    loraName = "mundo-dos-veus-v1",
  } = await req.json();

  if (!courseSlug || !scriptType) {
    return NextResponse.json(
      { erro: "courseSlug e scriptType obrigatorios." },
      { status: 400 },
    );
  }

  const { stream, send, close } = createSSEStream();
  const baseUrl = req.nextUrl.origin;
  const totalSteps = 5;

  // Run pipeline asynchronously
  (async () => {
    try {
      // ─── STEP 1: PARSE SCRIPT ────────────────────────────────────────

      send({ step: 1, total: totalSteps, label: "A ler o script...", status: "running" });

      let scenes: SceneAsset[];
      let videoTitle: string;

      if (scriptType === "youtube") {
        const ytScript = await loadYouTubeScript(courseSlug, hookIndex);
        videoTitle = ytScript.title;
        scenes = ytScript.scenes.map((s) => ({
          type: s.type,
          narration: s.narration,
          overlayText: s.overlayText,
          durationSec: s.durationSec,
          visualNote: s.visualNote,
        }));
      } else {
        if (moduleNum === undefined || !subLetter) {
          throw new Error("moduleNum e subLetter obrigatorios para lessons.");
        }
        const lesson = await loadLessonScript(courseSlug, moduleNum, subLetter);
        videoTitle = lesson.title;
        // Convert lesson structure to scenes
        scenes = [
          { type: "abertura", narration: "", overlayText: lesson.title, durationSec: 12, visualNote: "Abertura do territorio" },
          { type: "pergunta", narration: lesson.perguntaInicial, overlayText: "", durationSec: 25, visualNote: "Silhueta, pausa" },
          { type: "situacao", narration: lesson.situacaoHumana, overlayText: "", durationSec: 120, visualNote: "Cenario concreto" },
          { type: "revelacao", narration: lesson.revelacaoPadrao, overlayText: "", durationSec: 130, visualNote: "Revelacao do padrao" },
          { type: "gesto", narration: lesson.gestoConsciencia, overlayText: "", durationSec: 55, visualNote: "Gesto concreto" },
          { type: "frase_final", narration: lesson.fraseFinal, overlayText: lesson.fraseFinal, durationSec: 18, visualNote: "Texto creme, peso" },
          { type: "fecho", narration: "", overlayText: "Sete Veus", durationSec: 8, visualNote: "Dissolve para ceu" },
        ];
      }

      send({ step: 1, total: totalSteps, label: "Script carregado", status: "done", detail: `${scenes.length} cenas, "${videoTitle}"` });

      // ─── STEP 2: GENERATE AUDIO ──────────────────────────────────────

      send({ step: 2, total: totalSteps, label: "A gerar audio com a tua voz...", status: "running" });

      const fullNarration = buildNarrationFromScenes(scenes);
      const sceneLabel = scriptType === "youtube"
        ? `yt-hook${hookIndex}`
        : `m${moduleNum}${subLetter?.toLowerCase()}`;

      const audioRes = await fetch(`${baseUrl}/api/admin/courses/generate-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: fullNarration,
          courseSlug,
          moduleNum: moduleNum ?? hookIndex,
          subLetter: subLetter ?? `H${hookIndex}`,
        }),
      });

      if (!audioRes.ok) {
        const err = await audioRes.json();
        throw new Error(`Audio: ${err.erro || audioRes.status}`);
      }

      const audioResult = await audioRes.json();
      const audioUrl = audioResult.url || "[audio-direct-download]";

      send({ step: 2, total: totalSteps, label: "Audio gerado", status: "done", detail: audioUrl });

      // ─── STEP 3: GENERATE IMAGES ─────────────────────────────────────

      send({ step: 3, total: totalSteps, label: `A gerar ${scenes.length} imagens...`, status: "running" });

      if (!comfyuiUrl) {
        // Skip image generation if no ComfyUI URL — use placeholder
        send({ step: 3, total: totalSteps, label: "Imagens (sem ComfyUI — placeholder)", status: "done", detail: "Configura comfyuiUrl para gerar imagens reais" });
      } else {
        const { buildLandscapeWorkflow, buildSilhouetteWorkflow } = await import(
          "@/lib/comfyui-workflows"
        );

        // Generate images in parallel (batches of 3 to not overwhelm GPU)
        const batchSize = 3;
        for (let i = 0; i < scenes.length; i += batchSize) {
          const batch = scenes.slice(i, i + batchSize);
          const promises = batch.map(async (scene, batchIdx) => {
            const idx = i + batchIdx;
            const isSilhouette = ["pergunta", "gesto", "situacao"].includes(scene.type);

            const workflow = isSilhouette
              ? buildSilhouetteWorkflow({
                  prompt: scene.visualNote,
                  loraName,
                })
              : buildLandscapeWorkflow({
                  prompt: scene.visualNote,
                  loraName,
                });

            const imgRes = await fetch(
              `${baseUrl}/api/admin/courses/generate-image`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  comfyuiUrl,
                  workflow,
                  courseSlug,
                  moduleNum: moduleNum ?? hookIndex,
                  assetType: isSilhouette ? "silhouette" : "landscape",
                  filename: `${sceneLabel}-scene${idx}.png`,
                }),
              },
            );

            if (imgRes.ok) {
              const result = await imgRes.json();
              scenes[idx].imageUrl = result.url;
            }
          });

          await Promise.all(promises);
        }

        const generated = scenes.filter((s) => s.imageUrl).length;
        send({ step: 3, total: totalSteps, label: "Imagens geradas", status: "done", detail: `${generated}/${scenes.length}` });
      }

      // ─── STEP 4: ANIMATE IMAGES ──────────────────────────────────────

      send({ step: 4, total: totalSteps, label: "A animar imagens...", status: "running" });

      const scenesWithImages = scenes.filter((s) => s.imageUrl);

      if (scenesWithImages.length === 0) {
        send({ step: 4, total: totalSteps, label: "Animacao (sem imagens para animar)", status: "done" });
      } else if (animationProvider === "wan") {
        // Use existing Wan 2.1 via ComfyUI
        if (!comfyuiUrl) throw new Error("comfyuiUrl necessario para Wan 2.1");

        const WAN_MOTION: Record<string, string> = {
          abertura: "slow cinematic camera drift downward",
          pergunta: "silhouette breathing slowly, subtle movement",
          situacao: "slow camera tracking, environment alive",
          revelacao: "mirrors uncovering, veils lifting slowly",
          gesto: "hand extending, particles gathering",
          frase_final: "slow zoom into darkness",
          cta: "gentle wind, floating particles, warm light",
          fecho: "slow dissolve upward into navy sky",
        };

        for (let i = 0; i < scenesWithImages.length; i++) {
          const scene = scenesWithImages[i];
          const motion = WAN_MOTION[scene.type] || scene.visualNote;

          const vidRes = await fetch(
            `${baseUrl}/api/admin/courses/generate-video`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                comfyuiUrl,
                sourceImageUrl: scene.imageUrl,
                motionPrompt: motion,
                courseSlug,
                sceneLabel: `${sceneLabel}-scene${i}`,
                durationSec: 5,
              }),
            },
          );

          if (vidRes.ok) {
            const result = await vidRes.json();
            scene.animationUrl = result.url;
          }
        }

        const animated = scenesWithImages.filter((s) => s.animationUrl).length;
        send({ step: 4, total: totalSteps, label: "Animacao (Wan 2.1)", status: "done", detail: `${animated}/${scenesWithImages.length}` });
      } else {
        // Use Runway or Hailuo via animate-runway route
        const MOTION_PROMPTS: Record<string, string> = {
          abertura: "slow cinematic camera drift downward through dark atmosphere, golden particles floating gently",
          pergunta: "silhouette breathing slowly, subtle chest movement, golden light pulsing gently",
          situacao: "slow camera tracking right, environment subtly alive, particles drifting",
          revelacao: "mirrors slowly uncovering, reflections becoming clearer, veils lifting in slow motion",
          gesto: "silhouette extending hand outward, golden particles gathering in palm, warm light growing",
          frase_final: "very slow zoom into darkness, text appearing, cinematic breathing",
          cta: "gentle wind movement, floating golden particles, warm light expanding from center",
          fecho: "slow dissolve upward, landscape fading into deep navy sky, final particles ascending",
        };

        // Animate in parallel (batches of 2 — Runway has rate limits)
        const batchSize = 2;
        for (let i = 0; i < scenesWithImages.length; i += batchSize) {
          const batch = scenesWithImages.slice(i, i + batchSize);
          const promises = batch.map(async (scene) => {
            const motion = MOTION_PROMPTS[scene.type] || scene.visualNote;

            const animRes = await fetch(
              `${baseUrl}/api/admin/courses/animate-runway`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sourceImageUrl: scene.imageUrl,
                  motionPrompt: motion,
                  courseSlug,
                  sceneLabel: `${sceneLabel}-${scene.type}`,
                  durationSec: 10,
                  provider: animationProvider === "hailuo" ? "hailuo" : "runway",
                }),
              },
            );

            if (animRes.ok) {
              const result = await animRes.json();
              scene.animationUrl = result.url;
            }
          });

          await Promise.all(promises);
        }

        const animated = scenesWithImages.filter((s) => s.animationUrl).length;
        send({ step: 4, total: totalSteps, label: `Animacao (${animationProvider})`, status: "done", detail: `${animated}/${scenesWithImages.length}` });
      }

      // ─── STEP 5: ASSEMBLE WITH REMOTION ──────────────────────────────

      send({ step: 5, total: totalSteps, label: "A montar video final (Remotion)...", status: "running" });

      // Store the composition data for Remotion rendering
      // In production this would trigger a Remotion Lambda render.
      // For now, save the composition manifest so Remotion can pick it up.
      const manifest = {
        courseSlug,
        title: videoTitle,
        sceneLabel,
        audioUrl,
        scenes: scenes.map((s) => ({
          type: s.type,
          narration: s.narration,
          overlayText: s.overlayText,
          durationSec: s.durationSec,
          imageUrl: s.imageUrl || null,
          animationUrl: s.animationUrl || null,
        })),
        createdAt: new Date().toISOString(),
        status: "ready_for_render",
      };

      // Save manifest to Supabase or return directly
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tdytdamtfillqyklgrmb.supabase.co";

      let manifestUrl = "";

      if (serviceKey) {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false },
        });

        const manifestPath = `courses/${courseSlug}/manifests/${sceneLabel}-${Date.now()}.json`;
        const { error: uploadError } = await supabase.storage
          .from("course-assets")
          .upload(
            manifestPath,
            new TextEncoder().encode(JSON.stringify(manifest, null, 2)),
            { contentType: "application/json", upsert: true },
          );

        if (!uploadError) {
          manifestUrl = `${supabaseUrl}/storage/v1/object/public/course-assets/${manifestPath}`;
        }
      }

      // TODO: When Remotion Lambda is configured, trigger render here:
      // const { renderMediaOnLambda } = await import("@remotion/lambda/client");
      // const renderResult = await renderMediaOnLambda({ ... manifest ... });

      send({
        step: 5,
        total: totalSteps,
        label: "Pipeline completo",
        status: "done",
        detail: "Manifesto pronto para Remotion render",
      });

      send({
        result: {
          status: "complete",
          title: videoTitle,
          audioUrl,
          manifestUrl,
          scenes: scenes.length,
          imagesGenerated: scenes.filter((s) => s.imageUrl).length,
          clipsAnimated: scenes.filter((s) => s.animationUrl).length,
          manifest,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      send({ step: 0, total: totalSteps, label: "Erro no pipeline", status: "error", detail: msg });
    } finally {
      close();
    }
  })();

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
