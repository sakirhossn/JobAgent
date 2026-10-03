import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [emails, templates] = await Promise.all([
      prisma.email.findMany({
        include: {
          application: {
            include: {
              job: { select: { title: true, company: true } },
            },
          },
        },
        orderBy: { sentAt: "desc" },
      }),
      prisma.emailTemplate.findMany(),
    ]);

    return NextResponse.json({
      success: true,
      emails,
      templates,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
