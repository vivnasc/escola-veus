"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUniverse } from "@/contexts/UniverseContext";

type Tab = { href: string; label: string; exact?: boolean };

// Tabs organizadas por universo. Em modo "cursos" mostramos só o que
// pertence à Escola dos Véus; em modo "ag" só a produção Ancient Ground.
// Os URLs são os mesmos de antes — não partimos bookmarks.
// Shorts Loranne NÃO aparece aqui — é pólo independente, com card visível
// no dashboard admin. Mantemos a página /admin/producao/shorts intacta.
const TABS_CURSOS: Tab[] = [
  { href: "/admin/producao/aulas", label: "Aulas" },
  { href: "/admin/producao/funil", label: "Funil" },
  { href: "/admin/producao/shorts/nomear", label: "Shorts Funil" },
  { href: "/admin/producao/audios", label: "Áudios" },
  { href: "/admin/producao/colecoes", label: "Carrosséis" },
];

const TABS_AG: Tab[] = [
  { href: "/admin/producao/ancient-ground", label: "Prompts + Clips", exact: true },
  { href: "/admin/producao/ancient-ground/raizes", label: "Raízes (imagens)" },
  { href: "/admin/producao/ancient-ground/montagem", label: "Vídeo longo (60 min)" },
  { href: "/admin/producao/ancient-ground/shorts", label: "Shorts AG" },
];

export default function ProducaoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { universe } = useUniverse();
  const tabs = universe === "ag" ? TABS_AG : TABS_CURSOS;

  return (
    <div>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-escola-border">
        {tabs.map(({ href, label, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 border-b-2 px-3 py-2 text-xs transition-colors ${
                active
                  ? "border-escola-dourado text-escola-dourado"
                  : "border-transparent text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
