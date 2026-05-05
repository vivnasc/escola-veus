import { redirect } from "next/navigation";

// A página mudou de `/admin/producao/shorts/biblioteca` para
// `/admin/producao/clips-paisagem` — o nome antigo misturava conceitos
// diferentes (clips ≠ produção de shorts, e colide com a tab "Biblioteca"
// do admin que é do bucket Escola). Redirect para não partir bookmarks.
export default function LegacyBibliotecaRedirect() {
  redirect("/admin/producao/clips-paisagem");
}
