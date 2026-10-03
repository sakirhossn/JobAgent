import { CandidateFullProfile } from "../profile/integrity";
import { JobRequirementAnalysis } from "@/types";

export interface ExclusionCheckResult {
  isExcluded: boolean;
  reason?: string;
  ruleTriggered?: string;
}

/**
 * Deterministic Exclusion Engine.
 * Evaluates hard exclusion constraints before AI matching.
 */
export function checkDeterministicExclusions(
  job: {
    title: string;
    company: string;
    location: string;
    originalDescription: string;
    salaryMax?: number | null;
    experienceRequired?: string | null;
  },
  requirements: JobRequirementAnalysis,
  candidate: CandidateFullProfile
): ExclusionCheckResult {
  const titleLower = (job.title || "").toLowerCase();
  const descLower = (job.originalDescription || "").toLowerCase();

  // 1. Excluded Job Titles / Domains (e.g. Chemical Engineering)
  for (const excluded of candidate.excludedJobTitles) {
    const exclLower = excluded.toLowerCase();
    if (titleLower.includes(exclLower) || descLower.includes(exclLower)) {
      return {
        isExcluded: true,
        reason: `Role matches candidate exclusion rule: "${excluded}".`,
        ruleTriggered: "EXCLUDED_JOB_TITLE",
      };
    }
  }

  // 2. Maximum Experience Cap for Fresher (e.g., jobs requiring > 2 years when candidate is fresher)
  if (candidate.fresherStatus) {
    if (requirements.minExperienceYears > 2 || requirements.seniority === "Senior" || requirements.seniority === "Executive") {
      return {
        isExcluded: true,
        reason: `Requires ${requirements.minExperienceYears}+ years experience / Senior level, exceeding fresher threshold.`,
        ruleTriggered: "EXPERIENCE_EXCEEDS_CAP",
      };
    }
  }

  // 3. Mandatory Education Constraint
  if (requirements.educationDegree) {
    const candidateHasDegree = candidate.education.some((e) =>
      e.degree.toLowerCase().includes("bachelor") || e.degree.toLowerCase().includes("bsc") || e.degree.toLowerCase().includes("b.sc")
    );
    if (!candidateHasDegree) {
      return {
        isExcluded: true,
        reason: `Mandatory education degree "${requirements.educationDegree}" not satisfied by candidate.`,
        ruleTriggered: "MANDATORY_EDUCATION_MISSING",
      };
    }
  }

  // 4. Incomplete candidate profile check
  if (!candidate.fullName || !candidate.email || !candidate.phone) {
    return {
      isExcluded: true,
      reason: "Candidate profile lacks mandatory contact information.",
      ruleTriggered: "INCOMPLETE_PROFILE",
    };
  }

  return { isExcluded: false };
}
