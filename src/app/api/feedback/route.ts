import { NextResponse } from "next/server";
import { z } from "zod";

const RATE_LIMIT_WINDOW_MS = 300_000; // 5 minutes
const RATE_LIMIT_MAX = 3;

type RateLimitRecord = { count: number; resetTime: number };
const rateLimitStore = new Map<string, RateLimitRecord>();

const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") || "unknown";
};

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime <= now) rateLimitStore.delete(key);
  }
  const existing = rateLimitStore.get(ip);
  if (!existing || existing.resetTime <= now) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (existing.count >= RATE_LIMIT_MAX) return true;
  rateLimitStore.set(ip, { count: existing.count + 1, resetTime: existing.resetTime });
  return false;
};

const stripHtml = (s: string): string => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "other"]),
  message: z.string().transform(stripHtml).pipe(z.string().min(1).max(2000)),
  email: z.string().email().optional().or(z.literal(undefined)),
  userAgent: z.string().max(500).optional(),
  screenSize: z.string().max(30).optional(),
  timestamp: z.string().optional(),
});

const typeEmojis: Record<string, string> = {
  bug: "🐛",
  feature: "💡",
  other: "💬",
};

const typeLabelMap: Record<string, string> = {
  bug: "bug",
  feature: "enhancement",
  other: "feedback",
};

export async function POST(request: Request): Promise<NextResponse> {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { message: "Too many feedback submissions. Please wait a few minutes." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const data = feedbackSchema.parse(body);

    const emoji = typeEmojis[data.type] || "💬";
    const label = typeLabelMap[data.type] || "feedback";

    const title = `${emoji} [${label}] ${data.message.slice(0, 80)}${data.message.length > 80 ? "..." : ""}`;

    const bodyParts = [
      `## ${emoji} ${label.charAt(0).toUpperCase() + label.slice(1)}`,
      "",
      data.message,
      "",
      "---",
      `**Type:** ${data.type}`,
      data.email ? `**Email:** ${data.email}` : null,
      data.screenSize ? `**Screen:** ${data.screenSize}` : null,
      data.userAgent ? `**User Agent:** \`${data.userAgent.slice(0, 200)}\`` : null,
      data.timestamp ? `**Submitted:** ${data.timestamp}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const githubToken = process.env.GITHUB_TOKEN;

    if (githubToken) {
      const response = await fetch("https://api.github.com/repos/sa9saQ/focusforge/issues", {
        method: "POST",
        headers: {
          Authorization: `token ${githubToken}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "FocusForge-Feedback",
        },
        body: JSON.stringify({
          title,
          body: bodyParts,
          labels: [label, "user-feedback"],
        }),
      });

      if (!response.ok) {
        console.error("GitHub issue creation failed", {
          status: response.status,
          body: await response.text().catch(() => ""),
        });
        // Still return success to user - we'll log for debugging
      }
    } else {
      // No GitHub token - just log
      console.log("Feedback received (no GITHUB_TOKEN):", JSON.stringify(data));
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid feedback data." },
        { status: 400 },
      );
    }

    console.error("Feedback submission failed", { error });
    return NextResponse.json(
      { message: "Failed to submit feedback." },
      { status: 500 },
    );
  }
}
