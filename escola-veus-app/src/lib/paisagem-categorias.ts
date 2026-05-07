// Taxonomia de categorias de paisagem para Ancient Ground.
// Fonte de verdade: `src/data/thinkdiffusion-prompts.json` (prompts.category).
// Esta lista espelha essas categorias + adiciona "outro" como fallback para
// clips legados sem prefixo conhecido.
//
// Usada em:
//  - ClipUploader dropdown (upload pela página /admin/producao/clips-paisagem)
//  - parseClipTheme (extrai categoria do filename "{cat}_{rest}.mp4")
//  - suggest-ag endpoint (sugere versos no tom AG para os clips escolhidos)

import promptsData from "@/data/thinkdiffusion-prompts.json";

type Prompt = { id: string; category: string; mood?: string[]; prompt: string };

// Extrai categorias únicas do JSON (ordenadas alfabeticamente para UI estável).
function extractCategorias(): string[] {
  const all = ((promptsData as { prompts: Prompt[] }).prompts || [])
    .map((p) => p.category)
    .filter(Boolean);
  return Array.from(new Set(all)).sort();
}

// Hard-codado em vez de derivado directamente — garante ordem estável e
// não partir se o JSON for re-ordenado. Se adicionares uma nova categoria
// ao JSON, adiciona aqui também.
export const CATEGORIAS_PAISAGEM = [
  "mar",
  "mar2",
  "praia",
  "praia2",
  "rio",
  "chuva",
  "savana",
  "terra",
  "flora",
  "jardim",
  "caminho",
  "ceu",
  "noite",
  "nevoeiro",
  "fogo",
  "outro",
] as const;

export type CategoriaPaisagem = (typeof CATEGORIAS_PAISAGEM)[number];

// Etiquetas humanas para o dropdown. As que têm "N" no slug (mar2, praia2)
// são variantes temáticas do AG prompts — clarificamos para o utilizador.
export const CATEGORIA_LABELS: Record<CategoriaPaisagem, string> = {
  mar: "Mar",
  mar2: "Mar · vida submarina",
  praia: "Praia",
  praia2: "Praia · Moçambique",
  rio: "Rio",
  chuva: "Chuva",
  savana: "Savana",
  terra: "Terra",
  flora: "Flora",
  jardim: "Jardim",
  caminho: "Caminho",
  ceu: "Céu",
  noite: "Noite",
  nevoeiro: "Nevoeiro",
  fogo: "Fogo",
  outro: "Outro",
};

// Descrição curta que vai no prompt da LLM para informar o tom de cada
// categoria. Ajuda o Claude a gerar versos alinhados sem repetir "mar" óbvio.
export const CATEGORIA_DESCRICOES: Record<CategoriaPaisagem, string> = {
  mar: "oceano aberto, horizonte, ondas, maré, sal, vastidão azul",
  mar2: "vida submarina, baleias, tartarugas, recifes, peixes, mergulho",
  praia: "areia, costa, palmeiras, sol, pegadas, beira-mar",
  praia2: "praias específicas de Moçambique (Bilene, Tofo, Vilanculos), dunas, cocotais",
  rio: "corrente, margem, foz, água doce, afluente, rio a encontrar o mar",
  chuva: "gotas, monção, terra molhada, relâmpago, trovão, purificação",
  savana: "planície, gramíneas altas, baobás, elefantes, acácias, pôr-do-sol africano",
  terra: "solo, barro, poeira, caminhos de terra batida, vermelho africano, raíz",
  flora: "plantas nativas, folhas, cipós, selva, vegetação densa, verde",
  jardim: "jardim cultivado, semear, colher, relação humana com a planta",
  caminho: "trilho, senda, passagem, caminhar, aldeia ao longe, passo",
  ceu: "nuvens, sol, lua, estrelas, firmamento, horizonte celeste",
  noite: "escuridão, constelações, silêncio nocturno, animais nocturnos, luar",
  nevoeiro: "bruma, névoa, mistério velado, montanhas envoltas, manhã cedo",
  fogo: "chamas, fogueira, brasa, cinza, roda em volta do fogo, tambor nocturno",
  outro: "categoria não especificada",
};

/** Extrai a categoria do nome do ficheiro.
 *  Formato: "{categoria}_{resto}.mp4" → "categoria"
 *  Sem "_" ou categoria desconhecida → "outro". */
export function parseCategoriaPaisagem(filename: string): CategoriaPaisagem {
  const base = filename.replace(/\.[^.]+$/, "");
  const idx = base.indexOf("_");
  if (idx === -1) return "outro";
  const candidate = base.slice(0, idx).toLowerCase();
  return (CATEGORIAS_PAISAGEM as readonly string[]).includes(candidate)
    ? (candidate as CategoriaPaisagem)
    : "outro";
}

/** Usado em testes / validação para detectar drift entre JSON e esta lista. */
export function getJsonCategorias(): string[] {
  return extractCategorias();
}
