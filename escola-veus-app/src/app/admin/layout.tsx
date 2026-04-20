"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const ADMIN_EMAILS = ["viv.saraiva@gmail.com"];

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/alunas", label: "Alunas" },
  { href: "/admin/cursos", label: "Cursos" },
  { href: "/admin/conteudo", label: "Conteudo" },
  { href: "/admin/producao/ancient-ground", label: "Ancient Ground" },
  { href: "/admin/youtube-montagem", label: "Montagem" },
  { href: "/admin/shorts", label: "Shorts" },
  { href: "/admin/audio-bulk", label: "Audio" },
  { href: "/admin/revisao", label: "Revisao" },
  { href: "/admin/guidelines", label: "Guidelines" },
  { href: "/admin/analytics", label: "Analytics" },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-8">
      {/* Admin header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-escola-dourado">
          Admin
        </h1>
        <Link href="/" className="text-xs text-escola-creme-50 hover:text-escola-creme">
          &larr; Voltar ao site
        </Link>
      </div>

      {/* Admin nav */}
      <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-escola-border">
        {ADMIN_NAV.map(({ href, label }) => {
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
