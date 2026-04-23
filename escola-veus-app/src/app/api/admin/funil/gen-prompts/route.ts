import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import funilSeed from "@/data/funil-prompts.seed.json";
import { NOMEAR_PRESETS } from "@/data/nomear-scripts";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/admin/funil/gen-prompts
 *
 * Gera image prompts para um episódio usando Claude API, com few-shot do
 * estilo existente (prompts de ep01-10) para manter o registo editorial escuro.
 *
 * Body:
 *   { episode: string (ex: "ep11"), count?: number (default 10) }
 *
 * Resposta:
 *   { prompts: [{ id, category, mood, prompt }], usage: { input, output, cached } }
 *
 * Design:
 *   - Few-shot: 6 exemplos curados de eps existentes (cobrem moods distintos)
 *   - Prompt caching: system + few-shot é estável entre pedidos → cache-control
 *     ephemeral no último bloco de system → 90% desconto em re-runs.
 *   - Structured output: json_schema garante JSON válido pronto a inserir.
 *   - Modelo: claude-sonnet-4-6 (mais barato, bom para padrões estéticos).
 */

type ImgPrompt = {
  id: string;
  category: string;
  mood: string[];
  prompt: string;
};

const SEED_PROMPTS = (funilSeed.prompts as ImgPrompt[]) ?? [];

// Curadoria manual: 6 prompts que representam a gama emocional da série.
// Mantém output consistente com o tom existente (cozinha tile antigo, véus,
// objectos em luz direccional, registo contemplativo).
const FEW_SHOT_IDS = [
  "nomear-ep01-01-voz-antiga",       // cozinha/herança
  "nomear-ep01-04-anel-heranca",     // macro/objecto de valor
  "nomear-ep02-05-reflexo-vidro",    // vidro molhado/vergonha
  "nomear-ep03-05-prato-barato",     // refeição/vergonha discreta
  "nomear-ep08-01-mesa-interrompida", // silêncio/peso
  "nomear-ep10-01-janela-ceu",       // abertura/liberdade
];

function pickFewShot(): ImgPrompt[] {
  const byId = new Map(SEED_PROMPTS.map((p) => [p.id, p] as const));
  const picked: ImgPrompt[] = [];
  for (const id of FEW_SHOT_IDS) {
    const p = byId.get(id);
    if (p) picked.push(p);
  }
  // Fallback: se IDs curados não existem, pega os primeiros 6 de eps diferentes
  if (picked.length < 3) {
    const seen = new Set<string>();
    for (const p of SEED_PROMPTS) {
      const ep = p.id.split("-")[1];
      if (seen.has(ep)) continue;
      seen.add(ep);
      picked.push(p);
      if (picked.length >= 6) break;
    }
  }
  return picked;
}

function findEpisodeScript(episode: string): { titulo: string; texto: string } | null {
  for (const preset of NOMEAR_PRESETS) {
    for (const s of preset.scripts) {
      const key = s.id.split("-")[1];
      if (key === episode) {
        return { titulo: s.titulo, texto: s.texto ?? "" };
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY não configurada nas env vars." },
      { status: 500 },
    );
  }

  let body: { episode?: string; count?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const episode = body.episode;
  const count = Math.max(3, Math.min(15, body.count ?? 10));
  if (!episode) {
    return NextResponse.json({ erro: "episode obrigatório" }, { status: 400 });
  }

  const script = findEpisodeScript(episode);
  if (!script) {
    return NextResponse.json(
      { erro: `Script não encontrado para episódio "${episode}"` },
      { status: 404 },
    );
  }

  const fewShot = pickFewShot();

  // Limpar tags ElevenLabs [pause] / [long pause] do texto antes de enviar ao Claude.
  const cleanText = script.texto.replace(/\[[^\]]+\]/g, " ").replace(/\s+/g, " ").trim();

  const client = new Anthropic({ apiKey });

  // System = estilo + regras. Cacheado (estável entre pedidos).
  const system = [
    {
      type: "text" as const,
      text: `És o director de arte de "Escola dos Véus", uma série YouTube contemplativa para mulheres. Para cada episódio da série Nomear, geras ~10 image prompts em inglês para Midjourney, cada um com moods em português.

Estética:
- Editorial escuro, paleta quente: cream #F5F0E6, terracota, dourado baço, navy profundo
- Fotografia cinematográfica: luz direccional suave, sombras longas, dust particles em feixes de luz
- Cenas: cozinhas antigas com azulejos, mesas de madeira gasta, véus de seda, objectos com história (anéis, moedas, cartas, velas, livros)
- SEM pessoas identificáveis (mãos ou silhuetas à distância no máximo)
- Câmara: macro, static, ou very slow drift — nunca movimento agressivo
- Mood: contemplativo, nomeador, memória, herança, pausa — nunca dramático ou publicitário

Formato de cada prompt (inglês, 2-3 linhas, ≤350 chars):
- Começa com o objecto/cena principal
- Descreve a luz
- Descreve o fundo/atmosfera
- Termina com tom emocional (ex: "quiet inheritance", "still weight", "soft awakening")

Moods (português, 2-3 por prompt): escolher de → culpa, heranca, peso, ausencia, memoria, hesitacao, vergonha, silencio, pausa, medo, limite, dignidade, dourado, liberdade, ternura, ritual, despertar, nomear, transicao, escuta, cansaco, cuidado.

IDs: formato \`nomear-<ep>-<NN>-<slug>\` onde NN é 01, 02... e slug é 2-4 palavras em português sem acentos ligadas por hífens (ex: "voz-antiga", "anel-heranca").`,
    },
    {
      type: "text" as const,
      text:
        `Exemplos reais (few-shot) do estilo a manter — copia o tom e a estrutura:\n\n` +
        fewShot
          .map(
            (p) =>
              `---\nID: ${p.id}\nmood: [${p.mood.join(", ")}]\nprompt:\n${p.prompt}`,
          )
          .join("\n\n") +
        `\n---`,
      cache_control: { type: "ephemeral" as const },
    },
  ];

  const userMessage = `Episódio: ${episode}
Título: ${script.titulo}

Script (narração ElevenLabs que vai por cima das imagens):
"""
${cleanText.slice(0, 4000)}
"""

Gera exactamente ${count} image prompts para este episódio. IDs sequenciais começando em ${episode}-01. Cada prompt deve:
- Ressoar com uma frase/momento específico do script
- Usar moods distintos entre si (variedade na gama emocional)
- Evitar repetir cenas que já existiam nos exemplos (sem gota de água, sem chávena com vapor, sem anel gasto — usa elementos novos: candeeiro de mesa, fio bordado, chave velha, caixa de biscoitos, fotografias desfocadas, linho dobrado, água numa bacia, etc.)

Responde APENAS com o JSON.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system,
      messages: [{ role: "user", content: userMessage }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
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
            required: ["prompts"],
            additionalProperties: false,
          },
        },
      },
    });

    // Extrair o JSON do primeiro text block
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Claude não devolveu text block");
    }
    let parsed: { prompts?: ImgPrompt[] };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      throw new Error(`JSON inválido: ${textBlock.text.slice(0, 200)}`);
    }
    const prompts = Array.isArray(parsed.prompts) ? parsed.prompts : [];

    // Sanitização defensiva do shape (Claude geralmente cumpre mas garante)
    const safe = prompts.map((p, i) => ({
      id: typeof p.id === "string" && p.id ? p.id : `nomear-${episode}-${String(i + 1).padStart(2, "0")}`,
      category:
        typeof p.category === "string" && p.category ? p.category : `nomear-${episode}`,
      mood: Array.isArray(p.mood) ? p.mood.filter((m) => typeof m === "string") : [],
      prompt: typeof p.prompt === "string" ? p.prompt : "",
    }));

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
      prompts: safe,
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
