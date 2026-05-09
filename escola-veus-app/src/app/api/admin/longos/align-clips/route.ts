import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 180;

/**
 * POST /api/admin/longos/align-clips
 *
 * Claude lê (script + lista de prompts + SRT com timestamps) e devolve
 * para cada prompt o intervalo de tempo (startSec, endSec) em que esse
 * visual deve aparecer durante a narração. Resolve o problema de render
 * onde clips tocavam em sequência ignorando o que a narração diz.
 *
 * Constraints aplicadas:
 *   - Cada prompt tem 1 intervalo contíguo
 *   - Sem gaps nem overlaps (cobertura completa do tempo de narração)
 *   - Ordem dos prompts respeita a ordem do script (prompts já estão em
 *     ordem narrativa por design do gen-project)
 *   - Tempo distribuído por importância narrativa (uma cena descrita em
 *     detalhe linger mais que uma menção rápida)
 *
 * Body: { slug }
 * Returns: { aligned, total, totalDurationSec, alignment: [{promptId, startSec, endSec, alignedText}] }
 */

type ProjectPrompt = {
  id: string;
  prompt?: string;
  mood?: string[];
  startSec?: number;
  endSec?: number;
  alignedText?: string;
  [k: string]: unknown;
};

type Project = {
  script?: string;
  narrationUrl?: string;
  subtitlesUrl?: string;
  durationSec?: number;
  prompts?: ProjectPrompt[];
  [k: string]: unknown;
};

function sb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Parse SRT em sentences { startSec, endSec, text }.
function parseSrt(srt: string): { startSec: number; endSec: number; text: string }[] {
  const blocks = srt.split(/\n\n+/);
  const out: { startSec: number; endSec: number; text: string }[] = [];
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;
    const timeLine = lines[1];
    const m = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/,
    );
    if (!m) continue;
    const startSec =
      parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3]) + parseInt(m[4]) / 1000;
    const endSec =
      parseInt(m[5]) * 3600 + parseInt(m[6]) * 60 + parseInt(m[7]) + parseInt(m[8]) / 1000;
    const text = lines.slice(2).join(" ").trim();
    if (text) out.push({ startSec, endSec, text });
  }
  return out;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "ANTHROPIC_API_KEY não configurada" }, { status: 500 });
  }

  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const slug = (body.slug || "").trim();
  if (!slug || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(slug)) {
    return NextResponse.json({ erro: "slug inválido" }, { status: 400 });
  }

  const supabase = sb();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  // Carrega projecto
  let proj: Project;
  try {
    const { data, error } = await supabase.storage
      .from("course-assets")
      .download(`admin/longos/${slug}.json`);
    if (error || !data) {
      return NextResponse.json({ erro: "Projecto não encontrado" }, { status: 404 });
    }
    proj = JSON.parse(await data.text()) as Project;
  } catch (e) {
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  if (!proj.script) {
    return NextResponse.json({ erro: "Projecto sem script" }, { status: 400 });
  }
  if (!proj.subtitlesUrl) {
    return NextResponse.json(
      { erro: "Projecto sem SRT — gera SRT primeiro (/generate-srt)" },
      { status: 400 },
    );
  }
  const prompts = Array.isArray(proj.prompts) ? proj.prompts : [];
  if (prompts.length === 0) {
    return NextResponse.json({ erro: "Projecto sem prompts" }, { status: 400 });
  }

  // Download SRT
  let srtText = "";
  try {
    const srtRes = await fetch(proj.subtitlesUrl);
    if (!srtRes.ok) throw new Error(`SRT HTTP ${srtRes.status}`);
    srtText = await srtRes.text();
  } catch (e) {
    return NextResponse.json(
      { erro: `Download SRT: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 },
    );
  }
  const sentences = parseSrt(srtText);
  if (sentences.length === 0) {
    return NextResponse.json({ erro: "SRT vazia ou inválida" }, { status: 400 });
  }
  const totalDurationSec = sentences[sentences.length - 1].endSec;

  // Constrói prompt para Claude
  const sentencesText = sentences
    .map(
      (s, i) =>
        `[${s.startSec.toFixed(1)}s → ${s.endSec.toFixed(1)}s] ${s.text}`,
    )
    .join("\n");
  const promptsText = prompts
    .map((p, i) => `${i + 1}. id="${p.id}"\n   visual: ${p.prompt ?? ""}`)
    .join("\n\n");

  const userMessage =
    `Tens uma narração com timestamps (SRT) e ${prompts.length} cenas visuais a distribuir.\n\n` +
    `Atribui a cada cena visual um intervalo de tempo (startSec → endSec) durante o qual ela aparece no vídeo.\n\n` +
    `REGRAS:\n` +
    `1. Total: ${totalDurationSec.toFixed(1)}s. Cobertura completa: prompt 1 começa em 0s, ` +
    `prompt ${prompts.length} acaba em ${totalDurationSec.toFixed(1)}s. Sem gaps. Sem overlaps.\n` +
    `2. Ordem: cenas seguem a ordem dada (prompt N+1 começa onde prompt N acabou).\n` +
    `3. Duração por cena: distribuída por IMPORTÂNCIA NARRATIVA — uma cena que a narração\n` +
    `   descreve em detalhe linger mais; uma menção breve passa rápido. Lê o que a narração\n` +
    `   está a dizer no momento em que a cena visual faz sentido aparecer.\n` +
    `4. Mínimo 8s por cena (não cortar visuais antes de o espectador absorver).\n` +
    `5. Máximo 45s por cena (evitar visuais estáticos por demasiado tempo).\n` +
    `6. Inclui em alignedText um excerto curto da narração (≤120 chars) que justifica essa\n` +
    `   atribuição de tempo (a frase que a cena visual ilustra).\n\n` +
    `NARRAÇÃO COM TIMESTAMPS (SRT):\n${sentencesText}\n\n` +
    `CENAS VISUAIS (${prompts.length}, na ordem):\n${promptsText}\n\n` +
    `Devolve JSON com array "alignment" — uma entrada por prompt na ordem dada.`;

  const client = new Anthropic({ apiKey, maxRetries: 4 });

  type AlignedItem = {
    id: string;
    startSec: number;
    endSec: number;
    alignedText: string;
  };

  let alignment: AlignedItem[];
  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      system:
        "És o editor de timing dum vídeo contemplativo long-form. Tens narração + cenas visuais e decides quando cada visual aparece para acompanhar o que a voz diz. Estética: lentidão, contemplação — não troques cenas a cada frase, deixa cada uma respirar.",
      messages: [{ role: "user", content: userMessage }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              alignment: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    startSec: { type: "number" },
                    endSec: { type: "number" },
                    alignedText: { type: "string" },
                  },
                  required: ["id", "startSec", "endSec", "alignedText"],
                  additionalProperties: false,
                },
              },
            },
            required: ["alignment"],
            additionalProperties: false,
          },
        },
      },
    });
    const response = await stream.finalMessage();
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error(`Claude sem text block. stop_reason=${response.stop_reason}`);
    }
    const parsed = JSON.parse(textBlock.text) as { alignment: AlignedItem[] };
    alignment = Array.isArray(parsed.alignment) ? parsed.alignment : [];
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      const err = e as unknown as {
        status?: number;
        message?: string;
        type?: string;
        request_id?: string;
      };
      return NextResponse.json(
        {
          erro: `Anthropic ${err.status}${err.type ? ` (${err.type})` : ""}: ${err.message}`,
          requestId: err.request_id,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { erro: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }

  // Sanity: garante cobertura/ordem. Se Claude retornou alinhamento inválido,
  // normaliza para distribuição uniforme como fallback.
  const sorted = [...alignment].sort((a, b) => a.startSec - b.startSec);
  let coverage = true;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].startSec > sorted[i].endSec) coverage = false;
    if (i > 0 && Math.abs(sorted[i - 1].endSec - sorted[i].startSec) > 1) coverage = false;
  }
  if (!coverage || sorted.length !== prompts.length) {
    // Fallback: distribuição uniforme
    const per = totalDurationSec / prompts.length;
    alignment = prompts.map((p, i) => ({
      id: p.id,
      startSec: i * per,
      endSec: (i + 1) * per,
      alignedText: "(distribuição uniforme — Claude alignment falhou validação)",
    }));
  }

  // Patch projecto
  const alignmentById = new Map(alignment.map((a) => [a.id, a]));
  let aligned = 0;
  for (const p of prompts) {
    const a = alignmentById.get(p.id);
    if (a) {
      p.startSec = a.startSec;
      p.endSec = a.endSec;
      p.alignedText = a.alignedText;
      aligned++;
    }
  }

  const updated = {
    ...proj,
    prompts,
    updatedAt: new Date().toISOString(),
  };
  const { error: upErr } = await supabase.storage
    .from("course-assets")
    .upload(`admin/longos/${slug}.json`, JSON.stringify(updated, null, 2), {
      contentType: "application/json",
      upsert: true,
    });
  if (upErr) {
    return NextResponse.json(
      { erro: `Patch projecto: ${upErr.message}`, alignment },
      { status: 500 },
    );
  }

  return NextResponse.json({
    aligned,
    total: prompts.length,
    totalDurationSec,
    alignment,
  });
}
