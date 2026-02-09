import Link from "next/link";
import { ArrowRight, Bot, Gamepad2, NotebookPen, Sparkles, Timer, Trophy } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI Breakdown",
    description: "Turn one overwhelming goal into clear 5-25 minute steps.",
  },
  {
    icon: Timer,
    title: "Pomodoro Focus",
    description: "Focus sprints and breaks tuned for ADHD-friendly momentum.",
  },
  {
    icon: Trophy,
    title: "XP Progress",
    description: "Earn XP for every win and level up with visible progress.",
  },
];

const howItWorks = [
  {
    icon: NotebookPen,
    title: "Add your task",
    description: "Drop in a messy thought and get started in seconds.",
  },
  {
    icon: Bot,
    title: "AI breaks it down",
    description: "Get small, realistic steps that remove decision fatigue.",
  },
  {
    icon: Gamepad2,
    title: "Focus & earn XP",
    description: "Complete steps, run sessions, and stack momentum daily.",
  },
];

const testimonials = [
  {
    quote: "FocusForge is the first planner that feels like it understands my brain.",
    author: "Maya R.",
  },
  {
    quote: "I stopped doom-listing. The small AI steps actually get me moving.",
    author: "Jordan T.",
  },
  {
    quote: "The XP loop keeps me honest without feeling like pressure.",
    author: "Chris L.",
  },
];

export default function Home(): React.ReactElement {
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
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#testimonials" className="transition-colors hover:text-foreground">
              Reviews
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm">
              <Link href="/dashboard">Open app</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative z-10 mt-10 grid items-center gap-8 md:mt-16 md:grid-cols-2">
        <div className="space-y-5">
          <div className="hero-entrance flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              Built for ADHD minds
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
              Free forever
            </Badge>
          </div>

          <h1 className="hero-entrance hero-entrance-delay font-[var(--font-heading)] text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Finish big goals by taking tiny, winnable steps.
          </h1>
          <p className="hero-entrance hero-entrance-delay-2 max-w-xl text-base text-muted-foreground sm:text-lg">
            FocusForge combines AI decomposition, Pomodoro, and gamification so your next action is always obvious.
          </p>
          <div className="hero-entrance hero-entrance-delay-2 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/dashboard">
                Start now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="rounded-[2.2rem] border border-primary/35 bg-gradient-to-b from-card to-card/80 p-3 shadow-2xl">
            <div className="relative rounded-[1.8rem] border border-border/60 bg-background/80 p-4">
              <div className="mx-auto mb-3 h-1.5 w-20 rounded-full bg-muted" />
              <div className="space-y-3">
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                  <p className="text-xs font-semibold text-primary">Today&apos;s mission</p>
                  <p className="mt-1 text-sm font-medium">Launch new portfolio page</p>
                </div>
                <div className="grid gap-2">
                  <div className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm">Step 1: draft headline</div>
                  <div className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm">Step 2: update project cards</div>
                  <div className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm">Step 3: publish + share</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                  Focus session running: 18:22
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 mt-16 scroll-mt-24">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
          <p className="text-sm text-muted-foreground">Simple 3-step flow</p>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Step {index + 1}</p>
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
          <h2 className="font-[var(--font-heading)] text-2xl font-bold tracking-tight sm:text-3xl">Features</h2>
          <p className="text-sm text-muted-foreground">Built for consistency</p>
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
          <h2 className="font-[var(--font-heading)] text-2xl font-bold tracking-tight sm:text-3xl">Loved by ADHD minds</h2>
          <p className="text-sm text-muted-foreground">What users say</p>
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
        <p>© 2026 FocusForge. Built for ADHD minds that think differently.</p>
      </footer>
    </main>
  );
}
