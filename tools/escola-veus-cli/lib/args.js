/**
 * Simple arg parsing helper.
 */

function parseNamedArgs(args) {
  const opts = {};
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].replace(/^--/, "");
      if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        opts[key] = args[++i];
      } else {
        opts[key] = true;
      }
    } else if (args[i].startsWith("-") && args[i].length === 2) {
      const key = args[i][1];
      if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        opts[key] = args[++i];
      } else {
        opts[key] = true;
      }
    } else {
      positional.push(args[i]);
    }
  }

  return { opts, positional };
}

module.exports = { parseNamedArgs };
