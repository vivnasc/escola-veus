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

/**
 * Insere um glifo divisor `· · ·` entre frases dentro do mesmo bloco. Cria
 * pausa visual sem mudar o texto da aluna. Detecta fim de frase por `.`,
 * `?`, `!` seguidos de espaço.
 */
function splitSentences(text: string): string[] {
  return text.split(/(?<=[.?!])\s+(?=\S)/);
}

export function parseEmphasis(
  text: string,
  accentColor: string,
  options: { dividers?: boolean; typewriter?: boolean; secondsPerWord?: number } = {},
): React.ReactNode[] {
  const sentences = options.dividers ? splitSentences(text) : [text];
  const typewriter = options.typewriter ?? false;
  const stepSec = options.secondsPerWord ?? 0.09;
  // Contador global de palavras revealed (para staggered animation-delay).
  let wordIdx = 0;

  function renderText(s: string): React.ReactNode[] {
    if (!typewriter) return [s];
    // Quebrar em palavras preservando espaços; cada palavra num span com
    // animation-delay crescente.
    const tokens = s.split(/(\s+)/);
    return tokens.map((tok, i) => {
      if (/^\s+$/.test(tok)) return tok;
      const delay = (wordIdx++ * stepSec).toFixed(2);
      return (
        <span
          key={`w${i}-${delay}`}
          className="escola-word"
          style={{ animationDelay: `${delay}s` }}
        >
          {tok}
        </span>
      );
    });
  }

  function renderSentence(s: string, baseKey: string): React.ReactNode[] {
    const out: React.ReactNode[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    let i = 0;
    EMPH_RE.lastIndex = 0;
    while ((match = EMPH_RE.exec(s)) !== null) {
      if (match.index > last) out.push(...renderText(s.slice(last, match.index)));
      // Os <em> também recebem animação por palavra
      const emText = match[1];
      const emInner = renderText(emText);
      out.push(
        <em
          key={`${baseKey}-e${i++}`}
          style={{ color: accentColor, fontStyle: "italic", fontWeight: 500 }}
        >
          {emInner}
        </em>,
      );
      last = match.index + match[0].length;
    }
    if (last < s.length) out.push(...renderText(s.slice(last)));
    return out;
  }

  if (sentences.length === 1) return renderSentence(sentences[0], "s0");

  const out: React.ReactNode[] = [];
  sentences.forEach((s, idx) => {
    out.push(...renderSentence(s, `s${idx}`));
    if (idx < sentences.length - 1) {
      out.push(
        <span
          key={`d${idx}`}
          style={{ color: accentColor, opacity: 0.55, letterSpacing: "4px", margin: "0 0.5em" }}
        >
          {" · · · "}
        </span>,
      );
    }
  });
  return out;
}

/** Versão HTML (string) para o renderer Puppeteer. */
export function emphasisToHtml(
  text: string,
  accentColor: string,
  options: { dividers?: boolean } = {},
): string {
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
  const renderEmph = (s: string) =>
    esc(s).replace(
      /\*\*([^*]+?)\*\*/g,
      `<em style="color:${accentColor};font-style:italic;font-weight:500">$1</em>`,
    );
  if (!options.dividers) return renderEmph(text);
  const sentences = splitSentences(text);
  if (sentences.length === 1) return renderEmph(sentences[0]);
  const sep = `<span style="color:${accentColor};opacity:0.55;letter-spacing:4px;margin:0 0.5em">· · ·</span>`;
  return sentences.map(renderEmph).join(sep);
}
