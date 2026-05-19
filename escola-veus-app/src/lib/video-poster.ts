/**
 * Helpers para `<video>` em previews — corrige o "preview preto" no Safari iPad/iPhone.
 *
 * Safari iOS NÃO renderiza a primeira frame de um <video> automaticamente
 * (mantém-se preto até clicares play) a menos que:
 *   1. Haja `poster=` com um URL de imagem, OU
 *   2. O URL do src tenha um Media Fragment `#t=N` (Safari salta para esse
 *      ponto e mostra a frame correspondente).
 *
 * `posterFrag(url, 0.5)` devolve `${url}#t=0.5` — meio segundo em vez de
 * frame 0 (evita frames pretas iniciais comuns em fades).
 *
 * Combinar com `preload="metadata"` para Safari fazer o fetch da metadata
 * e renderizar a frame.
 */
export function posterFrag(url: string | undefined | null, t = 0.5): string {
  if (!url) return "";
  // Já tem fragment? Devolve como está.
  if (url.includes("#")) return url;
  return `${url}#t=${t}`;
}
