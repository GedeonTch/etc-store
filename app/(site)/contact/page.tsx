import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact & Négociations — ETCH Bukavu",
  description: "Contactez ETCH, envoyez un message ou négociez via notre espace de discussion.",
};

export default function ContactPage() {
  return <ContactClient />;
}
