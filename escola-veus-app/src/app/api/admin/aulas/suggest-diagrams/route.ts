import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCourseBySlug } from "@/data/courses";
import {
  buildSlideDeckFromConfig,
  defaultBlocksForActo,
  type Acto,
  type LessonConfig,
} from "@/lib/course-slides";
import { getBaseScript } from "@/lib/course-slides";
import type { LessonScript } from "@/data/course-scripts/ouro-proprio";
import type { DiagramType } from "@/lib/diagrams";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/aulas/suggest-diagrams
 *   body: { slug, module?: number }
 *
 * A Claude lê os textos do curso (ou de um módulo) e propõe diagramas
 * onde fazem sentido editorial. Não aplica nada — devolve sugestões para
 * a Vivianne aceitar/rejeitar na UI.
 *
 * Resposta: { suggestions: [{ moduleNumber, sub, slideIdx, acto, type,
 *   terms, central?, reason }] }
 */

const MODEL = "claude-sonnet-4-6";
const BUCKET = "course-assets";

const SCRIPT_FIELDS: Array<keyof LessonScript> = [
  "perguntaInicial",
  "situacaoHumana",
  "revelacaoPadrao",
  "gestoConsciencia",
  "fraseFinal",
];

const ACTO_BY_FIELD: Record<string, Acto> = {
  perguntaInicial: "pergunta",
  situacaoHumana: "situacao",
  revelacaoPadrao: "revelacao",
  gestoConsciencia: "gesto",
  fraseFinal: "frase",
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
  field: keyof LessonScript,
): string {
  const o = override.script?.[field as keyof typeof override.script] as string | undefined;
  if (typeof o === "string" && o.trim().length > 0) return o;
  return ((base?.[field] as string) ?? "").trim();
}

const SYSTEM_PROMPT = `És directora editorial visual da Escola dos Véus. Recebes os textos das aulas e propões pequenas infografias minimais para ALGUNS slides — nunca todos. O objectivo é elevar atenção sem distrair, manter contemplação.

Tens 5 templates disponíveis. Escolhe sempre um destes:

1. **circulo** — 1 conceito central isolado num círculo. Usa quando há uma palavra que carrega o slide.
2. **triade** — 3 forças/palavras em triângulo. Usa para tensões a três (ex.: medo-vergonha-desejo).
3. **pareado** — antes/depois, fora/dentro, dois pólos. Dois termos.
4. **sequencia** — passos 1 → 2 → 3 (até 5). Usa SOBRETUDO no acto IV (Gesto), porque o gesto é instrução com passos. Também serve para qualquer encadeamento temporal.
5. **anel** — um conceito central rodeado por 3-6 forças que orbitam. Usa para "X tem várias faces" ou "à volta de X giram estas coisas".

REGRAS DE PROPOSTA:

- Por sub-aula, propõe NO MÁXIMO 2 diagramas. Idealmente só 1, em momentos onde há ganho real.
- NÃO proponhas diagrama em todos os actos. Muitos actos beneficiam mais de silêncio do que de visual.
- Os termos têm de ser palavras curtas (1-2 palavras cada), retiradas ou destiladas do próprio texto. Não inventes vocabulário novo.
- Se o texto não pede claramente um diagrama, NÃO proponhas. Devolve lista vazia.
- A frase final (acto V) raramente precisa de diagrama. Salta a não ser que seja inegavelmente certo.

OUTPUT: JSON estritamente neste formato:

{
  "suggestions": [
    {
      "moduleNumber": <int>,
      "sub": "a"|"b"|"c",
      "field": "perguntaInicial"|"situacaoHumana"|"revelacaoPadrao"|"gestoConsciencia"|"fraseFinal",
      "blockIdx": <int, 0-indexed dentro dos blocos do acto>,
      "type": "circulo"|"triade"|"pareado"|"sequencia"|"anel",
      "terms": [<strings>],
      "central": <string ou omitido (só para 'anel')>,
      "reason": "<porquê em 1 frase>"
    }
  ]
}

Sem markdown, sem comentários, só JSON.`;

type Suggestion = {
  moduleNumber: number;
  sub: string;
  slideIdx: number;
  acto: Acto;
  type: DiagramType;
  terms: string[];
  central?: string;
  reason: string;
};

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
  if (!slug) return NextResponse.json({ erro: "Falta slug" }, { status: 400 });
  const moduleFilter = typeof body.module === "number" ? body.module : null;

  const course = getCourseBySlug(slug);
  if (!course) return NextResponse.json({ erro: "Curso não encontrado" }, { status: 404 });

  const subs: Array<{ module: number; sub: string }> = [];
  for (const mod of course.modules) {
    if (moduleFilter !== null && mod.number !== moduleFilter) continue;
    for (const sl of mod.subLessons)
      subs.push({ module: mod.number, sub: sl.letter.toLowerCase() });
  }

  const overrides = await Promise.all(subs.map((s) => loadOverride(slug, s.module, s.sub)));

  type Doc = {
    moduleNumber: number;
    sub: string;
    fields: Record<string, string>;
  };
  const docs: Doc[] = subs
    .map((s, i) => {
      const base = getBaseScript(slug, s.module, s.sub);
      if (!base) return null;
      const fields: Record<string, string> = {};
      for (const f of SCRIPT_FIELDS) fields[f] = mergedField(base, overrides[i], f);
      return { moduleNumber: s.module, sub: s.sub, fields };
    })
    .filter((d): d is Doc => d !== null);

  if (docs.length === 0) {
    return NextResponse.json({ suggestions: [], note: "Sem scripts base." });
  }

  const userMessage =
    `Curso: ${course.title}\n\nSub-aulas:\n\n` +
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
      max_tokens: 6000,
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral", ttl: "1h" } },
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

  type ClaudeSuggestion = {
    moduleNumber: number;
    sub: string;
    field: keyof LessonScript;
    blockIdx: number;
    type: DiagramType;
    terms: string[];
    central?: string;
    reason: string;
  };

  let parsed: { suggestions?: ClaudeSuggestion[] };
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return NextResponse.json(
      { erro: "JSON da Claude inválido.", raw: text.slice(0, 400) },
      { status: 502 },
    );
  }

  // Resolve slideIdx para cada sugestão (precisamos de construir o deck e
  // contar até ao bloco N do acto X).
  const validTypes: DiagramType[] = ["circulo", "triade", "pareado", "sequencia", "anel"];
  const out: Suggestion[] = [];

  for (const s of parsed.suggestions ?? []) {
    if (!s || typeof s !== "object") continue;
    if (!validTypes.includes(s.type)) continue;
    if (!ACTO_BY_FIELD[s.field as string]) continue;
    if (!Array.isArray(s.terms)) continue;

    const acto = ACTO_BY_FIELD[s.field as string];
    const sLower = s.sub?.toLowerCase();
    const cfgIndex = subs.findIndex((x) => x.module === s.moduleNumber && x.sub === sLower);
    if (cfgIndex < 0) continue;
    const cfg = overrides[cfgIndex];
    const deck = buildSlideDeckFromConfig(slug, s.moduleNumber, sLower, cfg);
    if (!deck) continue;

    // Encontra o slide com este acto e este blockIdx (contagem de blocos
    // de conteúdo deste acto até ao slide actual).
    let count = -1;
    let foundIdx = -1;
    for (let i = 0; i < deck.slides.length; i++) {
      const sl = deck.slides[i];
      if (sl.tipo === "conteudo" && sl.acto === acto) {
        count++;
        if (count === s.blockIdx) {
          foundIdx = i;
          break;
        }
      }
    }
    if (foundIdx < 0) continue;

    out.push({
      moduleNumber: s.moduleNumber,
      sub: sLower,
      slideIdx: foundIdx,
      acto,
      type: s.type,
      terms: s.terms.filter((t) => typeof t === "string"),
      central: typeof s.central === "string" ? s.central : undefined,
      reason: typeof s.reason === "string" ? s.reason : "",
    });
  }

  return NextResponse.json({ suggestions: out, total: out.length });
}
