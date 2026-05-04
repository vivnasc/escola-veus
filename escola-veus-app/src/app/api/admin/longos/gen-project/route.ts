import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import funilSeed from "@/data/funil-prompts.seed.json";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // até 5 min — script de 4000 palavras é lento

/**
 * POST /api/admin/longos/gen-project
 *
 * Gera um projecto long-form completo (estilo Corvo Seco) — script + image
 * prompts + thumbnail text — a partir dum tema dado.
 *
 * Body:
 *   { tema: string, duracaoAlvo?: number (default 20 min), tom?: "contemplativo" | "filosofico" | "narrativo" }
 *
 * Resposta:
 *   { titulo, slug, script, prompts: [...], thumbnailText, capítulos: [...], usage }
 *
 * Design:
 *   - Modelo: claude-sonnet-4-6 com adaptive thinking (script criativo)
 *   - Few-shot: 1 script existente Nomear (ep01) + 6 image prompts ep01-10
 *   - Output structured JSON via output_config
 *   - Caching: system prompt + few-shot estável → cache reads em re-runs
 */

type ImgPrompt = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
};

const SEED_PROMPTS = (funilSeed.prompts as ImgPrompt[]) ?? [];

// Few-shot de prompts de imagem (mesma curadoria do gen-prompts do funil curto).
const FEW_SHOT_IDS = [
  "nomear-ep01-01-voz-antiga",
  "nomear-ep01-04-anel-heranca",
  "nomear-ep02-05-reflexo-vidro",
  "nomear-ep03-05-prato-barato",
  "nomear-ep08-01-mesa-interrompida",
  "nomear-ep10-01-janela-ceu",
];

// Script de exemplo: ep01 do funil. Mostra o ritmo, tom e tags ElevenLabs.
function getFewShotScript(): string {
  for (const preset of NOMEAR_PRESETS) {
    for (const s of preset.scripts) {
      if (s.id === "nomear-ep01") {
        return s.texto ?? "";
      }
    }
  }
  return "";
}

function pickFewShot(): ImgPrompt[] {
  const byId = new Map(SEED_PROMPTS.map((p) => [p.id, p] as const));
  const picked: ImgPrompt[] = [];
  for (const id of FEW_SHOT_IDS) {
    const p = byId.get(id);
    if (p) picked.push(p);
  }
  return picked;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || `longo-${Date.now().toString(36)}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY não configurada." },
      { status: 500 },
    );
  }

  let body: { tema?: string; duracaoAlvo?: number; tom?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const tema = (body.tema || "").trim();
  if (!tema) {
    return NextResponse.json({ erro: "tema obrigatório" }, { status: 400 });
  }
  const duracaoAlvo = Math.max(10, Math.min(30, body.duracaoAlvo ?? 20));
  const tom = body.tom || "contemplativo";

  // Heurística: ~150 palavras/min em narração lenta contemplativa → 20 min ≈ 3000 palavras.
  // Cenas: ~30-60s por cena → 20 min ≈ 25-35 cenas.
  const palavrasAlvo = duracaoAlvo * 150;
  const cenasAlvo = Math.round((duracaoAlvo * 60) / 45); // 1 cena por 45s média

  const fewShotPrompts = pickFewShot();
  const fewShotScript = getFewShotScript().slice(0, 2500);

  const client = new Anthropic({ apiKey });

  const system = [
    {
      type: "text" as const,
      text: `És o escritor e director de arte de "Escola dos Véus", canal YouTube long-form contemplativo (estilo Corvo Seco / Loranne). Crias projectos de 15-25 min de leitura lenta para mulheres adultas — narrativa em segunda pessoa, ritmo de meditação, profundidade filosófica sem academismos.

ESTÉTICA AUDIOVISUAL:
- Paleta: cream #F5F0E6, terracota, dourado baço, navy profundo
- Cinematografia: luz direccional suave, sombras longas, dust em feixes, macro/static/very-slow drift
- Cenas: cozinhas antigas com azulejos, mesas de madeira gasta, véus de seda, objectos com história, janelas, espelhos, livros, velas, anéis, moedas, cartas
- SEM pessoas identificáveis (mãos ou silhuetas distantes no máximo)
- Mood: contemplativo, nomeador, herança, pausa, peso, silêncio — nunca dramático ou publicitário

ESTRUTURA DO SCRIPT (long-form Corvo Seco):
- ~150 palavras/min de leitura lenta (não 200, é narração contemplativa com pausas)
- 4-6 capítulos, cada começando com pergunta-âncora ou frase-âncora
- Tags ElevenLabs intercaladas: [calm], [thoughtful], [pause], [long pause], [short pause]
- Frases curtas-impacto + parágrafos respirados, nunca didáctico
- Final que devolve ao corpo do ouvinte ("Antes de fechar o vídeo, respira fundo. O que ouviste é tua memória, não tua história.")
- 2ª pessoa singular feminino (tu, tua) — voz da Vivianne Nascimento (autora)

PROMPTS DE IMAGEM:
- Inglês, 2-3 linhas, ≤350 chars
- Começa com objecto/cena central → descreve luz → fundo/atmosfera → tom emocional
- Moods em PT, 2-3 por prompt
- IDs: \`longo-<slug>-<NN>-<slug-cena>\`

CAPÍTULOS:
- Cada capítulo tem título curto (2-5 palavras) + frase-âncora (uma linha)
- Aparecem como cards no vídeo entre secções da narração`,
    },
    {
      type: "text" as const,
      text:
        `EXEMPLO DE SCRIPT (formato e ritmo a seguir, ajustado para long-form):\n\n` +
        `--- INÍCIO EXEMPLO (script ep01 do funil curto, 1:30) ---\n` +
        `${fewShotScript}\n` +
        `--- FIM EXEMPLO ---\n\n` +
        `EXEMPLOS DE IMAGE PROMPTS (estilo a manter):\n\n` +
        fewShotPrompts
          .map(
            (p) =>
              `id: ${p.id}\nmood: [${p.mood.join(", ")}]\nprompt:\n${p.prompt}`,
          )
          .join("\n\n---\n\n"),
      cache_control: { type: "ephemeral" as const },
    },
  ];

  const userMessage = `Cria um projecto long-form sobre o tema:

"${tema}"

ESPECIFICAÇÕES:
- Duração-alvo: ${duracaoAlvo} min de narração lenta (~${palavrasAlvo} palavras)
- Tom: ${tom}
- Cenas: ${cenasAlvo}-${cenasAlvo + 5} prompts de imagem (~30-60s/cena)
- Capítulos: 4-6

Devolve JSON com:
- titulo: 4-7 palavras evocativas (pode ser uma frase, não um sumário)
- slug: kebab-case curto derivado do título
- thumbnailText: 2-4 palavras impactantes para a thumbnail (UPPERCASE pronto)
- capitulos: array de { titulo (2-5 palavras), ancora (1 frase, 1 linha) }
- script: markdown completo. Cada capítulo começa com "## <titulo capitulo>". Texto da narração com tags [calm]/[pause]/[long pause]/[thoughtful]. NÃO incluas instruções de palco — apenas o que vai ser lido em voz alta + tags.
- prompts: array de ${cenasAlvo} prompts de imagem no formato { id, category, mood (array PT), prompt (EN) }. IDs sequenciais começando em <slug>-01.

Responde APENAS com JSON válido.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000, // script de 3000 palavras + 30 prompts ≈ 12k tokens
      thinking: { type: "adaptive" },
      system,
      messages: [{ role: "user", content: userMessage }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              titulo: { type: "string" },
              slug: { type: "string" },
              thumbnailText: { type: "string" },
              capitulos: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    titulo: { type: "string" },
                    ancora: { type: "string" },
                  },
                  required: ["titulo", "ancora"],
                  additionalProperties: false,
                },
              },
              script: { type: "string" },
              prompts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    category: { type: "string" },
                    mood: { type: "array", items: { type: "string" } },
                    prompt: { type: "string" },
                  },
                  required: ["id", "category", "mood", "prompt"],
                  additionalProperties: false,
                },
              },
            },
            required: [
              "titulo",
              "slug",
              "thumbnailText",
              "capitulos",
              "script",
              "prompts",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Claude não devolveu text block");
    }
    let parsed: {
      titulo?: string;
      slug?: string;
      thumbnailText?: string;
      capitulos?: { titulo: string; ancora: string }[];
      script?: string;
      prompts?: ImgPrompt[];
    };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      throw new Error(`JSON inválido: ${textBlock.text.slice(0, 200)}`);
    }

    const titulo = parsed.titulo || tema;
    const slug = slugify(parsed.slug || titulo);
    const prompts = Array.isArray(parsed.prompts) ? parsed.prompts : [];

    // Custo (Sonnet 4.6: $3/MTok in, $15/MTok out; cache read: $0.30/MTok)
    const usage = response.usage;
    const inCost = ((usage.input_tokens || 0) * 3) / 1_000_000;
    const outCost = ((usage.output_tokens || 0) * 15) / 1_000_000;
    const cacheReadCost =
      ((usage.cache_read_input_tokens || 0) * 0.3) / 1_000_000;
    const cacheWriteCost =
      ((usage.cache_creation_input_tokens || 0) * 3.75) / 1_000_000;
    const costUsd = inCost + outCost + cacheReadCost + cacheWriteCost;

    return NextResponse.json({
      titulo,
      slug,
      tema,
      duracaoAlvo,
      thumbnailText: parsed.thumbnailText || titulo.toUpperCase(),
      capitulos: parsed.capitulos || [],
      script: parsed.script || "",
      prompts,
      promptCount: prompts.length,
      wordCount: (parsed.script || "").split(/\s+/).length,
      usage: {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        cacheReadTokens: usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens: usage.cache_creation_input_tokens ?? 0,
        costUsd: +costUsd.toFixed(4),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
