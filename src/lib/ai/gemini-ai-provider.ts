import { AIProvider } from "./ai-provider.interface";
import { MockAIProvider } from "./mock-ai-provider";
import { JobRequirementAnalysis, MatchResult, TailoredCvData } from "@/types";
import { CandidateFullProfile } from "../profile/integrity";

export class GeminiAIProvider implements AIProvider {
  readonly name = "Google Gemini AI Provider";
  private fallbackProvider = new MockAIProvider();
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
  }

  async analyzeJob(
    jobTitle: string,
    company: string,
    description: string
  ): Promise<JobRequirementAnalysis> {
    if (!this.apiKey) {
      return this.fallbackProvider.analyzeJob(jobTitle, company, description);
    }

    try {
      const prompt = `Analyze this job posting and respond in JSON with keys:
roleCategory (string), seniority (Entry-Level | Mid | Senior | Executive), mandatorySkills (string[]), preferredSkills (string[]), minExperienceYears (number), fresherEligible (boolean), educationDegree (string), locationConstraints (string[]), joiningTimelineDays (number), applicationRoute (WEBSITE | EMAIL | MANUAL_REVIEW), eligibilityNotes (string).

Job Title: ${jobTitle}
Company: ${company}
Description:
${description}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(text);
    } catch {
      // Fallback reliably to mock provider
      return this.fallbackProvider.analyzeJob(jobTitle, company, description);
    }
  }

  async extractRequirements(description: string) {
    return this.fallbackProvider.extractRequirements(description);
  }

  async matchCandidate(
    job: { title: string; company: string; description: string; requirements: JobRequirementAnalysis },
    candidate: CandidateFullProfile
  ): Promise<MatchResult> {
    return this.fallbackProvider.matchCandidate(job, candidate);
  }

  async generateCV(
    job: { title: string; company: string; description: string; requirements: JobRequirementAnalysis },
    candidate: CandidateFullProfile
  ): Promise<TailoredCvData> {
    return this.fallbackProvider.generateCV(job, candidate);
  }

  async generateCoverLetter(
    job: { title: string; company: string; description: string; requirements: JobRequirementAnalysis },
    candidate: CandidateFullProfile
  ): Promise<string> {
    return this.fallbackProvider.generateCoverLetter(job, candidate);
  }

  async answerApplicationQuestion(
    question: string,
    candidate: CandidateFullProfile
  ): Promise<{ canAnswer: boolean; answer?: string; reason?: string }> {
    return this.fallbackProvider.answerApplicationQuestion(question, candidate);
  }

  async classifyContent(content: string): Promise<{ category: string; confidence: number }> {
    return this.fallbackProvider.classifyContent(content);
  }
}
