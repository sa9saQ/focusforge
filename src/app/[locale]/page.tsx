import type { Metadata } from "next";
import { ArrowRight, Bot, Gamepad2, NotebookPen, Sparkles, Timer, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("homeTitle"),
  };
}

export default async function HomePage(): Promise<React.ReactElement> {
  const t = await getTranslations("Landing");

  const features = [
    {
      icon: Sparkles,
      title: t("features.ai.title"),
      description: t("features.ai.description"),
    },
    {
      icon: Timer,
      title: t("features.pomodoro.title"),
      description: t("features.pomodoro.description"),
    },
    {
      icon: Trophy,
      title: t("features.xp.title"),
      description: t("features.xp.description"),
    },
  ];

  const howItWorks = [
    {
      icon: NotebookPen,
      title: t("how.step1.title"),
      description: t("how.step1.description"),
    },
    {
      icon: Bot,
      title: t("how.step2.title"),
      description: t("how.step2.description"),
    },
    {
      icon: Gamepad2,
      title: t("how.step3.title"),
      description: t("how.step3.description"),
    },
  ];

  const testimonials = [
    {
      quote: t("testimonials.item1.quote"),
      author: t("testimonials.item1.author"),
    },
    {
      quote: t("testimonials.item2.quote"),
      author: t("testimonials.item2.author"),
    },
    {
      quote: t("testimonials.item3.quote"),
      author: t("testimonials.item3.author"),
    },
  ];

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-x-clip px-6 pb-10 md:px-10">
      <div className="pointer-events-none absolute inset-x-[-20%] top-[-120px] z-0 h-[420px] rounded-full bg-gradient-to-br from-primary/20 via-primary/8 to-transparent blur-3xl" />

      <header className="sticky top-0 z-50 -mx-6 border-b border-border/60 bg-background/75 px-6 py-3 backdrop-blur-xl md:-mx-10 md:px-10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
          <Link href="/" className="font-[var(--font-heading)] text-xl font-bold tracking-tight">
            FocusForge
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              {t("nav.features")}
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              {t("nav.howItWorks")}
            </a>
            <a href="#testimonials" className="transition-colors hover:text-foreground">
              {t("nav.reviews")}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            <Button asChild size="sm">
              <Link href="/dashboard">{t("openApp")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative z-10 mt-10 grid items-center gap-8 md:mt-16 md:grid-cols-2">
        <div className="space-y-5">
          <div className="hero-entrance flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              {t("badges.adhd")}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              {t("badges.free")}
            </Badge>
          </div>

          <h1 className="hero-entrance hero-entrance-delay font-[var(--font-heading)] text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="hero-entrance hero-entrance-delay-2 max-w-xl text-base text-muted-foreground sm:text-lg">
            {t("hero.description")}
          </p>
          <div className="hero-entrance hero-entrance-delay-2 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/dashboard">
                {t("hero.primaryCta")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="#how-it-works">{t("hero.secondaryCta")}</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="rounded-[2.2rem] border border-primary/35 bg-gradient-to-b from-card to-card/80 p-3 shadow-2xl">
            <div className="relative rounded-[1.8rem] border border-border/60 bg-background/80 p-4">
              <div className="mx-auto mb-3 h-1.5 w-20 rounded-full bg-muted" />
              <div className="space-y-3">
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                  <p className="text-xs font-semibold text-primary">{t("preview.missionLabel")}</p>
                  <p className="mt-1 text-sm font-medium">{t("preview.missionTitle")}</p>
                </div>
                <div className="grid gap-2">
                  <div className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm">{t("preview.step1")}</div>
                  <div className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm">{t("preview.step2")}</div>
                  <div className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm">{t("preview.step3")}</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                  {t("preview.timer")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 mt-16 scroll-mt-24">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-2xl font-bold tracking-tight sm:text-3xl">{t("how.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("how.subheading")}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {howItWorks.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="bg-card/85">
                <CardContent className="space-y-3 p-5">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {t("how.stepLabel", { index: index + 1 })}
                  </p>
                  <h3 className="font-[var(--font-heading)] text-xl font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="features" className="relative z-10 mt-14 scroll-mt-24">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-2xl font-bold tracking-tight sm:text-3xl">{t("features.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("features.subheading")}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="group border-border/70 bg-card/80 hover:scale-[1.015]">
                <CardContent className="space-y-3 p-5">
                  <Icon className="size-5 text-primary transition-transform duration-200 group-hover:scale-110" />
                  <h3 className="font-[var(--font-heading)] text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="testimonials" className="relative z-10 mt-14 scroll-mt-24">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-2xl font-bold tracking-tight sm:text-3xl">{t("testimonials.heading")}</h2>
          <p className="text-sm text-muted-foreground">{t("testimonials.subheading")}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.author} className="border-border/70 bg-card/85">
              <CardContent className="space-y-4 p-5">
                <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{item.quote}&rdquo;</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{item.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="relative z-10 mt-16 border-t border-border/50 pt-6 pb-8 text-center text-xs text-muted-foreground">
        <p>{t("footer")}</p>
      </footer>
    </main>
  );
}
