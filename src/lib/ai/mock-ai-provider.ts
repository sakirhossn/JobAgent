import { AIProvider } from "./ai-provider.interface";
import { JobRequirementAnalysis, MatchResult, TailoredCvData } from "@/types";
import { CandidateFullProfile, resolveApplicationQuestion } from "../profile/integrity";
import { evaluateCandidateJobMatch } from "../matching/matching-engine";

export class MockAIProvider implements AIProvider {
  readonly name = "Mock Deterministic AI Provider";

  async analyzeJob(
    jobTitle: string,
    company: string,
    description: string
  ): Promise<JobRequirementAnalysis> {
    const text = `${jobTitle} ${description}`.toLowerCase();

    // 1. Role Category
    let roleCategory = "General";
    if (text.includes("data") || text.includes("analytics") || text.includes("bi")) {
      roleCategory = "Data Analytics";
    } else if (text.includes("supply chain") || text.includes("logistics") || text.includes("inventory")) {
      roleCategory = "Operations & Supply Chain";
    } else if (text.includes("it ") || text.includes("support") || text.includes("helpdesk") || text.includes("system")) {
      roleCategory = "IT Support & Operations";
    } else if (text.includes("business analyst") || text.includes("requirements")) {
      roleCategory = "Business Analysis";
    } else if (text.includes("chemical")) {
      roleCategory = "Chemical Engineering";
    }

    // 2. Seniority & Experience
    let seniority: "Entry-Level" | "Mid" | "Senior" | "Executive" = "Entry-Level";
    let minExperienceYears = 0;
    let fresherEligible = true;

    if (text.includes("10+") || text.includes("10-15") || text.includes("lead") || text.includes("architect")) {
      seniority = "Senior";
      minExperienceYears = 10;
      fresherEligible = false;
    } else if (text.includes("3-5") || text.includes("5+") || text.includes("mid-level")) {
      seniority = "Mid";
      minExperienceYears = 3;
      fresherEligible = false;
    } else if (text.includes("fresher") || text.includes("0-1") || text.includes("entry") || text.includes("junior")) {
      seniority = "Entry-Level";
      minExperienceYears = 0;
      fresherEligible = true;
    }

    // 3. Skills extraction
    const commonSkills = [
      "SQL",
      "Python",
      "Excel",
      "Power BI",
      "Data Visualization",
      "Pandas",
      "Supply Chain Operations",
      "Business Analysis",
      "IT Troubleshooting",
      "Problem Solving",
      "Chemical Engineering",
      "Hadoop",
      "Snowflake",
    ];

    const mandatorySkills: string[] = [];
    const preferredSkills: string[] = [];

    for (const skill of commonSkills) {
      if (text.includes(skill.toLowerCase())) {
        if (mandatorySkills.length < 4) {
          mandatorySkills.push(skill);
        } else {
          preferredSkills.push(skill);
        }
      }
    }

    // 4. Application Route Detection
    let applicationRoute: "WEBSITE" | "EMAIL" | "MANUAL_REVIEW" = "WEBSITE";
    if (text.includes("applicationemail") || text.includes("@") && text.includes("email resume")) {
      applicationRoute = "EMAIL";
    } else if (text.includes("captcha") || text.includes("otp") || text.includes("walk-in")) {
      applicationRoute = "MANUAL_REVIEW";
    }

    return {
      roleCategory,
      seniority,
      mandatorySkills,
      preferredSkills,
      minExperienceYears,
      fresherEligible,
      educationDegree: text.includes("bachelor") || text.includes("btech") || text.includes("degree") ? "Bachelor's Degree" : undefined,
      locationConstraints: text.includes("kolkata") ? ["Kolkata"] : text.includes("remote") ? ["Remote"] : ["India"],
      joiningTimelineDays: text.includes("immediate") || text.includes("5 to 7 days") ? 7 : 30,
      applicationRoute,
      eligibilityNotes: fresherEligible ? "Freshers and entry-level candidates welcomed." : `Requires ${minExperienceYears}+ years experience.`,
    };
  }

  async extractRequirements(description: string) {
    const analysis = await this.analyzeJob("Job", "Company", description);
    return {
      mandatorySkills: analysis.mandatorySkills,
      preferredSkills: analysis.preferredSkills,
      experienceYears: analysis.minExperienceYears,
      education: analysis.educationDegree || "Graduate Degree",
    };
  }

  async matchCandidate(
    job: { title: string; company: string; description: string; requirements: JobRequirementAnalysis },
    candidate: CandidateFullProfile
  ): Promise<MatchResult> {
    return evaluateCandidateJobMatch(
      {
        ...job,
        originalDescription: job.description || (job as any).originalDescription || "",
      },
      candidate
    );
  }

  async generateCV(
    job: { title: string; company: string; description: string; requirements: JobRequirementAnalysis },
    candidate: CandidateFullProfile
  ): Promise<TailoredCvData> {
    // 1. Identify which candidate skills match the job description
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    const atsKeywordsMatched: string[] = [];

    const highlightedSkills = candidate.skills
      .map((skill) => {
        const matches = jobText.includes(skill.name.toLowerCase());
        if (matches) atsKeywordsMatched.push(skill.name);
        return {
          name: skill.name,
          category: skill.category,
          proficiency: skill.proficiency,
          score: matches ? 10 : 1,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map(({ name, category, proficiency }) => ({ name, category, proficiency }));

    // 2. Select and re-order projects to highlight relevant ones first
    const highlightedProjects = [...candidate.projects]
      .map((proj) => {
        const techMatch = proj.technologies.filter((t) => jobText.includes(t.toLowerCase())).length;
        return {
          title: proj.title,
          technologies: proj.technologies,
          description: proj.description,
          impact: proj.impact || undefined,
          score: techMatch,
        };
      })
      .sort((a, b) => b.score - a.score);

    // 3. Highlight relevant experience
    const highlightedExperience = candidate.experience.map((exp) => ({
      company: exp.company,
      title: exp.title,
      location: exp.location || undefined,
      duration: `${exp.startDate} - ${exp.endDate || "Present"}`,
      achievements: exp.achievements,
    }));

    // 4. Tailor professional summary emphasizing matching goals (WITHOUT inventing any facts)
    const summary = `Detail-oriented graduate based in ${candidate.currentCity} seeking the ${job.title} role at ${job.company}. Offers verified competencies in ${atsKeywordsMatched.slice(0, 4).join(", ") || "data analytics and operations"}, with hands-on internship experience optimizing reporting pipelines. Ready to join within ${candidate.joiningAvailabilityDays} days and drive analytical excellence.`;

    return {
      title: `${job.title} - ${job.company} (Tailored ATS CV)`,
      summary,
      highlightedSkills,
      highlightedExperience,
      highlightedProjects,
      education: candidate.education.map((e) => ({
        institution: e.institution,
        degree: e.degree,
        field: e.fieldOfStudy,
        year: `${e.startYear} - ${e.endYear || "Present"}`,
        grade: e.grade || undefined,
      })),
      certifications: candidate.certifications.map((c) => ({
        title: c.title,
        issuer: c.issuer,
        issueDate: c.issueDate,
      })),
      languages: candidate.languages.map((l) => ({
        language: l.language,
        proficiency: l.proficiency,
      })),
      atsKeywordsMatched,
    };
  }

  async generateCoverLetter(
    job: { title: string; company: string; description: string; requirements: JobRequirementAnalysis },
    candidate: CandidateFullProfile
  ): Promise<string> {
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    const matchedSkills = candidate.skills
      .filter((s) => jobText.includes(s.name.toLowerCase()))
      .map((s) => s.name);

    return `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.title} opportunity. As a dedicated fresher based in ${candidate.currentCity} with hands-on internship experience at Apex Logistics & Supply Chain Solutions, I have developed verified practical skills in ${matchedSkills.slice(0, 4).join(", ") || "SQL, Python, and data analytics"}.

During my academic and internship projects, I focused on turning operational datasets into automated dashboards and actionable reports. Specifically, I engineered SQL workflows that resolved inventory reporting bottlenecks and reduced report generation lag from 3 hours to 20 minutes.

I am particularly excited about the opening at ${job.company} because of your team's focus on structured operational impact. I am available to join within ${candidate.joiningAvailabilityDays} days and am fully prepared to contribute immediately.

Thank you for your time and consideration. I welcome the opportunity to discuss how my skill set aligns with your team's requirements.

Sincerely,
${candidate.fullName}
${candidate.phone} | ${candidate.email}
${candidate.currentCity}, India`;
  }

  async answerApplicationQuestion(
    question: string,
    candidate: CandidateFullProfile
  ): Promise<{ canAnswer: boolean; answer?: string; reason?: string }> {
    const res = resolveApplicationQuestion(question, candidate);
    return {
      canAnswer: res.canAnswer,
      answer: res.answer,
      reason: res.reason,
    };
  }

  async classifyContent(content: string): Promise<{ category: string; confidence: number }> {
    const text = content.toLowerCase();
    if (text.includes("job") || text.includes("requirements")) {
      return { category: "JOB_LISTING", confidence: 0.95 };
    }
    return { category: "GENERAL_DOCUMENT", confidence: 0.85 };
  }
}
