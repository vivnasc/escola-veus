"use client";

// UniverseContext separa visualmente os dois "mundos" do admin: os cursos
// da Escola dos Véus (Loranne, alunas, funil, aulas) e o Ancient Ground
// (canal YouTube próprio, natureza, música AG). Afecta só navegação e
// filtragem — todas as páginas existentes mantêm os seus URLs e lógica.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Universe = "cursos" | "ag";

type UniverseContextValue = {
  universe: Universe;
  setUniverse: (u: Universe) => void;
};

const STORAGE_KEY = "admin-universe";

const UniverseContext = createContext<UniverseContextValue | null>(null);

export function UniverseProvider({ children }: { children: ReactNode }) {
  const [universe, setUniverseState] = useState<Universe>("cursos");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "cursos" || saved === "ag") setUniverseState(saved);
    } catch { /* ignore */ }
  }, []);

  const setUniverse = useCallback((u: Universe) => {
    setUniverseState(u);
    try {
      localStorage.setItem(STORAGE_KEY, u);
    } catch { /* ignore */ }
  }, []);

  return (
    <UniverseContext.Provider value={{ universe, setUniverse }}>
      {children}
    </UniverseContext.Provider>
  );
}

export function useUniverse(): UniverseContextValue {
  const ctx = useContext(UniverseContext);
  if (!ctx) {
    // Não rebenta: devolve default "cursos" e no-op. Permite que componentes
    // antigos não tenham de saber do provider se ainda não foi embrulhado.
    return { universe: "cursos", setUniverse: () => {} };
  }
  return ctx;
}
