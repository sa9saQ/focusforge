"use client";

import { type ReactNode, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps): ReactNode => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
};
