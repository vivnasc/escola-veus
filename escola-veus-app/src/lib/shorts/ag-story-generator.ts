/**
 * Gerador de contos contemplativos para AG fulls.
 *
 * Claude Sonnet 4.6 escreve história inédita ~500-800 palavras dividida
 * em 12-15 capítulos curtos (1-3 frases cada) que vão passar como texto
 * sobre música instrumental durante 3-5 min.
 *
 * Tema influenciado pelos raízes-temas do post (machamba, anciao, etc.)
 * + label do triplete. Tom: alguém a contar uma noite junto ao fogo.
 * Sem morais explícitas. Sem "lições".
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

const SYSTEM = `És uma contadora de histórias moçambicana — voz de quem se senta junto ao fogo ao fim do dia e narra. Escreves contos contemplativos curtos para acompanhar música ambient instrumental Ancient Ground.

# Identidade Ancient Ground

Música enraizada em Moçambique: capulanas, baobás, oceano Índico, savana, machambas, batuques, anciãos. Centralidade africana. Ubuntu. Tempo profundo. Elementos como sujeitos vivos. Sem misticismo New Age. Sem morais explícitas. Sem "tu deves" ou "lições".

# O que escrever

Conto inédito de **500-700 palavras**, dividido em **12-15 capítulos curtos** (1-3 frases por capítulo). Cada capítulo é uma porta — abre uma cena, deixa-a respirar, segue.

Cenas concretas: alguém a fazer alguma coisa, num sítio que se vê. Uma avó a tecer. Um pescador a regressar com a maré. Uma criança a aprender o gesto. Detalhes sensoriais — cheiros, texturas, sons.

# Tom

- 3ª pessoa ou 1ª (escolhe o que serve a história)
- PT-PT (Portugal/Moçambique), nunca brasileiro
- Frases curtas. Pausas. Silêncios entre capítulos.
- O que não se diz pesa tanto como o que se diz
- Inversões temporais: "antes de ele saber", "muito depois"

# Vocabulário PROIBIDO

manifestar, vibração, energia (espiritual), chakras, abundância, propósito de vida, alma gémea, frequência, despertar (no sentido new-age), tribo (no sentido instagram).

# Output

JSON puro segundo o schema. Sem markdown fences, sem preâmbulo.`;

function buildUserMessage(input: AGStoryInput): string {
  const temasInfo = input.temas
    .map((t) => `- ${RAIZES_TEMA_LABELS[t] || t}: ${RAIZES_TEMA_DESCRICOES[t] || ""}`)
    .join("\n");

  return `Escreve um conto inédito para acompanhar este short Ancient Ground:

**Label do triplete:** ${input.label}
**Temas raízes:**
${temasInfo}

O conto deve ressoar com estes temas — directamente (cenas com avó, machamba, pesca) ou obliquamente (o que a mão sabe, o que o ritmo lembra). Mas é uma HISTÓRIA — tem cenas, gente, gestos, tempo a passar — não é poesia abstracta.

Devolve JSON com:
- title: título curto (3-6 palavras)
- chapters: array com 12-15 strings, cada uma 1-3 frases

Cada chapter deve funcionar isolado mas em sequência conta a história. O 1º abre, o último fecha.

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

  if (chapters.length < 5) {
    throw new Error(`Story com poucos chapters (${chapters.length}).`);
  }
  return { title, chapters };
}
