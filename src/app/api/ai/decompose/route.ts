import { NextResponse } from "next/server";
import { z } from "zod";
import { createTaskDecomposer } from "@/lib/ai";
import type { TaskDecomposeInput } from "@/lib/ai/types";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

const stripHtmlTags = (value: string): string => {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstAddress = forwardedFor.split(",")[0]?.trim();
    if (firstAddress) {
      return firstAddress;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
};

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }

  const existing = rateLimitStore.get(ip);
  if (!existing || existing.resetTime <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  rateLimitStore.set(ip, {
    count: existing.count + 1,
    resetTime: existing.resetTime,
  });
  return false;
};

const requestSchema = z.object({
  taskTitle: z.string().transform(stripHtmlTags).pipe(z.string().min(1).max(120)),
  taskDescription: z.string().max(1000).optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      {
        message: "Too many requests. Please try again in a minute.",
      },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const input: TaskDecomposeInput = {
      taskTitle: parsed.taskTitle,
      ...(parsed.taskDescription ? { taskDescription: parsed.taskDescription } : {}),
    };

    const decomposer = createTaskDecomposer();
    const subtasks = await decomposer.decompose(input);

    return NextResponse.json({ subtasks });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Invalid request payload.",
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("AI decompose failed", { error });

    return NextResponse.json(
      {
        message: "Failed to decompose task.",
      },
      { status: 500 },
    );
  }
}
