import { Metadata } from "next";
import CreditsClient from "./CreditsClient";

export const metadata: Metadata = {
  title: "Crédits — ETCH",
  description: "Informations sur le créateur du site ETCH — Tchibanvunya Gedeon.",
};

export default function CreditsPage() {
  return <CreditsClient />;
}
