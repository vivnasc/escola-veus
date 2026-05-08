/**
 * Registo da Cormorant Garamond para os templates @react-pdf.
 *
 * TTFs em `escola-veus-app/assets/fonts/cormorant/` — incluidos no bundle
 * serverless via `outputFileTracingIncludes` em `next.config.ts`.
 *
 * Carrego o ficheiro como Buffer (em vez de passar o path) para:
 *   1. detectar imediatamente se o TTF nao viajou (ENOENT claro)
 *   2. evitar qualquer ambiguidade do fontkit a resolver caminhos relativos
 *      em runtime serverless
 */

import fs from "node:fs";
import path from "node:path";
import { Font } from "@react-pdf/renderer";

const FONT_DIR = path.join(
  process.cwd(),
  "assets",
  "fonts",
  "cormorant",
);

const FONTS = [
  { file: "CormorantGaramond-Regular.ttf", fontWeight: 400 as const },
  { file: "CormorantGaramond-Italic.ttf", fontWeight: 400 as const, fontStyle: "italic" as const },
  { file: "CormorantGaramond-SemiBold.ttf", fontWeight: 600 as const },
  { file: "CormorantGaramond-SemiBoldItalic.ttf", fontWeight: 600 as const, fontStyle: "italic" as const },
  { file: "CormorantGaramond-Bold.ttf", fontWeight: 700 as const },
  { file: "CormorantGaramond-BoldItalic.ttf", fontWeight: 700 as const, fontStyle: "italic" as const },
];

let registered = false;
let registerError: { message: string; cwd: string; tried: string[]; existing: string[] } | null = null;

export function ensureCormorantRegistered(): void {
  if (registered) return;
  registered = true;

  const tried: string[] = [];
  const missing: string[] = [];
  const existing: string[] = [];

  for (const f of FONTS) {
    const p = path.join(FONT_DIR, f.file);
    tried.push(p);
    if (!fs.existsSync(p)) missing.push(p);
    else existing.push(p);
  }

  if (missing.length) {
    registerError = {
      message: `Faltam ${missing.length}/${FONTS.length} TTFs no path bundled`,
      cwd: process.cwd(),
      tried,
      existing,
    };
    return;
  }

  Font.register({
    family: "Cormorant",
    fonts: FONTS.map((f) => {
      const src = fs.readFileSync(path.join(FONT_DIR, f.file));
      // @react-pdf/font aceita Buffer em src (chunked into Uint8Array internamente)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entry: any = { src, fontWeight: f.fontWeight };
      if ("fontStyle" in f) entry.fontStyle = f.fontStyle;
      return entry;
    }),
  });
}

export function getCormorantRegisterError() {
  return registerError;
}

export const CORMORANT_FAMILY = "Cormorant";
