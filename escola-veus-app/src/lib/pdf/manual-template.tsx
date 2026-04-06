/**
 * Template PDF para manuais de curso — Escola dos Veus
 *
 * Identidade visual:
 * - Fundo: #1A1A2E (azul-marinho profundo)
 * - Texto: #F5F0E6 (creme)
 * - Acentos: #C9A96E (dourado), #C4745A (terracota)
 * - Tipografia: Cormorant Garamond (serifada)
 * - Rodape: nome da aluna como licenca
 */

import * as React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type {
  ManualContent,
  ManualChapter,
} from "@/data/course-manuals/ouro-proprio";

// ─── FONTS ─────────────────────────────────────────────────────────────────

// Cormorant Garamond via Google Fonts (production)
Font.register({
  family: "Cormorant",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/cormorantgaramond/v16/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/cormorantgaramond/v16/co3YmX5slCNuHLi8bLeY9MK7whWMhyjQEl5fsA.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "https://fonts.gstatic.com/s/cormorantgaramond/v16/co3WmX5slCNuHLi8bLeY9MK7whWMhyjYrEPjuw-NxBk.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/cormorantgaramond/v16/co3WmX5slCNuHLi8bLeY9MK7whWMhyjYrEPjuw-NxBk.ttf",
      fontWeight: 700,
    },
  ],
});

// Liberation Serif (local fallback — metrically equivalent to Times)
Font.register({
  family: "SerifFallback",
  fonts: [
    {
      src: "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    {
      src: "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
      fontWeight: 600,
    },
    {
      src: "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

// Use Cormorant in production, SerifFallback locally
const FONT_FAMILY =
  process.env.NODE_ENV === "production" ? "Cormorant" : "SerifFallback";

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
  // Page
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
    marginBottom: 24,
    paddingLeft: 2,
  },

  // Body text
  body: {
    fontSize: 11.5,
    color: C.creme,
    lineHeight: 1.7,
    marginBottom: 16,
    textAlign: "justify",
  },

  // Reflection questions
  questionsTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: C.terracota,
    marginTop: 20,
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  questionItem: {
    fontSize: 11,
    color: C.cremeSuave,
    lineHeight: 1.6,
    marginBottom: 8,
    paddingLeft: 12,
  },
  questionBullet: {
    color: C.dourado,
  },

  // Writing space
  writingTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: C.douradoQuente,
    marginTop: 28,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  writingLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.superficie,
    height: 28,
    marginBottom: 0,
  },

  // Divider
  divider: {
    width: 40,
    height: 1,
    backgroundColor: C.dourado,
    alignSelf: "center",
    marginVertical: 30,
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
  mapModuleDesc: {
    fontSize: 9.5,
    color: C.cremeApagado,
    fontStyle: "italic",
    marginTop: 2,
  },

  // Intro disclaimer
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
});

// ─── FOOTER COMPONENT ──────────────────────────────────────────────────────

function Footer({ studentName }: { studentName: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerLicense}>
        Licenciado para {studentName} — Uso pessoal e intransmissivel
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

// ─── COVER PAGE ─────────────────────────────────────────────────────────────

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
        <Text style={s.coverSchool}>Sete Veus</Text>
        <View style={s.coverLine} />
        <Text style={s.coverTitle}>{manual.courseTitle}</Text>
        <Text style={s.coverSubtitle}>{manual.courseSubtitle}</Text>
        <Text style={s.coverTerritory}>{manual.territory}</Text>
        <View style={s.coverLineBottom} />
        <Text
          style={{
            fontSize: 9,
            color: C.cremeApagado,
            marginTop: 40,
            fontStyle: "italic",
          }}
        >
          Manual de {studentName}
        </Text>
      </View>
    </Page>
  );
}

// ─── INTRO PAGE ─────────────────────────────────────────────────────────────

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

// ─── COURSE MAP PAGE ────────────────────────────────────────────────────────

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
        Oito modulos. Oito formas de olhar para o dinheiro. Marca cada um a
        medida que avanças.
      </Text>
      {manual.chapters.map((ch) => (
        <View key={ch.moduleNumber} style={s.mapModuleRow}>
          <View style={s.mapCheckbox} />
          <View style={{ flex: 1 }}>
            <Text style={s.mapModuleNumber}>
              MODULO {ch.moduleNumber}
            </Text>
            <Text style={s.mapModuleTitle}>{ch.title}</Text>
          </View>
        </View>
      ))}
      <Footer studentName={studentName} />
    </Page>
  );
}

// ─── CHAPTER PAGES ──────────────────────────────────────────────────────────

function ChapterPages({
  chapter,
  studentName,
}: {
  chapter: ManualChapter;
  studentName: string;
}) {
  const writingLines = 10;

  return (
    <Page size="A4" style={s.page} wrap>
      {/* Chapter header */}
      <Text style={s.chapterNumber}>
        Modulo {chapter.moduleNumber}
      </Text>
      <Text style={s.chapterTitle}>{chapter.title}</Text>
      <Text style={s.territoryNote}>{chapter.territoryStage}</Text>

      {/* Summary */}
      <Text style={s.body}>{chapter.summary}</Text>

      <View style={s.divider} />

      {/* Reflection questions */}
      <Text style={s.questionsTitle}>Perguntas de reflexao</Text>
      {chapter.reflectionQuestions.map((q, i) => (
        <Text key={i} style={s.questionItem}>
          <Text style={s.questionBullet}>~ </Text>
          {q}
        </Text>
      ))}

      {/* Writing space */}
      <Text style={s.writingTitle} break>
        As tuas palavras
      </Text>
      {Array.from({ length: writingLines }).map((_, i) => (
        <View key={i} style={s.writingLine} />
      ))}

      <Footer studentName={studentName} />
    </Page>
  );
}

// ─── CLOSING PAGE ───────────────────────────────────────────────────────────

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
          Sete Veus
        </Text>
        <Text
          style={{
            fontSize: 9,
            color: C.cremeApagado,
            fontStyle: "italic",
            marginTop: 6,
          }}
        >
          Ve o que estava invisivel.
        </Text>
        <Text
          style={{
            fontSize: 8,
            color: C.cremeApagado,
            marginTop: 12,
          }}
        >
          seteveus.space
        </Text>
      </View>
      <Footer studentName={studentName} />
    </Page>
  );
}

// ─── MAIN DOCUMENT ──────────────────────────────────────────────────────────

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
      author="Sete Veus"
      subject={manual.courseSubtitle}
      creator="Escola dos Veus"
    >
      <CoverPage manual={manual} studentName={studentName} />
      <IntroPage manual={manual} studentName={studentName} />
      <CourseMapPage manual={manual} studentName={studentName} />
      {manual.chapters.map((chapter) => (
        <ChapterPages
          key={chapter.moduleNumber}
          chapter={chapter}
          studentName={studentName}
        />
      ))}
      <ClosingPage manual={manual} studentName={studentName} />
    </Document>
  );
}
