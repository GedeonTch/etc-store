import { Suspense } from "react";
import { Metadata } from "next";
import InscriptionClient from "./InscriptionClient";

export const metadata: Metadata = {
  title: "Créer un compte — ETCH",
  description: "Inscrivez-vous pour commander et nous contacter.",
};

export default function InscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-[var(--text-muted)]">
          Chargement...
        </div>
      }
    >
      <InscriptionClient />
    </Suspense>
  );
}
