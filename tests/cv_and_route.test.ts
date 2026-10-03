import { describe, it, expect } from "vitest";
import { MockAIProvider } from "@/lib/ai/mock-ai-provider";
import { detectApplicationRoute } from "@/lib/application/route-detector";
import { CandidateFullProfile } from "@/lib/profile/integrity";
import { JobRequirementAnalysis } from "@/types";

describe("CV Tailoring & Application Route Detector", () => {
  const candidate: CandidateFullProfile = {
    id: "cand-1",
    fullName: "Sakir Hassain",
    email: "sakir@test.com",
    phone: "+91 9876543210",
    currentCity: "Kolkata",
    preferredLocations: ["Kolkata", "Remote"],
    joiningAvailabilityDays: 5,
    salaryMinExpectation: 30000,
    salaryMaxExpectation: 40000,
    salaryCurrency: "INR",
    targetJobTitles: ["Data Analyst", "Operations"],
    excludedJobTitles: [],
    fresherStatus: true,
    summary: "Fresher Data Analyst with SQL and Python.",
    education: [
      {
        institution: "University of Calcutta",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Applications",
        startYear: 2021,
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
    ],
    projects: [
      {
        title: "OmniChannel Retail Dashboard",
        description: "Power BI and SQL dashboard",
        technologies: ["SQL", "Python"],
      },
    ],
    certifications: [],
    languages: [{ language: "English", proficiency: "PROFESSIONAL" }],
  };

  const reqs: JobRequirementAnalysis = {
    roleCategory: "Data Analytics",
    seniority: "Entry-Level",
    mandatorySkills: ["SQL", "Python"],
    preferredSkills: ["Excel"],
    minExperienceYears: 0,
    fresherEligible: true,
    locationConstraints: ["Kolkata"],
    applicationRoute: "WEBSITE",
  };

  it("tailors CV with verified candidate facts and matching ATS keywords", async () => {
    const ai = new MockAIProvider();
    const cv = await ai.generateCV(
      {
        title: "Junior Data Analyst",
        company: "Kolkata Tech Solutions",
        description: "Hiring Junior Data Analyst with SQL, Python, Excel.",
        requirements: reqs,
      },
      candidate
    );

    expect(cv.title).toContain("Junior Data Analyst");
    expect(cv.atsKeywordsMatched).toContain("SQL");
    expect(cv.atsKeywordsMatched).toContain("Python");
    expect(cv.summary).toContain("Kolkata");
    expect(cv.highlightedSkills.length).toBeGreaterThan(0);
    // Never fabricated
    expect(cv.education[0].institution).toBe("University of Calcutta");
  });

  it("generates professional, truthful cover letter", async () => {
    const ai = new MockAIProvider();
    const letter = await ai.generateCoverLetter(
      {
        title: "Junior Data Analyst",
        company: "Kolkata Tech Solutions",
        description: "Hiring Junior Data Analyst.",
        requirements: reqs,
      },
      candidate
    );

    expect(letter).toContain("Kolkata Tech Solutions");
    expect(letter).toContain("Sakir Hassain");
    expect(letter).toContain("5 days");
  });

  it("detects DIRECT EMAIL route when posting provides application email", () => {
    const route = detectApplicationRoute({
      applicationEmail: "careers@bengallogistics.com",
      originalDescription: "Send resume to careers@bengallogistics.com",
    });
    expect(route.route).toBe("EMAIL");
    expect(route.emailRecipient).toBe("careers@bengallogistics.com");
  });

  it("detects WEBSITE route when posting provides portal URL", () => {
    const route = detectApplicationRoute({
      applicationUrl: "http://localhost:3000/api/mock-portal/apply?jobId=123",
      originalDescription: "Apply online at our career portal.",
    });
    expect(route.route).toBe("WEBSITE");
    expect(route.applicationUrl).toContain("mock-portal");
  });

  it("detects MANUAL route when CAPTCHA or security controls are detected", () => {
    const route = detectApplicationRoute({
      applicationUrl: "http://example.com/apply",
      originalDescription: "Candidate must solve Cloudflare CAPTCHA and complete in-person walk-in.",
    });
    expect(route.route).toBe("MANUAL");
  });
});
