import crypto from "crypto";
import { prisma } from "../prisma";
import { NormalizedJob } from "@/types";

export interface DeduplicationResult {
  isDuplicate: boolean;
  canonicalJobId: string;
  isNewCanonicalJob: boolean;
  actionTaken: "CREATED_NEW_CANONICAL" | "LINKED_TO_EXISTING_CANONICAL" | "EXISTING_EXACT_MATCH";
}

/**
 * Normalizes text for robust comparison (lowercase, trimmed whitespace, strip punctuation).
 */
export function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Computes deterministic SHA-256 hash of canonical job content.
 */
export function computeContentHash(company: string, title: string, description: string): string {
  const normCompany = normalizeString(company);
  const normTitle = normalizeString(title);
  // Clean description whitespace to avoid minor formatting discrepancy duplicates
  const normDesc = normalizeString(description);
  const composite = `${normCompany}|${normTitle}|${normDesc}`;
  return crypto.createHash("sha256").update(composite).digest("hex");
}

/**
 * Ingests a normalized job, applies deduplication, stores canonical job and source link.
 */
export async function ingestAndDeduplicateJob(job: NormalizedJob): Promise<DeduplicationResult> {
  const contentHash = computeContentHash(job.company, job.title, job.originalDescription);

  // 1. Check exact content hash match
  let existingCanonical = await prisma.job.findUnique({
    where: { contentHash },
  });

  // 2. Fallback fuzzy check: exact normalized company + normalized title + matching application URL or location
  if (!existingCanonical) {
    const candidates = await prisma.job.findMany({
      where: {
        company: { contains: job.company },
      },
    });

    for (const cand of candidates) {
      const matchCompany = normalizeString(cand.company) === normalizeString(job.company);
      const matchTitle = normalizeString(cand.title) === normalizeString(job.title);
      const matchUrl = Boolean(job.applicationUrl && cand.applicationUrl && job.applicationUrl === cand.applicationUrl);

      if (matchCompany && (matchTitle || matchUrl)) {
        existingCanonical = cand;
        break;
      }
    }
  }

  if (existingCanonical) {
    // Check if this source link is already registered
    const existingLink = await prisma.jobSourceLink.findUnique({
      where: {
        sourceId_sourceJobId: {
          sourceId: job.sourceId,
          sourceJobId: job.sourceJobId,
        },
      },
    });

    if (!existingLink) {
      await prisma.jobSourceLink.create({
        data: {
          jobId: existingCanonical.id,
          sourceId: job.sourceId,
          sourceJobId: job.sourceJobId,
          sourceUrl: job.sourceUrl || job.applicationUrl,
        },
      });
      return {
        isDuplicate: true,
        canonicalJobId: existingCanonical.id,
        isNewCanonicalJob: false,
        actionTaken: "LINKED_TO_EXISTING_CANONICAL",
      };
    }

    return {
      isDuplicate: true,
      canonicalJobId: existingCanonical.id,
      isNewCanonicalJob: false,
      actionTaken: "EXISTING_EXACT_MATCH",
    };
  }

  // 3. Brand new canonical job
  const newCanonical = await prisma.job.create({
    data: {
      contentHash,
      title: job.title,
      company: job.company,
      location: job.location,
      remoteType: job.remoteType,
      employmentType: job.employmentType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency || "INR",
      experienceRequired: job.experienceRequired,
      educationRequired: job.educationRequired,
      skills: JSON.stringify(job.skills || []),
      preferredSkills: JSON.stringify(job.preferredSkills || []),
      originalDescription: job.originalDescription, // Byte-for-byte original preserved!
      responsibilities: JSON.stringify(job.responsibilities || []),
      qualifications: JSON.stringify(job.qualifications || []),
      applicationUrl: job.applicationUrl,
      applicationEmail: job.applicationEmail,
      postedAt: job.postedAt,
      rawSourceData: job.rawSourceData ? JSON.stringify(job.rawSourceData) : null,
      sourceLinks: {
        create: {
          sourceId: job.sourceId,
          sourceJobId: job.sourceJobId,
          sourceUrl: job.sourceUrl || job.applicationUrl,
        },
      },
    },
  });

  return {
    isDuplicate: false,
    canonicalJobId: newCanonical.id,
    isNewCanonicalJob: true,
    actionTaken: "CREATED_NEW_CANONICAL",
  };
}
