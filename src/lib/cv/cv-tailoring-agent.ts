import fs from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "../prisma";
import { getAIProvider } from "../ai";
import { getVerifiedMasterCandidateProfile } from "../profile/integrity";
import { renderCvToHtml } from "./html-renderer";
import { JobRequirementAnalysis } from "@/types";

export interface TailorCvResult {
  generatedCvId: string;
  title: string;
  htmlPath: string;
  contentHash: string;
  sourceCvVersionId?: string | null;
}

export class CVTailoringAgent {
  readonly agentName = "CVTailoringAgent";

  async generateAndStoreTailoredCv(
    jobId: string,
    requirements: JobRequirementAnalysis
  ): Promise<TailorCvResult> {
    const candidate = await getVerifiedMasterCandidateProfile();
    if (!candidate) throw new Error("No verified master candidate profile found in database.");

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error(`Job not found: ${jobId}`);

    // Retrieve active master CV version
    const masterCv = await prisma.cvVersion.findFirst({
      where: { candidateId: candidate.id, isMaster: true },
      orderBy: { versionNumber: "desc" },
    });

    // Default template
    const template = await prisma.cvTemplate.findFirst({
      where: { isDefault: true },
    });

    const ai = getAIProvider();
    const tailoredData = await ai.generateCV(
      {
        title: job.title,
        company: job.company,
        description: job.originalDescription,
        requirements,
      },
      candidate
    );

    const contentJson = JSON.stringify(tailoredData);
    const contentHash = crypto.createHash("sha256").update(contentJson).digest("hex");
    const title = `${job.title} - ${job.company} (v1)`;

    // Check if identical generated CV already exists for this job & candidate
    const existing = await prisma.generatedCv.findFirst({
      where: {
        jobId,
        candidateId: candidate.id,
        contentHash,
      },
    });

    if (existing) {
      return {
        generatedCvId: existing.id,
        title: existing.title,
        htmlPath: existing.pdfPath || "",
        contentHash: existing.contentHash,
        sourceCvVersionId: existing.sourceCvVersionId,
      };
    }

    // Persist new generated CV record
    const record = await prisma.generatedCv.create({
      data: {
        candidateId: candidate.id,
        jobId,
        sourceCvVersionId: masterCv?.id || null,
        templateId: template?.id || null,
        title,
        tailoredContent: contentJson,
        contentHash,
        aiPromptVersion: "v1.0-truthful",
      },
    });

    // Write rendered ATS HTML version
    const htmlContent = renderCvToHtml(tailoredData, candidate);
    const outputDir = path.join(process.cwd(), "public", "generated_cvs");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const htmlFilename = `${record.id}.html`;
    const fullPath = path.join(outputDir, htmlFilename);
    fs.writeFileSync(fullPath, htmlContent, "utf-8");

    const webPath = `/generated_cvs/${htmlFilename}`;
    await prisma.generatedCv.update({
      where: { id: record.id },
      data: { pdfPath: webPath },
    });

    return {
      generatedCvId: record.id,
      title: record.title,
      htmlPath: webPath,
      contentHash: record.contentHash,
      sourceCvVersionId: record.sourceCvVersionId,
    };
  }
}

export const cvTailoringAgent = new CVTailoringAgent();
