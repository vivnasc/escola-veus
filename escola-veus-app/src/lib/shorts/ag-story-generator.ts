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
  /** Contos recentes — Claude evita títulos similares e aberturas
   *  iguais. Cada item é o título + primeira frase do conto. Passar
   *  os últimos 6-12. */
  recentStories?: { title: string; opening: string }[];
};

const SYSTEM = `És uma contadora de histórias moçambicana. Escreves contos curtos para acompanhar música ambient instrumental Ancient Ground.

# Identidade Ancient Ground

Música enraizada em Moçambique: capulanas, baobás, oceano Índico, savana, machambas, batuques, mercados, vida de costa, infância, gestos quotidianos. Centralidade africana. Ubuntu. Tempo profundo. Elementos como sujeitos vivos. Sem misticismo New Age.

A voz NÃO é obrigatoriamente "avó ao fogo". Pode ser:
- um adulto a fazer um gesto banal (estender roupa, esperar o autocarro, pesar peixe);
- uma criança a notar algo pela primeira vez;
- um pescador a ler o mar; uma vendedora a arrumar a banca; uma machambeira a cavar antes do calor;
- ou um observador anónimo à beira de uma cena.

# O que escrever

Conto inédito de **300-450 palavras**, dividido em **22 a 28 capítulos muito curtos**.

- Cada capítulo (1 até N-1): **UMA frase única, 6-12 palavras**. Uma imagem concreta por frase — um gesto, um objecto, um som, uma luz. Cada frase deve poder ler-se em voz alta em ~6 segundos.
- Capítulo final (N): 1 frase de 8-14 palavras que **sela a aprendizagem da história** de forma concreta. Não é moral abstracta, é uma observação que arruma o que foi mostrado.

A história tem ARCO completo: abertura (1-3), desenvolvimento (4-N-3), viragem (N-2), fecho (N). Mas cada frase é mínima — corta tudo o que não é gesto ou imagem.

Exemplos de aberturas POSSÍVEIS — escolhe um registo diferente em cada conto:
- "Ao meio-dia o mercado está vazio por dentro do som."  (mercado, presente)
- "O autocarro parou à beira do milho." (paisagem-quotidiana)
- "Era a quarta vez que ele lançava a rede sem peixe." (pesca, fracasso)
- "Era ainda escuro quando a avó acendeu o fogo." (ancestral — usa SÓ ocasionalmente)
- "A criança seguia o cão sem saber para onde ia." (infância, presente)
- "A capulana ainda estava molhada quando ela a estendeu." (gesto, casa)

Exemplo de fecho concreto: "Há coisas que não se ensinam por palavras. Passam pelas mãos." Não escrevas fecho moralizante tipo "e assim aprendeu que…" ou "a lição é que…".

# Anti-repetição (CRÍTICO)

Os contos AG estão a sair repetitivos: a maioria começa com "avó/avô a acender o fogo / a panela / o galo a cantar / a mão que ensina / o saber que passa". Quando os temas dos clips NÃO forem **anciao** ou **transmissao**, evita esse registo.

- Pelo menos 70% dos contos NÃO podem começar com personagem-ancião ou cena ao fogo. Usa um adulto-presente, uma criança, um anónimo, um animal, um elemento (mar, vento, calor).
- O verbo "ensinar / passar / herdar / transmitir / lembrar" deve aparecer no MÁXIMO 2 vezes em todo o conto, e nunca no capítulo 1.
- Se o triplete de temas inclui anciao OU transmissao, podes ir nesse registo — mas mesmo assim varia: o ancião pode estar a falhar, a hesitar, a mudar; a transmissão pode ser involuntária ou imperfeita.

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

  // Bloco de histórico — quando presente, Claude tem de evitar títulos
  // semelhantes e aberturas iguais. Reforça a diversidade entre contos.
  const recents = input.recentStories ?? [];
  const recentsBlock = recents.length > 0
    ? `\n\n# Contos AG recentes (EVITAR repetir títulos, aberturas, motivos centrais)\n\n${recents
        .map((r, i) => `${i + 1}. "${r.title}" — abertura: "${r.opening}"`)
        .join("\n")}\n\nO teu título tem de ser claramente diferente. A primeira frase tem de partir de outro lugar (outro sujeito, outra hora do dia, outro elemento). Não repitas o cenário "avó/anciã ao fogo de madrugada" se já apareceu acima.`
    : "";

  return `Escreve um conto inédito para acompanhar este Ancient Ground:

**Label do triplete:** ${input.label}
**Temas raízes:**
${temasInfo}

O conto deve ressoar com estes temas — directamente (cenas com mercado, machamba, pesca, batuque, criança, gente-paisagem) ou obliquamente (o que a mão sabe, o que o ritmo lembra). Mas é uma HISTÓRIA — tem cenas, gente, gestos, tempo a passar — não poesia abstracta.${recentsBlock}

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
