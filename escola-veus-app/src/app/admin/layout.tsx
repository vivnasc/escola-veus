"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UniverseProvider, useUniverse, type Universe } from "@/contexts/UniverseContext";
import { useEffect } from "react";

const ADMIN_EMAILS = ["viv.saraiva@gmail.com"];

// Nav top-level filtrada por universo. Os URLs NÃO mudam (para não partir
// bookmarks) — só esconde/mostra o que faz sentido em cada universo.
// Ancient Ground tem o seu próprio canal YouTube e ritmo de publicação;
// os cursos têm alunas, biblioteca, conteúdo, etc.
const NAV_CURSOS: { href: string; label: string }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/alunas", label: "Alunas" },
  { href: "/admin/escola", label: "Cursos" },
  { href: "/admin/producao", label: "Produção" },
  { href: "/admin/calendario", label: "Calendário" },
  { href: "/admin/biblioteca", label: "Biblioteca" },
  { href: "/admin/analytics", label: "Analytics" },
];

const NAV_AG: { href: string; label: string }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/producao/ancient-ground", label: "Produção AG" },
  { href: "/admin/calendario", label: "Calendário AG" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/entrar");
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-escola-creme-50">A verificar acesso...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <UniverseProvider>
      <AdminShell>{children}</AdminShell>
    </UniverseProvider>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { universe, setUniverse } = useUniverse();

  const nav = universe === "ag" ? NAV_AG : NAV_CURSOS;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-8">
      {/* Admin header + universe switcher */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-escola-dourado">
          Admin
        </h1>
        <Link href="/" className="text-xs text-escola-creme-50 hover:text-escola-creme">
          &larr; Voltar ao site
        </Link>
      </div>

      <UniverseSwitcher current={universe} onChange={setUniverse} />

      {/* Admin nav (filtrada pelo universo) */}
      <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-escola-border">
        {nav.map(({ href, label }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-sm transition-colors ${
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

function UniverseSwitcher({
  current,
  onChange,
}: {
  current: Universe;
  onChange: (u: Universe) => void;
}) {
  const options: { key: Universe; label: string; subtitle: string }[] = [
    { key: "cursos", label: "Cursos", subtitle: "Escola dos Véus · Loranne · alunas" },
    { key: "ag", label: "Ancient Ground", subtitle: "Canal próprio · natureza · ambiente" },
  ];
  return (
    <div className="mb-5 grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = current === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`rounded-lg border px-4 py-2 text-left transition-colors ${
              active
                ? "border-escola-dourado bg-escola-dourado/10"
                : "border-escola-border bg-escola-card hover:border-escola-dourado/40"
            }`}
          >
            <p className={`text-sm font-semibold ${active ? "text-escola-dourado" : "text-escola-creme"}`}>
              {opt.label}
            </p>
            <p className="text-[10px] text-escola-creme-50">{opt.subtitle}</p>
          </button>
        );
      })}
    </div>
  );
}
