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
  motion?: string;
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

  let body: {
    tema?: string;
    duracaoAlvo?: number;
    tom?: string;
    seedFromEpId?: string;
    model?: "sonnet" | "opus";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "Body JSON inválido" }, { status: 400 });
  }
  const seedFromEpId = (body.seedFromEpId || "").trim();
  const tom = body.tom || "contemplativo";
  // Sonnet 4.6 = barato e rápido (~$0.10-0.20/projecto, 30-60s) mas tem
  // tido 500s repetíveis com este schema. Opus 4.7 = mais caro mas mais
  // robusto (~$0.50-0.80/projecto, 1-3 min). Default Sonnet; UI tem
  // botão "tentar com Opus" se falhar.
  const modelChoice = body.model === "opus" ? "opus" : "sonnet";
  const modelId = modelChoice === "opus" ? "claude-opus-4-7" : "claude-sonnet-4-6";

  // ── Modo "expandir ep funil" ──────────────────────────────────────────
  // Em vez de tema livre, parte dum mini-ep dos 122 do funil Nomear (~1:30
  // de teaser) e expande para 20+ min na mesma territorialidade emocional.
  // O long é a "mesa servida" do que o short foi o aperitivo.
  let seedScript: { titulo: string; texto: string } | null = null;
  let tema = (body.tema || "").trim();

  if (seedFromEpId) {
    for (const preset of NOMEAR_PRESETS) {
      const hit = preset.scripts.find((s) => s.id === seedFromEpId);
      if (hit) {
        seedScript = {
          titulo: hit.titulo,
          texto: (hit as { texto?: string }).texto ?? "",
        };
        if (!tema) tema = hit.titulo;
        break;
      }
    }
    if (!seedScript) {
      return NextResponse.json(
        { erro: `Ep "${seedFromEpId}" não encontrado` },
        { status: 404 },
      );
    }
  }

  if (!tema && !seedScript) {
    return NextResponse.json(
      { erro: "tema ou seedFromEpId obrigatório" },
      { status: 400 },
    );
  }

  // Sem duração-alvo. Claude decide o comprimento natural ao tema, no
  // sweet-spot Corvo Seco (~2500-4000 palavras → 20-30 min de leitura
  // contemplativa com pausas — narração com [pause] tags fica em ~100 wpm
  // efectivos, nada perto dos 150-200 wpm de leitura normal).
  // Cenas: ~1 cena por 40-50s → 25-40 cenas tipicamente.

  const fewShotPrompts = pickFewShot();
  const fewShotScript = getFewShotScript().slice(0, 2500);

  // maxRetries=4 → SDK retries 429 e 5xx automaticamente com backoff
  // exponencial. Importante porque temos visto 500s rápidos (<2s) da
  // Anthropic; geralmente são transitórios e passam à 2ª/3ª tentativa.
  const client = new Anthropic({ apiKey, maxRetries: 4 });

  const system = [
    {
      type: "text" as const,
      text: `És o escritor e director de arte de "Escola dos Véus", canal YouTube long-form contemplativo de Vivianne Nascimento, autora portuguesa.

REGISTO E ÂNGULO (importante — NÃO é Corvo Seco apesar do formato similar):
- INSPIRAÇÃO formal: long-form 15-25 min, narração lenta com pausas, cross-fades cinemáticos, editorial escuro, voz única no canal todo, sem clickbait
- DIFERENÇA fundacional: 2ª pessoa singular FEMININO. Falas COM a mulher, não SOBRE ela. Tom de companhia, não de mestre. Sem épica, sem heróis, sem deuses, sem mitologia greco-romana, sem estoicismo, sem "como ser X".
- Subjects da Vivianne: herança feminina, culpa pré-verbal das filhas e netas, vergonha doméstica (cozinhas, contas, comida, dinheiro), o silêncio que pesa entre gerações de mulheres, dinheiro como prova de amor, o "sim" que escapa do corpo antes da mente decidir, o nome que ainda não foi dito
- NUNCA explicas (não és professor) — NOMEIAS. Devolves ao corpo. Deixas respirar. A frase "Antes de fechar o vídeo, respira fundo" no fim — é dela, é o assinatura.
- Origem visual ESPECÍFICA: cozinhas com azulejos antigos portugueses, mesas de madeira gasta, véus de seda, anéis com pedra opaca, moedas, cartas dobradas, velas, livros velhos, janelas com chuva, panelas de cobre, prata polida, cortinas que respiram. Sem cenário genérico. Sem retratos identificáveis (mãos ou silhuetas distantes no máximo).
- Mood: contemplativo, nomeador, herança, pausa, peso, silêncio, dignidade — nunca dramático, nunca publicitário, nunca "wow factor"

ESTÉTICA AUDIOVISUAL:
- Paleta: cream #F5F0E6, terracota, dourado baço, navy profundo
- Cinematografia: luz direccional suave, sombras longas, dust em feixes, macro/static/very-slow drift

ESTRUTURA DO SCRIPT (long-form contemplativo, voz própria da Vivianne):
- 4-6 capítulos, cada começando com frase-âncora curta (NÃO pergunta retórica de YouTuber tipo "Já te aconteceu...?")
- Tags ElevenLabs intercaladas: [calm], [thoughtful], [pause], [long pause], [short pause]
- Frases curtas-impacto + parágrafos respirados. Nunca didáctico. Nunca lista de "X razões para Y".
- Constrói por aproximação: a mesma ideia voltada de 3 ângulos diferentes em vez de explicada uma vez.
- Final-assinatura da Vivianne: devolução ao corpo, tipo "Antes de fechar o vídeo, respira fundo. O que ouviste é tua memória, não tua história." (variação livre da fórmula, mas sempre a devolver-lhe a sua própria autoridade — nunca "espero que tenha gostado, subscreve aí")

PROMPTS DE IMAGEM (Midjourney):
- Inglês, 2-3 linhas, ≤350 chars
- Começa com objecto/cena central → descreve luz → fundo/atmosfera → tom emocional
- Moods em PT, 2-3 por prompt
- IDs: \`longo-<slug>-<NN>-<slug-cena>\`
- **OBRIGATÓRIO terminar com params Midjourney**: \`--ar 16:9 --v 7 --style raw --s 50\`
  - \`--ar 16:9\`: aspect ratio horizontal long-form (1920×1080)
  - \`--v 7\`: versão actual MJ (Vivianne edita se usar outra)
  - \`--style raw\`: menos estilizado, mais fotográfico (apto para contemplativo)
  - \`--s 50\`: stylize baixo, foco em realismo
- Exemplo: "old leather wallet on worn counter, warm pendant lamp, dust in beam,
  muted sepia palette, contemplative still life, Leica 50mm, hyperrealistic, 8k
  --ar 16:9 --v 7 --style raw --s 50"

MOTION (animação Runway image-to-video):
- 1 frase curta em inglês descrevendo a câmara/movimento desta cena específica
- Estilo Corvo Seco: muito lento, contemplativo, nunca brusco. Exemplos:
  • "very slow push-in toward the wallet, dust motes floating in beam of light"
  • "gentle tilt up from hands to face, breath visible as soft fog"
  • "barely perceptible parallax drift, candle flame flickers, paper rustles"
  • "static shot, slow zoom on ring's stone, subtle reflection shift"
- NÃO repitas a mesma motion em cenas seguidas (alternar push-in / drift / tilt / static)
- NÃO uses motion brusco: "fast", "rapid", "shake", "zoom out quickly" — proibidos

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

  const seedSection = seedScript
    ? `\n\nESTE LONG-FORM EXPANDE UM MINI-EP DO FUNIL DA VIVIANNE.\n` +
      `O mini-ep tem ~1:30 de narração (teaser/aperitivo). O teu trabalho é\n` +
      `aprofundar a MESMA territorialidade emocional para 20-30 min, sem\n` +
      `repetir literalmente o que já está dito. Mantém:\n` +
      `- mesma voz (2ª pessoa feminino, tom de companhia)\n` +
      `- mesmos referenciais visuais (cozinha, mesas, véus, objectos)\n` +
      `- mesma frase-âncora ou imagem central, mas explorada de mais ângulos\n` +
      `- final que reconhece o eco do mini-ep ("isto que sentes agora não\n` +
      `  começou hoje" tipo)\n\n` +
      `MINI-EP DO FUNIL — "${seedScript.titulo}":\n` +
      `"""\n${seedScript.texto.slice(0, 3000)}\n"""\n`
    : "";

  const userMessage = `${
    seedScript
      ? `Cria um projecto long-form que EXPANDE este mini-ep:`
      : `Cria um projecto long-form sobre o tema:`
  }

"${tema}"
${seedSection}
ESPECIFICAÇÕES:
- Tom: ${tom}
- COMPRIMENTO MÍNIMO: 3500 palavras. Target: 4000-4500. Razão: ElevenLabs v3
  lê a ~137 wpm (calibrado em narrações reais). Para um longo de 22-28 min
  contemplativo, precisamos 3000+ palavras de texto + [pause]s a esticar
  o tempo efectivo. Abaixo de 3500 palavras o vídeo fica curto demais para
  reter audiência YouTube long-form. NUNCA entregar menos de 3500.
- Como atingir 4000+ sem estiques: aprofunda o tema em mais ângulos. Mesma
  ideia voltada de 4-5 perspectivas em vez de 2-3. Dá mais exemplos
  concretos do quotidiano da mulher (objectos, gestos, frases que ouviu).
  Adiciona micro-cenas com observações sensoriais (cheiro, peso, textura).
- USO INTENSIVO DE [pause]: Pelo menos 1 [pause] ou [short pause] a cada
  3-4 frases. [long pause] em transições entre secções. Estes tags são lidos
  pela ElevenLabs como silêncio real (~0.5-1.5s) e empurram o tempo para
  cima. Não temas "carregar" no [pause] — é o ritmo Corvo Seco.
- VOZ: 2ª pessoa feminino (tu, tua, tuas). Nunca "muitas mulheres",
  "todas nós", "vocês". É íntimo, individual, dirigido àquela ouvinte.
- Capítulos: 5-7 secções (era 4-6), cada uma com 600-800 palavras de
  narração. Ritmo de respiração, não didáctico.
- Cenas visuais: 60-80 prompts ATMOSFÉRICOS (não literais).
  ESTRATÉGIA CORVO SECO: imagens evocativas/genéricas que FLUTUAM sobre a
  narração — não tentam ilustrar a frase exacta. Cada visual sustenta um
  MOOD que combina com vários momentos da narração.
  - SIM: "cozinha vazia ao fim de tarde, luz baixa, pano dobrado na mesa"
    (funciona para qualquer narração sobre herança/perda/silêncio)
  - SIM: "mãos a segurar carta sépia, anel velho ao lado, luz quente lateral"
    (atmosférico — pode ser sobre nome, mãe, segredo, qualquer coisa)
  - SIM: "vela a arder em quarto escuro, cera a escorrer devagar"
    (mood contemplativo universal)
  - NÃO: "uma cadeira específica que aparece no parágrafo X" (anchor literal)
  - NÃO: "carteira de couro com 47 trevos dentro" (demasiado específico)
  Cada clip dura ~18-20s no render (boomerang do 10s native Runway).
  60-80 prompts × 18-20s = ~20-26 min cobertos sem precisar mais clips.
  Não temas reutilizar visualmente um motivo (ex: 3 prompts diferentes
  sobre cozinhas distintas) — variação atmosférica, não temática.

Devolve JSON com:
- titulo: 4-7 palavras evocativas (pode ser uma frase, não um sumário)
- slug: kebab-case curto derivado do título
- thumbnailText: 2-4 palavras impactantes para a thumbnail (UPPERCASE pronto)
- capitulos: array de { titulo (2-5 palavras), ancora (1 frase, 1 linha) }
- script: markdown completo. Cada capítulo começa com "## <titulo capitulo>". Texto da narração com tags [calm]/[pause]/[long pause]/[thoughtful]. NÃO incluas instruções de palco — apenas o que vai ser lido em voz alta + tags.
- prompts: array de prompts de imagem no formato { id, category, mood (array PT), prompt (EN), motion (EN, 1 frase curta de movimento de câmara para Runway image-to-video) }. IDs sequenciais começando em <slug>-01.

Responde APENAS com JSON válido.`;

  try {
    // STREAMING: a geração com saída JSON pode demorar 1-3 min. Sem
    // streaming, o Vercel gateway corta a connection e devolve HTML de erro
    // ("An error occurred...") que faz o cliente fazer JSON.parse de algo
    // que não é JSON. Streaming mantém a connection viva durante a geração;
    // .finalMessage() junta o final completo no fim.
    //
    // ADAPTIVE THINKING DESLIGADO: tinha problemas com output_config.format
    // — às vezes a resposta só tinha thinking blocks, sem text block,
    // resultando em "Claude não devolveu text block". O Sonnet 4.6 sem
    // adaptive já produz output muito bom para este caso (geração
    // criativa estruturada).
    const stream = client.messages.stream({
      model: modelId,
      // Headroom para 50-70 prompts + script 2500-4000 palavras. Opus 4.7
      // conta tokens um pouco diferente que Sonnet 4.6 — 24k cobre ambos.
      max_tokens: 24000,
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
                    motion: { type: "string" },
                  },
                  required: ["id", "category", "mood", "prompt", "motion"],
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

    // .finalMessage() acumula todos os eventos do stream e devolve o
    // Message completo (mesmo shape que .create()).
    const response = await stream.finalMessage();

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      // Diagnóstico — devolve info actionable em vez de só "no text block".
      const blockTypes = response.content.map((b) => b.type).join(", ") || "(vazio)";
      const stopReason = response.stop_reason || "unknown";
      throw new Error(
        `Claude devolveu sem text block. stop_reason=${stopReason}, blocks=[${blockTypes}]. ` +
          (stopReason === "max_tokens"
            ? "Output truncado — pede tema mais específico."
            : stopReason === "refusal"
              ? "Claude recusou — reformula o tema (sem violência/etc)."
              : "Tenta de novo ou simplifica o tema."),
      );
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

    // Pricing por modelo (USD por 1M tokens):
    //   Sonnet 4.6: $3 in / $15 out / $0.30 cache read / $3.75 cache write 5m
    //   Opus 4.7:   $5 in / $25 out / $0.50 cache read / $6.25 cache write 5m
    const PRICING = {
      sonnet: { in: 3, out: 15, cacheRead: 0.3, cacheWrite: 3.75 },
      opus: { in: 5, out: 25, cacheRead: 0.5, cacheWrite: 6.25 },
    } as const;
    const p = PRICING[modelChoice];
    const usage = response.usage;
    const inCost = ((usage.input_tokens || 0) * p.in) / 1_000_000;
    const outCost = ((usage.output_tokens || 0) * p.out) / 1_000_000;
    const cacheReadCost =
      ((usage.cache_read_input_tokens || 0) * p.cacheRead) / 1_000_000;
    const cacheWriteCost =
      ((usage.cache_creation_input_tokens || 0) * p.cacheWrite) / 1_000_000;
    const costUsd = inCost + outCost + cacheReadCost + cacheWriteCost;

    // Não estimamos duração. Duração real vem do MP3 quando a narração for
    // gerada (ElevenLabs API devolve durationSec exacto via timestamps).
    // Antes disso, só sabemos wordCount como informação útil.
    const wordCount = (parsed.script || "").split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      titulo,
      slug,
      tema,
      model: modelChoice,
      modelId,
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
    // Logging detalhado para diagnosticar 500s da Anthropic. Antes só
    // tínhamos e.message — agora também extraímos status, type da API e
    // request_id (essencial para abrir ticket à Anthropic).
    if (e instanceof Anthropic.APIError) {
      const err = e as unknown as {
        status?: number;
        message?: string;
        type?: string;
        request_id?: string;
      };
      const detail = {
        status: err.status,
        type: err.type,
        message: err.message,
        requestId: err.request_id,
      };
      console.error("[gen-project] Anthropic APIError:", JSON.stringify(detail));
      return NextResponse.json(
        {
          erro: `Anthropic ${detail.status}${detail.type ? ` (${detail.type})` : ""}: ${detail.message}`,
          requestId: detail.requestId,
        },
        { status: 500 },
      );
    }
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[gen-project] Erro não-API:", msg);
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
