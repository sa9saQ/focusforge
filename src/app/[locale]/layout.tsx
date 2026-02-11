import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Providers } from "@/app/providers";
import { routing } from "@/i18n/routing";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams(): Array<{ locale: string }> {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: {
      default: "FocusForge",
      template: "%s | FocusForge",
    },
    description: t("description"),
    manifest: "/manifest.json",
    themeColor: "#4a7c59",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "FocusForge",
    },
    icons: {
      icon: "/icons/icon-192.png",
      apple: "/icons/icon-512.png",
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps): Promise<React.ReactElement> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  );
}
