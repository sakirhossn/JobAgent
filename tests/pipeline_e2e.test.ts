import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { orchestrator } from "@/lib/orchestrator";
import { websiteApplicationAgent } from "@/lib/application/website-agent";

describe("Autonomous End-to-End Recruitment Pipeline", () => {
  it("executes the complete 12-step pipeline and verifies database integrity", async () => {
    // 1. DISCOVER & DEDUPLICATE
    const discoveryRes = await orchestrator.runJobDiscovery();
    expect(discoveryRes.discovered).toBeGreaterThanOrEqual(5);

    // Verify jobs stored in DB with preserved original descriptions
    const allJobs = await prisma.job.findMany();
    expect(allJobs.length).toBeGreaterThanOrEqual(5);
    for (const job of allJobs) {
      expect(job.originalDescription.length).toBeGreaterThan(20);
      expect(job.contentHash.length).toBe(64);
    }

    // 2. ANALYZE & MATCH
    const daJob = allJobs.find((j) => j.title.includes("Junior Data Analyst"));
    expect(daJob).toBeDefined();

    const analysisRes = await orchestrator.analyzeAndMatchJob(daJob!.id);
    expect(analysisRes.requirements).toBeDefined();
    expect(analysisRes.matchResult.classification).toBe("AUTO_APPLY_ELIGIBLE");
    expect(analysisRes.matchResult.overallScore).toBeGreaterThanOrEqual(75);

    // Verify Chemical engineering exclusion
    const chemJob = allJobs.find((j) => j.title.includes("Chemical Process"));
    if (chemJob) {
      const chemRes = await orchestrator.analyzeAndMatchJob(chemJob.id);
      expect(chemRes.matchResult.isExcluded).toBe(true);
      expect(chemRes.matchResult.classification).toBe("NOT_ELIGIBLE");
    }

    // 3. TAILOR CV & PREPARE APPLICATION
    const applicationId = await orchestrator.prepareApplication(daJob!.id);
    expect(applicationId).toBeDefined();

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        cvVersion: true,
        events: true,
      },
    });

    expect(application).toBeDefined();
    expect(application?.cvVersionId).toBeDefined();
    expect(application?.cvVersion?.pdfPath).toBeDefined();
    expect(application?.coverLetterText).toBeDefined();

    // 4. SUBMIT APPLICATION VIA WEBSITE FORM AUTOMATION
    const websiteRes = await websiteApplicationAgent.processWebsiteApplication(applicationId);
    expect(websiteRes.success).toBe(true);
    expect(websiteRes.confirmationId).toBeDefined();

    // 5. VERIFY DATABASE & AUDIT LOGS
    const updatedApp = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        events: { orderBy: { createdAt: "asc" } },
        answers: true,
      },
    });

    expect(updatedApp?.status).toBe("CONFIRMED");
    expect(updatedApp?.confirmationId).toBeDefined();
    expect(updatedApp?.submittedAt).toBeDefined();

    // Verify all form questions were answered from verified profile
    expect(updatedApp?.answers.length).toBeGreaterThan(0);
    for (const ans of updatedApp!.answers) {
      expect(ans.isVerifiedFromProfile).toBe(true);
    }

    // Verify complete immutable event timeline
    expect(updatedApp?.events.length).toBeGreaterThanOrEqual(3);
    const eventStatuses = updatedApp?.events.map((e) => e.toStatus);
    expect(eventStatuses).toContain("APPLICATION_STARTED");
    expect(eventStatuses).toContain("SUBMITTED");
    expect(eventStatuses).toContain("CONFIRMED");

    // Reset policy mode back to default APPROVAL_REQUIRED
    await prisma.setting.update({
      where: { key: "APPLICATION_POLICY" },
      data: { value: "APPROVAL_REQUIRED" },
    });
  }, 30000);
});
