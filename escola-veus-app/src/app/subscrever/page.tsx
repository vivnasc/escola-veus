"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const PLANS = [
  {
    id: "trial",
    name: "Experimenta",
    price: "Grátis",
    period: "7 dias",
    description: "Acesso completo durante 7 dias. Sem compromisso.",
    cta: "Começar trial",
    highlight: false,
  },
  {
    id: "monthly",
    name: "Mensal",
    price: "$19",
    period: "/mes",
    description: "Acesso a todos os cursos. Cancela quando quiseres.",
    cta: "Subscrever mensal",
    highlight: true,
  },
  {
    id: "annual",
    name: "Anual",
    price: "$149",
    period: "/ano",
    description: "Poupa 35%. Acesso completo durante 12 meses.",
    cta: "Subscrever anual",
    highlight: false,
  },
] as const;

export default function SubscreverPage() {
  const { user } = useAuth();

  function handleSubscribe(planId: string) {
    if (!user) {
      window.location.href = "/entrar";
      return;
    }
    // TODO: Stripe checkout integration
    alert(`Stripe checkout para plano: ${planId} (em breve)`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-12 pb-8">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-semibold text-escola-creme">
          Subscrever
        </h1>
        <p className="mt-2 text-sm text-escola-creme-50">
          Acesso a todos os cursos. Um unico preco. Ao teu ritmo.
        </p>
      </header>

      <div className="space-y-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-5 transition-colors ${
              plan.highlight
                ? "border-escola-dourado bg-escola-dourado/5"
                : "border-escola-border bg-escola-card"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-lg font-medium text-escola-creme">
                {plan.name}
              </h2>
              <div className="text-right">
                <span className="text-2xl font-semibold text-escola-dourado">
                  {plan.price}
                </span>
                <span className="text-xs text-escola-creme-50">
                  {plan.period}
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm text-escola-creme-50">
              {plan.description}
            </p>
            <button
              onClick={() => handleSubscribe(plan.id)}
              className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 ${
                plan.highlight
                  ? "bg-escola-dourado text-escola-bg"
                  : "border border-escola-dourado/40 text-escola-dourado"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-escola-creme-50">
        Subscreve, acede a tudo. Cancela, perde o acesso.
        <br />
        Simples como deve ser.
      </p>
    </div>
  );
}
