/**
 * Template PDF para certificado de conclusao de curso — Escola dos Veus
 *
 * Identidade visual coerente com manual-template:
 * - Fundo: #1A1A2E
 * - Texto creme + dourado #C9A96E + violeta #8B5CF6
 * - Tipografia Cormorant Garamond
 * - Formato A4 landscape (842x595 pt)
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
  ],
});

const FONT_FAMILY =
  process.env.NODE_ENV === "production" ? "Cormorant" : "SerifFallback";

const C = {
  fundo: "#1A1A2E",
  creme: "#F5F0E6",
  cremeApagado: "#B0A898",
  dourado: "#C9A96E",
  violeta: "#8B5CF6",
} as const;

const s = StyleSheet.create({
  page: {
    backgroundColor: C.fundo,
    fontFamily: FONT_FAMILY,
    color: C.creme,
    padding: 0,
  },
  // Outer ornamental border
  borderOuter: {
    position: "absolute",
    top: 25,
    left: 25,
    right: 25,
    bottom: 25,
    borderWidth: 1,
    borderColor: C.dourado,
    opacity: 0.4,
  },
  borderInner: {
    position: "absolute",
    top: 35,
    left: 35,
    right: 35,
    bottom: 35,
    borderWidth: 0.5,
    borderColor: C.dourado,
    opacity: 0.2,
  },
  content: {
    flex: 1,
    paddingTop: 70,
    paddingBottom: 50,
    paddingHorizontal: 70,
    alignItems: "center",
    textAlign: "center",
  },
  brand: {
    fontSize: 11,
    color: C.violeta,
    letterSpacing: 4,
    marginBottom: 4,
    opacity: 0.85,
  },
  divider: {
    width: 200,
    height: 0.5,
    backgroundColor: C.dourado,
    opacity: 0.5,
    marginVertical: 10,
  },
  label: {
    fontSize: 11,
    color: C.dourado,
    letterSpacing: 4,
    marginBottom: 6,
  },
  preName: {
    fontSize: 13,
    color: C.cremeApagado,
    marginTop: 28,
    fontStyle: "italic",
  },
  studentName: {
    fontSize: 32,
    color: C.creme,
    fontWeight: 600,
    marginTop: 14,
    marginBottom: 14,
  },
  preCourse: {
    fontSize: 13,
    color: C.cremeApagado,
    fontStyle: "italic",
    marginBottom: 14,
  },
  courseTitle: {
    fontSize: 30,
    color: C.dourado,
    fontWeight: 600,
    marginBottom: 8,
  },
  courseSubtitle: {
    fontSize: 13,
    color: C.violeta,
    opacity: 0.9,
    marginBottom: 30,
    fontStyle: "italic",
  },
  date: {
    fontSize: 12,
    color: C.cremeApagado,
    marginTop: 6,
  },
  // Signature block
  signatureBlock: {
    marginTop: "auto",
    alignItems: "center",
    width: "100%",
  },
  signatureLine: {
    width: 240,
    height: 0.5,
    backgroundColor: C.dourado,
    opacity: 0.4,
    marginBottom: 6,
  },
  signatureName: {
    fontSize: 10,
    color: C.cremeApagado,
  },
  // Footer
  footer: {
    marginTop: 14,
    alignItems: "center",
  },
  certCode: {
    fontSize: 9,
    color: C.cremeApagado,
    letterSpacing: 2,
  },
  verifyUrl: {
    fontSize: 8,
    color: C.cremeApagado,
    opacity: 0.65,
    marginTop: 3,
  },
});

export type CertificateProps = {
  studentName: string;
  courseTitle: string;
  courseSubtitle?: string;
  completedDate: string;
  certificateCode: string;
  verifyUrl: string;
};

export function CertificatePDF(props: CertificateProps) {
  const {
    studentName,
    courseTitle,
    courseSubtitle,
    completedDate,
    certificateCode,
    verifyUrl,
  } = props;

  return (
    <Document title={`Certificado — ${courseTitle}`}>
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.borderOuter} />
        <View style={s.borderInner} />

        <View style={s.content}>
          <Text style={s.brand}>SETE VEUS</Text>
          <View style={s.divider} />
          <Text style={s.label}>CERTIFICADO DE CONCLUSAO</Text>
          <View style={s.divider} />

          <Text style={s.preName}>Certifica-se que</Text>
          <Text style={s.studentName}>{studentName}</Text>
          <Text style={s.preCourse}>completou com sucesso o curso</Text>

          <Text style={s.courseTitle}>{courseTitle}</Text>
          {courseSubtitle && (
            <Text style={s.courseSubtitle}>{courseSubtitle}</Text>
          )}

          <Text style={s.date}>{completedDate}</Text>

          <View style={s.signatureBlock}>
            <View style={s.signatureLine} />
            <Text style={s.signatureName}>
              Vivianne dos Santos — Autora e Facilitadora
            </Text>

            <View style={s.footer}>
              <Text style={s.certCode}>Codigo: {certificateCode}</Text>
              <Text style={s.verifyUrl}>Verificar: {verifyUrl}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
