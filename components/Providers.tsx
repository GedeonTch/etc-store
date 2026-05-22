"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LangueProvider } from "@/contexts/LangueContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
        <LangueProvider>{children}</LangueProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
