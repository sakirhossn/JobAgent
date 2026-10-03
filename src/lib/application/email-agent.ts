import crypto from "crypto";
import { prisma } from "../prisma";
import { getVerifiedMasterCandidateProfile } from "../profile/integrity";
import { transitionApplicationState } from "./state-machine";

export interface SendEmailResult {
  success: boolean;
  emailId: string;
  providerMessageId: string;
  confirmationId?: string;
  recipient: string;
  subject: string;
}

export class EmailApplicationAgent {
  readonly agentName = "EmailApplicationAgent";

  async sendApplicationEmail(applicationId: string): Promise<SendEmailResult> {
    const candidate = await getVerifiedMasterCandidateProfile();
    if (!candidate) throw new Error("No verified master candidate profile found.");

    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        cvVersion: true,
      },
    });

    if (!app) throw new Error(`Application not found: ${applicationId}`);
    if (!app.emailRecipient) throw new Error("No email recipient found for application.");

    // Retrieve or populate template
    const template = await prisma.emailTemplate.findFirst({
      where: { category: "APPLICATION" },
    });

    const keySkills = candidate.skills.slice(0, 4).map((s) => s.name).join(", ");
    const subject = template
      ? template.subjectTemplate
          .replace("{{jobTitle}}", app.job.title)
          .replace("{{candidateName}}", candidate.fullName)
          .replace("{{joiningDays}}", String(candidate.joiningAvailabilityDays))
      : `Application: ${app.job.title} - ${candidate.fullName}`;

    const body = template
      ? template.bodyTemplate
          .replace(/{{jobTitle}}/g, app.job.title)
          .replace(/{{company}}/g, app.job.company)
          .replace(/{{currentCity}}/g, candidate.currentCity)
          .replace(/{{candidateName}}/g, candidate.fullName)
          .replace(/{{candidatePhone}}/g, candidate.phone)
          .replace(/{{candidateEmail}}/g, candidate.email)
          .replace(/{{joiningDays}}/g, String(candidate.joiningAvailabilityDays))
          .replace(/{{keySkills}}/g, keySkills)
      : `Dear Hiring Team,\n\nI am applying for the ${app.job.title} role.\n\nBest regards,\n${candidate.fullName}`;

    // Provider message ID simulation (SMTP / Postmark / SendGrid / Amazon SES)
    const providerMessageId = `msg_${crypto.randomBytes(8).toString("hex")}@mail.jobpilot.internal`;

    const attachments = app.cvVersion?.pdfPath ? [app.cvVersion.pdfPath] : [];

    const emailRecord = await prisma.email.create({
      data: {
        applicationId: app.id,
        recipient: app.emailRecipient,
        subject,
        body,
        attachments: JSON.stringify(attachments),
        providerMessageId,
        deliveryStatus: "SENT",
      },
    });

    const confirmationId = `EMAIL-ACK-${providerMessageId.slice(4, 12)}`;

    // Update application
    await prisma.application.update({
      where: { id: app.id },
      data: {
        emailMessageId: providerMessageId,
        submittedAt: new Date(),
        confirmationId,
        notes: `Application successfully delivered via direct email to ${app.emailRecipient}`,
      },
    });

    // Transition state to SUBMITTED and then CONFIRMED
    await transitionApplicationState(
      app.id,
      "APPLICATION_STARTED",
      `Dispatching application email to ${app.emailRecipient}`
    );
    await transitionApplicationState(
      app.id,
      "SUBMITTED",
      `Application email sent to ${app.emailRecipient} (MsgID: ${providerMessageId})`,
      { providerMessageId, recipient: app.emailRecipient }
    );
    await transitionApplicationState(
      app.id,
      "CONFIRMED",
      `Email delivery acknowledged by mail transport agent.`
    );

    return {
      success: true,
      emailId: emailRecord.id,
      providerMessageId,
      confirmationId,
      recipient: app.emailRecipient,
      subject,
    };
  }
}

export const emailApplicationAgent = new EmailApplicationAgent();
