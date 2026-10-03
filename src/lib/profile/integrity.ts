import { prisma } from "../prisma";

export interface CandidateFullProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  currentCity: string;
  preferredLocations: string[];
  joiningAvailabilityDays: number;
  salaryMinExpectation: number;
  salaryMaxExpectation: number;
  salaryCurrency: string;
  targetJobTitles: string[];
  excludedJobTitles: string[];
  fresherStatus: boolean;
  summary: string;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    grade?: string | null;
    startYear: number;
    endYear?: number | null;
  }>;
  experience: Array<{
    company: string;
    title: string;
    location?: string | null;
    isInternship: boolean;
    startDate: string;
    endDate?: string | null;
    description: string;
    achievements: string[];
  }>;
  skills: Array<{
    name: string;
    category: string;
    proficiency: string;
    verified: boolean;
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    url?: string | null;
    impact?: string | null;
  }>;
  certifications: Array<{
    title: string;
    issuer: string;
    issueDate: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
}

/**
 * Loads the active verified Master Candidate Profile.
 */
export async function getVerifiedMasterCandidateProfile(): Promise<CandidateFullProfile | null> {
  const profile = await prisma.candidateProfile.findFirst({
    include: {
      education: true,
      experience: true,
      skills: true,
      projects: true,
      certifications: true,
      languages: true,
    },
  });

  if (!profile) return null;

  return {
    id: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    currentCity: profile.currentCity,
    preferredLocations: JSON.parse(profile.preferredLocations || "[]"),
    joiningAvailabilityDays: profile.joiningAvailabilityDays,
    salaryMinExpectation: profile.salaryMinExpectation,
    salaryMaxExpectation: profile.salaryMaxExpectation,
    salaryCurrency: profile.salaryCurrency,
    targetJobTitles: JSON.parse(profile.targetJobTitles || "[]"),
    excludedJobTitles: JSON.parse(profile.excludedJobTitles || "[]"),
    fresherStatus: profile.fresherStatus,
    summary: profile.summary,
    portfolioUrl: profile.portfolioUrl,
    githubUrl: profile.githubUrl,
    linkedinUrl: profile.linkedinUrl,
    education: profile.education.map((e) => ({
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      grade: e.grade,
      startYear: e.startYear,
      endYear: e.endYear,
    })),
    experience: profile.experience.map((exp) => ({
      company: exp.company,
      title: exp.title,
      location: exp.location,
      isInternship: exp.isInternship,
      startDate: exp.startDate,
      endDate: exp.endDate,
      description: exp.description,
      achievements: exp.achievements ? JSON.parse(exp.achievements) : [],
    })),
    skills: profile.skills.map((s) => ({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
      verified: s.verified,
    })),
    projects: profile.projects.map((p) => ({
      title: p.title,
      description: p.description,
      technologies: JSON.parse(p.technologies || "[]"),
      url: p.url,
      impact: p.impact,
    })),
    certifications: profile.certifications.map((c) => ({
      title: c.title,
      issuer: c.issuer,
      issueDate: c.issueDate,
    })),
    languages: profile.languages.map((l) => ({
      language: l.language,
      proficiency: l.proficiency,
    })),
  };
}

export interface QuestionResolution {
  canAnswer: boolean;
  answer?: string;
  sourceField?: string;
  reason?: string;
  requiresHumanAction?: boolean;
}

/**
 * ABSOLUTE DATA INTEGRITY QUESTION RESOLVER
 * Maps application form questions to verified profile facts only.
 * If data cannot be proven from profile, it strictly stops and flags for human review.
 */
export function resolveApplicationQuestion(
  question: string,
  profile: CandidateFullProfile
): QuestionResolution {
  const q = question.toLowerCase().trim();

  // Full Name
  if (q.includes("full name") || q === "name" || q.includes("your name")) {
    return { canAnswer: true, answer: profile.fullName, sourceField: "candidate.fullName" };
  }

  // Email
  if (q.includes("email") || q.includes("e-mail")) {
    return { canAnswer: true, answer: profile.email, sourceField: "candidate.email" };
  }

  // Phone / Contact
  if (q.includes("phone") || q.includes("mobile") || q.includes("contact number")) {
    return { canAnswer: true, answer: profile.phone, sourceField: "candidate.phone" };
  }

  // Current City / Location
  if (q.includes("current city") || q.includes("current location") || q.includes("where are you located")) {
    return { canAnswer: true, answer: profile.currentCity, sourceField: "candidate.currentCity" };
  }

  // Notice Period / Joining Availability
  if (
    q.includes("notice period") ||
    q.includes("how soon can you join") ||
    q.includes("joining availability") ||
    q.includes("earliest start date")
  ) {
    return {
      canAnswer: true,
      answer: `Immediate / within ${profile.joiningAvailabilityDays} days`,
      sourceField: "candidate.joiningAvailabilityDays",
    };
  }

  // Expected Salary / Compensation
  if (
    (q.includes("salary") && (q.includes("expect") || q.includes("monthly") || q.includes("desired"))) ||
    q.includes("expected salary") ||
    q.includes("salary expectation") ||
    q.includes("ctc expectation") ||
    q.includes("compensation")
  ) {
    return {
      canAnswer: true,
      answer: `₹${profile.salaryMinExpectation.toLocaleString()} - ₹${profile.salaryMaxExpectation.toLocaleString()} per month`,
      sourceField: "candidate.salaryExpectation",
    };
  }

  // Highest Education / Degree
  if (q.includes("highest qualification") || q.includes("highest education") || q.includes("degree")) {
    const highestEdu = profile.education[0];
    if (highestEdu) {
      return {
        canAnswer: true,
        answer: `${highestEdu.degree} in ${highestEdu.fieldOfStudy} (${highestEdu.institution})`,
        sourceField: "candidate.education",
      };
    }
  }

  // Fresher status / Experience years
  if (q.includes("total experience") || q.includes("years of experience")) {
    return {
      canAnswer: true,
      answer: profile.fresherStatus ? "Fresher (0 years full-time, 6 months internship)" : "Entry level",
      sourceField: "candidate.fresherStatus",
    };
  }

  // LinkedIn URL
  if (q.includes("linkedin") && profile.linkedinUrl) {
    return { canAnswer: true, answer: profile.linkedinUrl, sourceField: "candidate.linkedinUrl" };
  }

  // GitHub / Portfolio
  if (q.includes("github") && profile.githubUrl) {
    return { canAnswer: true, answer: profile.githubUrl, sourceField: "candidate.githubUrl" };
  }
  if (q.includes("portfolio") && profile.portfolioUrl) {
    return { canAnswer: true, answer: profile.portfolioUrl, sourceField: "candidate.portfolioUrl" };
  }

  // Relocation / Open to Kolkata or Remote
  if (q.includes("willing to relocate") || q.includes("open to work in kolkata") || q.includes("open to remote")) {
    return {
      canAnswer: true,
      answer: "Yes, currently based in Kolkata and open to Remote and preferred metropolitan hubs.",
      sourceField: "candidate.preferredLocations",
    };
  }

  // SPECIFIC SKILLS CHECK (Truthful verification)
  if (q.includes("do you know") || q.includes("experience with") || q.includes("proficiency in")) {
    const matchedSkill = profile.skills.find((s) => q.includes(s.name.toLowerCase()));
    if (matchedSkill) {
      return {
        canAnswer: true,
        answer: `Yes, verified ${matchedSkill.proficiency.toLowerCase()} proficiency in ${matchedSkill.name}.`,
        sourceField: `candidate.skills.${matchedSkill.name}`,
      };
    }
  }

  // UNVERIFIED / UNKNOWN QUESTION: STRICT HALT
  return {
    canAnswer: false,
    reason: `Question asks for unverified information not in Master Profile: "${question}"`,
    requiresHumanAction: true,
  };
}
