import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [masterCvs, generatedCvs, templates] = await Promise.all([
      prisma.cvVersion.findMany({
        orderBy: { versionNumber: "desc" },
      }),
      prisma.generatedCv.findMany({
        include: {
          candidate: { select: { fullName: true } },
          template: { select: { name: true } },
          applications: {
            include: {
              job: { select: { title: true, company: true } },
            },
          },
        },
        orderBy: { generatedAt: "desc" },
      }),
      prisma.cvTemplate.findMany(),
    ]);

    return NextResponse.json({
      success: true,
      masterCvs,
      generatedCvs,
      templates,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
