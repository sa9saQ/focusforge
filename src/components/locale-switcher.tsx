"use client";

import { useEffect, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { type AppLocale, routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALE_STORAGE_KEY = "focusforge_locale";

const isLocale = (value: string): value is AppLocale => {
  return routing.locales.includes(value as AppLocale);
};

export const LocaleSwitcher = (): React.ReactElement => {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);

    if (!stored) {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      return;
    }

    if (!isLocale(stored) || stored === locale) {
      return;
    }

    startTransition(() => {
      router.replace(pathname, { locale: stored });
    });
  }, [locale, pathname, router]);

  const switchLocale = (nextLocale: AppLocale): void => {
    if (nextLocale === locale || isPending) {
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    }

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="inline-flex rounded-md border border-input bg-background p-0.5" role="group" aria-label={t("ariaLabel")}>
      {routing.locales.map((entry) => {
        const active = entry === locale;
        const localeLabel = entry.toUpperCase();

        return (
          <button
            key={entry}
            type="button"
            onClick={() => switchLocale(entry)}
            aria-pressed={active}
            aria-label={t("switchTo", { locale: t(`localeName.${entry}`) })}
            className={cn(
              "min-w-10 rounded-[5px] px-2 py-1 text-xs font-semibold transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {localeLabel}
          </button>
        );
      })}
    </div>
  );
};
