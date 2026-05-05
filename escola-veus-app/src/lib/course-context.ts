/**
 * Monta o contexto de um modulo de curso para injectar como
 * system prompt na API Claude: 3 scripts + capitulo do manual +
 * caderno do modulo + guidelines de tom.
 *
 * O resultado e cacheavel (ephemeral 1h) porque so depende de
 * (courseSlug, moduleNumber) — dados estaticos no repo.
 */

import { OURO_PROPRIO_SCRIPTS, type LessonScript } from "@/data/course-scripts/ouro-proprio";
import { OURO_PROPRIO_MANUAL, type ManualChapter } from "@/data/course-manuals/ouro-proprio";
import { OURO_PROPRIO_WORKBOOKS, type WorkbookExercise } from "@/data/course-workbooks/ouro-proprio";
import { TONE_GUIDELINES } from "@/data/course-guidelines";
import { getCourseBySlug } from "@/data/courses";

type CourseContext = {
  courseTitle: string;
  courseSubtitle: string;
  territory: string | null;
  moduleTitle: string;
  subLessons: LessonScript[];
  manualChapter: ManualChapter | null;
  workbook: WorkbookExercise | null;
};

function getCourseData(slug: string) {
  switch (slug) {
    case "ouro-proprio":
      return {
        scripts: OURO_PROPRIO_SCRIPTS,
        manual: OURO_PROPRIO_MANUAL,
        workbooks: OURO_PROPRIO_WORKBOOKS,
      };
    default:
      return null;
  }
}

export function buildCourseContext(
  courseSlug: string,
  moduleNumber: number,
): CourseContext | null {
  const data = getCourseData(courseSlug);
  if (!data) return null;

  const course = getCourseBySlug(courseSlug);
  if (!course) return null;

  const mod = course.modules.find((m) => m.number === moduleNumber);
  if (!mod) return null;

  const subLessons = Object.values(data.scripts).filter(
    (s) => s.moduleNumber === moduleNumber,
  );
  const manualChapter = data.manual.chapters.find((c) => c.moduleNumber === moduleNumber) ?? null;
  const workbook = data.workbooks.find((w) => w.moduleNumber === moduleNumber) ?? null;

  return {
    courseTitle: course.title,
    courseSubtitle: course.subtitle,
    territory: data.manual.territory ?? null,
    moduleTitle: mod.title,
    subLessons,
    manualChapter,
    workbook,
  };
}

export type SystemPromptExtras = {
  /**
   * Instrucoes extra (escritas pela Vivianne em /admin/producao/aulas tab
   * Q&A) anexadas ao fim do system prompt. Permite afinar tom sem deploy.
   */
  extraInstructions?: string;
};

export function renderSystemPrompt(
  ctx: CourseContext,
  extras?: SystemPromptExtras,
): string {
  const subLessonsBlock = ctx.subLessons
    .map((s) => {
      return `### Sub-aula ${s.subLetter} — ${s.title}

**Pergunta inicial:**
${s.perguntaInicial}

**Situação humana:**
${s.situacaoHumana}

**Revelação do padrão:**
${s.revelacaoPadrao}

**Gesto de consciência:**
${s.gestoConsciencia}

**Frase final:**
${s.fraseFinal}`;
    })
    .join("\n\n---\n\n");

  const manualBlock = ctx.manualChapter
    ? `## Manual do módulo — resumo

${ctx.manualChapter.summary}

**Perguntas de reflexão:**
${ctx.manualChapter.reflectionQuestions.map((q) => `- ${q}`).join("\n")}

**Território visual:** ${ctx.manualChapter.territoryStage}`
    : "";

  const workbookBlock = ctx.workbook
    ? `## Caderno de exercícios — ${ctx.workbook.title}

${ctx.workbook.intro}

**Exercício principal: ${ctx.workbook.mainExercise.title}**
${ctx.workbook.mainExercise.instructions.map((i, n) => `${n + 1}. ${i}`).join("\n")}

**Perguntas de reflexão do caderno:**
${ctx.workbook.reflectionQuestions.map((q) => `- ${q}`).join("\n")}

**Ponte para o próximo módulo:** ${ctx.workbook.bridge}`
    : "";

  const forbidden = TONE_GUIDELINES.voice.forbidden.map((f) => `- ${f}`).join("\n");
  const encouraged = TONE_GUIDELINES.voice.encouraged.map((f) => `- ${f}`).join("\n");

  const extraBlock = extras?.extraInstructions?.trim()
    ? `\n\n# Instruções adicionais (escritas pela Vivianne)\n\n${extras.extraInstructions.trim()}`
    : "";

  return `És a guia da Escola dos Véus a responder a perguntas sobre uma aula paga. Falas directamente com a aluna que fez o curso.

# Curso: ${ctx.courseTitle}
${ctx.courseSubtitle}
${ctx.territory ? `Território: ${ctx.territory}` : ""}

# Módulo actual: ${ctx.moduleTitle}

${subLessonsBlock}

${manualBlock}

${workbookBlock}

# Tom e estilo obrigatórios

**Quem és:** ${TONE_GUIDELINES.voice.who}
**Como falas:** ${TONE_GUIDELINES.voice.style}
**Pronome:** sempre "tu" (nunca "você").

**Língua:** PT-PT. Usa "objecto", "correcção", "actual", "facto" (não "objeto", "correção", "atual", "fato"). Conjuntivo depois de "talvez".

**Proibido:**
${forbidden}

**Encorajado:**
${encouraged}

# Regras de resposta

1. **Fica dentro do âmbito da aula.** Se a aluna pergunta algo coberto noutra sub-aula, noutro módulo ou noutro curso, diz suavemente que isso é tratado noutro sítio — sem pretenderes saber.
2. **Não substituis profissionais.** Se a pergunta toca em crise emocional, saúde mental, finanças concretas ou decisões jurídicas, nomeia o que te parece importante mas remete para profissional (psicólogo, advogado, contabilista).
3. **Não inventes conteúdo do curso.** Se ela perguntar sobre algo que não está no script/manual/caderno acima, diz que isso não está coberto neste módulo.
4. **Não repitas o vídeo.** Ela já o viu. Acrescenta — aprofunda um ponto, oferece outro ângulo, devolve-lhe uma pergunta.
5. **Respostas curtas por defeito.** 2-4 parágrafos curtos. Só vai mais longo se a pergunta genuinamente pedir.
6. **Convida a voltar ao corpo, ao caderno, a um gesto concreto.** Não deixes a pergunta só na cabeça.
7. **Usa o silêncio como ferramenta.** Uma pergunta devolvida pode ser melhor que uma resposta.${extraBlock}`;
}
