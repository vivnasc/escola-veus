import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCourseBySlug } from "@/data/courses";
import { getBaseScript, type LessonConfig } from "@/lib/course-slides";
import type { LessonScript } from "@/data/course-scripts/ouro-proprio";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/aulas/review-accents
 *   body: { slug }
 *
 * Pede ao Claude uma revisão dos textos de todo o curso. A Claude devolve
 * sugestões pontuais (acentos PT-PT, travessões em conteúdo, ortografia).
 * NÃO aplica nada automaticamente — devolve a lista para a Vivianne aceitar
 * ou rejeitar na UI.
 */

const MODEL = "claude-sonnet-4-6";
const BUCKET = "course-assets";

const SCRIPT_FIELDS = [
  "title",
  "perguntaInicial",
  "situacaoHumana",
  "revelacaoPadrao",
  "gestoConsciencia",
  "fraseFinal",
] as const;
type Field = (typeof SCRIPT_FIELDS)[number];

type Suggestion = {
  moduleNumber: number;
  sub: string;
  field: Field;
  original: string;
  suggested: string;
  reason: string;
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

async function loadOverride(slug: string, m: number, sub: string): Promise<LessonConfig> {
  const supabase = supabaseClient();
  if (!supabase) return {};
  const { data, error } = await supabase.storage.from(BUCKET).download(configPath(slug, m, sub));
  if (error || !data) return {};
  try {
    return JSON.parse(await data.text()) as LessonConfig;
  } catch {
    return {};
  }
}

function mergedField(
  base: LessonScript | null,
  override: LessonConfig,
  field: Field,
): string {
  const o = override.script?.[field as keyof typeof override.script] as string | undefined;
  if (typeof o === "string" && o.trim().length > 0) return o;
  return ((base?.[field] as string) ?? "").trim();
}

const SYSTEM_PROMPT = `És revisora editorial de português europeu (PT-PT) para a Escola dos Véus. Recebes textos das aulas contemplativas: título, pergunta inicial, situação humana, revelação do padrão, gesto de consciência, frase final.

O TEU OBJECTIVO: encontrar e corrigir os problemas abaixo. Nada mais.

Regras de correcção (por ordem de prioridade):

1. **Acentuação PT-PT correcta.** "não", "está", "já", "só", "número", "última", "módulo", "história", "saúde", "também", "três", "tão", "coração", "atenção", "decisão", "relação", "começa", "começou", "exercício", "consciência", "experiência", "história", "família", "automático", "único", "público", etc. Letras isoladas obrigatórias com acento. NÃO aceites pt-BR ("para" como "pra", "objeto" em vez de "objecto", "atual" em vez de "actual", "fato" em vez de "facto").

2. **Zero travessões (—) em conteúdo de curso.** Substitui por ponto final ou vírgula conforme contexto. Hífens em palavras compostas (ex: "segunda-feira") mantêm-se.

3. **Aspas tipográficas portuguesas** quando há diálogo: « » em vez de " ".

4. **Ortografia óbvia.** Typos manifestos. Sem sinónimos, sem reescrita.

REGRAS RIGÍDAS:
- NÃO mudes estilo, registo, vocabulário, ordem de frases.
- NÃO mudes pontuação a não ser que (a) seja travessão de conteúdo a substituir, ou (b) corrija um erro óbvio.
- Se um campo está correcto, NÃO o devolvas.
- O texto sugerido deve ser idêntico ao original excepto nas correcções.

OUTPUT: devolve APENAS JSON válido na forma:
{
  "suggestions": [
    {
      "moduleNumber": <int>,
      "sub": "a"|"b"|"c",
      "field": "title"|"perguntaInicial"|"situacaoHumana"|"revelacaoPadrao"|"gestoConsciencia"|"fraseFinal",
      "original": "<texto original exacto que recebeste>",
      "suggested": "<texto corrigido>",
      "reason": "acentos"|"travessao"|"aspas"|"ortografia"
    }
  ]
}

Sem markdown, sem comentários, sem prefixos. Só JSON.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ erro: "ANTHROPIC_API_KEY em falta no servidor" }, { status: 500 });
  }

  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }
  const slug = (body.slug ?? "").trim();
  if (!slug) return NextResponse.json({ erro: "Falta slug" }, { status: 400 });

  const course = getCourseBySlug(slug);
  if (!course) return NextResponse.json({ erro: "Curso não encontrado" }, { status: 404 });

  const subs: Array<{ module: number; sub: string }> = [];
  for (const mod of course.modules) {
    for (const sl of mod.subLessons) subs.push({ module: mod.number, sub: sl.letter.toLowerCase() });
  }

  const overrides = await Promise.all(subs.map((s) => loadOverride(slug, s.module, s.sub)));

  type Doc = { moduleNumber: number; sub: string; fields: Record<Field, string> };
  const docs: Doc[] = subs
    .map((s, i) => {
      const base = getBaseScript(slug, s.module, s.sub);
      if (!base) return null;
      const fields = Object.fromEntries(
        SCRIPT_FIELDS.map((f) => [f, mergedField(base, overrides[i], f)]),
      ) as Record<Field, string>;
      return { moduleNumber: s.module, sub: s.sub, fields };
    })
    .filter((d): d is Doc => d !== null);

  if (docs.length === 0) {
    return NextResponse.json({ suggestions: [] as Suggestion[], note: "Sem scripts base." });
  }

  const userMessage =
    `Curso: ${course.title}\n\nDocumentos:\n\n` +
    docs
      .map(
        (d) =>
          `### M${d.moduleNumber}·${d.sub.toUpperCase()}\n` +
          SCRIPT_FIELDS.map((f) => `[${f}]\n${d.fields[f]}`).join("\n\n"),
      )
      .join("\n\n---\n\n");

  const client = new Anthropic({ apiKey });

  let text = "";
  try {
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral", ttl: "1h" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });
    text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
  } catch (err) {
    return NextResponse.json(
      { erro: `Claude: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 },
    );
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return NextResponse.json(
      { erro: "Resposta da Claude não é JSON.", raw: text.slice(0, 400) },
      { status: 502 },
    );
  }

  let parsed: { suggestions?: Suggestion[] };
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return NextResponse.json(
      { erro: "JSON da Claude inválido.", raw: text.slice(0, 400) },
      { status: 502 },
    );
  }

  const suggestions = (parsed.suggestions ?? []).filter(
    (s) =>
      typeof s === "object" &&
      typeof s.moduleNumber === "number" &&
      typeof s.sub === "string" &&
      typeof s.field === "string" &&
      SCRIPT_FIELDS.includes(s.field as Field) &&
      typeof s.original === "string" &&
      typeof s.suggested === "string" &&
      s.original.trim() !== s.suggested.trim(),
  );

  return NextResponse.json({ suggestions, total: suggestions.length });
}
