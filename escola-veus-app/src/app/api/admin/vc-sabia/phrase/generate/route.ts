import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildAvoidSet, normalizePhraseForDedup } from "@/lib/vc-sabia/dedupe";
import { parseClaudeJson } from "@/lib/vc-sabia/parse-claude-json";

export const maxDuration = 90;
export const runtime = "nodejs";

/**
 * POST /api/admin/vc-sabia/phrase/generate
 *
 * Gera UMA frase fresca via Claude para post manual ou regeneracao de linha.
 * De-dup servidor: o seed completo (117 frases) + historico + qualquer
 * `avoid` extra do cliente sao automaticamente bloqueados. Faz ate 3
 * tentativas para garantir frase realmente nova.
 *
 * Body: { theme?: string, avoid?: string[] }
 * Returns: { phrase, theme, reasoning, retries }
 */

const THEMES_POOL = [
  "autoconhecimento",
  "autoamor",
  "autoperdao",
  "florescer-no-tempo-certo",
  "presenca-leve",
  "suavidade-e-descanso",
  "sonhar-com-raizes",
  "inteireza",
  "corpo-como-casa",
  "confianca-no-caminho",
  "gratidao",
  "alegria-simples",
  "beleza-de-existir",
];

function buildSystemPrompt(opts: {
  theme: string | undefined;
  avoidBlock: string;
  attempt: number;
}): string {
  const themeInstruction = opts.theme
    ? `O tema desta frase é: ${opts.theme}.`
    : `Escolhe livremente um destes temas: ${THEMES_POOL.join(", ")}.`;
  const stricter =
    opts.attempt > 1
      ? `\n\nTENTATIVA #${opts.attempt}. As anteriores ja existiam. Imagem de natureza tem de ser COMPLETAMENTE diferente das ja vistas — varia o substantivo inicial.`
      : "";
  return `És a Vivianne dos Santos, autora da série de manhã "VC Sabia Que…?" no Instagram. Base em Maputo.

Voz da marca:
- Português PT-PT/PT-MZ (Moçambique, não Brasil)
- Contemplativa, poética mas acessível, manhã sagrada
- Imagem de natureza concreta como espelho do leitor

PADRÃO OBRIGATÓRIO (sem variações):
A frase TEM de fluir naturalmente depois do kicker "Sabias que...". Testa em voz alta: "Sabias que... <frase>" tem de soar como uma frase única.

Estrutura: <imagem concreta de natureza com artigo>. Tu também (sabes). Confia <preposição> <algo interior do leitor>.

EXEMPLOS-OURO (cada um lê-se como "Sabias que... <frase>"):
- "O lótus nasce na lama e não se suja. Tu também. Confia na tua pureza."
- "A borboleta não se lembra de ter sido lagarta. Tu também. Confia na tua transformação."
- "O girassol segue o sol mesmo nos dias cinzentos. Tu também. Confia na tua direção."
- "O baobá guarda água para os anos secos. Tu também. Confia no que reservas."
- "A gota fura a pedra sem nunca a empurrar. Tu também. Confia na tua constância."
- "As estrelas só aparecem quando o céu escurece. Tu também. Confia na tua noite."
- "A semente parte-se antes de germinar. Tu também. Confia na tua abertura."
- "A brasa guarda calor mesmo sob a cinza. Tu também. Confia no que parece adormecido."

REGRA CRÍTICA — SEM IMPERATIVOS, SEM PRÁTICAS:
A frase é SEMPRE observação contemplativa, NUNCA conselho ou instrução. PROIBIDO usar "Trata-te", "Pratica", "Pergunta-te", "Permite-te", "Lembra-te", "Procura", "Faz", "Escuta", "Respira", "Hoje, ..." ou qualquer verbo imperativo dirigido ao leitor. O único imperativo permitido é "Confia ..." (na 3ª frase).

Regras formais:
- NUNCA usar travessão "—" nem "–". Só pontos finais e vírgulas.
- 2 ou 3 frases curtas, total 80–220 caracteres.
- Começa com letra MAIÚSCULA (vai depois de "Sabias que...").
- A primeira frase é uma imagem da natureza (planta, água, lua, ave, fogo, terra, fruto, pedra), nunca abstracção.
- A segunda é "Tu também." ou "Tu também sabes."
- A terceira (opcional, ~70%) começa com "Confia" + preposição + substantivo interior (raiz, ciclo, tempo, fluxo, pausa, passo, espaço, silêncio, retorno, instinto, base, processo, pureza, mudança, valor, espera, reserva).

${themeInstruction}${opts.avoidBlock}${stricter}

Output strict JSON, sem markdown, sem code fences:
{
  "phrase": "<a frase, sem 'Sabias que...' no inicio>",
  "theme": "<slug do tema usado>",
  "reasoning": "<1 frase a explicar a imagem da natureza usada>"
}`;
}

async function callClaude(
  client: Anthropic,
  systemPrompt: string
): Promise<{ phrase: string; theme: string; reasoning: string } | null> {
  const res = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: systemPrompt,
    messages: [{ role: "user", content: "Gera uma frase fresca agora." }],
  });
  let raw = "";
  for (const block of res.content) {
    if (block.type === "text") raw += block.text;
  }
  const result = parseClaudeJson<{
    phrase?: string;
    theme?: string;
    reasoning?: string;
  }>(raw);
  if (!result.ok) return null;
  const phrase = (result.data.phrase || "").replace(/[—–]/g, ",").trim();
  if (!phrase) return null;
  return {
    phrase,
    theme: result.data.theme ?? "",
    reasoning: result.data.reasoning ?? "",
  };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { erro: "ANTHROPIC_API_KEY nao configurada" },
      { status: 503 }
    );
  }

  let body: { theme?: string; avoid?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }
  const theme = body.theme?.trim();
  const clientAvoid = Array.isArray(body.avoid) ? body.avoid : [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const avoidPool = await buildAvoidSet(supabaseUrl, serviceKey, clientAvoid);

  // Amostra textual para o prompt (cap 60 — uma so frase precisa de menos contexto)
  const avoidSample = avoidPool.texts.slice(-60);
  const avoidBlock =
    avoidSample.length > 0
      ? `\n\nNAO repitas nem parafraseies estas frases ja escritas:\n${avoidSample.map((a) => `- ${a}`).join("\n")}`
      : "";

  const client = new Anthropic({ apiKey, maxRetries: 2 });
  let attempt = 0;
  const MAX_ATTEMPTS = 3;
  let result: { phrase: string; theme: string; reasoning: string } | null = null;

  while (attempt < MAX_ATTEMPTS) {
    attempt++;
    let candidate: { phrase: string; theme: string; reasoning: string } | null;
    try {
      candidate = await callClaude(
        client,
        buildSystemPrompt({ theme, avoidBlock, attempt })
      );
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ erro: `Claude: ${msg}` }, { status: 502 });
      }
      continue;
    }
    if (!candidate) continue;
    const norm = normalizePhraseForDedup(candidate.phrase);
    if (!norm) continue;
    if (avoidPool.normalized.has(norm)) continue;
    result = candidate;
    break;
  }

  if (!result) {
    return NextResponse.json(
      {
        erro:
          "Nao consegui gerar frase nova depois de " +
          MAX_ATTEMPTS +
          " tentativas (todas estavam ja escritas). Adiciona mais variedade ao seed ou tenta outro tema.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    phrase: result.phrase,
    theme: result.theme || theme || "",
    reasoning: result.reasoning,
    retries: attempt - 1,
  });
}
