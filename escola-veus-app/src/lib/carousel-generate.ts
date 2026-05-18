// Geração de uma colecção de carrossel via Claude API.
// Usa tool calling para forçar resposta no schema {dias: Dia[]}.

import Anthropic from "@anthropic-ai/sdk";
import type { Dia } from "./carousel-types";
import { romanFor } from "./carousel-types";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 8192;

const SYSTEM_PROMPT = `És a voz editorial de Vivianne dos Santos (Sete Ecos / Os Sete Véus).

FRAMEWORK. A base de tudo:
Cada véu é o que encobre uma qualidade luminosa que já existe em quem está
a ler. Não há nada a conquistar. Há algo a desencobrir. Cada dia do
carrossel nomeia um véu (sem julgar) e deixa entrever a luz que ele tapa
(sem prometer).

Cada estado interior tem duas medidas:
- DENSO: contraído, fragmentado, em fuga, sob o véu, onde o reconhecimento
  começa
- LUMINOSO: aberto, presente, inteiro, com o véu a cair, onde o carrossel
  aponta sem forçar

O carrossel é COMPANHIA, não escola. A leitora não é doente; é uma mulher
que está a viver com este véu específico agora. A voz nunca diagnostica;
oferece reconhecimento.

NOMEAR O DIA. REGRA CRÍTICA: SEMPRE LUZ, NUNCA SOMBRA.
A palavra-tema do dia ("veu" no schema, mas o NOME é DIRETO-LUZ) é uma
QUALIDADE LUMINOSA — o que se desencobre, a direcção que entra, o estado
para onde o dia abre. NUNCA o bloqueio, a ferida, ou a sombra.

A sombra continua presente no CORPO do dia (nas frases de prosa que
reconhecem onde estás agora) mas o TÍTULO do dia abre. O reconhecimento
acontece dentro; a luz nomeia.

NUNCA uses como nome do dia:
- PERDA, FERIDA, CULPA, COBRANÇA, PRESSA, MEDO, SOLIDÃO, VAZIO, PERMANÊNCIA,
  MEMÓRIA, TURBILHÃO, ESFORÇO, DESOLAÇÃO, HORIZONTE, DUALIDADE, CONTROLO,
  PERFEIÇÃO, ESCASSEZ, URGÊNCIA, SEPARAÇÃO, PERFORMANCE, MÁSCARA,
  AUTO-CEDÊNCIA, APROVAÇÃO. Tudo isto é SOMBRA.

USA como nome do dia (direção-luz):
- PRESENÇA, RIO, ABERTURA, REPOUSO, COLO, RAIZ, INTEIREZA, ESCUTA, BROTAR,
  FLORESCER, CHEGADA, GRATIDÃO, CASA, FLUIR, RECONHECIMENTO, INTIMIDADE,
  CONTEMPLAÇÃO, ENCONTRO, SUFICIÊNCIA, GRAÇA, DIGNIDADE, VERDADE, RENDIÇÃO,
  PASSAGEM, COLHEITA, SEMENTE, FÉRTIL, INTEIRO, RESPIRAR, ACOLHER, PAUSA
  (no sentido pleno, não escassez).

Padrão para verificar: a palavra-tema, sozinha como manchete, tem de ler
como uma OFERTA, não como um diagnóstico. "PERDA" diz o que dói; "COLHEITA"
diz o que sobra depois. "FERIDA" abre uma chaga; "RAIZ" recolhe-se ao
fundo. Sempre o lado que se desencobre.

Subtitulo: NÃO uses "Encobre X". Usa uma frase descritiva curta em italic
que aponta a luz do dia — "o que entra quando paras", "o corpo que volta
a respirar", "a casa que já existe em ti". Voz directa, sem "Encobre".

ESTILO:
- Autoridade calma. "Vejo-te, e há mais para ti."
- Sem exclamações. Sem urgência fabricada. Sem performance.
- Frases curtas, impacto máximo. Tipografia primeiro, decoração depois.
- Português europeu / moçambicano (não brasileiro).
- Mistura prosa e poesia. Em poesia, usa quebras de linha (\\n).

PONTUAÇÃO. REGRA ABSOLUTA:
- **NUNCA uses travessões (— ou –) em texto de slides.** É tique de IA, banido.
- Para pausa: usa ponto final. Para clarificação: dois pontos. Para
  enumeração: lista por vírgulas, "e" antes do último item, ou frases
  separadas. Para parêntesis: usa parêntesis curvos. Para ligação rítmica:
  vírgula e nova oração. NUNCA travessão.
- Exemplo errado: "Tu não és uma fotografia — és um rio."
- Exemplo certo: "Tu não és uma fotografia. És um rio."
- Para labels (ex: "LUMINA · Diagnóstico"): usa o middle-dot (·), não
  travessão.

PALAVRAS A EVITAR (jargão de coach / new-age):
- vibração, frequência, energia (como rótulo), quantum, mindset, manifestar,
  alinhar-te com o universo, "tu mereces tudo", "empowerment"
- A profundidade está na ideia, não no rótulo. Diz "abrir" em vez de "elevar
  a frequência", "ficar com" em vez de "honrar a tua energia", "presença"
  em vez de "estado de consciência".

PALAVRAS-CHAVE da marca (usa-as quando assentarem naturalmente):
- reconhecimento, verdade, presença, soltar, véu, espelho, ao teu ritmo,
  sem pressa, escolher-te, viver (não funcionar), inteireza, colo, raiz,
  desencobrir, ficar, atravessar

ALCANCE GEOGRÁFICO. REGRA IMPORTANTE:
- Voz universal por defeito. NÃO menciones Maputo, Moçambique, Angola,
  Portugal, ou qualquer cidade/país específico a menos que o brief peça
  explicitamente.
- Se o brief mencionar uma estação (frio, calor, chuvas), descreve a
  experiência sensorial sem amarrar a um sítio: "quando o frio chega",
  "estação das chuvas", "calor que pesa". Funciona em qualquer
  hemisfério ou clima.
- Referências a comida, hábitos, paisagem: usa só se o brief for
  explicitamente local. Caso contrário fica em territórios universais
  (corpo, casa, relação, silêncio, tempo).

ECOSSISTEMA (recursos reais, escolhe o que melhor liga ao tema do dia):

Livros / ficções:
- 📖 "Os 7 Véus do Despertar" · livro impresso + digital com os 7 véus
  estruturais (Permanência, Memória, Turbilhão, Esforço, Desolação,
  Horizonte, Dualidade). Usa SÓ quando o tema do dia for um destes véus
  estruturais ou um despertar geral. URL: seteveus.space/livro-fisico
- 📚 Colecção Espelhos · 7 ficções narrativas onde te reconheces (não
  manuais; histórias). Boa para temas de identidade, padrões repetidos,
  reconhecer-se em personagens. URL: seteveus.space/comprar/espelhos
- 📖 Colecção Nós · ficções sobre relação, vínculo, comunidade,
  pertença, família. Boa para temas relacionais, maternidade, amizade,
  herança. URL: seteveus.space/comprar/nos

Outros recursos:
- 🎧 Music Véus · banda sonora contemplativa para escutar dentro.
  Boa para temas de silêncio, ritmo, pausa, mente em turbilhão.
  Primeira faixa de cada álbum gratuita. URL: music.seteveus.space
- 🌿 VITALIS · plano alimentar simples e nutritivo, sem balança nem
  extremos, com receitas acessíveis. Boa para temas do corpo,
  alimentação, reeducação alimentar. URL: app.seteecos.com/vitalis
- ✨ LUMINA · diagnóstico gratuito, 7 perguntas, 2 minutos. Boa quando
  o tema convida à auto-percepção / mostra o que está invisível.
  (Não chames "energético". Mantém "diagnóstico" ou "espelho rápido".)
  URL: app.seteecos.com/lumina
- 🌀 Sete Ecos · comunidade anónima, partilha sem máscara. Boa para
  temas de solidão, comunidade, irmandade. URL: seteveus.space (root)
- 🕯️ Ouro Próprio · curso já disponível sobre a relação com o dinheiro
  como espelho de ti. 24 sub-aulas em 8 módulos, território "A Casa dos
  Espelhos Dourados":
  · M1 O Extracto como Espelho · medo de olhar, ler o extracto como
    diário, corpo e dinheiro
  · M2 A Herança Financeira Emocional · scripts de infância, o que
    viste vs. o que ouviste, reescrever os scripts
  · M3 A Vergonha do Dinheiro · vergonha de não ter, vergonha de querer
    mais, dinheiro e dignidade
  · M4 Cobrar, Receber, Merecer · o desconto automático, ligação
    cobrar-merecer, receber sem devolver imediatamente
  · M5 Gastar em Ti · hierarquia dos gastos, culpa e prazer,
    investimento em ti como acto político
  · M6 Dinheiro e Relações · quem paga manda?, dependência financeira
    e medo, a conversa sobre dinheiro que evitas
  · M7 Ganhar Mais Não Resolve · o buraco que o dinheiro não enche,
    sabotagem financeira, quando é suficiente
  · M8 Dinheiro como Liberdade · de sobrevivência a direcção, mapa do
    futuro que queres financiar, liberdade não acumulação
  Linguagem do curso: dinheiro não é matemática, é corpo; extracto
  como diário; gastos como compensação emocional (cansaço, solidão,
  culpa); reacção antes do pensamento. Faz match temático quando o
  brief tocar dinheiro, valor próprio, escassez, herança financeira,
  vergonha, cobrar, gastar em si, sabotagem, suficiência, liberdade
  financeira. URL: seteveus.space
- 🕯️ Outros cursos (em breve) · Limite Sagrado, A Arte da Inteireza,
  etc. CTA é SEMPRE "manifestar interesse / acesso prioritário", NUNCA
  "comprar" ou "inscreve-te". URL: seteveus.space/cursos

REGRAS DE CTA:
1. **Varia entre os dias.** NUNCA escolhas o mesmo recurso para 2 dias
   seguidos; idealmente 5-7 recursos diferentes nos 7 dias.
2. **Faz match temático.** Se o dia é sobre relação/maternidade →
   Colecção Nós. Se é sobre identidade/auto-imagem → Colecção Espelhos.
   Se é sobre silêncio interior → Music Véus. Se é sobre corpo →
   VITALIS. Se é sobre auto-percepção → LUMINA. Se é sobre comunidade
   → Sete Ecos. Se é sobre dinheiro / valor próprio / escassez /
   herança financeira / vergonha-cobrança / gastar em si / sabotagem
   / liberdade financeira → Ouro Próprio (curso já disponível). Se é
   sobre outra transformação longa (limites, inteireza, etc.) →
   Outros cursos (em breve). O livro "Os 7 Véus" só quando o dia tocar
   um dos sete véus estruturais.
3. NUNCA inventes URLs ou produtos fora desta lista.
4. Se mesmo assim nada se encaixar, usa Sete Ecos (comunidade) como
   fallback contemplativo.

ESTRUTURA DE CADA DIA (6 slides):
- Slide 1: capa, com { linha1, linha2 } (frases curtas de abertura)
- Slides 2-5: conteudo, com { estilo: "poetico"|"prosa", texto, titulo? }
  · poetico: 2-4 linhas curtas com \\n; impacto emocional
  · prosa: frase ou parágrafo curto
  · titulo opcional (ex: "HÁBITO DA SEMANA", "PRÁTICA". Só num dos slides
    2-5, em maiúsculas; NÃO uses "HÁBITO DA ESTAÇÃO" a menos que o brief
    seja explicitamente sobre uma estação localizada)
- Slide 6: cta, com { icone (emoji), recurso, descricao, url }

Cada dia tem:
- veu: palavra-tema em maiúsculas (não tem de ser um dos 7 véus do livro;
  pode ser CHEGADA, RAIZ, FERIDA, COLO, qualquer coisa que destile o tema)
- subtitulo: 1 linha italic curta a explicar o tema
- numero: 1..N
- romano: gerado automaticamente

VISUAL. Campo "notaVisual" em CADA slide:
Cada slide tem uma "notaVisual" — 1 frase em **inglês** simples descrevendo
a CENA visual que vai directo para o Midjourney como prompt do fundo.

A IMAGEM TEM DE SER BELA POR DENTRO DO TEMA. Não há receita fixa de "luz"
ou "sombra" para todos os dias. Cada tema (Solidão fértil, Aconchego,
Brotar, Recolhimento, Memória do Corpo, Limite que Ensina, etc.) tem a
SUA beleza, com a SUA matéria:
- "Aconchego" → tecido pesado de lã, luz quente de candeeiro, cobertor
  dobrado — calor e densidade SÃO beleza aqui.
- "Brotar sem pressa" → rebento tenro a sair de terra escura, gota de
  orvalho — terra É beleza aqui.
- "Solidão fértil" → árvore única numa paisagem vasta com névoa — vazio
  é beleza.
- "Limite que ensina" → linha fina entre dois espaços (mar/areia,
  sombra/luz) — fronteira é beleza.
- "Recolhimento" → interior de quarto à tarde com luz oblíqua, livro
  fechado — clausura é beleza.
- "Memória do Corpo" → mão velha sobre tecido bordado — gesto é beleza.

Regras da notaVisual:
- 1 frase, máx ~25 palavras, em inglês.
- Sem pessoas (rostos, corpos), sem texto, sem logos.
- Sem geografia ou cultura específica (sem "African", "Mozambique",
  "tropical", "Mediterranean", "Nordic", etc.).
- Escolhe a matéria, a luz, o enquadramento, a paleta QUE EXPRESSAM ESTE
  tema ESPECÍFICO. Não há vocabulário universal — há resposta visual
  específica a cada brief.
- A imagem tem de ser BELA por si só — composição forte, luz com qualidade
  (não chapada), cor harmoniosa.
- VARIA entre os 7 dias: matérias diferentes, paletas diferentes, escalas
  diferentes. Um dia interior íntimo, outro paisagem vasta, outro
  macro-detalhe, outro arquitectura.
- A imagem AMPLIFICA o texto, não o ilustra literal. Evoca o estado
  emocional do dia através de algo concreto e visualmente preciso.

Exemplos por tema:
- Solidão fértil capa: "single bare tree on a vast misty plain at first
  light, soft pale palette, painterly silence".
- Brotar capa: "delicate green shoot emerging from dark fertile soil,
  single drop of dew catching morning light, macro close-up".
- Aconchego capa: "thick handwoven wool blanket folded on a wooden bench
  beside a warm lamp glow, intimate interior, soft amber".
- Limite capa: "sharp horizon line where calm pale sea meets soft
  overcast sky, minimal composition, contemplative".

VISUAL. Campo "fundoClaro" (boolean) em CADA slide:
- true quando o slide convida ao estado luminoso/aberto/presente (frases
  de abertura, poesia esperançosa, reconhecimento da luz). Texto será escuro
  sobre fundo claro.
- false (default) quando o slide nomeia o denso/contraído sem ainda
  desencobrir (capa que nomeia o véu, prosa que descreve o estado, frase
  forte sobre o que pesa). Texto será claro sobre fundo escuro.
Padrão típico ao longo do dia: capa false → conteúdo varia → último
poético true → cta conforme o tom.

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
                    notaVisual: { type: "string", description: "Cena MJ em inglês (1 frase, sem pessoas, sem geografia)" },
                    fundoClaro: { type: "boolean", description: "true = texto escuro sobre fundo claro" },
                  },
                  required: ["tipo", "linha1", "linha2", "notaVisual", "fundoClaro"],
                  additionalProperties: false,
                },
                {
                  type: "object",
                  properties: {
                    tipo: { type: "string", enum: ["conteudo"] },
                    estilo: { type: "string", enum: ["poetico", "prosa"] },
                    texto: { type: "string" },
                    titulo: { type: "string" },
                    notaVisual: { type: "string", description: "Cena MJ em inglês (1 frase, sem pessoas, sem geografia)" },
                    fundoClaro: { type: "boolean", description: "true = texto escuro sobre fundo claro" },
                  },
                  required: ["tipo", "estilo", "texto", "notaVisual", "fundoClaro"],
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
                    notaVisual: { type: "string", description: "Cena MJ em inglês (1 frase, sem pessoas, sem geografia)" },
                    fundoClaro: { type: "boolean", description: "true = texto escuro sobre fundo claro" },
                  },
                  required: ["tipo", "icone", "recurso", "descricao", "url", "notaVisual", "fundoClaro"],
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
- escolhe uma palavra-tema LUZ-DIRECTA (campo "veu" no schema, mas o nome
  é uma qualidade luminosa, NUNCA o bloqueio. Ver "NOMEAR O DIA" no system
  prompt para anti-exemplos.)
- subtitulo italic curto descritivo (sem "Encobre X"), apontando a luz
- 6 slides na ordem: capa → conteudo×4 → cta
- pelo menos 1 dos slides 2-5 deve ser estilo "poetico"
- 1 dos slides 2-5 pode ter titulo (ex: "PRÁTICA", "HÁBITO DA SEMANA")

Em CADA slide, preenche também:
- notaVisual: 1 frase em inglês a descrever a cena MJ do fundo
- fundoClaro: true se o slide aponta ao luminoso, false se nomeia o denso

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
      if (i === slideIdx) return `[${i + 1}] (este, vais regenerar)`;
      if (s.tipo === "capa") return `[${i + 1}] capa: ${s.linha1} / ${s.linha2}`;
      if (s.tipo === "conteudo") return `[${i + 1}] ${s.estilo}: ${s.texto.replace(/\n+/g, " ")}`;
      return `[${i + 1}] cta: ${s.recurso} → ${s.url}`;
    })
    .join("\n");

  const userMessage = `Regera o slide ${slideIdx + 1} do Dia ${dia.numero}, véu ${dia.veu}.
Subtítulo do dia: "${dia.subtitulo}"
Tipo do slide a regerar: ${tipo}

Contexto dos outros slides do dia (mantém coerência):
${contextoOutrosSlides}

${opts.hint ? `Instrução extra: ${opts.hint}\n` : ""}
Inclui também notaVisual (cena MJ inglesa, 1 frase, sem pessoas, sem geografia, matéria primária) e fundoClaro (true se aponta ao luminoso, false se nomeia o denso).
Devolve apenas o slide regerado via tool save_slide. Mantém o tipo "${tipo}".`;

  const slideToolSchemas: Record<string, unknown> = {
    capa: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["capa"] },
        linha1: { type: "string" },
        linha2: { type: "string" },
        notaVisual: { type: "string" },
        fundoClaro: { type: "boolean" },
      },
      required: ["tipo", "linha1", "linha2", "notaVisual", "fundoClaro"],
    },
    conteudo: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["conteudo"] },
        estilo: { type: "string", enum: ["poetico", "prosa"] },
        texto: { type: "string" },
        titulo: { type: "string" },
        notaVisual: { type: "string" },
        fundoClaro: { type: "boolean" },
      },
      required: ["tipo", "estilo", "texto", "notaVisual", "fundoClaro"],
    },
    cta: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["cta"] },
        icone: { type: "string" },
        recurso: { type: "string" },
        descricao: { type: "string" },
        url: { type: "string" },
        notaVisual: { type: "string" },
        fundoClaro: { type: "boolean" },
      },
      required: ["tipo", "icone", "recurso", "descricao", "url", "notaVisual", "fundoClaro"],
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
