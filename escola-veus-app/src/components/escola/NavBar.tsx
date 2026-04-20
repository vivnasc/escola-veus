"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const ADMIN_EMAILS = ["viv.saraiva@gmail.com"];

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: HomeIcon },
  { href: "/cursos", label: "Cursos", icon: BookIcon },
  { href: "/conta", label: "Conta", icon: UserIcon },
] as const;

export function NavBar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isAdminPage = pathname?.startsWith("/admin");
  const isLanding = pathname === "/" && !user && !loading;
  const isEntrar = pathname === "/entrar";
  const isAdminUser = user?.email && ADMIN_EMAILS.includes(user.email);
  if (isAdminPage || isLanding || isEntrar) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-escola-border bg-escola-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around pb-[env(safe-area-inset-bottom,0px)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-3 text-xs transition-colors ${
                active ? "text-escola-dourado" : "text-escola-creme-50 hover:text-escola-creme"
              }`}
            >
              <Icon active={!!active} />
              <span>{label}</span>
            </Link>
          );
        })}
        {isAdminUser && (
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-0.5 px-4 py-3 text-xs transition-colors ${
              pathname?.startsWith("/admin") ? "text-escola-dourado" : "text-escola-creme-50 hover:text-escola-creme"
            }`}
          >
            <AdminIcon active={!!pathname?.startsWith("/admin")} />
            <span>Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BookIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function AdminIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15l-2 5 9-11h-5l2-5-9 11z" />
    </svg>
  );
}
