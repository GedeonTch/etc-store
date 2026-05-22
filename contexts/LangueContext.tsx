"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Langue, traductions, CleTraduction } from "@/lib/i18n";

interface LangueContextType {
  langue: Langue;
  setLangue: (l: Langue) => void;
  t: (cle: CleTraduction) => string;
}

const LangueContext = createContext<LangueContextType>({
  langue: "fr",
  setLangue: () => {},
  t: (cle) => cle,
});

export function LangueProvider({ children }: { children: ReactNode }) {
  const [langue, setLangueState] = useState<Langue>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("etch-langue") as Langue | null;
    if (saved && ["fr", "en", "sw"].includes(saved)) setLangueState(saved);
  }, []);

  const setLangue = (l: Langue) => {
    setLangueState(l);
    localStorage.setItem("etch-langue", l);
  };

  const t = (cle: CleTraduction): string =>
    traductions[langue][cle] || traductions.fr[cle] || cle;

  return (
    <LangueContext.Provider value={{ langue, setLangue, t }}>
      {children}
    </LangueContext.Provider>
  );
}

export const useLangue = () => useContext(LangueContext);
