export type ApplicationStatus =
  | "DISCOVERED"
  | "ANALYZED"
  | "MATCHED"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "CV_GENERATED"
  | "APPLICATION_STARTED"
  | "SUBMITTED"
  | "CONFIRMED"
  | "FOLLOW_UP"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "FAILED"
  | "DUPLICATE"
  | "EXPIRED"
  | "WITHDRAWN"
  | "SKIPPED"
  | "HUMAN_ACTION_REQUIRED";

export type ApplicationMethod = "WEBSITE" | "EMAIL" | "MANUAL";

export type PolicyMode = "AUTO" | "APPROVAL_REQUIRED" | "MANUAL";

export type ClassificationType = "AUTO_APPLY_ELIGIBLE" | "REVIEW_REQUIRED" | "NOT_ELIGIBLE";

export interface NormalizedJob {
  sourceJobId: string;
  sourceId: string;
  sourceUrl?: string;
  title: string;
  company: string;
  location: string;
  remoteType: "ONSITE" | "REMOTE" | "HYBRID";
  employmentType: "FULL_TIME" | "INTERNSHIP" | "CONTRACT" | "PART_TIME";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceRequired?: string;
  educationRequired?: string;
  skills: string[];
  preferredSkills: string[];
  originalDescription: string;
  responsibilities?: string[];
  qualifications?: string[];
  applicationUrl?: string;
  applicationEmail?: string;
  postedAt?: Date;
  deadline?: Date;
  rawSourceData?: Record<string, any>;
}

export interface JobRequirementAnalysis {
  roleCategory: string;
  seniority: "Entry-Level" | "Mid" | "Senior" | "Executive";
  mandatorySkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  maxExperienceYears?: number;
  fresherEligible: boolean;
  educationDegree?: string;
  locationConstraints: string[];
  joiningTimelineDays?: number;
  applicationRoute: "WEBSITE" | "EMAIL" | "MANUAL_REVIEW";
  eligibilityNotes?: string;
}

export interface FactorBreakdownItem {
  factor: string;
  status: "MATCH" | "PARTIAL_MATCH" | "MISSING" | "ACCEPTED_FOR_FRESHER" | "UNKNOWN" | "EXCLUDED";
  detail: string;
  weight: number;
  score: number;
}

export interface MatchResult {
  roleRelevanceScore: number;
  skillsMatchScore: number;
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  factorBreakdown: FactorBreakdownItem[];
  classification: ClassificationType;
  recommendationReason: string;
  isExcluded: boolean;
  exclusionReason?: string;
}

export interface TailoredCvData {
  title: string;
  summary: string;
  highlightedSkills: { name: string; category: string; proficiency: string }[];
  highlightedExperience: {
    company: string;
    title: string;
    location?: string;
    duration: string;
    achievements: string[];
  }[];
  highlightedProjects: {
    title: string;
    technologies: string[];
    description: string;
    impact?: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
    grade?: string;
  }[];
  certifications: {
    title: string;
    issuer: string;
    issueDate: string;
  }[];
  languages: {
    language: string;
    proficiency: string;
  }[];
  atsKeywordsMatched: string[];
}
