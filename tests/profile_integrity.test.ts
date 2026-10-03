import { describe, it, expect } from "vitest";
import { resolveApplicationQuestion, CandidateFullProfile } from "@/lib/profile/integrity";

describe("Absolute Data Integrity Rule", () => {
  const candidate: CandidateFullProfile = {
    id: "cand-1",
    fullName: "Sakir Hassain",
    email: "sakir.jobpilot@gmail.com",
    phone: "+91 98765 43210",
    currentCity: "Kolkata",
    preferredLocations: ["Kolkata", "Remote", "Bengaluru"],
    joiningAvailabilityDays: 5,
    salaryMinExpectation: 30000,
    salaryMaxExpectation: 40000,
    salaryCurrency: "INR",
    targetJobTitles: ["Data Analyst", "IT", "Supply Chain", "Operations", "Business Analyst"],
    excludedJobTitles: ["Chemical Engineering"],
    fresherStatus: true,
    summary: "High-aptitude Fresher with SQL and Python.",
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
        description: "SQL reporting",
        achievements: [],
      },
    ],
    skills: [
      { name: "SQL", category: "Technical", proficiency: "ADVANCED", verified: true },
      { name: "Python", category: "Technical", proficiency: "INTERMEDIATE", verified: true },
    ],
    projects: [],
    certifications: [],
    languages: [{ language: "English", proficiency: "PROFESSIONAL" }],
  };

  it("correctly answers verified profile questions with exact truth", () => {
    const resName = resolveApplicationQuestion("What is your Full Name?", candidate);
    expect(resName.canAnswer).toBe(true);
    expect(resName.answer).toBe("Sakir Hassain");

    const resCity = resolveApplicationQuestion("Current City of residence?", candidate);
    expect(resCity.canAnswer).toBe(true);
    expect(resCity.answer).toBe("Kolkata");

    const resNotice = resolveApplicationQuestion("How soon can you join?", candidate);
    expect(resNotice.canAnswer).toBe(true);
    expect(resNotice.answer).toContain("5 days");

    const resSalary = resolveApplicationQuestion("What is your expected salary?", candidate);
    expect(resSalary.canAnswer).toBe(true);
    expect(resSalary.answer).toContain("30,000");

    const resSkill = resolveApplicationQuestion("Do you know SQL?", candidate);
    expect(resSkill.canAnswer).toBe(true);
    expect(resSkill.answer).toContain("SQL");
  });

  it("STRICTLY STOPS and refuses to fabricate unverified questions", () => {
    // Unverified skill: Scala
    const resScala = resolveApplicationQuestion("Do you have 3 years of Scala programming experience?", candidate);
    expect(resScala.canAnswer).toBe(false);
    expect(resScala.requiresHumanAction).toBe(true);

    // Unverified US Work authorization question
    const resVisa = resolveApplicationQuestion("Do you require US H1B visa sponsorship?", candidate);
    expect(resVisa.canAnswer).toBe(false);
    expect(resVisa.requiresHumanAction).toBe(true);

    // Unverified management experience
    const resMgmt = resolveApplicationQuestion("Have you managed a team of more than 15 software engineers?", candidate);
    expect(resMgmt.canAnswer).toBe(false);
    expect(resMgmt.requiresHumanAction).toBe(true);
  });
});
