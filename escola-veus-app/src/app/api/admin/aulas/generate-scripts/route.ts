import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCourseBySlug } from "@/data/courses";
import { TONE_GUIDELINES, SCRIPT_STRUCTURE } from "@/data/course-guidelines";
import { OURO_PROPRIO_SCRIPTS } from "@/data/course-scripts/ouro-proprio";
import type { LessonConfig } from "@/lib/course-slides";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/aulas/generate-scripts
 *   body: { slug, module }
 *
 * Gera os 5 actos × 3 sub-aulas do módulo especificado via Claude
 * (sonnet-4-6, prompt caching 1h). Output guardado em
 * course-assets/admin/aulas-config/<slug>/m<N>-<letter>.json (campo `script`).
 *
 * Custo estimado: ~€0.015 por módulo (€0.12 curso de 8 módulos) com cache.
 */

const MODEL = "claude-sonnet-4-6";
const BUCKET = "course-assets";

type ScriptOut = {
  subLetter: string;
  title?: string;
  perguntaInicial: string;
  situacaoHumana: string;
  revelacaoPadrao: string;
  gestoConsciencia: string;
  fraseFinal: string;
};

function configPath(slug: string, m: number, sub: string) {
  return `admin/aulas-config/${slug}/m${m}-${sub.toLowerCase()}.json`;
}

function supabaseClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require("@supabase/supabase-js");
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
}

function buildSystemPrompt(): string {
  const v = TONE_GUIDELINES.voice;
  const w = TONE_GUIDELINES.writing;
  const struct = SCRIPT_STRUCTURE.sections
    .filter((s) => s.name !== "abertura")
    .map((s) => `- ${s.label}: ${s.instruction} (${s.durationSec.min}-${s.durationSec.max}s)`)
    .join("\n");

  // Exemplos: m1a (medo de olhar) + m4a (algures emocional)
  const ex1 = OURO_PROPRIO_SCRIPTS.m1a;
  const ex2 = OURO_PROPRIO_SCRIPTS.m4a ?? OURO_PROPRIO_SCRIPTS.m2a;

  return `És a guia da Escola dos Véus. Escreves scripts contemplativos para sub-aulas de cursos para mulheres adultas em PT-PT.

VOZ: ${v.who}. ${v.style}. Pronome: ${v.pronoun}.

PROIBIDO:
${v.forbidden.map((f) => `- ${f}`).join("\n")}
- ZERO travessões (—) — usa pontos, vírgulas, pontos e vírgulas.
- Sem aspas curvas (" "); usa aspas direitas só quando realmente preciso.
- Acentuação PT-PT obrigatória, em todos os campos. Nunca "voce", "voce e", "nao" sem til.
- Nunca prometer transcendência. Vida real: terça-feira, supermercado, espelho do elevador.

ENCORAJADO:
${v.encouraged.map((e) => `- ${e}`).join("\n")}

ESCRITA: ${w.sentenceLength} ${w.paragraphLength} ${w.rhythm} ${w.references}

ESTRUTURA (5 actos):
${struct}

EXEMPLOS (Ouro Próprio, módulo 1·A — "${ex1.title}"):
PERGUNTA: ${ex1.perguntaInicial}
SITUAÇÃO: ${ex1.situacaoHumana}
REVELAÇÃO: ${ex1.revelacaoPadrao}
GESTO: ${ex1.gestoConsciencia}
FRASE: ${ex1.fraseFinal}

EXEMPLO 2 (módulo ${ex2.moduleNumber}·${ex2.subLetter} — "${ex2.title}"):
PERGUNTA: ${ex2.perguntaInicial}
SITUAÇÃO: ${ex2.situacaoHumana}
REVELAÇÃO: ${ex2.revelacaoPadrao}
GESTO: ${ex2.gestoConsciencia}
FRASE: ${ex2.fraseFinal}

OUTPUT:
JSON estrito:
{
  "scripts": [
    {
      "subLetter": "a"|"b"|"c",
      "title": "<título curto, opcional — usa o que vem na user prompt se houver>",
      "perguntaInicial": "<2-4 frases. Pergunta forte, reconhecível no corpo>",
      "situacaoHumana": "<6-12 frases. Cenário concreto de terça-feira>",
      "revelacaoPadrao": "<6-12 frases. O que está por baixo, sem jargão>",
      "gestoConsciencia": "<3-6 frases. Gesto pequeno, prático, ligado ao corpo>",
      "fraseFinal": "<1 frase, post-it>"
    }
  ]
}

Sem markdown. Sem comentários. Sem prefixos. Apenas JSON válido.`;
}

function buildUserPrompt(args: {
  slug: string;
  title: string;
  subtitle: string;
  arcoEmocional: string;
  diferencial: string;
  moduleNumber: number;
  moduleTitle: string;
  moduleDescription: string;
  subLessons: Array<{ letter: string; title: string; description: string }>;
}): string {
  const subs = args.subLessons
    .map(
      (s) =>
        `- ${s.letter.toLowerCase()}: "${s.title}"\n  Descrição: ${s.description}`,
    )
    .join("\n");

  return `Curso: "${args.title}" (${args.slug})
Subtítulo: ${args.subtitle}
Arco emocional: ${args.arcoEmocional}
Diferencial: ${args.diferencial}

Módulo ${args.moduleNumber}: ${args.moduleTitle}
${args.moduleDescription}

Sub-aulas a escrever (${args.subLessons.length}):
${subs}

Devolve scripts para todas as sub-aulas listadas, na ordem em que aparecem.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "ANTHROPIC_API_KEY em falta" }, { status: 500 });
  }

  let body: { slug?: string; module?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const slug = (body.slug ?? "").trim();
  const moduleNumber = Number(body.module);
  if (!slug || !Number.isFinite(moduleNumber)) {
    return NextResponse.json({ erro: "slug e module obrigatórios" }, { status: 400 });
  }

  const course = getCourseBySlug(slug);
  if (!course) return NextResponse.json({ erro: "Curso não encontrado" }, { status: 404 });

  const mod = course.modules.find((m) => m.number === moduleNumber);
  if (!mod) {
    return NextResponse.json(
      { erro: `Módulo ${moduleNumber} não existe em ${slug}` },
      { status: 404 },
    );
  }

  const supabase = supabaseClient();
  if (!supabase) {
    return NextResponse.json({ erro: "Supabase não configurado" }, { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey });

  let response;
  try {
    response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: [
        {
          type: "text",
          text: buildSystemPrompt(),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: buildUserPrompt({
            slug,
            title: course.title,
            subtitle: course.subtitle,
            arcoEmocional: course.arcoEmocional,
            diferencial: course.diferencial,
            moduleNumber: mod.number,
            moduleTitle: mod.title,
            moduleDescription: mod.description,
            subLessons: mod.subLessons.map((s) => ({
              letter: s.letter,
              title: s.title,
              description: s.description,
            })),
          }),
        },
      ],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ erro: `Claude API: ${msg}` }, { status: 500 });
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json({ erro: "Claude devolveu sem texto" }, { status: 500 });
  }

  let parsed: { scripts: ScriptOut[] };
  try {
    const jsonStart = textBlock.text.indexOf("{");
    const jsonEnd = textBlock.text.lastIndexOf("}");
    const jsonText =
      jsonStart >= 0 && jsonEnd > jsonStart
        ? textBlock.text.slice(jsonStart, jsonEnd + 1)
        : textBlock.text;
    parsed = JSON.parse(jsonText);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { erro: `JSON inválido do Claude: ${msg}`, raw: textBlock.text.slice(0, 500) },
      { status: 500 },
    );
  }

  if (!parsed.scripts || !Array.isArray(parsed.scripts)) {
    return NextResponse.json({ erro: "Claude devolveu sem scripts[]" }, { status: 500 });
  }

  // Save each sub-aula merging with existing override (preserves blockSplits, agTrack, etc.)
  const saved: Array<{ sub: string; ok: boolean; erro?: string }> = [];
  for (const out of parsed.scripts) {
    const sub = (out.subLetter ?? "").toLowerCase().trim();
    if (!sub || !["a", "b", "c", "d"].includes(sub)) {
      saved.push({ sub: out.subLetter ?? "?", ok: false, erro: "subLetter inválido" });
      continue;
    }

    const path = configPath(slug, moduleNumber, sub);

    let existing: LessonConfig = {};
    const { data: dl } = await supabase.storage.from(BUCKET).download(path);
    if (dl) {
      try {
        existing = JSON.parse(await dl.text()) as LessonConfig;
      } catch {
        existing = {};
      }
    }

    // Procura o título oficial nas sub-aulas do módulo (melhor que aceitar
    // o que Claude inventar, que pode não bater com courses.ts).
    const officialTitle =
      mod.subLessons.find((s) => s.letter.toLowerCase() === sub)?.title ?? out.title ?? "";

    const merged: LessonConfig = {
      ...existing,
      script: {
        ...(existing.script ?? {}),
        title: officialTitle,
        perguntaInicial: out.perguntaInicial,
        situacaoHumana: out.situacaoHumana,
        revelacaoPadrao: out.revelacaoPadrao,
        gestoConsciencia: out.gestoConsciencia,
        fraseFinal: out.fraseFinal,
      },
    };

    const blob = new Blob([JSON.stringify(merged, null, 2)], { type: "application/json" });
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { upsert: true, contentType: "application/json" });

    saved.push(
      upErr ? { sub, ok: false, erro: upErr.message } : { sub, ok: true },
    );
  }

  return NextResponse.json({
    ok: saved.every((s) => s.ok),
    moduleNumber,
    slug,
    saved,
    usage: response.usage,
  });
}
