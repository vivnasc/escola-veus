import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { calendarContextFor, calendarLabel } from "@/lib/vc-sabia/calendar";
import { buildAvoidSet, normalizePhraseForDedup } from "@/lib/vc-sabia/dedupe";

export const maxDuration = 120;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/phrase/batch-generate
 *
 * Gera N frases novas via Claude, garantindo que NENHUMA frase repete:
 *  - O seed completo (90 frases) entra automaticamente em avoid.
 *  - Os textos `phraseText` de todos os batches passados tambem.
 *  - Qualquer frase enviada pelo cliente em `avoid` acrescenta-se a estes.
 *  - As saidas do Claude sao normalizadas e re-comparadas, e duplicados
 *    sao descartados; se ficaram menos que `count`, faz-se uma retry
 *    com instrucoes mais agressivas e duplicados extra no avoid.
 *
 * Body: { count: number (1-40), avoid?: string[], dates?: string[] }
 * Returns: { phrases, requested, returned, retries, duplicatesDropped }
 */

// POOL DIURNO/MATINAL: NUNCA lua, estrelas, vaga-lume, noite ou nocturnal.
// vc-sabia é série de MANHÃ — qualquer referência à lua/estrelas/escuro
// produz frases incoerentes e prompts MJ nocturnos.
const NATURE_POOL = [
  "semente", "raiz", "tronco", "ramo", "folha nova", "lirio", "lotus",
  "musgo", "samambaia", "alecrim", "trigo", "rio", "ribeiro", "lago",
  "lagoa", "orvalho", "neblina", "nevoa", "chuva miuda", "garoa",
  "amanhecer", "alvorada",
  "primeira luz", "sol baixo", "horizonte", "horizonte rosa", "ceu pastel",
  "borboleta", "abelha", "passaro", "andorinha", "garca", "tartaruga",
  "tartaruga marinha", "peixe pequeno", "pedra do rio",
  "pedra polida", "areia", "duna", "concha", "estrela do mar",
  "fogo brando", "carvao", "brisa", "vento sul", "fumo de incenso",
  "barro", "argila", "terra fresca", "olival", "cajueiro", "mafurreira",
  "baobá", "papaia", "manga em flor",
];

function buildSystemPrompt(opts: {
  count: number;
  dateBlock: string;
  avoidBlock: string;
  attempt: number;
  natureSuggestion: string;
}): string {
  const stricterTail = opts.attempt > 1
    ? "\n\nESTA E A TENTATIVA #" + opts.attempt + ". A anterior gerou frases que ja existiam. CRITICO: cada frase tem de ter uma imagem de natureza UNICA, NUNCA escrita antes. Varia o substantivo inicial."
    : "";
  return `És a Vivianne dos Santos, autora da serie "VC Sabia Que..." (Instagram, manha contemplativa, base em Maputo).

REGRA CRITICA #1: a frase aparece DEPOIS do kicker "Sabias que..." que o overlay imprime acima. Testa mentalmente em voz alta: "Sabias que... <a tua frase>" tem de soar natural e fluir como uma frase unica.

REGRA CRITICA #2: a frase NUNCA inclui "sabias que" no inicio (duplica o kicker). Comeca SEMPRE por artigo + substantivo concreto da natureza DIURNA (A semente, O rio, A garca, O baobá, A neblina, O orvalho, etc).

REGRA CRITICA NOCTURNA — PROIBIÇÃO ABSOLUTA:
Esta é uma série de MANHÃ. NUNCA uses lua, lua cheia, lua nova, crescente, estrelas, constelação, noite, escuro, escuridão, escurece, anoitecer, crepúsculo, lanterna, vela, pirilampo, vaga-lume, breu. Esse vocabulário pertence à série hoje-em-mim (nocturna), NÃO à vc-sabia. Se gerares uma frase com qualquer destes termos, será REJEITADA.

REGRA CRITICA #3 — SEM IMPERATIVOS, SEM PRATICAS, SEM DIRECTIVAS:
A frase e SEMPRE uma OBSERVACAO contemplativa, NUNCA um conselho ou instrucao para o leitor.
PROIBIDO comecar ou usar: "Trata-te", "Pratica", "Pergunta-te", "Permite-te", "Lembra-te", "Procura", "Faz", "Escuta", "Repara", "Olha", "Respira", "Senta-te", "Hoje, ...", "Deixa", "Aceita", "Confia em ti" (excepto na 3ª frase como "Confia <preposicao> ..."), qualquer verbo no imperativo dirigido ao leitor.
A frase descreve um fenomeno natural; o "Tu tambem" espelha-o; o "Confia ..." e a unica forma admitida de imperativo (e suave, devocional).

PADRAO OBRIGATORIO (sem variacoes):
1. "<Artigo definido> <substantivo natureza> <verbo na 3a pessoa do presente ou passado> <complemento>."
2. "Tu tambem." OU "Tu tambem sabes."
3. (opcional, em ~70% das frases) "Confia <preposicao> <algo interior do leitor>." (Confia no, na, nos, nas, em — substantivo: raiz, ciclo, tempo, fluxo, pausa, passo, espaco, silencio, retorno).

EXEMPLOS BONS (cada um le-se como "Sabias que... <frase>"):
- "O lótus nasce na lama e nao se suja. Tu tambem. Confia na tua pureza."
- "A borboleta nao se lembra de ter sido lagarta. Tu tambem. Confia na tua transformacao."
- "O girassol segue o sol mesmo nos dias cinzentos. Tu tambem. Confia na tua direcao."
- "O baobá guarda agua para os anos secos. Tu tambem. Confia no que reservas."
- "A gota fura a pedra sem nunca a empurrar. Tu tambem. Confia na tua constancia."
- "O orvalho da manha chega sem aviso e parte sem despedida. Tu tambem. Confia no que vem suave."
- "A semente parte-se antes de germinar. Tu tambem. Confia na tua abertura."
- "A brasa guarda calor mesmo sob a cinza. Tu tambem. Confia no que parece adormecido."
- "Nenhum voo comeca sem o salto. Tu tambem. Confia no teu impulso."

EXEMPLOS PROIBIDOS — NUNCA REPLICAR:
- "Trata-te hoje como..." (imperativo / pratica)
- "Pergunta-te hoje..." (imperativo / pratica)
- "Permite-te rir..." (imperativo / pratica)
- "Procura uma alegria pequena..." (imperativo / pratica)
- "Pratica a leveza..." (imperativo / pratica)
- "Hoje, faz uma coisa..." (imperativo + adverbio temporal)
- "Antes de procurares..." (adverbio temporal de abertura)
- "Cada pergunta que te fazes..." (pronome quantificador)
- "Quando te conheces melhor..." (conjuncao temporal)
- "Sabias que a semente..." (duplica kicker)

Regras formais:
- Portugues PT-PT/PT-MZ (Mocambique, nao Brasil). Ortografia pre-Acordo ou Acordo, ambas aceitaveis, mas consistente.
- NUNCA usar travessao "—" nem "–". So pontos finais e virgulas.
- Cada frase entre 80 e 220 caracteres totais.
- Imagem concreta sensorial DIURNA (planta, agua, ar, animal, pedra, fogo de cozinha, terra, fruto, ave, orvalho, sol, vento). NUNCA lua/estrelas/noite. Nao filosofia abstracta.
- Termina em ponto final.

Sugestoes de natureza para inspirar variedade (escolhe imagens diferentes para cada frase, evita repetir o mesmo substantivo): ${opts.natureSuggestion}.

Temas possiveis: autoconhecimento, autoamor, autoperdao, florescer-no-tempo-certo, presenca-leve, suavidade-e-descanso, sonhar-com-raizes, inteireza, corpo-como-casa, confianca-no-caminho, gratidao, alegria-simples, beleza-de-existir.

GERA EXACTAMENTE ${opts.count} frases. Todas distintas entre si E distintas das ja escritas. Imagens diferentes (nao todas com agua, nao todas com a mesma planta, varia substantivos). PROIBIDO usar lua/estrelas/noite/escuro.${opts.dateBlock}${opts.avoidBlock}${stricterTail}

Output strict JSON, sem markdown, sem code fences:
{
  "phrases": [
    { "phrase": "<frase comecando por A/O/Os/As + substantivo natureza>", "theme": "<slug>", "reasoning": "<imagem usada>" }
  ]
}`;
}

function pickNatureSuggestions(seedValue: number, n: number): string {
  // Rotacao deterministica a partir do tempo, para nao biased mesma lista
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(NATURE_POOL[(seedValue + i * 7) % NATURE_POOL.length]);
  }
  return out.join(", ");
}

async function callClaude(
  client: Anthropic,
  systemPrompt: string,
  count: number,
  userHint: string
): Promise<Array<{ phrase: string; theme: string; reasoning: string }>> {
  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Gera ${count} frases frescas agora. ${userHint}`,
      },
    ],
  });
  let raw = "";
  for (const block of res.content) {
    if (block.type === "text") raw += block.text;
  }
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  const parsed = JSON.parse(cleaned) as {
    phrases?: Array<{ phrase?: string; theme?: string; reasoning?: string }>;
  };
  return (parsed.phrases ?? [])
    .map((p) => ({
      phrase: (p.phrase || "").replace(/[—–]/g, ",").trim(),
      theme: p.theme || "",
      reasoning: p.reasoning || "",
    }))
    .filter((p) => p.phrase.length > 0);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY nao configurada" },
      { status: 503 }
    );
  }

  let body: { count?: number; avoid?: string[]; dates?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON invalido" }, { status: 400 });
  }

  const count = Math.max(1, Math.min(40, Number(body.count ?? 7)));
  const clientAvoid = Array.isArray(body.avoid) ? body.avoid : [];
  const dates = Array.isArray(body.dates) ? body.dates.slice(0, count) : [];

  // Avoid pool = seed (90) + historico (todos os batches) + extras do cliente.
  // Nunca pode haver repeticao contra nada disto.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const avoidPool = await buildAvoidSet(supabaseUrl, serviceKey, clientAvoid);

  // No prompt enviamos so uma amostra textual (cap 120) — Claude nao precisa
  // de ver os 1000 phrases possiveis, basta saber que existem e ver alguns.
  // A garantia anti-repeticao acontece no servidor por dedup.
  const avoidSample = avoidPool.texts.slice(-120);
  const avoidBlock =
    avoidSample.length > 0
      ? `\n\nNAO repitas nem parafraseies estas frases ja escritas (amostra das ${avoidPool.texts.length} existentes):\n${avoidSample
          .map((a, i) => `${i + 1}. ${a}`)
          .join("\n")}`
      : "";

  const dateBlock =
    dates.length > 0
      ? `\n\nCALENDARIO — cada frase corresponde a um dia. Modela arco emocional:\n${dates
          .map((iso, i) => {
            const [y, m, d] = iso.split("-").map(Number);
            if (!y || !m || !d) return `${i + 1}. ${iso}`;
            const ctx = calendarContextFor(y, m, d);
            const label = calendarLabel(ctx);
            const hint = label ? ` · ${label}` : "";
            return `${i + 1}. ${iso} (dia ${ctx.dayOfMonth}/${ctx.daysInMonth} do mes)${hint}`;
          })
          .join("\n")}\n\nDIRECTIVAS POR MARCADOR:\n- "abertura" / "1.o do ano" / "1.a segunda" -> tema de inicio, semente, raiz, manha primeira.\n- "encerramento" / "ultimo do ano" -> tema de fecho, integracao, agradecimento.\n- "meio do mes" -> reafirmar caminho, raiz, paciencia.\n- "domingo" -> suavidade, descanso, corpo.\n- "solsticio inverno" / "equinocio outono" -> pausa, recolhimento.\n- "solsticio verao" / "equinocio primavera" -> expansao, alegria.\nNAO mencionar a data na frase. O dia influencia tema e tom, nao o texto.`
      : "";

  const client = new Anthropic({ apiKey, maxRetries: 2 });
  const collected: Array<{ phrase: string; theme: string; reasoning: string }> = [];
  const seenThisRun = new Set<string>();
  let droppedDup = 0;
  let attempt = 0;
  const MAX_ATTEMPTS = 3;

  while (collected.length < count && attempt < MAX_ATTEMPTS) {
    attempt++;
    const need = count - collected.length;
    const sysPrompt = buildSystemPrompt({
      count: need,
      dateBlock: attempt === 1 ? dateBlock : "", // no retry foca em variedade
      avoidBlock,
      attempt,
      natureSuggestion: pickNatureSuggestions(Date.now() + attempt * 31, 18),
    });

    let batch: Array<{ phrase: string; theme: string; reasoning: string }>;
    try {
      batch = await callClaude(
        client,
        sysPrompt,
        need,
        attempt === 1
          ? "Variedade de imagens de natureza (planta, agua, lua, ar, animal, pedra, fruto)."
          : `Tentativa ${attempt}. As frases anteriores ja existiam. Usa imagens completamente diferentes — varia o substantivo inicial.`
      );
    } catch (err) {
      if (collected.length === 0) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ erro: `Claude: ${msg}` }, { status: 502 });
      }
      break;
    }

    for (const p of batch) {
      if (collected.length >= count) break;
      const norm = normalizePhraseForDedup(p.phrase);
      if (!norm) continue;
      if (avoidPool.normalized.has(norm)) {
        droppedDup++;
        continue;
      }
      if (seenThisRun.has(norm)) {
        droppedDup++;
        continue;
      }
      seenThisRun.add(norm);
      avoidPool.normalized.add(norm); // proxima tentativa nao re-aceita
      collected.push(p);
    }
  }

  return NextResponse.json({
    phrases: collected,
    requested: count,
    returned: collected.length,
    retries: attempt - 1,
    duplicatesDropped: droppedDup,
  });
}
