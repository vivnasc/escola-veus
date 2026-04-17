import { NextRequest, NextResponse } from "next/server";
import promptsData from "@/data/thinkdiffusion-prompts.json";
import videoPlan from "@/data/video-plan.json";

/**
 * GET /api/admin/thinkdiffusion/gen-script?video=video-01
 *
 * Returns a JavaScript snippet that the user pastes in the ThinkDiffusion
 * browser console. The script runs on the same origin as A1111, so no CORS.
 * It generates images and uploads them to Supabase via our API.
 */

type PromptItem = { id: string; category: string; mood: string[]; prompt: string };
type VideoEntry = { id: string; titulo: string; categorias: string[]; prompts: number; variacoes: number };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("video") || "";
  const variations = parseInt(searchParams.get("variations") || "4", 10);
  const category = searchParams.get("category") || "";

  let filteredPrompts: PromptItem[] = promptsData.prompts as PromptItem[];

  if (videoId) {
    const video = (videoPlan as VideoEntry[]).find((v) => v.id === videoId);
    if (video) {
      filteredPrompts = filteredPrompts.filter((p) => video.categorias.includes(p.category));
    }
  } else if (category) {
    filteredPrompts = filteredPrompts.filter((p) => p.category === category);
  }

  const uploadUrl = `${req.nextUrl.origin}/api/admin/thinkdiffusion/save-image`;

  const script = `
// ═══════════════════════════════════════════════════════════════
// Escola dos Véus — ThinkDiffusion Auto Generator
// Cola este script na consola do ThinkDiffusion (F12 → Console)
// ═══════════════════════════════════════════════════════════════

(async function() {
  const PROMPTS = ${JSON.stringify(filteredPrompts.map((p) => ({ id: p.id, prompt: p.prompt })))};
  const NEGATIVE = ${JSON.stringify(promptsData.config.negative_prompt)};
  const VARIATIONS = ${variations};
  const UPLOAD_URL = "${uploadUrl}";
  const CONFIG = {
    width: ${promptsData.config.width},
    height: ${promptsData.config.height},
    cfg_scale: ${promptsData.config.cfg_scale},
    steps: ${promptsData.config.steps},
    sampler_name: "${promptsData.config.sampler_name}",
  };

  const total = PROMPTS.length * VARIATIONS;
  let done = 0;
  let errors = 0;

  console.log("🎨 Escola dos Véus — A gerar " + total + " imagens...");
  console.log("Prompts: " + PROMPTS.length + " × " + VARIATIONS + " variações");
  console.log("Resolução: " + CONFIG.width + "×" + CONFIG.height);
  console.log("");

  for (const p of PROMPTS) {
    for (let v = 1; v <= VARIATIONS; v++) {
      const label = p.id + "-v" + v;
      console.log("[" + (done + 1) + "/" + total + "] " + label + "...");

      try {
        const res = await fetch("/sdapi/v1/txt2img", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: p.prompt,
            negative_prompt: NEGATIVE,
            width: CONFIG.width,
            height: CONFIG.height,
            cfg_scale: CONFIG.cfg_scale,
            steps: CONFIG.steps,
            sampler_name: CONFIG.sampler_name,
            batch_size: 1,
            seed: -1,
            send_images: true,
            save_images: false,
          }),
        });

        if (!res.ok) {
          console.error("  ✗ A1111 HTTP " + res.status);
          errors++;
          continue;
        }

        const data = await res.json();
        if (!data.images || data.images.length === 0) {
          console.error("  ✗ Sem imagens");
          errors++;
          continue;
        }

        // Upload to Supabase
        try {
          const upRes = await fetch(UPLOAD_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: data.images[0],
              filename: label + ".png",
              category: p.id.split("-").slice(0, -1).join("-") || "misc",
            }),
          });
          const upData = await upRes.json();
          if (upData.url) {
            console.log("  ✓ " + label + " → Supabase ✓");
          } else {
            console.log("  ✓ " + label + " (gerado, upload falhou)");
          }
        } catch {
          console.log("  ✓ " + label + " (gerado, upload falhou)");
        }

        done++;
      } catch (err) {
        console.error("  ✗ Erro: " + err.message);
        errors++;
      }
    }
  }

  console.log("");
  console.log("══════════════════════════════════════════");
  console.log("✓ Completo! " + done + "/" + total + " imagens geradas.");
  if (errors > 0) console.log("✗ " + errors + " erros.");
  console.log("Imagens guardadas no Supabase: youtube/images/");
  console.log("══════════════════════════════════════════");
})();
`;

  return new NextResponse(script, {
    headers: { "Content-Type": "text/javascript; charset=utf-8" },
  });
}
