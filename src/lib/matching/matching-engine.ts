import { CandidateFullProfile } from "../profile/integrity";
import {
  FactorBreakdownItem,
  JobRequirementAnalysis,
  MatchResult,
} from "@/types";
import { checkDeterministicExclusions } from "./exclusion-engine";

export interface MatchingThresholds {
  autoApplyMinScore: number;
  reviewRequiredMinScore: number;
}

export const DEFAULT_THRESHOLDS: MatchingThresholds = {
  autoApplyMinScore: 75,
  reviewRequiredMinScore: 50,
};

/**
 * Transparent 10-Factor Matching Engine.
 */
export function evaluateCandidateJobMatch(
  job: {
    title: string;
    company: string;
    location?: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    originalDescription: string;
    requirements: JobRequirementAnalysis;
  },
  candidate: CandidateFullProfile,
  thresholds: MatchingThresholds = DEFAULT_THRESHOLDS
): MatchResult {
  const req = job.requirements;
  const factors: FactorBreakdownItem[] = [];

  // Check Exclusions first
  const exclusion = checkDeterministicExclusions(
    {
      title: job.title,
      company: job.company,
      location: job.location || "",
      originalDescription: job.originalDescription || (job as any).description || "",
      salaryMax: job.salaryMax,
    },
    req,
    candidate
  );

  if (exclusion.isExcluded) {
    factors.push({
      factor: "Candidate Exclusions",
      status: "EXCLUDED",
      detail: exclusion.reason || "Matched exclusion rule.",
      weight: 100,
      score: 0,
    });

    return {
      roleRelevanceScore: 0,
      skillsMatchScore: 0,
      overallScore: 0,
      matchedSkills: [],
      missingSkills: req.mandatorySkills,
      factorBreakdown: factors,
      classification: "NOT_ELIGIBLE",
      recommendationReason: `Job excluded: ${exclusion.reason}`,
      isExcluded: true,
      exclusionReason: exclusion.reason,
    };
  } else {
    factors.push({
      factor: "Candidate Exclusions",
      status: "MATCH",
      detail: "No active exclusions triggered (Clear of Chemical Eng, Experience caps).",
      weight: 10,
      score: 10,
    });
  }

  // 1. Role Relevance (Weight: 20)
  const titleLower = job.title.toLowerCase();
  const matchedTargetRole = candidate.targetJobTitles.find((t) =>
    titleLower.includes(t.toLowerCase()) || req.roleCategory.toLowerCase().includes(t.toLowerCase())
  );
  let roleScore = 0;
  if (matchedTargetRole) {
    roleScore = 20;
    factors.push({
      factor: "Role Relevance",
      status: "MATCH",
      detail: `Matches target career role: "${matchedTargetRole}"`,
      weight: 20,
      score: 20,
    });
  } else {
    roleScore = 5;
    factors.push({
      factor: "Role Relevance",
      status: "PARTIAL_MATCH",
      detail: `General role category "${req.roleCategory}" partially aligns with candidate portfolio`,
      weight: 20,
      score: 5,
    });
  }

  // 2. Mandatory Skills (Weight: 25)
  const candidateSkillNames = candidate.skills.map((s) => s.name.toLowerCase());
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const ms of req.mandatorySkills) {
    if (candidateSkillNames.some((cs) => cs.includes(ms.toLowerCase()) || ms.toLowerCase().includes(cs))) {
      matchedSkills.push(ms);
    } else {
      missingSkills.push(ms);
    }
  }

  const mandatoryRatio = req.mandatorySkills.length > 0 ? matchedSkills.length / req.mandatorySkills.length : 1;
  const mandatoryScore = Math.round(mandatoryRatio * 25);
  factors.push({
    factor: "Mandatory Skills",
    status: mandatoryRatio === 1 ? "MATCH" : mandatoryRatio > 0.4 ? "PARTIAL_MATCH" : "MISSING",
    detail: `Matched: [${matchedSkills.join(", ") || "None"}], Missing: [${missingSkills.join(", ") || "None"}]`,
    weight: 25,
    score: mandatoryScore,
  });

  // 3. Preferred Skills (Weight: 10)
  const matchedPreferred: string[] = [];
  for (const ps of req.preferredSkills) {
    if (candidateSkillNames.some((cs) => cs.includes(ps.toLowerCase()) || ps.toLowerCase().includes(cs))) {
      matchedPreferred.push(ps);
    }
  }
  const preferredRatio = req.preferredSkills.length > 0 ? matchedPreferred.length / req.preferredSkills.length : 1;
  const preferredScore = Math.round(preferredRatio * 10);
  factors.push({
    factor: "Preferred Skills",
    status: matchedPreferred.length > 0 ? "MATCH" : "PARTIAL_MATCH",
    detail: `Matched preferred: [${matchedPreferred.join(", ") || "None"}]`,
    weight: 10,
    score: preferredScore,
  });

  // 4. Education (Weight: 10)
  factors.push({
    factor: "Education",
    status: "MATCH",
    detail: `Candidate holds Bachelor's degree (University of Calcutta, 8.6 CGPA)`,
    weight: 10,
    score: 10,
  });

  // 5. Experience (Weight: 10)
  let expScore = 10;
  if (req.fresherEligible || req.minExperienceYears <= 1) {
    factors.push({
      factor: "Experience",
      status: "ACCEPTED_FOR_FRESHER",
      detail: "Position accepts Freshers / 0-1 year internship experience.",
      weight: 10,
      score: 10,
    });
  } else {
    expScore = 4;
    factors.push({
      factor: "Experience",
      status: "PARTIAL_MATCH",
      detail: `Requires ${req.minExperienceYears} yrs experience; candidate has 6 months internship.`,
      weight: 10,
      score: 4,
    });
  }

  // 6. Location (Weight: 10)
  const jobLoc = (job.location || "").toLowerCase();
  const isKolkata = jobLoc.includes("kolkata") || jobLoc.includes("west bengal");
  const isRemote = jobLoc.includes("remote") || req.locationConstraints.includes("Remote");
  const isPreferred = candidate.preferredLocations.some((loc) => jobLoc.includes(loc.toLowerCase()));

  let locScore = 0;
  if (isKolkata || isRemote || isPreferred) {
    locScore = 10;
    factors.push({
      factor: "Location",
      status: "MATCH",
      detail: isKolkata ? "Direct match: Candidate lives in Kolkata." : isRemote ? "Remote role supported." : "Preferred city match.",
      weight: 10,
      score: 10,
    });
  } else {
    locScore = 3;
    factors.push({
      factor: "Location",
      status: "PARTIAL_MATCH",
      detail: `Location "${job.location}" is outside immediate preference list.`,
      weight: 10,
      score: 3,
    });
  }

  // 7. Salary (Weight: 5)
  let salScore = 5;
  if (job.salaryMax) {
    if (job.salaryMax >= candidate.salaryMinExpectation) {
      factors.push({
        factor: "Salary",
        status: "MATCH",
        detail: `Offered ₹${job.salaryMin || "?"} - ₹${job.salaryMax} meets expectation (₹${candidate.salaryMinExpectation} - ₹${candidate.salaryMaxExpectation}).`,
        weight: 5,
        score: 5,
      });
    } else {
      salScore = 2;
      factors.push({
        factor: "Salary",
        status: "PARTIAL_MATCH",
        detail: `Offered max ₹${job.salaryMax} is below preferred minimum ₹${candidate.salaryMinExpectation}.`,
        weight: 5,
        score: 2,
      });
    }
  } else {
    factors.push({
      factor: "Salary",
      status: "UNKNOWN",
      detail: "Not disclosed in posting; evaluated neutrally.",
      weight: 5,
      score: 5,
    });
  }

  // 8. Joining Availability (Weight: 5)
  const reqTimeline = req.joiningTimelineDays || 30;
  if (candidate.joiningAvailabilityDays <= reqTimeline) {
    factors.push({
      factor: "Joining Availability",
      status: "MATCH",
      detail: `Candidate joins in ${candidate.joiningAvailabilityDays} days, satisfying required ${reqTimeline} days.`,
      weight: 5,
      score: 5,
    });
  } else {
    factors.push({
      factor: "Joining Availability",
      status: "PARTIAL_MATCH",
      detail: `Requires faster join than ${candidate.joiningAvailabilityDays} days.`,
      weight: 5,
      score: 2,
    });
  }

  // 9. Employment Type (Weight: 5)
  factors.push({
    factor: "Employment Type",
    status: "MATCH",
    detail: "Full-Time opportunity matches candidate objectives.",
    weight: 5,
    score: 5,
  });

  const overallScore =
    roleScore +
    mandatoryScore +
    preferredScore +
    10 + // Education
    expScore +
    locScore +
    salScore +
    5 + // Joining
    5; // Employment Type

  const roleRelevanceScore = Math.round((roleScore / 20) * 100);
  const skillsMatchScore = Math.round((mandatoryScore / 25) * 100);

  let classification: "AUTO_APPLY_ELIGIBLE" | "REVIEW_REQUIRED" | "NOT_ELIGIBLE" = "NOT_ELIGIBLE";
  if (overallScore >= thresholds.autoApplyMinScore && missingSkills.length <= 1) {
    classification = "AUTO_APPLY_ELIGIBLE";
  } else if (overallScore >= thresholds.reviewRequiredMinScore) {
    classification = "REVIEW_REQUIRED";
  }

  return {
    roleRelevanceScore,
    skillsMatchScore,
    overallScore,
    matchedSkills,
    missingSkills,
    factorBreakdown: factors,
    classification,
    recommendationReason:
      classification === "AUTO_APPLY_ELIGIBLE"
        ? `Strong fit with ${overallScore}% score across role relevance and core skills.`
        : classification === "REVIEW_REQUIRED"
        ? `Moderate fit (${overallScore}%). Human review suggested for missing criteria: ${missingSkills.join(", ") || "experience gap"}.`
        : `Does not meet eligibility threshold (Score: ${overallScore}%).`,
    isExcluded: false,
  };
}
