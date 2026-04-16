#!/usr/bin/env node

/**
 * Escola dos Véus — CLI
 *
 * Two pipelines in one tool:
 *   escola-veus curso parse <aula.md>      → slides.json
 *   escola-veus curso preview [slides.json] → opens HTML preview
 *   escola-veus curso render <slides.json>  → MP4
 *   escola-veus yt parse <script.md>        → timeline.json
 *   escola-veus yt preview [timeline.json]  → opens HTML preview
 *   escola-veus yt render <timeline.json>   → MP4
 */

const { parseArgs } = require("./lib/args");
const { cursoParse } = require("./lib/curso-parse");
const { cursoPreview } = require("./lib/curso-preview");

const COMMANDS = {
  "curso parse": cursoParse,
  "curso preview": cursoPreview,
  // "curso render": cursoRender,  // TODO
  // "yt parse": ytParse,          // TODO
  // "yt preview": ytPreview,      // TODO
  // "yt render": ytRender,        // TODO
};

function printHelp() {
  console.log(`
Escola dos Véus — CLI v0.1

PIPELINE 1 — CURSOS (Slides + Suno)
  escola-veus curso parse <aula.md>            Script Markdown → slides.json
  escola-veus curso preview [slides.json]      Preview HTML para revisao
  escola-veus curso render <slides.json>       Render → MP4 (TODO)

PIPELINE 2 — YOUTUBE (Runway + Texto + Suno)
  escola-veus yt parse <script.md>             Script → timeline.json (TODO)
  escola-veus yt preview [timeline.json]       Preview HTML (TODO)
  escola-veus yt render <timeline.json>        Render → MP4 (TODO)

BATCH
  escola-veus batch curso <pasta/>             Todas as aulas de um curso (TODO)
  escola-veus batch yt <pasta/>                Todos os eps de uma serie (TODO)

OPCOES GLOBAIS
  --output, -o <path>   Pasta de output (default: ./output)
  --help, -h            Esta mensagem
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  const pipeline = args[0]; // "curso" or "yt"
  const action = args[1];   // "parse", "preview", "render"
  const key = `${pipeline} ${action}`;

  if (!COMMANDS[key]) {
    console.error(`Comando desconhecido: ${key}`);
    console.error('Usa "escola-veus --help" para ver comandos disponiveis.');
    process.exit(1);
  }

  const restArgs = args.slice(2);
  await COMMANDS[key](restArgs);
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
