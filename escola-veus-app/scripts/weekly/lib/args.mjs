// Parse argv para os comandos weekly. CommonJS-free.

export function parseArgs(argv) {
  const args = { semana: null, dryRun: false, baseUrl: null, skipRenders: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--semana" || a === "-s") {
      args.semana = parseInt(argv[++i], 10);
    } else if (a === "--dry-run") {
      args.dryRun = true;
    } else if (a === "--base-url") {
      args.baseUrl = argv[++i];
    } else if (a === "--skip-renders") {
      args.skipRenders = true;
    } else if (a === "--help" || a === "-h") {
      args.help = true;
    } else if (!a.startsWith("--") && !args.semana) {
      // bare positional → assume semana
      const n = parseInt(a, 10);
      if (Number.isFinite(n)) args.semana = n;
    }
  }
  if (!args.help && !Number.isFinite(args.semana)) {
    console.error("✗ Falta --semana <N>. Ex: npm run weekly:plan -- --semana 19");
    process.exit(1);
  }
  args.baseUrl = args.baseUrl || process.env.WEEKLY_BASE_URL || "http://localhost:3000";
  return args;
}

export function printGenericHelp() {
  console.log(`
Comandos weekly — gera ZIPs Metricool por marca.

  npm run weekly:plan    -- --semana 19    Plano: captions + selecção de clips/música.
  npm run weekly:render  -- --semana 19    Dispatcha renders + polling (~30min).
  npm run weekly:package -- --semana 19    Constrói CSV + ZIP por marca.
  npm run weekly         -- --semana 19    Faz os 3 em sequência.

Flags globais:
  --semana N      (obrigatório) número ISO da semana
  --dry-run       Não escreve ficheiros nem chama APIs externas
  --skip-renders  Salta dispatch (assume vídeos já existem)
  --base-url URL  Base do Next dev server (default http://localhost:3000)
`);
}
