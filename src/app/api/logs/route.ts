import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [agentRuns, errors, recentEvents] = await Promise.all([
      prisma.agentRun.findMany({
        orderBy: { startedAt: "desc" },
        take: 30,
      }),
      prisma.agentError.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.applicationEvent.findMany({
        include: {
          application: {
            include: { job: { select: { title: true, company: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      success: true,
      agentRuns,
      errors,
      recentEvents,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
