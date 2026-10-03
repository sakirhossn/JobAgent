import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const method = url.searchParams.get("method");
    const search = url.searchParams.get("search");

    const where: any = {};
    if (status) where.status = status;
    if (method) where.applicationMethod = method;
    if (search) {
      where.job = {
        OR: [
          { title: { contains: search } },
          { company: { contains: search } },
        ],
      };
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            applicationUrl: true,
            originalDescription: true,
          },
        },
        cvVersion: {
          select: { id: true, title: true, pdfPath: true, generatedAt: true },
        },
        events: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: applications.length,
      applications: applications.map((a) => ({
        id: a.id,
        status: a.status,
        applicationMethod: a.applicationMethod,
        submittedAt: a.submittedAt,
        confirmationId: a.confirmationId,
        emailRecipient: a.emailRecipient,
        emailMessageId: a.emailMessageId,
        jobTitle: a.job.title,
        company: a.job.company,
        jobLocation: a.job.location,
        jobId: a.job.id,
        cvTitle: a.cvVersion?.title,
        cvPath: a.cvVersion?.pdfPath,
        lastEvent: a.events[0] || null,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
