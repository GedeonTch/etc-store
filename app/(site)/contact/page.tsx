import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contacter ETCH — Bukavu, Sud-Kivu",
  description: "Contactez l'Établissement Tchibanvunya (ETCH) à Bukavu. Formulaire, WhatsApp, téléphone et adresse.",
};

export default function ContactPage() {
  return <ContactClient />;
}
