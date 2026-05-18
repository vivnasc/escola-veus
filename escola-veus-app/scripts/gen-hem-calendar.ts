/**
 * Gera docs/hoje-em-mim/CALENDARIO-IMAGENS-6MESES.md
 *
 * Espelho do gerador VC Sabia (`tools/vc-sabia/generate-motions-library.py`)
 * mas implementado em TS para reutilizar directamente o
 * `src/lib/hoje-em-mim/calendar.ts` (sem necessidade de fonte
 * duplicada em JSON).
 *
 * Uso:
 *   cd escola-veus-app
 *   npx tsx scripts/gen-hem-calendar.ts [--start=YYYY-MM-DD] [--days=180]
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { dailyMjRotation, rotationStats } from "../src/lib/hoje-em-mim/calendar";
import { MJ_VIDEO_PROMPTS } from "../src/data/hoje-em-mim-mj-prompts";
import type { DiaSemana } from "../src/lib/hoje-em-mim/captions";

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DOW_PT: Record<DiaSemana, string> = {
  mon: "Segunda", tue: "Terça", wed: "Quarta", thu: "Quinta",
  fri: "Sexta", sat: "Sábado", sun: "Domingo",
};

function parseArgs(): { start: string; days: number; out: string } {
  const args = process.argv.slice(2);
  let start = "";
  let days = 180;
  let out = "";
  for (const a of args) {
    if (a.startsWith("--start=")) start = a.slice("--start=".length);
    else if (a.startsWith("--days=")) days = Number(a.slice("--days=".length));
    else if (a.startsWith("--out=")) out = a.slice("--out=".length);
  }
  if (!start) {
    // Próximo dia 1 do próximo mês
    const now = new Date();
    const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    start = nextMonth.toISOString().slice(0, 10);
  }
  if (!out) {
    out = join(
      process.cwd(),
      "..",
      "docs",
      "hoje-em-mim",
      "CALENDARIO-IMAGENS-6MESES.md"
    );
  }
  return { start, days, out };
}

function main() {
  const { start, days, out } = parseArgs();
  const [y, m, d] = start.split("-").map(Number);
  const rotation = dailyMjRotation(new Date(Date.UTC(y, m - 1, d)), days);
  const stats = rotationStats(rotation);

  const lines: string[] = [];
  lines.push(
    `# Hoje, em Mim · Calendário de Imagens · ${rotation.length} dias`
  );
  lines.push("");
  lines.push(
    `Plano dia-a-dia de **${rotation.length} posts** (${rotation[0]?.iso} → ${rotation.at(-1)?.iso}), no formato do calendário VC Sabia.`
  );
  lines.push("");
  lines.push(
    "**Alinhamento frase ↔ imagem:** o prompt MJ é escolhido pela palavra-chave que aparece na frase do dia (jasmim → `mj-23-jasmim-vela`, chuva → `mj-04-chuva-janela`, etc). Sem keyword, cai para o mood preferido do dia (mon→grilos, ter→lareira, qua→chuva, qui→tigela, sex→tambor, sáb→coruja, dom→lua). Sem mood compatível, ciclo simples."
  );
  lines.push("");
  lines.push("**Voz da marca:** fim de dia, contemplativa, acolhedora. Português europeu (PT-PT), sem travessões.");
  lines.push("");
  lines.push("---");
  lines.push("");

  let currentMonth = "";
  let dayCounter = 0;
  for (const e of rotation) {
    dayCounter++;
    const monthKey = `${e.date.getUTCFullYear()}-${String(e.date.getUTCMonth() + 1).padStart(2, "0")}`;
    if (monthKey !== currentMonth) {
      lines.push("");
      lines.push(
        `# ${MESES_PT[e.date.getUTCMonth()]} ${e.date.getUTCFullYear()}`
      );
      lines.push("");
      currentMonth = monthKey;
    }
    const especialBadge = e.especial
      ? `  ·  *${e.especial.replace("_", " ")}*`
      : "";
    lines.push(
      `## DIA ${String(dayCounter).padStart(3, "0")} · ${DOW_PT[e.dia]} ${e.iso} · ${e.prompt.id}${especialBadge}`
    );
    lines.push("");
    lines.push(`**Frase:** *${e.fraseTexto}*`);
    lines.push("");
    const matchLabel =
      e.matchMode === "keyword"
        ? `🎯 keyword \`${e.matchedKeyword}\``
        : e.matchMode === "mood"
          ? `🎨 por mood`
          : `ciclo`;
    lines.push(
      `**Alinhamento:** ${matchLabel}  ·  **Áudio:** \`${e.prompt.audioMood}\`  ·  **Frase id:** \`${e.fraseId}\``
    );
    lines.push("");
    lines.push("### Prompt Midjourney");
    lines.push("");
    lines.push("```");
    lines.push(e.prompt.prompt);
    lines.push("```");
    lines.push("");
    lines.push("### Runway motion");
    lines.push("");
    lines.push("```");
    lines.push(e.prompt.runwayMotion);
    lines.push("```");
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  lines.push("");
  lines.push("# Auditoria");
  lines.push("");
  lines.push(`- Match por **keyword**: ${stats.byMode.keyword} dias`);
  lines.push(`- Match por **mood**: ${stats.byMode.mood} dias`);
  lines.push(`- **Fallback** ciclo: ${stats.byMode.fallback} dias`);
  lines.push("");
  lines.push("## Uso por prompt");
  lines.push("");
  const sorted = [...stats.byPrompt.entries()].sort((a, b) => b[1] - a[1]);
  for (const [id, n] of sorted) {
    lines.push(`- \`${id}\` — ${n} dias`);
  }
  const unused = MJ_VIDEO_PROMPTS.filter((p) => !stats.byPrompt.has(p.id));
  if (unused.length > 0) {
    lines.push("");
    lines.push(
      `### Prompts não usados (${unused.length}/${MJ_VIDEO_PROMPTS.length})`
    );
    lines.push(
      "Nenhuma frase faz match. Considera acrescentar keywords ou frases que toquem nestes substantivos:"
    );
    for (const p of unused) {
      lines.push(
        `- \`${p.id}\` — keywords: ${(p.keywords ?? []).map((k) => `\`${k}\``).join(", ") || "(sem keywords)"}`
      );
    }
  }

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, lines.join("\n") + "\n", "utf8");
  console.log(`Escrito ${rotation.length} dias em ${out}`);
  console.log(
    `Match: ${stats.byMode.keyword} keyword · ${stats.byMode.mood} mood · ${stats.byMode.fallback} fallback`
  );
}

main();
