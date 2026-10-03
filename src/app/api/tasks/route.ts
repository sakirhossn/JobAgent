import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "PENDING";

    const tasks = await prisma.agentTask.findMany({
      where: status === "ALL" ? {} : { status },
      include: {
        application: {
          include: { job: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      tasks: tasks.map((t) => ({
        id: t.id,
        taskType: t.taskType,
        priority: t.priority,
        title: t.title,
        reason: t.reason,
        requiredAction: t.requiredAction,
        status: t.status,
        resolutionNotes: t.resolutionNotes,
        resolvedAt: t.resolvedAt,
        actionPayload: t.actionPayload ? JSON.parse(t.actionPayload) : null,
        createdAt: t.createdAt,
        applicationId: t.applicationId,
        jobTitle: t.application?.job.title,
        company: t.application?.job.company,
        applicationUrl: t.application?.applicationUrl || t.application?.job.applicationUrl,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
