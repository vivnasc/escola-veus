/**
 * Lista todos os assets verticais (9:16) do bucket Supabase escola-veus
 * que podem ser reaproveitados no projecto viviannepag.
 *
 * Output: stdout JSON com:
 *  {
 *    [bucketFolder]: [{ name, url, size, updated_at }, ...],
 *    ...
 *  }
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node dump-existing-assets.mjs > assets.json
 *
 * Depois a outra sessão (viviannepag) decide:
 *  A) Referência directa às URLs antigas (se o Supabase antigo ficar online)
 *  B) Download e re-upload no Supabase novo (preserva controlo)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Falta SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const BUCKET = "course-assets";
const FOLDERS = [
  // Vertical 9:16 (imagens MJ + motion + fundos)
  "hoje-em-mim-images",
  "hoje-em-mim-motions",
  "youtube/clips",
  "carrossel-veus/fundos",
  // Outros folders relevantes (caso queiras descarregar também)
  "vc-sabia/motions",
  "course-images",
];

function publicUrl(folder, name) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${folder}/${name}`;
}

async function listFolder(folder) {
  const all = [];
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(folder, { limit: pageSize, offset, sortBy: { column: "name", order: "asc" } });
    if (error) {
      console.error(`Erro ${folder}: ${error.message}`);
      break;
    }
    if (!data || data.length === 0) break;
    for (const f of data) {
      if (f.name && !f.name.endsWith("/")) {
        all.push({
          name: f.name,
          url: publicUrl(folder, f.name),
          size: f.metadata?.size ?? null,
          updated_at: f.updated_at ?? null,
        });
      }
    }
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

async function main() {
  const result = {};
  for (const folder of FOLDERS) {
    process.stderr.write(`Listando ${folder}... `);
    const items = await listFolder(folder);
    result[folder] = items;
    process.stderr.write(`${items.length} ficheiros\n`);
  }
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
