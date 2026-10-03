import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        requirements: true,
        matches: true,
        sourceLinks: { include: { source: true } },
        applications: {
          include: {
            cvVersion: true,
            events: { orderBy: { createdAt: "desc" } },
            humanTasks: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    const match = job.matches[0] || null;
    let factorBreakdown = [];
    if (match?.factorBreakdown) {
      try {
        factorBreakdown = JSON.parse(match.factorBreakdown);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        contentHash: job.contentHash,
        title: job.title,
        company: job.company,
        location: job.location,
        remoteType: job.remoteType,
        employmentType: job.employmentType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        experienceRequired: job.experienceRequired,
        educationRequired: job.educationRequired,
        originalDescription: job.originalDescription, // FULL ORIGINAL TEXT PRESERVED
        applicationUrl: job.applicationUrl,
        applicationEmail: job.applicationEmail,
        postedAt: job.postedAt,
        discoveredAt: job.discoveredAt,
        isExcluded: job.isExcluded,
        exclusionReason: job.exclusionReason,
        sources: job.sourceLinks.map((s) => ({
          id: s.id,
          sourceName: s.source.name,
          sourceJobId: s.sourceJobId,
          sourceUrl: s.sourceUrl,
          discoveredAt: s.discoveredAt,
        })),
        requirements: job.requirements
          ? {
              ...job.requirements,
              mandatorySkills: JSON.parse(job.requirements.mandatorySkills || "[]"),
              preferredSkills: JSON.parse(job.requirements.preferredSkills || "[]"),
              locationConstraints: JSON.parse(job.requirements.locationConstraints || "[]"),
            }
          : null,
        match: match
          ? {
              overallScore: match.overallScore,
              roleRelevanceScore: match.roleRelevanceScore,
              skillsMatchScore: match.skillsMatchScore,
              classification: match.classification,
              recommendationReason: match.recommendationReason,
              matchedSkills: JSON.parse(match.matchedSkills || "[]"),
              missingSkills: JSON.parse(match.missingSkills || "[]"),
              factorBreakdown,
            }
          : null,
        application: job.applications[0] || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
