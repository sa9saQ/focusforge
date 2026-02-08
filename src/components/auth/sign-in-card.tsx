"use client";

import { useMemo, useState } from "react";
import { Chrome, Github, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthProvider = "google" | "github";

export const SignInCard = (): React.ReactElement => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isBusy, setIsBusy] = useState(false);

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/dashboard`;
  }, []);

  const startOAuth = async (provider: AuthProvider): Promise<void> => {
    setIsBusy(true);
    setStatus("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      console.error("OAuth sign in failed", { provider, error });
      const message = error instanceof Error ? error.message : "Authentication failed.";
      setStatus(message);
      setIsBusy(false);
    }
  };

  const startEmailSignIn = async (): Promise<void> => {
    if (!email) {
      setStatus("Please enter your email address.");
      return;
    }

    setIsBusy(true);
    setStatus("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        throw error;
      }

      setStatus("Magic link sent. Please check your inbox.");
    } catch (error: unknown) {
      console.error("Email sign in failed", { error });
      const message = error instanceof Error ? error.message : "Unable to send magic link.";
      setStatus(message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Use one of the authentication methods below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button type="button" className="w-full" onClick={() => void startOAuth("google")} disabled={isBusy}>
          <Chrome className="size-4" />
          Continue with Google
        </Button>
        <Button type="button" className="w-full" variant="secondary" onClick={() => void startOAuth("github")} disabled={isBusy}>
          <Github className="size-4" />
          Continue with GitHub
        </Button>

        <div className="pt-2">
          <p className="mb-2 text-sm font-medium">Email magic link</p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isBusy}
            />
            <Button type="button" variant="outline" onClick={() => void startEmailSignIn()} disabled={isBusy}>
              <Mail className="size-4" />
              Send
            </Button>
          </div>
        </div>

        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </CardContent>
    </Card>
  );
};
