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

ECOSSISTEMA (recursos reais — escolhe o que melhor liga ao tema do dia):

Livros / ficções:
- 📖 "Os 7 Véus do Despertar" — livro impresso + digital com os 7 véus
  estruturais (Permanência, Memória, Turbilhão, Esforço, Desolação,
  Horizonte, Dualidade). Usa SÓ quando o tema do dia for um destes véus
  estruturais ou um despertar geral. URL: seteveus.space/livro-fisico
- 📚 Colecção Espelhos — 7 ficções narrativas onde te reconheces (não
  manuais; histórias). Boa para temas de identidade, padrões repetidos,
  reconhecer-se em personagens. URL: seteveus.space/comprar/espelhos
- 📖 Colecção Nós — ficções sobre relação, vínculo, comunidade,
  pertença, família. Boa para temas relacionais, maternidade, amizade,
  herança. URL: seteveus.space/comprar/nos

Outros recursos:
- 🎧 Music Véus — banda sonora contemplativa para escutar dentro.
  Boa para temas de silêncio, ritmo, pausa, mente em turbilhão.
  Primeira faixa de cada álbum gratuita. URL: music.seteveus.space
- 🌿 VITALIS — plano alimentar moçambicano, sem balança nem extremos
  (xima, matapa, caril). Boa para temas do corpo, alimentação,
  reeducação alimentar. URL: app.seteecos.com/vitalis
- ✨ LUMINA — diagnóstico energético gratuito, 7 perguntas, 2 minutos.
  Boa quando o tema convida à auto-percepção / mostra o que está
  invisível. URL: app.seteecos.com/lumina
- 🌀 Sete Ecos — comunidade anónima, partilha sem máscara. Boa para
  temas de solidão, comunidade, irmandade. URL: seteveus.space (root)
- 🕯️ Cursos (em breve) — Ouro Próprio, Limite Sagrado, A Arte da
  Inteireza, etc. CTA é SEMPRE "manifestar interesse / acesso
  prioritário", NUNCA "comprar" ou "inscreve-te". URL: seteveus.space/cursos

REGRAS DE CTA:
1. **Varia entre os dias.** NUNCA escolhas o mesmo recurso para 2 dias
   seguidos; idealmente 5-7 recursos diferentes nos 7 dias.
2. **Faz match temático.** Se o dia é sobre relação/maternidade →
   Colecção Nós. Se é sobre identidade/auto-imagem → Colecção Espelhos.
   Se é sobre silêncio interior → Music Véus. Se é sobre corpo →
   VITALIS. Se é sobre auto-percepção → LUMINA. Se é sobre comunidade
   → Sete Ecos. Se é sobre uma transformação que pede prática longa →
   Cursos. O livro "Os 7 Véus" só quando o dia tocar um dos sete véus
   estruturais.
3. NUNCA inventes URLs ou produtos fora desta lista.
4. Se mesmo assim nada se encaixar, usa Sete Ecos (comunidade) como
   fallback contemplativo.

ESTRUTURA DE CADA DIA (6 slides):
- Slide 1: capa — { linha1, linha2 } (frases curtas de abertura)
- Slides 2-5: conteudo — { estilo: "poetico"|"prosa", texto, titulo? }
  · poetico: 2-4 linhas curtas com \\n; impacto emocional
  · prosa: frase ou parágrafo curto
  · titulo opcional (ex: "HÁBITO DA ESTAÇÃO" — só num dos slides 2-5, em maiúsculas)
- Slide 6: cta — { icone (emoji), recurso, descricao, url }

Cada dia tem:
- veu: palavra-tema em maiúsculas (não tem de ser um dos 7 véus do livro;
  pode ser CHEGADA, RAIZ, FERIDA, COLO, qualquer coisa que destile o tema)
- subtitulo: 1 linha italic curta a explicar o tema
- numero: 1..N
- romano: gerado automaticamente

Devolve EXACTAMENTE a estrutura pedida via tool call.`;

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

/**
 * Regera UM slide específico, mantendo coerência com o resto do dia.
 * `tipo` força o tipo de saída (capa | conteudo | cta). `hint` é uma
 * instrução opcional do utilizador (ex: "mais íntimo", "menciona café").
 */
export async function gerarSlideComClaude(opts: {
  apiKey: string;
  dia: Dia;
  slideIdx: number; // 0-based
  hint?: string;
}): Promise<{ slide: import("./carousel-types").Slide; usage: unknown }> {
  const { apiKey, dia, slideIdx } = opts;
  const slideAtual = dia.slides[slideIdx];
  if (!slideAtual) throw new Error("slideIdx fora do range");

  const tipo = slideAtual.tipo;
  const client = new Anthropic({ apiKey });

  const contextoOutrosSlides = dia.slides
    .map((s, i) => {
      if (i === slideIdx) return `[${i + 1}] (este — vais regenerar)`;
      if (s.tipo === "capa") return `[${i + 1}] capa: ${s.linha1} / ${s.linha2}`;
      if (s.tipo === "conteudo") return `[${i + 1}] ${s.estilo}: ${s.texto.replace(/\n+/g, " ")}`;
      return `[${i + 1}] cta: ${s.recurso} → ${s.url}`;
    })
    .join("\n");

  const userMessage = `Regera o slide ${slideIdx + 1} do Dia ${dia.numero} — ${dia.veu}.
Subtítulo do dia: "${dia.subtitulo}"
Tipo do slide a regerar: ${tipo}

Contexto dos outros slides do dia (mantém coerência):
${contextoOutrosSlides}

${opts.hint ? `Instrução extra: ${opts.hint}\n` : ""}
Devolve apenas o slide regerado via tool save_slide. Mantém o tipo "${tipo}".`;

  const slideToolSchemas: Record<string, unknown> = {
    capa: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["capa"] },
        linha1: { type: "string" },
        linha2: { type: "string" },
      },
      required: ["tipo", "linha1", "linha2"],
    },
    conteudo: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["conteudo"] },
        estilo: { type: "string", enum: ["poetico", "prosa"] },
        texto: { type: "string" },
        titulo: { type: "string" },
      },
      required: ["tipo", "estilo", "texto"],
    },
    cta: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["cta"] },
        icone: { type: "string" },
        recurso: { type: "string" },
        descricao: { type: "string" },
        url: { type: "string" },
      },
      required: ["tipo", "icone", "recurso", "descricao", "url"],
    },
  };

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: "save_slide",
        description: "Guarda o slide regerado.",
        input_schema: {
          type: "object",
          properties: { slide: slideToolSchemas[tipo] },
          required: ["slide"],
        } as never,
      },
    ],
    tool_choice: { type: "tool", name: "save_slide" },
    messages: [{ role: "user", content: userMessage }],
  });

  const toolUseBlock = res.content.find((b) => b.type === "tool_use");
  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    throw new Error("Claude não devolveu tool_use.");
  }
  const input = toolUseBlock.input as { slide?: import("./carousel-types").Slide };
  if (!input.slide || input.slide.tipo !== tipo) {
    throw new Error("Slide regerado tem tipo errado.");
  }

  return { slide: input.slide, usage: res.usage };
}
