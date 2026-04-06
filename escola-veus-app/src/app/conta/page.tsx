"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ContaPage() {
  const { user, loading, isSubscribed, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <p className="text-sm text-escola-creme-50">A carregar...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-sm flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-3 font-serif text-2xl font-semibold text-escola-creme">
          Conta
        </h1>
        <p className="mb-6 text-sm text-escola-creme-50">
          Entra para veres o teu perfil e subscricao.
        </p>
        <Link
          href="/entrar"
          className="rounded-lg bg-escola-dourado px-6 py-2.5 text-sm font-medium text-escola-bg"
        >
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-8">
      <h1 className="mb-8 font-serif text-2xl font-semibold text-escola-creme">
        A tua conta
      </h1>

      {/* Profile */}
      <div className="mb-6 rounded-xl border border-escola-border bg-escola-card p-5">
        <h2 className="mb-2 text-xs uppercase tracking-wide text-escola-dourado">
          Perfil
        </h2>
        <p className="text-sm text-escola-creme">{user.email}</p>
      </div>

      {/* Subscription */}
      <div className="mb-6 rounded-xl border border-escola-border bg-escola-card p-5">
        <h2 className="mb-2 text-xs uppercase tracking-wide text-escola-dourado">
          Subscricao
        </h2>
        {isSubscribed ? (
          <div>
            <p className="text-sm text-escola-creme">Activa</p>
            <p className="mt-1 text-xs text-escola-creme-50">
              Tens acesso a todos os cursos.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-escola-creme-50">Sem subscricao activa</p>
            <Link
              href="/subscrever"
              className="mt-3 inline-block rounded-lg bg-escola-dourado px-4 py-2 text-sm font-medium text-escola-bg"
            >
              Subscrever
            </Link>
          </div>
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full rounded-lg border border-escola-border px-4 py-2.5 text-sm text-escola-creme-50 transition-colors hover:text-escola-creme"
      >
        Sair
      </button>
    </div>
  );
}
