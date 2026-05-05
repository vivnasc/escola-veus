import React from "react";

/**
 * Parse inline `**texto**` para renderizar com realce (itálico + cor de
 * destaque). Usado nos slides das aulas para a Vivianne emphasizar
 * palavras-chave dentro dos blocos sem criar slides separados.
 *
 * Exemplo:
 *   "O medo **olha para ti** e tu olhas para ele."
 *
 * A mesma marcação é entendida pelo template HTML do render MP4
 * (ver tools/render-course-slide/slide-template.mjs:emphasisToHtml).
 */
const EMPH_RE = /\*\*([^*]+?)\*\*/g;

export function parseEmphasis(
  text: string,
  accentColor: string,
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  EMPH_RE.lastIndex = 0;
  while ((match = EMPH_RE.exec(text)) !== null) {
    if (match.index > last) {
      out.push(text.slice(last, match.index));
    }
    out.push(
      <em
        key={`e${i++}`}
        style={{ color: accentColor, fontStyle: "italic", fontWeight: 500 }}
      >
        {match[1]}
      </em>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Versão HTML (string) para o renderer Puppeteer. */
export function emphasisToHtml(text: string, accentColor: string): string {
  // Escapa HTML básico, depois aplica o realce.
  const esc = (s: string) =>
    s.replace(/[&<>"']/g, (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string,
    );
  return esc(text).replace(
    /\*\*([^*]+?)\*\*/g,
    `<em style="color:${accentColor};font-style:italic;font-weight:500">$1</em>`,
  );
}
