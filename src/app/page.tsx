import Link from "next/link";
import { ArrowRight, Sparkles, Timer, Trophy } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
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

export default function Home(): React.ReactElement {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 md:px-10">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="font-[var(--font-heading)] text-xl font-semibold">FocusForge</p>
          <p className="text-sm text-muted-foreground">ADHD-friendly task management</p>
        </div>
        <ThemeToggle />
      </header>

      <section className="mt-16 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
        <div className="space-y-5">
          <h1 className="font-[var(--font-heading)] text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Finish big goals by taking tiny, winnable steps.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            FocusForge combines AI decomposition, Pomodoro, and gamification so your next action is always obvious.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-6">
              <Link href="/login">
                Start for free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </div>
        </div>

        <Card className="border-accent/50 bg-card/80 backdrop-blur">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-foreground">Daily Loop</p>
            <ol className="space-y-3 text-sm">
              <li>1. Add one task you care about.</li>
              <li>2. Break it down with AI suggestions.</li>
              <li>3. Run a 25-minute focus sprint.</li>
              <li>4. Mark complete and collect XP.</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="border-border/60 bg-card/70 backdrop-blur">
              <CardContent className="space-y-3 p-5">
                <Icon className="size-5 text-primary" />
                <h2 className="font-[var(--font-heading)] text-lg font-semibold">{feature.title}</h2>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}
