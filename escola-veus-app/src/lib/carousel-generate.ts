// Geração de uma colecção de carrossel via Claude API.
// Usa tool calling para forçar resposta no schema {dias: Dia[]}.

import Anthropic from "@anthropic-ai/sdk";
import type { Dia } from "./carousel-types";
import { romanFor } from "./carousel-types";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 8192;

const SYSTEM_PROMPT = `És a voz editorial de Vivianne dos Santos (Sete Ecos / Os Sete Véus).

Estilo:
- Autoridade calma. "Vejo-te, e há mais para ti."
- Sem exclamações. Sem urgência fabricada. Sem performance.
- Frases curtas, impacto máximo. Tipografia primeiro, decoração depois.
- Português europeu / moçambicano (não brasileiro).
- Mistura prosa e poesia. Em poesia, usa quebras de linha (\\n).

Ecossistema (CTAs reais — usa só se fizerem sentido para o brief):
- seteveus.space — Livro, Colecção Espelhos, Music Véus, Ecos, Cursos
- app.seteecos.com — VITALIS (alimentação) e LUMINA (diagnóstico gratuito)
- Cursos = manifestar interesse, NÃO comprar.
- VITALIS e LUMINA vivem em app.seteecos.com, não em seteveus.space.

Estrutura de cada dia (6 slides):
- Slide 1: capa — { linha1, linha2 } (frases curtas de abertura)
- Slides 2-5: conteudo — { estilo: "poetico"|"prosa", texto, titulo? }
  · poetico: 2-4 linhas curtas com \\n; impacto emocional
  · prosa: frase ou parágrafo curto
  · titulo opcional (ex: "HÁBITO DA ESTAÇÃO" — só num dos slides 2-5, em maiúsculas)
- Slide 6: cta — { icone (emoji), recurso, descricao, url }

Cada dia tem:
- veu: palavra-tema em maiúsculas (ex: PERMANÊNCIA, MEMÓRIA)
- subtitulo: 1 linha italic curta a explicar o tema
- numero: 1..N
- romano: gerado automaticamente

Regras absolutas:
- NUNCA inventes URLs ou produtos fora do ecossistema.
- Se o brief não pedir CTA específico, usa "seteveus.space" + recurso "Os Sete Véus" como fallback.
- Devolve EXACTAMENTE a estrutura pedida via tool call.`;

const TOOL_NAME = "save_collection";

const TOOL_INPUT_SCHEMA = {
  type: "object" as const,
  properties: {
    dias: {
      type: "array",
      items: {
        type: "object",
        properties: {
          numero: { type: "integer" },
          veu: { type: "string", description: "Palavra-tema em maiúsculas" },
          subtitulo: { type: "string" },
          slides: {
            type: "array",
            items: {
              oneOf: [
                {
                  type: "object",
                  properties: {
                    tipo: { type: "string", enum: ["capa"] },
                    linha1: { type: "string" },
                    linha2: { type: "string" },
                  },
                  required: ["tipo", "linha1", "linha2"],
                  additionalProperties: false,
                },
                {
                  type: "object",
                  properties: {
                    tipo: { type: "string", enum: ["conteudo"] },
                    estilo: { type: "string", enum: ["poetico", "prosa"] },
                    texto: { type: "string" },
                    titulo: { type: "string" },
                  },
                  required: ["tipo", "estilo", "texto"],
                  additionalProperties: false,
                },
                {
                  type: "object",
                  properties: {
                    tipo: { type: "string", enum: ["cta"] },
                    icone: { type: "string" },
                    recurso: { type: "string" },
                    descricao: { type: "string" },
                    url: { type: "string" },
                  },
                  required: ["tipo", "icone", "recurso", "descricao", "url"],
                  additionalProperties: false,
                },
              ],
            },
          },
        },
        required: ["numero", "veu", "subtitulo", "slides"],
      },
    },
  },
  required: ["dias"],
};

export async function gerarColecaoComClaude(opts: {
  apiKey: string;
  title: string;
  brief: string;
  numDias?: number; // default 7
  slidesPorDia?: number; // default 6 (atenção: estrutura assume 6)
}): Promise<{ dias: Dia[]; usage: unknown }> {
  const { apiKey, title, brief } = opts;
  const numDias = opts.numDias ?? 7;

  const client = new Anthropic({ apiKey });

  const userMessage = `Cria uma colecção chamada "${title}".

Brief:
${brief}

Estrutura: ${numDias} dias × 6 slides cada.

Em cada dia:
- escolhe uma palavra-tema (veu) que destile a ideia central do dia
- subtitulo italic curto a explicar o que esse véu encobre/revela
- 6 slides na ordem: capa → conteudo×4 → cta
- pelo menos 1 dos slides 2-5 deve ser estilo "poetico"
- 1 dos slides 2-5 pode ter titulo "HÁBITO DA ESTAÇÃO" ou similar

Chama a tool save_collection com a colecção completa. Não escrevas mais nada.`;

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: TOOL_NAME,
        description: "Guarda a colecção gerada com a estrutura correcta.",
        input_schema: TOOL_INPUT_SCHEMA as never,
      },
    ],
    tool_choice: { type: "tool", name: TOOL_NAME },
    messages: [{ role: "user", content: userMessage }],
  });

  const toolUseBlock = res.content.find((b) => b.type === "tool_use");
  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    throw new Error("Claude não devolveu tool_use; impossível extrair colecção.");
  }
  const input = toolUseBlock.input as { dias?: unknown };
  if (!Array.isArray(input.dias)) {
    throw new Error("tool_use.input.dias inválido.");
  }

  // Adiciona romano gerado (não pedimos ao modelo)
  const dias: Dia[] = (input.dias as Dia[]).map((d) => ({
    ...d,
    numero: Number(d.numero),
    romano: romanFor(Number(d.numero), numDias),
    slides: Array.isArray(d.slides) ? d.slides : [],
  }));

  return { dias, usage: res.usage };
}
