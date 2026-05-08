/**
 * Template PDF dos cadernos preenchidos — Escola dos Véus.
 *
 * Modelo misto:
 *   1. Capa com nome da aluna e data
 *   2. Para cada módulo:
 *      - Título do módulo
 *      - Para cada pergunta de reflexão do manual:
 *          · Se houver resposta no journal → mostra a resposta
 *          · Se não houver → linhas em branco para escrever à mão
 *      - Outras anotações deste módulo (sub-aula notes + freeText) se existirem
 *   3. Encerramento
 *
 * Fonte de dados:
 *   - manual: ManualContent (perguntas de reflexão por capítulo)
 *   - entries: rows do escola_journal filtrados por (user, course)
 *
 * Heurística de mapeamento pergunta ↔ resposta:
 *   - workbook.reflections[i] → reflectionQuestions[i] do mesmo módulo
 *     (a app guarda 3-4 reflexões estruturadas em escola_journal)
 *   - sub-aula notes (A/B/C) e freeText vão para "Outras anotações"
 */

import * as React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { CourseData } from "@/types/course";
import type { ManualContent, ManualChapter } from "@/data/course-manuals";
import { CORMORANT_FAMILY } from "./fonts";

const FONT_FAMILY = CORMORANT_FAMILY;

const C = {
  fundo: "#1A1A2E",
  creme: "#F5F0E6",
  cremeSuave: "#E8E0D0",
  cremeApagado: "#B0A898",
  superficie: "#2A2A4A",
  dourado: "#C9A96E",
  terracota: "#C4745A",
} as const;

const s = StyleSheet.create({
  page: {
    backgroundColor: C.fundo,
    paddingTop: 60,
    paddingBottom: 70,
    paddingHorizontal: 50,
    fontFamily: FONT_FAMILY,
    color: C.creme,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: C.superficie,
    paddingTop: 8,
  },
  footerLicense: { fontSize: 7.5, color: C.cremeApagado, fontStyle: "italic" },
  footerPage: { fontSize: 7.5, color: C.cremeApagado },

  // Cover
  coverPage: {
    backgroundColor: C.fundo,
    paddingHorizontal: 50,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  coverSchool: {
    fontSize: 10,
    color: C.cremeApagado,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  coverLine: {
    width: 60,
    height: 1,
    backgroundColor: C.dourado,
    marginVertical: 30,
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: C.dourado,
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  coverSub: {
    fontSize: 13,
    color: C.cremeApagado,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 40,
  },
  coverLabel: {
    fontSize: 11,
    color: C.cremeApagado,
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 18,
  },
  coverKind: {
    fontSize: 18,
    color: C.creme,
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 6,
  },
  coverOwnerLabel: {
    fontSize: 9,
    color: C.cremeApagado,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 50,
    marginBottom: 6,
  },
  coverOwnerName: {
    fontSize: 14,
    color: C.creme,
    fontStyle: "italic",
    textAlign: "center",
  },
  coverDate: {
    fontSize: 9,
    color: C.cremeApagado,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 6,
  },

  // Module pages
  moduleNumber: {
    fontSize: 11,
    color: C.terracota,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  moduleTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: C.dourado,
    marginBottom: 22,
  },
  question: {
    fontSize: 11,
    color: C.cremeSuave,
    fontStyle: "italic",
    lineHeight: 1.6,
    marginTop: 18,
    marginBottom: 8,
  },
  questionBullet: {
    color: C.dourado,
  },
  answer: {
    fontSize: 11,
    color: C.creme,
    lineHeight: 1.7,
    marginBottom: 4,
    paddingLeft: 12,
    paddingTop: 4,
    paddingBottom: 4,
    borderLeftWidth: 1,
    borderLeftColor: C.dourado,
  },
  answerEmpty: {
    fontSize: 9,
    color: C.cremeApagado,
    fontStyle: "italic",
    marginBottom: 4,
    paddingLeft: 12,
  },
  writingLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.superficie,
    height: 22,
    marginBottom: 0,
  },

  // Outras anotações
  otherTitle: {
    fontSize: 11,
    color: C.terracota,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 30,
    marginBottom: 10,
  },
  otherSubLabel: {
    fontSize: 9,
    color: C.cremeApagado,
    fontStyle: "italic",
    marginTop: 10,
    marginBottom: 2,
  },
  otherBody: {
    fontSize: 10.5,
    color: C.cremeSuave,
    lineHeight: 1.6,
  },

  emptyModule: {
    fontSize: 10,
    color: C.cremeApagado,
    fontStyle: "italic",
    marginBottom: 12,
  },
});

type JournalRow = {
  module_number: number;
  sublesson_letter: string;
  content: string;
  updated_at: string;
};

type WorkbookShape = {
  reflections?: string[];
  table?: { noticed?: string; felt?: string; remember?: string };
  freeText?: string;
};

function Footer({ studentName }: { studentName: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerLicense}>
        Caderno de {studentName} — Uso pessoal e intransmissível
      </Text>
      <Text
        style={s.footerPage}
        render={({ pageNumber, totalPages }) =>
          `${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

function CoverPage({
  course,
  studentName,
}: {
  course: CourseData;
  studentName: string;
}) {
  const today = new Date().toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <Page size="A4" style={{ backgroundColor: C.fundo }}>
      <View style={s.coverPage}>
        <Text style={s.coverSchool}>Sete Véus</Text>
        <View style={s.coverLine} />
        <Text style={s.coverLabel}>Caderno do curso</Text>
        <Text style={s.coverTitle}>{course.title}</Text>
        <Text style={s.coverSub}>{course.subtitle}</Text>
        <Text style={s.coverKind}>As tuas reflexões</Text>
        <Text style={s.coverOwnerLabel}>Pertence a</Text>
        <Text style={s.coverOwnerName}>{studentName}</Text>
        <Text style={s.coverDate}>{today}</Text>
      </View>
    </Page>
  );
}

function trimOrNull(s?: string | null): string | null {
  if (!s) return null;
  const t = s.trim();
  return t.length > 0 ? t : null;
}

function parseWorkbook(content: string): WorkbookShape | null {
  try {
    const v = JSON.parse(content) as WorkbookShape;
    if (typeof v !== "object" || v === null) return null;
    return v;
  } catch {
    // Conteúdo legado ou texto livre
    return { freeText: content };
  }
}

function ModulePage({
  course,
  module,
  chapter,
  rows,
  studentName,
}: {
  course: CourseData;
  module: CourseData["modules"][number];
  chapter: ManualChapter | null;
  rows: JournalRow[];
  studentName: string;
}) {
  // Linhas em branco quando uma pergunta não tem resposta
  const blankLinesPerQuestion = 4;

  // Separar workbook (estruturado) de sub-aula notes
  const workbookRow = rows.find((r) => r.sublesson_letter === "workbook");
  const wb: WorkbookShape | null = workbookRow?.content
    ? parseWorkbook(workbookRow.content)
    : null;
  const subAulaRows = rows
    .filter((r) => r.sublesson_letter !== "workbook" && r.sublesson_letter !== "_")
    .sort((a, b) => a.sublesson_letter.localeCompare(b.sublesson_letter));

  const reflections = (wb?.reflections ?? []).map((x) => trimOrNull(x ?? null));
  const tableNoticed = trimOrNull(wb?.table?.noticed);
  const tableFelt = trimOrNull(wb?.table?.felt);
  const tableRemember = trimOrNull(wb?.table?.remember);
  const freeText = trimOrNull(wb?.freeText);

  // Anotações extras (não cobertas pelo mapeamento pergunta ↔ resposta)
  const subAulaNotes = subAulaRows
    .map((r) => ({
      letter: r.sublesson_letter,
      title: module.subLessons.find((sl) => sl.letter === r.sublesson_letter)?.title,
      content: trimOrNull(r.content),
    }))
    .filter((n) => n.content);
  const hasTable = tableNoticed || tableFelt || tableRemember;
  const hasOthers = subAulaNotes.length > 0 || hasTable || freeText;

  // Para cada pergunta do manual: ver se há resposta correspondente
  const questions = chapter?.reflectionQuestions ?? [];
  const hasAnyAnswer =
    reflections.some((r) => !!r) || hasOthers || !!freeText;

  return (
    <Page size="A4" style={s.page} wrap>
      <Text style={s.moduleNumber}>Módulo {module.number}</Text>
      <Text style={s.moduleTitle}>{module.title}</Text>

      {!chapter && (
        <Text style={s.emptyModule}>
          (Este módulo ainda não tem perguntas de reflexão definidas.)
        </Text>
      )}

      {questions.map((q, i) => {
        const answer = reflections[i];
        return (
          <View key={i} wrap={false}>
            <Text style={s.question}>
              <Text style={s.questionBullet}>{i + 1}.   </Text>
              {q}
            </Text>
            {answer ? (
              <Text style={s.answer}>{answer}</Text>
            ) : (
              <>
                <Text style={s.answerEmpty}>(em branco — espaço para escreveres)</Text>
                {Array.from({ length: blankLinesPerQuestion }).map((_, j) => (
                  <View key={j} style={s.writingLine} />
                ))}
              </>
            )}
          </View>
        );
      })}

      {/* Outras anotações: notas por sub-aula + table + freeText */}
      {hasOthers && (
        <View>
          <Text style={s.otherTitle}>Outras anotações</Text>

          {subAulaNotes.map((n) => (
            <View key={n.letter} wrap={false}>
              <Text style={s.otherSubLabel}>
                Sub-aula {n.letter}
                {n.title ? ` · ${n.title}` : ""}
              </Text>
              <Text style={s.otherBody}>{n.content}</Text>
            </View>
          ))}

          {hasTable && (
            <View wrap={false}>
              <Text style={s.otherSubLabel}>Notei · Senti · Quero lembrar</Text>
              {tableNoticed && (
                <Text style={s.otherBody}>· Notei: {tableNoticed}</Text>
              )}
              {tableFelt && (
                <Text style={s.otherBody}>· Senti: {tableFelt}</Text>
              )}
              {tableRemember && (
                <Text style={s.otherBody}>· Quero lembrar: {tableRemember}</Text>
              )}
            </View>
          )}

          {freeText && (
            <View wrap={false}>
              <Text style={s.otherSubLabel}>Texto livre</Text>
              <Text style={s.otherBody}>{freeText}</Text>
            </View>
          )}
        </View>
      )}

      {!hasAnyAnswer && questions.length === 0 && (
        <Text style={s.emptyModule}>
          (Sem anotações guardadas neste módulo.)
        </Text>
      )}

      <Footer studentName={studentName} />
    </Page>
  );
}

function ClosingPage({ studentName }: { studentName: string }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            fontSize: 10,
            color: C.cremeApagado,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Sete Véus
        </Text>
        <View
          style={{
            width: 40,
            height: 1,
            backgroundColor: C.dourado,
            marginVertical: 20,
          }}
        />
        <Text
          style={{
            fontSize: 13,
            color: C.creme,
            fontStyle: "italic",
            textAlign: "center",
            paddingHorizontal: 40,
            lineHeight: 1.6,
          }}
        >
          O que escreveste aqui é teu.{"\n"}
          Volta a estas páginas quando precisares.{"\n"}
          As tuas respostas vão mudar com o tempo — e isso é bom.
        </Text>
      </View>
      <Footer studentName={studentName} />
    </Page>
  );
}

export function CadernosPDF({
  course,
  studentName,
  entries,
  manual,
}: {
  course: CourseData;
  studentName: string;
  entries: JournalRow[];
  manual: ManualContent | null;
}) {
  const byModule = new Map<number, JournalRow[]>();
  for (const e of entries) {
    const arr = byModule.get(e.module_number) ?? [];
    arr.push(e);
    byModule.set(e.module_number, arr);
  }

  return (
    <Document
      title={`${course.title} — Cadernos`}
      author="Sete Véus"
      subject={course.subtitle}
      creator="Escola dos Véus"
    >
      <CoverPage course={course} studentName={studentName} />
      {course.modules.map((mod) => {
        const rows = byModule.get(mod.number) ?? [];
        const chapter =
          manual?.chapters.find((c) => c.moduleNumber === mod.number) ?? null;
        return (
          <ModulePage
            key={mod.number}
            course={course}
            module={mod}
            chapter={chapter}
            rows={rows}
            studentName={studentName}
          />
        );
      })}
      <ClosingPage studentName={studentName} />
    </Document>
  );
}
