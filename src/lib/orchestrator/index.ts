import { prisma } from "../prisma";
import { sourceRegistry } from "../sources/source-registry";
import { ingestAndDeduplicateJob } from "../deduplication";
import { getAIProvider } from "../ai";
import { getVerifiedMasterCandidateProfile } from "../profile/integrity";
import { cvTailoringAgent } from "../cv/cv-tailoring-agent";
import { coverLetterAgent } from "../cv/cover-letter-agent";
import { detectApplicationRoute } from "../application/route-detector";
import { websiteApplicationAgent } from "../application/website-agent";
import { emailApplicationAgent } from "../application/email-agent";
import { evaluateApplicationPolicy } from "../application/policy-engine";
import { transitionApplicationState } from "../application/state-machine";
import { JobRequirementAnalysis } from "@/types";

export interface PipelineRunSummary {
  runId: string;
  discoveredJobsCount: number;
  newJobsCount: number;
  duplicateJobsCount: number;
  analyzedJobsCount: number;
  excludedJobsCount: number;
  eligibleJobsCount: number;
  applicationsPreparedCount: number;
  applicationsSubmittedCount: number;
  humanActionsCount: number;
  errorsCount: number;
  details: string[];
}

export class AgentOrchestrator {
  /**
   * 1. DISCOVERY & DEDUPLICATION AGENTS
   */
  async runJobDiscovery(): Promise<{ discovered: number; newJobs: number; duplicates: number }> {
    const run = await prisma.agentRun.create({
      data: {
        agentName: "JobDiscoveryAgent",
        status: "RUNNING",
      },
    });

    let discoveredCount = 0;
    let newJobsCount = 0;
    let duplicateCount = 0;
    const logs: string[] = [];

    try {
      const adapters = sourceRegistry.getAllAdapters();
      for (const adapter of adapters) {
        logs.push(`Polling source adapter: ${adapter.name} (${adapter.id})`);
        const rawJobs = await adapter.searchJobs({ limit: 20 });
        discoveredCount += rawJobs.length;

        for (const raw of rawJobs) {
          const normalized = adapter.normalizeJob(raw);
          const dedupRes = await ingestAndDeduplicateJob(normalized);

          if (dedupRes.isNewCanonicalJob) {
            newJobsCount++;
            logs.push(`[New Canonical] "${normalized.title}" at ${normalized.company} (ID: ${dedupRes.canonicalJobId})`);
          } else {
            duplicateCount++;
            logs.push(`[Duplicate/Linked] "${normalized.title}" at ${normalized.company} -> Linked to canonical ID: ${dedupRes.canonicalJobId}`);
          }
        }
      }

      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          itemsProcessed: discoveredCount,
          itemsSucceeded: newJobsCount,
          itemsFailed: 0,
          logs: logs.join("\n"),
        },
      });

      return { discovered: discoveredCount, newJobs: newJobsCount, duplicates: duplicateCount };
    } catch (err: any) {
      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          logs: `${logs.join("\n")}\nFATAL: ${err.message}`,
        },
      });
      await prisma.agentError.create({
        data: {
          agentRunId: run.id,
          agentName: "JobDiscoveryAgent",
          errorType: "PERMANENT",
          message: err.message,
          stackTrace: err.stack,
        },
      });
      throw err;
    }
  }

  /**
   * 2. JOB ANALYSIS & MATCHING AGENT
   */
  async analyzeAndMatchJob(jobId: string): Promise<any> {
    const candidate = await getVerifiedMasterCandidateProfile();
    if (!candidate) throw new Error("No verified candidate profile found.");

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error(`Job not found: ${jobId}`);

    const ai = getAIProvider();

    // 1. Analyze Job Description
    const requirements = await ai.analyzeJob(job.title, job.company, job.originalDescription);

    // Save or update requirements
    await prisma.jobRequirement.upsert({
      where: { jobId: job.id },
      update: {
        roleCategory: requirements.roleCategory,
        seniority: requirements.seniority,
        mandatorySkills: JSON.stringify(requirements.mandatorySkills),
        preferredSkills: JSON.stringify(requirements.preferredSkills),
        minExperienceYears: requirements.minExperienceYears,
        maxExperienceYears: requirements.maxExperienceYears || null,
        fresherEligible: requirements.fresherEligible,
        educationDegree: requirements.educationDegree || null,
        locationConstraints: JSON.stringify(requirements.locationConstraints),
        joiningTimelineDays: requirements.joiningTimelineDays || null,
        applicationRoute: requirements.applicationRoute,
        eligibilityNotes: requirements.eligibilityNotes || null,
      },
      create: {
        jobId: job.id,
        roleCategory: requirements.roleCategory,
        seniority: requirements.seniority,
        mandatorySkills: JSON.stringify(requirements.mandatorySkills),
        preferredSkills: JSON.stringify(requirements.preferredSkills),
        minExperienceYears: requirements.minExperienceYears,
        maxExperienceYears: requirements.maxExperienceYears || null,
        fresherEligible: requirements.fresherEligible,
        educationDegree: requirements.educationDegree || null,
        locationConstraints: JSON.stringify(requirements.locationConstraints),
        joiningTimelineDays: requirements.joiningTimelineDays || null,
        applicationRoute: requirements.applicationRoute,
        eligibilityNotes: requirements.eligibilityNotes || null,
      },
    });

    // 2. Matching & Exclusion Engine
    const matchResult = await ai.matchCandidate(
      {
        title: job.title,
        company: job.company,
        description: job.originalDescription,
        requirements,
      },
      candidate
    );

    // Update job excluded state if deterministic exclusion fired
    if (matchResult.isExcluded) {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          isExcluded: true,
          exclusionReason: matchResult.exclusionReason,
        },
      });
    }

    // Persist JobMatch
    const matchRecord = await prisma.jobMatch.upsert({
      where: {
        jobId_candidateId: {
          jobId: job.id,
          candidateId: candidate.id,
        },
      },
      update: {
        roleRelevanceScore: matchResult.roleRelevanceScore,
        skillsMatchScore: matchResult.skillsMatchScore,
        overallScore: matchResult.overallScore,
        matchedSkills: JSON.stringify(matchResult.matchedSkills),
        missingSkills: JSON.stringify(matchResult.missingSkills),
        factorBreakdown: JSON.stringify(matchResult.factorBreakdown),
        classification: matchResult.classification,
        recommendationReason: matchResult.recommendationReason,
      },
      create: {
        jobId: job.id,
        candidateId: candidate.id,
        roleRelevanceScore: matchResult.roleRelevanceScore,
        skillsMatchScore: matchResult.skillsMatchScore,
        overallScore: matchResult.overallScore,
        matchedSkills: JSON.stringify(matchResult.matchedSkills),
        missingSkills: JSON.stringify(matchResult.missingSkills),
        factorBreakdown: JSON.stringify(matchResult.factorBreakdown),
        classification: matchResult.classification,
        recommendationReason: matchResult.recommendationReason,
      },
    });

    return { requirements, match: matchRecord, matchResult };
  }

  /**
   * 3. APPLICATION PREPARATION (CV Tailoring + Cover Letter + Initial State)
   */
  async prepareApplication(jobId: string): Promise<string> {
    const candidate = await getVerifiedMasterCandidateProfile();
    if (!candidate) throw new Error("No verified candidate profile found.");

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { requirements: true, matches: true },
    });
    if (!job) throw new Error(`Job not found: ${jobId}`);

    // If job not yet analyzed, analyze first
    let reqs: JobRequirementAnalysis;
    if (!job.requirements) {
      const res = await this.analyzeAndMatchJob(jobId);
      reqs = res.requirements;
    } else {
      reqs = {
        roleCategory: job.requirements.roleCategory,
        seniority: job.requirements.seniority as any,
        mandatorySkills: JSON.parse(job.requirements.mandatorySkills || "[]"),
        preferredSkills: JSON.parse(job.requirements.preferredSkills || "[]"),
        minExperienceYears: job.requirements.minExperienceYears,
        maxExperienceYears: job.requirements.maxExperienceYears || undefined,
        fresherEligible: job.requirements.fresherEligible,
        educationDegree: job.requirements.educationDegree || undefined,
        locationConstraints: JSON.parse(job.requirements.locationConstraints || "[]"),
        joiningTimelineDays: job.requirements.joiningTimelineDays || undefined,
        applicationRoute: job.requirements.applicationRoute as any,
      };
    }

    // Detect Application Route
    const route = detectApplicationRoute({
      applicationEmail: job.applicationEmail,
      applicationUrl: job.applicationUrl,
      originalDescription: job.originalDescription,
    });

    // Generate Tailored CV
    const tailoredCv = await cvTailoringAgent.generateAndStoreTailoredCv(job.id, reqs);

    // Generate Cover Letter
    const coverLetter = await coverLetterAgent.generateCoverLetter(job.id, reqs);

    // Determine initial application state
    const match = job.matches[0];
    const initialStatus =
      match?.classification === "AUTO_APPLY_ELIGIBLE"
        ? "APPROVED"
        : match?.classification === "REVIEW_REQUIRED"
        ? "REVIEW_REQUIRED"
        : "REJECTED";

    // Upsert Application
    const application = await prisma.application.upsert({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId: job.id,
        },
      },
      update: {
        cvVersionId: tailoredCv.generatedCvId,
        coverLetterText: coverLetter,
        applicationMethod: route.route,
        applicationUrl: route.applicationUrl || job.applicationUrl,
        emailRecipient: route.emailRecipient || job.applicationEmail,
      },
      create: {
        candidateId: candidate.id,
        jobId: job.id,
        cvVersionId: tailoredCv.generatedCvId,
        coverLetterText: coverLetter,
        status: initialStatus,
        applicationMethod: route.route,
        applicationUrl: route.applicationUrl || job.applicationUrl,
        emailRecipient: route.emailRecipient || job.applicationEmail,
      },
    });

    // Log initial transition event
    await transitionApplicationState(
      application.id,
      "CV_GENERATED",
      `Tailored CV (${tailoredCv.title}) and cover letter prepared for route ${route.route}.`,
      { route: route.route, cvId: tailoredCv.generatedCvId }
    );

    return application.id;
  }

  /**
   * 4. EXECUTE APPLICATION SUBMISSION (Website or Email)
   */
  async executeApplicationSubmission(applicationId: string): Promise<any> {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!app) throw new Error(`Application not found: ${applicationId}`);

    // Policy safety validation
    const policy = await evaluateApplicationPolicy(applicationId);
    if (!policy.canSubmit) {
      console.warn(`Application ${applicationId} held by policy: ${policy.reason}`);
      return { success: false, reason: policy.reason, violations: policy.violations };
    }

    if (app.applicationMethod === "EMAIL") {
      return emailApplicationAgent.sendApplicationEmail(applicationId);
    } else if (app.applicationMethod === "WEBSITE") {
      return websiteApplicationAgent.processWebsiteApplication(applicationId);
    } else {
      // MANUAL ROUTE: Route to Human Action Queue
      await prisma.agentTask.create({
        data: {
          applicationId: app.id,
          taskType: "HUMAN_ACTION_REQUIRED",
          priority: "HIGH",
          title: `Manual Submission Needed for ${app.job.company}`,
          reason: "Job posting requires direct manual portal navigation / walk-in.",
          requiredAction: `Review original job description and complete manual application at ${app.applicationUrl || "portal"}.`,
          status: "PENDING",
        },
      });

      await transitionApplicationState(
        app.id,
        "HUMAN_ACTION_REQUIRED",
        "Application routed to Human Action Center for manual review/submission."
      );

      return {
        success: false,
        status: "HUMAN_ACTION_REQUIRED",
        reason: "Requires manual application by administrator.",
      };
    }
  }

  /**
   * 5. RUN COMPLETE AUTONOMOUS PIPELINE
   */
  async runFullPipeline(): Promise<PipelineRunSummary> {
    const run = await prisma.agentRun.create({
      data: {
        agentName: "AgentOrchestratorPipeline",
        status: "RUNNING",
      },
    });

    const summary: PipelineRunSummary = {
      runId: run.id,
      discoveredJobsCount: 0,
      newJobsCount: 0,
      duplicateJobsCount: 0,
      analyzedJobsCount: 0,
      excludedJobsCount: 0,
      eligibleJobsCount: 0,
      applicationsPreparedCount: 0,
      applicationsSubmittedCount: 0,
      humanActionsCount: 0,
      errorsCount: 0,
      details: [],
    };

    try {
      // Step 1: Discover & Deduplicate
      summary.details.push("Step 1: Running Discovery & Deduplication...");
      const disc = await this.runJobDiscovery();
      summary.discoveredJobsCount = disc.discovered;
      summary.newJobsCount = disc.newJobs;
      summary.duplicateJobsCount = disc.duplicates;

      // Fetch all canonical unanalyzed jobs
      const jobs = await prisma.job.findMany({
        include: { requirements: true, matches: true },
      });

      for (const job of jobs) {
        try {
          // Step 2 & 3: Analyze & Match
          summary.details.push(`Step 2 & 3: Analyzing & Matching "${job.title}" at ${job.company}`);
          const { matchResult } = await this.analyzeAndMatchJob(job.id);
          summary.analyzedJobsCount++;

          if (matchResult.isExcluded) {
            summary.excludedJobsCount++;
            summary.details.push(`--> Excluded: ${matchResult.exclusionReason}`);
            continue;
          }

          if (matchResult.classification === "NOT_ELIGIBLE") {
            summary.details.push(`--> Not Eligible (Score: ${matchResult.overallScore}%)`);
            continue;
          }

          summary.eligibleJobsCount++;

          // Step 4: Prepare Tailored Application
          summary.details.push(`Step 4: Preparing Tailored CV & Application for "${job.title}"...`);
          const appId = await this.prepareApplication(job.id);
          summary.applicationsPreparedCount++;

          // Step 5: Check auto-submission policy
          const policy = await evaluateApplicationPolicy(appId);
          if (policy.canSubmit) {
            summary.details.push(`Step 5: Submitting Application ${appId}...`);
            const subRes = await this.executeApplicationSubmission(appId);
            if (subRes.success) {
              summary.applicationsSubmittedCount++;
              summary.details.push(`--> Submission Confirmed! ID: ${subRes.confirmationId || subRes.providerMessageId}`);
            } else if (subRes.status === "HUMAN_ACTION_REQUIRED") {
              summary.humanActionsCount++;
              summary.details.push(`--> Route halted: Human Action Required (${subRes.reason})`);
            }
          } else {
            summary.details.push(`--> Held in Approval Queue (${policy.reason || "Approval required"})`);
          }
        } catch (jobErr: any) {
          summary.errorsCount++;
          summary.details.push(`ERROR on job ${job.id}: ${jobErr.message}`);
          await prisma.agentError.create({
            data: {
              agentRunId: run.id,
              agentName: "AgentOrchestratorPipeline",
              jobId: job.id,
              errorType: "TRANSIENT",
              message: jobErr.message,
              stackTrace: jobErr.stack,
            },
          });
        }
      }

      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          itemsProcessed: summary.analyzedJobsCount,
          itemsSucceeded: summary.applicationsSubmittedCount,
          itemsFailed: summary.errorsCount,
          logs: summary.details.join("\n"),
        },
      });

      return summary;
    } catch (err: any) {
      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          logs: `${summary.details.join("\n")}\nFATAL: ${err.message}`,
        },
      });
      throw err;
    }
  }
}

export const orchestrator = new AgentOrchestrator();
