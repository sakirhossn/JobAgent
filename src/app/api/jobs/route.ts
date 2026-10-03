import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const role = url.searchParams.get("role") || "";
    const location = url.searchParams.get("location") || "";
    const classification = url.searchParams.get("classification") || "";
    const isExcluded = url.searchParams.get("isExcluded");

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { contains: search } },
        { location: { contains: search } },
        { originalDescription: { contains: search } },
      ];
    }

    if (role) {
      where.title = { contains: role };
    }

    if (location) {
      where.location = { contains: location };
    }

    if (isExcluded !== null && isExcluded !== undefined && isExcluded !== "") {
      where.isExcluded = isExcluded === "true";
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        requirements: true,
        matches: true,
        sourceLinks: { include: { source: true } },
        applications: {
          select: { id: true, status: true, applicationMethod: true, submittedAt: true },
        },
      },
      orderBy: { discoveredAt: "desc" },
      take: 100,
    });

    let filtered = jobs;
    if (classification) {
      filtered = jobs.filter((j) => j.matches.some((m) => m.classification === classification));
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      jobs: filtered.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        remoteType: j.remoteType,
        employmentType: j.employmentType,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        salaryCurrency: j.salaryCurrency,
        experienceRequired: j.experienceRequired,
        applicationUrl: j.applicationUrl,
        applicationEmail: j.applicationEmail,
        postedAt: j.postedAt,
        discoveredAt: j.discoveredAt,
        isExcluded: j.isExcluded,
        exclusionReason: j.exclusionReason,
        sources: j.sourceLinks.map((sl) => ({ name: sl.source.name, sourceJobId: sl.sourceJobId })),
        match: j.matches[0]
          ? {
              overallScore: j.matches[0].overallScore,
              classification: j.matches[0].classification,
              recommendationReason: j.matches[0].recommendationReason,
            }
          : null,
        application: j.applications[0] || null,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
