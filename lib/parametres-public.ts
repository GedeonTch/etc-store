export const CLES_SITE = [
  "nom_etablissement",
  "marque",
  "tagline",
  "adresse",
  "email_contact",
  "telephone_1",
  "telephone_2",
  "telephone_3",
  "whatsapp",
] as const;

export type ParametresSite = Record<string, string>;

export function telHref(tel: string): string {
  return `tel:${tel.replace(/\s/g, "")}`;
}

export function whatsappHref(numero: string): string {
  const digits = numero.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}
