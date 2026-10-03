import { prisma } from "../prisma";
import { getAIProvider } from "../ai";
import { getVerifiedMasterCandidateProfile } from "../profile/integrity";
import { JobRequirementAnalysis } from "@/types";

export class CoverLetterAgent {
  readonly agentName = "CoverLetterAgent";

  async generateCoverLetter(
    jobId: string,
    requirements: JobRequirementAnalysis
  ): Promise<string> {
    const candidate = await getVerifiedMasterCandidateProfile();
    if (!candidate) throw new Error("No verified master candidate profile found.");

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error(`Job not found: ${jobId}`);

    const ai = getAIProvider();
    return ai.generateCoverLetter(
      {
        title: job.title,
        company: job.company,
        description: job.originalDescription,
        requirements,
      },
      candidate
    );
  }
}

export const coverLetterAgent = new CoverLetterAgent();
