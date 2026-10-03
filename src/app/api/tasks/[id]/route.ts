import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transitionApplicationState } from "@/lib/application/state-machine";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { action, resolutionNotes } = body;
    // Actions: "RESOLVE" | "SKIP" | "REJECT" | "RETRY"

    const task = await prisma.agentTask.findUnique({
      where: { id: params.id },
      include: { application: true },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    let newStatus = "RESOLVED";
    if (action === "SKIP") newStatus = "SKIPPED";
    if (action === "REJECT") newStatus = "REJECTED";
    if (action === "RETRY") newStatus = "PENDING";

    await prisma.agentTask.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        resolutionNotes: resolutionNotes || `Action executed: ${action}`,
        resolvedAt: action !== "RETRY" ? new Date() : null,
      },
    });

    // If task is tied to an application, update application state accordingly
    if (task.applicationId) {
      if (action === "RESOLVE") {
        await transitionApplicationState(
          task.applicationId,
          "APPROVED",
          `Human action task resolved by administrator: ${resolutionNotes || "Manual resolution completed."}`
        );
      } else if (action === "SKIP") {
        await transitionApplicationState(
          task.applicationId,
          "SKIPPED",
          `Application skipped by administrator from Human Action Center.`
        );
      } else if (action === "REJECT") {
        await transitionApplicationState(
          task.applicationId,
          "REJECTED",
          `Application rejected by administrator.`
        );
      }
    }

    return NextResponse.json({ success: true, message: `Task ${action} processed successfully.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
