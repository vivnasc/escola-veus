/**
 * Registo da Cormorant Garamond para os templates @react-pdf.
 *
 * Os TTFs vivem em `escola-veus-app/assets/fonts/cormorant/` e sao incluidos
 * nos bundles serverless pelo `outputFileTracingIncludes` em `next.config.ts`
 * (chaves: /api/courses/manual, /api/courses/certificate, /api/courses/cadernos).
 *
 * Carrego em ESM-safe: process.cwd() = root da app no serverless (= raiz do
 * projecto Next durante `next build`).
 */

import path from "node:path";
import { Font } from "@react-pdf/renderer";

const FONT_DIR = path.join(
  process.cwd(),
  "assets",
  "fonts",
  "cormorant",
);

let registered = false;

export function ensureCormorantRegistered(): void {
  if (registered) return;
  registered = true;

  Font.register({
    family: "Cormorant",
    fonts: [
      {
        src: path.join(FONT_DIR, "CormorantGaramond-Regular.ttf"),
        fontWeight: 400,
      },
      {
        src: path.join(FONT_DIR, "CormorantGaramond-Italic.ttf"),
        fontWeight: 400,
        fontStyle: "italic",
      },
      {
        src: path.join(FONT_DIR, "CormorantGaramond-SemiBold.ttf"),
        fontWeight: 600,
      },
      {
        src: path.join(FONT_DIR, "CormorantGaramond-SemiBoldItalic.ttf"),
        fontWeight: 600,
        fontStyle: "italic",
      },
      {
        src: path.join(FONT_DIR, "CormorantGaramond-Bold.ttf"),
        fontWeight: 700,
      },
      {
        src: path.join(FONT_DIR, "CormorantGaramond-BoldItalic.ttf"),
        fontWeight: 700,
        fontStyle: "italic",
      },
    ],
  });
}

export const CORMORANT_FAMILY = "Cormorant";
