import Link from "next/link";
import { SignInCard } from "@/components/auth/sign-in-card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage(): React.ReactElement {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 md:px-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-[var(--font-heading)] text-xl font-semibold">
          FocusForge
        </Link>
        <ThemeToggle />
      </header>
      <section className="grid flex-1 items-center gap-10 py-8 md:grid-cols-2">
        <div className="space-y-4">
          <h1 className="font-[var(--font-heading)] text-4xl font-bold leading-tight">Sign in and start your first focus sprint.</h1>
          <p className="max-w-md text-muted-foreground">
            Continue with Google, GitHub, or email magic link. Your tasks and XP will be synced to Supabase.
          </p>
        </div>
        <SignInCard />
      </section>
    </main>
  );
}
