"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/producao/aulas", label: "Aulas" },
  { href: "/admin/producao/funil", label: "Funil" },
  { href: "/admin/producao/ancient-ground", label: "Ancient Ground", exact: true },
  { href: "/admin/producao/ancient-ground/montagem", label: "AG — Montagem" },
  { href: "/admin/producao/shorts", label: "Shorts" },
  { href: "/admin/producao/audios", label: "Audios" },
] as const;

export default function ProducaoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-escola-border">
        {TABS.map(({ href, label, exact }) => {
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
