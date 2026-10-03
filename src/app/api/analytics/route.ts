import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalJobs,
      eligibleJobs,
      totalApplications,
      applicationsToday,
      pendingApproval,
      humanActions,
      emailsSent,
      interviewsCount,
      offersCount,
      rejectedCount,
      failedCount,
      confirmedCount,
      allApplications,
      allJobs,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.jobMatch.count({ where: { classification: "AUTO_APPLY_ELIGIBLE" } }),
      prisma.application.count(),
      prisma.application.count({ where: { submittedAt: { gte: startOfDay } } }),
      prisma.application.count({ where: { status: { in: ["REVIEW_REQUIRED", "CV_GENERATED"] } } }),
      prisma.agentTask.count({ where: { status: "PENDING" } }),
      prisma.email.count({ where: { deliveryStatus: "SENT" } }),
      prisma.interview.count(),
      prisma.offer.count(),
      prisma.application.count({ where: { status: "REJECTED" } }),
      prisma.application.count({ where: { status: "FAILED" } }),
      prisma.application.count({ where: { status: "CONFIRMED" } }),
      prisma.application.findMany({
        include: { job: true },
        take: 200,
      }),
      prisma.job.findMany({
        take: 200,
      }),
    ]);

    // Aggregate applications by role
    const byRoleMap: Record<string, number> = {};
    for (const app of allApplications) {
      const role = app.job.title;
      byRoleMap[role] = (byRoleMap[role] || 0) + 1;
    }
    const applicationsByRole = Object.entries(byRoleMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Aggregate applications by company
    const byCompanyMap: Record<string, number> = {};
    for (const app of allApplications) {
      byCompanyMap[app.job.company] = (byCompanyMap[app.job.company] || 0) + 1;
    }
    const applicationsByCompany = Object.entries(byCompanyMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Status funnel
    const statusFunnel = [
      { status: "Discovered", count: totalJobs },
      { status: "Eligible", count: eligibleJobs },
      { status: "Prepared", count: totalApplications },
      { status: "Submitted/Confirmed", count: confirmedCount },
      { status: "Interview", count: interviewsCount },
      { status: "Offer", count: offersCount },
    ];

    const responseRate = totalApplications > 0 ? Math.round(((interviewsCount + offersCount) / totalApplications) * 100) : 0;
    const interviewRate = totalApplications > 0 ? Math.round((interviewsCount / totalApplications) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalJobs,
        eligibleJobs,
        totalApplications,
        applicationsToday,
        pendingApproval,
        humanActions,
        emailsSent,
        interviewsCount,
        offersCount,
        rejectedCount,
        failedCount,
        confirmedCount,
        responseRate,
        interviewRate,
      },
      charts: {
        applicationsByRole,
        applicationsByCompany,
        statusFunnel,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
