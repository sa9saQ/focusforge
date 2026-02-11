import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SignInCard } from "@/components/auth/sign-in-card";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("loginTitle"),
  };
}

export default async function LoginPage(): Promise<React.ReactElement> {
  const t = await getTranslations("Login");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 md:px-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-[var(--font-heading)] text-xl font-semibold">
          FocusForge
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>
      <section className="grid flex-1 items-center gap-10 py-8 md:grid-cols-2">
        <div className="space-y-4">
          <h1 className="font-[var(--font-heading)] text-4xl font-bold leading-tight">{t("title")}</h1>
          <p className="max-w-md text-muted-foreground">{t("description")}</p>
        </div>
        <SignInCard />
      </section>
    </main>
  );
}
