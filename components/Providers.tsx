"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LangueProvider } from "@/contexts/LangueContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="theme" disableTransitionOnChange>
        <LangueProvider>{children}</LangueProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
