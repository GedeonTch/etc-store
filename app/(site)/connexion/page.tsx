import { Suspense } from "react";
import { Metadata } from "next";
import ConnexionClient from "./ConnexionClient";

export const metadata: Metadata = {
  title: "Connexion — ETCH",
  description: "Connectez-vous pour commander ou nous écrire.",
};

export default function ConnexionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-[var(--text-muted)]">
          Chargement...
        </div>
      }
    >
      <ConnexionClient />
    </Suspense>
  );
}
