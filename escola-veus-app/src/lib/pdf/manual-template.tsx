/**
 * Template PDF para manuais de curso — Escola dos Véus
 *
 * Estrutura do PDF:
 *   1. Capa (com nome da aluna como proprietária)
 *   2. Antes de começares (intro + disclaimer)
 *   3. Mapa do curso
 *   4. Capítulos (livro-companheiro): texto expansivo, sem perguntas
 *   5. Folha de transição: "Caderno de Exercícios"
 *   6. Para cada capítulo: perguntas + linhas para escrever
 *   7. Encerramento
 *
 * Identidade visual:
 *   - Fundo: #1A1A2E (azul-marinho profundo)
 *   - Texto: #F5F0E6 (creme)
 *   - Acentos: #C9A96E (dourado), #C4745A (terracota), #8B5CF6 (violeta)
 *   - Tipografia: Cormorant Garamond
 *   - Rodapé: nome da aluna como licença
 */

import * as React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type {
  ManualContent,
  ManualChapter,
} from "@/data/course-manuals/ouro-proprio";
import { CORMORANT_FAMILY } from "./fonts";

const FONT_FAMILY = CORMORANT_FAMILY;

// ─── COLORS ────────────────────────────────────────────────────────────────

const C = {
  fundo: "#1A1A2E",
  fundoClaro: "#232340",
  superficie: "#2A2A4A",
  creme: "#F5F0E6",
  cremeSuave: "#E8E0D0",
  cremeApagado: "#B0A898",
  dourado: "#C9A96E",
  douradoQuente: "#D4A853",
  terracota: "#C4745A",
  violeta: "#8B5CF6",
} as const;

// ─── STYLES ────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    backgroundColor: C.fundo,
    paddingTop: 60,
    paddingBottom: 70,
    paddingHorizontal: 50,
    fontFamily: FONT_FAMILY,
    color: C.creme,
  },

  // Footer (every page)
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
  footerLicense: {
    fontSize: 7.5,
    color: C.cremeApagado,
    fontStyle: "italic",
  },
  footerPage: {
    fontSize: 7.5,
    color: C.cremeApagado,
  },

  // Cover
  coverPage: {
    backgroundColor: C.fundo,
    paddingHorizontal: 50,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  coverLine: {
    width: 60,
    height: 1,
    backgroundColor: C.dourado,
    marginBottom: 30,
  },
  coverTitle: {
    fontSize: 38,
    fontWeight: 700,
    color: C.dourado,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 12,
  },
  coverSubtitle: {
    fontSize: 16,
    color: C.cremeSuave,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 40,
  },
  coverTerritory: {
    fontSize: 11,
    color: C.cremeApagado,
    textAlign: "center",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  coverSchool: {
    fontSize: 10,
    color: C.cremeApagado,
    textAlign: "center",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  coverLineBottom: {
    width: 60,
    height: 1,
    backgroundColor: C.dourado,
    marginTop: 30,
  },
  coverOwnerLabel: {
    fontSize: 9,
    color: C.cremeApagado,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 60,
    marginBottom: 6,
  },
  coverOwnerName: {
    fontSize: 14,
    color: C.creme,
    fontStyle: "italic",
    textAlign: "center",
  },

  // Section titles
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: C.dourado,
    marginBottom: 20,
    letterSpacing: 1,
  },
  chapterNumber: {
    fontSize: 11,
    color: C.terracota,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  chapterTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: C.dourado,
    marginBottom: 8,
  },
  territoryNote: {
    fontSize: 9.5,
    color: C.cremeApagado,
    fontStyle: "italic",
    marginBottom: 20,
    paddingLeft: 2,
  },
  chapterSummary: {
    fontSize: 11,
    color: C.cremeSuave,
    fontStyle: "italic",
    lineHeight: 1.7,
    marginBottom: 22,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: C.dourado,
  },

  // Body text (book paragraphs)
  body: {
    fontSize: 11.5,
    color: C.creme,
    lineHeight: 1.75,
    marginBottom: 14,
    textAlign: "justify",
  },

  // Reflection questions (in workbook anexo)
  workbookChapterTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: C.dourado,
    marginBottom: 4,
  },
  questionItem: {
    fontSize: 11,
    color: C.cremeSuave,
    lineHeight: 1.6,
    marginTop: 18,
    marginBottom: 8,
    paddingLeft: 12,
  },
  questionBullet: {
    color: C.dourado,
  },
  writingLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.superficie,
    height: 24,
    marginBottom: 0,
  },

  // Divider
  divider: {
    width: 40,
    height: 1,
    backgroundColor: C.dourado,
    alignSelf: "center",
    marginVertical: 28,
  },

  // Course map
  mapModuleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    paddingLeft: 4,
  },
  mapCheckbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: C.dourado,
    borderRadius: 2,
    marginRight: 10,
    marginTop: 2,
  },
  mapModuleNumber: {
    fontSize: 9,
    color: C.terracota,
    letterSpacing: 1,
    marginBottom: 1,
  },
  mapModuleTitle: {
    fontSize: 12,
    color: C.creme,
    fontWeight: 600,
  },

  // Disclaimer
  disclaimer: {
    fontSize: 9.5,
    color: C.cremeApagado,
    lineHeight: 1.6,
    marginTop: 20,
    padding: 16,
    borderWidth: 0.5,
    borderColor: C.superficie,
    borderRadius: 4,
  },

  // Workbook divider page (entre livro e caderno)
  workbookDividerPage: {
    backgroundColor: C.fundo,
    paddingHorizontal: 50,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  workbookDividerLabel: {
    fontSize: 10,
    color: C.cremeApagado,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  workbookDividerTitle: {
    fontSize: 32,
    fontWeight: 700,
    color: C.dourado,
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  workbookDividerIntro: {
    fontSize: 12,
    color: C.cremeSuave,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 1.7,
    paddingHorizontal: 30,
  },
});

// ─── FOOTER COMPONENT ──────────────────────────────────────────────────────

function Footer({ studentName }: { studentName: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerLicense}>
        Licenciado a {studentName} — Uso pessoal e intransmissível
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

// ─── COVER PAGE ────────────────────────────────────────────────────────────

function CoverPage({
  manual,
  studentName,
}: {
  manual: ManualContent;
  studentName: string;
}) {
  return (
    <Page size="A4" style={{ backgroundColor: C.fundo }}>
      <View style={s.coverPage}>
        <Text style={s.coverSchool}>Sete Véus</Text>
        <View style={s.coverLine} />
        <Text style={s.coverTitle}>{manual.courseTitle}</Text>
        <Text style={s.coverSubtitle}>{manual.courseSubtitle}</Text>
        <Text style={s.coverTerritory}>{manual.territory}</Text>
        <View style={s.coverLineBottom} />
        <Text style={s.coverOwnerLabel}>Pertence a</Text>
        <Text style={s.coverOwnerName}>{studentName}</Text>
      </View>
    </Page>
  );
}

// ─── INTRO PAGE ────────────────────────────────────────────────────────────

function IntroPage({
  manual,
  studentName,
}: {
  manual: ManualContent;
  studentName: string;
}) {
  return (
    <Page size="A4" style={s.page}>
      <Text style={s.sectionTitle}>{manual.introTitle}</Text>
      <Text style={s.body}>{manual.introText}</Text>
      <View style={s.divider} />
      <Text style={s.disclaimer}>{manual.beforeYouStart}</Text>
      <Footer studentName={studentName} />
    </Page>
  );
}

// ─── COURSE MAP PAGE ───────────────────────────────────────────────────────

function CourseMapPage({
  manual,
  studentName,
}: {
  manual: ManualContent;
  studentName: string;
}) {
  return (
    <Page size="A4" style={s.page}>
      <Text style={s.sectionTitle}>Mapa do Curso</Text>
      <Text
        style={{
          ...s.body,
          fontSize: 10.5,
          fontStyle: "italic",
          marginBottom: 28,
        }}
      >
        Oito módulos. Oito formas de olhar para o dinheiro. Marca cada um à
        medida que avanças.
      </Text>
      {manual.chapters.map((ch) => (
        <View key={ch.moduleNumber} style={s.mapModuleRow}>
          <View style={s.mapCheckbox} />
          <View style={{ flex: 1 }}>
            <Text style={s.mapModuleNumber}>
              MÓDULO {ch.moduleNumber}
            </Text>
            <Text style={s.mapModuleTitle}>{ch.title}</Text>
          </View>
        </View>
      ))}
      <Footer studentName={studentName} />
    </Page>
  );
}

// ─── BOOK CHAPTER PAGES ────────────────────────────────────────────────────

function BookChapterPages({
  chapter,
  studentName,
}: {
  chapter: ManualChapter;
  studentName: string;
}) {
  return (
    <Page size="A4" style={s.page} wrap>
      <Text style={s.chapterNumber}>Módulo {chapter.moduleNumber}</Text>
      <Text style={s.chapterTitle}>{chapter.title}</Text>
      <Text style={s.territoryNote}>{chapter.territoryStage}</Text>

      {/* Resumo curto a abrir o capítulo */}
      <Text style={s.chapterSummary}>{chapter.summary}</Text>

      {/* Texto expansivo (parágrafo a parágrafo) */}
      {chapter.bookText.map((para, i) => (
        <Text key={i} style={s.body}>
          {para}
        </Text>
      ))}

      <Footer studentName={studentName} />
    </Page>
  );
}

// ─── WORKBOOK DIVIDER PAGE ─────────────────────────────────────────────────

function WorkbookDividerPage({ studentName }: { studentName: string }) {
  return (
    <Page size="A4" style={{ backgroundColor: C.fundo }}>
      <View style={s.workbookDividerPage}>
        <Text style={s.workbookDividerLabel}>Anexo</Text>
        <Text style={s.workbookDividerTitle}>Caderno de Exercícios</Text>
        <View style={s.coverLineBottom} />
        <Text style={[s.workbookDividerIntro, { marginTop: 30 }]}>
          As perguntas dos oito módulos, com espaço para escreveres à mão.{"\n"}
          Lê o capítulo primeiro. Depois volta aqui, sem pressa.
        </Text>
      </View>
      <Footer studentName={studentName} />
    </Page>
  );
}

// ─── WORKBOOK CHAPTER PAGES ────────────────────────────────────────────────

function WorkbookChapterPages({
  chapter,
  studentName,
}: {
  chapter: ManualChapter;
  studentName: string;
}) {
  // Linhas em branco a seguir a cada pergunta — mais próximas do que a aluna
  // efectivamente escreve à mão (4 linhas / pergunta).
  const linesPerQuestion = 4;

  return (
    <Page size="A4" style={s.page} wrap>
      <Text style={s.chapterNumber}>Módulo {chapter.moduleNumber}</Text>
      <Text style={s.workbookChapterTitle}>{chapter.title}</Text>
      <Text style={s.territoryNote}>Perguntas de reflexão</Text>

      {chapter.reflectionQuestions.map((q, i) => (
        <View key={i} wrap={false}>
          <Text style={s.questionItem}>
            <Text style={s.questionBullet}>{i + 1}.   </Text>
            {q}
          </Text>
          {Array.from({ length: linesPerQuestion }).map((_, j) => (
            <View key={j} style={s.writingLine} />
          ))}
        </View>
      ))}

      <Footer studentName={studentName} />
    </Page>
  );
}

// ─── CLOSING PAGE ──────────────────────────────────────────────────────────

function ClosingPage({
  manual,
  studentName,
}: {
  manual: ManualContent;
  studentName: string;
}) {
  return (
    <Page size="A4" style={s.page}>
      <Text style={s.sectionTitle}>{manual.closingTitle}</Text>
      <Text style={s.body}>{manual.closingText}</Text>
      <View style={s.divider} />
      <Text style={{ ...s.body, fontStyle: "italic" }}>
        {manual.closingInvite}
      </Text>
      <View style={s.divider} />
      <View style={{ alignItems: "center", marginTop: 40 }}>
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
        <Text
          style={{
            fontSize: 9,
            color: C.cremeApagado,
            fontStyle: "italic",
            marginTop: 6,
          }}
        >
          Vê o que estava invisível.
        </Text>
        <Text
          style={{
            fontSize: 8,
            color: C.cremeApagado,
            marginTop: 12,
          }}
        >
          escola.seteveus.space
        </Text>
      </View>
      <Footer studentName={studentName} />
    </Page>
  );
}

// ─── MAIN DOCUMENT ─────────────────────────────────────────────────────────

export function ManualPDF({
  manual,
  studentName,
}: {
  manual: ManualContent;
  studentName: string;
}) {
  return (
    <Document
      title={`${manual.courseTitle} — Manual`}
      author="Sete Véus"
      subject={manual.courseSubtitle}
      creator="Escola dos Véus"
    >
      <CoverPage manual={manual} studentName={studentName} />
      <IntroPage manual={manual} studentName={studentName} />
      <CourseMapPage manual={manual} studentName={studentName} />

      {/* Livro-companheiro: 8 capítulos com texto expansivo */}
      {manual.chapters.map((chapter) => (
        <BookChapterPages
          key={`book-${chapter.moduleNumber}`}
          chapter={chapter}
          studentName={studentName}
        />
      ))}

      {/* Anexo destacável */}
      <WorkbookDividerPage studentName={studentName} />
      {manual.chapters.map((chapter) => (
        <WorkbookChapterPages
          key={`workbook-${chapter.moduleNumber}`}
          chapter={chapter}
          studentName={studentName}
        />
      ))}

      <ClosingPage manual={manual} studentName={studentName} />
    </Document>
  );
}
