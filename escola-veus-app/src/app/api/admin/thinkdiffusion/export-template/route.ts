import { NextResponse } from "next/server";
import promptsData from "@/data/thinkdiffusion-prompts.json";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/thinkdiffusion/export-template
 *
 * Generates a markdown template with all uploaded images.
 * User fills in motion prompts and uploads back.
 */

type PromptItem = { id: string; category: string; mood: string[]; prompt: string };

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ erro: "Supabase nao configurado." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // List all images
  const { data: folders } = await supabase.storage
    .from("course-assets")
    .list("youtube/images", { limit: 500 });

  if (!folders) return new NextResponse("Sem pastas.", { status: 404 });

  let md = `# Motion Prompts — Escola dos Véus\n\n`;
  md += `Preenche o campo "MOTION:" para cada imagem.\n`;
  md += `Depois faz upload deste ficheiro na página Imagens.\n\n`;
  md += `---\n\n`;

  let totalH = 0;
  let totalV = 0;

  for (const folder of folders.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!folder.name || folder.name.includes(".")) continue;

    // Find matching prompt for description
    const matchingPrompt = (promptsData.prompts as PromptItem[]).find((p) => {
      const normalized = p.id.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return folder.name.startsWith(normalized.split("-").slice(0, 3).join("-"));
    });

    for (const orient of ["horizontal", "vertical"]) {
      const path = `youtube/images/${folder.name}/${orient}`;
      const { data: files } = await supabase.storage
        .from("course-assets")
        .list(path, { limit: 500 });

      if (!files || files.length === 0) continue;

      const imageFiles = files.filter((f) => f.name.match(/\.(png|jpg|jpeg)$/i));
      if (imageFiles.length === 0) continue;

      if (orient === "horizontal") totalH += imageFiles.length;
      else totalV += imageFiles.length;

      md += `## ${folder.name} / ${orient} (${imageFiles.length} imagens)\n\n`;

      if (matchingPrompt) {
        md += `CENA: ${matchingPrompt.prompt.slice(0, 150)}\n`;
        md += `MOOD: ${matchingPrompt.mood.join(", ")}\n\n`;
      }

      for (const f of imageFiles.sort((a, b) => a.name.localeCompare(b.name))) {
        md += `### ${f.name}\n`;
        md += `URL: ${supabaseUrl}/storage/v1/object/public/course-assets/${path}/${f.name}\n`;
        md += `MOTION: \n\n`;
      }

      md += `---\n\n`;
    }
  }

  md = `# RESUMO: ${totalH} horizontais + ${totalV} verticais = ${totalH + totalV} imagens\n\n` + md;

  return new NextResponse(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": "attachment; filename=motion-prompts-template.md",
    },
  });
}
