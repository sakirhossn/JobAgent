import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const profile = await prisma.candidateProfile.findFirst({
      include: {
        education: true,
        experience: true,
        skills: true,
        projects: true,
        certifications: true,
        languages: true,
        cvVersions: { orderBy: { versionNumber: "desc" } },
      },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        preferredLocations: JSON.parse(profile.preferredLocations || "[]"),
        targetJobTitles: JSON.parse(profile.targetJobTitles || "[]"),
        excludedJobTitles: JSON.parse(profile.excludedJobTitles || "[]"),
        experience: profile.experience.map((exp) => ({
          ...exp,
          achievements: exp.achievements ? JSON.parse(exp.achievements) : [],
        })),
        projects: profile.projects.map((proj) => ({
          ...proj,
          technologies: JSON.parse(proj.technologies || "[]"),
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = await prisma.candidateProfile.findFirst();

    if (!existing) {
      return NextResponse.json({ success: false, error: "Candidate profile not initialized." }, { status: 404 });
    }

    const updated = await prisma.candidateProfile.update({
      where: { id: existing.id },
      data: {
        fullName: body.fullName ?? existing.fullName,
        email: body.email ?? existing.email,
        phone: body.phone ?? existing.phone,
        currentCity: body.currentCity ?? existing.currentCity,
        preferredLocations: body.preferredLocations
          ? JSON.stringify(body.preferredLocations)
          : existing.preferredLocations,
        joiningAvailabilityDays: body.joiningAvailabilityDays ?? existing.joiningAvailabilityDays,
        salaryMinExpectation: body.salaryMinExpectation ?? existing.salaryMinExpectation,
        salaryMaxExpectation: body.salaryMaxExpectation ?? existing.salaryMaxExpectation,
        targetJobTitles: body.targetJobTitles
          ? JSON.stringify(body.targetJobTitles)
          : existing.targetJobTitles,
        excludedJobTitles: body.excludedJobTitles
          ? JSON.stringify(body.excludedJobTitles)
          : existing.excludedJobTitles,
        fresherStatus: body.fresherStatus ?? existing.fresherStatus,
        summary: body.summary ?? existing.summary,
        portfolioUrl: body.portfolioUrl ?? existing.portfolioUrl,
        githubUrl: body.githubUrl ?? existing.githubUrl,
        linkedinUrl: body.linkedinUrl ?? existing.linkedinUrl,
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
