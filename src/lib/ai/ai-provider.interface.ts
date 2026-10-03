import {
  JobRequirementAnalysis,
  MatchResult,
  TailoredCvData,
} from "@/types";
import { CandidateFullProfile } from "../profile/integrity";

export interface AIProvider {
  readonly name: string;

  /**
   * Analyzes raw job description and extracts structured metadata.
   */
  analyzeJob(jobTitle: string, company: string, description: string): Promise<JobRequirementAnalysis>;

  /**
   * Extracts granular skills, qualifications, and seniority from job text.
   */
  extractRequirements(description: string): Promise<{
    mandatorySkills: string[];
    preferredSkills: string[];
    experienceYears: number;
    education: string;
  }>;

  /**
   * Evaluates candidate suitability factor by factor.
   */
  matchCandidate(
    job: { title: string; company: string; description: string; requirements: JobRequirementAnalysis },
    candidate: CandidateFullProfile
  ): Promise<MatchResult>;

  /**
   * Generates tailored ATS-optimized CV content based strictly on candidate's verified facts.
   */
  generateCV(
    job: { title: string; company: string; description: string; requirements: JobRequirementAnalysis },
    candidate: CandidateFullProfile
  ): Promise<TailoredCvData>;

  /**
   * Generates concise, professional, truthful cover letter.
   */
  generateCoverLetter(
    job: { title: string; company: string; description: string; requirements: JobRequirementAnalysis },
    candidate: CandidateFullProfile
  ): Promise<string>;

  /**
   * Answers application form question adhering to absolute data integrity.
   */
  answerApplicationQuestion(
    question: string,
    candidate: CandidateFullProfile
  ): Promise<{ canAnswer: boolean; answer?: string; reason?: string }>;

  /**
   * Classifies application route, content safety, or category.
   */
  classifyContent(content: string): Promise<{ category: string; confidence: number }>;
}
