/**
 * Template PDF para "cadernos preenchidos" — agrega todas as reflexoes
 * (pausas + caderno) que a aluna escreveu ao longo do curso num unico PDF
 * descarregavel a partir de /cursos/<slug>.
 *
 * Fonte dos dados: tabela escola_journal no Supabase.
 *   - sublesson_letter = "A" | "B" | "C"  → reflexoes rapidas por sub-aula
 *   - sublesson_letter = "workbook"       → caderno estruturado (JSON com
 *                                            reflections[3], table, freeText)
 *
 * Identidade visual e helpers copiados de manual-template.tsx.
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
import type { CourseData } from "@/types/course";

// ─── FONTS (clone do manual-template) ──────────────────────────────────────

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
  ],
});

Font.register({
  family: "SerifFallback",
  fonts: [
    { src: "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf", fontWeight: 400 },
    {
      src: "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
      fontWeight: 400,
      fontStyle: "italic",
    },
    { src: "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf", fontWeight: 600 },
  ],
});

const FONT_FAMILY = process.env.NODE_ENV === "production" ? "Cormorant" : "SerifFallback";

const C = {
  fundo: "#1A1A2E",
  creme: "#F5F0E6",
  cremeApagado: "#B0A898",
  superficie: "#2A2A4A",
  dourado: "#C9A96E",
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
    borderTopWidth: 0.5,
    borderTopColor: C.superficie,
    paddingTop: 8,
  },
  footerText: { fontSize: 7.5, color: C.cremeApagado, fontStyle: "italic" },
  coverTitle: {
    fontSize: 28,
    color: C.dourado,
    textAlign: "center",
    marginBottom: 6,
  },
  coverSub: {
    fontSize: 13,
    color: C.cremeApagado,
    textAlign: "center",
    marginBottom: 40,
  },
  coverName: {
    fontSize: 14,
    color: C.creme,
    textAlign: "center",
    fontStyle: "italic",
  },
  moduleTitle: {
    fontSize: 18,
    color: C.dourado,
    marginTop: 20,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 12,
    color: C.cremeApagado,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 6,
  },
  body: {
    fontSize: 11,
    color: C.creme,
    lineHeight: 1.6,
    marginBottom: 6,
  },
  prompt: {
    fontSize: 10,
    color: C.cremeApagado,
    fontStyle: "italic",
    marginTop: 8,
    marginBottom: 2,
  },
  empty: {
    fontSize: 10,
    color: C.cremeApagado,
    fontStyle: "italic",
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

export function CadernosPDF({
  course,
  studentName,
  entries,
}: {
  course: CourseData;
  studentName: string;
  entries: JournalRow[];
}) {
  const byModule = new Map<number, JournalRow[]>();
  for (const e of entries) {
    const arr = byModule.get(e.module_number) ?? [];
    arr.push(e);
    byModule.set(e.module_number, arr);
  }

  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={s.page}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={s.coverTitle}>{course.title}</Text>
          <Text style={s.coverSub}>{course.subtitle}</Text>
          <Text style={s.coverSub}>— Cadernos preenchidos —</Text>
          <Text style={s.coverName}>{studentName}</Text>
          <Text style={[s.empty, { textAlign: "center", marginTop: 20 }]}>
            {new Date().toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
          </Text>
        </View>
        <View style={s.footer}>
          <Text style={s.footerText}>{studentName}</Text>
          <Text style={s.footerText}>Escola dos Veus</Text>
        </View>
      </Page>

      {/* Um PDF por modulo (cada um num Page separado) */}
      {course.modules.map((mod) => {
        const rows = byModule.get(mod.number) ?? [];
        const subAulaRows = rows
          .filter((r) => r.sublesson_letter !== "workbook" && r.sublesson_letter !== "_")
          .sort((a, b) => a.sublesson_letter.localeCompare(b.sublesson_letter));
        const workbookRow = rows.find((r) => r.sublesson_letter === "workbook");
        let wb: WorkbookShape | null = null;
        if (workbookRow?.content) {
          try {
            wb = JSON.parse(workbookRow.content);
          } catch {
            wb = { freeText: workbookRow.content };
          }
        }

        const hasAny = subAulaRows.length > 0 || !!workbookRow;

        return (
          <Page key={mod.number} size="A4" style={s.page}>
            <Text style={s.moduleTitle}>
              Modulo {mod.number} — {mod.title}
            </Text>

            {!hasAny && <Text style={s.empty}>(Sem anotacoes guardadas neste modulo.)</Text>}

            {/* Sub-aulas */}
            {subAulaRows.map((row) => {
              const sub = mod.subLessons.find((sl) => sl.letter === row.sublesson_letter);
              return (
                <View key={row.sublesson_letter} wrap={false}>
                  <Text style={s.subTitle}>
                    Sub-aula {row.sublesson_letter} · {sub?.title ?? ""}
                  </Text>
                  <Text style={s.prompt}>O que te ficou desta sub-aula?</Text>
                  <Text style={s.body}>{row.content.trim() || "(vazio)"}</Text>
                </View>
              );
            })}

            {/* Caderno (workbook) */}
            {wb && (
              <>
                <Text style={s.subTitle}>Caderno — {mod.workbook ?? "exercicios"}</Text>

                {(wb.reflections ?? []).map((r, i) =>
                  r && r.trim() ? (
                    <View key={i}>
                      <Text style={s.prompt}>Reflexao {i + 1}</Text>
                      <Text style={s.body}>{r}</Text>
                    </View>
                  ) : null,
                )}

                {wb.table &&
                  Object.entries(wb.table).some(([, v]) => v && (v as string).trim()) && (
                    <View>
                      <Text style={s.prompt}>Notei · Senti · Quero lembrar</Text>
                      {wb.table.noticed?.trim() && (
                        <Text style={s.body}>· Notei: {wb.table.noticed}</Text>
                      )}
                      {wb.table.felt?.trim() && (
                        <Text style={s.body}>· Senti: {wb.table.felt}</Text>
                      )}
                      {wb.table.remember?.trim() && (
                        <Text style={s.body}>· Quero lembrar: {wb.table.remember}</Text>
                      )}
                    </View>
                  )}

                {wb.freeText && wb.freeText.trim() && (
                  <View>
                    <Text style={s.prompt}>Texto livre</Text>
                    <Text style={s.body}>{wb.freeText}</Text>
                  </View>
                )}
              </>
            )}

            <View style={s.footer}>
              <Text style={s.footerText}>{studentName}</Text>
              <Text style={s.footerText}>Escola dos Veus</Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}
