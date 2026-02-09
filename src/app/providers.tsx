"use client";

import { type ReactNode, useEffect } from "react";
import { RouteFade } from "@/components/route-fade";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { applyAccentColor, getLocalSettings } from "@/lib/settings";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps): ReactNode => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncAccent = async (): Promise<void> => {
      try {
        const settings = await getLocalSettings();
        if (isMounted) {
          applyAccentColor(settings.accentColor);
        }
      } catch {
        applyAccentColor("purple");
      }
    };

    void syncAccent();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider>
        <RouteFade>{children}</RouteFade>
      </ToastProvider>
    </ThemeProvider>
  );
};
