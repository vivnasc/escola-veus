/**
 * curso parse — converts a Markdown lesson script to slides.json
 *
 * Rules (from ESCOLA-VEUS-VIDEO-PIPELINE REVISTO.md):
 *   - `---` (horizontal rule) marks slide transitions
 *   - YAML frontmatter between first pair of `---` (optional)
 *   - `# Title` → slide type "title"
 *   - `## Exercício` or `## Reflexão` → slide type "exercise"
 *   - Normal text → slide type "content"
 *   - Duration: ~1 second per 10 chars, min 5s, max 15s
 *   - Total duration should approximate duracao_alvo (proportional adjust)
 *   - Always adds an "end" slide at the end
 */

const fs = require("fs");
const path = require("path");
const { parseNamedArgs } = require("./args");

// ── Frontmatter parser ──────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  const lines = match[1].split("\n");
  for (const line of lines) {
    const m = line.match(/^(\w[\w_-]*)\s*:\s*(.+)$/);
    if (m) {
      let val = m[2].trim();
      // Remove quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // Try number
      if (/^\d+(\.\d+)?$/.test(val)) {
        val = parseFloat(val);
      }
      meta[m[1]] = val;
    }
  }

  const body = content.slice(match[0].length);
  return { meta, body };
}

// ── Slide splitter ──────────────────────────────────────────────────────────

function splitIntoSlides(body) {
  // Split on horizontal rules (---)
  // A horizontal rule is a line that is exactly "---" (possibly with spaces)
  const parts = body.split(/\n(?:---|\*\*\*|___)\s*\n/);
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}

// ── Slide type detection ────────────────────────────────────────────────────

function classifySlide(text) {
  // Title slide: starts with # (h1)
  const h1Match = text.match(/^#\s+(.+)/);
  if (h1Match) {
    // If there's text after the title, split into title + content slides
    const remaining = text.slice(h1Match[0].length).trim();
    if (remaining) {
      return [
        { tipo: "title", texto: h1Match[1].trim(), subtexto: null },
        { tipo: "content", texto: remaining },
      ];
    }
    return { tipo: "title", texto: h1Match[1].trim(), subtexto: null };
  }

  // Exercise/reflection: starts with ## Exercício or ## Reflexão
  const h2Match = text.match(/^##\s+(Exerc[ií]cio|Reflex[aã]o)\s*\n?([\s\S]*)/i);
  if (h2Match) {
    const exerciseText = h2Match[2].trim();
    return {
      tipo: "exercise",
      label: h2Match[1],
      texto: exerciseText,
    };
  }

  // Any other ## heading — treat as content with emphasis
  const h2Other = text.match(/^##\s+(.+)\n?([\s\S]*)/);
  if (h2Other) {
    const heading = h2Other[1].trim();
    const rest = h2Other[2].trim();
    return {
      tipo: "content",
      texto: rest ? `${heading}\n\n${rest}` : heading,
    };
  }

  // Plain content
  return {
    tipo: "content",
    texto: text,
  };
}

// ── Duration calculation ────────────────────────────────────────────────────

function calcDuration(text) {
  const chars = text.length;
  // ~1 second per 10 characters, min 5s, max 15s
  const raw = Math.round(chars / 10);
  return Math.max(5, Math.min(15, raw));
}

function adjustDurations(slides, targetMinutes) {
  if (!targetMinutes || targetMinutes <= 0) return slides;

  const targetSeconds = targetMinutes * 60;
  const currentTotal = slides.reduce((sum, s) => sum + s.duracao, 0);

  if (currentTotal === 0) return slides;

  const ratio = targetSeconds / currentTotal;

  return slides.map((s) => ({
    ...s,
    duracao: Math.max(4, Math.min(15, Math.round(s.duracao * ratio))),
  }));
}

// ── Main parse function ─────────────────────────────────────────────────────

function parseScript(content, filename) {
  const { meta, body } = parseFrontmatter(content);
  const rawSlides = splitIntoSlides(body);

  const slides = [];

  for (const raw of rawSlides) {
    const classified = classifySlide(raw);
    // classifySlide can return a single object or an array (when h1 has text below)
    const items = Array.isArray(classified) ? classified : [classified];

    for (const c of items) {
      // For title slides, add module/lesson subtitle if available
      if (c.tipo === "title" && meta.modulo && meta.aula && !c.subtexto) {
        c.subtexto = `Módulo ${meta.modulo} · Aula ${meta.aula}`;
      }

      const slide = {
        tipo: c.tipo,
        texto: c.texto,
      };

      if (c.subtexto) slide.subtexto = c.subtexto;
      if (c.label) slide.label = c.label;

      slide.duracao = c.tipo === "title" ? 6 : calcDuration(c.texto);

      slides.push(slide);
    }
  }

  // Add end slide
  slides.push({
    tipo: "end",
    texto: "Escola dos Véus",
    subtexto: "seteveus.space",
    duracao: 5,
  });

  // Adjust durations to target
  const adjusted = adjustDurations(slides, meta.duracao_alvo);

  const result = {
    curso: meta.curso || null,
    modulo: meta.modulo || null,
    aula: meta.aula || null,
    titulo: meta.titulo || slides.find((s) => s.tipo === "title")?.texto || path.basename(filename, ".md"),
    duracao_alvo: meta.duracao_alvo || null,
    musica: meta.musica || null,
    slides: adjusted,
  };

  return result;
}

// ── CLI handler ─────────────────────────────────────────────────────────────

async function cursoParse(args) {
  const { opts, positional } = parseNamedArgs(args);

  if (opts.help || opts.h || positional.length === 0) {
    console.log(`
Uso: escola-veus curso parse <aula.md> [opcoes]

  Converte um script Markdown de aula em slides.json.

Opcoes:
  --output, -o <path>   Ficheiro de output (default: <nome>-slides.json)
  --pretty              JSON indentado (default: true)
  --help, -h            Esta mensagem

Exemplo:
  escola-veus curso parse aulas/sangue-e-seda-m3-a2.md
  escola-veus curso parse aulas/sangue-e-seda-m3-a2.md -o output/slides.json
`);
    return;
  }

  const inputFile = positional[0];

  if (!fs.existsSync(inputFile)) {
    console.error(`Ficheiro nao encontrado: ${inputFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(inputFile, "utf-8");
  const result = parseScript(content, inputFile);

  // Output path
  const defaultOutput = inputFile.replace(/\.md$/, "-slides.json");
  const outputFile = opts.output || opts.o || defaultOutput;

  const json = JSON.stringify(result, null, 2);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, json, "utf-8");

  // Summary
  const totalDuration = result.slides.reduce((sum, s) => sum + s.duracao, 0);
  const types = {};
  for (const s of result.slides) types[s.tipo] = (types[s.tipo] || 0) + 1;

  console.log(`✓ ${path.basename(inputFile)} → ${path.basename(outputFile)}`);
  console.log(`  Curso: ${result.curso || "(sem frontmatter)"}`);
  console.log(`  Titulo: ${result.titulo}`);
  console.log(`  Slides: ${result.slides.length} (${Object.entries(types).map(([k, v]) => `${v} ${k}`).join(", ")})`);
  console.log(`  Duracao total: ${Math.floor(totalDuration / 60)}:${String(totalDuration % 60).padStart(2, "0")}`);
  if (result.duracao_alvo) {
    console.log(`  Duracao alvo: ${result.duracao_alvo} min`);
  }
  console.log(`  Musica: ${result.musica || "(nao atribuida)"}`);
}

module.exports = { cursoParse, parseScript };
