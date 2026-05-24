import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ETCH — Appareils d'occasion d'Europe | Bukavu",
    template: "%s — ETCH",
  },
  description:
    "Achetez des appareils électroniques et meubles d'occasion importés d'Europe. Téléphones, écrans, générateurs, salons. Bukavu, Sud-Kivu.",
  keywords: ["ETCH", "Tchibanvunya", "occasion", "Europe", "Bukavu", "électronique", "Sud-Kivu"],
  openGraph: {
    type: "website",
    locale: "fr_CD",
    siteName: "ETCH — Établissement Tchibanvunya",
    images: [{ url: "/logo-etch.png", width: 800, height: 600, alt: "ETCH Logo" }],
  },
  icons: { icon: "/logo-etch.png", apple: "/logo-etch.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
