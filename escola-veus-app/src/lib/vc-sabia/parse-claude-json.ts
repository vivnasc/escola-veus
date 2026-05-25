/**
 * Parser robusto para JSON devolvido pelo Claude.
 *
 * O Claude por vezes devolve JSON com problemas comuns:
 *  - Envolto em ```json ... ``` (code fences)
 *  - Texto antes ou depois do JSON (explicacoes, "Here is the JSON:")
 *  - Trailing commas antes de } ou ]
 *  - Aspas invertidas (curly quotes " ")
 *  - Comentarios // inline
 *  - Elipses literais (... ou …) dentro de arrays
 *
 * Este helper tenta limpar tudo isso antes de fazer JSON.parse.
 * Se mesmo assim falhar, devolve null + o raw para debugging.
 */

export type ParseResult<T> =
  | { ok: true; data: T; cleaned: string }
  | { ok: false; error: string; raw: string };

export function parseClaudeJson<T = unknown>(raw: string): ParseResult<T> {
  if (!raw || !raw.trim()) {
    return { ok: false, error: "Resposta vazia do Claude", raw: "" };
  }

  let text = raw.trim();

  // 1. Strip code fences (```json ... ``` ou ``` ... ```)
  text = text.replace(/^```(?:json|JSON)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "");

  // 2. Se ha texto antes do primeiro { ou [, corta
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  let jsonStart = -1;
  if (firstBrace >= 0 && firstBracket >= 0) {
    jsonStart = Math.min(firstBrace, firstBracket);
  } else if (firstBrace >= 0) {
    jsonStart = firstBrace;
  } else if (firstBracket >= 0) {
    jsonStart = firstBracket;
  }
  if (jsonStart < 0) {
    return { ok: false, error: "Sem { ou [ encontrado na resposta", raw: text.slice(0, 500) };
  }
  if (jsonStart > 0) {
    text = text.slice(jsonStart);
  }

  // 3. Se ha texto depois do ultimo } ou ], corta
  const lastBrace = text.lastIndexOf("}");
  const lastBracket = text.lastIndexOf("]");
  const jsonEnd = Math.max(lastBrace, lastBracket);
  if (jsonEnd >= 0 && jsonEnd < text.length - 1) {
    text = text.slice(0, jsonEnd + 1);
  }

  // 4. Trailing commas antes de } ou ]
  text = text.replace(/,\s*([\]}])/g, "$1");

  // 5. Curly quotes → straight quotes
  text = text.replace(/[“”„‟″‶]/g, '"');
  text = text.replace(/[‘’‚‛′‵]/g, "'");

  // 6. Comentarios // inline (fora de strings — heuristica simples)
  text = text.replace(/^\s*\/\/.*$/gm, "");

  // 7. Elipses literais dentro de arrays/objects ("...", "…", ...)
  text = text.replace(/,?\s*"?\.{3}"?\s*,?/g, "");
  text = text.replace(/,?\s*"?…"?\s*,?/g, "");

  // 8. Re-limpar trailing commas (elipses removal pode ter deixado)
  text = text.replace(/,\s*([\]}])/g, "$1");

  // 9. Tentar parse
  try {
    const data = JSON.parse(text) as T;
    return { ok: true, data, cleaned: text };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `JSON.parse falhou: ${msg}`, raw: text.slice(0, 500) };
  }
}
