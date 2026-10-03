import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transitionApplicationState } from "@/lib/application/state-machine";
import { ApplicationStatus } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const app = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        job: {
          include: {
            requirements: true,
            matches: true,
            sourceLinks: { include: { source: true } },
          },
        },
        candidate: true,
        cvVersion: true,
        answers: true,
        documents: true,
        events: { orderBy: { createdAt: "asc" } }, // Chronological timeline!
        emails: { orderBy: { sentAt: "desc" } },
        humanTasks: { orderBy: { createdAt: "desc" } },
        interviews: { orderBy: { scheduledAt: "asc" } },
        offers: true,
      },
    });

    if (!app) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      application: {
        id: app.id,
        status: app.status,
        applicationMethod: app.applicationMethod,
        applicationUrl: app.applicationUrl,
        emailRecipient: app.emailRecipient,
        emailMessageId: app.emailMessageId,
        submittedAt: app.submittedAt,
        confirmationId: app.confirmationId,
        confirmationDetails: app.confirmationDetails ? JSON.parse(app.confirmationDetails) : null,
        coverLetterText: app.coverLetterText,
        notes: app.notes,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        job: {
          id: app.job.id,
          title: app.job.title,
          company: app.job.company,
          location: app.job.location,
          originalDescription: app.job.originalDescription,
          match: app.job.matches[0] || null,
          requirements: app.job.requirements || null,
        },
        cvVersion: app.cvVersion,
        answers: app.answers,
        documents: app.documents,
        events: app.events,
        emails: app.emails,
        humanTasks: app.humanTasks,
        interviews: app.interviews,
        offers: app.offers,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, notes } = body;

    const current = await prisma.application.findUnique({
      where: { id: params.id },
    });
    if (!current) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    if (status && status !== current.status) {
      await transitionApplicationState(
        params.id,
        status as ApplicationStatus,
        `Status manually updated by administrator to ${status}`
      );
    }

    if (notes !== undefined) {
      await prisma.application.update({
        where: { id: params.id },
        data: { notes },
      });
    }

    return NextResponse.json({ success: true, message: "Application updated." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
