// Tipos partilhados entre o gerador hardcoded ("A Estação dos Véus")
// e o sistema de colecções dinâmicas (carousel_collections).

export type SlideCapa = {
  tipo: "capa";
  linha1: string;
  linha2: string;
};

export type SlideConteudo = {
  tipo: "conteudo";
  estilo: "poetico" | "prosa";
  texto: string;
  titulo?: string;
};

export type SlideCta = {
  tipo: "cta";
  icone: string;
  recurso: string;
  descricao: string;
  url: string;
};

export type Slide = SlideCapa | SlideConteudo | SlideCta;

export type Dia = {
  numero: number;
  veu: string;       // Palavra-tema do dia (ex: PERMANÊNCIA)
  subtitulo: string; // Linha curta italic abaixo do veu
  romano: string;    // I / VII
  slides: Slide[];
};

export type Colecao = {
  id: string;
  slug: string;
  title: string;
  brief: string;
  dias: Dia[];
  theme: Record<string, unknown>;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export const ROMAN: Record<number, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII",
  8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII",
};

export function romanFor(n: number, total: number): string {
  return `${ROMAN[n] ?? String(n)} / ${ROMAN[total] ?? String(total)}`;
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "colecao";
}
