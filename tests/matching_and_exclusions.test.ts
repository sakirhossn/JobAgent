import { describe, it, expect } from "vitest";
import { checkDeterministicExclusions } from "@/lib/matching/exclusion-engine";
import { evaluateCandidateJobMatch } from "@/lib/matching/matching-engine";
import { CandidateFullProfile } from "@/lib/profile/integrity";
import { JobRequirementAnalysis } from "@/types";

describe("Matching & Deterministic Exclusion Engine", () => {
  const mockCandidate: CandidateFullProfile = {
    id: "cand-1",
    fullName: "Sakir Hassain",
    email: "sakir@test.com",
    phone: "+91 9876543210",
    currentCity: "Kolkata",
    preferredLocations: ["Kolkata", "Remote", "Bengaluru"],
    joiningAvailabilityDays: 5,
    salaryMinExpectation: 30000,
    salaryMaxExpectation: 40000,
    salaryCurrency: "INR",
    targetJobTitles: ["Data Analyst", "IT", "Supply Chain", "Operations", "Business Analyst"],
    excludedJobTitles: ["Chemical Engineering", "Chemical Plant Engineer"],
    fresherStatus: true,
    summary: "Fresher Data Analyst with SQL and Python.",
    education: [
      {
        institution: "University of Calcutta",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Applications",
        startYear: 2021,
        endYear: 2024,
      },
    ],
    experience: [
      {
        company: "Apex Logistics",
        title: "Operations & Data Analyst Intern",
        location: "Kolkata",
        isInternship: true,
        startDate: "2024-01",
        description: "SQL and Excel reporting.",
        achievements: ["Automated dashboards"],
      },
    ],
    skills: [
      { name: "SQL", category: "Technical", proficiency: "ADVANCED", verified: true },
      { name: "Python", category: "Technical", proficiency: "INTERMEDIATE", verified: true },
      { name: "Excel", category: "Tools", proficiency: "ADVANCED", verified: true },
      { name: "Power BI", category: "Tools", proficiency: "INTERMEDIATE", verified: true },
    ],
    projects: [
      {
        title: "Sales Dashboard",
        description: "Power BI and SQL dashboard",
        technologies: ["SQL", "Power BI"],
      },
    ],
    certifications: [],
    languages: [{ language: "English", proficiency: "PROFESSIONAL" }],
  };

  it("strictly excludes Chemical Engineering jobs per candidate exclusion rule", () => {
    const chemJob = {
      title: "Chemical Process & Plant Engineer",
      company: "Haldia Petrochemical",
      location: "Kolkata",
      originalDescription: "Candidate must have Chemical Engineering degree and supervise distillation.",
    };
    const reqs: JobRequirementAnalysis = {
      roleCategory: "Chemical Engineering",
      seniority: "Entry-Level",
      mandatorySkills: ["Chemical Engineering", "Thermodynamics"],
      preferredSkills: [],
      minExperienceYears: 0,
      fresherEligible: true,
      educationDegree: "B.Tech Chemical Engineering",
      locationConstraints: ["Kolkata"],
      applicationRoute: "WEBSITE",
    };

    const res = checkDeterministicExclusions(chemJob, reqs, mockCandidate);
    expect(res.isExcluded).toBe(true);
    expect(res.ruleTriggered).toBe("EXCLUDED_JOB_TITLE");

    const match = evaluateCandidateJobMatch(
      { ...chemJob, requirements: reqs },
      mockCandidate
    );
    expect(match.classification).toBe("NOT_ELIGIBLE");
    expect(match.isExcluded).toBe(true);
  });

  it("strictly excludes Senior Architect jobs requiring 10+ years experience for fresher candidate", () => {
    const seniorJob = {
      title: "Lead Enterprise Data Architect",
      company: "BigData Corp",
      location: "Kolkata",
      originalDescription: "Requires 10-15 years experience in petabyte scale data warehousing.",
    };
    const reqs: JobRequirementAnalysis = {
      roleCategory: "Data Architecture",
      seniority: "Senior",
      mandatorySkills: ["Hadoop", "Snowflake"],
      preferredSkills: [],
      minExperienceYears: 10,
      fresherEligible: false,
      locationConstraints: ["Kolkata"],
      applicationRoute: "WEBSITE",
    };

    const res = checkDeterministicExclusions(seniorJob, reqs, mockCandidate);
    expect(res.isExcluded).toBe(true);
    expect(res.ruleTriggered).toBe("EXPERIENCE_EXCEEDS_CAP");
  });

  it("classifies Junior Data Analyst in Kolkata as AUTO_APPLY_ELIGIBLE with high factor match", () => {
    const daJob = {
      title: "Junior Data Analyst",
      company: "Kolkata Tech Solutions",
      location: "Kolkata",
      salaryMin: 32000,
      salaryMax: 38000,
      originalDescription: "Hiring Junior Data Analyst with SQL, Python, Excel. Freshers welcome in Kolkata. Immediate joiner.",
    };
    const reqs: JobRequirementAnalysis = {
      roleCategory: "Data Analytics",
      seniority: "Entry-Level",
      mandatorySkills: ["SQL", "Excel", "Python"],
      preferredSkills: ["Power BI"],
      minExperienceYears: 0,
      fresherEligible: true,
      educationDegree: "Bachelor's Degree",
      locationConstraints: ["Kolkata"],
      joiningTimelineDays: 7,
      applicationRoute: "WEBSITE",
    };

    const match = evaluateCandidateJobMatch(
      { ...daJob, requirements: reqs },
      mockCandidate
    );

    expect(match.isExcluded).toBe(false);
    expect(match.classification).toBe("AUTO_APPLY_ELIGIBLE");
    expect(match.overallScore).toBeGreaterThanOrEqual(75);
    expect(match.matchedSkills).toContain("SQL");
    expect(match.matchedSkills).toContain("Python");
    expect(match.matchedSkills).toContain("Excel");
    expect(match.missingSkills.length).toBe(0);

    // Verify factor-by-factor breakdown is present and transparent
    expect(match.factorBreakdown.length).toBe(10);
    const roleFactor = match.factorBreakdown.find((f) => f.factor === "Role Relevance");
    expect(roleFactor?.status).toBe("MATCH");
    const expFactor = match.factorBreakdown.find((f) => f.factor === "Experience");
    expect(expFactor?.status).toBe("ACCEPTED_FOR_FRESHER");
  });
});
