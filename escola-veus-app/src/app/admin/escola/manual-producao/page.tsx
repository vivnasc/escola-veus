import { readFile } from "node:fs/promises";
import path from "node:path";
import ManualView from "./ManualView";

export default async function ManualProducaoPage() {
  const mdPath = path.join(process.cwd(), "..", "CURSOS", "MANUAL-PRODUCAO.md");
  let md = "";
  try {
    md = await readFile(mdPath, "utf-8");
  } catch (e) {
    md = `# Manual indisponível\n\nFicheiro ${mdPath} não encontrado.\n\n${e instanceof Error ? e.message : String(e)}`;
  }
  return <ManualView content={md} />;
}
