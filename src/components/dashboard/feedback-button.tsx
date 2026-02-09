"use client";

import { useState } from "react";
import { Loader2, MessageSquarePlus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeedbackType = "bug" | "feature" | "other";

const typeLabels: Record<FeedbackType, { label: string; emoji: string }> = {
  bug: { label: "Bug report", emoji: "🐛" },
  feature: { label: "Feature request", emoji: "💡" },
  other: { label: "Other", emoji: "💬" },
};

export const FeedbackButton = (): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (): Promise<void> => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackType,
          message: trimmed,
          email: email.trim() || undefined,
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message || "Failed to send feedback.");
      }

      setSubmitted(true);
      setMessage("");
      setEmail("");

      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 z-40 flex size-12 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105",
          "md:bottom-6 md:right-6",
          isOpen && "hidden",
        )}
        aria-label="Send feedback"
      >
        <MessageSquarePlus className="size-5" />
      </button>

      {/* Modal overlay */}
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="relative z-10 mx-4 mb-4 w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-xl sm:mb-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Send feedback</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {submitted ? (
              <div className="mt-6 mb-2 text-center">
                <p className="text-3xl">🎉</p>
                <p className="mt-2 font-medium">Thanks for your feedback!</p>
                <p className="text-sm text-muted-foreground">We&apos;ll review it soon.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {/* Type selector */}
                <div className="flex gap-2">
                  {(Object.keys(typeLabels) as FeedbackType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFeedbackType(type)}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                        feedbackType === type
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent/50",
                      )}
                    >
                      {typeLabels[type].emoji} {typeLabels[type].label}
                    </button>
                  ))}
                </div>

                {/* Message */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    feedbackType === "bug"
                      ? "What happened? What did you expect?"
                      : feedbackType === "feature"
                        ? "What would you like to see?"
                        : "Tell us anything..."
                  }
                  rows={4}
                  maxLength={2000}
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />

                {/* Optional email */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional, for follow-up)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                {/* Submit */}
                <Button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting || !message.trim()}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {isSubmitting ? "Sending..." : "Send feedback"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Your feedback helps us improve FocusForge ❤️
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};
