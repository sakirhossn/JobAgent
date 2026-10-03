import { prisma } from "../prisma";
import { PolicyMode } from "@/types";

export interface PolicyCheckResult {
  canSubmit: boolean;
  mode: PolicyMode;
  reason?: string;
  violations: string[];
}

export async function getApplicationPolicyMode(): Promise<PolicyMode> {
  const setting = await prisma.setting.findUnique({
    where: { key: "APPLICATION_POLICY" },
  });
  return (setting?.value as PolicyMode) || "APPROVAL_REQUIRED";
}

export async function getMaxDailyApplications(): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: { key: "MAX_DAILY_APPLICATIONS" },
  });
  return setting ? parseInt(setting.value, 10) : 10;
}

export async function getTodayApplicationsCount(): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return prisma.application.count({
    where: {
      submittedAt: { gte: startOfDay },
      status: { in: ["SUBMITTED", "CONFIRMED"] },
    },
  });
}

/**
 * Validates whether an application can proceed to submission according to strict safety checks.
 */
export async function evaluateApplicationPolicy(applicationId: string): Promise<PolicyCheckResult> {
  const violations: string[] = [];
  const mode = await getApplicationPolicyMode();

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: { include: { matches: true } },
      candidate: {
        include: { education: true, experience: true, skills: true },
      },
      cvVersion: true,
      humanTasks: { where: { status: "PENDING" } },
    },
  });

  if (!app) {
    return { canSubmit: false, mode, violations: ["Application not found"] };
  }

  // 1. Check if already submitted
  if (app.status === "SUBMITTED" || app.status === "CONFIRMED") {
    violations.push("Application has already been submitted.");
  }

  // 2. Check policy mode
  if (mode === "MANUAL") {
    violations.push("System policy is set to MANUAL mode: Automatic submission disabled.");
  } else if (mode === "APPROVAL_REQUIRED" && app.status !== "APPROVED" && app.status !== "CV_GENERATED") {
    violations.push("Policy is APPROVAL_REQUIRED: Administrator explicit approval required.");
  }

  // 3. Daily Limit check
  const maxDaily = await getMaxDailyApplications();
  const todayCount = await getTodayApplicationsCount();
  if (todayCount >= maxDaily) {
    violations.push(`Daily application limit reached (${todayCount}/${maxDaily}).`);
  }

  // 4. Candidate Profile Completeness
  if (!app.candidate.fullName || !app.candidate.email || !app.candidate.phone) {
    violations.push("Candidate profile is incomplete (missing contact info).");
  }

  // 5. Tailored CV generated
  if (!app.cvVersionId) {
    violations.push("No tailored CV generated for this application.");
  }

  // 6. Unresolved Human Actions
  if (app.humanTasks.length > 0) {
    violations.push(`Has ${app.humanTasks.length} unresolved Human Action Required tasks.`);
  }

  // 7. Job Exclusions
  if (app.job.isExcluded) {
    violations.push(`Job is marked excluded: ${app.job.exclusionReason}`);
  }

  // 8. Eligibility Check
  const match = app.job.matches[0];
  if (match && match.classification === "NOT_ELIGIBLE") {
    violations.push("Job match classification is NOT_ELIGIBLE.");
  }

  return {
    canSubmit: violations.length === 0,
    mode,
    violations,
    reason: violations.length > 0 ? violations.join("; ") : undefined,
  };
}
