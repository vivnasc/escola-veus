/**
 * Gerador de contos contemplativos para AG fulls.
 *
 * Claude Sonnet 4.6 escreve história inédita ~300-450 palavras dividida
 * em ~22-28 capítulos muito curtos (1 frase, 6-12 palavras) que passam
 * como texto sobre música instrumental durante 3-5 min.
 *
 * Cada capítulo é dimensionado para ser lido em 6-8s — pacing rápido
 * mantém retenção. Sem espaços de "ecrã vazio".
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  RAIZES_TEMA_LABELS,
  RAIZES_TEMA_DESCRICOES,
  type RaizTema,
} from "@/lib/ag-raizes-temas";

export type AGStory = {
  title: string;
  chapters: string[];
};

export type AGStoryInput = {
  label: string;
  temas: RaizTema[];
  trackNumber?: number;
};

const SYSTEM = `És uma contadora de histórias moçambicana — voz de quem se senta junto ao fogo ao fim do dia e narra. Escreves contos curtos para acompanhar música ambient instrumental Ancient Ground.

# Identidade Ancient Ground

Música enraizada em Moçambique: capulanas, baobás, oceano Índico, savana, machambas, batuques, anciãos. Centralidade africana. Ubuntu. Tempo profundo. Elementos como sujeitos vivos. Sem misticismo New Age.

# O que escrever

Conto inédito de **300-450 palavras**, dividido em **22 a 28 capítulos muito curtos**.

- Cada capítulo (1 até N-1): **UMA frase única, 6-12 palavras**. Uma imagem concreta por frase — um gesto, um objecto, um som, uma luz. Cada frase deve poder ler-se em voz alta em ~6 segundos.
- Capítulo final (N): 1 frase de 8-14 palavras que **sela a aprendizagem da história** de forma concreta. Não é moral abstracta, é uma observação que arruma o que foi mostrado.

A história tem ARCO completo: abertura (1-3), desenvolvimento (4-N-3), viragem (N-2), fecho (N). Mas cada frase é mínima — corta tudo o que não é gesto ou imagem.

Exemplo de pacing:
1. "Era ainda escuro quando a avó acendeu o fogo."
2. "A panela esperava na pedra fria."
3. "Os galos calaram-se quando ela cantou baixinho."
4. "Pôs a água, mexeu o sal, esperou."
...

Exemplo de fecho concreto: "Há coisas que não se ensinam por palavras. Passam pelas mãos." Não escrevas fecho moralizante tipo "e assim aprendeu que…" ou "a lição é que…".

# Tom

- 3ª pessoa ou 1ª (escolhe o que serve a história)
- PT-PT (Portugal/Moçambique), nunca brasileiro
- Frases CURTAS. Vai ao gesto, ao objecto, ao som. Detalhes sensoriais concretos.
- Ancorado: cheiros, texturas, peso, calor, sal, terra. Pouca abstracção.
- Tempo a passar: manhã, meio-dia, tarde. Inversões pontuais ("muito depois") são OK mas não abuses.

# Vocabulário PROIBIDO

manifestar, vibração, energia (espiritual), chakras, abundância, propósito de vida, alma gémea, frequência, despertar (no sentido new-age), tribo (no sentido instagram), jornada, alinhamento.

# Pontuação PROIBIDA

Travessões longos "—" e "–". Tique de IA. Usa vírgula, ponto, ou parágrafo. Nunca "—".

# Output

JSON puro segundo o schema. Sem markdown fences, sem preâmbulo.`;

function buildUserMessage(input: AGStoryInput): string {
  const temasInfo = input.temas
    .map((t) => `- ${RAIZES_TEMA_LABELS[t] || t}: ${RAIZES_TEMA_DESCRICOES[t] || ""}`)
    .join("\n");

  return `Escreve um conto inédito para acompanhar este Ancient Ground:

**Label do triplete:** ${input.label}
**Temas raízes:**
${temasInfo}

O conto deve ressoar com estes temas — directamente (cenas com avó, machamba, pesca) ou obliquamente (o que a mão sabe, o que o ritmo lembra). Mas é uma HISTÓRIA — tem cenas, gente, gestos, tempo a passar — não poesia abstracta.

Devolve JSON com:
- title: título curto (3-6 palavras)
- chapters: array com **22 a 28 strings**.
    - Cada string: 1 frase única, 6-12 palavras (lê-se em ~6s)
    - Última: 1 frase de 8-14 palavras que sela a história

Pacing rápido = retenção. Frases minimais. Cada capítulo é um plano de cinema curto. Não acumules duas imagens numa frase — separa em dois capítulos.

Output JSON puro, sem markdown.`;
}

export async function generateAGStory(input: AGStoryInput): Promise<AGStory> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada.");
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: [
      {
        type: "text" as const,
        text: SYSTEM,
        cache_control: { type: "ephemeral" as const },
      },
    ],
    messages: [{ role: "user", content: buildUserMessage(input) }],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            chapters: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["title", "chapters"],
          additionalProperties: false,
        },
      },
    },
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("Claude sem text block");
  const parsed = JSON.parse(textBlock.text) as Partial<AGStory>;

  const title = typeof parsed.title === "string" ? parsed.title : "Sem título";
  const chapters = Array.isArray(parsed.chapters)
    ? parsed.chapters.filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    : [];

  if (chapters.length < 20 || chapters.length > 30) {
    throw new Error(`Story com nº de chapters errado (${chapters.length}; esperado 22-28).`);
  }
  return { title, chapters };
}
