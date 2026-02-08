import { NextResponse } from "next/server";
import { z } from "zod";
import { createTaskDecomposer } from "@/lib/ai";

const requestSchema = z.object({
  taskTitle: z.string().min(1).max(120),
  taskDescription: z.string().max(1000).optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const input = requestSchema.parse(body) as { taskTitle: string; taskDescription?: string };

    const decomposer = createTaskDecomposer();
    const subtasks = await decomposer.decompose(input as any);

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
