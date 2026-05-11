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

const SYSTEM = `És uma contadora de histórias moçambicana — voz de quem se senta junto ao fogo ao fim do dia e narra. Escreves contos curtos para acompanhar música ambient instrumental Ancient Ground.

# Identidade Ancient Ground

Música enraizada em Moçambique: capulanas, baobás, oceano Índico, savana, machambas, batuques, anciãos. Centralidade africana. Ubuntu. Tempo profundo. Elementos como sujeitos vivos. Sem misticismo New Age.

# O que escrever

Conto inédito de **200-280 palavras**, dividido em **exactamente 10 capítulos**.

- Capítulos 1-9: cada um é UMA frase curta (10-20 palavras) ou no máximo duas frases curtas. Cada frase é uma imagem concreta — alguém a fazer alguma coisa, num sítio que se vê.
- Capítulo 10 (fecho): 1-2 frases que **selam a aprendizagem da história** de forma concreta. Não é moral abstracta, é uma observação que arruma o que foi mostrado.

Exemplo de fecho concreto: "Há coisas que não se ensinam por palavras. Passam pelos gestos. As mãos aprendem antes da cabeça."
Não escrevas fecho moralizante tipo "e assim aprendeu que…" ou "a lição é que…".

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
- chapters: array com EXACTAMENTE 10 strings.
    - 1-9: cada uma 1 frase curta (10-20 palavras) ou no máximo 2 frases curtas
    - 10: fecho-lição que sela a história em 1-2 frases concretas

O 1º capítulo abre a cena. Os intermédios deixam o gesto crescer. O 10º arruma.

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

  if (chapters.length < 8 || chapters.length > 12) {
    throw new Error(`Story com nº de chapters errado (${chapters.length}; esperado 10±2).`);
  }
  return { title, chapters };
}
