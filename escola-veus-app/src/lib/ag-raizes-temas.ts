// Raízes Ancient Ground — taxonomia das imagens humano-culturais para os
// shorts AG. Diferente da paisagem (Loranne+AG pool) — estas são imagens
// geradas por Midjourney, carregadas manualmente, depois animadas via
// Runway para entrar em shorts AG.
//
// Fonte de verdade: src/data/ag-raizes-prompts.json (cada prompt tem .theme).

export const RAIZES_TEMAS = [
  "machamba",
  "pesca",
  "artesanato",
  "batuque",
  "danca",
  "crianca",
  "mercado",
  "anciao",
  "casa",
  "transmissao",
  "trabalho-coletivo",
  "rito",
  "aldeia",
  "gente-paisagem",
  "retrato",
] as const;

export type RaizTema = (typeof RAIZES_TEMAS)[number];

export const RAIZES_TEMA_LABELS: Record<RaizTema, string> = {
  machamba: "Machamba",
  pesca: "Pesca",
  artesanato: "Artesanato",
  batuque: "Batuque",
  danca: "Dança",
  crianca: "Criança",
  mercado: "Mercado",
  anciao: "Ancião/Anciã",
  casa: "Casa / Lar",
  transmissao: "Transmissão",
  "trabalho-coletivo": "Trabalho colectivo",
  rito: "Rito",
  aldeia: "Aldeia",
  "gente-paisagem": "Gente + paisagem",
  retrato: "Retrato",
};

export const RAIZES_TEMA_DESCRICOES: Record<RaizTema, string> = {
  machamba: "Mulher/homem na terra, enxada, milho, mandioca, gesto de cultivar.",
  pesca: "Pescadores, dhows de madeira, redes, Oceano Índico de Moçambique.",
  artesanato: "Mãos a tecer cestos, cerâmica, missanga, esculturas de pau-preto.",
  batuque: "Tambor, mbira, timbila, ritmo primordial — fogo e brasa à noite.",
  danca: "Capulanas em movimento, mapiko makua, círculos de timbila chope.",
  crianca: "Crianças a aprender, brincar, carregar — presença do futuro no presente.",
  mercado: "Vendedoras com capulanas, peixe seco, plantas medicinais, ervas.",
  anciao: "Guardiões de saber — cachimbo, olhar, árvore sagrada, mafurra.",
  casa: "Adobe, palha, candeeiro de óleo, lume, interior íntimo.",
  transmissao: "Avó e criança, pai e filho — saber que passa de mão em mão.",
  "trabalho-coletivo": "Pilar milho juntos, puxar rede, construir palhota.",
  rito: "Verter água à terra, acender fogo ao entardecer, curandeiro.",
  aldeia: "Palhotas, baobá, caminhos de terra — contexto amplo.",
  "gente-paisagem": "Figura humana integrada no elemento: lavadeira no rio, pescador em silhueta.",
  retrato: "Rosto em close-up — olhos, rugas, pele marcada pelo tempo.",
};

/** Extrai o tema do nome do ficheiro "{tema}-{NN}.{ext}".
 *  Os temas com hífen ("trabalho-coletivo", "gente-paisagem") exigem cuidado
 *  porque o separador "-" é também o separador do índice. Tenta do mais
 *  longo para o mais curto para evitar match parcial. */
export function parseRaizTema(filename: string): RaizTema | null {
  const base = filename.replace(/\.[^.]+$/, "");
  // Ordena do mais longo (match primeiro temas compostos com "-")
  const temasOrdenados = [...RAIZES_TEMAS].sort((a, b) => b.length - a.length);
  for (const t of temasOrdenados) {
    if (base.startsWith(t + "-")) return t;
  }
  return null;
}
